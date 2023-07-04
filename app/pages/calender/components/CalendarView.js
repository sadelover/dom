/**
 * 历史曲线页面
 */

import React from 'react';
import { Button, message,Spin,Modal,Calendar } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../lib/echarts-themes/dark';
import cx from 'classnames'

import http from '../../../common/http';
import { downloadUrl } from '../../../common/utils';

import ConfigModal from './ConfigModalView';
import DelModal from './DelModalView'

import s from './CalendarView.css';
import appConfig from '../../../common/appConfig'

import moment from 'moment';
const DateFormat = 'YYYY-MM-DD'
let LastMonth = moment().format('MM');
let btnStyle,headerBgStyle,CalendarStyle,btnAllBtnStyle;
if(localStorage.getItem('serverOmd')=="best"){
    btnStyle={
      background:"#E1E1E1",
      boxShadow:"2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
      border:0,
      color:"#000",
      fontSize:"12px",
      lineHeight:"20px"
    }
    btnAllBtnStyle={
      background:"#E1E1E1",
      boxShadow:"2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
      border:0,
      color:"#000",
      fontSize:"12px",
      lineHeight:"20px"
    }
    headerBgStyle={
      background:"RGB(240,240,240)",
      color:"#000"
    }
}else if(localStorage.getItem('serverOmd')=="persagy"){
  btnStyle={
    height:'32px',
    background:'rgba(255,255,255,1)',
    borderRadius:'4px',
    border:'1px solid rgba(195,199,203,1)',
    fontSize:'14px',
    fontFamily:'PingFangSC-Regular,PingFang SC',
    fontWeight:'400',
    color:'rgba(31,36,41,1)',
    lineHeight:'32px',
  }
  btnAllBtnStyle={
    height:'32px',
    background:'rgba(225,242,255,1)',
    borderRadius:'4px',
    border:'1px solid rgba(195,199,203,1)',
    fontSize:'14px',
    fontFamily:'PingFangSC-Regular,PingFang SC',
    fontWeight:'400',
    color:'rgba(0,145,255,1)',
    lineHeight:'32px',
  }
  headerBgStyle={
    background:"#ffffff",
    color:"#000",
    padding:'6px 9px'
  }
  CalendarStyle = "PersagyCalendarStyle"
}else{
  CalendarStyle = ""
}


