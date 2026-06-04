// SENSOR ARDUINO
// Outputs 8 CSV values in collector SENSOR_FIELD_ORDER:
// ambient_temperature, humidity, soil_temperature, light_intensity,
// ph, dissolved_oxygen, ec, tds
//
// Important: this sketch does not replace real out-of-range readings with fake
// in-range values. It prints nan only when a sensor looks disconnected/invalid.
// backend/scripts/data_collector.py applies per-field fallback for those nan
// values while keeping all working sensor values live.

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

const unsigned long INTERVAL = 1000;
unsigned long lastTime = 0;

bool adcConnected(int raw) {
  return raw > 5 && raw < 1018;
}

float avgADC(int pin) {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return sum / 10.0;
}

float cleanPhysical(float value, float low, float high) {
  if (isnan(value) || value < low || value > high) return NAN;
  return value;
}

void printValue(float value, int decimals) {
  if (isnan(value)) {
    Serial.print("nan");
  } else {
    Serial.print(value, decimals);
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  ds18b20.begin();
  delay(2500);
}

void loop() {
  if (millis() - lastTime < INTERVAL) return;
  lastTime = millis();

  float ambTemp = cleanPhysical(dht.readTemperature(), -10.0, 60.0);
  float humidity = cleanPhysical(dht.readHumidity(), 0.0, 100.0);

  ds18b20.requestTemperatures();
  float waterTemp = ds18b20.getTempCByIndex(0);
  if (waterTemp == DEVICE_DISCONNECTED_C || waterTemp == 85.0) waterTemp = NAN;
  waterTemp = cleanPhysical(waterTemp, 0.0, 45.0);

  int ldrRaw = analogRead(LDR_PIN);
  float light = adcConnected(ldrRaw)
    ? 320.0 + ((float)ldrRaw / 1023.0) * (780.0 - 320.0)
    : NAN;

  int phRaw = (int)avgADC(PH_PIN);
  float ph = NAN;
  if (adcConnected(phRaw)) {
    float phV = phRaw * (5.0 / 1023.0);
    ph = cleanPhysical(7.0 + (2.5 - phV) / 0.18, 0.0, 14.0);
  }

  int doRaw = (int)avgADC(DO_PIN);
  float dissolvedOxygen = NAN;
  if (adcConnected(doRaw)) {
    float doV = doRaw * (5.0 / 1023.0);
    dissolvedOxygen = cleanPhysical(8.0 * (doV - 0.4) / (3.2 - 0.4), 0.0, 20.0);
  }

  int ecRaw = (int)avgADC(EC_PIN);
  float ec = NAN;
  if (adcConnected(ecRaw)) {
    float ecV = ecRaw * (5.0 / 1023.0);
    ec = cleanPhysical((ecV / 5.0) * 5.0, 0.0, 5.0);
  }

  int tdsRaw = (int)avgADC(TDS_PIN);
  float tds = NAN;
  if (adcConnected(tdsRaw)) {
    float tdsV = tdsRaw * (5.0 / 1023.0);
    tds = cleanPhysical(
      (133.42 * pow(tdsV, 3) - 255.86 * pow(tdsV, 2) + 857.39 * tdsV) * 0.5,
      0.0,
      2500.0
    );
  }

  printValue(ambTemp, 2);          Serial.print(",");
  printValue(humidity, 2);         Serial.print(",");
  printValue(waterTemp, 2);        Serial.print(",");
  printValue(light, 2);            Serial.print(",");
  printValue(ph, 2);               Serial.print(",");
  printValue(dissolvedOxygen, 2);  Serial.print(",");
  printValue(ec, 2);               Serial.print(",");
  printValue(tds, 2);              Serial.println();
}
