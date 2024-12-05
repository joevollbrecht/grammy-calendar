let dateStatuses = null;
let eventInviteStatuses = null;
let extractElementIdNumberRegEx = new RegExp(/[^_]{1,}$/);
let maintainEventEventName = null;
let maintainFamilyFirstName = null;
let maintainFamilyLastName = null;
let maintainInviteDatesNoSelection = true;
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
        case 'addEventPlanningDates':
        case 'addFamilyMember':
        case 'addFamilyRelationship':
        case 'addInvites':
        case 'deleteEvents':
        case 'deleteInvites':
        case 'deleteFamilyMember':
        case 'deleteFamilyRelationship':
        case 'getAllEventRelationships':
        case 'getAllRelationships':
        case 'getDateStatuses':
        case 'getEventInviteStatuses':
        case 'getEvents':
        case 'getEventsByFamilyMember':
        case 'getFamilyMembers':
        case 'getFamilyMembersByEvent':
        case 'getFamilyRelationshipTypes':
        case 'updateInviteStatuses':
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
function extractElementIdNumber(id){
    return extractElementIdNumberRegEx.exec(id);
}
function generateElementId(prefix,ii){
    return prefix + "__" + ii;
}
function generateIdSelector(options, selectedId, idString="", nameString = "", onChange=""){
    let myFunction = onChange==""?onChange:"onchange='"+onChange+"'";
    let retVal = "<select id='" + idString + "' name='" + nameString + "' " + myFunction + ">";
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
function initAccordions(){
    let coll = document.getElementsByClassName("accordion");
    let i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("accordionActive");
        this.innerText = this.classList.contains("accordionActive")?"Close " + this.value:this.value;
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
}
function populateEventSelector(eventArray,elementName){    
    let eventSelect = document.getElementById(elementName);
    eventSelect.length = 1;
    eventArray.forEach((element, key) => {
        eventSelect[eventSelect.options.length] = new Option(element.name, element.id);
    });
}
function populateFamilySelector(familyArray,elementName){
    let select = document.getElementById(elementName);
    select.length = 1;
    familyArray.forEach((element, key) => {
        select[select.options.length] = new Option(element.fullName, JSON.stringify(element));
    });
}
async function retrieveDateStatuses() {
    eventInviteStatuses = await callAjax("getDateStatuses");
}
async function retrieveEventInviteStatuses() {
    eventInviteStatuses = await callAjax("getEventInviteStatuses");
}
async function maintainEventsInit(){
    maintainEventLoadEventData();
    maintainEventLoadFamilyData();
    maintainEventCreateInviteTable();
    initAccordions();
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
    maintainEventAddInviteesClearSelections();
    maintainEventCreateInviteTable();
}
function maintainEventAddInviteesClearSelections(){
    let selectedEvents = document.getElementById("eventSelect").selectedOptions;
    for(let ii = 0;ii<selectedEvents.length;ii++){
        selectedEvents[ii].selected =ii != 0?false:true  ;
    }
    selectedEvents = document.getElementById("inviteeSelect").selectedOptions;
    for(ii = 0;ii<selectedEvents.length;ii++){
        selectedEvents[ii].selected = false;
    }
    document.getElementById("inviteeSelect").disabled = true;
    document.getElementById("addInvitees").disabled = true;
}
function maintainEventAutoSelectInviteRow(member){
    maintainEventEventName = member.value;
    let ii = extractElementIdNumber(member.id);
    let checkbox = document.getElementById(generateElementId("evtInviteCheck",ii));
    checkbox.checked = true;
    maintainEventActivateEventButtons(checkbox);
}
function maintainEventClearEventInputs(){
    maintainEventEventName = null;
    document.getElementById('eventName').value = null;
    document.getElementById("addEvent").disabled = true;
}
function maintainEventCreateEventTable(eventArray){
    let text = "<table class='tableCenter' style='width:500;'>";
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
    let text = "<table class='tableCenter' style='width:500;'>";
    text += "<thead><th>Sel</th><th>Event</th><th>Invitee</th><th>Status</th></thead>"

    for (let ii = 0; ii < eventArray.length; ii++) {
        text += '<tr>';
        let member = eventArray[ii];
        let selId = generateElementId("inviteStatusSelect", ii);
        text += "<td class='tdCenter'><input type='checkbox' name='eventInviteCheckbox' id='" 
            + generateElementId("evtInviteCheck",ii) + "' value=" + member.id 
            + " onchange='maintainEventActivateEventButtons(this)'></td>";
            text += "<td>" + member.eventName + "</td>";
            text += "<td>" + member.fullName + "</td>";
            text += "<td>" + generateIdSelector(eventInviteStatuses, member.statusId, selId,"name", "maintainEventAutoSelectInviteRow(this)") + "</td>";
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
    populateFamilySelector(familyArray,"inviteeSelect");
}
async function maintainEventUpdateInvites(){
    idsArray = getCheckedValueAndIdsForName("eventInviteCheckbox");
    myRegEx = new RegExp(/[^_]{1,}$/);
    updates = [];
    for(let ii = 0;ii<idsArray.length;ii++){
        let elementId = myRegEx.exec(idsArray[ii].id);
        let selIdString = generateElementId("inviteStatusSelect", elementId);
        let selId = document.getElementById(selIdString).value;
        updates.push({"id":idsArray[ii].value,"newStatus":selId})
    }
    values = {};
    values.updates = JSON.stringify(updates);
    deleteResponse = await callAjax('updateInviteStatuses', values);
    maintainEventCreateInviteTable();
}
async function maintainEventLoadEventData(){
    let eventArray = await callAjax('getEvents');
    maintainEventCreateEventTable(eventArray);
    populateEventSelector(eventArray, "eventSelect");
}
async function maintainFamilyInit(){
    initAccordions();
    maintainFamilyLoadFamilyData();
    maintainFamilyLoadFamilyRelationships();
    let relationArray = await callAjax('getFamilyRelationshipTypes');
    let relationSelect = document.getElementById('relationType');
    let relationString = ""
    relationArray.forEach((element, key) => {
        relationString +="<label><input type='radio' name='relationship' value='"+element.id
            + "' id='"+element.type + "'"
            + " onChange='maintainFamilySelectRelationshipType(this)'";
        if(element.id == 1) relationString +=" checked";
        relationString += ">" + element.type + "</label>";
    });
    relationSelect.innerHTML = relationString;
}
function maintainFamilyActivateDeleteFamilyButton(checkbox){
    idsArray = getCheckedValuesForName(checkbox.name);
    document.getElementById("deleteFamilyMembers").disabled = idsArray.length==0?true:false;
}
function maintainFamilyActivateDeleteRelationshipButton(checkbox){
    idsArray = getCheckedValuesForName(checkbox.name);
    document.getElementById("deleteFamilyRelations").disabled = idsArray.length==0?true:false;
}
async function maintainFamilyAddFamilyMember(){
    let values = {};
    values.firstName = maintainFamilyFirstName;
    values.lastName = maintainFamilyLastName;
    let insertResponse = await callAjax('addFamilyMember',values);
    maintainFamilyLoadFamilyData();
    maintainFamilyClearFamilyNameInputs();
}
function maintainFamilyChildSelected(){
    let child = document.getElementById("childSelect");
    let button = document.getElementById("setRelationship");
    button.disabled = child.value !== -1?false:true;
}
function maintainFamilyClearFamilyNameInputs(){
    maintainFamilyFirstName = maintainFamilyLastName = null;
    document.getElementById('firstName').value = null;
    document.getElementById('lastName').value = null;
    document.getElementById("addFamilyMember").disabled = true;
}
function maintainFamilyCreateFamilyMemberTable(familyArray){
    let text = "<table class='tableCenter' style='width:225;'>";
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
    document.getElementById("showFamilyMembers").innerHTML = text;
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
async function maintainFamilyLoadFamilyData(){
    let familyArray = await callAjax('getFamilyMembers');
    maintainFamilyCreateFamilyMemberTable(familyArray);
    populateFamilySelector(familyArray,"parentSelect");
    populateFamilySelector(familyArray,"childSelect");
}
async function maintainFamilyLoadFamilyRelationships(){
    let familyArray = await callAjax('getAllRelationships');
    let text = "<table class='tableCenter' style='width:500;'>";
    text += "<thead><th>Delete</th><th>Name</th><th>Relationship</th><th>Name</th></thead>"

    for (let ii = 0; ii < familyArray.length; ii++) {
        text += '<tr>';
        let member = familyArray[ii];
        text += "<td class='tdCenter'><input type='checkbox' name='familyRelationshipCheckbox' id='" 
            + generateElementId("fmcheck",ii) +"' value=" + member.id
            + " onchange='maintainFamilyActivateDeleteRelationshipButton(this)'></td>";
        text += "<td>" + member.parentName + "</td>";
        text += "<td>" + member.type + "</td>";
        text += "<td>" + member.childName + "</td>";
        text += '</tr>';
    }
    text += "</table>";
    document.getElementById("showFamilyRelations").innerHTML = text;
}
function maintainFamilyNameChanged(member){
    if(member.id == 'firstName') maintainFamilyFirstName = member.value;
    if(member.id == 'lastName') maintainFamilyLastName = member.value;
    if(maintainFamilyFirstName!=null && maintainFamilyLastName != null){
        document.getElementById("addFamilyMember").disabled = false;
    } else document.getElementById("addFamilyMember").disabled = true;
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
function maintainFamilySelectRelationshipType(selection){
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
async function maintainInviteDatesInit(){
    initAccordions();
    retrieveEventInviteStatuses();
    maintainEventLoadFamilyData();
    maintainEventLoadEventData();
}
async function maintainInviteDatesAddDates(){
    let startDate = document.getElementById("startDate");
    let endDate = document.getElementById("endDate");
    let eventSelect = document.getElementById("eventSelect");
    let personSelect = document.getElementById("inviteeSelect");
    let values = {};
    values.startDate = startDate.value;
    values.endDate = endDate.value;
    values.eventId = eventSelect.value;
    values.familyMemberId = personSelect.value;
    let addResponse = callAjax('addEventPlanningDates',values);
}
function maintainInviteDatesDateChanged(date){
    maintainInviteDatesSetAddDatesButton();
}
async function maintainInviteDatesEventSelected(item){
    if(maintainInviteDatesNoSelection){
        maintainInviteDatesNoSelection=false;
        values = {};
        values.eventId = item.value;
        let familyArray = await callAjax('getFamilyMembersByEvent',values);
        populateFamilySelector(familyArray,"inviteeSelect");
    }
    maintainInviteDatesSetAddDatesButton();
}
async function maintainInviteDatesInviteeSelected(item){
    if(maintainInviteDatesNoSelection){
        maintainInviteDatesNoSelection=false;
        values = {};
        values.familyMemberId = item.value;
        let eventArray = await callAjax('getEventsByFamilyMember',values);
        populateEventSelector(eventArray,"eventSelect");
    }
    maintainInviteDatesSetAddDatesButton();
}
async function maintainInviteDatesLoadDateStatuses(){
    let relationArray = await callAjax('getDateStatuses');
    let relationSelect = document.getElementById('relationType');
    let relationString = ""
    relationArray.forEach((element, key) => {
        relationString +="<label><input type='radio' name='relationship' value='"+element.id
            + "' id='"+element.type + "'"
            + " onChange='maintainInviteDatesSelectDateType(this)'";
        if(element.id == 1) relationString +=" checked";
        relationString += ">" + element.type + "</label>";
    });
    relationSelect.innerHTML = relationString;
}
async function maintainInviteDatesReset(){
    maintainEventLoadFamilyData();
    maintainEventLoadEventData();
    maintainInviteDatesNoSelection = true;
}
function maintainInviteDatesSelectDateType(selection){
}
function maintainInviteDatesSetAddDatesButton(){
    startDate = document.getElementById("startDate");
    endDate = document.getElementById("endDate");
    eventSelect = document.getElementById("eventSelect");
    personSelect = document.getElementById("inviteeSelect");
    document.getElementById("addDateButton").disabled =
        !startDate.value || !endDate.value || !eventSelect.selected || !personSelect.selected?true:false;
}
