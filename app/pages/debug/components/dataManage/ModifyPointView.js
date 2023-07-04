
import React from 'react'
import { Modal , Form ,Input,Tag,message } from 'antd'
import {Debug_modalTypes} from '../../../../common/enum'
import http from '../../../../common/http'
import CheckWorker from '../../../../common/checkWorker'
import s from './ModifyPointView.css'


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
class ModifyPointView extends React.Component{
    constructor(props){
        super(props)
        this.getChildComponents = this.getChildComponents.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.modifyPointValue = this.modifyPointValue.bind(this)
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
    modifyPointValue(value){
        const { hideModal , selectedIds , reloadTable ,tableLoading } = this.props
        var _this = this

        let valueList = selectedIds.map( name=>{
            return value
        })

        hideModal()
        return http.post('/pointData/setValue',{
            "pointList": selectedIds,
            "valueList": valueList,
            "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            data=>{
                if(!data.err){
                    tableLoading(true)
                    let checkWorker = new CheckWorker(function (info, next, stop) {
                        http.post('/get_realtimedata',{
                            pointList: selectedIds,
                            proj: 1
                          }).then(
                            data =>{
                                console.info( data )
                                var failedSetArr = []

                                for(let i = 0 ,len = data.length ; i<len ;i++){
                                    //将没有改值成功的添加到数组中
                                    if(typeof value === 'number' && !isNaN(value) ? parseFloat(data[i]['value']) != parseFloat(value) : data[i]['value'] != value){
                                        failedSetArr.push(data[i])
                                    }
                                }
                                lastFailedArr = failedSetArr
                                // lastFailedArr = [{
                                //     name:'测试点1'
                                // },{
                                //     name:'测试点2'
                                // },{
                                //     name:'测试点3'
                                // }]
                                if(failedSetArr.length){
                                    //执行下一次check，触发progress事件
                                    //如果达到设置的check次数，会还会触发complete
                                    next(); 
                                } else {
                                    // 直接停止，无需执行下一次 check
                                    // 会触发 progress 和 stop 事件
                                    stop();
                                }
                            }
                          )
                      }, {
                      // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
                    })
                    
                    checkWorker
                    .on('progress', function ({progress}) {console.info('progress', progress)})
                    .on('stop', function ({progress}) {
                        reloadTable()
                    })
                    .on('complete', function ({progress}) { 
                        tableLoading(false)
                       
                        if(lastFailedArr.length){
                            
                            ModalInfo({
                                title : '以下点位修改失败',
                                content: (
                                    <div>
                                        {_this.getInfo()}
                                    </div>
                                ),
                                onOk(){}
                            })
                        }

                    })
                    .start()
                }else{
                    Modal.error({
                        title: '错误提示',
                        content: "后台接口-接口通讯失败！"
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
                    title : '确定需要修改该这些点位吗？',
                    content : '选中点位都会被修改',
                    onOk(){
                        _this.modifyPointValue(fields.value)
                    },
                    onCancel(){}
                })
            }
        })
    }

    //获取组件
    getChildComponents(){
        const { 
            selectedIds,
            data,
        } = this.props
        if(!selectedIds.length) return null
        let Child = selectedIds.map( (name)=>{
            for( let i = 0 ,len = data.length ; i<len ;i++ ){
                if(name === data[i]['name']){
                    return (
                        <Tag key={name} >{name}</Tag>
                    )
                    break;
                }
            }
        })
        return Child
    }

    cancel=()=>{
        this.props.form.setFieldsValue({
            value:this.props.modal.props.value
        })
    }

    render(){
        const {
            modal ,
            hideModal,
        } = this.props
        const  {getFieldDecorator} = this.props.form
        let visible = Debug_modalTypes.MODIFY_POINT_MODAL === modal.type
        return (
                visible==true?
                <Modal
                    visible={true}
                    className={toggleModalClass}
                    onCancel={()=>{
                        this.cancel()
                        hideModal()
                    }}
                    maskClosable={false}
                    closable={false}
                    onOk={this.onSubmit}
                >
                <Form>
                    <FormItem>
                        <div className={s['modify-point']} >
                            您即将要修改以下点位的值:
                            {this.getChildComponents()}
                        </div>
                    </FormItem>
                    <FormItem
                        label="点值"
                        {...formItemLayout}
                    >
                    {getFieldDecorator('value',{
                        rules:[{
                            pattern : /^\S.*\S$|(^\S{0,1}\S$)/ , 
                            message:'首尾不能存在空格,请删除空格'
                        },{
                            required : true,
                            message:'请填写修改后的值'
                        }],
                        initialValue:modal.props.value
                    })(
                        <TextArea autoSize={{ minRows: 3, maxRows: 6 }}/>
                    )}
                    </FormItem>
                </Form>
            </Modal>
            :
            null  
        )
    }
}


export default Form.create({})(ModifyPointView);