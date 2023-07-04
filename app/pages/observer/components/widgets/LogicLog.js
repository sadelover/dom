import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';
import { downloadUrl } from '../../../../common/utils.js';
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import s from './LogicLog.css';
import { DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Progress,Tabs} from 'antd';
import moment from 'moment';
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;
const dateFormat = "YYYY-MM-DD HH:mm:ss"
const dayFormat = "YYYY-MM-DD"


const columns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width:200
    },
    {
      title: '日志内容',
      dataIndex: 'loginfo',
      key: 'loginfo',
      render:(text)=>{
        return text.slice(text.indexOf(']')+1)
      }
    }
];
const pointLogColumns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '点名',
      dataIndex: 'pointName',
      key: 'pointName',
    },
    {
      title: '指令来源',
      dataIndex: 'logicName',
      key: 'logicName',
    },
    {
      title: '指令值',
      dataIndex: 'value',
      key: 'value',
    }
];
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'logicLog',
    name : '策略日志组件',
    description : "生成策略日志组件",
}

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
            dll:this.props.config.logicList[0]['name'],
            data:[],
            loading:false,
            timeString:moment().format(dateFormat),
            timeFrom:'',
            timeTo:'',
            pointName:'',
            pointLogLoading:false,
            pointLogData:[]
        }
     
    }

    hanldeChange = (dll) => {
        this.setState({
            dll:dll
        })
    }
    
    getLatestRoundLogInfo = () => {
        let date = 'log_'+ moment().format("YYYY_MM_DD")
        let dll = this.state.dll
        if(dll == ''){
            return
        }
        this.setState({
            loading:true
        })
        http.post('/strategy/getLatestRoundLogInfo',{
            searchTime: date,
            dllName: dll+'.dll'
        }).then(
            res => {
                if(res.err == 0){
                    this.setState({
                        data:res.data,
                        loading:false
                    })
                }else{
                    this.setState({
                        data:[],
                        loading:false
                    })
                    message.info(res.msg)
                }
            }
        ).catch(
            err => {
                this.setState({
                    data:[],
                    loading:false
                })
                message.info('接口请求失败')
            }
        )
    }

    getOneRoundLogOfVeryTime = () => {
        let {dll,timeString} = this.state
        if(dll == ''){
            return
        }
        let defaultDate = moment().locale('zh-cn').format(dateFormat)
        let searchTime = timeString ? timeString : defaultDate
        this.setState({
            loading:true
        })
        http.post('/strategy/getOneRoundLogOfVeryTime',{
            time: searchTime,
            strategyName: dll
        }).then(
            res => {
                if(res.err == 0){
                    this.setState({
                        data:res.data,
                        loading:false
                    })
                }else{
                    this.setState({
                        data:[],
                        loading:false
                    })
                    message.info(res.msg)
                }
            }
        ).catch(
            err => {
                this.setState({
                    data:[],
                    loading:false
                })
                message.info('接口请求失败')
            }
        )
    }

    getLogInfo = () => {
        let {dll,timeString} = this.state
        if(dll == ''){
            return
        }
        this.setState({
            loading:true
        })
        let defaultDate = moment().locale('zh-cn').format(dayFormat)
        let searchTime = 'log_' + (timeString ? moment(timeString).format(dayFormat) : defaultDate).replace(/-/g, '_')
        http.post('/strategy/getLogInfo', {
            searchTime: searchTime,
            dllName: dll+'.dll'
        }).then(
            res => {
                if(res.status == true){
                    this.setState({
                        data:res.data,
                        loading:false
                    })
                }else{
                    this.setState({
                        data:[],
                        loading:false
                    })
                    message.info(res.msg)
                }
            }
        ).catch(
            err => {
                this.setState({
                    data:[],
                    loading:false
                })
                message.info('接口请求失败')
            }
        )
    }

    timeOnChange = (date,dateString) => {
        this.setState({
            timeString:dateString
        })
    }

    onChange = (date,dateString) => {
       this.setState({
           timeFrom:dateString[0],
           timeTo:dateString[1]
       })
    }

    pointNameChange = (e) => {
        this.setState({
            pointName:e.target.value
        })
    }

    Search = () => {
        let {timeFrom,timeTo,pointName} = this.state
        if(timeFrom && timeTo && pointName){
            this.setState({
                pointLogLoading:true
            })
            http.post('/operation/logicRecordOutput',{
                pointName:pointName,
                timeFrom:timeFrom,
                timeTo:timeTo
            }).then(
                res => {
                    if(res.err == 0){
                        this.setState({
                            pointLogData:res.data,
                            pointLogLoading:false
                        })
                    }else{
                        this.setState({
                            pointLogData:[],
                            pointLogLoading:false
                        })
                        message.info(res.msg)
                    }
                }
            ).catch(
                err => {
                    this.setState({
                        pointLogData:[],
                        pointLogLoading:false
                    })
                    message.info('接口请求失败')
                }
            )
        }else{
            return
        }
    }

    downloadOneDayLogOfVeryDate = () => {
        let {dll,timeString} = this.state
        if(dll == ''){
            return
        }
        let defaultDate = moment().locale('zh-cn').format(dayFormat)
        let searchTime = timeString ? moment(timeString).format(dayFormat) : defaultDate
        http.post('/strategy/downloadOneDayLogOfVeryDate', {
            strategyName: dll,
            date: searchTime
        }).then(
            res => {
                if(res.err==0){
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/siteinterface/static/files/temp/${res.data}`)
                }else{
                    message.info(res.msg)
                }
            }
        ).catch(
            err => {
                message.info('下载日志接口请求失败')
            }
        )
    }

    todayTime = () => {
        let timeFrom = moment().startOf('day').format(dateFormat)
        let timeTo = moment().format(dateFormat)
        this.setState({
            timeFrom: timeFrom,
            timeTo: timeTo
        })
    }

    oneHourTime = () => {
        let timeFrom = moment().add(-1, 'hour').format(dateFormat)
        let timeTo = moment().format(dateFormat)
        this.setState({
            timeFrom: timeFrom,
            timeTo: timeTo
        })
    }

    tabChange = () => {
        this.oneHourTime()
    }

    render() {
        let {data,loading,pointLogData,pointLogLoading} = this.state
        let logicList = this.props.config.logicList
        let options = logicList.map(item=>{
            return <Option value={item.name}>{item.title}</Option>
        })
        return (
            <div className={s['body']}>
                <Tabs defaultActiveKey="1" type="card" onChange={this.tabChange}>
                    <TabPane tab="策略日志查询" key="1">
                        <div className={s['header']}>
                            策略选择：
                            <Select style={{width:200,marginRight:10}} defaultValue={logicList[0]['name']} onChange={this.hanldeChange}>
                                {options}
                            </Select>
                            查询时刻：
                            <DatePicker defaultValue={moment(moment(), dateFormat)} format={dateFormat} onChange={this.timeOnChange}/>
                            <Button className={s['left']} onClick={this.getLatestRoundLogInfo}>本轮Log查询</Button> 
                            <Button className={s['left']} onClick={this.getLogInfo}>当日Log查询</Button> 
                            <Button className={s['left']} onClick={this.getOneRoundLogOfVeryTime}>指定时间轮Log查询</Button>  
                            <Button className={s['left']} onClick={this.downloadOneDayLogOfVeryDate}>当日Log下载</Button>           
                        </div>
                        <div>
                            <Table 
                                dataSource={data} 
                                columns={columns} 
                                scroll={{y:700}}
                                pagination={{
                                    defaultPageSize:100
                                }}
                                loading={loading} 
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="策略指令查询" key="2">
                        <div className={s['header']}>
                            查询时间范围：
                            <RangePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                format={dateFormat}
                                placeholder={['Start Time', 'End Time']}
                                value={[moment(this.state.timeFrom, dateFormat), moment(this.state.timeTo, dateFormat)]}
                                onChange={this.onChange}
                            />
                            <Button className={s['left']} onClick={this.todayTime}>今日</Button>
                            <Button className={s['left']} onClick={this.oneHourTime}>最近一小时</Button>
                            <Search 
                                placeholder="请输入点名" 
                                style={{
                                    width: 300,
                                    marginLeft: 10
                                }} 
                                enterButton 
                                onChange={this.pointNameChange}
                                onSearch={this.Search}
                            />
                        </div>
                        <div>
                            <Table 
                                dataSource={pointLogData} 
                                columns={pointLogColumns} 
                                scroll={{y:700}}
                                pagination={{
                                    defaultPageSize:100
                                }}
                                loading={pointLogLoading} 
                            />
                        </div>
                    </TabPane>
                </Tabs>
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
class LogicLogComponent extends Widget {
    
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

export default  LogicLogComponent


