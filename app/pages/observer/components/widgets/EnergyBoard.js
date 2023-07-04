import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import { DatePicker,Row,Col, Tabs ,Button ,Radio ,message,Input,Spin,Card,Icon, Modal, Table} from 'antd';
import moment from 'moment'
import s from './EnergyBoard.css';
const { MonthPicker } = DatePicker;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { TabPane } = Tabs;
const dateFormat = 'YYYY-MM-DD'
const monthFormat = 'YYYY-MM'

class TableView extends React.Component {
    constructor(props){
        super(props)
        this.state={

        }
    }

    render(){
        const columns = [
            {
                title: '事件',
                dataIndex: 'title',
                key: 'title',
                width:150
            },
            {
                title: '发生原因',
                dataIndex: 'diag',
                key: 'diag',
                width:250
            },
            {
                title: '位置',
                dataIndex: 'location',
                key: 'location',
                width:50
            },
            {
                title: '建议',
                dataIndex: 'suggestion',
                key: 'suggestion',
                width:120
            }
        ];
        return(
            <Table 
                dataSource={this.props.dataSource}
                columns={columns}
                pagination={false}
                scroll={{
                    y:500
                }}
            />
        )
    }

}



var timer
class EnergyBoardComponent extends React.Component {
    constructor(props){
        super(props)
        this.state={
            gatewayCountPointValue:'--',
            meterCountPointValue:'--',
            gatewayOnlinePercentPointValue:'--',
            powerMeterOnlinePercentPointValue:'--',
            nowPowerTotal:'--',
            nowPowerTotalYestoday:'',
            lastPowerTotal:'--',
            tongbi:'--',
            mode:'day',
            config:{},
            single: moment().format('YYYY-MM-DD'),
            current:0,
            data:[],
            lastData:[],
            time:[],
            loading:false,
            loading2: false,   //后面带2的代表饼图所需
            pieData:[],
            flag:0,
            childrenData:[],
            childIndex:0
        }
        this.container  = null
        this.chart = null;
        this.container2 = null
        this.chart2 = null
    }

    componentDidMount() {
        let config = JSON.parse(localStorage.getItem("energyManagementDefine"))
        this.setState({
            single: moment().format('YYYY-MM-DD'),
            config:config
        })
        this.getPowerTotal(this.state.mode,moment().format(dateFormat),this.state.current)

        let gatewayCountPointValue = '--',meterCountPointValue = '--',gatewayOnlinePercentPointValue='--',powerMeterOnlinePercentPointValue='--'
        if(this.props.custom_realtime_data && this.props.custom_realtime_data != []){
            this.props.custom_realtime_data.map(item=>{
                if(item.name == config.gatewayCountPointName){
                    gatewayCountPointValue = Number(item.value).toFixed(0)
                }else if(item.name == config.meterCountPointName){
                    meterCountPointValue = Number(item.value).toFixed(0)
                }else if(item.name == config.gatewayOnlinePercentPointName){
                    if(Number(item.value) == 100){
                        gatewayOnlinePercentPointValue = Number(item.value).toFixed(0) 
                    }else{
                        gatewayOnlinePercentPointValue = Number(item.value).toFixed(1) 
                    }
                }else if(item.name == config.powerMeterOnlinePercentPointName){
                    if(Number(item.value) == 100){
                        powerMeterOnlinePercentPointValue = Number(item.value).toFixed(0)
                    }else{
                        powerMeterOnlinePercentPointValue = Number(item.value).toFixed(1)
                    }
                }
            })
            this.setState({
                gatewayCountPointValue: gatewayCountPointValue,
                meterCountPointValue: meterCountPointValue,
                gatewayOnlinePercentPointValue: gatewayOnlinePercentPointValue,
                powerMeterOnlinePercentPointValue: powerMeterOnlinePercentPointValue
            })
        }

    }

    shouldComponentUpdate(nextProps,nextState){
        if(this.state.gatewayCountPointValue != nextState.gatewayCountPointValue){
            return true
        }
        if(this.state.meterCountPointValue != nextState.meterCountPointValue){
            return true
        }
        if(this.state.gatewayOnlinePercentPointValue != nextState.gatewayOnlinePercentPointValue){
            return true
        }
        if(this.state.powerMeterOnlinePercentPointValue != nextState.powerMeterOnlinePercentPointValue){
            return true
        }
        if(this.state.nowPowerTotal != nextState.nowPowerTotal){
            return true
        }
        if(this.state.nowPowerTotalYestoday != nextState.nowPowerTotalYestoday){
            return true
        }
        if(this.state.lastPowerTotal != nextState.lastPowerTotal){
            return true
        }
        if(this.state.tongbi != nextState.tongbi){
            return true
        }
        if(this.state.mode != nextState.mode){
            return true
        }
        if(this.state.single != nextState.single){
            return true
        }
        if(this.state.current != nextState.current){
            return true
        }
        if(this.state.loading != nextState.loading){
            return true
        }
        if(this.state.flag != nextState.flag){
            return true
        }
        if(this.state.childIndex != nextState.childIndex){
            return true
        }
        if(JSON.stringify(this.state.config) != JSON.stringify(nextState.config)){
            return true
        }
        if(JSON.stringify(this.state.data) != JSON.stringify(nextState.data)){
            return true
        }
        if(JSON.stringify(this.state.lastData) != JSON.stringify(nextState.lastData)){
            return true
        }
        if(JSON.stringify(this.state.time) != JSON.stringify(nextState.time)){
            return true
        }
        if(JSON.stringify(this.state.pieData) != JSON.stringify(nextState.pieData)){
            return true
        }
        if(JSON.stringify(this.state.childrenData) != JSON.stringify(nextState.childrenData)){
            return true
        }
        return false
    }

