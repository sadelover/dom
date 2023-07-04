import React, { PropTypes } from 'react';
import { Form, Modal, Input, Row, Col,Select} from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react'; 
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
import SeachEditor from './SeachEditor'
import { stringify } from 'postcss';
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 10 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 }
  }
};
const formItemLayout1 = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 }
  }
}
const FormItem = Form.Item;
class GuaranteeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorHtml: '',
      editorText: '',
      visible:false,
      content:'',
      key:''
    }
    this.hide = this.hide.bind(this)
    this.sumbit = this.sumbit.bind(this)
    this.changeContent = this.changeContent.bind(this)
    this.close = this.close.bind(this)
  }
  componentWillReceiveProps(nextProps,nextState){
    if(nextProps.SeachGuaranteeSourceData!==this.props.SeachGuaranteeSourceData){
        this.setState({
            content:nextProps.SeachGuaranteeSourceData.content
        })   
    }
  }
  changeContent(data){
    this.setState({
      content:data
    })
  }
  hide(){
    const { form } = this.props
    this.props.SeachGuarantee(false)
    form.resetFields()
    this.setState({
        key:Math.random()
    })
  }
  sumbit(){
      const { form,SeachGuarantee,SeachGuaranteeSourceData,GuaranteeFixid} = this.props
      const {content} = this.state
      const {validateFields} = this.props.form
      let _this = this
      validateFields((err,values)=>{
        if(!err){
          var t1=moment().format('YYYY-MM-DD HH:mm:ss');
           SeachGuarantee(false)
           http.post('/fix/modify',
              {
                "fixId":parseInt(GuaranteeFixid), // INT
                "reportTime":t1, // VARCHAR
                "importance":values.importance=='低'?0:(values.importance=='中'?1:2),  // 重要程度，0低，1中，2高 INT
                "urgent":values.urgent=='低'?0:(values.urgent=='中'?1:2),  // 紧急程度，0低，1中，2高 INT
                "content":content, // TEXT
                "result":parseInt(values.result),  // 0:未解决，1：已解决，2：已关闭 INT
                "closeTime":SeachGuaranteeSourceData.closeTime, // VARCHAR
                "reportUser":values.reportUser, // VARCHAR
                "solveUser":values.solveUser, // VARCHAR
                "energyEffects":values.energyEffects=='低'?0:(values.energyEffects=='中'?1:2), // 0低，1中，2高 INT
                "title":values.title
              }
           ).then(
           ).catch(
           )
           form.resetFields()
           _this.setState({
            key:Math.random()
          })
        }
      })
    }
    close(){
    }
  render() {
      const {SeachGuaranteeVisiable,SeachGuarantee,SeachGuaranteeSourceData,GuaranteeFixid} = this.props
      const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="修改备注"
        width={760}
        visible={SeachGuaranteeVisiable}
        onCancel={this.hide}
        onOk ={this.sumbit}
        afterClose={this.close}
        key={this.state.key}
        okText='修改'
        maskClosable={false}
      >
          <Form style={{marginLeft:'-25px'}}>
                <Row>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label="重要程度">
                          {getFieldDecorator('importance', {
                            rules: [{ required: true, message: '请填写内容' }],
                            initialValue:SeachGuaranteeSourceData.importance+''  
                          })(
                              <Select>
                                  <Option value='0' >低</Option>
                                  <Option value='1' >中</Option>
                                  <Option value='2' >高</Option>
                              </Select>
                          )}
                        </FormItem>
                    </Col>
                    <Col span={12} style={{marginLeft:'-20px'}}>
                        <FormItem {...formItemLayout} label="紧急程度">
                          {getFieldDecorator('urgent', {
                            rules: [{ required: true, message:'请填写内容' }],
                            initialValue:SeachGuaranteeSourceData.urgent+'' 
                          })(
                            <Select>
                              <Option value='0' >低</Option>
                              <Option value='1' >中</Option>
                              <Option value='2' >高</Option>
                            </Select>
                          )}
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                          <FormItem {...formItemLayout} label="报告人">
                            {getFieldDecorator('reportUser', {
                              rules: [{ required: true, message:'请填写内容' }],
                              initialValue:SeachGuaranteeSourceData.reportUser
                            })(<Input />)}
                          </FormItem>
                      </Col> 
                      <Col span={12} style={{marginLeft:'-20px'}}>
                          <FormItem {...formItemLayout} label="节能影响程度">
                            {getFieldDecorator('energyEffects', {
                              rules: [{ required: true, message:'请填写内容' }],
                              initialValue:SeachGuaranteeSourceData.energyEffects+''
                            })(
                              <Select>
                                <Option value='0' >低</Option>
                                <Option value='1' >中</Option>
                                <Option value='2' >高</Option>
                              </Select>
                            )}
                          </FormItem>
                      </Col>
                </Row>
                <Row>
                    <Col span={12}>
                          <FormItem {...formItemLayout} label="解决人">
                            {getFieldDecorator('solveUser', {
                              // rules: [{ required: true, message:'请填写内容' }],
                              initialValue:SeachGuaranteeSourceData.solveUser
                            })(<Input />)}
                          </FormItem>
                    </Col>
                    <Col span={12} style={{marginLeft:'-20px'}}>
                          <FormItem {...formItemLayout} label="结果">
                            {getFieldDecorator('result', {
                              // rules: [{ required: true, message:'请填写内容' }],
                              initialValue:SeachGuaranteeSourceData.result==null?'0':SeachGuaranteeSourceData.result+''
                            })(
                              <Select>
                                <Option value='0' >未解决</Option>
                                <Option value='1' >已解决</Option>
                                <Option value='2' >已关闭</Option>
                              </Select>
                            )}
                          </FormItem>
                    </Col>  
                </Row>
                <Row>
                    <Col span={24} style={{marginLeft:'-91px'}}>
                          <FormItem {...formItemLayout1} label="标题">
                            {getFieldDecorator('title', {
                              rules: [{ required: true, message:'请输入标题' }],
                              initialValue:SeachGuaranteeSourceData.title
                            })(<Input />)}
                          </FormItem>
                    </Col>
                </Row>
            </Form>
            <div id='yuanjie'>
                <SeachEditor
                    content = {this.state.content}
                    changeContent = {this.changeContent}
                />   
            </div>
       </Modal>
       )

       }
}
const GuaranteeView = Form.create()(GuaranteeModal);
export default GuaranteeView ;
