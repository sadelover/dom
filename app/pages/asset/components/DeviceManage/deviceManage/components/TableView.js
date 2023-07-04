import React from 'react';
import { Table,Icon,Button,Layout,Tree,DatePicker,Modal} from 'antd';
import s from './TableView.css'
import http from '../../../../../../common/http'
const { Header, Footer, Sider, Content } = Layout;
const TreeNode = Tree.TreeNode;

class TableView extends React.PureComponent{
  constructor(props){
    super(props)
    this.state = { 
      columns:[
                {title: '编号',dataIndex: 'no', key: 'no',width: 50 }, 
                {title: '设备名称', dataIndex: 'name',key: 'name',width: 150,
                },{title: '设备类型',dataIndex: 'type', key: 'type',width: 50
                },{title: '设备参数',dataIndex: 'model_id', key: 'model_id',width: 50
              },{title: '安装位置', dataIndex: 'installLocation varchar', key: 'installLocation varchar', width: 50
                },{title: '通信状态', dataIndex: 'communicateStatus', key: 'communicateStatus',  width: 50
                },{ title: '保养状态',dataIndex: 'maintenanceStatus', key: 'maintenanceStatus', width: 50
                },{title: '维修状态', dataIndex: 'repairStatus',  key: 'repairStatus',   width: 50
                },{ title: '报警状态', dataIndex: 'warningStatus',key: 'warningStatus', width: 50}
      ],
      dataAssetSource:[],
      assetLoading:false,
      assetModalVisible:false,
      dataParamSource:[],
      paramLoading:false,
      paramModalVisible:false,
    }
    this.getInfo = this.getInfo.bind(this)
    this.getZcInfo = this.getZcInfo.bind(this)
  }
  componentWillReceiveProps(nextProps){
    let data =  [{title: '编号',dataIndex: 'no', key: 'no',width: 50 }, 
    {title: '设备名称', dataIndex: 'name',key: 'name',width: 80,
    },{title: '设备类型',dataIndex: 'type', key: 'type',width: 50
    },{title: '设备信息',dataIndex: 'model_id', key: 'model_id',width: 50,render:(text,record)=>{
      return <div>
          <Button style={{padding:3,fontSize:12,marginRight:5}} id={text} onClick={this.getInfo}>参数信息</Button>
          <Button style={{padding:3,fontSize:12}} onClick={()=>this.getZcInfo(record.model_id,record.id)}>资产信息</Button>
        </div>
    }
  },{title: '安装位置', dataIndex: 'installLocation varchar', key: 'installLocation varchar', width: 50
    },{title: '通信状态', dataIndex: 'communicateStatus', key: 'communicateStatus',  width: 50
    },{ title: '保养状态',dataIndex: 'maintenanceStatus', key: 'maintenanceStatus', width: 50
    },{title: '维修状态', dataIndex: 'repairStatus',  key: 'repairStatus',   width: 50
    },{ title: '报警状态', dataIndex: 'warningStatus',key: 'warningStatus', width: 50}]
     if(nextProps.data.length>0){
      nextProps.data[0].paramCode.map((item,index)=>{
          let obj =  {title: '', dataIndex: '',key:'',width: 50}
          let onlineJson = {title:'',key:'',width:50,render:(text,index,record)=>{
            let  arr = []
            arr = text.paramCode.filter(row=>{
              if(row['name']==='在线')  return row
            })
              if(arr[0].value==1){
                return(
                  <div style={{color:"#72afd2"}} >在线</div>
                )
              }else{
                return(
                  <div>离线</div>
                )
              }
          }}
          let switchJson = {title:'',key:'',width:50,render:(text,index,record)=>{
          let  arr = []
          arr = text.paramCode.filter(row=>{
                if(row['name']==='开机 ')  return row
            })
              if(arr[0].value==1){
                return(
                  <div style={{color:"#72afd2",cursor:"pointer"}} onClick={()=>{this.switchClick(text,item['name'],0)}} >开</div>
                )
              }else{
                return(
                  <div style={{color:"red",cursor:"pointer"}} onClick={()=>{this.switchClick(text,item['name'],1)}}>关</div>
                )
              }
            }
          }
          let setTimeJson = {title:'',key:'',width:50,render:(text,index,record)=>{
            let  arr = []
            arr = text.paramCode.filter(row=>{
                  if(row['name']==='定时')  return row
              })
              if(arr[0].value==1){
                return(
                    <div style={{color:"#72afd2",cursor:"pointer"}} onClick={()=>{this.modelClick(text,item['name'],0)}} >开</div>
                )
              }else{
                return(
                  <div style={{color:"red",cursor:"pointer"}} onClick={()=>{this.modelClick(text,item['name'],1)}}>关</div>
                )  
              }
            }
          }
          let modelJson =  {title:'',key:'',width:50,render:(text,index,record)=>{
            let  arr = []
            arr = text.paramCode.filter(row=>{
                  if(row['name']==='模式')  return row
              })
              if(arr[0].value==1){
                return(
                  <div style={{color:"#72afd2",cursor:"pointer"}} onClick={()=>{this.modelClick(text,item['name'],0)}}>自动</div>
                )
              }else{
                return(
                  <div style={{color:"red",cursor:"pointer"}} onClick={()=>{this.modelClick(text,item['name'],1)}}>手动</div>
                )
              }
            }
          }
      if(item['name']=='开机 '){
              switchJson['title']=item['name']
              switchJson['key']=item['name']+'value'
              data.push(switchJson)
          }else if(item['name']=='定时'){
             setTimeJson['title']=item['name']
              setTimeJson['key']=item['name']+'value'
              data.push(setTimeJson)
          }else if(item['name']=='在线'){
            onlineJson['title']=item['name']
            onlineJson['key']=item['name']+'value'
            data.push(onlineJson)
          }else if(item['name']=='模式'){
              modelJson['title']=item['name']
              modelJson['key']=item['name']+'value'
              data.push(modelJson)
          }else{
              obj['title']=item['name']
              obj['dataIndex']=item['name']+'value'
              obj['key']=item['name']+'value'
              data.push(obj)
          }
          
      })
      this.setState({
        columns:data
      })
     }
  }

