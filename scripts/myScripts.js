function callBackend(){
    document.getElementById("test_space").innerText = "did this work";
}
async function fetchFile(){
    myObject = await fetch("files/random.txt");
    myText = await myObject.text();
    document.getElementById("fetch_space").innerText = myText;
}
async function callAjax(type){
    switch(type){
        case 'foo':
            console.log('got foo');
            let myObject = await fetch('backend/ajax.php', {
                method: 'GET',
                body: {
                    action:'foo'
                }});
            let response = await myObject.text();
            console.log(response);
            break;
        case 'bar':
            console.log('got bar');
            myObject = await fetch('backend/ajax.php', {
                method: 'GET',
                body: {
                    action:'foo'
                }});
            response = await myObject.text();
            console.log(response);
            break;
        default:
            console.log("in default with type="+type);
            response = "hit the default";
    }
    document.getElementById("fetch_space").innerText = response;
}