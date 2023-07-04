
import React from 'react'
import { Modal , Form ,Input,Tag,message } from 'antd'
import {Debug_modalTypes} from '../../../../common/enum'
import http from '../../../../common/http'
import CheckWorker from '../../../../common/checkWorker'
import s from './ModifyPointFormulaView.css'


let toggleModalClass;
if(localStorage.getItem('serverOmd')=="persagy"){
    toggleModalClass='persagy-modal persagy-dashBoardLine-form'
  }

const { TextArea } = Input;
const FormItem = Form.Item
const ModalConfirm = Modal.confirm
const ModalInfo = Modal.info

var lastFailedArr //保存最后一次检查后修改失败的数据

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  };
class ModifyPointFormulaView extends React.Component{
    constructor(props){
        super(props)
        // this.getChildComponents = this.getChildComponents.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.modifyPointFormula = this.modifyPointFormula.bind(this)
        this.getInfo = this.getInfo.bind(this)
    }  
   
    getInfo(){
        return lastFailedArr.map( (item,i)=>{
            return (
                <p key={i} >{item.name}</p>
            )
        })
    }
    //通过接口修改点值
    modifyPointFormula(fields){
        const { hideModal , selectedIds , reloadTable ,tableLoading } = this.props
        var _this = this

        hideModal()
        return http.post('/point/editEquationForVPoint',{
            "pointName": selectedIds[0],
            "equation": fields.addr,
            "description": fields.desc,
            "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            data=>{
                if(!data.err){
                    Modal.success({
                        title: '成功提示',
                        content: '修改成功'
                    })
                    this.props.showPointInfo()
                }else{
                    Modal.error({
                        title: '错误提示',
                        content: '通讯失败,请稍后再试'
                    })
                }
            }
        )
        
    }

    //提交修改
    onSubmit(e){
        var _this = this
        e.preventDefault()
        this.props.form.validateFields( (err,fields)=>{
            if(!err){
                ModalConfirm({
                    title : '确定需要修改吗？',
                    content : '点配置内容会被修改',
                    onOk(){
                        _this.modifyPointFormula(fields)
                    },
                    onCancel(){}
                })
            }
        })
    }

    // //获取组件
    // getChildComponents(){
    //     const { 
    //         selectedIds,
    //         data,
    //     } = this.props
    //     if(!selectedIds.length) return null
    //     let Child = selectedIds.map( (name)=>{
    //         for( let i = 0 ,len = data.length ; i<len ;i++ ){
    //             if(name === data[i]['name']){
    //                 return (
    //                     <Tag key={name} >{name}</Tag>
    //                 )
    //                 break;
    //             }
    //         }
    //     })
    //     return Child
    // }

    // cancel=()=>{
    //     this.props.form.setFieldsValue({
    //         value:this.props.modal.props.value
    //     })
    // }

    render(){
        const {
            modal ,
            hideModal,
        } = this.props
        const  {getFieldDecorator} = this.props.form
        let visible = Debug_modalTypes.MODEL_FORMULA_MODAL === modal.type
        return (
                visible==true?
                <Modal
                    title="修改点配置公式"
                    visible={true}
                    className={toggleModalClass}
                    onCancel={()=>{
                        // this.cancel()
                        hideModal()
                    }}
                    maskClosable={false}
                    closable={false}
                    onOk={this.onSubmit}
                >
                <Form>
                    <FormItem
                        label="点注释"
                        {...formItemLayout}
                    >
                    {getFieldDecorator('desc',{
                        rules:[{
                            pattern : /^\S.*\S$|(^\S{0,1}\S$)/ , 
                            message:'首尾不能存在空格,请删除空格'
                        },{
                            required : true,
                            message:'请填写修改后的点注释'
                        }],
                        initialValue:modal.props.desc
                    })(
                        <TextArea autoSize={{ minRows: 3, maxRows: 6 }}/>
                    )}
                    </FormItem>
                    <FormItem
                        label="公式表达式"
                        {...formItemLayout}
                    >
                    {getFieldDecorator('addr',{
                        rules:[{
                            pattern : /^\S.*\S$|(^\S{0,1}\S$)/ , 
                            message:'首尾不能存在空格,请删除空格'
                        },{
                            required : true,
                            message:'请填写修改后的公式'
                        }],
                        initialValue:modal.props.addr
                    })(
                        <TextArea autoSize={{ minRows: 9, maxRows: 18 }}/>
                    )}
                    </FormItem>
                </Form>
            </Modal>
            :
            null  
        )
    }
}


export default Form.create({})(ModifyPointFormulaView);