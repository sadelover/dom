import {connect} from 'react-redux'
import BoolAlarmEditModalView from '../components/BoolAlarmEditModalView'

const mapStateToProps = (state) => {
    return {
        record : state.alarmManage.table.record
    }
}

import {
    editWarning
} from '../modules/AlarmManageModule.js'

const mapActionCreator = {
    editWarning
}

export default connect(mapStateToProps,mapActionCreator)(BoolAlarmEditModalView)