let defaultColorArr = ["#99CCFF","#FF6666","#00FF99","#FFFF66","#669900","#990066","#FF9900","#FF66FF","#CC6600"]
class CalendarView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: this.props.data,
      isShowConfigModal: false,
      calendarValue: moment(),
      selectedValue: moment(),
      modalList:[],
      isShowDelModal: false,
      selectedDayModel:[],
      showModalType:null,
      modalType:null,
      typeModeList:[],
      colorArr:[]
    }; 

    this.container = null;
    this.saveContainerRef = this.saveContainerRef.bind(this);
    this.showConfigModal = this.showConfigModal.bind(this);
    this.hideConfigModal = this.hideConfigModal.bind(this);
    this.showDelModal = this.showDelModal.bind(this);
    this.getListData = this.getListData.bind(this);
    this.dateCellRender = this.dateCellRender.bind(this);
    this.onSelectDay = this.onSelectDay.bind(this);
    this.getModelList = this.getModelList.bind(this);  //获取所有模式数据
    this.onPanelChange = this.onPanelChange.bind(this);
    this.hideDelModal = this.hideDelModal.bind(this);
    this.getModelByType = this.getModelByType.bind(this);
    this.disabledDate = this.disabledDate.bind(this);
    this.getModelBtns = this.getModelBtns.bind(this);
    this.thisMonthDelModal = this.thisMonthDelModal.bind(this);
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
    this.getModelList();
    this.props.loadingCalendar(true)
    this.props.getAllCalendarWithMode(this.state.calendarValue)
    document.getElementById('btnAllType').style.backgroundColor = "#60b8fa";

  //获取模式类型列表
  let tempArr = [];
    http.post('/project/getConfig',{
      key:"mode_group_define"
    }).then(
          data=>{
            if (data.status) {
              if (data.data.groupList != undefined) {
                this.setState({
                  typeModeList: data.data.groupList
                })
                  data.data.groupList.map((item,index)=>{ 
                    if (item.color != undefined) {
                      tempArr.push(item.color)
                    }
                  })
                  this.setState({colorArr:tempArr})
              } 
            }
            else{
              Modal.error({
                title: '错误提示',
                content: data.msg
              })
            }
          }
      ).catch(
          error =>{
              Modal.error({
                title: '错误提示',
                content: error.msg
              })
              // console.log(error)
          }
    )  
   
    
  }
  // componentWillReceiveProps(nextProps) {
  //   // if (this.props.timeOptions !== nextProps.timeOptions) {
  //   //   return this.getChartData(nextProps.points, nextProps.timeOptions);
  //   // }
  //   // let pointNames = this.props.points.map(row => row['name']).sort();
  //   // let nextPointNames = nextProps.points.map(row => row['name']).sort();
    
  //   // if (pointNames.join('') !== nextPointNames.join('')) {
  //   //   return this.getChartData(nextProps.points, nextProps.timeOptions);
  //   // }

  //   // pointNames = null;
  //   // nextPointNames = null;

  // }

  showDelModal() {
    if (this.state.selectedValue != undefined) {
      //筛选出选择日期已经绑定的模式
      let calendarData = this.props.calendarData || []
      let model = []
      // console.log(calendarData)
      calendarData.map(item=>{
        if (item.day === Number(this.state.selectedValue.format('DD'))) {
          // console.log(item.mode)
          model=item.mode
        }
      })
      this.setState({
        isShowDelModal: true,
        selectedDayModel:model
      });
    }else {
      Modal.info({
        titile:"信息提示",
        content:"请选择日期" 
      })
    }
  }
  //本月批量解绑
  thisMonthDelModal() {
    if (this.state.selectedValue != undefined) {
      let month = this.state.selectedValue.format('YYYY-MM')
      if (month < moment().format('YYYY-MM')) {
        Modal.info({
          titile:"信息提示",
          content:"过去月份不可解绑" 
        })
      }else {
        let type = this.state.modalType
        //得出当前选中的模式的名称
        let modalTypeName = ""
        if (this.state.modalType === null) {
          modalTypeName = "全部类型"
        }else {
          if (this.state.typeModeList.length >0) {
            this.state.typeModeList.map((item,index)=>{
              if (this.state.modalType == index) {
                modalTypeName = item.name
              } 
            })
          }else {
            var nameList = ["冷站","热站","BA末端","照明","自定义1","自定义2","自定义3","自定义4","自定义5"]
            modalTypeName = nameList[this.state.modalType]
          }
        }
        let _this = this
        Modal.confirm({
          title : '您当前左上角筛选的是'+modalTypeName+`${this.state.modalType === null ? "" : "类型"}的模式`,
          content : '确定要删除'+month+"整个月的所有"+modalTypeName+`${this.state.modalType === null ? "" : "类型"}的模式吗？`,
          onOk(){
              http.post('/calendar/batchRemoveModeFromCalendarThisMonth',{
                  type : type,
                  date: month,
                  source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
              }).then(
                  data => {
                      if(!data.err){
                        _this.props.loadingCalendar(true)
                        _this.props.getOneTypeCalendarWithMode(month,type)
                      }
                  }
              )
          }
        })
      }
    
    }else {
      Modal.info({
        titile:"信息提示",
        content:"请选择日期" 
      })
    }
  }


  saveContainerRef(container) {
    this.container = container;
  }
  showConfigModal(type) {
    this.getModelList(); //点击模式绑定时重新请求数据
    if (this.state.selectedValue != undefined) {
      this.setState({
        isShowConfigModal: true,
        showModalType:type
      });
    }else {
      Modal.info({
        titile:"信息提示",
        content:"请选择日期"
      })
    }
  }
  hideConfigModal() {
    this.setState({
      isShowConfigModal: false
    });
  }

  hideDelModal() {
    this.setState({
      isShowDelModal: false
    });
  }


  getListData(value) {
    let listData,weatherObj = {}
    let modeArr = []
    let calendarData = this.props.calendarData || []
    calendarData.map((item,i)=>{
      if (item.day === value.date() && this.state.selectedValue.month() === value.month()) {
        if (item.mode.length != 0 ) {
          modeArr = item.mode.map((obj,j)=>{
            return {
              type:obj.type,
              content:obj.modeName
            }
          })
        }
        if (item.weather != undefined && Object.keys(item.weather).length != 0) {
          weatherObj = item.weather
        }
      }
    })
    return listData={weatherObj,modeArr};
  }



