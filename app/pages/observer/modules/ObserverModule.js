import http from '../../../common/http'
import { message } from 'antd'
import CheckWorker from '../../../common/checkWorker'
import { syncFunc, addOperation } from '../../../common/utils';
import moment from 'moment';
import { func } from 'prop-types';


// ------------------------------------
// Constants
// ------------------------------------
export const RESET = 'observer.RESET';
export const TOGGLE_TIMESHAFT = 'observer.TOGGLE_TIMESHAFT';
export const OBSERVER_PARMS = 'observer.OBSERVER_PARMS';
export const UPDATE_PAGE_ID = 'observer.UPDATE_PAGE_ID'
export const SHOW_SWITCH = 'observer.SHOW_SWITCH'
export const HIDE_SWITCH = 'observer.HIDE_SWITCH'
export const VALUE_LOADING = 'observer.VALUE_LOADING'
export const UPDATE_OPERATE_DATA = 'observer.UPDATE_OPERATE_DATA'
export const TOGGLE_LOADING = 'observer.TOGGLE_LOADING'
export const SHOW_CHECKBOX = 'observer.SHOW_CHECKBOX'
export const HIDE_CHECKBOX = 'observer.HIDE_CHECKBOX'
export const REFRESH_CUSTOM_DICT = 'observer.REFRESH_CUSTOM_DICT'
export const REFRESH_TIME_PICKER = 'observer.REFRESH_TIME_PICKER';
export const REFRESH_RECTANG_PANEL = 'observer.REFRESH_RECTANG_PANEL';
export const REPORT_CUSTOMDATA_DATA = 'observer.REPORT_CUSTOMDATA_DATA';
export const REFRESH_REPORT = 'observer.REFRESH_REPORT';
export const ENERGY_CUSTOMDATA_DATA = 'observer.ENERGY_CUSTOMDATA_DATA'
export const ENERGY_BASE_TABLE_DATA = 'observer.ENERGY_BASE_TABLE_DATA'
export const ENERGY_TABLE_LOADING = 'observer.ENERGY_TABLE_LOADING'
export const GET_CUSTOM_REALTIME_DATA = 'observer.GET_CUSTOM_REALTIME_DATA'
export const GET_POINT_REALTIME_DATA = 'observer.GET_POINT_REALTIME_DATA'
export const GET_TIME_PICKER_REALTIME_DATA = 'observer.GET_TIME_PICKER_REALTIME_DATA'
export const GET_RECTANGLES_PANEL_DATA = 'observer.GET_RECTANGLES_PANEL_DATA'
// export const SHOW_TENDENCY = 'observer.SHOW_TENDENCY';
// export const HIDE_TENDENCY = 'observer.HIDE_TENDENCY';
export const REFRESH_BENCHMARK = 'observer.REFRESH_BENCHMARK';
export const GET_CUSTOM_TABLE_DATA = 'observer.GET_CUSTOM_TABLE_DATA';
export const SET_CUSTOM_TABLE_DATA = 'observer.SET_CUSTOM_TABLE_DATA';
export const SETTING_TABLE_DATA_FLAG = 'observer.SETTING_TABLE_DATA_FLAG';
export const IS_SETTING_FUN = 'observer.IS_SETTING_FUN';
export const REFRESH_CUSTOM_DICT_IN_MODAL = 'observer.REFRESH_CUSTOM_DICT_IN_MODAL';
export const GET_POINT_NAME_LIST = 'observer.GET_POINT_NAME_LIST';
export const LIGHTCONTROL_LIST_LOADING = 'observer.LIGHTCONTROL_LIST_LOADING'
export const LIGHTCONTROL_LIST_INDEX = 'observer.LIGHTCONTROL_LIST_INDEX'
export const LIGHTCONTROL_LIST_DATASOURCE = 'observer.LIGHTCONTROL_LIST_DATASOURCE'
export const LIGHTCONTROL_LIST_COLUMNS = 'observer.LIGHTCONTROL_LIST_COLUMNS'
export const LIGHTCONTROL_LIST_VISIBLE = 'observer.LIGHTCONTROL_LIST_VISIBLE'
export const LIGHTCONTROL_SETTINGVALUE = 'observer.LIGHTCONTROL_SETTINGVALUE'
export const LIGHTCONTROL_LIST_SWITCH = 'observer.LIGHTCONTROL_LIST_SWITCH'
export const LIGHTCONTROL_LIST_CHANGE = 'observer.LIGHTCONTROL_LIST_CHANGE'
export const CREATE_GUARANTEE = 'observer.CREATE_GUARANTEE'
export const CREATE_REPAIR = 'observer.CREATE_REPAIR'
export const SEARCH_GUARANTEE = 'observer.SEARCH_GUARANTEE'
export const SEARCH_GUARANTEEDATA = 'observer.SEARCH_GUARANTEEDATA'
export const SEARCH_GRTFIXID = 'observer.SEARCH_GRTFIXID'
export const VIEW_GUARANTEE = 'observer.VIEW_GUARANTEE'
// ------------------------------------
// Actions
// ------------------------------------

