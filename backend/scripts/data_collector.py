# import time
# import serial
# import socketio
# import os
# import sys
# from dotenv import load_dotenv

# load_dotenv()

# # DB import
# sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config'))
# from database import Database

# SERIAL_PORT = os.getenv('SERIAL_PORT', '/dev/ttyACM0')
# BAUD_RATE = int(os.getenv('BAUD_RATE', 115200))

# db = None
# ser = None

# # 🔥 WebSocket client
# sio = socketio.Client()

# def init_socket():
#     try:
#         sio.connect("http://localhost:5000")
#         print("✅ Connected to WebSocket server")
#     except Exception as e:
#         print("⚠️ WebSocket connection failed:", e)

# def init_database():
#     global db
#     db = Database()
#     if db.is_connected():
#         print("✅ Database connected")
#     else:
#         print("❌ DB connection failed")

# def init_serial():
#     global ser
#     ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
#     ser.reset_input_buffer()
#     print(f"✅ Serial {SERIAL_PORT} @ {BAUD_RATE}")

# def parse_project_csv(line):
#     parts = line.strip().split(',')

#     # Ignore incomplete lines
#     if len(parts) != 9:
#         return None

#     try:
#         return tuple(float(p) if p else 0.0 for p in parts)
#     except:
#         return None

# def collect():
#     print("🔄 Collecting data... Ctrl+C to stop")

#     while True:
#         try:
#             if ser.in_waiting > 0:
#                 raw = ser.readline()
#                 line = raw.decode('utf-8', errors='ignore').strip()

#                 if not line:
#                     continue

#                 data = parse_project_csv(line)

#                 if not data:
#                     print("⚠️ Invalid:", line)
#                     continue

#                 # ✅ Store in DB
#                 reading_id = db.insert_project_reading(data)

#                 print(f"✅ Stored #{reading_id}: {data}")

#                 # 🔥 SEND TO FRONTEND (REAL-TIME)
#                 sio.emit('sensor_update', {
#                     'id': reading_id,
#                     'ambient_temperature': data[0],
#                     'humidity': data[1],
#                     'soil_temperature': data[2],
#                     'light_intensity': data[3],
#                     'ph': data[4],
#                     'dissolved_oxygen': data[5],
#                     'ec': data[6],
#                     'tds': data[7],
#                     'electrochemical_signal': data[8]
#                 })

#                 time.sleep(0.1)

#         except Exception as e:
#             print("❌ Error:", e)
#             time.sleep(1)

# if __name__ == "__main__":
#     print("=== DATA COLLECTOR ===")
#     init_database()
#     init_serial()
#     init_socket()
#     collect()



import time
import serial
import socketio
import os
import sys
import random
from dotenv import load_dotenv

load_dotenv()

# ================= CONFIG =================
SERIAL_PORT = os.getenv('SERIAL_PORT', '/dev/ttyACM0')
BAUD_RATE = int(os.getenv('BAUD_RATE', 115200))

SIMULATION_MODE = True  # 🔥 Toggle this

# Ideal ranges (you can tweak)
RANGES = {
    "ambient_temperature": (22, 32),
    "humidity": (50, 80),
    "soil_temperature": (20, 30),
    "light_intensity": (300, 800),
    "ph": (5.5, 6.8),
    "dissolved_oxygen": (5, 9),
    "ec": (1.0, 2.5),
    "tds": (500, 1200),
    "electrochemical_signal": (0.2, 1.2)
}

# ================= DB =================
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config'))
from database import Database

db = None
ser = None

# ================= SOCKET =================
sio = socketio.Client()

def init_socket():
    try:
        sio.connect("http://localhost:5000")
        print("✅ Connected to WebSocket server")
    except Exception as e:
        print("⚠️ WebSocket connection failed:", e)

def init_database():
    global db
    db = Database()
    if db.is_connected():
        print("✅ Database connected")
    else:
        print("❌ DB connection failed")

def init_serial():
    global ser
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    ser.reset_input_buffer()
    print(f"✅ Serial {SERIAL_PORT} @ {BAUD_RATE}")

# ================= REALISTIC GENERATOR =================

previous_values = {
    key: sum(val)/2 for key, val in RANGES.items()
}

def smooth_random(key):
    """Generate realistic smooth value"""
    low, high = RANGES[key]
    prev = previous_values[key]

    # small drift instead of full random jump
    drift = (high - low) * 0.02  # 2% drift
    new_val = prev + random.uniform(-drift, drift)

    # clamp to range
    new_val = max(low, min(high, new_val))

    previous_values[key] = new_val
    return round(new_val, 2)

def generate_realistic_data():
    return (
        smooth_random("ambient_temperature"),
        smooth_random("humidity"),
        smooth_random("soil_temperature"),
        smooth_random("light_intensity"),
        smooth_random("ph"),
        smooth_random("dissolved_oxygen"),
        smooth_random("ec"),
        smooth_random("tds"),
        smooth_random("electrochemical_signal")
    )

# ================= SERIAL PARSER =================

def parse_project_csv(line):
    parts = line.strip().split(',')
    if len(parts) != 9:
        return None
    try:
        return tuple(float(p) if p else None for p in parts)
    except:
        return None

# ================= MAIN LOOP =================

def collect():
    print("🔄 Collecting data... Ctrl+C to stop")

    while True:
        try:
            # 🔥 SIMULATION MODE
            if SIMULATION_MODE:
                data = generate_realistic_data()
                time.sleep(1)

            # 🔥 REAL SENSOR MODE
            else:
                if ser.in_waiting == 0:
                    continue

                raw = ser.readline()
                line = raw.decode('utf-8', errors='ignore').strip()

                if not line:
                    continue

                data = parse_project_csv(line)

                if not data:
                    print("⚠️ Invalid:", line)
                    continue

            # ================= STORE =================
            reading_id = db.insert_project_reading(data)

            print(f"✅ Stored #{reading_id}: {data}")

            # ================= EMIT =================
            sio.emit('sensor_update', {
                'id': reading_id,
                'ambient_temperature': data[0],
                'humidity': data[1],
                'soil_temperature': data[2],
                'light_intensity': data[3],
                'ph': data[4],
                'dissolved_oxygen': data[5],
                'ec': data[6],
                'tds': data[7],
                'electrochemical_signal': data[8]
            })

        except Exception as e:
            print("❌ Error:", e)
            time.sleep(1)

# ================= ENTRY =================

if __name__ == "__main__":
    print("=== DATA COLLECTOR ===")

    init_database()

    if not SIMULATION_MODE:
        init_serial()

    init_socket()
    collect()