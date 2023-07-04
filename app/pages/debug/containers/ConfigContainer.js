import {connect} from 'react-redux'
import ConfigView from '../components/configManage/ConfigView'
import {changeValue,saveConfig,getConfig} from '../modules/ConfigModule'
const mapStateToProps = (state) => {
    return {
        code : state.debug.config.code
    }
}

const mapActionCreator = {
    changeValue,
    saveConfig,
    getConfig
}


export default connect(mapStateToProps,mapActionCreator)(ConfigView)