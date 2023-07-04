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
class EnvironmentControlList extends React.Component {
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
                            <div className={L['Center']}>{text}</div>
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
                    title:this.initTitle('二氧化碳浓度(ppm)'),
                    dataIndex:'CO2Sensor',
                    key: 'CO2Sensor',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['CO2SensorName'],e)}} >{parseFloat(text).toFixed(2)}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('PM10(ug/m3)'),
                    dataIndex:'PM10Sensor',
                    key: 'PM10Sensor',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['PM10SensorName'],e)}} >{parseFloat(text).toFixed(2)}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('PM25(ug/m3)'),
                    dataIndex:'PM25Sensor',
                    key: 'PM25Sensor',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['PM25SensorName'],e)}} >{parseFloat(text).toFixed(2)}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('相对湿度(%)'),
                    dataIndex:'RHSensor',
                    key: 'RHSensor',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['RHSensorName'],e)}} >{parseFloat(text).toFixed(2)}</div>
                        )
                    }
                },
                {
                    title:this.initTitle('室内温度(°C)'),
                    dataIndex:'TempSensor',
                    key: 'TempSensor',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['TempSensorName'],e)}} >{parseFloat(text).toFixed(2)}</div>
                        )
                    }
                },{
                    title:this.initTitle('甲醛含量(mg/m3)'),
                    dataIndex:'TVOCSensor',
                    key: 'TVOCSensor',
                    width: 70,
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']} style={{cursor:"pointer"}} onContextMenu={(e)=>{this.RightClick(record['TVOCSensorName'],e)}} >{parseFloat(text).toFixed(2)}</div>
                        )
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
            CurrentValue:'',
            localDateSource:[],
            type:'' ,
            indexId:0   
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
        // const {indexId} = this.state
        // if( this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0){
        //     this.RenderAllList()
        // }else{
        //     this.RenderList(indexId)
        //     document.getElementById('Environment_Select').childNodes[indexId].style.backgroundColor='#2ea2f8' 
        // }
    }
    componentDidMount(){
        const {indexId} = this.state
        if( this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0){
            this.RenderAllList()
        }else{
            this.RenderList(indexId)
            document.getElementById('Environment_Select').childNodes[indexId].style.backgroundColor='#2ea2f8' 
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
    //开启或关闭
    ButtonChange(text,record,value,index,BackValue,BackPoint,type){
        this.props.EnvironmentSwitch(true)
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
        let Arr = this.props.EnvironmentControlDataSource.filter((row,index)=>{
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
        // console.log(EnvironmentingControlDataSource)
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
        let arr = document.getElementById('Environment_Select').childNodes
         for(let i=0;i<arr.length;i++){
             arr[i].style.backgroundColor='transparent'
         }
        e.target.style.backgroundColor='#2ea2f8'
        this.props.Environmentloading(true)
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
                        if(C['name']===`${A['Prefix']}CO2${A['No']}`){
                            obj['CO2Sensor'] = C['value']
                            obj['CO2SensorName'] = C['name']
                        }else if(C['name']===`${A['Prefix']}PM10${A['No']}`){
                            obj['PM10Sensor'] = C['value']
                            obj['PM10SensorName'] = C['name']
                        }else if(C['name']===`${A['Prefix']}PM25${A['No']}`){
                            obj['PM25Sensor'] = C['value']
                            obj['PM25SensorName'] = C['name']
                        }else if(C['name']===`${A['Prefix']}RH${A['No']}`){
                            obj['RHSensor'] = C['value']
                            obj['RHSensorName'] = C['name']
                        }else if(C['name']===`${A['Prefix']}Temp${A['No']}`){
                            obj['TempSensor'] = C['value']
                            obj['TempSensorName'] = C['name']
                        }else if(C['name']===`${A['Prefix']}TVOC${A['No']}`){
                            obj['TVOCSensor'] = C['value']
                            obj['TVOCSensorName'] = C['name']
                        }
                    })
                    bodyArr.push(obj)
                })
            })
            this.props.EnvironmentData(bodyArr)
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
                if(C['name']===`${A['Prefix']}CO2${A['No']}`){
                    obj['CO2Sensor'] = C['value']
                    obj['CO2SensorName'] = C['name']
                }else if(C['name']===`${A['Prefix']}PM10${A['No']}`){
                    obj['PM10Sensor'] = C['value']
                    obj['PM10SensorName'] = C['name']
                }else if(C['name']===`${A['Prefix']}PM25${A['No']}`){
                    obj['PM25Sensor'] = C['value']
                    obj['PM25SensorName'] = C['name']
                }else if(C['name']===`${A['Prefix']}RH${A['No']}`){
                    obj['RHSensor'] = C['value']
                    obj['RHSensorName'] = C['name']
                }else if(C['name']===`${A['Prefix']}Temp${A['No']}`){
                    obj['TempSensor'] = C['value']
                    obj['TempSensorName'] = C['name']
                }else if(C['name']===`${A['Prefix']}TVOC${A['No']}`){
                    obj['TVOCSensor'] = C['value']
                    obj['TVOCSensorName'] = C['name']
                }
            })
            bodyArr.push(obj)
        })
        this.props.EnvironmentData(bodyArr)
                       
    }
    render() {
            const {EnvironmentData,EnvironmentControlDataSource,Environmentloading,EnvironmentloadingVisiable,
            EnvironmentSwitchVisiable,EnvironmentSwitch,EnvironmentSetting,EnvironmentSettingVisiable 
            } = this.props
            const {text,record,value,index,BackValue,BackPoint,CurrentValue,type} = this.state
           return (
               <div>
                   <Layout>
                            {
                                this.props.config.groupPaneEnable!=undefined&&this.props.config.groupPaneEnable==0?
                                null:
                                <Sider>
                                   <div id="Environment_Select">
                                        {this.renderLeftList(this.props.config.groups)}                                
                                    </div>
                                </Sider>
                            }
                            <Layout>
                                <Header>
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
                                    dataSource={this.state.localDateSource.length>0?this.state.localDateSource:this.props.EnvironmentControlDataSource}
                                    loading={EnvironmentloadingVisiable}
                                    scroll={{
                                        y:this.props.style.height
                                            }}
                                    pagination={false}
                                    ></Table>
                                </Content>
                            </Layout>
                   </Layout>
               </div>
           )
       }
   }
   
  

/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'EnvironmentSensor',
    name : '组件',
    description :"室内环境",
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * @class LineChartComponent
 * @extends {Widget}
 */
class EnvironmentControlComponent extends Widget {
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
                <EnvironmentControlList
                    {...this.props}
                />
            </div>
        )
    }
}

export default  EnvironmentControlComponent