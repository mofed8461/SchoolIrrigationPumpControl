void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
}

void loop() {

  if (false)
  {
    int val = analogRead(0);
    
    float mv = map(val, 0, 1024, 0, 5000 * (3.3/5.0));//(val/1024.0)*5000; 
    float cel = mv/10;
    float farh = (cel*9)/5 + 32;
    Serial.print("TEMPRATURE = ");
    Serial.print(cel);
    Serial.print("*C");
    Serial.println();
  }
  else
  {
    int sensorValue = analogRead(A0);
    int hum = map(sensorValue,550,10,0,100);
//    int hum = (sensorValue * 100)/1024;
    
    Serial.print("Analog value: ");
    Serial.println(sensorValue);
    
    Serial.print("Humidity: ");
    Serial.print(hum);
    Serial.println("%");
  }


  delay(1000);
}
