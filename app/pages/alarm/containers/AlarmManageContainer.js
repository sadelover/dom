import {connect} from 'react-redux';
import AlarmManageModalView from  '../components/AlarmManagerModalView'


const mapStateToProps = ( state ) => {
    const {selectedIds,pointData} = state.alarmManage.pointTable
    return {
        boolModalVisible : state.alarmManage.alarmModal.boolModalVisible,
        highLowVisible : state.alarmManage.alarmModal.highLowVisible,
        ruleModalVisible:state.alarmManage.alarmModal.ruleModalVisible,
        mode:state.alarmManage.alarmModal.mode,
        editVisible : state.alarmManage.alarmModal.editVisible,
        highLowEditVisible:state.alarmManage.alarmModal.highLowEditVisible,
        table : state.alarmManage.table,
        selectedIds :selectedIds,
        pointData : pointData
    }
}

import {
    renderList,
    toggleBoolModal,
    toggleHighLowModal,
    toggleRuleModal,
    removeWarningConfig,
    toggleEditModal,
    HighLowEditModal,
    showPointModal,
    hidePointModal,
    addRuleWarning,
    editRuleWarning
} from '../modules/AlarmManageModule.js'

import {
    searchTableData
} from '../modules/TableModule.js'

import {
    onSelectChange
} from '../modules/PointModalModule'
const mapActionCreator = {
    renderList,
    toggleBoolModal,
    toggleHighLowModal,
    toggleRuleModal,
    removeWarningConfig,
    toggleEditModal,
    searchTableData,
    HighLowEditModal,
    onSelectChange,
    showPointModal,
    hidePointModal,
    addRuleWarning,
    editRuleWarning
}

export default connect(mapStateToProps,mapActionCreator)(AlarmManageModalView)