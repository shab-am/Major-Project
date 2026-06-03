import math
import os
import random
import sys
import threading
import time

import serial
import socketio
from dotenv import load_dotenv

BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(BACKEND_DIR, '.env'))

sys.path.append(os.path.join(BACKEND_DIR, 'config'))
from database import Database

SENSOR_PORT = os.getenv('SERIAL_PORT', '/dev/ttyACM0')
POTENTIOSTAT_PORT = os.getenv('POTENTIOSTAT_PORT', '/dev/ttyUSB0')
BAUD_RATE = int(os.getenv('BAUD_RATE', 115200))
SOCKET_SERVER_URL = os.getenv('SOCKET_SERVER_URL', 'http://localhost:5000')
SIMULATION_MODE = os.getenv('SIMULATION_MODE', 'true').lower() == 'true'
LOOP_DELAY_SECONDS = float(os.getenv('COLLECTOR_LOOP_DELAY_SECONDS', '1.0'))
SENSOR_READ_TIMEOUT_SECONDS = float(os.getenv('SENSOR_READ_TIMEOUT_SECONDS', '6.0'))
POTENTIOSTAT_STALE_SECONDS = float(os.getenv('POTENTIOSTAT_STALE_SECONDS', '10.0'))
SERIAL_DEBUG = os.getenv('SERIAL_DEBUG', '').lower() in ('1', 'true', 'yes')

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

VALID_RANGES = {
    'ambient_temperature': (-10.0, 60.0),
    'humidity': (0.0, 100.0),
    'soil_temperature': (0.0, 45.0),
    'light_intensity': (0.0, 2000.0),
    'ph': (0.0, 14.0),
    'dissolved_oxygen': (0.0, 20.0),
    'ec': (0.0, 5.0),
    'tds': (0.0, 2500.0),
    'electrochemical_signal': (0.25, 1.1),
}

MAX_STEP = {
    'ambient_temperature': 0.03,
    'soil_temperature': 0.02,
    'humidity': 0.25,
    'light_intensity': 8.0,
    'ph': 0.025,
    'dissolved_oxygen': 0.04,
    'ec': 0.01,
    'tds': 4.0,
    'electrochemical_signal': 0.015,
}

