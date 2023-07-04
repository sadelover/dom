import React, { Component } from 'react'
import {Table,Form, Select, DatePicker, Button, Switch, message,Input,Row,Col,Modal,Tag} from 'antd'
import  s from './FDDTerminalView.css'
import { modalTypes } from '../../../../common/enum';
import http from '../../../../common/http';
import moment from 'moment';
import WORD_DOWNLOAD_TEMPLATE from './downloadTemplates/word.html';
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';
const registerInformation = {
    type : 'FDDTerminal',
    name : '末端空调箱故障诊断组件',
    description : "生成table组件，覆盖canvas对应区域",
}

var interval = 5000;
let user_info = localStorage.getItem('userInfo') ? 
                JSON.parse(localStorage.getItem('userInfo')) : {}
const FormItem = Form.Item;

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const TimeFormat = 'YYYY-MM-DD'

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';

class FDDTerminalView extends React.Component {

    constructor(props){
        super(props)
        
        this.state = {
            style : {},
            groupList:[],
            headerHeight :0,
            columns : [],
            dataSource:[],
            pointvalue:[],
            changeId:{},
            loadSideList:[],
            reportType: true, //0是传感器值，1是累计量值
            loading: false,
            pointObj:{},
            pointList:[],
            preColumns:[],
            fddGroup:[],
            fddData:[],
            selectName:"",
            isShowModal:false,
            headerList:[]
        }
        this.getPointList = this.getPointList.bind(this);
        this.initRenderTable = this.initRenderTable.bind(this);
        this.inputOnChange=this.inputOnChange.bind(this)
        this.getAHURealTime = this.getAHURealTime.bind(this)
        this.getFdd = this.getFdd.bind(this)
        this.showFddModal = this.showFddModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
        this.getGroupList = this.getGroupList.bind(this)
    }
    antdTableHearder = () => {
        // let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header'))
        let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header') || this.tableContainerRef.querySelector('.ant-table-thead'))
        let headerHeight = parseInt( catchedTableHeadStyle.height )
        this.setState({
            headerHeight : headerHeight
        })
    }

    //使表头居中
    initTitle(colName){
        return <span style={{display:'table',margin:'0 auto'}}>{colName}</span>
    }

    //设置表头列
    componentDidMount() {
        const {width,height,left,top} = this.props.style
        let header= ['区域','设备名称','故障状态','送风机开关状态','水阀开度','送风温度',"风机送风压力"]
        let headerJson= ['Position','Name','ErrCount','SupplyFanOnOff','WaterValveOpenRatio','AirTempSupply','FanSupplyPressure']    
        let headerWidth= {'Position':100,'Name':100,'ErrCount':200,'SupplyFanOnOff':100,'WaterValveOpenRatio':100,'AirTempSupply':100,'FanSupplyPressure':100}
        // 初始化
        let columns = []
        header.forEach((col,key)=>{
            if (col == "故障状态" || col == "送风机开关状态") {
                columns.push({
                    title:this.initTitle(col),//标题需要通过返回一个reactNode的方式进行设置
                    dataIndex:headerJson[key],
                    key : headerJson[key],
                    className:s['antdcolumn'],
                    align:"center",
                    width:headerWidth[headerJson[key]],
                    render:(text, record) => this.renderColumns(text, record,col)
                })
            }else{
                columns.push({
                    title:this.initTitle(col),
                    dataIndex:headerJson[key],
                    key : headerJson[key],
                    className:s['antdcolumn'],//设置body里面的列的样式
                    align:"center",
                    width:headerWidth[headerJson[key]],
                    render:(text, record) => {
                        return (text ? <span>{text}</span> : <span></span>);
                    }
                })
            }
        })
       
        this.setState({
            style : {
                width : width,
                height : height,
                left : left,
                top : top
            },
            loading:true,
            columns : columns,
            headerList:headerJson
        });
        //将查询函数放入store里，用来修改值后调用刷新表格
        this.getPointList()
    }
    //请求点位配置数据
    getPointList () {
        //加载中……
        let list = {}
        http.post('/project/getConfig', {
        }).then(     
            data=>{
                if (data.status) {
                    
                    // //筛选出自定义组件groupList中想要显示的设备数组
                    // groupList.map((row,index)=>{
                    //     list[row] = data.data.LoadSide[row]
                    // })
                    // console.log(list)
                    if (data.data.LoadSide) {
                        this.getGroupList(data.data.LoadSide)    
                        //获取到点位数据
                        this.setState({
                            loadSideList:data.data.LoadSide
                        })
                                              
                    }else {
                        Modal.error({
                            title : '错误提示',
                            content :"Factory的设备系统定义配置为定义LoadSide"
                        });
                    }
                }else {
                    Modal.error({
                        title : '错误提示',
                        content :"Factory中设备系统定义配置内容有误："+ data.msg
                    });
            
                }
            }    
        )
        
    }

