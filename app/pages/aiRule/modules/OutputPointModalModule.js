import {message} from 'antd'
import http from '../../../common/http'

/**
 * Constants
 */
export const OUTPUT_Point_TABLE_DATA = 'OUTPUT_Point_TABLE_DATA'
export const OUTPUT_Point_UPDATE_TABLE_DATA = 'OUTPUT_Point_UPDATE_TABLE_DATA'
export const OUTPUT_Point_LOADING = 'OUTPUT_Point_LOADING'
export const OUTPUT_Point_SEARCH_VALUE = 'OUTPUT_Point_SEARCH_VALUE'
export const OUTPUT_Point_POINT_TABLE_SELECT_CHANGE = "OUTPUT_Point_POINT_TABLE_SELECT_CHANGE"
/**
 * Actions
 */

//初始化
export function initializeOutput(){
    return function(dispatch,getState){
        const current = getState().aiRule.outputPointTable.current
        const pageSize = getState().aiRule.outputPointTable.pageSize
        const searchValue = getState().aiRule.outputPointTable.searchValue
        dispatch(tableLoading(true))
        http.post('/point/findByKeyword',{
            "keyword": searchValue
        }).then(
            result=>{
                if(result||result[value]){
                    let pointList = Object.keys(result).map(row => {
                        return {
                            name: row,
                            addr: result[row].addr,
                            sourceType: result[row].sourceType,
                            description: result[row].description
                        }
                    })
                    let data ={
                        pointList:pointList,
                        total: pointList.length
                    }
                    
                    dispatch(tableLoading(false))
                    dispatch(savePointTableData(data))
                    dispatch(onSelectChangeOutput([]))
                    
                }else{
                    dispatch(tableLoading(false))
                    dispatch(savePointTableData({pointList:[],total:0}))
                }
            }
        )
    }
}

export function searchPointData(value){
    return function(dispatch,getState){
        const current = getState().aiRule.outputPointTable.current
        const pageSize = getState().aiRule.outputPointTable.pageSize
        // if(value){
            dispatch({
                type : OUTPUT_Point_SEARCH_VALUE,
                value
            })
            dispatch(tableLoading(true))
            http.post('/point/findByKeyword',{
                "keyword": value
            }).then(
                result=>{
                    if(result||result[value]){
                        let pointList = Object.keys(result).map(row => {
                            return {
                                name: row,
                                addr: result[row].addr,
                                sourceType: result[row].sourceType,
                                description: result[row].description
                            }
                        })
                        let data ={
                            pointList:pointList,
                            total: pointList.length
                        }
                        
                        dispatch(tableLoading(false))
                        dispatch(savePointTableData(data))
                        
                        
                    }else{
                        dispatch(tableLoading(false))
                        dispatch(savePointTableData({pointList:[],total:0}))
                        //console.log(result)
                    }
                }
            )
        // }
    }
}


export function onSelectChangeOutput(selectedRowIds) {
    return {
        type: OUTPUT_Point_POINT_TABLE_SELECT_CHANGE,
        selectedIds: selectedRowIds
    };
}


//保存点位数据
export function savePointTableData(data){
    return {
        type : OUTPUT_Point_TABLE_DATA,
        pointDataOutput : data.pointList,
        total : data.total
    }
}

//loading
export function tableLoading(loading){
    return {
        type : OUTPUT_Point_LOADING,
        loading : loading
    }
}

//分页器修改函数
export function onPaginationChange(pagination){
    return function(dispatch){
        console.info( pagination )
        dispatch(upDatePointTable(pagination))
        dispatch(initializeOutput()) //用户切换页数后重新发起请求
    }
}

export function upDatePointTable(pagination){
    return {
        type:OUTPUT_Point_UPDATE_TABLE_DATA,
        condition : {
            current : pagination.current,
            pageSize : pagination.pageSize
        }
    }
}


/**
 * Action Handles
 */

const ACTION_HANDLES = {
    [OUTPUT_Point_TABLE_DATA] : (state,action) => {
        return Object.assign({},{...state,pointDataOutput:action.pointDataOutput,total: action.total})
    },
    [OUTPUT_Point_UPDATE_TABLE_DATA] : (state,action)=>{
        return Object.assign({},state,action.condition)
    },
    [OUTPUT_Point_LOADING] : (state,action) => {
        return Object.assign({},state,{loading:action.loading})
    },
    [OUTPUT_Point_SEARCH_VALUE] : (state,action) => {
        return Object.assign({},state,{searchValueOutput:action.value})
    },
    [OUTPUT_Point_POINT_TABLE_SELECT_CHANGE] : (state,action) => {
        return {...state,selectedIdsOutput:action.selectedIds}
    }
}

const initialState = {
    pointDataOutput : [],
    current : 1,
    pageSize : 50,
    total : 0,
    loading : false,
    searchValueOutput:'',
    selectedIdsOutput:[]
}

const pointTableReducer = function(state=initialState,action){
    const handler = ACTION_HANDLES[action.type]
    return handler ? handler(state,action) : state
}

export default pointTableReducer
