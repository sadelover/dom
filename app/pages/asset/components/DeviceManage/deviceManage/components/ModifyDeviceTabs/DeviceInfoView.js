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
const DeviceInfoView = Form.create({
        mapPropsToFields : function(props){
            let table = props.table
            let modifyData = table.data.filter( (item)=>{
                if(item.id == table.selectedIds[0]) return item
            })
            let modifyDict = modifyData.length && modifyData[0]
            //使用obj保存变更后的属性类型
            let obj = ''
            if(modifyData.length){   
            }
            return {
                name : Form.createFormField({
                    value:modifyDict.name,
                }),
                type : Form.createFormField({
                    value:modifyDict['type']
                }),
                installLocation:Form.createFormField({
                    value:modifyDict['installLocation varchar']
                }),
                description:Form.createFormField({
                    value:modifyDict['description']
                }),
                communicateStatus:Form.createFormField({
                    value:modifyDict['communicateStatus']
                }),
                area:Form.createFormField({
                    value:modifyDict['area']  
                }),
                area_id:Form.createFormField({
                    value:modifyDict['area_id']
                }),
                model_id:Form.createFormField({
                    value:modifyDict['model_id']
                }),
                maintenanceStatus:Form.createFormField({
                    value:modifyDict['maintenanceStatus']
                }),
                repairStatus:Form.createFormField({
                    value:modifyDict['repairStatus']
                }),
                online_addr:Form.createFormField({
                    value:modifyDict['online_addr']
                })
                // result_describe : {
                //     value :modifyDict.target_describe
                // },
                // step_describe : {
                //     value :modifyDict.step_describe
                // }
                
            }
        }
    })   
    (
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
            const {form,addDeviceInfo,modifyList,hideModal,savePropertyInfo,template_id,equip_id,saveCurNewEquipId} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    //hideModal()
                    let data = []
                    for (let key in values) {
                        let obj = {}
                        obj[key]=values[key]
                        data.push(obj)
                    }
                    saveCurNewEquipId(equip_id,template_id)
                    let value = data.map(row=>{
                        switch(row['type']){
                            case "主机":
                            row['type'] = 1;
                             break;
                            case "水泵":
                            row['type'] = 2;
                             break;
                            case "冷却塔":
                            row['type'] = 3;
                              break;
                            case "换热器":
                            row['type'] = 4;
                              break;
                            case "储水罐":
                            row['type'] = 5;
                                break;      
                         }
                        switch(row['maintenanceStatus']){
                            case "未处理":
                                row['maintenanceStatus']=0;
                                break;
                            case "处理中":
                                row['maintenanceStatus']=1;
                                break;
                            case "已处理":
                                row['maintenanceStatus']=2;
                                break;
                            case "无需保养":
                                row['maintenanceStatus']=3;
                                break;
                             
                        }
                        switch(row['communicateStatus']){
                            case "已断开":
                                row['communicateStatus']=0
                                break;
                            case "运行中":
                                row['communicateStatus']=1
                                break;
                        }
                        switch(row['repairStatus']){
                            case "未处理":
                                row['repairStatus']=0
                            break;
                            case "处理中":
                                row['repairStatus']=1
                            break;
                            case "已处理":
                                row['repairStatus']=2
                            break;
                            case "无需维修":
                                row['repairStatus']=3
                            break;
                        } 
                        return row
                    })
                    
                    modifyList(value)
                    // _this.props.saveDeviceName(values.name)
                }
            })
        }
        render(){
            const {form,table,addDeviceInfo,areaList,templatesList,hideModal,savePropertyInfo,saveCurNewEquipId} = this.props
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
                                            getFieldDecorator('model_id',{
                                                rules : [{required : true,message:'请选择模板类型'}]
                                            })(<Select>
                                                  {
                                                        (templatesList!=0)?
                                                        templatesList.map(
                                                            row => (
                                                                <Option key={row.id} value={row.id}>{row.name}</Option>
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
                                            getFieldDecorator('area_id',{
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