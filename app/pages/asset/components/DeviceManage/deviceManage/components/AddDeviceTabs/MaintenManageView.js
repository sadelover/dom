import React from 'react'
import {Modal,Button,Form,Table,Input,Select,Row,Col,DatePicker} from 'antd'
import moment from 'moment';
import MaintenAddView from './MaintenAddView'
import ExamineView from './ExamineView'
import AgainMaintenView from './AgainMaintenView'
import DetailsView from './DetailsView'
const { RangePicker } = DatePicker;
const FormItem = Form.Item
const Option  = Select.Option
const dateFormat = 'YYYY-MM-DD';
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
const style = {
    width:"80"
  };
const MaintenManageView = Form.create()(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state={
                dataStrings0:"",
                dataStrings1:"",
                status:"",
                selIds:[]
            }
            this.onSelectChange=this.onSelectChange.bind(this);
            this.removeFunction = this.removeFunction.bind(this);
            this.handleChange = this.handleChange.bind(this);
            this.onSearch = this.onSearch.bind(this);
            this.showAdd = this.showAdd.bind(this);
            this.showExamine = this.showExamine.bind(this);
            this.showAgain = this.showAgain.bind(this);
            this.showDetails = this.showDetails.bind(this);
            this.onEnd = this.onEnd.bind(this);
            this.columns=[
                {
                    title: '序号',
                    dataIndex: 'no',
                    key:'no',
                    width: 60
                },{
                    title: '维修开始时间',
                    dataIndex: 'submitTime',
                    key:'submitTime',
                    width: 120
                },{
                    title: '维修结束时间',
                    dataIndex: 'createTime',
                    key:'createTime',
                    width: 120
                },{
                    title: '维修状态',
                    dataIndex: 'status',
                    key:'status',
                    width: 120
                },{
                    title: '维修情况描述',
                    dataIndex: 'description',
                    key:'description',
                    width: 120
                },{
                    title: '审核备注',
                    dataIndex: 'operation_instruction',
                    key:'operation_instruction',
                    width: 120
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    width: 120,
                    render:(text,record) => {
                          switch (record.status) {
                              case "未处理":
                                  return(<div><Button style={style} onClick={()=>{this.showAgain(record.id)}}>开始维修</Button></div>)
                                  break;
                              case "处理中":
                                  return(<div><Button style={style} onClick={()=>{this.onEnd("E",record.id,"")}}>提前结束</Button></div>)
                                  break;
                              case "待审核":
                                  return(<div><Button style={style} onClick={()=>{this.showExamine(record.id)}}>审核</Button></div>)
                                  break;
                              case "审核不通过":
                                  return(<div><Button style={style} onClick={()=>{this.showAgain(record.id)}}>重新维修</Button></div>)
                                  break;
                              case "审核通过":
                                  return(<div></div>)
                                  break;
                          }
                        }
                   
                },{
                    title: '详情',
                    dataIndex: 'result_status',
                    width: 150,
                    render:(text,record) => {                                                            //text,record
                        return <div><Button style={style} onClick={()=>{this.showDetails(record.id)}}>查看详情</Button></div>
                        // switch (record.status) {
                        //     case "未处理":
                        //         return(<div><Button style={style}>查看详情</Button></div>)
                        //         break;
                        //     case "处理中":
                        //         return(<div><Button style={style}>查看详情</Button></div>)
                        //         break;
                        //     case "待审核":
                        //         return(<div><Button style={style}>查看详情</Button></div>)
                        //         break;
                        //     case "审核不通过":
                        //         return(<div><Button style={style}>查看详情</Button></div>)
                        //         break;
                        //     case "审核通过":
                        //         return(<div><Button style={style}>查看详情</Button></div>)
                        //         break;
                        //}
                      }
                 
                }
            ]
           
        }

        onEnd(e,id,value){
            this.props.examineFunction(id,e,value);
            this.props.onListSearch();
        }
        onSelectChange(selIds){
            this.setState({
                selIds:selIds
             })
        }

        onSearch(){
            let status =  this.state.status;
            let time = this.props.form.getFieldValue('installLocation');
            let dataStrings0 = time!=[]&&time!=undefined?moment(time[0]).format(dateFormat)+" 00:00:00":"";
            let dataStrings1 = time!=[]&&time!=undefined?moment(time[1]).format(dateFormat)+" 00:00:00":"";
            this.props.onListSearch(status,dataStrings0,dataStrings1);
        }

        showDetails(id){
            this.props.showDetails(id);
        }

        showAdd(){
            this.props.showAdd();
        }

        showAgain(id){
            this.props.showAgain(id);
        }

        handleChange(value) {
            console.log(`selected ${value}`);
            switch(value){
                case "未处理":this.setState({status:"未处理"});break;
                case "处理中":this.setState({status:"处理中"});break;
                case "未审核（已处理）":this.setState({status:"未审核（已处理）"});break;
                case "审核不通过":this.setState({status:"审核不通过"});break;
                case "审核通过":this.setState({status:"审核通过"});break;
            }
        }
        showExamine(id){
            this.props.showExamine(id);
        }
        //  onPicker(datas,dataStrings){
        //      console.log(datas)
        //      console.log(dataStrings)
        //      this.setState({
        //         dataStrings0:dataStrings[0]+" 00:00:00",
        //         dataStrings1:dataStrings[1]+" 23:59:59"
        //      })
        //      let status = this.state.status;
        //      let dataStrings0 = this.state.dataStrings0;
        //      let dataStrings1 = this.state.dataStrings1;
        //      this.props.onListSearch(status,dataString0,dataString1);
        //  }

        removeFunction(){
            //[{"no":1},{"no":2},{"no":3},{"no":4}]
            //获取增加的文件

            let selIds=this.state.selIds //获取之前选中的文件的ID
            let delArray = [];
            for(let i=0;i<selIds.length;i++){
                let j = selIds[i];
                let id = this.props.table.searchData[j].id
                delArray.push(id);
            }
            this.props.removeList(delArray);
            this.props.onListSearch();
            this.setState({
                selIds:[]
            })
            //[1,2,3]={1:1,2:2}
            let selObj={};//定义一个json对象用来存储用户选中的selIds，格式为：{1:1,2:2,3:3,...}
            for(let i=0;i<selIds.length;i++){//存储ID
                selObj[selIds[i]]=selIds[i]
            }

        }

          handleSubmit = (e) => {
            e.preventDefault();
            this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
            });
        }
        render(){
            const {form,rowKey,selectedIds,onSelectChange,table,onListSearch,removeList,hideAdd,showAdd,hideExamine,showExamine,hideAgain,showAgain,examineFunction,searchInsUser,hideDetails,showDetails,distribute} = this.props
            const {getFieldDecorator} = form
            const columns = this.columns;
            let selIds=this.state.selIds
            return (
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label='维修状态'
                                    >
                                        {
                                            getFieldDecorator('name')
                                            (<Select defaultValue="未处理" onChange={this.handleChange}>
                                                    <option value="未处理">未处理</option>
                                                    <option value="处理中">处理中</option>
                                                    <option value="未审核（已处理）">未审核（已处理）</option>
                                                    <option value="审核不通过">审核不通过</option>
                                                    <option value="审核通过">审核通过</option>
                                                </Select>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={8} >
                                <FormItem
                                    {...formItemLayout}
                                    label='维修时间'
                                    >
                                        {
                                            getFieldDecorator('installLocation')
                                            (<RangePicker format={dateFormat} />)//onChange={()=>this.onPicker(this)}  onChange={this.onPicker}
                                        }
                                </FormItem>
                            </Col>
                            <Col span={2} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label=''
                                    >
                                        {
                                            getFieldDecorator('online_addr')
                                            (<Button onClick={this.onSearch}>查询</Button>)
                                        }
                                </FormItem>
                            </Col>
                            {/* <Col span={2} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label=''
                                    >
                                        {
                                            getFieldDecorator('online_addr')
                                            (<Button onClick={this.showAdd}>新建</Button>)
                                        }
                                </FormItem>
                            </Col> */}
                            <Col span={2} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label=''
                                    >
                                        {
                                            getFieldDecorator('online_addr')
                                            (<Button onClick={this.removeFunction}>删除</Button>)
                                        }
                                </FormItem>
                            </Col>
                        </Row> 
                        <Table
                        dataSource={table.searchData} 
                        columns={columns}
                        bordered={true}
                        
                               
                        rowKey={'no'}
                        rowSelection={{
                            selectedRowKeys: selIds,//前一次选择的ID列表
                            onChange:(selectedIds) => {  
                                this.onSelectChange(selectedIds)
                            }
                        }}
                        />
                        <MaintenAddView
                        table={table}
                        hideAdd={hideAdd}
                        />
                        <ExamineView
                        table={table}
                        hideExamine={hideExamine}
                        examineFunction={examineFunction}
                        onListSearch={onListSearch}
                        />
                        <AgainMaintenView
                        table={table}
                        hideAgain={hideAgain}
                        searchInsUser={searchInsUser}
                        distribute={distribute}
                        />
                        <DetailsView
                        table={table}
                        hideDetails={hideDetails}
                        />
                    </Form>
            )
        }
    }
)

export default MaintenManageView