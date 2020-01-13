#include <ESP8266WiFi.h>
#define SAMPLES 5

String ssid = "Irrigation Control";

WiFiServer server(80);


int pumpPin = 5;//D1
int sensorSourcePin = 4;//D2

bool pumpState = false;

void setupWiFi(String password)
{
  WiFi.mode(WIFI_AP);

  uint8_t mac[WL_MAC_ADDR_LENGTH];
  WiFi.softAPmacAddress(mac);
  String macID = String(mac[WL_MAC_ADDR_LENGTH - 2], HEX) +
                 String(mac[WL_MAC_ADDR_LENGTH - 1], HEX);
  macID.toUpperCase();
  String AP_NameString = ssid + "-" + macID;


  WiFi.softAP(AP_NameString.c_str(), password.c_str());
}

void setup() {
  delay(1000);
  Serial.begin(115200);

  setupWiFi("12345678");

  pinMode(pumpPin, OUTPUT);
  pinMode(sensorSourcePin, OUTPUT);

  server.begin();
}


float readHumidity()
{
  float h = 0;
  digitalWrite(sensorSourcePin, 1);
  delay(200);
  for (int i = 0; i < SAMPLES; ++i)
  {
    h += map(analogRead(0), 550, 10, 0, 100);
    delay(100);
  }
  
  Serial.print("Humidity: " + String(h / SAMPLES));

  return h / SAMPLES;
}

float readTemp()
{
  float t = 0;
  digitalWrite(sensorSourcePin, 0);
  delay(200);
  for (int i = 0; i < SAMPLES; ++i)
  {
    int val = analogRead(0);
    float mv = map(val, 0, 1024, 0, 5000 * (3.3/5.0));//(val/1024.0)*5000; 
    float cel = mv/10;
    t += cel;
    
    delay(100);
  }
  
  Serial.print("Temp: " + String(t / SAMPLES));

  return t / SAMPLES;
}

void loop() {

  digitalWrite(pumpPin, pumpState);
  WiFiClient client = server.available();
  if (!client) {
    return;
  }
 
  // Wait until the client sends some data
  //  Serial.println("new client");
  while(!client.available()){
    delay(1);
  }
 
  // Read the first line of the request
  String req = client.readStringUntil('\r');
 
  client.flush();
  
  String html = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n";

  Serial.println(req);
  if (req.indexOf("/pump") != -1)
  {
    html += pumpState ? "1" : "0";
  }
  else if (req.indexOf("/on") != -1)
  {
    pumpState = true;
  }
  else if (req.indexOf("/off") != -1)
  {
    pumpState = false;
  }
  else if (req.indexOf("/t") != -1)
  {
    html += String(readTemp());
  }
  else if (req.indexOf("/h") != -1)
  {
    html += String(readHumidity());
  }
  else if (req.indexOf("/c") != -1)
  {
    html += "1234";
  }



  client.print(html);
  delay(1);


}
