/**
 * 登录页
 */

import React, { PropTypes } from 'react';
import { Alert, Checkbox, Icon, Modal, message, Image, Button } from 'antd';

import http from '../../common/http';
import httpTo from '../../common/httpTo';
import { addOperation } from '../../common/utils'
import { closeLoginWindow, afterLoginSuccess } from '../../core/cmdRenderer';

import s from './Login.css';
import cx from 'classnames';
import LoginForm from './LoginForm';
import AdminLoginForm from './AdminLoginForm';
import DomVerifyModal from './DomVerifyModal';
import ConfigModal from './ConfigModal';
import RegistModal from './RegistModal';
import { number } from 'prop-types';
import ProjSelectModal from '../projectSelect/ProjectSelectView';
import thunk from 'redux-thunk';

//刚打开登录界面时，将上次残留的localstorage内容清空
if (localStorage['linePointDict']) {
	window.localStorage.removeItem('linePointDict')
}
if (localStorage['requestPoints']) {
	window.localStorage.removeItem('requestPoints')
}
//删除历史曲线的缓存时间段
if (localStorage['historyTimeStart']) {
	window.localStorage.removeItem('historyTimeStart')
}
if (localStorage['historyTimeEnd']) {
	window.localStorage.removeItem('historyTimeEnd')
}
//删除缓存天数
if (localStorage['leftday']) {
	window.localStorage.removeItem('leftday')
}

//删除om云端版本号
if (localStorage['omCloudVersion']) {
	window.localStorage.removeItem('omCloudVersion')
}

//删除项目所以点名清单
if (localStorage['allPointList']) {
	window.localStorage.removeItem('allPointList')
}

//删除否是显示天气的配置
if (localStorage['weatherDis']) {
	window.localStorage.removeItem('weatherDis')
}

//删除缓存的项目代号
if (localStorage['projectName_en']) {
	window.localStorage.removeItem('projectName_en')
}

//删除缓存的公司名
if (localStorage['serverOmd']) {
	window.localStorage.removeItem('serverOmd')
}

//删除缓存的简易动画
if (localStorage['animation']) {
	window.localStorage.removeItem('animation')
}

//删除缓存的设备点名
if (localStorage['selectEquipment']) {
	window.localStorage.removeItem('selectEquipment')
}
//删除缓存的设备铭牌信息
if (localStorage['deviceDetails']) {
	window.localStorage.removeItem('deviceDetails')
}

//删除缓存的图标偏移字段
if (localStorage['animation_icon_move']) {
	window.localStorage.removeItem('animation_icon_move')
}

//删除缓存的图标偏移字段
if (localStorage['projectRightsDefine']) {
	window.localStorage.removeItem('projectRightsDefine')
}

//删除缓存的操作记录筛选按钮信息
if (localStorage['operationBtnInfo']) {
	window.localStorage.removeItem('operationBtnInfo')
}

//删除缓存的om标题信息
if (localStorage['omTitle']) {
	window.localStorage.removeItem('omTitle')
}

//删除缓存的分屏页面id
if (localStorage['splitPageId']) {
	window.localStorage.removeItem('splitPageId')
}
//删除初始化窗口需要跳转到首页的标记
if (localStorage['creatAppWindow']) {
	localStorage.removeItem('creatAppWindow');
}
//删除屏幕宽度标记（用于判断显示最大化/向下恢复按钮样式）
if (localStorage['maxBtn']) {
	localStorage.removeItem('maxBtn');
}

//删除页面红色闪烁报警的缓存字段信息
if (localStorage['pagesRedWarning']) {
	window.localStorage.removeItem('pagesRedWarning')
}
if (localStorage['WarningPages']) {
	window.localStorage.removeItem('WarningPages')
}

//删除初始化页面id
if (String(localStorage.getItem('initPageId'))) {
	localStorage.removeItem('initPageId');
}

//删除初始化回放数据开始时间
if (localStorage['historyStartTime']) {
	localStorage.removeItem('historyStartTime');
}

//删除缓存的当前页面信息
if (localStorage['selectedPageName']) {
	localStorage.removeItem('selectedPageName');
}
if (localStorage['selectedPageId']) {
	localStorage.removeItem('selectedPageId');
}

//删除通用组件报表页面的数据
if (localStorage['reportRange'] || localStorage['reportSpan'] || localStorage['energyFee'] || localStorage['energyFeeData'] || localStorage['energyFeePrice'] || localStorage['energyFeeHeader']) {
	window.localStorage.removeItem('reportRange');
	window.localStorage.removeItem('reportSpan');
	window.localStorage.removeItem('energyFee');
	window.localStorage.removeItem('energyFeeData');
	window.localStorage.removeItem('energyFeePrice');
	window.localStorage.removeItem('energyFeeHeader');
}

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const remote = require('@electron/remote');
let argv = remote.process.argv;
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
if (db.getState().animation != undefined) {
	localStorage.setItem('animation', db.getState().animation);
}
if (db.getState().odm != undefined) {
	localStorage.setItem('serverOmd', db.getState().odm);
}
localStorage.setItem('Template', db.getState().template);
// localStorage.setItem('serverTheme', db.getState().theme);
// if(db.getState().theme && db.getState().theme != undefined && db.getState().theme != '') {
//   localStorage.setItem('serverTheme', db.getState().theme+'/css/antd-'+db.getState().theme);
// } else {
//   localStorage.setItem('serverTheme', 'dark/css/antd-dark');
// }


