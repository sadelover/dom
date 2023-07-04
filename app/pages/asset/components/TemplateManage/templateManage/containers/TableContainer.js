import {connect} from 'react-redux'
import TableView  from '../components/TableView'

import { onPaginationChange, onSelectChange,Obtain,AssetLoading,AssetData,ParemeterLoading,ParemeterData,assetSelect} from '../modules/TableModule';
const mapActionCreators = {
  onPaginationChange,
  onSelectChange,
  Obtain,
  AssetLoading,
  AssetData,
  ParemeterLoading,
  ParemeterData,
  assetSelect
}
const mapStateToProps = (state) => {
  let startNo = (state.templateManage.table.current - 1) * state.templateManage.table.pageSize + 1;
  return {
    data: state.templateManage.table.data.map(function (row, i) {
      row['no'] = startNo + i;      
      return row;
    }),
    rowKey: 'id',
    selectedIds: state.templateManage.table.selectedIds,
    pagination: {
      current: state.templateManage.table.current,
      pageSize:  parseInt(window.localStorage.getItem('pageSize')), 
      total: state.templateManage.table.total,
      showSizeChanger: true,
      pageSizeOptions: ['100', '500', '1000']
    },
    loading: state.templateManage.table.loading,
    template_id:state.templateManage.table.template_id
  }
}

export default connect(mapStateToProps,mapActionCreators)(TableView)