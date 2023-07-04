import React, { Component } from 'react'
import Widget from './Widget.js'
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import ModelText from '../core/entities/modelText.js';
import s from './EquipmentTableView.css';
import { Tag, Form, Button, Tabs, message, Select, Input, Layout, Table, DatePicker, Modal, InputNumber } from 'antd';
import moment from 'moment'
import { downloadUrl } from '../../../../common/utils';
import EnergyBoardComponent from './EnergyBoard.js';

const { Header, Footer, Sider, Content } = Layout;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const TIME_FORMAT = 'YYYY-MM-DD';

const formItemLayout = {
    labelCol: {
        xs: { span: 8 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
    },
}
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type: 'StandardEnergyManage',
    name: '标准能源管理组件',
    description: "生成标准能源管理组件",
}

class FormWrap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            columns: [],
            columnsReport:[],
            dataSourceReport:[],
            dataSource: [],
            dataSourceBySys:[],
            pointList: [],
            indexId: 0,
            loading: false,
            SwitchVisiable: false,
            pointName: '',
            pointValue: '',
            equipmentName: '',
            setValueModalVisible: false,
            title: '',
            currentValue: '',
            setActiveKey:"1",
            buildingArr:[],
            buildingPointArr:[],
            systemArr:[],
            systemPointArr:[],
            classifyValue:'distributionGroupList',
            subValue:"all",
            timeFrom:moment().add(-15,"days") < moment(this.props.config.dataStartDate) ? moment(this.props.config.dataStartDate) :moment().add(-15,"days"),
            timeTo:moment(),
            systemPointNameArr:[],
            buildingPointNameArr:[],
            loadingReport:false,
            defaultTimeStart:""
        }
        this.renderLeftList = this.renderLeftList.bind(this)
        this.selectList = this.selectList.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.renderDataSource = this.renderDataSource.bind(this)
        this.renderDataSourceBySys = this.renderDataSourceBySys.bind(this)
        this.ButtonChange = this.ButtonChange.bind(this)
        this.ButtonCancel = this.ButtonCancel.bind(this)
        this.setValueCancel = this.setValueCancel.bind(this)
        this.renderLoading = this.renderLoading.bind(this)
        this.callback = this.callback.bind(this);
        this.selectListBySys = this.selectListBySys.bind(this);
        this.Options = this.Options.bind(this);
        this.getSubentry = this.getSubentry.bind(this);
        this.onChangeClassify = this.onChangeClassify.bind(this);
        this.onChangeSub = this.onChangeSub.bind(this);
        this.renderReportTable = this.renderReportTable.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getColumns = this.getColumns.bind(this);
        this.handleDownLoad = this.handleDownLoad.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.disabledDate = this.disabledDate.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.custom_realtime_data.length != nextProps.custom_realtime_data.length) {
            this.setState({
                pointList: nextProps.custom_realtime_data
            })
            if (this.props.config.distributionGroupList && this.props.config.distributionGroupList != undefined) {
                this.renderDataSource(this.state.indexId, nextProps.custom_realtime_data)
            } else if (this.props.config.systemGroupList && this.props.config.systemGroupList != undefined) {
                this.renderDataSourceBySys(this.state.indexId, nextProps.custom_realtime_data)
            }
        } else {
            if (this.state.pointList && this.state.pointList.length == 0) {
                this.setState({
                    pointList: nextProps.custom_realtime_data
                })
                if (this.props.config.distributionGroupList && this.props.config.distributionGroupList != undefined) {
                    this.renderDataSource(this.state.indexId, nextProps.custom_realtime_data)
                } else if (this.props.config.systemGroupList && this.props.config.systemGroupList != undefined) {
                    this.renderDataSourceBySys(this.state.indexId, nextProps.custom_realtime_data)
                }
            } else {
                this.props.custom_realtime_data.map((item, index) => {
                    nextProps.custom_realtime_data.map((nextItem, nextIndex) => {
                        if (item['name'] == nextItem['name']) {
                            if (item['value'] != nextItem['value']) {
                                this.setState({
                                    pointList: nextProps.custom_realtime_data
                                })
                                if (this.props.config.distributionGroupList && this.props.config.distributionGroupList != undefined) {
                                    this.renderDataSource(this.state.indexId, nextProps.custom_realtime_data)
                                } else if (this.props.config.systemGroupList && this.props.config.systemGroupList != undefined) {
                                    this.renderDataSourceBySys(this.state.indexId, nextProps.custom_realtime_data)
                                }
                            }
                        }
                    })
                })
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state != nextState) {
            return true
        }
        return false
    }

    componentDidMount() {
        this.renderHeader()
        let columnsReport = [{
            title:"时间",
            dataIndex:"time",
            key : "time",
            width: 100
        }]
        let buildingArr = []  //[“B栋”，“C栋”]
        let buildingPointArr = []  //[“buildingB”，“buildingC”]
        let buildingPointNameArr = []  // ["ThisDaybuildingBGroupPowerTotal","ThisDaybuildingCGroupPowerTotal"]
        // let buildingChildPointNameArr = []  // ["ThisDayB_2F_02_PowerTotal01","ThisDayB_2F_02_PowerTotal02"]
        let systemArr = []
        let systemPointArr = []
        let systemPointNameArr = [] //["End","Hot"]
        let newArr2 = this.props.config.systemGroupList != undefined ? this.props.config.systemGroupList.children :undefined
        let newArr = this.props.config.distributionGroupList.children
        if (newArr !== undefined) {
            this.renderLeftList(newArr)
            // document.getElementById('SelectByArea').childNodes[0].style.backgroundColor = '#2ea2f8'
            newArr.map(item=>{
                buildingArr.push(item.name);
                buildingPointArr.push(item.pointPrefix);
                buildingPointNameArr.push("ThisDay"+`${item['pointPrefix']}`+"GroupPowerTotal");
            })
            buildingPointNameArr.push("ThisDay"+`${this.props.config.distributionGroupList.pointPrefix}`+"GroupPowerTotal");
        }
        if (newArr2 !== undefined) {
            newArr2.map(item=>{
                systemArr.push(item.system);
                systemPointArr.push(item.pointPrefix);
                systemPointNameArr.push("ThisDay"+`${item['pointPrefix']}`+"GroupPowerTotal");
            })
            systemPointNameArr.push("ThisDay"+`${this.props.config.systemGroupList.pointPrefix}`+"GroupPowerTotal");
        }
        buildingArr.forEach((col,key)=>{
            columnsReport.push({
                title:col,
                dataIndex:buildingPointNameArr[key],
                key:key,
                width:100
            })
        })

        columnsReport.push({
            title:"全部",
            dataIndex:"ThisDay"+`${this.props.config.distributionGroupList.pointPrefix}`+"GroupPowerTotal",
            key:this.state.buildingArr.length,
            width:100
        })

        this.getHistoryData(buildingPointNameArr)

        let start  = ""
        if (moment().add(-15,"days") < moment(this.props.config.dataStartDate)) {
            start = moment(this.props.config.dataStartDate).format('YYYY-MM-DD')
        }else {
            start = moment().add(-15,"days").format('YYYY-MM-DD')
        }

        this.setState({
            buildingArr:buildingArr,
            buildingPointArr:buildingPointArr,
            systemArr:systemArr,
            systemPointArr:systemPointArr,
            buildingPointNameArr:buildingPointNameArr,
            systemPointNameArr:systemPointNameArr,
            columnsReport:columnsReport,
            defaultTimeStart:start,
            timeFrom:start
        });
    }

    getColumns (values) {
        let columnsReport = [{
            title:"时间",
            dataIndex:"time",
            key : "time",
            width: 100
        }]

        if (values.classify == "distributionGroupList") {
            if (values.subentry != "all") {
                let points = []
                let cols = []
                this.props.config.distributionGroupList.children.forEach(item=>{
                    if (item.pointPrefix == values.subentry) {
                        item.children.forEach((equip)=>{
                            points.push("ThisDay"+`${equip['pointPrefix']}`+"PowerTotal"+`${equip['no']}`)
                            cols.push(equip['name'])
                        })
                        points.push("ThisDay"+`${item.pointPrefix}`+"GroupPowerTotal")
                        cols.push(item['name'])
                    }
                })
                if (cols.length !=0) {
                    cols.forEach((col,key)=>{
                        columnsReport.push({
                            title:col,
                            dataIndex:points[key],
                            key:key,
                            width:100
                        })
                    })
                }
                this.getHistoryData(
                    points,
                    values.range[0].format(TIME_FORMAT),
                    values.range[1].format(TIME_FORMAT),
                    values.timeFormat
                );
            }else {
                //”全部“
                this.state.buildingArr.forEach((col,key)=>{
                    columnsReport.push({
                        title:col,
                        dataIndex:this.state.buildingPointNameArr[key],
                        key:key,
                        width:100
                    })
                })

                columnsReport.push({
                    title:"全部",
                    dataIndex:"ThisDay"+`${this.props.config.distributionGroupList.pointPrefix}`+"GroupPowerTotal",
                    key:this.state.buildingArr.length,
                    width:100
                })
            
                this.getHistoryData(
                    this.state.buildingPointNameArr,
                    values.range[0].format(TIME_FORMAT),
                    values.range[1].format(TIME_FORMAT),
                    values.timeFormat
                );
            }
            
        }else {
            if (values.subentry != "all") {
                let points = []
                let cols = []
                
                this.props.config.systemGroupList.children.forEach(item=>{
                    if (item.pointPrefix == values.subentry) {
                        points.push("ThisDay"+`${item.pointPrefix}`+"GroupPowerTotal")
                        cols.push(item['system'])
                        item.children.forEach((sys)=>{
                            points.push("ThisDay"+`${sys['pointPrefix']}`+"PowerTotal"+`${sys['no']}`)
                            cols.push(sys['name'])
                        })
                    }
                })
                if (cols.length !=0) {
                    cols.forEach((col,key)=>{
                        columnsReport.push({
                            title:col,
                            dataIndex:points[key],
                            key:key,
                            width:100
                        })
                    })
                }
                this.getHistoryData(
                    points,
                    values.range[0].format(TIME_FORMAT),
                    values.range[1].format(TIME_FORMAT),
                    values.timeFormat
                );
            }else {
                //”全部“
                this.state.systemArr.forEach((col,key)=>{
                    columnsReport.push({
                        title:col,
                        dataIndex:this.state.systemPointNameArr[key],
                        key:key,
                        width:100
                    })
                })

                columnsReport.push({
                    title:"全部",
                    dataIndex:"ThisDay"+`${this.props.config.systemGroupList.pointPrefix}`+"GroupPowerTotal",
                    key:this.state.systemArr.length,
                    width:100
                })

                this.getHistoryData(
                    this.state.systemPointNameArr,
                    values.range[0].format(TIME_FORMAT),
                    values.range[1].format(TIME_FORMAT),
                    values.timeFormat
                );
            }
         
        }
        this.setState({
            columnsReport:columnsReport
        })
        
    }

    handleDownLoad () {
        let  pointList = []
        let  header = []
        let  reportName = '能耗报表'
        let  columnsReport = this.state.columnsReport
        let  strStartTime = this.state.timeFrom
        let  strEndTime =  this.state.timeTo
        let  timeData = []
        let  data =  this.state.dataSourceReport
        header = columnsReport.map( (item,row)=>{
            pointList.push(item.dataIndex)
            return item.title
        })
        data.forEach((obj,o)=>{
            timeData.push(obj.time)
        })

        let headerList = header.slice(1)
        let pointListArr = pointList.slice(1)
        http.post('/reportTool/genExcelReportByTableData', {
            reportName: reportName,
            strStartTime: strStartTime,
            strEndTime: strEndTime,
            headerList: headerList,　 //表头用的点名
            tableDataList:data,
            timeList:timeData,
            pointList:pointListArr
        }).then(
            data=>{
                if (data.err === 0) {
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                }
                if (status === false) {
                    message.error('生成下载文件失败')
                }
            }
        )
    }

    //将时间选择器，将组件配置中的dataStartDate（开始日期）之前的禁用，今天之后的日期禁用
    disabledDate(current) {
        // return current && current < moment().endOf('day');
        if (this.props.config.dataStartDate != undefined) {
            return current.valueOf() < moment(this.props.config.dataStartDate)

        }
    }

    getHistoryData(pointsList,timeStart,timeEnd,span) {
        this.setState({loadingReport: true});
        http.post('/get_history_data_padded', {
            pointList: pointsList,
            timeStart: timeStart == undefined ? moment(this.state.timeFrom).add(1,"days").format("YYYY-MM-DD 00:00:00") : moment(timeStart).add(1,"days").format("YYYY-MM-DD 00:00:00") ,
            timeEnd: timeEnd == undefined ? moment(this.state.timeTo).add(1,"days").format("YYYY-MM-DD 00:00:00"):moment(timeEnd).add(1,"days").format("YYYY-MM-DD 00:00:00"),
            timeFormat: span == undefined ? "d1" :span
            }).then(
                data=>{
                    if (data.error) {
                        message.error(data.msg);
                        this.setState({loadingReport: false});
                    }else {
                        if (data.time.length != 0) {
                            this.renderReportTable(data,pointsList)
                        }else {
                            let dataSource = []
                            this.setState({
                                dataSourceReport: dataSource,
                                loadingReport: false
                            })
                        }
                    }    
                }
            ).catch(
                error =>{
                    message.error('网络通讯失败！');
                    let dataSource = []
                    this.setState({
                        dataSourceReport: dataSource,
                        loadingReport: false
                    })
                }
            )
    }

    renderReportTable(data,pointList) {
        let bodyArr = []  //存储循环出来的dataSource
        //默认不保留小数点
        let decimal = 0
        let timeArr = []
        for (var i=0; i< data.time.length; i++) {
            let line = {}
          
            line['key'] = i;
            pointList.forEach( (pitem,j)=>{
                if (data.map[pitem][i] === undefined) {
                    line[pitem] = '--'
                }else {
                    line[pitem] = parseFloat(data.map[pitem][i].toFixed(decimal))                     
                }
            })
            line["time"]  = moment(data.time[i]).add(-1,"days").format("YYYY-MM-DD") ;  //返回的零点时间，需要减一天，展示前一天的用电量
           
            timeArr.push(moment(data.time[i]).format("YYYY-MM-DD"))
            
            
            // switch(this.state.timeFormat) {
            //     case 'm1':
            //     line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm") 
            //     break;
            //     case 'm5':
            //     line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm") 
            //     break;
            //     case 'h1':
            //     line["时间"]  = moment(data.time[i]).format("YYYY-MM-DD HH") ;
            //     break;
            //     case 'd1':
            //     line["时间"]  = moment(data.time[i]).format("YYYY-MM-DD") ;
            //     break;
            //     case 'M1':
            //     line["时间"]  = moment(data.time[i]).format("YYYY-MM-DD") ;
            //     break;
            // }
            bodyArr.push(line);
        }
        if(moment(this.state.timeTo).format("YYYY-MM-DD") >= moment().format("YYYY-MM-DD")) {
            let obj ={}
            obj["time"]  = moment().format("YYYY-MM-DD") ; 
            pointList.forEach( (pitem,j)=>{
                obj[pitem] = "--"
            })
            bodyArr.push(obj)
        }

        this.setState({
            dataSourceReport: bodyArr,
            loadingReport: false,
            time:timeArr
        })
    }

    renderDataSource(indexId, data) {
        this.setState({
            loading: true
        })
        let pointList = data ? data : this.state.pointList
        let newArr = this.props.config.distributionGroupList.children
        let Properties = this.props.config.Properties
        let bodyArr = []  //存储循环出来的dataSource
        newArr[indexId].children.map((itemA, indexA) => {
            let obj = {}
            obj['id'] = indexA + 1
            obj['EquipName'] = itemA.name
            obj['gatewayId'] = itemA.gatewayId
            obj['meterId'] = itemA.meterId

             //网关心跳点
             let gatewayUpdateName = ""
             if (itemA.gatewayId != undefined) {
                //冒号替换下划线
                let geteway1 = itemA.gatewayId.replace(new RegExp(/\:/g), '_')
                //IP里的点替换下划线
                let geteway = geteway1.replace(new RegExp(/\./g), '_')
                gatewayUpdateName = `${geteway}`+"_heart_beat_time"
            }
            //仪表心跳点
            let meterUpdateName = ""
            if (itemA.gatewayId != undefined && itemA.meterId != undefined) {
                //冒号替换下划线
                let geteway1 = itemA.gatewayId.replace(new RegExp(/\:/g), '_')
                //IP里的点替换下划线
                let geteway = geteway1.replace(new RegExp(/\./g), '_')
                meterUpdateName =`${geteway}`+"_"+`${itemA.meterId}`+"_heart_beat_time"
            }

          
            // obj['meterUpdate'] = meterUpdate

            let gatewayUpdate = ""
            let meterUpdate = ""

            Properties.map((itemB, indexB) => {
                obj[`${itemB['Point']}Name`] = `${itemA['pointPrefix']}${itemB['Point']}${itemA['no']}`
                pointList.map((itemC, indexC) => {
                    if (itemC['name'] == `${itemA['pointPrefix']}${itemB['Point']}${itemA['no']}`) {
                        obj[itemB['Point']] = itemC['value']
                    }
                    if (itemC['name'] == `${itemA['pointPrefix']}`+"CT"+`${itemA['no']}`) {
                        obj['CT'] = `${(Number(itemC['value'])*5)}`+"/5" 
                    }
                    if (gatewayUpdateName == itemC['name']) {
                        if (itemC['value'] != "0") {                        
                            gatewayUpdate = moment(itemC['value']).fromNow()
                            // console.log(gatewayUpdate)
                            obj['gatewayUpdate'] = gatewayUpdate
                        }else {
                            obj['gatewayUpdate'] = "--"
                        }
                    }
                    if (meterUpdateName == itemC['name']) {
                        if (itemC['value'] != "0") {
                            meterUpdate = moment(itemC['value']).fromNow()
                            // console.log(meterUpdate)
                            obj['meterUpdate'] = meterUpdate
                        }else {
                            obj['meterUpdate'] = "--"
                        }
                    }
                })
            })

            bodyArr.push(obj)
        })
        this.setState({
            dataSource: bodyArr,
            loading: false
        })
    }

    renderDataSourceBySys(indexId, data) {
        this.setState({
            loading: true
        })
        let pointList = data ? data : this.state.pointList
        let newArr = this.props.config.systemGroupList.children
        let Properties = this.props.config.Properties
        let bodyArr = []  //存储循环出来的dataSource
        newArr[indexId].children.map((itemA, indexA) => {
            let obj = {}
            obj['id'] = indexA + 1
            obj['EquipName'] = itemA.name
            Properties.map((itemB, indexB) => {
                obj[`${itemB['Point']}Name`] = `${itemA['pointPrefix']}${itemB['Point']}${itemA['no']}`
                pointList.map((itemC, indexC) => {
                    if (itemC['name'] == `${itemA['pointPrefix']}${itemB['Point']}${itemA['no']}`) {
                        obj[itemB['Point']] = itemC['value']
                    }
                })
            })
            bodyArr.push(obj)
        })
        this.setState({
            dataSourceBySys: bodyArr,
            loading: false
        })
    }

    renderHeader() {
        let columns = [
            {
                title: '编号',
                dataIndex: 'id',
                key: 'id',
                sorter: (c, d) => c.id - d.id,
            }, 
            {
                title: '设备名称',
                dataIndex: 'EquipName',
                key: 'EquipName',
            }
            , 
            {
                title: '网关编号',
                dataIndex: 'gatewayId',
                key: 'gatewayId',
            },
            {
                title: '网关更新',
                dataIndex: 'gatewayUpdate',
                key: 'gatewayUpdate',
                render: (text) => {
                    if (text != undefined) {
                        if (text.indexOf("天") != -1 || text.indexOf("月") != -1 || text.indexOf("年") != -1) {
                            return <div style={{ color:'red' }} >{text}</div>
                        }else{
                            return <div style={{ color:'#fff' }}>{text}</div>
                        }
                    }
                }
            }
            , 
            {
                title: '仪表站号',
                dataIndex: 'meterId',
                key: 'meterId',
            }
            , 
            {
                title: '仪表更新',
                dataIndex: 'meterUpdate',
                key: 'meterUpdate',
                render: (text) => {
                    if (text != undefined) {
                        if (text.indexOf("天") != -1 || text.indexOf("月") != -1 || text.indexOf("年") != -1) {
                            return <div style={{ color:'red' }} >{text}</div>
                        }else{
                            return <div style={{ color:'#fff' }}>{text}</div>
                        }
                    }
                }
            }
            , 
            {
                title: '电流变比',
                dataIndex: 'CT',
                key: 'CT',
            }
        ]
        let Properties = this.props.config.Properties
        Properties.map((item, index) => {
            if (item.ElementType && item.ElementType == "enum") {
                columns.push({
                    title: item.title,
                    dataIndex: item.Point,
                    key: item.Point,
                    render: (text, record) => {
                        for (let i in item.ElementProperty) {
                            if (i == text) {
                                return <div style={{ cursor: 'pointer', marginLeft: 5 }} onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)}>{item.ElementProperty[i]}</div>
                            }
                        }
                        return <div style={{ cursor: 'pointer', marginLeft: 5 }} onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)}>未知</div>
                    }
                })
            } else if (item.ElementType && item.ElementType == "edit") {
                if (item.Writable && item.Writable == 1) {
                    columns.push({
                        title: item.title,
                        dataIndex: item.Point,
                        key: item.Point,
                        render: (text, record) => {
                            return <div>
                                <Input style={{ width: "50px" }} value={parseInt(text)} disabled />&nbsp;
                                <Button onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)} onClick={
                                    () => {
                                        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                            let flag = 0
                                            if (localStorage.getItem('projectRightsDefine') != undefined) {
                                                let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                                for (let item in pageRights) {
                                                    if (item == localStorage.getItem('selectedPageName')) {
                                                        if (pageRights[item].blockControlUsers && pageRights[item].blockControlUsers[0] != undefined) {
                                                            pageRights[item].blockControlUsers.map(item2 => {
                                                                if (JSON.parse(window.localStorage.getItem('userData')).name == item2) {
                                                                    flag = 1
                                                                    Modal.info({
                                                                        title: '提示',
                                                                        content: '用户权限不足'
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    }
                                                }
                                            }
                                            if (flag == 0) {
                                                this.showSettingValue(record[`${item.Point}Name`], text, record['EquipName'], item.title)
                                            }
                                        } else {
                                            Modal.info({
                                                title: '提示',
                                                content: '用户权限不足'
                                            })
                                        }
                                    }
                                } >设定</Button>
                            </div>
                        }
                    })
                } else {
                    columns.push({
                        title: item.title,
                        dataIndex: item.Point,
                        key: item.Point,
                        render: (text, record) => {
                            return <div>
                                <Input style={{ width: "50px" }} value={parseInt(text)} disabled />&nbsp;
                                <Button onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)} onClick={
                                    () => {
                                        message.info('禁止修改设定值')
                                    }} >设定</Button>
                            </div>
                        }
                    })
                }
            } else if (item.ElementType && item.ElementType == "button") {
                if (item.Writable && item.Writable == 1) {
                    columns.push({
                        title: item.title,
                        dataIndex: item.Point,
                        key: item.Point,
                        render: (text, record) => {
                            return <div>
                                <Button type='primary' style={{ marginRight: 3 }} onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)} onClick={() => {
                                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                        let flag = 0
                                        if (localStorage.getItem('projectRightsDefine') != undefined) {
                                            let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                            for (let item in pageRights) {
                                                if (item == localStorage.getItem('selectedPageName')) {
                                                    if (pageRights[item].blockControlUsers && pageRights[item].blockControlUsers[0] != undefined) {
                                                        pageRights[item].blockControlUsers.map(item2 => {
                                                            if (JSON.parse(window.localStorage.getItem('userData')).name == item2) {
                                                                flag = 1
                                                                Modal.info({
                                                                    title: '提示',
                                                                    content: '用户权限不足'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        if (flag == 0) {
                                            this.ButtonChange(record[`${item.Point}Name`], 1, record['EquipName'])
                                        }
                                    } else {
                                        Modal.info({
                                            title: '提示',
                                            content: '用户权限不足'
                                        })
                                    }
                                }} disabled={text == 1 ? true : false}>开启</Button>
                                <Button type='primary' onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)} onClick={() => {
                                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                        let flag = 0
                                        if (localStorage.getItem('projectRightsDefine') != undefined) {
                                            let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                            for (let item in pageRights) {
                                                if (item == localStorage.getItem('selectedPageName')) {
                                                    if (pageRights[item].blockControlUsers && pageRights[item].blockControlUsers[0] != undefined) {
                                                        pageRights[item].blockControlUsers.map(item2 => {
                                                            if (JSON.parse(window.localStorage.getItem('userData')).name == item2) {
                                                                flag = 1
                                                                Modal.info({
                                                                    title: '提示',
                                                                    content: '用户权限不足'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        if (flag == 0) {
                                            this.ButtonChange(record[`${item.Point}Name`], 0, record['EquipName'])
                                        }
                                    } else {
                                        Modal.info({
                                            title: '提示',
                                            content: '用户权限不足'
                                        })
                                    }
                                }} disabled={text == 0 ? true : false}>关闭</Button>
                            </div>
                        }
                    })
                } else {
                    columns.push({
                        title: item.title,
                        dataIndex: item.Point,
                        key: item.Point,
                        render: (text, record) => {
                            return <div>
                                <Button type='primary' style={{ marginRight: 3 }} onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)} onClick={() => { message.info('禁止开关设备') }} disabled={text == 1 ? true : false}>开启</Button>
                                <Button type='primary' onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)} onClick={() => { message.info('禁止开关设备') }} disabled={text == 0 ? true : false}>关闭</Button>
                            </div>
                        }
                    })
                }
            } else {
                columns.push({
                    title: item.title,
                    dataIndex: item.Point,
                    key: item.Point,
                    sorter: (a, b) => a[item.Point] - b[item.Point],
                    render: (text, record) => {
                        if (item.unit && item.unit != undefined && item.unit != '') {
                            if (item.decimal && item.decimal != undefined  && text != undefined) { 
                                return <div style={{ cursor: 'pointer', marginLeft: 10 }} onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)}>{parseFloat(text).toFixed(Number(item.decimal))}&nbsp;&nbsp;{item.unit}</div>
                            }else {
                                return <div style={{ cursor: 'pointer', marginLeft: 10 }} onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)}>{text}&nbsp;&nbsp;{item.unit}</div>
                            }
                        } else {
                            if (item.decimal && item.decimal != undefined  && text != undefined) { 
                                return <div style={{ cursor: 'pointer', marginLeft: 10 }} onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)}>{parseFloat(text).toFixed(Number(item.decimal))}</div>
                            }else {
                                return <div style={{ cursor: 'pointer', marginLeft: 10 }} onContextMenu={(e) => this.onContextMenu(record[`${item.Point}Name`], e)}>{text}</div>
                            }
                        }
                    }
                })
            }
        })

        this.setState({
            columns: columns
        })
    }

    showSettingValue(pointName, currentValue, equipmentName, title) {
        this.setState({
            setValueModalVisible: true,
            pointName: pointName,
            currentValue: currentValue,
            equipmentName: equipmentName,
            title: title
        })
    }

    ButtonChange(pointName, pointValue, equipmentName) {
        this.setState({
            SwitchVisiable: true,
            pointName: pointName,
            pointValue: pointValue,
            equipmentName: equipmentName
        })
    }

    ButtonCancel() {
        this.setState({
            SwitchVisiable: false
        })
    }

    setValueCancel() {
        this.setState({
            setValueModalVisible: false
        })
    }

    renderLoading(flag) {
        this.setState({
            loading: flag
        })
    }

    //右击文本事件
    onContextMenu = (name, e) => {
        e.preventDefault()
        // 设置属性是否在弹窗里面
        let isInfo = {
            "isInModal": false
        }
        //重新定义函数，继承原函数所有的属性和函数        
        let model = new ModelText()
        model.options = {
            getTendencyModal: this.props.getTendencyModal,
            showCommomAlarm: this.props.showCommomAlarm,
            showMainInterfaceModal: this.props.showMainInterfaceModal,
            getToolPoint: this.props.getToolPoint
        }

        let clientWidth = document.documentElement.clientWidth,
            clientHeight = document.documentElement.clientHeight - 32 - 56 - 48;
        let widthScale = 0, heightScale = 0;
        widthScale = clientWidth / 1920
        heightScale = clientHeight / 955
        e.offsetX = e.clientX - 5,
            e.offsetY = e.clientY - 100
        http.post('/analysis/get_point_info_from_s3db', {
            "pointList": [name]
        }).then(
            data => {
                if (data.err == 0) {
                    model.description = data.data[name].description
                    model.idCom = data.data[name].name
                    model.value = data.data[name].value
                    model.sourceType = data.data[name].sourceType
                    model.showModal(e, isInfo, widthScale, heightScale)
                } else {
                    message.error("数据请求失败")
                }
            })
    }

    //渲染左侧一列
    renderLeftList(list) {
        if (list.length > 0) {
            let arr = list.map((item, index) => {
                if(index==0){
                    return (
                        <div title={item.name} style={{ background: '#2ea2f8', color: "white", borderBottom: "1px solid #ccc", textAlign: 'center', cursor: 'pointer', lineHeight: '35px' }}
                            onClick={(e) => { this.selectList(item, list, index, e) }}
                        >{item.name}
                        </div>
                    )
                }else{
                    return (
                        <div title={item.name} style={{ background: 'none', color: "white", borderBottom: "1px solid #ccc", textAlign: 'center', cursor: 'pointer', lineHeight: '35px' }}
                            onClick={(e) => { this.selectList(item, list, index, e) }}
                        >{item.name}
                        </div>
                    )
                }
                
        
                // else {
                //     if (item.system != undefined) {
                        
                //         return (
                //             <div title={item.system} style={{ background: 'none', color: "white", borderBottom: "1px solid #ccc", textAlign: 'center', cursor: 'pointer', lineHeight: '35px' }}
                //                 onClick={(e) => { this.selectListBySys(item, list, index, e) }}
                //             >{item.system}
                //             </div>
                //         )
                //     }
                // }
            })
            return arr
        }
    }
    //筛选对应的列表
    selectList(item, list, index, e) {
        this.renderLeftList(list)
        this.setState({
            indexId: index
        })
        let arr = document.getElementById('SelectByArea').childNodes
        for (let i = 0; i < arr.length; i++) {
            arr[i].style.backgroundColor = 'transparent'
        }
        e.target.style.backgroundColor = '#2ea2f8'
        if (this.props.config.distributionGroupList.children && this.props.config.distributionGroupList.children != undefined && item.name != undefined) {
            this.renderDataSource(index)
        }
    }

    //筛选对应的列表
    selectListBySys(item, list, index, e) {
        this.renderLeftList(list)
        this.setState({
            indexId: index
        })
        let arr = document.getElementById('SelectBySys').childNodes
        for (let i = 0; i < arr.length; i++) {
            arr[i].style.backgroundColor = 'transparent'
        }
        e.target.style.backgroundColor = '#2ea2f8'
        if (this.props.config.systemGroupList.children && this.props.config.systemGroupList.children != undefined && item.system != undefined) {
            this.renderDataSourceBySys(index)
        }
    }

    //tab页切换
    callback(key) {
        this.setState({
            setActiveKey:key
        })
    }

    Options = () => {
        let timeSpan = this.props.config.timeSpanArr
        if(timeSpan&&timeSpan.length!=0){
            return <Select size="small" style={{width:70}}>
                    {
                        timeSpan.map(item=>{
                        if(item == "m5"){
                            return <Option value="m5">5分钟</Option>
                        }else if(item == "h1"){
                            return <Option value="h1">1小时</Option>
                        }else if(item == "d1"){
                            return <Option value="d1">1天</Option>
                        }else if(item == "M1"){
                            return <Option value="M1">1个月</Option>
                        }else if(item == "m1"){
                            return <Option value="m1">1分钟</Option>
                        }
                    })
                }
            </Select>      
        }else{
            return  <Select size="small" style={{width:70}}>
                
                    <Option value="d1">1天</Option>
                </Select>
        }

    }

    getSubentry () {
        let systemArr = this.state.systemArr
        let buildingArr = this.state.buildingArr
        if (this.state.classifyValue == "systemGroupList" && this.state.systemArr.length !=0) {
            return systemArr.map((item,index)=>{
                return (<Option value={this.state.systemPointArr[index]}>{item}</Option>)
            })
        }else {
            if (this.state.buildingArr.length !=0) {
                return buildingArr.map((item,index)=>{
                    return (<Option value={this.state.buildingPointArr[index]}>{item}</Option>)
                })
            }
        }
    }

    onChangeClassify (value) {
        this.setState({
            classifyValue:value
        })
    }

    onChangeSub (value) {
        this.setState({
            subValue:value
        })
    }

    onSearch () {
        let startTime,endTime,span
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.getColumns(values);
            
            // startTime = values.range[0].format(TIME_FORMAT),
            // endTime = values.range[1].format(TIME_FORMAT),
            // span = values.timeFormat
        });
        // //保存到localStorage中，以便下次切换页面时时间段不变
        //  window.localStorage.setItem('reportRange',JSON.stringify({
        //     startTime,
        //     endTime
        // }));
        // window.localStorage.setItem('reportSpan',JSON.stringify({
        //     span
        // }));
    }

    handleTimeChange = (value) =>{
        this.setState({
          timeFrom:value[0].format(TIME_FORMAT),
          timeTo:value[1].format(TIME_FORMAT)
        })
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Tabs activeKey={this.state.setActiveKey} onChange={this.callback} >
                    <TabPane tab="能源看板" key="1">
                        {this.state.setActiveKey == '1' && <EnergyBoardComponent custom_realtime_data = {this.props.custom_realtime_data}/>}
                    </TabPane>
                    <TabPane tab="基础数据" key="2">
                        <Layout>
                            <Sider style={{ display: this.props.config.groupPaneEnable != undefined && this.props.config.groupPaneEnable == 0 ? "none" : '' }}>
                                <div id="SelectByArea">
                                    {
                                        this.renderLeftList(this.props.config.distributionGroupList.children)
                                    }
                                </div>
                            </Sider>
                            <Layout>
                                <Content>
                                    <Table
                                        dataSource={this.state.dataSource}
                                        columns={this.state.columns}
                                        pagination={false}
                                        loading={this.state.loading}
                                        scroll={{ y: 800 }}
                                    />
                                </Content>
                            </Layout>
                        </Layout>
                    </TabPane>
                    {
                        this.props.config.systemGroupList != undefined ?
                        <TabPane tab="系统分组" key="3">
                            <Layout>
                                <Sider style={{ display: this.props.config.groupPaneEnable != undefined && this.props.config.groupPaneEnable == 0 ? "none" : '' }}>
                                    <div id="SelectBySys">
                                        {
                                            this.renderLeftList(this.props.config.systemGroupList.children)
                                        }
                                    </div>
                                </Sider>
                                <Layout>
                                    <Content>
                                        <Table
                                            dataSource={this.state.dataSourceBySys}
                                            columns={this.state.columns}
                                            pagination={false}
                                            loading={this.state.loading}
                                            scroll={{ y: 800 }}
                                        />
                                    </Content>
                                </Layout>
                            </Layout>
                        </TabPane>
                        :
                        ""
                    }
                    
                    <TabPane tab="能耗报表" key="4">
                        <Form layout= 'inline'>
                            <FormItem
                                label="取样间隔"
                                style={{
                                    marginLeft: '30px'
                                }}
                            >
                                {getFieldDecorator('timeFormat', {
                                    initialValue: 'd1'
                                })(
                                    this.Options()
                                )}
                            </FormItem>
                            <FormItem
                                label="时间范围"
                                style={{
                                    marginLeft: '20px'
                                }}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('range',{
                                    initialValue:[moment(this.state.defaultTimeStart),moment()]
                                })(
                                    <RangePicker  
                                        size="small" 
                                        format={TIME_FORMAT}  
                                        onChange={this.handleTimeChange}
                                        disabledDate={this.disabledDate}
                                    />
                                )}
                            </FormItem>
                            <FormItem
                                label="分类"
                                style={{
                                    marginLeft: '30px'
                                }}
                            >
                                {getFieldDecorator('classify', {
                                    initialValue: this.state.classifyValue
                                })(
                                    <Select size="small" style={{width:100}} onChange={this.onChangeClassify}>
                                        <Option value="distributionGroupList">区域</Option>
                                        {
                                             this.props.config.systemGroupList != undefined ?
                                                <Option value="systemGroupList">系统</Option>
                                             :
                                             ""
                                        }
                                       
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                label="分项"
                                style={{
                                    marginLeft: '30px'
                                }}
                            >
                                {getFieldDecorator('subentry', {
                                    initialValue: this.state.subValue
                                })(
                                    <Select size="small" style={{width:180}} onChange={this.onChangeSub}>
                                        <Option value="all">全部</Option>
                                        {this.getSubentry()}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem>
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={ this.onSearch }
                                >
                                    查询
                                </Button>
                            </FormItem>
                            <FormItem>
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={ this.handleDownLoad }
                                >
                                    下载
                                </Button>
                            </FormItem>
                        </Form>
                        <Layout>
                            <Header>
                                <div style={{fontSize:20,height:64}}>
                                    <p style={{lineHeight:"64px",textAlign:"center"}}>日用电量报表</p>
                                </div>
                            </Header>
                            <Content>
                                <Table
                                    dataSource={this.state.dataSourceReport}
                                    columns={this.state.columnsReport}
                                    pagination={false}
                                    loading={this.state.loadingReport}
                                    scroll={{ y: 600,x:1700 }}
                                />
                            </Content>
                        </Layout>
                    </TabPane>
                </Tabs>

            </div>
        )
    }
}


const TableView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class EquipmentTableComponent extends Widget {

    constructor(props) {
        super(props)
        this.state = {
            style: {},
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

    componentDidMount() {
        // style只提供基础的组件坐标和宽高，自定义需要增加逻辑
        const { style } = this.props
        this.setState({ style })
    }
    /* @override */
    getContent() {
        const { style } = this.state

        return (
            <div style={style} className={s['container']} >
                <TableView

                    {...this.props}

                />
            </div>
        )
    }
}

export default EquipmentTableComponent