DECIMALS = {
    'ph': 3,
    'ec': 3,
    'electrochemical_signal': 4,
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
SENSOR_FIELD_ORDER = FIELD_ORDER[:-1]

previous_values = {
    key: round((low + high) / 2, DECIMALS.get(key, 2))
    for key, (low, high) in RANGES.items()
}

db = None
sio = socketio.Client(reconnection=True)

latest_bio = previous_values['electrochemical_signal']
latest_bio_seen_at = 0.0
bio_lock = threading.Lock()


def round_metric(key, value):
    return round(value, DECIMALS.get(key, 2))


def smooth_random(key):
    low, high = RANGES[key]
    previous = previous_values[key]
    drift = MAX_STEP.get(key, (high - low) * 0.03)
    next_value = max(low, min(high, previous + random.uniform(-drift, drift)))
    previous_values[key] = round_metric(key, next_value)
    return previous_values[key]


def generate_realistic_data():
    return tuple(smooth_random(key) for key in FIELD_ORDER)


def parse_numeric(raw):
    try:
        value = float(str(raw).strip())
    except (TypeError, ValueError):
        return None
    return value if math.isfinite(value) else None


def accept_or_fallback(key, raw):
    value = parse_numeric(raw)
    low, high = VALID_RANGES.get(key, RANGES[key])
    if value is not None and low <= value <= high:
        previous_values[key] = round_metric(key, value)
        return previous_values[key], False
    return smooth_random(key), True


def fallback_sensor_values(reason):
    values = tuple(smooth_random(key) for key in SENSOR_FIELD_ORDER)
    return values, list(SENSOR_FIELD_ORDER), reason


def parse_sensor_csv(line):
    """
    Parse final_sensor.ino CSV.
    Expected order: ambient_temperature, humidity, soil_temperature,
    light_intensity, ph, dissolved_oxygen, ec, tds.
    Electrochemical signal must come from spe_electrode.ino on POTENTIOSTAT_PORT.
    """
    parts = [part.strip() for part in line.strip().split(',')]
    if len(parts) != 8:
        return fallback_sensor_values(f'expected 8 CSV values from final_sensor.ino, got {len(parts)}')

    values = []
    fallback_fields = []
    for key, raw in zip(SENSOR_FIELD_ORDER, parts):
        value, used_fallback = accept_or_fallback(key, raw)
        values.append(value)
        if used_fallback:
            fallback_fields.append(key)

    return tuple(values), fallback_fields, None


def parse_bio_value(line):
    value, used_fallback = accept_or_fallback('electrochemical_signal', line)
    return None if used_fallback else value


def potentiostat_reader():
    global latest_bio, latest_bio_seen_at
    bio_ser = None
    while True:
        try:
            if bio_ser is None:
                bio_ser = serial.Serial(POTENTIOSTAT_PORT, BAUD_RATE, timeout=2)
                bio_ser.reset_input_buffer()
                print(f"Potentiostat connected on {POTENTIOSTAT_PORT}")

            decoded = bio_ser.readline().decode('utf-8', errors='ignore').strip()
            if not decoded:
                continue
            if SERIAL_DEBUG:
                print(f"[potentiostat raw] {decoded}")

            value = parse_bio_value(decoded)
            if value is not None:
                with bio_lock:
                    latest_bio = value
                    latest_bio_seen_at = time.time()
            elif SERIAL_DEBUG:
                print(f"Potentiostat value out of range or invalid: {decoded}")
        except Exception as exc:
            print(f"Potentiostat read error: {exc}; using fallback until it recovers")
            try:
                if bio_ser:
                    bio_ser.close()
            except Exception:
                pass
            bio_ser = None
            time.sleep(3)


def get_bio_value():
    with bio_lock:
        age = time.time() - latest_bio_seen_at if latest_bio_seen_at else None
        if age is not None and age <= POTENTIOSTAT_STALE_SECONDS:
            return latest_bio, False

    return smooth_random('electrochemical_signal'), True


def open_sensor_serial(existing):
    if existing is not None:
        return existing
    try:
        sensor_ser = serial.Serial(SENSOR_PORT, BAUD_RATE, timeout=SENSOR_READ_TIMEOUT_SECONDS)
        sensor_ser.reset_input_buffer()
        print(f"Sensor Arduino connected on {SENSOR_PORT}")
        return sensor_ser
    except Exception as exc:
        print(f"Sensor Arduino connection failed on {SENSOR_PORT}: {exc}; using sensor fallbacks")
        return None


def read_sensor_values(sensor_ser):
    if sensor_ser is None:
        return fallback_sensor_values('sensor port unavailable')

    raw_line = sensor_ser.readline()
    decoded = raw_line.decode('utf-8', errors='ignore').strip()
    if not decoded:
        return fallback_sensor_values('sensor port timeout/no line')

    if SERIAL_DEBUG:
        print(f"[sensor raw] {decoded}")
    return parse_sensor_csv(decoded)


def init_socket():
    try:
        sio.connect(SOCKET_SERVER_URL)
        print(f"WebSocket connected at {SOCKET_SERVER_URL}")
    except Exception as exc:
        print(f"WebSocket failed: {exc}")


def init_database():
    global db
    db = Database()
    if db.is_connected():
        print("Database connected")
    else:
        print("Database connection unavailable")


def emit_sensor_update(reading_id, values):
    payload = {'id': reading_id}
    payload.update(dict(zip(FIELD_ORDER, values)))
    if sio.connected:
        sio.emit('sensor_update', payload)


def collect():
    sensor_ser = None
    print("Collector running. Ctrl+C to stop.")

    while True:
        try:
            fallback_fields = []
            fallback_reason = None

            if SIMULATION_MODE:
                values = generate_realistic_data()
            else:
                sensor_ser = open_sensor_serial(sensor_ser)
                sensor_values, fallback_fields, fallback_reason = read_sensor_values(sensor_ser)
                bio_value, bio_fallback = get_bio_value()
                if bio_fallback:
                    fallback_fields.append('electrochemical_signal')
                values = sensor_values + (bio_value,)

            reading_id = db.insert_project_reading(values) if db else None
            emit_sensor_update(reading_id, values)

            fallback_note = ''
            if fallback_fields:
                fallback_note = f" | fallback: {', '.join(fallback_fields)}"
                if fallback_reason:
                    fallback_note += f" ({fallback_reason})"
            print(f"Reading #{reading_id}: {values}{fallback_note}")
            time.sleep(LOOP_DELAY_SECONDS)
        except KeyboardInterrupt:
            print("Stopped.")
            break
        except Exception as exc:
            print(f"Collector error: {exc}")
            try:
                if sensor_ser:
                    sensor_ser.close()
            except Exception:
                pass
            sensor_ser = None
            time.sleep(1.0)


if __name__ == '__main__':
    print("=== Hydroponics Data Collector ===")
    init_database()
    init_socket()

    if not SIMULATION_MODE:
        thread = threading.Thread(target=potentiostat_reader, daemon=True)
        thread.start()
        print("Potentiostat reader thread started")
        time.sleep(2)

    collect()
