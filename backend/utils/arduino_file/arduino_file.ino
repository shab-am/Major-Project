#include <GravityTDS.h>
#include <DHT.h>

// Pins
#define TDS_SENSOR_PIN A1
#define PH_SENSOR_PIN A0
#define DO_SENSOR_PIN A2
#define DHTPIN 2
#define DHTTYPE DHT11

GravityTDS gravityTds;
DHT dht(DHTPIN, DHTTYPE);

// Variables
float airTemp = 0.0;
float humidity = 0.0;
float tdsValue = 0.0;
float phValue = 0.0;
float doValue = 0.0;

unsigned long lastReadTime = 0;
#define SAMPLE_INTERVAL 3000

// DO calibration
float vSat = 3.0;
float doSat = 8.26;

void setup() {
  Serial.begin(115200);

  gravityTds.setPin(TDS_SENSOR_PIN);
  gravityTds.setAref(5.0);
  gravityTds.setAdcRange(1024);
  gravityTds.begin();

  dht.begin();

  delay(2000); // allow sensors to stabilize
}

void loop() {
  if (millis() - lastReadTime >= SAMPLE_INTERVAL) {
    lastReadTime = millis();

    readSensors();
    sendData();
  }
}

void readSensors() {

  // ---- DHT11 ----
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (!isnan(h) && !isnan(t)) {
    humidity = h;
    airTemp = t;
  }
  // else keep previous values (avoids 0 problem)

  // ---- TDS ----
  gravityTds.setTemperature(25);
  gravityTds.update();
  tdsValue = gravityTds.getTdsValue();

  // ---- pH ----
  int buffer[10];
  for (int i = 0; i < 10; i++) {
    buffer[i] = analogRead(PH_SENSOR_PIN);
    delay(10);
  }

  // sort
  for (int i = 0; i < 9; i++) {
    for (int j = i + 1; j < 10; j++) {
      if (buffer[i] > buffer[j]) {
        int temp = buffer[i];
        buffer[i] = buffer[j];
        buffer[j] = temp;
      }
    }
  }

  int avg = 0;
  for (int i = 2; i < 8; i++) avg += buffer[i];
  avg /= 6;

  float voltage = avg * 5.0 / 1024;

  // SIMPLE & STABLE pH formula (adjust later if needed)
  phValue = 7 + ((2.5 - voltage) * 3.5);

  // limit pH range
  if (phValue < 0) phValue = 0;
  if (phValue > 14) phValue = 14;

  // ---- DO ----
  int raw = analogRead(DO_SENSOR_PIN);
  float voltageDO = raw * (5.0 / 1023.0);
  doValue = (voltageDO / vSat) * doSat;
}

void sendData() {
  Serial.print(airTemp); Serial.print(",");
  Serial.print(humidity); Serial.print(",");
  Serial.print(0); Serial.print(",");
  Serial.print(0); Serial.print(",");
  Serial.print(phValue); Serial.print(",");
  Serial.print(doValue); Serial.print(",");
  Serial.print(0); Serial.print(",");
  Serial.print(tdsValue); Serial.print(",");
  Serial.println(0);
}
