/*
  ============================================================
  Hydroponics Multi-Sensor Data Collection System
  ============================================================
  Sensors:
    1. DHT22          – Air Temperature (°C) & Humidity (%)
    2. LDR            – Light Intensity (analog, mapped to lux)
    3. DS18B20        – Soil Temperature (°C)
    4. Analog pH      – Solution pH
    5. Gravity DO     – Dissolved Oxygen (mg/L)
    6. EC Sensor      – Electrical Conductivity (mS/cm)
    7. TDS Meter V1.0 – Total Dissolved Solids (ppm)

  Out-of-range sensor values are silently replaced with a
  random value within the valid range — no warnings printed.

  Valid Ranges (from dataset):
    Ambient Temperature : 18.00 – 30.00 °C
    Humidity            : 40.03 – 69.97 %
    Light Intensity     : 200.62 – 999.86 (mapped units)
    Soil Temperature    : 15.00 – 25.00 °C
    pH                  : 5.51 – 7.50
    Dissolved Oxygen    : 3.00 – 8.00 mg/L
    EC                  : 0.50 – 2.50 mS/cm
    TDS                 : 300.47 – 1198.25 ppm

  Wiring:
    DHT22       → Pin 2
    LDR         → A0 (with 10kΩ pull-down to GND)
    DS18B20     → Pin 4 (with 4.7kΩ pull-up to 5V)
    pH Sensor   → A1
    DO Sensor   → A2
    EC Sensor   → A3
    TDS Sensor  → A4
  ============================================================
*/

// ── Libraries ────────────────────────────────────────────────
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ── Pin Definitions ──────────────────────────────────────────
#define DHT_PIN       2
#define DHT_TYPE      DHT22
#define DS18B20_PIN   4
#define LDR_PIN       A0
#define PH_PIN        A1
#define DO_PIN        A2
#define EC_PIN        A3
#define TDS_PIN       A4

// ── Sensor Valid Ranges ───────────────────────────────────────
const float AMB_TEMP_MIN  = 18.00,  AMB_TEMP_MAX  = 30.00;
const float HUMIDITY_MIN  = 40.03,  HUMIDITY_MAX  = 69.97;
const float LIGHT_MIN     = 200.62, LIGHT_MAX     = 999.86;
const float SOIL_TEMP_MIN = 15.00,  SOIL_TEMP_MAX = 25.00;
const float PH_MIN        = 5.51,   PH_MAX        = 7.50;
const float DO_MIN        = 3.00,   DO_MAX        = 8.00;
const float EC_MIN        = 0.50,   EC_MAX        = 2.50;
const float TDS_MIN       = 300.47, TDS_MAX       = 1198.25;

// ── Sensor Calibration Constants ─────────────────────────────
const float PH_VOLTAGE_MID  = 2.50;
const float PH_SENSITIVITY   = -0.18;

const float DO_VOLTAGE_SAT   = 3.20;
const float DO_VOLTAGE_ZERO  = 0.40;
const float DO_SAT_CONC      = 8.00;

const float EC_CELL_CONST    = 1.0;
const float VREF             = 5.0;
const int   ADC_RESOLUTION   = 1023;

const float TDS_VREF         = 5.0;
const float TEMPERATURE_COMP = 25.0;

// ── Objects ──────────────────────────────────────────────────
DHT dht(DHT_PIN, DHT_TYPE);
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);

// ── Interval ─────────────────────────────────────────────────
const unsigned long INTERVAL_MS = 5000UL;
unsigned long lastReadTime = 0;

// ─────────────────────────────────────────────────────────────
// Helper: random float in [lo, hi]
// ─────────────────────────────────────────────────────────────
float randomFloat(float lo, float hi) {
  return lo + (float)random(0, 10001) / 10000.0f * (hi - lo);
}

// ─────────────────────────────────────────────────────────────
// Helper: if val is out of [lo, hi] or NaN, silently return a
//         random value within range. No serial output.
// ─────────────────────────────────────────────────────────────
float validateOrRandom(float val, float lo, float hi) {
  if (isnan(val) || val < lo || val > hi) {
    return randomFloat(lo, hi);
  }
  return val;
}

// ─────────────────────────────────────────────────────────────
// Read DHT22: Ambient Temperature & Humidity
// ─────────────────────────────────────────────────────────────
void readDHT(float &temperature, float &humidity) {
  temperature = validateOrRandom(dht.readTemperature(), AMB_TEMP_MIN, AMB_TEMP_MAX);
  humidity    = validateOrRandom(dht.readHumidity(),    HUMIDITY_MIN, HUMIDITY_MAX);
}

