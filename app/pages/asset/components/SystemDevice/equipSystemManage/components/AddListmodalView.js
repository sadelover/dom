import React from 'react'
import {Modal,Button,Form,Upload,Icon,Col,Input,Select,Table,Tabs,Popconfirm,DatePicker} from 'antd'
import {modalTypes} from '../../../../../../common/enum'
import 'moment/locale/zh-cn';

//封装表单域
const FormItem = Form.Item
//封装了下拉
const Option  = Select.Option
//封装了 tab
const TabPane = Tabs.TabPane;
const {TextArea} = Input
//设置样式

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
const formTopicLayout = {
    labelCol:{
        xs:{span:24},
        sm:{span:12}
    },
    wrapperCol:{
        xs:{span:24},
        sm:{span:12}
    }
} 
const AddListModalView = Form.create()(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state = {};       
            this.onOk = this.onOk.bind(this)
        }
        normFile = (e) => {
            console.log('Upload event:', e);
            if (Array.isArray(e)) {
              return e;
            }
            return e && e.fileList;
        }
        onOk(e){
            console.log(this.props.form.getFieldValue('upload'))
            let _this = this
            e.preventDefault();
            this.props.form.validateFields((err, values) => {
              if (!err) {
                _this.props.addList(values)
                this.props.hideModal()
              }
            });
            this.props.form.resetFields()
          }
        shouldComponentUpdate(nextProps,nextState){
            return true;
        }

        render(){      
            const { dataSource,radio,select,judge,score,tab} = this.state
            const columns = this.columns
            const {form,hideModal,modal,table,reloadTable,addList} = this.props
            const {getFieldDecorator} = form
            //是否显示新增页面的弹窗
            let visible = modalTypes.EQUIPSYSTEM_MODAL=== modal.type ? true : false
            
            return (
                <Modal 
                    title='新建'
                    visible={visible}
                    onCancel={hideModal}
                    onOk={this.onOk}
                    width={800}
                >
                    <Form>
                        <FormItem
                                {...formItemLayout}
                                label='系统名称'
                                >
                                {
                                    getFieldDecorator('system_name',{
                                        rules : [{required : true,message:'请填主机名称'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='描述'
                            >
                                {
                                    getFieldDecorator('system_desc',{
                                        rules : [{required : true,message:'请填写描述内容'}]
                                    })(<TextArea/>)
                                }
                        </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
)

export default AddListModalView