// let user_info = localStorage.getItem('userInfo') ? 
// JSON.parse(localStorage.getItem('userInfo')) : {}


export const observerScreenParms = (parmsDict) => {
	return {
		type: OBSERVER_PARMS,
		parmsDict
	}
}

export const updatePageId = (pageId) => {
	return {
		type: UPDATE_PAGE_ID,
		pageId
	}
}

//弹出设备开关模态框
export function showOperatingModal(modalType, modalProps) {
	return showSwitch(modalType, modalProps);
}


// export function getTendencyModal(point,description) {
//   let time = []
//   let dataSouce = []
//   return function (dispatch,getState) {
//     http.post('/get_history_data_padded', {
//         pointList : [point],
//         timeStart:moment().startOf('day').format('YYYY-MM-DD HH:mm:00'),
//         timeEnd:moment().format('YYYY-MM-DD HH:mm:00'),
//         timeFormat:'m1'
//     }).then(
//         data =>{
//             console.log(data)
//             time = data.time
//             dataSouce = data.map
//             dispatch(showTendencyModal({time,dataSouce,point,description}))
//         }
//     )
//     // .catch(
//     //     (error) => {
//     //         message.error('服务器通讯失败！');
//     //         dispatch(showTendencyModal({time,dataSouce}))
//     //     }
//     // )
//   }
// }
//弹出点趋势
// export function showTendencyModal(tendencyData){
//    return {
//     type: SHOW_TENDENCY,
//     visible:true,
//     tendencyData
//   }
// }

// export function hideTendencyModal() {
//   return {
//     type: HIDE_TENDENCY
//   }
// }

//设备开关的展示模态框
export function showSwitch(operateModalVisible, operateData) {
	return {
		type: SHOW_SWITCH,
		operateModalVisible,
		operateData
	}
}

//设备开关的隐藏模态框
export function switchHide() {
	return {
		type: HIDE_SWITCH
	}
}

export function showMainCheckboxModal(modalType, modalProps) {
	return showCheckboxModal(modalType, modalProps)
}

export function showCheckboxModal(operateModalVisible, operateData) {
	return {
		type: SHOW_CHECKBOX,
		operateModalVisible,
		operateData
	}
}

export function checkboxHide() {
	return {
		type: HIDE_CHECKBOX
	}
}

//正在设置值
export function valueLoading(isLoading) {
	return {
		type: VALUE_LOADING,
		isLoading
	}
}



