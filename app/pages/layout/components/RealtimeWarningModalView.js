/**
 * 实时报警模态框
 */
import React, { PropTypes } from 'react';
import { Modal, Button, InputNumber, Table, message, Input, Form, Tabs, Badge, Icon } from 'antd';
import moment from 'moment';
import http from '../../../common/http';
import s from './RealtimeWarningModalView.css'
import RealWarningWorker from './wanging.worker'
import appConfig from '../../../common/appConfig'
import HistoryWarningView from './HistoryWarningModalView';
import { getTendencyModalByTime } from '../../Trend/modules/TrendModule';

const { TabPane } = Tabs
var timer



class RealtimeWarningModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			mounted: false,
			realtimeWarningData: [],
			failedTime: 0,
			healthErrList: [0, 0, 0],
			healthDataStatus: true,
			playFlag: false,
			playState: '未启用',
			warning: '',
			warningVisible: false,
			warningCheckDisabled: '',
			warningInfoList: [],
			warningNum: 0,
			activeKey: '1',
			remark:'',
			infoList:[],
			warningStatusBy135: 0
		}

		this.workerUpdate = null
		this.workerUpdateBulb = null
		this.workerUpdateFault = null
		this.workerWarning = null
		this.startWorker = this.startWorker.bind(this);
		this.stopWorker = this.stopWorker.bind(this)
		this.refreshData = this.refreshData.bind(this)
		this.refreshHealthData = this.refreshHealthData.bind(this);
		this.timingPlay = this.timingPlay.bind(this);
		this.refreshFaultData = this.refreshFaultData.bind(this);
	
	}

	//组件加载完成
	componentDidMount() {
		http.post('/project/getConfig', {
			key: "warningCheckDisabled"
		}).then(
			data => {
				this.setState({
					warningCheckDisabled: data.data
				})
			}
		).catch(
			err => {

			}
		)
		localStorage.setItem('WarningPages', [])
		this.props.getWorkerDict({ startWorker: this.startWorker, stopWorker: this.stopWorker })
		window.setTimeout(() => {
			this.setState({
				mounted: true
			}, this.startWorker);
		}, 0);

	}

	//组件即将卸载
	componentWillUnmount() {
		this.workerUpdate.terminate();
		this.workerUpdateBulb.terminate();
		this.workerUpdateFault.terminate();
		this.workerWarning.terminate();
	}

	//开始建立一个实时请求
	startWorker() {
		this.stopWorker()
		// 创建Worker实例
		this.workerUpdate = new RealWarningWorker();
		this.workerUpdate.self = this;

		this.workerUpdate.addEventListener("message", this.refreshData, true);

		this.workerUpdate.addEventListener("error", function (e) {
			console.warn(e);
		}, true);
		//传数据
		this.workerUpdate.postMessage({
			serverUrl: appConfig.serverUrl,
			type: "realWarning"
		});
		// 创建Worker实例
		this.workerUpdateBulb = new RealWarningWorker();
		this.workerUpdateBulb.self = this;

		this.workerUpdateBulb.addEventListener("message", this.refreshHealthData, true);

		this.workerUpdateBulb.addEventListener("error", function (e) {
			console.warn(e);
		}, true);
		//传数据
		this.workerUpdateBulb.postMessage({
			serverUrl: appConfig.serverUrl,
			type: "realHealth"
		});
		// 创建Worker实例
		this.workerUpdateFault = new RealWarningWorker();
		this.workerUpdateFault.self = this;

		this.workerUpdateFault.addEventListener("message", this.refreshFaultData, true);

		this.workerUpdateFault.addEventListener("error", function (e) {
			console.warn(e);
		}, true);
		//传数据
		localStorage.setItem('nowUser',JSON.parse(localStorage.getItem('userData')).name)
		this.workerUpdateFault.postMessage({
			serverUrl: appConfig.serverUrl,
			user: JSON.parse(localStorage.getItem('userData')).name,
			type: "realFault"
		});

		// 创建Worker实例
		this.workerWarning = new RealWarningWorker();
		this.workerWarning.self = this;

		this.workerWarning.addEventListener("message", this.refreshWarningData, true);

		this.workerWarning.addEventListener("error", function (e) {
			console.warn(e);
		}, true);
		//传数据
		this.workerWarning.postMessage({
			serverUrl: appConfig.serverUrl,
			type: "warningData"
		});
	}

	stopWorker() {
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
			this.workerUpdate.removeEventListener("message", this.refreshData, true);
		}
		if (this.workerUpdateBulb) {
			this.workerUpdateBulb.terminate();
			this.workerUpdateBulb.removeEventListener("message", this.refreshHealthData, true);
		}
		if (this.workerUpdateFault) {
			this.workerUpdateFault.terminate();
			this.workerUpdateFault.removeEventListener("message", this.refreshFaultData, true);
		}
		if (this.workerWarning) {
			this.workerWarning.terminate();
			this.workerWarning.removeEventListener("message", this.refreshWarningData, true);
		}
	}

	refreshFaultData(e) {
		if(localStorage.getItem('nowUser') != JSON.parse(localStorage.getItem('userData')).name){
			if (this.workerUpdateFault) {
				this.workerUpdateFault.terminate();
				this.workerUpdateFault.removeEventListener("message", this.refreshFaultData, true);
				// 创建Worker实例
				this.workerUpdateFault = new RealWarningWorker();
				this.workerUpdateFault.self = this;

				this.workerUpdateFault.addEventListener("message", this.refreshFaultData, true);

				this.workerUpdateFault.addEventListener("error", function (e) {
					console.warn(e);
				}, true);
				//传数据
				localStorage.setItem('nowUser',JSON.parse(localStorage.getItem('userData')).name)
				this.workerUpdateFault.postMessage({
					serverUrl: appConfig.serverUrl,
					user: JSON.parse(localStorage.getItem('userData')).name,
					type: "realFault"
				});
			}
		}else{
			if(e.data.err==0){
				this.props.refreshFaultNum(e.data.data)
			}else{
				this.props.refreshFaultNum(0)
			}
		}
		
	}

	refreshHealthData(e) {
		let interfaceStatus = !e.data.interfaceStatus
		// console.log(e)
		if (!interfaceStatus) {
			if (this.state.healthDataStatus) {
				//修改接口状态，false时不显示灯
				this.props.changeHealthDataStatus(false)
				this.setState({
					healthDataStatus: false
				})
			}
		}
		if (e.data.err === 0) {
			let healthData = e.data.data
			this.props.changeHealthDataStatus(true)
			//对比state里上次的Err数量，如果没变，则不调用action
			this.state.healthErrList.forEach((item, j) => {
				if (healthData[j].err != item) {
					this.props.saveHealthData(healthData)
					let list = this.state.healthErrList
					list[j] = healthData[j].err
					this.setState({
						healthErrList: list
					})
				}
			})
		} else {
			if (this.state.healthDataStatus) {
				this.props.changeHealthDataStatus(false)
				this.setState({
					healthDataStatus: false
				})
			}
		}

	}

	//刷新数据
	refreshData(e) {
		if(e.data['fireMode'] != undefined){
			if(localStorage.getItem('fireMode')){
				if(localStorage.getItem('fireMode') != e.data['fireMode']){
					localStorage.setItem('fireMode',e.data['fireMode'])
				}
			}else{
				localStorage.setItem('fireMode',e.data['fireMode'])
			}
		}
		//为网络架构图存储 离线 清单
		if(e.data['netDeviceDropWarningList'] != undefined){
			if(localStorage.getItem('netDeviceDropWarningList')){
				if(localStorage.getItem('netDeviceDropWarningList') != JSON.stringify(e.data['netDeviceDropWarningList'])){
					localStorage.setItem('netDeviceDropWarningList',JSON.stringify(e.data['netDeviceDropWarningList']))
				}
			}else{
				localStorage.setItem('netDeviceDropWarningList',JSON.stringify(e.data['netDeviceDropWarningList']))
			}
		}

		//为网络架构图存储 在线 清单
		if(e.data['netDeviceOnlineList'] != undefined){
			if(localStorage.getItem('netDeviceOnlineList')){
				if(localStorage.getItem('netDeviceOnlineList') != JSON.stringify(e.data['netDeviceOnlineList'])){
					localStorage.setItem('netDeviceOnlineList',JSON.stringify(e.data['netDeviceOnlineList']))
				}
			}else{
				localStorage.setItem('netDeviceOnlineList',JSON.stringify(e.data['netDeviceOnlineList']))
			}
		}

		//为网络架构图存储 无法判断状态 清单
		if(e.data['netDeviceUnclearList'] != undefined){
			if(localStorage.getItem('netDeviceUnclearList')){
				if(localStorage.getItem('netDeviceUnclearList') != JSON.stringify(e.data['netDeviceUnclearList'])){
					localStorage.setItem('netDeviceUnclearList',JSON.stringify(e.data['netDeviceUnclearList']))
				}
			}else{
				localStorage.setItem('netDeviceUnclearList',JSON.stringify(e.data['netDeviceUnclearList']))
			}
		}

		if (this.state.warningCheckDisabled == 1) {
			e.data['warningList'] = []
		}
		let warningData = []
		if (e.data && e.data['warningList'] && e.data['warningList'] != undefined) {
			warningData = e.data['warningList']
			if (localStorage.getItem("WarningPages")) {
				if (e.data['warningPageIdList'] != localStorage.getItem("WarningPages")) {
					localStorage.setItem('WarningPages', e.data['warningPageIdList'])
				}
			} else {
				if (e.data["warningPageIdList"] && e.data["warningPageIdList"][0] != undefined) {
					localStorage.setItem('WarningPages', e.data['warningPageIdList'])
				}
			}

		} else {
			warningData = e.data
		}

		const { resetFailedTime, changeReconnectModalVisible, reconnectModal } = this.props
		

		//断线连接
		let interfaceStatus = !warningData.interfaceStatus
		if (interfaceStatus) {
			// 请求成功，状态变为 true， 计数清零
			resetFailedTime()
			this.setState({
				failedTime: 0
			})
		} else {
			// 请求失败，累加计数 , 判断 计数>=5 ，状态变为true
			if (this.state.failedTime >= 5) {
				//当点击“取消重新链接”后，延时一分钟再弹框
				if (reconnectModal.delayFlag) {
					if (this.state.failedTime == 5) {
						this.setState({
							failedTime: this.state.failedTime + 1
						})
						let _this = this
						setTimeout(function () {
							changeReconnectModalVisible()
							_this.setState({
								failedTime: 5
							})
						}, 60 * 1000);
					} else {
						if (this.state.failedTime == 6) {
							return
						}
					}

				} else {
					changeReconnectModalVisible()
				}
			} else {
				let num = ++this.state.failedTime;
				this.setState({
					failedTime: num
				})
				//visible() 废弃
			}
		}

		// this.props.refreshNum(warningData.length)
		//刷新设备离线数

		if (e.data['netDeviceDropWarningList'] != undefined && e.data['netDeviceDropWarningList'].length != 0) {
			this.props.refreshOffLineNum(e.data['netDeviceDropWarningList'].length)
		}else {
			this.props.refreshOffLineNum(0)
		}

	}

	//仅刷新报警数据
	refreshWarningData = (e) => {
		if(e.data && e.data.interfaceStatus == true)return
		let warningData = e.data?(e.data.warningList?e.data.warningList:e.data):e.warningList

		warningData.reverse()
		//实时报警内容
		if(JSON.stringify(this.state.realtimeWarningData) != JSON.stringify(warningData)){

			//存储报警点位
			let warningInfo = []
			warningData.map(item=>{
				if(item.status == 1){
					warningInfo.push({pointName:item.strBindPointName,warningInfo:item.info})
				}
			})
			if (localStorage.getItem('WarningInfo')) {
				if (localStorage.getItem('WarningInfo') != JSON.stringify(warningInfo)) {
					localStorage.setItem('WarningInfo', JSON.stringify(warningInfo))
				}
			} else {
				localStorage.setItem('WarningInfo', JSON.stringify(warningInfo))
			}

			//报警音
			if (warningData[0] == undefined) {
				clearInterval(timer);
				let audio = document.getElementById('music1');
				if (audio !== null) {
					audio.pause();// 这个就是暂停
				}
				this.setState({
					warning: '',
					playFlag: false,
				})
			} else{
				clearInterval(timer);
				let audio = document.getElementById('music1');
				if (audio !== null) {
					audio.pause();// 这个就是暂停
				}
				let flag = false
				warningData.map(item=>{
					if(item.status && item.status == 1){
						flag = true
					}
				})
				if(localStorage.getItem('automaticAlarm') && localStorage.getItem('automaticAlarm') != '0' && flag && this.state.warningVisible == false){
					this.setState({
						warningVisible: true
					})
				}
				if(flag){
					this.setState({
						playState:'已启用',
						playFlag: true
					})
					this.timingPlay(flag);
				}else{
					this.setState({
						playState:'暂无未读报警',
						playFlag: false
					})
				}
			}

			let obj = warningData.find(i=>i['status']==1)
			let status1 = 0,status135 = 0
			for(let i=0;i<warningData.length;i++){
				if(warningData[i].status == undefined){
					status1 = warningData.length
					status135 = warningData.length
					break
				}
				if(warningData[i].status == 1){
					status1++
					status135++
				}else if(warningData[i].status == 3 || warningData[i].status == 5){
					status135++
				}

			}

			this.setState({
				realtimeWarningData: warningData,
				warningNum: status1,
				warningStatusBy135: status135,
				warning: obj == undefined ? '' : obj['info']
			})
		}
	}

	//定时20S一循环播放报警音效
	timingPlay(flag) {
		let _this = this

		let audio = flag == 0? document.getElementById('music2'):document.getElementById('music1');

		let player = function () {
			if (_this.state.playFlag === false || (localStorage.getItem('soundAlarm') && localStorage.getItem('soundAlarm') == 0)) {
				clearInterval(timer);
				return
			}
			if (_this.state.playFlag === true) {
				if (audio !== null) {
					//检测播放是否已暂停.audio.paused 在播放器播放时返回false.
					// alert(audio.paused);
					try {
						if (audio.paused == true) {
							audio.play();//audio.play();// 这个就是播放  
							_this.setState({
								playState: '成功'
							})
						} else {
							// audio.pause();// 这个就是暂停
						}
					} catch (error) {
						console.log(error)
					}
				}
			}
			return player
		}
		timer = setInterval(player(), 20 * 1000)
	}

	showWarningModal = () => {
		this.setState({
			warningVisible: true
		})
	}

	handleCancel = () => {
		this.setState({
			warningVisible: false,
			activeKey: '1',
			remark: '',
			warningInfoList: []
		})
	}

	setWarningStatus = (status,ignoreTime) => {
		const {warningInfoList,remark,infoList} = this.state
		if(warningInfoList.length == 0){
			message.info('请选择需要处理的报警')
			return
		}

		Modal.confirm({
			title: '报警处理',
			content: status == 1? '是否要确认收到选中的报警信息？':'是否要忽略选中的报警信息？',
			onOk: ()=>{
				http.post('/warning/deal',{
					userName: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : '',
					info: infoList,
					type: status,
					remark: remark,
					ingnoreMinutes: ignoreTime
				}).then(res=>{
					if(res.err == 0){
						this.setState({ 
							remark: '',
							warningInfoList: []
						})
						this.getRealtime()
						Modal.success({
							title: '提示',
							content: '操作成功'
						})
					}else{
						Modal.error({
							title: '后台返回信息',
							content: res.msg
						})
					}
				}).catch(err=>{

				})
			}
		})
	
	}

	getRealtime = () => {
		http.post('/warning/getRealtime',{
			seconds: 4*3600
		}).then(res => {
			this.refreshWarningData(res)
		}).catch(err => {

		})
	}

	changeTab = (activeKey) => {
		this.setState({
			activeKey: activeKey
		})
	}

	changeRemark = (e) => {
		this.setState({
			remark: e.target.value
		})
	}

	render() {
		const { warning, warningNum, remark, activeKey, realtimeWarningData, warningVisible, playState, warningStatusBy135 } = this.state
		const columns = [
			{
				title: '发生时间',
				dataIndex: 'time',
				key:'time',
				width: 130,
    			sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
			}, {
				title: '最近活动时间',
				dataIndex: 'endtime',
				key:'endtime',
				width: 130,
				sorter: (a, b) => new Date(a.endtime).getTime() - new Date(b.endtime).getTime()
			}, {
				title: '消除时间',
				dataIndex: 'tCloseOpTime',
				key:'tCloseOpTime',
				width: 130,
				sorter: (a, b) => {
					let atime = a.tCloseOpTime?new Date(a.tCloseOpTime).getTime():new Date().getTime()
					let btime = b.tCloseOpTime?new Date(b.tCloseOpTime).getTime():new Date().getTime()
					return atime - btime
				}
			}, {
				title: '标题',
				dataIndex: 'info',
				key: 'info',
				width: 135,
				render: (text) => {
					return <div title={text} style={{overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{text}</div>
				}
			}, {
				title: '详细信息',
				dataIndex: 'infoDetail',
				key: 'infoDetail',
				width: 150,
				render: (text) => {
					return <div title={text} style={{overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{text}</div>
				}
			},{
				title: '等级',
				dataIndex: 'level',
				key: 'level',
				width: 50,
				render: (text) => {
					return <div>{text == '1'?'一般':text == '2'?'较重':'严重'}</div>
				}
			},{
				title: '状态',
				dataIndex: 'strStatus',
				key: 'strStatus',
				width: 100,
				render: (text,record) => {
					if(record['status'] == 3 || record['status'] == 4){
						return <div title={`处理人：${record['ignoreUser']}，忽略原因：${record['ignoreRemark']}`}>{text}</div>
					}else if(record['status'] == 5 || record['status'] == 6){
						return <div title={`处理人：${record['confirmUser']}，确认原因：${record['confirmRemark']}`}>{text}</div>
					}else{
						return <div>{text}</div>
					}
				}
			},{
				title: '相关点名',
				dataIndex: 'strBindPointName',
				key: 'strBindPointName',
				width: 160,
				render: (text,record) => {
					return(
						<div title={text} className={s['strBindPointName']}><Button type='link' size='small' title='历史趋势' icon='line-chart' onClick={()=>getTendencyModalByTime(text,record['info'],record['endtime'])}></Button>{text}</div>
					)
				}
			}
		]
		return (
			<div style={{ display: 'inline-block' }}>
				<div style={{ marginRight: '10px'}} title={warning}>
					<span className={s['warning-span']}>{warning.length>30?warning.slice(0,30)+'...':warning}</span>
					<Button type='link' onClick={this.showWarningModal} title="报警" style={{fontSize:20,color:warningStatusBy135 != 0?'red':''}} icon="warning"></Button>
					<Badge count={warningNum} overflowCount={99} showZero={false} style={{color:'white'}} className={s['small-num']}></Badge>
				</div>
				<Modal
					title="报警信息"
					visible={warningVisible}
					onCancel={() => { this.handleCancel() }}
					footer={null}
					maskClosable={false}
					width={1300}
				>
					<Tabs type="card" onChange={this.changeTab} activeKey={activeKey}>
						<TabPane tab="实时报警" key="1">
							<div>
								<div>
									<Table
										columns={columns}     
										pagination={false}
										dataSource={realtimeWarningData}
										size="small"
										bordered
										scroll={{ y: 350 }}
										rowSelection={{
											columnWidth:40,
											selectedRowKeys:this.state.warningInfoList,
											onChange: (selectedRowKeys,selectedRows) => {
												let infoList = []
												selectedRows.map(item=>{
													infoList.push(item['info'])
												})
												infoList = [...new Set(infoList)]
												this.setState({
													warningInfoList: selectedRowKeys,
													infoList: infoList
												})
											},
										}}
										rowClassName={(record,index)=>{
											if(record['status'] == 1){
												return 'warning-status-1'
											}else if(record['status'] == 2){
												return 'warning-status-2'
											}else if(record['status'] == 3){
												return 'warning-status-3'
											}else if(record['status'] == 4){
												return 'warning-status-4'
											}else if(record['status'] == 5){
												return 'warning-status-5'
											}else if(record['status'] == 6){
												return 'warning-status-6'
											}
										}}
									/>
								</div>
								<div style={{marginTop:20}}>
									<div style={{marginBottom:20}}>
										<Input placeholder='请填写处理报警时的备注信息' value={remark} onChange={this.changeRemark}/>
									</div>
									<Button style={{marginRight:10}} onClick={()=>{this.setWarningStatus(1)}}>确认</Button>
									<Button style={{marginRight:10}} onClick={()=>{this.setWarningStatus(2, 5)}}>忽略5分钟</Button>
									<Button style={{marginRight:10}} onClick={()=>{this.setWarningStatus(2, 30)}}>忽略30分钟</Button>
									<Button style={{marginRight:10}} onClick={()=>{this.setWarningStatus(2, 60)}}>忽略1小时</Button>
									<Button style={{marginRight:10}} onClick={()=>{this.setWarningStatus(2, 720)}}>忽略半天</Button>
									<Button style={{marginRight:10}} onClick={()=>{this.setWarningStatus(2, 1440)}}>忽略1天</Button>
									<div style={{float:'right'}}>警报音播放：{playState}</div>
								</div>
							</div>
						</TabPane>
						<TabPane tab="历史报警" key="2">
							<HistoryWarningView/>
						</TabPane>
					</Tabs>
				</Modal>
			</div>
		);
	}
}

const RealtimeWarningModalView = Form.create()(RealtimeWarningModal)

export default RealtimeWarningModalView;

