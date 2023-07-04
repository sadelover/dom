import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './WarningManager.css'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import {downloadUrl} from '../../../../common/utils'
import { DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table} from 'antd';
import moment from 'moment'
const format = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option
const TimeFormat = 'YYYY-MM-DD HH:mm'
const Search = Input.Search
const { Header, Content, Footer, Sider } = Layout;
let j = 0;
let mapData = {};
let startTime=moment().startOf('day'), endTime=moment();
const getTimeRange = function (period) {
    
  
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


 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'warning',
    name : '柱状图图组件',
    description : "生成energy组件",
}
const columns = [{
    title: '开始时间',
    dataIndex: 'time',
    key:'time',
    width: '20%',
    sorter: (a, b) => Date.parse(a.time.replace('-','/').replace('-','/')) - Date.parse(b.time.replace('-','/').replace('-','/'))
  }, {
    title: '结束时间',
    dataIndex: 'endtime',
    key:'endtime',
    width: '20%',
    sorter: (c, d) => Date.parse(c.endtime.replace('-','/').replace('-','/')) - Date.parse(d.endtime.replace('-','/').replace('-','/'))
  }, {
    title: '信息',
    dataIndex: 'info',
    width: '20%',
  },{
    title: '等级',
    dataIndex: 'level',
    width: '20%',
  },{
      title: '相关点名',
      dataIndex: 'strBindPointName',
      width: '20%',
    }];

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
            startTime:moment().startOf('day').format(TimeFormat),
            endTime:moment().format(TimeFormat),
            endOpen: false,
            tableData : [],
            loading : false
        }

        this.dateOffset = 0;
        this.chart = null;
        this.container = null;
        this.loadTable = this.loadTable.bind(this)
        this.handleOk = this.handleOk.bind(this)
        this.exportHistoryRecords = this.exportHistoryRecords.bind(this)
        this.handleChangeDate = this.handleChangeDate.bind(this)
        this.disabledStartDate = this.disabledStartDate.bind(this);
        this.disabledEndDate = this.disabledEndDate.bind(this);
        this.handleStartOpenChange = this.handleStartOpenChange.bind(this);
        this.handleEndOpenChange = this.handleEndOpenChange.bind(this);
        this.searchPoint = this.searchPoint.bind(this);
        
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        
    }

    static get defaultProps() {
      return {
        points: [],
        data:[]
      }
    }
     


    // componentWillReceiveProps(nextProps){
    //     const {custom_realtime_data} = nextProps
    //     let pointvalue = custom_realtime_data//.filter(item=>item.name === this.props.config.point[0]);
        
    //     // 判断两个数组内容是否相等
    //     if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(pointvalue)){
    //         this._renderTable(nextProps)
    //     }
    // }
  
    // // 生成数据
    // _renderTable = (props) => {
    //     const {custom_realtime_data,header} =  this.props || props
    //     let pointvalue=[];
    //     if(custom_realtime_data.length!=0){
    //         pointvalue = custom_realtime_data.map(item=>{return {name:item.name,value:parseFloat(item.value)}});
    //     }
        
    //     //if(new RegExp(/00:00$/).test(moment().format('YYYY-MM-DD hh:mm:ss'))){
    //         this.setState({
    //             pointvalue:pointvalue, //保存数据到state上，对比下一次
                
    //         },this.antdTableHearder)
    //     //}
    // }
    componentWillMount(){
        this.searchPoint("")
    }

    componentDidMount(){
        let startTime =  moment().startOf('days')
        let endTime =   moment()
        this.setState({
            startTime:startTime,
            endTime:endTime
        })
        
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
        }else if(offset == 15){
            this.dateOffset = typeof offset === 'undefined' ? 0 : offset;
            s_time = moment().subtract(this.dateOffset, 'm').format(TimeFormat);
            end_time = moment().format(TimeFormat);
        }else{
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
        //console.info( `http:\/\/${localStorage.getItem('serverUrl')}/warning/downloadHistoryFile/${moment(startTime).format("YYYY-MM-DD")}/${moment(endTime).format("YYYY-MM-DD")}/zh-cn` )
        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/warning/downloadHistoryFile/${moment(startTime).format("YYYY-MM-DD")}/${moment(endTime).format("YYYY-MM-DD")}/zh-cn`)
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
        const {endTime,startTime,endOpen} = this.state
        const {width,height} = this.props
        return (
           
           
                <div  ref={this.saveContainerRef}>
                
                    <Layout>
                        <Header>
                        <div className={s['date-btns-wrap']}>
                        <Row>
                            <Col span={4} >
                                    <Search
                                        onSearch={ (value)=>{this.searchPoint(value)} }
                                        placeholder='根据点名或信息筛选'
                                    />
                            </Col>
                            <Col span={4}>                             
                                    <DatePicker 
                                        showTime 
                                        placeholder="开始时间"
                                        allowClear={false}
                                        format={TimeFormat}
                                        value={moment(startTime,TimeFormat)}
                                        disabledDate={this.disabledStartDate}
                                        onChange={this.handleStartTimeChange}
                                        onOpenChange={this.handleStartOpenChange}
                                    />
                            </Col>
                            <Col span={4}>
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
                                    />
                            </Col>
                            <Col span={2}>
                                    <Button icon="search" type="primary" onClick={()=>{this.handleOk()}}  >查询</Button>
                            </Col>
                            <Col span={2}>
                                    <Button onClick={()=>{this.handleChangeDate(-1)}} >前一日</Button>
                            </Col>
                            <Col span={2}>
                                    <Button onClick={()=>{this.handleChangeDate(0)}} >今天</Button>
                            </Col>
                            <Col span={2}>
                                    <Button onClick={()=>{this.handleChangeDate(1)}} >后一日</Button>
                            </Col>
                            <Col span={2}>
                                    <Button onClick={()=>{this.handleChangeDate(15)}} >15分钟内</Button>
                            </Col>
                            <Col span={2}>
                                    <Button icon="export" 
                                        
                                        onClick={()=>{this.exportHistoryRecords()}}
                                    >导出</Button>
                            </Col>
                        </Row>
                        </div>
                    </Header>
                    <Layout>
                        <Content> 
                          
                            <div className={s['table-wrap']} style={{height:height}}>
                                <Table
                                    columns={columns}
                                    pagination={false}
                                    dataSource={this.state.tableData}
                                    size="small"
                                    rowKey='no'
                                    bordered
                                    scroll={{ y: height-180 }}
                                    loading={this.state.loading}
                                />
                            </div>   
                        </Content>
                    </Layout>
                </Layout>
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
class WarningManagerComponent extends Widget {
    
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

export default  WarningManagerComponent


