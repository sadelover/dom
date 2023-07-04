import React from 'react'
import {Modal,Button,Form,Input,Select,Row,Col} from 'antd'


const FormItem = Form.Item
const Option  = Select.Option

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };


const DeviceInfoView = Form.create()(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state = {
            }
            this.onOk = this.onOk.bind(this)
        }
        //点击提交表单时触发
        onOk(e){
            let _this = this
            const {form,addDeviceInfo,hideModal,savePropertyInfo,template_id,equip_id} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    //hideModal()
                    addDeviceInfo(values)
                    _this.props.saveDeviceName(values.name)
                    _this.props.saveData(values['name'])
                }
            })
        }
        render(){
            const {form,addDeviceInfo,areaList,templatesList,hideModal,savePropertyInfo,saveData} = this.props
            const {getFieldDecorator} = form
            return (
                    <Form onSubmit={this.onOk}>
                        <Row>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='设备名称'
                                    >
                                        {
                                            getFieldDecorator('name',{
                                                rules : [{required : true,message:'请填写设备名称'}]
                                            })(<Input />)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='设备类型'
                                    >
                                        {
                                            getFieldDecorator('type',{
                                                initialValue:'1',
                                                rules : [{required : true,message:'请选择设备类型'}]
                                            })(<Select>
                                                    <Option value='1' >净化器</Option>
                                                    <Option value='2' >水泵</Option>
                                                    <Option value='3' >冷却塔</Option>
                                                    <Option value='4' >换热器</Option>
                                                    <Option value='5' >储水罐</Option>
                                                    <Option value='6' >阀门</Option>
                                                    <Option value='7'>盘管</Option>
                                                    <Option value='8'>换热器</Option>
                                                    <Option value='9'>冷机</Option>
                                                    <Option value='10'>热泵</Option>
                                                    <Option value='0' >其他</Option>
                                                </Select>
                                            )
                                        }
                                </FormItem>
                                    
                             </Col>
                             <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='模板类型'
                                    >
                                        {
                                            getFieldDecorator('templateType',{
                                                initialValue:'',
                                                rules : [{required : true,message:'请选择模板类型'}]
                                            })(<Select>
                                                  {
                                                        (templatesList!=0)?
                                                        templatesList.map(
                                                            row => (
                                                                <Option key={row.id} value={row.id.toString()}>{row.name}</Option>
                                                            )
                                                        ):''
                                                  }                                                  
                                                </Select>
                                            )
                                        }
                                </FormItem>
                            </Col>
                        </Row>  
                        <Row>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='安装位置'
                                    >
                                        {
                                            getFieldDecorator('installLocation',{
                                                initialValue:'',
                                                // rules : [{required : true,message:'请填写安装位置'}]
                                            })(<Input/>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                 <FormItem
                                    {...formItemLayout}
                                    label='所属区域'
                                    >
                                        {
                                            getFieldDecorator('area',{
                                                initialValue:'',
                                                // rules : [{required : true,message:'请选择所属区域'}]
                                            })(
                                                <Select>
                                                   {    
                                                       (areaList.length != 0) ? 
                                                            areaList.map(
                                                                row => (
                                                                    <Option key={row.id} value={row.id.toString()}>{row.areaName}</Option>
                                                                )
                                                            ) 
                                                        :
                                                        ''

                                                   }
                                                </Select>
                                            )
                                        }
                                </FormItem>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='保养状态'
                                    >
                                        {
                                            getFieldDecorator('maintenanceStatus',{
                                                initialValue:'0',
                                                // rules : [{required : true,message:'保养状态'}]
                                            })(<Select>
                                                <Option value='0' >未处理</Option>
                                                <Option value='1' >处理中</Option>
                                                <Option value='2' >已处理</Option>
                                                <Option value='3' >无需保养</Option>
                                            </Select>)
                                        }
                                </FormItem>
                            </Col>
                        </Row>  
                        <Row>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='通信状态'
                                    >
                                        {
                                            getFieldDecorator('communicateStatus',{
                                                initialValue:'0',
                                                // rules : [{required : true,message:'通信状态'}]
                                            })(<Select>
                                                <Option value='0' >已断开</Option>
                                                <Option value='1' >运行中</Option>
                                            </Select>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='直播地址'
                                >
                                        {
                                            getFieldDecorator('online_addr',{
                                                initialValue : ''
                                            })(<Input />)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='维修状态'
                                    >
                                        {
                                            getFieldDecorator('repairStatus',{
                                                initialValue:'0',
                                                // rules : [{required : true,message:'维修状态'}]
                                            })(<Select>
                                                <Option value='0' >未处理</Option>
                                                <Option value='1' >处理中</Option>
                                                <Option value='2' >已处理</Option>
                                                <Option value='3' >无需维修</Option>
                                            </Select>)
                                        }
                                </FormItem>
                            </Col>
                        </Row>  
                         <Row>
                            {/* <Col span={12} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='设备二维码生成'
                                    >
                                        {
                                            getFieldDecorator('repairResponsiblePerson',{
                                                rules : [{required : true,message:'设备二维码生成'}]
                                            })(<Input/>)
                                        }
                                </FormItem>
                            </Col> */}
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='直播描述'
                                    >
                                        {
                                            getFieldDecorator('description',{
                                                initialValue : ''
                                            })(<Input />)
                                        }
                                </FormItem>
                            </Col>
                            
                        </Row>      
                        <FormItem>
                            <Button type="primary" htmlType="submit">提交</Button>
                        </FormItem> 
                    </Form>
            )
        }
    }
)

export default DeviceInfoView