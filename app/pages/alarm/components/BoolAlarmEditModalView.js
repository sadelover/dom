/**
 * Boolean
 */
import React from 'react'
import {Modal,Form,Input,Button,Select,Row,Col,Checkbox} from 'antd'
import s from './BoolAlarmEditModalView.css'
import {modalTypes} from '../../../common/enum'
import PointModalView from '../containers/PointModalContainer'

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

const FormItem = Form.Item
const Option = Select.Option

const formItemPoint = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 20 },
      },
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
const formItemLayoutBig = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 12 },
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

    handleModalHide(){
        const { toggleEditModal ,form,editWarning} = this.props
        const {  validateFields} = form

        validateFields( (err,value)=>{
            console.info( value.hhenable )
            if( !err ){
                toggleEditModal()
                editWarning(value)
                form.resetFields()
            }
        })
    }
    
    render(){
        const { toggleEditModal ,record } = this.props
        const { getFieldDecorator } = this.props.form;

        return (
            <Form
                className={toggleLabelClass}
            >
                <FormItem
                    label='点名'
                    {...formItemLayout}
                    className={s['row-margin']}
                >
                    {getFieldDecorator('pointname',{
                    })(
                        <Input disabled />
                    )}
                </FormItem>
                <Row gutter={60} >
                    <Col span={12}>
                        <FormItem
                            label='报警等级'
                            {...formItemLayoutBig}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('boolWarningLevel',{
                            })(
                                <Select>
                                    <Option value='1' >一般</Option>
                                    <Option value='2' >较重</Option>
                                    <Option value='3' >严重</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Col>

                    <Col span={12} >
                        <FormItem
                            label='自定义分组'
                            {...formItemLayoutBig}
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('warningGroup',{
                                rules:[{
                                    pattern : /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/ , 
                                    message:'可填写大小写字母／数字／汉字'
                                },{
                                    required : true,message:'请填写自定义分组'
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
                                },{
                                    required:true,message:'请填写报警信息'
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
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <FormItem
                    {...formItemLayoutWithOutLabel}
                    style={{marginBottom:-10}}
                >
                    <Button onClick={toggleEditModal} className={s['cancel-btn']} style={btnStyle}>取消</Button>
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
                value : props.record['pointname']
            }),
            boolWarningLevel : Form.createFormField({
                value : String(props.record['boolWarningLevel'])
            }),
            warningGroup : Form.createFormField({
                value : props.record['warningGroup']
            }),
            boolWarningInfo : Form.createFormField({
                value : props.record['boolWarningInfo']!==''?props.record['boolWarningInfo']:'暂无'
            }),
            ofPosition : Form.createFormField({
                value : props.record['ofPosition']
            }),
            ofDepartment : Form.createFormField({
                value : props.record['ofDepartment']
            }),
            ofGroup : Form.createFormField({
                value : props.record['ofGroup']
            }),
            ofSystem : Form.createFormField({
                value : props.record['ofSystem']
            }),
            tag : Form.createFormField({
                value : props.record['tag']
            }),
        }
    }
})(FormData)

class BoolAlarmEditModalView extends React.Component{
    constructor(props){
        super(props)

        this.handleModalHide = this.handleModalHide.bind(this)
    }
    handleModalHide(){
        const { toggleEditModal } = this.props
        toggleEditModal()
    }
    render(){
        const {visible,toggleEditModal , table,editWarning} = this.props
        let selectedId = table.selectedIds[0]
        let record = table.data.filter(item=>{
            if(item.id === selectedId) return item
        })[0]
        return (
            <Modal
                className={toggleModalClass}
                visible={visible}
                closable={false}
                onCancel={toggleEditModal}
                footer={null}
                maskClosable={false}
                title="修改布尔报警"
            >
                <FromWrap 
                    toggleEditModal={toggleEditModal} 
                    record={record}
                    editWarning={editWarning}
                />
            </Modal>
        )
    }
}


export default BoolAlarmEditModalView