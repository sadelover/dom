import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';
import ModelText from '../core/entities/modelText.js';
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import s from './FaultOverView.css';
import { Modal} from 'antd';
import moment from 'moment'
import { list } from 'postcss';

 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'faultOverview',
    name : '故障诊断组件',
    description : "生成故障诊断组件",
}

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
            realtimeData:[],
            createtime:"",
            description:"",
            name:"",
            name_ch:"",
            ofEquipment:"",
            ofFaultClassify:"",
            ofResponseParty:"",
            ofZone:"",
            updatetime:"",
            enabled:"",
            visible:false
        }
        this.faultInfo = this.faultInfo.bind(this)
        this.handleCancel=this.handleCancel.bind(this)
    }

    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        let data = []
        data = custom_realtime_data.filter((item,index)=>{
            if(item.name.indexOf("Fault0")!=-1){
                return item
            }
        })
        let min
        for(let i=0;i<data.length;i++){
            for(let j=i+1;j<data.length;j++){
                if(data[i].name.slice(-3)>data[j].name.slice(-3)){
                    min = data[i]
                    data[i] = data[j]
                    data[j] = min
                }
            }
        }
        this.setState({
            realtimeData:data
        })      
    }

    componentWillMount(){

    }

    componentDidMount() {
      
    } 
    shouldComponentUpdate(nextProps,nextState){
        if(nextState.visible!=this.state.visible){
            return true
        }else{
            if(nextState.realtimeData&&nextState.realtimeData[0] != undefined){
                if(JSON.stringify(nextState.realtimeData) == JSON.stringify(this.state.realtimeData)){
                    return false
                }else{
                    return true
                } 
            }else{
                return false   
            }
        }
    }

//传入故障点名，获取故障详细信息
    faultInfo(name){
        this.setState({
            visible: true,
        });
        http.post('/fdditem/getFaultInfo',{
            name:name
        }).then(
            res=>{
                if(res.data!==""&&res.data!==undefined&&res.data!=={}){
                    this.setState({
                        createtime: res.data.createtime,
                        description: res.data.description,
                        name: res.data.name,
                        name_ch: res.data.name_ch,
                        ofEquipment: res.data.ofEquipment,
                        ofFaultClassify: res.data.ofFaultClassify,
                        ofResponseParty: res.data.ofResponseParty,
                        ofZone: res.data.ofZone,
                        updatetime: res.data.updatetime,
                        enabled: res.data.enabled,
                    })
                }
            }
        ).catch(
            err=>{
                console.log('单个故障信息接口请求失败')
            }
        )
    }
//故障点位的小方格
    FaultSquare(){
        return(
            <div style={{marginLeft:'10px',marginTop:"10px"}}>
                {
                    this.state.realtimeData.map((item,index)=>{
                        if(item.value==0){
                            return <div className={s['green']} title={item.name} onContextMenu={(e)=>this.onContextMenu(item.name,e)}></div>
                        }else{
                            return <div className={s['red']} onClick={()=>this.faultInfo(item.name)} title={item.name} onContextMenu={(e)=>this.onContextMenu(item.name,e)}></div>
                        }
                    })
                }          
                {this.GreySquare()}               
            </div>
        )
    }
//用于让故障诊断方格看起来比较饱满的补充灰色小方块
    GreySquare(){
        let arr = []
        let number
        if(this.props.config.idMax&&this.props.config.idMax!=""&&this.props.config.idMax!=undefined){
            number = this.props.config.idMax
        }else{
            number = 100
        }
        for(let i=0;i<number-this.state.realtimeData.length;i++){
            arr[i] = 0
        }
        return arr.map((item,index)=>{
            return <div className={s['grey']}></div>
        })         
        
    }

     //右击文本事件
    onContextMenu = (name,e) => {
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
                "pointList":[name]
            }).then(
                data=>{
                    if(data.err==0){
                        model.description = data.data.realtimeValue[0].description
                        model.idCom = data.data.realtimeValue[0].name
                        model.value = data.data.realtimeValue[0].value
                        model.sourceType = data.data[name].sourceType
                        model.showModal(e,isInfo,widthScale,heightScale)
                    }else{
                        message.error("数据请求失败")
                    }
                })
    }

    handleCancel(){
        this.setState({
            visible: false,
        });
    }

    render() {
        return(
            <div>
                {this.FaultSquare()}
                <Modal
                    title="故障详情"
                    visible={this.state.visible}
                    footer={null}
                    maskClosable={false}
                    onCancel={this.handleCancel}
                    >
                    <div style={{marginBottom:13}}>
                        <span className={s['info']} style={{width:250}}>故障点名：{this.state.name}</span>
                        <span className={s['info']}>故障名称：{this.state.name_ch}</span>
                    </div>
                    <div style={{marginBottom:13}}>
                        <span className={s['info']} style={{width:250}}>故障等级：{this.state.ofFaultClassify}</span>
                        <span className={s['info']}>相关设备：{this.state.ofEquipment}</span>
                    </div>
                    <div style={{marginBottom:13}}>
                        <span className={s['info']} style={{width:250}}>责任人：{this.state.ofResponseParty}</span>
                        <span className={s['info']}>发生区域：{this.state.ofZone}</span>
                    </div>
                    <div style={{marginBottom:13}}>
                        <span className={s['info']} style={{width:250}}>发生时间：{this.state.createtime}</span>
                        <span className={s['info']}>更新时间：{this.state.updatetime}</span>
                    </div>
                    <div style={{marginBottom:13}}>
                        <span className={s['info']}>启用禁用：{this.state.enabled==1?"启用":"禁用"}</span>
                    </div>
                    <div style={{marginBottom:55}}>
                        <span className={s['info']}>故障描述：<span style={{background:'rgb(39,49,66)',wordBreak:'normal',wordWrap:'break-word',width:400,height:80,position:'absolute',border:'1px solid white',padding:5}}>{this.state.description}</span></span>
                    </div>
                </Modal>
            </div>
        ) 
    }
}

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class FaultOverViewComponent extends Widget {
    
    constructor(props){
        super(props)
        this.state = {
            style : {},
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
                <FormWrap

                    {...this.props}
                    
                />
            </div>
        )
    }
}

export default  FaultOverViewComponent


