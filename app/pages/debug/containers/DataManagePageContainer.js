import {connect} from 'react-redux'
import DataManagePage  from '../components/dataManage/DataManagePage'

import { 
  onPaginationChange, 
  onSelectChange ,
  reloadTable,
  searchList,
  reset,
  tableLoading,
  saveKeyWordList
} from '../modules/DataManagePageModule';


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
  reset,
  tableLoading,
  saveKeyWordList
}

const mapStateToProps = (state) => {
  let startNo = (state.debug.realTable.current - 1) * state.debug.realTable.pageSize + 1;
  return {
    data: state.debug.realTable.data.map(function (row, i) {
      row['no'] = startNo + i;
      return row;
    }),
    rowKey: 'name',
    selectedIds: state.debug.realTable.selectedIds,
    pagination: {
      current: state.debug.realTable.current,
      pageSize:  parseInt(window.localStorage.getItem('pageSize')), 
      total: state.debug.realTable.total,
      showSizeChanger: true,
      pageSizeOptions: ['100', '500', '1000']
    },
    loading: state.debug.realTable.loading,
    modal : state.debug.base.modal,
    keyWordList : state.debug.realTable.keyWordList
  }
}

export default connect(mapStateToProps,mapActionCreators)(DataManagePage)