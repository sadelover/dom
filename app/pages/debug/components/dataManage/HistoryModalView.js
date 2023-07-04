import React, { PropTypes } from 'react';
import { Button, Modal, Form, DatePicker, Select, message, Switch, Table } from 'antd';
import ReactEcharts from '../../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import '../../../../lib/echarts-themes/light';
import moment from 'moment';
import http from '../../../../common/http';
import {Debug_modalTypes} from '../../../../common/enum'
import { downloadUrl } from '../../../../common/utils';

const MonthPicker = DatePicker.MonthPicker;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;
const FormItem = Form.Item;
const ButtonGroup = Button.Group

let themeStyle,toggleModalClass,btnStyle,toggleSelectClass,toggleCalendarClass;
if(localStorage.getItem('serverOmd')=="persagy"){
  themeStyle = 'light';
  toggleModalClass = 'persagy-modal-style';
  btnStyle = {
    background:"rgba(255,255,255,1)",
    border:'1px solid rgba(195,198,203,1)',
    color:"rgba(38,38,38,1)",
    borderRadius:'4px',
    fontSize:"14px",
    fontFamily:'MicrosoftYaHei',
    marginRight:'2px'
  }
  toggleSelectClass='persagy-historyModal-select-selection';
  toggleCalendarClass='persagy-historyModal-calendar-picker';
}else{
  themeStyle = 'dark'
}

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
//获取时间范围
const getTimeRange = function (period) {
  let startTime, endTime;

  switch(period) {
    case 'day':
      startTime = moment().startOf('day');
      endTime = moment();
      break;
    case 'week':
      startTime = moment().startOf('week');
      endTime = moment();
      break;
    case 'month':
      startTime = moment().startOf('month');
      endTime = moment();
      break;
    case 'hour':
    default:
      startTime = moment().subtract(1, 'hour');
      endTime = moment();
      break;
  }
  return [startTime, endTime];
}

