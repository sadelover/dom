import { connect } from 'react-redux';
import OutputPointView  from '../components/OutputPointModalView'

const mapStateToProps = (state) => {
    if (state.aiRule.reducer.modal === undefined) {
        state.aiRule.reducer.modal = {
            type : undefined,
            props : {}
        }
    }
    return {
        modal : state.aiRule.reducer.modal,
        pointDataOutput : state.aiRule.outputPointTable.pointDataOutput,
        loading:state.aiRule.outputPointTable.loading,
        selectedIdsOutput : state.aiRule.outputPointTable.selectedIdsOutput,
        rowKey : 'name',
        pagination : {
            current : state.aiRule.outputPointTable.current,
            total : state.aiRule.outputPointTable.total,
            pageSize : state.aiRule.outputPointTable.pageSize,       
            showSizeChanger: true,
            pageSizeOptions: ['50', '100', '200']
        }
    }
}

import {
    initializeOutput,
    onPaginationChange,
    searchPointData,
    onSelectChangeOutput
} from '../modules/OutputPointModalModule.js'

const mapActionCreator = {
    initializeOutput,
    onPaginationChange,
    searchPointData,
    onSelectChangeOutput
}

export default connect(mapStateToProps,mapActionCreator)(OutputPointView)
