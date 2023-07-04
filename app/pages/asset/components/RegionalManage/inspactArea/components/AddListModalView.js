import React from 'react'
import {Modal,Button,Form,Input,Select} from 'antd'
import {modalTypes} from '../../../../../../common/enum'

const FormItem = Form.Item
const Option  = Select.Option
const { TextArea } = Input;

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


const AddListModalView = Form.create()(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            
            this.onOk = this.onOk.bind(this)
        }
        
        //点击提交表单时触发
        onOk(e){
            const {hideModal,form,addList} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    hideModal()
                    addList(values)
                }
            })
        }
        render(){
            const {form,hideModal,modal} = this.props
            const {getFieldDecorator} = form
            let visible = modalTypes.ADD_INSPACT_AREA_MODAL === modal.type ? true : false
            return (
                <Modal
                    title='区域信息'
                    visible={visible}
                    onCancel={hideModal}
                    onOk={this.onOk}
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label='区域名称'
                            >
                                {
                                    getFieldDecorator('areaName',{
                                        rules : [{required : true,message:'请填写区域名称'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='区域二维码'
                            >
                                {
                                    getFieldDecorator('description',{
                                        initialValue : ''
                                    })(<TextArea rows={2}/>)
                                }
                        </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
)

export default AddListModalView