import React, { Component } from 'react'
import {Table , Select , DatePicker , Button ,Form, Input,message,Spin,Icon}from 'antd'
import Widget from './Widget.js'
import  s from './BenchmarkView.css'
import { modalTypes } from '../../../../common/enum';
import moment from 'moment';
import ReactEcharts from '../../../../lib/echarts-for-react';
import http from '../../../../common/http';
import PieChart2 from './PieChatView2'
const registerInformation = {
    type : 'benchmark',
    name : '节能对比组件',
    description : "生成table组件，覆盖canvas对应区域",
}

const FormItem = Form.Item;
const Option = Select.Option
const OptGroup = Select.OptGroup
const RangePicker = DatePicker.RangePicker;

class BenchmarkChartView extends React.Component {
 
    constructor(props){
        super(props)
        this.state = {
            nowData: {},
            benchmarkData:{},
            loading : false,
            benchmarkPoint:'',
            benchmarkKey:''
        }

        this.chart = null;
        this.container = null;
    
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.getChartOption = this.getChartOption.bind(this);

    }

    static get defaultProps() {
      return {
        points: [],
        data: {
          map: {},
          time: []
        }
      }
    }
     
    componentDidMount() {
        const {} = this.props
    
        // 初始化echart
        // this.getChartData();
    }

    componentWillReceiveProps (nextProps) {
        if (this.props.dataSource != nextProps.dataSource) {
            this.getChartOption()
        }
    }

   

    // echart option
    getChartOption() {
        const {dataSource,barFalg} = this.props;
        // const hiddenPoints = this.props.points
        //     .filter(row => !row['visible'])
        //     .map(row => row['name']);
        return {
            // title: {
            //     text: '点位折线图'
            // },
            legend: {
                data:Object.keys(dataSource.map)
            },
            tooltip : {
                trigger: 'axis'
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: {
                        show: true ,
                    }
                },
                right:'2%'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
           
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    data : dataSource.time
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series: Object.keys(dataSource.map)
           // .filter(row => hiddenPoints.indexOf(row) === -1)
            .map((key) => ({
                name: key,
                type: barFalg ? 'bar' : 'line',
                label: {
                    normal: {
                        show: false,
                        position: 'top'
                    }
                },
                data: dataSource.map[key]
            }))
        };
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
            <div className={s['chart-container']} ref={this.saveContainerRef}>
                {
                    this.props.loading ? 
                        <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                            <Spin tip="正在读取数据"/>
                        </div>
                    :
                    <ReactEcharts
                        style={{
                            height: '100%'
                        }}
                        ref={this.saveChartRef}
                        option={this.getChartOption()}
                        theme="light"
                        notMerge={true}
                    />
                }
            </div>
        )
    }
}


