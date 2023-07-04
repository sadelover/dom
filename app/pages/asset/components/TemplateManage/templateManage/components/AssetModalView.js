import React from 'react'
import { Button,Radio,Input,Modal,Form,Table,message,Tabs,Select,Icon,Upload} from 'antd'
import s from './TemplateManageView.css'
import http from '../../../../../../common/http'
import {modalTypes} from '../../../../../../common/enum'
import {downloadUrl} from '../../../../../../common/utils'
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
const AssetAddModalView = Form.create()(
    class extends React.Component{
        constructor(props){
            super(props)
            this.comfirm = this.comfirm.bind(this)
        }
        comfirm(){
            const {reload} = this.props
            let This = this
           this.props.form.validateFields((errors, values) => {
                    if(!errors){
                        http.post('/equipment/addAssetTmpl',{
                            projectId:0,
                            "tmpl_def_id":this.props.table.template_id,
                            "cn_name":values.cn_name,
                            "en_name":values.en_name,
                            "ui_type":values.ui_type,
                            "group_num":values.group_num,
                            "sort_num":values.sort_num
                        }).then(
                            data=>{
                                if(data.status){
                                    reload()
                                    This.props.AddMadol(false)
                                    This.props.form.resetFields()
                                }
                            }
                        )       
                    }
            });         
        }
        render(){      
            const{modal,visible,AddMadol}=this.props
            const {getFieldDecorator} = this.props.form
            return (
                <Modal 
                    zIndex={10000} 
                    title='新增模块'
                    onCancel={()=>{AddMadol(false)}}
                    visible={visible}
                    width={700}   
                    onOk={this.comfirm}
                >
                    <Form>
                        <FormItem
                                {...formItemLayout}
                                label='属性中文称'
                                >
                                {
                                    getFieldDecorator('cn_name',{
                                        rules : [{required : true,message:'请填写中文属性'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='属性英文称'
                                >
                                {
                                    getFieldDecorator('en_name',{
                                        rules : [{required : true,message:'请填写英文属性'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='控件类型'
                                >
                                {
                                    getFieldDecorator('ui_type',{
                                        rules : [{required : true,message:'请填写控件类型'}]
                                        })(
                                        <RadioGroup>
                                                <Radio value={1}>单选框</Radio>
                                                <Radio value={2}>多选框</Radio>
                                        </RadioGroup>
                                        )
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='组编码'
                                >
                                {
                                    getFieldDecorator('group_num',{
                                        rules : [{required : true,message:'请填写组编码'}]
                                    })(<Input/>)
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
const AssetModfifyModalView = Form.create()(
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
            let  cn_name = this.props.form.getFieldValue('cn_name') 
            let  en_name = this.props.form.getFieldValue('en_name') 
            let  ui_type = this.props.form.getFieldValue('ui_type') 
            let  group_num = this.props.form.getFieldValue('group_num') 
            let sort_num = this.props.form.getFieldValue('sort_num') 
            let This = this
            http.post('/equipment/updateAssetTmpl',{
                projectId:0,
                "id":This.state.data[0].id,
                "tmpl_def_id":This.props.table.template_id,
                "cn_name":cn_name,
                "en_name":en_name,
                "ui_type":ui_type,
                "group_num":group_num,
                "sort_num":sort_num
            }).then(
                data=>{
                    if(data.status){
                     reload()
                     This.props.ModifyModal(false)
                     This.props.form.resetFields()
                    }
                }
            )               
        }
        render(){      
            const{modal,visible,ModifyModal,filterdata}=this.props
            const {getFieldDecorator} = this.props.form
            const {data} = this.state
            let cn_name,en_name,ui_type,group_num,sort_num = ''            
            if(data.length>0){
                let newData = data.map(row=>{
                    switch(row['ui_type']){
                        case 'text':
                            row['ui_type'] = 1
                            break;
                        case 'textarea':
                            row['textarea'] = 2 
                            break;
                        default:
                            break;
                    }
                    return row;
                })
                cn_name = newData[0].cn_name
                en_name = newData[0].en_name
                ui_type = newData[0].ui_type
                group_num = newData[0].group_num
                sort_num = newData[0].sort_num
            }
            return (
                <Modal 
                    zIndex={10000} 
                    title='编辑模块'
                    onCancel={()=>{ModifyModal(false)}}
                    visible={visible}
                    width={700}   
                    onOk={this.comfirm}
                >
                    <Form>
                        <FormItem
                                {...formItemLayout}
                                label='属性中文称'
                                >
                                {
                                    getFieldDecorator('cn_name',{
                                        initialValue:cn_name,
                                        rules : [{required : true,message:'请填写中文属性'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='属性英文称'
                                >
                                {
                                    getFieldDecorator('en_name',{
                                        initialValue:en_name,
                                        rules : [{required : true,message:'请填写英文属性'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='控件类型'
                                >
                                {
                                    getFieldDecorator('ui_type',{
                                        initialValue:ui_type,
                                        rules : [{required : true,message:'请填写控件类型'}]
                                    })(<RadioGroup>
                                            <Radio value={1}>单选框</Radio>
                                            <Radio value={2}>多选框</Radio>
                                        </RadioGroup>)
                                }
                        </FormItem>
                        <FormItem
                                {...formItemLayout}
                                label='组编码'
                                >
                                {
                                    getFieldDecorator('group_num',{
                                        initialValue:group_num,
                                        rules : [{required : true,message:'请填写组编码'}]
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
class AssetModalView extends React.Component{
    constructor(props){
        super(props)
        this.state={
            datasource:[],
            data:[],
            selectValue:'',
            loading:false,
            selectedIds:[],
            type:''
        }
        this.search = this.search.bind(this)
        this.onclick = this.onclick.bind(this)
        this.delete = this.delete.bind(this)
        this.reload = this.reload.bind(this)
        this.modify = this.modify.bind(this)
        this.exportTemplateAsset = this.exportTemplateAsset.bind(this)
    }
    componentDidMount(){
        this.reload()
    }
    onclick(selectedRowKeys,selectedRows){
        console.log(this.props)
        this.props.assetSelect(selectedRowKeys)
        this.setState({
            data:selectedRows
        })
    }
    //刷新方法
    reload(){
        const {AssetLoading,AssetData} = this.props
        AssetLoading(true)
        http.post('/equipment/searchAssetTmplList',{
            projectId:0,
            "pageSize":10,
            "targetPage":1,
            "searchKey":'',
            "tmpl_def_id":this.props.table.template_id
        }).then(
            data=>{
                if(data.status){
                    AssetData(data)
                    this.props.assetSelect([])
                    AssetLoading(false)
                }
            }
        ).catch(
            error=>{
                console.log("出错啦")
                AssetLoading(false)
            }
        )
    }
    //查询方法
    search(e){
        const {AssetLoading,AssetData} = this.props
        const {searchValue} = this.state
        let arr = [e,this.props.table.template_id]
        AssetLoading(true)
        http.post('/equipment/searchAssetTmplList',{
            projectId:0,
            "pageSize":100,
            "targetPage":1,
            "searchKey":arr[0],
            "tmpl_def_id":Number(arr[1])
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
    }
    //删除数据
    delete(){
        const {AssetLoading,AssetData,table} = this.props
        let _this = this
        switch(table.assetSelecteds.length){
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
                    AssetLoading(true)
                    http.post('/equipment/delAssetTmpl',{
                        "ids":table.assetSelecteds
                    }).then(
                        data=>{
                            _this.reload()
                            AssetLoading(false)
                        }
                    ).catch(
                        error=>{
                            console.log("出错啦")
                            AssetLoading(false)
                        }
                    ) 
                }
            })         
        }
    }
    //修改
    modify(){
        switch(this.props.table.assetSelecteds.length){
            case 0:
            Modal.confirm({
                title:'请至少选中一条数据'
            })
                break;
            case 1:
                this.props.ModifyModal(true)
                break;
            default:
            Modal.confirm({
                title:'只能编辑一条数据'
            })
        }
    }   
    
    exportTemplateAsset(){
        http.get('/equipment/exportTemplateAsset').then(
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
        const {hideModal,modal,showModal,table,AddMadol,ModifyModal} = this.props
        const{datasource,loading,data} = this.state
        //是否显示新增页面的弹窗
        let visible = modalTypes.ASSET_MODAL === modal.type ? true : false
        let _this = this
        const prop = {
            name: 'file',
            action: `${appConfig.serverUrl}/equipment/importAssetTmpl`,
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
                title={`${table.template_name}-资产模板`}
                visible={visible}
                onCancel={hideModal}
                onOk={hideModal}
                width={1000}                
            >
            <Search className={s['btn-common']} placeholder='输入属性的中文名字' onSearch={this.search} style={{width:150}} />
            <Button type='primary' icon="plus" className={s['btn-common']} onClick={()=>{AddMadol(true)}}>增加</Button>
            <Button icon='close' className={s['btn-common']} onClick={this.delete} >删除</Button>
            <Button icon='edit' className={s['btn-common']} onClick={this.modify} >编辑</Button>
            <Upload {...prop} showUploadList={false} >
                <Button className={s['btn-common']}><Icon type="upload" />从Execl导入</Button>
            </Upload>
            <Button className={s['btn-common']} onClick={this.exportTemplateAsset}><Icon type="download" />下载示范资产模板</Button>
            <div className={s['table-wrap']} > 
            <Table
                bordered={true}
                dataSource={table.assetdata}
                loading={table.assetloading}
                rowSelection={{
                    selectedRowKeys:table.assetSelecteds,
                    onChange:this.onclick
                }}
                rowKey='id'
                columns={[
                {title:'属性中文称',dataIndex: 'cn_name',key:'cn_name',width: 80},
                { title:'属性英文称', dataIndex: 'en_name',key:'en_name',width: 80},
                {title:'控件(1:text,2:textarea)',dataIndex: 'ui_type',key:'ui_type',width: 80},
                {title:'分组编码',dataIndex: 'group_num',key:'group_num',width: 80},
                {title:'排序码',dataIndex: 'sort_num',key:'sort_num',width: 80}            
                ]}
            /> 
            <AssetAddModalView
            modal={modal}
            visible ={table.addvisible}
            AddMadol={AddMadol}
            selectValue={this.state.selectValue}
            reload={this.reload}
            table={table}
            />
            <AssetModfifyModalView
            modal={modal}
            ModifyModal={ModifyModal}
            visible ={table.modifyvisble}
            filterdata = {data}
            reload = {this.reload}
            table={table}
            />
            </div> 
            </Modal>
        )
    }
}
export default AssetModalView  