//单选按钮开关-主页面按钮
export function operateSwitch(idCom, setValue, description, downloadEnableCondition, downloadURL, checkDownLoadEnable, unsetValue) {
	return function (dispatch, getState) {

		var reg = /,/,
			pointList = [],
			valueList = [];

		// 检测idCom是否为空,为空则跳过设值阶段，直接进入下载报表
		if (!idCom) {
			dispatch(switchHide())
			return checkDownLoadEnable(downloadEnableCondition, downloadURL)
		}

		if (reg.test(idCom)) { //多个点
			pointList = idCom.split(',')
		} else {
			pointList = [idCom] //单个点
		}

		if (reg.test(setValue.toString())) {
			valueList = setValue.toString().split(',')
		} else {
			valueList = [setValue]
		}

		//处理意外情况：如果多值设置中，数量比点名数量少，则缺少的值用最后一个点值补齐
		if (valueList.length < pointList.length) {
			for (let i = valueList.length; i < pointList.length; i++) {
				valueList.push(Number(valueList[length - 1]))
			}
		}
		if (localStorage.getItem('hideLoading') != 1) {
			dispatch(valueLoading(true))
		}
		http.post('/pointData/getRealtime', {
			pointList: pointList
		}).then(
			result => {
				//往后台传的都是数组格式
				// var valueList = [setValue]
				let pointName = pointList
				// let pointName = []
				// if (idCom) {
				//   pointName.push(idCom)
				// }

				let observer = getState().observer
				if (observer.operateIsLoading) {  //判断当前是否关闭模态窗，并且重置

					return syncFunc(() => {
						dispatch(switchHide())
					}).then(
						first => {
							first()
						}
					).then(
						() => {
							dispatch(valueLoading(false));
						}
					)
				}
				//设置点值
				dispatch(updateOperateData(true, ''))
				return http.post('/pointData/setValue', {
					pointList: pointName,
					valueList: valueList,
					waitSuccess: 0,
					source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
				}).then(
					serverData => {
						if (localStorage.getItem('hideLoading') == 1) {
							dispatch(switchHide())
						}
						if (serverData.err === 0) {
							
							//多值情况
							if (pointName.length > 1) {
								//暂不对比
								dispatch(switchHide());
								dispatch(valueLoading(false))
							} else {
								//设置完点值后获取当前点名 , 点值，开始和后台数据对比
								dispatch(refreshSwitch(
									pointName,
									valueList[0],
									downloadEnableCondition,
									downloadURL,
									checkDownLoadEnable
								));
								http.post('/get_realtimedata', {
									pointList: [idCom],
									proj: 1
								}).then(
									pointData => {
										if (pointData[0]) {
											let value = pointData[0] ? pointData[0].value : ''
											addOperation('/operationRecord/add', {
												"userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
													JSON.parse(localStorage.getItem('userInfo')).name : '',
												"content": description,
												"address": ''
											}, description + '记录失败')
										}
									}
								)
							}
						}
					}
				)
			}
		)
	}
}

//设备开关的刷新检查
export function refreshSwitch(pointName, value, downloadEnableCondition, downloadURL, checkDownLoadEnable) {
	return function (dispatch, getState) {
		//得到后台更新的点值,对比,2s循环检测，正确后结束loading

		let checkWorker = new CheckWorker(function (info, next, stop) {
			http.post('/get_realtimedata', {
				pointList: pointName,
				proj: 1
			}).then(
				data => {
					// console.info( data )
					// 接口返回的值可能是一个浮点型的字符串
					let diffData = !data[0] || ((isNaN(Number(data[0]["value"])) ? data[0]["value"] : Number(data[0]["value"])))
					if (diffData != value) {
						//执行下一次check，触发progress事件
						//如果达到设置的check次数，会还会触发complete
						next();
					} else {
						// 直接停止，无需执行下一次 check
						// 会触发 progress 和 stop 事件
						dispatch(switchHide());
						dispatch(valueLoading(false));
						stop();
					}
				}
			)
		}, {
			// 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
		})

		checkWorker
			.on('progress', function ({ progress }) { console.info('progress', progress) })
			.on('stop', function ({ progress }) {
				dispatch(updateOperateData(false, '指令发送成功'))
				checkDownLoadEnable(downloadEnableCondition, downloadURL)
			})
			.on('complete', function ({ progress }) {
				dispatch(updateOperateData(false, '指令发送失败请重试'))
			})
			.start()
	}
}


