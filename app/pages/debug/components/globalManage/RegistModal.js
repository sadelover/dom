/**
 * 首页配置框
 */
import React, { PropTypes } from 'react';
import { Form, Modal, Input, Button, message } from 'antd';

import http from '../../../../common/http'
import {addOperation} from '../../../../common/utils'
import { closeLoginWindow, afterLoginSuccess } from '../../../../core/cmdRenderer';
import { updateServerUrl,appConfig } from '../../../../common/appConfig';

let toggleModalClass;
if(localStorage.getItem('serverOmd')=="persagy"){
  toggleModalClass='persagy-modal persagy-dashBoardLine-form'
}

const FormItem = Form.Item;
const initialServerUrl = localStorage.getItem('serverUrl');
class RegistModalForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.register = this.register.bind(this)
    this.hide = this.hide.bind(this)
    this.copy = this.copy.bind(this) 
  }
  register(){
    let _this = this
    let pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))
    this.props.form.validateFields(['serialNumber'],(err,value)=>{
        if(!err){
          if(pysiteVersion>=903){
            return http.post('/license/saveResponseNo',{
              licVer: 1,
              "key":_this.props.form.getFieldValue('serialNumber')
            }).then(
                data=>{
                    if(data.err==0){
                      http.get('/licence/query').then(
                          ture=>{
                            window.localStorage.setItem('leftday',JSON.stringify({
                                leftday:ture.data.leftdays
                              }))
                              _this.props.form.resetFields()
                              _this.props.RegistModal(false)
                        }
                      ).catch(err=>{
                      })
                    }
                }
            ).catch(
                err=>{
                    Modal.error({
                        content:"请填写正确的注册码"
                    })
                }
            )
          }else{
            Modal.error({
              title:"dompysite版本低于0.9.3",
              content:"请先升级dompysite版本，再进行软件授权"
            })
          }
        }
    })
  }
  copy(){
    let machineText = this.props.form.getFieldValue('machineName')
    let machine = document.getElementById('machine')
    machine.value = machineText
    machine.select();
    document.execCommand("Copy")
}
  //关闭窗口
  hide(){
    this.props.form.resetFields()
      if(window.localStorage.getItem('leftday')===null){
        addOperation('/operationRecord/addLogin',{
            "userName": this.props.name,
            "type":1,
            "address":'',
            "lang":"zh-cn"
          },'记录用户登录操作失败')
        afterLoginSuccess()
      }else{
        this.props.RegistModal(false)
      }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
        <Modal
            className={toggleModalClass}
            wrapClassName="login-modal-wrap"
            title="注册"
            width={350}
            maskClosable={false}
            visible={this.props.visible}
            onOk={this.register}
            onCancel={this.hide}
            cancelText={window.localStorage.getItem('leftday')===null?'使用5分钟':'取消'}
        >
        <Form >
            <FormItem
                label="机器码"
            >
                {getFieldDecorator('machineName', {
                    initialValue:this.props.machinecode
                })(
                <Input disabled style={{width:'200px'}}/>
                )}
                <Button type='primary' style={{display:'inline'}} onClick={this.copy}>复制</Button>
                <input id='machine' style={{opacity:'0',position:'absolute',zIndex:'-2'}} ></input>
                <div>(请将机器码发送给软件授权商寻求注册支持)</div>
            </FormItem>
            <FormItem
                label="认证序列号"
            >
                {getFieldDecorator('serialNumber',{
                rules: [{
                    required: true,
                    message: '认证序列号不能为空'
                }]
                })(
                <Input/>
                )}
            </FormItem>
        </Form>
      </Modal>   
    );
  }
}
const RegistModal  = Form.create()(RegistModalForm);
export default RegistModal
