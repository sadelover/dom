import {connect} from 'react-redux'
import TableView  from '../components/TableView'

import { onPaginationChange, onSelectChange } from '../modules/TableModule';


const mapActionCreators = {
  onPaginationChange,
  onSelectChange
}

const mapStateToProps = (state) => {
  let startNo = (state.inspactArea.table.current - 1) * state.inspactArea.table.pageSize + 1;
  return {
    data: state.inspactArea.table.data.map(function (row, i) {
      row['no'] = startNo + i;
      return row;
    }),
    rowKey: 'id',
    selectedIds: state.inspactArea.table.selectedIds,
    pagination: {
      current: state.inspactArea.table.current,
      pageSize:  parseInt(window.localStorage.getItem('pageSize')), 
      total: state.inspactArea.table.total,
      showSizeChanger: true,
      pageSizeOptions: ['100', '500', '1000']
    },
    loading: state.inspactArea.table.loading
  }
}

export default connect(mapStateToProps,mapActionCreators)(TableView)