import http from '../../../../../../common/http';
import {message,Modal} from 'antd'
// ------------------------------------
// Constants
// ------------------------------------
export const RELOAD_POINT_TABLE = 'device.RELOAD_POINT_TABLE';
export const RENDER_ING_TABLE = 'device.RENDER_ING_TABLE';
export const RENDER_TABLE = 'device.RENDER_TABLE';
export const UPDATE_CONDITION = 'device.UPDATE_CONDITION';
export const RESET_POINT_TABLE = 'device.RESET_POINT_TABLE';
export const POINT_TABLE_SELECT_CHANGE = 'device.POINT_TABLE_SELECT_CHANGE';
export const ADD_EQUIPMENT_LIST = 'device.ADD_EQUIPMENT_LIST';
export const TABLE_LOADING = 'device.TABLE_LOADING';
export const SEARCH_LIST = 'device.SEARCH_LIST'
export const LIST_SEARCH = 'device.LIST_SEARCH';
export const DEVICE_RECORD_TABLE = 'device.DEVICE_RECORD_TABLE';
export const RENDER_HIDE = 'device.RENDER_HIDE';
export const RENDER_SHOW = 'device.RENDER_SHOW';
export const RENDER_HIDE_MODIFY = 'device.RENDER_HIDE_MODIFY';
export const RENDER_SHOW_MODIFY = 'device.RENDER_SHOW_MODIFY';
export const SAVE_PROPERTY_INFO = 'device.SAVE_PROPERTY_INFO';
export const SAVE_PARAM_INFO = 'SAVE_PARAM_INFO';
export const CLEAR_PROPERTY_INFO = 'CLEAR_PROPERTY_INFO';
export const RENDER_ADD_HIDE = 'device.RENDER_ADD_HIDE';
export const RENDER_ADD_SHOW = 'device.RENDER_ADD_SHOW';
export const RENDER_HIDE_EXAMINE = 'device.RENDER_HIDE_EXAMINE';
export const RENDER_SHOW_EXAMINE = 'device.RENDER_SHOW_EXAMINE';
export const RENDER_HIDE_AGAIN = 'device.RENDER_HIDE_AGAIN';
export const RENDER_SHOW_AGAIN = 'device.RENDER_SHOW_AGAIN';
export const RENDER_SEARCHER_TABLE = 'device.RENDER_SEARCHER_TABLE';
export const RENDER_HIDE_DETAILS = 'device.RENDER_HIDE_DETAILS';
export const RENDER_SHOW_DETAILS = 'device.RENDER_SHOW_DETAILS';
export const CARE_DATA = 'device.CARE_DATA ';
export const CARE_LOADING = 'device.CARE_LOADING'
export const CARE_SHOWMODEL = 'device.CARE_SHOWMODEL'
export const CARE_ID = 'device.CARE_ID'
export const CARE_SELECTEDS = 'device.CARE_SELECTEDS'
export const CARE_ADVANCE = 'device.CARE_ADVANCE'
export const CARE_AUDIT = 'device.CARE_AUDIT'
export const CARE_DETAILS ='device.CARE_DETAILS'
export const THREE_DATA ='device.THREE_DATA'
export const SAVE_ID ='device.SAVE_ID';
export const SAVE_CUR_NEW_EQUIP_ID = 'device.SAVE_CUR_NEW_EQUIP_ID';
export const SAVE_DEVICE_NAME = 'device.SAVE_DEVICE_NAME';
export const SET_ACTIVEKEY = 'device.SET_ACTIVEKEY';
export const SET_MODIACTIVEKEY = 'device.SET_MODIACTIVEKEY';
export const SET_WARNING = 'device.SET_WARNING';
export const SET_RESET = 'device.SET_RESET';
export const SAVE_DEVICEDATA = 'device.SAVE_DEVICEDATA'
export const ASSET_DATA ='device.ASSET_DATA'
// ------------------------------------
// Actions
// ------------------------------------
export function reloadTable() {
  return function (dispatch,getState) {
    let state = getState();
    let tableState = state.deviceManage.table;
    dispatch(tableLoading(true)) //开始loading
    if(!(window.localStorage.getItem('pageSize'))){
      window.localStorage.setItem('pageSize',100)
    }
    // get data
    return http.post('/equipment/search',{
      searchKey:tableState.searchKey,
      pageSize: parseInt(window.localStorage.getItem('pageSize')),
      system_id:'',
      targetPage:tableState.current,
      projectId:0
    }).then(
      data=>{
        if(data.status){
          dispatch(renderDeviceTable(data));
          dispatch(onSelectChange([]));
          return dispatch(tableLoading(false)) //结束loading
        }else {
          dispatch(renderDeviceTable([]));
          return dispatch(tableLoading(false))
        }
      }
    ).catch(
      err=>{
        dispatch(tableLoading(false)) 
      }
    )
  }
}
//树型id查询数据
export function treeSearch(id){
  return function(dispatch,getState){
    let state = getState();
    let tableState = state.deviceManage.table;
    dispatch(tableLoading(true)) //开始loading
    if(!(window.localStorage.getItem('pageSize'))){
      window.localStorage.setItem('pageSize',100)
    }
    return http.post('/equipment/search',{
      searchKey:tableState.searchKey,
      pageSize: parseInt(window.localStorage.getItem('pageSize')),
      system_id:id,
      targetPage:tableState.current,
      projectId:0
    }).then(
      data=>{
        if(data.status){
          dispatch(renderDeviceTable(data))
          dispatch(tableLoading(false)) 
        }else{
          dispatch(renderDeviceTable([]))
          dispatch(tableLoading(false)) 
        }
      }
    ).catch(
      err=>{
        dispatch(tableLoading(false)) 
        console.log(err.msg)
      }
    )
  }
}
//存储system_id
export function saveId(id){
  return {
    type:SAVE_ID,
    systemId:id
  }
}
//获取树型的数据
export function treeTable(){
    return function(dispatch, getState){
      let state = getState();
      let tableState = state.deviceManage.table;
      return http.post('/equipment/searchSystem',{
        "projectId":0,
        "searchKey":"",
        "pageSize":parseInt(window.localStorage.getItem('pageSize')),
        "targetPage":1
      }).then(
        data=>{
          dispatch(tree(data))
        }
      )
    }
}
export function tree(data){
    return {
      type:THREE_DATA,
      treedata:data
    }
}

