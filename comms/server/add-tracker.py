#!/usr/bin/env python3
import os
import bcrypt
import MySQLdb
import getpass
from base64 import b64encode
from configparser import ConfigParser

print("This menu will add a new device to track.")
username = input("Enter in the username to login and view the current location of this vehicle. Omit spaces:\n")
email = input("Enter in the email to be associated with this account:\n")
password = getpass.getpass('Enter in a password:\n')

salt = os.urandom(32)
hash_password = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())

aes_key = b64encode(os.urandom(32)).decode('utf-8')

#Connect to local database
parser = ConfigParser()
parser.read('./server.ini')
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

query = "INSERT INTO accounts(username, password, email, aes_key) VALUES (%s,%s,%s,%s);"

query_tuple = (username, hash_password, email, aes_key)

cur.execute(query, query_tuple)
conn.commit()
query = "SELECT id FROM accounts WHERE username=%s;"
cur.execute(query, [username])
records = cur.fetchall()
print(records[0][0])
print("** Added user to database **\n")

print("IMPORTANT: The following information is needed to complete the tracking.")
print("The ID of this tracker is:", records[0][0])
print("The AES256 key (shown as Base64) for this account is the following:")
print(aes_key)
cur.close()
conn.close()
