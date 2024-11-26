import sqlite3
import csv
from os import environ, remove
from pathlib import Path

DATABASE_PATH = environ.get('SQLITE_PATH') or Path(__file__).parent / 'w3s-dynamic-storage' / '.env'
SCRIPT_PATH = Path(__file__).parent / 'w3s-dynamic-storage' / 'create-tables.sql'
CSV_PATH = Path(__file__).parent / 'w3s-dynamic-storage' / 'csv-tables'
TABLE_NAMES = ['Categories', 'Customers', 'Employees', 'OrderDetails', 'Orders', 'Products', 'Shippers', 'Suppliers']

def sqlite_reset():
  try:
    try:
      remove(DATABASE_PATH)
    except:
      pass
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()
    with open(SCRIPT_PATH, 'r') as f:
      sqlite_script = f.read()
    cur.executescript(sqlite_script)
    con.commit()
    for table_name in TABLE_NAMES:
      csv_file = table_name.lower() + '.csv'
      with open(CSV_PATH / csv_file) as f:
        data = [tuple(x) for x in csv.reader(f)][1:]
      values_string = ('?,'*len(data[0]))[0:-1]
      cur.executemany(f'INSERT INTO {table_name} VALUES({values_string})', data)
      con.commit()
    con.close()
  except Exception as e:
    con.close()
    print(e)

def run_sql_statement(statement):
  try:
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()
    res = cur.execute("PRAGMA foreign_keys = ON")
    res = cur.execute(statement)
    con.commit()
    header = []
    if res.description is not None:
      header = [x[0] for x in res.description]
    body = [list(x) for x in res.fetchall()]
    con.close()
    return { 'header': header, 'body': body }
  except Exception as e:
    con.close()
    print(e)
    return { 'error': e }

def get_table_names_and_counts():
  try:
    con = sqlite3.connect(DATABASE_PATH)
    cur = con.cursor()
    cur.execute('ANALYZE main;')
    res = cur.execute('SELECT tbl, stat FROM sqlite_stat1 ORDER BY tbl ASC;')
    table_names_and_counts = [list(x) for x in res.fetchall()]
    con.close()
    return { 'table_list': table_names_and_counts }
  except Exception as e:
    con.close()
    print(e)
    return { 'error': e }