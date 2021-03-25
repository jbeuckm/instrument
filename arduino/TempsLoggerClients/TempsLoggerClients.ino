
/**
   BasicHTTPSClient.ino

    Created on: 20.08.2018

*/

#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ESP8266HTTPClient.h>

#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>

#include <OneWire.h>
#include <DallasTemperature.h>
#include "secrets.h"

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

// Fingerprint for demo URL, expires on June 2, 2021, needs to be updated well before this date
const uint8_t fingerprint[20] = {0x40, 0xaf, 0x00, 0x6b, 0xec, 0x90, 0x22, 0x41, 0x8e, 0xa3, 0xad, 0xfa, 0x1a, 0xe8, 0x25, 0x41, 0x1d, 0x1a, 0x54, 0xb3};
// aws lambda fingerprint https://t62i5rchr0.execute-api.us-east-2.amazonaws.com
// const uint8_t fingerprint2[20] = {0x3F, 0xBA, 0x9A, 0x29, 0xCC, 0x33, 0x3A, 0xC6, 0xAF, 0x74, 0xD0, 0x19, 0xF4, 0xB4, 0xCE, 0x83, 0xFE, 0x12, 0x6D, 0x1D};
// aws lambda fingerprint https://if2574leol.execute-api.us-east-2.amazonaws.com
const uint8_t fingerprint2[20] = {0xAC, 0x9E, 0x24, 0xF0, 0x61, 0x01, 0x19, 0x48, 0x00, 0x04, 0x1F, 0xD6, 0x01, 0x12, 0x7F, 0xC2, 0x8F, 0x35, 0xA6, 0xBB};

ESP8266WiFiMulti WiFiMulti;


#define SERVICE_URL "https://if2574leol.execute-api.us-east-2.amazonaws.com/dev/readings"


void setup() {

  pinMode(ledPin, OUTPUT);

  Serial.begin(115200);
//   Serial.setDebugOutput(true);

  Serial.println();
  Serial.println();
  Serial.println();

  for (uint8_t t = 4; t > 0; t--) {
    Serial.printf("[SETUP] WAIT %d...\n", t);
    Serial.flush();
    delay(1000);
  }

  WiFi.mode(WIFI_STA);
  WiFiMulti.addAP(STASSID, STAPSK);

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

void loop() {
  // Call sensors.requestTemperatures() to issue a global temperature and Requests to all devices on the bus
  sensors.requestTemperatures();

  sensorCount = sensors.getDeviceCount();
  Serial.print("found sensors: ");
  Serial.println(sensorCount);

  // wait for WiFi connection
  if ((WiFiMulti.run() == WL_CONNECTED)) {

    wifiConnected = true;
    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);

    client->setFingerprint(fingerprint2);

    HTTPClient https;

    Serial.print("[HTTPS] begin...\n");
    if (https.begin(*client, SERVICE_URL)) {  // HTTPS

      https.addHeader("x-api-key", API_KEY);
      https.addHeader("Content-Type", "application/json");

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
  } else {
    Serial.printf("WiFi not connected\n");
    wifiConnected = false;
  }

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