const ModalForm = Form.create()( class defaultModal extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      value : "m1",
      time:'',
      data:'',
      timeFrom:'',
      timeTo:'',
      lastDay:1,
      nextDay:-1,
      StartTime:'',
      EndTime:''
    }
    this.handleSelect = this.handleSelect.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSwitchChange = this.onSwitchChange.bind(this);
    this.getData = this.getData.bind(this);
    this.setTimeRange = this.setTimeRange.bind(this);
    this.ExportData = this.ExportData.bind(this);
  }

  onSearch() {
      let _this = this;

      this.props.showChartLoading();
      this.props.form.validateFields((err, values) => {
        if (err) {
          return;
        }
        //int  
        let timediff = moment(values.range[1]).diff(moment(values.range[0]), 'days')
        _this.setState({
          timeFrom:values.range[0].format(TIME_FORMAT),
          timeTo:values.range[1].format(TIME_FORMAT)
        })
        _this.getData(
          values.range[0].format(TIME_FORMAT),
          values.range[1].format(TIME_FORMAT),
          values.timeFormat
        ).then(
          (data) => {
            if (!data.error){
              _this.setState({
                time:data.time,
                data:data.map
              })
              _this.props.renderChart(data);  
            }else{
              console.info(_this.state.value,timediff)
              if(_this.state.value == 'm1'){
                  if(timediff>7){
                    Modal.confirm({title:'取样间隔为1分钟时，最多支持查询7天的数据'})
                  }
              }
              if(_this.state.value == 'm5'){
                  if(timediff>14){
                    Modal.confirm({title:'取样间隔为5分钟时，最多支持查询14天的数据'})
                  }
              }
              if(_this.state.value == 'h1'){
                  if(timediff>60){
                    Modal.confirm({title:'取样间隔为1小时时，最多支持查询60天的数据'})
                  }
              }
              if(_this.state.value == 'd1'){
                  if(timediff>365){
                    Modal.confirm({title:'取样间隔为1天时，最多支持查询365天的数据'})
                  }
              }
              
            } 
          }
        )
        
      });
  }
  onChange(checked) {
    this.props.handleSwitch(checked);
    if (!this.props.switchData) {
      this.onSwitchChange();
    }
    if (this.props.switchData) {
      this.onSearch()
    }
  }

  onSwitchChange() {
      let _this = this;

      this.props.showChartLoading();
      this.props.form.validateFields((err, values) => {
        if (err) {
          return;
        }
        _this.getData(
          values.range[0].format(TIME_FORMAT),
          values.range[1].format(TIME_FORMAT),
          values.timeFormat
        ).then(
          (data) => {
            if (!data.error) {
               _this.setState({
                 time:data.time,
                 data:data.map
               })
              let arrValue =[],arrValues =[]
              //先判断点值是非数字还是数字类型
              if(isNaN(Number(data[0].history[0].value))){
                  //console.log('非数字')
                  //筛选去掉补齐的内容（error为true即自动补齐的）
                  for (let i=0; i<data.length; i++) {
                    arrValue = data[i].history.filter(
                      (row) => {
                        if (!row.error) {
                          return row
                        }
                      }
                    )
                    //将原data里的数值数组替换成筛选后的
                    data[i].history = arrValue
                  }
                  //console.log(data)
                }
                //如果点值为数字类型，补齐的值将为undefind,但条目数量不变，提供给echart的数据视图
                for (let i = 0; i<data.length; i++) {
                    arrValue = data[i].history.map(
                    (row) => {
                      if (!row.error) {
                        return row.value 
                      }
                    }
                  )
                  arrValues.push(arrValue)
                }
                let arrName = data.map(
                    (row) => {
                      return row.name
                    }
                  )
                let obj = {}
                arrName.forEach(
                  (item,index) => {
                    obj[item] = arrValues[index]
                  }
                )
                // console.log(obj);
                  let arrTime = data[0].history.map(
                    (row) => {
                      return row.time
                    }
                  )
                let arrData = {
                  data: obj,
                  timeStamp: arrTime
                }
               
              //判断点值是非数字还是数字类型，调用对应方法
              if(isNaN(Number(arrValue[0]))) {
                _this.props.renderTextarea(data,obj);
              }else {
                _this.props.renderChart(arrData);
              }
            }else{
              Modal.error({
                title: '错误提示',
                content: "后台接口-接口返回历史数据为空！"
              })
            }   
          }
        )
        
      });
  }
  //下载数据
  ExportData(){
    let  pointList = []
    let  pointData = []
    let  reportName = '历史数据'
    let  strStartTime = this.state.timeFrom
    let  strEndTime =  this.state.timeTo
    let  timeData = this.state.time
    let  data =  this.state.data
      Object.keys(data).map(item=>{
        pointList.push(item)
      })
      pointData = timeData.map( (item,row)=>{
        let line = {}
        line['key']= row
        pointList.forEach( (iteml,i)=>{
            if (data[iteml].length === 0) {
              line[pitem] = ''
            }else {
              line[iteml] = data[iteml][row]                
            }
        })
        return line
    })
    http.post('/reportTool/genExcelReportByTableData', {
      reportName: reportName,
      strStartTime: strStartTime,
      strEndTime: strEndTime,
      headerList: pointList,　 //表头用的点名
      tableDataList:pointData,
      timeList:timeData,
      pointList:pointList
  }).then(
      data=>{
          if (data.err === 0) {
              downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
          }else {
            Modal.error({
              title: '错误提示',
              content: "后台接口-接口返回生成下载文件失败！"
            })
          }
      }
  )        
  }
  getData(timeStart, timeEnd, timeFormat) {
    return http.post('/get_history_data_padded', {
        'pointList': this.points || this.props.data.values,
        'timeStart': `${moment(timeStart).format('YYYY-MM-DD HH:mm')}:00`,
        'timeEnd': `${moment(timeEnd).format('YYYY-MM-DD HH:mm')}:00`,
        'timeFormat': timeFormat,
    }).catch(
      (error) => {
        Modal.error({
          title: '错误提示',
          content: "后台接口-接口通讯失败！"
        })
      }
    )
  }

  handleSelect(value){
    this.setState({
      value : value
    })
  }

  setTimeRange(period) {
    const {lastDay,nextDay} = this.state
    let _this = this
    if(period=='lastday'){
        this.setState({
          lastDay:lastDay+1,
          nextDay:nextDay+1
        })
    }else if(period=='nextday'){
        this.setState({
          lastDay:lastDay-1,
          nextDay:nextDay-1
        })
    }else{
      this.setState({
        lastDay:1,
        nextDay:-1
      })
    }
    let range = getTimeRange(period,this.state.lastDay)
    let starTime = moment().subtract(this.state.lastDay,'days').startOf('day')
    let endTime = moment().subtract(this.state.lastDay,"days").endOf('day')
    let _starTime = moment().subtract(this.state.nextDay,'days').startOf('day')
    let _endTime = moment().subtract(this.state.nextDay,"days").endOf('day')
    // let range = getTimeRange(period)
    // //求出时间差
    // let timediff = moment(range[1]).diff(moment(range[0]), 'days')
    console.info( typeof timediff )
    switch(period){
      case 'nextday':
        this.props.form.setFieldsValue({
          range:[_starTime,_endTime],
          timeFormat:'m5'
        });
        break;
      case 'lastday':
        this.props.form.setFieldsValue({
          range:[starTime,endTime],
          timeFormat:'m5'
        });
        break;
      case 'hour':
        this.props.form.setFieldsValue({
        range: getTimeRange(period),
        timeFormat:'m1'
      });break;
      case 'day':
        this.props.form.setFieldsValue({
        range: getTimeRange(period),
        timeFormat:'m1'
      });break;
      case 'week':
        this.props.form.setFieldsValue({
        range: getTimeRange(period),
        timeFormat:'h1'
      });break;
      case 'month':
        this.props.form.setFieldsValue({
        range: getTimeRange(period),
        timeFormat:'d1'
      });break;
      default:
        this.props.form.setFieldsValue({
        range: getTimeRange(period),
        timeFormat:'m1'
      });
      break;
    }
    
    if (this.props.switchData){
      this.onSwitchChange()
    }
    if(!this.props.switchData) {
      this.onSearch();
    }
    
  }
 
  componentWillReceiveProps(nextProps) {
    if (!this.props.autoSearch && nextProps.autoSearch) {
      this.points = nextProps.data.values;
      this.setTimeRange('hour');
    }
  }
  
  shouldComponentUpdate(nextProps,nextState){
    if(nextState==this.state){
        return false
    }else{
        return true
    }
  }

  componentDidMount() {
    this.points = this.props.data.values;
    this.setTimeRange('hour');
  }

  handleTimeChange = (value) =>{
      let StartTime = value[0].format(TIME_FORMAT)
      let EndTime = value[1].format(TIME_FORMAT)
      this.setState({
        StartTime:StartTime,
        EndTime:EndTime
      })
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form layout='inline'>
        <FormItem
          label="快速选择"
        >
          <ButtonGroup size="small">
            <Button style={btnStyle} size="small" onClick={ () => { this.setTimeRange('hour'); } }>小时</Button>
            <Button style={btnStyle} size="small" onClick={ () => { this.setTimeRange('day'); } }>今天</Button>
            <Button style={btnStyle} size="small" onClick={ () => { this.setTimeRange('lastday') } }>前一天</Button>              
            <Button style={btnStyle} size="small" onClick={ () => { this.setTimeRange('nextday') } }>后一天</Button>  
            <Button style={btnStyle} size="small" onClick={ () => { this.setTimeRange('week'); } }>本周</Button>
            <Button style={btnStyle} size="small" onClick={ () => { this.setTimeRange('month'); } }>本月</Button>
          </ButtonGroup>
        </FormItem>
        <FormItem
          label="取样间隔"
          style={{
            marginLeft: '5px'
          }}
        >
          {getFieldDecorator('timeFormat', {
            initialValue: 'm5'
          })(
            <Select size="small" onSelect={this.handleSelect} className={toggleSelectClass}>
              <Option value="m1">1分钟</Option>
              <Option value="m5">5分钟</Option>
              <Option value="h1">1小时</Option>
              <Option value="d1">1天</Option>
            </Select>
          )}
        </FormItem>
        <FormItem
          label="时间范围"
          className={toggleCalendarClass}
        >
          {getFieldDecorator('range')(
            <RangePicker style={{width:270}} size="small" showTime format={'YYYY-MM-DD HH:mm'} onChange={this.handleTimeChange}/>
          )}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            size="small"
            onClick={ this.props.switchData ? this.onSwitchChange : this.onSearch }
          >
            查询
          </Button>
        
        </FormItem>
        <FormItem>
         <Button
          type="primary"
          size="small"
          onClick={this.ExportData}
          >
          下载数据
          </Button>
        </FormItem>
        {/*
          <FormItem
            label="隐藏补齐数据"
          >
            {getFieldDecorator('switch', {
                initialValue: false
              })(
            <Switch onChange={this.onChange} checked={this.props.switchData}  />
            )}
          </FormItem>
        */}
      </Form>
    );
  }
})


