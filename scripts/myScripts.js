let eventInviteStatuses = null;
let maintainFamilyFirstName = null;
let maintainFamilyLastName = null;
let maintainEventEventName = null;
let relationshipType = 1;

async function callAjax(type, values = {}){
    let myUrl = '/backend/ajax.php';
    let responseHandler = getStandardDbResponse;
    values.action = type;
    let queryString = Object.keys(values)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(values[k]))
        .join('&');
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
        case 'deleteEvents':
            myUrl += '?' + queryString;
            break;
        case 'deleteInvites':
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
        case 'getEventInviteStatuses':
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
            document.getElementById("messageSpace").innerText = response;
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
function generateElementId(prefix,ii){
    return prefix + "__" + ii;
}
function generateIdSelector(options, selectedId, idString="", nameString = ""){
    let retVal = "<select id='" + idString + "' name='" + nameString + "'>";
    let selected = "";
    options.forEach((element, key) => {
        selected = element.id == selectedId?" selected":"";
        retVal += "<option value=" + element.id + selected + ">" + element.type + "</option>";
    });
    retVal += "</select>";
    return retVal;
}
function getCheckedValueAndIdsForName(name){
    boxes = document.getElementsByName(name);
    return Object.entries(boxes).filter((key, element)=>key[1].checked).map((key,element) => 
        {val={"id":key[1].id,"value":key[1].value}; return val});
}
function getCheckedValuesForName(name){
    boxes = document.getElementsByName(name);
    return Object.entries(boxes).filter((key, element)=>key[1].checked).map((key,element) => key[1].value);
}
function getFamilyMembers(response){
    familyArray = JSON.parse(response);
    return familyArray['body'];
}
function getStandardDbResponse(response){
    standardArray = JSON.parse(response);
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
async function retrieveEventInviteStatuses() {
    eventInviteStatuses = await callAjax("getEventInviteStatuses");
}
async function maintainEventsInit(){
    maintainEventLoadEventData();
    maintainEventLoadFamilyData();
    maintainEventCreateInviteTable();
}
function maintainEventActivateDeleteEventButton(checkbox){
    let invitees = getCheckedValuesForName(checkbox.name);
    document.getElementById("deleteEvents").disabled = invitees.length?false:true;
}
function maintainEventActivateEventButtons(checkbox){
    let invitees = getCheckedValuesForName(checkbox.name);
    document.getElementById("deleteInvites").disabled = invitees.length?false:true;
    document.getElementById("updateInvites").disabled = invitees.length?false:true;
}
async function maintainEventAddEvent(){
    values = {};
    values.name = maintainEventEventName;
    let addResponse = callAjax("addEvent",values);
    maintainEventLoadEventData();
}
async function maintainEventAddInvitees(){
    let values = {};
    values.eventId = document.getElementById("eventSelect").value;
    let invitees = document.getElementById("inviteeSelect").selectedOptions;
    let inviteeIds = [];
    for(let ii = 0;ii<invitees.length;ii++){
        inviteeIds.push( getValueFromJson(invitees[ii].value,"id"));
    }
    values.familyIds = JSON.stringify(inviteeIds);
    let addResponse = await callAjax("addInvites", values);
    maintainEventCreateInviteTable();
}
function maintainEventClearEventInputs(){
    maintainEventEventName = null;
    document.getElementById('eventName').value = null;
    document.getElementById("addEvent").disabled = true;
}
function maintainEventCreateEventTable(eventArray){
    let text = "<table style='width:500;'>";
    text += "<thead><th>Select</th><th>Name</th><th>Start Date</th><th>End Date</th></thead>"

    for (let ii = 0; ii < eventArray.length; ii++) {
        text += '<tr>';
        let member = eventArray[ii];
        text += "<td class='tdCenter'><input type='checkbox' name='eventCheckbox' id='" 
            + generateElementId("evtcheck",ii) + "' value=" + member.id 
            + " onchange='maintainEventActivateDeleteEventButton(this)'></td>";
            text += "<td>" + member.name + "</td>";
            text += "<td>" + member.startDate + "</td>";
            text += "<td>" + member.endDate + "</td>";
            text += '</tr>';
    }
    text += "</table>";
    document.getElementById("showEvents").innerHTML = text;
}
async function maintainEventCreateInviteTable(){
    if(eventInviteStatuses == null){
        await retrieveEventInviteStatuses();
    }
    eventArray = await callAjax('getAllEventRelationships');
    let text = "<table style='width:500;'>";
    text += "<thead><th>Sel</th><th>Event</th><th>Invitee</th><th>Status</th></thead>"

    for (let ii = 0; ii < eventArray.length; ii++) {
        text += '<tr>';
        let member = eventArray[ii];
        let selId = generateElementId("inviteStatusSelect", ii);
        text += "<td class='tdCenter'><input type='checkbox' name='eventInviteCheckbox' id='" 
            + generateElementId("evtInvitecheck",ii) + "' value=" + member.id 
            + " onchange='maintainEventActivateEventButtons(this)'></td>";
            text += "<td>" + member.eventName + "</td>";
            text += "<td>" + member.fullName + "</td>";
            text += "<td>" + generateIdSelector(eventInviteStatuses, member.statusId, selId) + "</td>";
            text += '</tr>';
    }
    text += "</table>";
    document.getElementById("showInvites").innerHTML = text;
}
async function maintainEventDeleteEvents(){
    idsArray = getCheckedValuesForName("eventCheckbox");
    values = {};
    values.ids = JSON.stringify(idsArray);
    deleteResponse = await callAjax('deleteEvents', values);
    maintainEventLoadEventData();
    maintainEventCreateInviteTable();
}
async function maintainEventDeleteInvites(){
    idsArray = getCheckedValuesForName("eventInviteCheckbox");
    values = {};
    values.ids = JSON.stringify(idsArray);
    deleteResponse = await callAjax('deleteInvites', values);
    maintainEventCreateInviteTable();
}
function maintainEventEventChanged(member){
    maintainEventEventName = member.value;
    document.getElementById("addEvent").disabled = maintainEventEventName != null?false:true;
}
function maintainEventEventSelected(){
    items = document.getElementById("eventSelect").selectedOptions;
    document.getElementById("inviteeSelect").disabled = items.length?false:true;
}
function maintainEventInviteeSelected(){
    items = document.getElementById("inviteeSelect").selectedOptions;
    document.getElementById("addInvitees").disabled = items.length?false:true;
}
async function maintainEventLoadFamilyData(){
    let familyArray = await callAjax('getFamilyMembers');
    populateFamilySelecter(familyArray,"inviteeSelect");
}
async function maintainEventUpdateInvites(){
    idsArray = getCheckedValueAndIdsForName("eventInviteCheckbox");
    myRegEx = new RegExp(/[^_]{1,}$/);
    updates = [];
    for(let ii = 0;ii<idsArray.length;ii++){
        let elementId = myRegEx.exec(idsArray[ii].id);
        let selIdString = generateElementId("inviteStatusSelect", elementId);
        let selId = document.getElementById(selIdString).value;
        updates.push({"id":idsArray.value,"newStatus":selId})
    }
    values = {};
    values.updates = JSON.stringify(updates);
    deleteResponse = await callAjax('updateInvites', values);
    maintainEventCreateInviteTable();
}
async function maintainEventLoadEventData(){
    let eventArray = await callAjax('getEvents');
    maintainEventCreateEventTable(eventArray);
    let eventSelect = document.getElementById("eventSelect");
    eventSelect.length = 1;
    eventArray.forEach((element, key) => {
        eventSelect[eventSelect.options.length] = new Option(element.name, element.id);
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
}
async function maintainFamilyLoadFamilyRelationships(){
    let familyArray = await callAjax('getAllRelationships');
    let text = "<table style='width:500;'>";
    text += "<thead><th>Delete</th><th>Name</th><th>Relationship</th><th>Name</th></thead>"

    for (let ii = 0; ii < familyArray.length; ii++) {
        text += '<tr>';
        let member = familyArray[ii];
        text += "<td class='tdCenter'><input type='checkbox' name='familyRelationshipCheckbox' id='" 
            + generateElementId("fmcheck",ii) +"' value=" + member.id +
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
            + generateElementId("relcheck",ii) + "' value=" + member.id 
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
