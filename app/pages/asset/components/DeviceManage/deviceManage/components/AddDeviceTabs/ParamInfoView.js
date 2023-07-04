import React from 'react'
import {Modal,Button,Form,Input,Select,Row,Col} from 'antd'

const FormItem = Form.Item
const Option  = Select.Option

const formParameNameLayout ={
    labelCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
    }
}
const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16},
    }
};
const ParamInfoView = Form.create()(
    class extends React.PureComponent{
        constructor(props){           
            super(props)
            this.state = {
                imgsrc:''
            }
            this.onOk = this.onOk.bind(this)
            this.getFields = this.getFields.bind(this)
        }
        //点击提交表单时触发
        onOk(e){
            const {form,addParamInfo,equip_id,table} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    //将form里的对象整理为数组
                    let data = []
                    for (let key in values) {
                        let obj = {}
                        obj[key]=values[key]
                        data.push(obj)
                    }
                    console.log(data)
                    addParamInfo(data,equip_id,table.systemId)
                }
            })
        }
        getFields(table,getFieldDecorator) {                            
            if (table.paramInfo.length >0) {
                return table.paramInfo.map((row,index)=>{
                    return(
                        <Row>
                            <Col span={3} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formParameNameLayout}
                                    label="参数名称"
                                    key={index+"_1"}
                           
                                    >
                                        {   
                                            getFieldDecorator(`${row.paramCode}`+`${table.deviceData}`+"paramName",{
                                            initialValue:row.paramName
                                            })(<span> {row.paramName}</span>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={5} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label="参数编码"
                                    key={index+"_2"}
                                    >
                                        {
                                            getFieldDecorator(`${row.paramCode}`+`${table.deviceData}`+"paramCode",{
                                                initialValue:row.paramCode
                                            })(<Input style={{width:'180px'}}/>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={4} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formParameNameLayout}
                                    label="最小值" 
                                    key={index+"_3"}
                           
                                    >
                                        {
                                            getFieldDecorator(`${row.paramCode}`+`${table.deviceData}`+"minValue",{
                                                initialValue:row.minValue,
                                                rules : [{required : true,message:'请填写'}]
                                            })(<Input />)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={4} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formParameNameLayout}
                                    label="最大值" 
                                    key={index+"_4"}
                                   
                                    >
                                        {
                                            getFieldDecorator(`${row.paramCode}`+`${table.deviceData}`+"maxValue",{
                                                initialValue:row.maxValue,
                                                rules : [{required : true,message:'请填写'}]
                                            })(<Input />)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={4} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formParameNameLayout}
                                    label="单位" 
                                    key={index+"_5"}
                                   
                                    >
                                        {
                                            getFieldDecorator(`${row.paramCode}`+`${table.deviceData}`+"paramUnit",{
                                                initialValue:row.paramUnit,
                                                rules : [{required : true,message:'请填写'}]
                                            })(<Input />)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={4} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formParameNameLayout}
                                    label="指令" 
                                    key={index+"_6"}
                                   
                                    >
                                        {
                                            getFieldDecorator(`${row.paramCode}`+`${table.deviceData}`+'paramCommand',{
                                                initialValue:'',
                                                // rules : [{required : true,message:'请填写'}]
                                            })(<Input />)
                                        }
                                </FormItem>
                            </Col>
                        </Row>
                    )
                })
            }
            // }else{
            //     Modal.warning({
            //         title: '警告',
            //         content:'请先提交第一步的设备信息',
            //         closable:true,
            //         maskClosable:false,
            //         okText:'确定',
            //         onOk() {}
            //     });
            // }   
        }

        
        render(){
            const {form,equip_id,template_id,table,addParamInfo} = this.props  
            const {getFieldDecorator} = form
            const {imgsrc} = this.state
            return (
                    <Form onSubmit={this.onOk}>
                       
                            {this.getFields(table,getFieldDecorator)}
                        
                        <FormItem>
                            <Button type="primary" htmlType="submit">提交主机运行参数信息</Button>
                        </FormItem> 
                    </Form>
            )
        }
    }
)

export default ParamInfoView