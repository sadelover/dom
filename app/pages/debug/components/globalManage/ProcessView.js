import React from 'react'
import {Table,message,Button,Modal,Form,Input} from 'antd'
import s from './ProcessView.css'
import http from '../../../../common/http'

const FormItem = Form.Item

let toggleTableClass,btnStyle,toggleModalClass;
if(localStorage.getItem('serverOmd')=="persagy"){
    btnStyle={
        background:"rgba(255,255,255,1)",
        border:'1px solid rgba(195,198,203,1)',
        color:"rgba(38,38,38,1)",
        borderRadius:'4px',
        fontSize:"14px",
        fontFamily:'MicrosoftYaHei'
      }
    toggleTableClass = 'persagy-table-tbody persagy-detailTable-thead persagy-pagination-item persagy-table-placeholder';
    toggleModalClass = 'persagy-modal persagy-dashBoardLine-form'
  }

const columns = [{
    title : '目录名称',
    dataIndex : 'directoryName',
    key : 'directoryName'
},{
    title : '进程名',
    dataIndex : 'processName',
    key : 'processName'
}]


class AddProcessModalForm extends React.Component{
    constructor(props){
        super(props)
    }
    
    handleOk = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.hideModal()
                this.props.addProcess(values)
            }
        });
    }

    render(){
        const {visible,hideModal,form}  =this.props
        const {getFieldDecorator} = form
        return (
            <Modal
                className={toggleModalClass}
                onCancel={hideModal}
                visible={visible}
                maskClosable={false}
                onOk={this.handleOk}
            >
                <FormItem label="目录名称">
                    {getFieldDecorator('directory', {
                        initialValue: "",
                        rules: [{required : true,message:'请填写目录名称' }],
                    })(<Input />)}
                </FormItem>
                <FormItem label="进程名称">
                    {getFieldDecorator('processName', {
                        initialValue: "",
                        rules: [{required : true,message:'请填写目录名称' }],
                    })(<Input />)}
                </FormItem>
            </Modal>
        )
    }

}

const AddProcessModal = Form.create({})(AddProcessModalForm)

/**
 * 进程管理父组件
 * 
 * @class ProcessView
 * @extends {React.Component}
 */
class ProcessView extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            dataSource : [],
            loading : false,
            selectedRowKeys:[],
            visible : false
        }
    }

    getPointList = () => {
        var _this = this
        this.setState({loading:true})
        http.post('/process/getProcessList',{})
            .then(
                data => {
                    if(data.status){
                        _this.setState({loading:false,dataSource:data.data})
                    }else{
                        Modal.error({
                            title: '错误提示',
                            content: "后台接口-"+data.msg
                        })
                        _this.setState({loading:false,dataSource:[]})
                    }
                }
            ).catch(
                err => {
                    Modal.error({
                        title: '错误提示',
                        content: "后台接口-请求失败"
                    })
                    _this.setState({loading:false,dataSource:[]})
                }
            )
    }

    componentDidMount(){
        this.getPointList()
    }

    handleSelect = (selectedRowKeys) => {
        this.setState({selectedRowKeys})
    }

    addProcess = (values) => {
        var _this = this
        // console.log(values)
        http.post('/process/addProcessName',{
            "directory":values.directory,
            "processName" : values.processName
        }).then(
            data => {
                if(data.status){
                    _this.getPointList()
                }else{
                    Modal.error({
                        title: '错误提示',
                        content: "后台接口-接口返回"+data.msg
                    })
                }
            }
        )
    }

    delProcess = () => {
        var _this = this
        if (!this.state.selectedRowKeys.length){
            return (
                Modal.error({
                    title: '错误提示',
                    content: "请选中一个点删除!"
                })
            )
        }
        Modal.confirm({
            title : '提示框',
            content : '是否确认删除守护进程?删除后将无法恢复。',
            onOk(){
                http.post('/process/delProcessName',{
                    "processList":_this.state.selectedRowKeys
                }).then(
                    data=>{
                        if(data.status){
                            _this.getPointList()
                        }else{
                            Modal.error({
                                title: '错误提示',
                                content: "后台接口-请求返回"+data.msg
                            })
                        }
                    }
                )
            }
        })
    }

    showModal =()=>{
        this.setState({visible : true})
    }
    
    hideModal = () => {
        this.setState({visible : false})
    }

    render(){
        return(
            <div>
                <div className={s['header']} >
                    <Button onClick={this.showModal} style={btnStyle}> 增加守护进程 </Button>
                    <Button onClick={this.delProcess} style={btnStyle}> 删除守护进程 </Button>
                </div>
                <Table
                    className={toggleTableClass}
                    dataSource={this.state.dataSource}
                    columns={columns}
                    pagination={false}
                    loading={this.state.loading}
                    rowKey='processName'
                    rowSelection={{
                        selectedRowKeys:this.state.selectedRowKeys,
                        onChange : this.handleSelect
                    }}
                />
                <AddProcessModal
                    visible = {this.state.visible}
                    hideModal = {this.hideModal}
                    addProcess = {this.addProcess}
                />
            </div>
        )
    }
}

export default ProcessView