import React, { PropTypes } from 'react';
import { Table ,Button ,Pagination,Avatar  } from 'antd';
import s from './TableView.css'

 class TableView extends React.PureComponent{
  constructor(props){
    super(props)
  }
  Accord = (e) => {
    
  }
  render(){
    const {
      rowKey, 
      columns, 
      data, 
      selectedIds, 
      pagination, 
      onShowSizeChange, 
      onPaginationChange, 
      onSelectChange,
      loading
    } = this.props
    return (
      <Table
      bordered={true}
      columns={[{
        title: '编号',
        dataIndex: 'no',
        key: 'no',
        width: 80,
        align:'center'
      },{
        title: '系统编码',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        align:'center'
      },{
        title: '系统名称',
        dataIndex: 'system_name',
        key: 'system_name',
        width: 200
      },{
        title: '描述',
        dataIndex: 'system_desc',
        key: 'system_desc',
        width: 200
      }
      // ,{
      //   title:'图片',
      //   dataIndex:'system_img',
      //   width:200,
      //   render:(text, record) => {
      //     return (
      //         <div>
      //           <a  href={`http://119.29.61.31/static/file/equipSystem/${record.sort_num}`}  target="_blank>"> <img style={{width:'100px',height:'100px',cursor:'pointer'}} onClick={this.Accord(record.sort_num)}  src={`http://119.29.61.31/static/file/equipSystem/${record.sort_num}`} /></a>
      //         </div>
      //     )
      //   }
      // }
    ]}
    rowKey={rowKey}
    pagination={pagination}
    dataSource={data}
    scroll={{y:500}}
    loading={loading}
    onChange={onPaginationChange}
    rowSelection={{
      selectedRowKeys: selectedIds,
      onChange: onSelectChange
    }}
    rowClassName={
      (record,index)=>{
        if(index%=2) return s['even-row']
      }
    }
    ></Table>
    )
  }
};

export default TableView