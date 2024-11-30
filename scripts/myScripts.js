function callBackend(){
    document.getElementById("test_space").innerText = "did this work";
}
async function fetchFile(){
    myObject = await fetch("files/random.txt");
    myText = await myObject.text();
    document.getElementById("message_space").innerText = myText;
}
function defaultDisplay(response){
    document.getElementById("message_space").innerText = response;
}
function familyMemberSelected(selection){
    console.log("familyMemberSelected, selected:"+selection.value);
}
function getFamilyMembers(response){
    familyArray = JSON.parse(response);
    console.log([familyArray]);
    /*
    var familySelect = document.getElementById("familyMembers");
    familySelect.length = 1;
    familyArray['body'].forEach((element, key) => {
            familySelect[familySelect.options.length] = new Option(element.firstname+' '+element.lastname, JSON.stringify(element));
    });
    */
    return familyArray['body'];
}
function getStandardDbResponse(response){
    standardArray = JSON.parse(response);
    console.log([familyArray]);
    return standardArray['body'];
}
async function callAjax(type){
    let myUrl = '/backend/ajax.php';
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
                responseHandler = getFamilyMembers;
                break;
            case 'getFamilyRelationshipTypes':
                myUrl += '?action=' + type;
                responseHandler = getStandardDbResponse;
                break;
        default:
            console.log("in default with type="+type);
            response = "hit the default";
            document.getElementById("message_space").innerText = response;
            return;
        }
    myObject = await fetch(myUrl);
    response = await myObject.text();
    return responseHandler(response);
}
async function maintainFamilyInit(){
    let familyArray = await callAjax('getFamilyMembers');
    let parentSelect = document.getElementById("parentSelect");
    let childSelect = document.getElementById("childSelect");
    parentSelect.length = childSelect.length = 1;
    familyArray.forEach((element, key) => {
        parentSelect[parentSelect.options.length] = new Option(element.firstname+' '+element.lastname, JSON.stringify(element));
        childSelect[childSelect.options.length] = new Option(element.firstname+' '+element.lastname, JSON.stringify(element));
    });
    let relationArray = await callAjax('getFamilyRelationshipTypes');
    let relationSelect = document.getElementById('maintain_relationship');
    let relationString = ""
    relationArray.forEach((element, key) => {

        relationString += "<label><input type='radio' name='relationship' value='"+element.id
            + " id='"+element.type+">";
    });
    relationSelect.innerHTML = relationString;
    console.log(['relation radio',relationString]);
}
function maintainFamilyParentSelected(){
    let parent = document.getElementById("parentSelect");
    let child = document.getElementById("childSelect");
    child.disabled = parent.value !== -1?false:true;
    console.log(["parentSelected",parent.value,parent.text]);
}
function maintainFamilyChildSelected(){
    let parent = document.getElementById("parentSelect");
    let child = document.getElementById("childSelect");
    child.disabled = parent.value !== -1?false:true;
}
