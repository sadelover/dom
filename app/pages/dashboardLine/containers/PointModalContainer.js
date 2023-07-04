import { connect } from 'react-redux';
import PointView  from '../components/PointModalView'

import {
    initialize,
    onPaginationChange,
    saveSelectedPoint,
    searchPointData
    
} from '../modules/PointModalModule.js'

import {
    toggleConfigModal,
    showPointModal
} from '../modules/LineModule.js'

const mapActionCreator = {
    initialize,
    onPaginationChange,
    saveSelectedPoint,
    toggleConfigModal,
    searchPointData,
    showPointModal
}

const mapStateToProps = (state) => {
    return {
        ...state.dashboard.lineData.pointModalDict,
        pointData : state.dashboard.pointModal.pointData,
        loading:state.dashboard.pointModal.loading,
        rowKey : 'name',
        pagination : {
            current : state.dashboard.pointModal.current,
            total : state.dashboard.pointModal.total,
            pageSize : state.dashboard.pointModal.pageSize,       
            showSizeChanger: true,
            pageSizeOptions: ['50', '100', '200']
        }
    }
}



export default connect(mapStateToProps,mapActionCreator)(PointView)
