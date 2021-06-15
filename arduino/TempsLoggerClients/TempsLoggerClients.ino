
/**
   BasicHTTPSClient.ino

    Created on: 20.08.2018

*/

#include <Arduino.h>

#include <ESP8266WiFi.h>
//#include <ESP8266WiFiMulti.h>
#include <CertStoreBearSSL.h>
#include <time.h>
#include <LittleFS.h>

#include <ESP8266HTTPClient.h>

#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>

#include <OneWire.h>
#include <DallasTemperature.h>
#include "secrets.h"


BearSSL::CertStore certStore;


// pin 4 (D1 classic size arduino board)
// pin 2 (wemo mini board)
#define ONE_WIRE_BUS 2 // probably 2 on wemo?
#define ledPin 14

// Setup a oneWire instance to communicate with any OneWire devices
OneWire oneWire(ONE_WIRE_BUS);

// Pass our oneWire reference to Dallas Temperature sensor
DallasTemperature sensors(&oneWire);
int sensorCount = 0;
bool wifiConnected = false;


#define SERVICE_URL "https://if2574leol.execute-api.us-east-2.amazonaws.com/dev/readings"
#define SERVICE_HOST "if2574leol.execute-api.us-east-2.amazonaws.com"
#define SERVICE_PATH "/dev/readings"


// Set time via NTP, as required for x.509 validation
void setClock() {
  configTime(3 * 3600, 0, "pool.ntp.org", "time.nist.gov");

  Serial.print("Waiting for NTP time sync: ");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));
}


void setup() {

  pinMode(ledPin, OUTPUT);

  Serial.begin(115200);
//   Serial.setDebugOutput(true);

  LittleFS.begin();
  
  Serial.println();
  Serial.println();
  Serial.println();

  for (uint8_t t = 4; t > 0; t--) {
    Serial.printf("[SETUP] WAIT %d...\n", t);
    Serial.flush();
    delay(1000);
  }

//  WiFi.mode(WIFI_STA);
//  WiFiMulti.addAP(STASSID, STAPSK);

  WiFi.mode(WIFI_STA);
  WiFi.begin(STASSID, STAPSK);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
    Serial.println("");

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  setClock();

  
  int numCerts = certStore.initCertStore(LittleFS, PSTR("/certs.idx"), PSTR("/certs.ar"));
  Serial.printf("Number of CA certs read: %d\n", numCerts);
  if (numCerts == 0) {
    Serial.printf("No certs found. Did you run certs-from-mozilla.py and upload the LittleFS directory before running?\n");
    return; // Can't connect to anything w/o certs!
  }

//  BearSSL::WiFiClientSecure *bear = new BearSSL::WiFiClientSecure();
//  // Integrate the cert store with this connection
//  bear->setCertStore(&certStore);
//  Serial.printf("Attempting to fetch https://github.com/...\n");
//  fetchURL(bear, "github.com", 443, "/");
//  delete bear;
  
  sensors.begin();
}

String printAddress(DeviceAddress deviceAddress) {
  String str = "";
  for (uint8_t i = 0; i < 8; i++) {
    // zero pad the address if necessary
    str += String(deviceAddress[i], HEX);
  }

  return str;
}

void post(BearSSL::WiFiClientSecure *client, const char *host, const uint16_t port, const char *path, const char *data) {
  if (!path) {
    path = "/";
  }

  Serial.printf("Trying: %s:443...", host);
  client->connect(host, port);
  if (!client->connected()) {
    Serial.printf("*** Can't connect. ***\n-------\n");
    return;
  }
  Serial.printf("Connected!\n-------\n");
  client->write("POST ");
  client->write(path);
  client->write(" HTTP/1.0\r\nHost: ");
  client->write(host);
  client->write("\r\nUser-Agent: ESP8266\r\n");
  client->write("x-api-key: ");
  client->write(API_KEY);
  client->write("\r\n");
  client->write("Content-Type: application/json\r\n");
  client->write(data);
  client->write("\r\n");
  uint32_t to = millis() + 5000;
  if (client->connected()) {
    do {
      char tmp[32];
      memset(tmp, 0, 32);
      int rlen = client->read((uint8_t*)tmp, sizeof(tmp) - 1);
      yield();
      if (rlen < 0) {
        break;
      }
//      // Only print out first line up to \r, then abort connection
//      char *nl = strchr(tmp, '\r');
//      if (nl) {
//        *nl = 0;
//        Serial.print(tmp);
//        break;
//      }
      Serial.print(tmp);
    } while (millis() < to);
  }
  client->stop();
  Serial.printf("\n-------\n");
}

void loop() {
  // Call sensors.requestTemperatures() to issue a global temperature and Requests to all devices on the bus
  sensors.requestTemperatures();

  sensorCount = sensors.getDeviceCount();
  Serial.print("found sensors: ");
  Serial.println(sensorCount);

  // wait for WiFi connection
//  if (WiFi.status() == WL_CONNECTED) {
//  while (WiFi.status() != WL_CONNECTED) {
//    delay(500);
//    Serial.print(".");
//  }

    wifiConnected = true;

    const int capacity = JSON_OBJECT_SIZE(10);
    StaticJsonDocument<capacity> doc;

    for (int i=0; i<sensorCount; i++) {
      DeviceAddress t;
      sensors.getAddress(t, i);

      String address = printAddress(t);
      doc[address] = sensors.getTempCByIndex(i);
    }
    String postMessage;
    serializeJson(doc, postMessage);

    Serial.print("[HTTPS] POST...\n");
    serializeJson(doc, Serial);
    Serial.println("");

    BearSSL::WiFiClientSecure client = BearSSL::WiFiClientSecure();
    // Integrate the cert store with this connection
    client.setCertStore(&certStore);


    HTTPClient https;

    Serial.print("[HTTPS] begin...\n");
    
//    if (https.begin(*client, SERVICE_URL)) {  // HTTPS
    if (https.begin(client, SERVICE_URL)) {  // HTTPS

      https.addHeader("x-api-key", API_KEY);
      https.addHeader("Content-Type", "application/json");

      // start connection and send HTTP header
      int httpCode = https.POST(postMessage);

      // httpCode will be negative on error
      if (httpCode > 0) {
        // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTPS] POST... code: %d\n", httpCode);

        // file found at server
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          String payload = https.getString();
          Serial.println(payload);
        }
      } else {
        Serial.printf("[HTTPS] POST... failed, error: %s\n", https.errorToString(httpCode).c_str());
      }

      https.end();

    } else {
      Serial.printf("[HTTPS] Unable to connect\n");
    }


//    int str_len = postMessage.length() + 1; 
//    char char_array[str_len];
//    postMessage.toCharArray(char_array, str_len);
//    post(client, SERVICE_HOST, 443, SERVICE_PATH, char_array);
      
//    delay(1000);
//    delete client;

//  } else {
//    Serial.printf("WiFi not connected\n");
//    wifiConnected = false;
//  }

  for (int i=0; i<sensorCount; i++) {
    digitalWrite(ledPin,HIGH);
    delay(250);
    digitalWrite(ledPin,LOW);
    delay(250);
  }

  if (wifiConnected) {
    Serial.println("Wait 5m before next round...");
    delay(5 * 60 * 1000);
  } else {
    Serial.println("Wait 10s before next round...");
    delay(10 * 1000);
  }
}