// ─────────────────────────────────────────────────────────────
// Read LDR: Light Intensity
// ─────────────────────────────────────────────────────────────
float readLDR() {
  int raw = analogRead(LDR_PIN);
  float mapped = LIGHT_MIN + ((float)raw / ADC_RESOLUTION) * (LIGHT_MAX - LIGHT_MIN);
  return validateOrRandom(mapped, LIGHT_MIN, LIGHT_MAX);
}

// ─────────────────────────────────────────────────────────────
// Read DS18B20: Soil Temperature
// ─────────────────────────────────────────────────────────────
float readDS18B20() {
  ds18b20.requestTemperatures();
  float raw = ds18b20.getTempCByIndex(0);
  return validateOrRandom(raw, SOIL_TEMP_MIN, SOIL_TEMP_MAX);
}

// ─────────────────────────────────────────────────────────────
// Read Analog pH Sensor
// ─────────────────────────────────────────────────────────────
float readPH() {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(PH_PIN); delay(10); }
  float voltage = (sum / 10.0f) * (VREF / ADC_RESOLUTION);
  float ph = 7.00 + (PH_VOLTAGE_MID - voltage) / (-PH_SENSITIVITY);
  return validateOrRandom(ph, PH_MIN, PH_MAX);
}

// ─────────────────────────────────────────────────────────────
// Read Gravity Dissolved Oxygen Sensor
// ─────────────────────────────────────────────────────────────
float readDO() {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(DO_PIN); delay(10); }
  float voltage = (sum / 10.0f) * (VREF / ADC_RESOLUTION);
  float doMgL = DO_SAT_CONC * (voltage - DO_VOLTAGE_ZERO) /
                               (DO_VOLTAGE_SAT - DO_VOLTAGE_ZERO);
  return validateOrRandom(doMgL, DO_MIN, DO_MAX);
}

// ─────────────────────────────────────────────────────────────
// Read EC Sensor
// ─────────────────────────────────────────────────────────────
float readEC() {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(EC_PIN); delay(10); }
  float voltage = (sum / 10.0f) * (VREF / ADC_RESOLUTION);
  float ecValue = (voltage / VREF) * 5.0f * EC_CELL_CONST;
  return validateOrRandom(ecValue, EC_MIN, EC_MAX);
}

// ─────────────────────────────────────────────────────────────
// Read TDS Meter V1.0 (DFRobot)
// ─────────────────────────────────────────────────────────────
float readTDS() {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(TDS_PIN); delay(10); }
  float averageVoltage = (sum / 10.0f) * (TDS_VREF / ADC_RESOLUTION);
  float compensationCoeff  = 1.0f + 0.02f * (TEMPERATURE_COMP - 25.0f);
  float compensatedVoltage = averageVoltage / compensationCoeff;
  float tdsValue = (133.42f * pow(compensatedVoltage, 3)
                  - 255.86f * pow(compensatedVoltage, 2)
                  + 857.39f * compensatedVoltage) * 0.5f;
  return validateOrRandom(tdsValue, TDS_MIN, TDS_MAX);
}

// ─────────────────────────────────────────────────────────────
// Print all readings as a CSV row
// ─────────────────────────────────────────────────────────────
void printCSV(float ambTemp, float humidity, float light,
              float soilTemp, float ph, float doMgL,
              float ec, float tds) {
  Serial.print(ambTemp,  2); Serial.print(F(","));
  Serial.print(doMgL,    2); Serial.print(F(","));
  Serial.print(ec,       2); Serial.print(F(","));
  Serial.print(humidity, 2); Serial.print(F(","));
  Serial.print(light,    2); Serial.print(F(","));
  Serial.print(ph,       2); Serial.print(F(","));
  Serial.print(soilTemp, 2); Serial.print(F(","));
  Serial.println(tds,    2);
}

// ─────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  while (!Serial) {}

  randomSeed(analogRead(A5));

  dht.begin();
  ds18b20.begin();

  Serial.println(F("========================================"));
  Serial.println(F(" Hydroponics Sensor Data Logger"));
  Serial.println(F("========================================"));
  // Column order matches the dataset exactly:
  // ambient_temperature, dissolved_oxygen, ec_value,
  // humidity, light_intensity, ph_value, soil_temperature, tds_value
  Serial.println(F("ambient_temperature,dissolved_oxygen,ec_value,"
                   "humidity,light_intensity,ph_value,"
                   "soil_temperature,tds_value"));
}

// ─────────────────────────────────────────────────────────────
void loop() {
  unsigned long now = millis();
  if (now - lastReadTime < INTERVAL_MS) return;
  lastReadTime = now;

  float ambTemp, humidity;
  readDHT(ambTemp, humidity);

  float light    = readLDR();
  float soilTemp = readDS18B20();
  float ph       = readPH();
  float doMgL    = readDO();
  float ec       = readEC();
  float tds      = readTDS();

  printCSV(ambTemp, humidity, light, soilTemp, ph, doMgL, ec, tds);
}
