import React, {PropTypes} from 'react';
import {Table, Button, Input ,message,Upload,Icon,Modal} from 'antd';
import s from './DataManagePage.css'
import {Debug_modalTypes} from '../../../../common/enum'
import appConfig from '../../../../common/appConfig'
import http from '../../../../common/http'
/**
 * 组件
 */
import ModifyPointView from './ModifyPointView'
import ModifyPointFormulaView from './ModifyPointFormulaView'
import HistoryModalView from './HistoryModalView'
import AddToWatchModalView from './AddToWatchModalView'

const Search = Input.Search
const { TextArea } = Input;

let btnStyle,headerStyle,tableInputStyle,toggleTableClass,toggleSearchClass;
if(localStorage.getItem('serverOmd')=="best"){
    btnStyle={
      background:"#E1E1E1",
      boxShadow:"2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
      border:0,
      color:"#000",
      fontSize:"12px"
    }
}
if(localStorage.getItem('serverOmd')=="persagy"){
  btnStyle={
    background:"rgba(255,255,255,1)",
    border:'1px solid rgba(195,198,203,1)',
    color:"rgba(38,38,38,1)",
    borderRadius:'4px',
    fontSize:"14px",
    fontFamily:'MicrosoftYaHei'
  }
  headerStyle = {
    backgroundColor:'rgba(255,255,255,1)',
    padding:'0px'
  }
  tableInputStyle = {
    border:'0px',
    outline:'none',
    cursor:'auto',
    backgroundColor:"rgba(255,255,255,1)",
    boxShadow: 'none',
    overflow:'visible',
    color:"rgba(38,38,38,1)",
    borderRadius:'4px',
    fontSize:"14px",
    fontFamily:'MicrosoftYaHei'
  }
  toggleTableClass = 'persagy-table-tbody persagy-table-thead persagy-pagination-item persagy-table-placeholder';
  toggleSearchClass = "persagy-dataManage-input";
} else {
  tableInputStyle = {
    border:'0px',
    outline:'none',
    cursor:'auto',
    backgroundColor:"#001529",
    boxShadow: 'none',
    overflow:'visible'
  }
}

class PageRealDataTable extends React.PureComponent {
  constructor(props){
    super(props)

   
} 
  componentDidMount() {
    this
      .props
      .reloadTable()
  }
  componentDidUnMount(){
    this.props.reset()
  }
  // focus(a){
    
  //   $(this).on("keydown",function(event){
  //       if(event.ctrlKey == true){
  //           alert("你使用了Ctrl功能！");
  //           if(event.keyCode == 67){
  //               alert("你使用了Ctrl+C组合件功能！");
  //           }
  //       }
  //   })
    
  // };

  render() {
    const {
      rowKey,
      data,
      pagination,
      onPaginationChange,
      loading,
      reloadTable,
      onSelectChange,
      selectedIds
    } = this.props

    return (
      <Table
        columns={[
        {
          title:'编号',
          dataIndex:'no',
          key:'no',
          width:35,
        },   
        {
          title: '点名',
          dataIndex: 'name',
          key:'name',
          width:100,
          render:(text,record)=>{
            return(<div><Input readOnly unselectable="on"  style={tableInputStyle} id={record.name} value={record.name}/>
            </div>
            )
          }
        },
      
        ,{
          title: '点名释义',
          dataIndex: 'description',
          key:'description',
          width:100,
          render:(text,record)=>{
            return(<div><Input readOnly unselectable="on"  style={tableInputStyle} id={record.description} value={record.description}/>
            </div>
            )
          }
        },
         {
          title: '时间',
          dataIndex: 'time',
          key: 'time',
          width:100,
        }, {
          title: '点值',
          dataIndex: 'value',
          key: 'value',
          width:100
        }
      ]}
        className={toggleTableClass}
        bordered={false}
        dataSource={data}
        rowKey='name'
        columnWidth='40px'
        pagination={pagination}
        scroll={{y: 720}}
        loading={loading}
        onChange={onPaginationChange}
        rowClassName={(record, index) => {
        if (index %= 2) 
          return s['even-row']
        }}
        rowSelection={{
        selectedRowKeys: selectedIds,
        onChange: onSelectChange
      }}></Table>
    )
  }
};
/**
 * 实时数据页面
 *
 * @class DataManagePage
 * @extends {React.Component}
 */
