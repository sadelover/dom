import {connect} from 'react-redux'
import TableView  from '../components/TableView'

import { onPaginationChange, onSelectChange } from '../modules/TableModule';

const mapActionCreators = {
  onPaginationChange,
  onSelectChange
}

const mapStateToProps = (state) => {
   let startNo = (state.equipSystemManage.table.current - 1) * state.equipSystemManage.table.pageSize + 1;
   return {
     data: state.equipSystemManage.table.data.map(function (row, i) {
       row['no'] = startNo + i;
       return row;
     }),
     rowKey: 'id',
     selectedIds: state.equipSystemManage.table.selectedIds,
     pagination: {
       current: state.equipSystemManage.table.current,
       pageSize:parseInt(window.localStorage.getItem('pageSize')), 
       total: state.equipSystemManage.table.total,
       showSizeChanger: true,
       pageSizeOptions: ['100', '500', '1000']
     },
     loading: state.equipSystemManage.table.loading,
   }
  // return{
  //   data: state.equipSystemManage.table.data,
  //   total: state.equipSystemManage.table.total
  // }

}

export default connect(mapStateToProps,mapActionCreators)(TableView)