var interval = 10000;
var intervalHealth = 50000;
var intervalFault = 60000;
var id = undefined;
var projectId = undefined;
var pointList;
var serverUrl = '';
var user = '';

//网络拓扑、报警页面信息等
function requestWarningData(){
    if(serverUrl&&serverUrl.slice(-4)!='5000'){
        interval = 60000
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if(xhr.status == 200){
            try {
                postMessage(JSON.parse(xhr.responseText));
            }catch (err) {
                console.warning("[dora-warningWorlker-onload]报警请求返回格式错误"+xhr.responseText+"状态码"+xhr.status);
                postMessage({error: "1000"});
            }
            setTimeout(requestWarningData,interval);
        }else{
            postMessage({error:'1000'})
            setTimeout(requestWarningData,interval);
        }
    }
    // 加载失败
    xhr.onerror = function () {
        postMessage({interfaceStatus:true})
        setTimeout(requestWarningData, interval);
    }
    //加载超时
    xhr.ontimeout = function () {
        postMessage({interfaceStatus:true})
        setTimeout(requestWarningData, interval);
    }

    //请求被中止
    xhr.onabort  = function () {
        setTimeout(requestWarningData, interval);
    }

    xhr.open("POST", serverUrl + "/warning/getRealtime");
    xhr.setRequestHeader("Content-Type", "application/json");
    //传参获取报警页面id
    xhr.send(JSON.stringify({getPageWarning: true}));
}

function requestHealthData(){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if(xhr.status == 200){
            postMessage(JSON.parse(xhr.responseText))
            setTimeout(requestHealthData,intervalHealth)
        }else{
            postMessage({error:'1000'})
        }
    }
    // 加载失败
    xhr.onerror = function () {
        postMessage({interfaceStatus:true})
        setTimeout(requestHealthData, intervalHealth);
    }
    //加载超时
    xhr.ontimeout = function () {
        postMessage({interfaceStatus:true})
        setTimeout(requestHealthData, intervalHealth);
    }

    xhr.open("POST", serverUrl + "/system/getHealth");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({}));
}

function requestFaultData(){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if(xhr.status == 200){
            postMessage(JSON.parse(xhr.responseText))
            setTimeout(requestFaultData,intervalFault)
        }else{
            postMessage({error:'1000'})
        }
    }
    // 加载失败
    xhr.onerror = function () {
        postMessage({interfaceStatus:true})
        setTimeout(requestFaultData, intervalFault);
    }
    //加载超时
    xhr.ontimeout = function () {
        postMessage({interfaceStatus:true})
        setTimeout(requestFaultData, intervalFault);
    }

    xhr.open("POST", serverUrl + "/fdd/countUserPendingFault");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({userName:user}));
}
//单独获取实时报警信息（近四小时）  远程30秒，本地10秒
function requestOnlyWarningData(){
    if(serverUrl&&serverUrl.slice(-4)!='5000'){
        interval = 30000
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        if(xhr.status == 200){
            try {
                postMessage(JSON.parse(xhr.responseText));
            }catch (err) {
                console.warning("[dora-warningWorlker-onload]报警请求返回格式错误"+xhr.responseText+"状态码"+xhr.status);
                postMessage({error: "1000"});
            }
            setTimeout(requestOnlyWarningData,interval);
        }else{
            postMessage({error:'1000'})
            setTimeout(requestOnlyWarningData,interval);
        }
    }
    // 加载失败
    xhr.onerror = function () {
        postMessage({interfaceStatus:true})
        setTimeout(requestOnlyWarningData, interval);
    }
    //加载超时
    xhr.ontimeout = function () {
        postMessage({interfaceStatus:true})
        setTimeout(requestOnlyWarningData, interval);
    }

    //请求被中止
    xhr.onabort  = function () {
        setTimeout(requestOnlyWarningData, interval);
    }

    xhr.open("POST", serverUrl + "/warning/getRealtime");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({seconds: 14400}));
}

function messageHandler(e) {
    var type = e.data.type;
    switch (type) {
        case 'realWarning':
            serverUrl = e.data.serverUrl;
            requestWarningData()
            break;
        case 'realHealth':
            serverUrl = e.data.serverUrl;
            requestHealthData()
            break;
        case 'realFault':
            user = e.data.user;
            serverUrl = e.data.serverUrl;
            requestFaultData()
            break;
        case 'warningData':
            serverUrl = e.data.serverUrl;
            requestOnlyWarningData()
            break;
    }
}
addEventListener("message", messageHandler, true);