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
    console.log([standardArray]);
    return standardArray['body'];
}
async function callAjax(type, values = {}){
    let myUrl = '/backend/ajax.php';
    let responseHandler = defaultDisplay;
    values.action = type;
    let queryString = Object.keys(values)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(values[k]))
        .join('&');
    console.log(['got type:' + type,queryString]);
    switch(type){
        case 'foo':
            myUrl += '?' + queryString;
            //myUrl += '?action=' + type;
            break;
        case 'bar':
            myUrl += '?action=' + type;
            break;
        case 'getFamilyMembers':
            myUrl += '?action=' + type;
            responseHandler = getStandardDbResponse;
            break;
        case 'getFamilyRelationshipTypes':
            myUrl += '?action=' + type;
            responseHandler = getStandardDbResponse;
            break;
        case 'addFamilyRelationship':
            myUrl += '?' + queryString;
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
    let relationSelect = document.getElementById('relationType');
    let relationString = ""
    relationArray.forEach((element, key) => {
        relationString += "<label>"+element.type
            +"<input type='radio' name='relationship' value='"+element.id
            + " id='"+element.type;
        if(element.id == 1) relationString +=" selected";
        relationString += "></label>";
    });
    relationSelect.innerHTML = relationString;
    console.log(['relation radio',relationString]);
}
function maintainFamilyParentSelected(){
    let parent = document.getElementById("parentSelect");
    let child = document.getElementById("childSelect");
    child.disabled = parent.value !== -1?false:true;
    console.log(["parentSelected",parent.value,parent.text,"childDisabled"+child.disabled]);
}
function maintainFamilyChildSelected(){
    let child = document.getElementById("childSelect");
    let button = document.getElementById("setRelationship");
    button.disabled = child.value !== -1?false:true;
}
async function maintainFamilySetRelationShip(){
    let parent = document.getElementById("parentSelect");
    let child = document.getElementById("childSelect");
    let types = document.getElementsByName("relationship");

    let values = {};
    values.parent = parent.value;
    values.child = child.value;
    for (var i = 0, length = types.length; i < length; i++) {
        if (types[i].checked) {
          values.type = types.value;
          break;
        }
    }
    let insertRespone = await callAjax('addFamilyRelationship', values);
    console.log(['return from insert',insertRespone]);
}
