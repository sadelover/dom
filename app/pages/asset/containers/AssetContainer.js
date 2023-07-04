import {connect} from 'react-redux';

import AssetView from '../components/AssetView'

import {
    choseMenuItem
} from '../modules/AssetModule.js'


import {
    reset as logReset
} from '../modules/DeviceManageModule.js'



const mapStateToProps =  (state) => {
    return {
        ...state.debug
    }
}


const mapActionCreators = { 
    choseMenuItem,
    logReset,
}


export default connect(mapStateToProps,mapActionCreators)(AssetView)