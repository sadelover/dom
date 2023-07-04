

/**
 * 日期设置模态框
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button,  Modal, Form, Select, DatePicker ,Slider,message} from 'antd';
import moment from 'moment'
const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const TIME_FORMAT = "YYYY-MM-DD HH:mm"
const startTime  = moment().startOf('days')
const endTime = moment()

let str;
if(localStorage.getItem('serverOmd')=="best"){
  str = 'time-setting-best'
}else if(localStorage.getItem('serverOmd')=="persagy"){
  str = 'warning-config-persagy'
}else{
  str = 'warning-config'
}

//配置组件
class DateConfigForm extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        endOpen: false,
        startTime:0,
        endTime:0,
        timeFormat : '',
        day:1,
        week:1,
        month:1
      };

      this.onOk = this.onOk.bind(this);
      this.yesterday = this.yesterday.bind(this);
      this.today = this.today.bind(this);
      this.lastWeek = this.lastWeek.bind(this);
      this.preWeek = this.preWeek.bind(this);
      this.disabledStartDate = this.disabledStartDate.bind(this);
      this.disabledEndDate = this.disabledEndDate.bind(this);
      this.handleStartOpenChange = this.handleStartOpenChange.bind(this);
      this.handleEndOpenChange = this.handleEndOpenChange.bind(this);
      this.closeModal = this.closeModal.bind(this)
      this.LastMounth = this.LastMounth.bind(this)
      this.preMonth = this.preMonth.bind(this)
      this.nextDay = this.nextDay.bind(this)
      this.nextWeek = this.nextWeek.bind(this)
      this.nextMonth = this.nextMonth.bind(this)
    }

    
    componentDidMount() {
      
      let dateDict = {}
      if(localStorage.dateDict){
        dateDict = JSON.parse(localStorage.dateDict)
      }
      // let startTime = moment(dateDict.startTime) || moment().startOf('days')
      // let endTime =  moment(dateDict.endTime) || moment()
      // 20190506注释掉
      // let startTime =  moment().startOf('days')
      // let endTime =   moment()
      this.setState({
          timeFormat:dateDict.timeFormat || 'm1'
      })
      if(localStorage.getItem('historyStartTime') && localStorage.getItem('historyStartTime') != '' && localStorage.getItem('historyStartTime')!=null){
        setTimeout(()=>{
          let _starTime = new Date(Number(localStorage.getItem('historyStartTime')))
          _starTime = moment(_starTime)
          if(_starTime.format("YYYY-MM-DD") != moment().format("YYYY-MM-DD")){
            let _endTime = _starTime.format("YYYY-MM-DD 23:59:00")
            _endTime = moment(_endTime)
            this.props.form.setFieldsValue({
              endTime:_endTime
            })
          }
          this.props.form.setFieldsValue({
          startTime:_starTime
          })
          this.onOk()
        },1000)
      }
    }
    shouldComponentUpdate(nextProps,nextState){
        if(nextProps.show!==this.props.show){
            return true
        }else{
            if(nextState==this.state){
                return false
            }else{
                return true
            }
        }
    }

    //点击确认
    onOk(e) {
        const { 
          addPoint,
          parmsDict,
          bShowTimeShaft,
          dateProps,
          upDateCurValue,
          timeArr
         } = this.props
        let _this = this
        if(e != undefined && e != ''){
          e.preventDefault()
        }
        this.setState({
          month:1,
          day:1,
          week:1
        })
        this.props.form.validateFields((err, values) => {
        if (!err) {
          _this.props.parmsDict.closeRealTimeFresh()
          //获取到选中时间的分钟
            let startMinute = moment(values.startTime).minute(moment(values.startTime).minute()).format('mm')
            let endMinute = moment(values.startTime).minute(moment(values.endTime).minute()).format('mm')

            //5分钟时，处理起始时间的分钟为0或5
            if (values.timeFormat === "m5") {
              //开始时间
              if(Number(startMinute.substr(1,1))<3 ){
                startMinute = String(Number(startMinute.substr(0,1))) + '0'
              }else if(Number(startMinute.substr(1,1))>=3 && Number(startMinute.substr(1,1))<=9){
                startMinute = String(Number(startMinute.substr(0,1))) + '5'
              }
              // // 结束时间
              if(Number(endMinute.substr(1,1))<3 ){
                endMinute = String(Number(endMinute.substr(0,1))) + '0'
              }else if(Number(endMinute.substr(1,1))>=3 && Number(endMinute.substr(1,1))<=9){
                endMinute = String(Number(endMinute.substr(0,1))) + '5'
              }
            } 
            // console.info( moment(values.startTime).minute(moment(values.startTime).minute()).format('mm'))
            // console.info( moment(values.startTime).format('YYYY-MM-DD HH:0m:00') )
            let dateDict = {
                endTime : moment(values.endTime).format(`YYYY-MM-DD HH:${endMinute}:00`),
                startTime : moment(values.startTime).format(`YYYY-MM-DD HH:${startMinute}:00`),
                timeFormat : values.timeFormat
            }
            localStorage.dateDict=JSON.stringify(dateDict)
            parmsDict.closeRealTimeFresh()
            upDateCurValue(0)
            this.props.toggleTimeShaft(true) //显示时间轴组件
            this.props.getTimeArr(values)
            //同步执行代码
            var syncFun = new Promise(function(resolve,reject){
                resolve(function(){
                   return _this.props.onOk(false,dateDict)
                })
            })
            syncFun.then(function(first){ 
                  return first()
                }).then(function(second){
                   parmsDict.renderScreen(parmsDict.pageId,true)
                })
          }
        });
    }

    //昨天的时间
    yesterday() {
      const {form} = this.props
      const {setFieldsValue} = form
       const {day} = this.state
      // var curDate = new Date()
      // var hour = curDate.getHours();//得到小时
      // var minu = curDate.getMinutes();//得到分钟
      // var yesDate = new Date(curDate.getTime()-24*60*60*1000-hour*60*60*1000-minu*60*1000)
      let _starTime = moment().subtract(day,'days').startOf('day')
      let _endTime = moment().subtract(day,"days").endOf('day')
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
      this.setState({
        day:day+1,
        month:1,
        week:1
    })
    }
    //后一天的时间
    nextDay() {
      const {form} = this.props
      const {setFieldsValue} = form
      const {day} = this.state
      let _starTime = moment().subtract(day-2,'days').startOf('day')
      let _endTime = moment().subtract(day-2,"days").endOf('day')
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
      this.setState({
        day:day-1,
        month:1,
        week:1
    })
    }
    //今天时间
    today() {
      this.setState({
        month:1,
        day:1,
        week:1
      })
      const {form} = this.props
      const {setFieldsValue} = form
      let _starTime = moment().startOf('day')
      let _endTime = moment()
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
    }
    //上周
    lastWeek() {
      let  count = this.state.week 
      const {form} = this.props
      const {setFieldsValue} = form
      let _starTime = moment().week(moment().week() - count).startOf('week')
      let _endTime = moment().week(moment().week() - count).endOf('week')                        
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
      this.setState({
        week:count+1,
        month:1,
        day:1
      })
    }
    //下周
    nextWeek() {
      let  count = this.state.week 
      const {form} = this.props
      const {setFieldsValue} = form
      let _starTime = moment().week(moment().week() - count + 2).startOf('week')
      let _endTime = moment().week(moment().week() - count + 2).endOf('week')                        
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
      this.setState({
        week:count-1,
        month:1,
        day:1
      })
    }
    //本周
    preWeek() {
      this.setState({
        month:1,
        day:1,
        week:1
      })
      let _starTime = moment().startOf('week')
      let _endTime = moment()
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
     
    }
    //本月
    preMonth(){
      this.setState({
        month:1,
        day:1,
        week:1
      })
      let _starTime =  moment().month(moment().month()).startOf('month')
      let _endTime = moment()
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
    }
    //上一月
    LastMounth(){
      let count = this.state.month
      const {form} = this.props
      const {setFieldsValue} = form
      let _starTime = moment().month(moment().month() - count).startOf('month')
      let _endTime = moment().month(moment().month() - count).endOf('month')
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
      this.setState({
        month:count+1,
        day:1,
        week:1
      })
    }
    //下一月
    nextMonth(){
      let count = this.state.month
      const {form} = this.props
      const {setFieldsValue} = form
      let _starTime = moment().month(moment().month() - count + 2).startOf('month')
      let _endTime = moment().month(moment().month() - count + 2).endOf('month')
      this.props.form.setFieldsValue({
        startTime:_starTime
      })
      this.props.form.setFieldsValue({
        endTime:_endTime
      })
      this.setState({
        month:count-1,
        day:1,
        week:1
      })
    }
    disabledStartDate(startValue) {
      const endValue = this.props.form.getFieldValue('endTime');
      if (!startValue || !endValue) {
        return false;
      }
      return startValue.valueOf() > endValue.valueOf() || startValue > moment();
      
    }
    disabledEndDate(endValue) {
      const startValue = this.props.form.getFieldValue('startTime');
      if (!endValue || !startValue) {
        return false; 
      }
      return endValue.valueOf() <= startValue.valueOf() || endValue > moment();
    }
    handleStartOpenChange(open) {
      if (!open) {
        this.setState({ endOpen: true })
      }
    }
    handleEndOpenChange(open) {
      this.setState({ endOpen: open })
    }
      //同步执行操作
    closeModal(){
      this.props.parmsDict.closeRealTimeFresh()
      this.setState({
        month:1,
        day:1,
        week:1
      })
      var _this = this
      var thenStart = new Promise(function(resolve,reject){
        resolve(function(){
          _this.props.onCancel(false);
          _this.props.toggleTimeShaft(false)
          return true
        })
      })
      thenStart.then(function(first){
        return  first()
      }).then(function(second){
        // if(second){
          //_this.props.parmsDict.startRealTimeFresh()
          _this.props.parmsDict.renderScreen()    //重新使用实时刷新    
        // }
      })
    }
    handleStartTimeChange = (value) =>{
      let _this = this
      this.props.form.setFieldsValue({
        startTime:moment(value).format(TIME_FORMAT)
      })
      // console.log(this.props.form.getFieldValue('startTime'))
      this.setState({
        startTime:_this.props.form.getFieldValue('startTime'),
        month:1,
        day:1,
        week:1
      })
    }

    handleEndTimeChange = (value) => {
      let _this = this
      this.props.form.setFieldsValue({
        endTime:moment(value).format(TIME_FORMAT)
      })
      this.setState({
        endTime:_this.props.form.getFieldValue('endTime'),
        month:1,
        day:1,
        week:1
      })
    }

    handleFormatChange = (value) => {
      this.setState({
        timeFormat : value
      })
    }

    render() {
      const { 
        show, 
        form, 
        onOk, 
        onCancel,
        parmsDict
      } = this.props;
      
      const { getFieldDecorator } = form;

      if (!show) {
        return null;
      }

      return (
        <div>
          {
            show ?
            <Modal
              visible={true}
              title="时间配置"
              wrapClassName={str}
              okText="确定"
              cancelText="取消"
              maskClosable={false}
              onCancel={()=>{
                this.closeModal()
                }}
              onOk={this.onOk}
              width={550}
            > 
                <Button style={{marginLeft:"28px",marginTop:"12px",position:'absolute'}}  onClick={this.yesterday}>前一天</Button>
                <Button style={{marginLeft:"108px",marginTop:"12px",position:'absolute'}} onClick={this.nextDay}>后一天</Button>
                <Button style={{marginLeft:"188px",marginTop:"12px",position:'absolute'}} onClick={this.today}>今天</Button>
                <Button style={{marginLeft:"28px",marginTop:"65px",position:'absolute'}}  onClick={this.lastWeek}>前一周</Button>
                <Button style={{marginLeft:"108px",marginTop:"65px",position:'absolute'}}  onClick={this.nextWeek}>后一周</Button>
                <Button style={{marginLeft:"188px",marginTop:"65px",position:'absolute'}}  onClick={this.preWeek}>本周</Button>
                <Button style={{marginLeft:"28px",marginTop:"117px",position:'absolute'}}  onClick={this.LastMounth}>前一月</Button>
                <Button style={{marginLeft:"108px",marginTop:"117px",position:'absolute'}} onClick={this.nextMonth}>后一月</Button>
                <Button style={{marginLeft:"188px",marginTop:"117px",position:'absolute'}} onClick={this.preMonth}>本月</Button>
              <Form onSubmit={this.handleSubmit} style={{marginLeft:'270px',marginTop:'10px'}}>
                <FormItem
                  {...formItemLayout}
                  label="开始时间"
                >
                  {getFieldDecorator('startTime', {
                    // initialValue : moment(),
                    initialValue : moment(startTime,TIME_FORMAT),
                    rules: [{ type: 'object', required: true, message: '请选择开始时间!' }],
                  })(
                    <DatePicker 
                      showTime 
                      format={TIME_FORMAT}
                      style={{ width: 160,minWidth:160 }}
                      disabledDate={this.disabledStartDate}
                      onChange={this.handleStartTimeChange}
                    />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="结束时间"
                >
                  {getFieldDecorator('endTime', {
                    initialValue : moment(endTime,TIME_FORMAT),
                    rules: [{ type: 'object', required: true, message: '请选择结束时间!' }],
                  })(
                    <DatePicker
                    showTime 
                    format={TIME_FORMAT}
                    style={{ width: 160,minWidth:160 }}
                    disabledDate={this.disabledEndDate}
                    onChange={this.handleEndTimeChange}
                    />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="取样间隔"
                >
                  {getFieldDecorator('timeFormat', {
                    initialValue:this.state.timeFormat,
                    rules: [{ required: true, message: '请选择取样间隔' }],
                  })(
                    <Select
                      style={{ width: 160,minWidth:160 }}
                      placeholder="请选择取样间隔"
                      onSelect={this.handleFormatChange}
                    >
                      <Option value="m1">1分钟</Option>
                      <Option value="m5">5分钟</Option>
                      <Option value="h1">1小时</Option>
                      <Option value="d1">1天</Option>
                    </Select>
                  )}
                </FormItem>
              </Form>
            </Modal>
            :
            ""
          }
        </div>
       
      );
    }
  }


export default Form.create()(DateConfigForm)