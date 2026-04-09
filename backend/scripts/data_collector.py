import os
import random
import sys
import time

import serial
import socketio
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config'))
from database import Database

SERIAL_PORT = os.getenv('SERIAL_PORT', '/dev/ttyACM0')
BAUD_RATE = int(os.getenv('BAUD_RATE', 115200))
SOCKET_SERVER_URL = os.getenv('SOCKET_SERVER_URL', 'http://localhost:5000')
SIMULATION_MODE = os.getenv('SIMULATION_MODE', 'true').lower() == 'true'
LOOP_DELAY_SECONDS = float(os.getenv('COLLECTOR_LOOP_DELAY_SECONDS', '1.0'))

RANGES = {
    'ambient_temperature': (21.0, 27.5),
    'humidity': (55.0, 74.0),
    'soil_temperature': (20.0, 25.5),
    'light_intensity': (320.0, 780.0),
    'ph': (5.5, 6.5),
    'dissolved_oxygen': (5.2, 8.8),
    'ec': (1.0, 2.0),
    'tds': (550.0, 900.0),
    'electrochemical_signal': (0.25, 1.1),
}

FIELD_ORDER = (
    'ambient_temperature',
    'humidity',
    'soil_temperature',
    'light_intensity',
    'ph',
    'dissolved_oxygen',
    'ec',
    'tds',
    'electrochemical_signal',
)

previous_values = {key: round((low + high) / 2, 2) for key, (low, high) in RANGES.items()}
db = None
ser = None
sio = socketio.Client(reconnection=True)


def init_socket():
    try:
        sio.connect(SOCKET_SERVER_URL)
        print(f"Connected to WebSocket server at {SOCKET_SERVER_URL}")
    except Exception as exc:
        print(f"WebSocket connection failed: {exc}")


def init_database():
    global db
    db = Database()
    if db.is_connected():
        print("Database connected")
    else:
        print("Database connection unavailable")


def init_serial():
    global ser
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    ser.reset_input_buffer()
    print(f"Serial connected on {SERIAL_PORT} @ {BAUD_RATE}")


def smooth_random(metric_key):
    low, high = RANGES[metric_key]
    previous = previous_values[metric_key]
    drift = (high - low) * 0.05
    next_value = max(low, min(high, previous + random.uniform(-drift, drift)))
    previous_values[metric_key] = round(next_value, 2)
    return previous_values[metric_key]


def generate_realistic_data():
    return tuple(smooth_random(metric_key) for metric_key in FIELD_ORDER)


def parse_project_csv(line):
    parts = [part.strip() for part in line.strip().split(',')]
    if len(parts) != len(FIELD_ORDER):
        return None
    try:
        return tuple(float(part) if part else None for part in parts)
    except ValueError:
        return None


def emit_sensor_update(reading_id, values):
    payload = {'id': reading_id}
    payload.update(dict(zip(FIELD_ORDER, values)))
    if sio.connected:
        sio.emit('sensor_update', payload)


def collect():
    print("Collector running. Press Ctrl+C to stop.")
    while True:
        try:
            if SIMULATION_MODE:
                values = generate_realistic_data()
            else:
                if ser is None:
                    init_serial()
                if ser.in_waiting <= 0:
                    time.sleep(0.1)
                    continue
                raw_line = ser.readline()
                decoded_line = raw_line.decode('utf-8', errors='ignore').strip()
                if not decoded_line:
                    continue
                values = parse_project_csv(decoded_line)
                if not values:
                    print(f"Invalid serial row skipped: {decoded_line}")
                    continue

            reading_id = db.insert_project_reading(values) if db else None
            emit_sensor_update(reading_id, values)
            print(f"Stored reading #{reading_id}: {values}")
            time.sleep(LOOP_DELAY_SECONDS)
        except KeyboardInterrupt:
            print("Collector stopped")
            break
        except Exception as exc:
            print(f"Collector error: {exc}")
            time.sleep(1.0)


if __name__ == '__main__':
    print("=== Hydroponics Data Collector ===")
    init_database()
    if not SIMULATION_MODE:
        init_serial()
    init_socket()
    collect()
