function callBackend(){
    document.getElementById("test_space").innerText = "did this work";
}
async function fetchFile(){
    myObject = await fetch("files/random.txt");
    myText = await myObject.text();
    document.getElementById("fetch_space").innerText = myText;
}
async function callAjax(type){
    let myUrl = 'backend/ajax.php';
    console.log('get type:' + type);
    switch(type){
        case 'foo':
            myUrl += '?action=' + type;
            break;
        case 'bar':
            myUrl += '?action=' + type;
            break;
        case 'getFamilyMembers':
            myUrl += '?action=' + type;
            break;
        default:
            console.log("in default with type="+type);
            response = "hit the default";
            document.getElementById("fetch_space").innerText = response;
            return;
        }
    myObject = await fetch('backend/ajax.php');
    response = await myObject.text();
   
    document.getElementById("fetch_space").innerText = response;
}