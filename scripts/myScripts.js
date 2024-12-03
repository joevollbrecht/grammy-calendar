let relationshipType = 1;
let maintainFamilyFirstName = null;
let maintainFamilyLastName = null;
let maintainEventEventName = null;
async function callAjax(type, values = {}){
    let myUrl = '/backend/ajax.php';
    let responseHandler = getStandardDbResponse;
    values.action = type;
    let queryString = Object.keys(values)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(values[k]))
        .join('&');
    console.log(['got type:' + type,queryString]);
    switch(type){
        case 'addEvent':
            myUrl += '?' + queryString;
            break;
        case 'addFamilyMember':
            myUrl += '?' + queryString;
            break;
        case 'addFamilyRelationship':
            myUrl += '?' + queryString;
            break;
        case 'addInvites':
            myUrl += '?' + queryString;
            break;
        case 'deleteFamilyMember':
            myUrl += '?' + queryString;
            break;
        case 'deleteFamilyRelationship':
            myUrl += '?' + queryString;
            break;
        case 'getAllEventRelationships':
            myUrl += '?' + queryString;
            break;
        case 'getAllRelationships':
            myUrl += '?' + queryString;
            break;
        case 'getEvents':
            myUrl += '?' + queryString;
            break;
        case 'getFamilyMembers':
            myUrl += '?' + queryString;
            break;
        case 'getFamilyRelationshipTypes':
            myUrl += '?' + queryString;
            break;
        default:
            console.log("in default with type="+type);
            response = "hit the default with type="+type;
            document.getElementById("message_space").innerText = response;
            return;
        }
    myObject = await fetch(myUrl);
    response = await myObject.text();
    return responseHandler(response);
}
function clearMessageSpace(){
    document.getElementById("messageSpace").innerHTML = "";
    document.getElementById("clearMessageSpaceButton").hidden = true;
}
function defaultDisplay(response){
    document.getElementById("message_space").innerText = response;
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
function getValueFromJson(json,choice){
    let tempArray = JSON.parse(json);
    return tempArray[choice];
}

function populateFamilySelecter(familyArray,elementName){
    let select = document.getElementById(elementName);
    select.length = 1;
    familyArray.forEach((element, key) => {
        select[select.options.length] = new Option(element.fullName, JSON.stringify(element));
    });
}
async function maintainEventsInit(){
    maintainEventLoadEventData();
    maintainEventLoadFamilyData();
}
async function maintainEventAddEvent(){
    values = {};
    values.name = maintainEventEventName;
    let addResponse = callAjax("addEvent",values);  
}
async function maintainEventAddInvitees(){
    let values = {};
    values.eventId = getElementById("eventSelect").value;
    let invitees = getElementById("inviteeSelect").selectedOptions;
    let inviteeIds = [];
    for(let ii = 0;ii<invitees.length;ii++){
        inviteeIds.push( getValueFromJson(invitees[ii].value,"id"));
    }
    values.familyIds = JSON.stringify(inviteeIds);
    let addResponse = callAjax("addInvites", values);
}
function maintainEventClearEventInputs(){
    maintainEventEventName = null;
    document.getElementById('eventName').value = null;
    document.getElementById("addEvent").disabled = true;
}
function maintainEventEventChanged(member){
    maintainEventEventName = member.value;
    document.getElementById("addEvent").disabled = maintainEventEventName != null?false:true;
}
function maintainEventEventSelected(){
    items = getElementById("eventSelect").selectedOptions;
    getElementById("inviteeSelect").disabled = items.length?false:true;

}
function maintainEventInviteeSelected(){
    items = getElementById("inviteeSelect").selectedOptions;
    getElementById("addInvitees").disabled = items.length?false:true;
}
async function maintainEventLoadFamilyData(){
    let familyArray = await callAjax('getFamilyMembers');
    populateFamilySelecter(familyArray,"inviteeSelect");
}
function maintainEventCreateEventTable(eventArray){
    let text = "<table style='width:500;'>";
    text += "<thead><th>Select</th><th>Name</th><th>Start Date</th><th>End Date</th></thead>"

    for (let ii = 0; ii < eventArray.length; ii++) {
        text += '<tr>';
        let member = eventArray[ii];
        text += "<td class='tdCenter'><input type='checkbox' name='eventCheckbox' id='" 
            + generateCheckBoxId("evtcheck",ii) + "' value=" + member.id 
            + " onchange='maintainEventActivateDeleteEventButton(this)'></td>";
            text += "<td>" + member.name + "</td>";
            text += "<td>" + member.startDate + "</td>";
            text += "<td>" + member.endDate + "</td>";
            text += '</tr>';
    }
    text += "</table>";
    document.getElementById("showEvents").innerHTML = text;
}
async function maintainEventLoadEventData(){
    let eventArray = await callAjax('getEvents');
    maintainEventCreateEventTable(eventArray);
    let eventSelect = document.getElementById("eventSelect");
    eventSelect.length = 1;
    familyArray.forEach((element, key) => {
        eventSelect[eventSelect.options.length] = new Option(element.name, id);
    });
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
    populateFamilySelecter(familyArray,"parentSelect");
    populateFamilySelecter(familyArray,"childSelect");
    // let parentSelect = document.getElementById("parentSelect");
    // let childSelect = document.getElementById("childSelect");
    // parentSelect.length = childSelect.length = 1;
    // familyArray.forEach((element, key) => {
    //     parentSelect[parentSelect.options.length] = new Option(element.firstname+' '+element.lastname, JSON.stringify(element));
    //     childSelect[childSelect.options.length] = new Option(element.firstname+' '+element.lastname, JSON.stringify(element));
    // });
}
async function maintainFamilyLoadFamilyRelationships(){
    let familyArray = await callAjax('getAllRelationships');
    let text = "<table style='width:500;'>";
    text += "<thead><th>Delete</th><th>Name</th><th>Relationship</th><th>Name</th></thead>"

    for (let ii = 0; ii < familyArray.length; ii++) {
        text += '<tr>';
        let member = familyArray[ii];
        text += "<td class='tdCenter'><input type='checkbox' name='familyRelationshipCheckbox' id='" 
            + generateCheckBoxId("fmcheck",ii) +"' value=" + member.id +
            + " onchange='maintainFamilyActivateDeleteRelationshipButton(this)'></td>";
        text += "<td>" + member.parentName + "</td>";
        text += "<td>" + member.type + "</td>";
        text += "<td>" + member.childName + "</td>";
        text += '</tr>';
    }
    text += "</table>";
    document.getElementById("showFamilyRelations").innerHTML = text;
}
function maintainFamilyActivateDeleteRelationshipButton(checkbox){
    idsArray = getCheckedValuesForName(checkbox.name);
    document.getElementById("deleteFamilyRelations").disabled = idsArray.length==0?true:false;
}
function maintainFamilyCreateFamilyMemberTable(familyArray){
    let text = "<table style='width:225;'>";
    text += "<thead><th>Delete</th><th>Name</th></thead>"

    for (let ii = 0; ii < familyArray.length; ii++) {
        text += '<tr>';
        let member = familyArray[ii];
        text += "<td class='tdCenter'><input type='checkbox' name='familyMemberCheckbox' id='" 
            + generateCheckBoxId("relcheck",ii) + "' value=" + member.id 
            + " onchange='maintainFamilyActivateDeleteFamilyButton(this)'></td>";
        text += "<td>" + member.fullName + "</td>";
        text += '</tr>';
    }
    text += "</table>";
    //text += "<br><button id='fetch_button' onclick='maintainFamilyDeleteFamilyMember()'>Delete Selected</button>"
    document.getElementById("showFamilyMembers").innerHTML = text;
}
function maintainFamilyActivateDeleteFamilyButton(checkbox){
    idsArray = getCheckedValuesForName(checkbox.name);
    document.getElementById("deleteFamilyMembers").disabled = idsArray.length==0?true:false;
}
async function maintainFamilyDeleteFamilyMember(){
    idsArray = getCheckedValuesForName("familyMemberCheckbox");
    values = {};
    values.ids = JSON.stringify(idsArray);
    deleteResponse = await callAjax('deleteFamilyMember', values);
    maintainFamilyLoadFamilyData();
    maintainFamilyLoadFamilyRelationships();
}
async function maintainFamilyDeleteRelationship(){
    idsArray = getCheckedValuesForName("familyRelationshipCheckbox");
    values = {};
    values.ids = JSON.stringify(idsArray);
    deleteResponse = await callAjax('deleteFamilyRelationship', values);
    maintainFamilyLoadFamilyRelationships();
}
function getCheckedValuesForName(name){
    boxes = document.getElementsByName(name);
    return Object.entries(boxes).filter((key, element)=>key[1].checked).map((key,element) => key[1].value);
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
function selectRelationshipType(selection){
    relationshipType = selection.value;
    parent = document.getElementById("parentLabel");
    child = document.getElementById("childLabel");
    if(relationshipType == 1){
        parent.innerText = "Parent";
        child.innerText = "Child";
    }
    else{
        parent.innerText = "Spouse A";
        child.innerText = "Spouse B";
    }
}
