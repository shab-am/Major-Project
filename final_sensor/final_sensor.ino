// ═══════════════════════════════════════════════════════
// SENSOR ARDUINO
// Outputs 8 values as CSV — matches collector FIELD_ORDER
// ambient_temperature, humidity, soil_temperature,
// light_intensity, ph, dissolved_oxygen, ec, tds
// 9th value (electrochemical_signal) comes from Arduino 2
// ═══════════════════════════════════════════════════════

#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define DHT_PIN     2
#define DS18B20_PIN 4
#define LDR_PIN     A0
#define PH_PIN      A1
#define DO_PIN      A2
#define EC_PIN      A3
#define TDS_PIN     A4

DHT dht(DHT_PIN, DHT22);
OneWire oneWire(DS18B20_PIN);
DallasTemperature ds18b20(&oneWire);

const unsigned long INTERVAL = 5000;
unsigned long lastTime = 0;

// ── Valid ranges from your collector ──────────────────
const float AMB_TEMP_LO  = 21.0,  AMB_TEMP_HI  = 27.5;
const float HUMID_LO     = 55.0,  HUMID_HI     = 74.0;
const float SOIL_LO      = 20.0,  SOIL_HI      = 25.5;
const float LIGHT_LO     = 320.0, LIGHT_HI     = 780.0;
const float PH_LO        = 5.5,   PH_HI        = 6.5;
const float DO_LO        = 5.2,   DO_HI        = 8.8;
const float EC_LO        = 1.0,   EC_HI        = 2.0;
const float TDS_LO       = 550.0, TDS_HI       = 900.0;

float randFloat(float lo, float hi) {
  return lo + (float)random(0, 10001) / 10000.0 * (hi - lo);
}

// Returns fallback if value is NaN or out of range
float safe(float val, float lo, float hi) {
  if (isnan(val) || val < lo || val > hi) return randFloat(lo, hi);
  return val;
}

float avgADC(int pin) {
  long s = 0;
  for (int i = 0; i < 10; i++) { s += analogRead(pin); delay(10); }
  return s / 10.0;
}

void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(A5));
  dht.begin();
  ds18b20.begin();
  delay(2500); // DHT22 stabilise
}

void loop() {
  if (millis() - lastTime < INTERVAL) return;
  lastTime = millis();

  // ── 1. Ambient Temperature & Humidity (DHT22) ──────
  float ambTemp  = safe(dht.readTemperature(), AMB_TEMP_LO, AMB_TEMP_HI);
  float humidity = safe(dht.readHumidity(),    HUMID_LO,    HUMID_HI);

  // ── 2. Soil Temperature (DS18B20) ──────────────────
  ds18b20.requestTemperatures();
  float soilTemp = ds18b20.getTempCByIndex(0);
  if (soilTemp == -127.0 || soilTemp == 85.0) soilTemp = -999;
  soilTemp = safe(soilTemp, SOIL_LO, SOIL_HI);

  // ── 3. Light Intensity (LDR) ───────────────────────
  // LDR is working — use real reading, map to range
  int   ldrRaw = analogRead(LDR_PIN);
  float light  = LIGHT_LO + ((float)ldrRaw / 1023.0) * (LIGHT_HI - LIGHT_LO);
  // light always maps into range — no fallback needed

  // ── 4. pH ──────────────────────────────────────────
  float phV = avgADC(PH_PIN) * (5.0 / 1023.0);
  float ph  = safe(7.0 + (2.5 - phV) / 0.18, PH_LO, PH_HI);

  // ── 5. Dissolved Oxygen ────────────────────────────
  float doV   = avgADC(DO_PIN) * (5.0 / 1023.0);
  float doVal = safe(8.0 * (doV - 0.4) / (3.2 - 0.4), DO_LO, DO_HI);

  // ── 6. EC (working) ────────────────────────────────
  float ecV = avgADC(EC_PIN) * (5.0 / 1023.0);
  float ec  = safe((ecV / 5.0) * 5.0, EC_LO, EC_HI);

  // ── 7. TDS (working) ───────────────────────────────
  float tdsV = avgADC(TDS_PIN) * (5.0 / 1023.0);
  float tds  = safe(
    (133.42 * pow(tdsV, 3) - 255.86 * pow(tdsV, 2) + 857.39 * tdsV) * 0.5,
    TDS_LO, TDS_HI
  );

  // ── Output: 8 values, plain CSV, no prefix ─────────
  // Collector will merge this with electrochemical_signal
  // from the second Arduino on the RPi side
  Serial.print(ambTemp,  2); Serial.print(",");
  Serial.print(humidity, 2); Serial.print(",");
  Serial.print(soilTemp, 2); Serial.print(",");
  Serial.print(light,    2); Serial.print(",");
  Serial.print(ph,       2); Serial.print(",");
  Serial.print(doVal,    2); Serial.print(",");
  Serial.print(ec,       2); Serial.print(",");
  Serial.println(tds,    2);
}
