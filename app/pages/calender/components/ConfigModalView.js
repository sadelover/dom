/**
 * 图表配置模态框
 */
import React from 'react';
import { Button, Modal, message, Form, Input, Select, DatePicker , Row ,Col,Table } from 'antd';
import moment from 'moment';

import s from './ConfigModalView.css';
import http from '../../../common/http';

const { Option } = Select;
const FormItem = Form.Item;

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

let ModalStyle,btnStyle;
if(localStorage.getItem('serverOmd')=="best"){
    ModalStyle = "PersagyCalendarModal"
    btnStyle={
      background:"#E1E1E1",
      boxShadow:"2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
      border:0,
      color:"#000",
      fontSize:"12px",
      lineHeight:"25px",
      height:'25px',
      marginRight:'5px'
    }
}else if(localStorage.getItem('serverOmd')=="persagy")
  {
    ModalStyle = "PersagyCalendarModal"
    btnStyle={
      background:'rgba(255,255,255,1)',
      borderRadius:'4px',
      fontSize:"12px",
      lineHeight:"25px",
      height:'25px',
      marginRight:'5px',
      fontFamily:'PingFangSC-Regular,PingFang SC',
      color:'rgba(31,36,41,1)',
    }
} else {
  ModalStyle = "CalendarModal"
  btnStyle={
    fontSize:"12px",
    lineHeight:"25px",
    height:'25px',
    marginRight:'5px'
  }
}

class ConfigModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedModelId:null,
      selectedModelType:null,
      selectedRowKey:[],
      modalList:[],
      selectValue: "0"
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.disabledStartDate = this.disabledStartDate.bind(this);
    this.disabledEndDate = this.disabledEndDate.bind(this);
    this.getModalView = this.getModalView.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.getModelByType = this.getModelByType.bind(this);
    this.getModelBtns = this.getModelBtns.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible != this.props.visible){
      this.getModelByType(this.state.selectedModelType,nextProps.modelList)
      // this.getModelByType(null)
      this.setState({
        selectValue: "0"
      })
    }
    if(nextProps.modelList) {
      this.getModelByType(this.state.selectedModelType,nextProps.modelList)
    }
  }


  handleSubmit(e) {
    e.preventDefault();
    //loading日历
    const {selectedModelType,selectedModelId,selectValue,selectedRowKey} = this.state
    const {selectedDate,modalType,addModelToCalendar,addModelToCalendarMonth,showModalType,handleHide,loadingCalendar} = this.props
    loadingCalendar(true);
  
    if (selectedRowKey.length != 0) {
      if (showModalType === 'day') {
        // loadingCalendar(true)
        addModelToCalendar(selectedDate.format('YYYY-MM-DD'),selectedModelType,selectedModelId,modalType)  
      }else{
        if (showModalType === 'month') {
          // loadingCalendar(true)
          addModelToCalendarMonth(selectedDate.format('YYYY'),selectedDate.format('MM'),selectedDate.format('YYYY-MM-DD'),selectedModelType,selectedModelId,modalType)  
        }
        if (showModalType === 'weekend') {
          // loadingCalendar(true)
          addModelToCalendarMonth(selectedDate.format('YYYY'),selectedDate.format('MM'),selectedDate.format('YYYY-MM-DD'),selectedModelType,selectedModelId,modalType,selectValue == "0"?[5,6]:[4,5])  
        }
        if (showModalType === 'workday') {
          // loadingCalendar(true)
          addModelToCalendarMonth(selectedDate.format('YYYY'),selectedDate.format('MM'),selectedDate.format('YYYY-MM-DD'),selectedModelType,selectedModelId,modalType,selectValue == "0"?[0,1,2,3,4]:[6,0,1,2,3])  
        }
      }
      handleHide();
    }
    else{
      Modal.info({
        title:"信息",
        content:"请选择要绑定的模式!"
      })
    }
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

  //选择要绑定的模式
  onSelectChange (key,row) {
    this.setState({
      selectedRowKey:key,
      selectedModelType:row[0].type,
      selectedModelId:row[0].id
    })
  }

  getModalView () {
    return(
      <Table
        pagination={false}
        bordered
        loading={false}
        scroll={{ y: 300 }}
        columns={[{
            title:'模式id',
            dataIndex: 'id',
            key: 'id',
            width:100
          }, 
          {
            title:'模式名称',
            dataIndex: 'name',
            key: 'name',
            width:250
          },
          {
            title:'模式类型',
            dataIndex: 'type',
            key: 'type',
            width:150,
            render:(text,record,index)=>{
              if (this.props.typeModeList.length !=0) {
                return this.props.typeModeList.map((item,i)=>{
                  if (record.type == i) {
                    return(
                      <div>
                        {item.name}
                      </div>
                    )
                  }
                })
              }else {
                switch (record.type) {
                  case 0:
                    return(
                      <div>
                      冷站
                      </div>
                    );
                    break;
                  case 1:
                    return(
                      <div>
                        热站
                      </div>
                    );
                    break;
                  case 2:
                    return(
                      <div>
                        BA末端
                      </div>
                    );
                    break;
                  case 3:
                    return(
                      <div>
                        照明
                      </div>
                    );
                    break;
                  case 4:
                    return(
                      <div>
                        自定义1
                      </div>
                    );
                    break;
                  case 5:
                    return(
                      <div>
                        自定义2
                      </div>
                    );
                    break;
                  case 6:
                    return(
                      <div>
                        自定义3
                      </div>
                    );
                    break;
                  case 7:
                    return(
                      <div>
                        自定义4
                      </div>
                    );
                    break;
                  case 8:
                    return(
                      <div>
                        自定义5
                      </div>
                    );
                    break;
                  case 9:
                    return(
                      <div>
                        自定义6
                      </div>
                    );
                    break;
                  case 10:
                    return(
                      <div>
                        自定义7
                      </div>
                    );
                    break;
                  case 11:
                    return(
                      <div>
                        自定义8
                      </div>
                    );
                    break;
                  case 12:
                    return(
                      <div>
                        自定义9
                      </div>
                    );
                    break;
                  case 13:
                    return(
                      <div>
                        自定义10
                      </div>
                    );
                    break;
                  case 14:
                    return(
                      <div>
                        自定义11
                      </div>
                    );
                    break;
                  case 15:
                    return(
                      <div>
                        自定义12
                      </div>
                    );
                    break;
                  case 16:
                    return(
                      <div>
                        自定义13
                      </div>
                    );
                    break;
                  case 17:
                    return(
                      <div>
                        自定义14
                      </div>
                    );
                    break;
                  case 18:
                    return(
                      <div>
                        自定义15
                      </div>
                    );
                    break;
                  case 19:
                    return(
                      <div>
                        自定义16
                      </div>
                    );
                    break;
                  case 20:
                    return(
                      <div>
                        自定义17
                      </div>
                    );
                    break;
                  case 21:
                    return(
                      <div>
                        自定义18
                      </div>
                    );
                    break;
                  case 22:
                    return(
                      <div>
                        自定义19
                      </div>
                    );
                    break;
                  case 23:
                    return(
                      <div>
                        自定义20
                      </div>
                    );
                    break;
                }
              }
            }
          },
          {
            title:'释义',
            dataIndex: 'description',
            key: 'description'
          }
        ]}
        dataSource={this.state.modalList} 
        size="small" 
        rowSelection={{
            type:'radio',
            selectedRowKeys : this.state.selectedRowKey,
            onChange : this.onSelectChange
        }}
      />
    )
  }

  getModelByType(type,nextData) {
    var btns = document.getElementsByClassName('bindBtnTypeCal');
    this.setState({
      selectedRowKey:[]
    })
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
    if(type===null) {
      if (nextData != undefined) {
        this.setState({modalList:nextData})
      }else{
        this.setState({modalList:this.props.modalList})
      }
    } else {
      let tempList=[]
      if (nextData != undefined) {
        nextData.map((item,index)=>{
          if(type===item.type) {
            tempList.push(item)
          }
        })
      }else{
        this.props.modalList.map((item,index)=>{
          if(type===item.type) {
            tempList.push(item)
          }
        })
      }
      this.setState({modalList:tempList})
    }
  }


  //模式按钮
  getModelBtns() {
    if (this.props.typeModeList.length !=0) {
      return this.props.typeModeList.map((item,index)=>{
        return (
          <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(index)}} style={btnStyle}>{item.name}</Button>
        )
      })
    }else {
        return (
          <span>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(0)}} style={btnStyle}>冷站</Button>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(1)}} style={btnStyle}>热站</Button>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(2)}} style={btnStyle}>BA末端</Button>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(3)}} style={btnStyle}>照明</Button>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(4)}} style={btnStyle}>自定义1</Button>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(5)}} style={btnStyle}>自定义2</Button>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(6)}} style={btnStyle}>自定义3</Button>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(7)}} style={btnStyle}>自定义4</Button>
            <Button className="bindBtnTypeCal" onClick={()=>{this.getModelByType(8)}} style={btnStyle}>自定义5</Button>
          </span>
        )
    }
  }

  handleChange = (value) => {
    this.setState({
      selectValue: value
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout1 = {
      labelCol: {
        span: 4,
        offset:1
      },
      wrapperCol: {
        span: 24
      },
    };

    const formItemLayout2 = {
      labelCol: {
        span: 4,
        offset:1
      },
      wrapperCol: {
        span: 10
      },
    };
    
    return (
      <Modal
        title="模式绑定"
        width={700}
        visible={this.props.visible}
        onCancel={this.props.handleHide}
        onOk={this.handleSubmit}
        maskClosable={false}
        wrapClassName={ModalStyle}
      > 
          {
            this.props.showModalType === 'workday'?
            <FormItem label="工作日定义" {...formItemLayout2} style={{float:"left"}}>
              <Select value={this.state.selectValue} style={{ width: 120,zIndex:1001 }} onChange={this.handleChange}>
                <Option value="0">周一至周五</Option>
                <Option value="1">周日至周四</Option>
              </Select>
            </FormItem>
            :
            ''
          }
           {
            this.props.showModalType === 'weekend'?
            <FormItem label="周末定义" {...formItemLayout2} style={{float:"left"}}>
              <Select value={this.state.selectValue} style={{ width: 120,zIndex:1001}} onChange={this.handleChange}>
                <Option value="0">周六、周日</Option>
                <Option value="1">周五、周六</Option>
              </Select>
            </FormItem>
            :
            ''
          }
          {
            this.props.showModalType === 'day' ?
            <FormItem label="绑定日期" {...formItemLayout2} style={{float:"right"}}>
              <Row>
                {this.props.selectedDate.format('YYYY-MM-DD')}
              </Row>
            </FormItem>
            :
            <FormItem label="绑定月份" {...formItemLayout2} style={{float:"right"}}>
              <Row>
                {this.props.selectedDate.format('YYYY-MM')}
              </Row>
            </FormItem>
          }
          <FormItem
            {...formItemLayout1}
            label="选择模式"
            hasFeedback
          >
            <div style={{marginBottom:'10px'}}>
              <Button id='btnAllType' className="bindBtnTypeCal" onClick={()=>{this.getModelByType(null)}} style={btnStyle}>全部类型</Button>
              {this.getModelBtns()}
            </div>
            <div style={{height:'400px'}} >
              {this.getModalView()}
            </div>
            
          </FormItem> 
      </Modal>
    );
  }
}
const WrappedConfigModal = Form.create()(ConfigModal);

export default WrappedConfigModal