class DataManagePage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      addModalVisible : false,
      infoVisible: false,
      info:{},
      pointName:""
    }

    this.searchList = this.searchList.bind(this)
    this.modifyPointValue = this.modifyPointValue.bind(this)
    this.showHistoryModal = this.showHistoryModal.bind(this)
    this.refreshData = this.refreshData.bind(this)
    this.clearSearchValue = this.clearSearchValue.bind(this)
    this.saveKeyWordList = this.saveKeyWordList.bind(this)
    this.showPointInfo = this.showPointInfo.bind(this)
    this.infoCancel = this.infoCancel.bind(this)
    this.modifyPointFormula = this.modifyPointFormula.bind(this)
    this.modifyPointDescription = this.modifyPointDescription.bind(this)
  }
  //点位信息模态框
  showPointInfo(){
    const {selectedIds,showModal,data}  = this.props
    if(selectedIds.length!==1) {
      Modal.error({
        title: '错误提示',
        content: "请选中一个点查看！"
      })
      return null
    }
    http.post('/analysis/get_point_info_from_s3db',{
      "pointList": selectedIds
    }).then(data=>{
      this.setState({
        info:data.data[selectedIds[0]],
        pointName: selectedIds[0]
      })
    })
    this.setState({
      infoVisible: true
    })
  }

  infoCancel(){
    this.setState({
      infoVisible: false
    })
    this.props.reloadTable()
  }
  // 显示历史曲线
  showHistoryModal(){

    const {selectedIds,showModal}  = this.props

    if(!selectedIds.length) {
      Modal.error({
        title: '错误提示',
        content: "请选中一个点查看！"
      })
      return null
    }
    console.info("历史曲线")
    showModal({type:Debug_modalTypes.HISTORY_MODAL,props:{}})

  }

  //查询list
  searchList(value) {

    let keyWordList = value.split(' ')
    console.info(keyWordList)
    this.props.searchList(keyWordList)
  }

  // 显示修改点值模态框
  modifyPointValue(){
    const {selectedIds,showModal,data}  = this.props
    if (JSON.parse(localStorage.getItem('userData')).role < JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
      Modal.info({
        title: '提示',
        content: '用户权限不足'
      })
      return
    }
    if(!selectedIds.length) {
      Modal.error({
        title: '错误提示',
        content: "请选中一个点查看！"
      })
      return null
    }
    let point
    if(selectedIds!==undefined&&selectedIds!==[]&&selectedIds[0]!==undefined&&selectedIds[1]===undefined){
        for(let i=0;i< this.props.data.length;i++){
            if(data[i]['name']==selectedIds[0]){
                point = data[i]['value']
                break;
            }
        }
    }else{
      point = ''
    }
    showModal({type:Debug_modalTypes.MODIFY_POINT_MODAL,props:{value:point}})
  }

  // 显示修改点公式配置模态框
  modifyPointFormula(info){
    const {selectedIds,showModal,data}  = this.props
    if (JSON.parse(localStorage.getItem('userData')).role < JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
      Modal.info({
        title: '提示',
        content: '用户权限不足'
      })
      return
    }
    if(!selectedIds.length) {
      Modal.error({
        title: '错误提示',
        content: "请选中一个点查看！"
      })
      return null
    }
  
    showModal({type:Debug_modalTypes.MODEL_FORMULA_MODAL,props:{addr:info.addr,desc:info.description}})
  }

  // 显示修改点注释配置模态框
  modifyPointDescription(addr){
      const {selectedIds,showModal,data}  = this.props
      if (JSON.parse(localStorage.getItem('userData')).role < JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
        Modal.info({
          title: '提示',
          content: '用户权限不足'
        })
        return
      }
      http.post('/tool/evalStringExpression',{
        "str": addr,
        "debug":1
      }).then(data=>{
        if(data.err>=0){
          Modal.info({
            title: '测试信息',
            content: (
              <div>
                <p>计算结果为：{data.data}</p>
                <TextArea autoSize={{ minRows: 9, maxRows: 18 }} value={data.debugInfo}/>

              </div>
            )
          })
        }else{
          Modal.error({
            title: '错误提示',
            content: '通讯失败,请稍后再试'
          })
        }
      })
  }

  //刷新数据
  refreshData(){
    this.props.reloadTable()
  }

  clearSearchValue(){
    this.props.saveKeyWordList([])
  }

  saveKeyWordList(value){
    let keyWordList = value.split(' ')
    this.props.saveKeyWordList([])
  }


  // 展示添加监控点位模态框
  showAddModal = () => {
    const {selectedIds} = this.props
    if(!selectedIds.length) return (
      Modal.error({
        title: '错误提示',
        content: "请选中一个点查看！"
      })
    )
    this.setState({ addModalVisible : true })
  }

  hideModal = () => this.setState({addModalVisible : false})

  render() {

    const {
      rowKey,
      data,
      pagination,
      onPaginationChange,
      loading,
      reloadTable,
      onSelectChange,
      selectedIds,
      hideModal,
      tableLoading,
      keyWordList
    } = this.props
    const prop = {
      name: 'file',
      action: `${appConfig.serverUrl}/data/importHistoryDataFile`,
      headers: {
        authorization: 'authorization-text',
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          // console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          Modal.error({
            title: '错误提示',
            content: "后台接口-接口返回失败！"
          })
        }
      },
    };
    return (
      <div className={s['container']}>
        <div className={s['header']} style={headerStyle}>
          <Button onClick={this.modifyPointValue} style={btnStyle}>修改点值</Button>
          <Button onClick={this.showHistoryModal} style={btnStyle}>趋势</Button>
          <Button onClick={this.refreshData} style={btnStyle}>刷新</Button>
          <Button onClick={this.showPointInfo} style={btnStyle}>点位详细信息</Button>
          <Button className={s['btn-jiankong']} style={btnStyle} onClick={this.showAddModal}>添加到监控列表</Button>
          <Search style={{marginRight:24,marginTop:8,width:200,float:'right'}} onSearch={this.searchList} className={toggleSearchClass} placeholder='点名'/>
          {
            JSON.parse(localStorage.getItem('userData')).role < JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level?
              <Button style={btnStyle} onClick={e=>{Modal.info({title: '提示',content: '用户权限不足'})}}>
                <Icon type="upload"/>历史数据导入
              </Button>
              :
              <Upload {...prop}  directory>
                <Button style={btnStyle}>
                  <Icon type="upload"/>历史数据导入
                </Button>
              </Upload>
          }
        </div>
        <PageRealDataTable
          rowKey={rowKey}
          data={data}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          loading={loading}
          reloadTable={reloadTable}
          selectedIds={selectedIds}
          onSelectChange={onSelectChange}
        />
        <ModifyPointView
          modal={this.props.modal}
          hideModal={hideModal}
          data={data}
          selectedIds={selectedIds}
          reloadTable={reloadTable}
          tableLoading={tableLoading}
          pointValue={this.state.pointValue}
        />
         <ModifyPointFormulaView
          modal={this.props.modal}
          hideModal={hideModal}
          data={data}
          selectedIds={selectedIds}
          reloadTable={reloadTable}
          tableLoading={tableLoading}
          pointValue={this.state.pointValue}
          showPointInfo={this.showPointInfo}
        />
        <HistoryModalView
          modal={this.props.modal}
          hideModal={hideModal}
          data={{values:selectedIds}}
        />
        <AddToWatchModalView
          visible = {this.state.addModalVisible}
          hideModal={this.hideModal}
          selectedIds={selectedIds}
        />
        <Modal
          title="点位详细信息"
          visible={this.state.infoVisible}
          onCancel={this.infoCancel}
          footer={null}
          width={450}
          maskClosable={false}
        >
            <p> 点名：{this.state.pointName}</p>
            <p>点类型：{this.state.info.sourceType}</p>
            {
              this.state.info.sourceType == "vpoint" ?
                <p>注释：{this.state.info.description}</p>
              :
                <p>注释：{this.state.info.description}</p>
            }
            {
              this.state.info.sourceType == "vpoint" ?
              <div>
                脚本配置：
                <div style={{height:"180px",marginBottom:"4px",overflowY:"scroll"}}>
      
                  <TextArea readOnly autoSize={{ minRows: 9, maxRows: 18 }} value={this.state.info.addr}/>

                </div>
          
                    <Button onClick={()=>{this.modifyPointFormula(this.state.info)}} style={btnStyle}>修改公式</Button>
                  
                  <p style={{marginTop:"4px"}}>
                    <Button onClick={()=>this.modifyPointDescription(this.state.info.addr)} style={btnStyle}>测试公式</Button>
                  </p> 
              </div>
                
              :
              <p>脚本配置：{this.state.info.addr}</p>
            }
            <p>参数2：{this.state.info.param2}</p>
            <p>参数3：{this.state.info.param3}</p>
            <p>参数4：{this.state.info.param4}</p>
            <p>参数5：{this.state.info.param5}</p>
            <p>参数6：{this.state.info.param6}</p>
            <p>单位：{this.state.info.unit}</p>
            <p>high：{this.state.info.high}</p>
            <p>highhigh：{this.state.info.high}</p>
            <p>low：{this.state.info.low}</p>
            <p>lowlow：{this.state.info.lowlow}</p>
         
        </Modal>
      </div>
    )
  }
}

export default DataManagePage