class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loginInfo: this.getInitLoginInfo(),
			error: {
				show: false,
				msg: ''
			},
			loading: false,
			isShowConfigModal: false,
			initialServerUrl: localStorage.getItem('serverUrl'),
			isRegistModal: false,
			machinecode: "",
			name: '',
			password: '',
			role: '',
			accountManageConfig: {},
			leftday: 0,
			changeSite: 0,
			adminName: "",
			adminPassword: "",
			showProjSelectModal: false,
			projectList: [],
			showDomVerify: false
		};
		this.onSubmit = this.onSubmit.bind(this);
		this.onSubmitLogin = this.onSubmitLogin.bind(this);
		this.onSubmitAdmin = this.onSubmitAdmin.bind(this);
		this.showError = this.showError.bind(this);
		this.hideError = this.hideError.bind(this);
		this.toggleIsRememeber = this.toggleIsRememeber.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleShowConfigModal = this.handleShowConfigModal.bind(this);
		this.handleHideConfigModal = this.handleHideConfigModal.bind(this);
		this.doLogin = this.doLogin.bind(this);
		this.toggleLoading = this.toggleLoading.bind(this);
		this.getNumber = this.getNumber.bind(this);
		this.handHideRegisterModal = this.handHideRegisterModal.bind(this);
		this.enterMainBody = this.enterMainBody.bind(this);
		this.getConfig = this.getConfig.bind(this);
		this.getConfigBest = this.getConfigBest.bind(this);
		this.getConfigWeather = this.getConfigWeather.bind(this);
		this.ChangeSite = this.ChangeSite.bind(this);
		this.handHideProjModal = this.handHideProjModal.bind(this);
		this.getModeList = this.getModeList.bind(this);
		this.getRightsDefine = this.getRightsDefine.bind(this);
		this.hideDomVerify = this.hideDomVerify.bind(this);
		this.onSubmitDom = this.onSubmitDom.bind(this);
		this.getRefreshConfig = this.getRefreshConfig.bind(this);
		this.getRedWarningConfig = this.getRedWarningConfig.bind(this);
		this.getConfigMul = this.getConfigMul.bind(this);
		this.fastLogin = this.fastLogin.bind(this);
	}
	componentWillMount() {
	
		//渲染背景图
		http.get('/getPngImageList')
			.then(
				res => {
					document.getElementById('container').style.backgroundImage = `url(http:\/\/${localStorage.getItem('serverUrl')}/static/images/${res.data[Math.floor(Math.random() * res.data.length)]}?v=${Math.random()*10}`;
				})
			.catch(
				err => {
					console.log("接口请求失败");
				});

		//dompysite版本：>=0.11.36--升级接口可批量获取配置
		this.getConfigMul();
		localStorage.setItem("operationBtnInfo",JSON.stringify([]))
		
		console.log('[debug-leo]' + remote.process.argv);
		let _this = this;
		if (argv[2] && argv[4] && argv[2] !== "babel-register" && argv[4] !== "babel-polyfill") {
			if(argv[argv.length - 8] && argv[argv.length - 8] == '-pageId'){
				localStorage.setItem('initPageId', argv[argv.length - 7])
			}
			if(argv[argv.length - 10] && argv[argv.length - 10] == '-historyTime'){
				localStorage.setItem('historyStartTime', argv[argv.length - 9])
			}
		}
	}

	fastLogin ()  {
		//快捷登录
		if (argv[2] && argv[4] && argv[2] !== "babel-register" && argv[4] !== "babel-polyfill") {
			if (argv[argv.length - 1] && argv[argv.length - 1].slice(argv[argv.length - 1].length - 4, argv[argv.length - 1].length) != 5000) {
				if (argv[6] && argv[8]) {
					localStorage.setItem('projectName_en', '')
					if(argv[2] == 'cx'){
						localStorage.setItem('isOnline',1)
					}
					this.onSubmitDom();
				} else {
					Modal.warning({
						title: '登陆失败',
						content: (
							<div>
								<p>点击按钮退出软件</p>
								<p>由于您使用的是DOM云服务功能，因此需要对您的DOM云账号进行认证</p>
								<p>请检查您输入的DOM云账户／密码是否有误</p>
							</div>
						),
						onOk() { closeLoginWindow() },
					});
				}
			} else {
				if (argv[6].slice(argv[6].length - 4, argv[6].length) != 5000) {
					let lastArgvIndex = argv.length - 1
					if ((argv[lastArgvIndex] && argv[lastArgvIndex].slice(argv[lastArgvIndex].length - 4, argv[lastArgvIndex].length) == 5000) || argv[lastArgvIndex].slice(argv[lastArgvIndex].length - 4, argv[lastArgvIndex].length) == 5000) {
						localStorage.setItem('projectName_en', '')
						if(argv[2] == 'cx'){
							localStorage.setItem('isOnline',1)
						}
						this.onSubmitLogin({ name: argv[2], pwd: argv[4], isRemember: false });
					} else {
						Modal.warning({
							title: '登陆失败',
							content: (
								<div>
									<p>点击按钮退出软件</p>
									<p>由于您使用的是DOM云服务功能，因此需要对您的DOM云账号进行认证</p>
									<p>请您输入的DOM云账户／密码</p>
								</div>
							),
							onOk() { closeLoginWindow() },
						});
					}
				} else {
					if(argv[2] == 'cx'){
						localStorage.setItem('isOnline',1)
					}
					this.onSubmitLogin({ name: argv[2], pwd: argv[4], isRemember: false });
				}
			}
		}
	}




	getEquipmentInfo = (data) => {
		let ChParams=[],PriChWPParams=[],CWPParams=[],CTParams=[],SecChWPParams=[],AHUParams=[],EAFanParams=[],DamperParams=[],AirCompressorCTParams=[],AirCompressorCWPParams=[],AirCompressorParams=[],DryerParams=[];
		if(data && data.ChillerPlantRoom!=undefined){
			//存储机房前缀（默认一个机房）
			localStorage.setItem('ChillerPlantRoom', data.ChillerPlantRoom[0]["RoomName"])
			
			data.ChillerPlantRoom.map(item=>{
				if(item.ChParams){
					item.ChParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'Ch0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'Ch' + item2['No']
					}
					})
					ChParams = ChParams.concat(item.ChParams)
				}
				if(item.PriChWPParams){
					item.PriChWPParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'PriChWP0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'PriChWP' + item2['No']
					}
					})
					PriChWPParams = PriChWPParams.concat(item.PriChWPParams)
				}
				if(item.CWPParams){
					item.CWPParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'CWP0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'CWP' + item2['No']
					}
					})
					CWPParams = CWPParams.concat(item.CWPParams)
				}
				if(item.CTParams){
					item.CTParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'CT0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'CT' + item2['No']
					}
					})
					CTParams = CTParams.concat(item.CTParams)
				}
				if(item.SecChWPParams){
					item.SecChWPParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'SecChWP0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'SecChWP' + item2['No']
					}
					})
					SecChWPParams = SecChWPParams.concat(item.SecChWPParams)
				}
				if(item.AHUParams){
					item.AHUParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'AHU0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'AHU' + item2['No']
					}
					})
					AHUParams = AHUParams.concat(item.AHUParams)
				}
				if(item.EAFanParams){
					item.EAFanParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'EAFan0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'EAFan' + item2['No']
					}
					})
					EAFanParams = EAFanParams.concat(item.EAFanParams)
				}
				if(item.DamperParams){
					item.DamperParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'Damper0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'Damper' + item2['No']
					}
					})
					DamperParams = DamperParams.concat(item.DamperParams)
				}
				if(item.AirCompressorCTParams){
					item.AirCompressorCTParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'AirCompressorCT0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'AirCompressorCT' + item2['No']
					}
					})
					AirCompressorCTParams = AirCompressorCTParams.concat(item.AirCompressorCTParams)
				}
				if(item.AirCompressorCWPParams){
					item.AirCompressorCWPParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'AirCompressorCWP0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'AirCompressorCWP' + item2['No']
					}
					})
					AirCompressorCWPParams = AirCompressorCWPParams.concat(item.AirCompressorCWPParams)
				}
				if(item.AirCompressorParams){
					item.AirCompressorParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'AirCompressor0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'AirCompressor' + item2['No']
					}
					})
					AirCompressorParams = AirCompressorParams.concat(item.AirCompressorParams)
				}
				if(item.DryerParams){
					item.DryerParams.map(item2=>{
					if(item2['No']<10){
						item2.idCom = item.RoomName + 'Dryer0' + item2['No']
					}else{
						item2.idCom = item.RoomName + 'Dryer' + item2['No']
					}
					})
					DryerParams = DryerParams.concat(item.DryerParams)
				}
			})

		}
		localStorage.setItem("deviceDetails",JSON.stringify({
			ChParams:ChParams,
			PriChWPParams:PriChWPParams,
			CWPParams:CWPParams,
			CTParams:CTParams,
			SecChWPParams:SecChWPParams,
			AHUParams:AHUParams,
			EAFanParams:EAFanParams,
			DamperParams:DamperParams,
			AirCompressorCTParams:AirCompressorCTParams,
			AirCompressorCWPParams:AirCompressorCWPParams,
			AirCompressorParams:AirCompressorParams,
			DryerParams:DryerParams
		}))
	}

	//获取全局配置的底部模式类型
	getModeList(data) {
		if (data && data.length != 0) {
			window.localStorage.setItem('modeButtons', JSON.stringify({
				type: data.type != undefined ? data.type : []
			}));
		} else {
			window.localStorage.setItem('modeButtons', JSON.stringify({
				type: []
			}));
		}
	}

	//获取全局配置的页面和模式的用户权限
	getRightsDefine(data) {
		if (data && (data.pageRights||data.modeRights)) {
			localStorage.setItem('projectRightsDefine', JSON.stringify(data));
		}
	}

	//获取关于用户权限管理+超时退出配置
	getConfig(data) {
		if (data != null && data.length != 0) {
			this.setState({
				accountManageConfig: data
			})
			window.localStorage.setItem('accountManageConfig', JSON.stringify({
				auto_log_out: data.auto_log_out != undefined ? data.auto_log_out : 0,
				auto_log_out_timeout: data.auto_log_out_timeout != undefined ? data.auto_log_out_timeout : 10,
				remember_pwd_enable: data.remember_pwd_enable != undefined ? data.remember_pwd_enable : 1,
				command_user_min_level: data.command_user_min_level != undefined ? data.command_user_min_level : 2
			}));
			//若配置的是不记住密码，则此次需将之前可能会保存显示的用户信息清除
			if (data.remember_pwd_enable === 0) {
				let userInfo = {
					name: '',
					pwd: '',
					isRemember: false
				}
				this.setState({
					loginInfo: userInfo
				})
			}
		} else {
			this.setState({
				accountManageConfig: {
					auto_log_out: 0,
					auto_log_out_timeout: 10,
					remember_pwd_enable: 1
				}
			})
			//当accountManageConfig的auto_log_out为0时，auto_log_out_timeout参数无效，rememer_pwd_enable默认为1即可以记住密码
			window.localStorage.setItem('accountManageConfig', JSON.stringify({
				auto_log_out: 0,
				auto_log_out_timeout: 10,
				remember_pwd_enable: 1,
				command_user_min_level: 2
			}));
		}	
	}
	//实时刷新配置
	getRefreshConfig(data) {
		if (data != undefined) {
			window.localStorage.setItem('refreshRate', data)
		} else {
			window.localStorage.setItem('refreshRate', 40)
		}
	}
	//获取报警红色字体闪烁配置
	getRedWarningConfig(data) {
		if (data != undefined) {
			window.localStorage.setItem('pagesRedWarning', data)
		} else {
			window.localStorage.setItem('pagesRedWarning', 0)
		}
	}

	//获取登录框位置和右上角栏目的前景色
	getConfigBest(data) {
		if (document.getElementById('site') != null) {
			if (data && data.loginWindowStyle == "right") {
				document.getElementById('site').style.right = 0;
				document.getElementById('site').style.left = "";
			} else if (data && data.loginWindowStyle == "left") {
				document.getElementById("site").style.left = 0;
				document.getElementById('site').style.right = "";
			} else {
				document.getElementById("site").style.right = '33.33334%';
				document.getElementById("site").style.left = '';
			};
		}
		
		if (document.getElementById("RightTopIP") != null) {
			if (data && data.loginColorFg != "" && data.loginColorFg != null && data.loginColorFg != " ") {
				document.getElementById("RightTopIP").style.color = data.loginColorFg;
				document.getElementById("RightTopConfig").style.color = data.loginColorFg;
				document.getElementById("RightTopClose").style.color = data.loginColorFg;
			} else {
				document.getElementById("RightTopIP").style.color = 'white';
				document.getElementById("RightTopConfig").style.color = 'white';
				document.getElementById("RightTopClose").style.color = 'white';
			};
		}

		if (document.getElementById("name") != null) {
			if (data && data.loginInputColorBg != "" && data.loginInputColorBg != null && data.loginInputColorBg != " ") {
				document.getElementById("name").style.background = data.loginInputColorBg;
				document.getElementById("pwd").style.background = data.loginInputColorBg;
			} else {
				document.getElementById("name").style.background = "";
				document.getElementById("pwd").style.background = "";
			}
		}

		if (document.getElementById("rember") != null) {
			if (data && data.loginRemberColorFg != "" && data.loginRemberColorFg != null && data.loginRemberColorFg != " ") {
				document.getElementById("rember").style.color = data.loginRemberColorFg;
			} else {
				document.getElementById("rember").style.color = "white";
			}
		}
	}

	//获取天气是否显示的配置
	getConfigWeather(data) {
		if (data != undefined) {
			window.localStorage.setItem('weatherDis', data)
		} else {
			window.localStorage.setItem('weatherDis', 0)
		}
	}

	//获取机器码
	getNumber() {
		this.setState({
			isRegistModal: true
		})
	}
	//关闭窗口
	handHideRegisterModal() {
		this.setState({
			isRegistModal: false
		})
	}
	//加入不注册取消，也可以进入主界面
	enterMainBody() {
		afterLoginSuccess()
	}

	getInitLoginInfo() {
		// 查看浏览器是否存有用户信息
		let userInfo = localStorage.getItem('userInfo');
		if (userInfo) {
			userInfo = JSON.parse(userInfo);
			if (userInfo.pwd === '') {
				userInfo.name = '';
			};
			return userInfo;
		} else {
			return {
				name: '',
				pwd: '',
				isRemember: false
			};
		}
	}

	doLogin(data) {
		//初始化刷新到首页的标记
		localStorage.setItem('creatAppWindow',1);
		localStorage.setItem('beforeWindowWidth',window.innerWidth);
		return http.post('/login', data);
	}

	toggleLoading() {
		this.setState({
			loading: !this.state.loading
		});
	}

	showError(code) {
		if (code === 1) {
			this.setState({
				error: {
					show: true,
					msg: '用户名或密码错误！'
				}
			});
		}
	}

	hideError() {
		this.setState({
			error: {
				show: false,
				msg: ''
			}
		});
	}

	//关闭项目选择窗口
	handHideProjModal() {
		this.setState({
			showProjSelectModal: false
		})
	}

	onSubmitAdmin({ name, pwd, isRemember }) {
		// show loading
		let _this = this
		this.setState({
			adminName: name,
			adminPassword: pwd
		})
		this.toggleLoading()
		let ip = "http://47.100.17.99"
		if(localStorage.getItem('serverOmd')=="best"){
		ip = "http://106.14.226.254"
		}
		httpTo.post(`${ip}/api/login/2`, {
			name: name,
			pwd: pwd,
			agent: {
				// TODO post truely user browser info
				'screen': '1920 x 1080',
				'browser': 'Chrome',
				'browserVersion': '55.0.2883.87',
				'mobile': false,
				'os': 'Windows',
				'osVersion': 'NT 4.0',
			}
		}).then(
			data => {
				if (data.status == true) {
					let projects = [] //保存所有项目的容器
					data.projects.forEach((item) => {
						projects.push({
							projectId: item.id,
							projectName: item.name_cn,
							projectPic: item.pic,
							projectAddress: item.address,
							projectlastReceivedTime: item.projectlastReceivedTime,
							isFavorite: item.isFavorite,
							nameEn: item.name_en,
							projectTime: item.gmt_time,
							projectUpdateTime: item.update_time
						})
					})
					this.setState({
						projectList: projects,
						showProjSelectModal: true
					})
				} else {
					Modal.error({
						title: '登录失败',
						content: data.msg
					})
				}
				this.toggleLoading();
			}
		).catch(
			err => {
				Modal.error({
					title: '登录失败',
					content: "登录请求返回错误"
				})
				if (this.state.loading) {
					this.toggleLoading();
				}
			}
		);
	}

	//免登录时dom信息的验证
	onSubmitDom() {
		let serverUrl = localStorage.getItem('serverUrl')
		let serverUrlProjId = serverUrl.slice(serverUrl.length - 3, serverUrl.length)
		let _this = this
		let timer = setTimeout(()=>{
			_this.onSubmitLogin({ name: argv[2], pwd: argv[4], isRemember: false })
		},30000)
		let ip = "http://47.100.17.99"
		if(localStorage.getItem('serverOmd')=="best"){
		ip = "http://106.14.226.254"
		}
		httpTo.post(`${ip}/api/login/2`, {
			name: argv[6],
			pwd: argv[8],
			agent: {
				// TODO post truely user browser info
				'screen': '1920 x 1080',
				'browser': 'Chrome',
				'browserVersion': '55.0.2883.87',
				'mobile': false,
				'os': 'Windows',
				'osVersion': 'NT 4.0',
			}
		}).then(
			data => {
				clearTimeout(timer)
				if (data.status == true) {
					let projects = [] //保存所有项目的容器
					try {
						data.projects.forEach((item, i) => {
							//判断如果输入的ip后三位在云端账号返回的项目id一致，则进入OM登陆验证
							if (item.id === Number(serverUrlProjId)) {
								localStorage.setItem('projectName_en', item.name_en)
								_this.onSubmitLogin({ name: argv[2], pwd: argv[4], isRemember: false })
								throw new Error('验证成功，跳出')
							} else {
								if (i === data.projects.length - 1) {
									Modal.warning({
										title: 'DOM云身份验证失败',
										content: (
											<div>
												<p>点击按钮退出软件</p>
												<p>您的DOM云账号无权限访问该项目</p>
											</div>
										),
										onOk() { closeLoginWindow() },
									});
								}
							}
						})
					} catch (e) {
						console.log('dom验证成功')
					}
				} else {
					Modal.warning({
						title: 'DOM云身份验证失败',
						content: (
							<div>
								<p>点击按钮退出软件</p>
								<p>请检查您输入的DOM云账户／密码是否有误</p>
							</div>
						),
						onOk() { closeLoginWindow() },
					});
				}
			}
		).catch(
			err => {
				Modal.warning({
					title: 'DOM云身份验证失败',
					content: (
						<div>
							<p>点击按钮退出软件</p>
							<p>请检查您输入的DOM云账户／密码是否有误</p>
						</div>
					),
					onOk() { closeLoginWindow() },
				});
			}
		);
	}

	//点击登陆后，如果端口不是5000，则判断为穿透，需要进行dom验证
	onSubmit({ name, pwd, isRemember }) {
		let serverUrl = localStorage.getItem('serverUrl')
		if (serverUrl.indexOf(" ") != -1) {
			Modal.warning({
				title: '服务器地址错误',
				content: (
					<div>
						<p>请检查您输入的服务器地址</p>
						<p>服务器地址的首尾及内部不能存在空格</p>
					</div>
				)
			})
			return
		}

		if (serverUrl.slice(serverUrl.length - 4, serverUrl.length) != 5000) {
			this.setState({
				showDomVerify: true,
				name: name,
				password: pwd
			})
			//this.onSubmitLogin({name, pwd, isRemember})
		} else {
			this.onSubmitLogin({ name, pwd, isRemember })
		}
	}

	//已经完成dom验证，进行OM登陆处理
	onSubmitLogin({ name, pwd, isRemember }) {
		// show loading
		let _this = this
		this.setState({
			name: name,
			password: pwd
		});
		this.toggleLoading();
		if (name === 'cx' && pwd === 'DOM.cloud-2016') {
			window.localStorage.setItem('userData', JSON.stringify({
				id: 0,
				name: name,
				role: 4
			}));
			if (isRemember) {
				// 将用户名和密码存储到 localStorage 中
				window.localStorage.setItem('userInfo', JSON.stringify({
					name: name,
					pwd: pwd,
					isRemember: isRemember
				}));
			} else {
				window.localStorage.setItem('userInfo', JSON.stringify({
					name: name,
					pwd: "",
					isRemember: false
				}))
			}
			// login success
			addOperation('/operationRecord/addLogin', {
				"userName": name,
				"type": 1,
				"address": '',
				"lang": "zh-cn"
			}, '记录用户登录操作失败')
		}
		if (name === 'guest' && pwd === 'guest') {
			// 将返回的用户信息（权限，ID，名称）放到 localStorage 里
			window.localStorage.setItem('userData', JSON.stringify({
				id: 9999,
				name: name,
				role: 1
			}));
			if (isRemember) {
				// 将用户名和密码存储到 localStorage 中
				window.localStorage.setItem('userInfo', JSON.stringify({
					name: name,
					pwd: pwd,
					isRemember: isRemember
				}));
			} else {
				window.localStorage.setItem('userInfo', JSON.stringify({
					name: name,
					pwd: "",
					isRemember: false
				}))
			}
		}
		//   afterLoginSuccess()
		//   return 
		// }
		// login valid
		this.doLogin({
			name: name,
			pwd: pwd
		}).then(
			data => {
				http.post('/license/getRequestNo', {
				}).then(
					code => {
						this.setState({
							machinecode: code.data
						})
					}
				)
				if (data.err) {
					message.error('账户／密码输入错误')
					this.showError(data.msg);
					if (argv[2] && argv[4] && argv[2] !== "babel-register" && argv[4] !== "babel-polyfill") {
						Modal.warning({
							title: '账户／密码输入错误',
							content: (
								<div>
									<p>点击按钮退出软件</p>
									<p>请检查您输入的账户／密码是否有误</p>
								</div>
							),
							onOk() { closeLoginWindow() },
						});
					}
				}
				// //存放id,用户名，用户的角色
				// if ( name != 'cx' && name != 'guest') {
				let flagNewVersion = 0
				if (data.pysiteversion != undefined) {
					flagNewVersion = 1
				}
				window.localStorage.setItem('flagNewVersion', flagNewVersion);
				window.localStorage.setItem('pysiteVersion', data.pysiteversion);
				window.localStorage.setItem('userData', JSON.stringify({
					id: data.data.id,
					name: data.data.name,
					role: data.data.role,
					flagNewVersion: flagNewVersion
				}));
				if (isRemember) {
					// 将用户名和密码存储到 localStorage 中
					window.localStorage.setItem('userInfo', JSON.stringify({
						name: name,
						pwd: pwd,
						isRemember: isRemember
					}));

				} else {
					window.localStorage.setItem('userInfo', JSON.stringify({
						name: name,
						pwd: "",
						isRemember: false
					}))
				}
				this.setState({
					role: data.data.role
				})
				// }
				// hide loading
				this.toggleLoading();

				//判断logoURL是否存在
				if (data.logoURL !== null && data.logoURL !== '') {
					window.localStorage.setItem('logoURL', data.logoURL)
				} else {
					window.localStorage.setItem('logoURL', "")
				}

				if (data.license.expired == 0) {
					if (data.license.leftdays > 30) {
						afterLoginSuccess()
						window.localStorage.setItem('leftday', JSON.stringify({
							leftday: data.license.leftdays
						}))
					} else if (parseInt(data.license.leftdays) <= 30 && parseInt(data.license.leftdays) > 0) {
						window.localStorage.setItem('leftday', JSON.stringify({
							leftday: data.license.leftdays
						}))
						Modal.confirm({
							content: `软件授权剩余有效期${data.license.leftdays}天，请及时输入注册序列号`,
							okText: '已获取到序列号，点此输入',
							onOk: _this.getNumber,
							cancelText: "跳过注册",
							onCancel: _this.enterMainBody,
							iconType: 'info-circle'
						})
					} else {
						this.setState({
							isRegistModal: true,
							leftday: data.license.leftdays
						})
					}
					this.hideError();
					// 将返回的用户信息（权限，ID，名称）放到 localStorage 里

					// window.localStorage.setItem('userData', JSON.stringify({
					//       id: 0,
					//       name: name,
					//       role: 4
					//     }));

					// login success
					addOperation('/operationRecord/addLogin', {
						"userName": name,
						"type": 1,
						"address": '',
						"lang": "zh-cn"
					}, '记录用户登录操作失败')

				} else if (data.license.expired == 1) {
					this.setState({
						isRegistModal: true,
						leftday: data.license.leftdays
					})
				}
			}

		).catch(
			err => {
				if (this.state.loading) {
					this.toggleLoading();
				}
			}
		);
	}
	toggleIsRememeber() {
		let loginInfo = this.state.loginInfo;
		//切换记住密码选项
		this.setState({
			loginInfo: Object.assign({}, loginInfo, { isRemember: !loginInfo.isRemember })
		});
	}
	handleClose() {
		closeLoginWindow();
	}
	handleShowConfigModal() {
		this.setState({
			isShowConfigModal: true,
			initialServerUrl: localStorage.getItem('serverUrl')
		});
	}
	handleHideConfigModal() {
		this.setState({
			isShowConfigModal: false
		});
	}

	hideDomVerify() {
		this.setState({
			showDomVerify: false
		})
	}
	//dompysite版本：>=0.11.36--升级接口可批量获取配置
	getConfigMul () {
		http.get('/version').then(
			data=>{
				if (!data.err && data.data && data.data.dompysite) {
					let arr = data.data.dompysite.split(".")
					let varsion = Number(arr[0])*10000 + Number(arr[1])*100 + Number(arr[2]) 
					if (varsion < 1136) {
						Modal.warning ({
							title: '后台（dompysite）版本过低',
							content: "获取项目配置失败，请检查并升级dompysite进程，否则会影响部分项目配置功能失效或显示混乱！",
							closable:true,
							maskClosable:false,
							okText:'确定',
							onOk: () => {}
						})

						//项目配置的初始化（如果读不到配置，则创建默认值，防止报错影响正常使用）
						localStorage.removeItem("AplhaNoFlow");
						localStorage.removeItem("animation_status_on_color");
						localStorage.setItem('hideLoading', 0);
						localStorage.setItem('soundAlarm', 0);
						localStorage.setItem('automaticAlarm', 0);
						localStorage.removeItem("omTitle");
						localStorage.setItem("deviceDetails",JSON.stringify({
							ChParams:[],
							PriChWPParams:[],
							CWPParams:[],
							CTParams:[],
							SecChWPParams:[],
							AHUParams:[],
							EAFanParams:[],
							DamperParams:[],
							AirCompressorCTParams:[],
							AirCompressorCWPParams:[],
							AirCompressorParams:[],
							DryerParams:[]
						}))
						this.setState({
							accountManageConfig: {
								auto_log_out: 0,
								auto_log_out_timeout: 10,
								remember_pwd_enable: 1
							}
						})
						//当accountManageConfig的auto_log_out为0时，auto_log_out_timeout参数无效，rememer_pwd_enable默认为1即可以记住密码
						window.localStorage.setItem('accountManageConfig', JSON.stringify({
							auto_log_out: 0,
							auto_log_out_timeout: 10,
							remember_pwd_enable: 1,
							command_user_min_level: 2
						}));
						window.localStorage.setItem('modeButtons', JSON.stringify({
							type: []
						}));
						window.localStorage.setItem('weatherDis', 0)
						window.localStorage.setItem('refreshRate', 40)
						window.localStorage.setItem('pagesRedWarning', 0)
						//快捷登录
						this.fastLogin();


					}else {

						let chillerPlantRoom = null,
						accountManageConfig = null,
						omStyle = null,
						weatherDisplay = null,
						modeButtonDefine = null,
						projectRightsDefine = null,
						refreshRateConfig = null,
						pagesRedWarning = null;

						http.post('/project/getConfigMul', {
							keyList:["pipe_global_config",
									"om_global_config",
									"hideLoading",
									"warning_notice_config",
									"globalconfig",
									"account_manage_config",
									"om_style",
									"weather_display",
									"mode_button_define",
									"project_rights_define",
									"refresh_rate_config",
									"pages_red_warning",
									"energy_management_define",
									"expert_optimize_config"
							]
						}).then(data=>{
							//管道透明度配置
							if (data.data && data.data.pipe_global_config != undefined) {
								if (data.data.pipe_global_config.AplhaNoFlow) {
									localStorage.setItem('AplhaNoFlow', data.data.pipe_global_config.AplhaNoFlow);
								} else {
									localStorage.removeItem("AplhaNoFlow");
								}
							}
							//动画全局属性配置
							if (data.data && data.data.om_global_config != undefined) {
								if (data.data.om_global_config.animation_status_on_color) {
									localStorage.setItem('animation_status_on_color', data.data.om_global_config.animation_status_on_color);
								} else {
									localStorage.removeItem("animation_status_on_color");
								}
								if (data.data.om_global_config.animation_icon_move) {
									localStorage.setItem('animation_icon_move', JSON.stringify(data.data.om_global_config.animation_icon_move));
								}
							}
							//设定值取消loading
							if (data.data && data.data.hideLoading != undefined) {
								if (data.data.hideLoading == 1) {
									localStorage.setItem('hideLoading', 1);
								} else {
									if (data.data.hideLoading.enabled && data.data.hideLoading.enabled == 1) {
										localStorage.setItem('hideLoading', 1);
									} else {
										localStorage.setItem('hideLoading', 0);
									}
								}
							}else {
								localStorage.setItem('hideLoading', 0);
							}
							//报警音和弹框配置
							if (data.data && data.data.warning_notice_config != undefined) {
								if (data.data.warning_notice_config.window) {
									localStorage.setItem('automaticAlarm', data.data.warning_notice_config.window);
								} else {
									localStorage.setItem('automaticAlarm', 0);
								}
								if (data.data.warning_notice_config.sound) {
									localStorage.setItem('soundAlarm', data.data.warning_notice_config.sound);
								} else {
									localStorage.setItem('soundAlarm', 0);
								}
							}else {
								localStorage.setItem('soundAlarm', 0);
								localStorage.setItem('automaticAlarm', 0);
							}
							
							if(data.data && data.data.om_style != undefined){
								//左上角配置名称
								if(data.data.om_style.windowTitle != undefined){
									localStorage.setItem("omTitle",data.data.om_style.windowTitle);
								}else {
									localStorage.removeItem("omTitle");
								}
								//血条内样式
								if(data.data.om_style.equipmentIcon != undefined){
									localStorage.setItem("equipmentIconStyle",data.data.om_style.equipmentIcon.bgStyle);
								}else {
									localStorage.removeItem("equipmentIconStyle");
								}
								//AL
								if(data.data.om_style.EquipmentAutoDisplay != undefined){
									localStorage.setItem("EquipmentAutoDisplay",data.data.om_style.EquipmentAutoDisplay);
								}else {
									localStorage.removeItem("EquipmentAutoDisplay");
								}
								//ED
								if(data.data.om_style.EquipmentEnabledDisplay != undefined){
									localStorage.setItem("EquipmentEnabledDisplay",data.data.om_style.EquipmentEnabledDisplay);
								}else {
									localStorage.removeItem("EquipmentEnabledDisplay");
								}
							}else{
								localStorage.removeItem("EquipmentAutoDisplay");
								localStorage.removeItem("EquipmentEnabledDisplay");
							}
							
							//标准能管管理配置
							if (data.data && data.data.energy_management_define != undefined) {
								localStorage.setItem('energyManagementDefine', JSON.stringify(data.data.energy_management_define));
							}else {
								localStorage.setItem('energyManagementDefine', null);
							}
							//获取专家优化调试学习表配置
							if (data.data && data.data.expert_optimize_config != undefined) {
								localStorage.setItem('expertOptimizeConfig', JSON.stringify(data.data.expert_optimize_config));
							}else {
								localStorage.setItem('expertOptimizeConfig', null);
							}
							//设备台账配置
							this.getEquipmentInfo(data.data && data.data.globalconfig != undefined ? data.data.globalconfig : chillerPlantRoom);
							//获取登录框位置和右上角栏目的前景色
							this.getConfig(data.data && data.data.account_manage_config != undefined ? data.data.account_manage_config : accountManageConfig);
							//获取全局配置的底部模式类型
							this.getModeList(data.data && data.data.mode_button_define != undefined ? data.data.mode_button_define : modeButtonDefine);
							//获取天气是否显示的配置
							this.getConfigWeather(data.data && data.data.weather_display != undefined ? data.data.weather_display : weatherDisplay);
							//获取全局配置的页面和模式的用户权限
							this.getRightsDefine(data.data && data.data.project_rights_define != undefined ? data.data.project_rights_define : projectRightsDefine);
							//实时刷新配置
							this.getRefreshConfig(data.data && data.data.refresh_rate_config != undefined ? data.data.refresh_rate_config : refreshRateConfig);
							//获取报警红色字体闪烁配置
							this.getRedWarningConfig(data.data && data.data.pages_red_warning != undefined ? data.data.pages_red_warning : pagesRedWarning);
							//获取全局配置的底部模式类型
							this.getConfigBest(data.data && data.data.om_style != undefined ? data.data.om_style : omStyle);
							
							//快捷登录
							this.fastLogin();

						}).catch(
							err => {
								//项目配置的初始化（如果读不到配置，则创建默认值，防止报错影响正常使用）
								localStorage.removeItem("AplhaNoFlow");
								localStorage.removeItem("animation_status_on_color");
								localStorage.setItem('hideLoading', 0);
								localStorage.setItem('soundAlarm', 0);
								localStorage.setItem('automaticAlarm', 0);
								localStorage.removeItem("omTitle");
								localStorage.setItem("deviceDetails",JSON.stringify({
									ChParams:[],
									PriChWPParams:[],
									CWPParams:[],
									CTParams:[],
									SecChWPParams:[],
									AHUParams:[],
									EAFanParams:[],
									DamperParams:[],
									AirCompressorCTParams:[],
									AirCompressorCWPParams:[],
									AirCompressorParams:[],
									DryerParams:[]
								}))
								this.setState({
									accountManageConfig: {
										auto_log_out: 0,
										auto_log_out_timeout: 10,
										remember_pwd_enable: 1
									}
								})
								//当accountManageConfig的auto_log_out为0时，auto_log_out_timeout参数无效，rememer_pwd_enable默认为1即可以记住密码
								window.localStorage.setItem('accountManageConfig', JSON.stringify({
									auto_log_out: 0,
									auto_log_out_timeout: 10,
									remember_pwd_enable: 1,
									command_user_min_level: 2
								}));
								window.localStorage.setItem('modeButtons', JSON.stringify({
									type: []
								}));
								window.localStorage.setItem('weatherDis', 0)
								window.localStorage.setItem('refreshRate', 40)
								window.localStorage.setItem('pagesRedWarning', 0)
								//快捷登录
								this.fastLogin();
							}
						)
					}
				}else {
					//项目配置的初始化（如果读不到配置，则创建默认值，防止报错影响正常使用）
					localStorage.removeItem("AplhaNoFlow");
					localStorage.removeItem("animation_status_on_color");
					localStorage.setItem('hideLoading', 0);
					localStorage.setItem('soundAlarm', 0);
					localStorage.setItem('automaticAlarm', 0);
					localStorage.removeItem("omTitle");
					localStorage.setItem("deviceDetails",JSON.stringify({
						ChParams:[],
						PriChWPParams:[],
						CWPParams:[],
						CTParams:[],
						SecChWPParams:[],
						AHUParams:[],
						EAFanParams:[],
						DamperParams:[],
						AirCompressorCTParams:[],
						AirCompressorCWPParams:[],
						AirCompressorParams:[],
						DryerParams:[]
					}))
					this.setState({
						accountManageConfig: {
							auto_log_out: 0,
							auto_log_out_timeout: 10,
							remember_pwd_enable: 1
						}
					})
					//当accountManageConfig的auto_log_out为0时，auto_log_out_timeout参数无效，rememer_pwd_enable默认为1即可以记住密码
					window.localStorage.setItem('accountManageConfig', JSON.stringify({
						auto_log_out: 0,
						auto_log_out_timeout: 10,
						remember_pwd_enable: 1,
						command_user_min_level: 2
					}));
					window.localStorage.setItem('modeButtons', JSON.stringify({
						type: []
					}));
					window.localStorage.setItem('weatherDis', 0)
					window.localStorage.setItem('refreshRate', 40)
					window.localStorage.setItem('pagesRedWarning', 0)
					//快捷登录
					this.fastLogin();
				}
			}
		).catch(
			err =>{
				//项目配置的初始化（如果读不到配置，则创建默认值，防止报错影响正常使用）
				localStorage.removeItem("AplhaNoFlow");
				localStorage.removeItem("animation_status_on_color");
				localStorage.setItem('hideLoading', 0);
				localStorage.setItem('soundAlarm', 0);
				localStorage.setItem('automaticAlarm', 0);
				localStorage.removeItem("omTitle");
				localStorage.setItem("deviceDetails",JSON.stringify({
					ChParams:[],
					PriChWPParams:[],
					CWPParams:[],
					CTParams:[],
					SecChWPParams:[],
					AHUParams:[],
					EAFanParams:[],
					DamperParams:[],
					AirCompressorCTParams:[],
					AirCompressorCWPParams:[],
					AirCompressorParams:[],
					DryerParams:[]
				}))
				this.setState({
					accountManageConfig: {
						auto_log_out: 0,
						auto_log_out_timeout: 10,
						remember_pwd_enable: 1
					}
				})
				//当accountManageConfig的auto_log_out为0时，auto_log_out_timeout参数无效，rememer_pwd_enable默认为1即可以记住密码
				window.localStorage.setItem('accountManageConfig', JSON.stringify({
					auto_log_out: 0,
					auto_log_out_timeout: 10,
					remember_pwd_enable: 1,
					command_user_min_level: 2
				}));
				window.localStorage.setItem('modeButtons', JSON.stringify({
					type: []
				}));
				window.localStorage.setItem('weatherDis', 0)
				window.localStorage.setItem('refreshRate', 40)
				window.localStorage.setItem('pagesRedWarning', 0)
				//快捷登录
				this.fastLogin();
			}
		)
	}

	ChangeSite(number) {
		this.setState({
			changeSite: number,
		});
		//修改服务器地址后重新获取项目配置
		this.getConfigMul(false);
	}

	render() {
		const { loading, loginInfo, error, showDomVerify } = this.state;
		return (
			<div>
				{
					argv[2] && argv[4] && argv[2] !== "babel-register" && argv[4] !== "babel-polyfill" ?
						<div>
							<RegistModal
								visible={this.state.isRegistModal}
								machinecode={this.state.machinecode}
								handleHide={this.handHideRegisterModal}
								name={this.state.name}
								password={this.state.password}
								role={this.state.role}
								leftday={this.state.leftday}
							/>
						</div>
						:
						<div className={cx(s['login-form'], 'login-form-wrap')}>
							<div className={s['login-form-btns']}>
								<div className={s['login-form-urlname']}>
									<span id="RightTopIP">{localStorage.getItem('serverName') === '' ? localStorage.getItem('serverUrl') : localStorage.getItem('serverName')}</span>
								</div>
								<div className={s['login-form-close-btn']}>
									<Icon type="close" onClick={this.handleClose} id="RightTopConfig" />
								</div>
								<div className={s['login-form-config-btn']}>
									{
										db.getState().modal != "admin" ?
											<Icon type="setting" onClick={this.handleShowConfigModal} id="RightTopClose" />
											:
											null
									}
								</div>
							</div>
							{
								db.getState().modal == "admin" ?
									<AdminLoginForm
										loginInfo={loginInfo}
										loading={loading}
										onSubmitAdmin={this.onSubmitAdmin}
										toggleIsRememeberBtn={this.toggleIsRememeber}
										accountManageConfig={this.state.accountManageConfig}
									/>

									:
									<div>
										<LoginForm
											loginInfo={loginInfo}
											loading={loading}
											onSubmit={this.onSubmit}
											toggleIsRememeberBtn={this.toggleIsRememeber}
											accountManageConfig={this.state.accountManageConfig}
										/>
										<ConfigModal
											visible={this.state.isShowConfigModal}
											handleHide={this.handleHideConfigModal}
											initialServerUrl={this.state.initialServerUrl}
											ChangeSite={this.ChangeSite}
										/>
									</div>
							}
							<RegistModal
								visible={this.state.isRegistModal}
								machinecode={this.state.machinecode}
								handleHide={this.handHideRegisterModal}
								name={this.state.name}
								password={this.state.password}
								role={this.state.role}
								leftday={this.state.leftday}
							/>
							<div style={{ top: "20%" }} >
								<ProjSelectModal
									visible={this.state.showProjSelectModal}
									handleHide={this.handHideProjModal}
									projects={this.state.projectList}
									onSubmit={this.onSubmit}
								/>
							</div>
							{
								error.show ?
									<Alert
										className={s['login-error-tip']}
										message={error.msg}
										type="error"
										closeText="关闭"
										onClose={this.hideError}
										showIcon
									/> : null
							}
							{
								showDomVerify ?
									<DomVerifyModal
										visible={this.state.showDomVerify}
										hideDomVerify={this.hideDomVerify}
										name={this.state.name}
										password={this.state.password}
										onSubmitLogin={this.onSubmitLogin}
									/>
									: ''
							}
						</div>
				}
			</div>
		);
	}
}

export default Login;

