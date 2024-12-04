let bodySelect = null;
let dateStatusArray = null;
let dateStatusValueArray = [];
let eventInviteStatuses = null;
let extractElementIdNumberRegEx = new RegExp(/[^_]{1,}$/);
let maintainEventEventName = null;
let maintainFamilyFirstName = null;
let maintainFamilyLastName = null;
let maintainInviteDatesNoSelection = true;
let messageCss = [];
    messageCss[1] = 'class="messageInfo"';
    messageCss[2] = 'class="messageWarning"';
    messageCss[3] = 'class="messageError"';
let messageSpaceContainer = null;
let relationshipType = 1;
let pages = [{url:"/index.html",text:"Home",what:[]},
    {url:"/html/maintainFamily.html",text:"Maintain Family",
        what:["Add Family Member","Remove Family Member","Set Relationship (parent/child or spouse"]
    },
    {url:"/html/maintainEvents.html",text:"Maintain Events",
        what:["Add Event","Remove Event","Set invitations", "Change Invitation Status"]
    },
    {url:"/html/maintainInviteDates.html",text:"Maintain Planning Dates",
        what:["Assign Dates For Invitees", "Remove Dates", "Analyze Combined Dates"]
    },
    ];

function myInit(initFunctionName){
    bodySelect = document.querySelector("body");
    buildNavBar();
    messageSpaceContainer = new MessageSpace();
    switch(initFunctionName){
        case "initIndex":
            initIndex();
            break;
        case "maintainEventsInit":
            maintainEventsInit();
            break;
        case "maintainFamilyInit":
            maintainFamilyInit();
            break;
        case "maintainInviteDatesInit":
            maintainInviteDatesInit();
            break;
        default:
            alert("bad init function:" + initFunctionName);
    }
    messageSpaceContainer.appendToBody();
}
class Table{
    constructor(id, name){
        if(document.getElementById(id)){
            alert("Reused id " + id + ", try again");
            throw "Duplicate id " + id;
        }
        this.id = id;
        this.container = document.createElement("div");
        this.container.id = id;
        this.tableBody = null;
        this.tableSelector = document.createElement("table");
        this.tableSelector.id = id + "_table";
        this.tableSelector.name = name;
        this.caption = document.createElement('caption');
        this.tableSelector.appendChild(this.caption);
        this.columns = [];
    }
    addTableToContainer(){
        this.container.appendChild(this.tableSelector);
    }
    addToElement(id=""){
        let element = id == ""?bodySelect:document.getElementById(id);
        element.appendChild(this.container);
    }
    createBody(){
        this.tableBody = document.createElement("tbody");
        this.tableSelector.appendChild(this.tableBody);
    }
    createHead(){       
        let head = document.createElement("thead");
        this.columns.forEach((element) => 
            {
                let th=document.createElement("th");
                th.textContent = element;
                head.appendChild(th);
        });
        this.tableSelector.appendChild(head);
    }
    createTd(text){
        let td = document.createElement("td");
        td.textContent = text;
        return td;
    }
    setCaptionHtml(element){
        this.caption.innerHTML = element;
    }
    setCaptionText(text){
        this.caption.textContent = text;
    }
}
class PlanningDatesTable extends Table{
    constructor(id, name, includeSelect = false){
        super(id, name);
        this.planningDatesArray = [];
        this.eventSelector = null;
        this.familySelector = null;
        this.selectedEvent = -1;
        this.tableSelector.classList.add("planningTableCenter");
        this.tableSelector.style.width = "800";
        this.includeSelect = includeSelect;
        if(includeSelect){
            this.columns = ["Start Date","End Date","Sel","Name","Status"];
        }
        else{
            this.columns = ["Start Date","End Date","Name","Status"]
        }
        this.createHead();
        this.createBody();
        this.createSelectors();
        this.createTableKey();
        this.loadEvents();
        this.addTableToContainer();
        this.dialog = new Dialog(this.id);
        this.container.insertBefore(this.dialog.openButton, this.container.firstChild)
        this.dialog.setHtml(this.formatExplainer());
    }

