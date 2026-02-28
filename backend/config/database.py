"""
MariaDB Database Configuration
Handles database connections and operations for plant readings
"""

import mariadb
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Database:
    def __init__(self):
        """Initialize database connection"""
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
            # Don't exit - allow app to run without database for development
            self.conn = None
            self.cursor = None
    
    def is_connected(self):
        """Check if database is connected"""
        return self.conn is not None
    
    def insert_reading(self, data):
        """Insert a new plant reading"""
        if not self.is_connected():
            return None
            
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
        if not self.is_connected():
            return []
            
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
        if not self.is_connected():
            return []
            
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