class  ParamText extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            data: [],
            loading : false
        }

    }

    render() {
        const paramValues = this.props.paramValues
        return (
            <div className={s['param-wrap']} >
            {
                this.props.loadingParam ? 
                    <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                        <Spin tip="正在读取数据"/>
                    </div>
                :
                <div className={s['param-container']} >
                    <div className={s['param-container_left']} >
                        <div  className={s['top-left-item-header']} >
                            <p> <span>基准模式  </span> <span>基准日  </span></p>
                        </div> 
                        <div  className={s['top-left-item']} >
                            <div className={s['text-title']} >
                                天气日平均
                            </div>
                            
                                <div className={s['text-content-left']} >
                                    <Icon type="environment" className={s['text-content-icon']}  />
                                </div>
                                <div className={s['text-content-right']} >
                                    <span> {paramValues.benWeatherAve} </span>
                                </div>
                              
                        </div> 
                        {
                            this.props.config.RoomTempPoint != '' && this.props.config.RoomTempPoint != undefined ? 
                                <div  className={s['top-left-item']} >
                                    <div className={s['text-title']} >
                                        室内平均温
                                    </div>
                                    
                                        <div className={s['text-content-left']} >
                                            <Icon type="eye" className={s['text-content-icon']} />
                                        </div>
                                        <div className={s['text-content-right']} >
                                            <span>  {paramValues.benRoomTempAve}  </span>
                                        </div>
                                </div> 
                            : ''
                        }
                        {
                            this.props.config.RoomCO2Point != undefined && this.props.config.RoomCO2Point != '' ?
                                <div  className={s['top-left-item']} >
                                    <div className={s['text-title']} >
                                        室内平均CO2
                                    </div>
                                
                                        <div className={s['text-content-left']} >
                                            <Icon type="compass" className={s['text-content-icon']}  />
                                        </div>
                                        <div className={s['text-content-right']} >
                                            <span>  {paramValues.benRoomCO2Ave} </span>
                                        </div>
                                    
                                </div> 
                            : ''
                        }
                        <div  className={s['top-left-item']} >
                            <div className={s['text-title']} >
                                基准日同时刻累计能耗
                            </div>
                           
                                <div className={s['text-content-left']} >
                                    <Icon type="appstore" className={s['text-content-icon']}  />
                                </div>
                                <div className={s['text-content-right']} >
                                    <span> {paramValues.benPower}  </span>
                                </div>
                           
                        </div> 
                    </div>
                    <div className={s['param-container_mid']} >
                        <div  className={s['top-left-item-header']} >
                            <p> <span>优化模式  </span> </p>
                        </div> 
                        <div  className={s['top-left-item']} >
                            <div className={s['text-title']} >
                                天气日平均
                            </div>
                            
                                <div className={s['text-content-left']} >
                                    <Icon type="environment" className={s['text-content-icon']} />
                                </div>
                                <div className={s['text-content-right']} >
                                    <span> 
                                        {paramValues.nowWeatherAve} 
                                        {/*{paramValues.nowWeatherBias} */}
                                    
                                    </span>
                                </div>
                              
                        </div> 
                        {
                            this.props.config.RoomTempPoint != '' && this.props.config.RoomTempPoint != undefined ? 
                                <div  className={s['top-left-item']} >
                                    <div className={s['text-title']} >
                                        室内平均温
                                    </div>
                                            
                                        <div className={s['text-content-left']} >
                                            <Icon type="eye" className={s['text-content-icon']}  />
                                        </div>
                                        <div className={s['text-content-right']} >
                                            <span> {paramValues.nowRoomTempAve}  </span>
                                        </div>
                                    
                                </div> 
                            : ''
                        }
                        {
                            this.props.config.RoomCO2Point != undefined && this.props.config.RoomCO2Point != '' ?
                                <div  className={s['top-left-item']} >
                                    <div className={s['text-title']} >
                                        室内平均CO2
                                    </div>
                                    
                                        <div className={s['text-content-left']} >
                                            <Icon type="compass" className={s['text-content-icon']} />
                                        </div>
                                        <div className={s['text-content-right']} >
                                            <span>  {paramValues.nowRoomCO2Ave} </span>
                                        </div>
                                    
                                </div> 
                            : ''
                        }                 
                        <div  className={s['top-left-item']} >
                            <div className={s['text-title']} >
                                今日目前累计能耗
                            </div>
                           
                                <div className={s['text-content-left']} >
                                    <Icon type="appstore" className={s['text-content-icon']} />
                                </div>
                                <div className={s['text-content-right']} >
                                    <span>  {paramValues.nowPower} </span>
                                </div>
                            
                        </div> 
                    </div>
                    <div className={s['param-container_right']} >
                            <div  className={s['top-left-item-header']} >
                                <p> <span>今日节能量  </span> </p>
                            </div> 
                            <div style={{position:'absolute',zIndex:1000,right:'5%',marginTop:'45px'}}> 

                                 <div style={{color:'RGB(110,110,110)',fontSize:'18px',marginBottom:'10px'}}>
                                    目前节能量
                                </div>
                                <div style={{color:'RGB(0,0,0)',fontSize:'20px',marginBottom:'20px'}}>
                                    <span> {paramValues.energySaving} kWh </span>
                                </div>
                                <div style={{color:'RGB(110,110,110)',fontSize:'18px',marginBottom:'10px'}}>
                                    节能率
                                </div>
                              <div style={{color:'RGB(0,0,0)',fontSize:'20px'}}>
                                   <span> {paramValues.energySavingSH}% </span>
                           </div>
                                  </div> 
                              
                            <div style={{width:'230px',height:'230px',backgroundColor:"#fff"}}>
                                <PieChart2 energySavingSH={paramValues.energySavingSH} bgcolor={"light"} />   
                            </div>
                              
                    </div>
                </div>
            }
                
            </div>
        )
    }

}


