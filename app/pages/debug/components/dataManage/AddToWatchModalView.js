import React from 'react';
import {Form,Select,Modal,message,Input,Icon,Button} from 'antd';
import objectId from '../../../../common/objectId'

let toggleModalClass;
if(localStorage.getItem('serverOmd')=="persagy"){
    toggleModalClass='persagy-modal persagy-dashBoardLine-form'
}

const FormItem = Form.Item
const Option = Select.Option
const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 },
    },
  };
class AddToWatchListForm extends React.Component{
    constructor(props){
        super(props)
        
        this.state = {
            tabList : []
        }

    }
    
    componentDidMount(){
        let tabList = localStorage.getItem('pointWatch') ? JSON.parse(localStorage.getItem('pointWatch')) : []
        this.setState( {tabList} )
    }

    handleOk = (e) => {
        const {tabList} = this.state //localStorage中包含的tab页面
        const {selectedIds} = this.props //即将添加的数据
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log(values)
                var newTabList = tabList.map( tab=>{
                    if(tab.key === values.key){
                        tab.watchList = Array.from(new Set([...tab.watchList,...selectedIds]))
                    }
                    return tab
                })
                localStorage.setItem('pointWatch',JSON.stringify(newTabList))
                // message.success('点位添加成功',2.5)
                this.props.hideModal()
            }
        });
    }

    getOptions = () => {
        return this.state.tabList.map( tab => {
            return (
                <Option value={tab.key} key={tab.key} >{tab.title}</Option>
            )
        })
    }

    // 更新localStorage
    updateLocalStorage = (tabList) => {
        localStorage.pointWatch = JSON.stringify(tabList)
    }

    createTab = () => {
        var classify = this.props.form.getFieldValue('classify')
        classify = classify.trim()
        if(!classify) return (
            Modal.error({
                title: '错误提示',
                content: "页面名称不能为空或者包含空格！"
              })
        )
        
        const tabList = this.state.tabList;
        const activeKey = objectId();
        tabList.push({ title: classify , watchList : [] , key: activeKey });
        this.setState({ tabList },()=>{
            this.props.form.setFieldsValue({ classify : ''})
            this.updateLocalStorage(this.state.tabList)
        });
    }

    render(){
        const {tabList} = this.state
        const {visible,hideModal,form}  = this.props
        const {getFieldDecorator} = form
        return (
            <Modal
                className={toggleModalClass}
                onCancel={hideModal}
                visible={visible}
                onOk={this.handleOk}
                maskClosable={false}
                title='页面选择'
            >
                <FormItem label="创建页面分类" {...formItemLayout} >
                    {getFieldDecorator('classify', {

                    })(
                        <Input style={{width:200}}   addonAfter={<Button onClick={this.createTab} style={{border:'none'}}> + </Button>}/>
                    )}
                </FormItem>
                <FormItem label="选择页面分类" {...formItemLayout} >
                    {getFieldDecorator('key', {
                        initialValue: tabList[0] && tabList[0].key || "",
                        rules: [{required : true,message:'请选择页面' }],
                    })(
                        <Select style={{width:200}}  >
                            {this.getOptions()}
                        </Select>
                    )}
                </FormItem>
            </Modal>
        )
    }
}

export default Form.create({})(AddToWatchListForm)