//优化选项设置
export function checkboxSetting(idCom, setValue, text, unsetValue, desc) {
	let pointName = [idCom]
	let nextValue, fromValue
	return function (dispatch, getState) {
		let observer = getState().observer
		// 模态框正在loading的时候再点击确定就需要后台执行设备操作，隐藏模态框
		if (observer.operateIsLoading) {  //判断当前是否关闭模态窗，并且重置
			//sync in utils
			return syncFunc(() => {
				dispatch(checkboxHide())
			}).then(
				first => {
					first()
				}
			).then(
				() => {
					dispatch(valueLoading(false));
				}
			)
		}
		dispatch(updateOperateData(true, ''))
		return http.post('/pointData/getRealtime', {
			pointList: [idCom]
		}).then(
			data => {

				if ((parseInt(Number(data[0]['value']))).toString() === setValue) { //如果点击的时候点值等于自带的setvalue就表示要取消选中
					nextValue = unsetValue.toString();
					fromValue = setValue.toString()
				} else { //其他都是就表示要选中
					nextValue = setValue.toString()
					fromValue = unsetValue.toString()
				}
				http.post("/pointData/setValue", {
					pointList: [idCom],
					valueList: [nextValue],
					source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
				}).then(
					serverData => {
						if (serverData.err === 0) {
							dispatch(valueLoading(true));
							dispatch(refreshCheckbox(pointName, nextValue, idCom, text));
							http.post('/get_realtimedata', {
								pointList: [idCom],
								proj: 1
							}).then(
								pointData => {
									if (pointData[0]) {
										//let value = pointData[0] ? pointData[0].value : ''
										addOperation('/operationRecord/addChangeValue', {
											"userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
												JSON.parse(localStorage.getItem('userInfo')).name : '',
											"pointName": idCom,
											"pointDescription": desc,
											"valueChangeFrom": fromValue,
											"valueChangeTo": nextValue,
											"address": localStorage.getItem('serverUrl'),
											"lang": "zh-cn"
										}, idCom + '记录改值操作失败')
									}
								}
							)
						}
					}
				)
			}
		);
	}
}

//优化选项的刷新检查
export function refreshCheckbox(pointName, value) {
	return function (dispatch, getState) {
		new CheckWorker(function (info, next, stop) {
			http.post('/get_realtimedata', {
				pointList: pointName,
				proj: 1
			}).then(
				data => {
					let diffData = !data[0] || ((isNaN(Number(data[0]["value"])) ? data[0]["value"] : Number(data[0]["value"])))
					if (parseInt(diffData) != value) {
						//执行下一次check，触发progress事件
						//如果达到设置的check次数，会还会触发complete
						next();
					} else {
						// 直接停止，无需执行下一次 check
						// 会触发 progress 和 stop 事件
						dispatch(checkboxHide());
						dispatch(valueLoading(false));
						stop();
					}
				}
			)
		}, {
			// 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
		})
			.on('progress', function ({ progress }) { console.info('progress', progress) })
			.on('stop', function ({ progress }) {
				dispatch(updateOperateData(false, '指令发送成功'))
			})
			.on('complete', function ({ progress }) {
				dispatch(updateOperateData(false, '指令发送失败，请重试。'))
			})
			.start()
	}
}

//更新设备数据
export function updateOperateData(status, description) {
	return {
		type: UPDATE_OPERATE_DATA,
		conditionDict: {
			status: status,
			description: description || ''
		}
	}
}

export function refreshCustomData(customList) {
	return {
		type: REFRESH_CUSTOM_DICT,
		customList
	}
}



export function refreshCustomDataInModal(customListInModal) {
	return {
		type: REFRESH_CUSTOM_DICT_IN_MODAL,
		customListInModal
	}
}

//morgan添加请求自定义组件点值的方法
export function getPointNameList(data) {
	return {
		type: GET_POINT_NAME_LIST,
		data
	}
}


export function refreshTimePickerData(timePickerList) {
	return {
		type: REFRESH_TIME_PICKER,
		timePickerList
	}
}

export function refreshRectanglePanelData(rectanglesPanelList) {
	return {
		type: REFRESH_RECTANG_PANEL,
		rectanglesPanelList
	}
}

export function reportCustomData(reportList) {
	return {
		type: REPORT_CUSTOMDATA_DATA,
		reportList
	}
}

export function energyCustomData(energyList) {
	return {
		type: ENERGY_CUSTOMDATA_DATA,
		energyList
	}
}

