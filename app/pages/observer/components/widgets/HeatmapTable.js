import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './HeatmapTable.css'
import ReactEcharts from '../../../../lib/echarts-for-react';
import echarts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';


import { DatePicker , Form ,Button ,Select ,message,Spin} from 'antd';
import moment from 'moment'

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
    type : 'heatmap-table',
    name : '散点图图组件',
    description : "生成efficiency组件",
}

const xAxis = [30,32,34,36,38,40,42,44,46,48,50];
const yAxis = [30,32,34,36,38,40,42,44,46,48,50];
class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state = {
            data:[]
        }

        this.chart = null;
        this.container = null;
        this.getChartData = this.getChartData.bind(this)
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.handleChange = this.handleChange.bind(this);
        //this.onOption = this.onOption.bind(this);
        this.handle = this.handle.bind(this);
        this.onChartReady = this.onChartReady.bind(this);
        this.refreshCount = this.refreshCount.bind(this);
        
        
    }

    static get defaultProps() {
      return {
        
        points: [],
        data:[]
      }
    }

    
    componentDidMount(){
        
        //this.getChartData(timeStart,timeEnd);
        
        // this.getChartData();
        //this.get()
      
    }
    componentWillMount(){
        
        //this.getChartData(timeStart,timeEnd);
       
        
        this.getChartData();
        //this.get()
      
    }
    getChartData() {
        //const {name} = this.props.config.bindname
        this.setState({
            loading: true
        });
        http.post('/get_realtimedata', {
            pointList:[this.props.config.point],
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
    
    refreshCount() {
       
    http.post('/get_realtimedata',{
        pointList:[],
        proj:1,
        scriptList:[]
    })
    .then(
        data=>{
            
           if (data.error) {
               throw new Error(data.msg)
           }
           
            this.setState({
                AHUData:data,
                loading:false
            })
        }).catch((err)=>{
            this.setState({
                AHUData:[]
            })
        }
           
        )
}

    handle(value){
        
    }
    handleChange(value){
       
    }
    // echart option
    getChart(){
        
    }




     getChartOption() {
        let data = this.state.data;
        let value =  data.length>0?data[0].value:"";//判断接口返回的数值
        let OldArr  = JSON.parse(value).data!==undefined&&JSON.parse(value).data.length>0?JSON.parse(value).data:[] //判断是否存在或者是数组
        let NewArr = []
        if(OldArr.length>0){
            OldArr.map(
                (item,index)=>{
                    for(let i=0;i<item.length;i++){
                        NewArr.push([i,index,item[i]]);
                    }
                }
            );
        }else{
            NewArr = []
        }
        
        let color = this.props.config.valueRange?this.props.config.valueRange:{colorValueStart:800,colorValueEnd:1000};
        let min = color['colorValueStart']!=undefined?color['colorValueStart']:800
        let max = color['colorValueEnd']!=undefined?color['colorValueEnd']:1000
        let a,b;
        let arrayColor1 = ['#00ff00', '#45f314', '#74e9d1', '#abdde9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'];
        let arrayColor2 = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abdde9', '#74e9d1', '#45f314', '#00ff00'];
        let arrayColor;
        if(min<max){
            a=max;
            b=min;
            arrayColor = arrayColor2;
        }else{
            a=min;
            b=max;
            arrayColor = arrayColor1;
        }
        return{
           backgroundColor:'rgba(0,0,0,0)',
                tooltip: {
                    position: 'top'
                },
                animation: false,
                grid: {
                    height: '90%',
                    x: '5%',
                    y: '0%'
                },
                xAxis: {
                    type: 'category',
                    data: this.props.config.xAxis?this.props.config.xAxis:xAxis,
                    splitArea: {
                        show: true
                    },
                    axisLabel:{color:'black',fontSize:22}
                },
                yAxis: {
                    type: 'category',
                    data: this.props.config.yAxis?this.props.config.yAxis:yAxis,
                    splitArea: {
                        show: true
                    },
                    axisLabel:{color:'black',fontSize:22}
                },
                // visualMap: {
                //     min: 0,
                //     max: 10,
                //     calculable: true,
                //     orient: 'horizontal',
                //     left: 'center',
                //     bottom: '15%'
                // },
               dataRange: {
                    min: min,
                    max: max,
                    x: 'right',
                    y: 'center',
                    color:arrayColor                    ,
                    text:[a,b], // 文本，默认为数值文本
                    //selectedMode: false,//不知道有何用途
                    calculable : true,
                    splitNumber:0
                    },
                series: [{
                    type: 'heatmap',
                    data: NewArr,
                    label: {
                        normal: {
                            show: true,
                            color:'black',
                            fontSize:18
                        }
                    },
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            }
       
        
           
     }


     

     onChartClick = (param, echarts) => {
        //let reactEcharts = 
        this.setState({
          cnt: this.state.cnt + 1,
        })
      };
    
      onChartLegendselectchanged = (param, echart) => {
        
      };
    

     onChartReady(echarts){
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
        let onEvents = {
            'click': this.onChartClick,
            'legendselectchanged': this.onChartLegendselectchanged
          }
        return (
            
            <div style={{margin:"20px",color:"black"}}>
                
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
                            onChartReady={this.onChartReady} 
                            onEvents={onEvents}
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
class HeatmapTableComponent extends Widget {
    
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
            <div  style={{color:'black'}}>
            </div>

                <FormWrap
                    data={this.state.AirConditionZoneList}
                    timeRange={getTimeRange('today')}
                    format='m5'
                    {...this.props}
                    
                />
                <div></div>
            </div>
        )
    }
}

export default  HeatmapTableComponent