dateCellRender(value) {
  const listData = this.getListData(value);
  var colorByType;
  // console.log(listData)
  return ( 
    <div>
      
      {
         Object.keys(listData.weatherObj).length != 0 ? 
         <div className={s['weather-wrap']} >
          <img src={appConfig.serverUrl + `/static/images/cond-icon-heweather`+`/${listData.weatherObj.code}.png`} alt=""style={{marginRight:'8px',height:'22px',position:'relative'}} />
          <span>{listData.weatherObj.tempMax}°C／{listData.weatherObj.tempMin}°C</span>
      </div>

        :
        ""
      }
       
    {
      listData.modeArr.map(item => {
        if(this.state.colorArr.length!=0) {
          for(let i=0;i<this.state.colorArr.length;i++) {
            if(item.type === i) {
              colorByType = this.state.colorArr[i]
            }
          }
        } else {
          for(let i=0;i<defaultColorArr.length;i++) {
            if(item.type === i) {
              colorByType = defaultColorArr[i]
            }
          }
        }
        if (moment().subtract(1,'days') > value) {
          // console.log(moment().subtract(1,'days'),value)
          // console.log(moment().subtract(1,'days') > value)
          //过去的模式，表示为灰色圆球
          return (
            <ul style={{marginBottom:2}}>
                  <li key={item.content}>
                    <span  style={{color:"#58606B",marginRight:7,fontSize:16}}>●</span>
                    {item.content}
                  </li>
            </ul>
          );
        }else {
          return (
            <ul style={{marginBottom:2}}>
                  <li key={item.content}>
                    <span  style={{color:colorByType,marginRight:7,fontSize:16}}>●</span>
                    {item.content}
                  </li>
            </ul>
          );
        }
      })
    }
    </div>
    
  )
}


