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
        this.props.FAUSwitch(false)
     }
     handleSubmit(){
        const {text,record,value,index,BackValue,BackPoint} = this.props
        this.props.FAUSwitch(false)
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
     checkBackValue(StartTime,text,value,BackValue,count,type){
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
                            "content":`在${StartTime}将${text}设置为${value},检测指令和状态均成功
                            `
                        },'操作记录失败')
                    }else{
                        if(count<10){
                            setTimeout(function(){
                              _this.checkBackValue(StartTime,text,value,BackValue,count,type)
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
     checkPointRefresh(StartTime,text,value,index,count,BackValue,type){
        let _this = this
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
                            "content":`在${StartTime}将${text}设置为${value},检测指令和状态均成功
                            `
                        },'操作记录失败')
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
                    "content":`在${StartTime}将${text}设置为${type=='OnOff'&&value==1?'开':(
                        (type=='OnOff'&&value==0)?'关':(
                         type=='Enabled'&&value==1?'启用':'禁用'
                        ))},指令发送成功，但状态反馈检测${parseInt(total)}分钟仍不一致,认为反馈失败
                    `
                },'改值操作记录失败')
             }
         )
     }
    render(){
        const {value,text,index,record,BackValue,BackPoint,FAUSwitchVisiable,
            FAUSwitch,type
        } = this.props
        return(
            <Modal
                title='确认指令'
                width={500}
                visible={FAUSwitchVisiable}
                onCancel={this.onCancel}
                onOk= {this.handleSubmit}
            >
                {
                    <div>
                        是否确认将{text}{
                        type=='OnOff'&&value==1?'设置为开':(
                        (type=='OnOff'&&value==0)?'设置为关':(
                         type=='Enabled'&&value==1?'设置启用':'设置禁用'
                        ))}
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
      this.props.FAUSetting(false)
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
        this.props.FAUSetting(false)
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
      const { FAUSettingVisiable, 
          text,
          record,
          value,
          index,
          CurrentValue,
          FAUSetting
        } = this.props;
      return (
        <Modal
          width={500}
          visible={FAUSettingVisiable}
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
class FAUControlList extends React.Component {
       constructor(props){
           super(props)
           this.state={
            columns:[
                {
                    title:this.initTitle('控制器编号'),
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
                    title:this.initTitle('控制器位置'),
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
                    title:this.initTitle('控制器在线状态'),
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
                        if(parseInt(record['SAFanOnOffSetting'])===parseInt(record['SAFanOnOff'])){
                            return (    
                                <div className={L['Center']}  style={{fontSize:"15px"}}>
                                    <span style={{background:'#45b97c',padding:"2px 10px 2px"}}>正常</span> 
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
                               <span style={{background:'#bed742',padding:"2px 10px 2px"}}>自动</span> 
                            </div>
                        )
                    }
                  }
                },
                {
                    title:this.initTitle('自控启用/禁用'),
                    dataIndex:'Enabled',
                    key:'Enabled',
                    width: 130,
                    render:(text,record,index)=>{
                      return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['EnabledName'],e)}} >
                                {
                                    <div>
                                        <Button type='primary' disabled={record['Enabled']==undefined?true:(parseInt(record['Enabled'])==1?true:false)}
                                            onClick={()=>this.ButtonChange(record['EnabledName'],record,1,index,parseInt(record['Enabled']),record['EnabledName'],'Enabled')}
                                        >启用</Button>
                                        &nbsp;&nbsp;
                                        <Button type='primary' disabled={record['Enabled']==undefined?true:(parseInt(record['Enabled'])==1?false:true)}
                                            onClick={()=>this.ButtonChange(record['EnabledName'],record,0,index,parseInt(record['Enabled']),record['EnabledName'],'Enabled')}
                                        >禁用</Button>
                                    </div>
                                }
                            </div>
                      )
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
                                        <Button type='primary' disabled={record['OnOffSetting']==undefined?true:(parseInt(record['OnOffSetting'])==1?true:false)}
                                            onClick={()=>this.ButtonChange(record['OnOffSettingName'],record,1,index,parseInt(record['OnOff']),record['OnOffSettingName'],'OnOff')}
                                        >开启</Button>
                                        &nbsp;&nbsp;
                                        <Button type='primary' disabled={record['OnOffSetting']==undefined?true:(parseInt(record['OnOffSetting'])==1?false:true)}
                                            onClick={()=>this.ButtonChange(record['OnOffSettingName'],record,0,index,parseInt(record['OnOff']),record['OnOffSettingName'],'OnOff')}
                                        >关闭</Button>
                                    </div>
                                }
                            </div>
                        )
                    }
                },
                {
                    title:this.initTitle('送风温度(°C)'),
                    dataIndex:'AirTempSupply',
                    key: 'AirTempSupply',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AirTempSupplyName'],e)}} >{parseFloat(text).toFixed(2)}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('送风温度设定(°C)'),
                    dataIndex:'AirTempSupplySetting',
                    key: 'AirTempSupplySetting',
                    width: 120,
                    render:(text,record,index)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['AirTempSupplySettingName'],e)}} >   
                            <Input style={{width:"50px"}} value={parseInt(record['AirTempSupplySetting'])} disabled />&nbsp;
                            <Button onClick={()=>this.showSettingValue(record['AirTempSupplySettingName'],record,parseInt(text),index)} >设定</Button>
                        </div>
                        )
                    }
                },
                {
                    title:this.initTitle('水阀开度设定(%)'),
                    dataIndex:'ChWValvePositionSetting',
                    key: 'ChWValvePositionSetting',
                    width: 120,
                    render:(text,record,index)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['ChWValvePositionSettingName'],e)}} >   
                            <Input style={{width:"50px"}} value={parseInt(record['ChWValvePositionSetting'])} disabled />&nbsp;
                            <Button onClick={()=>this.showSettingValue(record['ChWValvePositionSettingName'],record,parseInt(text),index)}>设定</Button>
                        </div>
                        )
                    }
                },
                {
                title:this.initTitle('水阀开度反馈(%)'),
                dataIndex:'ChWValvePosition',
                key: 'ChWValvePosition',
                width: 70,
                render:(text,record)=>{
                    return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['ChWValvePositionName'],e)}}>{parseFloat(text).toFixed(2)}</div>
                    )
                    }
                },
                {
                title:this.initTitle('风机状态'),
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
                title:this.initTitle('送风机故障'),
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
            localDateSource:[],
            indexId:0      
        }
        
        this.RenderList = this.RenderList.bind(this)
        this.renderLeftList = this.renderLeftList.bind(this)
        this.ButtonChange = this.ButtonChange.bind(this)
        this.showSettingValue = this.showSettingValue.bind(this)
        this.OpenEquipMentWindow = this.OpenEquipMentWindow.bind(this)
        this.Onchange = this.Onchange.bind(this)
        this.RenderAllList = this.RenderAllList.bind(this)
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
    componentDidMount(){
        const {indexId} = this.state
        if( this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0){
            this.RenderAllList()
        }else{
            this.RenderList(indexId)
            document.getElementById('FAU_Select').childNodes[indexId].style.backgroundColor='#2ea2f8' 
        }
    }
    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = this.props
        const {indexId} = this.state
        if(nextProps.custom_realtime_data!=this.props.custom_realtime_data){
            if( this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0){
                this.RenderAllList()
            }else{
                this.RenderList(indexId)
                // document.getElementById('Valve_Select').childNodes[index].style.backgroundColor='#2ea2f8' 
            }
        }
    }
    //打开空调箱链接界面
    OpenEquipMentWindow(){
        // let obj = {}
        // obj['pageId']='470001712'
        // obj['title']='B02_35#EAF'
        // obj['isTemplate'] = true 
        // obj['templateConfig'] = {'1':'B02_','2':'35'}
        // this.props.showObserverModal(obj)
    }
    Onchange(value){
        let Arr = this.props.FAUDataSource.filter((row,index)=>{
            if(row['DDCPosition']!=undefined&&row['DDCPosition'].match(value)){
                return row
            }else if(row['EquipName']!=undefined&&row['EquipName'].match(value)){
                return row
            }else if(row['DDCName']!=undefined&&row['DDCName'].match(value)){
                return row
            }else if(row['floor']!=undefined&&row['floor'].match(value)){
                return row
            }
        })
        this.setState({
            localDateSource:Arr
        })
    }
    //开启或关闭
    ButtonChange(text,record,value,index,BackValue,BackPoint,type){
        this.props.FAUSwitch(true)
        this.setState({
            text:text,
            record:record,
            value:value,
            index:index,
            BackValue:BackValue,
            BackPoint:BackPoint,
            type:type
        })
    }
    //设定值
    showSettingValue(text,record,value,index){
        this.props.FAUSetting(true)
        this.setState({
            text:text,
            record:record,
            value:value,
            index:index,
            CurrentValue:value,
            type:'' 
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
        this.setState({
            indexId:index
        })
        this.renderLeftList(list)
        let arr = document.getElementById('FAU_Select').childNodes
         for(let i=0;i<arr.length;i++){
             arr[i].style.backgroundColor='transparent'
         }
        e.target.style.backgroundColor='#2ea2f8'
        this.props.FAUloading(true)
        this.RenderList(index)
    }
    RenderAllList(){
        const {columns} = this.state
        const {config,custom_realtime_data} = this.props
        let Arr = config.hideProperties
        let newArr = config.groups
        let FirstColumns = {
            title:this.initTitle('楼层'),
            dataIndex:'floor',
            key: 'floor',
            width: 70,
            render:(text,record)=>{
                return(
                    <div className={L['Center']}>{text}</div>
                )
            }
        }
        if(columns[0].dataIndex!='floor'){
            columns.unshift(FirstColumns)
        }           
        // 过滤
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
        let bodyArr = []
            newArr.map((i,j)=>{
                // let obj = {}
                i.children.map((A,B)=>{
                let obj = {}
                obj['id'] = B+`${i.name}`
                obj['floor'] = i.name
                obj['DDCName'] = A['DDCName']
                obj['DDCPosition'] = A['DDCPosition']
                obj['EquipName'] = A['EquipName']
                custom_realtime_data.map((C,D)=>{
                    if(C['name']===`${A['Prefix']}SAFanAutoMode${A['No']}`){
                        obj['AutoMode'] = C['value']
                        obj['AutoModeName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}SAFanOnOffSetting${A['No']}`){
                        obj['OnOffSetting'] = C['value']
                        obj['OnOffSettingName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}Online${A['No']}`){
                        obj['Online'] = C['value']
                        obj['OnlineName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}AirTempSupply${A['No']}`){
                        obj['AirTempSupply'] = C['value']
                        obj['AirTempSupplyName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}AirTempSupplySetting${A['No']}`){
                        obj['AirTempSupplySetting'] = C['value']
                        obj['AirTempSupplySettingName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}ChWValvePositionSetting${A['No']}`){
                        obj['ChWValvePositionSetting'] = C['value']
                        obj['ChWValvePositionSettingName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}ChWValvePosition${A['No']}`){
                        obj['ChWValvePosition'] = C['value']
                        obj['ChWValvePositionName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}SAFanOnOff${A['No']}`){
                        obj['OnOff'] = C['value']
                        obj['OnOffName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}SAFanErr${A['No']}`){
                        obj['Err'] = C['value']
                        obj['ErrName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}SAFanEnabled${A['No']}`){
                        obj['Enabled'] = C['value']
                        obj['EnabledName'] = C['name']
                    }
                })
                bodyArr.push(obj)
            })
        })
        this.props.FAUData(bodyArr)
    }
    //刷新dataSource函数
    RenderList=(index)=>{
        const {custom_realtime_data} = this.props
        const {columns} = this.state
        let Arr = this.props.config.hideProperties
        // 过滤
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
        let newArr = this.props.config.groups
        let bodyArr = []
        newArr[index].children.map((A,B)=>{
            let obj = {}
            obj['id'] = B
            obj['DDCName'] = A['DDCName']
            obj['DDCPosition'] = A['DDCPosition']
            obj['EquipName'] = A['EquipName']
            custom_realtime_data.map((C,D)=>{
                if(C['name']===`${A['Prefix']}SAFanAutoMode${A['No']}`){
                    obj['AutoMode'] = C['value']
                    obj['AutoModeName'] = C['name']
                }else if(C['name']===`${A['Prefix']}SAFanOnOffSetting${A['No']}`){
                    obj['OnOffSetting'] = C['value']
                    obj['OnOffSettingName'] = C['name']
                }else if(C['name']===`${A['Prefix']}Online${A['No']}`){
                    obj['Online'] = C['value']
                    obj['OnlineName'] = C['name']
                }else if(C['name']===`${A['Prefix']}AirTempSupply${A['No']}`){
                    obj['AirTempSupply'] = C['value']
                    obj['AirTempSupplyName'] = C['name']
                }else if(C['name']===`${A['Prefix']}AirTempSupplySetting${A['No']}`){
                    obj['AirTempSupplySetting'] = C['value']
                    obj['AirTempSupplySettingName'] = C['name']
                }else if(C['name']===`${A['Prefix']}ChWValvePositionSetting${A['No']}`){
                    obj['ChWValvePositionSetting'] = C['value']
                    obj['ChWValvePositionSettingName'] = C['name']
                }else if(C['name']===`${A['Prefix']}ChWValvePosition${A['No']}`){
                    obj['ChWValvePosition'] = C['value']
                    obj['ChWValvePositionName'] = C['name']
                }else if(C['name']===`${A['Prefix']}SAFanOnOff${A['No']}`){
                    obj['OnOff'] = C['value']
                    obj['OnOffName'] = C['name']
                }else if(C['name']===`${A['Prefix']}SAFanErr${A['No']}`){
                    obj['Err'] = C['value']
                    obj['ErrName'] = C['name']
                }else if(C['name']===`${A['Prefix']}SAFanEnabled${A['No']}`){
                    obj['Enabled'] = C['value']
                    obj['EnabledName'] = C['name']
                }
            })
            bodyArr.push(obj)
        })
        this.props.FAUData(bodyArr)
                          
    }
    render() {
            const {
                FAUData,FAUControlDataSource,FAUloading,FAUloadingVisiable,
                FAUSwitchVisiable,FAUSwitch,FAUSetting,FAUSettingVisiable,
            showObserverModal
            } = this.props
            const {text,record,value,index,BackValue,BackPoint,FAUVisiable,CurrentValue,type} = this.state
           return (
               <div>
                    <Layout>
                        {
                            this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0?
                            null:
                            <Sider>
                                <div id="FAU_Select">
                                    {this.renderLeftList(this.props.config.groups)}                                
                                </div>
                            </Sider>
                        }
                        <Layout>
                            <Header>
                                {/* {
                                    this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0?
                                    <Button type='primary' onClick={this.RenderAllList}>刷新</Button>:
                                    null
                                } */}
                                <Search  
                                    placeholder="输入内容"
                                    onSearch={(value)=>{this.Onchange(value)}}
                                    style={{ width:250,float:'right',marginTop:"10px"}}
                                    size='large'
                                />
                            </Header>
                            <Content>
                                <Table
                                className='ListView'
                                bordered={true}
                                columns={this.state.columns}
                                rowKey="id"                                
                                dataSource={this.state.localDateSource.length>0?this.state.localDateSource:this.props.FAUControlDataSource}
                                loading={this.props.FAUloadingVisiable}
                                scroll={{
                                    y:(this.props.style.height-120)+'px'
                                }}
                                pagination={false}
                                ></Table>
                            </Content>
                        </Layout>
                    </Layout>
                    <OptimizeValueModal
                        FAUSettingVisiable={FAUSettingVisiable}
                        FAUSetting={FAUSetting}
                        text={text}
                        record={record}
                        value={value}
                        index={index}
                        CurrentValue={CurrentValue}
                    />
                    <CommandWindow   //开关指令窗口
                        FAUSwitchVisiable={FAUSwitchVisiable}
                        FAUSwitch={FAUSwitch}
                        text={text}
                        record={record}
                        value={value}
                        index={index}
                        BackValue={BackValue}
                        BackPoint={BackPoint}
                        type={type}
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
    type : 'FAUControlTable_V01',
    name : '组件',
    description : "新风机组",
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * @class LineChartComponent
 * @extends {Widget}
 */
class FAUControlListComponent extends Widget {
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
                <FAUControlList
                    {...this.props}
                />
            </div>
        )
    }
}

export default  FAUControlListComponent