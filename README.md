# 👋 Hello developer!

This SQL Sandbox template is designed to showcase the capabilities of this tool. You can easily personalize it to meet your requirements, whether you want to use it as a frontend database or purely a backend solution.

This project serves as an example of what can be achieved. It is not a fully functional product. Feel free to use the source code and ideas as a starting point for your own projects.

This is one of the many templates available from W3Schools. Check our [tutorials for frontend development](https://www.w3schools.com/where_to_start.asp) to learn the basics of [HTML](https://www.w3schools.com/html), [CSS](https://www.w3schools.com/css) and [JavaScript](https://www.w3schools.com/js). 🦄
Also check [Python](https://www.w3schools.com/python/) tutorial to grasp the backend of this template.


## Recommended knowledge:

To be able to fully understand and modify this template to your needs, there are several things you should know (or learn):

- [HTML](https://www.w3schools.com/html)
- [CSS](https://www.w3schools.com/css)
- [JavaScript](https://www.w3schools.com/js)
- [SQLite](https://www.sqlite.org/docs.html)
- [Python](https://www.w3schools.com/python)
- [Flask](https://flask.palletsprojects.com/en/2.2.x/)

## Warning - environment variables

Do not change SQLITE_PATH, as these are generated. If they are changed the space may not behave as predicted.
**Remember to switch DEBUG to false when going to production**

## Content
- RESTful API routes linked with vanilla SQLite database functions.
- SQL Sandbox editor where you can run SQL commands and see the results below.

## 🔨 What's next?

Customize this template to make it your own.  
Remember to make your layout responsive - if you want your site to look good on smaller screens like mobile.  
Implement more functionalities like updating existing data inside the database, or display the information in a way that suits you. 

⚡️ **Tip:** [Set up Google Analytics](https://www.w3schools.com/howto/howto_google_analytics.asp) to get valuable insights about your space and visitors. 

## 🎨 Where to find everything

This template is made by using several technologies.
Below are explanations about where to find specific code.

### HTML

HTML files are stored in a folder called `templates`.
In `templates/index.html` you can add your external links and scripts as well as general code like a top bar or footer that will be used on every page.

### CSS, images and JavaScript

CSS, images and JavaScript files can be found in `static/`.

### API

The requests are handled by route functions in `routes.py`.

### Database

Dynamic spaces can use [SQLite](https://www.sqlite.org/docs.html) database.  
The database file is called `database.db`. It is placed inside the `w3s-dynamic-storage` folder.  
SQLite connection path to the database is `w3s-dynamic-storage/database.db` which you can use to connect to the SQLite database programmatically.   
For this template, the database connection path can also be found in the environment.  
Queries for the database can be found in the `sqlite.py` file.

---  
**Do not change the `w3s-dynamic-storage` folder name or `database.db` file name!**  
**By changing the `w3s-dynamic-storage` folder name or `database.db` file name, you risk the space not working properly.**

### Core files

You can find:
  - API routes in `routes.py`
  - SQL functions in `sqlite.py`
  - style of the app in `static/style.css`

### There are CodeMirror files in the static folder - What is CodeMirror?

CodeMirror is utilized for syntax highlighting of SQL code within the text input field in the user interface.

Feel free to explore the CodeMirror settings in `templates/index.html` if you wish to modify the format of the text field.

Read more about [CodeMirror](https://codemirror.net/).

## 🔨 Please note
For now files created/uploaded or edited from within the terminal view will not be backed up or synced. 

## ⛑ Need support?
[Join our Discord community](https://discord.gg/6Z7UaRbUQM) and ask questions in the **#spaces-general** channel to get your space on the next level.  
[Send us a ticket](https://support.w3schools.com/hc/en-gb) if you have any technical issues with Spaces.

Happy learning!