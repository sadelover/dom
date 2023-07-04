import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './LineChartView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';
import RealWorker from '../core/observer.worker';
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';

import { DatePicker , Form ,Button ,Select ,message,Spin, Modal} from 'antd';
import moment from 'moment'
import { number } from 'prop-types';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option
let timer
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
const TIME_FORMAT_2 = 'YYYY-MM-DD HH:mm:ss';
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'linechart',
    name : '折线图组件',
    description : "生成linechart组件",
}
class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state = {
            data: [],
            loading : false,
            visible:true,
            timeEnd:'',
            realtimeData:[]
        }
        this.chart = null;
        this.container = null;
    
        this.getChartData = this.getChartData.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.getTimeChartData = this.getTimeChartData.bind(this);
        this.getTimeChartData2 = this.getTimeChartData2.bind(this);
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
        const {timeRange,format} = this.props
        // 初始化echart
        this.getChartData({timeRange,format});
    }

    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        this.setState({
            realtimeData:custom_realtime_data
        })
        
    }

    //组件即将卸载
    componentWillUnmount(){
        clearInterval(timer)
    }

    handleSearch = (e) => {
        var _this = this
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // echart数据更新
                clearInterval(timer)
                _this.setState({
                    visible:true
                })
                _this.getChartData(values)
            }
        });
    }
    
    //刷新今日
    handleReset() {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {config} = this.props
                clearInterval(timer)
                this.setState({
                    loading: true,
                    visible:true
                });
                http.post('/get_history_data_padded', {
                    pointList: config.PointNameList,
                    timeStart:moment().startOf('day').format(TIME_FORMAT),
                    timeEnd:moment().format(TIME_FORMAT),
                    timeFormat:values.format
                }).then(
                    data => {
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
        });
    }
    handleTime = (e) => {
        var _this = this
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // echart数据更新
                _this.getTimeChartData(values)   
            }
        });
    }
    handleTimeExit = (e) => {
        var _this = this
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                clearInterval(timer)
                // echart数据更新
                _this.setState({
                    visible:true
                })  
            }
        });
    }

    getTimeChartData(values){
        const {config} = this.props
        let timeEnd = moment().format(TIME_FORMAT)
        this.setState({
            loading: true,
            visible:false,
            timeEnd:timeEnd
        });
        http.post('/get_history_data_padded', {
            pointList: config.PointNameList,
            timeStart:values.timeRange[0].format(TIME_FORMAT),
            timeEnd:timeEnd,
            timeFormat:values.format
        }).then(
            data => {
                if (!this.container) {
                    throw new Error('Error: the instance of container is undefined')
                }
                if (data.error) {
                    Modal.warning({
                        title: '查询失败！',
                        content: (
                          <div>
                            <p>{data.msg}</p>
                          </div>
                        )
                      })
                    throw new Error(data.msg)
                }
                this.setState({
                    loading: false,
                    data: data,
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
        if(config.period&&config.period!=''&&config.period!=undefined){
            timer = setInterval(e=>{
                this.getTimeChartData2()
            },config.period*1000) 
        }else{
            timer = setInterval(e=>{
                this.getTimeChartData2()
            },5000) 
        }
        
    }
    
    getTimeChartData2(){
        let timeEnd = moment().format(TIME_FORMAT_2)
        let data = this.state.data
        data.time.push(timeEnd)
        for(let i=0;i<this.state.realtimeData.length;i++){
            if(data.map[this.state.realtimeData[i].name]&&data.map[this.state.realtimeData[i].name]!=undefined){
                data.map[this.state.realtimeData[i].name].push(this.state.realtimeData[i].value)
                if(data.map[this.state.realtimeData[i].name].length>1000){
                    data.map[this.state.realtimeData[i].name].shift()
                }
            }
        }
        if(data.time&&data.time.length>1000){
            data.time.shift()
        }
        this.setState({
            data:data
        })
    }

    // 生成表单
    createForm = () => {
        const {getFieldDecorator} = this.props.form
        const {timeRange,format} = this.props
        return (
            <Form layout="inline" >
                <FormItem>
                    {getFieldDecorator('timeRange', {
                        rules: [{ required: true, message: '请选择时间' }],
                        initialValue:timeRange
                    })(
                        <RangePicker showTime format={TIME_FORMAT} allowClear={false}/>
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('format', {
                        rules: [{ required: true, message: '请选择时间间隔' }],
                        initialValue : format
                    })(
                    <Select>
                        <Option value='m1'>1分钟</Option>
                        <Option value='m5'>5分钟</Option>
                        <Option value='h1'>1小时</Option>
                        <Option value='d1'>1天</Option>
                    </Select>
                    )}
                </FormItem>
                <FormItem>
                    <Button onClick={this.handleSearch} >查询</Button>
                </FormItem>
                <FormItem>
                    <Button onClick={this.handleReset} >刷新今日</Button>
                </FormItem>
                <FormItem>
                    {   
                        this.state.visible?
                        <Button onClick={this.handleTime}>进入实时监控</Button>
                        :
                        <Button onClick={this.handleTimeExit}>退出实时监控</Button>
                    }
                    
                </FormItem>
            </Form>
        )
    }

    // echart data
    getChartData(values) {
        const {config} = this.props
        this.setState({
            loading: true
        });

        http.post('/get_history_data_padded', {
            pointList: config.PointNameList,
            timeStart:values.timeRange[0].format(TIME_FORMAT),
            timeEnd:values.timeRange[1].format(TIME_FORMAT),
            timeFormat:values.format
        }).then(
            data => {
                if (!this.container) {
                    throw new Error('Error: the instance of container is undefined')
                }
                if (data.error) {
                    Modal.warning({
                        title: '查询失败！',
                        content: (
                          <div>
                            <p>{data.msg}</p>
                          </div>
                        )
                      })
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
        const data = this.state.data;
        const hiddenPoints = this.props.points
            .filter(row => !row['visible'])
            .map(row => row['name']);

        return {
            title: {
                text: '点位折线图'
            },
            legend: {
                data:Object.keys(data.map)
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
                    data : data.time
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series: Object.keys(data.map)
            .filter(row => hiddenPoints.indexOf(row) === -1)
            .map((key) => ({
                name: key,
                type: 'line',
                data: data.map[key]
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
            <div >
                <div className={s['header']}>      
                    {this.createForm()}
                </div>
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
                            ref={this.saveChartRef}
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


const LineChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class LineChartComponent extends Widget {
    
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
                <LineChartView
                    timeRange={getTimeRange('today')}
                    format='m5'
                    {...this.props}
                />
            </div>
        )
    }
}

export default  LineChartComponent


