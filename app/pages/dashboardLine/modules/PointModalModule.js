import {message} from 'antd'
import http from '../../../common/http'

/**
 * Constants
 */
export const Line_Point_TABLE_DATA = 'Line_Point_TABLE_DATA'
export const Line_Point_UPDATE_TABLE_DATA = 'Line_Point_UPDATE_TABLE_DATA'
export const Line_Point_SELECTED_POINT = 'Line_Point_SELECTED_POINT'
export const Line_Point_LOADING = 'Line_Point_LOADING'
export const Line_Point_SEARCH_VALUE = 'Line_Point_SEARCH_VALUE'
/**
 * Actions
 */

//初始化
export function initialize(){
    return function(dispatch,getState){
        const current = getState().alarmManage.pointTable.current
        const pageSize = getState().alarmManage.pointTable.pageSize
        const searchValue = getState().alarmManage.pointTable.searchValue
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
        const current = getState().alarmManage.pointTable.current
        const pageSize = getState().alarmManage.pointTable.pageSize
        // if(value){
            dispatch({
                type : Line_Point_SEARCH_VALUE,
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

//保存点位数据
export function savePointTableData(data){
    return {
        type : Line_Point_TABLE_DATA,
        pointData : data.pointList,
        total : data.total
    }
}

//loading
export function tableLoading(loading){
    return {
        type : Line_Point_LOADING,
        loading : loading
    }
}

//分页器修改函数
export function onPaginationChange(pagination){
    return function(dispatch){
        console.info( pagination )
        dispatch(upDatePointTable(pagination))
        dispatch(initialize()) //用户切换页数后重新发起请求
    }
}

export function upDatePointTable(pagination){
    return {
        type:Line_Point_UPDATE_TABLE_DATA,
        condition : {
            current : pagination.current,
            pageSize : pagination.pageSize
        }
    }
}

//用户点击确认后保存数据到全局state
export function saveSelectedPoint(selectedData){
    return {
        type : Line_Point_SELECTED_POINT,
        selectedData : selectedData
    }
}

/**
 * Action Handles
 */

const ACTION_HANDLES = {
    [Line_Point_TABLE_DATA] : (state,action) => {
        return Object.assign({},{...state,pointData:action.pointData,total: action.total})
    },
    [Line_Point_UPDATE_TABLE_DATA] : (state,action)=>{
        return Object.assign({},state,action.condition)
    },
    [Line_Point_SELECTED_POINT] : (state,action) => {
        //return Object.assign({},{...state,selectedData:action.selectedData})
        return {...state, selectedData: action.selectedData}
        // const points = action.point.map(
        //     row => {
        //         return {
        //         name: row.name,
              
        //         }
        //     }
        // );
        //return { ...state, selectedData : action.selectedData.concat(state.selectedData) }
    },
    [Line_Point_LOADING] : (state,action) => {
        return Object.assign({},state,{loading:action.loading})
    },
    [Line_Point_SEARCH_VALUE] : (state,action) => {
        return Object.assign({},state,{searchValue:action.value})
    }
}

const initialState = {
    pointData : [],
    current : 1,
    pageSize : 50,
    total : 0,
    selectedData : [],
    loading : false,
    searchValue:''
}

const pointTableReducer = function(state=initialState,action){
    const handler = ACTION_HANDLES[action.type]
    return handler ? handler(state,action) : state
}

export default pointTableReducer
