#!/usr/bin/env python3
#Nisputer
#client.py 
#B Morgan
#Driver program for receiving GPS information from satellites, then transmitting this over Australian celullar network to the server.

import time
import socket
import json
import hashlib
import base64
from Crypto.Cipher import AES
from Crypto import Random

from configparser import ConfigParser

#Thanks to https://www.quickprogrammingtips.com/python/aes-256-encryption-and-decryption-in-python.html
BLOCK_SIZE = 16
pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)

def encrypt(raw, password):
    private_key = hashlib.sha256(password.encode("utf-8")).digest()
    raw = pad(raw)
    iv = Random.new().read(AES.block_size)
    cipher = AES.new(private_key, AES.MODE_CBC, iv)
    return base64.b64encode(iv + cipher.encrypt(raw.encode("utf-8")))

def construct_ciphertext(track_id, lat, lon, spd, hdg, ign, aes_key):
    raw_tuple = (track_id, lat,lon,spd,hdg,ign)                         #convert to tuple
    h = hashlib.sha256(''.join(raw_tuple).encode("utf-8")).digest()         #hash the tuple
    h = base64.b64encode(h).decode("utf-8")                                 #Encode in base64
    json_tuple = json.dumps((track_id, lat,lon,spd,hdg,ign,h))          #add the hash to the end of the info
    c = encrypt(json_tuple, aes_key)                                        #encrypt the info+hash
    cipher = track_id+","+c.decode("utf-8") #The ID is kept in plaintext so that the server knows which private key to look for.
    return cipher.encode()

def main():
    parser = ConfigParser()
    parser.read('./client.ini')
    track_id = parser.get('data_transfer', 'track_id')
    domain = parser.get('data_transfer', 'domain')
    local_ip = parser.get('data_transfer', 'local_ip')
    port = parser.get('data_transfer', 'port')
    aes_key = parser.get('data_transfer', 'aes_key')
    #this stuff needs to be queried from the GPS device, and then sent over either wifi or cellular depending on current connection.
    ign = "0"
    lat = "-41.895600"
    lon = "153.637571"
    spd = "59.5"
    hdg = "364.5"

    cipher = construct_ciphertext(track_id, lat, lon, spd, hdg, ign, aes_key)
######################################### Will need this socket info, aes_key and id stuff to be in a ini file or something at some point, so that the user can set it up themselves.#############################################
    UDP_IP_ADDRESS = local_ip
    UDP_PORT_NO = int(port)
    clientSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    while 1:
        time.sleep(3)
        clientSock.sendto(cipher, (UDP_IP_ADDRESS, UDP_PORT_NO))
        print(cipher)

    #Get data, create raw to be encrypted, encrypt, send off. Repeat.
if __name__== "__main__":
  main()