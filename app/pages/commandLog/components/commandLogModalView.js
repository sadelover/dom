import React, { PropTypes } from 'react';
import { Button, Modal, DatePicker, Icon, Table } from 'antd';
import moment from 'moment';
import http from '../../../common/http';

//
const FORMAT_START = 'YYYY-MM-DD 00:00:00'
const FORMAT_END = 'YYYY-MM-DD 23:59:59'
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const { RangePicker } = DatePicker;

//css  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const btnStyle = {
  display: 'inline-block',
  marginRight: '20px'
}

const hearder = {
  marginBottom: '10px',
  marginTop: '-10px'
}

//table  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const columns = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width:130
  },
  {
    title: '指令来源',
    dataIndex: 'logicName',
    key: 'logicName',
    width:300
  },
  {
    title: '点名',
    dataIndex: 'pointName',
    key: 'pointName',
    width:249
  },
  {
    title: '点值',
    dataIndex: 'value',
    key: 'value',
    width:110
  }
];

class commandLog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            startTime: '',
            endTime: '',
            loading:false,
            current: 1
        };
    }  
     
    componentWillReceiveProps(nextProps){
      if(nextProps.commandLogVisible != this.props.commandLogVisible && nextProps.commandLogVisible == true){
        this.defaultTimeOfHour(nextProps.commandLogPoint)
      }
    }

    shouldComponentUpdate(nextProps,nextState){
      if(nextProps.commandLogVisible != this.props.commandLogVisible){
        return true
      }
      if(JSON.stringify(this.state.data) != JSON.stringify(nextState.data)){
        return true
      }
      if(this.state.startTime != nextState.startTime){
        return true
      }
      if(this.state.endTime != nextState.endTime){
        return true
      }
      if(this.state.loading != nextState.loading){
        return true
      }
      if(this.state.current != nextState.current){
        return true
      }
      return false
    }

    //默认一小时
    defaultTimeOfHour = (pointName) => {
        let startTime = moment().add(-1, 'hours').format(dateFormat)
        let endTime = moment().format(dateFormat)
        if(moment(endTime).format('YYYY-MM-DD') != moment(startTime).format('YYYY-MM-DD')){
          startTime = moment().format(FORMAT_START)
        }
        this.setState({
            startTime: startTime,
            endTime: endTime,
        })
        this.search(pointName,startTime,endTime,'commandHour')
    }
   
    timeOfHour = () => {
        let startTime = moment().add(-1, 'hours').format(dateFormat)
        let endTime = moment().format(dateFormat)
        if(moment(endTime).format('YYYY-MM-DD') != moment(startTime).format('YYYY-MM-DD')){
          startTime = moment().format(FORMAT_START)
        }
        this.setState({
            startTime: startTime,
            endTime: endTime,
        })
        this.search(this.props.commandLogPoint,startTime,endTime,'commandHour')
    }
    
    timeOfToday = () => {
        let startTime = moment().format(FORMAT_START)
        let endTime = moment().format(FORMAT_END)
        this.setState({
            startTime: startTime,
            endTime: endTime,
        })
        this.search(this.props.commandLogPoint,startTime,endTime,'commandToday')
    }

    selectBtnBg = (id) => {
        let idList = ['commandHour','commandToday','commandOther']
        idList.map(item=>{
            if(item == id){
                document.getElementById(item).style.backgroundColor = 'rgb(0,145,255)'
            }else{
                document.getElementById(item).style.backgroundColor = ''
            }
        })
    }

    search = (pointName,startTime,endTime,id) => {
        this.setState({
            loading: true,
            current: 1
        })
        http.post('/operation/logicRecordOutput',{  
            "pointName":pointName,
            "timeFrom":startTime,
            "timeTo":endTime
        }).then(res=>{
            this.selectBtnBg(id)  
            if(res.err == 0){ 
                this.setState({  
                    data: res.data.reverse(),
                    loading: false 
                })
            }else{
                this.setState({ 
                    data: [],
                    loading: false
                })
            }  
        }).catch(err=>{
            this.setState({
            data: [],
            loading: false
            })
        })
    }

    onChange = (date,dateStrings) => { 
        let startTime = moment(date).format(FORMAT_START)
        let endTime = moment(date).format(FORMAT_END)
        this.setState({
            startTime: startTime,
            endTime: endTime,
        })
    }

    tableChange = (pagination) => {
        this.setState({
            current:pagination.current
        })
    }

    showOtherDay = () => {
        let startTime = moment(this.state.startTime).format(FORMAT_START)
        let endTime = moment(this.state.startTime).format(FORMAT_END)
        this.setState({
            startTime: startTime,
            endTime: endTime,
        })
        Modal.confirm({
            title: '指定日期查询',
            content:(
                <div style={{marginTop:25}}>
                    日期选择：<DatePicker onChange={this.onChange} style={{width:150}} defaultValue={moment(this.state.startTime, 'YYYY-MM-DD')} format={'YYYY-MM-DD'} />
                </div>
            ),
            icon:(
                <Icon type="security-scan" theme="twoTone" />
            ),
            zIndex:1010,
            onOk: ()=>{
                this.search(this.props.commandLogPoint,this.state.startTime,this.state.endTime,'commandOther')
            }
        })
    }

    render() {
      return (
          <Modal
            title="指令记录查询"
            footer = {null}
            visible={this.props.commandLogVisible}
            onCancel={this.props.handleCancel}
            width={1000}
            maskClosable={false}
            zIndex={1009}
          >
            <div style={{height:540}}>
                <div style={hearder}>
                    <Button disabled={this.state.loading} style={btnStyle} id='commandHour' onClick={this.timeOfHour}>近一小时(仅今天)</Button>
                    <Button disabled={this.state.loading} style={btnStyle} id='commandToday' onClick={this.timeOfToday}>今天</Button>
                    <Button disabled={this.state.loading} style={btnStyle} id='commandOther' onClick={this.showOtherDay}>指定日期查询</Button>
                </div>
                <Table 
                    dataSource={this.state.data} 
                    onChange={this.tableChange} 
                    scroll={{y:400}} 
                    pagination={{
                        current:this.state.current,
                        pageSize: 50
                    }} 
                    columns={columns} 
                    loading={this.state.loading} 
                />
            </div>
           
          </Modal>
      )
    }
}

export default commandLog