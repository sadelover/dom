// 工具类 - 远程服务请求
import React from 'react';
import { message, Modal } from 'antd';
import appConfig from './appConfig';
import { closeLoginWindow} from '../core/cmdRenderer';

const remote = require('@electron/remote');
let argv = remote.process.argv;

const get = (url, data,options={}) => {
  if (data) {
    let keys = Object.keys(data);
    if (keys.length) {
      let params = [];
      keys.forEach(
        row => {
          params.push(`${row}=${window.encodeURIComponent(data[row])}`)
        }
      )
      if (url.indexOf('?') === -1) {
        url = url + '?';
      }
      url = url + params.join('&');
    }
  }
  return _fetch(url, 'GET', data,options);
}

const getHtml = url => {
  return fetch(url).catch(
    err => {
      message.error('服务器访问失败！', 3);
      throw err;
    }
  ).then(
    resp => resp.text()
  );
}

const post = (url, data,options={}) => {
  return _fetch(url, 'POST', data,options);
}

const _formatData = data => {
  if (!data) {
    return null;
  }

  if (typeof data === 'string' || data instanceof FormData) {
    return data;
  }

  return JSON.stringify(data);
}
const _fetch = (url, method, data,options) => {
  return fetch(url, {
    credentials: 'same-origin',
    method: method.toUpperCase(),
    headers: options.headers || {
      'Content-Type': 'application/json'
    },
    body: _formatData(data)
  }).catch(
    err => {
      if(argv[10] || argv[6]){
      Modal.warning({
        title: '服务器连接断开！',
        content: (
          <div>
            <p>点击按钮退出软件</p>
            <p>请检查您的网络连接及输入的项目地址是否有误</p>
          </div>
        ),
        onOk(){closeLoginWindow()},
      });
    }
      // message.error('服务器访问失败！', 3);              
      throw err;
    }
  ).then(
    resp => resp.json()
  );
}

export default {
  get,
  getHtml,
  post
}
