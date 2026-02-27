import sqlite3

connection = sqlite3.connect("src/database/test.db")
cursor = connection.cursor()

cursor.execute("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, text TEXT, timestamp TEXT)")
cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT)")
connection.commit()
connection.close()