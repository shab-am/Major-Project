"""
Hardware Data Collector Script
Collects sensor data from Arduino/Raspberry Pi via Serial and stores in MariaDB.

Supports:
- Nine-value CSV -> project_readings (same format as legacy utils/sensor_service.py)
- JSON or short CSV -> plant_readings via Database.insert_reading
"""

import time
import serial
import sys
import os
import math
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config'))

try:
    from database import Database
    from plant_health_model import predict
except ImportError as e:
    print(f"⚠️ Warning: {e}")
    print("Some features may not be available")

# Serial port configuration (adjust for your system)
# Windows: 'COM3', 'COM4', etc.
# Linux: '/dev/ttyUSB0', '/dev/ttyACM0', etc.
# macOS: '/dev/cu.usbmodem*', '/dev/tty.usbmodem*'
SERIAL_PORT = os.getenv('SERIAL_PORT', 'COM3')  # Default for Windows
BAUD_RATE = int(os.getenv('BAUD_RATE', 9600))

db = None
ser = None

def init_database():
    """Initialize database connection"""
    global db
    try:
        db = Database()
        if db.is_connected():
            print("✅ Database connected")
            return True
        else:
            print("⚠️ Database not available")
            return False
    except Exception as e:
        print(f"⚠️ Database initialization failed: {e}")
        return False

def init_serial():
    """Initialize serial port connection"""
    global ser
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print(f"✅ Serial port {SERIAL_PORT} opened at {BAUD_RATE} baud")
        time.sleep(2)  # Wait for Arduino to reset
        return True
    except serial.SerialException as e:
        print(f"❌ Error opening serial port: {e}")
        print(f"   Make sure the device is connected to {SERIAL_PORT}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def parse_sensor_data(line):
    """
    Parse sensor data from serial line
    Supports JSON and CSV formats
    """
    try:
        # Try JSON format first
        import json
        data = json.loads(line)
        return data
    except:
        try:
            # Try CSV format: pH,temp,humidity,tds,dissolvedOxy
            values = line.split(',')
            if len(values) >= 3:
                return {
                    'ph': float(values[0].strip()) if values[0].strip() else None,
                    'temperature': float(values[1].strip()) if values[1].strip() else None,
                    'humidity': float(values[2].strip()) if values[2].strip() else None,
                    'tds': float(values[3].strip()) if len(values) > 3 and values[3].strip() else None,
                    'dissolvedOxy': float(values[4].strip()) if len(values) > 4 and values[4].strip() else None,
                }
        except:
            pass
    
    return None


def parse_project_nine_csv(line):
    """
    Arduino CSV with exactly 9 fields for project_readings:
    ambient_temperature, humidity, soil_temperature, light_intensity,
    ph_value, dissolved_oxygen, ec_value, tds_value, electrochemical_signal
    """
    parts = line.strip().split(',')
    if len(parts) != 9:
        return None

    def to_null(val):
        try:
            f = float(val.strip())
            if math.isnan(f):
                return None
            return f
        except (ValueError, TypeError):
            return None

    return tuple(to_null(p) for p in parts)


def get_ml_prediction(data):
    """Get ML prediction for plant health"""
    try:
        import pandas as pd
        import os
        
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        model_path = os.path.join(models_dir, 'plant_health_model.pt')
        scaler_path = os.path.join(models_dir, 'scaler.pkl')
        encoder_path = os.path.join(models_dir, 'label_encoder.pkl')
        
        if not os.path.exists(model_path):
            return None
        
        # Convert to DataFrame
        df = pd.DataFrame([data])
        result = predict(model_path, scaler_path, encoder_path, df)
        
        return {
            'predicted_health_status': result['predictions'][0] if result['predictions'] else None,
            'prediction_confidence': float(result['probabilities'][0].max()) if result['probabilities'] else None
        }
    except Exception as e:
        print(f"⚠️ ML prediction failed: {e}")
        return None

def collect_and_store():
    """Main loop: collect sensor data and store in database"""
    global db, ser
    
    if not ser:
        print("❌ Serial port not initialized")
        return
    
    print("🔄 Starting data collection...")
    print("   Press Ctrl+C to stop")
    
    try:
        while True:
            try:
                if ser.in_waiting > 0:
                    # Read line from serial
                    line = ser.readline().decode('utf-8').strip()
                    
                    if not line:
                        continue

                    project_tuple = parse_project_nine_csv(line)
                    if project_tuple is not None:
                        if db and db.is_connected():
                            reading_id = db.insert_project_reading(project_tuple)
                            if reading_id:
                                print(f"✅ Stored project_reading #{reading_id}: {project_tuple}")
                            else:
                                print("⚠️ Failed to store project_reading (check project_readings table)")
                        else:
                            print(f"📊 Project-format data (no DB): {project_tuple}")
                        time.sleep(0.1)
                        continue
                    
                    # Parse sensor data for plant_readings
                    sensor_data = parse_sensor_data(line)
                    
                    if not sensor_data:
                        print(f"⚠️ Could not parse: {line}")
                        continue
                    
                    # Get ML prediction if available
                    prediction = get_ml_prediction(sensor_data)
                    
                    # Prepare database entry
                    db_entry = {
                        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        'plant_id': sensor_data.get('plant_id', 1),
                        'plant_name': sensor_data.get('plant_name', 'Unknown'),
                        'soil_moisture': sensor_data.get('soil_moisture'),
                        'ambient_temperature': sensor_data.get('temperature') or sensor_data.get('ambient_temperature'),
                        'soil_temperature': sensor_data.get('soil_temperature'),
                        'humidity': sensor_data.get('humidity'),
                        'light_intensity': sensor_data.get('light_intensity') or sensor_data.get('light'),
                        'soil_ph': sensor_data.get('ph') or sensor_data.get('soil_ph'),
                        'nitrogen_level': sensor_data.get('nitrogen_level'),
                        'phosphorus_level': sensor_data.get('phosphorus_level'),
                        'potassium_level': sensor_data.get('potassium_level'),
                        'chlorophyll_content': sensor_data.get('chlorophyll_content'),
                        'electrochemical_signal': sensor_data.get('electrochemical_signal'),
                        'predicted_health_status': prediction['predicted_health_status'] if prediction else None,
                        'prediction_confidence': prediction['prediction_confidence'] if prediction else None
                    }
                    
                    # Store in database if available
                    if db and db.is_connected():
                        reading_id = db.insert_reading(db_entry)
                        if reading_id:
                            print(f"✅ Stored reading #{reading_id} for {db_entry['plant_name']}")
                        else:
                            print(f"⚠️ Failed to store reading")
                    else:
                        print(f"📊 Data received: {sensor_data}")
                    
                    time.sleep(0.1)  # Small delay to prevent CPU overload
                    
            except serial.SerialException as e:
                print(f"❌ Serial error: {e}")
                time.sleep(5)
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(1)
                
    except KeyboardInterrupt:
        print("\n🛑 Stopping data collection...")
    finally:
        if ser:
            ser.close()
        if db:
            db.close()

def main():
    """Main entry point"""
    print("=" * 50)
    print("Hardware Data Collector")
    print("=" * 50)
    
    # Initialize database
    db_available = init_database()
    
    # Initialize serial
    if not init_serial():
        print("\n❌ Failed to initialize serial port")
        print("   Please check:")
        print(f"   1. Device is connected to {SERIAL_PORT}")
        print("   2. Correct port name (COM3, /dev/ttyUSB0, etc.)")
        print("   3. No other program is using the port")
        return
    
    # Start collection
    collect_and_store()

if __name__ == '__main__':
    main()

