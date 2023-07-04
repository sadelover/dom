/**
 * Boolean
 */
import React from 'react'
import {Modal,Form,Input,Button,Select,Col,Row,Checkbox,Icon} from 'antd'
import s from './BoolAlarmModalView.css'
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
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
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
        const { toggleBoolModal , addBoolWarning ,form,onSelectChange} = this.props
        const { getFieldsValue,validateFields } = form
        const fields = getFieldsValue()
        e.preventDefault()
        validateFields((err,value)=>{
            if(!err){
                toggleBoolModal()
                //增加bool报警
                addBoolWarning(fields)
                form.resetFields()
                onSelectChange([])
            }
        })
    }

    handleHidePointModal = ()=> {
        const {showPointModal} = this.props
        showPointModal(modalTypes.POINT_MODAL)
    }
    
    render(){
        const { toggleBoolModal } = this.props
        const { getFieldDecorator } = this.props.form;

        return (
            <Form
                onSubmit={(e)=>{this.handleModalHide(e)}}
                className={toggleLabelClass}
            >
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
                </Row>   
                <Row gutter={60} >
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
                                },{
                                    required : true , message:'请填写自定义分组'
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
                                    required : true ,message:'请填写报警信息'
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
                    <Button onClick={toggleBoolModal}  className={s['cancel-btn']} style={btnStyle}>取消</Button>
                    <Button type="primary" htmlType='submit' style={confirmBtnStyle}>确认</Button>
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
class BoolAlarmModal extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        const {
            visible,
            toggleBoolModal,
            addBoolWarning,
            showPointModal,
            hidePointModal,
            selectedIds,
            pointData,
            onSelectChange
        } = this.props

        let selectedPoint = pointData != undefined ? pointData.filter(item => {
			if (selectedIds[0] === item.name) return item
		})[0] || {} : {};

        console.info( visible )
        return (
            <Modal
                className={toggleModalClass}
                visible={visible}
                closable={false}
                onCancel={toggleBoolModal}
                footer={null}
                maskClosable={false}
                title="添加布尔报警"
                wrapClassName={str}
                width={550}
            >
                <FromWrap 
                    toggleBoolModal={toggleBoolModal} 
                    addBoolWarning={addBoolWarning}
                    selectedPoint={selectedPoint}
                    showPointModal={showPointModal}
                    onSelectChange={onSelectChange}
                    />
                <PointModalView
                    hidePointModal={hidePointModal}
                />
            </Modal>
        )
    }
}


export default BoolAlarmModal