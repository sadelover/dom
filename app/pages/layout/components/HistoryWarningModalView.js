import React from 'react';
import {Modal,Table,DatePicker,Button,Input,Row,Col} from 'antd'
const { RangePicker } = DatePicker
import s from './HistoryWarningModalView.css'
import moment from 'moment';

import http from '../../../common/http';
import {downloadUrl} from '../../../common/utils'


const TimeFormat = 'YYYY-MM-DD HH:mm'
const Search = Input.Search

let str, dateBtn, btnStyle, searchBtn, toggleSearchClass, toggleCalendarClass, level01Style, level02Style, level03Style;
if(localStorage.getItem('serverOmd')=="best"){
  str = 'warning-config-best'
}else{
  str = ''
}
if(localStorage.getItem('serverOmd')=="persagy"){
    str = 'persagy-warningManage-table';
    level01Style = {
      background: 'rgba(247,256,192,1)',
      borderRadius: '9px',
      fontSize: '12px',
      fontFamily: 'PingFangSC-Regular,PingFang SC',
      fontWeight: '400',
      color: '#eee',
      padding: '4px'
    }
    level02Style = {
      background: 'rgba(250,241,209,1)',
      borderRadius: '9px',
      fontSize: '12px',
      fontFamily: 'PingFangSC-Regular,PingFang SC',
      fontWeight: '400',
      color: 'rgba(170,120,3,1)',
      padding: '4px'
    }
    level03Style = {
      background: 'rgba(253,226,226,1)',
      borderRadius: '9px',
      fontSize: '12px',
      fontFamily: 'PingFangSC-Regular,PingFang SC',
      fontWeight: '400',
      color: 'rgba(172,47,40,1)',
      padding: '4px'
    }
    dateBtn = {
        background:"rgba(255,255,255,1)",
        color:"#0091FF",
        border:'none',
        fontSize:'14px',
        fontFamily:'MicrosoftYaHei',
        lineHeight:'28px'
    }
    btnStyle = {
        background:"rgba(255,255,255,1)",
        border:'1px solid rgba(195,198,203,1)',
        color:"rgba(38,38,38,1)",
        borderRadius:'4px',
        fontSize:"12px",
        fontFamily:'MicrosoftYaHei',
        float:'right',
        marginRight:'10px'
    }
    searchBtn = {
        border:'1px solid rgba(195,198,203,1)',
        borderRadius:'4px',
        fontSize:"12px",
        fontFamily:'MicrosoftYaHei'
    }
    toggleSearchClass = 'persagy-warningManage-input';
    toggleCalendarClass= 'persagy-warningManage-calendar-picker';
  }else{
    str = ''
    toggleSearchClass = ''
    toggleCalendarClass = ''
    btnStyle = {
        float:'right',
        marginRight:'10px'
    }
  }

const columns = [{
  title: '开始时间',
  dataIndex: 'time',
  key:'time',
  width: 150,
  sorter: (a, b) => Date.parse(a.time.replace('-','/').replace('-','/')) - Date.parse(b.time.replace('-','/').replace('-','/'))
}, {
  title: '结束时间',
  dataIndex: 'endtime',
  key:'endtime',
  width: 150,
  sorter: (c, d) => Date.parse(c.endtime.replace('-','/').replace('-','/')) - Date.parse(d.endtime.replace('-','/').replace('-','/'))
}, {
  title: '信息',
  dataIndex: 'info',
  width: 200,
},{
  title: '等级',
  dataIndex: 'level',
  width: 100,
  render:(text) => {
    if(text === '一般') {
        return (
        <span style={level01Style} >{text}</span>
        )
    } else if (text === '严重') {
        return (
        <span style={level02Style} >{text}</span>
        )
    } else {
        return (
        <span style={level03Style} >{text}</span>
        )
    }
}
},{
    title: '相关点名',
    dataIndex: 'strBindPointName',
    width: 200,
  }];


class HistoryWarningView extends React.Component{
    constructor(props){
        super(props)

        this.state={
            startTime:moment().startOf('days'),
            endTime:moment(),
            endOpen: false,
            tableData : [],
            loading : false
        }

        this.dateOffset = 0;

        this.loadTable = this.loadTable.bind(this)
        this.handleOk = this.handleOk.bind(this)
        this.exportHistoryRecords = this.exportHistoryRecords.bind(this)
        this.handleChangeDate = this.handleChangeDate.bind(this)
        this.disabledStartDate = this.disabledStartDate.bind(this);
        this.disabledEndDate = this.disabledEndDate.bind(this);
        this.handleStartOpenChange = this.handleStartOpenChange.bind(this);
        this.handleEndOpenChange = this.handleEndOpenChange.bind(this);
        this.searchPoint = this.searchPoint.bind(this);
    }

    componentWillMount(){
        this.searchPoint("")
    }

    componentDidMount(){
        this.loadTable()
    }

