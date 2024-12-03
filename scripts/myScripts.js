let relationshipType = 1;
let maintainFamilyFirstName = null;
let maintainFamilyLastName = null;
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
    return familyArray['body'];
}
function getStandardDbResponse(response){
    standardArray = JSON.parse(response);
    console.log([standardArray]);
    if(standardArray.hasOwnProperty("messages")){
        displayMessages(standardArray["messages"]);
    }
    return standardArray['body'];
}
function clearMessageSpace(){
    document.getElementById("messageSpace").innerHTML = "";
    document.getElementById("clearMessageSpaceButton").hidden = true;
}
function displayMessages(messageArray){
    let messageCss = [];
    messageCss[1] = 'class="messageInfo"';
    messageCss[2] = 'class="messageWarning"';
    messageCss[3] = 'class="messageError"';
    let displayHtml = Object.keys(messageArray)
        .map(k =>"<span " + messageCss[messageArray[k].type] + ">" + messageArray[k].message + "</span>")
        .join('<br>');
    let element = document.getElementById("messageSpace");
    if( element.innerHTML.length && displayHtml.length){
        element.innerHTML = element.innerHTML + '<br>' + displayHtml;
    } else if(displayHtml.length) element.innerHTML = displayHtml;
    document.getElementById("clearMessageSpaceButton").hidden = element.innerHTML.length?false:true;
}
async function callAjax(type, values = {}){
    let myUrl = '/backend/ajax.php';
    let responseHandler = getStandardDbResponse;
    values.action = type;
    let queryString = Object.keys(values)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(values[k]))
        .join('&');
    console.log(['got type:' + type,queryString]);
    switch(type){
        case 'foo':
            myUrl += '?' + queryString;
            responseHandler = defaultDisplay;
            break;
        case 'bar':
            myUrl += '?' + queryString;
            responseHandler = defaultDisplay;
            break;
        case 'addFamilyMember':
            myUrl += '?' + queryString;
            break;
        case 'addFamilyRelationship':
            myUrl += '?' + queryString;
            break;
        case 'deleteFamilyMember':
            myUrl += '?' + queryString;
            break;
        case 'deleteFamilyRelationship':
            myUrl += '?' + queryString;
            break;
        case 'getFamilyMembers':
            myUrl += '?' + queryString;
            break;
        case 'getFamilyRelationshipTypes':
            myUrl += '?' + queryString;
            break;
        case 'getAllRelationships':
            myUrl += '?' + queryString;
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
    maintainFamilyLoadFamilyData();
    maintainFamilyLoadFamilyRelationships();
    let relationArray = await callAjax('getFamilyRelationshipTypes');
    let relationSelect = document.getElementById('relationType');
    let relationString = ""
    relationArray.forEach((element, key) => {
        relationString +="<label><input type='radio' name='relationship' value='"+element.id
            + "' id='"+element.type + "'"
            + " onChange='selectRelationshipType(this)'";
        if(element.id == 1) relationString +=" checked";
        relationString += ">" + element.type + "</label>";
    });
    relationSelect.innerHTML = relationString;
}
async function maintainFamilyLoadFamilyData(){
    let familyArray = await callAjax('getFamilyMembers');
    maintainFamilyCreateFamilyMemberTable(familyArray);
    let parentSelect = document.getElementById("parentSelect");
    let childSelect = document.getElementById("childSelect");
    parentSelect.length = childSelect.length = 1;
    familyArray.forEach((element, key) => {
        parentSelect[parentSelect.options.length] = new Option(element.firstname+' '+element.lastname, JSON.stringify(element));
        childSelect[childSelect.options.length] = new Option(element.firstname+' '+element.lastname, JSON.stringify(element));
    });
}
async function maintainFamilyLoadFamilyRelationships(){
    let familyArray = await callAjax('getAllRelationships');
    let text = "<table style='width:500;'>";
    text += "<thead><th>Delete</th><th>Name</th><th>Relationship</th><th>Name</th></thead>"

    for (let ii = 0; ii < familyArray.length; ii++) {
        text += '<tr>';
        let member = familyArray[ii];
        text += "<td class='tdCenter'><input type='checkbox' name='familyRelationshipCheckbox' id='" 
            + generateCheckBoxId("fmcheck",ii) +"' value=" + member.id + "></td>";
            text += "<td>" + member.parentName + "</td>";
            text += "<td>" + member.type + "</td>";
            text += "<td>" + member.childName + "</td>";
            text += '</tr>';
    }
    text += "</table>";
    text += "<br><button id='fetch_button' onclick='maintainFamilyDeleteRelationship()'>Delete Selected</button>"
    document.getElementById("showFamilyRelations").innerHTML = text;
}
function maintainFamilyCreateFamilyMemberTable(familyArray){
    let text = "<table style='width:225;'>";
    text += "<thead><th>Delete</th><th>Name</th></thead>"

    for (let ii = 0; ii < familyArray.length; ii++) {
        text += '<tr>';
        let member = familyArray[ii];
        text += "<td class='tdCenter'><input type='checkbox' name='familyMemberCheckbox' id='" 
            + generateCheckBoxId("relcheck",ii) + "' value=" + member.id + "></td>";
        text += "<td>" + member.fullName + "</td>";
        text += '</tr>';
    }
    text += "</table>";
    text += "<br><button id='fetch_button' onclick='maintainFamilyDeleteFamilyMember()'>Delete Selected</button>"
    document.getElementById("showFamilyMembers").innerHTML = text;
}
async function maintainFamilyDeleteFamilyMember(){
    boxesArray = document.getElementsByName("familyMemberCheckbox");
    values = {};
    idsArray = getCheckedIds(boxesArray);
    values.ids = JSON.stringify(idsArray);
    deleteResponse = callAjax('deleteFamilyMember', values);
}
async function maintainFamilyDeleteRelationship(){
    boxesArray = document.getElementsByName("familyRelationshipCheckbox");
    values = {};
    idsArray = getCheckedIds(boxesArray);
    values.ids = JSON.stringify(idsArray);
    deleteResponse = callAjax('deleteFamilyRelationship', values);
}
function getCheckedIds(myArray){
    return myArray.filter((element)=> element.checked).map((element) => element.value);
}
function generateCheckBoxId(prefix,ii){
    return prefix+ii;
}
function maintainFamilyParentSelected(){
    let parent = document.getElementById("parentSelect");
    let child = document.getElementById("childSelect");
    let button = document.getElementById("setRelationship");
    child.disabled = parent.value !== -1?false:true;
    if(child.disabled){
        child.options[0].selected = true;
        button.disabled = true;
    }
    else{
        for(let ii = 0;ii<child.options.length;ii++){
            child.options[ii].disabled = child.options[ii].value == parent.value?true:false;
        }
    }
    console.log(["parentSelected",parent.value,"childDisabled"+child.disabled]);
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
    values.parent = getValueFromJson(parent.value,'id');
    values.child = getValueFromJson(child.value,'id');
    values.type = relationshipType;
    let insertResponse = await callAjax('addFamilyRelationship', values);
    maintainFamilyLoadFamilyRelationships()
}
async function maintainFamilyAddFamilyMember(){
    let values = {};
    values.firstName = maintainFamilyFirstName;
    values.lastName = maintainFamilyLastName;
    let insertResponse = await callAjax('addFamilyMember',values);
/* 
after creation, reload family member list and null out the name fields
*/
    maintainFamilyLoadFamilyData();
    clearFamilyNameInputs();
}
function maintainFamilyNameChanged(member){
    if(member.id == 'firstName') maintainFamilyFirstName = member.value;
    if(member.id == 'lastName') maintainFamilyLastName = member.value;
    if(maintainFamilyFirstName!=null && maintainFamilyLastName != null){
        document.getElementById("addFamilyMember").disabled = false;
    } else document.getElementById("addFamilyMember").disabled = true;
}
function clearFamilyNameInputs(){
    maintainFamilyFirstName = maintainFamilyLastName = null;
    document.getElementById('firstName').value = null;
    document.getElementById('lastName').value = null;
    document.getElementById("addFamilyMember").disabled = true;
}
function getValueFromJson(json,choice){
    let tempArray = JSON.parse(json);
    return tempArray[choice];
}
function selectRelationshipType(selection){
    relationshipType = selection.value;
    parent = document.getElementById("parentLabel");
    child = document.getElementById("childLabel");
    if(relationshipType == 1){
        parent.text = "Parent";
        child.text = "Child";
    }
    else{
        parent.text = "Spouse A";
        child.text = "Spouse B";
    }
}
