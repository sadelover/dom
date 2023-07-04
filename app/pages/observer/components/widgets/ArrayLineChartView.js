import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './ArrayLineChartView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import {subtract} from '../../../../common/utils'

import { DatePicker , Form ,Button ,Select ,message,Spin} from 'antd';
import moment from 'moment'
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const format = 'YYYY-MM-DD';
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option
let j = 0;
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
const DAY_FORMAT = 'YYYY-MM-DD';
const MONTH_FORMAT = 'YYYY-MM';
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'arrayChart',
    name : '折线图图组件',
    description : "生成折线图组件",
}


class FormWrap extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            pointvalue:['']
        }
        this.chart = null;
        this.container = null;
    
        this.getChartData = this.getChartData.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
       
    }

    static get defaultProps() {
      return {
        points: [],
        data: []
      }
    }
     componentWillMount(){
         this.getChartData();
         this.setState({
             loading:true
         })
     }
    
    // componentWillMount(){
    //     const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
    //     let timeStart,timeEnd;
    //     if(this.props.config.defaultTimeRange==='today'){
    //         timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
    //         timeEnd = moment(energyDateStr).endOf('day').add(1,'minutes').format(TIME_FORMAT);
    //     }
        
    //     if(this.props.config.defaultTimeRange==="thismonth"){
    //         timeStart = moment(energyDateStr).startOf('month').format(TIME_FORMAT);
    //         timeEnd = moment(energyDateStr).endOf('month').add(1,'hours').format(TIME_FORMAT);
    //     }
    //     this.getChartData(timeStart,timeEnd);
      
    // }

    // componentWillReceiveProps(){
        
    //       this.getChartData();
        
    //   }

    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        let pointvalue = [];
        if(custom_realtime_data.length!=0){
            custom_realtime_data.map(item=>{
                if (item.name === this.props.bindPoint) {
                    pointvalue = item
                }
            });
        }
       
        
        // 判断两个数组内容是否相等
        if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(pointvalue)){
            this._renderTable(nextProps)
        }
    }
  
    // 生成数据
    _renderTable = (props) => {
        const {custom_realtime_data,header} = props || this.props
        let pointvalue=[];
        if(custom_realtime_data.length!=0){
            pointvalue = custom_realtime_data.filter(item=>{
                if (item.name === this.props.bindPoint) {
                    return {name:item.name,value:item.value}
                }
            });
        }
        
        //if(new RegExp(/00:00$/).test(moment().format('YYYY-MM-DD hh:mm:ss'))){
            this.setState({
                pointvalue:pointvalue, //保存数据到state上，对比下一次
                loading:false
            })
        //}
    }



    // echart data
    getChartData() {
        //const {name} = this.props.config.bindname
        this.setState({
            loading: true
        });
        
        http.post('/get_realtimedata', {
            pointList:this.props.config.bindPoint,
            proj:1,
            scriptList:[]
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
                    pointvalue: data
                });
            }
        ).catch(
            () => {
                this.setState({
                    loading: false,
                    pointvalue: ['']
                });
            }
        )
    }
    // echart option
     getChartOption() {
      let pointvalue = this.state.pointvalue.filter(item=>{
          return item.name = this.props.config.bindPoint
      });
    let name = this.props.config.lengend?this.props.config.lengend:['1','2','3','4','5']
    let array = [];
    let series =[];  
    let oneSeriesData = [];
    let flag = undefined;
    if(pointvalue[0]!==undefined && JSON.parse(pointvalue[0].value).data != undefined){
            let value = JSON.parse(pointvalue[0].value);
            let len = value.data.length?value.data.length:0;
            let length = value.data[0].length?value.data[0].length:len;
                if(value.data[0].length>0){
                    flag=1
                }else{
                    flag=0
                }
            if(flag==0){
                let newData = {}
                newData['data']=value.data
                newData['type']='line'
                newData['name']=name
                oneSeriesData.push(newData)
             }   
            if(flag==1){
                    for(let i=0;i<len;i++){
                        series.push({
                            data: value.data[i],
                            type: 'line',
                            name:name[i]
                        });
                    }
                    
              }
            }         
                return{
                    xAxis: {
                        type: 'category',
                        data: this.props.config.xaxisLegend?this.props.config.xaxisLegend:array                        
                    },
                    yAxis: {
                        type: 'value',
                        min:this.props.config.ymin?this.props.config.ymin:0,
                        max:this.props.config.ymax?this.props.config.ymax:1200
                    },
                    tooltip:{
                        show:true,
                        trigger:"axis"
                    },
                    series:series[0]!=undefined?series:oneSeriesData
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

   
    render() {
        return (
            <div >
           
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
                            theme="white"
                            notMerge={true}
                        />
                }
                
                </div>
                
            </div>
        )
    }
}


// const AccumChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class ArrayLineChartComponent extends Widget {
    
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
                    {...this.props}
                    
                />
            </div>
        )
    }
}

export default  ArrayLineChartComponent