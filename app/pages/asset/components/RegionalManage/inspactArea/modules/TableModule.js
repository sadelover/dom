import http from '../../../../../../common/http';
import {message} from 'antd'
// ------------------------------------
// Constants
// ------------------------------------
export const SEARCH_KEY = 'inspactArea.SEARCH_AREA'
export const SEARCH_AREA = 'inspactArea.SEARCH_AREA'
export const ADD_AREA = 'inspactArea.ADD_AREA'
export const DELETE_AREA = 'inspactArea.DELETE_AREA'
export const SEQ_AREA = 'inspactArea.SEQ_AREA'
export const TABLE_LOADING = 'inspactArea.TABLE_LOADING'
export const UPDATE_CONDITION = 'inspactArea.UPDATE_CONDITION';
export const AREA_TABLE_SELECT_CHANGE = 'inspactArea.AREA_TABLE_SELECT_CHANGE';


/**
 * 查询巡检任务列表
 * @returns 
 */
export function searchArea() {
  return function(dispatch,getState){
    let state = getState();
    dispatch(tableLoading(true)) //开始loading
    if(!(window.localStorage.getItem('pageSize'))){
      window.localStorage.setItem('pageSize',100)
    }
    http.post('/deviceManage/searchArea',{
      searchKey:'',
      pageSize: parseInt(window.localStorage.getItem('pageSize')),
      targetPage:1,
      projectId:0
    }).then(
      data=>{
        if(data.status){
          dispatch({
            type: SEARCH_AREA,
            data:data
          })
          dispatch(onSelectChange([]));
          dispatch(tableLoading(false)) //结束loading
        }else {
          dispatch(tableLoading(false)) //结束loading
          Modal.error({
            title: '错误提示',
            content: "后台接口-"+data.msg
          })
        }
      }
    ).catch(
      err=>{
        dispatch(tableLoading(false)) 
        console.error(err.msg)
      }
    )
  }
}


/**
 * 添加巡检计划list
 * @export
 * @param {dict} values 为巡检计划属性名称
 * @param {dict} tdata  为巡检设备信息
 */
export function addList(values,tdata){
  return function(dispatch){
    http.post('/deviceManage/addArea',{
      "areaName": values.areaName,
      "description": values.description,
      "projId":0
    }).then(
      data => {
        if(data.status){
          dispatch(searchArea())
        }else{
          showMessage(data.msg)
        }
      }
    )
  }
}


/**
 * 删除一项或者多项巡检计划数据
 * @export
 * @returns 
 */
export function delList(){
  return function(dispatch,getState){
    let table = getState().inspactArea.table
    http.post('/deviceManage/deleteArea',{
      delArray:table.selectedIds
    }).then(
      data=>{
        if(data.status){
          dispatch(searchArea())
        }else{
          Modal.error({
            title: '错误提示',
            content: "后台接口-"+data.msg
          })
        }
      }
    )
  }
}

/**
 * 选中一个巡检计划信息并修改
 * @export
 * @param {dict} values 
 * @returns 
 */
export function modifySeq(id,type){
  return function(dispatch,getState){
    let table = getState().inspactArea.table
    http.post('/deviceManage/areaSeq',{
      "id":String(id),
      "type":type,
      "projId":0
    }).then(
      data=>{
        if(data.status){
          dispatch(searchArea())
        }
      }
    )
  }
}


/**
 * 是否显示加载中图表样式Action
 * @export searchKey
 * @returns 
 */
export function tableLoading(loading){
  return {
    type : TABLE_LOADING,
    loading
  }
}


/**
 * 更新分页条件
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
 * @export
 * @param {any} selectedRowIds 
 * @returns 
 */
export function onSelectChange(selectedRowIds) {
  return {
    type: AREA_TABLE_SELECT_CHANGE,
    selectedIds: selectedRowIds
  };
}

/**
 * 操作Type与对应函数常量（用于修改state值）
 * 通过TableReducer传入不同的action.type
 * 执行不同的方法
 * state action
 */
const ACTION_HANDLERS = {
  [SEARCH_AREA]: (state, action) => {
    return Object.assign({}, state, { 
      data: action.data.data,
      total: action.data.data.length 
    });
  },
  [TABLE_LOADING] : (state,action) => {
    return Object.assign({},state,{loading:action.loading})
  },
  [AREA_TABLE_SELECT_CHANGE]: (state, action) => {
    return Object.assign({}, state, { selectedIds: action.selectedIds });
  },
}

/**
 * 初始化state数据
 */
const initialState = {
  data: [],
  total: 0,
  current: 1,
  pageSize: parseInt(window.localStorage.getItem('pageSize')) || 100,
  selectedIds: [],
  loading : false
};
/**
 * reducer操作对象
 * 用于将 ajaxdata---传递给action.data----传递给state.data
 * @param {} state 
 * @param {*} action 
 */
export default function TableReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}

