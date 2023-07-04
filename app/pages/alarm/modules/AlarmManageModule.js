import { combineReducers } from 'redux'
import http from '../../../common/http'
import { tableData, loadingTable, onSelectChange } from './TableModule'
import table from './TableModule'
import pointTable from './PointModalModule'

import { message, Modal } from 'antd'

const TOGGLE_ALARM_MODAL = 'TOGGLE_ALARM_MODAL'
const TOGGLE_BOOL_MODAL = 'TOGGLE_BOOL_MODAL'
const TOGGLE_HIGH_LOW_MODAL = 'TOGGLE_HIGH_LOW_MODAL'
const TOGGLE_EDIT_MODAL = 'TOGGLE_EDIT_MODAL'
const SHOW_POINT_MODAL = 'SHOW_POINT_MODAL'
const HIDE_POINT_MODAL = 'HIDE_POINT_MODAL'
const HIGT_LOW_MODAL = 'HIGT_LOW_MODAL'
const TOGGLE_RULE_MODAL = 'TOGGLE_RULE_MODAL'

export function renderList() {
    return function (dispatch) {
        dispatch(loadingTable(true))
        http.post('/warningConfig/getAll', {}).then(
            data => {
                if (data) {
                    let newData = data.map(item => {
                        item['isChose'] = false
                        return item
                    })
                    dispatch(tableData(newData))
                    dispatch(loadingTable(false))
                }
            }
        )
    }
}

export function toggleAlarmModal() {
    return function (dispatch, getState) {
        let visible = getState().alarmManage.alarmModal.visible
        //visible记录的是模态框上一次的状态
        if (visible) {
            dispatch(onSelectChange([]))//清空记录数据
        }
        dispatch({
            type: TOGGLE_ALARM_MODAL,
            visible: !visible
        })
    }
}

//布尔报警模态框显示和隐藏
export function toggleBoolModal() {
    return function (dispatch, getState) {
        let visible = getState().alarmManage.alarmModal.boolModalVisible
        dispatch({
            type: TOGGLE_BOOL_MODAL,
            visible: !visible
        })
    }
}

//高低限模态框显示和隐藏
export function toggleHighLowModal() {
    return function (dispatch, getState) {
        let visible = getState().alarmManage.alarmModal.highLowVisible
        dispatch({
            type: TOGGLE_HIGH_LOW_MODAL,
            highLowVisible: !visible
        })
    }
}

//规则报警模态框显示和隐藏
export function toggleRuleModal(mode) {
    return function (dispatch, getState) {
        let visible = getState().alarmManage.alarmModal.ruleModalVisible
        dispatch({
            type: TOGGLE_RULE_MODAL,
            ruleModalVisible: !visible,
            mode: mode
        })
    }
}

//编辑模态框显示和隐藏
export function toggleEditModal() {
    return function (dispatch, getState) {
        let visible = getState().alarmManage.alarmModal.editVisible

        let table = getState().alarmManage.table;
        let selectedId = table.selectedIds[0]

        if (!selectedId) return (
            Modal.error({
                title: '错误提示',
                content: "请选中一个点进行编辑!"
              })
        )

        let record = table.data.filter(item => {
            if (item.pointname === selectedId) return item
        })[0]

        dispatch({
            type: TOGGLE_EDIT_MODAL,
            editVisible: !visible
        })
    }
}
//高低报警框编辑
export function HighLowEditModal() {
    return function (dispatch, getState) {
        let visible = getState().alarmManage.alarmModal.highLowEditVisible
        dispatch({
            type: HIGT_LOW_MODAL,
            highLowEditVisible: !visible
        })
    }
}

//点位选择模态框的显示
export function showPointModal(type, props) {
    return {
        type: SHOW_POINT_MODAL,
        modal: {
            type,
            props
        }
    }
}

export function hidePointModal() {
    return {
        type: HIDE_POINT_MODAL
    }
}

//删除报警按钮
export function removeWarningConfig() {
    return function (dispatch, getState) {
        let table = getState().alarmManage.table;
        let selectedId = table.selectedIds[0]
        if (!selectedId) return Modal.info({
            title: "请选择一个点进行删除"
        })

        let record = table.data.filter(item => {
            if (item.id === selectedId) return item
        })[0]
        console.info(record)
        if (record.type === 3) {
            if (record.pointname) {//通过属性判断对象是否存在
                Modal.confirm({
                    title: '提示',
                    content: '确定要删除吗？',
                    onOk() {
                        http.post('/warningConfig/remove', {
                            id: record.id
                        }).then(
                            data => {
                                if (!data.err) {
                                    dispatch(renderList())
                                    dispatch(onSelectChange([]))
                                    if (localStorage[record.boolWarningInfo]) {
                                        window.setTimeout(function () {
                                            window.localStorage.removeItem(record.boolWarningInfo)
                                        }, 20000)
                                    }
                                }
                            }
                        )
                    }
                })
            }
        } else {
            if (record.pointname) {//通过属性判断对象是否存在
                Modal.confirm({
                    title: '提示',
                    content: '确定要删除吗？',
                    onOk() {
                        http.post('/warningConfig/remove', {
                            pointname: record.pointname,
                            type: record.type
                        }).then(
                            data => {
                                if (!data.err) {
                                    dispatch(renderList())
                                    dispatch(onSelectChange([]))
                                    if (localStorage[record.boolWarningInfo]) {
                                        window.setTimeout(function () {
                                            window.localStorage.removeItem(record.boolWarningInfo)
                                        }, 20000)
                                    }
                                }
                            }
                        )
                    }
                })
            }
        }
    }
}

