 async function callBackend(){
    myObject = await fetch("../app.py");
    myText = await myObject.text();
    document.getElementById("test_space").innerText = myText;
 }