//获取生成的后台静态模板文件
export function getAssetTemplate(){
  return function(dispatch, getState){
    return http.get('/equipment/getAssetTemplateFileList').then(
      data=>{
        dispatch(getAsset(data))
      }
    )
  }
}
export function getAsset(data){
  return {
    type:ASSET_DATA,
    assetData:data
  }
}

export function hide(){
  return function(dispatch){
  dispatch(hideAction());
  }
}

export function hideAction() {
  return {
    type: RENDER_HIDE,
    hideData: false
  };
}

export function show(){
  return function(dispatch){
  dispatch(showAction());
  }
}

export function showAction() {
  return {
    type: RENDER_SHOW,
    hideData: true
  };
}

export function hideAdd(){
  return function(dispatch){
  dispatch(hideAddAction());
  }
}

export function hideAddAction() {
  return {
    type: RENDER_ADD_HIDE,
    hideAddData: false
  };
}


export function showAdd(){
  return function(dispatch){
  dispatch(showAddAction());
  }
}

export function showAddAction() {
  return {
    type: RENDER_ADD_SHOW,
    hideAddData: true
  };
}

export function hideModify(){
  return function(dispatch){
  dispatch(hideActionModify());
  }
}

export function hideActionModify() {
  return {
    type: RENDER_HIDE_MODIFY,
    showData: false
  };
}

export function showModify(){
  return function(dispatch){
  dispatch(showActionModify());
  }
}

export function showActionModify() {
  return {
    type: RENDER_SHOW_MODIFY,
    showData: true
  };
}

export function hideExamine(){
  return function(dispatch){
  dispatch(hideActionExamine());
  }
}

export function hideActionExamine() {
  return {
    type: RENDER_HIDE_EXAMINE,
    examineData: false
  };
}