    /**
     * 
     * 将LoadSide里AirConditionZoneList下的所有AHUList取出，存到数组groupList
     */
    getGroupList(data) {
        let list = []
        let fddGroup = []
        let pointList = []   //需要请求点值的点名（后面四个参数点名）
        if (data.length != 0) {
            data.map((item,i)=>{
                if (item.AirConditionZoneList.length != 0) {
                    item.AirConditionZoneList.map((row,j)=>{
                        let position = ''
                        if (row.zoneName) {
                            position = row.zoneName
                        }
                        if (row.AHUList.length != 0) {
                            row.AHUList.forEach((value,k)=>{
                                if (JSON.stringify(value) != "{}") {
                                    value['Position'] = position
                                    value['Name'] = value.name
                                    value['SupplyFanOnOff'] = value.Prefix+'SupplyFanOnOff'+value.EquipNo
                                    value['WaterValveOpenRatio'] = value.Prefix+'CoolingWaterValveOpenRatio'+value.EquipNo
                                    value['AirTempSupply'] = value.Prefix+'AirTempSupply'+value.EquipNo
                                    value['FanSupplyPressure'] = value.Prefix+'FanSupplyPressure'+value.EquipNo
                                    list.push(value)

                                    let groupName = ''
                                    let fddList = []
                                    groupName = value.name ? value.name: ''
                                    fddList = value.fddList ? value.fddList: []
                                    fddGroup.push({
                                        groupName,
                                        fddList
                                    })

                                    pointList.push(value['SupplyFanOnOff'],value['WaterValveOpenRatio'],value['AirTempSupply'],value['FanSupplyPressure'])
                                }
                            })
                        }
                    })
                }
            })
        }
        this.setState({
            groupList:list,
            fddGroup:fddGroup,
            pointList:pointList
        })
        this.getFdd(fddGroup,pointList,list)
        
    }


    /**
     * 用于在datasource中填充  查询到的点位实时数据
     * @param {datasource} 数据源数据 
     * @param {pointJson}  点位数据 
     */
    initRenderTable(columns,pointJson){
        const fddData = this.state.fddData
        

        columns.map((row,j)=>{
            if (pointJson[row.SupplyFanOnOff]) {
                row.SupplyFanOnOff = pointJson[row.SupplyFanOnOff]
            }else{
                row.SupplyFanOnOff = ''
            }
            if (pointJson[row.WaterValveOpenRatio]) {
                row.WaterValveOpenRatio = pointJson[row.WaterValveOpenRatio]
            }else{
                row.WaterValveOpenRatio = ''
            }
            if (pointJson[row.AirTempSupply]) {
                row.AirTempSupply = pointJson[row.AirTempSupply]
            }else{
                row.AirTempSupply = ''
            }
            if (pointJson[row.FanSupplyPressure]) {
                row.FanSupplyPressure = pointJson[row.FanSupplyPressure]
            }else{
                row.FanSupplyPressure = ''
            }
            fddData.forEach((item,i)=>{
                if (item.groupName === row.name) {
                    row['ErrCount'] = item.groupFddFaultCount
                }
            })
            
        })

        
        return columns;
    }

    //获取所有设备的诊断信息
    getFdd(fddGroup,pointList,list) {
        let start = moment().startOf('day').format(TIME_FORMAT)
        let end = moment().format(TIME_FORMAT)
        http.post('/fdditem/get_realtime_status',{
            fddGroup:fddGroup,
            QueryTimeFrom:start,
            QueryTimeTo:end
        }).then(
            data=>{
                if (data.err === 0) {
                    this.setState({
                        fddData:data.data
                    })

                }else{
                    message.error(data.err,3)
                }
                this.getAHURealTime(pointList,list)
            }
        ).catch(
            ()=>{
                message.error('请求诊断信息失败',3)
                this.getAHURealTime(pointList,list)
            }
        )
    }



    getAHURealTime(pointList,columns){   
         http.post('/get_realtimedata', {
            "proj":1,
            "pointList":pointList
        }).then(
            data=>{
                if (data.length === 0) {
                    // let arr = []
                    // for(let j=0;j<params.length;j++){
                    //     let aobj={'Position':'','Name':'','Enabled':'','Hour':'','Err':'',"Action":""}
                    //     if(j==0){
                    //         aobj=iobj
                    //     }
                    //     aobj.NameTxt=iobj.Name
                    //     aobj.Number=iobj.Number
                    //     aobj.Action=""
                    //     aobj["Param"]=params[j]
                    //     arr.push(aobj)
                    // }
                    // return arr
                }else{

                    let pointJson = {}
                    for(let i=0;i<data.length;i++){
                        let p=data[i]
                        pointJson[p.name]=p.value
                    }

                    this.setState({
                        pointObj:pointJson
                    })

                     //对为空的重要参数值  设置为点位值
                    let ds=this.initRenderTable(columns,pointJson)
                    this.setState({
                        dataSource:ds,
                        loading:false
                    })
                

                }
            }
        )
    }



