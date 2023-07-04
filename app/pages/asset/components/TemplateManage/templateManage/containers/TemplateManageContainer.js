import {connect} from 'react-redux'
import TemplateManageView from '../components/TemplateManageView'

const mapStateToProps = (state) => {
    //console.info(JSON.stringify(state.examManage.table))
    return {
        ...state.templateManage.base,
        table:state.templateManage.table
    }
}
import {
    reloadTable,  
    addList,
    delList,
    modifyList,
    searchList,
    searchInsUser,
    searchUser,
    AddMadol,
    ModifyModal,
    AssetLoading,
    AssetData,
    ParemeterAddMoadal,
    ParemeterModifyMoadl,
    ParemeterData,
    ParemeterLoading,
    assetSelect
} from '../modules/TableModule'
import {
    showModal,
    hideModal
} from '../modules/TemplateManageModule'

const mapActionCreator = {
    reloadTable,
    showModal,
    hideModal,
    addList,
    delList,
    modifyList,
    searchList,
    searchInsUser,
    searchUser,
    AddMadol,
    ModifyModal,
    AssetLoading,
    AssetData,
    ParemeterAddMoadal,
    ParemeterModifyMoadl,
    ParemeterData,
    ParemeterLoading,
    assetSelect
}
export default connect(mapStateToProps,mapActionCreator)(TemplateManageView)