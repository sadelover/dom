import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './GaugeChartView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import {subtract} from '../../../../common/utils'

import { DatePicker , Form ,Button ,Select ,message,Spin} from 'antd';
import moment from 'moment'
const format = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option

const getTimeRange = function (period) {
    let startTime, endTime;
  
    switch(period) {
      case 'today':
        startTime = moment().startOf('day');
        endTime = moment();
        break;
      case 'thisweek':
        startTime = moment().startOf('week');
        endTime = moment();
        break;
      case 'month':
        startTime = moment().startOf('month')
        endTime = moment();
        break;
    }
    return [startTime, endTime];
}

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'pan',
    name : '仪表盘组件',
    description : "生成gauge组件",
}


class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state = {
            data: [],
            pointvalue:[]
        }

        this.chart = null;
        this.container = null;
    
        this.getChartData = this.getChartData.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.formatter = this.formatter.bind(this);
    }

    static get defaultProps() {
      return {
        points: [],
        data:[]
      }
    }
     
    componentDidMount() {
        const {width,height,left,top} = this.props.style
        const {header}  = this.props
        // 初始化
        let columns = []
        

        // this.setState({
        //     style : {
        //         width : width,
        //         height : height,
        //         left : left,
        //         top : top
        //     },
        //     columns : columns,
        // },this._renderTable(this.props))
    }

    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        let pointvalue = custom_realtime_data//.filter(item=>item.name === 'Plant01RealtimeEfficiency'||item.name === 'Plant02RealtimeEfficiency'||item.name === 'PlantGroupRealtimeEfficiency')[0];
        
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
        

        this.setState({
            pointvalue:pointvalue, //保存数据到state上，对比下一次
            loading:false
        },this.antdTableHearder)
    }
     componentWillMount(){
         //const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
         //let timeStart = moment(energyDateStr).format(TIME_FORMAT),
         //timeEnd = moment(energyDateStr).format(TIME_FORMAT);
         //this.getChartData(timeStart,timeEnd);
         this.setState({
             loading:true
         })
      
     }
    // componentWillReceiveProps(){
        
    //       this.getChartData();
        
    //   }
    // echart data
    getChartData(timeStart,timeEnd) {
        //const {name} = this.props.config.bindname
        this.setState({
            loading: true
        });

        http.post('/get_history_data_padded', {
            pointList: this.props.config.bindPoint,
      ...{
      "timeStart":timeStart,
      "timeEnd":timeEnd,
      "timeFormat":"m1"
      }
        }).then(
            (data)=> {
                 if (!this.container) {
                     throw new Error('Error: the instance of container is undefined')
                 }
                if (data.error) {
                    throw new Error(data.msg)
                }

                this.setState({
                    loading: false,
                    data: data
                });
            }
        ).catch(
            () => {
                this.setState({
                    loading: false,
                    data: []
                });
            }
        )
    }
   formatter(value){
        
        if(this.props.config.percent&&this.props.config.percent==1){
                    value = (value + '').split('.');
                    value.length < 2 && (value.push('00'));
                    return (value[0])
                    + '.' + (value[1] + '0').slice(0, 1)+"%";
                }else{
                    value = (value + '').split('.');
                    value.length < 2 && (value.push('00'));
                    return (value[0])
                        + '.' + (value[1] + '0').slice(0, 1);
                }
   }
    // echart option
     getChartOption() {
            let value = 0;
            let x1 = this.props.config.x1!=undefined?this.props.config.x1:0.33;
            let color1 = this.props.config.color1!=undefined?this.props.config.color1:"#ff9966";
            let x2 = this.props.config.x2!=undefined?this.props.config.x2:0.66;
            let color2 = this.props.config.color2!=undefined?this.props.config.color2:"#9999ff";
            let color3 = this.props.config.color3!=undefined?this.props.config.color3:"#99cc00";
            let max = this.props.config.max;
            let pointer = [];
            if(this.state.pointvalue.length>0){
                pointer = this.state.pointvalue.filter(item=>{
                    if (this.props.config.bindPoint != undefined && this.props.config.bindPoint.length>0) {
                        return item.name==this.props.config.bindPoint[0]
                    }
                })
                if(pointer.length==0){
                    value=0;
                }else{
                value = pointer[0].value;
                }
            }
        return{

            backgroundColor:'rgba(0,255, 0, 0)',
            tooltip : {
                formatter: "{a} <br/>{c} {b}"
            },
            toolbox: {
                show: true,
                // feature: {
                //     restore: {show: true},
                //     saveAsImage: {show: true}
                // }
            },
            series : [
                {
                    startAngle:this.props.config.startAngle!=undefined?this.props.config.startAngle:225,
                    endAngle:this.props.config.endAngle!=undefined?this.props.config.endAngle:-45,
                    name: this.props.config.title,
                    type: 'gauge',
                    
                    min: this.props.config.min,
                    max: this.props.config.max,
                    splitNumber: 5,
                    radius: '100%',
                    axisLine: {            // 坐标轴线
                        lineStyle: {       // 属性lineStyle控制线条样式
                            width: this.props.config.width?this.props.config.width:5,
                            color:[[x1, color1], [x2, color2], [1, color3]]
                        }
                    },
                    axisTick: {            // 坐标轴小标记
                        length: 10,        // 属性length控制线长
                        lineStyle: {       // 属性lineStyle控制线条样式
                            color: 'auto'
                        }
                    },
                    splitLine: {           // 分隔线
                        length: 10,         // 属性length控制线长
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            color: 'auto'
                        }
                    },
                    axisLabel: {
                        backgroundColor: 'auto',
                        borderRadius: 1,
                        color: '#eee',
                        padding: 1,
                        textShadowBlur: 2,
                        textShadowOffsetX: 1,
                        textShadowOffsetY: 1,
                        textShadowColor: '#222'
                    },
                    title : {
                        // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        fontWeight: 'bolder',
                        fontSize: 10,
                        fontStyle: 'italic'
                    },
                    detail : {
                        // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        formatter: this.formatter(value),
                        // function (value) {
                        //     return value+"%";
                        //     if(this.props.config.percent&&this.props.config.percent==1){
                        //         return value+"%";
                        //     }else{
                        //         value = (value + '').split('.');
                        //         value.length < 2 && (value.push('00'));
                        //         return (value[0])
                        //             + '.' + (value[1] + '0').slice(0, 1);
                            
                        // },
                        fontSize:this.props.config.fontSize?this.props.config.fontSize:40,
                        fontWeight: 'bolder',
                        borderRadius: 3,
                        // backgroundColor: '#444',
                        // borderColor: '#aaa',
                        shadowBlur: 5,
                        //shadowColor: '#333',
                        shadowOffsetX: 0,
                        shadowOffsetY: 3,
                        //borderWidth: 2,
                        //textBorderColor: '#000',
                        textBorderWidth: 2,
                        textShadowBlur: 2,
                        //textShadowColor: '#fff',
                        textShadowOffsetX: 0,
                        textShadowOffsetY: 0,
                        fontFamily: 'Arial',
                        width: 40,
                        color: 'auto',
                        rich: {}
                    },
                    data:[{value: value}]
                }]
        }
}

    

    // echart实例
    saveChartRef(refEchart) {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }
    // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }

    

    //
    render() {
        let config = this.props.config
        let flag =  config.input!=undefined
        return (
            <div >
                <div  className={s['chart-container']} ref={this.saveContainerRef}>   
                {
                        this.state.loading ? 
                            <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                                <Spin tip="正在读取数据"/>
                            </div>
                        :
                        <ReactEcharts
                            style={{
                                height: '100%'
                            }}
                            ref={this.saveChartRef()}
                            option={this.getChartOption()}
                            theme="dark"
                            notMerge={true}
                        />
                }
                
                </div>
                
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
class GaugeChartComponent extends Widget {
    
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
        //
        return (
            <div className={s['container']}  style={style}>
                <FormWrap
                    timeRange={getTimeRange('today')}
                    format='m5'
                    {...this.props}
                    
                />
            </div>
        )
    }
}

export default  GaugeChartComponent


