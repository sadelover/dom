import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './CoolingView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';
import echarts from '../../../../lib/echarts-for-react';
import ModelText from '../core/entities/modelText.js';
import modelCustomControl from '../core/entities/modelCustomControl.js'
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import e from './Efficiency.css';
import http from '../../../../common/http';
import { DatePicker , Form ,Button,Table,Select,message,Spin,Row,Col,Card} from 'antd';
import moment from 'moment'
import ConfigModal from '../../../dashboardLine/components/ConfigModalView.js';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
let innerWidth = window.innerWidth;

class ViewWrap extends React.Component {
       constructor(props){
            super(props)
            this.state={
            pointvalue:[]
           } 
        this.View = this.View.bind(this)   
        this.saveContainerRef = this.saveContainerRef.bind(this);   
        this.ViewText = this.ViewText.bind(this);
    }
       static get defaultProps() {
         return {
           points: [],
           data:[]
         }
       }
    componentDidMount(){
        const {config} = this.props
        if(config.pointNameList.length>0){
            this.ViewText()
        }  
    } 
    componentWillReceiveProps(nextProps){
        const {point_realtime_data,customNameList} = this.props
        //如果请求数据不为空才进行数据更新
        if(point_realtime_data.length>0){
            this.View(nextProps.point_realtime_data)
        }   
    }
    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.point_realtime_data.length>0){
            return true
        }
        return false
    }
    
    saveContainerRef(container) {
        this.container = container;
    }
    ViewText=()=>{
        const {config} = this.props
        let pointNameList = config.pointNameList
        let pointvalue=[];
        //width 按比例来算
        let clientWidth = document.documentElement.clientWidth
        let widthScale = clientWidth/1920 
        let NewWidth = this.props.width*widthScale
        if(pointNameList.length!=0&&pointNameList!==undefined){ 
            pointvalue = pointNameList.map((item,index)=>{  
            //行数 
            let NewHeight = this.props.style.height*0.94/parseInt(item.Row)
                // if(item.id==this.props.id){ 
                    return (
                        <div style={{
                            width:`${parseInt(NewWidth/parseInt(item.Coloums))}px`,
                            height:`${NewHeight==undefined?60:NewHeight}px`,
                            marginTop:`${this.props.style.height*0.01}px`,
                            marginBottom:`${this.props.style.height*0.01}px`,
                            display:"flex",float:"left",justifyContent:"center",alignItems:"center"}}>
                            <div style={{clear:"both",padding:"1px 0px 1px 3px",width:"92%",borderRadius:"3px",background:"rgba(255,255,255)"}}>
                                    <div style={{fontFamily:"Microsoft YaHei",fontWeight:'bold',fontSize:"10px",color:"black"}}>
                                        {item.InterPretation}
                                    </div> 
                                    <span className={e['Span_size']} target={JSON.stringify(item)} onContextMenu={this.onContextMenu}>
                                        --
                                    </span>
                                <span className={e['Span_size_two']} style={{marginLeft:"8px",display:"inline-block",color:"#CCC"}} >{item.Company}</span>
                            </div>
                        </div>
                        )
                //  } 
             }) 
         }
         this.setState({
            pointvalue:pointvalue, //保存数据到state上，对比下一次
        }) 
    }  


       //右击文本事件
       onContextMenu = (e) => {
        let idCom = JSON.parse(e.target.getAttribute('target')).Name
            e.preventDefault() 
              // 设置属性是否在弹窗里面
              let  isInfo = {
                "isInModal":false
            }
            //重新定义函数，继承原函数所有的属性和函数        
            let  model = new ModelText()
            model.options = {
                getTendencyModal: this.props.getTendencyModal,
                showCommomAlarm: this.props.showCommomAlarm,
                showMainInterfaceModal:this.props.showMainInterfaceModal,
                getToolPoint:this.props.getToolPoint
            }
          
            let clientWidth = document.documentElement.clientWidth,
            clientHeight = document.documentElement.clientHeight - 32 - 56 - 48;
            let widthScale = 0, heightScale = 0;
            widthScale = clientWidth/1920 
            heightScale = clientHeight/955
            e.offsetX = e.clientX-5,
            e.offsetY = e.clientY-80
            http.post('/analysis/get_point_info_from_s3db',{
                "pointList":[idCom]
            }).then(
                data=>{
                    if(data.err==0){
                        model.description = data.data.realtimeValue[0].description
                        model.idCom = data.data.realtimeValue[0].name
                        model.value = data.data.realtimeValue[0].value
                        model.sourceType = data.data[idCom].sourceType
                        model.showModal(e,isInfo,widthScale,heightScale)
                    }else{
                        message.error("数据请求失败")
                    }
                })
                
       }
       View =(point_realtime_data)=>{
        let pointvalue=[];
        //width 按比例来算
        let clientWidth = document.documentElement.clientWidth
        let widthScale = clientWidth/1920 
        let NewWidth = this.props.width*widthScale
        let data = localStorage.getItem('WarningInfo')?JSON.parse(localStorage.getItem('WarningInfo')):[]
        if(point_realtime_data.length!=0&&point_realtime_data!==undefined){ 
            pointvalue = point_realtime_data.map((item,index)=>{  
            //行数 
            let valueStyle = `${e['Span_size']}`
            if (data != undefined && data != null) {
                if (data.length != undefined) {
                    data.map(item2=>{
                        if(item2.pointName == item.Name){
                            valueStyle=`${e['Span_size']} ${e['colorkeyframes']}`
                        }
                    })
                }
            }
            

            let NewHeight = this.props.style.height*0.94/parseInt(item.Row)
                if(item.id==this.props.id){ 
                    return (
                        <div style={{
                            width:`${parseInt(NewWidth/parseInt(item.Coloums))}px`,
                            height:`${NewHeight==undefined?60:NewHeight}px`,
                            marginTop:`${this.props.style.height*0.01}px`,
                            marginBottom:`${this.props.style.height*0.01}px`,
                            display:"flex",float:"left",justifyContent:"center",alignItems:"center"}}>
                            <div style={{clear:"both",padding:"1px 0px 1px 3px",width:"92%",borderRadius:"3px",background:"rgba(255,255,255)"}}>
                                    <div style={{fontFamily:"Microsoft YaHei",fontWeight:'bold',fontSize:"10px",color:"black"}}>
                                        {item.InterPretation}
                                    </div> 
                                    <span className={valueStyle} target={JSON.stringify(item)} onContextMenu={this.onContextMenu}>
                                        {parseFloat(item.value).toFixed(parseInt(item.DecimalPoint))=="NaN"?"--":parseFloat(item.value).toFixed(parseInt(item.DecimalPoint))}
                                    </span>
                                <span className={e['Span_size_two']} style={{marginLeft:"8px",display:"inline-block",color:"#CCC"}} >{item.Company}</span>
                            </div>
                        </div>
                        )
                 } 
             }) 
         }
         this.setState({
            pointvalue:pointvalue, //保存数据到state上，对比下一次
        }) 
    }      
       // 容器实例     
       render() {
           const {getTendencyModal,showCommomAlarm,showMainInterfaceModal,getToolPoint} = this.props
            const {pointvalue} = this.state
           return (
               <div ref={this.saveContainerRef}   style={{height:'100%',background:"rgba(255,255,255,0.2)"}}>
                   {pointvalue}
               </div>
              
           )
       }
   }
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'Efficiency',
    name : '实时数据组件',
    description : "生成efficiency组件",
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class EfficiencyComponent extends Widget {
    
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
                <ViewWrap
                    {...this.props}
                />
            </div>
        )
    }
}

export default  EfficiencyComponent