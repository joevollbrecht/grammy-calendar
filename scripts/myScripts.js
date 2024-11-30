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
    console.log("familyMemberSelected, selected:"+selection.value);
}
function formatFamilyMembers(response){
    familyArray = JSON.parse(response);
    //console.log([response,familyArray]);
    if(storedFamilyMembers === null){
        console.log("stored familyMembers is null, setting");
        storedFamilyMembers = familyArray['body'];
    }
    else{
        console.log("stored familyMembers already set, length:"+storedFamilyMembers.length);
    }
    var familySelect = document.getElementById("familyMembers");
    familySelect.length = 1;
    //familyArray['body'].forEach((element, key) => {
    storedFamilyMembers.forEach((element, key) => {
            familySelect[familySelect.options.length] = new Option(element.firstname+' '+element.lastname, JSON.stringify(element));
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
let storedFamilyMembers = null;