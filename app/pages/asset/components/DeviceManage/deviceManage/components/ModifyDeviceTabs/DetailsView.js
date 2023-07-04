import React from 'react'
import {Modal,Button,Form,Input,Select,Upload,Icon,Table,icon,Row,Col,DatePicker} from 'antd'

import moment from 'moment';
moment.locale('zh-cn');
//import EditableTableView from './EditableTableView'
const dateFormat = 'YYYY/MM/DD HH/mm/ss';
const FormItem = Form.Item
const Option  = Select.Option

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  
  

const DetailsView = Form.create({
    mapPropsToFields : function(props){
        let table = props.table
        let modifyData = table.searchData.filter( (item)=>{
            if(item.id == table.maintenId) return item
        })
        let modifyDict = modifyData.length && modifyData[0]
        
        //使用obj保存变更后的属性类型
        let obj = {}
        
        if(modifyData.length){
            
        }

        return {
            name : {
                value : modifyDict.name
            },
            deviceName : {
                value : modifyDict.deviceName
            },
            createTime : {
                value : modifyDict.createTime
            },
            status : {
                value : modifyDict.status
            },
            result_status : {
                value : modifyDict.result_status
            },
            description : {
                value : modifyDict.description
            },
            operation_instruction : {
                value : modifyDict.operation_instruction
            },
            maintain_result : {
                value : modifyDict.maintain_result
            },
            attention : {
                value : modifyDict.attention
            }
            
        }
    }
}





)(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state={
                visible:true,
                selIds:[],
                beginTime:"",
                result:"E"
            }
            
            this.onOk = this.onOk.bind(this)
            this.onSelectChange=this.onSelectChange.bind(this)
            this.onChange = this.onChange.bind(this)
            this.hide = this.hide.bind(this)
            this.onsubmit = this.onsubmit.bind(this)

        }
        
        
        shouldComponentUpdate(nextProps,nextState){//?????
            return true;
        }
        
        // componentWillReceiveProps(nextProps){
        //     if(this.props.visible!=nextProps.visible){
        //         this.setState({
        //             visible:false
        //         })
        //     }
        // }

        

        onsubmit(){
            let id = this.props.table.maintenId;
            let result = this.props.form.getFieldValue('operate_time');
            let describe = this.props.form.getFieldValue('describe')?this.props.form.getFieldValue('describe'):"";
            this.props.examineFunction(id,result,describe);
            this.props.onListSearch();
            this.props.hideExamine();
        }

        onSelectChange(selIds){
            this.setState({
                selIds:selIds
             })
        }

        // hendleChange(value){
        //     switch(value){
        //         case "E":this.setState({result:"E"});break;
        //         case "F":this.setState({result:"F"});break;
        //     }
        // }

        onChange(date,dateString) {
            this.setState({
                beginTime: dateString
            })
        }

        hide(){
            this.props.hideDetails()
        }

        //点击提交表单时触发
        onOk(e){
            const {form} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    this.props.hideDetails()
                }
            })
            this.props.form.resetFields();
        }

        
        render(){
            
            let selIds=this.state.selIds
            const {form,
                rowKey,
                modal,
                table,
                hideModal,
                selectedIds,
                onSelectChange, 
                pagination, 
                onShowSizeChange, 
                onPaginationChange,
                addFunction,
                visible
            } = this.props
            const {getFieldDecorator} = form
            //let visible = modalTypes.ADD_MODAL === modal.type ? true : false
            return (
                <Modal
                    title='维修审核'
                    visible={table.detailsData?table.detailsData:false}
                    onCancel={this.hide}
                    onOk={this.onOk}
                    
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label='当前保养任务'
                            >
                                {
                                    getFieldDecorator('name',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='设备名称'
                            >
                                {
                                    getFieldDecorator('deviceName',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='维修时间'
                            >
                                {
                                    getFieldDecorator('createTime',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                                <FormItem
                            {...formItemLayout}
                            label='维修状态'
                            >
                                {
                                    getFieldDecorator('status',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                                <FormItem
                            {...formItemLayout}
                            label='结果状态'
                            >
                                {
                                    getFieldDecorator('result_status',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='详细描述'
                            >
                                {
                                    getFieldDecorator('description',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='维修说明（步骤）'
                            >
                                {
                                    getFieldDecorator('operation_instruction',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='啥啥啥'
                            >
                                {
                                    getFieldDecorator('maintain_result',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='注意事项'
                            >
                                {
                                    getFieldDecorator('attention',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
)

export default DetailsView