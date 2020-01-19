#!/usr/bin/env python3
#Nisputer
#cellular.py 
#B Morgan
#Transmits GPS information over Australian celullar network to the server.

"""
id = 12bit
LatH (-xx.blah) = 8 bits
LatL (blah.xxxxxxx) = 17 bits

LonH (-xxx.blah) = 9 bits
LonL (blah.xxxxxxx) = 17 bits

ign = 1 bit

Total = 56 bits = 7 bytes
"""

# from Crypto.Cipher import AES
# obj = AES.new('This is a key123', AES.MODE_CBC, 'This is an IV456')
# message = "The answer is no"
# ciphertext = obj.encrypt(message)
# print(ciphertext)