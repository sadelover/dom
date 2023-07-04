var interval = 5000;
var id = undefined;
var projectId = undefined;
var pointList;
var scriptList;
var serverUrl = '';

function requestData() {
    // console.log("worker-准备发送接口"+new Date().toLocaleString());
        if(serverUrl&&serverUrl.slice(-4)!='5000'){
            interval = 10000
        }
        var xhr = new XMLHttpRequest();
        //  xhr.onreadystatechange = function () {
        //     if (xhr.readyState == 4 && xhr.status == 200) {
        //         //将获取到的点值数据返回给主线程
        //         postMessage(JSON.parse(xhr.responseText));
        //         setTimeout(requestData, interval);
        //     }else {
        //         postMessage({error: '1000'});
        //         console.log("[dora-17]实时请求响应未成功"+xhr.readyState+"状态码"+xhr.status)
        //         setTimeout(requestData, interval);
        //     }
        //  }
        //加载成功
        xhr.onload = function () {
            if (xhr.status == 200) {
                //将获取到的点值数据返回给主线程
                try {
                    var data = JSON.parse(xhr.responseText)
                    postMessage(JSON.parse(xhr.responseText));
                }catch (err) {
                    console.warning("[dora-observerWorlker-onload]实时请求返回格式错误"+xhr.responseText+"状态码"+xhr.status);
                    postMessage({error: "1000"});
                }
                // setTimeout(requestData, interval);
                // console.log("worker-完成发送接口返回200状态"+new Date().toLocaleString());
            }
            else {
                postMessage({error: "1000"});
                setTimeout(requestData, interval);
            }
        };
        //加载失败，加计时器，不停止刷新
        xhr.onerror = function () {
            setTimeout(requestData, interval);
            // console.log("[dora-36onerror]实时请求失败"+xhr.readyState+"状态码"+xhr.status)
        }
        //加载超时
        xhr.ontimeout = function () {
            setTimeout(requestData, interval);
            // console.log("[dora-41ontimeout]实时请求超时"+xhr.readyState+"状态码"+xhr.status)
        }
         //请求被中止
         xhr.onabort  = function () {
            setTimeout(requestData, interval);
        }
        xhr.open("POST", serverUrl + "/get_realtimedata");
        xhr.setRequestHeader("Content-Type", "application/json");
        if (pointList.length != 0 || scriptList.length != 0) {
            xhr.send(JSON.stringify({proj: projectId, pointList: pointList,scriptList:scriptList}));  
        }
        // else{
        //     setTimeout(requestData, interval);
        // }

    // setTimeout(requestData, interval);
}

function messageHandler(e) {
    var type = e.data.type, name;
    switch (type) {
        case "dataRealtimeMain":
            projectId = e.data.projectId;
            id = e.data.id;
            pointList = e.data.pointList;
            scriptList = e.data.bindTypePointList;
            serverUrl = e.data.serverUrl;
            requestData();
            break;
        case "lineDataRealtime":
            projectId = "1";
            pointList = e.data.pointList;
            serverUrl = e.data.serverUrl;
            requestData();
            break;
        case "scriptRuleRealtime":
            projectId = "1";
            pointList = [];
            scriptList = e.data.scriptList;
            serverUrl = e.data.serverUrl;
            requestData();
            break;
    }
}
addEventListener("message", messageHandler, true);
addEventListener("error",messageHandler,true)