class BenchmarkView extends Widget {

    constructor(props){
        super(props)
        
        this.state = {
            style : {},
            benchmarkDateStr : window.localStorage.benchmarkDateStr !='undefined' && typeof window.localStorage.benchmarkDateStr !='undefined' ? window.localStorage.benchmarkDateStr : moment().add(-1,'days').format("YYYY-MM-DD"),
            nowDateStr: window.localStorage.nowDateStr || moment().format("YYYY-MM-DD"),
            benchmarkKey:window.localStorage.benchmarkKey || 'EnergyPoint',
            benchmarkPoint: '',
            dataSource:{map:[],time:[]},//JSON.parse(window.localStorage.benchmarkDataSource) ||{map:[],time:[]},
            benchmarkData:[],
            nowData:[],
            loading: false,
            benchmarkTextData:[],
            nowTextData:[],
            paramPoints:{
                WeatherPoint:"",
                EnergyPoint:"",
                RoomTempPoint:"",
                RoomCO2Point:""
            },
            paramValues:{
                benWeatherAve:'--',
                benRoomTempAve: '--',
                benRoomCO2Ave: '--',
                benPower: '--',
                nowWeatherAve:'--',
                nowWeatherBias:'--',
                nowRoomTempAve: '--',
                nowRoomCO2Ave: '--',
                nowPower: '--',
                energySaving: '--',
                energySavingSH: '--'
            },
            loadingParam:false,
            keyChangeFlag:false,
            barFalg:false,
            chartItems:{  
                EnergyPoint:"机房总能耗",
                EfficiencyPoint:"机房总能效",
                PowerPoint:"机房总功率",
                WeatherPoint:"天气参数-干球温度",
                WeatherPointWet:"天气参数-湿球温度",
                ChartTempPoint:"室内平均温度",
                ChartCO2Point:"室内平均CO2"
            }
        }

        this.handleSelect = this.handleSelect.bind(this)
        this.refreshChart = this.refreshChart.bind(this)
        this.getChartData = this.getChartData.bind(this)
        this.getChartOptData = this.getChartOptData.bind(this)
        this.getTextData = this.getTextData.bind(this)
        this.countData = this.countData.bind(this)
        this.countChartData = this.countChartData.bind(this)
        this.refRealtime = this.refRealtime.bind(this)
        this.getChartItem = this.getChartItem.bind(this)
    }     
    /* @override */
    static get type() {
      return registerInformation.type;
    }
    /* @override */
    static get registerInformation() {
      return registerInformation;
    }

    antdTableHearder = () => {
        let headerHeight = parseInt( catchedTableHeadStyle.height )
        this.setState({
            headerHeight : headerHeight
        })
    }

    componentDidMount() {
        const {width,height,left,top} = this.props.style
        if (typeof window.localStorage.benchmarkDateStr ==='undefined' || window.localStorage.benchmarkDateStr ==='undefined' || this.state.benchmarkDateStr ==='undefined') {
            window.localStorage.setItem('benchmarkDateStr',JSON.stringify(moment().add(-1,'days').format("YYYY-MM-DD")))
            this.setState({
                benchmarkDateStr: moment().add(-1,'days').format("YYYY-MM-DD")
            })
        }
        if (typeof window.localStorage.nowDateStr ==='undefined' || window.localStorage.nowDateStr ==='undefined'|| this.state.nowDateStr ==='undefined') {
            window.localStorage.setItem('nowDateStr',JSON.stringify(moment().format("YYYY-MM-DD")))
            this.setState({
                nowDateStr: moment().format("YYYY-MM-DD")
            })
        }
        if (typeof window.localStorage.benchmarkKey ==='undefined') {
            window.localStorage.setItem('benchmarkKey',JSON.stringify('EnergyPoint'))
        }
        // if (typeof window.localStorage.benchmarkDataSource ==='undefined') {
        //     window.localStorage.setItem('benchmarkDataSource',JSON.stringify({map:[],time:[]}))
        //     this.getChartData()
        // }
        if (this.props.config.defaultBaselineDate != ''){
            this.setState({
                benchmarkDateStr: this.props.config.defaultBaselineDate
            })
            window.localStorage.benchmarkDateStr = this.props.config.defaultBaselineDate        
            
        }
        if (this.props.config.showDateChoose === 0) {
            this.setState({
                nowDateStr: moment().format("YYYY-MM-DD")
                
            })
            window.localStorage.nowDateStr = moment().format("YYYY-MM-DD")   
            
        }


        this.setState({
            style : {
                width : width,
                height : height,
                left : left,
                top : top
            }
        })
        this.getChartData()
        this.getTextData()  
    }

