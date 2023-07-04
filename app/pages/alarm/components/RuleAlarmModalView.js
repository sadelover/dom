/**
 * Rule
 */
import React from 'react'
import {Modal,Form,Input,Button,Select,Col,Row,Checkbox,Icon} from 'antd'
import s from './RuleAlarmModalView.css'
import cx from 'classnames';
import {modalTypes} from '../../../common/enum'
import PointModalView from '../containers/PointModalContainer'
import CodeMirror from 'react-codemirror';
import 'codemirror/mode/python/python';

const FormItem = Form.Item
const Option = Select.Option

const TAB = new Array(5).join(' ');

let str;
if(localStorage.getItem('serverOmd')=="best"){
    str = 'config-warning-best'
}else{
    str = ''
}

let toggleModalClass,toggleLabelClass,btnStyle,confirmBtnStyle;
if(localStorage.getItem('serverOmd')=="persagy"){
    toggleModalClass = 'persagy-warningManage-modal';
    toggleLabelClass = 'persagy-warningManage-label';
    btnStyle = {
        background:"rgba(255,255,255,1)",
        border:'1px solid rgba(195,198,203,1)',
        color:"rgba(38,38,38,1)",
        borderRadius:'4px',
        fontFamily:'MicrosoftYaHei',
        fontSize:'14px'
    }
    confirmBtnStyle = {
        border:'1px solid rgba(195,198,203,1)',
        borderRadius:'4px',
        fontFamily:'MicrosoftYaHei',
        fontSize:'14px'
    }
}

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
        sm: { span: 17 },
      },
    };

const formItemInfo = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };

 const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      },
    };
class FormData extends React.Component{

    handleModalHide(e){ //关闭模态窗并添加报警配置
        const { toggleRuleModal , addRuleWarning ,form,onSelectChange,editRuleWarning,mode,selectedData} = this.props
        const { getFieldsValue,validateFields } = form
        const fields = getFieldsValue()
        e.preventDefault()
        if (mode === 'edit') {
            validateFields((err,value)=>{
                if(!err){
                    toggleRuleModal()
                    //增加bool报警
                    editRuleWarning(fields,selectedData.id)
                    form.resetFields()
                    onSelectChange([])
                }
            })
        }else {
             validateFields((err,value)=>{
                if(!err){
                    toggleRuleModal()
                    //增加bool报警
                    addRuleWarning(fields)
                    form.resetFields()
                    onSelectChange([])
                }
            })
        }
       
    }

    handleHidePointModal = ()=> {
        const {showPointModal} = this.props
        showPointModal(modalTypes.POINT_MODAL)
    }
    
