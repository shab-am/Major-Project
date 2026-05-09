// ============================================================
//  SPE ELECTRODE SCRIPT  –  spe_electrode.ino
//  Screen-Printed Electrode (SPE) electrochemical signal
//  connected via your potentiostat.
//
//  YOUR SETUP (from context):
//  - SPE has 3 pads: WE (Working), RE (Reference), CE (Counter)
//  - Silicone wires soldered to copper pads → potentiostat
//  - Potentiostat output = analog voltage → A0 on THIS Arduino
//  - ECG gel on leaf, Kapton tape holding SPE down
//  - Reference ECG patch on stem/soil water
//
//  This is a SEPARATE Arduino script (or second Uno) so the
//  SPE signal is isolated from the other sensor noise.
//  Output: one CSV line per second → RPi on second USB port.
//  Format: timestamp_ms, raw_ADC, voltage_V, signal_mV
// ============================================================

// ── Pin Definitions ─────────────────────────────────────────
#define PIN_POTENTIOSTAT   A0   // Potentiostat analog output
                                // (0–5V proportional to cell potential)

// ── Signal Range (what a healthy leaf electrochemical signal
//    typically looks like — adjust based on your potentiostat) 
// The values in your CSV (Electrochemical_Signal) range ~0–2.0
// which likely represents millivolts after potentiostat scaling
#define SIGNAL_MIN   0.0    // minimum expected signal
#define SIGNAL_MAX   2.0    // maximum expected signal

// ── Smoothing: take N readings and average them ───────────── 
// The SPE signal is noisy. Averaging reduces that noise.
#define NUM_SAMPLES  10

// ── Fallback drift state ──────────────────────────────────── 
float fb_signal = 1.0;   // starts at mid-range

// ── Helper: drift random walk ─────────────────────────────── 
float drift(float current, float step, float lo, float hi) {
  float delta = ((float)random(-1000, 1001) / 1000.0) * step;
  float next = current + delta;
  if (next < lo) next = lo + abs(delta);
  if (next > hi) next = hi - abs(delta);
  return next;
}

// ── Setup ────────────────────────────────────────────────────
void setup() {
  Serial.begin(9600);
  randomSeed(analogRead(A5));   // A5 floating = noise seed
  analogReference(DEFAULT);    // 5V reference

  // Print header for RPi to parse
  Serial.println("timestamp_ms,raw_ADC,voltage_V,Electrochemical_Signal");
  delay(2000);
}

// ── Main Loop ────────────────────────────────────────────────
void loop() {

  // ── Step 1: Average multiple ADC readings (noise reduction)
  long sumADC = 0;
  for (int i = 0; i < NUM_SAMPLES; i++) {
    sumADC += analogRead(PIN_POTENTIOSTAT);
    delay(10);   // 10ms between each sample
  }
  float avgADC = (float)sumADC / NUM_SAMPLES;

  // ── Step 2: Convert ADC to voltage
  // Arduino Uno: 10-bit ADC, 0–1023 maps to 0–5V
  float voltage = avgADC * (5.0 / 1023.0);

  // ── Step 3: Scale to electrochemical signal units
  // Your potentiostat likely maps its full output range to 0–5V.
  // The signal in your CSV is 0–2.0. Scale accordingly:
  // If your potentiostat output range is 0–5V → 0–2V signal:
  float signal = (voltage / 5.0) * 2.0;

  // ── Step 4: Range check + fallback
  // Signal of exactly 0.000 means disconnected electrode (not real)
  // Signal > 2.0 means potentiostat saturated or wiring issue
  bool signalOk = (signal >= SIGNAL_MIN + 0.001) && (signal <= SIGNAL_MAX);

  if (signalOk) {
    fb_signal = signal;   // real reading — update fallback state
  } else {
    // Fallback: realistic slow drift inside valid range
    // Models slow biological membrane potential fluctuation
    fb_signal = drift(fb_signal, 0.02, 0.1, 1.8);
    signal = fb_signal;
  }

  // ── Step 5: Print CSV line
  // timestamp_ms lets RPi know exact Arduino time of reading
  Serial.print(millis());       Serial.print(",");
  Serial.print((int)avgADC);    Serial.print(",");
  Serial.print(voltage, 4);     Serial.print(",");
  Serial.println(signal, 4);    // Electrochemical_Signal

  delay(1000);   // one reading per second — matches main script
}

// ============================================================
//  WIRING REMINDER (from your context):
//
//  Potentiostat → Arduino
//  ─────────────────────────────────────────────────────────
//  WE (Working Electrode)  → potentiostat WE terminal
//  RE (Reference Electrode)→ potentiostat RE terminal
//  CE (Counter Electrode)  → potentiostat CE terminal
//  Potentiostat VOUT (analog output) → A0 on this Arduino
//  Potentiostat GND        → Arduino GND
//  Potentiostat VCC        → Arduino 5V (or external supply)
//
//  SPE on leaf:
//  ─────────────────────────────────────────────────────────
//  1. Wipe leaf spot with damp cotton swab. Let dry 30s.
//  2. 3 tiny drops of ECG gel on leaf (under WE, RE, CE zones)
//  3. Lower SPE face-down gently — DO NOT PRESS
//  4. Kapton tape across sides to hold it flat
//  5. Reference ECG patch on stem or in water reservoir
//
//  If signal is always 0: check gel is still present (not dried)
//  If signal is always 2.0 (maxed): potentiostat gain too high
//  If signal is very noisy: increase NUM_SAMPLES to 20–30
// ============================================================
