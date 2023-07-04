import React from 'react'
import { Button , Table , message , Modal} from 'antd';
import s from './ContentView.css'
import cloneDeep from 'lodash.clonedeep'
import http from '../../../../common/http'
import PointModalView from './PointModalView'
import ModifyPointView from './ModifyPointView'

let btnStyle,toggleTableClass;
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
    toggleTableClass = 'persagy-table-tbody persagy-table-thead persagy-pagination-item persagy-table-placeholder';
  } else {
    
  }

const columns = [{
    title: '编号',
    dataIndex: 'id',
    key: 'id',
}, {
    title: '点名',
    dataIndex: 'name',
    key: 'name',
}, {
    title: '点值',
    dataIndex: 'value',
    key: 'value',
}];
class ContentView extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            activeContent : {
                key : '',
                tabName : '',
                watchList : []
            },
            // activeContent : {}
            dataSource : [],
            selectedRowKeys : [],
            pointModalVisible : false,
            modifyModalVisible : false ,
            loading : false,
        }
    }

    //获取点位
    getPointList = (watchList) => {
        this.setState({loading : true})
        var _this = this
        http.post('/get_realtimedata',{"proj":1,"pointList":watchList})
            .then( data=>{
                //获取到数据，并根据tabId来查找localStorage中存储的监控点位,并过滤出数据,更新watchList。
                // console.log(data)
                _this.setState({loading : false, dataSource : data.map( (item,index)=> {item.id = index+1 ;return item } ) })
            }).catch( err=>{
                Modal.error({
                    title: '错误提示',
                    content: "后台接口-请求失败！"
                })
                    _this.setState({loading : false})
            })
    }
    

    componentDidMount(){
        const {activeKey,panes} = this.props
        let activeContent = panes.filter( pane => activeKey === pane.key )[0] || {}
        this.setState({activeContent : activeContent})
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.activeKey !== this.props.activeKey){
            
            var activeContent = nextProps.panes.filter( pane => nextProps.activeKey === pane.key )[0] || {}
            this.setState({activeContent,selectedRowKeys:[] },()=>{this.getPointList(this.state.activeContent.watchList)})
        }
    }

    handleSelect = (selectedRowKeys) => {
        this.setState({ selectedRowKeys })
    }

    addWatchPoints = (willAddPoints) => {
        const {selectedRowKeys,dataSource,activeContent} = this.state
        const {updateLocalStorage,panes,activeKey} = this.props
        // console.log(willAddPoints)
        
        var newWatchList = Array.from(new Set([...activeContent.watchList,...willAddPoints]))
        
        var copyPanes = panes.map(item=>{
            if(item.key === activeKey){
                item.watchList = newWatchList
            }
            return item
        })

        updateLocalStorage(copyPanes)
        this.setState({activeContent:{...activeContent,watchList:newWatchList}},this.getPointList(this.state.activeContent.watchList))
    }

    
    // 删除监控点位
    removeWatchPoints = () => {
        const {selectedRowKeys,dataSource} = this.state
        const {updateLocalStorage,panes,activeKey} = this.props
        let _this = this
        if(!selectedRowKeys.length) {
          return (
            Modal.error({
                title: '错误提示',
                content: "至少选中一个点"
            })
          )
        }
        Modal.confirm({
            title : "确定删除选中监控点位吗？",
            content : '删除后将无法恢复。',
            onOk(){
                // dataSource为当前数据, selectedRowKeys为选中数据的name , name字段为要保存的watchList
                // 过滤出未选中的数据，更新dataSource,并将name字段提取出保存到对应的localStorage
                let copyData = cloneDeep(dataSource);
                // let copyData = dataSource

                // 保留没有选中的
                var i = 0 ,
                    len = selectedRowKeys.length;
                for( ; i < len ;i++){
                    copyData.forEach( (item,index)=>{
                        if(selectedRowKeys[i] === item.name){
                            copyData.splice(index,1)
                        }
                    })
                }

                var modifyList = copyData.map(item=>item.name)

                // 更新的tab页数据
                var copyPanes = panes.map( (item)=>{
                    if(item.key === activeKey){
                        item.watchList = modifyList
                    }
                    return item
                })
                // console.log(copyPanes)
                updateLocalStorage(copyPanes)
                
                var activeContent = copyPanes.filter( pane => activeKey === pane.key )[0] || {}
                _this.setState({activeContent },()=>{_this.getPointList(_this.state.activeContent.watchList)})
            }
        })
    }
    showPointModal = () => {
        this.setState({pointModalVisible : true})
    }

    hidePointModal = () => {
        this.setState({pointModalVisible : false})
    }

    showModifyModal = () => {
        const {selectedRowKeys} = this.state
        if (JSON.parse(localStorage.getItem('userData')).role < JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
            return
        }
        if(!selectedRowKeys.length) {
          return (
            Modal.error({
                title: '错误提示',
                content: "至少选中一个点"
            })
          )
        }
        this.setState({modifyModalVisible:true})
    }

    // 刷新
    refresh = () => {
        this.getPointList(this.state.activeContent.watchList)
    }

    hideModifyModal = () => {
        this.setState({modifyModalVisible:false})
    }
    
    tableLoading = (loading) => {
        this.setState({loading,selectedRowKeys:[]})
    }

    render(){
        if(!this.state.activeContent.key){
            return null;
        }
        return (
            <div className={s['container']} >
                <div className={s['pointWatch']} >
                    <div className={s['header']} >
                        <Button onClick={this.removeWatchPoints} style={btnStyle}>删除监控点</Button>
                        <Button onClick={this.showPointModal} style={btnStyle}>增加监控点位</Button>
                        <Button onClick={this.showModifyModal} style={btnStyle}>修改点值</Button>
                        <Button onClick={this.refresh} style={btnStyle}>刷新</Button>

                    </div> 
                    <Table 
                        className={toggleTableClass}
                        bordered={false}
                        dataSource={this.state.dataSource} 
                        rowKey='name'
                        columns={columns} 
                        footer={null}
                        pagination={true}
                        scroll={{y:400}}
                        loading={this.state.loading}
                        rowSelection={{
                            selectedRowKeys:this.state.selectedRowKeys,
                            onChange : this.handleSelect
                        }}
                    />
                </div>
                <PointModalView
                    hideModal={this.hidePointModal}
                    visible = {this.state.pointModalVisible}
                    onOk={this.addWatchPoints}
                />

                <ModifyPointView
                    visible={this.state.modifyModalVisible}
                    hideModal={this.hideModifyModal}
                    data={this.state.dataSource}
                    selectedIds={this.state.selectedRowKeys}
                    reloadTable={()=>{this.getPointList(this.state.activeContent.watchList)}}
                    tableLoading={this.tableLoading}
                />
            </div>
        )
    }
}

export default ContentView