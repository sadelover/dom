import React,{ Component } from 'react'
import Widget from './Widget.js'
import s from './CoolingView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';
import echarts from '../../../../lib/echarts-for-react';s
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import {addOperation} from '../../../../common/utils'
import L from './LightingControlList.css'
import ModelText from '../core/entities/modelText.js';
import { DatePicker,Form,Button,Modal,Table,Select,message,Spin,Alert,Row,Col,Card,Layout,Switch,Input,InputNumber,Tag} from 'antd';
import moment from 'moment'
const { Header, Footer, Sider, Content } = Layout;
const { RangePicker } = DatePicker;
const Option = Select.Option
const { Search } = Input;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
//弹窗
const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {
      span: 8
    },
    wrapperCol: {
      span: 15
    },
  }
  class CommandWindow extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onCancel = this.onCancel.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.checkPointRefresh = this.checkPointRefresh.bind(this)
        this.checkBackValue = this.checkBackValue.bind(this)
     }
     onCancel(){
        this.props.FANSwitchVisiable(false)
     }
     handleSubmit(){
        const {text,record,value,index,BackValue,BackPoint} = this.props
        this.props.FANSwitchVisiable(false)
        let StartTime = moment().format('YYYY-MM-DD HH:mm:ss')
        // //操作记录
        http.post('/pointData/setValue',{
            pointList:[text],
            valueList:[value.toString()],
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            data=>{
                if(data.err===0) {
                  this.checkPointRefresh(StartTime,text,value,index,1,BackValue)
                }
            }
        )
     }
     checkBackValue(StartTime,text,value,BackValue,count){
         let _this = this
         count=count+1
        const {BackPoint } = this.props
        setTimeout(http.post('/get_realtimedata', {
            "proj":1,
            "pointList":[BackPoint]
        }).then(
            data=>{
                if(data.length>0){
                    if(BackValue!==parseInt(data[0].value)){
                        addOperation("/operationRecord/add",{
                            "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                            "content":`在${StartTime}将${text}设置为${value==1?'开':'关'},检测指令和状态均成功
                            `
                        },'操作记录失败')
                    }else{
                        if(count<10){
                            setTimeout(function(){
                              _this.checkBackValue(StartTime,text,value,BackValue,count)
                            },15000)
                        }else{
                            let EndTime = moment().format('YYYY-MM-DD HH:mm:ss')
                            let date1 = new Date(StartTime);
                            let date2 = new Date(EndTime);
                            let s1 = date1.getTime();
                            let s2 = date2.getTime();
                            let total = (s2 - s1)/1000/60;
                        addOperation("/operationRecord/add",{
                            "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                            "content":`在${StartTime}将${text}设置为${value==1?'开':'关'},指令发送成功，但状态反馈检测${parseInt(total)}分钟仍不一致,认为反馈失败
                            `
                        },'改值操作记录失败')
                        }
                    }
                }
            }
        ).catch(
            err=>{

            }
        ),5000)
     }
     checkPointRefresh(StartTime,text,value,index,count,BackValue){
        let _this = this
         count=count+1
         http.post('/get_realtimedata', {
             "proj":1,
             "pointList":[text]
         }).then(
            data=>{
                if(data.length>0){
                    if(value==data[0].value){
                        this.checkBackValue(StartTime,text,value,BackValue,1)
                    }else{
                        if(count<10){
                            setTimeout(function(){
                                _this.checkPointRefresh(StartTime,text,value,index,count,BackValue)          
                            },15000)          
                        }else{
                                let EndTime = moment().format('YYYY-MM-DD HH:mm:ss')
                                let date1 = new Date(StartTime);
                                let date2 = new Date(EndTime);
                                let s1 = date1.getTime();
                                let s2 = date2.getTime();
                                let total = (s2 - s1)/1000/60;
                            addOperation("/operationRecord/add",{
                                "userName":`${localStorage.getItem('userInfo')&&JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                                "content":`在${StartTime}将${text}设置为${value},经过${parseInt(total)}分钟后仍不一致,认为设置失败`
                            },'改值操作记录失败')
                        }
                    }
                }
            }
         ).catch(
             err=>{
                let EndTime = moment().format('YYYY-MM-DD HH:mm:ss')
                let date1 = new Date(StartTime);
                let date2 = new Date(EndTime);
                let s1 = date1.getTime();
                let s2 = date2.getTime();
                let total = (s2 - s1)/1000/60;
                addOperation("/operationRecord/add",{
                    "userName":`${localStorage.getItem('userInfo')&&JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                    "content":`在${StartTime}将${text}设置为${value},经过${parseInt(total)}分钟后仍不一致,认为设置失败`
                },'改值操作记录失败')
             }
         )
     }
    render(){
        const {value,text,index,record,BackValue,BackPoint,FANSwitch,
            FANSwitchVisiable
        } = this.props
        return(
            <Modal
                title='确认指令'
                width={500}
                visible={FANSwitchVisiable}
                onCancel={this.onCancel}
                onOk= {this.handleSubmit}
            >
                {
                    <div>
                        是否确认将{text}{value==1?'设置为开':'设置为关'}?
                    </div>

                }
            </Modal>
        )
    }
}
class SettingValueModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.onCancel = this.onCancel.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      this.checkPointRefresh = this.checkPointRefresh.bind(this)
   }
    //点击确定，提交
    handleSubmit(e) {
      const {form,text,record,value,index,CurrentValue} = this.props
      this.props.FANSetting(false)
      let _this = this
      let StartTime = moment().format('YYYY-MM-DD HH:mm:ss')      
      form.validateFields((err,values)=>{
          if(!err){
              if(parseInt(values.settingValue)==parseInt(CurrentValue)){
                  form.resetFields()
                  return
              }else{
              http.post('/pointData/setValue',{
                  pointList:[text],
                  valueList:[values.settingValue],
                  source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
              }).then(
                  data=>{
                      if(data.err===0) {
                        _this.checkPointRefresh(StartTime,text,values.settingValue,index,1)
                        form.resetFields()  
                      }else{
                      }
                  }
              ).catch(
                  err=>{
                  }
              )            
              e.preventDefault();           
          }
         }
      })
    }
  checkPointRefresh(StartTime,text,value,index,count){
      let _this = this
      const {LightControlIndex } = this.props
       count=count+1
       http.post('/get_realtimedata', {
           "proj":1,
           "pointList":[text]
       }).then(
          data=>{
              if(data.length>0){
                  if(value==data[0].value){
                      addOperation("/operationRecord/add",{
                          "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                          "content":`在${StartTime}将${text}设置为${value},检测值设定成功
                          `
                      },'操作记录失败')
                  }else{
                      if(count<10){
                          setTimeout(function(){
                              _this.checkPointRefresh(StartTime,text,value,index,count)
                          },15000)
                      }else{
                        let EndTime = moment().format('YYYY-MM-DD HH:mm:ss')
                        let date1 = new Date(StartTime);
                        let date2 = new Date(EndTime);
                        let s1 = date1.getTime();
                        let s2 = date2.getTime();
                        let total = (s2 - s1)/1000/60;
                        addOperation("/operationRecord/add",{
                            "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                            "content":`在${StartTime}将${text}设置为${value},检测指令${parseInt(total)}分钟仍不一致,认为设置失败
                            `
                        },'改值操作记录失败')
                    }
                  }
              }else{
              }
          }
       ).catch(
           err=>{
              Modal.error({
                  title : '错误提示',
                  content :"无法获取点位数据!"
              });
              this.props.LightControlShow(false)
           }
       )
    }
    onCancel(){
        const{form} = this.props
        form.resetFields()
        this.props.FANSetting(false)
    }
    getForm = () => {
      const { getFieldDecorator } = this.props.form;
      const {CurrentValue} = this.props
      return (
          <Form>
              <FormItem
              {...formItemLayout}
              label="当前值："
              >
              {getFieldDecorator('currentValue', {
                  initialValue:CurrentValue,
              })(
                  <Input style={{width:160,backgroundColor:"transparent"}} disabled={true} />
              )}
              </FormItem>
              <FormItem
              {...formItemLayout}
              label="设置新值"
              >
              {getFieldDecorator('settingValue', {
                  initialValue:CurrentValue,
              })(
                  <Input style={{width:160}} />
              )}
              </FormItem>
          </Form>
      )
    }
    render() {
      const { getFieldDecorator } = this.props.form;
      const { FANSettingVisiable, 
          text,
          record,
          value,
          index,
          CurrentValue,
          FANSetting
        } = this.props;
      return (
        <Modal
          width={500}
          visible={FANSettingVisiable}
          onCancel={this.onCancel}
          onOk= {this.handleSubmit}
          maskClosable={false}
        >
        {
        this.getForm()  
        }
        </Modal>
      );
    }
  }
  const OptimizeValueModal = Form.create()(SettingValueModal);  
class FANControlList extends React.Component {
       constructor(props){
           super(props)
           this.state={
            columns:[
                {
                    title:this.initTitle('DDC编号'),
                    dataIndex:'DDCName',
                    key: 'DDCName',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:'pointer'}} onClick={()=>this.OpenEquipMentWindow()}>{text}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('设备名称'),
                    dataIndex:'EquipName',
                    key: 'EquipName',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']}>{text}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('DDC位置'),
                    dataIndex:'DDCPosition',
                    key: 'DDCPosition',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']}>{text}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('控制在线状态'),
                    dataIndex:'Online',
                    key: 'Online',
                    width: 70,
                    render:(text,record)=>{
                      if(parseInt(record['Online'])==0){
                            return (    
                                <div className={L['Center']}  style={{fontSize:"15px",cursor:'pointer'}} onContextMenu={(e)=>{this.RightClick(record['OnlineName'],e)}} >
                                   <span style={{background:'red',padding:"2px 10px 2px"}}>离线</span> 
                                </div>
                            )
                      }else if(parseInt(record['Online'])==1){
                            return (    
                                <div className={L['Center']}   style={{fontSize:"15px",cursor:'pointer'}} onContextMenu={(e)=>{this.RightClick(record['OnlineName'],e)}}>
                                    <span style={{background:'#87d068',padding:"2px 10px 2px"}}>在线</span> 
                                </div>
                            )
                        }
                    }
                },
                {
                    title:this.initTitle('故障诊断'),
                    dataIndex:'FaultDiagnosis',
                    key: 'FaultDiagnosis',
                    width: 120,
                    render:(text,record)=>{
                        if(parseInt(record['OnOffSetting'])===parseInt(record['OnOff'])){
                            return (    
                                <div className={L['Center']} style={{fontSize:"15px"}}>  
                                </div>
                            )
                        }else{
                            return (    
                                <div className={L['Center']}  style={{fontSize:"15px"}}>
                                   <span style={{background:'red',padding:"2px 10px 2px"}}>控反不一致</span> 
                                </div>
                            )
                        }
                      
                    }
                },
                {
                  title:this.initTitle('手动/自动'),
                  dataIndex:'AutoMode',
                  key: 'AutoMode',
                  width: 70,
                  render:(text,record)=>{
                    if(parseInt(record['AutoMode'])==0){
                        return (    
                            <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AutoModeName'],e)}}>
                               <span style={{background:'#ccc',padding:"2px 10px 2px"}}>手动</span> 
                            </div>
                        )
                    }else if(parseInt(record['AutoMode'])==1){
                        return (    
                            <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AutoModeName'],e)}}>
                               <span style={{background:'#2ea2f8',padding:"2px 10px 2px"}}>自动</span> 
                            </div>
                        )
                    }
                  }
                },
                {
                    title:this.initTitle('启停控制'),
                    dataIndex:'OnOffSetting',
                    key: 'OnOffSetting',
                    width: 130,
                    render:(text,record,index)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['OnOffSettingName'],e)}} >
                                {
                                    <div>
                                        <Button type={parseInt(record['OnOffSetting'])==0?"primary":"null"} disabled={parseInt(record['OnOffSetting'])==0?false:true}
                                            onClick={()=>this.ButtonChange(record['OnOffSettingName'],record,1,index,parseInt(record['OnOff']),record['OnOffName'])}
                                        >开启</Button>
                                        &nbsp;&nbsp;
                                        <Button type={parseInt(record['OnOffSetting'])==0?"null":"primary"} disabled={parseInt(record['OnOffSetting'])==0?true:false}
                                            onClick={()=>this.ButtonChange(record['OnOffSettingName'],record,0,index,parseInt(record['OnOff']),record['OnOffName'])}                                        
                                        >关闭</Button>
                                    </div>
                                }
                            </div>
                        )
                    }
                },
                {
                    title:this.initTitle('运行速度反馈'),
                    dataIndex:'Speed',
                    key: 'Speed',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['SpeedName'],e)}} >{parseInt(text)==0?'低速':(parseInt(text)==1?'中速':(parseInt(text)==2?'高速':"暂无"))  }</div>
                        )
                    }
                },
                {
                    title:this.initTitle('高低速运行速度设定'),
                    dataIndex:'SpeedSetting',
                    key: 'SpeedSetting',
                    width: 120,
                    render:(text,record,index)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['SpeedSettingName'],e)}} >   
                            <Input style={{width:"50px"}} value={parseInt(record['SpeedSetting'])} disabled />&nbsp;
                            <Button onClick={()=>this.showSettingValue(record['SpeedSettingName'],record,parseInt(text),index)} >设定</Button>
                        </div>
                        )
                    }
                },
                {
                title:this.initTitle('送排风机运行状态'),
                dataIndex:'OnOff',
                key: 'OnOff',
                width: 70,
                render:(text,record)=>{
                    if(parseInt(record['OnOff'])==0){
                        return (    
                        <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['OnOffName'],e)}}>
                        <span style={{background:'#ccc',padding:"2px 10px 2px"}}>关</span> 
                        </div>
                        )
                    }else if(parseInt(record['OnOff'])==1){
                        return (    
                        <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['OnOffName'],e)}}>
                            <span style={{background:'#87d068',padding:"2px 10px 2px"}}>开</span> 
                        </div>
                        )
                    }
                }
                },
                {
                title:this.initTitle('送排机故障'),
                dataIndex:'Err',
                key: 'Err',
                width: 70,
                render:(text,record)=>{
                    if(parseInt(record['Err'])==0){
                        return (    
                        <div className={L['Center']}  style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['ErrName'],e)}}>
                            <span style={{background:'#87d068',padding:"2px 10px 2px"}}>正常</span> 
                        </div>
                        )
                    }else if(parseInt(record['Err'])==1){
                        return (    
                        <div className={L['Center']}  style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['ErrName'],e)}}>
                            <span style={{background:'red',padding:"2px 10px 2px"}}>报警</span> 
                        </div>
                        )
                    }
                }
                }
            ],
            pointvalue:[],
            dataSource:[],
            pointNameList:[],
            data:[],
            Switchloading:false,    //按钮开关
            loading:false,
            height:500,
            text:'',
            record:'',
            value:'',
            index:'',
            BackValue:'',
            BackPoint:'',
            FAUVisiable:false,
            CurrentValue:'',
            localDateSource:[]      
        }
        
        this.RenderList = this.RenderList.bind(this)
        this.renderLeftList = this.renderLeftList.bind(this)
        this.ButtonChange = this.ButtonChange.bind(this)
        this.showSettingValue = this.showSettingValue.bind(this)
        this.OpenEquipMentWindow = this.OpenEquipMentWindow.bind(this)
        this.Onchange = this.Onchange.bind(this)
    }
    static get defaultProps() {
            return {
            points: [],
            data:[]
            }
    }
    initTitle(colName){
        return <span style={{display:'table',margin:'0 auto'}}>{colName}</span>
    }
    componentWillMount(){
        this.RenderList(0)
    }
    componentDidMount(){
        this.RenderList(0)
        let newArr = this.props.config.groups
        if(newArr!==undefined){
             document.getElementById('FAN_Select').childNodes[0].style.backgroundColor='#2ea2f8'    
        }
    }
    componentWillReceiveProps(nextProps){
        if(this.props.FANControlDataSource!==nextProps.FANControlDataSource){
            this.setState({
                localDateSource:[]
            })
        }
    }

    //打开空调箱链接界面
    OpenEquipMentWindow(){
        let obj = {}
        obj['pageId']='470001712'
        obj['title']='B02_35#EAF'
        obj['isTemplate'] = true 
        obj['templateConfig'] = {'1':'B02_','2':'35'}
        this.props.showObserverModal(obj)
    }
    Onchange(value){
        let Arr = this.props.FANDataSource.filter((row,index)=>{
            if(row['DDCPosition'].match(value)) return row
        })
        this.setState({
            localDateSource:Arr
        })
    }
    //开启或关闭
    ButtonChange(text,record,value,index,BackValue,BackPoint){
        this.props.FANSwitchVisiable(true)
        this.setState({
            text:text,
            record:record,
            value:value,
            index:index,
            BackValue:BackValue,
            BackPoint:BackPoint
        })
    }
    //设定值
    showSettingValue(text,record,value,index){
        this.props.FANSetting(true)
        this.setState({
            text:text,
            record:record,
            value:value,
            index:index,
            CurrentValue:value
        })
    }
    RightClick(name,event){
        let _this = this
        event.persist()
        let  model = new ModelText()
        model.idCom = name
        let  isInfo = {
            "isInModal":false
        }
        //重新定义函数，继承原函数所有的属性和函数        
        model.options = {
            getTendencyModal: _this.props.getTendencyModal,
            showCommomAlarm: _this.props.showCommomAlarm,
            showMainInterfaceModal:_this.props.showMainInterfaceModal
        }
        http.post('/analysis/get_point_info_from_s3db',{
            "pointList": [name]
        }).then(
            data=>{
                if(data.err==0){
                    model.description = data.data.realtimeValue[0].description
                    model.idCom = data.data.realtimeValue[0].name
                    model.value = data.data.realtimeValue[0].value
                    model.sourceType = data.data[name].sourceType
                    let clientWidth = document.documentElement.clientWidth,
                    clientHeight = document.documentElement.clientHeight - 32 - 56 - 48;
                    let svgChart = document.getElementsByClassName("svgChart");
                    let widthScale = 0, heightScale = 0;
                    widthScale = clientWidth/1920 
                    heightScale = clientHeight/955
                    event.offsetX = event.clientX-5,
                    event.offsetY = event.clientY-80
                    model.showModal(event,isInfo,widthScale,heightScale)
                }else{
                    message.error("数据请求失败")
                }
            })
                
                // setTimeout(function(){
                   
                // },400)
    }
    //渲染左侧一列
    renderLeftList(list){
         if(list.length>0){
          let arr = list.map((item,index)=>{
                return (
                    <div title={item.name} style={{background:'none',color:"white",borderBottom:"1px solid #ccc",textAlign:'center',cursor:'pointer',lineHeight:'35px'}} 
                    onClick={(e)=>{this.selectList(item.name,list,index,e)}}   
                    >{item.name}
                    </div>
                )
            })
            return arr
        }
    }
    //筛选对应的列表
    selectList(name,list,index,e){
        this.renderLeftList(list)
        let arr = document.getElementById('FAN_Select').childNodes
         for(let i=0;i<arr.length;i++){
             arr[i].style.backgroundColor='transparent'
         }
        e.target.style.backgroundColor='#2ea2f8'
        this.props.FANloading(true)
        this.RenderList(index)
    }
    //刷新dataSource函数
    RenderList=(index)=>{
        // 过滤
        const {columns} = this.state
        let Arr = this.props.config.hideProperties
        if(Arr!==undefined&&Arr.length>0){
            for(let i=0;i<Arr.length;i++){
                columns.map((e,f)=>{
                    if(e['dataIndex']==Arr[i]){
                        columns.splice(f,1)
                    }
                })
            }
        }
        this.setState({
            columns:columns
        }) 

        this.props.FANloading(true) 
        let newArr = this.props.config.groups
        if(newArr!==undefined){
            let pointList = []
            //先取点位，取出数据
            newArr[index].children.map((row,index)=>{
                    //新建一个点名
                pointList.push(`${row['Prefix']}AutoMode${row['No']}`) 
                pointList.push(`${row['Prefix']}OnOffSetting${row['No']}`)
                pointList.push(`${row['Prefix']}Online${row['No']}`)
                pointList.push(`${row['Prefix']}SpeedSetting${row['No']}`)
                pointList.push(`${row['Prefix']}Speed${row['No']}`)
                pointList.push(`${row['Prefix']}OnOff${row['No']}`)
                pointList.push(`${row['Prefix']}Err${row['No']}`)
            })
            let bodyArr = []
            http.post('/get_realtimedata', {
                    "proj":1,
                    "pointList":pointList
                }).then(
                    data=>{
                        if(data.length>0){
                            newArr[index].children.map((A,B)=>{
                                let obj = {}
                                obj['id'] = B
                                obj['DDCName'] = A['DDCName']
                                obj['DDCPosition'] = A['DDCPosition']
                                obj['EquipName'] = A['EquipName']
                                data.map((C,D)=>{
                                    if(C['name']===`${A['Prefix']}AutoMode${A['No']}`){
                                        obj['AutoMode'] = C['value']
                                        obj['AutoModeName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}OnOffSetting${A['No']}`){
                                        obj['OnOffSetting'] = C['value']
                                        obj['OnOffSettingName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}Online${A['No']}`){
                                        obj['Online'] = C['value']
                                        obj['OnlineName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}SpeedSetting${A['No']}`){
                                        obj['SpeedSetting'] = C['value']
                                        obj['SpeedSettingName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}Speed${A['No']}`){
                                        obj['Speed'] = C['value']
                                        obj['SpeedName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}OnOff${A['No']}`){
                                        obj['OnOff'] = C['value']
                                        obj['OnOffName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}Err${A['No']}`){
                                        obj['Err'] = C['value']
                                        obj['ErrName'] = C['name']
                                    }
                                })
                                bodyArr.push(obj)
                            })
                            this.props.FANData(bodyArr)
                            this.props.FANloading(false)
                        }else{
                            this.props.FANData([])
                            this.props.FANloading(false)
                        }
                    }
                )
        }
    }
    render() {
            const {

                FANData,FANControlDataSource,FANloading,FANloadingVisiable,
                FANSwitchVisiable,FANSwitch,FANSetting,FANSettingVisiable,
            showObserverModal
            } = this.props
            const {text,record,value,index,BackValue,BackPoint,FAUVisiable,CurrentValue} = this.state
           return (
               <div>
                    <Layout>
                        <Sider>
                            <div id="FAN_Select">
                                {this.renderLeftList(this.props.config.groups)}                                
                            </div>
                        </Sider>
                        <Layout>
                            <Header>
                                <Search  
                                    placeholder="输入内容"
                                    onSearch={(value)=>{this.Onchange(value)}}
                                    style={{ width:250,float:'right'}}
                                    size='large'
                                />
                            </Header>
                            <Content>
                                <Table
                                bordered={true}
                                columns={this.state.columns}
                                rowKey="id"                                
                                dataSource={this.state.localDateSource.length>0?this.state.localDateSource:this.props.FANControlDataSource}
                                loading={this.props.FANloadingVisiable}
                                scroll={{
                                    y:this.props.style.height
                                        }}
                                pagination={false}
                                ></Table>
                            </Content>
                        </Layout>
                    </Layout>
                    <OptimizeValueModal
                        FANSettingVisiable={FANSettingVisiable}
                        FANSetting={FANSetting}
                        text={text}
                        record={record}
                        value={value}
                        index={index}
                        CurrentValue={CurrentValue}
                    />
                    <CommandWindow   //开关指令窗口
                        FANSwitchVisiable={FANSwitchVisiable}
                        FANSwitch={FANSwitch}
                        text={text}
                        record={record}
                        value={value}
                        index={index}
                        BackValue={BackValue}
                        BackPoint={BackPoint}
                    />
               </div>
           )
       }
   }
   
  

/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'FanControlTable_V01',
    name : '组件',
    description : "送排风",
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * @class LineChartComponent
 * @extends {Widget}
 */
class FANControlListComponent extends Widget {
    constructor(props){
        super(props)
        this.state = {
            style : {},
            AirConditionZoneList:[]
        }
      
    }
    /* @override */
    static get type() {
        return registerInformation.type;
    }
    /* @override */
    static get registerInformation() {
        return registerInformation;
        
    }
    componentDidMount() {
        // style只提供基础的组件坐标和宽高，自定义需要增加逻辑
        const {style} = this.props
        this.setState({style})
    }
    /* @override */
    getContent() {
        const {style} = this.state
        return (
            <div style={style} className={s['container']} >    
                <FANControlList
                    {...this.props}
                />
            </div>
        )
    }
}

export default  FANControlListComponent