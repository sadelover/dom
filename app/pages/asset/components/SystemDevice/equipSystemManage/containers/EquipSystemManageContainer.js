import {connect} from 'react-redux'
import EquipSystemManageView from '../components/EquipSystemManageView'

const mapStateToProps = (state) => {
    return {
        ...state.equipSystemManage.base,
        table:state.equipSystemManage.table
    }
}

import {
    reloadTable,
    addList,
    delList,
    modifyList
} from '../modules/TableModule'
import {
    showModal,
    hideModal
} from '../modules/EquipSystemManageModule'

const mapActionCreator = {
    reloadTable,
    showModal,
    hideModal,
    addList,
    delList,
    modifyList
}



export default connect(mapStateToProps,mapActionCreator)(EquipSystemManageView)