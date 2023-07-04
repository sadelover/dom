import React , { Component } from 'react';
import { Button, Modal, DatePicker, Spin, Icon } from 'antd';
import moment from 'moment';
import http from '../../../../common/http';
import LimitDrag from '../../../modal/components/LimitDrag'; 
import s from './StrategicLogModalView.css';
import { downloadUrl } from '../../../../common/utils';

const style = {
  'container':{
      'color':'black'
  }
} 
let toggleModalClass,persagyStyle;
if(localStorage.getItem('serverOmd')=="persagy"){
  toggleModalClass='persagy-modal persagy-dashBoardLine-form'
  persagyStyle = style.container
}

class StrategicLogModalView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      logData:[],
      timeString:'',
      Visible:false,
      goOn:true
    }
    this.getTodayLog = this.getTodayLog.bind(this)
    this.timeOnChange = this.timeOnChange.bind(this)
    this.getLogInfo = this.getLogInfo.bind(this)
    this.getLatestRoundLog = this.getLatestRoundLog.bind(this)
    this.downloadLog = this.downloadLog.bind(this)
  }
  shouldComponentUpdate(nextProps,nextState){
    if(nextProps.visible!==this.props.visible){
      this.setState({
        timeString:moment().format('YYYY-MM-DD')
      })
      if(nextProps.visible==true){
        setTimeout(function(){
          new LimitDrag('.ant-modal-content');
        },1000)
      }else{
        this.setState({
          logData:[]
        })
      }
      return true
    }else{
      if(nextState==this.state){
        return false
      }else{
        return true
      }
    }
}
  timeOnChange(date, dateString)  {
    this.setState({timeString:dateString})
    this.setState({logData:[]})
  }
  getTodayLog() {
    this.setState({
      logData:[],
      Visible:true,
      goOn:true
    })
    const { dllName } = this.props
    let defaultDate = moment().locale('zh-cn').format('YYYY-MM-DD')
    let searchTime = 'log_' + (this.state.timeString ? this.state.timeString : defaultDate).replace(/-/g, '_')
    http.post('/strategy/getLogInfo', {
      searchTime: searchTime,
      dllName: dllName
		}).then(
          res => {
            if(this.state.goOn == true){
              if(res.data.length === 0) {
                this.setState({
                  logData:[{time:'查询失败！',loginfo:'请检查对应日期是否存在LOG表！'}],
                  Visible:false
                })
              }else{
                this.setState({
                  logData:res.data.slice(-5000),
                  Visible:false
                })
                console.log(res.data.slice(-5000))
              }
            }
      }).catch(
        err=>{
          this.setState({
            Visible:false
          })
        }
      )	
  }

  getLatestRoundLog() {
    this.setState({
      logData:[],
      Visible:true,
      goOn:true
    })
    const { dllName } = this.props
    let defaultDate = moment().locale('zh-cn').format('YYYY-MM-DD')
    let searchTime = 'log_' + (this.state.timeString ? this.state.timeString : defaultDate).replace(/-/g, '_')
    http.post('/strategy/getLatestRoundLogInfo', {
      searchTime: searchTime,
      dllName: dllName
		}).then(
          res => {
            if(this.state.goOn == true){
              if(res.data.length === 0) {
                this.setState({
                  logData:[{time:'查询失败！',loginfo:'请检查对应日期是否存在LOG表！'}],
                  Visible:false
                })
              }else{
                this.setState({
                  logData:res.data,
                  Visible:false
                })
              }
            }
      }).catch(
        err=>{
          this.setState({
            Visible:false
          })
        }
      )	
  }

  getLogInfo() {
    return this.state.logData.map((item) => {
      return <p style={{userSelect:'text'}}><span>{item.time}</span>&nbsp;<span>{item.loginfo}</span></p>
    })
  }

  downloadLog(){
    const { dllName } = this.props
    let defaultDate = moment().locale('zh-cn').format('YYYY-MM-DD')
    let searchTime = 'log_' + (this.state.timeString ? this.state.timeString : defaultDate).replace(/-/g, '_')
    http.post('/strategy/getLogInfoOfOneDayZipped', {
      searchTime: searchTime,
      dllName: dllName
		}).then(
      res => {
        if(res.err === 0) {
          let data
          if(res.data.indexOf(':')!=-1){
            let index = res.data.lastIndexOf('static')
            data = res.data.slice(index)
          }else{
            data = res.data
          } 
          data = data.replace(/\\/g, '\/')
          downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/${data}`)  
        }
    }).catch(
      err => {
        console.log("今日Log下载失败")
      }
    )	
  }
  cancel=()=>{
    this.setState({
      Visible:false,
      goOn:false
    })
  }
  render() {
      const { visible, hideModal } = this.props;
      return (
        <div>
            <Modal
                wrapClassName={toggleModalClass}
                className={s['modal']}
                visible={visible}
                title='策略日志查询'
                onCancel={ ()=>{
                  if(document.getElementById("logInfo")){
                    document.getElementById("logInfo").style.display = "none"
                  }
                  this.cancel()
                  hideModal()
                }}
                footer=''
                width={1101}
                maskClosable={false}
                key={Math.random()*10}
            >
              <div className={s['header']}  >
                日期：<DatePicker defaultValue={moment(moment(), 'YYYY-MM-DD')} format={'YYYY-MM-DD'} value={moment(moment(this.state.timeString), 'YYYY-MM-DD')} onChange={this.timeOnChange}/>
                <Button onClick={this.downloadLog} className={s['btn']}>今日Log下载<Icon type="download" /></Button>
                <Button onClick={this.getTodayLog} className={s['btn']}>今日Log查询</Button>
                <Button onClick={this.getLatestRoundLog} className={s['btn']}>本轮Log查询</Button>
                <Button onClick={this.cancel} className={s['btn']}>取消查询</Button>
              </div>
              <div className={s['container']}>
                {
                  this.state.Visible?
                  <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                      <Spin tip="正在读取数据"/>
                  </div>
                  :
                  <div id="logInfo">
                    {this.getLogInfo()}
                  </div>
                }                 
              </div>   
            </Modal>
        </div>
      )   
  }
}
export default StrategicLogModalView
