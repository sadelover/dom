import React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import cx from 'classnames';
import s from './AdminLoginForm.css';

const FormItem = Form.Item;
const AdminLoginForm = Form.create()(React.createClass({
  handleSubmit(e) {
    localStorage.setItem('projectName_en','')
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.accountManageConfig != undefined && this.accountManageConfig.remember_pwd_enable != undefined && this.accountManageConfig.remember_pwd_enable === 0) {
          values.isRemember = false
        }
        this.props.onSubmitAdmin(values);//将填写表单的值传给onSubmit
      }
    });
  },
  render() {
    const { loading, loginInfo, form,accountManageConfig,toggleIsRememeberBtn } = this.props;
    const { getFieldDecorator } = form;
    const { name, pwd, isRemember } = loginInfo;
    let btnStyle,remberStyle;
    if(accountManageConfig.remember_pwd_enable !== 1){
      btnStyle = {
        marginTop:'13px'
      }
      remberStyle = {
        display:'none'
      }
    }
    return (
      <div>
        <Form
        onSubmit={this.handleSubmit}
        className={cx(s['content'], 'login-form-content')}
        id = "site"
      >
        <FormItem
        >
          {getFieldDecorator('name', {
            initialValue: name,
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: "#FFFFFF",marginLeft:"10px",fontSize:"17px"}}/>} onPressEnter={this.handleSubmit} placeholder="Username" />
          )}
        </FormItem>
        <FormItem
          className={s['username']}
        >
          {getFieldDecorator('pwd', {
            initialValue: pwd,
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: "#FFFFFF",marginLeft:"10px",fontSize:"18px" }} />} type="password" onPressEnter={this.handleSubmit} placeholder="Password" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('isRemember', {
            valuePropName: 'checked',
            initialValue: isRemember,
            onChange: this.props.toggleIsRememeberBtn
          })(
              <Checkbox className={s['login-form-remberMiMa']} style={remberStyle}><span id="rember">记住密码</span></Checkbox>
          )}
          <Button type="primary" style={btnStyle} htmlType="submit" loading={loading} className={s['login-form-btn']}>
            登录
          </Button>
        </FormItem>
      </Form>
      
      </div>
        
    );
  },
}));

export default AdminLoginForm
