from flask import Flask, render_template, request, jsonify, make_response, redirect, url_for
from sqlite import run_sql_statement, sqlite_reset, get_table_names_and_counts
from pathlib import Path
from os import environ

DATABASE_PATH = environ.get('SQLITE_PATH') or Path(__file__).parent / 'w3s-dynamic-storage' / '.env'

app = Flask(__name__)

@app.route('/reset', methods=['POST'])
def sql_reset():
  if request.method == 'POST':
    try:
      sqlite_reset()
    except Exception as e:
      print(e)
  return redirect(url_for('sql_sandbox'))

@app.route('/', methods=['GET', 'POST'])
def sql_sandbox():
  if not Path(DATABASE_PATH).is_file():
    sqlite_reset()
  if request.method == 'GET':
    table_names = get_table_names_and_counts()
    return render_template('sql-sandbox.html', table_names=table_names['table_list'], table_names_count=len(table_names['table_list']))
  elif request.method == 'POST':
    sql_query = request.form.get('statement')
    selected_table = None
    if request.form.get('selected_table_name'):
      selected_table=request.form.get('selected_table_name')
    if request.form.get('selected_table_name_mobile_query'):
      sql_query = request.form.get('selected_table_name_mobile_query')
    sqlite_output = run_sql_statement(sql_query)
    table_names = get_table_names_and_counts()
    if 'body' in sqlite_output:
      data_count = len(sqlite_output['body'])
    else:
      data_count = 0
    return render_template('sql-sandbox.html', 
      data=sqlite_output, 
      sql_query=sql_query.strip(), 
      data_count=data_count, 
      table_names=table_names['table_list'], 
      table_names_count=len(table_names['table_list']),
      selected_table=selected_table
    )