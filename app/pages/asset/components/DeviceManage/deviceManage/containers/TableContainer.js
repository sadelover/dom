import {connect} from 'react-redux'
import TableView  from '../components/TableView'

import { onPaginationChange, onSelectChange,treeSearch,saveId,deviceClick} from '../modules/TableModule';

const mapActionCreators = {
  onPaginationChange,
  onSelectChange,
  treeSearch,
  saveId,
  deviceClick
}

const mapStateToProps = (state) => {
  let startNo = (state.deviceManage.table.current - 1) * state.deviceManage.table.pageSize + 1;
  return {
    data: state.deviceManage.table.data.map(function (row, i) {
      row['no'] = startNo + i;
      return row;
    }),
    rowKey: 'id',
    selectedIds: state.deviceManage.table.selectedIds,
    pagination: {
      current: state.deviceManage.table.current,
      pageSize: state.deviceManage.table.pageSize, 
      total: state.deviceManage.table.total,
      showSizeChanger: true,
      pageSizeOptions: ['100', '500', '1000']
    },
    loading: state.deviceManage.table.loading,
    treedata: state.deviceManage.table.treedata,
    selectId:state.deviceManage.selectedProjectId,
  }
}

export default connect(mapStateToProps,mapActionCreators)(TableView)