#!/usr/bin/env python3
#Nisputer
#client.py 
#B Morgan
#For receiving GPS information from satellites, then transmitting this over Australian celullar network to the server.

import socket
import json
import hashlib
import base64
from Crypto.Cipher import AES
from Crypto import Random

#Thanks to https://www.quickprogrammingtips.com/python/aes-256-encryption-and-decryption-in-python.html
BLOCK_SIZE = 16
pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)
unpad = lambda s: s[:-ord(s[len(s) - 1:])]

def encrypt(raw, password):
    private_key = hashlib.sha256(password.encode("utf-8")).digest()
    raw = pad(raw)
    iv = Random.new().read(AES.block_size)
    cipher = AES.new(private_key, AES.MODE_CBC, iv)
    return base64.b64encode(iv + cipher.encrypt(raw))

def construct_ciphertext(track_id, LatH, LatL, LonH, LonL, ign):
    #convert to tuple
    raw_tuple = (track_id, LatH,LatL,LonH,LonL,ign)
    #hash the tuple
    h = hashlib.sha256(''.join(raw_tuple).encode("utf-8")).digest()
    #Encode in base64
    h = base64.b64encode(h).decode("utf-8")
    #add the hash to the end of the info
    json_tuple = json.dumps((track_id, LatH,LatL,LonH,LonL,ign,h))
    #encrypt the info+hash
    c = encrypt(json_tuple, "toBsEJjowHyVQXpsWoAj5CRHHFVukWF0=")
    #convert track_id to base64, and this is now the start of the ciphertext. The ID is kept in plaintext so that the server knows which private key to look for.
    cipher = base64.b64encode(str.encode(track_id+","+c.decode("utf-8")))
    #append the ciphertext so that it comes after.
    return cipher


def main():
    track_id = "2"
    ign = "1"
    LatH = "-34"
    LatL = "795690"
    LonH = "138"
    LonL = "669570"

    cipher = construct_ciphertext(track_id, LatH, LatL, LonH, LonL, ign)

    UDP_IP_ADDRESS = "127.0.0.1"
    UDP_PORT_NO = 3333
    clientSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    while 1:
        clientSock.sendto(cipher, (UDP_IP_ADDRESS, UDP_PORT_NO))

    #Get data, create raw to be encrypted, encrypt, send off. Repeat.
if __name__== "__main__":
  main()