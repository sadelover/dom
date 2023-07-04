/**
 * 图表配置模态框
 */
import React from 'react';
import { Button, Modal, message, Form, Input, Select, DatePicker , Row ,Col } from 'antd';
import moment from 'moment';

import s from './ConfigModalView.css';
import http from '../../../common/http';


let modalToggleClass,calendarToggleClass,selectToggleClass,btnStyle;
if(localStorage.getItem('serverOmd')=="persagy"){
  modalToggleClass = 'persagy-modal-style persagy-history-label persagy-history-modal';
  calendarToggleClass = 'persagy-history-calendar-picker';
  selectToggleClass = 'persagy-history-select-selection';
  btnStyle={
    background:"rgba(255,255,255,1)",
    border:'1px solid rgba(195,198,203,1)',
    color:"rgba(38,38,38,1)",
    borderRadius:'4px',
    fontSize:"14px",
    fontFamily:'MicrosoftYaHei'
  }
}

const Option = Select.Option;
const FormItem = Form.Item;

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

class ConfigModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      day:0,
      week:0,
      month:0
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.disabledStartDate = this.disabledStartDate.bind(this);
    this.disabledEndDate = this.disabledEndDate.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let timeStart = moment(values.timeStart).format(TIME_FORMAT),
        timeEnd =moment(values.timeEnd).format(TIME_FORMAT),
        timeFormat = values.timeFormat;
        localStorage.setItem('historyTimeStart',timeStart)
        localStorage.setItem('historyTimeEnd',timeEnd)
        this.props.handleOk(
          values
        );
        this.props.handleHide();
      }
    });
  }
  disabledStartDate(startValue) {
    const endValue = this.props.form.getFieldValue('timeEnd');
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate(endValue) {
    const startValue = this.props.form.getFieldValue('timeStart');
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  getTodayTime = () => {

    const {setFieldsValue} = this.props.form

    var timeStart =  moment().startOf('day'),
        timeEnd = moment().endOf('day'),
        timeFormat = 'm1';
    this.setState({
      day:0,
      week:0,
      month:0
    })  
    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }

  getNextDayTime = () => {

    const {setFieldsValue} = this.props.form
    var timeStart =  moment().add(this.state.day+1, 'd').startOf('day'),
        timeEnd = moment().add(this.state.day+1, 'd').endOf('day'),
        timeFormat = 'm1';
    
    this.setState({
      day:this.state.day+1,
      week:0,
      month:0
    })

    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }

  getLastDayTime = () => {

    const {setFieldsValue} = this.props.form
    var timeStart =  moment().add(this.state.day-1, 'd').startOf('day'),
        timeEnd = moment().add(this.state.day-1, 'd').endOf('day'),
        timeFormat = 'm1';
    
    this.setState({
      day:this.state.day-1,
      week:0,
      month:0
    })

    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }


  getThisWeek = () => {
    const {setFieldsValue} = this.props.form

    var timeStart = moment().startOf('week'),
        timeEnd = moment().endOf('day'),
        timeFormat = 'm5';
    
    this.setState({
      day:0,
      week:0,
      month:0
    })

    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }

  getNextWeekTime = () => {

    const {setFieldsValue} = this.props.form
    var timeStart =  moment().add(this.state.week+1, 'w').startOf('week'),
        timeEnd = moment().add(this.state.week+1, 'w').endOf('week'),
        timeFormat = 'm5';
    
    this.setState({
      day:0,
      week:this.state.week+1,
      month:0
    })

    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }

  getLastWeekTime = () => {

    const {setFieldsValue} = this.props.form
    var timeStart =  moment().add(this.state.week-1, 'w').startOf('week'),
        timeEnd = moment().add(this.state.week-1, 'w').endOf('week'),
        timeFormat = 'm5';
    
    this.setState({
      day:0,
      week:this.state.week-1,
      month:0
    })

    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }

  getThisMonth = () => {
    const {setFieldsValue} = this.props.form

    var timeStart = moment().startOf('month'),
        timeEnd = moment().endOf('day'),
        timeFormat = 'h1';
    this.setState({
      day:0,
      week:0,
      month:0
    })
    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }
  getNextMonthTime = () => {

    const {setFieldsValue} = this.props.form
    var timeStart =  moment().add(this.state.month+1, 'month').startOf('month'),
        timeEnd = moment().add(this.state.month+1, 'month').endOf('month'),
        timeFormat = 'h1';
    
    this.setState({
      day:0,
      week:0,
      month:this.state.month+1
    })

    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }

  getLastMonthTime = () => {

    const {setFieldsValue} = this.props.form
    var timeStart =  moment().add(this.state.month-1, 'month').startOf('month'),
        timeEnd = moment().add(this.state.month-1, 'month').endOf('month'),
        timeFormat = 'h1';
    
    this.setState({
      day:0,
      week:0,
      month:this.state.month-1
    })

    setFieldsValue({
      timeStart : timeStart,
      timeEnd : timeEnd,
      timeFormat : timeFormat
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 14
      },
    };
    
    return (
      <Modal
        className={modalToggleClass}
        title="图表配置"
        width={580}
        visible={this.props.visible}
        onCancel={this.props.handleHide}
        onOk={this.handleSubmit}
        maskClosable={false}
        cancelText="取消"
        okText="确定"
      >
                <Button style={{marginLeft:"28px",marginTop:"12px",position:'absolute'}} onClick={this.getLastDayTime}>前一天</Button>
                <Button style={{marginLeft:"108px",marginTop:"12px",position:'absolute'}} onClick={this.getNextDayTime}>后一天</Button>
                <Button style={{marginLeft:"188px",marginTop:"12px",position:'absolute'}} onClick={this.getTodayTime}>今天</Button>
                <Button style={{marginLeft:"28px",marginTop:"77px",position:'absolute'}} onClick={this.getLastWeekTime}>前一周</Button>
                <Button style={{marginLeft:"108px",marginTop:"77px",position:'absolute'}} onClick={this.getNextWeekTime}>后一周</Button>
                <Button style={{marginLeft:"188px",marginTop:"77px",position:'absolute'}} onClick={this.getThisWeek}>本周</Button>
                <Button style={{marginLeft:"28px",marginTop:"142px",position:'absolute'}} onClick={this.getLastMonthTime}>前一月</Button>
                <Button style={{marginLeft:"108px",marginTop:"142px",position:'absolute'}} onClick={this.getNextMonthTime}>后一月</Button>
                <Button style={{marginLeft:"188px",marginTop:"142px",position:'absolute'}} onClick={this.getThisMonth}>本月</Button>
        <Form style={{marginLeft:'251px',marginTop:'10px'}}>
          <FormItem
            className={calendarToggleClass}
            {...formItemLayout}
            label="开始时间"
            hasFeedback
          >
            {getFieldDecorator('timeStart', {
              initialValue: localStorage.getItem('historyTimeStart')?localStorage.getItem('historyTimeStart'):moment().startOf('day'),
              rules: [{
                required: true, message: '开始时间不能为空！'
              }],
            })(
              <DatePicker
                style={{
                  width: '100%'
                }}
                //disabledDate={this.disabledStartDate}
                showTime
                format={TIME_FORMAT}
                placeholder="请输入开始时间"
                onChange={this.onStartChange}
              />
            )}
          </FormItem>
          <FormItem
            className={calendarToggleClass}
            {...formItemLayout}
            label="结束时间"
            hasFeedback
          >
            {getFieldDecorator('timeEnd', {
              initialValue: localStorage.getItem('historyTimeEnd')?localStorage.getItem('historyTimeEnd'):moment(),
              rules: [{
                required: true, message: '结束时间不能为空!'
              }],
            })(
              <DatePicker
                style={{
                  width: '100%'
                }}
                //disabledDate={this.disabledEndDate}
                showTime
                format={TIME_FORMAT}
                placeholder="请输入结束时间"
                onChange={this.onEndChange}
              />
            )}
          </FormItem>
          <FormItem
            style={{marginBottom:10}}
            labelCol={{
              span: 8
            }}
            wrapperCol={{
              span: 10
            }}
            label="采样间隔"
            hasFeedback
            className={selectToggleClass}
          >
            {getFieldDecorator('timeFormat', {
              initialValue: 'm5',
              rules: [{
                required: true, message: '请选择采样间隔!'
              }],
            })(
              <Select>
                <Option value="m1">1分钟</Option>
                <Option value="m5">5分钟</Option>
                <Option value="h1">1小时</Option>
                <Option value="d1">1天</Option>
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
const WrappedConfigModal = Form.create({
  mapPropsToFields: (props) => {
    return {
      timeStart: Form.createFormField({ value: props.timeOptions.timeStart }),
      timeEnd: Form.createFormField({ value: props.timeOptions.timeEnd }),
      timeFormat:Form.createFormField({ value: props.timeOptions.timeFormat })
    }
  }
})(ConfigModal);

export default WrappedConfigModal
