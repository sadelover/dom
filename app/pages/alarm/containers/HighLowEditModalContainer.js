import {connect} from 'react-redux'
import HighLowLIMITEditModalView from '../components/HighLowLIMITEditModalView'

const mapStateToProps = (state) => {
    return {
        record : state.alarmManage.table.record
    }
}

import {
    editHithLowWaring
} from '../modules/AlarmManageModule.js'

const mapActionCreator = {
    editHithLowWaring
}

export default connect(mapStateToProps,mapActionCreator)(HighLowLIMITEditModalView)