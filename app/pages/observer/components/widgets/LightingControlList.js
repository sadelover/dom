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
        this.props.SwitchControlShow(false)
        this.props.LightControlList(false)
     }
     handleSubmit(){
        const {text,record,value,index,BackValue,BackPoint} = this.props
        this.props.ChangeControlShow(true)
        let StartTime = moment().format('YYYY-MM-DD HH:mm:ss')
        this.props.SwitchControlShow(false)
        this.props.ChangeControlShow(false)
        // //操作记录
        http.post('/pointData/setValue',{
            pointList:[text],
            valueList:[value.toString()],
            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            data=>{
                if(data.err===0) {
                  this.checkPointRefresh(StartTime,text,value,index,1,BackValue)
                //   this.checkBackValue(StartTime,value,text,BackValue,1)  
                }
            }
        )
     }
     checkBackValue(StartTime,text,value,BackValue,count){
         let _this = this
         count=count+1
        const {LightControlIndex,BackPoint } = this.props
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
        const {LightControlIndex } = this.props
         count=count+1
         http.post('/get_realtimedata', {
             "proj":1,
             "pointList":[text]
         }).then(
            data=>{
                if(data.length>0){
                    if(value==data[0].value){
                        this.props.SwitchControlShow(false)
                        this.props.ChangeControlShow(false)
                        this.checkBackValue(StartTime,text,value,BackValue,1)
                        // this.props.RenderList(LightControlIndex)
                        // this.props.RenderHeardList(LightControlIndex)
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
                            this.props.SwitchControlShow(false)
                            this.props.ChangeControlShow(false)
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
                this.props.SwitchControlShow(false)
                this.props.ChangeControlShow(false)
             }
         )
     }
    render(){
        const {SwitchControlVisible,SwitchControlShow,LightControlLoading,value,text,index,record,BackValue,BackPoint,LightControlChange} = this.props
        return(
            <Modal
                // title={LightControlChange?'指令设置进度提示':'确认指令'}
                title='确认指令'
                width={500}
                visible={SwitchControlVisible}
                // maskClosable={false}
                onCancel={this.onCancel}
                onOk= {this.handleSubmit}
                // footer={
                //     this.props.LightControlChange?
                //     [
                //         <Button onClick={this.onCancel}>确定</Button>
                //     ]:
                //     [
                //         <Button onClick={this.onCancel}>取消</Button>,
                //         <Button onClick={this.handleSubmit}>确定</Button>  
                //     ]
                // }  
            >
                {
                    // this.props.LightControlChange?
                    //     <Spin tip={`${text}正在${value==1?'开':'关'}`}>
                    //     <Alert
                    //         message="提示"
                    //         description="数据正在更新"
                    //         type="info"
                    //     />
                    //     </Spin>
                    // :
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
    this.props.LightControlShow(false)
    this.props.LightControlList(false)
    let _this = this
    
    let StartTime = moment().format('YYYY-MM-DD HH:mm:ss')      
    form.validateFields((err,values)=>{
        if(!err){
            _this.props.ChangeControlShow(true)
            // _this.props.LightControlList(true)
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
                        _this.props.ChangeControlShow(false)
                      _this.props.LightControlShow(false)
                      
                    }
                }
            ).catch(
                err=>{
                    _this.props.ChangeControlShow(false)
                    _this.props.LightControlShow(false)
                }
            )            //操作记录
        // addOperation("/operationRecord/addChangeValue",{
        //         "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? 
        //                     JSON.parse(localStorage.getItem('userInfo')).name : '',
        //         "pointName":text,
        //         "pointDescription":"",
        //         "valueChangeFrom":value,
        //         "valueChangeTo":values.settingValue,
        //         "address":localStorage.getItem('serverUrl'),
        //         "lang":"zh-cn"
        //       },text + '改值操作记录失败')
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
                    this.props.LightControlShow(false)
                    this.props.ChangeControlShow(false)
                    addOperation("/operationRecord/add",{
                        "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                        "content":`在${StartTime}将${text}设置为${value},检测值设定成功
                        `
                    },'操作记录失败')
                    // this.props.RenderList(LightControlIndex)
                    // this.props.RenderHeardList(LightControlIndex)
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

                         this.props.LightControlShow(false)
                         this.props.ChangeControlShow(false)
                    }
                }
            }else{
                this.props.LightControlShow(false)
                this.props.ChangeControlShow(false)
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
        this.props.LightControlShow(false)
        this.props.LightControlList(false)    
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
    const { LightControlVisible, 
        text,
        record,
        value,
        index,
        LightControlLoading 
    } = this.props;
    return (
      <Modal
        // title={this.props.LightControlChange?'指令设置进度提示':'设定值模态框'}
        width={500}
        visible={LightControlVisible}
        onCancel={this.onCancel}
        onOk= {this.handleSubmit}
        maskClosable={false}
        // footer={
        //     this.props.LightControlChange?
        //     [
        //         <Button onClick={this.onCancel}>确定</Button>
        //     ]:
        //     [
        //         <Button onClick={this.onCancel}>取消</Button>,
        //         <Button onClick={this.handleSubmit}>确定</Button>  
        //     ]
        // }
      >
      {
    //   this.props.LightControlChange?
    //   <Spin tip={"正在修改设定值"}>
    //     <Alert
    //         message="提示"
    //         description="数据正在更新"
    //         type="info"
    //     />
    //   </Spin>:
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
            pointvalue:[],
            dataSource:[],
            pointNameList:[],
            columns:[],
            data:[],
            Switchloading:false,    //按钮开关
            loading:false,
            height:500,
            text:'',
            record:'',
            value:'',
            index:'',
            BackValue:'',
            BackPoint:''     
        }
           this.RenderList = this.RenderList.bind(this)
           this.ButtonChange = this.ButtonChange.bind(this)
           this.RenderHeardList = this.RenderHeardList.bind(this)
           this.renderLeftList = this.renderLeftList.bind(this)
           this.showSettingValue = this.showSettingValue.bind(this) 
        //    this.checkPointRefresh = this.checkPointRefresh.bind(this)  //检查刷新 
           this.RightClick = this.RightClick.bind(this) 
    }
    static get defaultProps() {
        return {
           points: [],
           data:[]
        }
    }
    componentWillMount(){
        this.props.LightControlIndexOf(0)        
        this.RenderList(0)
        this.RenderHeardList(0)
        this.props.LightControlList(false)           
    }
    componentDidMount(){
        this.props.LightControlIndexOf(0)
        this.RenderList(0)
        // 初始化显示数据 第一组数据
        const {style,LightControlDataSource,LightControlColoums} = this.props
        this.RenderHeardList(0)
        this.props.LightControlList(false)   
       this.setState({
        height:style.height
            // ,
        // dataSource:LightControlDataSource,
        // columns:LightControlColoums
       })
       let newArr = this.props.config.groups
       if(newArr!==undefined){
            this.renderLeftList(newArr)
            document.getElementById('yj_Select').childNodes[0].style.backgroundColor='#2ea2f8'    
       }
    }
    showSettingValue(value1,text,record,value,index){
        this.setState({
            text:text,
            record:record,
            value:value,
            index:index
        })
        this.props.LightControlShow(true)
        this.props.ValueSetting(value1)
    }
      //使表头居中
    initTitle(colName){
        return <span style={{display:'table',margin:'0 auto'}}>{colName}</span>
    }
    RightClick(name,e){
        let _this = this
        const {LightControlDataSource,LightControlList,LightControlLoading}=  _this.props
        let description = ''
        let idCom  = ''
        let value = ''
        // e.preventDefault()
        e.persist()
        //重新定义函数，继承原函数所有的属性和函数        
        let  model = new ModelText()
        LightControlList(true)
        model.options = {
            getTendencyModal: _this.props.getTendencyModal,
            showCommomAlarm: _this.props.showCommomAlarm,
            showMainInterfaceModal:_this.props.showMainInterfaceModal,
            getToolPoint:_this.props.getToolPoint
        }
        let clientWidth = document.documentElement.clientWidth,
        clientHeight = document.documentElement.clientHeight - 32 - 56 - 48;
        let svgChart = document.getElementsByClassName("svgChart");
        let widthScale = 0, heightScale = 0;
        widthScale = clientWidth/1920 
        heightScale = clientHeight/955
        let  isInfo = {
            "isInModal":false
        }
        e.offsetX = e.clientX-5
        e.offsetY = e.clientY-80
        http.post('/analysis/get_point_info_from_s3db',{
            "pointList":[name]
        }).then(
            data=>{
                if(data.err==0){
                    model.description = data.data.realtimeValue[0].description
                    model.idCom = data.data.realtimeValue[0].name
                    model.value = data.data.realtimeValue[0].value
                    model.sourceType = data.data[name].sourceType
                    LightControlList(false)
                    model.showModal(e,isInfo,widthScale,heightScale)
                }else{
                    LightControlList(false)
                    message.error("数据请求失败")
                }
            }).catch(err=>{
                LightControlList(false)
            })
            // if(LightControlLoading){
            //     model.showModal(e,isInfo,widthScale,heightScale)
            // }
        // this.props.getTendencyModal(name,description.target.getAttribute('name'))
    }
    //渲染头部
    RenderHeardList=(index)=>{
        let newArr = this.props.config.groups
        if(newArr!==undefined){
            //头部列
            let headerArray = []
            newArr[index].header.map((row,index)=>{
                if(row['type']=='pointReadSwitch'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:70,
                        render:(text,record) => {
                            let columnId = row['columnId']
                            if(parseInt(record[record[columnId]])==0){
                                return (    
                                    <div className={L['Center']} name={row['content']} style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} }>
                                       <span style={{background:'#ccc',padding:"2px 10px 2px"}}>关</span> 
                                    </div>
                                )
                            }else if(parseInt(record[record[columnId]])==1){
                                return (    
                                    <div className={L['Center']} name={row['content']} style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} } >
                                       <span style={{background:'#87d068',padding:"2px 10px 2px"}}>开</span> 
                                    </div>
                                )
                            }
                        }
                    })    
                }else if(row['type']=='pointOnline'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:70,
                        render:(text,record) => {
                            let columnId = row['columnId']
                            if(parseInt(record[record[columnId]])==1){
                                return (    
                                    <div className={L['Center']} name={row['content']} style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} } >
                                       <span style={{background:'red',padding:"2px 10px 2px"}}>离线</span> 
                                    </div>
                                )
                            }else if(parseInt(record[record[columnId]])==0){
                                return (    
                                    <div className={L['Center']} name={row['content']}  style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} } >
                                       <span style={{background:'#87d068',padding:"2px 10px 2px"}}>在线</span> 
                                    </div>
                                )
                            }
                        }
                    })
                }else if(row['type']=='pointFaultDiagnosis'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:120,
                        render:(text,record) => {
                            let Setting = parseInt(record['SettingValue'])
                            let OnOff  = parseInt(record['OnffValue'])
                            let AirPressure = parseInt(record['AirPressure']) 
                            if(Setting==OnOff&&Setting==AirPressure&&AirPressure==OnOff){
                                return (    
                                    <div className={L['Center']} name={row['content']} style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} } >  
                                    </div>
                                )
                            }else{
                                return (    
                                    <div className={L['Center']} name={row['content']}  style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} } >
                                       <span style={{background:'red',padding:"2px 10px 2px"}}>控反不一致</span> 
                                       {/* <span style={{background:'#87d068',padding:"2px 10px 2px"}}></span>  */}
                                    </div>
                                )
                            }
                        }
                    })
                }
                else if(row['type']=='pointAutoMode'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:70,
                        render:(text,record) => {
                            let columnId = row['columnId']
                            if(parseInt(record[record[columnId]])==0){
                                return (    
                                    <div className={L['Center']} name={row['content']}  style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} }>
                                       <span style={{background:'#ccc',padding:"2px 10px 2px"}}>手动</span> 
                                    </div>
                                )
                            }else if(parseInt(record[record[columnId]])==1){
                                return (    
                                    <div className={L['Center']}  name={row['content']} style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} }>
                                       <span style={{background:'#2ea2f8',padding:"2px 10px 2px"}}>自动</span> 
                                    </div>
                                )
                            }
                        }
                    })
                }
                else if(row['type']=='pointAHUErr'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:70,
                        render:(text,record) => {
                            let columnId = row['columnId']
                            if(parseInt(record[record[columnId]])==0){
                                return (    
                                    <div className={L['Center']} name={row['content']}  style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} }>
                                       <span style={{background:'#87d068',padding:"2px 10px 2px"}}>正常</span> 
                                    </div>
                                )
                            }else if(parseInt(record[record[columnId]])==1){
                                return (    
                                    <div className={L['Center']} name={row['content']} style={{fontSize:"15px"}} onContextMenu={(e)=>{this.RightClick(text,e)} }>
                                       <span style={{background:'red',padding:"2px 10px 2px"}}>报警</span> 
                                    </div>
                                )
                            }
                        }
                    })
                }else if(row['type']=='Number'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:70,
                        render:(text,record) => {
                            let columnId = row['columnId']
                            return(
                                <div className={L['Center']} name={row['content']} style={{cursor:"pointer"}}  onContextMenu={(e)=>{this.RightClick(text,e)} } >{record[record[columnId]]}</div>
                            )
                        }
                    })
                }else if(row['type']=='pointWriteReal'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:120,
                        render:(text,record,index3) => {
                            let columnId = row['columnId']
                            let diff = parseInt(record[record[columnId]])
                            return(
                               <div className={L['Center']} name={row['content']} onContextMenu={(e)=>{this.RightClick(text,e)} }>   
                                    <Input style={{width:"50px"}} value={parseInt(record[record[columnId]])} disabled />&nbsp;
                                    <Button onClick={
                                        ()=>{
                                            if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                                let flag = 0
                                                if(localStorage.getItem('projectRightsDefine')!=undefined){
                                                    let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                                    for(let item in pageRights){
                                                        if(item == localStorage.getItem('selectedPageName')){
                                                            if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                                pageRights[item].blockControlUsers.map(item2=>{
                                                                    if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                        flag = 1
                                                                        Modal.info({
                                                                            title: '提示',
                                                                            content: '用户权限不足'
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                }
                                                if(flag == 0){
                                                    this.showSettingValue(parseInt(record[record[columnId]]),text,record,diff,index3)
                                                }
                                            }else{
                                                Modal.info({
                                                    title: '提示',
                                                    content: '用户权限不足'
                                                }) 
                                            }
                                        }
                                        } >设定</Button>
                                </div>
                            )                            
                        }
                    })
                }else if(row['type']=='text'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:70,
                        render:(text,record) => {
                            let columnId = row['columnId']
                            return(
                                <div className={L['Center']}>{text}</div>
                            )
                        }
                    })
                }else if(row['type']='pointWriteSwitch'){
                    headerArray.push({
                        title:this.initTitle(row['content']),
                        dataIndex:row['columnId'],
                        key:row['columnId'],
                        width:130,
                        render:(text,record,index2)=>{
                            let columnId = row['columnId']
                            let diff = parseInt(record[record[columnId]])
                            //开关状态反馈值
                            let BackValue = parseInt(record[record['SAFanOnOff']])
                            let BackPoint = record['SAFanOnOff']
                                return(
                                    <div className={L['Center']}>
                                        {
                                            <div name={row['content']} onContextMenu={(e)=>{this.RightClick(text,e)} }>
                                                <Button type={diff==0?"primary":"null"} disabled={diff==0?false:true}  onClick={
                                                    ()=>{
                                                        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                                            let flag = 0
                                                            if(localStorage.getItem('projectRightsDefine')!=undefined){
                                                                let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                                                for(let item in pageRights){
                                                                    if(item == localStorage.getItem('selectedPageName')){
                                                                        if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                                            pageRights[item].blockControlUsers.map(item2=>{
                                                                                if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                                    flag = 1
                                                                                    Modal.info({
                                                                                        title: '提示',
                                                                                        content: '用户权限不足'
                                                                                    })
                                                                                }
                                                                            })
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if(flag == 0){
                                                                this.ButtonChange(text,record,1,index2,BackValue,BackPoint)
                                                            }
                                                        }else{
                                                            Modal.info({
                                                                title: '提示',
                                                                content: '用户权限不足'
                                                            }) 
                                                        }
                                                    }
                                                } >开启</Button>
                                                &nbsp;&nbsp;
                                                <Button type={diff==0?"null":"primary"} disabled={diff==0?true:false} onClick={
                                                    ()=>{
                                                        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                                            let flag = 0
                                                            if(localStorage.getItem('projectRightsDefine')!=undefined){
                                                                let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                                                for(let item in pageRights){
                                                                    if(item == localStorage.getItem('selectedPageName')){
                                                                        if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                                            pageRights[item].blockControlUsers.map(item2=>{
                                                                                if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                                    flag = 1
                                                                                    Modal.info({
                                                                                        title: '提示',
                                                                                        content: '用户权限不足'
                                                                                    })
                                                                                }
                                                                            })
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if(flag == 0){
                                                                this.ButtonChange(text,record,0,index2,BackValue,BackPoint)
                                                            }
                                                        }else{
                                                            Modal.info({
                                                                title: '提示',
                                                                content: '用户权限不足'
                                                            }) 
                                                        }
                                                    }
                                                    } >关闭</Button>
                                            </div>
                                                
                                            
                                        }
                                    </div>
                                )
                            }                        
                    })
                }

            })
            this.props.LightControlColoum(headerArray)
            // this.setState({
            //     columns:headerArray
            // })
        }  
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
        let arr = document.getElementById('yj_Select').childNodes
         for(let i=0;i<arr.length;i++){
             arr[i].style.backgroundColor='transparent'
         }
        e.target.style.backgroundColor='#2ea2f8'
        this.props.LightControlList(true)
        this.props.LightControlIndexOf(index)
        this.RenderList(index)
        this.RenderHeardList(index)
        
    }
    //刷新dataSource函数
    RenderList=(index)=>{
        // this.props.LightControlList(true) 
        let newArr = this.props.config.groups
        if(newArr!==undefined){
            let pointList = []
            //先取点位，取出数据
            newArr[index].children.map((row,index)=>{
                row['columns'].map((th,td)=>{
                   if(th['type']=='pointReadSwitch'||th['type']=='pointWriteSwitch'||th['type']=='pointWriteReal'||th['type']=='Number'||th['type']=='pointAHUErr'||th['type']=='pointAutoMode'||th['type']=='pointOnline')
                   pointList.push(th['content'])      
                })
            })
            //重新组合新的数据
            this.props.LightControlList(true) 
            http.post('/get_realtimedata', {
                "proj":1,
                "pointList":pointList
            }).then(data=>{
                if(data&&data.length>0){
                    this.props.LightControlList(false) 
                    newArr[index].children.map((row,index)=>{
                        row['columns'].map((th,td)=>{
                            data.map((a,b)=>{
                                if(th['content']==a['name']){ 
                                    th['value'] =a['value']
                                }
                            })    
                        })
                    })
                    let bodyArr = []    
                    newArr[index].children.map((row,index)=>{
                        let obj = {}
                        //定义2个故障诊断判断的条件
                        obj['id']=row['id']
                        row['columns'].map((th,td)=>{
                        if(th['columnId']=='SAFanOnOffSetting'){
                            obj['SettingValue']=th['value']
                        }else if(th['columnId']=='SAFanOnOff'){
                            obj['OnffValue'] = th['value']
                        }else if(th['columnId']=='AirPressureSupply'){
                            obj['AirPressure']=th['value']
                        }
        
                        if(th['type']=='pointWriteSwitch'||th['type']=='pointReadSwitch'||th['type']=='pointWriteReal'||th['type']=='Number'||th['type']=='pointAHUErr'||th['type']=='pointAutoMode'||th['type']=='pointOnline'){
                            obj[th['columnId']]= th['content']
                            obj['value'] = th['value']
                            obj[th['content']]= th['value']
                        }else if(th['type']=='pointFaultDiagnosis'){
                            obj[th['columnId']]= th['content']
                        }else{
                            obj[th['columnId']]=th['content']
                            obj['value'] = th['value']
                          }  
                        })
                        bodyArr.push(obj)
                    })
                    this.props.LightControlData(bodyArr)
                    this.props.LightControlList(false)   
                }else{
                    this.props.LightControlData([])
                    this.props.LightControlList(false)
                    Modal.error({
                        title : '错误提示',
                        content :"获取到的点位数据值为空!"
                    });
                }       
             }
            ).catch(
                err=>{
                    this.props.LightControlData([])
                    this.props.LightControlList(false)
                    Modal.error({
                        title : '错误提示',
                        content :"无法获取点位实时数据!"
                    });                       
                }
            )
        }else{
            this.props.LightControlData([])
            this.props.LightControlList(false)
            Modal.error({
                title : '错误提示',
                content :"发现组件配置中点位为空！"
            }); 
        }
    }
    ButtonChange(text,record,value,index,BackValue,BackPoint){     
        this.props.SwitchControlShow(true)
        this.setState({
         text:text,
         record:record,
         value:value,
         index:index,
         BackValue:BackValue,
         BackPoint:BackPoint
     })
    }
    render() {
          const {LightControlList,LightControlLoading,LightControlVisible,LightControlShow,
            LightControlData,LightControlDataSource,LightControlColoum,LightControlColoums,
            LightControlIndexOf,LightControlIndex,ValueSetting,CurrentValue,getTendencyModal,SwitchControlVisible,SwitchControlShow
            ,style,ChangeControlShow,LightControlChange,showCommomAlarm,showMainInterfaceModal,getToolPoint} = this.props
                const {text,record,value,index,BackValue,BackPoint} = this.state
           return (
               <div>
                    <Layout>
                        <Sider>
                            <div id="yj_Select">
                                {this.renderLeftList(this.props.config.groups)}                                
                            </div>
                        </Sider>
                        <Content>
                            <Table
                            bordered={true}
                            columns={this.props.LightControlColoums}
                            rowKey={"id"}
                            dataSource={this.props.LightControlDataSource}
                            loading={LightControlLoading}
                            scroll={{
                                    y:this.props.style.height
                                    }}
                            pagination={false}
                            ></Table>
                        </Content>
                    </Layout>
                    <OptimizeValueModal
                        ChangeControlShow={ChangeControlShow}
                        LightControlChange={LightControlChange}
                        LightControlShow={LightControlShow}
                        LightControlVisible={LightControlVisible}
                        CurrentValue={CurrentValue}
                        LightControlList={LightControlList}
                        RenderList={this.RenderList}            
                        RenderHeardList={this.RenderHeardList}
                        LightControlLoading={LightControlLoading}            
                        LightControlIndex={LightControlIndex}
                        text={text}
                        record={record}
                        value={value}
                        index={index}
                    />
                    <CommandWindow   //开关指令窗口
                        ChangeControlShow={ChangeControlShow}
                        LightControlChange={LightControlChange}           
                        SwitchControlShow={SwitchControlShow}
                        SwitchControlVisible={SwitchControlVisible}
                        LightControlLoading={LightControlLoading}
                        RenderList={this.RenderList}            
                        RenderHeardList={this.RenderHeardList}
                        text={text}
                        record={record}
                        value={value}
                        index={index}
                        BackValue={BackValue}
                        LightControlIndex={LightControlIndex}
                        LightControlList={LightControlList}
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
    type : 'StandardControlTable',
    name : '实时数据组件',
    description : "生成照明支路组件",
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class LightingControlListComponent extends Widget {
    
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

export default  LightingControlListComponent