//新建布尔报警
export function addBoolWarning(userInputfields) {
    return function (dispatch) {
        http.post('/warningConfig/add', {
            "pointname": userInputfields.pointname,
            "boolWarningLevel": userInputfields.boolWarningLevel,
            "warningGroup": userInputfields.warningGroup,
            "boolWarningInfo": userInputfields.boolWarningInfo,
            "type": 1,
            "hhenable": 0,
            "henable": 0,
            "llenable": 0,
            "lenable": 0,
            "hhlimit": "0",
            "hlimit": "0",
            "llimit": "0",
            "lllimit": "0",
            "hhinfo": "布尔报警",
            "hinfo": "布尔报警",
            "llinfo": "布尔报警",
            "linfo": "布尔报警",
            "ofPosition": userInputfields.ofPosition ? userInputfields.ofPosition : '',
            "ofDepartment": userInputfields.ofDepartment ? userInputfields.ofDepartment : '',
            "ofGroup": userInputfields.ofGroup ? userInputfields.ofGroup : '',
            "ofSystem": userInputfields.ofSystem ? userInputfields.ofSystem : '',
            "tag": userInputfields.tag ? userInputfields.tag : ''
        }).then(
            data => {
                if (!data.err) {
                    dispatch(renderList())
                    dispatch(onSelectChange([]))
                }
            }
        )
    }
}



//新建规则报警
export function addRuleWarning(userInputfields) {
    return function (dispatch) {
        http.post('/warningConfig/addRule', {
            "pointname": userInputfields.pointname,
            "boolWarningLevel": Number(userInputfields.boolWarningLevel),
            "warningGroup": userInputfields.warningGroup,
            "boolWarningInfo": userInputfields.boolWarningInfo,
            "type": 3,
            "script": userInputfields.script,
            "ofPosition": userInputfields.ofPosition,
            "ofDepartment": userInputfields.ofDepartment,
            "ofGroup": userInputfields.ofGroup,
            "ofSystem": userInputfields.ofSystem,
            "tag": userInputfields.tag
        }).then(
            data => {
                if (data.err === 0) {
                    dispatch(renderList())
                    dispatch(onSelectChange([]))
                } else {
                    Modal.error({
                        title: '错误提示',
                        content: data.msg
                    })
                }
            }
        )
    }
}


//修改规则报警
export function editRuleWarning(userInputfields, id) {
    return function (dispatch) {
        http.post('/warningConfig/edit', {
            "pointname": userInputfields.pointname,
            "boolWarningLevel": Number(userInputfields.boolWarningLevel),
            "warningGroup": userInputfields.warningGroup,
            "boolWarningInfo": userInputfields.boolWarningInfo,
            "type": 3,
            "script": userInputfields.script,
            "ofPosition": userInputfields.ofPosition,
            "ofDepartment": userInputfields.ofDepartment,
            "ofGroup": userInputfields.ofGroup,
            "ofSystem": userInputfields.ofSystem,
            "tag": userInputfields.tag,
            "id": id
        }).then(
            data => {
                if (data.err === 0) {
                    dispatch(renderList())
                    dispatch(onSelectChange([]))
                } else {
                    Modal.error({
                        title: '错误提示',
                        content: data.data
                    })
                }
            }
        )
    }
}

//新建高低限报警
export function addHighLowWarning(userInputfields) {
    return function (dispatch) {
        http.post('/warningConfig/add', {
            "pointname": userInputfields[0],
            "boolWarningLevel": 2,
            "warningGroup": userInputfields[1],
            "boolWarningInfo": "详情见报警编辑",
            "type": 0,
            "hhenable": userInputfields[2] ? 1 : 0,
            "henable": userInputfields[3] ? 1 : 0,
            "llenable": userInputfields[4] ? 1 : 0,
            "lenable": userInputfields[5] ? 1 : 0,
            "hhlimit": userInputfields[6] !== '' ? userInputfields[6] : ' ',
            "hlimit": userInputfields[7] !== '' ? userInputfields[7] : ' ',
            "llimit": userInputfields[8] !== '' ? userInputfields[8] : ' ',
            "lllimit": userInputfields[9] !== '' ? userInputfields[9] : ' ',
            "hhinfo": userInputfields[10] !== '' ? userInputfields[10] : ' ',
            "hinfo": userInputfields[11] !== '' ? userInputfields[11] : ' ',
            "llinfo": userInputfields[12] !== '' ? userInputfields[12] : ' ',
            "linfo": userInputfields[13] !== '' ? userInputfields[13] : ' ',
            "ofPosition": userInputfields[14] ? userInputfields[14] : '',
            "ofDepartment": userInputfields[15] ? userInputfields[15] : '',
            "ofGroup": userInputfields[16] ? userInputfields[16] : '',
            "ofSystem": userInputfields[17] ? userInputfields[17] : '',
            "tag": userInputfields[18] ? userInputfields[18] : ''
        }).then(
            data => {
                if (!data.err) {
                    dispatch(renderList())
                    dispatch(onSelectChange([]))
                }
            }
        )
    }
}

