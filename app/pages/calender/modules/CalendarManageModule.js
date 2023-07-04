import moment from 'moment';
import http from '../../../common/http';
import {Modal} from 'antd'
// ------------------------------------
// Constants
// ------------------------------------

export const SAVE_CALENDAR_MODE = 'SAVE_CALENDAR_MODE'
export const CALENDAR_LOADING = 'CALENDAR_LOADING'

// ------------------------------------
// Actions
// ------------------------------------

export function loadingCalendar(loading){
    return {
        type : CALENDAR_LOADING,
        loading : loading
    }
}

//给日历单日绑定模式
export function addModelToCalendar(date,type,id,modalType) {
  return function(dispatch,getstate){  
    return http.post('/calendar/addModeToCalendar',{
      "modeId": id, 
      "date":  date,
      "type": type,
      "creator":localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? 
                  JSON.parse(localStorage.getItem('userInfo')).name : '',
      "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
                  
    }).then(
      data=>{
        if (!data.err) {
          dispatch(getOneTypeCalendarWithMode(date,modalType))
        }else {
          Modal.error({
            title: '错误提示',
            content: data.msg
          })
          dispatch(loadingCalendar(false));
        }
      }
    ).catch(
      () => {
         dispatch(loadingCalendar(false));
      }
    )
  }
}

//给日历一个月绑定模式
export function addModelToCalendarMonth(year,month,date,type,id,modalType,weekdayList) {
  return function(dispatch,getstate){  
    return http.post('/calendar/batchAddModeToCalendar',{
      "modeId": id, 
      "year":  Number(year) ,
      "month":Number(month) ,
      "type": type,
      "creator":localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? 
                  JSON.parse(localStorage.getItem('userInfo')).name : '',
      "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : '',
      "weekdayList":weekdayList
    }).then(
      data=>{
        if (!data.err) {
          dispatch(getOneTypeCalendarWithMode(date,modalType))
        }else {
          Modal.error({
            title: '错误提示',
            content: data.msg
          })
          dispatch(loadingCalendar(false));
        }
      }
    ).catch(
      () => {
        dispatch(loadingCalendar(false));
      }
    )
  }
}

//删除某天的一个模式
export function delModelToCalendar(date,id,modalType) {
  return function(dispatch,getstate){  
    return http.post('/calendar/removeModeFromCalendar',{
      "modeId": id, 
      "date":  date,
      "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
    }).then(
      data=>{
        if (!data.err) {
          dispatch(getOneTypeCalendarWithMode(date,modalType))
        }else {
          Modal.error({
            title: '错误提示',
            content: data.msg
          })
          dispatch(loadingCalendar(false));
        }
      }
    ).catch(
      () => {
        dispatch(loadingCalendar(false));
      }
    )
  }
}

//获取日历的所有模式
export function getAllCalendarWithMode(date,type) {
  return function(dispatch,getstate){  
    return http.post('/calendar/getCalendarWithMode',{
      "year":Number(moment(date).format("YYYY")), 
      "month": Number(moment(date).format("MM"))
      //"type":type
    }).then(
      data=>{
        if (!data.err) {
          dispatch(saveAllCalendarWithMode(data.data))
          setTimeout(dispatch(loadingCalendar(false)),10*1000)
        }else {
          Modal.error({
            title: '错误提示',
            content: data.msg
          })
          dispatch(loadingCalendar(false));
        }
      }
    ).catch(
      () => {
        dispatch(loadingCalendar(false));
      }
    )
  }
} 

//获取日历的某种模式
export function getOneTypeCalendarWithMode(date,type) {
  return function(dispatch,getstate){  
    return http.post('/calendar/getCalendarWithMode',{
      "year":Number(moment(date).format("YYYY")), 
      "month": Number(moment(date).format("MM")),
      "type":type
    }).then(
      data=>{
        if (!data.err) {
          dispatch(saveAllCalendarWithMode(data.data))      
          setTimeout(dispatch(loadingCalendar(false)),10*1000)
        }else {
          Modal.error({
            title: '错误提示',
            content: data.msg
          })
          dispatch(loadingCalendar(false));
        }
      }
    ).catch(
      () => {
        dispatch(loadingCalendar(false));
      }
    )
  }
} 

//保存日历的模式
export function saveAllCalendarWithMode(data) {
  return {
    type: SAVE_CALENDAR_MODE,
    calendarData:data
  }
}

export const actions = {
  saveAllCalendarWithMode
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SAVE_CALENDAR_MODE]: (state, action) => {
    return { ...state, calendarData:action.calendarData }
  },
  [CALENDAR_LOADING]: (state, action) => {
    return { ...state, loading:action.loading }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  calendarData: [],
  loading:false
  
};
export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
