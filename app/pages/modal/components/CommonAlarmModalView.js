import React from 'react';
import { Modal ,Spin, Alert, InputNumber, Select, Form, Input, Button, Col, Row, Checkbox, Icon, message } from 'antd'
import s from './CommonAlarmModalView.css'
import cx from 'classnames';
import http from '../../../common/http';
import CodeMirror from 'react-codemirror';
import 'codemirror/mode/python/python';

const Option = Select.Option;
const FormItem = Form.Item;

const codeMirrorOptions = {
  lineNumbers: true,
  extraKeys: {
      Tab: function(cm) {
          if (cm.getSelection().length) {
              CodeMirror.commands.indentMore(cm);
          } else {
              cm.replaceSelection(TAB);
          }
      }
  },
  mode: 'python'
};

const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };


const formItemInfo = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };

const formItemInfoOther = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
      },
    };

 const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      },
    };

class MainInterfaceModalView extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            type : "1"
        }
        this.handleSelect = this.handleSelect.bind(this)
        this.getContent = this.getContent.bind(this)
    }

    handleSelect(value){
        this.setState({
            type : value
        })
    }

    //报警配置的方法
    handleModalHide(e){ //关闭模态窗并添加报警配置
      const { form } = this.props
      const { validateFields,getFieldsValue } = form
      const valueList = getFieldsValue()
      const {type} = this.state
      validateFields(['pointname','warningGroup','boolWarningLevel',"boolWarningInfo","ofDepartment","script","ofPosition","ofGroup","ofSystem","tag"],(err,value)=>{
          if(!err){
              if(type == "1"){
                http.post('/warningConfig/add',{
                    "pointname":value.pointname,
                    "boolWarningLevel":Number(valueList.boolWarningLevel), 
                    "warningGroup": value.warningGroup,
                    "boolWarningInfo": valueList.boolWarningInfo,
                    "type":1,
                    "hhenable":0,
                    "henable":0,
                    "llenable":0,
                    "lenable":0,
                    "hhlimit":"0",
                    "hlimit":"0",
                    "llimit":"0",
                    "lllimit":"0",
                    "hhinfo":"布尔报警",
                    "hinfo":"布尔报警",
                    "llinfo":"布尔报警",
                    "linfo":"布尔报警",
                    "ofPosition":valueList.ofPosition ? valueList.ofPosition : '',
                    "ofDepartment":valueList.ofDepartment ?valueList.ofDepartment:'',
                    "ofGroup":valueList.ofGroup ? valueList.ofGroup:'',
                    "ofSystem":valueList.ofSystem ? valueList.ofSystem : '',
                    "tag":valueList.tag ? valueList.tag : ''
                }).then(
                    data=>{
                        if(!data.err){
                            Modal.success({
                                title:'信息提示',
                                content:'添加成功'
                            })
                            this.props.hideModal();
                        }else{
                            Modal.error({
                                title:'信息提示',
                                content:'添加失败'
                            })
                        }
                    }
                )
              }else{
                if (type === "0") {
                    http.post('/warningConfig/add',{
                        "pointname":value.pointname,
                        "boolWarningLevel":Number(valueList.boolWarningLevel), 
                        "warningGroup": value.warningGroup,
                        "boolWarningInfo": "",
                        "type":0,
                        "hhenable":valueList.hhenable ? 1 : 0,
                        "henable":valueList.henable ? 1 : 0,
                        "llenable":valueList.llenable ? 1 : 0,
                        "lenable":valueList.lenable ? 1 : 0,
                        "hhlimit":valueList.hhlimit ? valueList.hhlimit : '',
                        "hlimit":valueList.hlimit ? valueList.hlimit : '',
                        "llimit":valueList.llimit ? valueList.llimit : '',
                        "lllimit":valueList.lllimit ? valueList.lllimit : '',
                        "hhinfo": valueList.hhinfo ? valueList.hhinfo : '',
                        "hinfo": valueList.hinfo ? valueList.hinfo : '',
                        "llinfo": valueList.llinfo ? valueList.llinfo : '',
                        "linfo": valueList.linfo ? valueList.linfo : '',
                        "ofPosition":valueList.ofPosition ? valueList.ofPosition : '',
                        "ofDepartment":valueList.ofDepartment ? valueList.ofDepartment : '',
                        "ofGroup":valueList.ofGroup ? valueList.ofGroup : '',
                        "ofSystem":valueList.ofSystem ? valueList.ofSystem : '',
                        "tag":valueList.tag ? valueList.tag : ''
                    }).then(
                        data=>{
                            if(!data.err){
                                Modal.success({
                                    title:'信息提示',
                                    content:'添加成功'
                                })
                                this.props.hideModal();
                            }else{
                                Modal.error({
                                    title:'信息提示',
                                    content:'添加失败'
                                })
                            }
                        }
                    )
                  }else {
                    if (type === "3") {
                        http.post('/warningConfig/addRule',{
                            "pointname":value.pointname,
                            "boolWarningLevel":Number(valueList.boolWarningLevel), 
                            "warningGroup": value.warningGroup,
                            "boolWarningInfo": valueList.boolWarningInfo,
                            "type":3,
                            "script":valueList.script,
                            "ofPosition":valueList.ofPosition ? valueList.ofPosition : '',
                            "ofDepartment":valueList.ofDepartment ? valueList.ofDepartment : '',
                            "ofGroup":valueList.ofGroup ? valueList.ofGroup : '',
                            "ofSystem":valueList.ofSystem ? valueList.ofSystem : '',
                            "tag":valueList.tag ? valueList.tag : '' 
                        }).then(
                            data=>{
                                if(!data.err){
                                    message.info('添加成功')
                                    this.props.hideModal();
                                }else{
                                    message.info('添加失败')
                                }
                            }
                        )
                    }
                  }
               
              }
          }
      })
      e.preventDefault()
    }

    
    //表单校验
    pointnameValidate = (rule,value,callback) => {
        if(value){
            callback()
            return 
        }
        callback('请填写点名')
    }

    boolWarningLevelValidate = (rule,value,callback) => {
        if(value){
            callback()
            return 
        }
        callback('请填写报警等级')
    }

    warningGroupValidate = (rule,value,callback) => {
        if(value){
            callback()
            return 
        }
        callback('请填写分组')
    }

    boolWarningInfoValidate = (rule,value,callback) => {
        if(value){
            callback()
            return 
        }
        callback('请填写报警信息')
    }

    getContent (type) {
        const { getFieldDecorator } = this.props.form;
        //布尔报警
        if (type === "1") {
            return(
                <Row gutter={60} >
                    <Col span={24} >
                        <FormItem
                            label='报警信息'
                            {...formItemLayout}
                        >
                            {getFieldDecorator('boolWarningInfo',{
                                rules:[{
                                    pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-\s]+$/ , 
                                    required : true ,
                                    message:'可填写大小写字母／数字／汉字'
                                },{
                                    validator : (rule,value,callback) => {
                                        if(value){
                                            callback()
                                            return 
                                        }
                                        callback('请填写报警信息')
                                    }
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                </Row>
            )
        }else{
            //高低限报警
            if (type === "0") {
                return (
                    <div>
                        <Row >
                            <Col span={6} >
                                <FormItem
                                >
                                    {getFieldDecorator('hhenable',{
                                        valuePropName:'checked',
                                        initialValue : false
                                    })(
                                        <Checkbox>高高限值报警</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6} >
                                <FormItem
                                >
                                    {getFieldDecorator('hhlimit',{
                                        initialValue : '' ,
                                        rules:[{
                                            pattern : /^-|[0-9]+$/ , 
                                            message:'0-9数字'
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12} >
                                <FormItem
                                    label='报警信息'
                                    {...formItemInfo}
                                >
                                    {getFieldDecorator('hhinfo',{
                                        initialValue : '' ,
                                        rules:[{
                                            pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-\s]+$/ , 
                                            message:'可填写大小写字母／数字／汉字'
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6} >
                                <FormItem
                                >
                                    {getFieldDecorator('henable',{
                                        valuePropName : "checked",
                                        initialValue : false
                                    })(
                                        <Checkbox>高限值报警</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6} >
                                <FormItem
                                >
                                    {getFieldDecorator('hlimit',{
                                        initialValue : '' ,
                                        rules:[{
                                            pattern : /^-|[0-9]+$/ , 
                                            message:'0-9数字'
                                        },{
                                            validator : (rule,value,callback) => {
                                                if(value){
                                                    callback()
                                                    return 
                                                }
                                                callback('请填写数值')
                                            }
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12} >
                                <FormItem
                                    label='报警信息'
                                    {...formItemInfo}
                                >
                                    {getFieldDecorator('hinfo',{
                                        initialValue : '' ,
                                        rules:[{
                                            pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-\s]+$/ , 
                                            message:'可填写大小写字母／数字／汉字'
                                        },{
                                            validator : (rule,value,callback) => {
                                                if(value){
                                                    callback()
                                                    return 
                                                }
                                                callback('请填写信息')
                                            }
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6} >
                                <FormItem
                                >
                                    {getFieldDecorator('llenable',{
                                        valuePropName : 'checked',
                                        initialValue : false
                                    })(
                                    <Checkbox>低低限值报警</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6} >
                                <FormItem
                                >
                                    {getFieldDecorator('lllimit',{
                                        initialValue : '' ,
                                        rules:[{
                                            pattern : /^-|[0-9]+$/ , 
                                            message:'0-9数字'
                                        },{
                                            validator : (rule,value,callback) => {
                                                if(value){
                                                    callback()
                                                    return 
                                                }
                                                callback('请填写数值')
                                            }
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12} >
                                <FormItem
                                    label='报警信息'
                                    {...formItemInfo}
                                >
                                    {getFieldDecorator('llinfo',{
                                        initialValue : '' ,
                                        rules:[{
                                            pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/ , 
                                            message:'可填写大小写字母／数字／汉字'
                                        },{
                                            validator : (rule,value,callback) => {
                                                if(value){
                                                    callback()
                                                    return 
                                                }
                                                callback('请填写信息')
                                            }
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6} >
                                <FormItem
                                >
                                    {getFieldDecorator('lenable',{
                                        valuePropName : 'checked',
                                        initialValue : false
                                    })(
                                        <Checkbox>低限值报警</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6} >
                                <FormItem
                                >
                                    {getFieldDecorator('llimit',{
                                        initialValue : '' ,
                                        rules:[{
                                            pattern : /^-|[0-9]+$/ , 
                                            message:'0-9数字'
                                        },{
                                            validator : (rule,value,callback) => {
                                                if(value){
                                                    callback()
                                                    return 
                                                }
                                                callback('请填写数值')
                                            }
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12} >
                                <FormItem
                                    label='报警信息'
                                    {...formItemInfo}
                                >
                                    {getFieldDecorator('linfo',{
                                        initialValue : '' ,
                                        rules:[{
                                            pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-\s]+$/ , 
                                            message:'可填写大小写字母／数字／汉字'
                                        },{
                                            validator : (rule,value,callback) => {
                                                if(value){
                                                    callback()
                                                    return 
                                                }
                                                callback('请填写信息')
                                            }
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </div>
                )
            } 
            else {
                //规则报警
                if (type === "3") {
                    return (
                        <Row gutter={60} >
                            <Col span={24} >
                                <FormItem
                                    label='报警信息'
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator('boolWarningInfo',{
                                        rules:[{
                                            pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-\s]+$/ , 
                                            required : true ,
                                            message:'可填写大小写字母／数字／汉字'
                                        },{
                                            validator : (rule,value,callback) => {
                                                if(value){
                                                    callback()
                                                    return 
                                                }
                                                callback('请填写报警信息')
                                            }
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem label="规则脚本" >
                                    {getFieldDecorator('script', {
                                        initialValue: '',
                                        rules: [{ required: true, message: '规则脚本不能为空！' }]
                                    })(
                                       <CodeEditor/>              
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    )
                }
            }     
        }
    }

    //渲染组件
    render(){
        let {
        visible,
        hideModal
        } = this.props

        const { getFieldDecorator } = this.props.form;
        visible = typeof visible === 'undefined' ? true : visible;
        return (
            <Modal
                title='添加报警'
                visible={visible}
                onCancel={hideModal}
                footer={null}
                maskClosable={false}
            >
                <Form
                    onSubmit={(e)=>{this.handleModalHide(e)}}
                >
                    <FormItem
                        label='点名'
                        {...formItemLayout}
                    >
                        {getFieldDecorator('pointname',{
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <Row gutter={60} >
                        <Col span={24}>
                            <FormItem
                                label='报警类型'
                                {...formItemLayout}
                            >
                                {getFieldDecorator('type',{
                                    initialValue : "1",
                                    rules:[{
                                        required: true
                                    }]
                                })(
                                    <Select
                                        onSelect={this.handleSelect}
                                    >
                                        <Option value='1' >布尔报警</Option>
                                        <Option value='0' >高低限报警</Option>
                                        <Option value='3' >规则报警</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={24}>
                            <FormItem
                                label='报警等级'
                                {...formItemLayout}
                            >
                                {getFieldDecorator('boolWarningLevel',{
                                    initialValue : "2",
                                    rules:[{
                                        required: true
                                    }]
                                })(
                                    <Select>
                                        <Option value='1' >一般</Option>
                                        <Option value='2' >较重</Option>
                                        <Option value='3' >严重</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24} >
                            <FormItem
                                label='自定义分组'
                                {...formItemLayout}
                            >
                                {getFieldDecorator('warningGroup',{
                                    rules:[{
                                        pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/, 
                                        required: true,
                                        message:'可填写大小写字母／数字／汉字'
                                    },{
                                        validator : (rule,value,callback) => {
                                            if(value){
                                                callback()
                                                return 
                                            }
                                            callback('请填写自定义分组')
                                        }
                                    }]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label='报警位置'
                                {...formItemLayout}
                            >
                                {getFieldDecorator('ofPosition',{
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={12}>
                            <FormItem
                                label='部门'
                                {...formItemInfoOther}
                            >
                                {getFieldDecorator('ofDepartment',{
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label='分组'
                                {...formItemInfoOther}
                            >
                                {getFieldDecorator('ofGroup',{
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={12}>
                            <FormItem
                                label='系统'
                                {...formItemInfoOther}
                            >
                                {getFieldDecorator('ofSystem',{
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label='标签'
                                {...formItemInfoOther}
                            >
                                {getFieldDecorator('tag',{
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    {this.getContent(this.state.type)}
                    <FormItem
                        {...formItemLayoutWithOutLabel}
                    >
                        <Button onClick={hideModal}  className={s['cancel-btn']} >取消</Button>
                        <Button type="primary" htmlType='submit'>确认</Button>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}



const MainInterfaceModal = Form.create({
  mapPropsToFields: (props) => {
    return {
      pointname : Form.createFormField({
              value : props.pointName 
          })
    }
  }
})(MainInterfaceModalView);

class CodeEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      script: this.props.value || ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    const onChange = this.props.onChange;

    if (!('value' in this.props)) {
      this.setState({
        script: value
      });
    }

    if (onChange) {
      onChange(value);
    }
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({
        script: value
      });
    }
  }

  render() {
    return (
      <CodeMirror
        value={this.state.script}
        className={cx(s['editor'], 'ant-input')}
        options={codeMirrorOptions}
        onChange={this.handleChange}
      />
    );
  }
}

export default MainInterfaceModal