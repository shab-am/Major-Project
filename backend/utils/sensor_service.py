#!/usr/bin/env python3

import serial
import time
import mariadb
import math

print("Script started at", time.strftime("%Y-%m-%d %H:%M:%S"))

# === SERIAL SETUP ===
try:
    ser = serial.Serial('/dev/ttyACM0', 115200, timeout=5)
    time.sleep(3)
    ser.reset_input_buffer()
    print("Serial connected.")
except Exception as e:
    print("Serial error:", e)
    exit(1)

# === DATABASE SETUP ===
conn = mariadb.connect(
    host="localhost",
    user="hydro",
    password="hydro",
    database="hydroponics_db"
)
cursor = conn.cursor()

def to_null(val):
    try:
        f = float(val)
        if math.isnan(f):
            return None
        return f
    except:
        return None

def insert_reading(data):
    sql = """
    INSERT INTO project_readings (
        ambient_temperature,
        humidity,
        soil_temperature,
        light_intensity,
        ph_value,
        dissolved_oxygen,
        ec_value,
        tds_value,
        electrochemical_signal
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    cursor.execute(sql, data)
    conn.commit()

# === MAIN LOOP ===
try:
    while True:
        line = ser.readline().decode('utf-8', errors='ignore').strip()

        if line:
            print("Received:", line)

            parts = line.split(",")

            if len(parts) == 9:
                data = tuple(to_null(p) for p in parts)

                insert_reading(data)
                print("Inserted into DB:", data)

            else:
                print("Wrong format, skipping")

except KeyboardInterrupt:
    print("Stopped")

finally:
    cursor.close()
    conn.close()
    ser.close()