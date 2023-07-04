import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './MinLineChartView.css'
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
let j = 0;
let mapData = {};
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
    type : 'echarts',
    name : '柱状图图组件',
    description : "生成energy组件",
}


class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state = {
            data: [],
            xdata:[],
            loading : false,
            input:'',
            data1:[],
            data2:[],
            data3:[],
            time:[],
            i:0,
            pointvalue:[]
        }

        this.chart = null;
        this.container = null;
    
        this.getChartData = this.getChartData.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.onLast = this.onLast.bind(this);
        this.onNext = this.onNext.bind(this);
        this.onChange = this.onChange.bind(this);
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
                
            },this.antdTableHearder)
        //}
    }
    componentWillMount(){
        const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
        let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
        timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT);
        mapData={};
        this.getChartData(timeStart,timeEnd);//'2018-11-08 00:00:00','2018-11-08 23:59:00')//
      
    }

    
    
    getChartData(timeStart,timeEnd) {
        
        this.setState({
            loading: true
        });
        
        http.post('/get_history_data_padded', {
            pointList: this.props.config.point,
      ...{
      "timeStart":timeStart,
      "timeEnd":timeEnd,
      "timeFormat":"h1"
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
   
    // echart option
     getChartOption() {

        let data = this.state.data;
        let point = this.props.config.point[0];
        if(mapData[point]==undefined){
            mapData[point]=[];
        }
        let map = data.map[point];
        let time = data.time;
        let timeData = [];
        let pointer = [];
        let value = 0;
        if(this.state.pointvalue.length>0){
                pointer = this.state.pointvalue.filter(item=>{
                    return item.name==this.props.config.point[0]
                })
                if(pointer.length==0){
                    value=0;
                }else{
                value = pointer[0].value;
                }
        }
        for(let i=0;i<24;i++){
            let t = i+"点";
            timeData.push(t);
        }
        if(mapData[point].length===0&&map!=undefined&&map.length!==0){
            for(let i=0;i<=parseInt(moment().format("HH"));i++){
                mapData[point].push(map[i]);
            }
        }else{
            let timeFlag = moment();
            if(parseInt(timeFlag.format('mm'))===0&&(parseInt(timeFlag.format('ss'))===0||parseInt(timeFlag.format('ss'))===1)){
                if(mapData[point].length<1+parseInt(timeFlag.format('HH'))){
                    mapData[point].push(value);
                }else if(parseInt(timeFlag.format('HH'))==0){
                    mapData[point]=[];
                    mapData[point].push(value);
                }

            }
        }
        return{

            backgroundColor:'rgba(0,255, 0, 0)',
            title : {
                text:this.props.config.header?this.props.config.header:"",
                x:this.props.config.config&&this.props.config.config.x?this.props.config.config.x:'center',
                textStyle:{
                    color:this.props.config.config&&this.props.config.config.titleColor?this.props.config.config.titleColor:"red",
                    fontWeight:this.props.config.config&&this.props.config.config.titleFontWeight?this.props.config.config.titleFontWeight:"normal",
                    fontSize:this.props.config.config&&this.props.config.config.titleFontSize?this.props.config.config.titleFontSize:12
                }
            },
            xAxis: {
                type: 'category',
                data: timeData,
                axisLabel:{color:this.props.config.config&&this.props.config.config.xLabelColor?this.props.config.config.xLabelColor:"black"},
                axisLine:{
                    show:this.props.config.config&&this.props.config.config.notTopRightBorder&&this.props.config.config.notTopRightBorder=="true"?true:false,
                    lineStyle:{
                        color:this.props.config.config&&this.props.config.config.splitLineColor?this.props.config.config.splitLineColor:'black',
                        width:1.5
                    }
                },
                
                // splitArea:{
                //     show:true,
                //     areaStyle:{
                //     color:this.props.config.config&&this.props.config.config.splitAreaColor?this.props.config.config.splitAreaColor:['regba(0,265,265,0.3)']
                    
                // }
                    
                // },
                // splitLine:{
                //     show:true,
                //     type:"solid",
                //     lineStyle:{
                //         color:this.props.config.config&&this.props.config.config.splitLineColor?this.props.config.config.splitLineColor:'black'
                //     }
                // },
                
                axisTick:{interval:0},
                axisTick:{
                    show:false
                }
            },
            yAxis: {
                type: 'value',
                axisLabel:{color:this.props.config.config&&this.props.config.config.yLabelColor?this.props.config.config.yLabelColor:"black"},
                axisLine:{
                    show:this.props.config.config&&this.props.config.config.notTopRightBorder&&this.props.config.config.notTopRightBorder=="true"?true:false,
                    lineStyle:{
                        color:this.props.config.config&&this.props.config.config.splitLineColor?this.props.config.config.splitLineColor:'black',
                        width:1.5
                    }
                },
                
                axisTick:{
                    show:false,
                },
                splitLine:{
                    show:true,
                    type:"solid",
                    lineStyle:{
                        color:this.props.config.config&&this.props.config.config.splitLineColor?this.props.config.config.splitLineColor:'black'
                    }
                },
                // splitLine:{
                //     show:false
                // },
                max:this.props.config.max?this.props.config.max:500
            },
            tooltip:{
                show:true,
                trigger:"axis"
            },
            series: [{
                data:mapData[point],
                type: this.props.config&&this.props.config.echartsType&&this.props.config.echartsType=="bar"?"bar":"line",
                markLine:{
                    symbol:"none",
                    data: [
                        {
                            name: '最低限',
                            yAxis: this.props.config.config&&this.props.config.config.minLine?this.props.config.config.minLine:0,
                            lineStyle: { 
                                type: 'dashed',
                                color:this.props.config.config&&this.props.config.config.minLineColor?this.props.config.config.minLineColor:'black',
                                opacity:this.props.config.config&&this.props.config.config.minLine?1:0,
                            },
                            label: { 
                                show: this.props.config.config&&this.props.config.config.minLine?true:false, 
                                position:'middle',
                                color:this.props.config.config&&this.props.config.config.minLineColor?this.props.config.config.minLineColor:'black'
                            } 
                        },
                        {
                            name: '最高限',
                            yAxis: this.props.config.config&&this.props.config.config.maxLine?this.props.config.config.maxLine:0,
                            lineStyle: { 
                                type: 'dashed',
                                color:this.props.config.config&&this.props.config.config.maxLineColor?this.props.config.config.maxLineColor:'black',
                                opacity:this.props.config.config&&this.props.config.config.maxLine?1:0,
                            },
                            label: { 
                                show: this.props.config.config&&this.props.config.config.maxLine?true:false, 
                                position:'middle',
                                color:this.props.config.config&&this.props.config.config.maxLineColor?this.props.config.config.maxLineColor:'black',
                            } 
                        }
                    ],
                },
            }],
            grid:{
                show:this.props.config.config&&this.props.config.config.notTopRightBorder&&this.props.config.config.notTopRightBorder=="true"?false:true,
                borderColor:this.props.config.config&&this.props.config.config.splitLineColor?this.props.config.config.splitLineColor:'black',
                backgroundColor:this.props.config.config&&this.props.config.config.transparent&&this.props.config.config.transparent=="true"?'rgba(0,0,0,0)':this.props.config.config.backgroundColor,
                top:this.props.config.config&&this.props.config.config.top?this.props.config.config.top:20,
                bottom:this.props.config.config&&this.props.config.config.Xwidth?this.props.config.config.Xwidth:30,
                left:this.props.config.config&&this.props.config.config.Ywidth?this.props.config.config.Ywidth:30,
                right:10
            }
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

    onLast(){
        j=j-1;
        const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
        let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
        timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT);
        timeStart = moment(energyDateStr).startOf('day').add(j, 'days').format(TIME_FORMAT);
        timeEnd = moment(energyDateStr).endOf('day').add(j, 'days').format(TIME_FORMAT)
        this.getChartData(timeStart,timeEnd); 
    }
    onNext(){
        j=j+1;
        const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
        let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
        timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT);
        timeStart = moment(energyDateStr).startOf('day').add(j, 'days').format(TIME_FORMAT);
        timeEnd = moment(energyDateStr).endOf('day').add(j, 'days').format(TIME_FORMAT)
        this.getChartData(timeStart,timeEnd);
    }
               
    onChange(value){
        let timeStart = value.startOf('day').format(TIME_FORMAT);
        let timeEnd = value.endOf('day').format(TIME_FORMAT);
        this.getChartData(timeStart,timeEnd);
    }

    
    render() {
        let config = this.props.config
        let flag =  config.input!=undefined
        return (
           
           
                <div className={s['chart-container']} ref={this.saveContainerRef}>
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
class MinLineChartComponent extends Widget {
    
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
            <div style={style} className={s['container']} id="chart">
                <FormWrap
                    timeRange={getTimeRange('today')}
                    format='m5'
                    {...this.props}
                    
                />
            </div>
        )
    }
}

export default  MinLineChartComponent


