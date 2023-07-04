import React from 'react'
import {Modal,Button,Form,Input,Select,Icon,Upload,Table,Row,Col,DatePicker} from 'antd'
import moment from 'moment';
moment.locale('zh-cn');

const FormItem = Form.Item
const Option  = Select.Option
const dateFormat = 'YYYY/MM/DD';

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


const ModifyModalView = Form.create({
    mapPropsToFields : function(props){
        let table = props.table
        let data = table.recordData[props.selIds];
        let modifyData = table.recordData.filter( (item)=>{
            if(item.id == data?data.id:null) return item
        })
        let modifyDict = modifyData.length && modifyData[0]
        
        //使用obj保存变更后的属性类型
        let obj = {}
        
        if(modifyData.length){
            
        }

        return {
            responsible_name : {
                value : modifyDict.responsible_name,
            },
            describe : {
                value : modifyDict.describe
            }
            
        }
    }
})(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            
            this.state={
                fileList:[],
                selIds:[],
                beginTime:''
            }

            this.onOk = this.onOk.bind(this)
            this.onSelectChange=this.onSelectChange.bind(this)
            this.onChange = this.onChange.bind(this)
            this.hide = this.hide.bind(this);
        }
        
        componentWillMount(){
            
        }

        hide(){
            this.props.hideModify()
        }

        shouldComponentUpdate(nextProps,nextState){//?????
            return true;
        }

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

        //点击提交表单时触发
        onOk(e){
            const {hideModal,form,modifyFunction, searchRecord} = this.props
            const data = this.props.table.recordData[this.props.selIds];
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    this.props.hideModify()
                    modifyFunction(values,this.state.beginTime,data.id)
                    searchRecord()
                }
            })
            
        }

        
        /**
         * 渲染组件
         * 
         * @returns 
         */
        render(){
            const This = this 
            const {form,
                fileData,
                hideModal,
                modal,
                selectedIds,
                onSelectChange,
                getFileList,
                rowKey, 
                pagination, 
                onShowSizeChange, 
                onPaginationChange,
                table,
                visible
            } = this.props
            const {getFieldDecorator} = form
            let selIds=this.state.selIds
            
            
            return (
                <Modal
                    title='修改培训信息'
                    visible={table.showData?table.showData:false}
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

export default ModifyModalView