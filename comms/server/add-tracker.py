#!/usr/bin/env python3
import os
import bcrypt
import MySQLdb
import getpass

print("This menu will add a new device to track.")
username = input("Enter in the username to login and view the current location of this vehicle. Omit spaces:\n")
email = input("Enter in the email to be associated with this account:\n")
password = getpass.getpass('Enter in a password:\n')

salt = os.urandom(32)
hash_password = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())

try:
    #Connect to local database
    conn = MySQLdb.connect(host="localhost",  # your host 
                         user="root",       # username
                         passwd="",     # password
                         db="nisputer")   # name of the database
    #Create a Cursor object to execute queries.
    cur = conn.cursor()

    query = "INSERT INTO accounts(username, password, email) VALUES (%s,%s,%s);"
    query_tuple = (username, hash_password, email)

    cur.execute(query, query_tuple)
    conn.commit()

except:
    print("Failed to insert into database")

cur.close()
conn.close()

print("Finished adding user to database.")