  getInfo(e){
    this.setState({
      paramModalVisible:true,
      paramLoading:true
    })
    http.post('/equipment/searchParamTmpl',{
      projectId:0,
      pageSize:10,
      targetPage:1,
      searchKey:'',
      tmpl_def_id:parseInt(e.target.id)
    }).then(
        data=>{
            if(data.status){
              this.setState({
                dataParamSource:data.data,
                paramLoading:false
              })
            }else{
              this.setState({
                paramLoading:false
              })
            }
        }
    ).catch(
        error=>{
          this.setState({
            paramLoading:false
          })
        }
    )
  }

  getZcInfo(model_id,id){
    this.setState({
      assetModalVisible:true,
      assetLoading:true
    })
    http.post('/equipment/getInitAsset',{
      "project_id":0,
      "template_id":parseInt(model_id),
      "equip_id":parseInt(id)
    }).then(
        data=>{
            if(data.status){
              this.setState({
                dataAssetSource:data.data,
                assetLoading:false
              })
            }else{
              this.setState({
                assetLoading:false
              })
            }
        }
    ).catch(
        error=>{
          this.setState({
            assetLoading:false
          })
        }
    )
  }

  switchClick(data,name,value){
      let newdata = []
      data.paramCode.filter(row=>{
          if(row['name']=='开机'){
            newdata.push(row)
          }
      })
      let json = newdata[0].paramCommand
      this.props.deviceClick(json.map['0'],value,data.system_id)
  }
  setTimeClick(data,name,value){
      let newdata = []
      data.paramCode.filter(row=>{
          if(row['name']=='定时'){
            newdata.push(row)
          }
      })
      let json = newdata[0].paramCommand
      this.props.deviceClick(json.map['0'],value,data.system_id)
  }
  modelClick(data,name,value){
      let newdata = []
      data.paramCode.filter(row=>{
          if(row['name']=='模式'){
            newdata.push(row)
          }
      })
      let json = newdata[0].paramCommand
      this.props.deviceClick(json.map['0'],value,data.system_id)
  }


