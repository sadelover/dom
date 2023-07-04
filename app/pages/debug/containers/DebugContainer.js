import {connect} from 'react-redux';

import DebugView from '../components/DebugView'

import {
    choseMenuItem
} from '../modules/DebugModule.js'

import {
    reset as dataManageReset
} from '../modules/DataManagePageModule.js'

import {
    reset as logReset
} from '../modules/LogModule.js'

import {
    reset as policyReset
} from '../modules/PolicyQueryModule.js'

const mapStateToProps =  (state) => {
    return {
        ...state.debug
    }
}


const mapActionCreators = {
    choseMenuItem,
    dataManageReset,
    logReset,
    policyReset
}


export default connect(mapStateToProps,mapActionCreators)(DebugView)

