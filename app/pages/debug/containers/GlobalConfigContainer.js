import {connect} from 'react-redux'
import GlobalConfigView from '../components/globalManage/GlobalConfigView'

import {uploadBg,RegistModal} from '../modules/GlobalConfigModule'
const mapStateToProps = (state) => {
    return {
        imgPath : state.debug.globalConfig.imgPath,
        visible : state.debug.globalConfig.visible
    }
}

const mapActionCreator = {
    uploadBg,
    RegistModal
}


export default connect(mapStateToProps,mapActionCreator)(GlobalConfigView)