    componentWillReceiveProps(nextProps){
        let config = this.state.config
        let gatewayCountPointValue = '--',meterCountPointValue = '--',gatewayOnlinePercentPointValue='--',powerMeterOnlinePercentPointValue='--'
        if(JSON.stringify(nextProps.custom_realtime_data) != JSON.stringify(this.props.custom_realtime_data)){
            nextProps.custom_realtime_data.map(item=>{
                if(item.name == config.gatewayCountPointName){
                    gatewayCountPointValue = Number(item.value).toFixed(0)
                }else if(item.name == config.meterCountPointName){
                    meterCountPointValue = Number(item.value).toFixed(0)
                }else if(item.name == config.gatewayOnlinePercentPointName){
                    if(Number(item.value) == 100){
                        gatewayOnlinePercentPointValue = Number(item.value).toFixed(0) 
                    }else{
                        gatewayOnlinePercentPointValue = Number(item.value).toFixed(1) 
                    }
                }else if(item.name == config.powerMeterOnlinePercentPointName){
                    if(Number(item.value) == 100){
                        powerMeterOnlinePercentPointValue = Number(item.value).toFixed(0)
                    }else{
                        powerMeterOnlinePercentPointValue = Number(item.value).toFixed(1)
                    }
                }
            })
            this.setState({
                gatewayCountPointValue: gatewayCountPointValue,
                meterCountPointValue: meterCountPointValue,
                gatewayOnlinePercentPointValue: gatewayOnlinePercentPointValue,
                powerMeterOnlinePercentPointValue: powerMeterOnlinePercentPointValue
            })
        }else{
            return
        }
    }
   
    componentWillUnmount(){
        clearInterval(timer)
    }

    changeMode = (e) => {
        this.setState({
            mode: e.target.value,
            single: moment().format(dateFormat)
        })
        this.getPowerTotal(e.target.value,moment().format(dateFormat),this.state.current)
    }

    changeTime = (date,dateStr) => {
        let time = moment(dateStr).format(dateFormat)
        this.setState({
            single: time
        })
        this.getPowerTotal(this.state.mode,time,this.state.current)
    }

    disabledDate = (current) => {
        const config = this.state.config
        const dateStr = config.dataStartDate?config.dataStartDate:''
        // Can not select days before today and today
        return current && (current > moment().endOf('day') || current < moment(dateStr))
    }

    addTime = () => {
        const {single,mode,current} = this.state
        let newTime = ''
        if(mode == 'day'){
            newTime = moment(single).add(1,'days').format(dateFormat)
        }else{
            newTime = moment(single).add(1,'month').format(dateFormat)
        }

        if(newTime> moment().format(dateFormat)){
            message.info('超出可选择时间范围')
            return
        }

        this.setState({
            single: newTime
        })
        this.getPowerTotal(mode,newTime,current)
    }

    reduceTime = () => {
        const {single,mode,current} = this.state
        const config = this.state.config
        const dateStr = config.dataStartDate?config.dataStartDate:''
        let newTime = ''
        if(mode == 'day'){
            newTime = moment(single).subtract(1,'days').format(dateFormat)
        }else{
            newTime = moment(single).subtract(1,'month').format(dateFormat)
        }

        if(newTime< dateStr){
            message.info('超出可选择时间范围')
            return
        }

        this.setState({
            single: newTime
        })
        this.getPowerTotal(mode,newTime,current)
    }

    getTabs = () => {
        const config = this.state.config
        if(config.distributionGroupList && config.distributionGroupList.children){
            return config.distributionGroupList.children.map((item,index)=>{
                return <RadioButton value={index+1}>{item.name}</RadioButton>
            }) 
        }
    }

    changeCurrent = (e) => {
        this.setState({
            current: e.target.value
        })
        this.getPowerTotal(this.state.mode,this.state.single,e.target.value)
    }

