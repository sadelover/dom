import React, { PropTypes } from 'react';
import { Table ,Button } from 'antd';
import http from '../../../../../../common/http'
import {modalTypes} from '../../../../../../common/enum'
import s from './TableView.css'
 class TableView extends React.PureComponent{
    constructor(props){
        super(props)
        this.asset = this.asset.bind(this)
        this.paremeter = this.paremeter.bind(this)
    }
    asset(e){
      const {AssetLoading,AssetData} = this.props
      this.props.showModal(modalTypes.ASSET_MODAL,{})
      AssetLoading(true)
      http.post('/equipment/searchAssetTmplList',{
        projectId:0,
        "pageSize":100,
        "targetPage":1,
        "searchKey":'',
        "tmpl_def_id":parseInt(e.target.id) 
        }).then(
            data=>{
                if(data.status){
                    AssetData(data)
                    AssetLoading(false)
                }
            }
        ).catch(
            error=>{
                console.log("出错啦")
                AssetLoading(false)
            }
        )
      this.props.Obtain(e.target.id,e.target.title)
    }
    paremeter(e){
      const {ParemeterLoading,ParemeterData} = this.props
      ParemeterLoading(true)
      http.post('/equipment/searchParamTmpl',{
          projectId:0,
          "pageSize":10,
          "targetPage":1,
          "searchKey":'',
          "tmpl_def_id":parseInt(e.target.id) 
      }).then(
          data=>{
              if(data.status){
                  ParemeterData(data)
                  ParemeterLoading(false)
              }
          }
      ).catch(
          error=>{
              console.log("出错啦")
              ParemeterLoading(false)
          }
      )
      this.props.showModal(modalTypes.PARAMETER_MODAL,{})
      this.props.Obtain(e.target.id,e.target.title)
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
        loading,
        showModal,
        template_id,
        deviceClick
    } = this.props
    return (
      <Table
        bordered={true}
        columns={[{
          title: '模板id',
          dataIndex: 'id',
          key:'id',
          width: 50,
          align:'center'
        },{
          title: '模板名称',
          dataIndex: 'name',
          key:'name',
          width: 80
        },{
          title:'模板描述',
          dataIndex: 'describe',
          key: 'describe',
          width: 200
        },{
          title:'操作',
          dataIndex: 'operation',
          key: 'operation',
          render:(text,record,index)=>{
            return(
              <div>
                <Button className={s['btn-common']} id={record.id} title={record.name}  onClick={this.asset}  type='primary'>资产模板设置</Button>
                <Button className={s['btn-common']} id={record.id} title={record.name}  onClick={this.paremeter} type='primary'>参数模板设置</Button>
              </div>                     
            )
          },
          width:400
      }  
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
};

export default TableView