    componentWillReceiveProps(nextProps){
        if(this.state.style.width !== nextProps.style.width || this.state.style.height !== nextProps.style.height ){
            const {width,height,left,top} = nextProps.style
            this.setState({
                style : {
                    width : width,
                    height : height,
                    left : left,
                    top : top
                }
            })
        }
        // // 判断两个数组内容是否相等
        // if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(nextProps.pointvalue)){
        //     this._renderTable(nextProps)
        // }
    }
    

    showFddModal(selectName) {
        this.setState({
            isShowModal:true,
            selectName:selectName
        })
    }

    hideModal() {
        this.setState({
            isShowModal:false
        })
    }
 
    //设定值onchange回调函数
    inputOnChange(e){
        let id=e.target.id;
        id=""+id
        let val=e.target.value;
        let json={};
        json[id]=val;
        this.setState({
            changeId:json
        })
    }


    // 渲染列
    renderColumns (text,record,column) {
        if(column=="故障状态"){
               
            let nameTxt=record.name;
            if (record.Name && record.ErrCount != '0' && record.ErrCount) {
                return (
                    <div className={s['inrow-div']}><Button className={s['inrow-btn']} type="danger" style={{ width:90,display:'inline-block'}} onClick={(e)=>{this.showFddModal(nameTxt)}} >{record.ErrCount}个故障</Button></div>
                )
            }else {
                return ""
            }     
            
        }
        if(column=="送风机开关状态"){
            if (record.SupplyFanOnOff) {
                if (record.SupplyFanOnOff === "0") {
                    return (
                        <Tag>停止中</Tag>
                    )
                }else{
                    return (
                        <Tag color="#87d068">运行中</Tag>
                    )
                } 
            }else {
                return ""
            }     
            
        }
        
    }

    /**
     * 保存启用禁用日志
     * @param {} description 
     */
    actionEnabledLog(description){
        http.post('/operationRecord/add', {
            "userName": user_info.name,
            "content": description,
            "address":''
        }).then(
            data=>{
               
            }
        )

    }

    /**
     * 保存参数值设定日志
     * @param {} idCom 
     * @param {*} text 
     * @param {*} value 
     * @param {*} setValue 
     */
    actionSetLog(idCom,text,value,setValue){
        http.post('/operationRecord/add', {
            "userName": user_info.name,
            "pointName":idCom,
            "pointDescription": text,
            "valueChangeFrom": value.toString(),
            "valueChangeTo": setValue.toString(),
            "address":localStorage.getItem('serverUrl'),
            "lang":"zh-cn"
        }).then(
            data=>{
               
            }
        )

    }


render() {
    const {style} = this.state
    const { form } = this.props;
    const { getFieldDecorator } = this.props.form;
        return (
            <div  
                className={s['table-container']} 
                style={Object.assign(style)} 
            >
                <div  
                    className={s['table']} 
                >
                    <Table
                        columns={this.state.columns}
                        dataSource={this.state.dataSource}
                        pagination={false}
                        bordered={true}
                        loading={this.state.loading}
                        scroll={{
                            y:this.state.style.height - this.state.headerHeight-80
                            //y:true
                        }}
                    />
                </div>
                    <FDDModal   
                        selectName={this.state.selectName}
                        fddData={this.state.fddData}
                        isShowModal={this.state.isShowModal}
                        hideModal={this.hideModal}
                    />
            </div>
        )
    }
}


const FDDTerminalViewModal = Form.create()(FDDTerminalView)



class FDDModal extends React.Component{
    constructor(props){
        super(props)
        this.state={
            selectedEquip : this.props.selectName ? this.props.selectName : '',
            groupNameArr:[],
            dataSource:[],
            selectedState: 'allState'
       
        }        

        this.chart = null;
        this.container = null;

        //this.onOk = this.onOk.bind(this)
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.hidePointModal = this.hidePointModal.bind(this)
        this.getEquipList = this.getEquipList.bind(this)
        this.handleSelectEquip = this.handleSelectEquip.bind(this)
        this.refresh = this.refresh.bind(this)
        this.handleSelectState = this.handleSelectState.bind(this)
    }