    loadTable(){
        const {startTime,endTime} = this.state
        const _this = this
        this.setState({
            loading : true
        })
        http.post('/warning/getHistory',{
           timeFrom : moment(startTime).format(TimeFormat), //变量
            timeTo : moment(endTime).format(TimeFormat)
        }).then( 
            data=>{
                _this.setState({
                    tableData : data.map( (item,i)=>{
                        item['no'] = i + 1
                        if(item['level'] == 1){
                            item['level'] = '一般'
                        }
                        if(item['level'] == 2){
                            item['level'] = '严重'
                        }
                        if(item['level'] == 3){
                            item['level'] = '非常严重'
                        }
                        return item
                    }),
                    loading : false
                })
            }
         )
    }

    disabledStartDate(startValue) {
      const endValue = this.state.endTime;
      if (!startValue || !endValue) {
        return false;
      }
      return startValue.valueOf() > endValue.valueOf();
      
    }

    disabledEndDate(endValue) {
      const startValue = this.state.startTime;
      if (!endValue || !startValue) {
        return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
    }

    handleStartOpenChange(open) {
      if (!open) {
        this.setState({ endOpen: true })
      }
    }

    handleEndOpenChange(open) {
      this.setState({ endOpen: open })
    }

    handleStartTimeChange = (value) => {
      this.setState({
        startTime : value
      })
    }

    handleEndTimeChange = (value) => {
      this.setState({
        endTime:value
      })
    }

    handleOk(){
        this.loadTable()
    }
    //增加时间快捷选项，时间段做加减一天的处理
    handleChangeDate(offset) {
       let s_time,end_time;
        if (offset == 0) {
            s_time =moment().startOf('day').format(TimeFormat) ,
            end_time= new Date()
        }else {
            this.dateOffset = typeof offset === 'undefined' ? 0 : offset;
            s_time = moment(this.state.startTime).add(this.dateOffset, 'days').format(TimeFormat);
            end_time = moment(this.state.endTime).add(this.dateOffset, 'days').endOf('day').format(TimeFormat);
        }
        this.setState({
            startTime : s_time,
            endTime : end_time   
        }, this.loadTable);
       
  }
    searchPoint(value){
        const {startTime,endTime} = this.state
        const _this = this
        this.setState({
            loading : true
        })
        http.post('/warning/getHistory',{
            timeFrom : moment(startTime).format(TimeFormat), //变量
            timeTo : moment(endTime).format(TimeFormat)
        }).then( 
            data=>{
                _this.setState({
                    tableData : data.filter( (item,i)=>{
                        item['no'] = i + 1
                        return new RegExp(value,"i").test(item.strBindPointName) || new RegExp(value,"i").test(item.info)
                    }),
                    loading:false
                })
            }
        )
    }

    //导出报警
    exportHistoryRecords(){
        const {startTime,endTime} = this.state
        console.info( `http:\/\/${localStorage.getItem('serverUrl')}/warning/downloadHistoryFile/${moment(startTime).format("YYYY-MM-DD")}/${moment(endTime).format("YYYY-MM-DD")}/zh-cn` )
        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/warning/downloadHistoryFile/${moment(startTime).format("YYYY-MM-DD")}/${moment(endTime).format("YYYY-MM-DD")}/zh-cn`)
    }

    render(){
        const {endTime,startTime,endOpen} = this.state
        return (
            <div className={str}>
                <div className={s['date-btns-wrap']}>
                    <Row>
                            <DatePicker 
                                showTime 
                                placeholder="开始时间"
                                allowClear={false}
                                format={TimeFormat}
                                value={moment(startTime,TimeFormat)}
                                disabledDate={this.disabledStartDate}
                                onChange={this.handleStartTimeChange}
                                onOpenChange={this.handleStartOpenChange}
                                style={{minWidth:150,width:155}}
                            />
                            <DatePicker
                                showTime 
                                placeholder="结束时间"
                                allowClear={false}
                                format={TimeFormat}
                                value={moment(endTime,TimeFormat)}
                                disabledDate={this.disabledEndDate}
                                open={endOpen}
                                onChange={this.handleEndTimeChange}
                                onOpenChange={this.handleEndOpenChange}
                                style={{minWidth:150,width:155}}
                            />
                        
                            <Button onClick={()=>{this.handleChangeDate(-1)}} style={dateBtn}>前一日</Button>
                            <Button onClick={()=>{this.handleChangeDate(0)}} style={dateBtn}>今天</Button>
                            <Button onClick={()=>{this.handleChangeDate(1)}} style={dateBtn}>后一日</Button>
                        
                            <Button icon="search" type="primary" onClick={()=>{this.handleOk()}} style={searchBtn}>查询</Button>
                            <Button icon="export" 
                                style={btnStyle}
                                onClick={()=>{this.exportHistoryRecords()}}
                            >导出</Button>
                            <Search
                                style={{
                                    width:200,
                                    marginLeft:15,
                                    display:'inline-block'
                                }}
                                onSearch={ (value)=>{this.searchPoint(value)} }
                                placeholder='根据点名或信息筛选'
                            />  
                            
                    </Row>                  
                </div>  
                <div>
                    <Table
                        columns={columns}
                        pagination={false}
                        dataSource={this.state.tableData}
                        size="small"
                        rowKey='no'
                        bordered
                        scroll={{ y: 350 }}
                        loading={this.state.loading}
                    />
                </div>
            {/* </Modal> */}
            </div>
        )
    }
}

export default HistoryWarningView