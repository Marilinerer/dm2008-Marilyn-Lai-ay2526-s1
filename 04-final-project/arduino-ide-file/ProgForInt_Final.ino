float pressure;

void setup() {
  Serial.begin(9600); // must match your p5 serial baud rate
}

void loop() {
  float sensorVal = analogRead(A0);         
  float norm = sensorVal / 1023.0;           // 0.0 - 1.0 as float
  Serial.println(norm, 3);                   // print e.g. 0.123 (3 decimals)

  delay(100); // small delay to keep it stable
}