//编辑布尔报警
export function editWarning(userInputfields) {
    return function (dispatch, getState) {
        http.post('/warningConfig/edit', {
            "pointname": userInputfields.pointname,
            "boolWarningLevel": userInputfields.boolWarningLevel,
            "warningGroup": userInputfields.warningGroup,
            "boolWarningInfo": userInputfields.boolWarningInfo,
            "type": 1,
            "hhenable": 0,
            "henable": 0,
            "llenable": 0,
            "lenable": 0,
            "hhlimit": "0",
            "hlimit": "0",
            "llimit": "0",
            "lllimit": "0",
            "hhinfo": "布尔报警",
            "hinfo": "布尔报警",
            "llinfo": "布尔报警",
            "linfo": "布尔报警",
            "ofPosition": userInputfields.ofPosition,
            "ofDepartment": userInputfields.ofDepartment,
            "ofGroup": userInputfields.ofGroup,
            "ofSystem": userInputfields.ofSystem,
            "tag": userInputfields.tag
        }).then(
            data => {
                if (!data.err) {
                    dispatch(renderList())
                    dispatch(onSelectChange([]))
                }
            }
        )
    }
}
//编辑高低线报警
export function editHithLowWaring(userInputfields) {
    return function (dispatch, getState) {
        http.post('/warningConfig/edit', {
            "pointname": userInputfields[0],
            "boolWarningLevel": 2,
            "warningGroup": userInputfields[1],
            "boolWarningInfo": "详情见报警编辑",
            "type": 0,
            "hhenable": userInputfields[2] == true ? 1 : 0,
            "henable": userInputfields[3] == true ? 1 : 0,
            "llenable": userInputfields[4] == true ? 1 : 0,
            "lenable": userInputfields[5] == true ? 1 : 0,
            "hhlimit": userInputfields[6] !== '' ? userInputfields[6] : ' ',
            "hlimit": userInputfields[7] !== '' ? userInputfields[7] : ' ',
            "llimit": userInputfields[8] !== '' ? userInputfields[8] : ' ',
            "lllimit": userInputfields[9] !== '' ? userInputfields[9] : ' ',
            "hhinfo": userInputfields[10] !== '' ? userInputfields[10] : ' ',
            "hinfo": userInputfields[11] !== '' ? userInputfields[11] : ' ',
            "llinfo": userInputfields[12] !== '' ? userInputfields[12] : ' ',
            "linfo": userInputfields[13] !== '' ? userInputfields[13] : ' ',
            "ofPosition": userInputfields[14] ? userInputfields[14] : '',
            "ofDepartment": userInputfields[15] ? userInputfields[15] : '',
            "ofGroup": userInputfields[16] ? userInputfields[16] : '',
            "ofSystem": userInputfields[17] ? userInputfields[17] : '',
            "tag": userInputfields[18] ? userInputfields[18] : ''
        }).then(
            data => {
                if (!data.err) {
                    dispatch(renderList())
                    dispatch(onSelectChange([]))
                }
            }
        )
    }
}
/**
 * Action Handlers 
 */
const ACTION_HANDLERS = {
    [TOGGLE_ALARM_MODAL]: (state, action) => {
        return Object.assign({}, state, { visible: action.visible })
    },
    [TOGGLE_BOOL_MODAL]: (state, action) => {
        return Object.assign({}, state, { boolModalVisible: action.visible })
    },
    [TOGGLE_HIGH_LOW_MODAL]: (state, action) => {
        return Object.assign({}, state, { highLowVisible: action.highLowVisible })
    },
    [TOGGLE_RULE_MODAL]: (state, action) => {
        return Object.assign({}, state, { ruleModalVisible: action.ruleModalVisible, mode: action.mode })
    },
    [TOGGLE_EDIT_MODAL]: (state, action) => {
        return Object.assign({}, state, { editVisible: action.editVisible })
    },
    [SHOW_POINT_MODAL]: (state, action) => {
        return { ...state, modal: action.modal }
    },
    [HIDE_POINT_MODAL]: (state) => {
        return { ...state, modal: initialState.modal }
    },
    [HIGT_LOW_MODAL]: (state, action) => {
        return Object.assign({}, state, {
            highLowEditVisible: action.highLowEditVisible
        })
    }
}

const initialState = {
    visible: false,
    boolModalVisible: false,
    highLowVisible: false,
    ruleModalVisible: false,
    mode: 'add',
    editVisible: false,
    highLowEditVisible: false,
    modal: {
        type: undefined,
        props: {}
    }
}

function alarmModal(state = initialState, action) {

    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(state, action) : state
}

export default combineReducers({
    alarmModal,
    table,
    pointTable
})