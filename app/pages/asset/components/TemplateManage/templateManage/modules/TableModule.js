import http from '../../../../../../common/http'

import {message,Modal} from 'antd'
// ------------------------------------
// Constants
// ------------------------------------
export const RELOAD_POINT_TABLE = 'template.RELOAD_POINT_TABLE';
export const RENDER_POINT_TABLE = 'template.RENDER_POINT_TABLE';
export const UPDATE_CONDITION = 'template.UPDATE_CONDITION';
export const RESET_POINT_TABLE = 'template.RESET_POINT_TABLE';
export const POINT_TABLE_SELECT_CHANGE = 'template.POINT_TABLE_SELECT_CHANGE';
export const ADD_EXAM_LIST = 'template.ADD_EXAM_LIST'
export const TABLE_LOADING = 'template.TABLE_LOADING'
export const SEARCH_LIST = 'template.SEARCH_LIST'
export const SEARCH_SCORE = 'template.SEARCH_SCORE'
export const BACK_POINT = 'template.BACK_POINT'
export const RENDER_TITLE = 'template.RENDER_TITLE'
export const REMAINING_DATA = 'template.REMAINING_DATA'
export const RENDER_SEARCH_TABLE = 'template.RENDER_SEARCH_TABLE'
export const RENDER_SEARCHUSER_TABLE = "template.RENDER_SEARCHUSER_TABLE"
export const ADD_MODAL = "template.ADD_MODAL"
export const MODIFY_MODAL = "etemplate.MODIFY_MODAL"
export const ASSET_LOADING = 'template.ASSET_LOADING'
export const ASSET_DATA = 'template.ASSET_DATA'
export const PARAMETER_ADD_MODAL = "template.PARAMETER_ADD_MODALS"
export const PARAMETER_LOADING = 'template.PARAMETER_LOADING'
export const PARAMETER_DATA = 'template.PARAMETER_DATA'
export const PARAMETER_MODIFY_MODAL = 'template.PARAMETER_MODIFY_MODAL'
export const TEMPLATE_DATA = 'template.TEMPLATE_DATA'
export const ASSET_MODAL = 'template.ASSET_MODAL'
export const PARAMETER_MODAL = 'template.PARAMETER_MODAL'
// ------------------------------------
// Actions
// ------------------------------------
export function reloadTable() {
  return function (dispatch, getState){
    let state = getState();
    let tableState = state.templateManage.table;
    dispatch(tableLoading(true)) //开始loading
    if(!(window.localStorage.getItem('pageSize'))){
      window.localStorage.setItem('pageSize',100)
    }
    // get data
    return http.post('/equipment/searchAssetTmplDef',{
      searchKey: tableState.searchKey,
      pageSize: parseInt(window.localStorage.getItem('pageSize')),
      //默认显示第一页
      targetPage:1,
      exam_type:'',
      projectId:0
    }).then(
    data=>{
        if(data.status){
          dispatch(renderTable(data)); //页面渲染加载
          dispatch(onSelectChange([])); //选中项的状态清空
          dispatch(tableLoading(false)) //结束loading
        }else {
          dispatch(tableLoading(false))
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
export function searchList(searchKey){
  return function(dispatch,getState){
    let state = getState();
    let tableState = state.templateManage.table;
    dispatch({ //保存一个searchKey
      type : SEARCH_LIST,
      searchKey
    })
    dispatch(tableLoading(true)) //开始loading
    if(!(window.localStorage.getItem('pageSize'))){
      window.localStorage.setItem('pageSize',100)
    }
    return http.post('/equipment/searchAssetTmplDef',{
      searchKey:searchKey,
      pageSize: parseInt(window.localStorage.getItem('pageSize')),
      targetPage:1,
      projectId:0
    }).then(
      data=>{
        if(data.status){
          // 渲染数据
          dispatch(renderTable(data));
          dispatch(onSelectChange([]));   //清空选项
          dispatch(tableLoading(false))   //结束loading
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
//重置
export function reset() {
  return {
    type: RESET_POINT_TABLE
  };
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

export function addList(addArr){
  return function(dispatch){
    http.post('/equipment/addAssetTmplDef',{
      "name":addArr[0],
      "describe":addArr[1],
      "pageSize" : Number(localStorage.pageSize) || 100,
      "projectId":0,
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
    let table = getState().templateManage.table
    http.post('/equipment/delAssetTmplDef',{
      "ids":table.selectedIds,
    }).then(
      data=>{
        if(data.status){
          dispatch(reloadTable())
        }else{
          Modal.error({
              title: '错误提示',
              content: "后台接口-接口请求失败！"+data.msg
          })
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
export function modifyList(addArr){
  return function(dispatch,getState){
    let table = getState().templateManage.table
    http.post('/equipment/updateAssetTmplDef',{
      "name":addArr[0],
      "describe":addArr[1],
      "id":table.selectedIds[0],
      "pageSize" : Number(localStorage.pageSize) || 100,
      "projectId":0,
    }).then(
      data=>{
        if(data.status){
          dispatch(reloadTable())
        }
      }
    )
  }
}
//搜索用户
  export function searchInsUser(searchKey){
    return function(dispatch,getState){
      let table = getState().templateManage.table
      http.post('/global/searchUser',{
        searchKey:searchKey
      }).then(
        data=>{
          if(data.status){
            // dispatch(reloadTable())
            dispatch(searcherTable(data))
          }
        }
      )
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

//显示Add模态窗
export function AddMadol(value){
  return {
    type:ADD_MODAL,
    addvisible:value
  }
}
//显示参数add,添加模态框
export function ParemeterAddMoadal(value){
  return {
    type:PARAMETER_ADD_MODAL,
    parameter:value
  }
}
//显示参数modify修改模态框
export function ParemeterModifyMoadl(value){
  return {
    type:PARAMETER_MODIFY_MODAL,
    parametermodify:value
  }
}

export function ParemeterLoading(data){
  return {
    type:PARAMETER_LOADING,
    parameterloading:data 
  }
}
export function ParemeterData(data){
  return {
    type:PARAMETER_DATA,
    parameterdata:data 
  }
}
//
export function ModifyModal(value){
  return {
    type:MODIFY_MODAL,
    modifyvisble:value
  }
}
//资产模板的数据loading 
export function AssetLoading(data){
  return {
    type:ASSET_LOADING,
    assetloading:data 
  }
}
export function AssetData(data){
  return{
    type:ASSET_DATA,
    assetdata:data
  }
}
//模板选择
export function assetSelect(id){
  return {
    type:ASSET_MODAL,
    assetSelecteds:id
  }
}


//获取模板的id和name
export function Obtain(id,name){
  return{
    type:TEMPLATE_DATA,
    template_id:id,
    template_name:name
  }
}
export const actions = {
  reloadTable,
  renderTable,
  onPaginationChange,
  onSelectChange,
  reset,
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RENDER_POINT_TABLE]: (state, action) => {
    return Object.assign({}, state, { 
      data: action.data.data.map( row => {
        row['status'] == 0 ? row['status']='新建': row['status']='1' //考试状态状态   
        switch(row['exam_type']){//设备类型 
          case "1":
            row['exam_type'] = "安全知识";
            break;
          case "2":
            row['exam_type'] = "急救知识";
            break;
          case "3":
            row['exam_type'] = "预防触电";
            break;
          case "4":
            row['exam_type'] = "预防火灾";
            break;
          case "5":
            row['exam_type'] = "防止高空坠落";
            break;
          default:
            break;    
        }
        return row
      }), 
      total: action.data.total 
    });
  },
  [RENDER_TITLE]:(state,action) => {
    return  Object.assign({},state,{
      indata :  action.data.data.map(row=>{
        switch(row['exam_type']){
          case 1:
            row['exam_type'] = "安全知识";
            break;
          case 2:
            row['exam_type'] = "急救知识";
            break;
          case 3:
            row['exam_type'] = "预防触电";
            break;
          case 4:
            row['exam_type'] = "预防火灾";
            break;
          case 5:
            row['exam_type'] = "防止高空坠落";
            break;
          default:
            break;    
        }
        return row
      })
    })
  },
  [TEMPLATE_DATA]:(state,action)=>{
    return Object.assign({},state,{
      template_id:action.template_id,
      template_name:action.template_name
    })
  },
  [UPDATE_CONDITION]: (state, action) => {
    return Object.assign({}, state, action.condition);
  },
  [ADD_MODAL]:(state,action)=>{
    return Object.assign({},state,{
      addvisible:action.addvisible
    })
  },
  [PARAMETER_ADD_MODAL]:(state,action) =>{
    return Object.assign({},state,{
      parameter:action.parameter
    })
  },
  [PARAMETER_LOADING]:(state,action)=>{
    return Object.assign({},state,{
      parameterloading:action.parameterloading
    })
  },
  [PARAMETER_DATA]:(state,action)=>{
    return Object.assign({},state,{
      parameterdata:action.parameterdata
    })
  },
  [PARAMETER_MODIFY_MODAL]:(state,action)=>{
    return Object.assign({},state,{
      parametermodify:action.parametermodify
    })
  },
  [ASSET_LOADING]:(state,action)=>{
    return Object.assign({},state,{
      assetloading:action.assetloading
    })
  },
  [ASSET_DATA]:(state,action)=>{
    return Object.assign({},state,{
      assetdata:action.assetdata.data.map(row=>{
        switch(row['ui_type']){
          case 1:
            row['ui_type']='text'
            break;
          case 2:
            row['ui_type']='textarea'
        }
        return  row
      })
    })
  },
  [MODIFY_MODAL]:(state,action)=>{
    return Object.assign({},state,{
      modifyvisble:action.modifyvisble
    })
  },
  [RESET_POINT_TABLE]: (state, action) => {
    return initialState;
  },
  [RENDER_SEARCHUSER_TABLE]:(state,action)=>{
    return Object.assign({},state,{userData:action.userData});
   },
  [RENDER_SEARCH_TABLE]:(state,action) => {
    return Object.assign({},state,{searchData:action.searchData.data});
   },
  [REMAINING_DATA]:(state,action) =>{
    return Object.assign({},state,{remaining:action.data})
  },
  [POINT_TABLE_SELECT_CHANGE]: (state, action) => {
    return Object.assign({}, state, { selectedIds: action.selectedIds });
  },
  [TABLE_LOADING] : (state,action) => {
    return Object.assign({},state,{loading:action.loading})
  },
  [SEARCH_LIST] : (state,action) => {
    return Object.assign({},state,{searchKey:action.searchKey,current:1})
  },
  [BACK_POINT]:(state,action) => { 
    return Object.assign({},state,{remaining:action.data})
  },
  [ASSET_MODAL]:(state,action)=>{
    return Object.assign({},state,{
      assetSelecteds:action.assetSelecteds
    })
  }
}
// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  data: [],   //外层data
  total: 0,
  current: 1,
  pageSize: parseInt(window.localStorage.getItem('pageSize')) || 100,
  selectedIds:[],
  loading : false,
  searchKey:'',
  searchData:[],
  userData:[],
  addvisible:false,
  modifyvisble:false,
  assetloading:false,
  assetdata:[],
  parameter:false,
  parametermodify:false,
  parameterloading:false,
  parameterdata:[],
  template_id:'',
  template_name:'',
  paremeterSelecteds:[],
  assetSelecteds:[]
};
export default function TableReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