onSelectDay(value) {
if(moment(value._d).format('MM')!= LastMonth){
  this.props.loadingCalendar(true)
    this.props.getOneTypeCalendarWithMode(value,this.state.modalType)
}
    this.setState({
      calendarValue:value,
      selectedValue: value
    });
    LastMonth = moment(value._d).format('MM');
    // console.log(value)
}

  getModelList () {
     http.get('/mode/getAll').then(
      data => {
        if (data.err) {
          return (
            Modal.error({
              title: '错误提示',
              content: "后台接口-接口请求失败！"+data.msg
            })
          )
        }else {
          this.setState({
            modalList:data.data
          });
        }
      }
    ).catch(
      () => {

      }
    )
  }

  onPanelChange(value, mode) {
    // console.log(value, mode);
    this.props.loadingCalendar(true)
    this.props.getOneTypeCalendarWithMode(value,this.state.modalType)
    //this.props.getAllCalendarWithMode(value)
    this.setState({
      calendarValue:value,
      selectedValue: value
    });
    // console.log(value)
  }

  getModelByType(type) {
    this.setState({
      modalType:type
    })
    this.props.loadingCalendar(true)
    var btns = document.getElementsByClassName('btnType');
    for(let i=0;i<btns.length;i++) {
      for(let i=0;i<btns.length;i++) {
        if(localStorage.getItem('serverOmd')=="best") {
          btns[i].style.backgroundColor='#E1E1E1';
        } else if (localStorage.getItem('serverOmd')=="persagy") {
          btns[i].style.backgroundColor='#fff';
        } else {
          btns[i].style.backgroundColor='';
        }
      }
      if(type===null) {
        btns[i].style.backgroundColor='#60b8fa';
        break;
      } else if(type+1===i){
        btns[i].style.backgroundColor='#60b8fa';
        break;
      }
    }
    this.props.getOneTypeCalendarWithMode(this.state.calendarValue,type)
    // this.setState({
    //   disabledFlag:false
    // })
  }


  //模式按钮
  getModelBtns() {
    if (this.state.typeModeList.length !=0) {
      return this.state.typeModeList.map((item,index)=>{
        let cirColor;
        if(item.color) {
          cirColor=item.color
        } else {
          for(let i=0;i<defaultColorArr.length;i++) {
            if(index === i) {
              cirColor = defaultColorArr[i]
            }
          }
        }
        return (
          <Button className="btnType" onClick={()=>{this.getModelByType(index)}} disabled={this.props.loading} style={btnStyle}><span style={{color:cirColor,marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>{item.name}</Button>
        )
      })
    }else {
        return (
          <div style={{display:'inline-block'}}>
            <Button className="btnType" onClick={()=>{this.getModelByType(0)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#99CCFF',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>冷站</Button>
            <Button className="btnType" onClick={()=>{this.getModelByType(1)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#FF6666',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>热站</Button>
            <Button className="btnType" onClick={()=>{this.getModelByType(2)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#00FF99',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>BA末端</Button>
            <Button className="btnType" onClick={()=>{this.getModelByType(3)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#FFFF66',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>照明</Button>
            <Button className="btnType" onClick={()=>{this.getModelByType(4)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#669900',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>自定义1</Button>
            <Button className="btnType" onClick={()=>{this.getModelByType(5)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#990066',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>自定义2</Button>
            <Button className="btnType" onClick={()=>{this.getModelByType(6)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#FF9900',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>自定义3</Button>
            <Button className="btnType" onClick={()=>{this.getModelByType(7)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#FF66FF',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>自定义4</Button>
            <Button className="btnType" onClick={()=>{this.getModelByType(8)}} disabled={this.props.loading} style={btnStyle}><span style={{color:'#CC6600',marginRight:5,fontSize:16,verticalAlign:'center'}}>●</span>自定义5</Button>
          </div>
        )
    }
  }

  disabledDate (current){
    return current < moment().subtract(2,'day')
  }

  render() {
    const { timeOptions } = this.props

    return (
        <div style={{height:'100%'}}>
          <div className={s['container']} ref={this.saveContainerRef}>
            <div className={cx(s['header'], 'clearfix')} style={headerBgStyle}>
              日历 
                <div className={s['options-left']}>
                  <Button 
                    id='btnAllType'
                    style={btnStyle}
                    disabled={this.props.loading}
                    className = "btnType"
                    onClick = {
                      () => {
                        this.getModelByType(null)
                        // this.props.loadingCalendar(true)
                        /**this.props.getAllCalendarWithMode(this.state.calendarValue)**/
                      }
                    }> 
                    <span style={{fontSize:16,verticalAlign:'center',border:0,padding:0}}></span>
                      全部类型 
                  </Button>
                    {this.getModelBtns()}
              </div>

                <div className={s['options']}>
                  <Button onClick={()=>{this.showConfigModal('day')}} style={btnStyle}>模式绑定</Button>
                  <Button onClick={()=>{this.showConfigModal('month')}} style={btnStyle}>本月模式批量绑定</Button>
                  <Button onClick={()=>{this.showConfigModal('weekend')}} style={btnStyle}>本月周末模式批量绑定</Button>
                  <Button onClick={()=>{this.showConfigModal('workday')}} style={btnStyle}>本月工作日模式批量绑定</Button>
                  <Button onClick={this.showDelModal} style={btnStyle}>模式解绑</Button>
                  <Button onClick={this.thisMonthDelModal} style={btnStyle}>本月模式批量解绑</Button>
                </div>

            </div>
            <div className={s['chart-container']}>
              {
                this.props.loading ? 
                <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                  <Spin tip="正在读取数据"/>
                </div>
                
                :
                  <Calendar defaultValue={this.state.selectedValue} disabledDate={this.disabledDate} onPanelChange={this.onPanelChange} onSelect={this.onSelectDay} dateCellRender={this.dateCellRender} className={CalendarStyle}/>
              }
            </div>
            <ConfigModal
              typeModeList = {this.state.typeModeList}
              visible={ this.state.isShowConfigModal }
              showModalType={this.state.showModalType}
              handleHide={ this.hideConfigModal }
              showLoading={this.state.loading}
              selectedDate={this.state.selectedValue}
              modalList={this.state.modalList}
              addModelToCalendar={this.props.addModelToCalendar}
              addModelToCalendarMonth={this.props.addModelToCalendarMonth}
              modalType={this.state.modalType}
              loadingCalendar={this.props.loadingCalendar}
            />
            <DelModal
              visible={ this.state.isShowDelModal }
              handleHide={ this.hideDelModal }
              showLoading={this.state.loading}
              selectedDate={this.state.selectedValue}
              modalList={this.state.selectedDayModel}
              modalType={this.state.modalType}
              delModelToCalendar={this.props.delModelToCalendar}
              loadingCalendar={this.props.loadingCalendar}
              typeModeList = {this.state.typeModeList}
            />
        </div>
      </div>
    );
  }
}

CalendarView.propTypes = {
};

export default CalendarView;
