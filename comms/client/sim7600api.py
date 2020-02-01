#!/usr/bin/env python3

import serial
import time

def sendCmd(cmd):
    cmd += "\r"
    readOut=[]
    ser=serial.Serial('/dev/ttyUSB0', 115200, timeout=1)
    ser.write(cmd.encode("ascii"))
    time.sleep(0.05)
    readOut.append(ser.readline().decode("ascii").split("\r\r\n")[0])
    while readOut[-1]:
        time.sleep(0.05)
        readOut.append(ser.readline().decode("ascii"))
    ser.flush()
    ser.close()
    for i in range(0, len(readOut)):
        readOut[i] = readOut[i].split("\r\n")[0]
    return readOut

def init():
    #Hardware Init
    print(sendCmd("AT+CMTE=1")) #Automatic shutdown when temperature too high
    print(sendCmd("AT+CPMVT=1,3200,4300")) #Automatic shutdown when voltage too high
    print(sendCmd("AT+CREG=0")) #Minimum power draw, minimum functionality
    #GPRS/Cellular Init
    print(sendCmd("AT+CGREG=1")) #Register with GPRS
    print(sendCmd("AT+CREG=0"))
    #GPS Init
    print(sendCmd("AT+CGPS=1")) #Start GPS session


def parseGPS(gpsinfo):
    gpsinfo = gpsinfo.split("+CGPSINFO: ")[1]
    gpsinfo = gpsinfo.split(",")

    if len(gpsinfo) != 9:
        print("CGPS Query Error 1")
    lat = gpsinfo[0]
    lat = float(lat[:2]) + round(float(lat[2:])/60, 6) #convert to dd
    lon = gpsinfo[2]
    lon = float(gpsinfo[2][:3]) + round(float(gpsinfo[2][3:])/60, 6) #convert to dd

    if gpsinfo[1] == "S":
        lat *= -1.0
    if gpsinfo[1] == "W":
        lon *= -1.0

    gpsinfo[0] = str(lat)
    gpsinfo[2] = str(lon)
    #knots to km/h
    gpsinfo[7] = str(float(gpsinfo[7])*1.852)
    tup = [gpsinfo[0], gpsinfo[2], gpsinfo[7], gpsinfo[8]] #lat,lon,speed,heading
    return tup

def test():
    # print("Connecting to Cellular Network...")
    # sendCmd("AT+CGREG=1") #Register with GPRS
    # res = sendCmd("AT+CGREG?")
    # if res[1] != "+CGREG: 1,1":
    #     print(res[1])
    #     print("Issue connecting to Celullar Network")
    # else:
    #     print("Success")

    # print("Deregistering from SMS Network...")
    # sendCmd("AT+CREG=0") #Register with GPRS
    # res = sendCmd("AT+CREG?")
    # if res[1] != "+CREG: 0,1":
    #     print(res[1])
    #     print("Issue degregistering")
    # else:
    #     print("Success")

    # print("Starting GPS session...")
    # res = sendCmd("AT+CGPS=1") #Start GPS session
    # if res[1] == "ERROR":
    #     print("GPS Session already active")
    # elif res[1] == "OK":
    #     print("GPS Session started. Please wait (up to 90 minutes depending on signal) for GPS almanac to be downloaded.")

    print("Testing for GPS position...")
    res = sendCmd("AT+CGPSINFO")
    gpsinfo = parseGPS(res[1])
    print(gpsinfo)


#AT+CREG=1 to register SMS with no location
#AT+CGREG for GPRS/cellular network reg
def main():
    test()
    #init()
  
if __name__== "__main__":
    main()