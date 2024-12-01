let relationshipType = 1;
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
function displayMessages(messageArray){
    let messageCss = [];
    messageCss[1] = 'class="messageInfo"';
    messageCss[2] = 'class="messageWarning"';
    messageCss[3] = 'class="messageError"';
    displayHtml = Object.keys(messageArray)
        .map(k =>"<span " + messageCss[messageArray[k].type] + ">" + messageArray[k].message + "</span>")
        .join('<br>');
    document.getElementById("messageSpace").innerHTML = displayHtml;
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
            break;
        case 'bar':
            myUrl += '?' + queryString;
            break;
        case 'getFamilyMembers':
            myUrl += '?' + queryString;
            responseHandler = getStandardDbResponse;
            break;
        case 'getFamilyRelationshipTypes':
            myUrl += '?' + queryString;
            responseHandler = getStandardDbResponse;
            break;
        case 'addFamilyRelationship':
            myUrl += '?' + queryString;
            responseHandler = getStandardDbResponse;
            break;
        case 'getAllRelationships':
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
    let text = "<table style='width:225;'>";
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
    text += "<br><button id='fetch_button' onclick='maintainFamilyMemberDeleteFamily()'>Delete Selected</button>"
    document.getElementById("showFamilyMembers").innerHTML = text;
}
async function maintainFamilyMemberDeleteFamily(){
    alert(maintainFamilyMemberDeleteFamily.name +" is under construction");
}
async function maintainFamilyMemberDeleteRelationship(){
    alert(maintainFamilyMemberDeleteRelationship.name +" is under construction");
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
    /*for (var i = 0, length = types.length; i < length; i++) {
        if (types[i].checked) {
            values.type = types.value;
            break;
        }
    }*/
    let insertResponse = await callAjax('addFamilyRelationship', values);
    console.log(['return from insert',insertResponse]);
}
function getValueFromJson(json,choice){
    let tempArray = JSON.parse(json);
    return tempArray[choice];
}
function selectRelationshipType(selection){
    relationshipType = selection.value;
}
