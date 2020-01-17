#!/usr/bin/env python3
import os
import bcrypt
import MySQLdb
import getpass

print("This menu will remove a tracker")
username = input("Enter in the username to delete:\n")
password = getpass.getpass('Enter password:\n')

try:
    #Connect to local database
    conn = MySQLdb.connect(host="localhost",  # your host 
                         user="root",       # username
                         passwd="",     # password
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
except:
    print("Failed to query database. Check if user exists and try again.")

cur.close()
conn.close()

print("Finished removing user from database.")