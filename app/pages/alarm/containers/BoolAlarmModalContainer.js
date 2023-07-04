import {connect} from 'react-redux'
import BoolAlarmView from '../components/BoolAlarmModalView'

const mapStateToProps = (state) => {
    const {selectedIds,pointData} = state.alarmManage.pointTable

    return {
        selectedIds :selectedIds,
        pointData : pointData
    }
}

import {
    addBoolWarning,
    showPointModal,
    hidePointModal,
    onSelectChange
} from '../modules/AlarmManageModule.js'


const mapActionCreator = {
    addBoolWarning,
    showPointModal,
    hidePointModal,
    onSelectChange
}

export default connect(mapStateToProps,mapActionCreator)(BoolAlarmView)