    render(){
        const { toggleRuleModal,mode,selectedData } = this.props
        const { getFieldDecorator } = this.props.form;

        return (
            mode !== 'edit'?
            <Form
                onSubmit={(e)=>{this.handleModalHide(e)}}
                className={toggleLabelClass}
            >   
                <Row gutter={60} >
                    <Col span={24} >
                        <FormItem
                            label='点名'
                            {...formItemLayout}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('pointname',{
                                rules : [{
                                    required : true ,message:'请选择点名'    
                                }]
                            })(
                                <Input addonAfter={<Icon type="plus" style={{cursor:"pointer"}} onClick={this.handleHidePointModal} />}  />
                            )}
                        </FormItem>
                   </Col>
                </Row>
                <Row gutter={60} >
                    <Col span={24}>
                        <FormItem
                            label='报警等级'
                            {...formItemLayout}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('boolWarningLevel',{
                                rules:[{
                                    required : true ,message:'请选择分类'
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('warningGroup',{
                                rules:[{
                                    pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/ , 
                                    message:'可填写大小写字母／数字／汉字'
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
                            label='报警信息'
                            {...formItemLayout}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('boolWarningInfo',{
                                rules:[{
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofPosition',{
                                rules:[{
                                }]
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
                            {...formItemInfo}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofDepartment',{
                                rules:[{
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            label='分组'
                            {...formItemInfo}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofGroup',{
                                rules:[{
                                }]
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
                            {...formItemInfo}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofSystem',{
                                rules:[{
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            label='标签'
                            {...formItemInfo}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('tag',{
                                rules:[{
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={10} >
                    <Col span={24}>
                        {
                            mode === 'edit' ?
                                <FormItem label="规则脚本" className={s['row-margin']}>
                                    {getFieldDecorator('script', {
                                        initialValue: '',
                                        rules: [{ required: true, message: '规则脚本不能为空！' }]
                                    })(
                                        <CodeEditor 
                                            value = {selectedData.script}
                                        />                   
                                    )}
                                </FormItem>
                            :
                                <FormItem label="规则脚本" className={s['row-margin']}>
                                    {getFieldDecorator('script', {
                                        initialValue: '',
                                        rules: [{ required: true, message: '规则脚本不能为空！' }]
                                    })(
                                        <CodeEditor 
                                            
                                        />                   
                                    )}
                                </FormItem>
                        }
                        
                    </Col>
                </Row>
                <FormItem
                    {...formItemLayoutWithOutLabel}
                    style={{marginBottom:-10,marginTop:-20}}
                >
                    <Button onClick={toggleRuleModal}  className={s['cancel-btn']} style={btnStyle}>取消</Button>
                    <Button type="primary" htmlType='submit' style={confirmBtnStyle}>确认</Button>
                </FormItem>
            </Form>
            :
            <Form
                onSubmit={(e)=>{this.handleModalHide(e)}}
                className={toggleLabelClass}
            >   
                <Row gutter={60} >
                    <Col span={24} >
                        <FormItem
                            label='点名'
                            {...formItemLayout}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('pointname',{
                                initialValue: selectedData.pointname,
                                rules : [{
                                    required : true ,message:'请选择点名'    
                                }]
                            })(
                                <Input disabled/>
                            )}
                        </FormItem>
                   </Col>
                </Row>
                <Row gutter={60} >
                    <Col span={24}>
                        <FormItem
                            label='报警等级'
                            {...formItemLayout}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('boolWarningLevel',{
                                initialValue: String(selectedData.boolWarningLevel),
                                rules:[{
                                    required : true ,message:'请选择分类'
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('warningGroup',{
                                initialValue: selectedData.warningGroup,
                                rules:[{
                                    pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/ , 
                                    message:'可填写大小写字母／数字／汉字'
                                },{
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
                            label='报警信息'
                            {...formItemLayout}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('boolWarningInfo',{
                                initialValue: selectedData.boolWarningInfo,
                                rules:[{
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofPosition',{
                                initialValue: selectedData.ofPosition,
                                rules:[{
                                }]
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
                            {...formItemInfo}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofDepartment',{
                                initialValue: selectedData.ofDepartment,
                                rules:[{
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            label='分组'
                            {...formItemInfo}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofGroup',{
                                initialValue: selectedData.ofGroup,
                                rules:[{
                                }]
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
                            {...formItemInfo}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofSystem',{
                                initialValue: selectedData.ofSystem,
                                rules:[{
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            label='标签'
                            {...formItemInfo}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('tag',{
                                initialValue: selectedData.tag,
                                rules:[{
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={60} >
                    <Col span={24}>
                        {
                            mode === 'edit' ?
                                <FormItem label="规则脚本" className={s['row-margin']}>
                                    {getFieldDecorator('script', {
                                        initialValue: selectedData.script,
                                        rules: [{ required: true, message: '规则脚本不能为空！' }]
                                    })(
                                        <CodeEditor 
                                            value = {selectedData.script}
                                        />                   
                                    )}
                                </FormItem>
                            :
                                <FormItem label="规则脚本" className={s['row-margin']}>
                                    {getFieldDecorator('script', {
                                        initialValue: selectedData.script,
                                        rules: [{ required: true, message: '规则脚本不能为空！' }]
                                    })(
                                        <CodeEditor 
                                            
                                        />                   
                                    )}
                                </FormItem>
                        }
                        
                    </Col>
                </Row>
                <FormItem
                    {...formItemLayoutWithOutLabel}
                    style={{marginBottom:-10,marginTop:-20}}
                >
                    <Button onClick={toggleRuleModal}  className={s['cancel-btn']} style={btnStyle}>取消</Button>
                    <Button type="primary" htmlType='submit' style={confirmBtnStyle}>确认</Button>
                </FormItem>
            </Form>
            
        )
    }
}

const FromWrap = Form.create({
    mapPropsToFields : function(props){
        var mode = props.mode;
        return {
            pointname : Form.createFormField({
                value : mode === 'edit' ? props.selectedData.pointname : props.selectedPoint && props.selectedPoint.name
            }),
            script: Form.createFormField({
                value: mode === 'edit' ? props.selectedData.script : ''
            }),
            tag: Form.createFormField({
                value: mode === 'edit' ? props.selectedData.tag : ''
            }),
            boolWarningLevel: Form.createFormField({
                value: mode === 'edit' ? String(props.selectedData.boolWarningLevel) : ''
            }),
            warningGroup: Form.createFormField({
                value: mode === 'edit' ? props.selectedData.warningGroup : ''
            }),
            boolWarningInfo: Form.createFormField({
                value: mode === 'edit' ? props.selectedData.boolWarningInfo : ''
            }),
            ofPosition: Form.createFormField({
                value: mode === 'edit' ? props.selectedData.ofPosition : ''
            }),
            ofDepartment: Form.createFormField({
                value: mode === 'edit' ? props.selectedData.ofDepartment : ''
            }),
            ofGroup: Form.createFormField({
                value: mode === 'edit' ? props.selectedData.ofGroup : ''
            }),
            ofSystem: Form.createFormField({
                value: mode === 'edit' ? props.selectedData.ofSystem : ''
            })
        };
    }
})(FormData)
class RuleAlarmModal extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        const {
            visible,
            toggleRuleModal,
            addRuleWarning,
            editRuleWarning,
            showPointModal,
            hidePointModal,
            selectedIds,
            pointData,
            onSelectChange,
            mode,
            table
        } = this.props

        let selectedPoint = pointData != undefined ? pointData.filter(item => {
			if (selectedIds[0] === item.name) return item
		})[0] || {} : {};

         let selectedId = table.selectedIds[0]

        let selectedData = table.data.filter(item=>{
            if(item.id === selectedId) return item
        })[0]

        console.info( visible )
        return (
            <Modal
                className={toggleModalClass}
                visible={visible}
                closable={false}
                onCancel={toggleRuleModal}
                footer={null}
                maskClosable={false}
                title={ mode === 'add' ? "添加规则报警" : '修改规则报警' }
                wrapClassName={str}
                width={600}
            >
                <FromWrap 
                    toggleRuleModal={toggleRuleModal} 
                    addRuleWarning={addRuleWarning}
                    editRuleWarning={editRuleWarning}
                    selectedPoint={selectedPoint}
                    showPointModal={showPointModal}
                    onSelectChange={onSelectChange}
                    selectedData={selectedData}
                    mode={mode}
                    />
                <PointModalView
                    hidePointModal={hidePointModal}
                />
            </Modal>
        )
    }
}

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


export default RuleAlarmModal