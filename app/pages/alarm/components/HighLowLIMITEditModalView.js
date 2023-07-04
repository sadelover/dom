/**
 * Boolean
 */
import React from 'react'
import {Modal,Form,Input,Button,Select,Row,Col,Checkbox} from 'antd'
import s from './HighLowLIMITEditModalView.css'
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
        xs: { span: 12 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 20 },
      },
    };

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
        const { HighLowEditModal ,form,editHithLowWaring} = this.props
        const {  validateFields} = form
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
        validateFields(['pointname','warningGroup'],(err,value)=>{
            if( !err ){
                HighLowEditModal()
                editHithLowWaring(arr)
                form.resetFields()
            }
        })
    }
    
    render(){
        const { HighLowEditModal ,record } = this.props
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
                                    required : true,message:'请填写分组'
                                }]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                    </Col>
                </Row>
                <Row >
                    <Col span={6} >
                        <FormItem
                            className={s['row-margin']}
                        >
                            {getFieldDecorator('hhenable',{
                                valuePropName:'checked',
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
                                rules:[{
                                    pattern : /-|[0-9]+$/ , 
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
                                rules:[{
                                    pattern : /-|[0-9]+$/ , 
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
                                rules:[{
                                    pattern : /-|[0-9]+$/ , 
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
                    <Button onClick={HighLowEditModal} className={s['cancel-btn']} style={btnStyle}>取消</Button>
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
            tag : Form.createFormField({
                value : props.record['tag']
            }),
            ofSystem : Form.createFormField({
                value : props.record['ofSystem']
            }),
            ofGroup : Form.createFormField({
                value : props.record['ofGroup']
            }),
            ofDepartment : Form.createFormField({
                value : props.record['ofDepartment']
            }),
            ofPosition : Form.createFormField({
                value : props.record['ofPosition']
            }),
            llinfo : Form.createFormField({
                value : props.record['llinfo']
            }),
            lllimit : Form.createFormField({
                value : props.record['lllimit'] == 0?"":props.record['lllimit']
            }),
            llenable : Form.createFormField({
                value : props.record['llenable'] == 1?true:false
            }),
            linfo : Form.createFormField({
                value : props.record['linfo']
            }),
            llimit : Form.createFormField({
                value : props.record['llimit'] == 0?"":props.record['llimit']
            }),
            lenable : Form.createFormField({
                value : props.record['lenable'] == 1?true:false
            }),
            hinfo : Form.createFormField({
                value : props.record['hinfo']
            }),
            warningGroup : Form.createFormField({
                value : props.record['warningGroup']
            }),
            hhenable : Form.createFormField({
                value : props.record['hhenable'] == 1?true:false
            }),
            hhlimit : Form.createFormField({
                value : props.record['hhlimit'] == 0?"":props.record['hhlimit']
            }),
            hlimit : Form.createFormField({
                value : props.record['hlimit'] == 0?"":props.record['hlimit'] 
            }),
            henable : Form.createFormField({
                value : props.record['henable'] == 1?true:false
            }),
            hhinfo : Form.createFormField({
                value : props.record['hhinfo']
            }),
        }
    }
})(FormData)

class HighLowLIMITEditModalView extends React.Component{
    constructor(props){
        super(props)

        this.handleModalHide = this.handleModalHide.bind(this)
    }
    handleModalHide(){
        const { HighLowEditModal } = this.props
        HighLowEditModal()
    }
    render(){
        const {visible,HighLowEditModal,table,editHithLowWaring} = this.props
        let selectedId = table.selectedIds[0]
        let record = table.data.filter(item=>{
            if(item.id === selectedId) return item
        })[0]
        return (
            <Modal
                className={toggleModalClass}
                visible={visible}
                closable={false}
                onCancel={HighLowEditModal}
                footer={null}
                maskClosable={false}
                title="高低限报警编辑"
            >
                <FromWrap 
                    HighLowEditModal={HighLowEditModal} 
                    record={record}
                    editHithLowWaring={editHithLowWaring}
                />
            </Modal>
        )
    }
}


export default HighLowLIMITEditModalView