// 点击搜索后保存原始数据
export function searchData(pointList, timeStart, timeEnd, timeFormat) {
	return function (dispatch, getState) {

		// loading状态
		dispatch(energyTableLoading(true))
		http.post('/get_history_data_padded', {
			pointList: pointList,
			timeStart: timeStart,
			timeEnd: timeEnd,
			timeFormat: timeFormat
		}).then(
			data => {
				if (data.error) {
					// return message.warning(data.msg, 3);
					throw new Error(data.msg)
				}
				dispatch(energyTableLoading(false))
				// 保存数据
				dispatch({
					type: ENERGY_BASE_TABLE_DATA,
					data: data
				})
			}
		).catch(
			() => {
				dispatch(energyTableLoading(false))
				message.warning(data.msg, 3);
			}
		)
	}
}

export function energyTableLoading(loading) {
	return {
		type: ENERGY_TABLE_LOADING,
		loading: loading
	}
}


//保存loading状态
export function toggleLoading(loading) {
	return {
		type: TOGGLE_LOADING,
		loading
	}
}

export function refreshReportFun(refreshReport) {
	return {
		type: REFRESH_REPORT,
		refreshReport
	}
}

export function refreshBenchmarkFun(refreshBenchmark) {
	return {
		type: REFRESH_BENCHMARK,
		refreshBenchmark
	}
}


export function getCustomRealTimeData(data) {
	return function (dispatch) {
		dispatch({
			type: GET_CUSTOM_REALTIME_DATA,
			data
		})
	}
}
//morgan添加自定义组件多点数据
export function getPointRealTimeData(data) {
	return function (dispatch) {
		dispatch({
			type: GET_POINT_REALTIME_DATA,
			data
		})
	}
}

export function getTimePickerRealTimeData(data) {
	return function (dispatch) {
		dispatch({
			type: GET_TIME_PICKER_REALTIME_DATA,
			data
		})
	}
}

export function getRectanglesPanelData(data) {
	return function (dispatch) {
		dispatch({
			type: GET_RECTANGLES_PANEL_DATA,
			data
		})
	}
}


export function getCustomTableData(data) {
	return function (dispatch, getState) {
		// loading状态
		http.post('/get_realtimedata', {
			pointList: [data],
			proj: 1
		}).then(
			data => {
				if (data.length != 0) {
					// 保存数据                  
					dispatch(saveCustomTableData(data))

					// //组织数据，保存到
					// let setValue = [],pointName = [];

					// let copyPointValue = JSON.parse(data[0].value)['data']
					// let idCom = data[0].name

					// copyPointValue[firstKey][Number(secondKey)] = settingValue

					// if(copyPointValue){
					//   setValue.push(JSON.stringify({"data":copyPointValue})) 
					// }

					// if (idCom) {
					//   pointName.push(idCom)
					// }
					// let setObj = {
					//   pointList: pointName,
					//   valueList: setValue
					// }
					// dispatch(saveSetCustomTableData(setObj))
					dispatch(settingTableValue())
					dispatch(settingTableDataFlagFun(true))
				}
			}
		).catch(
			() => {
				// dispatch(energyTableLoading(false))
				// message.warning(data.msg, 3);
			}
		)
	}
}
//将动态表格的数据保存的到store
export function saveCustomTableData(data) {
	return function (dispatch) {
		dispatch({
			type: GET_CUSTOM_TABLE_DATA,
			data
		})
	}
}


//将动态表格的数据保存的到store，此格式用于定时setting
export function saveSetCustomTableData(data) {
	return function (dispatch) {
		dispatch({
			type: SET_CUSTOM_TABLE_DATA,
			data
		})
	}
}

//动态表格的数据的定时保存函数开始循环的标志
export function settingTableDataFlagFun(flag) {
	return function (dispatch) {
		dispatch({
			type: SETTING_TABLE_DATA_FLAG,
			flag
		})
	}
}

//动态表格的数据的实时保存的接口是否请求的标志（只有当用户做了修改，才执行接口）
export function isSettingFun(isSetting) {
	return function (dispatch) {
		dispatch({
			type: IS_SETTING_FUN,
			isSetting
		})
	}
}