    createSelectors(){
        let div = document.createElement("div");
        let label = document.createElement("label");
        label.textContent = "Select Event";
        this.eventSelector = document.createElement("select");
        this.eventSelector.id = this.id + "_eventSelect";
        this.eventSelector.disabled = true;
        this.eventSelector.addEventListener('change', this.eventSelected.bind(this));
        let option = document.createElement("option");
        option.value = -1;
        option.textContent = "None";
        this.eventSelector.appendChild(option);
        label.appendChild(this.eventSelector);
        div.appendChild(label);
        label = document.createElement("label");
        label.textContent = "Select Family (optional)";
        this.familySelector = document.createElement("select");
        this.familySelector.id = this.id + "_familySelect";
        this.familySelector.disabled = true;
        this.familySelector.hidden = false;
        this.familySelector.multiple = false;
        this.familySelector.addEventListener('change', this.familySelected.bind(this));
        option = document.createElement("option");
        option.value = -1;
        option.textContent = "None";
        this.familySelector.appendChild(option);
        label.appendChild(this.familySelector);
        div.appendChild(label);
        this.container.appendChild(div);
    }
    createTableKey(){
        let fragment = new DocumentFragment();
        let div = document.createElement('div');
        div.style.fontSize = '.9rem';
        let span = fragment.appendChild(document.createElement('span'));
        span.textContent = 'Table key:';
        span = fragment.appendChild(document.createElement('span'));
        span.classList.add('planningTableAllSelectAllGo','key');
        span.textContent = 'All have date, all go';
        span = fragment.appendChild(document.createElement('span'));
        span.classList.add('planningTableAllSelectNoneGo','key');
        span.textContent = 'All have date, none go';
        span = fragment.appendChild(document.createElement('span'));
        span.classList.add('planningTableAllSelectSomeGo','key');
        span.textContent = 'All have date, some go';
        span = fragment.appendChild(document.createElement('span'));
        span.classList.add('planningTableSomeSelectAllGo','key');
        span.textContent = 'Some have date, all go';
        span = fragment.appendChild(document.createElement('span'));
        span.classList.add('planningTableSomeSelectNoneGo','key');
        span.textContent = 'Some have date, none go';
        span = fragment.appendChild(document.createElement('span'));
        span.classList.add('planningTableSomeSelectSomeGo','key');
        span.textContent = 'Some have date, some go';
        this.container.appendChild(fragment);
    }
    async eventSelected(){
        this.selectedEvent = this.eventSelector.value;
        this.loadPlanningDates();
        await this.loadFamilySelector();
        this.setCaptionText("Combined Dates for '"+this.eventSelector.options[this.eventSelector.selectedIndex].text+"' with "+(this.familySelector.options.length-1)+" invites");
    }
    familySelected(){
        let invitees = this.familySelector.selectedOptions;
        let inviteeIds = [];
        for(let ii = 0;ii<invitees.length;ii++){
            inviteeIds.push( getValueFromJson(invitees[ii].value,"id"));
        }
        this.loadPlanningDates(inviteeIds);
        this.setCaptionText("Combined Dates for '"+this.eventSelector.options[this.eventSelector.selectedIndex].text+"' with "+invitees.length+" selected of "+(this.familySelector.options.length-1)+" invites");
    }
    formatExplainer(){
        let frag = document.createDocumentFragment();
        let p = document.createElement("p");
        p.textContent = "Select an event, and all the invited people who have set potential dates will be displayed, color coded to show a summary of availability for the date range.";
        frag.appendChild(p);
        p = document.createElement("p");
        p.textContent = "Light colors indicate that not all of the people invited to the event have set a preference for the date range. Darker/brighter colors indicate that everyone has indicated their availability.";
        frag.appendChild(p);
        p = document.createElement("p");
        p.textContent = "The persons invited to the event are selectable. If you select one or more, the light/dark colors indicate choices for those people on the dates. This allows a subgroup (e.g. Kim, Jake, and Charles) to check availability for just them.";
        frag.appendChild(p);
        return frag;
    }
    getStatusClass(dateStatusObject, familyCount){
        let retVal = "";
        let dateCount = dateStatusObject.count;
        let statusArray = dateStatusObject.statusCountArray;
        let count1 = 1 in statusArray?statusArray[1]:0; //available
        let count2 = 2 in statusArray?statusArray[2]:0; //unavailable
        let count3 = 3 in statusArray?statusArray[3]:0; //preferred
        let count4 = 4 in statusArray?statusArray[4]:0; //going
        let count5 = 5 in statusArray?statusArray[5]:0; //disfavored
        if(dateCount!=familyCount){ //no date for some invited
            if(!count2 && !count5 ){ //no can't comes
                retVal = 'planningTableSomeSelectSomeGo';
            } else if(!count1 && !count3 && !count4){ //no came comes
                retVal = 'planningTableSomeSelectNoneGo';
            } else retVal = 'planningTableSomeSelectSomeGo'; // some yes, some no
        }
        else{  //all invited have something on current date 
            if((count1+count3+count4) == familyCount){ //all can go
                retVal = 'planningTableAllSelectAllGo';
            }
            else if((count2+count5) == familyCount){ //none can go
                retVal = 'planningTableAllSelectNoneGo';
            } else retVal = 'planningTableAllSelectSomeGo'; //some yes, some no
        }
        return retVal;
    }
    async loadEvents(){
        let eventArray = await callAjax('getEvents');
        populateEventSelector(eventArray, this.eventSelector.id);
        this.eventSelector.disabled = false;
    }
    async loadFamilySelector(){
        let values = {eventId:this.selectedEvent};
        let familyArray = await callAjax('getFamilyMembersByEvent',values);
        populateFamilySelector(familyArray, this.familySelector.id);
        this.familySelector.disabled = false;
        this.familySelector.hidden = false;
        this.familySelector.multiple = familyArray.length > 0?true:false;
        this.familySelector.size = familyArray.length > 3?4:familyArray.length;
    }
    async loadPlanningDates(familyMemberIds = []){
        if(this.selectedEvent<0){
            alert("Must select event first");
            return;
        }
        let values = {id:this.selectedEvent, familyMemberIds:JSON.stringify(familyMemberIds)};
        this.planningDatesArray = await callAjax('getEventPlanningMinDatesByEvent',values);
        this.populatePlanningDates();
    }
    populatePlanningDates(){
        let size = this.planningDatesArray['resultArray'].length;
        this.tableBody.textContent = "";
        let workingDate = "";
        let workingColor = "white";
        let dateFamilyCount = 1;
        let dateRangesAppended = false;
        let datesArray = this.planningDatesArray['dateSummaryArray'];
        let familyCount = this.planningDatesArray['familyCount'];
        if(size){
            workingDate = this.planningDatesArray['resultArray'][0]['startDate'];
            workingColor = this.getStatusClass(datesArray[workingDate], familyCount);
            dateFamilyCount = datesArray[workingDate].count
        }
        for (let ii = 0; ii < size; ii++) {
            let member = this.planningDatesArray['resultArray'][ii];
            if(workingDate != member.startDate){
                workingDate = member.startDate;
                workingColor = this.getStatusClass(datesArray[workingDate],familyCount);
                dateRangesAppended = false;
                dateFamilyCount = datesArray[workingDate].count
            }
            let tr = document.createElement("tr");
            tr.classList.add( workingColor, "planningTableRow" );
            if(dateFamilyCount == 1){
                tr.appendChild(this.createTd(member.startDate));
                tr.appendChild(this.createTd(member.endDate));
                tr.appendChild(this.createTd(member.fullName));
                tr.appendChild(this.createTd(dateStatusValueArray[member.dateStatusId]));
            }
            else{
                if(dateRangesAppended == false){
                    let child = this.createTd(member.startDate);
                    child.rowSpan = dateFamilyCount;
                    tr.appendChild(child);
                    child = this.createTd(member.endDate);
                    child.rowSpan = dateFamilyCount;
                    tr.appendChild(child);
                    tr.appendChild(this.createTd(member.fullName));
                    tr.appendChild(this.createTd(dateStatusValueArray[member.dateStatusId]));
                    dateRangesAppended = true;
                }
                else{
                    tr.appendChild(this.createTd(member.fullName));
                    tr.appendChild(this.createTd(dateStatusValueArray[member.dateStatusId]));
                }
            }
            this.tableBody.appendChild(tr);
        }
    }
}
class MessageSpace{
    constructor(){
        this.messageCss = [];
        this.messageCss[1] = 'class="messageInfo"';
        this.messageCss[2] = 'class="messageWarning"';
        this.messageCss[3] = 'class="messageError"';
        this.container = document.createElement("div");
        this.container.id = 'messageSpaceContainer';
        this.div = document.createElement("div");
        this.div.id = "messageSpace";
        this.container.appendChild(this.div);
        this.button = document.createElement("button");
        this.button.id = "clearMessageSpaceButton";
        this.button.textContent = "Clear Messages";
        this.button.hidden = true;
        this.container.appendChild(this.button);
        this.button.addEventListener('click', this.clear.bind(this));
    }
    appendToBody(){
        bodySelect.appendChild(this.container);
    }
    apppendToHtml(inString){
        this.div.innerHTML += "<br>" + inString;
        this.showButton();
    }
    clear(){
        this.setText("");
    }
    getContainer(){return this.container}
    hideButton(){this.button.hidden = true}
    setButton(){
        this.button.hidden = this.div.innerHTML.length || this.div.textContent.length?false:true;
    }
    setInnerHTML(inString, level){
        this.div.innerHTML = inString;
        this.setButton();
    }
    setText(inString){
        this.div.textContent = inString;
        this.setButton();
    }
    showButton(){this.button.hidden = false};
} 
function buildNavBar(){
    let nav = document.createElement("nav");for(let element of pages){
        let span = document.createElement("span");
        span.appendChild(createAnchor(element));
        nav.appendChild(span);
    }
    bodySelect.insertBefore(nav, bodySelect.firstChild);
}
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
        case 'deleteEventPlanningDates':
        case 'deleteInvites':
        case 'deleteFamilyMember':
        case 'deleteFamilyRelationship':
        case 'getAllEventRelationships':
        case 'getAllRelationships':
        case 'getDateStatuses':
        case 'getEventInviteStatuses':
        case 'getEventPlanningDatesByEvent':
        case 'getEventPlanningMinDatesByEvent':
        case 'getEvents':
        case 'getEventsByFamilyMember':
        case 'getEventsWithInvites':
        case 'getFamilyMembers':
        case 'getFamilyMembersByEvent':
        case 'getFamilyMembersWithInvites':
        case 'getFamilyRelationshipTypes':
        case 'updateEventPlanningDates':
        case 'updateInviteStatuses':
            myUrl += '?' + queryString;
            break;
        default:
            console.log("in default with type="+type);
            response = "hit the default with type="+type;
            messageSpaceContainer.setText(response);
            return;
    }
    myObject = await fetch(myUrl);
    response = await myObject.text();
    return responseHandler(response);
}
function clearMessageSpace(){
    messageSpaceContainer.clear();
    /*document.getElementById("messageSpace").innerHTML = "";
    document.getElementById("clearMessageSpaceButton").hidden = true;*/
}
function createAnchor(element){
    let anchor = document.createElement("a");
    anchor.href = element.url;
    anchor.text = element.text;
    return anchor;
}
function defaultDisplay(response){
    document.getElementById("message_space").innerText = response;
}
function displayMessages(messageArray){
    if(!messageArray.length) return;
    let displayHtml = Object.keys(messageArray)
        .map(k =>"<span " + messageCss[messageArray[k].type] + ">" + messageArray[k].message + "</span>")
        .join('<br>');
    messageSpaceContainer.apppendToHtml(displayHtml);
    /*let element = document.getElementById("messageSpace");
    if( element.innerHTML.length && displayHtml.length){
        element.innerHTML = element.innerHTML + '<br>' + displayHtml;
    } else if(displayHtml.length) element.innerHTML = displayHtml;
    document.getElementById("clearMessageSpaceButton").hidden = element.innerHTML.length?false:true;*/
}
function extractElementIdNumber(id){
    return extractElementIdNumberRegEx.exec(id);
}
function generateDateSelector( dateString, idString="", nameString = "", onChange=""){
    let myFunction = onChange==""?onChange:"onchange=\""+onChange+"\"";
    let retVal = "<input type='date' value='" + dateString + "' id='" + idString + "' name='" + nameString + "' " + myFunction + ">";
    return retVal;
}
function generateElementId(prefix,ii){
    return prefix + "__" + ii;
}
function generateIdSelector(options, selectedId, idString="", nameString = "", onChange=""){
    let myFunction = onChange==""?onChange:"onchange=\""+onChange+"\"";
    let retVal = "<select id='" + idString + "' name='" + nameString + "' " + myFunction + ">";
    let selected = "";
    options.forEach((element, key) => {
        selected = element.id == selectedId?" selected":"";
        retVal += "<option value=" + element.id + selected + ">" + element.type + "</option>";
    });
    retVal += "</select>";
    return retVal;
}
function getButtonsForName(name){
    boxes = document.getElementsByName(name);
    return Object.entries(boxes).filter((key, element)=>
        key[1].nodeName == "BUTTON").map((key,element) => key[1]);
}
function getCheckedValueAndIdsForName(name){
    boxes = document.getElementsByName(name);
    return Object.entries(boxes).filter((key, element)=>key[1].checked).map((key,element) => 
        {val={"id":key[1].id,"value":key[1].value}; return val});
}
function getCheckedValuesForName(name){
    boxes = document.getElementsByName(name);
    return Object.entries(boxes).filter((key, element)=>
        key[1].nodeName == "INPUT"
        && key[1].getAttribute('type') === 'checkbox' 
        && key[1].checked).map((key,element) => key[1].value);
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
async function initIndex(){
    let mainList = document.createElement("ul");
    for(let element of pages){
        let mainLi = document.createElement("li");
        mainLi.appendChild(createAnchor(element));
        if(element.what.length){
            let subList = document.createElement("ul");
            for(let sub of element.what){
                let subLi = document.createElement("li");
                subLi.textContent = sub;
                subList.appendChild(subLi);
            }
            mainLi.appendChild(subList);
        }
        mainList.appendChild(mainLi);
    }
    bodySelect.appendChild(mainList);
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
    dateStatusArray = await callAjax("getDateStatuses");
    dateStatusArray.forEach((element, key) => {
        dateStatusValueArray[element.id] = element.type;
    });
}
async function retrieveEventInviteStatuses() {
    eventInviteStatuses = await callAjax("getEventInviteStatuses");
}
function setButtonStatusForName(name){
    let checkedValues = getCheckedValuesForName(name);
    let checkedValuesLength = checkedValues.length;
    let buttons = getButtonsForName(name);
    for(let ii=0;ii<buttons.length;ii++){
        buttons[ii].disabled = checkedValuesLength?false:true;
    }
}
function setTableCheckbox(member, idString){
    maintainEventEventName = member.value;
    let ii = extractElementIdNumber(member.id);
    let checkbox = document.getElementById(generateElementId(idString,ii));
    checkbox.checked = true;
    setButtonStatusForName(checkbox.name);
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
    let text = "<table class='tableCenter'>";
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
    let text = "<table class='tableCenter'>";
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
            text += "<td>" + generateIdSelector(eventInviteStatuses, member.statusId, selId,"name", "setTableCheckbox(this,'evtInviteCheck')") + "</td>";
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
    let text = "<table class='tableCenter'>";
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
    retrieveDateStatuses();
    maintainInviteDatesLoadFamilyData();
    maintainInviteDatesLoadEventData();
    maintainInviteDatesLoadDateStatuses();
    let dialog = new Dialog();
    dialog.setHtml(maintainInviteDatesFormatAddExplainer());
    let element = document.getElementById('addInvites');
    element.insertBefore(dialog.openButton,element.firstChild);
    analyzeDatesTable = new PlanningDatesTable("analyzeDates", "analyzeDates");
    analyzeDatesTable.addToElement('showAnalyzeTable');
    initAccordions();
}
function maintainInviteDatesActivateUpdateDeleteButton(element){
    setButtonStatusForName(element.name);
}
async function maintainInviteDatesAddDates(){
    let startDate = document.getElementById("startDate");
    let endDate = document.getElementById("endDate");
    if(startDate.value>endDate.value){
        alert("Start date must be less than or equal to end date");
        return;
    }
    let eventSelect = document.getElementById("eventSelect");
    let personSelect = document.getElementById("inviteeSelect");
    let values = {};
    values.startDate = startDate.value;
    values.endDate = endDate.value;
    values.eventId = eventSelect.value;
    values.familyMemberId = getValueFromJson(personSelect.value, "id");
    values.dateStatus = relationshipType;
    let addResponse = callAjax('addEventPlanningDates',values);
    if(eventSelect.value == document.getElementById("eventSelect1").value){
        values = {};
        values.eventId = eventSelect.value;
        inviteDatesArray = await callAjax('getEventPlanningDatesByEvent', values);
        maintainInviteDatesPopulateMaintainDatesTable(inviteDatesArray);
    }
}
function maintainInviteDatesAutoSelectInviteRow(member){
    maintainEventEventName = member.value;
    let ii = extractElementIdNumber(member.id);
    let checkbox = document.getElementById(generateElementId("inviteDateCheckbox",ii));
    checkbox.checked = true;
    maintainInviteDatesActivateUpdateDeleteButton(checkbox);
}
function maintainInviteDatesDateChanged(date){
    maintainInviteDatesSetAddDatesButton();
}
async function maintainInviteDatesDelete(button){
    let selected = getCheckedValuesForName(button.name);
    let values = {};
    let ids = [];
    for(let ii = 0;ii<selected.length;ii++){
        ids.push(selected[ii]);
    }
    values.ids = JSON.stringify(ids);
    let deleteResponse = callAjax('deleteEventPlanningDates', values);
    values = {};
    values.eventId = document.getElementById('eventSelect1').value;
    inviteDatesArray = await callAjax('getEventPlanningDatesByEvent', values);
    maintainInviteDatesPopulateMaintainDatesTable(inviteDatesArray);
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
function maintainInviteDatesFormatAddExplainer(){
    let frag = document.createDocumentFragment();
    let p = document.createElement("p");
    p.textContent = "This is where you assign planning dates for a person and event. Multiple dates can be set, althought they can't overlap.";
    frag.appendChild(p);
    p = document.createElement("p");
    p.textContent = "Start by selecting either an event or a person. The other selector will populate with either the people invited to the event, or the events the person has been invited to.";
    frag.appendChild(p);
    p = document.createElement("p");
    p.textContent = "Select the other option (person/event), the date range (start can equal end), and then click the 'Add Dates' button.";
    frag.appendChild(p);
    p = document.createElement("p");
    p.textContent = "The 'Reset Selects' button clears both events and people, allowing you to do another set of dates.";
    frag.appendChild(p);
    return frag;
}
async function maintainInviteDatesInviteeSelected(item){
    if(maintainInviteDatesNoSelection){
        maintainInviteDatesNoSelection=false;
        values = {};
        values.familyMemberId = getValueFromJson(item.value,"id");
        let eventArray = await callAjax('getEventsByFamilyMember',values);
        populateEventSelector(eventArray,"eventSelect");
    }
    maintainInviteDatesSetAddDatesButton();
}
async function maintainInviteDatesEventSelectedForMaintain(item){
    values = {};
    values.eventId = item.value;
    inviteDatesArray = await callAjax('getEventPlanningDatesByEvent', values);
    maintainInviteDatesPopulateMaintainDatesTable(inviteDatesArray);
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
async function maintainInviteDatesLoadEventData(){
    let eventArray = await callAjax('getEventsWithInvites');
    populateEventSelector(eventArray, "eventSelect");
    populateEventSelector(eventArray, "eventSelect1");
}
async function maintainInviteDatesLoadFamilyData(){
    let familyArray = await callAjax('getFamilyMembersWithInvites');
    populateFamilySelector(familyArray,"inviteeSelect");
}
async function maintainInviteDatesReset(){
    maintainInviteDatesLoadFamilyData();
    maintainInviteDatesLoadEventData();
    maintainInviteDatesSetAddDatesButton();
    maintainInviteDatesNoSelection = true;
}
function maintainInviteDatesResetForMaintain(){
    let checkedBoxes = document.querySelectorAll('input[name=maintainInviteDates]:checked');
    for(let element of checkedBoxes){
        element.checked = false;
    }
    setButtonStatusForName('maintainInviteDates');
}
function maintainInviteDatesPopulateMaintainDatesTable(datesArray){
    let text = "<table class='tableCenter' name='maintainInviteDates'>";
    text += "<thead><th>Sel</th><th>Event</th><th>Name</th><th>Status</th><th>Start Date</th><th>End Date</th></thead>";
    text += '<tbody>';
    for (let ii = 0; ii < datesArray.length; ii++) {
        text += '<tr>';
        let member = datesArray[ii];
        let dateStatusId = generateElementId("dateStatusSelect", ii);
        let startDateId = generateElementId("updateStartDate",ii);
        let endDateId = generateElementId("updateEndDate", ii);
        text += "<td class='tdCenter'><input type='checkbox' name='maintainInviteDates' id='" 
            + generateElementId("inviteDateCheckbox",ii) +"' value=" + member.id
            + " onchange='maintainInviteDatesActivateUpdateDeleteButton(this)'></td>";
        text += "<td>" + member.eventName + "</td>";
        text += "<td>" + member.fullName + "</td>";
        text += "<td>" + generateIdSelector(dateStatusArray, member.dateStatusId, dateStatusId,"name", "setTableCheckbox(this,'inviteDateCheckbox')") + "</td>";
        text += "<td>" + generateDateSelector(member.startDate, startDateId,"startDate","setTableCheckbox(this,'inviteDateCheckbox')") + "</td>";
        text += "<td>" + generateDateSelector(member.endDate, endDateId,"startDate","setTableCheckbox(this,'inviteDateCheckbox')") + "</td>";
        text += '</tr>';
    }
    text += "</tbody></table>";
    document.getElementById('showInviteDates').innerHTML = text;
}
function maintainInviteDatesSelectDateType(selection){
    relationshipType = selection.value;
}
function maintainInviteDatesSetAddDatesButton(){
    startDate = document.getElementById("startDate");
    endDate = document.getElementById("endDate");
    eventSelect = document.getElementById("eventSelect");
    personSelect = document.getElementById("inviteeSelect");
    document.getElementById("addDateButton").disabled =
        startDate.value && endDate.value && eventSelect.value != -1 && personSelect.value != -1?false:true;
}
async function maintainInviteDatesUpdate(button){
    let selected = getCheckedValueAndIdsForName(button.name);
    let values = {};
    let updates = [];
    for(let ii = 0;ii<selected.length;ii++){
        let value={};
        value.id = selected[ii].value;
        index = extractElementIdNumber(selected[ii].id);
        value.startDate = document.getElementById(generateElementId('updateStartDate',index)).value;
        value.endDate = document.getElementById(generateElementId('updateEndDate',index)).value;
        value.dateStatus = document.getElementById(generateElementId('dateStatusSelect',index)).value;
        if(value.startDate>value.endDate){
            alert("Start date can not be greater than end date, update cancelled");
            return;
        }
        updates.push(value);
    }
    values.updates = JSON.stringify(updates);
    callAjax('updateEventPlanningDates', values);
    values = {};
    values.eventId = document.getElementById('eventSelect1').value;
    inviteDatesArray = await callAjax('getEventPlanningDatesByEvent', values);
    maintainInviteDatesPopulateMaintainDatesTable(inviteDatesArray);
}
class Dialog{
    constructor(baseId){
        this.id = baseId + "_dialog";
        this.containerId = this.id + "_container";
        this.closeButtonId = this.id + "_closeButton";
        if(document.getElementById(this.id)){
            alert("Reused id " + this.id + ", try again");
            throw "Duplicate id " + this.id;
        }
        this.dialog = document.createElement("dialog");
        this.container = document.createElement("div");        
        this.closeButton = document.createElement("button");
        this.closeButton.textContent = "Close";
        this.closeButton.autofocus = true;
        this.closeButton.addEventListener("click", this.close.bind(this));
        this.dialog.appendChild(this.container);
        this.dialog.appendChild(this.closeButton);
        bodySelect.appendChild(this.dialog);
        this.openButton = document.createElement("button");
        this.openButton.textContent = "Explain This";
        this.openButton.style.backgroundColor = "lightblue";
        this.openButton.addEventListener("click", this.open.bind(this));
    }
    append(element){
        element
    }
    close(){
        this.dialog.close();
    }
    open(){
        this.dialog.showModal();
    }
    setHtml(inElement){
        this.container.appendChild(inElement);
    }
    setText(inString){
        this.container.textContent = inString;
    }
}