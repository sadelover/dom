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

  
  

const ExamineModalView = Form.create()(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state={
                visible:true,
                selIds:[],
                beginTime:""
            }
            
            this.onOk = this.onOk.bind(this)
            this.onSelectChange=this.onSelectChange.bind(this)
            this.onChange = this.onChange.bind(this)
            this.hide = this.hide.bind(this)
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

        onSelectChange(selIds){
            this.setState({
                selIds:selIds
             })
        }

        onChange(date,dateString) {
            this.setState({
                beginTime: dateString
            })
        }

        hide(){
            this.props.hide()
        }

        //点击提交表单时触发
        onOk(e){
            const {hideModal,form,addFunction,searchRecord} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    this.props.hide()
                    addFunction(values,this.state.beginTime)
                    searchRecord();
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
                    title='添加投产记录'
                    visible={table.hideData?table.hideData:false}
                    onCancel={this.hide}
                    onOk={this.onOk}
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label='投产人'
                            >
                                {
                                    getFieldDecorator('responsible_name',{
                                        rules : [{required : true,message:'请填写投产人'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='投产时间'
                            >
                                {
                                    getFieldDecorator('operate_time',{
                                        rules : [{required : true,message:'请填培训时间'}]
                                    })(<DatePicker  onChange={this.onChange}  format={dateFormat} showTime/>)
                                }
                        </FormItem>   
                        <FormItem
                            {...formItemLayout}
                            label='详细描述'
                            >
                                {
                                    getFieldDecorator('describe',{
                                        initialValue : '请填写详细描述'
                                    })(<Input type="textarea"/>)
                                }
                        </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
)

export default ExamineModalView