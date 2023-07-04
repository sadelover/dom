import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import s from './RingView.css';
import { DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Progress} from 'antd';
import moment from 'moment'

 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'ring',
    name : '圆环图组件',
    description : "生成圆环组件",
}

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
           tableData:'',
           pointvalue:[],
           textList:[]
        }
        this.container = null;
        this.onIndex = this.onIndex.bind(this)
        //this.loadTable = this.loadTable.bind(this)
        this.saveContainerRef = this.saveContainerRef.bind(this);
        
    }

    static get defaultProps() {
      return {
        points: [],
        data:[]
      }
    }
     


    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        let pointvalue = custom_realtime_data//.filter(item=>item.name === this.props.config.point[0]);
        
        // 判断两个数组内容是否相等
        if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(pointvalue)){
            this._renderTable(nextProps)
        }
    }
  
    // 生成数据
    _renderTable = (props) => {
        const {custom_realtime_data,header} =  this.props || props
        let pointvalue=[];
        if(custom_realtime_data.length!=0){
            pointvalue = custom_realtime_data.map(item=>{return {name:item.name,value:parseFloat(item.value)}});
        }
        
        //if(new RegExp(/00:00$/).test(moment().format('YYYY-MM-DD hh:mm:ss'))){
            this.setState({
                pointvalue:pointvalue, //保存数据到state上，对比下一次
                textList:custom_realtime_data,
                loading:false
            })
        //}
    }
    componentWillMount(){
        this.setState({
            loading:true
        })
       //this.loadTable();
    }

    componentDidMount() {
        //this.loadTable();
    }

    

    // loadTable(){
    //     //const {startTime,endTime} = this.state
    //     const _this = this
    //     this.setState({
    //         loading : true
    //     })
        
    //     http.post('/get_realtimedata',{
    //         pointList:this.props.config.point,
    //         proj:1,
    //         scriptList:[]
    //     }).then( 
    //         data=>{
    //             _this.setState({
    //                 pointvalue : data,
    //                 loading : false
    //             })
    //         }
    //      )
    // }


onIndex(value){
    if(this.props.config.percent==1){
        let i = this.props.config.decimal?this.props.config.decimal:1;
        value = (value + '').split('.');
        value.length < 2 && (value.push('00'));
        let v;
        if(i<=0){
            v=value[0];
        }else{
            v = (value[0]) + '.' + (value[1] + '0').slice(0, i);
        }
        return `${v}`
    }
}

    


    // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }


    
    render() {
        const {endTime,startTime,endOpen} = this.state
        const {width,height} = this.props

        let pointValue = ''
        if (this.props.config.bindPoint) {
            if (this.state.textList.length != 0) {
                this.state.textList.filter(item=>{
                    if (item.name === this.props.config.bindPoint) {
                        pointValue = item.value
                    }
                })
            }  
        }
        
        let color = this.props.config.color?this.props.config.color:'active'
        let colorStatus = color=='red'?'exception':(color=='green'?'success':'active')
        let r = 0;
        if(width>=height){
            r=height
        }else{
            r=width
        }
        let value = this.state.pointvalue.filter(item=>{
            
                return item.name===this.props.config.bindPoint
            
        });
        return (
           
                <div  ref={this.saveContainerRef} >
                    {value.length==0?<div className={s['example']}><Spin/></div>:
                    <Progress format={() => pointValue} style={{color:'black'}} type="circle" status={colorStatus} percent={value[0].value} strokeWidth={12} width={r}  />
                    }
                </div>
           
        )
    }
}


//const efficiencyChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class RingViewComponent extends Widget {
    
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

export default  RingViewComponent


