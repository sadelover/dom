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
        sm: { span: 8 },
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


const ParamInfoView = Form.create({
    mapPropsToFields : function(props){
        let table = props.table
        console.log(table.propertyInfo)
        // let modifyData = table.data.filter( (item)=>{
        //     if(item.id == table.selectedIds[0]) return item
        // })
        // let modifyDict = modifyData.length && modifyData[0]
        // //使用obj保存变更后的属性类型
        // let obj = {}
        // if(modifyData.length){   
        // }
        // return {
        //     name : {
        //         value:modifyDict.name,
        //     },
        //     type : {
        //         value:modifyDict['type']
        //     }
        // }
    } 
})(
    class extends React.PureComponent{
        constructor(props){           
            super(props)
            this.state = {
                imgsrc:''
            }
            this.onOk = this.onOk.bind(this)
            this.getFields = this.getFields.bind(this)
        }
        componentDidMount(){
            // return  http.post('/api/equipment/getInitAsset',{
            //         "project_id":appConfig.project.id,
            //         "template_id":Number(values.templateType),
            //         "equip_id":data.data
            //     }).then(
            //         data=>{
                        
            //         }
            //     )
        }
        //点击提交表单时触发
        onOk(e){  
            const {form,addParamInfo,equip_id,table,saveCurNewEquipId} = this.props
            let modifyData = table.data.filter((item)=>{
                if(item.id == table.selectedIds[0]) return item
            })
            
            let modifyDict = modifyData.length && modifyData[0]
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
                    // saveCurNewEquipId('',equip_id)
                    addParamInfo(data,equip_id,table.systemId)
                }
            })
        }
        getFields(table,getFieldDecorator) {                            
            if (table.paramInfo.length >0) {
                return table.paramInfo.map((row,index)=>{
                    return(
                        <Row>
                            <Col span={5} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formParameNameLayout}
                                    label="参数名称"
                                    key={index+"_1"}
                           
                                    >
                                        {   
                                            getFieldDecorator(`${row.paramCode}`+"paramName",{
                                            initialValue:row.paramName
                                            })(<span> {row.paramName}</span>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={7} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label="参数编码"
                                    key={index+"_2"}
                                
                                    >
                                        {
                                            getFieldDecorator(`${row.paramCode}`+"paramCode",{
                                                initialValue:row.paramCode
                                            })(<Input style={{width:'180px'}} readOnly={true} />)
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
                                            getFieldDecorator(`${row.paramCode}`+"minValue",{
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
                                            getFieldDecorator(`${row.paramCode}`+"maxValue",{
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
                                            getFieldDecorator(`${row.paramCode}`+"paramUnit",{
                                                initialValue:row.paramUnit,
                                                rules : [{required : true,message:'请填写'}]
                                            })(<Input />)
                                        }
                                </FormItem>
                            </Col>
                        </Row>
                    )
                })
            }
        }
        render(){
            const {form,equip_id,template_id,table,addParamInfo,saveCurNewEquipId} = this.props  
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