export function showExamine(id){
  return function(dispatch){
  dispatch(showActionExamine(id));
  }
}

export function showActionExamine(id) {
  return {
    type: RENDER_SHOW_EXAMINE,
    maintenId:id,
    examineData: true
  };
}

export function hideAgain(){
  return function(dispatch){
  dispatch(hideActionAgain());
  }
}

export function hideActionAgain() {
  return {
    type: RENDER_HIDE_AGAIN,
    examineData: false
  };
}

export function showAgain(id){
  return function(dispatch){
  dispatch(showActionAgain(id));
  }
}

export function showActionAgain(id) {
  return {
    type: RENDER_SHOW_AGAIN,
    maintenId:id,
    examineData: true
  };
}


export function hideDetails(){
  return function(dispatch){
  dispatch(hideActionDetails());
  }
}

export function hideActionDetails() {
  return {
    type: RENDER_HIDE_DETAILS,
    Data: false
  };
}

export function showDetails(id){
  return function(dispatch){
  dispatch(showActionDetails(id));
  }
}

export function showActionDetails(id) {
  return {
    type: RENDER_SHOW_DETAILS,
    maintenId:id,
    Data: true
  };
}


//检测table是否在加载数据
export function tableLoading(loading){
  return {
    type : TABLE_LOADING,
    loading
  }
}
//重置新增的内容
export function resetAdd(){
  return{
    type:SET_RESET,
    paramInfo:[],
    propertyInfo:[]
  }
}
export function saveData(data){
  return{
    type:SAVE_DEVICEDATA,
    deviceData:data
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
    dispatch({ //保存一个searchKey
      type : SEARCH_LIST,
      searchKey
    })
    dispatch(tableLoading(true)) //开始loading
    if(!(window.localStorage.getItem('pageSize'))){
      window.localStorage.setItem('pageSize',100)
    }
    return http.post('/equipment/search',{
      searchKey:searchKey,
      pageSize: parseInt(window.localStorage.getItem('pageSize')),
      system_id:"",
      targetPage:1,
      projectId:0
    }).then(
      data=>{
        if(data.status){
          dispatch(renderDeviceTable(data));
          dispatch(onSelectChange([]));
          dispatch(tableLoading(false)) //结束loading
        }else{
          dispatch(renderDeviceTable([]));
          dispatch(tableLoading(false)) //结束loading
        }
      }
    ).catch(
      err=>{
        dispatch(tableLoading(false)) 
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


/**
 * 添加设备信息
 * 
 * @export
 * @param {dict} values
 * 
 */
//添加设备信息
export function addDeviceInfo(values){
  return function(dispatch,getState){
    let state = getState();
    let tableState = state.deviceManage.table;
    http.post('/equipment/add',{
      "name": values.name,
      "type": Number(values.type),
      "installLocation": values.installLocation,
      "communicateStatus": Number(values.communicateStatus),
      "maintenanceStatus": Number(values.maintenanceStatus),
      "repairStatus": Number(values.repairStatus),
      "repairResponsiblePerson": "lilei", //后台接口保留字段，界面无显示
      "warningStatus": 1,//后台接口保留字段，界面无显示
      "pageSize" : Number(localStorage.pageSize) || 100,
      "projectId":0,
      "online_addr":values.online_addr,
      "description":values.description,
      "area_id":Number(values.area),
      "system_id":tableState.systemId,
      "model_id":Number(values.templateType)
    }).then(
      data => {
        //设备信息添加成功以后，即可获得equip_id和用户选择的template_id，去请求资产信息的内容，用于第二个面板的显示
        if(data.status){
          dispatch(saveCurNewEquipId(data.data,Number(values.templateType)))
          http.post('/equipment/getInitAsset',{
              "project_id":0,
              "template_id":Number(values.templateType),
              "equip_id":data.data
          }).then(
              data=>{
                  dispatch(savePropertyInfo(data.data))
                  dispatch(setWarning(true))
                  dispatch(setActiveKey("2")) 
                  // dispatch(saveCurNewEquipId(data.data,Number(values.templateType)))
              } 
          )
          // Modal.success({
          //   title: '提示',
          //   content:'设备信息提交成功',
          //   closable:true,
          //   maskClosable:false,
          //   okText:'确定',
          //   onOk() {}
          // });
         
        }
      }
    )
  }
}

export function saveCurNewEquipId(equipId,templateId){
  return{
    type:SAVE_CUR_NEW_EQUIP_ID,
    equipId:equipId,
    templateId:templateId
  }
}
/**
 * 
 * @event 设备按钮点击事件
 */
export function deviceClick(json,value,id){
  return function(dispatch){
    http.post('/proxy/jsonCommand',{
      "url":json.commandurl,
      "body":{
        "companyToken":json.commandBody.companyToken,
        "commands":[
          {
            "mac":json.commandBody.commands[0].mac,
            "value":value
          }
        ]
      }
    }).then(
      data=>{
            dispatch(treeSearch(id))
      }
    ).catch(
        err=>{
          console.log(err.msg)
        }
    )
  }
}


//保存在设备信息面板请求到的资产模版内容
export function savePropertyInfo(data) {
  return{
    type:SAVE_PROPERTY_INFO,
    propertyInfo:data
  };
}


//新增设备资产信息
export function addPropertyInfo(data,equip_id,template_id){
  return function(dispatch){
    http.post('/equipment/updateAsset',{
      "equip_id": equip_id,
      "assetData": data,
      "files": [],
      "project_id":0
    }).then(
      data => {
        if(data.status){
          // Modal.success({
          //   title: '提示',
          //   content:'资产信息提交成功',
          //   closable:true,
          //   maskClosable:false,
          //   okText:'确定',
          //   onOk() {}
          // });
          dispatch(getParamInfo(template_id))
          dispatch(setActiveKey("3"))
        }
      }
    )
  }
}
//修改设备资产信息
export function modyPropertyInfo(data,equip_id,template_id){
  return function(dispatch){
    dispatch(saveCurNewEquipId(equip_id,''))
    http.post('/equipment/updateAsset',{
      "equip_id": equip_id,
      "assetData": data,
      "files": [],
      "project_id":0
    }).then(
       data=>{
         if(data.status){
            dispatch(setModyActiveKey('3'))
         }
       }
    )
  }
}


//新增设备主机运行参数信息
export function addParamInfo(data,equip_id,id){
  let paramCodeList = []
  data.map((item,index)=>{
     console.log(Object.keys(item))
  })
  data.map((item,index)=>{
    for (var k in item) {
      console.log(k.substr(k.length-9))
      if (k.substr(k.length-9) === "paramCode") {
        paramCodeList.push(item[k])
      }
    }
  })
  let paramData = []
  paramCodeList.map((item,index)=>{
    let paramObj = {}
    data.map((row,r)=>{
      for (var j in row) {
        if (j.indexOf(item) != -1) {
          let key = j.replace(item,"")
          paramObj[key]= row[j]
        }
      }
    })
    paramData.push(paramObj)
  })
  console.log(paramData)
  return function(dispatch){
    http.post('/equipment/updateEquipParam',{
      "equip_id": equip_id,
      "paramData": paramData
    }).then(
      data => {
        if(data.status){
          dispatch(treeSearch(id))
          // Modal.success({
          //   title: '提示',
          //   content:'运行参数提交成功',
          //   closable:true,
          //   maskClosable:false,
          //   okText:'确定',
          //   onOk() {}
          // });
        }
      }
    )
    dispatch(resetAdd())
    dispatch(reloadTable())
    dispatch(setActiveKey("4"))
    dispatch(setModyActiveKey("4"))
  }
}

export function getParamInfo (template_id) {
  return function(dispatch) {
    http.post('/equipment/getAddInitParam',{
        "project_id":0,
        "template_id":template_id
    }).then(
        data=>{
            dispatch(saveParamInfo(data.data)) 
        }
    )
  }
}

//保存在设备信息面板请求到的主机运行参数内容
export function saveParamInfo(data) {
  return{
    type:SAVE_PARAM_INFO,
    paramInfo:data
  };
}


  

export function clearPropertyData () {
  return{
    type:CLEAR_PROPERTY_INFO,
    propertyInfo:[]
  };
}

export function onListSearch(status,dataString0,dataString1){
  return function(dispatch){
    http.post('/maintain/maintainListSearch',{
    "projectId":0,
    "searchKey":status,
    "pageSize":100,//parseInt(window.localStorage.getItem('pageSize')),
    "targetPage":1,
    "startTime":dataString0,
    "endTime":dataString1
  }).then(
      data => {
        if(data.status){
          dispatch(onSearch(data))
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
    let table = getState().deviceManage.table
    http.post('/equipment/delete',{
      delArray:table.selectedIds,
      curPage:table.current,
      pageSize:table.pageSize,
      projectId:0
    }).then(
      data=>{
        if(data.status){
          dispatch(reloadTable())
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

export function removeList(delArray){
  return function(dispatch,getState){
    let table = getState().deviceManage.table
    http.post('/maintain/removeMaintainList',{
      delArray:delArray
    }).then(
      data=>{
        if(data.status){
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


export function searchRecord(){
  return function(dispatch,getState){
    let table = getState().deviceManage.table
    http.post('/equipment/searchOperation',{
      searchKey:"",
      targetPage:table.current,
      pageSize:table.pageSize,
      projectId:0
    }).then(
      data=>{
        if(data.status){
          dispatch(recordTable(data))
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


export function addFunction(values,time){
  return function(dispatch,getState){
    let table = getState().deviceManage.table
    http.post('/equipment/addEquipOperation',{
      "projectId":0,
      "describe":values.describe,
      "operate_time":time,
      "responsible_name":values.responsible_name
    }).then(
      data=>{
        if(data.status){
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

export function modifyFunction(values,time,id){
  return function(dispatch,getState){
    let table = getState().deviceManage.table
    http.post('/equipment/updateEquipOperation',{
      "id":id,
      "projectId":0,
      "describe":values.describe,
      "operate_time":time,
      "responsible_name":values.responsible_name
    }).then(
      data=>{
        if(data.status){
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

export function removeFunction(ids){
  return function(dispatch,getState){
    let table = getState().deviceManage.table
    http.post('/equipment/delEquipOperation',{
      "ids":ids
    }).then(
      data=>{
        if(data.status){
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

export function examineFunction(id,result,appremark){
  return function(dispatch,getState){
    let table = getState().deviceManage.table
    http.post('/maintain/approve',{
      "maintain_id":id,
      "app_reslut":result,
      "app_remark":appremark
    }).then(
      data=>{
        if(data.status){
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
export function searchInsUser(searchKey){
  return function(dispatch,getState){
    let table = getState().trainManage.table
    http.post('/global/searchUser',{
      searchKey:searchKey,
      projectId:0
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
    type:RENDER_SEARCHER_TABLE,
    tableData:data.data
  }
}

export function distribute(id){
  return function(dispatch,getState){
    http.post('/global/searchUser',{
      maintain_id:id
    }).then(
      data=>{
        if(data.status){
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
export function modifyList(values){
  return function(dispatch,getState){
    let table = getState().deviceManage.table
    http.post('/equipment/modify',{
      id:table.selectedIds[0],
      name: values[0].name,
      type: values[1].type,
      installLocation: values[3].installLocation,
      communicateStatus: values[6].communicateStatus,
      maintenanceStatus: values[5].maintenanceStatus,
      repairStatus: values[8].repairStatus,
      repairResponsiblePerson:'lelei',
      warningStatus:0,
      pageSize : table.pageSize,
      projectId:0,
      online_addr:values[7].online_addr,
      description:values[9].description,
      area_id:values[4].area_id,
      model_id:values[2].model_id,
      system_id:table.systemId
    }).then(
      data=>{
        if(data.status){
          dispatch(setModyActiveKey("2"))
          // dispatch(saveCurNewEquipId(table.selectedIds[0],''))
          // dispatch(reloadTable())
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
      pageSize: condition.pagination.pageSize
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
    // window.localStorage.setItem('pageSize',pagination.pageSize);
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


export function onSearch(data){
  return{
    type:LIST_SEARCH,
    searchData:data
  };
}

//保养得刷新
export function careRender(){
  return function(dispatch){
    dispatch(careLoading(true))
    http.post('/care/equipCareSearch',{
      projectId:0,
      pageSize:100,
      targetPage:1,
      "status":"",
      "startTime":'',
      "endTime":'',
    }).then(
        data=>{
          if(data.status){
            dispatch(careData(data))
            dispatch(careLoading(false))
          }
        }
    ).catch(
        err=>{
          dispatch(careLoading(false))
        }
    )
  }
}

//获取保养查询数据 
export function careData(data){
  return {
    type:CARE_DATA,
    caredata:data
  }
}
//设备管理保养-loading
export function careLoading(data){
  return{
    type:CARE_LOADING,
    careloading:data
  }
}
//打开确保养弹窗
export function click(id,data){
  return function (dispatch) {
    dispatch(careId(id)) 
    dispatch(careShowModel(data))
  }
}
//打开保养提前结束弹窗
export function careAdvance(id,data){
  return function(dispatch){
    dispatch(careId(id))
    dispatch(careAdvanceModel(data))
  }
}
//打开保养审核弹窗
export function careAudit(id,data){
  return function(dispatch){
    dispatch(careId(id))
    dispatch(careAuditModel(data))
  }
}

//打开详情弹窗
export function careDetails(id,data){
  return function(dispatch){
    dispatch(careId(id))
    dispatch(careDetailsModel(data))
  }
}

//获取管理保养-id
export function careId(data){
  return{
    type:CARE_ID,
    careid:data
  }
}

export function careDetailsModel(data){
  return{
    type:CARE_DETAILS,
    detail:data
  }
}

export function careShowModel(data){
  return{
    type:CARE_SHOWMODEL,
    againvisible:data
  }  
}

export function careAdvanceModel(data){
  return{
    type:CARE_ADVANCE,
    advance:data
  }
}

export function careAuditModel(data){
  return{
    type:CARE_AUDIT,
    audit:data
  }
}

export function careSelectIds(data){
  return{
    type:CARE_SELECTEDS,
    careSelectedIds:data
  }
} 
export function saveDeviceName(name){
  return{
      type:SAVE_DEVICE_NAME,
      deviceName:name
  }
}


export function reset() {
  return {
    type: RESET_POINT_TABLE
  };
}

export function recordTable(data){
  return {
    type:DEVICE_RECORD_TABLE,
    recordData:data
  }
}
export function renderDeviceTable(data) {
  return {
    type: RENDER_TABLE,
    data: data
  };
}
export function setActiveKey(data){
  return{
    type:SET_ACTIVEKEY,
    ActiveKey:data
  }
}
export function setModyActiveKey(data){
  return{
    type:SET_MODIACTIVEKEY,
    ModyActiveKey:data
  }
}
//设置是否显示弹窗
export function setWarning(data){
  return {
    type:SET_WARNING,
    waringVisible:data
  }
}

export const actions = {
  reloadTable,
  onPaginationChange,
  onSelectChange,
  reset,
  onListSearch
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RENDER_TABLE]: (state, action) => {
    return Object.assign({}, state, { 
      data: action.data.data!=null?action.data.data.map( row => {
        row['communicateStatus'] == 1 ? row['communicateStatus'] = '运行中' : row['communicateStatus'] = '已断开'; //设备通信状态
        row['warningStatus'] == 0 ? row['warningStatus'] = '正在报警' : row['warningStatus'] = "无报警"; //告警状态
  
        switch(row['maintenanceStatus']){//设备保养状态 
          case 0:
            row['maintenanceStatus'] = "未处理";
            break;
          case 1:
            row['maintenanceStatus'] = "处理中";
            break;
          case 2:
            row['maintenanceStatus'] = "已处理";
            break;
          case 3:
            row['maintenanceStatus'] = "无需保养";
            break;
        }
        switch(row['repairStatus']){//设备维修状态 
          case 0:
            row['repairStatus'] = "未处理";
            break;
          case 1:
            row['repairStatus'] = "处理中";
            break;
          case 2:
            row['repairStatus'] = "已处理";
            break;
          case 3:
            row['repairStatus'] = "无需维修";
            break;
        }
        switch(row['type']){//设备类型 
          case "1":
            row['type'] = "净化器";
            break;
          case "2":
            row['type'] = "水泵";
            break;
          case "3":
            row['type'] = "冷却塔";
            break;
          case "4":
            row['type'] = "换热器";
            break;
          case "5":
            row['type'] = "储水罐";
            break;
          case "6":
            row['type'] = "阀门";
            break;
          case "7":
            row['type'] = "盘管";
            break;
          case "8":
            row['type'] = "换热器";
            break;
          case "9":
            row['type'] = "冷机";
            break; 
          case "0":
            row['type'] = "其他";
            break;
        }
        return row
      }):[], 
      total: action.data.total!==-1?action.data.total:0
    });
  },
  [SAVE_ID]:(state,action)=>{
    return Object.assign({},state,{
      systemId:action.systemId
    })
  },
  [SET_RESET]:(state,action)=>{
    return Object.assign({},state,{
      propertyInfo:action.propertyInfo,
      paramInfo:action.paramInfo
    })
  },
  [SAVE_DEVICE_NAME]:(state,action)=>{
    return Object.assign({},state,{
      deviceName:action.deviceName
    })
  },
  [SET_MODIACTIVEKEY]:(state,action)=>{
    return Object.assign({},state,{
      ModyActiveKey:action.ModyActiveKey
    })
  },
  [SET_ACTIVEKEY]:(state,action)=>{
    return Object.assign({},state,{
      ActiveKey:action.ActiveKey
    })
  },
  [UPDATE_CONDITION]: (state, action) => {
    return Object.assign({}, state, action.condition);
  },
  [THREE_DATA]:(state,action)=>{
    return Object.assign({},state,{
      treedata:action.treedata.data
    })
  },
  [ASSET_DATA]:(state,action)=>{
    return Object.assign({},state,{
      assetData:action.assetData.data
    })
  },
  [RESET_POINT_TABLE]: (state, action) => {
    return initialState;
  },
  [CARE_SHOWMODEL]:(state,action)=>{
    return Object.assign({},state,{
      againvisible:action.againvisible
    })
  },
  [CARE_DETAILS]:(state,action)=>{
    return Object.assign({},state,{
      detail:action.detail
    })
  },
  [CARE_ADVANCE]:(state,action)=>{
    return Object.assign({},state,{
      advance:action.advance
    })
  },
  [CARE_AUDIT]:(state,action)=>{
    return Object.assign({},state,{
      audit:action.audit
    })
  },
  [CARE_SELECTEDS]:(state,action)=>{
    return Object.assign({},state,{
      careSelectedIds:action.careSelectedIds
    })
  },
  [CARE_ID]:(state,action) => {
    return Object.assign({},state,{
      careid:action.careid
    })
  },
  [CARE_DATA]:(state,action)=>{
    return Object.assign({},state,{
      caredata:action.caredata.data.map(function (row, i) {
        row['no'] = row['id'];
    switch(row['status']){
        case "0":
            row['status'] = "新建";
        case "1":
            row['status'] = "处理中";
            break;
        case "2":
            row['status'] = "处理中";
            break;
        case "3":
            row['status'] = "已完成";    
            break;  
        case "4":
            row['status'] = "审核不通过";        
            break;      
        default:
            break;
          }
          return row;
        }),
     })
  },
  [CARE_LOADING]:(state,action)=>{
    return Object.assign({},state,{
      careloading:action.careloading
    })
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
  [LIST_SEARCH] : (state,action,getState) =>{
    return Object.assign({},state,{searchData:action.searchData.data.map(
      (row,i)=>{
        row['no']=i+1;
        switch(row['status']){
          case "0":row['status']="未处理";break;
          case "1":row['status']="处理中";break;
          case "2":row['status']="待审核";break;
          case "3":row['status']="审核不通过";break;
          case "4":row['status']="审核通过";break;
        }
        return row;
      }
    )
    })
  },
  [DEVICE_RECORD_TABLE]:(state,action,getState)=>{
    return Object.assign({},state,{recordData:action.recordData.data.map(
      (row,i)=>{
        row['no']=i+1;
        return row;
      }
    )
    })
  },
  [SET_WARNING]:(state,action)=>{
    return Object.assign({},state,{
      waringVisible:action.waringVisible
    })
  },
  [SAVE_DEVICEDATA]:(state,action)=>{
    return Object.assign({},state,{
      deviceData:action.deviceData
    })
  },
  [RENDER_HIDE]:(state,action)=>{
    return Object.assign({},state,{hideData:action.hideData})
  },
  [RENDER_SHOW]:(state,action)=>{
    return Object.assign({},state,{hideData:action.hideData})
  },
  [RENDER_ADD_HIDE]:(state,action)=>{
    return Object.assign({},state,{hideAddData:action.hideAddData})
  },
  [RENDER_ADD_SHOW]:(state,action)=>{
    return Object.assign({},state,{hideAddData:action.hideAddData})
  },
  [RENDER_HIDE_MODIFY]:(state,action)=>{
    return Object.assign({},state,{showData:action.hideData})
  },
  [RENDER_SHOW_MODIFY]:(state,action)=>{
    return Object.assign({},state,{showData:action.showData})
  },
  [RENDER_HIDE_EXAMINE]:(state,action)=>{
    return Object.assign({},state,{examineData:action.examineData})
  },
  [RENDER_SHOW_EXAMINE]:(state,action)=>{
    return Object.assign({},state,{examineData:action.examineData,maintenId:action.maintenId})
  },
  [RENDER_HIDE_AGAIN]:(state,action)=>{
    return Object.assign({},state,{againData:action.examineData})
  },
  [RENDER_SHOW_AGAIN]:(state,action)=>{
    return Object.assign({},state,{againData:action.examineData,maintenId:action.maintenId})
  },
  [RENDER_SEARCHER_TABLE]:(state,action)=>{
    return Object.assign({},state,{tableData:action.tableData})
  },
  [RENDER_HIDE_DETAILS]:(state,action)=>{
    return Object.assign({},state,{detailsData:action.Data})
  },
  [RENDER_SHOW_DETAILS]:(state,action)=>{
    return Object.assign({},state,{detailsData:action.Data,maintenId:action.maintenId})
  },
  [SAVE_PROPERTY_INFO]: (state,action)=>{
    return Object.assign({}, state, { propertyInfo: action.propertyInfo });
  },
  [CLEAR_PROPERTY_INFO]: (state,action)=>{
    return Object.assign({}, state, { propertyInfo: action.propertyInfo });
  },
  [SAVE_PARAM_INFO]: (state,action)=>{
    return Object.assign({}, state, { paramInfo: action.paramInfo });
  },
  [SAVE_CUR_NEW_EQUIP_ID]: (state,action)=>{
    return Object.assign({}, state, { curEquipId: action.equipId ,templateId: action.templateId});
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  data: [],
  total: 0,
  current: 1,
  pageSize: 100,
  selectedIds: [],
  loading : false,
  searchKey:'',
  searchData:[],
  recordData:[],
  hideData:false,
  showData:false,
  hideAddData:false,
  examineData:false,
  propertyInfo:[],
  paramInfo:[],
  caredata:[],
  careloading:false,
  againvisible:false,
  careid:'',
  maintenId:0,
  againData:false,
  tableData:[],
  detailsData:false,
  careSelectedIds:[],
  advance:false,
  audit:false,
  detail:false,
  treedata:[],
  assetData:[],
  systemId:'',
  curEquipId:'',
  templateId:'',
  deviceName:'',
  ActiveKey:'1',
  ModyActiveKey:'1',
  waringVisible:false,    //提交显示的弹窗
  deviceData:''    //保存设备信息
};
export default function TableReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
