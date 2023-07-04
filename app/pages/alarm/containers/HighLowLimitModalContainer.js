import {connect} from 'react-redux'
import HighLowLimitAlarmModalView from '../components/HighLowLimitAlarmModalView'

const mapStateToProps = (state) => {
    const {selectedIds,pointData} = state.alarmManage.pointTable

    return {
        selectedIds :selectedIds,
        pointData : pointData
    }
}

import {
    addHighLowWarning,
    showPointModal,
    hidePointModal
} from '../modules/AlarmManageModule.js'

const mapActionCreator = {
    addHighLowWarning,
    showPointModal,
    hidePointModal
}

export default connect(mapStateToProps,mapActionCreator)(HighLowLimitAlarmModalView)