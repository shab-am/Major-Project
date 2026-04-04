"""
MariaDB Database Configuration
Handles database connections and operations for plant readings
"""

import mariadb
import os
from decimal import Decimal
from dotenv import load_dotenv

load_dotenv()


def _serialize_value(v):
    if v is None:
        return None
    if isinstance(v, Decimal):
        return float(v)
    if hasattr(v, "isoformat"):
        return v.isoformat(sep=" ")
    return v


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
                INSERT INTO project_readings (
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
                    SELECT * FROM project_readings 
                    WHERE plant_id = ? 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                """
                self.cursor.execute(query, (plant_id, limit))
            else:
                query = """
                    SELECT * FROM project_readings 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                """
                self.cursor.execute(query, (limit,))
            
            columns = [desc[0] for desc in self.cursor.description]
            results = []
            for row in self.cursor.fetchall():
                raw = dict(zip(columns, row))
                results.append({k: _serialize_value(v) for k, v in raw.items()})
            return results
        except mariadb.Error as e:
            print(f"❌ Error fetching readings: {e}")
            return []

    def insert_project_reading(self, values):
        """
        Insert one row into project_readings (9 numeric fields from Arduino CSV).
        Order: ambient_temperature, humidity, soil_temperature, light_intensity,
        ph_value, dissolved_oxygen, ec_value, tds_value, electrochemical_signal
        """
        if not self.is_connected():
            return None
        try:
            sql = """
                INSERT INTO project_readings (
                    ambient_temperature, humidity, soil_temperature, light_intensity,
                    ph_value, dissolved_oxygen, ec_value, tds_value, electrochemical_signal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            self.cursor.execute(sql, values)
            self.conn.commit()
            return self.cursor.lastrowid
        except mariadb.Error as e:
            print(f"❌ Error inserting project_reading: {e}")
            return None

    def get_recent_project_readings(self, limit=100):
        """Recent rows from project_readings (expects an id column for ordering)."""
        if not self.is_connected():
            return []
        try:
            self.cursor.execute(
                """
                SELECT * FROM project_readings
                ORDER BY id DESC
                LIMIT ?
                """,
                (limit,),
            )
            columns = [desc[0] for desc in self.cursor.description]
            results = []
            for row in self.cursor.fetchall():
                raw = dict(zip(columns, row))
                results.append({k: _serialize_value(v) for k, v in raw.items()})
            return results
        except mariadb.Error as e:
            print(f"❌ Error fetching project_readings: {e}")
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
                    FROM project_readings
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
                    FROM project_readings
                    GROUP BY plant_name
                """
                self.cursor.execute(query)
            
            columns = [desc[0] for desc in self.cursor.description]
            results = []
            for row in self.cursor.fetchall():
                raw = dict(zip(columns, row))
                results.append({k: _serialize_value(v) for k, v in raw.items()})
            return results
        except mariadb.Error as e:
            print(f"❌ Error fetching statistics: {e}")
            return []
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

