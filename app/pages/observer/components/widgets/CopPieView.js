import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import http from '../../../../common/http';
import { DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Progress} from 'antd';
import moment from 'moment'
import s from './RingView.css';

 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'copPie',
    name : '饼图',
    description : "COP能效仪表盘组件",
}

class FormWrap extends React.Component {
    constructor(props){
        super(props)
        this.state={
           pointvalue:0,
        }
        this.chart = null;
        this.container = null;
        this.saveChartRef = this.saveChartRef.bind(this)
        this.saveContainerRef = this.saveContainerRef.bind(this)
        this.getChartOption = this.getChartOption.bind(this)
    }

    shouldComponentUpdate(nextProps,nextState){
        if(this.state.pointvalue != nextState.pointvalue){
            return true
        }
        return false
    }

    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        let config = this.props.config
        custom_realtime_data.map((item,index)=>{
            if(item.name == config.bindPoint && item.value != this.state.pointvalue){
                this.setState({
                    pointvalue: item.value
                })
            }
        })
    }

    saveChartRef(refEchart) {
        if (refEchart) {
          this.chart = refEchart.getEchartsInstance();
        } else {
          this.chart = null;
        }
    }
    getChartOption(){
        let value = Number(this.state.pointvalue).toFixed(2)
        let name  = this.props.config.name
        let config = this.props.config
        let colorArr = []
        let pieAngle
        config.colorDefine.map((item,index)=>{
            colorArr.push([item.range,item.color])
        })
        pieAngle = (value - Number(config.min))/(Number(config.max)-Number(config.min))
        return{
            series: [
                {
                     name: '访问来源',
                     type: 'pie',
                     radius: '64%',
                     center: ['50%', '50%'],
                     color:['rgba(107,216,78, 0.5)','rgba(91,141,254, 0.5)','rgba(0,0,0,0)'],
                     startAngle:225,
                     tooltip:{
                        show:false
                     },
                      hoverAnimation:false, //鼠标悬浮是否有区域弹出动画，
                     data: [
                         {
                            value: 270*pieAngle,
                            itemStyle:{
                                color:{
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0, color: 'rgba(107,216,78, 0)' // 0% 处的颜色
                                    }, {
                                        offset: 1, color: 'rgba(107,216,78, 0.5)' // 100% 处的颜色
                                    }],
                                global: false // 缺省为 false
                            }
                            }
                             
                         },
                        {
                            value: 270*(1-pieAngle),
                            itemStyle:{color:{
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0, color: 'rgba(91,141,254, 0)' // 0% 处的颜色
                                    }, {
                                        offset: 1, color: 'rgba(91,141,254, 0.5)' // 100% 处的颜色
                                    }],
                                    global: false // 缺省为 false
                            }}},
                        {
                            value: 360*0.25, 
                            itemStyle:{color:{
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0, color: 'rgba(128, 128, 128, 0)' // 0% 处的颜色
                                }, {
                                    offset: 1, color: 'rgba(128, 128, 128, 0)' // 100% 处的颜色
                                }],
                                global: false // 缺省为 false
                            }}},
        
                    ],
                    label:{
                        show:false
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                 },
            {
                type: 'gauge',
                min: config.min,
                max: config.max,
                zlevel:2,
                axisLine: {
                    lineStyle: {
                    width: 10,
                    color: colorArr
                    }
                },
                pointer: {
                    length:'57%',
                    width:5,
                    itemStyle: {
                    color: 'auto'
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    distance: -10,
                    length: 10,
                    lineStyle: {
                    color: '#fff',
                    width: 2
                    }
                },
                axisLabel: {
                    fontFamily: 'Arial',
                    color: 'RGB(0,0,102)',
                    distance: 5,
                    fontSize: 10,
                    formatter: function (value) {
                        if (value === 0) {
                          return '0.0';
                        } else if (value === 1) {
                          return '1.0';
                        } else if (value === 2) {
                          return '2.0';
                        } else if (value === 3) {
                          return '3.0';
                        } else if (value === 4) {
                          return '4.0';
                        } else if (value === 5) {
                          return '5.0';
                        } else if (value === 6) {
                          return '6.0';
                        } else if (value === 7) {
                          return '7.0';
                        } else if (value === 8) {
                          return '8.0';
                        } else if (value === 9) {
                          return '9.0';
                        } else if (value === 10) {
                          return '10.0';
                        }
                        return value;
                    }
                },
                detail: {
                    valueAnimation: true,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Arial',
                    offsetCenter: [0, '90%'],
                    formatter:function (value) {
                    value = value.toFixed(2)
                    if(name != undefined && name !=''){
                        return  name +' : '+value
                    }else{
                        return value
                    }
                    },
                    color: 'RGB(0,0,102)'
                },
                data: [
                    {
                    value: value
                    }
                ]
            }
            ]
        }
    }
    // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }
    render() {
        const {style} = this.props
        return(
            <div style={{width:`${style.width}`,height:`${style.height}`}} ref={this.saveContainerRef}>
                <ReactEcharts
                    style={{height:'100%',width:'100%'}}
                    ref={this.saveChartRef}
                    option={this.getChartOption()}
                    notMerge={true}
                />
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
class CopPieViewComponent extends Widget {
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
            <div style={style} className={s['container']}>
                <FormWrap
                    {...this.props}
                />
            </div>
        )
    }
}
export default  CopPieViewComponent


