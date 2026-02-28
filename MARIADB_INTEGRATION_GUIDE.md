# MariaDB Integration Guide for Real-Time Data Collection

This guide will help you integrate MariaDB database for real-time data collection in your hydroponics monitoring system.

## Prerequisites

1. **Install MariaDB Server**
   - Windows: Download from [MariaDB Downloads](https://mariadb.org/download/)
   - Or use XAMPP/WAMP which includes MariaDB
   - Linux: `sudo apt-get install mariadb-server` (Ubuntu/Debian)

2. **Python Dependencies**
   ```bash
   pip install mariadb python-dotenv
   ```

## Step 1: Database Setup

### 1.1 Create Database and User

Connect to MariaDB:
```bash
mysql -u root -p
```

Create database and user:
```sql
-- Create database
CREATE DATABASE hydroponics_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'hydro_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON hydroponics_db.* TO 'hydro_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE hydroponics_db;
```

### 1.2 Create Tables

```sql
-- Main plant readings table
CREATE TABLE plant_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    plant_id INT NOT NULL,
    plant_name VARCHAR(100),
    
    -- Sensor readings
    soil_moisture DECIMAL(5,2),
    ambient_temperature DECIMAL(5,2),
    soil_temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    light_intensity DECIMAL(6,2),
    soil_ph DECIMAL(4,2),
    
    -- Nutrient levels
    nitrogen_level DECIMAL(5,2),
    phosphorus_level DECIMAL(5,2),
    potassium_level DECIMAL(5,2),
    
    -- Plant health metrics
    chlorophyll_content DECIMAL(5,2),
    electrochemical_signal DECIMAL(6,4),
    
    -- ML predictions
    predicted_health_status VARCHAR(50),
    prediction_confidence DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_timestamp (timestamp),
    INDEX idx_plant_id (plant_id),
    INDEX idx_plant_name (plant_name)
);

-- Plant information table
CREATE TABLE plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_name VARCHAR(100) UNIQUE NOT NULL,
    plant_type VARCHAR(50),
    optimal_ph_min DECIMAL(4,2),
    optimal_ph_max DECIMAL(4,2),
    optimal_temp_min DECIMAL(5,2),
    optimal_temp_max DECIMAL(5,2),
    optimal_humidity_min DECIMAL(5,2),
    optimal_humidity_max DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts and recommendations table
CREATE TABLE plant_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    plant_name VARCHAR(100),
    alert_type VARCHAR(50), -- 'High Priority', 'Medium Priority'
    parameter VARCHAR(50), -- 'pH', 'Temperature', etc.
    issue_description TEXT,
    recommendation TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    INDEX idx_plant_id (plant_id),
    INDEX idx_status (status)
);
```

## Step 2: Backend Configuration

### 2.1 Create Database Configuration File

Create `backend/config/database.py`:

```python
import mariadb
import sys
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        try:
            self.conn = mariadb.connect(
                user=os.getenv('DB_USER', 'hydro_user'),
                password=os.getenv('DB_PASSWORD', 'your_password'),
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', 3306)),
                database=os.getenv('DB_NAME', 'hydroponics_db')
            )
            self.cursor = self.conn.cursor()
            print("✅ Connected to MariaDB")
        except mariadb.Error as e:
            print(f"❌ Error connecting to MariaDB: {e}")
            sys.exit(1)
    
    def insert_reading(self, data):
        """Insert a new plant reading"""
        try:
            query = """
                INSERT INTO plant_readings (
                    timestamp, plant_id, plant_name,
                    soil_moisture, ambient_temperature, soil_temperature,
                    humidity, light_intensity, soil_ph,
                    nitrogen_level, phosphorus_level, potassium_level,
                    chlorophyll_content, electrochemical_signal,
                    predicted_health_status, prediction_confidence
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            
            values = (
                data.get('timestamp'),
                data.get('plant_id'),
                data.get('plant_name'),
                data.get('soil_moisture'),
                data.get('ambient_temperature'),
                data.get('soil_temperature'),
                data.get('humidity'),
                data.get('light_intensity'),
                data.get('soil_ph'),
                data.get('nitrogen_level'),
                data.get('phosphorus_level'),
                data.get('potassium_level'),
                data.get('chlorophyll_content'),
                data.get('electrochemical_signal'),
                data.get('predicted_health_status'),
                data.get('prediction_confidence')
            )
            
            self.cursor.execute(query, values)
            self.conn.commit()
            return self.cursor.lastrowid
        except mariadb.Error as e:
            print(f"❌ Error inserting reading: {e}")
            return None
    
    def get_recent_readings(self, limit=100, plant_id=None):
        """Get recent plant readings"""
        try:
            if plant_id:
                query = """
                    SELECT * FROM plant_readings 
                    WHERE plant_id = ? 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                """
                self.cursor.execute(query, (plant_id, limit))
            else:
                query = """
                    SELECT * FROM plant_readings 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                """
                self.cursor.execute(query, (limit,))
            
            columns = [desc[0] for desc in self.cursor.description]
            results = []
            for row in self.cursor.fetchall():
                results.append(dict(zip(columns, row)))
            return results
        except mariadb.Error as e:
            print(f"❌ Error fetching readings: {e}")
            return []
    
    def get_plant_statistics(self, plant_id=None):
        """Get statistics for plants"""
        try:
            if plant_id:
                query = """
                    SELECT 
                        plant_name,
                        COUNT(*) as total_readings,
                        AVG(soil_ph) as avg_ph,
                        AVG(ambient_temperature) as avg_temp,
                        AVG(humidity) as avg_humidity,
                        MAX(timestamp) as last_reading
                    FROM plant_readings
                    WHERE plant_id = ?
                    GROUP BY plant_name
                """
                self.cursor.execute(query, (plant_id,))
            else:
                query = """
                    SELECT 
                        plant_name,
                        COUNT(*) as total_readings,
                        AVG(soil_ph) as avg_ph,
                        AVG(ambient_temperature) as avg_temp,
                        AVG(humidity) as avg_humidity,
                        MAX(timestamp) as last_reading
                    FROM plant_readings
                    GROUP BY plant_name
                """
                self.cursor.execute(query)
            
            columns = [desc[0] for desc in self.cursor.description]
            results = []
            for row in self.cursor.fetchall():
                results.append(dict(zip(columns, row)))
            return results
        except mariadb.Error as e:
            print(f"❌ Error fetching statistics: {e}")
            return []
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
```

### 2.2 Create Environment File

Create `backend/.env`:

```env
DB_USER=hydro_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hydroponics_db
```

### 2.3 Update Flask App

Update `backend/app.py` to include database endpoints:

```python
from config.database import Database

db = Database()

@app.route('/api/readings', methods=['POST'])
def add_reading():
    """Add a new plant reading"""
    try:
        data = request.json
        reading_id = db.insert_reading(data)
        if reading_id:
            return jsonify({
                'success': True,
                'message': 'Reading added successfully',
                'id': reading_id
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to add reading'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/readings', methods=['GET'])
def get_readings():
    """Get recent plant readings"""
    try:
        limit = request.args.get('limit', 100, type=int)
        plant_id = request.args.get('plant_id', type=int)
        readings = db.get_recent_readings(limit, plant_id)
        return jsonify({
            'success': True,
            'data': readings,
            'count': len(readings)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get plant statistics"""
    try:
        plant_id = request.args.get('plant_id', type=int)
        stats = db.get_plant_statistics(plant_id)
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
```

## Step 3: Real-Time Data Collection

### 3.1 Hardware Integration Script

Create `backend/scripts/data_collector.py`:

```python
import time
import serial
from config.database import Database
from services.pythonService import predictPlantHealth

# Configure serial port (adjust for your Arduino/Raspberry Pi)
ser = serial.Serial('COM3', 9600)  # Windows
# ser = serial.Serial('/dev/ttyUSB0', 9600)  # Linux

db = Database()

def collect_and_store():
    """Collect sensor data and store in database"""
    while True:
        try:
            # Read from serial port
            line = ser.readline().decode('utf-8').strip()
            data = parse_sensor_data(line)  # Implement your parsing logic
            
            # Get ML prediction
            prediction = predictPlantHealth(data)
            
            # Prepare database entry
            db_entry = {
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'plant_id': data['plant_id'],
                'plant_name': data['plant_name'],
                'soil_moisture': data['soil_moisture'],
                'ambient_temperature': data['temperature'],
                'soil_temperature': data['soil_temp'],
                'humidity': data['humidity'],
                'light_intensity': data['light'],
                'soil_ph': data['ph'],
                'nitrogen_level': data['nitrogen'],
                'phosphorus_level': data['phosphorus'],
                'potassium_level': data['potassium'],
                'chlorophyll_content': data['chlorophyll'],
                'electrochemical_signal': data['electrochemical'],
                'predicted_health_status': prediction['status'],
                'prediction_confidence': prediction['confidence']
            }
            
            # Store in database
            db.insert_reading(db_entry)
            print(f"✅ Stored reading for {data['plant_name']}")
            
            time.sleep(60)  # Collect every minute
            
        except Exception as e:
            print(f"❌ Error: {e}")
            time.sleep(5)

if __name__ == '__main__':
    collect_and_store()
```

## Step 4: Frontend Integration

Update your React frontend to fetch from database:

```javascript
// In your service file
export const fetchReadings = async (limit = 100) => {
  const response = await fetch(`http://localhost:5000/api/readings?limit=${limit}`);
  return response.json();
};

export const addReading = async (data) => {
  const response = await fetch('http://localhost:5000/api/readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

## Step 5: Testing

1. **Test Database Connection:**
```python
python backend/test_db.py
```

2. **Test Insert:**
```python
from config.database import Database

db = Database()
test_data = {
    'timestamp': '2024-01-01 12:00:00',
    'plant_id': 1,
    'plant_name': 'Bok Choy',
    'soil_moisture': 30.5,
    'ambient_temperature': 22.0,
    # ... other fields
}
db.insert_reading(test_data)
```

## Troubleshooting

1. **Connection Refused:**
   - Check if MariaDB is running: `sudo systemctl status mariadb`
   - Verify credentials in `.env`

2. **Permission Denied:**
   - Ensure user has proper privileges
   - Check firewall settings

3. **Import Errors:**
   - Install mariadb connector: `pip install mariadb`
   - Check Python version compatibility

## Next Steps

1. Set up automated data collection from hardware
2. Implement real-time updates using WebSockets
3. Add data backup and recovery procedures
4. Set up monitoring and alerts for database health

