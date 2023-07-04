import React from 'react'
import {Modal,Button,Form,Col,Input,Select,Table,Tabs,Popconfirm,DatePicker} from 'antd'
import {modalTypes} from '../../../../../../common/enum'
import moment from 'moment';
import 'moment/locale/zh-cn';

//封装表单域
const FormItem = Form.Item
//封装了下拉
const Option  = Select.Option
//封装了 tab
const TabPane = Tabs.TabPane;
const {TextArea} = Input
//设置样式
const formItemLayout = {
    labelCol: {
      xs: { span: 24},
      sm: { span:6},
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12},
    },
};
const formTopicLayout = {
    labelCol:{
        xs:{span:24},
        sm:{span:12}
    },
    wrapperCol:{
        xs:{span:24},
        sm:{span:12}
    }
} 
const ModifyModalView = Form.create()(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state = {
                key:'1',
                tab:'',
                type:'',
                radio:'',
                select:'',
                judge:'',
                score:'',
                exam_id:'',
                dataSource: [],
                count:0,
                newArr:[],      //存放选题分值的数组
                addArr:[]       //新增的数组
              };       
            this.onOk = this.onOk.bind(this)
        }
        shouldComponentUpdate(nextProps,nextState){
            return true;
        }
        //点击提交表单时触发
        onOk(e){
            let name = this.props.form.getFieldValue('name')
            let describe = this.props.form.getFieldValue('describe')
            let arr = [name,describe]
            this.props.hideModal()
            this.props.modifyList(arr)
            this.props.form.resetFields()
        }
        render(){
            const { dataSource,radio,select,judge,score,tab,searchTitle} = this.state
            const columns = this.columns
            const {form,hideModal,modal} = this.props
            const {getFieldDecorator} = form
            const table = this.props.table   //获取表单的数据
            // let data  = table.data.filter((item)=>{
            //     if(item.id===table.selectedIds[0]) return item
            // })
            let data = table.data.filter((item)=>{
               if(item.id == table.selectedIds[0]) return item   //匹配选中表单的值
            })
            let name,describe = ''
            if(data.length!=0){
                describe = data[0].describe 
                name = data[0].name
            } 
            //是否显示新增页面的弹窗
            let visible = modalTypes.MODIFY_EXAM_MODAL === modal.type ? true : false
            return (
                <Modal 
                    title='修改考核'
                    visible={visible}
                    onCancel={hideModal}
                    onOk={this.onOk}
                    width={800}
                >
                    <Form>
                        <FormItem
                                {...formItemLayout}
                                label='模板名称'
                                >
                                {
                                    getFieldDecorator('name',{
                                        initialValue:name,
                                        rules : [{required : true,message:'请填写模板名称'}]
                                    })(<Input/>)
                                }
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label='模板描述'
                            >
                                {
                                    getFieldDecorator('describe',{
                                        initialValue:describe,
                                        rules : [{required : true,message:'请填写描述内容'}]
                                    })(<TextArea/>)
                                }
                        </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
)

export default ModifyModalView