//定时setting动态表格的数据
export function settingTableValue() {
	return function (dispatch, getState) {
		var timer = setInterval(function (e) {
			let isSetting = getState().observer.isSetting
			let data = getState().observer.custom_table_setting_data
			let settingTableFlag = getState().observer.settingTableFlag
			//console.log(data)
			if (!settingTableFlag) {
				clearInterval(timer);
			}
			if (!isSetting) {
				return
			}
			http.post('/pointData/setValue', {
				pointList: data.pointList,
				valueList: data.valueList,
				source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
			}).then(
				serverData => {
					if (serverData.err === 0) {
						//获取点名的对应信息
						dispatch(isSettingFun(false))
					} else if (serverData.err > 0) {
						message.error(serverData.msg)
					}
				}
			)
		}, 15000);
	}
}
// 自定义组件 LightControlList的loading
export function LightControlList(loading) {
	return {
		type: LIGHTCONTROL_LIST_LOADING,
		LightControlLoading: loading
	}
}
//自定义组件 LightControlList的index
export function LightControlIndexOf(index) {
	return {
		type: LIGHTCONTROL_LIST_INDEX,
		LightControlIndex: index
	}
}
//自定义组件 LightControlList的dataSource
export function LightControlData(data) {
	return {
		type: LIGHTCONTROL_LIST_DATASOURCE,
		LightControlDataSource: data
	}
}
//自定义组件 LightControlList的Coloumns
export function LightControlColoum(data) {
	return {
		type: LIGHTCONTROL_LIST_COLUMNS,
		LightControlColoums: data
	}
}
//自定义组件设定值弹窗
export function LightControlShow(data) {
	return {
		type: LIGHTCONTROL_LIST_VISIBLE,
		LightControlVisible: data
	}
}
//自定义组件按钮弹窗
export function SwitchControlShow(data) {
	return {
		type: LIGHTCONTROL_LIST_SWITCH,
		SwitchControlVisible: data
	}
}
//自定义组件LightList
export function ChangeControlShow(data) {
	return {
		type: LIGHTCONTROL_LIST_CHANGE,
		LightControlChange: data
	}
}

//自定义设定值
export function ValueSetting(Value) {
	return {
		type: LIGHTCONTROL_SETTINGVALUE,
		CurrentValue: Value
	}
}
// morgan添加维修的代码
export function createGuarantee(data) {
	return {
		type: CREATE_GUARANTEE,
		Guarantee: data
	}
}
export function repair(id, x, y) {
	return {
		type: CREATE_REPAIR,
		RepairData: {
			pageId: id,
			x: x,
			y: y
		}
	}
}
export function showGuarantee(id) {
	return function (dispatch, getState) {
		dispatch(GetFixId(id))
		http.post('/fix/getById', {
			"fixId": id
		}).
			then(
				data => {
					if (data.err == 0) {
						// data.data.importance.toString()
						// console.log(data.data)
						dispatch(SearchGuaranteeData(data.data))
						// setTimeout(function(){
						dispatch(SeachGuarantee(true))
						// },200)
					}
				}
			).catch({})
	}
}
export function viewExperience(id) {
	return function (dispatch, getState) {
		dispatch(GetFixId(id))
		http.post('/fix/getById', {
			"fixId": parseFloat(id)
		}).
			then(
				data => {
					if (data.err == 0) {
						dispatch(SearchGuaranteeData(data.data))
						// setTimeout(function(){
						dispatch(ViewMessage(true))
						// },200)

					}
				}
			).catch({})
	}
}
export function ViewMessage(data) {
	return {
		type: VIEW_GUARANTEE,
		ViewDisplay: data
	}
}

export function SeachGuarantee(data) {
	return {
		type: SEARCH_GUARANTEE,
		SeachGuaranteeVisiable: data
	}
}
export function SearchGuaranteeData(data) {
	return {
		type: SEARCH_GUARANTEEDATA,
		SeachGuaranteeSourceData: data
	}
}
export function GetFixId(data) {
	return {
		type: SEARCH_GRTFIXID,
		GuaranteeFixid: data
	}
}

