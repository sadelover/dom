import appConfig from '../../../common/appConfig';
import http from '../../../common/http';
import {message} from 'antd'
// ------------------------------------
// Constants
// ------------------------------------
export const RELOAD_POINT_TABLE = 'logPage.RELOAD_POINT_TABLE';
export const RENDER_POINT_TABLE = 'logPage.RENDER_POINT_TABLE';
export const UPDATE_CONDITION = 'logPage.UPDATE_CONDITION';
export const RESET_POINT_TABLE = 'logPage.RESET_POINT_TABLE';
export const POINT_TABLE_SELECT_CHANGE = 'logPage.POINT_TABLE_SELECT_CHANGE';
export const ADD_EQUIPMENT_LIST = 'logPage.ADD_EQUIPMENT_LIST';
export const TABLE_LOADING = 'logPage.TABLE_LOADING';
export const SEARCH_LIST = 'logPage.SEARCH_LIST';
export const GET_TIME_RANGE = 'logPage.GET_TIME_RANGE'
// ------------------------------------
// Actions
// ------------------------------------

//保存时间
export function getTimeRange(logTimeRange){
  return {
    type : GET_TIME_RANGE,
    logTimeRange : logTimeRange
  }
}

export function reloadTable() {
    return function (dispatch, getState) {
      let state = getState();
      let tableState = state.debug.logTable;
      let logTimeRange = JSON.parse(window.localStorage.logTimeRange)
      dispatch(tableLoading(true)) //开始loading
      if(!(window.localStorage.getItem('pageSize'))){
        window.localStorage.setItem('pageSize',100)
      }
      
      // get data
      return http.post('/log/search',{
        keyWordList:tableState.keyWordList,
        timeFrom: logTimeRange.timeFrom,
        timeTo: logTimeRange.timeTo,
        pageSize: parseInt(window.localStorage.getItem('pageSize')),
        targetPage:tableState.current
      }).then(
        data=>{
          if(data){
            console.info( data )
            dispatch(renderTable(data));
            dispatch(onSelectChange([]));
            return dispatch(tableLoading(false)) //结束loading
          }
        }
      )
    }
  }
  
  //检测table是否在加载数据
  export function tableLoading(loading){
    return {
      type : TABLE_LOADING,
      loading
    }
  }
  
  /**
   * 查询list
   * 
   * @export keyWordList
   * @returns 
   */
  export function searchList(keyWordList){
    return function(dispatch,getState){
      let state = getState();
      let tableState = state.debug.logTable;
      let logTimeRange = JSON.parse(window.localStorage.logTimeRange)
      
      dispatch({ //保存一个searchKey
        type : SEARCH_LIST,
        keyWordList
      })
      dispatch(tableLoading(true)) //开始loading
      if(!(window.localStorage.getItem('pageSize'))){
        window.localStorage.setItem('pageSize',100)
      }
  
      return http.post('/log/search',{
        keyWordList:keyWordList,
        timeFrom: logTimeRange.timeFrom,
        timeTo: logTimeRange.timeTo,
        pageSize: parseInt(window.localStorage.getItem('pageSize')),
        targetPage:1
      }).then(
        data=>{
          if(data){
            console.info( data )
            dispatch(renderTable(data));
            dispatch(onSelectChange([]));
            return dispatch(tableLoading(false)) //结束loading
          }
        }
      )
    }
  }
  
  /**
   * 保存表格数据
   * 
   * @export
   * @param {dict} data 
   * data.data  表格list
   * data.total_page 表格总页数
   */
  export function renderTable(data) {
    return {
      type: RENDER_POINT_TABLE,
      data: data
    };
  }
  
  /**
   * 更新分页条件
   * 
   * @export
   * @param {any} condition 
   * @returns 
   */
  export function updateCondition(condition) {
    return {
      type: UPDATE_CONDITION,
      condition: {
        current: condition.pagination.current,
        pageSize: parseInt(window.localStorage.getItem('pageSize'))
      }
    };
  }
  
  /**
   * 修改分页器
   * 
   * @export
   * @param {any} pagination 
   * @param {any} filters 
   * @param {any} sorter 
   * @returns 
   */
  export function onPaginationChange(pagination, filters, sorter) {
    return function (dispatch) {
      window.localStorage.setItem('pageSize',pagination.pageSize);
      dispatch(updateCondition({pagination, filters, sorter}));
      dispatch(reloadTable());
    };
  }
  
  /**
   * 选择对应的行信息
   * 
   * @export
   * @param {any} selectedRowIds 
   * @returns 
   */
  export function onSelectChange(selectedRowIds) {
    return {
      type: POINT_TABLE_SELECT_CHANGE,
      selectedIds: selectedRowIds
    };
  }
  
  
  export function reset() {
    return {
      type: RESET_POINT_TABLE
    };
  }
  
  
  
  export const actions = {
    reloadTable,
    renderTable,
    onPaginationChange,
    onSelectChange,
    reset
  }
  
  // ------------------------------------
  // Action Handlers
  // ------------------------------------
  const ACTION_HANDLERS = {
    [RENDER_POINT_TABLE]: (state, action) => {
      return Object.assign({}, state, { 
        data: action.data.data,
        total: action.data.totalNum 
      });
    },
    [UPDATE_CONDITION]: (state, action) => {
      return Object.assign({}, state, action.condition);
    },
    [RESET_POINT_TABLE]: (state, action) => {
      return initialState;
    },
    [POINT_TABLE_SELECT_CHANGE]: (state, action) => {
      return Object.assign({}, state, { selectedIds: action.selectedIds });
    },
    [TABLE_LOADING] : (state,action) => {
      return Object.assign({},state,{loading:action.loading})
    },
    [SEARCH_LIST] : (state,action) => {
      return Object.assign({},state,{keyWordList:action.keyWordList,current:1})
    },
    [GET_TIME_RANGE] : (state,action) => {
      window.localStorage.logTimeRange = JSON.stringify(action.logTimeRange)
      return Object.assign({},state,{logTimeRange:action.logTimeRange})
    }
  }
  
  // ------------------------------------
  // Reducer
  // ------------------------------------
  const initialState = {
    data: [],
    total: 0,
    current: 1,
    pageSize: parseInt(window.localStorage.getItem('pageSize')) || 100,
    selectedIds: [],
    loading : false,
    keyWordList:[],
    logTimeRange:{}
  };
  export default function LogTableReducer (state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type];
  
    return handler ? handler(state, action) : state;
  }
  