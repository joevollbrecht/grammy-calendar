function callBackend(){
    document.getElementById("test_space").innerText = "did this work";
}
async function fetchFile(){
    myObject = await fetch("files/random.txt");
    myText = await myObject.text();
    document.getElementById("fetch_space").innerText = myText;
}
function defaultDisplay(response){
    document.getElementById("fetch_space").innerText = response;
}
function familyMemberSelected(selection){
    console.log("familyMemberSelected, selected:"+selection);
}
function formatFamilyMembers(response){
    familyArray = JSON.parse(response);
    console.log([response,familyArray]);
    var familySelect = document.getElementById("familyMembers");
    familySelect.length = 1;
    familyArray.forEach((element, key) => {
        familySelect[familySelect.options.length] = new Option(element.firstName+' '+element.lastName, element.id);
      });
}
async function callAjax(type){
    let myUrl = 'backend/ajax.php';
    let responseHandler = defaultDisplay;
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
            responseHandler = formatFamilyMembers;
            break;
        default:
            console.log("in default with type="+type);
            response = "hit the default";
            document.getElementById("fetch_space").innerText = response;
            return;
        }
    myObject = await fetch(myUrl);
    response = await myObject.text();
    responseHandler(response);
}