class HistoryModalView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartOption: null,
      textArea: false,
      text:null,
      columnsData: []
    };
    
    this.handleClose = this.handleClose.bind(this);
    this.getChartOption = this.getChartOption.bind(this);
    this.saveFormRef = this.saveFormRef.bind(this);
    this.saveChartRef = this.saveChartRef.bind(this);
    this.renderChart = this.renderChart.bind(this);
    this.showChartLoading = this.showChartLoading.bind(this);
    this.hideChartLoading = this.hideChartLoading.bind(this);
    this.form = null;
    this.renderTextarea = this.renderTextarea.bind(this);
  }

  handleClose() {
    this.form.resetFields();
    this.setState({
      chartOption: null,
      textArea: false,
      text:null,
      columnsData: []
    });
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }

  getChartOption(pointsData) {
    // const { timeStamp, data} = pointsData;
    const { time, map} = pointsData;
    console.info( Object.keys(map) )
    this.hideChartLoading()
    return {
      title: {
        text: ''
      },
      tooltip : {
        trigger: 'axis'
      },
      legend: {
        textStyle:{color:'#eee'},        
        data: Object.keys(map),
        top:'2%'
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {
            show: true  
          }
        },
        right:'2%'
      },
      grid: {
        top: '14%',
        left: '4%',
        right: '4%',
        bottom: '4%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
          data : time,
          axisLine:{
            lineStyle:{
              color:'#fff'
            }
          }
        }
      ],
      yAxis : [
        {
          type : 'value',
          axisLine:{
            lineStyle:{
              color:'#fff'
            }
          }
        }
      ],
      series: Object.keys(map).map((key) =>{
        let arr = []
        arr = map[key]
        map[key].map((item,index)=>{
          if(item>=10000){
            arr[index] = item.toFixed(0)
          }else if(item>=10 && item<10000){
            arr[index] = item.toFixed(1)
          }else if(item>=0.1 && item<10){
            arr[index] = item.toFixed(2)
          }else{
            arr[index] = item.toFixed(3)
          }
        })
        return{
          name: key,
          type: 'line',
          data: arr
        }
      })
    };
  }

  //点值为非数值时，处理数据格式
  renderTextarea(data,obj) {
    let tableData, arrTextValue, arrTextValues=[]
      //dataSource
      for (let j = 0; j<data.length; j++) {
        arrTextValue = data[j].history.map(
          (row) => {
            return row.value
          }
        )
        // arrTextValues.push(arrTextValue)
         tableData = data[0].history.map(function (row, i) {
          row['key'] = i;
          row[`value${j}`] = arrTextValue[i];
          row.value = null
          return row;
        }); 
      }
      // console.log(tableData)
    //columns动态生成列
    let columnsData = Object.keys(obj).map(
      (name, i) => ({
        title: name,
        dataIndex: `value${i}`,
        key: `value${i}`,
        width:200
      })
    )
    let defaultColumn = {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 60
    }
    columnsData.unshift(defaultColumn)

    // console.log(columnsData)
    
    // console.log(tableData)

    this.setState({
      textArea: true,
      text: tableData,
      columnsData: columnsData
    })
  }

  renderChart(data) {
    this.setState({
      chartOption: this.getChartOption(data)
    });
    this.hideChartLoading();
  }

  showChartLoading() {  //动画
    if (this.chart) {
      this.chart.showLoading();
    }
  }

  hideChartLoading() {
    if (this.chart) {
      this.chart.hideLoading();
    }
  }

  saveFormRef(form) {
    this.form = form;
  }

  saveChartRef(chart) {
    if (chart) {
      console.info( 1)
      this.chart = chart.getEchartsInstance();
      
      console.info( this.chart )
      this.showChartLoading()
    } else {
      this.chart = chart;
    }
  }

  render() {
    const { modal, hideModal, data, loading, handleSwitch,historyData} = this.props;

    let visible = Debug_modalTypes.HISTORY_MODAL === modal.type
    return (
      <div>
        {
          visible ?
          <Modal
            className={toggleModalClass}
            visible={visible}
            title='历史趋势'
            onCancel={hideModal}
            maskClosable={false}
            afterClose={this.handleClose}
            wrapClassName='vertical-center-modal'
            footer=''
            width={1101}
          >
            <ModalForm
              ref={this.saveFormRef}
              autoSearch={visible}
              data={data}
              renderChart={this.renderChart}
              showChartLoading={this.showChartLoading}
              handleSwitch={handleSwitch}
              switchData={historyData}
              renderTextarea={this.renderTextarea}
            />           
            {
              this.state.chartOption && (!this.state.textArea) ? 
                <ReactEcharts
                  theme={themeStyle}
                  style={{
                    margin: '16px 0 8px',
                    height: '480px'
            
                  }}
                  ref={this.saveChartRef}
                  option={this.state.chartOption}
                  notMerge={true}
                  lazyUpdate={true}
                /> : 
                <div
                  style={{
                    margin: '16px 0 8px',
                    height: '20px'
                  }}
                />
            }
            {
              this.state.textArea  ?
                <div
                  style={{
                    margin: '16px 0 8px',
                    height: '480px'
                  }}
                  >
                    <Table 
                      size="middle" 
                      columns={this.state.columnsData}
                      dataSource={this.state.text}
                      rowKey="key"
                      scroll={{ y: 440 }} 
                      pagination={false}
                      >
                    </Table>
              </div>
              
              :
                <div
                />
            }
          
          </Modal>
          :
          ''
        }
      </div>
      
   
    );
  }
}

export default HistoryModalView;
