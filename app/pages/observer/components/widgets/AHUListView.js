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
        this.props.AHUSwitch(false)
     }
     handleSubmit(){
        const {text,record,value,index,BackValue,BackPoint} = this.props
        this.props.AHUSwitch(false)
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
        const {value,text,index,record,BackValue,BackPoint,AHUSwitchVisiable,
            AHUSwitch
        } = this.props
        return(
            <Modal
                title='确认指令'
                width={500}
                visible={AHUSwitchVisiable}
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
      this.props.AHUSetting(false)
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
            this.props.AHUSetting(false)
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
      const { AHUSettingVisiable, 
          text,
          record,
          value,
          index,
          CurrentValue,
          AHUSetting
        } = this.props;
      return (
        <Modal
          width={500}
          visible={AHUSettingVisiable}
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
class LightingControlList extends React.Component {
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
                    dataIndex:'pointOnline',
                    key: 'pointOnline',
                    width: 70,
                    render:(text,record)=>{
                      if(parseInt(record['pointOnline'])==0){
                            return (    
                                <div className={L['Center']}  style={{fontSize:"15px",cursor:'pointer'}} onContextMenu={(e)=>{this.RightClick(record['pointOnlineName'],e)}} >
                                   <span style={{background:'red',padding:"2px 10px 2px"}}>离线</span> 
                                </div>
                            )
                      }else if(parseInt(record['pointOnline'])==1){
                            return (    
                                <div className={L['Center']}   style={{fontSize:"15px",cursor:'pointer'}} onContextMenu={(e)=>{this.RightClick(record['pointOnlineName'],e)}}>
                                    <span style={{background:'#87d068',padding:"2px 10px 2px"}}>在线</span> 
                                </div>
                            )
                        }
                    }
                },{
                    title:this.initTitle('故障诊断'),
                    dataIndex:'pointFaultDiagnosis',
                    key: 'pointFaultDiagnosis',
                    width: 120,
                    render:(text,record)=>{
                        if(parseInt(record['pointOnOffSetting'])===parseInt(record['AHUSAFanOnOff'])&&parseInt(record['pointOnOffSetting'])===parseInt(record['AHUSAFanDPStatus'])&&parseInt(record['AHUSAFanOnOff'])===parseInt(record['AHUSAFanDPStatus'])){
                            return (    
                                <div className={L['Center']} style={{fontSize:"15px"}}>  
                                </div>
                            )
                            // ==parseInt(record['AHUSAFanDPStatus'])
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
                  dataIndex:'pointAutoMode',
                  key: 'pointAutoMode',
                  width: 70,
                  render:(text,record)=>{
                    if(parseInt(record['pointAutoMode'])==0){
                        return (    
                            <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['pointAutoModeName'],e)}}>
                               <span style={{background:'#ccc',padding:"2px 10px 2px"}}>手动</span> 
                            </div>
                        )
                    }else if(parseInt(record['pointAutoMode'])==1){
                        return (    
                            <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['pointAutoModeName'],e)}}>
                               <span style={{background:'#2ea2f8',padding:"2px 10px 2px"}}>自动</span> 
                            </div>
                        )
                    }
                  }
                },
                {
                    title:this.initTitle('启停控制'),
                    dataIndex:'pointOnOffSetting',
                    key: 'pointOnOffSetting',
                    width: 130,
                    render:(text,record,index)=>{
                      return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['pointOnOffSettingName'],e)}} >
                                {
                                    <div>
                                        <Button type={parseInt(record['pointOnOffSetting'])==0?"primary":"null"} disabled={parseInt(record['pointOnOffSetting'])==0?false:true}
                                            onClick={()=>this.ButtonChange(record['pointOnOffSettingName'],record,1,index,parseInt(record['AHUSAFanOnOff']),record['AHUSAFanOnOffName'])}
                                        >开启</Button>
                                        &nbsp;&nbsp;
                                        <Button type={parseInt(record['pointOnOffSetting'])==0?"null":"primary"} disabled={parseInt(record['pointOnOffSetting'])==0?true:false}
                                            onClick={()=>this.ButtonChange(record['pointOnOffSettingName'],record,0,index,parseInt(record['AHUSAFanOnOff']),record['AHUSAFanOnOffName'])}                                        
                                        >关闭</Button>
                                    </div>
                                }
                            </div>
                      )
                    }
                },
                {
                    title:this.initTitle('送风温度(°C)'),
                    dataIndex:'AHUAirTempSupply',
                    key: 'AHUAirTempSupply',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUAirTempSupplyName'],e)}} >{text}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('回风温度(°C)'),
                    dataIndex:'AHUAirTempReturn',
                    key: 'AHUAirTempReturn',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUAirTempReturnName'],e)}}   >{text}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('温度设定(°C)'),
                    dataIndex:'AHUAirTempSupplySetting',
                    key: 'AHUAirTempSupplySetting',
                    width: 120,
                    render:(text,record,    index)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUAirTempSupplySettingName'],e)}} >   
                            <Input style={{width:"50px"}} value={parseInt(record['AHUAirTempSupplySetting'])} disabled />&nbsp;
                            <Button onClick={()=>this.showSettingValue(record['AHUAirTempSupplySettingName'],record,parseInt(text),index)} >设定</Button>
                        </div>
                        )
                    }
                },
                {
                    title:this.initTitle('防冻报警'),
                    dataIndex:'AHUAntiFreezeAlarm',
                    key: 'AHUAntiFreezeAlarm',
                    width: 70,
                    render:(text,record)=>{
                      if(parseInt(record['AHUAntiFreezeAlarm'])==0){
                          return (    
                            <div className={L['Center']}  style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUAntiFreezeAlarmName'],e)}} >
                                <span style={{background:'#87d068',padding:"2px 10px 2px"}}>正常</span> 
                            </div>
                          )
                      }else if(parseInt(record['AHUAntiFreezeAlarm'])==1){
                          return (    
                            <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}}    onContextMenu={(e)=>{this.RightClick(record['AHUAntiFreezeAlarmName'],e)}}   >
                                <span style={{background:'red',padding:"2px 10px 2px"}}>报警</span> 
                            </div>
                          )
                      }
                    }
                  },
                  {
                    title:this.initTitle('冷水阀开度设定(%)'),
                    dataIndex:'AHUChWValvePositionSetting',
                    key: 'AHUChWValvePositionSetting',
                    width: 120,
                    render:(text,record,index)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUChWValvePositionSettingName'],e)}} >   
                            <Input style={{width:"50px"}} value={parseInt(record['AHUChWValvePositionSetting'])} disabled />&nbsp;
                            <Button onClick={()=>this.showSettingValue(record['AHUChWValvePositionSettingName'],record,parseInt(text),index)} >设定</Button>
                        </div>
                        )
                    }
                  },{
                    title:this.initTitle('冷水阀开度反馈(%)'),
                    dataIndex:'AHUChWValvePosition',
                    key: 'AHUChWValvePosition',
                    width: 70,
                    render:(text,record)=>{
                        return(
                             <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUChWValvePositionName'],e)}}>{text}</div>
                        )
                    }
                  },
                  {
                    title:this.initTitle('新风阀开度反馈(%)'),
                    dataIndex:'AHUOADamperPosition',
                    key: 'AHUOADamperPosition',
                    width: 70,
                    render:(text,record)=>{
                        return(
                             <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUOADamperPositionName'],e)}}>{text}</div>
                        )
                    }
                  },
                  {
                    title:this.initTitle('回风阀开度反馈(%)'),
                    dataIndex:'AHURADamperPosition',
                    key: 'AHURADamperPosition',
                    width: 70,
                    render:(text,record)=>{
                        return(
                             <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHURADamperPositionName'],e)}}>{text}</div>
                        )
                    }
                 },{
                    title:this.initTitle('风机状态'),
                    dataIndex:'AHUSAFanOnOff',
                    key: 'AHUSAFanOnOff',
                    width: 70,
                    render:(text,record)=>{
                      if(parseInt(record['AHUSAFanOnOff'])==0){
                          return (    
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUSAFanOnOffName'],e)}}>
                            <span style={{background:'#ccc',padding:"2px 10px 2px"}}>关</span> 
                         </div>
                          )
                      }else if(parseInt(record['AHUSAFanOnOff'])==1){
                          return (    
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUSAFanOnOffName'],e)}}>
                                <span style={{background:'#87d068',padding:"2px 10px 2px"}}>开</span> 
                            </div>
                          )
                      }
                    }
                  },
                  {
                    title:this.initTitle('送风机故障'),
                    dataIndex:'AHUSAFanErr',
                    key: 'AHUSAFanErr',
                    width: 70,
                    render:(text,record)=>{
                      if(parseInt(record['AHUSAFanErr'])==0){
                          return (    
                            <div className={L['Center']}  style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUSAFanErrName'],e)}}>
                                <span style={{background:'#87d068',padding:"2px 10px 2px"}}>正常</span> 
                            </div>
                          )
                      }else if(parseInt(record['AHUSAFanErr'])==1){
                          return (    
                            <div className={L['Center']}  style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUSAFanErrName'],e)}}>
                                <span style={{background:'red',padding:"2px 10px 2px"}}>报警</span> 
                            </div>
                          )
                      }
                    }
                  },
                  {
                    title:this.initTitle('风机压差状态'),
                    dataIndex:'AHUSAFanDPStatus',
                    key: 'AHUSAFanDPStatus',
                    width: 70,
                    render:(text,record)=>{
                      if(parseInt(record['AHUSAFanDPStatus'])==0){
                          return (    
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUSAFanDPStatusName'],e)}}>
                            <span style={{background:'#ccc',padding:"2px 10px 2px"}}>关</span> 
                         </div>
                          )
                      }else if(parseInt(record['AHUSAFanDPStatus'])==1){
                          return (    
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AHUSAFanDPStatusName'],e)}}>
                                <span style={{background:'#87d068',padding:"2px 10px 2px"}}>开</span> 
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
            AHUVisiable:false,
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
             document.getElementById('AHU_Select').childNodes[0].style.backgroundColor='#2ea2f8'    
        }
    }
    componentWillReceiveProps(nextProps){
        if(this.props.LightingControlDataSource!==nextProps.LightingControlDataSource){
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
        let Arr = this.props.AHUControlDataSource.filter((row,index)=>{
            if(row['DDCPosition'].match(value)) return row
        })
        this.setState({
            localDateSource:Arr
        })
    }
    //开启或关闭
    ButtonChange(text,record,value,index,BackValue,BackPoint){
        this.props.AHUSwitch(true)
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
        this.props.AHUSetting(true)
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
        let arr = document.getElementById('AHU_Select').childNodes
         for(let i=0;i<arr.length;i++){
             arr[i].style.backgroundColor='transparent'
         }
        e.target.style.backgroundColor='#2ea2f8'
        this.props.AHUloading(true)
        this.RenderList(index)
    }
    //刷新dataSource函数
    RenderList=(index)=>{
        this.props.AHUloading(true) 
        let newArr = this.props.config.groups
        if(newArr!==undefined){
            let pointList = []
            //先取点位，取出数据
            newArr[index].children.map((row,index)=>{
                    //新建一个点名
                pointList.push(`${row['Prefix']}AHUSAFanAutoMode${row['No']}`) 
                pointList.push(`${row['Prefix']}AHUSAFanOnOffSetting${row['No']}`)
                pointList.push(`${row['Prefix']}DDCOnline${row['No']}`)
                pointList.push(`${row['Prefix']}AHUAirTempSupply${row['No']}`)
                pointList.push(`${row['Prefix']}AHUAirTempReturn${row['No']}`)
                pointList.push(`${row['Prefix']}AHUAirTempSupplySetting${row['No']}`)
                pointList.push(`${row['Prefix']}AHUAntiFreezeAlarm${row['No']}`)
                pointList.push(`${row['Prefix']}AHUChWValvePositionSetting${row['No']}`)
                pointList.push(`${row['Prefix']}AHUChWValvePosition${row['No']}`)
                pointList.push(`${row['Prefix']}AHUOADamperPosition${row['No']}`)
                pointList.push(`${row['Prefix']}AHURADamperPosition${row['No']}`)
                pointList.push(`${row['Prefix']}AHUSAFanOnOff${row['No']}`)
                pointList.push(`${row['Prefix']}AHUSAFanErr${row['No']}`)
                pointList.push(`${row['Prefix']}AHUSAFanDPStatus${row['No']}`)
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
                                data.map((C,D)=>{
                                    if(C['name']===`${A['Prefix']}AHUSAFanAutoMode${A['No']}`){
                                        obj['pointAutoMode'] = C['value']
                                        obj['pointAutoModeName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUSAFanOnOffSetting${A['No']}`){
                                        obj['pointOnOffSetting'] = C['value']
                                        obj['pointOnOffSettingName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}DDCOnline${A['No']}`){
                                        obj['pointOnline'] = C['value']
                                        obj['pointOnlineName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUAirTempSupply${A['No']}`){
                                        obj['AHUAirTempSupply'] = C['value']
                                        obj['AHUAirTempSupplyName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUAirTempReturn${A['No']}`){
                                        obj['AHUAirTempReturn'] = C['value']
                                        obj['AHUAirTempReturnName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUAirTempSupplySetting${A['No']}`){
                                        obj['AHUAirTempSupplySetting'] = C['value']
                                        obj['AHUAirTempSupplySettingName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUAntiFreezeAlarm${A['No']}`){
                                        obj['AHUAntiFreezeAlarm'] = C['value']
                                        obj['AHUAntiFreezeAlarmName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUChWValvePositionSetting${A['No']}`){
                                        obj['AHUChWValvePositionSetting'] = C['value']
                                        obj['AHUChWValvePositionSettingName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUChWValvePosition${A['No']}`){
                                        obj['AHUChWValvePosition'] = C['value']
                                        obj['AHUChWValvePositionName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUOADamperPosition${A['No']}`){
                                        obj['AHUOADamperPosition'] = C['value']
                                        obj['AHUOADamperPositionName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUSAFanOnOff${A['No']}`){
                                        obj['AHUSAFanOnOff'] = C['value']
                                        obj['AHUSAFanOnOffName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUSAFanErr${A['No']}`){
                                        obj['AHUSAFanErr'] = C['value']
                                        obj['AHUSAFanErrName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHUSAFanDPStatus${A['No']}`){
                                        obj['AHUSAFanDPStatus'] = C['value']
                                        obj['AHUSAFanDPStatusName'] = C['name']
                                    }else if(C['name']===`${A['Prefix']}AHURADamperPosition${A['No']}`){
                                        obj['AHURADamperPosition'] = C['value']
                                        obj['AHURADamperPositionName'] = C['name']
                                    }
                                })
                                bodyArr.push(obj)
                            })
                            this.props.AHUControlData(bodyArr)
                            this.props.AHUloading(false)
                        }else{
                            this.props.AHUControlData([])
                            this.props.AHUloading(false)
                        }
                    }
                )
        }
    }
    render() {
            const {AHUControlData,AHUControlDataSource,AHUloading,AHUloadingVisiable,
            AHUSwitchVisiable,AHUSwitch,AHUSetting,AHUSettingVisiable,
            showObserverModal
            } = this.props
            const {text,record,value,index,BackValue,BackPoint,AHUVisiable,CurrentValue} = this.state
           return (
               <div>
                    <Layout>
                        <Sider>
                            <div id="AHU_Select">
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
                                dataSource={this.state.localDateSource.length>0?this.state.localDateSource:this.props.AHUControlDataSource}
                                loading={this.props.AHUloadingVisiable}
                                scroll={{
                                    y:this.props.style.height
                                        }}
                                pagination={false}
                                ></Table>
                            </Content>
                        </Layout>
                    </Layout>
                    <OptimizeValueModal
                        AHUSettingVisiable={AHUSettingVisiable}
                        AHUSetting={AHUSetting}
                        text={text}
                        record={record}
                        value={value}
                        index={index}
                        CurrentValue={CurrentValue}
                    />
                    <CommandWindow   //开关指令窗口
                        AHUSwitchVisiable={AHUSwitchVisiable}
                        AHUSwitch={AHUSwitch}
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
    type : 'AHUControlTable',
    name : '组件',
    description : "空调箱支路组件",
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * @class LineChartComponent
 * @extends {Widget}
 */
class AHUControlListComponent extends Widget {
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
                <LightingControlList
                    {...this.props}
                />
            </div>
        )
    }
}

export default  AHUControlListComponent