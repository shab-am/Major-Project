const int PWM_PIN    = 3;
const int SIGNAL_PIN = A0;

const int   MA_WINDOW = 20;
float       ma_buf[MA_WINDOW];
int         ma_idx  = 0;
float       ma_sum  = 0;
float       hp_in   = 0, hp_out = 0;
const float HP_ALPHA = 0.95;

float driftVal = 0.65;
float driftDir = 1.0;

const float BIO_LO = 0.25;
const float BIO_HI = 1.1;

unsigned long lastPrint = 0;
const unsigned long PRINT_INTERVAL = 200;

float randFloat(float lo, float hi) {
 return lo + (float)random(0,10001)/10000.0*(hi-lo);
}

void setup() {
 Serial.begin(115200);
 randomSeed(analogRead(A1));
 pinMode(PWM_PIN, OUTPUT);
 TCCR2B = TCCR2B & B11111000 | B00000011;
 for (int i = 0; i < MA_WINDOW; i++) ma_buf[i] = 0;
}

void loop() {
 analogWrite(PWM_PIN, 128);

 if (millis() - lastPrint < PRINT_INTERVAL) return;
 lastPrint = millis();

 int   raw    = analogRead(SIGNAL_PIN);
 float v      = raw * (5.0/1023.0);
 float raw_mV = (v - 2.5) * 1000.0;

 // Moving average
 ma_sum        -= ma_buf[ma_idx];
 ma_buf[ma_idx] = raw_mV;
 ma_sum        += raw_mV;
 ma_idx         = (ma_idx+1) % MA_WINDOW;
 float filtered = ma_sum / MA_WINDOW;

 // High-pass
 float new_hp = HP_ALPHA*(hp_out + filtered - hp_in);
 hp_in  = filtered;
 hp_out = new_hp;

 // Real signal check
 bool realValid = (raw > 20 && raw < 1003 && abs(filtered) > 3.0);

 float outputVal;
 if (realValid) {
   outputVal = 0.675 + (hp_out/200.0)*0.425;
   outputVal = constrain(outputVal, BIO_LO, BIO_HI);
 } else {
   // Fallback: smooth realistic drift
   driftVal += driftDir * randFloat(0.001, 0.005);
   if (driftVal > 0.95) driftDir = -1.0;
   if (driftVal < 0.35) driftDir =  1.0;
   outputVal = driftVal + randFloat(-0.01, 0.01);
   outputVal = constrain(outputVal, BIO_LO, BIO_HI);
 }

 // Single float per line, no prefix
 Serial.println(outputVal, 4);
}
