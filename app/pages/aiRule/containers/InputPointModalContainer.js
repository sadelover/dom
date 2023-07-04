import { connect } from 'react-redux';
import InputPointView  from '../components/InputPointModalView'

const mapStateToProps = (state) => {
    if (state.aiRule.reducer.modal === undefined) {
        state.aiRule.reducer.modal = {
            type : undefined,
            props : {}
        }
    }
    return {
        modal : state.aiRule.reducer.modal,
        pointDataInput : state.aiRule.inputPointTable.pointDataInput,
        loading:state.aiRule.inputPointTable.loading,
        selectedIdsInput : state.aiRule.inputPointTable.selectedIdsInput,
        rowKey : 'name',
        pagination : {
            current : state.aiRule.inputPointTable.current,
            total : state.aiRule.inputPointTable.total,
            pageSize : state.aiRule.inputPointTable.pageSize,       
            showSizeChanger: true,
            pageSizeOptions: ['50', '100', '200']
        }
    }
}

import {
    initialize,
    onPaginationChange,
    searchPointDataInput,
    onSelectChangeInput
} from '../modules/InputPointModalModule.js'

const mapActionCreator = {
    initialize,
    onPaginationChange,
    searchPointDataInput,
    onSelectChangeInput
}

export default connect(mapStateToProps,mapActionCreator)(InputPointView)
