import { connect } from 'react-redux';
import PointView  from '../components/PointModalView'

const mapStateToProps = (state) => {
    if (state.alarmManage.alarmModal.modal === undefined) {
        state.alarmManage.alarmModal.modal = {
            type : undefined,
            props : {}
        }
    }
    return {
        modal : state.alarmManage.alarmModal.modal,
        pointData : state.alarmManage.pointTable.pointData,
        loading:state.alarmManage.pointTable.loading,
        selectedIds : state.alarmManage.pointTable.selectedIds,
        rowKey : 'name',
        pagination : {
            current : state.alarmManage.pointTable.current,
            total : state.alarmManage.pointTable.total,
            pageSize : state.alarmManage.pointTable.pageSize,       
            showSizeChanger: true,
            pageSizeOptions: ['50', '100', '200']
        }
    }
}

import {
    initialize,
    onPaginationChange,
    searchPointData,
    onSelectChange
} from '../modules/PointModalModule.js'

import {
    toggleHighLowModal
} from '../modules/AlarmManageModule.js'

const mapActionCreator = {
    initialize,
    onPaginationChange,
    toggleHighLowModal,
    searchPointData,
    onSelectChange
}

export default connect(mapStateToProps,mapActionCreator)(PointView)