export const actions = {
	refreshReportFun,
	refreshBenchmarkFun
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[VIEW_GUARANTEE]: (state, action) => {
		return { ...state, ViewDisplay: action.ViewDisplay }
	},
	[SEARCH_GRTFIXID]: (state, action) => {
		return { ...state, GuaranteeFixid: action.GuaranteeFixid }
	},
	[SEARCH_GUARANTEEDATA]: (state, action) => {
		return { ...state, SeachGuaranteeSourceData: action.SeachGuaranteeSourceData }
	},
	[SEARCH_GUARANTEE]: (state, action) => {
		return { ...state, SeachGuaranteeVisiable: action.SeachGuaranteeVisiable }
	},
	[CREATE_REPAIR]: (state, action) => {
		return { ...state, RepairData: action.RepairData }
	},
	[CREATE_GUARANTEE]: (state, action) => {
		return { ...state, Guarantee: action.Guarantee }
	},
	[RESET]: (state) => {
		return initialState;
	},
	// [TOGGLE_TIMESHAFT]: (state) => {
	//   return { ...state, bShowTimeShaft: !state.bShowTimeShaft }
	// },
	[OBSERVER_PARMS]: (state, action) => {
		return { ...state, parmsDict: action.parmsDict }
	},
	[UPDATE_PAGE_ID]: (state, action) => {
		return { ...state, parmsDict: { ...state.parmsDict, pageId } }
	},
	[SHOW_SWITCH]: (state, action) => {
		return { ...state, operateModalVisible: action.operateModalVisible, operateData: action.operateData }
	},
	// [SHOW_TENDENCY] : (state, action) => {
	//   return {...state, tendencyVisible: action.visible, tendencyData: action.tendencyData }
	// },
	// [HIDE_TENDENCY] : (state) => {
	//   return {...state,tendencyVisible:false, tendencyData: {time:[],dataSouce:[],point:'',description:''} }
	// },
	[HIDE_SWITCH]: (state) => {
		return {
			...state,
			operateModalVisible: null,
			operateData: { ...state.operateData, description: '' },
			conditionDict: { status: false, description: '' }
		}
	},
	[VALUE_LOADING]: (state, action) => {
		return { ...state, operateIsLoading: action.isLoading }
	},
	[UPDATE_OPERATE_DATA]: (state, action) => {
		return { ...state, conditionDict: action.conditionDict }
	},
	[TOGGLE_LOADING]: (state, action) => {
		return { ...state, loading: action.loading }
	},
	[SHOW_CHECKBOX]: (state, action) => {
		return { ...state, operateModalVisible: action.operateModalVisible, operateData: action.operateData }
	},
	[HIDE_CHECKBOX]: (state, action) => {
		return { ...state, operateModalVisible: null, operateData: { ...state.operateData, description: '' }, operateIsLoading: false, conditionDict: { status: false, description: '' } }
	},
	[REFRESH_CUSTOM_DICT]: (state, action) => {
		return { ...state, customList: action.customList }
	},
	[REFRESH_CUSTOM_DICT_IN_MODAL]: (state, action) => {
		return { ...state, customListInModal: action.customListInModal }
	},
	[REFRESH_TIME_PICKER]: (state, action) => {
		return { ...state, timePickerList: action.timePickerList }
	},
	[REFRESH_RECTANG_PANEL]: (state, action) => {
		return { ...state, rectanglesPanelList: action.rectanglesPanelList }
	},
	[REPORT_CUSTOMDATA_DATA]: (state, action) => {
		return { ...state, reportList: action.reportList }
	},
	[REFRESH_REPORT]: (state, action) => {
		return { ...state, refreshReport: action.refreshReport }
	},
	[REFRESH_BENCHMARK]: (state, action) => {
		return { ...state, refreshBenchmark: action.refreshBenchmark }
	},
	[ENERGY_CUSTOMDATA_DATA]: (state, action) => {
		return { ...state, energyList: action.energyList }
	},
	[ENERGY_BASE_TABLE_DATA]: (state, action) => {
		return { ...state, base_table: { ...state.base_table, data: action.data } }
	},
	[ENERGY_TABLE_LOADING]: (state, action) => {
		return { ...state, base_table: { ...state.base_table, table_loading: action.loading } }
	},
	[GET_CUSTOM_REALTIME_DATA]: (state, action) => {
		return { ...state, custom_realtime_data: action.data }
	},
	[GET_POINT_REALTIME_DATA]: (state, action) => {  //morgan添加
		return { ...state, point_realtime_data: action.data }
	},
	[GET_TIME_PICKER_REALTIME_DATA]: (state, action) => {
		return { ...state, timePicker_realtime_data: action.data }
	},
	[GET_RECTANGLES_PANEL_DATA]: (state, action) => {
		return { ...state, rectangles_panel_data: action.data }
	},
	[GET_CUSTOM_TABLE_DATA]: (state, action) => {
		return { ...state, custom_table_data: action.data }
	},
	[SET_CUSTOM_TABLE_DATA]: (state, action) => {
		return { ...state, custom_table_setting_data: action.data }
	},
	[SETTING_TABLE_DATA_FLAG]: (state, action) => {
		return { ...state, settingTableFlag: action.flag }
	},
	[IS_SETTING_FUN]: (state, action) => {
		return { ...state, isSetting: action.isSetting }
	},
	[GET_POINT_NAME_LIST]: (state, action) => {
		return { ...state, customNameList: action.customNameList }
	},
	[LIGHTCONTROL_LIST_LOADING]: (state, action) => {
		return { ...state, LightControlLoading: action.LightControlLoading }
	},
	[LIGHTCONTROL_LIST_INDEX]: (state, action) => {
		return { ...state, LightControlIndex: action.LightControlIndex }
	},
	[LIGHTCONTROL_LIST_DATASOURCE]: (state, action) => {
		return { ...state, LightControlDataSource: action.LightControlDataSource }
	},
	[LIGHTCONTROL_LIST_COLUMNS]: (state, action) => {
		return { ...state, LightControlColoums: action.LightControlColoums }
	},
	[LIGHTCONTROL_LIST_VISIBLE]: (state, action) => {
		return { ...state, LightControlVisible: action.LightControlVisible }
	},
	[LIGHTCONTROL_LIST_SWITCH]: (state, action) => {
		return { ...state, SwitchControlVisible: action.SwitchControlVisible }
	},
	[LIGHTCONTROL_LIST_CHANGE]: (state, action) => {
		return { ...state, LightControlChange: action.LightControlChange }
	},
	[LIGHTCONTROL_SETTINGVALUE]: (state, action) => {
		return { ...state, CurrentValue: action.CurrentValue }
	}
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
	// bShowTimeShaft: false,
	// tendencyVisible: false,
	// tendencyData: {},
	parmsDict: {},
	operateModalVisible: null,
	operateData: {},
	operateIsLoading: false,
	conditionDict: {
		status: false,
		description: ''
	},
	loading: false,
	customList: [],
	customListInModal: [],
	timePickerList: [],
	rectanglesPanelList: [],
	reportList: [],
	refreshReport: {},
	refreshBenchmark: {},
	energyList: [],
	base_table: {
		data: {},
		table_loading: false
	},
	customNameList: [],
	custom_realtime_data: [],
	point_realtime_data: [],
	timePicker_realtime_data: [],
	rectangles_panel_data: [],
	custom_table_data: [],
	custom_table_setting_data: {},
	settingTableFlag: false,
	isSetting: false,
	LightControlLoading: false,
	LightControlIndex: 0,
	LightControlDataSource: [],
	LightControlColoums: [],
	LightControlVisible: false,
	SwitchControlVisible: false,
	LightControlChange: false,
	CurrentValue: 0,
	Guarantee: false, //新建保修显示
	RepairData: {
		pageId: '',
		x: '',
		y: ''
	},
	SeachGuaranteeVisiable: false, //报修查询显示
	SeachGuaranteeSourceData: {},
	GuaranteeFixid: '',
	ViewDisplay: false  //查看备注展示
};


export default function homeReducer(state = initialState, action) {
	const handler = ACTION_HANDLERS[action.type]

	return handler ? handler(state, action) : state
}


