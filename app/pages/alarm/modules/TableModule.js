
/**
 * Constants
 */
export const Table_LOAD_ALL_CONFIG = 'Table_LOAD_ALL_CONFIG'
export const Table_CURRENT_ROW_INFO = 'Table_CURRENT_ROW_INFO'
export const Table_LOADING = 'Table_LOADING'
export const Table_POINT_TABLE_SELECT_CHANGE = "POINT_TABLE_SELECT_CHANGE"

import http from '../../../common/http'
/**
 * Action Creator
 */
//表格数据
export function tableData(data){ 
    return {
        type : Table_LOAD_ALL_CONFIG,
        data
    }
}

export function loadingTable(loading){
    return {
        type : Table_LOADING,
        loading : loading
    }
}


export function toggleIsChose(idx){
    return function(dispatch,getState){
        let currentTableData = getState().alarmManage.table.data
        let nextTableData = currentTableData.map( (item,index)=>{
            if(index === idx){
                item.isChose = true
                return item
            }  
            item.isChose = false
            return item
        })
        dispatch(tableData(nextTableData))
    }
}

export function searchTableData(value){
    return function(dispatch,getState){
        dispatch(loadingTable(true))
        http.post('/warningConfig/getAll',{}).then(
            data=>{
                let newData = data.filter( item=>{
                    item['isChose'] = false
                    return new RegExp(value,"i").test(item.pointname) ||  new RegExp(value,"i").test(item.boolWarningInfo) 
                })
                dispatch(loadingTable(false))
                dispatch(tableData(newData))
            }
        )
    }
}


export function onSelectChange(selectedRowIds) {
    return {
        type: Table_POINT_TABLE_SELECT_CHANGE,
        selectedIds: selectedRowIds
    };
}


//表格当前选中行
export function currentRowInfo(record){
    return function(dispatch,getState){
        dispatch({
            type : Table_CURRENT_ROW_INFO,
            record
        })
    }
}


const ACTION_HANDLERS = {
    [Table_LOAD_ALL_CONFIG] : (state,action)=>{
        return Object.assign({},state,{data:action.data.map(item=>{
            if(!item.mold){
                item.mold = '规则报警';
            }
            return item;
        })})
    },
    [Table_CURRENT_ROW_INFO] : (state,action)=>{
        return Object.assign({},state,{record:action.record})
    },
    [Table_LOADING] : (state,action)=>{
        return Object.assign({},state,{loading:action.loading})
    },
    [Table_POINT_TABLE_SELECT_CHANGE] : (state,action) => {
        return {...state,selectedIds : action.selectedIds}
    }
}

const initialState ={
    data : [],
    record : {},
    selectedIds : []
}

const tableReducer = function(state=initialState,action){
    const handler = ACTION_HANDLERS[action.type]
    return handler ?  handler(state,action) : state
}

export default tableReducer