    componentWillReceiveProps(nextProps){   
        if(this.state.style.width !== nextProps.style.width || this.state.style.height !== nextProps.style.height ){
            const {width,height,left,top} = nextProps.style
            this.setState({
                style : {
                    width : width,
                    height : height,
                    left : left,
                    top : top
                }
            })
        }
        this.refreshChart();
    }

    handleCompDate = (dateMoment,benchmarkDateStr) => {
        // 保存选中日期，添加进浏览器缓存中
        this.setState({
            benchmarkDateStr,
            keyChangeFlag:true
        })
    }  
    handleNowDate = (dateMoment,nowDateStr) => {
        // 保存选中日期，添加进浏览器缓存中
        this.setState({
            nowDateStr,
            keyChangeFlag:true
        })
    }

    onSearch () {  
        // let startTime,endTime,span
        // this.props.form.validateFields((err, values) => {
        //     if (err) {
        //         return;
        //     }
        //     this.getHistoryData(
        //         values.range[0].format(TIME_FORMAT),
        //         values.range[1].format(TIME_FORMAT),
        //         values.timeFormat
        //     );
        //     startTime = values.range[0].format(TIME_FORMAT),
        //     endTime = values.range[1].format(TIME_FORMAT),
        //     span = values.timeFormat
        // });
        // //保存到localStorage中，以便下次切换页面时时间段不变
        //  window.localStorage.setItem('reportRange',JSON.stringify({
        //     startTime,
        //     endTime
        // }));
        // window.localStorage.setItem('reportSpan',JSON.stringify({
        //     span
        // }));

    }

     // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }

    refreshChart() {
        const {benchmarkDateStr,nowDateStr,benchmarkKey} = this.state
        this.getChartData()
        window.localStorage.benchmarkDateStr = benchmarkDateStr        
        window.localStorage.nowDateStr = nowDateStr        
        window.localStorage.benchmarkKey = benchmarkKey
    }


    handleSelect (key) {
        this.setState({
            benchmarkKey:key
            })
  

    }

