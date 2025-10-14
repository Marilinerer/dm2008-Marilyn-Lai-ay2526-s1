//BLINKING LED
int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);  // LED on
  delay(500);
  digitalWrite(ledPin, LOW);   // LED off
  delay(500);
}

//FADING LED
int ledPin = 9;
int brightness = 0;
int fadeAmount = 5;
 
void setup() {
  pinMode(ledPin, OUTPUT);
}
 
void loop() {
  analogWrite(ledPin, brightness); 
  brightness += fadeAmount;
 
  if (brightness <= 0 || brightness >= 255) {
    fadeAmount = -fadeAmount;
  }
 
  delay(30);
}