import React from 'react'
import {Modal,Button,Form,Table,Input,Select,Row,Col,DatePicker} from 'antd'
import AddModalView from './AddModalView';
import ModifyModalView from './ModifyModalView'
const { RangePicker } = DatePicker;
const FormItem = Form.Item
const Option  = Select.Option
const dateFormat = 'YYYY/MM/DD';
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
const RecordView = Form.create()(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state={
                dataStrings0:"",
                dataStrings1:"",
                status:"",
                selIds:[],
                modal:{
                    type:'',
                    visible:false
                }
            }
            this.onSelectChange=this.onSelectChange.bind(this);
            this.removeFunction = this.removeFunction.bind(this);
            this.searchList = this.searchList.bind(this);
            this.add = this.add.bind(this);
            this.modifyFunction = this.modifyFunction.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.columns=[
                {
                    title: '序号',
                    dataIndex: 'no',
                    key:'no',
                    width: 60
                },{
                    title: '更换时间',
                    dataIndex: 'operate_time',
                    key:'operate_time',
                    width: 200
                },{
                    title: '更换说明',
                    dataIndex: 'describe',
                    key:'describe',
                    width: 200
                }
            ]
           
        }

componentWillMount(){
    this.searchList();
}

        onSelectChange(selIds){
            this.setState({
                selIds:selIds
             })
        }
        searchList(){
            this.props.searchRecord();
        }
        
        add(){
            this.setState({
                modal:{
                    type:'addModalView',
                    visible:true
                }
            })
            this.props.show();
            //this.props.showModal(modalTypes.ADD_MODAL,{});
        }


        modifyFunction(){
            let value = this.state.selIds.length;
            switch(value){
                case 0:
                Modal.confirm({title:'请至少选则一条信息进行编辑'})
                    break;
                case 1:
                this.props.showModify()
                    break;
                default:
                Modal.confirm({title:'请选则一条信息进行编辑'})
            }
        }

        removeFunction(){
            switch(this.state.selIds.length){
                case 0:
                Modal.confirm({title:'请至少选则一条信息进行编辑'})
                    break;
                default :
                    let ids = [];
                    for(let i=0;i<this.state.selIds.length;i++){
                        let k = this.props.table.recordData[this.state.selIds[i]]
                        let j = k['id'];
                    ids.push(j);
                    }
                    this.props.removeFunction(ids);
                    this.state.selIds=[];
                    this.props.searchRecord();
                    break;
               
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
            const {form,rowKey,selectedIds,onSelectChange,table,onListSearch,hideModal,hide,show,hideModify,showModify,showModal,modal,addList,searchRecord,addFunction,modifyFunction,removeFunction
            } = this.props
            const {getFieldDecorator} = form
            const columns = this.columns;
            let selIds=this.state.selIds
            
            return (
                <div>
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col span={3} style={{ textAlign: 'right' }}>
                                <FormItem
                                    {...formItemLayout}
                                    label=''
                                    >
                                        {
                                            getFieldDecorator('add')
                                            (<Button  onClick={ this.add }>添加</Button>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={3} >
                                <FormItem
                                    {...formItemLayout}
                                    label=''
                                    >
                                        {
                                            getFieldDecorator('modify')
                                            (<Button onClick={this.modifyFunction}>修改</Button>)
                                        }
                                </FormItem>
                            </Col>
                            <Col span={3} >
                                <FormItem
                                    {...formItemLayout}
                                    label=''
                                    >
                                        {
                                            getFieldDecorator('delete')
                                            (<Button onClick={this.removeFunction}>删除</Button>)
                                        }
                                </FormItem>
                            </Col>
                            </Row>
                        <Table
                        dataSource={table.recordData} 
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
                    </Form>
                     <AddModalView
                    hideModal={hideModal}
                    showModal={showModal}
                    modal={modal}
                    addList={addList}
                    table={table}
                    searchRecord={searchRecord}
                    addFunction={addFunction}
                    visible={this.state.modal.type==='addModalView'}
                    hide={hide}
                /> 
                   
                    <ModifyModalView
                        hideModal={hideModal}
                        showModal={showModal}
                        modal={modal}
                        table={table}
                        searchRecord={searchRecord}
                        modifyFunction={modifyFunction}
                        visible = {this.state.modal.type==='modifyModalView'}
                        selIds = {this.state.selIds[0]}
                        hideModify={hideModify}
                        showModify={showModify}
                    />
                </div>
            )
        }
    }
)

export default RecordView