    getTextData() {
        const {nowDateStr,benchmarkDateStr,paramPoints,paramValues} = this.state
        const {config} = this.props
        let pointList = []
        this.setState({
            loadingParam:true
        })
        for (let key in paramPoints) {
            if (config[key] === undefined) {
                paramPoints[key] = ''
                pointList.push('')
            }else{
                paramPoints[key] = config[key]   
                pointList.push(config[key])                          
            }
        }
        this.setState({
            paramPoints:paramPoints
        })

        let benTimeStart = moment(benchmarkDateStr).format("YYYY-MM-DD 00:00:00")
        let benTimeEnd = moment(benchmarkDateStr).endOf('days').format("YYYY-MM-DD HH:mm:00")
        let nowTimeStart = moment(nowDateStr).format("YYYY-MM-DD 00:00:00")
        let nowTimeEnd = moment(nowDateStr).endOf('days').format("YYYY-MM-DD HH:mm:00")
        //let pointList = [config['WeatherPoint'],config['PowerPoint'],config['RoomTempPoint'],config['RoomCO2Point']]
        http.post('/get_history_data_padded', {
            pointList: pointList,
            timeStart:benTimeStart,
            timeEnd:benTimeEnd,
            timeFormat: 'm1'
        }).then(
            benchmarkData => {
                if (benchmarkData.error) {
                    this.setState({
                        paramValues: paramValues,
                        loadingParam:false
                    })
                    message.error('基准时间数据请求有误'+benchmarkData.msg)
                }
                //请求优化模式的数据
                http.post('/get_history_data_padded', {
                    pointList: pointList,
                    timeStart:nowTimeStart,
                    timeEnd:nowTimeEnd,
                    timeFormat: 'm1'
                }).then(
                    nowData => {
                        if (nowData.error) {
                            this.setState({
                                paramValues: paramValues,
                                loadingParam:false
                            })
                            message.error('优化时间数据请求有误'+nowData.msg)
                        }

                        this.setState({
                            benchmarkTextData: benchmarkData,
                            nowTextData:nowData
                        });
                        this.countData()
                    }
                ).catch(    
                    ()=>{
                        this.setState({
                            paramValues: paramValues,
                            loadingParam:false
                        })   
                    }    
                )
            }
        ).catch(    
            ()=>{
                this.setState({
                    paramValues: paramValues,
                    loadingParam:false
                })   
            }   
        )
    }
    //计算param里的所有要显示的数据
    countData() {
        const {benchmarkTextData,nowTextData,paramValues,paramPoints,nowDateStr} = this.state
        for (let key in paramPoints) {
            if (key === 'WeatherPoint' && benchmarkTextData.map[paramPoints[key]].length != 0) {
                let benSun = benchmarkTextData.map[paramPoints[key]].reduce((result,item)=>{
                    return result + item
                })
                paramValues['benWeatherAve'] = Number(benSun/(benchmarkTextData.time.length)).toFixed(1)

                let nowSun = nowTextData.map[paramPoints[key]].reduce((result,item,index)=>{
                    if (index < nowTextData.time.length) {
                        return result + item            
                    }else {
                        return result
                    }
                })
                paramValues['nowWeatherAve'] = Number(nowSun/(nowTextData.time.length)).toFixed(1)
                paramValues['nowWeatherBias'] = Number(paramValues['nowWeatherAve']-paramValues['benWeatherAve']).toFixed(1) //百分比改为求差值
            }
            if (key === 'RoomTempPoint'&& benchmarkTextData.map[paramPoints[key]].length != 0) {
                let benSun = benchmarkTextData.map[paramPoints[key]].reduce((result,item,index)=>{
                    if (index < benchmarkTextData.time.length) {
                        return result + item             
                    }else {
                        return result
                    }
                })
                paramValues['benRoomTempAve'] = Number(benSun/(benchmarkTextData.time.length)).toFixed(1)

                let nowSun = nowTextData.map[paramPoints[key]].reduce((result,item,index)=>{
                    if (index < nowTextData.time.length) {
                       return result + item   
                    }else {
                        return result
                    }
                })
                paramValues['nowRoomTempAve'] = Number(nowSun/(nowTextData.time.length)).toFixed(1)
               
            }
            if (key === 'RoomCO2Point'&& benchmarkTextData.map[paramPoints[key]].length != 0) {
                let benSun = benchmarkTextData.map[paramPoints[key]].reduce((result,item,index)=>{
                    if (index < benchmarkTextData.time.length) {
                        return result + item            
                    }else {
                        return result
                    }
                })
                paramValues['benRoomCO2Ave'] = parseInt(benSun/(benchmarkTextData.time.length))

                let nowSun = nowTextData.map[paramPoints[key]].reduce((result,item,index)=>{
                    if (index < nowTextData.time.length) {
                        return result + item           
                    }else {
                        return result
                    }
                })
                paramValues['nowRoomCO2Ave'] = parseInt(nowSun/(nowTextData.time.length))
               
            }
            if (key === 'EnergyPoint'&& (benchmarkTextData.map[paramPoints[key]].length != 0 || nowTextData.map[paramPoints[key]].length != 0)) {
                //如果优化时间为当日，则取当前时间求差计算能耗及节能率
                if (nowDateStr === moment().format('YYYY-MM-DD')) {
                    nowTextData.time.map((row,index)=>{
                        if (row === moment().format('YYYY-MM-DD HH:mm:00')) {
                            //当前的能耗减去零点的，求出当日的累计能耗
                            if (nowTextData.map[paramPoints[key]].length != 0) {
                                paramValues['nowPower'] = parseInt(nowTextData.map[paramPoints[key]][index] - nowTextData.map[paramPoints[key]][0])                               
                            }
                            if (benchmarkTextData.map[paramPoints[key]].length != 0) {
                                paramValues['benPower'] = parseInt(benchmarkTextData.map[paramPoints[key]][index] - benchmarkTextData.map[paramPoints[key]][0])                               
                            }
                            return
                        }
                    })
                    
                }else {
                    let nowLength = nowTextData.map[paramPoints[key]].length
                    let benLength = benchmarkTextData.map[paramPoints[key]].length
                    if (nowTextData.map[paramPoints[key]].length != 0) {
                        paramValues['nowPower'] =parseInt(nowTextData.map[paramPoints[key]][nowLength-1] - nowTextData.map[paramPoints[key]][0])                     
                    }
                    if (benchmarkTextData.map[paramPoints[key]].length != 0) {
                        paramValues['benPower'] = parseInt(benchmarkTextData.map[paramPoints[key]][benLength-1] - benchmarkTextData.map[paramPoints[key]][0])
                    }
                }     

                //当除数为0时，直接将节能率赋值为“--”
                if (paramValues['benPower'] === 0 || paramValues['benPower'] === "--" || paramValues['nowPower'] === "--") {
                    paramValues['energySavingSH'] = "--"
                    paramValues['energySaving'] = "--"
                }else {
                    paramValues['energySaving'] = paramValues['benPower'] - paramValues['nowPower']
                    paramValues['energySavingSH'] = ((paramValues['energySaving']/paramValues['benPower'])*100).toFixed(3)        
                }
            }


        } 
            this.setState({
                paramValues: paramValues,
                loadingParam:false
            })
    }