  onSelect = (checkedKeys,info) => {
     let id = info.selectedNodes[0].props.id
   this.props.treeSearch(id)
   this.props.saveId(id)
  }
  renderTreeNodes = (data) => {
    if(data != null || data != undefined) {
      for(let i in data){
          data[i].key = `0-${data[i].system_name}-${i}`
      }
      let _this = this
      return data.map((item) => {
          return (
            <TreeNode   title={item.system_name} key={item.key} dataRef={item} id={item.id} >
              {/* {_this.traverse(_this.props.data,item.id)} */}
            </TreeNode>
          );
      });
    }
    
  }
  onRightClick=()=>{
    console.log(111)
  }
  traverse = (data,id) =>{
    let newdata = data.filter((item)=>{
      if(parseInt(item.system_id)=== id) return item
    })
    for(let i in newdata){
      newdata[i].key = `0-${newdata[i].name}-${i}`
    }
    return newdata.map((item) => {
      return (
        <TreeNode disabled  title={item.name} key={item.key}>
        </TreeNode>
      )
    })
  }

  assetHandleCancel = ()=>{
    this.setState({
      assetModalVisible:false,
      dataAssetSource:[]
    })
  }

  paramHandleCancel = ()=>{
    this.setState({
      paramModalVisible:false,
      dataParamSource:[]
    })
  }

  render(){
    const {
        rowKey,
        data, 
        selectedIds, 
        pagination, 
        onShowSizeChange, 
        onPaginationChange, 
        onSelectChange,
        loading,
        treedata,
        treeSearch,
        selectId,
        deviceClick
    } = this.props
    let newData = []
    if(data.length>0){
        data.map(item=>{
           item.paramCode.map(row=>{
                  item[`${row['name']}value`]=row['value']      
            })
        })
    }
    const {columns} = this.state
    let paramColumns=[
      { title:'参数中文称',dataIndex: 'paramName',key:'paramName',width: 80},
      { title:'字段英文称', dataIndex: 'paramCode',key:'paramCode',width: 80},      
      { title:'额定值', dataIndex: 'maxValue',key:'maxValue',width: 80},         
      { title:'单位', dataIndex: 'paramUnit',key:'paramUnit',width: 80},                      
      { title:'排序码', dataIndex: 'sort_num',key:'sort_num',width: 80}            
    ]
    let assetColumns=[
      { title:'属性中文称',dataIndex: 'cn_name',key:'cn_name',width: 80},
      { title:'属性英文称', dataIndex: 'en_name',key:'en_name',width: 80},      
      { title:'属性值', dataIndex: 'param_value',key:'param_value',width: 80}          
    ]
    return (
      <div>
      <Layout>
        <Sider>
          <Tree 
          defaultExpandAll={true} 
          onSelect={this.onSelect}
          onCheck={this.onRightClick}
          >
          <TreeNode title="设备管理" key="0"  >
              {this.renderTreeNodes(this.props.treedata)}
            </TreeNode>
          </Tree>
        </Sider>
        <Content>
        <Table
        bordered={true}
        columns={columns}
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
        </Content>
    </Layout>
      <Modal
        title="资产信息"
        visible={this.state.assetModalVisible}
        onCancel={this.assetHandleCancel}
        footer={null}
        style={{top:200}}
        width={700}
        >
          <Table style={{marginTop:-15}} dataSource={this.state.dataAssetSource} loading={this.state.assetLoading} columns={assetColumns} pagination={false} />
      </Modal>
      <Modal
        title="参数信息"
        visible={this.state.paramModalVisible}
        onCancel={this.paramHandleCancel}
        footer={null}
        style={{top:200}}
        width={700}
        >
          <Table style={{marginTop:-15}} dataSource={this.state.dataParamSource} loading={this.state.paramLoading} columns={paramColumns} pagination={false} />
      </Modal>
    </div> 
    )
  }
};

export default TableView