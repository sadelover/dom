import {connect} from 'react-redux';
import commandLog from  '../components/commandLogModalView'
const mapStateToProps = ( state ) => {
    return {
         ...state.commandlog
    }
}

import {
    getCommandLogModal, 
    hideCommandLogModal
} from '../modules/commandLogModule.js'

const mapActionCreator = {
    getCommandLogModal, 
    hideCommandLogModal
}

export default connect(mapStateToProps,mapActionCreator)(commandLog) 