    getChartData() {
        const {nowDateStr,benchmarkDateStr,benchmarkKey} = this.state

        this.setState({
            loading: true
        });
        let point = this.props.config[benchmarkKey]

        if (this.state.keyChangeFlag) {
            this.getTextData()
        }

        this.setState({
            benchmarkPoint : point
        })

        let benTimeStart = moment(benchmarkDateStr).format("YYYY-MM-DD 00:00:00")
        let benTimeEnd = moment(benchmarkDateStr).endOf('days').format("YYYY-MM-DD HH:mm:00")
        let nowTimeStart = moment(nowDateStr).format("YYYY-MM-DD 00:00:00")
        let nowTimeEnd = moment(nowDateStr).endOf('days').format("YYYY-MM-DD HH:mm:00")
        //如果是能效，则需要多请求一个时间
        if (benchmarkKey === 'EnergyPoint') {
            benTimeEnd = moment(benTimeEnd).add(1,'hour').format("YYYY-MM-DD HH:mm:00")
            nowTimeEnd = moment(nowTimeEnd).add(1,'hour').format("YYYY-MM-DD HH:mm:00")
        }

        //请求基准日期的数据
        http.post('/get_history_data_padded', {
            pointList: point,
            timeStart:benTimeStart,
            timeEnd:benTimeEnd,
            timeFormat: benchmarkKey === 'EnergyPoint' ? 'h1' : 'm1'
        }).then(
            benchmarkData => {
                if (benchmarkData.error) {
                    message.error(nowData.msg)
                    this.setState({
                        loading: false,
                        data: []
                    });
                }

                //请求优化模式的数据
                http.post('/get_history_data_padded', {
                    pointList: point,
                    timeStart:nowTimeStart,
                    timeEnd:nowTimeEnd,
                    timeFormat: benchmarkKey === 'EnergyPoint' ? 'h1' : 'm1'
                }).then(
                    nowData => {
                        if (nowData.error) {
                            message.error(nowData.msg)
                            this.setState({
                                loading: false,
                                data: []
                            });
                            return
                        }
                        //当优化时间为今日时，time数组也要给1440个，用于实时刷新
                        if (moment(nowDateStr).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
                            this.countChartData(benchmarkData,nowData)                           
                        }else{
                            this.setState({
                                loading: false, 
                                benchmarkData: benchmarkData,
                                nowData:nowData,
                                keyChangeFlag:false
                            });
                            this.getChartOptData(nowDateStr,benchmarkDateStr,benchmarkKey)
                        }  
                      
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
        ).catch(
            () => {
                this.setState({
                    loading: false,
                    data: []
                });
            }
        )
    }

    //整理优化时间为今日的数据,将未来时间对应的数据赋值''
    countChartData (benchmarkData,nowData) {
        const {benchmarkPoint,nowDateStr,benchmarkDateStr,benchmarkKey} = this.state;
        //当对比项为能耗时，取每小时，数组长度为25
        if (benchmarkKey === 'EnergyPoint') {
            if (benchmarkData.time.length === 25 &&  nowData.time.length !=25) {
                nowData.time = benchmarkData.time  //直接复制时间，日期不对
            }
            var i = 0,
                itime = null,
                j =0;
            for (i; itime=nowData.time[i++]; ) {
                if (itime === moment().format("YYYY-MM-DD HH:00:00")) {
                    j = i
                }
            } 
            for (j; j < nowData.map[benchmarkPoint].length; j++) {
                nowData.map[benchmarkPoint][j] = ''
            }
        }else {
            if (benchmarkData.time.length === 1440 && nowData.time.length === 1440) {   
                var i = 0,
                    itime = null,
                    j =0;
                for (i; itime=nowData.time[i++]; ) {
                    if (itime === moment().format("YYYY-MM-DD HH:mm:00")) {
                        j = i
                    }
                } 
                for (j; j < nowData.map[benchmarkPoint].length; j++) {
                    nowData.map[benchmarkPoint][j] = ''
                }
            

            }else if (benchmarkData.time.length === 1440 && 0< nowData.time.length < 1440) {
                nowData.time = benchmarkData.time
                var i = 0,
                    itime = null,
                    j =0;
                for (i; itime=nowData.time[i++]; ) {
                    if (itime === moment().format("YYYY-MM-DD HH:mm:00")) {
                        j = i
                    }
                } 
                for (j; j < nowData.map[benchmarkPoint].length; j++) {
                    nowData.map[benchmarkPoint][j] = ''
                }
            }
        }
        
        this.setState({
            loading: false, 
            benchmarkData: benchmarkData,
            nowData:nowData,
            keyChangeFlag:false
        });
        this.getChartOptData(nowDateStr,benchmarkDateStr,benchmarkKey)
        if (benchmarkKey != 'EnergyPoint') {
            this.refRealtime()          
        }
    }

    //优化时间为今天的实时刷新
    refRealtime () {
        const {benchmarkPoint,benchmarkKey,nowDateStr,benchmarkDateStr,nowData} = this.state;
        var _this = this
        if (benchmarkKey === 'EnergyPoint' ||barFalg === true) {
            return
        }else{
               var timer = setTimeout(function (e) {                       
                //请求优化模式的数据
                http.post('/get_history_data_padded', {
                    pointList: benchmarkPoint,
                    timeStart:moment().format("YYYY-MM-DD HH:mm:00"),
                    timeEnd:moment().format("YYYY-MM-DD HH:mm:00"),
                    timeFormat: benchmarkKey === 'EnergyPoint' ? 'h1' : 'm1'
                }).then(
                    nowOneData => {
                        if (nowOneData.error) {
                            //message.error(nowOneData.msg)
                        }
                        var i = 0,
                            itime = null,
                            j =0;
                        for (i; itime=nowData.time[i++]; ) {
                            if (itime === nowOneData.time[0]) {
                                nowData.map[benchmarkPoint][i-1] = nowOneData.map[benchmarkPoint][0]
                            }
                        } 
                        _this.setState({ 
                            nowData:nowData
                        });
                        _this.getChartOptData(nowDateStr,benchmarkDateStr,benchmarkKey)  
                        if (moment().format("YYYY-MM-DD HH:mm:00") < moment().endOf('days').format("YYYY-MM-DD HH:mm:00")){
                            setTimeout(_this.refRealtime(),60000)
                        }
                         if (benchmarkKey === 'EnergyPoint' ||barFalg === true) {
                            clearInterval(timer)
                        }
                    }
                )
            }, 60000);
        }
     
    }

    getChartOptData (nowDateStr,benchmarkDateStr,benchmarkKey) {
        const {benchmarkData,nowData,benchmarkPoint} = this.state;
         //整理两天的数据
        let dataObj = {
            map:[],
            time:[]
        }
        let map = {}
        let flag = false
        if (typeof benchmarkData.time != 'undefined') {   
            //如果对比的是能效，则需要求差值
            if (benchmarkKey === 'EnergyPoint') {
                map[benchmarkDateStr] = []
                map[nowDateStr] = []
                for (var i=0; i< benchmarkData.time.length-1; i++) {
                    dataObj['time'].push(moment(benchmarkData.time[i]).format('HH:mm'))
                    map[benchmarkDateStr].push(benchmarkData.map[benchmarkPoint][i+1]-benchmarkData.map[benchmarkPoint][i])
                    map[nowDateStr].push(nowData.map[benchmarkPoint][i+1]-nowData.map[benchmarkPoint][i])
                    flag = true
                }
                //当优化时间为今日时，当前时间不应求差显示，设置为''
                if (moment(nowDateStr).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
                    var i = 0,
                        itime = null,
                        j =0;
                    for (i; itime=nowData.time[i++]; ) {
                        if (itime === moment().format("YYYY-MM-DD HH:00:00")) {
                            j = i
                        }
                    } 
                    map[nowDateStr][j-1] = ''
                }
            }else {
                map[benchmarkDateStr] = benchmarkData.map[benchmarkPoint]
                map[nowDateStr] = nowData.map[benchmarkPoint]
                dataObj['time'] = benchmarkData.time.map((row)=>{
                    return moment(row).format('HH:mm')
                })
                flag = false
            }
            dataObj['map'] = map             
        }
        this.setState({
            dataSource: dataObj,
            barFalg: flag
        })
        window.localStorage.setItem('benchmarkDataSource',JSON.stringify(dataObj))
    }

    getChartItem () {
        let obj = this.state.chartItems
        let config = this.props.config
        let list = Object.keys(obj)
        return list.map(item=>{
            if (config[item] != "" && config[item] != undefined ) {
                return (
                    <Option style={{width:200,backgroundColor:'#D5D5D5',border:'#D5D5D5',color: '#000'}} value={item}> {obj[item]} </Option>       
                )
            }
        })
         
    }


    getContent() {
        const {style,benchmarkDateStr,nowDateStr} = this.state
        return (
            <div 
                style={Object.assign(style,{overflowY:"hidden"})} 
                className={s['container']} 
                >
                {
                     this.props.config.showDateChoose === 0 ? 
                        <div className={s['header']}>
                            <p className={s['heade_test']}>比较：</p>
                           
                            <Select className={s['heade_select']}  style={{width:200}} value={this.state.benchmarkKey} onSelect={this.handleSelect} >
                                {
                                    this.getChartItem()
                                }
                            </Select>   
                            <p className={s['heade_test']}></p>
                            <Button
                                type="primary"
                                size="small"
                                onClick={ this.refreshChart }
                            >
                                刷新图表
                            </Button>           
                        </div>
                    :
                        <div className={s['header']}>
                            <p className={s['heade_test']}>优化时间：</p>
                            <DatePicker style={{background: "#fff"}}
                                onChange={this.handleNowDate}
                                allowClear={false}
                                value={moment(nowDateStr)}
                            />
                            <p className={s['heade_test']}>选择基准时间：</p>
                            <DatePicker style={{background: "#fff"}}
                                onChange={this.handleCompDate}
                                allowClear={false}
                                value={moment(benchmarkDateStr)}
                            />
                            <p className={s['heade_test']}></p>
                            <Button
                                type="primary"
                                size="small"
                                onClick={ this.onSearch }
                            >
                                智能挑选
                            </Button>
                            <p className={s['heade_test']}>比较：</p>
                            <Select className={s['heade_select']} style={{width:200,background: "#fff"}} value={this.state.benchmarkKey} onSelect={this.handleSelect} >
                               {
                                    this.getChartItem()
                                }
                            </Select>   
                            <p className={s['heade_test']}></p>
                            <Button
                                type="primary"
                                size="small"
                                onClick={ this.refreshChart }
                            >
                                刷新图表
                            </Button>           
                        </div>
                }
               
                <div className={s['container_chart']}> 
                    <BenchmarkChartView
                        config={this.props.config}
                        refreshBenchmarkFun={this.props.refreshBenchmarkFun}
                        
                        {...this.state}
                    />
                </div>  
                <div className={s['container_param']}> 
                    <ParamText
                        paramValues={this.state.paramValues}
                        loadingParam={this.state.loadingParam}
                        config={this.props.config}
                    />
                </div>
            </div>
        )
    }
}

export default BenchmarkView

