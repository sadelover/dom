import React, { Component } from 'react'
import {Table,Form, Select, DatePicker, Button, Switch, message,Input,Row,Col,Modal,Tag,Spin} from 'antd'
import  s from './FDDCommon.css'
import { modalTypes } from '../../../../common/enum';
import http from '../../../../common/http';
import moment from 'moment';
import WORD_DOWNLOAD_TEMPLATE from './downloadTemplates/word.html';
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';
import {downloadUrl} from '../../../../common/utils';

const registerInformation = {
    type : 'FDDCommon',
    name : '故障诊断组件',
    description : "",
}

const ouStyle = {backgroundColor:'#ccc'}
const defStyle = {backgroundColor:'#fff'}

var interval = 5000;
let user_info = localStorage.getItem('userInfo') ? 
                JSON.parse(localStorage.getItem('userInfo')) : {}
const FormItem = Form.Item;

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const TimeFormat = 'YYYY-MM-DD'

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';


class ConfigModal extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            loading:false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.disabledStartDate = this.disabledStartDate.bind(this);
        this.disabledEndDate = this.disabledEndDate.bind(this);
        this.handleOk = this.handleOk.bind(this)
    }

    handleSubmit(e) {
        e.preventDefault();
        let emailList =[]
        this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
            if (values.email != '') {
                if(new RegExp("^[A-Za-z0-9]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$","g").test(values.email)){
                    emailList.push(values.email)
                }else{
                    Modal.error({
                    title: '信息提示',
                    content: '邮箱输入有误',
                    });
                    return 
                }
            }
            this.handleOk(values,emailList);
            this.props.handleHide();
        }
        });
    }

    //将数据发给后台，获取生成word的地址及后台将邮件发给了邮箱
    handleOk (values,emailList) {
        this.props.handleLoading(true);

        let fddGroupList = this.props.fddGroupList
        http.post('/fdd/genServiceReport',{
            fddGroup:fddGroupList,
            QueryTimeFrom:moment(values.timeStart).format(TIME_FORMAT),
            QueryTimeTo:moment(values.timeEnd).format(TIME_FORMAT),
            emailNoticeList:emailList
        }).then(
                data=>{
                    if (data.err === 0) {
                        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.url}`)
                    }else{
                        message.error(data.msg,3)
                    }
                    this.props.handleLoading(false);
                }
            ).catch(
                ()=>{
                    message.error('请求诊断信息失败',3)
                    this.props.handleLoading(false);
                }
            )
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


    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                span: 6
            },
            wrapperCol: {
                span: 14
            },
        };
        
        return (       
            <Modal
                title="配置信息"
                width={400}
                visible={this.props.visible}
                onCancel={this.props.handleHide}
                onOk={this.handleSubmit}
                maskClosable={false}
            >
                <Form>
                <FormItem
                    {...formItemLayout}
                    label="开始时间"
                    hasFeedback
                >
                    {getFieldDecorator('timeStart', {
                    initialValue: moment().startOf('day'),
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
                    {...formItemLayout}
                    label="结束时间"
                    hasFeedback
                >
                    {getFieldDecorator('timeEnd', {
                    initialValue: moment(),
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
                    labelCol={{
                    span: 6
                    }}
                    wrapperCol={{
                    span: 8
                    }}
                    label="发送邮箱"
                >
                    {getFieldDecorator('email', {
                    })(
                    <Input style={{
                        width: '213px'
                        }}/>
                    )}
                </FormItem>
                </Form>
            </Modal>
        );
    }
}
const WrappedConfigModal = Form.create()(ConfigModal);


class FDDCommonComponent extends Widget {

    constructor(props){
        super(props)
        
        this.state = {
            style : {},
            //selectedEquip : 'all',
            groupNameArr:[],
            dataSource:[],
            selectedState: 'allState',
            fddAllData:[],
            fddNameList:[],
            loading:false,
            startTime:moment().startOf('day').format(TIME_FORMAT),
            flagTimeChange:false,
            visible:false,
            fddGroupList:[]
        }

        this.chart = null;
        this.container = null;

        //this.onOk = this.onOk.bind(this)
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        //this.getEquipList = this.getEquipList.bind(this)
        //this.handleSelectEquip = this.handleSelectEquip.bind(this)
        this.refresh = this.refresh.bind(this)
        this.handleSelectState = this.handleSelectState.bind(this)
        this.getFddNameList = this.getFddNameList.bind(this)
        this.getFdd = this.getFdd.bind(this)
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this)
        this.showModal = this.showModal.bind(this)
        this.handleHide = this.handleHide.bind(this)
        this.handleLoading = this.handleLoading.bind(this)
        this.handleChangeDate = this.handleChangeDate.bind(this)
        this.filterState = this.filterState.bind(this)
    }
    /* @override */
    static get type() {
      return registerInformation.type;
    }
    /* @override */
    static get registerInformation() {
      return registerInformation;
    }

    componentDidMount(){
        this.getFddNameList()
        
    }

    // shouldComponentUpdate (nextProps, nextState){
    //     if  (this.state.selectedState != nextState.selectedState) {
    //         return false   
    //     }
    //     if  (this.state.startTime != nextState.startTime) {
    //         return false         
    //     }
    //     return true
    // }


    handleStartTimeChange = (value) => {
      this.setState({
        startTime : value,
        flagTimeChange:true
      })
    }

    getFddNameList() {
        this.setState({
            loading:true
        })
        http.post('/fdditem/getAll',{
        }).then(
            data=>{
                if (data.err === 0) {
                    let fddNameArr = []
                    if (data.data.length>0) {
                        data.data.forEach((item,j)=>{
                            fddNameArr.push(item.name)
                        })
                    }
                    this.setState({
                        fddAllData:data.data,
                        fddNameList:fddNameArr
                    })
                    this.getFdd(fddNameArr)
                }else{
                    message.error(data.err,3)
                }
            }
        ).catch(
            ()=>{
                message.error('请求诊断信息失败',3)
            }
        )
    }

    //获取所有设备的诊断信息
    getFdd(fddGroup) {
        let reqFddGroup = {}
        reqFddGroup['groupName'] = ''
        reqFddGroup['fddList'] = fddGroup
        let list = []
        list.push(reqFddGroup)
        this.setState({
            fddGroupList:list
        })

        let start =moment(this.state.startTime).format(TIME_FORMAT)
        
        http.post('/fdditem/get_realtime_status',{
            fddGroup:list,
            QueryTimeFrom:start,
            QueryTimeTo:start
        }).then(
            data=>{
                if (data.err === 0) {
                    let fddResult = []
                    if (data.data.length != 0) {
                        fddResult=data.data[0].fddResult
                    }
                    this.setState({
                        fddData:data.data,  
                        loading:false,                      
                        //dataSource:fddResult,
                        flagTimeChange:false
                    },this.filterState(data.data))
                }else{
                    message.error(data.err,3)
                    this.setState({
                        loading:false,
                        flagTimeChange:false                                        
                    })
                }
            }
        ).catch(
            ()=>{
                message.error('请求诊断信息失败',3)
                this.setState({
                    loading:false,
                    flagTimeChange:false                                        
                })
            }
        )
    }



    //chart图
    saveChartRef(refEchart) {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }
    saveContainerRef(container) {
        this.container = container;
    }

    getChartOption(history) {
        let data = []
        data = history
        let time = []
       
        for (var i=1;i<97;i++){
            time.push(moment().startOf('day').add(15*i, 'm').format("HH:mm"))
        }
     

        return {
        title: {
            text: ''
        },
        tooltip : {
            trigger: 'axis'
        },
        grid: {
            
            containLabel: true,
            bottom: '0%',
            top: '0%',
            left: '0%',
            right: '0%'
        },
        xAxis : [
            {
            type : 'category',
            data : time
            }
        ],
        yAxis : [
            {
            type : 'value',
            show:false,
            name:"故障"
            }
        ],
        series: [{
            data: data,
            type: 'bar'
        }]
        };
    }

    getFDDContent() {
        var _this = this
        const dataSource = this.state.dataSource
       
        if (dataSource.length != 0) {
            return dataSource.map((row,j)=>{
                    return(
                        <div className={s['content-wrap']} key={j} style={j%2==0?ouStyle: defStyle}>
                            <div className={s['content-left']} key={j+row}>
                                <div><Tag color="#006600">故障名称</Tag><span>{row.ofEquipment}</span></div>
                                <div><Tag color="#006600">当前内容</Tag><span>{row.fddInfo.content}</span></div>
                                <div><Tag color="#006600">故障描述</Tag><span>{row.fddInfo.analysis}</span></div>
                                <div><Tag color="#006600">故障建议</Tag><span>{row.fddInfo.suggestion}</span></div>
                            </div>
                            <div className={s['content-right']}>
                                    <ReactEcharts
                                    style={{
                                        height: '100%'
                                    }}
                                    ref={_this.saveChartRef}
                                    option={_this.getChartOption(row.fddInfo.history)}
                                    theme="dark"
                                    notMerge={true}
                                />
                            </div>
                        </div>
                    )
                
            })
        }
      
    }

    // getEquipList() {
    //     //let arr = []
    //     if (this.props.fddData && this.props.fddData.length != 0) {
    //         return this.props.fddData.map((item,i)=>{
    //             //arr.push(item.groupName)
    //             return(
    //                 <Option value={item.groupName}>{item.groupName}</Option>
    //             )
    //         })
    //         // this.setState({
    //         //     groupNameArr:arr
    //         // })
    //     }
    // }

    // handleSelectEquip(value) {
    //     this.setState({
    //         selectedEquip:value
    //     })
    // }

    handleSelectState(value) {
        this.setState({
            selectedState:value
        })
    }

    refresh() {
        let data = this.state.fddData
        let nameList = this.state.fddNameList
        this.setState({
            loading:true
        })
        //如果时间被修改，需要先去请求数据，再筛选
        if (this.state.flagTimeChange) {
            this.getFdd(nameList)

        }else{
            this.filterState(data)
            
        }        
    }

    //按状态筛选
    filterState(data) {
        let result = []
        if (this.state.selectedState === 'allState') {
            data.forEach((item,i)=>{
                item.fddResult.forEach((row,j)=>{
                    result.push(row)
                })
            })
        }else{
            data.forEach((item,i)=>{
                item.fddResult.forEach((row,j)=>{
                    if (row.fddInfo.faultStatus === 1) {
                        result.push(row)                        
                    }
                })
            })
        }
        this.setState({
            dataSource:result,
            loading:false  
        })
    }

    handleHide () {
        this.setState({
            visible:false
        })
    }

    showModal () {
        this.setState({
            visible:true
        })
    }

    handleLoading (loading) {
        this.setState({
            loading:loading
        })
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
        }
        this.setState({
            startTime : s_time,
            flagTimeChange: true 
        });
    }
 
    

    getContent() {
        const {style} = this.props
        const {startTime} = this.state
        // const {
        //   fddData,selectName
        // } = this.props
        return (
            <div style={style} className={s['container']} >
                <div className={s['tittle']}>
                    <Row>
                        {/**{<Col span={4} >
                            设备：
                            <Select value={this.state.selectedEquip} style={{ width: 80 }} onChange={this.handleSelectEquip}>
                                <Option value="all">全部</Option>
                                {this.getEquipList()}
                            </Select>
                        </Col>}**/}
                        <Col span={4} >
                            状态：
                            <Select value={this.state.selectedState} style={{ width: 80 }} onChange={this.handleSelectState}>
                                <Option value="allState">全部</Option>
                                <Option value="errState">故障</Option>
                            </Select>
                        </Col>
                        <Col span={4} >
                            日期：
                            <DatePicker 
                                showTime 
                                placeholder="选择日期"
                                allowClear={false}
                                format={TimeFormat}
                                value={moment(startTime,TimeFormat)}
                                onChange={this.handleStartTimeChange}
                            />
                        </Col>
                        <Col span={2} >
                            <Button onClick={()=>{this.handleChangeDate(-1)}} >前一日</Button>
                        </Col>
                        <Col span={2} >
                            <Button onClick={()=>{this.handleChangeDate(0)}} >今天</Button>
                        </Col>
                        <Col span={2} >
                            <Button onClick={()=>{this.handleChangeDate(1)}} >后一日</Button>
                        </Col>
                        <Col span={2} >
                            <Button icon="search" type="primary" onClick={this.refresh}  >查询</Button>
                        </Col>
                        <Col span={2} >
                            <Button onClick={this.showModal}>生成维修单</Button>
                        </Col>         
                    </Row>    
                </div>
                <div className={s['wrap']}>
                    {    
                        this.state.loading ? 
                            <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                                <Spin tip="正在读取数据"/>
                            </div>
                        :
                        this.getFDDContent() 
                    
                    }
                </div>
                <WrappedConfigModal
                    visible={this.state.visible}
                    handleHide={this.handleHide}
                    fddGroupList={this.state.fddGroupList}
                    handleLoading={this.handleLoading}
                />
            </div>
        )
    }
}

export default FDDCommonComponent