    getPowerTotal = (mode,single,current) => {
        clearInterval(timer)
        let config = JSON.parse(localStorage.getItem("energyManagementDefine"))
        let pointNamePowerTotal = ''   //能耗点位
        let pointNamePower = ''    //功率点位
        let nowTime = ''  //当日时间or实时时间
        let lastTime = ''  //前日时间
        let nowTimeYestoday = '' //前日同比时间
        let historyEndTime = ''  
	    let lastHistoryStartTime = ''
        let pointPrefix = ''
        let pointList = []
        this.setState({
            nowPowerTotal:'--',
            lastPowerTotal:'--',
            tongbi:'--',
            loading: true,
            loading2: true,
            childrenData:[],
            flag:0
        })
        if(current == 0){
            config.distributionGroupList && config.distributionGroupList.pointPrefix && (pointPrefix = config.distributionGroupList.pointPrefix)
        }else{
            config.distributionGroupList && config.distributionGroupList.children && (pointPrefix = config.distributionGroupList.children[current-1]['pointPrefix'])
        }

        if(mode == 'day'){
            pointNamePower = pointPrefix + 'GroupPower'
            pointNamePowerTotal = 'ThisDay' + pointPrefix + 'GroupPowerTotal'

            lastTime = moment(single).format('YYYY-MM-DD 00:00:00')
            lastHistoryStartTime = moment(single).subtract(1,'days').format('YYYY-MM-DD 00:00:00')

            if(config.distributionGroupList && config.distributionGroupList.children && current == 0){
                config.distributionGroupList.children.map(item=>{
                    pointList.push('ThisDay'+ item.pointPrefix + 'GroupPowerTotal')
                })
            }else{
                config.distributionGroupList.children[current-1].children.map(item=>{
                    pointList.push('ThisDay'+ item.pointPrefix + 'PowerTotal'+item.no)
                })
            }

            if(single == moment().format(dateFormat)){
                nowTimeYestoday = moment().subtract(1,'days').format('YYYY-MM-DD HH:mm:00')
                historyEndTime = moment().format('YYYY-MM-DD HH:mm:00')
                http.post('/get_realtimedata',{
                    pointList:[pointNamePowerTotal],
                    proj:1
                }).then(res=>{
                    if(res.length > 0){
                        let  realtimePowerTotal = res[0]['value']
                        this.setState({
                            nowPowerTotal: Number(realtimePowerTotal).toFixed(0)
                        })
                        http.post('/get_history_data_padded',{
                            pointList: [pointNamePowerTotal],
                            timeFormat:'m1',
                            timeStart: nowTimeYestoday,
                            timeEnd: nowTimeYestoday
                        }).then(ret=>{
                            if(ret['map'] && ret['map'][pointNamePowerTotal]){
                                let num = '--'
                                let value = ret['map'][pointNamePowerTotal][0]
                                if(realtimePowerTotal && realtimePowerTotal != 0 && value != 0 && value != undefined){
                                    num = ((realtimePowerTotal - value)/value*100).toFixed(0)
                                }
                                this.setState({
                                    tongbi: num
                                })
                            }
                        })
                    }
                })
                
                //趋势图数据
    
                http.post('/get_history_data_padded',{
                    pointList: [pointNamePower],
                    timeFormat:'m1',
                    timeStart: lastHistoryStartTime,
                    timeEnd: historyEndTime
                }).then(ret=>{
                    if(ret['map'] && ret['map'][pointNamePower]){
                        let time=[],data=[],lastData=[]
                        ret['time'].map((item,index)=>{
                            if(moment(item).format(dateFormat) > moment(lastHistoryStartTime).format(dateFormat)){
                                data.push(ret['map'][pointNamePower][index])
                            }else{
                                time.push(moment(item).add(1,'days').format('YYYY-MM-DD HH:mm'))
                                lastData.push(ret['map'][pointNamePower][index])
                            }
                        })
                        this.setState({
                            time: time,
                            data: data,
                            lastData: lastData,
                            loading:false
                        })
                    }
                })
                
                // 获取今日各区域电量
                http.post('/get_realtimedata',{
                    pointList:pointList,
                    proj:1
                }).then(res=>{
                    let data = res
                    let num = 0
                    let arr = []
                    data.sort((a,b)=>{return b.value -a.value})
                    data.map((item,index)=>{
                        if(index<5){
                            item.value = Number(item.value).toFixed(0)
                            arr.push(item)
                        }else{
                            num += Number(item.value)
                        }
                    })
                    arr.push({name:'其它',value:num.toFixed(0)})
                    this.setState({
                        pieData: arr,
                        loading2: false
                    })
                })

                timer = setInterval(()=>{
                    nowTimeYestoday = moment().subtract(1,'days').format('YYYY-MM-DD HH:mm:00')
                    historyEndTime = moment().format('YYYY-MM-DD HH:mm:00')
                    http.post('/get_realtimedata',{
                        pointList:[pointNamePowerTotal],
                        proj:1
                    }).then(res=>{
                        if(res.length > 0){
                            let  realtimePowerTotal = res[0]['value']
                            this.setState({
                                nowPowerTotal: Number(realtimePowerTotal).toFixed(0)
                            })
                            http.post('/get_history_data_padded',{
                                pointList: [pointNamePowerTotal],
                                timeFormat:'m1',
                                timeStart: nowTimeYestoday,
                                timeEnd: nowTimeYestoday
                            }).then(ret=>{
                                if(ret['map'] && ret['map'][pointNamePowerTotal]){
                                    let num = '--'
                                    let value = ret['map'][pointNamePowerTotal][0]
                                    if(realtimePowerTotal && realtimePowerTotal != 0 && value != 0 && value != undefined){
                                        num = ((realtimePowerTotal - value)/value*100).toFixed(0)
                                    }
                                    this.setState({
                                        tongbi: num
                                    })
                                }
                            })
                        }
                    })
                    //趋势图数据
                    http.post('/get_history_data_padded',{
                        pointList: [pointNamePower],
                        timeFormat:'m1',
                        timeStart: lastHistoryStartTime,
                        timeEnd: historyEndTime
                    }).then(ret=>{
                        if(ret['map'] && ret['map'][pointNamePower]){
                            let time=[],data=[],lastData=[]
                            ret['time'].map((item,index)=>{
                                if(moment(item).format(dateFormat) > moment(lastHistoryStartTime).format(dateFormat)){
                                    data.push(ret['map'][pointNamePower][index])
                                }else{
                                    time.push(moment(item).add(1,'days').format('YYYY-MM-DD HH:mm'))
                                    lastData.push(ret['map'][pointNamePower][index])
                                }
                            })
                            this.setState({
                                time: time,
                                data: data,
                                lastData: lastData,
                                loading: false
                            })
                        }
                    })

                    // 获取今日各区域电量
                    http.post('/get_realtimedata',{
                        pointList:pointList,
                        proj:1
                    }).then(res=>{
                        let data = res
                        let num = 0
                        let arr = []
                        data.sort((a,b)=>{return b.value -a.value})
                        data.map((item,index)=>{
                            if(index<5){
                                item.value = Number(item.value).toFixed(0)
                                arr.push(item)
                            }else{
                                num += Number(item.value)
                            }
                        })
                        arr.push({name:'其它',value:num.toFixed(0)})
                        this.setState({
                            pieData: arr,
                            loading2: false
                        })
                    })

                },180000)
            }else{
                nowTime = moment(single).add(1,'days').format('YYYY-MM-DD 00:00:00')
                historyEndTime = moment(single).add(1,'days').format('YYYY-MM-DD 00:00:00')
                
                http.post('/get_history_data_padded',{
                    pointList: [pointNamePowerTotal],
                    timeFormat:'m1',
                    timeStart: nowTime,
                    timeEnd: nowTime
                }).then(res=>{
                    if(res['map'] && res['map'][pointNamePowerTotal]){
                        let num = '--'
                        let value = res['map'][pointNamePowerTotal][0]
                        if(this.state.lastPowerTotal != '--' && this.state.lastPowerTotal != 0 && nowTimeYestoday == '' && value != 0){
                            num = ((value - this.state.lastPowerTotal)/this.state.lastPowerTotal*100).toFixed(0)
                            this.setState({
                                tongbi: num
                            })
                        }
                        this.setState({
                            nowPowerTotal: value.toFixed(0),
                        })
                    }
                })
    
                //饼图
                http.post('/get_history_data_padded',{
                    pointList: pointList,
                    timeFormat:'m1',
                    timeStart: nowTime,
                    timeEnd: nowTime
                }).then(res=>{
                    if(res['map']){
                        let arr = []
                        let num = 0
                        let data = []
                        for(let i in res['map']){
                            arr.push({name:i,value:res['map'][i]})
                        }
                        arr.sort((a,b)=>{return b.value -a.value})
                        arr.map((item,index)=>{
                            if(index<5){
                                item.value = Number(item.value).toFixed(0)
                                data.push(item)
                            }else{
                                num += Number(item.value)
                            }
                        })
                        data.push({name:'其它',value:num.toFixed(0)})
                        this.setState({
                            loading2: false,
                            pieData: data
                        })
                    }
                })
                //趋势图数据
                http.post('/get_history_data_padded',{
                    pointList: [pointNamePower],
                    timeFormat:'m1',
                    timeStart: lastHistoryStartTime,
                    timeEnd: historyEndTime
                }).then(ret=>{
                    if(ret['map'] && ret['map'][pointNamePower]){
                        let time=[],data=[],lastData=[]
                        ret['time'].map((item,index)=>{
                            if(moment(item).format(dateFormat) > moment(lastHistoryStartTime).format(dateFormat)){
                                data.push(ret['map'][pointNamePower][index])
                            }else{
                                time.push(moment(item).add(1,'days').format('YYYY-MM-DD HH:mm'))
                                lastData.push(ret['map'][pointNamePower][index])
                            }
                        })
                        this.setState({
                            time: time,
                            data: data,
                            lastData: lastData,
                            loading: false
                        })
                    }
                })
            }

            http.post('/get_history_data_padded',{
                pointList: [pointNamePowerTotal],
                timeFormat:'m1',
                timeStart: lastTime,
                timeEnd: lastTime
            }).then(res=>{
                if(res['map'] && res['map'][pointNamePowerTotal]){
                    let num = '--'
                    let value = res['map'][pointNamePowerTotal][0]
                    if(this.state.nowPowerTotal != '--' && this.state.nowPowerTotal != 0 && nowTimeYestoday == '' && value != 0){
                        num = ((this.state.nowPowerTotal - value)/value*100).toFixed(0)
                        this.setState({
                            tongbi: num
                        })
                    }
                    this.setState({
                        lastPowerTotal: value.toFixed(0),
                    })
                }
            })


        }else{
            pointNamePowerTotal = 'ThisMonth' + pointPrefix + 'GroupPowerTotal'

            //每日用电量点位
            let dayPowerTotal = 'ThisDay' + pointPrefix + 'GroupPowerTotal'

            lastTime = moment(single).format('YYYY-MM-01 00:00:00')
            lastHistoryStartTime = moment(single).subtract(1,'month').format('YYYY-MM-01 00:00:00')

            if(config.distributionGroupList && config.distributionGroupList.children && current == 0){
                config.distributionGroupList.children.map(item=>{
                    pointList.push('ThisMonth'+ item.pointPrefix + 'GroupPowerTotal')
                })
            }else{
                config.distributionGroupList.children[current-1].children.map(item=>{
                    pointList.push('ThisMonth'+ item.pointPrefix + 'PowerTotal'+item.no)
                })
            }

            if(single == moment().format(dateFormat)){
                nowTimeYestoday = moment().subtract(1,'month').format('YYYY-MM-DD HH:mm:00')
                historyEndTime = moment().format('YYYY-MM-DD HH:mm:00')
                http.post('/get_realtimedata',{
                    pointList:[pointNamePowerTotal],
                    proj:1
                }).then(res=>{
                    if(res.length > 0){
                        let  realtimePowerTotal = res[0]['value']
                        this.setState({
                            nowPowerTotal: Number(realtimePowerTotal).toFixed(0)
                        })
                        http.post('/get_history_data_padded',{
                            pointList: [pointNamePowerTotal],
                            timeFormat:'m1',
                            timeStart: nowTimeYestoday,
                            timeEnd: nowTimeYestoday
                        }).then(ret=>{
                            if(ret['map'] && ret['map'][pointNamePowerTotal]){
                                let num = '--'
                                let value = ret['map'][pointNamePowerTotal][0]
                                if(realtimePowerTotal && realtimePowerTotal != 0 && value != 0 && value != undefined){
                                    num = ((realtimePowerTotal - value)/value*100).toFixed(0)
                                }
                                this.setState({
                                    tongbi: num
                                })
                            }
                        })
                    }
                })
                
                //趋势图数据
    
                http.post('/get_history_data_padded',{
                    pointList: [dayPowerTotal],
                    timeFormat:'d1',
                    timeStart: lastHistoryStartTime,
                    timeEnd: historyEndTime
                }).then(ret=>{
                    if(ret['map'] && ret['map'][dayPowerTotal]){
                        let time=[],data=[],lastData=[]
                        ret['time'].map((item,index)=>{
                            if(moment(item).format(monthFormat) > moment(lastHistoryStartTime).format(monthFormat)){
                                if(index < ret['time'].length -1){
                                    data.push(Number(ret['map'][dayPowerTotal][index+1]).toFixed(0))
                                }
                            }else{
                                lastData.push(Number(ret['map'][dayPowerTotal][index+1]).toFixed(0))
                            }
                        })
                        time = ['1号','2号','3号','4号','5号','6号','7号','8号','9号','10号','11号','12号','13号','14号','15号','16号','17号','18号','19号','20号','21号','22号','23号','24号','25号','26号','27号','28号','29号','30号','31号']
                        this.setState({
                            time: time,
                            data: data,
                            lastData: lastData,
                            loading: false
                        })
                    }
                })

                // 获取当月各区域电量
                http.post('/get_realtimedata',{
                    pointList:pointList,
                    proj:1
                }).then(res=>{
                    let data = res
                    let num = 0
                    let arr = []
                    data.sort((a,b)=>{return b.value -a.value})
                    data.map((item,index)=>{
                        if(index<5){
                            item.value = Number(item.value).toFixed(0)
                            arr.push(item)
                        }else{
                            num += Number(item.value)
                        }
                    })
                    arr.push({name:'其它',value:num.toFixed(0)})
                    this.setState({
                        pieData: arr,
                        loading2: false
                    })
                })

                timer = setInterval(()=>{
                    nowTimeYestoday = moment().subtract(1,'month').format('YYYY-MM-DD HH:mm:00')
                    http.post('/get_realtimedata',{
                        pointList:[pointNamePowerTotal],
                        proj:1
                    }).then(res=>{
                        if(res.length > 0){
                            let  realtimePowerTotal = res[0]['value']
                            this.setState({
                                nowPowerTotal: Number(realtimePowerTotal).toFixed(0)
                            })
                            http.post('/get_history_data_padded',{
                                pointList: [pointNamePowerTotal],
                                timeFormat:'m1',
                                timeStart: nowTimeYestoday,
                                timeEnd: nowTimeYestoday
                            }).then(ret=>{
                                if(ret['map'] && ret['map'][pointNamePowerTotal]){
                                    let num = '--'
                                    let value = ret['map'][pointNamePowerTotal][0]
                                    if(realtimePowerTotal && realtimePowerTotal != 0 && value != 0 && value != undefined){
                                        num = ((realtimePowerTotal - value)/value*100).toFixed(0)
                                    }
                                    this.setState({
                                        tongbi: num
                                    })
                                }
                            })
                        }
                    })
                },180000)
            }else{
                nowTime = moment(single).add(1,'month').format('YYYY-MM-01 00:00:00')
                historyEndTime = moment(single).add(1,'month').format('YYYY-MM-01 00:00:00')
                http.post('/get_history_data_padded',{
                    pointList: [pointNamePowerTotal],
                    timeFormat:'m1',
                    timeStart: nowTime,
                    timeEnd: nowTime
                }).then(res=>{
                    if(res['map'] && res['map'][pointNamePowerTotal]){
                        let num = '--'
                        let value = res['map'][pointNamePowerTotal][0]
                        if(this.state.lastPowerTotal != '--' && this.state.lastPowerTotal != 0 && nowTimeYestoday == '' && value != 0){
                            num = ((value - this.state.lastPowerTotal)/this.state.lastPowerTotal*100).toFixed(0)
                            this.setState({
                                tongbi: num
                            })
                        }
                        this.setState({
                            nowPowerTotal: value.toFixed(0),
                        })
                    }
                })

                //饼图
                http.post('/get_history_data_padded',{
                    pointList: pointList,
                    timeFormat:'m1',
                    timeStart: nowTime,
                    timeEnd: nowTime
                }).then(res=>{
                    if(res['map']){
                        let arr = []
                        let num = 0
                        let data = []
                        for(let i in res['map']){
                            arr.push({name:i,value:res['map'][i]})
                        }
                        arr.sort((a,b)=>{return b.value -a.value})
                        arr.map((item,index)=>{
                            if(index<5){
                                item.value = Number(item.value).toFixed(0)
                                data.push(item)
                            }else{
                                num += Number(item.value)
                            }
                        })
                        data.push({name:'其它',value:num.toFixed(0)})
                        this.setState({
                            loading2: false,
                            pieData: data
                        })
                    }
                })

                //趋势图数据
    
                http.post('/get_history_data_padded',{
                    pointList: [pointNamePowerTotal],
                    timeFormat:'d1',
                    timeStart: lastHistoryStartTime,
                    timeEnd: historyEndTime
                }).then(ret=>{
                    if(ret['map'] && ret['map'][pointNamePowerTotal]){
                        let time=[],data=[],lastData=[]
                        ret['time'].map((item,index)=>{
                            if(moment(item).format(monthFormat) > moment(lastHistoryStartTime).format(monthFormat)){
                                data.push(ret['map'][pointNamePowerTotal][index+1])
                            }else{
                                lastData.push(ret['map'][pointNamePowerTotal][index+1])
                            }
                        })
                        time = ['1号','2号','3号','4号','5号','6号','7号','8号','9号','10号','11号','12号','13号','14号','15号','16号','17号','18号','19号','20号','21号','22号','23号','24号','25号','26号','27号','28号','29号','30号','31号']
                        this.setState({
                            time: time,
                            data: data,
                            lastData: lastData,
                            loading: false
                        })
                    }
                })
            }

            http.post('/get_history_data_padded',{
                pointList: [pointNamePowerTotal],
                timeFormat:'m1',
                timeStart: lastTime,
                timeEnd: lastTime
            }).then(res=>{
                if(res['map'] && res['map'][pointNamePowerTotal]){
                    let num = '--'
                    let value = res['map'][pointNamePowerTotal][0]
                    if(this.state.nowPowerTotal != '--' && this.state.nowPowerTotal != 0 && nowTimeYestoday == '' && value != 0){
                        num = ((this.state.nowPowerTotal - value)/value*100).toFixed(0)
                        this.setState({
                            tongbi: num
                        })
                    }
                    this.setState({
                        lastPowerTotal: value.toFixed(0),
                    })
                }
            })
        }
    }

