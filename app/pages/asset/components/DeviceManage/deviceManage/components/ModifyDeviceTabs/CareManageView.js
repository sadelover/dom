import React from 'react'
import {Modal,Button,Form,Table,Input,Select,Row,Col,DatePicker} from 'antd'
import appConfig from '../../../../common/appConfig';
import http from '../../../../../../../common/http';
const { RangePicker } = DatePicker;
const FormItem = Form.Item
const Option  = Select.Option
const { TextArea} = Input;
const dateFormat = 'YYYY/MM/DD'
const format = 'YYYY-MM-DD'
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
  class CareDetail extends React.Component{
    constructor(props){
        super()
    }
    render(){
        const {table,form,careDetailsModel} = this.props
        const {getFieldDecorator} = form
        let data = table.caredata.filter((item)=>{
            if(item.id===table.careid) return item
        })
        let deviceName =''
        if(data.length!=0){
            deviceName = data[0].deviceName
        } 
        return (
            <Modal
            visible={table.detail}
            title='审核弹出窗口'
            onCancel={()=>{careDetailsModel(false)}}
            onOk={()=>{careDetailsModel(false)}}
            okText=''
            cancelText='确定'
            > 
            <FormItem
                    {...formItemLayout}
                    label='主机'
                    >
                        {
                            getFieldDecorator('deviceName',{
                                initialValue:deviceName
                            })
                            (<Input disabled={true} style={{background:'none',border:'none',opacity:1,color:'#ffff'}}/>)
                        }
            </FormItem>
            </Modal>
        )
    }
  }
  class CareAudits extends React.Component{
    constructor(props){
        super()
        this.Confirm = this.Confirm.bind(this)
    }
    Confirm(){
        const {table,careRender,careAuditModel} = this.props
        let app_reslut = this.props.form.getFieldValue('app_reslut')
        let app_remark = this.props.form.getFieldValue('app_remark')
        http.post('/care/approve',{
            "care_id":table.careid,
            "app_reslut":app_reslut,
            "app_remark":app_remark
        }).then(
            data=>{
                careAuditModel(false)
                careRender()
            }
        ).catch(
            err=>{
                careAuditModel(false)                
            }
        )
    }
    render(){
        const {table,form,careAuditModel} = this.props
        const {getFieldDecorator} = form
        return (
            <Modal
            visible={table.audit}
            title='审核弹出窗口'
            onCancel={()=>{careAuditModel(false)}}
            onOk={this.Confirm}
            okText='提交'
            > 
            <FormItem
                    {...formItemLayout}
                    label='当前选择的保养任务'
                    >
                        {
                            getFieldDecorator('title',{
                                initialValue:'AAAAA'
                            })
                            (<Input disabled={true} style={{background:'none',border:'none',opacity:1,color:'#ffff'}}/>)
                        }
            </FormItem>
            <FormItem
                {...formItemLayout}
                label='审核说明'
                >
                    {
                        getFieldDecorator('app_reslut',{
                            initialValue:'F'
                        })
                        (
                            <Select>
                                <Option value='T'>审批通过</Option>
                                <Option value='F'>审批不通过</Option>
                                <Option value='E'>提前结束</Option>    
                            </Select>
                        )
                    }
            </FormItem>
                <FormItem
                    {...formItemLayout}
                    label='原因说明'
                    >
                        {
                            getFieldDecorator('app_remark')
                            (<TextArea/>)
                        }
                </FormItem>
            </Modal>
        )
    }
}  
class CareAdvanced extends React.Component{
    render(){
        const {table,form,careAdvanceModel} = this.props
        const {getFieldDecorator} = form
        return (
            <Modal
            visible={table.advance}
            title='提前结束'
            onCancel={()=>{careAdvanceModel(false)}}
            okText='提前结束'
            > 
                <FormItem
                    {...formItemLayout}
                    label='原因说明'
                    >
                        {
                            getFieldDecorator('advance')
                            (<TextArea/>)
                        }
                </FormItem>
            </Modal>
        )
    }
}
class AagainMainten extends React.Component{
    constructor(props){
        super()
        this.Confirm = this.Confirm.bind(this)
    }
    Confirm(){
        const {table,careShowModel,careRender} = this.props
        let actionTime = this.props.form.getFieldValue('actionTime')
        http.post('/care/reNew',{
            "care_id":table.careid,
            "actionTime":actionTime.format('YYYY-MM-DD')
        }).then(
            data=>{
                if(data.status){
                    careRender()
                    careShowModel(false)
                }
            }
        )
    }
    render(){
        const {table,form,careShowModel} = this.props
        const {getFieldDecorator} = form
        return (
            <Modal
            visible={table.againvisible}
            title='重新保养'
            onCancel={()=>{careShowModel(false)}}
            onOk={this.Confirm}
            okText='确定重新保养'
            > 
                <FormItem
                    {...formItemLayout}
                    label='保养日期'
                    >
                        {
                            getFieldDecorator('actionTime')
                            (<DatePicker format="YYYY-MM-DD"/>)
                        }
                </FormItem>
            </Modal>
        )
    }
}

