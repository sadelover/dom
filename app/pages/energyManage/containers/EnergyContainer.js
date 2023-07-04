import {connect} from 'react-redux';
import EnergyManageView from  '../components/EnergyManageView'
const mapStateToProps = ( state ) => {
    return {
         ...state.reportManage
    }
}
import {
    ViewMessage,
    viewExperience
}from '../../observer/modules/ObserverModule'
import {
    RepairDataAction,
    getRepairData,
    RepairVisiable,
    CurrentData
} from '../modules/EnergyModule.js'

const mapActionCreator = {
    RepairDataAction,
    ViewMessage,
    viewExperience,
    getRepairData,
    RepairVisiable,
    CurrentData
}

export default connect(mapStateToProps,mapActionCreator)(EnergyManageView) 