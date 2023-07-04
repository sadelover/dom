import appConfig from '../../../common/appConfig';
import { combineReducers } from 'redux';
import http from '../../../common/http';
import { Modal, message } from 'antd';
import { history } from '../../../index';
import { push } from 'react-router-redux';
import moment from 'moment';

// ------------------------------------
// Constants
// ------------------------------------
const SAVE_ACTION_LIST = 'PageManage.SAVE_ACTION_LIST';
const SAVE_END_FLAG = 'pageManage.SAVE_END_FLAG';
// ------------------------------------
// Actions
// ------------------------------------
export const saveActionList = (actionList) => {
	return {
		type: SAVE_ACTION_LIST,
		actionListData:actionList

	}
}

export const saveEndFlag = (endFlag) => {
	return {
		type: SAVE_END_FLAG,
		endFlag:endFlag
	}
}

export const getHistory = (timeStart, timeEnd, pointList,actionList) => {
	return function (dispatch, getState) {
		return http.post('/get_history_data_padded', {
			'pointList': pointList,
			'timeStart': `${moment(timeStart).format('YYYY-MM-DD HH:mm')}:00`,
			'timeEnd': `${moment(timeEnd).format('YYYY-MM-DD HH:mm')}:00`,
			'timeFormat': "m1"
		}).then(
			data => {
				let actionListData = getState().expertOptimize.reducer.actionListData
				if (data.error) {
					actionListData.map((item,index) => {
						if (`${moment(item.actStartTime).format('YYYY-MM-DD HH:mm')}:00` == `${moment(timeStart).format('YYYY-MM-DD HH:mm')}:00` && `${moment(item.actEndTime).format('YYYY-MM-DD HH:mm')}:00` == `${moment(timeEnd).format('YYYY-MM-DD HH:mm')}:00`) {
							item["time"] = []
						}
					});
					// message.warning(
                    //     `配置提示：${data.msg}`
                    // )
					dispatch(saveActionList(actionListData));
				}else {
					if (data && data.time.length >= 0) {
						actionListData.map((item,index) => {
							if (`${moment(item.actStartTime).format('YYYY-MM-DD HH:mm')}:00` == `${moment(timeStart).format('YYYY-MM-DD HH:mm')}:00` && `${moment(item.actEndTime).format('YYYY-MM-DD HH:mm')}:00` == `${moment(timeEnd).format('YYYY-MM-DD HH:mm')}:00`) {
								item["map"] = data.map
								item["time"] = data.time
							}
						});
	
						dispatch(saveActionList(actionListData));
						
					} 
				}
				let mapCount = 0
				actionListData.forEach((obj,j)=>{
					if (obj.time !=undefined) {
						mapCount++
					}
				})
				if (mapCount == actionListData.length) {
					dispatch(saveEndFlag(true)) 
				}
			}
		)
		.catch(
			(error) => {
				dispatch(saveEndFlag(true)) 
				// message.error('服务器通讯失败！');
			}
		)
	}
}


// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
	[SAVE_ACTION_LIST]: (state, action) => {
		return { ...state, actionListData: action.actionListData,endFlag:action.endFlag }
	},
	[SAVE_END_FLAG]: (state, action) => {
		return { ...state, endFlag:action.endFlag }
	}
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
	actionListData:[],
	endFlag:true
};

const reducer = function (state = initialState, action) {
	const handler = ACTION_HANDLERS[action.type];

	return handler ? handler(state, action) : state;
};

export default combineReducers({
	reducer
});