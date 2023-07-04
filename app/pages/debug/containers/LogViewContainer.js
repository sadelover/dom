import {connect} from 'react-redux';
import LogView from '../components/logManage/LogView'
import { 
    onPaginationChange, 
    onSelectChange ,
    reloadTable,
    searchList,
    getTimeRange
} from '../modules/LogModule';

import {
  showModal,
  hideModal
} from '../modules/DebugModule'

const mapActionCreators = {
// debug
  showModal,
  hideModal,
// dataManagePage
  onPaginationChange,
  onSelectChange,
  reloadTable,
  searchList,
  getTimeRange
}

const mapStateToProps = (state) => {
    let startNo = (state.debug.logTable.current - 1) * state.debug.logTable.pageSize + 1;
    return {
      data: state.debug.logTable.data.map(function (row, i) {
        row['no'] = startNo + i;
        return row;
      }),
      rowKey: "no",
      selectedIds: state.debug.logTable.selectedIds,
      pagination: {
        current: state.debug.logTable.current,
        pageSize:  parseInt(window.localStorage.getItem('pageSize')), 
        total: state.debug.logTable.total,
        showSizeChanger: true,
        pageSizeOptions: ['100', '500', '1000']
      },
      loading: state.debug.logTable.loading,
      logTimeRange : state.debug.logTable.logTimeRange,
      keyWordList : state.debug.logTable.keyWordList
    }
}

export default connect(mapStateToProps,mapActionCreators)(LogView)