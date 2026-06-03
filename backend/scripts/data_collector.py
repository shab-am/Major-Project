import os
import random
import sys
import time
import threading
import serial
import socketio
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config'))
from database import Database

# ── Config ─────────────────────────────────────────────
SENSOR_PORT        = os.getenv('SERIAL_PORT',       '/dev/ttyACM0')
POTENTIOSTAT_PORT  = os.getenv('POTENTIOSTAT_PORT',  '/dev/ttyACM1')
BAUD_RATE          = int(os.getenv('BAUD_RATE', 115200))
SOCKET_SERVER_URL  = os.getenv('SOCKET_SERVER_URL',  'http://localhost:5000')
SIMULATION_MODE    = os.getenv('SIMULATION_MODE',    'true').lower() == 'true'
LOOP_DELAY_SECONDS = float(os.getenv('COLLECTOR_LOOP_DELAY_SECONDS', '1.0'))

RANGES = {
    'ambient_temperature':    (21.0, 27.5),
    'humidity':               (55.0, 74.0),
    'soil_temperature':       (20.0, 25.5),
    'light_intensity':        (320.0, 780.0),
    'ph':                     (5.5,  6.5),
    'dissolved_oxygen':       (5.2,  8.8),
    'ec':                     (1.0,  2.0),
    'tds':                    (550.0, 900.0),
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

previous_values = {
    k: round((lo + hi) / 2, 2) for k, (lo, hi) in RANGES.items()
}

db  = None
sio = socketio.Client(reconnection=True)

# ── Latest bio signal (updated by background thread) ──
latest_bio   = previous_values['electrochemical_signal']
bio_lock     = threading.Lock()

# ── Smooth random (existing logic, unchanged) ─────────
def smooth_random(key):
    lo, hi = RANGES[key]
    prev   = previous_values[key]
    drift  = MAX_STEP.get(key, (hi - lo) * 0.03)
    nxt    = max(lo, min(hi, prev + random.uniform(-drift, drift)))
    previous_values[key] = round(nxt, 2)
    return previous_values[key]

def generate_realistic_data():
    return tuple(smooth_random(k) for k in FIELD_ORDER)

def parse_sensor_csv(line):
    """Parse 8-value CSV from sensor Arduino."""
    parts = [p.strip() for p in line.strip().split(',')]
    if len(parts) != 8:
        return None
    try:
        return tuple(float(p) for p in parts)
    except ValueError:
        return None

def parse_bio_value(line):
    """Parse single float from potentiostat Arduino."""
    try:
        val = float(line.strip())
        lo, hi = RANGES['electrochemical_signal']
        if lo <= val <= hi:
            return val
        return None
    except ValueError:
        return None

# ── Background thread: reads potentiostat Arduino ─────
def potentiostat_reader():
    global latest_bio
    bio_ser = None
    while True:
        try:
            if bio_ser is None:
                bio_ser = serial.Serial(POTENTIOSTAT_PORT, BAUD_RATE, timeout=2)
                bio_ser.reset_input_buffer()
                print(f"Potentiostat connected on {POTENTIOSTAT_PORT}")
            line = bio_ser.readline().decode('utf-8', errors='ignore').strip()
            if not line:
                continue
            val = parse_bio_value(line)
            if val is not None:
                with bio_lock:
                    latest_bio = val
        except Exception as e:
            print(f"Potentiostat read error: {e} — using last known value")
            bio_ser = None
            time.sleep(3)

def init_socket():
    try:
        sio.connect(SOCKET_SERVER_URL)
        print(f"WebSocket connected at {SOCKET_SERVER_URL}")
    except Exception as e:
        print(f"WebSocket failed: {e}")

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

# ── Main collect loop ──────────────────────────────────
def collect():
    sensor_ser = None
    print("Collector running. Ctrl+C to stop.")

    while True:
        try:
            if SIMULATION_MODE:
                values = generate_realistic_data()

            else:
                # ── Read 8 sensor values from Arduino 1 ──────
                if sensor_ser is None:
                    sensor_ser = serial.Serial(
                        SENSOR_PORT, BAUD_RATE, timeout=3
                    )
                    sensor_ser.reset_input_buffer()
                    print(f"Sensor Arduino on {SENSOR_PORT}")

                if sensor_ser.in_waiting <= 0:
                    time.sleep(0.1)
                    continue

                raw_line = sensor_ser.readline()
                decoded  = raw_line.decode('utf-8', errors='ignore').strip()
                if not decoded:
                    continue

                sensor_vals = parse_sensor_csv(decoded)
                if sensor_vals is None:
                    print(f"Skipped invalid row: {decoded}")
                    continue

                # ── Get latest bio from potentiostat thread ───
                with bio_lock:
                    bio_val = latest_bio

                # ── Merge into 9-value tuple ──────────────────
                values = sensor_vals + (bio_val,)

            # ── Store and emit ────────────────────────────
            reading_id = db.insert_project_reading(values) if db else None
            emit_sensor_update(reading_id, values)
            print(f"Reading #{reading_id}: {values}")
            time.sleep(LOOP_DELAY_SECONDS)

        except KeyboardInterrupt:
            print("Stopped.")
            break
        except Exception as e:
            print(f"Collector error: {e}")
            sensor_ser = None
            time.sleep(1.0)


if __name__ == '__main__':
    print("=== Hydroponics Data Collector ===")
    init_database()
    init_socket()

    # Start potentiostat reader in background (always, even in sim mode)
    if not SIMULATION_MODE:
        t = threading.Thread(target=potentiostat_reader, daemon=True)
        t.start()
        print("Potentiostat reader thread started")
        time.sleep(2)  # give it time to connect

    collect()
