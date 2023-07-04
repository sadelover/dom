import http from '../../../../../../common/http';
// ------------------------------------
// Constants
// ------------------------------------
export const RELOAD_POINT_TABLE = 'equipSystem.RELOAD_POINT_TABLE';
export const RENDER_ING_TABLE = 'equipSystem.RENDER_ING_TABLE';
export const RENDER_RECORD_TABLE = 'equipSystem.RENDER_RECORD_TABLE';
export const UPDATE_CONDITION = 'equipSystem.UPDATE_CONDITION';
export const RESET_POINT_TABLE = 'equipSystem.RESET_POINT_TABLE';
export const POINT_TABLE_SELECT_CHANGE = 'equipSystem.POINT_TABLE_SELECT_CHANGE';
export const ADD_EQUIPMENT_LIST = 'equipSystem.ADD_EQUIPMENT_LIST'
export const TABLE_LOADING = 'equipSystem.TABLE_LOADING'
export const SEARCH_LIST = 'equipSystem.SEARCH_LIST'
export const RENDER_FILE_TABLE = 'equipSystem.RENDER_FILE_TABLE'
export const RENDER_SEARCH_TABLE = 'equipSystem.RENDER_SEARCH_TABLE'
export const RENDER_SEARCHUSER_TABLE = "equipSystem.RENDER_SEARCHUSER_TABLE"
// ------------------------------------
// Actions
// ------------------------------------
export function reloadTable(time) {
  return function (dispatch, getState) {
    let state = getState();
    let tableState = state.equipSystemManage.table;
    dispatch(tableLoading(true)) //开始loading
    if(!(window.localStorage.getItem('pageSize'))){
      window.localStorage.setItem('pageSize',100)
    }
    //console.info(window.localStorage.setItem('pageSize',5));
    //window.localStorage.setItem('pageSize',100)
    // get data
    return http.post('/equipment/searchSystem',{
      "projectId":0,
      "searchKey":"",
      "pageSize":parseInt(window.localStorage.getItem('pageSize')),
      "targetPage":1
    }).then(
      data=>{
        if(data.status){
          dispatch(renderTable(data));//{total:5,data:[],status}
          dispatch(onSelectChange([]))
          return dispatch(tableLoading(false)) //结束loading
        }else {
          return dispatch(tableLoading(false))
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
 * @export searchKey
 * @returns 
 */
export function searcherList(searchKey,time) {
  return function (dispatch, getState) {
    let state = getState();
    let tableState = state.equipSystemManage.table;
    dispatch(tableLoading(true)) //开始loading
    if(!(window.localStorage.getItem('pageSize'))){
      window.localStorage.setItem('pageSize',100)
    }
    //console.info(window.localStorage.setItem('pageSize',5));
    //window.localStorage.setItem('pageSize',100)
    // get data
    return http.post('/attence/attenctStatistics',{
      "projectId":0,
      "searchKey":searchKey,
      "attenceMonth":time
    }).then(
      data=>{
        if(data.status){
          dispatch(renderTable(data));//{total:5,data:[],status}
          dispatch(onSelectChange([]))
          return dispatch(tableLoading(false)) //结束loading
        }else {
          return dispatch(tableLoading(false))
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
export function renderTable(data) {//{total:5,data:[],status}
  return {
    type: RENDER_ING_TABLE,//
    tableData: data
  };
}

export function recordTable(data) {//{total:5,data:[],status}
  return {
    type: RENDER_RECORD_TABLE,//
    recordData: data
  };
}
export function getFileTable(data){
  return{
    type:RENDER_FILE_TABLE,
    fileList:data
  }
}

export function searcherTable(data){
    return{
      type:RENDER_SEARCH_TABLE,
      searchData:data
    }
  }
export function searcherUserTable(data){
  return{
    type:RENDER_SEARCHUSER_TABLE,
    userData:data
  }
}


/**
 * 
 * 
 * @export
 * @param {dict} values
 * 
 */
export function addList(values){
  return function(dispatch){
    http.post('/equipment/addSystem',{
      "projId":0,
      "system_name":values.system_name,
      "system_desc": values.system_desc,
      "system_img":'',
    }).then(
      data => {
        if(data.status){
          dispatch(reloadTable())
        }
      }
    )
  }
}

/**
 * 删除一项或者多项设备数据
 * 
 * @export
 * @returns 
 */
export function delList(){
  return function(dispatch,getState){
    let table = getState().equipSystemManage.table
    http.post('/equipment/delSystem',{
      "ids":table.selectedIds
    }).then(
      data=>{
        if(data.status){
          dispatch(reloadTable())
        }else{
          //message.error(data.msg,2.5)//用弹框
        }
      }
    )
  }
}

/**
 * 选中一个设备信息并修改
 * 
 * @export
 * @param {dict} values 
 * @returns 
 */
export function modifyList(values,fileList){
  return function(dispatch,getState){
    let table = getState().equipSystemManage.table
    http.post('/equipment/updateSystem',{
       "id":table.selectedIds[0],
      "projId":0,
      "system_name":values.system_name,
      "system_desc": values.system_desc,
      // "system_img":values.upload[0].response.data.filePath||""
      "system_img":""      
    }).then(
      data=>{
        if(data.status){
          dispatch(reloadTable())
        }
      }
    )
  }
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
export function onSelectChange(selectedRowIds,rows) {
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
  [RENDER_ING_TABLE]: (state, action) => {
    //return Object.assign({},state,{data:action.data,total:action.total})
     return Object.assign({}, state, { 
       data: action.tableData.data, 
       total: action.tableData.total //第一个data action的属性  第二个是data[]
     });
  },
  [RENDER_RECORD_TABLE]: (state, action) => {
    //return Object.assign({},state,{data:action.data,total:action.total})
     return Object.assign({}, state, { 
       recordData: action.recordData.data
     });
  },
  [RENDER_FILE_TABLE]: (state, action) => {
    //return Object.assign({},state,{data:action.data,total:action.total})
     return Object.assign({}, state, { 
      fileList: action.fileList.data.files
     });
  },
     [RENDER_SEARCH_TABLE]:(state,action) => {
      return Object.assign({},state,{searchData:action.searchData.data});
     },
     [RENDER_SEARCHUSER_TABLE]:(state,action)=>{
      return Object.assign({},state,{userData:action.userData.msg});
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
    return Object.assign({},state,{searchKey:action.searchKey,current:1})
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
  searchKey:'',
  recordData:[],
  fileList:[],
  searchData:[],
  userData:[]
};
export default function TableReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
