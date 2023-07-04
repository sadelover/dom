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
        this.props.ValveSwitch(false)
     }
     handleSubmit(){
        const {text,record,value,index,BackValue,BackPoint} = this.props
        this.props.ValveSwitch(false)
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
                            "content":`在${StartTime}将${text}设置为${type=='OnOff'&&value==1?'开':(
                                (type=='OnOff'&&value==0)?'关':(
                                 type=='Enabled'&&value==1?'启用':'禁用'
                                ))},检测指令和状态均成功
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
                            "content":`在${StartTime}将${text}设置为${type=='OnOff'&&value==1?'开':(
                                (type=='OnOff'&&value==0)?'关':(
                                 type=='Enabled'&&value==1?'启用':'禁用'
                                ))},指令发送成功，但状态反馈检测${parseInt(total)}分钟仍不一致,认为反馈失败
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
                        this.checkBackValue(StartTime,text,value,BackValue,1,type)
                    }else{
                        if(count<10){
                            setTimeout(function(){
                                _this.checkPointRefresh(StartTime,text,value,index,count,BackValue,type)          
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
        const {value,text,index,record,BackValue,BackPoint,ValveSwitchVisiable,
            ValveSwitch,type
        } = this.props
        return(
            <Modal
                title='确认指令'
                width={500}
                visible={ValveSwitchVisiable}
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
class ValveControlList extends React.Component {
       constructor(props){
           super(props)
           this.state={
            columns:[
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
                    key:'OnOffSetting',
                    width: 130,
                    render:(text,record,index)=>{
                      return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['OnOffSettingName'],e)}} >
                                {
                                    <div>
                                        <Button type={parseInt(record['OnOffSetting'])==0?"primary":"null"} disabled={parseInt(record['OnOffSetting'])==0?false:true}
                                            onClick={()=>this.ButtonChange(record['OnOffSettingName'],record,1,index,parseInt(record['OnOff']),record['OnOffName'],'OnOff')}
                                        >开启</Button>
                                        &nbsp;&nbsp;
                                        <Button type={parseInt(record['OnOffSetting'])==0?"null":"primary"} disabled={parseInt(record['OnOffSetting'])==0?true:false}
                                            onClick={()=>this.ButtonChange(record['OnOffSettingName'],record,0,index,parseInt(record['OnOff']),record['OnOffName'],'OnOff')}
                                        >关闭</Button>
                                    </div>
                                }
                            </div>
                      )
                    }
                },
                {
                    title:this.initTitle('开到位'),
                    dataIndex:'On',
                    key: 'On',
                    width: 70,
                    render:(text,record)=>{
                      if(parseInt(record['On'])==0){
                          return (    
                              <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['OnName'],e)}}>
                                 <span style={{background:'#ccc',padding:"2px 10px 2px"}}>为到位</span> 
                              </div>
                          )
                      }else if(parseInt(record['On'])==1){
                          return (    
                              <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['OnName'],e)}}>
                                 <span style={{background:'#87d068',padding:"2px 10px 2px"}}>到位</span> 
                              </div>
                          )
                      }
                    }
                },
                {
                    title:this.initTitle('关到位'),
                    dataIndex:'Off',
                    key: 'Off',
                    width: 70,
                    render:(text,record)=>{
                      if(parseInt(record['Off'])==0){
                          return (    
                              <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['OffName'],e)}}>
                                 <span style={{background:'#ccc',padding:"2px 10px 2px"}}>未到位</span> 
                              </div>
                          )
                      }else if(parseInt(record['Off'])==1){
                          return (    
                              <div className={L['Center']} style={{fontSize:"15px",cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['OffName'],e)}}>
                                 <span style={{background:'#87d068',padding:"2px 10px 2px"}}>到位</span> 
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
            index:0,
            BackValue:'',
            BackPoint:'',
            CurrentValue:'',
            localDateSource:[],
            type:'',
            indexId:0,
            ValveList:''   
        }
        this.RenderList = this.RenderList.bind(this)
        this.renderLeftList = this.renderLeftList.bind(this)
        this.ButtonChange = this.ButtonChange.bind(this)
        this.Onchange = this.Onchange.bind(this)
        this.RenderAllList = this.RenderAllList.bind(this)
        // this.showSettingValue = this.showSettingValue.bind(this)
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
        // this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0?
        // this.RenderAllList():      
        // this.RenderList(0)
    }
    componentDidMount(){
        const {indexId} = this.state
        if( this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0){
            this.RenderAllList()
        }else{
            this.RenderList(indexId)
            document.getElementById('Valve_Select').childNodes[indexId].style.backgroundColor='#2ea2f8' 
        }
        // if( this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0){
        //     this.RenderAllList()
        // }else{
        //     this.RenderList(0)
        //     document.getElementById('Valve_Select').childNodes[0].style.backgroundColor='#2ea2f8' 
        // }
        // this.RenderList(0)
        // let newArr = this.props.config.groups
        // if(newArr!==undefined){
        //      document.getElementById('Valve_Select').childNodes[0].style.backgroundColor='#2ea2f8'    
        // }
    }
    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = this.props
        const {indexId} = this.state
        if(nextProps.custom_realtime_data!=custom_realtime_data){
            console.log(nextProps.custom_realtime_data)
            // console.log(custom_realtime_data)
            if( this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0){
                this.RenderAllList()
            }else{
                this.RenderList(indexId)
                // document.getElementById('Valve_Select').childNodes[index].style.backgroundColor='#2ea2f8' 
            }
        }
    }
    // shouldComponentUpdate(nextProps){
    // }
    //开启或关闭
    ButtonChange(text,record,value,index,BackValue,BackPoint,type){
        this.props.ValveSwitch(true)
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
    Onchange(value){
        let Arr = this.props.ValveControlDataSource.filter((row,index)=>{
            if(row['EquipName'].match(value)){
                return row
            }else if(row['floor']!=undefined&&row['floor'].match(value)){
                return row
            }
        })
        this.setState({
            localDateSource:Arr
        })
        // console.log(ValveingControlDataSource)
    }
    RightClick(name,e){
        let _this = this
        e.persist()
        let  model = new ModelText()
        http.post('/analysis/get_point_info_from_s3db',{
            "pointList":[name]
        }).then(
            data=>{
                if(data.err==0){
                    model.description = data.data.realtimeValue[0].description
                    model.idCom = data.data.realtimeValue[0].name
                    model.value = data.data.realtimeValue[0].value
                    model.sourceType = data.data[name].sourceType
                }else{
                    message.error("数据请求失败")
                }
            })
                let  isInfo = {
                    "isInModal":false
                }
                //重新定义函数，继承原函数所有的属性和函数        
                model.options = {
                    getTendencyModal: _this.props.getTendencyModal,
                    showCommomAlarm: _this.props.showCommomAlarm,
                    showMainInterfaceModal:_this.props.showMainInterfaceModal
                }
                let clientWidth = document.documentElement.clientWidth,
                clientHeight = document.documentElement.clientHeight - 32 - 56 - 48;
                let svgChart = document.getElementsByClassName("svgChart");
                let widthScale = 0, heightScale = 0;
                widthScale = clientWidth/1920 
                heightScale = clientHeight/955
                setTimeout(function(){
                    e.offsetX = e.clientX-5,
                    e.offsetY = e.clientY-80
                    model.showModal(e,isInfo,widthScale,heightScale)
                },700)
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
        let arr = document.getElementById('Valve_Select').childNodes
         for(let i=0;i<arr.length;i++){
             arr[i].style.backgroundColor='transparent'
         }
        e.target.style.backgroundColor='#2ea2f8'
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
                obj['floor'] = `${i.name}`
                obj['id'] = B+`${i.name}`
                obj['EquipName'] = A['EquipName']
                custom_realtime_data.map((C,D)=>{
                    if(C['name']===`${A['Prefix']}On${A['No']}`){
                        obj['On'] = C['value']
                        obj['OnName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}OnOffSetting${A['No']}`){
                        obj['OnOffSetting'] = C['value']
                        obj['OnOffSettingName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}Off${A['No']}`){
                        obj['Off'] = C['value']
                        obj['OffName'] = C['name']
                    }else if(C['name']===`${A['Prefix']}Enabled${A['No']}`){
                        obj['Enabled'] = C['value']
                        obj['EnabledName'] = C['name']
                    }
                })
                bodyArr.push(obj)
            })
        })
            this.props.ValveData(bodyArr)
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
        if(newArr!==undefined){
            let bodyArr = []
            newArr[index].children.map((A,B)=>{
                    let obj = {}
                    obj['id'] = B
                    obj['EquipName'] = A['EquipName']
                    custom_realtime_data.map((C,D)=>{
                        if(C['name']===`${A['Prefix']}On${A['No']}`){
                            obj['On'] = C['value']
                            obj['OnName'] = C['name']
                        }else if(C['name']===`${A['Prefix']}OnOffSetting${A['No']}`){
                            obj['OnOffSetting'] = C['value']
                            obj['OnOffSettingName'] = C['name']
                        }else if(C['name']===`${A['Prefix']}Off${A['No']}`){
                            obj['Off'] = C['value']
                            obj['OffName'] = C['name']
                        }else if(C['name']===`${A['Prefix']}Enabled${A['No']}`){
                            obj['Enabled'] = C['value']
                            obj['EnabledName'] = C['name']
                        }
                    })
                    bodyArr.push(obj)
                })
                this.props.ValveData(bodyArr)
                // this.props.Valveloading(false)              
        }
    }
    render() {
            const {ValveData,ValveControlDataSource,Valveloading,ValveloadingVisiable,
            ValveSwitchVisiable,ValveSwitch,ValveSetting,ValveSettingVisiable
            
            } = this.props
            const {text,record,value,index,BackValue,BackPoint,CurrentValue,type} = this.state
           return (
               <div>
                   <Layout>
                            {
                                this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0?
                                null:
                                <Sider>
                                   <div id="Valve_Select">
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
                                        style={{ width:250,float:'right',marginTop:'10px'}}
                                        size='large'
                                    />
                                </Header>
                                <Content>
                                    <Table
                                    className='ListView'
                                    bordered={true}
                                    columns={this.state.columns}
                                    rowKey="id"
                                    dataSource={this.state.localDateSource.length>0?this.state.localDateSource:this.props.ValveControlDataSource}
                                    loading={this.props.ValveloadingVisiable}
                                    scroll={{
                                        y:this.props.style.height
                                            }}
                                    pagination={false}
                                    ></Table>
                                </Content>
                            </Layout>
                   </Layout>
                    <CommandWindow   //开关指令窗口
                        ValveSwitchVisiable={ValveSwitchVisiable}
                        ValveSwitch={ValveSwitch}
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
    type : 'OnOffValve',
    name : '组件',
    description :"层阀组件",
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * @class LineChartComponent
 * @extends {Widget}
 */
class ValveControlListComponent extends Widget {
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
                <ValveControlList
                    {...this.props}
                />
            </div>
        )
    }
}

export default  ValveControlListComponent