    componentDidMount(){
        let fddResult = []
        if (this.props.fddData && this.props.fddData.length != 0) {
            this.props.fddData.forEach((item,i)=>{
                if (item.groupName === this.props.selectName) {
                    fddResult = item.fddResult
                }
            })
        }
        this.setState({
            dataSource:fddResult
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isShowModal != nextProps.isShowModal) {
            let fddResult = []
            nextProps.fddData.forEach((item,i)=>{
                if (item.groupName === nextProps.selectName) {
                    fddResult = item.fddResult
                }
            })
            this.setState({
                dataSource:fddResult,
                selectedEquip:nextProps.selectName
            })
        } 
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

    hidePointModal() {
        this.props.hideModal()
    }

    getContent() {
        var _this = this
        const dataSource = this.state.dataSource
        if (dataSource.length != 0) {
            return dataSource.map((row,j)=>{
                return(
                    <div className={s['content-wrap']}>
                        <div className={s['content-left']}>
                            <p><Tag color="#006600">故障名称</Tag><span>{row.ofEquipment}</span></p>
                            <p><Tag color="#006600">当前内容</Tag><span>{row.fddInfo.content}</span></p>
                            <p><Tag color="#006600">故障描述</Tag><span>{row.fddInfo.analysis}</span></p>
                            <p><Tag color="#006600">故障建议</Tag><span>{row.fddInfo.suggestion}</span></p>
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

    getEquipList() {
        //let arr = []
        if (this.props.fddData && this.props.fddData.length != 0) {
            return this.props.fddData.map((item,i)=>{
                //arr.push(item.groupName)
                return(
                    <Option value={item.groupName}>{item.groupName}</Option>
                )
            })
            // this.setState({
            //     groupNameArr:arr
            // })
        }
    }

    handleSelectEquip(value) {
        this.setState({
            selectedEquip:value
        })
    }

    handleSelectState(value) {
        this.setState({
            selectedState:value
        })
    }

    refresh() {
        let result = []
        const data = this.props.fddData
        if (this.state.selectedEquip === "all") {
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
                dataSource:result
            })
        }else {
            if (this.state.selectedState === 'allState') {
                data.forEach((item,i)=>{
                    if(item.groupName === this.state.selectedEquip) {
                        item.fddResult.forEach((row,j)=>{
                            result.push(row)
                        })
                    }
                })
            }else {
                data.forEach((item,i)=>{
                    if(item.groupName === this.state.selectedEquip) {
                        item.fddResult.forEach((row,j)=>{
                            if (row.fddInfo.faultStatus === 1) {
                                result.push(row)                              
                            }
                        })
                    }
                })
            }
           
            this.setState({
                dataSource:result
            })
        }
    }

 
    render(){
        const {
          isShowModal,fddData,selectName
        } = this.props
        return (
            <Modal
                title="诊断信息"
                visible={isShowModal}
                onCancel={this.hidePointModal}
                width={1200}
                footer={null}
                maskClosable={false}
            > 
                
                <div className={s['tittle']}>
                    <Row>
                        <Col span={4} >
                            设备：
                            <Select value={this.state.selectedEquip} style={{ width: 80 }} onChange={this.handleSelectEquip}>
                                <Option value="all">全部</Option>
                                {this.getEquipList()}
                            </Select>
                        </Col>
                        <Col span={4} >
                            状态：
                            <Select value={this.state.selectedState} style={{ width: 80 }} onChange={this.handleSelectState}>
                                <Option value="allState">全部</Option>
                                <Option value="errState">故障</Option>
                            </Select>
                        </Col>
                        {/*<Col span={2} >
                            <Button icon="search" type="primary" onClick={()=>{this.handleOk()}}  >查询</Button>
                        </Col>
                        <Col span={2} >
                            <Button onClick={()=>{this.handleChangeDate(-1)}} >前一日</Button>
                        </Col>
                        <Col span={2} >
                            <Button onClick={()=>{this.handleChangeDate(0)}} >今天</Button>
                        </Col>
                        <Col span={2} >
                            <Button onClick={()=>{this.handleChangeDate(1)}} >后一日</Button>
                        </Col>*/}
                        <Col span={2} >
                            <Button  type="primary" onClick={this.refresh} >刷新</Button>
                        </Col>
                        <Col span={2} >
                            <Button>生成维修单</Button>
                        </Col>         
                    </Row>    
                </div>
                <div className={s['wrap']}>
                    { this.getContent() }
                </div>
            </Modal>
        )
    }
}



class FDDTerminalComponent extends Widget{

    constructor(props){
        super(props)
        
        this.state = {
            style : {}
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
    
    getContent() {
        const {style} = this.state
        return (
            <FDDTerminalViewModal {...this.props} />
        )
    }
}

export default FDDTerminalComponent




