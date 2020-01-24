#!/usr/bin/env python3
#Nisputer
#server.py 
#B Morgan
#For receiving GPS information from the raspberry pi installed in the car.

"""
Structure: id,enc(LatH,LatL,LonH,LonL,ign, hash(of previous including id))
id = 12bit
LatH (-xx.blah) = 8 bits
LatL (blah.xxxxxx) = 20 bits

LonH (-xxx.blah) = 9 bits
LonL (blah.xxxxxx) = 20 bits

ign = 1 bit

Total = 56 bits = 7 bytes
"""
import os
import datetime
import socket
import json
import MySQLdb
import hashlib
import base64
from Crypto.Cipher import AES

from urllib.parse import urlencode
from urllib.request import Request, urlopen

from configparser import ConfigParser

BLOCK_SIZE = 16
pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)
unpad = lambda s: s[:-ord(s[len(s) - 1:])]

def dbconnect():
    parser = ConfigParser()
    parser.read('../server.ini')
    ip = parser.get('mysql', 'ip')
    port = parser.get('mysql', 'port')
    user = parser.get('mysql', 'user')
    pw = parser.get('mysql', 'password')
    conn = MySQLdb.connect(host=ip,  # your host
                             port=int(port),        #port
                             user=user,       # username
                             passwd=pw,     # password
                             db="nisputer")   # name of the database
    #Create a Cursor object to execute queries.
    cur = conn.cursor()
    return cur, conn

def dbdisconnect(cur, conn):
	cur.close()
	conn.close()

def print_log(text):
    if os.path.getsize("gps_log.txt") < 1073741824/2: #if log bigger than 500gb
        log_file = open("gps_log.txt","a")
    else:
        log_file = open("gps_log.txt", "w")
    t = datetime.datetime.now()
    text = str(t) + " " + text + "\n"
    log_file.write(text)
    log_file.close()

def get_aes_key(track_id):
    cur, conn = dbconnect()
    query = "SELECT aes_key FROM accounts WHERE id=%s;"
    cur.execute(query, [track_id])
    records = cur.fetchall()
    if records:
        return records[0][0]

def decrypt(enc, password):
    private_key = hashlib.sha256(password.encode("utf-8")).digest()
    enc = base64.b64decode(enc)
    iv = enc[:16]
    cipher = AES.new(private_key, AES.MODE_CBC, iv)
    return unpad(cipher.decrypt(enc[16:]))

def  deconstruct_ciphertext(cipher):
    parts = base64.b64decode(cipher)
    parts = parts.decode("utf-8").split(',')
    password = get_aes_key(parts[0])
    message = decrypt(str.encode(parts[1]), str(password))
    try:
        #Convert JSON back into raw tuple
        raw_tuple_hash = json.loads(message)

        if raw_tuple_hash[0] == parts[0]:
            #Split the raw tuple up 
            raw_tuple = raw_tuple_hash[:6]
            #Separate hash
            msg_hash = raw_tuple_hash[6]
            #Hash the tuple
            h = hashlib.sha256(''.join(raw_tuple).encode("utf-8")).digest()
            h = base64.b64encode(h).decode("utf-8")
            #compare the hashed tuple and the recieved hash
            if h == msg_hash:
                text = parts[0] + " " + raw_tuple_hash[0] + " Success"
                print_log(text)
                return raw_tuple
            else:
                text = parts[0] + " " + raw_tuple_hash[0] + " Error: Hash different"
                print_log(text)
                return False
        else:
            text = parts[0] + " " + raw_tuple_hash[0] + " Error: Different ID"
            print_log(text)
            return False
    except:
        text = parts[0] + " Error: Invalid JSON"
        print_log(text)
        return False

def init_server(port):    
    UDP_IP_ADDRESS = ""
    UDP_PORT_NO = int(port)
    serverSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    serverSock.bind((UDP_IP_ADDRESS, UDP_PORT_NO))
    return serverSock

def post_data_to_server(data, port):
    #The web server is running locally, the this python script which receives the data just sends it decrypted over post as this is easiest way.
    url = 'http://127.0.0.1:'+port+'/setCoords' # Set destination URL here
    track_id = data[0]
    lat = data[1]+"."+data[2]
    lon = data[3]+"."+data[4]
    ign = data[5]

    post_fields = {
        'id': track_id,
        'lat': lat,
        'lon': lon,
        'ign': ign
    }

    request = Request(url, urlencode(post_fields).encode())
    json = urlopen(request).read().decode()

def main():
    parser = ConfigParser()
    parser.read('../server.ini')
    webPort = parser.get('servers', 'webPort')
    gpsPort = parser.get('servers', 'gpsPort')
    serverSock = init_server(gpsPort)
    while True:
        data, addr = serverSock.recvfrom(2048)
        raw_tuple = deconstruct_ciphertext(data)
        if(raw_tuple):
            try:
                post_data_to_server(raw_tuple, webPort)
            except:
                print_log("Error: Check web server status, could not send data")
  
if __name__== "__main__":
    main()