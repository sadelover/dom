import http from '../../../common/http';
import {Modal} from 'antd';
import { message } from 'antd';
import appConfig from '../../../common/appConfig';
import moment from 'moment';

// ------------------------------------
// Constants
// ------------------------------------
const RESET = 'RESET';
const INITIALIZE_LINE_CHART = 'INITIALIZE_LINE_CHART';
const TOGGLE_CONFIG_MODAL = 'TOGGLE_CONFIG_MODAL';
const SHOW_POINT_MODAL = 'SHOW_POINT_MODAL';
const HIDE_POINT_MODAL ='HIDE_POINT_MODAL';
export const GET_WORKER_DICT = 'GET_WORKER_DICT';
// const ADD_WIDGET = 'ADD_WIDGET';
// const REMOVE_WIDGET = 'REMOVE_WIDGET';
// const UPDATE_WIDGET = 'Dashboard.UPDATE_WIDGET';
// const UPDATE_WIDGETS_WITH_DATA = 'Dashboard.UPDATE_WIDGETS_WITH_DATA';
// const SAVE_LAYOUTS = 'Dashboard.SAVE_LAYOUTS';
// const UPDATE_LAYOUT = 'Dashboard.UPDATE_LAYOUT';
// const LINE_CHART_RENDER = 'Dashboard.LINE_CHART_RENDER';

// ------------------------------------
// Actions
// ------------------------------------
export const reset = () => {
  return {
    type: RESET
  }
}

export const initializeLineChart = (pageName) => {
  return function (dispatch, getState) {
    let postData = {
      pageName: pageName,
      pageConfig:{
            name:"",
            points:[]
      }
    }
    return http.post('/dashboard/getPoints',{
       pageName: postData.pageName,
       pageConfig: postData.pageConfig
    })
      .then(
        resp => {
          if (resp.err === 0) {
            let pageData = {
                pageName: pageName,
                pageConfig: resp.data
            }
            // console.log(pageData)
            dispatch({
              type: INITIALIZE_LINE_CHART,
              pageData
            });
          } else {
            message(resp.msg || '获取页面数据失败！');
          }
        }
      )
  }
}

//配置模态框显示和隐藏
export function toggleConfigModal(){
    return function(dispatch,getState){
        let visible = getState().dashboard.lineData.configVisible
        dispatch({
            type : TOGGLE_CONFIG_MODAL,
            configVisible : !visible
        })
    }
}

//点位选择模态框的显示
export function showPointModal(visible,modalProps) {
  return {
    type: SHOW_POINT_MODAL,
    visible,
    modalProps
  }
}

export function hidePointModal() {
  return {
    type: HIDE_POINT_MODAL
  }
}

//保存配置信息：点信息列表和图名称
export function addConfigInfo(pageName,pointsList,lineName){
    //todu
    // let pointsList = [];
    // //取出点名，放入数组pointsList
    // pointsData.map(row => {
    //   return pointsList.push(row.name)
    // })
    return function(dispatch){
        http.post('/dashboard/savePoints',{
           pageName: pageName,
           pageConfig:{
             name: lineName,
             points: pointsList
           }
        }).then(
            data=>{
                if(data.err == 0){
                  //  message.success('配置成功！');
                   dispatch(initializeLineChart(pageName));
                   initLineData(pageName, pointsList);
                }
            }
        )
    }
}

//初始化已保存过的页面的曲线数据，长度暂定900，初始化lineDict,并保存到localStorage中
export function initLineData (pageName, pointsList) { 
  //return function (dispatch, getState) {
    let maxPointCount = 900;
    let timeArr = [];
    let dataTable = {};
    //添加x轴的时间数组
    let dateTime = new Date().getTime();
    for (var i = 0; i < maxPointCount; i++) {
      dateTime = dateTime+2000;
      timeArr.push(moment(dateTime).format('HH:mm:ss')); 
    }
    
    //添加y轴的数据data
    for (var i = 0; i < pointsList.length; i++) {
      let pointName = pointsList[i];
      let dataArr=[];
      for (var j = 0; j < maxPointCount; j++) dataArr.push(null);
      dataTable[pointName] = dataArr;
    }
    //保存页面的起停标记,默认初始为开启1
    window.localStorage.setItem(pageName, JSON.stringify({
      map: dataTable,
      time: timeArr,
      flag: 1
    }));

    //若是已有linePointDict，若是则将需将之前存过的其他页面的点信息与当前的合并
    //存储格式：{"444":["Backup1A0-Q0.1","InnerRoomAuxiliaryFanOnOff01"]}
    if (localStorage.getItem('linePointDict')) {
      let linePointDict = JSON.parse(localStorage.getItem('linePointDict'));
      linePointDict[pageName] = pointsList;
      window.localStorage.setItem('linePointDict', JSON.stringify(linePointDict));
    } else {
      //若是打开的软件后第一次配置点，则需初始linePointDict
      let linePointDict= {}
      linePointDict[pageName] = pointsList
      // console.log(linePointDict)
      window.localStorage.setItem('linePointDict', JSON.stringify(linePointDict));
    }
  }

//保存worker方法
export function getWorkerDict(workerDict){
  return {
    type : GET_WORKER_DICT,
    workerDict
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RESET]: () => {
    return initialState;
  },
  [INITIALIZE_LINE_CHART]: (state, action) => {
    return { ...state, pageData: action.pageData };
  },
  [TOGGLE_CONFIG_MODAL] : (state,action) => {
      return Object.assign( {},state,{ configVisible : action.configVisible} )
  },
  [SHOW_POINT_MODAL] : (state,action) => {
      return { ...state , pointModalDict : { visible : action.visible , props:action.modalProps } }
  },
  [HIDE_POINT_MODAL] : (state) => {
      return {...state,modal : initialState.modal}
  },
  [GET_WORKER_DICT] : (state,action) => {
    return {...state,workerDict:action.workerDict}
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  pageData:{},
  configVisible : false,
  pointModalDict:{}
  
};
export default function reducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
