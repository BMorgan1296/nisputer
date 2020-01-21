#!/usr/bin/env python3
import os
import bcrypt
import MySQLdb
import getpass
from configparser import ConfigParser

print("This menu will remove a tracker")
username = input("Enter in the username to delete:\n")
password = getpass.getpass('Enter password:\n')

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

query = "SELECT username, password FROM accounts WHERE username='%s';" % (username)

#Get the results
cur.execute(query)
records = cur.fetchall()
#check hashes
if bcrypt.hashpw(password.encode('utf-8'), str.encode(records[0][1])) == str.encode(records[0][1]):
    query = "DELETE FROM accounts WHERE username='%s';" % (username)
    cur.execute(query)
    conn.commit()
else:
    print("Password does not match.")

cur.close()
conn.close()

print("Finished removing user from database.")