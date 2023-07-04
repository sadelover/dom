import React from 'react'
import {Modal,Button,Form,Input,Select,Upload,Icon,Table,icon,Row,Col,DatePicker} from 'antd'

import moment from 'moment';
moment.locale('zh-cn');
//import EditableTableView from './EditableTableView'
const dateFormat = 'YYYY/MM/DD HH/mm/ss';
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

  
  

const ExamineView = Form.create({
    mapPropsToFields : function(props){
        let table = props.table
        let modifyData = table.searchData.filter( (item)=>{
            if(item.id == table.maintenId) return item
        })
        let modifyDict = modifyData.length && modifyData[0]
        
        //使用obj保存变更后的属性类型
        let obj = {}
        
        if(modifyData.length){
            
        }

        return {
            name : {
                value : modifyDict.name
            }
            
        }
    }
}





)(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state={
                visible:true,
                selIds:[],
                beginTime:"",
                result:"E"
            }
            
            this.onOk = this.onOk.bind(this)
            this.onSelectChange=this.onSelectChange.bind(this)
            this.onChange = this.onChange.bind(this)
            this.hide = this.hide.bind(this)
            this.onsubmit = this.onsubmit.bind(this)

        }
        
        
        shouldComponentUpdate(nextProps,nextState){//?????
            return true;
        }
        
        // componentWillReceiveProps(nextProps){
        //     if(this.props.visible!=nextProps.visible){
        //         this.setState({
        //             visible:false
        //         })
        //     }
        // }

        

        onsubmit(){
            let id = this.props.table.maintenId;
            let result = this.props.form.getFieldValue('operate_time');
            let describe = this.props.form.getFieldValue('describe')?this.props.form.getFieldValue('describe'):"";
            this.props.examineFunction(id,result,describe);
            this.props.onListSearch();
            this.props.hideExamine();
        }

        onSelectChange(selIds){
            this.setState({
                selIds:selIds
             })
        }

        // hendleChange(value){
        //     switch(value){
        //         case "E":this.setState({result:"E"});break;
        //         case "F":this.setState({result:"F"});break;
        //     }
        // }

        onChange(date,dateString) {
            this.setState({
                beginTime: dateString
            })
        }

        hide(){
            this.props.hideExamine()
        }

        //点击提交表单时触发
        onOk(e){
            const {form} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    this.props.hideExamine()
                }
            })
            this.props.form.resetFields();
        }

        
        render(){
            
            let selIds=this.state.selIds
            const {form,
                rowKey,
                modal,
                table,
                hideModal,
                selectedIds,
                onSelectChange, 
                pagination, 
                onShowSizeChange, 
                onPaginationChange,
                addFunction,
                visible
            } = this.props
            const {getFieldDecorator} = form
            //let visible = modalTypes.ADD_MODAL === modal.type ? true : false
            return (
                <Modal
                    title='维修审核'
                    visible={table.examineData?table.examineData:false}
                    onCancel={this.hide}
                    onOk={this.onOk}
                    footer={null}
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label='当前选择的保养任务'
                            >
                                {
                                    getFieldDecorator('name',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                        <Row>
                        <Col  span={35} style={{ textAlign: 'right' }}>
                        <FormItem
                            {...formItemLayout}
                            label=''
                            >
                                {
                                    getFieldDecorator('operate_time',)(<Select defaultValue="T" >
                                        <Option value="T">审核通过</Option>
                                        <Option value="F">审核不通过</Option>
                                        </Select>)
                                }
                        </FormItem>   
                            </Col>
                        <Col  span={35} style={{ textAlign: 'right' }}>
                        <FormItem
                            {...formItemLayout}
                            label=''
                            >
                                {
                                    getFieldDecorator('describe',)(<Input type="textarea"/>)
                                }
                        </FormItem>
                        </Col>
                            
                                <Col  span={12} style={{ textAlign: 'right' }}>
                                <FormItem
                            {...formItemLayout}
                            label=''
                            >
                                {
                                    getFieldDecorator('describe',)(<Button onClick={this.onsubmit}>提交</Button>)
                                }
                        </FormItem>
                                </Col>
                                <Col  span={12} style={{ textAlign: 'right' }}>
                                <FormItem
                            {...formItemLayout}
                            label=''
                            >
                                {
                                    getFieldDecorator('describe',)(<Button onClick={this.hide}>取消</Button>)
                                }
                        </FormItem>
                                </Col>
                            </Row>
                    </Form>
                </Modal>
            )
        }
    }
)

export default ExamineView