import React from 'react'
import {message,Modal,Form,Input} from 'antd'

let toggleModalClass;
if(localStorage.getItem('serverOmd')=="persagy"){
  toggleModalClass='persagy-modal persagy-dashBoardLine-form'
}

const FormItem = Form.Item

class AddTabModalForm extends React.Component{
    constructor(props){
        super(props)
    }
    
    handleOk = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.hideModal()
                this.props.createTab(values)
            }
        });
    }

    render(){
        const {visible,hideModal,form}  = this.props
        const {getFieldDecorator} = form
        return (
            <Modal
                className={toggleModalClass}
                onCancel={hideModal}
                visible={visible}
                onOk={this.handleOk}
                maskClosable={false}
            >
                <FormItem label="页面名称">
                    {getFieldDecorator('tabname', {
                        initialValue: "",
                        rules: [{required : true,message:'请填写页面名称',whitespace:true}],
                    })(<Input />)}
                </FormItem>
            </Modal>
        )
    }

}

export default Form.create({})(AddTabModalForm)