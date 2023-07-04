import http  from './http';
import { ipcRenderer,shell } from 'electron'
import {Modal} from 'antd'
// 深度冻结对象
export function deepFreeze(obj) {
  let propNames = Object.getOwnPropertyNames(obj);
  propNames.forEach(name => {
    let prop = obj[name];
    if (typeof prop === 'object' && prop !== null) {
      deepFreeze(prop);
    }
  })
  return Object.freeze(obj);
}

export function downloadUrl(url,type) {
  var link = document.createElement("a");
  if(type){
    link.type = type
  } 
  link.download = name;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  link = null;
}

//跳转外链接
export function jumpUrl(url) {
   shell.openExternal(url)
}


//Promise
export function syncFunc(func){
  return new Promise( (resolve,reject)=>{
    resolve(function(){
      return func()
    })
  })
}


function get16(num){
  if(num.toString(16).length == 2){
      return num.toString(16)
  }else{
      return "0"+num.toString(16)
  }
}

export function getColor(number) {
  const red = number  & 0xff;
  const green = number >> 8 & 0xff;
  const blue = number >> 16 & 0xff;
  var arr = [red,green,blue]
  return "#" + arr.map(item=>{
      return get16(item)
  }).join('')
}

// 增加操作记录循环检测
export const addOperation = (function(){
  let times = 0 ;
  return function(url,postData,failMsg){
      if(times >= 5 ){
        times = 0
        return Modal.error({
          title: '错误提示',
          content: "后台接口-添加操作记录失败!"
        })
      }
      http.post(url,postData).then(
        data=>{
          if(data.msg){
            throw new Error(data.msg)
          }else{
            times = 0;
          }
        }
      ).catch(
        error => {
          times = times + 1
          // 需要增加log
          ipcRenderer.send('add-operation-error',failMsg)
          addOperation(url,postData,failMsg)
        }
      )
  }
})()


// 累积量求差
export const  subtract = (arr) => {
  var type = Object.prototype.toString.call(arr)
  if(type !== "[object Array]"){
    throw new Error(arr + ' it doesn\'t look like Array')
  }
  var i = 0 ,
      len = arr.length,
      cur = null,
      next = null,
      newArr = [];
  for(i; i<len ; i++ ){
    var temp = null;
	  cur = arr[i]
    next = arr[i+1];
    if(next !== undefined){
      temp = next - cur;
      temp = temp < 0 ? 0 : temp
      newArr.push(temp)
    }
  }
  return newArr
}