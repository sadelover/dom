// 模式控制自定义组件
import React, { Component } from 'react'
import {Table,Form, Select, DatePicker, Button, Switch, message,Input,Row,Col,Modal,Tag,Popover} from 'antd'
import s from './ModelControlView.css'
import http from '../../../../common/http';
import moment from 'moment';
import Widget from './Widget.js'
import {addOperation} from '../../../../common/utils'


const registerInformation = {
    type: 'modelControl',
    name : '模式控制组件',
    description : "模式控制及手动模式",
}
var timer;
var btnWidth = 0;
class ModelControlComponent extends Widget {

    constructor(props){
        super(props)
        this.state = {
            style : {},
            modelList: []
        }
        this.addModelToCalendar = this.addModelToCalendar.bind(this);
        this.showModelList = this.showModelList.bind(this);
        this.manualMode = this.manualMode.bind(this);
        this.modeControlOperation = this.modeControlOperation.bind(this);
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
        const {style} = this.props;
        const modelType = this.props.config.modelType;
        this.setState({style})
        http.post('/mode/getTodayModeList', {
          "type": modelType
        }).then(
          res => {
            this.setState({
              modelList: res.data
            });
          }
        )

        timer = setInterval(() => {
          const modelType = this.props.config.modelType;
          http.post('/mode/getTodayModeList', {
            "type": modelType
          }).then(
            res => {
              this.setState({
                modelList: res.data
              });
            }
          )
        }, 30000)
    }
    componentWillUnmount() {
      clearInterval(timer);
    }

    modeControlOperation(typeModeName, modeName="手动模式") {
      const modelType = this.props.config.modelType;
      http.post('/mode/getTodayModeList', {
        "type": modelType
      }).then(
        res => {
          this.setState({
            modelList: res.data
          });

        }
      )
      //增加操作记录
      http.post('/operationRecord/add', {
        "userName": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
          JSON.parse(localStorage.getItem('userInfo')).name : '',
        "content": `${typeModeName}运行模式切换为：${modeName}`,
        "address": ''
      }).then(
        data => {

        }
      )


    }

