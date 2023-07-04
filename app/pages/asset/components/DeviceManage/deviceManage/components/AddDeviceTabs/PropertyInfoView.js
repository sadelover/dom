import React from 'react'
import {Modal,Button,Form,Input,Select,Row,Col} from 'antd'
import http from '../../../../../../../common/http'

const FormItem = Form.Item
const Option  = Select.Option

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 10 },
    },
  };


const PropertyInfoView = Form.create()(
    class extends React.PureComponent{
        constructor(props){           
            super(props)
            this.state = {
                imgsrc:''
            }
            this.onOk = this.onOk.bind(this)
            this.getFields = this.getFields.bind(this)
            this.confirm = this.confirm.bind(this)
        }
        //点击提交表单时触发
        onOk(e){
            const {form,addPropertyInfo,equip_id,table,template_id} = this.props
            e.preventDefault()
            if (table.propertyInfo.length === 0) {
                Modal.info({
                    title: '提示',
                    content:'资产信息为空，无法提交',
                    closable:true,
                    maskClosable:false,
                    okText:'确定',
                    onOk() {}
                });
                return
            }
            form.validateFields((err,values)=>{
                if(!err && values){
                    //将form里的对象整理为数组
                    let data = []
                    for (let key in values) {
                        let obj = {}
                        obj[key]=values[key]
                        data.push(obj)
                    }
                    console.log(data)
                    addPropertyInfo(data,equip_id,template_id)
                }
            })
        }
        confirm(){
            let equip_name = this.props.form.getFieldValue('equip_name')
            http.get(`/equipment/code/${equip_name}`).then(
                this.setState({
                    imgsrc:`/equipment/code/${equip_name}`
                })
                
            )
        }
        getFields(table,getFieldDecorator) {                            
            if (table.propertyInfo.length >0) {
                return table.propertyInfo.map((row,index)=>{
                    if (row.en_name == "name") {
                        return (
                            <Col span={8} style={{ textAlign: 'left' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label={row.cn_name}
                                    key={index}
                                >
                                    {
                                        getFieldDecorator(row.en_name, {
                                            initialValue: row.param_value,
                                            rules: [{ required: true, message: '请填写设备名称' }]
                                        })(<Input />)
                                    }
                                </FormItem>
                            </Col>
                        )
                    }else {
                        if (row.en_name == "identity") {
                            return (
                                <Col span={8} style={{ textAlign: 'left' }}>
                                    <FormItem
                                        {...formItemLayout}
                                        label={row.cn_name}
                                        key={index}
                                        // help="举例:Plant01Ch01"
                                    >
                                        {
                                            getFieldDecorator(row.en_name, {
                                                initialValue: row.param_value,
                                                rules: [{ required: true, message: '举例:Plant01Ch01' }]
                                            })(<Input placeholder= "举例:Plant01Ch01"/>)
                                        }
                                    </FormItem>
                                </Col>
                            )
                        }else {
                            if (row.en_name == "brand") {
                                return (
                                    <Col span={8} style={{ textAlign: 'left' }}>
                                        <FormItem
                                            {...formItemLayout}
                                            label={row.cn_name}
                                            key={index}
                                        >
                                            {
                                                getFieldDecorator(row.en_name, {
                                                    initialValue: row.param_value,
                                                    rules: [{ pattern:/^[0-9a-zA-Z]*$/g,required: true, message: '只能输入英文及数字' }]
                                                })(<Input />)
                                            }
                                        </FormItem>
                                    </Col>
                                )
                            }else {
                                if (row.en_name == "model") {
                                    return (
                                        <Col span={8} style={{ textAlign: 'left' }}>
                                            <FormItem
                                                {...formItemLayout}
                                                label={row.cn_name}
                                                key={index}
                                            >
                                                {
                                                    getFieldDecorator(row.en_name, {
                                                        initialValue: row.param_value,
                                                        rules: [{ required: true, message: '请填写设备型号' }]
                                                    })(<Input />)
                                                }
                                            </FormItem>
                                        </Col>
                                    )
                                }else {
                                    return (
                                        <Col span={8} style={{ textAlign: 'left' }}>
                                            <FormItem
                                                {...formItemLayout}
                                                label={row.cn_name}
                                                key={index}
                                            >
                                                {
                                                    getFieldDecorator(row.en_name, {
                                                        initialValue: row.param_value
                                                    })(<Input />)
                                                }
                                            </FormItem>
                                        </Col>
                                    )
                                }
                            }  
                        }
                    }
                })
            }
        }

        
        render(){
            const {form,addPropertyInfo,equip_id,template_id,table} = this.props
            const {getFieldDecorator} = form
            const {imgsrc} = this.state
            return (
                    <Form onSubmit={this.onOk}>
                        <Row>
                            {this.getFields(table,getFieldDecorator)}
                        </Row>
                        {/* <Row>
                            <Col span={10} style={{textAlign:'left'}} >
                                <div style={{marginLeft:'30px'}} > 
                                    {
                                        this.props.form.getFieldValue('equip_name')!=undefined?
                                        <img id="verficode"  style={{width:'100px',height:'100px'}} src={imgsrc}/>:''
                                    }
                                   
                                </div>                    
                            </Col>
                            <Col span={5}>
                                <Button  type='primary'  onClick={this.confirm}>确定</Button>
                            </Col>
                        </Row> */}
                        <FormItem>
                            <Button type="primary" htmlType="submit">提交资产信息</Button>
                        </FormItem> 
                    </Form>
            )
        }
    }
)

export default PropertyInfoView