import React from 'react'
import { Button,Radio,Input,Modal,Form,Table,message,Tabs,Select,Icon,Upload} from 'antd'
import s from './TemplateManageView.css'
import http from '../../../../../../common/http'
import {modalTypes} from '../../../../../../common/enum'
import { downloadUrl } from '../../../../../../common/utils'
import appConfig from '../../../../../../common/appConfig'

//封装表单域
const FormItem = Form.Item
//封装了下拉
const Search = Input.Search;

const Option  = Select.Option;

const RadioGroup = Radio.Group;

const formItemLayout = {
    labelCol: {
      xs: { span: 24},
      sm: { span:6},
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12},
    },
};
const ParemeterAddModalView = Form.create()(
    class extends React.Component{
        constructor(props){
            super(props)
            this.comfirm = this.comfirm.bind(this)
        }
        comfirm(){
            const {reload} = this.props
            let _this = this
            this.props.form.validateFields((errors, values) => {
                if(!errors){
                    http.post('/equipment/addParamTmpl',{
                        projectId:0,
                        "tmpl_def_id":_this.props.table.template_id,
                        "paramName":values.paramName,
                        "paramCode":values.paramCode,
                        "maxValue":values.maxValue,
                        "minValue":values.minValue,
                        "paramUnit":values.paramUnit,
                        "sort_num":values.sort_num
                    }).then(
                        data=>{
                            if(data.status){
                                reload()
                                _this.props.ParemeterAddMoadal(false)
                                _this.props.form.resetFields()
                            }
                        }
                    )       
                }
            });          
        }
        render(){      
            const{modal,visible,ParemeterAddMoadal}=this.props
            const {getFieldDecorator} = this.props.form
            return (
                <Modal 
                    zIndex={10000} 
                    title='新增模块'
                    onCancel={()=>{ParemeterAddMoadal(false)}}
                    visible={visible}
                    width={700}   
                    onOk={this.comfirm}
                >
                    <Form>
                        <FormItem
                                {...formItemLayout}
                                label='参数中文称'
                                >
                                {
                                    getFieldDecorator('paramName',{
                                        rules : [{required : true,message:'请填写中文属性'}]
                                    })(<Input  />)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='字段英文称'
                                >
                                {
                                    getFieldDecorator('paramCode',{
                                        rules : [{required : true,message:'请填写英文属性'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='最大值'
                                >
                                {
                                    getFieldDecorator('maxValue',{
                                        rules : [{required : true,message:'请填写最大值'}]
                                    })(<Input style={{width:'100px'}} />)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='最小值'
                                >
                                {
                                    getFieldDecorator('minValue',{
                                        rules : [{required : true,message:'请填写最小值'}]
                                    })(<Input style={{width:'100px'}} />)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='单位'
                                >
                                {
                                    getFieldDecorator('paramUnit',{
                                        rules : [{required : true,message:'请填写单位'}]
                                    })(<Input style={{width:'100px'}} />)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='排序编码'
                                >
                                {
                                    getFieldDecorator('sort_num',{
                                        rules : [{required : true,message:'请填写排序编码'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
)
const ParemeterModfifyModalView = Form.create()(
    class extends React.Component{
        constructor(props){
            super(props)
            this.state = {
                data:[]
            }
            this.comfirm = this.comfirm.bind(this)
        }
        componentWillReceiveProps(nextProps){
            if(this.props.filterdata!=nextProps.filterdata){
                this.setState({
                    data:nextProps.filterdata
                })
                console.log(this.state.data)
            }
        }
        comfirm(){
            const {reload} = this.props
            let  paramName = this.props.form.getFieldValue('paramName') 
            let  paramCode = this.props.form.getFieldValue('paramCode')  
            let  sort_num = this.props.form.getFieldValue('sort_num')
            let  maxValue = this.props.form.getFieldValue('maxValue')
            let  minValue = this.props.form.getFieldValue('minValue')
            let  paramUnit = this.props.form.getFieldValue('paramUnit')
            let This = this
            http.post('/equipment/updateParamTmpl',{
                projectId:0,
                "id":This.state.data[0].id,
                "tmpl_def_id":This.props.table.template_id,
                "paramName":paramName,
                "maxValue":maxValue,
                "minValue":minValue,
                "paramUnit":paramUnit,
                "paramCode":paramCode,
                "sort_num":sort_num
            }).then(
                data=>{
                    if(data.status){
                     reload()
                     This.props.ParemeterModifyMoadl(false)
                     This.props.form.resetFields()
                    }
                }
            )               
        }
        render(){      
            const{modal,visible,ModifyModal,filterdata,ParemeterModifyMoadl}=this.props
            const {getFieldDecorator} = this.props.form
            const {data} = this.state
            let paramName,paramCode,sort_num,maxValue,minValue,paramUnit = ''            
            if(data.length>0){
                paramName = data[0].paramName
                paramCode = data[0].paramCode
                sort_num = data[0].sort_num
                maxValue = data[0].maxValue
                minValue = data[0].minValue
                paramUnit = data[0].paramUnit
            }
            return (
                <Modal 
                    zIndex={10000} 
                    title='编辑模块'
                    onCancel={()=>{ParemeterModifyMoadl(false)}}
                    visible={visible}
                    width={700}   
                    onOk={this.comfirm}
                >
                    <Form>
                        <FormItem
                                {...formItemLayout}
                                label='参数中文称'
                                >
                                {
                                    getFieldDecorator('paramName',{
                                        initialValue:paramName,
                                        rules : [{required : true,message:'请填写中文属性'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='字段英文称'
                                >
                                {
                                    getFieldDecorator('paramCode',{
                                        initialValue:paramCode,
                                        rules : [{required : true,message:'请填写英文属性'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='最大值'
                                >
                                {
                                    getFieldDecorator('maxValue',{
                                        initialValue:maxValue,
                                        rules : [{required : true,message:'请填写最大值'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='最小值'
                                >
                                {
                                    getFieldDecorator('minValue',{
                                        initialValue:minValue,
                                        rules : [{required : true,message:'请填写最小值'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='单位'
                                >
                                {
                                    getFieldDecorator('paramUnit',{
                                        initialValue:paramUnit,
                                        rules : [{required : true,message:'请填写单位'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='排序编码'
                                >
                                {
                                    getFieldDecorator('sort_num',{
                                        initialValue:sort_num,
                                        rules : [{required : true,message:'请填写排序编码'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
)

class ParemeterModal extends React.Component{
    constructor(props){
        super(props)
        this.state={
            datasource:[],
            data:[],
            loading:false,
            selectedIds:[],
            type:''
        }
        this.search = this.search.bind(this)
        this.onclick = this.onclick.bind(this)
        this.delete = this.delete.bind(this)
        this.reload = this.reload.bind(this)
        this.modify = this.modify.bind(this)
        this.exportTemplateParam = this.exportTemplateParam.bind(this)
    }
    onclick(selectedRowKeys,selectedRows){
        this.setState({
            selectedIds:selectedRowKeys,
            data:selectedRows
        })
    }
    //刷新方法
    reload(){
        const {ParemeterLoading,ParemeterData} = this.props
        ParemeterLoading(true)
        http.post('/equipment/searchParamTmpl',{
            projectId:0,
            "pageSize":10,
            "targetPage":1,
            "searchKey":'',
            "tmpl_def_id":this.props.table.template_id
        }).then(
            data=>{
                if(data.status){
                    ParemeterData(data)
                    this.setState({
                        selectedIds:[]
                    })
                    ParemeterLoading(false)
                }
            }
        ).catch(
            error=>{
                console.log("出错啦")
                this.setState({
                    selectedIds:[]
                })
                ParemeterLoading(false)
            }
        )
    }
    //查询方法
    search(e){
        const {ParemeterLoading,ParemeterData} = this.props
        const {searchValue,} = this.state
        let arr = [e,this.props.table.template_id]
        ParemeterLoading(true)
        http.post('/equipment/searchParamTmpl',{
            projectId:0,
            "pageSize":10,
            "targetPage":1,
            "searchKey":arr[0],
            "tmpl_def_id":Number(arr[1])
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
    }
    //删除数据
    delete(){
        const {ParemeterLoading,ParemeterData} = this.props
        let _this = this
        switch(_this.state.selectedIds.length){
            case 0:
            Modal.confirm({
                title:'请至少选中一条数据'
            })
                break;
            default:
            Modal.confirm({
                title : '确定要删除选中数据吗？',
                content : '点击确认后数据将无法找回。',
                onOk(){
                    ParemeterLoading(true)
                    http.post('/equipment/delParamTmpl',{
                        "ids":_this.state.selectedIds
                    }).then(
                        data=>{
                            _this.reload()
                            ParemeterLoading(false)
                        }
                    ).catch(
                        error=>{
                            console.log("出错啦")
                            ParemeterLoading(false)
                        }
                    ) 
                }
            })         
        }
    }
    //修改
    modify(){
        switch(this.state.selectedIds.length){
            case 0:
            Modal.confirm({
                title:'请至少选中一条数据'
            })
                break;
            case 1:
                this.props.ParemeterModifyMoadl(true)
                break;
            default:
            Modal.confirm({
                title:'只能编辑一条数据'
            })
        }
    } 
    
    exportTemplateParam(){
        http.get('/equipment/exportTemplateParam').then(
            res=>{
                if(res.err == 0){
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/asset_template/${res.data}`)
                }else{
                    Modal.error({
                        title: '错误提示',
                        content: "后台接口-下载接口请求失败！"+res.msg
                    })
                }
            }
        ).catch(
            err=>{
                Modal.error({
                    title: '错误提示',
                    content: "后台接口-下载接口请求失败！"
                })
            }
        )
    }

    render(){      
        const {hideModal,modal,showModal,table,ParemeterAddMoadal,ParemeterModifyMoadl} = this.props
        const{datasource,loading,data} = this.state
        //是否显示新增页面的弹窗
        let visible = modalTypes.PARAMETER_MODAL === modal.type ? true : false

        let _this = this
        const prop = {
            name: 'file',
            action: `${appConfig.serverUrl}/equipment/importParamTmpl`,
            data:{
                tmplId: this.props.table.template_id
            },
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList);
                    console.log(table)
                }
                if (info.file.status === 'done') {
                    _this.reload()
                } else if (info.file.status === 'error') {
                    Modal.error({
                        title: '错误提示',
                        content: "后台接口-接口请求失败！"
                    })
                }
            },
        }

        return (
            <Modal 
                title={`${table.template_name}-参数模板`}
                visible={visible}
                onCancel={hideModal}
                onOk={hideModal}
                width={1000}                
            >
            <Search className={s['btn-common']} placeholder='输入属性的中文名字' onSearch={this.search} style={{width:150}} />
            <Button type='primary' icon="plus" className={s['btn-common']} onClick={()=>{ParemeterAddMoadal(true)}}>增加</Button>
            <Button icon='close' className={s['btn-common']} onClick={this.delete} >删除</Button>
            <Button icon='edit' className={s['btn-common']} onClick={this.modify} >编辑</Button>
            <Upload {...prop} showUploadList={false} >
                <Button className={s['btn-common']}><Icon type="upload" />从Execl导入</Button>
            </Upload>
            <Button className={s['btn-common']} onClick={this.exportTemplateParam}><Icon type="download" />下载示范参数模板</Button>
            <div className={s['table-wrap']} > 
            <Table
                bordered={true}
                dataSource={table.parameterdata.data}
                loading={table.parameterloading}
                rowSelection={{
                     selectedRowKeys:this.state.selectedIds,
                    onChange:this.onclick
                }}
                rowKey='id'
                columns={[
                {title:'参数中文称',dataIndex: 'paramName',key:'paramName',width: 80},
                { title:'字段英文称', dataIndex: 'paramCode',key:'paramCode',width: 80},      
                { title:'最大值', dataIndex: 'maxValue',key:'maxValue',width: 80},      
                { title:'最小值', dataIndex: 'minValue',key:'minValue',width: 80},      
                { title:'单位', dataIndex: 'paramUnit',key:'paramUnit',width: 80},                      
                { title:'排序码', dataIndex: 'sort_num',key:'sort_num',width: 80}, 
                                     
                ]}
            /> 
            <ParemeterAddModalView
            modal={modal}
            visible ={table.parameter}
            ParemeterAddMoadal={ParemeterAddMoadal}
            reload={this.reload}
            table={table}
            />
            <ParemeterModfifyModalView
            modal={modal}
            ParemeterModifyMoadl={ParemeterModifyMoadl}
            visible ={table.parametermodify}
            filterdata = {data}
            reload = {this.reload}
            table={table}
            />
            </div> 
            </Modal>
        )
    }
}
export default ParemeterModal  