    addModelToCalendar(item) {
      const modelType = this.props.config.modelType;
      var typeMode;
      if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
        switch(modelType) {
                  case 0:
                    typeMode = "冷站"
                    break;
                  case 1:
                    typeMode = "热站"
                    break;
                  case 2:
                    typeMode = "BA末端"
                    break;
                  case 3:
                    typeMode = "照明"
                    break;
                  case 4:
                    typeMode = "自定义1"
                    break;
                  case 5:
                    typeMode = "自定义2"
                    break;
                  case 6:
                    typeMode = "自定义3"
                    break;
                  case 7:
                    typeMode = "自定义4"
                    break;
                  case 8:
                    typeMode = "自定义5"
                    break;
                  case 9:
                    typeMode = "自定义6"
                    break;
                  case 10:
                    typeMode = "自定义7"
                    break;
                  case 11:
                    typeMode = "自定义8"
                    break;
                  case 12:
                    typeMode = "自定义9"
                    break;
                  case 13:
                    typeMode = "自定义10"
                    break;
                  case 14:
                  typeMode = "自定义11"
                  break;
                  case 15:
                    typeMode = "自定义12"
                    break;
                  case 16:
                    typeMode = "自定义13"
                    break;
                  case 17:
                    typeMode = "自定义14"
                    break;
                  case 18:
                    typeMode = "自定义15"
                    break;
                  case 19:
                    typeMode = "自定义16"
                    break;
                  case 20:
                    typeMode = "自定义17"
                    break;
                  case 21:
                    typeMode = "自定义18"
                    break;
                  case 22:
                    typeMode = "自定义19"
                    break;
                  case 23:
                    typeMode = "自定义20"
                    break;  
                }

        Modal.confirm({
          title: '模式切换',
          content: `是否确认将${typeMode}运行模式切换为${item.name}，注意切换后可能会产生设备动作。`,
          onOk:()=>{
            http.post('/calendar/addModeToCalendar', {
              "modeId": item.modeId,
              "date": moment().locale('zh-cn').format('YYYY-MM-DD'),
              "type": item.type,
              "creator": item.creator,
              "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
            }).then(
              data => {
                if (!data.err) {
                  this.modeControlOperation(typeMode, item.name)
                } else {
                  Modal.error({
                    title: '错误提示',
                    content: '切换失败'
                  })
                }
              }
            ).catch(
              () => {
                
              }
            )     
          }
        })   
      }else {
          Modal.info({
              title: '提示',
              content: '用户权限不足'
          })
      }
    }

    

  showModelList() {
      const modelType = this.props.config.modelType;    
      let modelListName = this.state.modelList.map((item) => {
        if(item.active === 1) {
          return item.name
        }
      })
      if (modelListName.length === this.state.modelList.length && document.getElementById(`manualMode${modelType}`)) {
        document.getElementById(`manualMode${modelType}`).style.opacity = 1;
        document.getElementById(`manualMode${modelType}`).style.color = '#fff';
        document.getElementById(`manualMode${modelType}`).style.fontWeight = 700;
      } 

      //按钮宽度自适应
      var temp = 6;
      for (let i = 0; i < this.state.modelList.length;i++) {
        let numLen = 1
        if(this.state.modelList[i].name.match(/\d|\-|\_|\:/g) != null) {
          numLen = this.state.modelList[i].name.match(/\d|\-|\_|\:/g).length;
        } 
        
        let tempLen = this.state.modelList[i].name.length - Math.floor(numLen/2);
        if (temp < tempLen) {
          temp = tempLen;
        }
        btnWidth = temp;
      }

      
      
    return (
      this.state.modelList.map((item)=>{
        if(item.active===1) {
            var modeOpacity = 1;
            var modeTextColor = '#fff';
            var modeFontWeight = 700;
            document.getElementById(`manualMode${modelType}`).style.opacity = 0.4;
            document.getElementById(`manualMode${modelType}`).style.color = '#111';
            document.getElementById(`manualMode${modelType}`).style.fontWeight = 400; 
          }else {
            modeOpacity = 0.4;
            modeTextColor = '#111';
            modeFontWeight = 400;
          } 
        let content = {}
        let contentIndex = []
        if (item.description != undefined && item.description != "") {
          
        }

        if (this.props.width <= this.props.height) {
          return (
            <div>

            {
              item.description != undefined && item.description != "" ?
                  <Popover content={(<pre style={{backgroundColor:"#29304A"}}>{item.description}</pre>)} >
                    <Button 
                    onClick= {() => { this.addModelToCalendar(item) }} 
                    
                      style={{ marginBottom: 7, opacity: modeOpacity, textAlign:'center',padding:0,width: 20*btnWidth, height: 30, fontSize: 16, fontWeight:modeFontWeight,backgroundColor: "#60b8fa", color: modeTextColor,borderRadius:5,border:0}}
                    > 
                    {item.name}
                    </Button>
                  </Popover>
              :
     
                  <Button 
                  onClick= {() => { this.addModelToCalendar(item) }} 
                  
                    style={{ marginBottom: 7, opacity: modeOpacity, textAlign:'center',padding:0,width: 20*btnWidth, height: 30, fontSize: 16, fontWeight:modeFontWeight,backgroundColor: "#60b8fa", color: modeTextColor,borderRadius:5,border:0}}
                  > 
                  {item.name}
                  </Button>

            }
                </div>

            
          )
        } else {
          return (
            <div>
              {
                item.description != undefined && item.description != "" ?
                <Popover placement="topLeft" content={(<pre style={{backgroundColor:"#29304A"}}>{item.description}</pre>)} >
                  <Button 
                    onClick= {() => { this.addModelToCalendar(item) }} 
                    
                      style={{ display:'inline-block',float:"left",marginBottom: 7,marginRight: 7, opacity: modeOpacity, textAlign:'center',padding:0,width: 20*btnWidth, height: 30, fontSize: 16,fontWeight:modeFontWeight, backgroundColor: "#60b8fa", color: modeTextColor,borderRadius:5,border:0}}
                    > 
                    {item.name}
                  </Button>
                </Popover>
                :
                <Popover placement="topLeft" content={(<textarea style={{backgroundColor:"#001529",height:'160px',width:'450px'}}>无描述</textarea>)} >
                <Button 
                  onClick= {() => { this.addModelToCalendar(item) }} 
                  
                    style={{ display:'inline-block',float:"left",marginBottom: 7,marginRight: 7, opacity: modeOpacity, textAlign:'center',padding:0,width: 20*btnWidth, height: 30, fontSize: 16,fontWeight:modeFontWeight, backgroundColor: "#60b8fa", color: modeTextColor,borderRadius:5,border:0}}
                  > 
                  {item.name}
                </Button>
                </Popover>
              }
            </div>
          )
        }
        
      })
    )
  }

  manualMode() {
    const modelType = this.props.config.modelType;
      var typeMode;
    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
      switch(modelType) {
                case 0:
                  typeMode = "冷站"
                  break;
                case 1:
                  typeMode = "热站"
                  break;
                case 2:
                  typeMode = "BA末端"
                  break;
                case 3:
                  typeMode = "照明"
                  break;
                case 4:
                  typeMode = "自定义1"
                  break;
                case 5:
                  typeMode = "自定义2"
                  break;
                case 6:
                  typeMode = "自定义3"
                  break;
                case 7:
                  typeMode = "自定义4"
                  break;
                case 8:
                  typeMode = "自定义5"
                  break;
                case 9:
                  typeMode = "自定义6"
                  break;
                case 10:
                  typeMode = "自定义7"
                  break;
                case 11:
                  typeMode = "自定义8"
                  break;
                case 12:
                  typeMode = "自定义9"
                  break;
                case 13:
                  typeMode = "自定义10"
                  break;
                case 14:
                  typeMode = "自定义11"
                  break;
                case 15:
                  typeMode = "自定义12"
                  break;
                case 16:
                  typeMode = "自定义13"
                  break;
                case 17:
                  typeMode = "自定义14"
                  break;
                case 18:
                  typeMode = "自定义15"
                  break;
                case 19:
                  typeMode = "自定义16"
                  break;
                case 20:
                  typeMode = "自定义17"
                  break;
                case 21:
                  typeMode = "自定义18"
                  break;
                case 22:
                  typeMode = "自定义19"
                  break;
                case 23:
                  typeMode = "自定义20"
                  break;
                
              }
      Modal.confirm({
        title: '手动模式',
        content: `是否确认将${typeMode}运行模式切换为手动模式，注意切换后会清除当前${typeMode}运行模式。`,
        onOk:()=>{
          for (let i = 0; i < this.state.modelList.length;i++) {
            if (this.state.modelList[i].active === 1 && this.state.modelList[i].type === this.props.config.modelType)
              var modeId = this.state.modelList[i].modeId
          }

          http.post('/calendar/removeModeFromCalendar', {
            "modeId": modeId,
            "date": moment().locale('zh-cn').format('YYYY-MM-DD'),
            "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
          }).then(
            data => {
              if (!data.err) {
                  this.modeControlOperation(typeMode)
              } else {
                Modal.error({
                  title: '错误提示',
                  content: '切换失败'
                })
              }
            }
          ).catch(
            () => {
              
            }
          )
          document.getElementById(`manualMode${modelType}`).style.opacity = 1;
          document.getElementById(`manualMode${modelType}`).style.color = '#fff';
          document.getElementById(`manualMode${modelType}`).style.fontWeight = 700;
        }
      }) 
    }else {
        Modal.info({
            title: '提示',
            content: '用户权限不足'
        })
    }
  }
   

    /* @override */
    getContent() {
        const {style} = this.state;
        const modelType = this.props.config.modelType;
    
        return (
            <div style={style} className={s['container']} >  
                <div style={{clear:"both"}}>
                  {this.showModelList()}
                </div>
                <Button 
                  id = {`manualMode${modelType}`}
                  onClick={this.manualMode}
                  style={{float:'left',marginBottom:7,opacity:0.4,textAlign:'center',padding:0,width:20*btnWidth,height:30,fontSize:16,backgroundColor:"#60b8fa",color:'#111',borderRadius:5,border:0}}            
                >
                  手动模式
                </Button>
            </div>

        )
    }
}


export default ModelControlComponent