const CareManageView = Form.create()(
    class extends React.Component{
        constructor(props){
            super(props)
            this.state={  
            }
            this.search = this.search.bind(this)
            this.delete = this.delete.bind(this)
        }
        componentDidMount(){
            this.props.careRender()
        }
        //查询
        search(){
            const {careData,careLoading,table} = this.props
            let status = this.props.form.getFieldValue('name')
            let data = this.props.form.getFieldValue('installLocation')
            careLoading(true)
                http.post('/care/equipCareSearch',{
                    projectId:0,
                    pageSize:100,
                    targetPage:1,
                    "status":"",
                    "startTime":data[0].format('YYYY-MM-DD')?data[0].format('YYYY-MM-DD'):'',
                    "endTime":data[1].format('YYYY-MM-DD')?data[1].format('YYYY-MM-DD'):'',
                  }).then(
                    data=>{
                      if(data.status){
                        careData(data)
                        careLoading(false)
                      }
                    }
                  ).catch(
                    err=>{
                        careLoading(false)
                    }
                )
            }
            //删除
            delete(){
                const {table,careRender} = this.props
                http.post('/examination/removeExamination',{
                    delArray:table.careSelectedIds,
                    curPage:table.current,
                    pageSize:table.pageSize,
                    projectId:0
                  }).then(
                    data=>{
                      if(data.status){
                        careRender()
                      }
                    }
                  ).catch(
                      err=>{
                        careRender()
                        console.log("报错啦")
                      }
                  )
            }
        render(){
            const {form,table,click,careAdvance,careAdvanceModel,careShowModel,careRender,careSelectIds,careAudit,careAuditModel,
                careDetails,careDetailsModel} = this.props
            const {getFieldDecorator} = form
            let columns = [
                {title: '序号', dataIndex: 'no',key:'no', width: 60
                },{ title: '保养开始时间', dataIndex: 'actionTime', key:'actionTime', width: 200
                },{ title: '保养结束时间',dataIndex: 'submitTime', key:'submitTime',width: 200
                },{title: '保养状态',dataIndex: 'status', key:'status',width: 200
                },{title: '保养情况描述',  dataIndex: 'description', key:'description', width: 200
                },{title: '操作',dataIndex: 'operation', width: 250,
                render:(text,record) => {
                    switch (record.status) {
                        case "新建":
                            return(<div><Button type="primary">新建</Button>&nbsp;&nbsp;<Button type="primary" onClick={()=>{careDetails(record.id,true)}} >查看详情</Button></div>)
                            break;
                        case "处理中":
                            return(<div><Button type="primary" onClick={()=>{careAdvance(record.id,true)}}>提前结束</Button>&nbsp;&nbsp;<Button type="primary" onClick={()=>{careDetails(record.id,true)}}  >查看详情</Button></div>)
                            break;
                        case "待审核":
                            return(<div><Button type="primary"  onClick={()=>{careAudit(record.id,true)}} >审核</Button>&nbsp;&nbsp;<Button type="primary" onClick={()=>{careDetails(record.id,true)}} >查看详情</Button></div>)
                            break;
                        case "审核不通过":
                            return (<div><Button type="primary"   onClick={()=>{click(record.id,true)}}>重新保养</Button>&nbsp;&nbsp;<Button type="primary" onClick={()=>{careDetails(record.id,true)}} >查看详情</Button></div>)
                            break;  
                        case "已完成":
                            return(<div><Button type="primary">审核通过</Button>&nbsp;&nbsp;<Button type="primary" onClick={()=>{careDetails(record.id,true)}} >查看详情</Button></div>)
                            break;      
                        default:
                            break;
                    }
                }
            }]
            return (
                    <Form>
                        <Row>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='保养状态'
                                    >
                                        {
                                            getFieldDecorator('name',{
                                                initialValue:'1',
                                            })
                                            (<Select>
                                                    <Option value="1">未处理</Option>
                                                    <Option value="2">处理中</Option>
                                                    <Option value="3">未审核（已处理）</Option>
                                                    <Option value="4">审核不通过</Option>
                                                    <Option value="5">审核通过</Option>
                                            </Select>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={10} >
                                <FormItem
                                    {...formItemLayout}
                                    label='保养时间'
                                    >
                                        {
                                            getFieldDecorator('installLocation'   
                                            )
                                            (<RangePicker  format={dateFormat} />)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={2} style={{ textAlign: 'right' }}>                              
                                <Button onClick={this.search}>查询</Button>
                            </Col>
                            <Col span={2} style={{ textAlign: 'right' }}>
                                <Button onClick={this.delete} >删除</Button>
                            </Col>
                        </Row> 
                        <Table
                        dataSource={table.caredata} 
                        columns={columns}
                        bordered={true}
                        rowKey={'no'}
                        loading={table.careloading}
                        rowSelection={{
                            onChange:(selectedIds) => {  
                                careSelectIds(selectedIds)
                            }
                        }}
                        pagination={{
                            total:'5'
                        }}
                        />
                        <AagainMainten
                        careShowModel={careShowModel}
                        form={form}
                        table={table}
                        careRender={careRender}
                        />
                        <CareAdvanced
                        careAdvanceModel={careAdvanceModel}
                        form={form}
                        table={table}
                        />
                        <CareAudits
                        careAuditModel={careAuditModel}
                        form={form}
                        table={table}
                        careRender={careRender}
                        />
                        <CareDetail
                        careDetailsModel={careDetailsModel}
                        form={form}
                        table={table}
                        />
                    </Form>
            )
        }
    }
)
export default CareManageView