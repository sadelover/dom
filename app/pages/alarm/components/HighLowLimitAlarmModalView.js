/**
 * Boolean
 */
import React from 'react'
import {Modal,Form,Input,Button,Select,Row,Col,Checkbox,Icon} from 'antd'
import s from './HighLowLimitAlarmModalView.css'
import {modalTypes} from '../../../common/enum'
import PointModalView from '../containers/PointModalContainer'

const FormItem = Form.Item
const Option = Select.Option
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
const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
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

 const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      },
    };
class FormData extends React.Component{

    handleModalHide(){
        const { toggleHighLowModal ,form,addHighLowWarning,onSelectChange} = this.props
        const {  validateFields,getFieldValue} = form
        let pointname = this.props.form.getFieldValue('pointname')
        let warningGroup = this.props.form.getFieldValue('warningGroup')
        let hhenable = this.props.form.getFieldValue('hhenable')
        let henable = this.props.form.getFieldValue('henable')
        let llenable = this.props.form.getFieldValue('llenable')
        let lenable = this.props.form.getFieldValue('lenable')
        let hhlimit = this.props.form.getFieldValue('hhlimit')
        let hlimit = this.props.form.getFieldValue('hlimit')
        let llimit = this.props.form.getFieldValue('llimit')
        let lllimit = this.props.form.getFieldValue('lllimit')
        let hhinfo = this.props.form.getFieldValue('hhinfo')
        let hinfo = this.props.form.getFieldValue('hinfo')        
        let llinfo = this.props.form.getFieldValue('llinfo')
        let linfo = this.props.form.getFieldValue('linfo')
        let ofPosition = this.props.form.getFieldValue('ofPosition')
        let ofDepartment = this.props.form.getFieldValue('ofDepartment')
        let ofGroup = this.props.form.getFieldValue('ofGroup')
        let ofSystem = this.props.form.getFieldValue('ofSystem')
        let tag = this.props.form.getFieldValue('tag')
        let arr =[pointname,warningGroup,hhenable,henable,llenable,
        lenable,hhlimit,hlimit,llimit,lllimit,hhinfo,hinfo,llinfo,linfo,ofPosition,ofDepartment,ofGroup,ofSystem,tag
        ]        
        validateFields(['pointname','warningGroup'],(err,value) => {
            if(!err){
                toggleHighLowModal()
                addHighLowWarning(arr)
                form.resetFields()
                onSelectChange([])
            }            
        })
    }
    
    handleHidePointModal(){
        const {showPointModal,toggleHighLowModal} = this.props
        // toggleHighLowModal()
        showPointModal(modalTypes.POINT_MODAL)
    }

    render(){
        const { 
            toggleHighLowModal , 
            showPointModal
        } = this.props
        const { getFieldDecorator } = this.props.form;

        return (
            <Form
                className={toggleLabelClass}
                style={{marginLeft:10}}
            >
                <FormItem
                    label='点名'
                    {...formItemLayout}
                    className={s['row-margin']}
                >
                    {getFieldDecorator('pointname',{
                        rules : [{
                            required : true,message:'请选择点名'
                        }]
                    })(
                        <Input addonAfter={<Icon type="plus" style={{cursor:"pointer"}}  onClick={()=>{this.handleHidePointModal()}}  />}  />
                    )}
                </FormItem>
                <Row gutter={60} >
                    <Col span={24} >
                        <FormItem
                            label='分组'
                            {...formItemLayout}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('warningGroup',{
                                rules:[{
                                    pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/ , 
                                    message:'可填写大小写字母／数字／汉字'
                                },{
                                    required : true ,message :"请填写分组"
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={60} >
                </Row>
                <Row >
                    <Col span={6} >
                        <FormItem
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('hhenable',{
                                valuePropName:'checked',
                                initialValue:0
                            })(
                                <Checkbox>高高限值报警</Checkbox>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={6} >
                        <FormItem
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('hhlimit',{
                                initialValue:'',
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('hhinfo',{
                                initialValue:'',
                                rules:[{
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('henable',{
                                valuePropName : "checked",
                                initialValue:0,
                            })(
                                <Checkbox>高限值报警</Checkbox>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={6} >
                        <FormItem
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('hlimit',{
                                initialValue:'',
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('hinfo',{
                                initialValue:"",
                                rules:[{
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('lenable',{
                                valuePropName : 'checked',
                                initialValue:0
                            })(
                                <Checkbox>低限值报警</Checkbox>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={6} >
                        <FormItem
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('llimit',{
                                initialValue:"",
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('linfo',{
                                initialValue:"",
                                rules:[{
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('llenable',{
                                valuePropName : 'checked',
                                initialValue:0,
                            })(
                               <Checkbox>低低限值报警</Checkbox>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={6} >
                        <FormItem
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('lllimit',{
                                initialValue:'',
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
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('llinfo',{
                                initialValue:'',
                                rules:[{
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
                <Row gutter={60} >
                    <Col span={24} >
                        <FormItem
                            label='报警位置'
                            {...formItemLayout}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('ofPosition'
                            )(
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
                            {getFieldDecorator('ofDepartment'
                            )(
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
                            {getFieldDecorator('ofGroup'
                            )(
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
                            {getFieldDecorator('ofSystem'
                            )(
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
                            {getFieldDecorator('tag'
                            )(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                
                <FormItem
                    {...formItemLayoutWithOutLabel}
                    style={{marginBottom:-10}}
                >
                    <Button onClick={toggleHighLowModal} className={s['cancel-btn']} style={btnStyle}>取消</Button>
                    <Button onClick={()=>{this.handleModalHide()}} style={btnStyle}>确定</Button>
                </FormItem>
            </Form>
        )
    }
}

const FromWrap = Form.create({
    mapPropsToFields : function(props){
        return {
            pointname : Form.createFormField({
                value : props.selectedPoint && props.selectedPoint.name
            })
        }
    }
})(FormData)

class HighLowLimitAlarmModal extends React.Component{
    constructor(props){
        super(props)

        this.handleModalHide = this.handleModalHide.bind(this)
    }
    handleModalHide(){
        const { toggleHighLowModal } = this.props
        toggleHighLowModal()
    }
    render(){
        const {
            visible,
            toggleHighLowModal,
            addHighLowWarning ,
            showPointModal,
            hidePointModal,
            selectedIds,
            pointData,
            onSelectChange
        } = this.props

        let selectedPoint = pointData != undefined ? pointData.filter(item => {
			if (selectedIds[0] === item.name) return item
		})[0] || {} : {};
        
        return (
            <Modal
                className={toggleModalClass}
                visible={visible}
                closable={false}
                onCancel={toggleHighLowModal}
                footer={null}
                maskClosable={false}
                title='添加高低限报警'
                wrapClassName={str}
                width={550}
            >
                <FromWrap 
                    toggleHighLowModal={toggleHighLowModal} 
                    addHighLowWarning={addHighLowWarning}
                    showPointModal={showPointModal}
                    selectedPoint={selectedPoint}
                    onSelectChange={onSelectChange}
                />
                <PointModalView
                    hidePointModal={hidePointModal}
                />
            </Modal>
        )
    }
}


export default HighLowLimitAlarmModal