    saveChartRef = (refEchart) => {
        if (refEchart) {
          this.chart = refEchart.getEchartsInstance();
        } else {
          this.chart = null;
        }
    }

    saveChartRef2 = (refEchart) => {
        if (refEchart) {
          this.chart2 = refEchart.getEchartsInstance();
        } else {
          this.chart2 = null;
        }
    }

    getChartOption = () => {
        let data = this.state.data
        let lastData = this.state.lastData
        let time = this.state.time
        if(this.state.mode == 'day'){
            if(this.state.flag == 1){
                let config = this.state.config
                let childrenData = this.state.childrenData
                let current = this.state.current
                let newChildrenData = {}
                let childIndex = this.state.childIndex
                for(let i in childrenData){
                    if(current == 0){
                        config.distributionGroupList.children.map(item=>{
                            let name = i
                            if(i.replace('GroupPower','') == item.pointPrefix){
                                name = name + '（'+ item.name +'）'
                                newChildrenData[name] = childrenData[i]
                            }
                        })
                    }else if(current != 0){
                        config.distributionGroupList.children[current-1].children.map(item=>{
                            let name = i
                            if(i.replace('Power','') == (item.pointPrefix+item.no)){
                                name = name + '（'+ item.name +'）'
                                newChildrenData[name] = childrenData[i]
                            }
                        })
                    }
                }
                
                return {
                    backgroundColor:'rgba(42,55,79,0.9)',
                    title: {
                    text: '单支路趋势曲线',
                    textStyle: {
                        color: '#fff',
                        fontSize: 26,
                        fontWeight: 500
                    },
                    x:'center',
                    y:15
                    },
                    tooltip: {
                    trigger: 'axis',
                    },
                    legend: {
                        data: Object.keys(newChildrenData).map((key,index) =>{
                            if(index == childIndex){
                                return key
                            }
                        }),
                        textStyle: {
                            color: '#fff'
                        },
                        top:65
                    },
                    grid: {
                    top:110,
                    left: '3%',
                    right: '3%',
                    bottom: '3%',
                    containLabel: true
                    },
                    xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: time,
                    axisLine:{
                        lineStyle:{
                        color:'#fff'
                        }
                    }
                    },
                    yAxis: {
                    type: 'value',
                    axisLine:{
                        lineStyle:{
                        color:'#fff'
                        }
                    }
                    },
                    series:Object.keys(newChildrenData).map((key,index) =>{
                        let arr = []
                        arr = newChildrenData[key]
                        if(index == childIndex){
                            return{
                                name: key,
                                type: 'line',
                                data: arr,
                                itemStyle:{
                                    color:'rgba(0,145,255)',
                                } 
                            }
                        }
                    })
                }
            }else{
                return {
                    backgroundColor:'rgba(42,55,79,0.9)',
                    title: {
                    text: '能耗趋势曲线',
                    textStyle: {
                        color: '#fff',
                        fontSize: 26,
                        fontWeight: 500
                    },
                    x:'center',
                    y:15
                    },
                    tooltip: {
                    trigger: 'axis',
                    },
                    legend: {
                    data: ['前日功率','当日功率'],
                    textStyle: {
                        color: '#fff'
                    },
                    top:65
                    },
                    grid: {
                    top:110,
                    left: '3%',
                    right: '3%',
                    bottom: '3%',
                    containLabel: true
                    },
                    xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: time,
                    axisLine:{
                        lineStyle:{
                        color:'#fff'
                        }
                    }
                    },
                    yAxis: {
                    type: 'value',
                    axisLine:{
                        lineStyle:{
                        color:'#fff'
                        }
                    }
                    },
                    series: [{
                        name: '前日功率',
                        type: 'line',
                        smooth: true,
                        data: lastData,
                        itemStyle:{
                            color:'rgba(145,204,117)',
                        }
                    },
                    {
                        name: '当日功率',
                        type: 'line',
                        smooth: true,
                        data: data,
                        itemStyle:{
                            color:'rgba(0,145,255)',
                        }
                    }
                    ]
                }
            }
        }else{
            return {
                backgroundColor:'rgba(42,55,79,0.9)',
                title: {
                  text: '能耗趋势柱图',
                  textStyle: {
                    color: '#fff',
                    fontSize: 26,
                    fontWeight: 500
                  },
                  x:'center',
                  y:15
                },
                tooltip: {
                  trigger: 'axis',
                },
                legend: {
                  data: ['当日用电量','前月同日用电量'],
                  textStyle: {
                    color: '#fff'
                  },
                  top:65
                },
                grid: {
                  top:110,
                  left: '5%',
                  right: '3%',
                  bottom: '3%',
                  containLabel: true
                },
                xAxis: {
                  type: 'category',
                  boundaryGap: false,
                  data: time,
                  axisLine:{
                    lineStyle:{
                      color:'#fff'
                    }
                  }
                },
                yAxis: {
                  type: 'value',
                  offset:20,
                  axisLine:{
                    lineStyle:{
                      color:'#fff'
                    }
                  }
                },
                series: [{
                    name: '当日用电量',
                    type: 'bar',
                    data: data,
                    itemStyle:{
                        color:'rgba(0,145,255)',
                    }
                  },{
                    name: '前月同日用电量',
                    type: 'bar',
                    data: lastData,
                    itemStyle:{
                        color:'rgba(145,204,117)',
                    }
                  }
                ]
            }
        }
    }

    getChartOption2 = () => {
        const mode = this.state.mode
        const current = this.state.current
        let pieData = this.state.pieData
        let config = JSON.parse(localStorage.getItem("energyManagementDefine"))
        if(mode == 'day'){
            if(config.distributionGroupList && config.distributionGroupList.children && current == 0){
                config.distributionGroupList.children.map(item=>{
                    pieData.map(point=>{
                        if(point.name.replace('ThisDay','').replace('GroupPowerTotal','') == item.pointPrefix){
                            point.name = item.name
                        }
                    })
                })
            }else if(config.distributionGroupList && config.distributionGroupList.children && current != 0){
                config.distributionGroupList.children[current-1].children.map(item=>{
                    pieData.map(point=>{
                        if(point.name.replace('ThisDay','').replace('PowerTotal','') == (item.pointPrefix+ item.no)){
                            point.name = item.name
                        }
                    })
                })
            }
        }else{
            if(config.distributionGroupList && config.distributionGroupList.children && current == 0){
                config.distributionGroupList.children.map(item=>{
                    pieData.map(point=>{
                        if(point.name.replace('ThisMonth','').replace('GroupPowerTotal','') == item.pointPrefix){
                            point.name = item.name
                        }
                    })
                })
            }else if(config.distributionGroupList && config.distributionGroupList.children && current != 0){
                config.distributionGroupList.children[current-1].children.map(item=>{
                    pieData.map(point=>{
                        if(point.name.replace('ThisMonth','').replace('PowerTotal','') == (item.pointPrefix+ item.no)){
                            point.name = item.name
                        }
                    })
                })
            }
        }
        
        return {
            backgroundColor:'rgba(42,55,79,0.9)',
            title: {
              text: mode=='day'?'当日能耗拆分':'当月能耗拆分',
              textStyle: {
                color: '#fff',
                fontSize: 26,
                fontWeight: 500
              },
              left: 'center',
              y:20
            },
            tooltip: {
              trigger: 'item',
              formatter: '{b} : {c} kWh（{d}%）'
            },
            series: [
              {
                name: mode=='day'?'当日能耗拆分':'当月能耗拆分',
                type: 'pie',
                radius: '50%',
                center: ['50%', '55%'],
                data: pieData,
                label:{
                    color:'white',
                    fontSize:15,
                },
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                  }
                }
              }
            ]
        }
    }

    saveContainerRef = (container) => {
        this.container = container;
    }

    saveContainerRef2 = (container) => {
        this.container2 = container;
    }

    meterDetail = () => {
        const config = this.state.config
        const point = config.powerMeterOfflineDetailPointName
        http.post('/get_realtimedata',{
            pointList:[point],
            proj:1
        }).then(res=>{
            if(res.length > 0){
                Modal.destroyAll()
                Modal.info({
                    title:'仪表离线详细信息',
                    width:1000,
                    content:(
                        <div style={{marginTop:35,marginLeft:-20}}>
                            <TableView dataSource={JSON.parse(res[0].value).data}/>
                        </div>
                    )
                })
            }else{
                message.info('未查询到仪表离线详细信息，稍后再试')
            }
        })
    }

    gatewayDetail = () => {
        const config = this.state.config
        const point = config.gatewayOfflineDetailPointName
        http.post('/get_realtimedata',{
            pointList:[point],
            proj:1
        }).then(res=>{
            if(res.length > 0){
                Modal.destroyAll()
                Modal.info({
                    title:'网关离线详细信息',
                    width:1000,
                    content:(
                        <div style={{marginTop:35,marginLeft:-20}}>
                            <TableView dataSource={JSON.parse(res[0].value).data}/>
                        </div>
                    )
                })
            }else{
                message.info('未查询到网关离线详细信息，稍后再试')
            }
        })
    }

    childrenPower = () => {
        clearInterval(timer)
        const {config, single, current} = this.state
        this.setState({
            flag:1,
            childIndex:0,
            loading: true
        })
        let pointList = []
        let startTime = moment(single).format('YYYY-MM-DD 00:00:00')
        let endTime = ''
        if(current == 0){
            config.distributionGroupList.children.map(item=>{
                pointList.push(item.pointPrefix + 'GroupPower')
            })
        }else{
            config.distributionGroupList.children[current-1].children.map(item=>{
                pointList.push(item.pointPrefix + 'Power'+item.no)
            })
        }

        if(single == moment().format(dateFormat)){
            endTime = moment().format('YYYY-MM-DD HH:mm:00')
        }else{
            endTime = moment(single).format('YYYY-MM-DD 23:59:00')
        }

        http.post('/get_history_data_padded',{
            pointList: pointList,
            timeFormat:'m1',
            timeStart: startTime,
            timeEnd: endTime
        }).then(ret=>{
            if(ret['map']){
                let time = []
                ret['time'].map(item=>{
                    time.push(moment(item).format('YYYY-MM-DD HH:mm'))
                })
                this.setState({
                    time: time,
                    childrenData:ret['map'],
                    loading: false
                })
            }
        })

    }

    leftChild = () => {
        let childIndex = this.state.childIndex

        if(childIndex == 0) {
            message.info('目前处于第一支路')
            return
        }else{
            this.setState({
                childIndex : childIndex-1
            })
        }
    }

    rightChild = () => {
        let childIndex = this.state.childIndex
        let childData = this.state.childrenData

        if(childIndex == (Object.keys(childData).length-1)) {
            message.info('目前处于最后一个支路')
            return
        }else{
            this.setState({
                childIndex : childIndex+1
            })
        }
    }

    returnChart = () => {
        const {mode, single, current} = this.state
        this.getPowerTotal(mode,single,current)
    }

    render() {
        const {gatewayCountPointValue, 
            meterCountPointValue, 
            gatewayOnlinePercentPointValue, 
            powerMeterOnlinePercentPointValue, 
            single, 
            mode,
            nowPowerTotal,
            lastPowerTotal,
            tongbi,
            current,
            flag

        } = this.state
        return(
            <div>
                <div className={s['header']}>
                    <div className={s['box']}>
                        <h1 style={{display:'inline-block'}}>仪表在线率</h1>
                        {
                            powerMeterOnlinePercentPointValue < 100 ?
                            <Icon type="info-circle" style={{cursor:'pointer',fontSize:18,marginTop:5,position:'absolute',color:'RGB(0,145,255)'}} title='仪表详细离线信息' onClick={this.meterDetail}/>
                            :
                            ''
                        }
                        <div className={s['box_value']}>{powerMeterOnlinePercentPointValue}%</div>
                    </div>
                    <div className={s['box']}>
                        <h1 style={{display:'inline-block'}}>网关在线率</h1>
                        {
                            gatewayOnlinePercentPointValue < 100 ?
                            <Icon type="info-circle" style={{cursor:'pointer',fontSize:18,marginTop:5,position:'absolute',color:'RGB(0,145,255)'}} title='网关详细离线信息' onClick={this.gatewayDetail}/>
                            :
                            ''
                        }
                        <div className={s['box_value']}>{gatewayOnlinePercentPointValue}%</div>
                    </div>
                    <div className={s['box']}>
                        <h1>仪表数量</h1>
                        <div className={s['box_value']}>{meterCountPointValue}</div>
                    </div>
                    <div className={s['box']}>
                        <h1>网关数量</h1>
                        <div className={s['box_value']}>{gatewayCountPointValue}</div>
                    </div>
                </div>
                <div className={s['time_select']}>
                    <RadioGroup onChange={this.changeMode} value={mode} buttonStyle="solid" size='large'>
                        <RadioButton value="day">日</RadioButton>
                        <RadioButton value="month">月</RadioButton>
                    </RadioGroup>
                    <Button icon='left' size='large' style={{verticalAlign:'bottom',marginLeft:20}} onClick={this.reduceTime}></Button>
                    {
                        mode == 'day'?
                        <DatePicker 
                            value={moment(single,dateFormat)} 
                            format={dateFormat} 
                            size='large'
                            style={{width:140}}
                            onChange = {this.changeTime}
                            disabledDate={this.disabledDate}
                        />
                        :
                        <MonthPicker 
                            value={moment(single, monthFormat)} 
                            format={monthFormat} 
                            size='large'
                            style={{width:120}}
                            onChange = {this.changeTime}
                            disabledDate={this.disabledDate}
                        />
                    }
                    <Button icon='right' size='large' style={{verticalAlign:'bottom',marginRight:20}} onClick={this.addTime}></Button>
                    <RadioGroup onChange={this.changeCurrent} value={current} buttonStyle="solid" size='large'>
                        <RadioButton value={0}>全部</RadioButton>
                        {this.getTabs()}
                    </RadioGroup>
                   
                </div>
                <div className={s['body']}>
                    <Row>
                        <Col span={6}>
                            <div>
                                <div>
                                    {
                                        mode == 'day'?
                                        <div style={{paddingLeft:20}}>
                                            <Card 
                                                title="日能耗比对" 
                                                size='large'
                                                headStyle={{backgroundColor:'rgba(48,62, 91, 0.7)',color:'white',fontSize:26,textAlign:'center'}} 
                                                bodyStyle={{background:'rgba(48,62, 91, 0.5)'}}
                                            >
                                                <Row>
                                                    <Col span={8}>
                                                        <div className={s['energy_box']}>
                                                            <h2>当日能耗</h2>
                                                            <div className={s['energy_box_value']}>{nowPowerTotal}</div>kWh
                                                        </div> 
                                                    </Col>
                                                    <Col span={8}>
                                                    <div className={s['energy_box']}>
                                                            <h2>前日能耗</h2>
                                                            <div className={s['energy_box_value']}>{lastPowerTotal}</div>kWh
                                                        </div>
                                                    </Col>
                                                    <Col span={8}>
                                                    <div className={s['energy_box']}>
                                                            <h2>同比</h2>
                                                            <div className={s['energy_box_value']}>{tongbi}</div> %
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </div>
                                        :
                                        <div style={{paddingLeft:20}}>
                                            <Card 
                                                title="月能耗比对" 
                                                size='large'
                                                headStyle={{backgroundColor:'rgba(48,62, 91, 0.7)',color:'white',fontSize:26,textAlign:'center'}} 
                                                bodyStyle={{background:'rgba(48,62, 91, 0.5)'}}
                                            >
                                                <Row>
                                                    <Col span={8}>
                                                        <div className={s['energy_box']}>
                                                            <h2>当月能耗</h2>
                                                            <div className={s['energy_box_value']}>{nowPowerTotal}</div>kWh
                                                        </div> 
                                                    </Col>
                                                    <Col span={8}>
                                                    <div className={s['energy_box']}>
                                                            <h2>前月能耗</h2>
                                                            <div className={s['energy_box_value']}>{lastPowerTotal}</div>kWh
                                                        </div>
                                                    </Col>
                                                    <Col span={8}>
                                                    <div className={s['energy_box']}>
                                                            <h2>同比</h2>
                                                            <div className={s['energy_box_value']}>{tongbi}</div> %
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </div>
                                    }
                                </div>
                                <div>
                                {
                                    this.state.loading2 ? 
                                    <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                                        <Spin tip="正在读取数据"/>
                                    </div>
                                    :
                                    <div style={{width:'100%',marginLeft:20,marginTop:20}} ref={this.saveContainerRef2}>
                                        <ReactEcharts
                                            style={{
                                                width:'454px',
                                                height: '405px',
                                            }}
                                            ref={this.saveChartRef2}
                                            option={this.getChartOption2()}
                                            notMerge={true}
                                        />
                                    </div> 
                                }
                                </div>
                            </div>
                        </Col>
                        <Col span={18}>
                            {
                                this.state.loading ? 
                                <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                                <Spin tip="正在读取数据"/>
                                </div>
                                :
                                <div style={{width:'100%',marginLeft:30}} ref={this.saveContainerRef}>
                                    {
                                        flag == 1?
                                        <div style={{position:'absolute',zIndex:'999'}}>
                                            <Button onClick={this.returnChart} icon='rollback' style={{marginRight:20}}></Button>
                                            <Button onClick={this.leftChild} icon='left'></Button>
                                            <Button onClick={this.rightChild} icon='right'></Button>
                                        </div>
                                        :
                                        mode == 'day'?
                                        <div style={{position:'absolute',zIndex:'999'}}>
                                            <Button onClick={this.childrenPower}>显示全部支路</Button>
                                        </div>
                                        :
                                        ''
                                    }
                                    <ReactEcharts
                                        style={{
                                            width:'1380px',
                                            height: '620px',
                                        }}
                                        ref={this.saveChartRef}
                                        option={this.getChartOption()}
                                        notMerge={true}
                                    />
                                </div> 
                            }
                           
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default  EnergyBoardComponent


