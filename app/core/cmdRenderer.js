import { ipcRenderer } from 'electron'
import commands from './commands'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const remote = require('@electron/remote');
const exePath = remote.process.execPath.slice(0, -7).replace(/\\/g, '\/')
let dbPath
if (remote.process.execPath.indexOf("OM.exe") != -1) {
	dbPath = exePath + '/db.json'
} else {
	dbPath = 'db.json'
}
const adapter = new FileSync(dbPath)
const db = low(adapter)
db.defaults({ ipList: [], nameList: [], ip: 'localhost:5000', name: '' })
	.write()

// 发送事件
const send = (type, ...args) => {
	return ipcRenderer.send(type, ...args);
}

/**
 * 关闭登录窗口
 */
export function closeLoginWindow() {

	if (window.localStorage.getItem('ipList') && JSON.parse(window.localStorage.getItem('ipList')).names) {
		db.set('nameList', JSON.parse(window.localStorage.getItem('ipList')).names).write()
		db.set('ipList', JSON.parse(window.localStorage.getItem('ipList')).ips).write()
	}
	db.set('name', localStorage.getItem('serverName')).write()
	db.set('ip', localStorage.getItem('serverUrl')).write()

	send(commands.CLOSE_LOGIN_WINDOW);
}

/**
 * 登录成功后执行
 * @param {object} loginInfo 登录成功后的返回数据
 */
export function afterLoginSuccess(loginInfo) {
	send(commands.AFTER_LOGIN_SUCCESS, loginInfo);
}

/**
 * 关闭主应用窗口
 */
export function closeAppWindow() {

	if (window.localStorage.getItem('ipList') && JSON.parse(window.localStorage.getItem('ipList')).names) {
		db.set('nameList', JSON.parse(window.localStorage.getItem('ipList')).names).write()
		db.set('ipList', JSON.parse(window.localStorage.getItem('ipList')).ips).write()
	}
	db.set('name', localStorage.getItem('serverName')).write()
	db.set('ip', localStorage.getItem('serverUrl')).write()
	send(commands.CLOSE_APP_WINDOW);



}

/**
 * 最小化主应用窗口
 */
export function minimizeAppWindow() {
	send(commands.MINIMIZE_APP_WINDOW);
}

export function maximizeAppWindow() {
	send(commands.MAXIMIZE_APP_WINDOW);

}

export function splitAppWindow(obj) {
	send(commands.SPLIT_APP_WINDOW, obj);

}

export default {
	send
}

