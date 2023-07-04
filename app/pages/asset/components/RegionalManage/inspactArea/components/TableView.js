import React, { PropTypes } from 'react';
import { Table ,Button } from 'antd';
import s from './TableView.css'


class TableView extends React.PureComponent{
    constructor(props){
      super(props)
      // this.moveFn = this.moveFn.bind(this)
      this.viewCode=this.viewCode.bind(this)
    }

    // moveFn(id,type){
    //    this.props.modifySeq(id,type)
    // }
    viewCode(code){
       window.open('http://119.29.61.31:8011/api/equipment/code/'+code)
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
              width: 50,
              align:'center'
            },{
              title: '区域编码',
              dataIndex: 'id',
              key: 'id',
              width: 50,
              align:'center'
            },{
              title: '区域名称',
              dataIndex: 'areaName',
              key: 'areaName',
              width: 200
            },{
              title: '区域二维码',
              dataIndex: 'description',
              key: 'description',
              width: 200
            },{
              title: '查看二维码',
              dataIndex: 'action2',
              key: 'action2',
              width: 200,
              render:(text, record) => {
                let description=record.description
                return (
                    <div>
                
                    </div>
                )
              }
            },
            // {
            //   title: '操作',
            //   dataIndex: 'action',
            //   key: 'action',
            //   width: 200,
            //   render:(text, record) => {
            //     let id=record.id
            //     return (
            //         <div>
            //         <Button type='primary'  icon="plus" className={s['btn-common']} onClick={()=>this.moveFn(record.id,0)}>上移</Button>
            //         <Button type='primary'  icon="plus" className={s['btn-common']} onClick={()=>this.moveFn(record.id,1)}  style={{margin:'2px'}}>下移</Button>
            //         </div>
            //     )
            //   }
            // }
          ]}
          dataSource={data}
          rowKey={rowKey}
          pagination={pagination}
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
}

export default TableView