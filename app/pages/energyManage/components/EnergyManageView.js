import React from 'react'
import {Table , Select , DatePicker , Button ,Form, Tabs,message,Spin} from 'antd'
import cx from 'classnames'
import ChartView from '../../observer/components/widgets/ChartView'
import PieChart from '../../observer/components/widgets/PieChatView'
import moment from 'moment'
import WORD_DOWNLOAD_TEMPLATE from '../../observer/components/widgets/downloadTemplates/word.html';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { subtract,downloadUrl } from '../../../common/utils';
import s from './EnergyManageView.css'

const { TabPane } = Tabs;

let  EnergyViewSelect,EnergyViewTable,textStyle,tableStyle,headerStyle,btnStyle,labelText,headerBgStyle;
if( localStorage.getItem('serverOmd')=="best"||localStorage.getItem('serverOmd')=="persagy"){
    EnergyViewSelect = "EnergyViewSelectStyle";
    EnergyViewTable = "EnergyViewTableStyle";
    headerStyle = {
        float:'right',
        marginTop:'-25px'
    };
}else{
    EnergyViewSelect = "";
    EnergyViewTable = "";
    textStyle = {
        color: '#CADCE7',
        marginLeft:'5px',
        marginTop:'5px'
    };
    tableStyle = {
        marginTop:'21px'
    };
    headerStyle = {
        float:'right',
        marginTop:'-10px'
    };
    btnStyle = {
        background:'#57BB50',
        border:0,
        color:'#ffffff'
    };
    labelText = "系统设备";
    headerBgStyle = {
        background:'#192234'
    }
}


const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';

const FormItem = Form.Item;
const Option = Select.Option
const OptGroup = Select.OptGroup
const RangePicker = DatePicker.RangePicker;

const getTimeRange = function (period) {
    let startTime, endTime;
  
    switch(period) {
      case 'today':
        startTime = moment().startOf('day');
        endTime = moment();
        break;
      case 'thisweek':
        startTime = moment().startOf('week');
        endTime = moment();
        break;
      case 'month':
        startTime = moment().startOf('month')
        endTime = moment();
        break;
    }
    return [startTime, endTime];
}

// 设备标签
const getEquipmentTag = function(classify){

    let equipmentTag = '';
    switch(classify){
        case 'Ch':
            equipmentTag = "冷机";
            break;
        case "PriChWP":
            equipmentTag = '一次冷冻泵';
            break;
        case "SecChWP":
            equipmentTag = '二次冷冻泵';
            break;
        case 'CWP':
            equipmentTag = '冷却泵';
            break;
        case 'CT':
            equipmentTag = '冷却塔';
            break;
    }
    return equipmentTag
}




/**
 * 细账查询
 * 
 * @class FormWrap
 * @extends {React.Component}
 */
class FormWrap extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            loading : false,
            dataSource : [],
            columns : [],
            data : {},
            headerHeight : 0,
            tableContentHeight : 0,
            data:[] ,//求完差值后的数据
            timeStart:"",
            timeEnd:""
        }

        this.equipmentsGroupList = ["Ch","PriChWP","SecChWP","CWP","CT"]
        this.equipmentList = []
        this.pointList = [] //当前选中的点位
        this.tableContainerRef = null

        this.handleDownLoad = this.handleDownLoad.bind(this);
    }

    componentDidMount(){
        this.props.initialPointList(this.initialPointList)
    }

    // 设置一个初始化的列表
    initialPointList = () => {
        // this.antdTableHearder()
        // 当前组件需要等到父组件初始化完之后，再拿到globalConfig的数据，
        var today = getTimeRange('today'),
            equipmentTag = getEquipmentTag('Ch')
        this.pointList =  this.getEquipmentList('Ch',equipmentTag).map(item=>item.point).length >1 ? this.getEquipmentList('Ch',equipmentTag).map(item=>item.point)[0] : this.getEquipmentList('Ch',equipmentTag).map(item=>item.point)
        if (!Array.isArray(this.pointList)) {
            this.pointList = [this.pointList]
        }
        // console.log(this.pointList)
        this.searchData(this.pointList,today[0].format(TIME_FORMAT),today[1].format(TIME_FORMAT),'m5')
    }

    // 获取设备选择下拉框分组
    getEquipmentOptGroup = () => {
        this.equipmentList = []  //清空
        let List = []
        const {globalConfig,roomName} = this.props;
        let currentConfig = []
        if (globalConfig.ChillerPlantRoom != undefined && globalConfig.ChillerPlantRoom.length != 0) {
            globalConfig.ChillerPlantRoom.forEach(item=>{
                if (item.RoomName === roomName) {
                    currentConfig = item
                }
            })
        }else {
            currentConfig = globalConfig.ChillerPlantRoom
        }
        List = this.equipmentsGroupList.map(classify=>{
            let equipmentTag = getEquipmentTag(classify);
            if(equipmentTag == "二次冷冻泵" && currentConfig != undefined && currentConfig.SecChWPGroupList == null){

            }else{
                return (
                    <OptGroup key={classify} label={equipmentTag} >
                        {this.getEquipmentOptItem(classify,equipmentTag)}
                    </OptGroup>
                )
            }
        })
        // if(this.state.customGroups && this.state.customGroups.length != 0){
        //     this.state.customGroups.map((item,index)=>{
        //         this.equipmentList.push({point: `${item.prefix}PowerTotal${item.no}`,cnPoint:item.name+'总功耗',classify:item.name})
        //         List.push(
        //             <OptGroup key={item.prefix} label={item.name} >
        //                 <Option key={`${item.prefix}PowerTotal${item.no}`}  value={`${item.prefix}PowerTotal${item.no}`}>{item.name}总功耗</Option>
        //                 {item.children.map((item2,index2)=>{
        //                     this.equipmentList.push({point: `${item2.prefix}PowerTotal${item2.no}`,cnPoint:item2.name+'功耗',classify:item2.name})
        //                     return <Option key={`${item2.prefix}PowerTotal${item2.no}`}  value={`${item2.prefix}PowerTotal${item2.no}`}  >{item2.name}</Option>
        //                 })}
        //             </OptGroup>
        //         )
        //     })
        // }
        return List
    }
    
    // 获取设备分组项
    getEquipmentOptItem = (classify,equipmentTag) => {
        let equipmentList = this.getEquipmentList(classify,equipmentTag)
        return equipmentList.map(item=>{
            return (
                <Option key={item.point}  value={item.point} >{item.cnPoint}</Option>
            )
        })
    }

    // 获取equipmentList
    getEquipmentList = (classify,equipmentTag) => {
        const {globalConfig,roomName} = this.props;
        let currentConfig = []
        if (globalConfig.ChillerPlantRoom != undefined && globalConfig.ChillerPlantRoom.length != 0) {
            globalConfig.ChillerPlantRoom.forEach(item=>{
                if (item.RoomName === roomName) {
                    currentConfig = item
                }
            })
        }else {
            currentConfig = globalConfig.ChillerPlantRoom
        }
        // 取出全局配置中与分组相关的设备count
        let equipmentCount = null,
            equipmentList = [];

        equipmentList.push({point: classify + "GroupPowerTotal",cnPoint:equipmentTag+'总功耗',classify})
        for( var key in currentConfig ){
            if(currentConfig.hasOwnProperty(key) && (classify + "Count") == key){
                // key值需要匹配当前的项
                equipmentCount = currentConfig[key]
            }
        }

        if(equipmentCount !== null){
            var i = 0 , equipment = null ,cnPoint='';
            for( i ;  i<equipmentCount ; i++ ){
                if(i < 10){
                    equipment = classify+"PowerTotal0"+ (i +1);
                    cnPoint = equipmentTag + 0 +  (i +1) + '功耗';
                }else{
                    equipment = classify+"PowerTotal"+ (i +1)
                    cnPoint = equipmentTag + (i +1) + '功耗';
                }
                equipmentList.push({point:equipment,cnPoint,classify})
            }
        }
        this.equipmentList.push(...equipmentList)
        return equipmentList
    }


    // utils-获取点名
    getList = (matchStr) => {
        var pointList = []
        this.equipmentList.forEach(equipment=>{
            if( new RegExp("^"+matchStr).test(equipment.point) ){
                pointList.push(equipment.point)
            }
        })
        return pointList
    }

    // 查询
    handleSearch = (e) => {
        var _this = this
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log(values)
                var flag = false ,
                    pointList = null,
                    timeStart = values.times[0].format(TIME_FORMAT),
                    timeEnd = values.times[1].format(TIME_FORMAT);
                // 根据规则，匹配所需要的项 
                switch(values.equipment){
                    case 'ChGroupPowerTotal':
                        flag = true ; 
                        pointList = this.getList("Ch")
                        break;
                    case "PriChWPGroupPowerTotal":
                        pointList = this.getList("PriChWP")
                        flag = true ; 
                        break;
                    case "SecChWPGroupPowerTotal":
                        pointList = this.getList("SecChWP")
                        flag = true ; 
                        break;
                    case 'CWPGroupPowerTotal':
                        pointList = this.getList("CWP")
                        flag = true ; 
                        break;
                    case 'CTGroupPowerTotal':
                        pointList = this.getList("CT")
                        flag = true ; 
                        break;
                }
                // // 选择设备总功率，则搜索点包含每一台该设备
                // if(flag){
                //     this.pointList = pointList
                //     return this.searchData(pointList,timeStart,timeEnd,values.format)
                // }
                if(flag){
                    //this.pointList = pointList
                    return this.searchData([values.equipment],timeStart,timeEnd,values.format)
                }
                this.pointList = [values.equipment]
                this.searchData([values.equipment],timeStart,timeEnd,values.format)
            }
        });
    }
    
    // 表格数据
    _renderTable = (data) => {
        const {map,time} = data
        // map : { Ch : [] }

        let tempData = Object.keys(map)
        tempData.unshift("时间")

        let columns = tempData.map(item=>{
            var title = null , i = 0 , len = this.equipmentList.length , temp = null;
            for( i; i < len ; i++ ){
                temp = this.equipmentList[i];
                if(temp.point == item){
                    title = temp.cnPoint
                    break;
                }
            }
            return {
                title : title || item,
                dataIndex : item,
                key : item,
                width:100
            }
        })

        let dataSource = time.map((item,index)=>{
            // 行
            let line = {},column = null;
            line['key'] = index
            for(var i = 0 ; i < columns.length ;i++){
                column=columns[i]
                if(column.dataIndex == "时间"){
                    line[column.dataIndex] = item
                }else{
                    line[column.dataIndex] = Number.isNaN(Math.floor(map[column.dataIndex][index]))?  '' : Math.floor(map[column.dataIndex][index])
                }
            }
            return line
        })
        
        this.setState({columns,dataSource},this.antdTableHearder)
    }   

    // 切换表格loading状态
    toggleTableLoading = (loading) => {
        this.setState({loading})
    }

    // 搜索数据
    searchData = (pointList,timeStart,timeEnd,timeFormat) => {
        var _this = this
        // loading状态
        this.toggleTableLoading(true)
        // 开始时间需要提前一个时间段，计算累积量的差
        switch (timeFormat){
            case 'm5':
                timeStart = moment(timeStart).subtract(5,'m').format(TIME_FORMAT);
                break;
            case 'h1':
                timeStart = moment(timeStart).subtract(1,'h').format(TIME_FORMAT)
                break;
            case 'd1':
                timeStart = moment(timeStart).subtract(1,'d').format(TIME_FORMAT)
                break;
            case 'm1':
                timeStart = moment(timeStart).subtract(1,'m').format(TIME_FORMAT)
                break;
        }

        let newPointName =[]
        pointList.map(point=>{
            newPointName.push(_this.props.roomName + point)
        })

        http.post('/get_history_data_padded', {
            pointList: newPointName,
            timeStart:timeStart,
            timeEnd:timeEnd,
            timeFormat:timeFormat
        }).then(
            data => {
                if (data.error) {
                    throw new Error(data.msg)
                }
                this.toggleTableLoading(false)

                // 计算差值
                var pointList = Object.keys(data.map)
                pointList.forEach(point=>{
                    data.map[point] = subtract(data.map[point])
                })
                data.time.shift()
  
                // render table
                _this._renderTable(data)
                this.setState({
                    data:data,
                    timeStart:timeStart,
                    timeEnd:timeEnd,
                })
            }
        ).catch(
            (error) => {
                this.toggleTableLoading(false)
                message.warning(error.msg, 3);
            }
        )
    }

    getTableContainerRef = (ref) => {
        this.tableContainerRef = ref
    }

    antdTableHearder = () => {
        let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-thead'))
        let headerHeight = parseInt( catchedTableHeadStyle.height )
        let tableContentHeight = parseInt(window.getComputedStyle(this.tableContainerRef).height);
        this.setState({
            headerHeight : headerHeight,
            tableContentHeight : tableContentHeight
        })
    }

    //生成word并下载
    handleDownLoad() {
        // let dom = document.querySelector('#detailsReport');
        // let html = WORD_DOWNLOAD_TEMPLATE.replace('<%= content %>', dom.outerHTML);
        // console.info(html);
        //接口请求返回的数据对象
        const data = this.state.data;
        //判断，如果data里的time是空，则判断为没有历史数据，则不进行下载并提示
        if (data.time.length === 0) {
            Modal.error({
            title: '信息提示',
            content: '数据为空，无法导出表格',
            });
            return
        }
        let pointList = []
        let reportName = '细账查询'
        let strStartTime = moment(this.state.timeStart).format('YYYY-MM-DD HH:mm:00')
        let strEndTime = moment(this.state.timeEnd).format('YYYY-MM-DD HH:mm:00')
        let pointData = []
        let timeData = data.time
        let headerList = []
        
        Object.keys(data.map).map(item=>{
            pointList.push(item)
        })

        pointData = timeData.map( (item,row)=>{
            let line = {}
            line['key']= row
            pointList.forEach( (pitem,i)=>{
                if (data.map[pitem].length === 0) {
                    line[pitem] = ''
                }else {
                    line[pitem] = data.map[pitem][row]                
                }
            })
            return line
        })
        //获取表头中文
        pointList.map(item=>{
            //headerList.push("时间") 
            var title = null , i = 0 , len = this.equipmentList.length , temp = null;
            for( i; i < len ; i++ ){
                temp = this.equipmentList[i];
                if(temp.point == item){
                    title = temp.cnPoint
                    break;
                }
            }
            headerList.push(title == null ? item : title) 
        })

      
        http.post('/reportTool/genExcelReportByTableData', {
            reportName: reportName,
            strStartTime: strStartTime,
            strEndTime: strEndTime,
            headerList: headerList,　 //表头用的点名
            tableDataList:pointData,
            timeList:timeData,
            pointList:pointList
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

    render(){
        const {getFieldDecorator} = this.props.form
        return (
                <div className={s['table-container']}>  
                <div className={s['table-header']} >
                    <h2 className={s['money-search']} style={textStyle}>细账查询</h2>
                    <Form layout="inline" className={EnergyViewSelect} style={headerStyle}>
                            <FormItem label={labelText}>
                            {getFieldDecorator('equipment', {
                                rules: [{ required: true, message: '请选择设备' }],
                                initialValue : 'ChGroupPowerTotal'
                            })(
                               <Select style={{width:200}} >
                                   {this.getEquipmentOptGroup()}
                               </Select>
                            )}
                            </FormItem>
                        <FormItem>
                            {getFieldDecorator('times', {
                                rules: [{ required: true, message: '请选择时间' }],
                                initialValue:[moment().startOf('day'), moment()]
                            })(             
                                <RangePicker showTime format={TIME_FORMAT} allowClear={false}/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('format', {
                                rules: [{ required: true, message: '请选择时间间隔' }],
                                initialValue : 'm5'
                            })(
                               <Select>
                                   <Option value='m5'>5分钟</Option>
                                   <Option value='h1'>1小时</Option>
                                   <Option value='d1'>1天</Option>
                                   <Option value='m1'>1月</Option>
                               </Select>
                            )}
                        </FormItem>
                        <FormItem>
                            <Button className={s['btn']} style={btnStyle} onClick={this.handleSearch} >查询</Button>
                            <Button className={s['btn']} style={btnStyle} onClick={this.handleDownLoad} >下载</Button>
                        </FormItem>
                    </Form>
                </div>
                <div className={s['table-content']}  id="detailsReport" ref={this.getTableContainerRef} style={tableStyle}>
                    <Table 
                        dataSource={this.state.dataSource} 
                        columns={this.state.columns} 
                        scroll={{y:this.state.tableContentHeight - this.state.headerHeight}} 
                        pagination={false}
                        loading={this.state.loading}
                        className={EnergyViewTable}
                        />
                </div>
            </div>   
           
        )
    }
}

const TableView = Form.create()(FormWrap)


/**
 * energy主页面
 */
class EnergyManageView  extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            todayPowerTotal : 0,
            averagePower : 0,
            highestPower : 0,
            yesterdayPowerTotal : 0,
            yesterdayAveragePower : 0,
            yesterdayHighestPower : 0,
            pieChartTimeRange : getTimeRange('today'),
            globalConfig : {},
            selectTimes : 'day',
            energyDateStr : window.localStorage.energyDateStr || moment().format("YYYY-MM-DD"),
            loading : false,
            color : [],
            pieData : [],
            roomName: '',
            roomNameCHS: '',
            price: "1",
            extraEquipment:[],
            powerTotalPiont:'',
            Tabloading:false,
            customGroups:[],
            activeKey:"1",
            initName:'冷机'
        }

        this.energyCallback = null;
        this.handelChangeTab = this.handelChangeTab.bind(this);
    }
 
    componentDidMount(){
        this.getGlobalConfig()
        this.getTodayPowerTotal()
    }

    // 初始化Table选项
    initialPointList = (callback) => {
        this.energyCallback = callback
    }


    // 获取全局配置
    getGlobalConfig = () => {
        this.setState({
            loading:true
        })
        var _this = this 
        http.post('/project/getConfig')
        .then(
            data=>{
                if(data.status){
                    if (data.data.ChillerPlantRoom != undefined && data.data.ChillerPlantRoom.length !=0) {
                        _this.setState({
                            globalConfig : data.data,
                            Tabloading:false,
                            roomNameCHS:data.data.ChillerPlantRoom[0].RoomNameCHS != undefined ? data.data.ChillerPlantRoom[0].RoomNameCHS : data.data.ChillerPlantRoom[0].RoomName,
                            roomName:data.data.ChillerPlantRoom[0].RoomName  != undefined ? data.data.ChillerPlantRoom[0].RoomName : ""
                        },this.energyCallback)
                    }else {
                        _this.setState({
                            globalConfig : data.data,
                            Tabloading:false
                        },this.energyCallback)
                    }
                    
                    
                }
            }
        )
    }

    
    getTodayPowerTotal = () => {
        const {energyDateStr,roomName} = this.state
        let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
            timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT),
            yesterdayStart = moment(energyDateStr).subtract(1,'day').startOf('day').format(TIME_FORMAT),
            yesterdayEnd = moment(energyDateStr).subtract(1,'day').endOf('day').format(TIME_FORMAT),
            _this = this;
        this.setState({loading:true})
        // 冷水机房今日总用电量
        http.post('/get_history_data_padded', {
            pointList: [
                roomName + "ChGroupPowerTotal",
                roomName + "CTGroupPowerTotal",
                roomName + "CWPGroupPowerTotal",
                roomName + "PriChWPGroupPowerTotal",
                roomName + "SecChWPGroupPowerTotal",
                roomName + "ChGroupPower",
                roomName + "CTGroupPower",
                roomName + "CWPGroupPower",
                roomName + "PriChWPGroupPower",
                roomName + "SecChWPGroupPower"
            ],
            ...{
                "timeStart":timeStart,
                "timeEnd":timeEnd,
                "timeFormat":"m1"
            }
          }).then(
              data=>{
                if(data.error){
                    throw new Error(data.msg)
                }
                var powerList = [],
                    todayPowerTotalList = [],
                    powerSumArr = [],
                    todayDataObj = {}
                //筛选数据，剔除数据为空的设备项    
                for (var key in data.map) {
                    if (data.map[key] && data.map[key].length != 0) {
                        todayDataObj[key] = data.map[key]
                    }
                }

                for(var key in todayDataObj){
                    if(todayDataObj.hasOwnProperty(key)){
                        if(new RegExp(/Total$/).test(key)){
                            todayPowerTotalList.push(todayDataObj[key][todayDataObj[key].length-1] - todayDataObj[key][0])
                        }else{
                            // 各种设备当日平均功率 
                            //powerList.push(todayDataObj[key][todayDataObj[key].length-1] - todayDataObj[key][0])
                            let originalData = (todayDataObj[key].reduce((pre,next)=>pre + next) / todayDataObj[key].length)
                            if (originalData <0) {
                                originalData = 0
                            }
                            powerList.push(originalData) 

                        }
                    }
                }


                //求最高功率前先算出同一时刻，所有设备当时刻的功率总和，即一天里机房每时刻的功率
                for (var i=0;i<data.time.length; i++) {
                    powerSumArr.push(0)
                }

                data.time.forEach((item,index)=>{
                    for (var key in todayDataObj) {
                        if (todayDataObj.hasOwnProperty(key)) {
                            if (!(new RegExp(/Total$/).test(key))) {
                                if (todayDataObj[key][index]<0 ) {
                                    todayDataObj[key][index] = 0
                                }
                                powerSumArr[index] += todayDataObj[key][index] 
                            }
                        }
                    }
                })


                // 平均功率
                let averagePower = powerList.reduce( (pre,next)=>parseInt(pre) + parseInt(next) )

                // 最高功率
                let highestPower = Math.max.apply(null,powerSumArr)

                // 全天用电量
                //先过滤数据，每种设备不会超过一万，超过强制为1千
                todayPowerTotalList.forEach((item,index)=>{
                    if (item > 100000) {
                        todayPowerTotalList[index] = 1000
                    }else {
                        if (item < 0) {
                            todayPowerTotalList[index] = 0
                        }
                    }
                })

                let todayPowerTotal = todayPowerTotalList.reduce( (pre,next)=>parseInt(pre) + parseInt(next) )
                

                
                _this.setState({todayPowerTotal,averagePower,highestPower})
              }
          ).catch(
              (err)=>{
                  //_this.setState({loading:false})
                  message.error(err.msg,2.5)
              }
          )
          // 冷水机房昨日总用电量
          http.post('/get_history_data_padded', {
            pointList: [
                roomName + "ChGroupPowerTotal",
                roomName + "CTGroupPowerTotal",
                roomName + "CWPGroupPowerTotal",
                roomName + "PriChWPGroupPowerTotal",
                roomName + "SecChWPGroupPowerTotal",
                roomName + "ChGroupPower",
                roomName + "CTGroupPower",
                roomName + "CWPGroupPower",
                roomName + "PriChWPGroupPower",
                roomName + "SecChWPGroupPower"
            ],
            ...{
                "timeStart":yesterdayStart,
                "timeEnd":yesterdayEnd,
                "timeFormat":"m1"
            }
            }).then(
              data=>{
                if(data.error){
                    throw new Error(data.msg)
                }
                var powerList = [],
                    yesterdayPowerTotalList = [],
                    powerSumArr = [],
                    dataObj = {}
                //筛选数据，剔除数据为空的设备项    
                for (var key in data.map) {
                    if (data.map[key] && data.map[key].length != 0) {
                        dataObj[key] = data.map[key]
                    }
                }

                for(var key in dataObj){
                    if(dataObj.hasOwnProperty(key)){
                        if(new RegExp(/Total$/).test(key)){
                            yesterdayPowerTotalList.push(dataObj[key][dataObj[key].length-1] - dataObj[key][0])
                        }else{
                            // 某设备昨日功率 
                            //powerList.push(dataObj[key][dataObj[key].length-1] - dataObj[key][0])
                            let originalData = (dataObj[key].reduce((pre,next)=>pre + next) / dataObj[key].length)
                            if (originalData <0) {
                                originalData = 0
                            }
                            powerList.push(originalData) 
                        
                        }
                    }
                }

                //求最高功率前先算出同一时刻，所有设备当时刻的功率总和，即一天里机房每时刻的功率
                for (var i=0;i<data.time.length; i++) {
                    powerSumArr.push(0)
                }

                data.time.forEach((item,index)=>{
                    for (var key in dataObj) {
                        if (dataObj.hasOwnProperty(key)) {
                            if (!(new RegExp(/Total$/).test(key))) {
                                if (dataObj[key][index]<0 ) {
                                    dataObj[key][index] = 0
                                }
                                powerSumArr[index] += dataObj[key][index] 
                            }
                        }
                    }
                })

                // 平均功率
                let yesterdayAveragePower = powerList.reduce( (pre,next)=>parseInt(pre) + parseInt(next) )

                // 最高功率
                let yesterdayHighestPower = Math.max.apply(null,powerSumArr)

                // 全天用电量
                let yesterdayPowerTotal = yesterdayPowerTotalList.reduce( (pre,next)=>parseInt(pre) + parseInt(next) )

                if(this.state.customGroups && this.state.customGroups.length != 0){
                    _this.setState({yesterdayPowerTotal,yesterdayAveragePower,yesterdayHighestPower})
                }else{
                    _this.setState({yesterdayPowerTotal,yesterdayAveragePower,yesterdayHighestPower,loading:false})
                }
              }
            ).catch(
                (err)=>{
                    _this.setState({loading:false})
                    message.error(err.msg,2.5)
                }
            )
            if(this.state.customGroups && this.state.customGroups.length != 0){
                this.getExtraEquipment()
            }
    }

    getExtraEquipment = () => {
        const {energyDateStr} = this.state
        let str = []
        let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
            timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT),
            yesterdayStart = moment(energyDateStr).subtract(1,'day').startOf('day').format(TIME_FORMAT),
            yesterdayEnd = moment(energyDateStr).subtract(1,'day').endOf('day').format(TIME_FORMAT),
            _this = this;
        // 额外的设备今日总用电量
        // this.state.customGroups.map((row,index)=>{
        //     let pointList = []
        //     pointList.push(`${row.prefix}Power${row.no}`)
        //     pointList.push(`${row.prefix}PowerTotal${row.no}`)
        //     http.post('/get_history_data_padded', {
        //         pointList: pointList,
        //         ...{
        //             "timeStart":timeStart,
        //             "timeEnd":timeEnd,
        //             "timeFormat":"m1"
        //         }
        //       }).then(
        //           data=>{
        //             if(data.error){
        //                 throw new Error(data.msg)
        //             }
        //             var powerList = [],
        //                 todayPowerTotalList = [],
        //                 powerSumArr = [],
        //                 todayDataObj = {}
        //             //筛选数据，剔除数据为空的设备项    
        //             for (var key in data.map) {
        //                 if (data.map[key] && data.map[key].length != 0) {
        //                     todayDataObj[key] = data.map[key]
        //                 }
        //             }
    
        //             for(var key in todayDataObj){
        //                 if(todayDataObj.hasOwnProperty(key)){
        //                     if(new RegExp(/Total$/).test(key)){
        //                         todayPowerTotalList.push(todayDataObj[key][todayDataObj[key].length-1] - todayDataObj[key][0])
        //                     }else{
        //                         // 各种设备当日平均功率 
        //                         //powerList.push(todayDataObj[key][todayDataObj[key].length-1] - todayDataObj[key][0])
        //                         let originalData = (todayDataObj[key].reduce((pre,next)=>pre + next) / todayDataObj[key].length)
        //                         if (originalData <0) {
        //                             originalData = 0
        //                         }
        //                         powerList.push(originalData) 
    
        //                     }
        //                 }
        //             }
    
    
        //             //求最高功率前先算出同一时刻，所有设备当时刻的功率总和，即一天里机房每时刻的功率
        //             for (var i=0;i<data.time.length; i++) {
        //                 powerSumArr.push(0)
        //             }
    
        //             data.time.forEach((item,index)=>{
        //                 for (var key in todayDataObj) {
        //                     if (todayDataObj.hasOwnProperty(key)) {
        //                         if (!(new RegExp(/Total$/).test(key))) {
        //                             if (todayDataObj[key][index]<0 ) {
        //                                 todayDataObj[key][index] = 0
        //                             }
        //                             powerSumArr[index] += todayDataObj[key][index] 
        //                         }
        //                     }
        //                 }
        //             })
    
    
        //             // 平均功率
        //             let averagePower = powerList.reduce( (pre,next)=>parseInt(pre) + parseInt(next) )
    
        //             // 最高功率
        //             let highestPower = Math.max.apply(null,powerSumArr)
    
        //             // 全天用电量
        //             //先过滤数据，每种设备不会超过一万，超过强制为1千
        //             todayPowerTotalList.forEach((item,index)=>{
        //                 if (item > 100000) {
        //                     todayPowerTotalList[index] = 1000
        //                 }else {
        //                     if (item < 0) {
        //                         todayPowerTotalList[index] = 0
        //                     }
        //                 }
        //             })
        //             let todayPowerTotal = todayPowerTotalList.reduce( (pre,next)=>parseInt(pre) + parseInt(next) )
        //             str.push({name:row.name,averagePower,highestPower,todayPowerTotal})
        //             }
        //         ).catch(
        //             (err)=>{
        //                 //_this.setState({loading:false})
        //                 message.error(err.msg,2.5)
        //             }
        //         )
        //         http.post('/get_history_data_padded', {
        //             pointList: pointList,
        //             ...{
        //                 "timeStart":yesterdayStart,
        //                 "timeEnd":yesterdayEnd,
        //                 "timeFormat":"m1"
        //             }
        //           }).then(
        //             data=>{
        //                 if(data.error){
        //                     throw new Error(data.msg)
        //                 }
        //                 var powerList = [],
        //                     yesterdayPowerTotalList = [],
        //                     powerSumArr = [],
        //                     dataObj = {}
        //                 //筛选数据，剔除数据为空的设备项    
        //                 for (var key in data.map) {
        //                     if (data.map[key] && data.map[key].length != 0) {
        //                         dataObj[key] = data.map[key]
        //                     }
        //                 }
        
        //                 for(var key in dataObj){
        //                     if(dataObj.hasOwnProperty(key)){
        //                         if(new RegExp(/Total$/).test(key)){
        //                             yesterdayPowerTotalList.push(dataObj[key][dataObj[key].length-1] - dataObj[key][0])
        //                         }else{
        //                             // 某设备昨日功率 
        //                             //powerList.push(dataObj[key][dataObj[key].length-1] - dataObj[key][0])
        //                             let originalData = (dataObj[key].reduce((pre,next)=>pre + next) / dataObj[key].length)
        //                             if (originalData <0) {
        //                                 originalData = 0
        //                             }
        //                             powerList.push(originalData) 
                                
        //                         }
        //                     }
        //                 }
        
        //                 //求最高功率前先算出同一时刻，所有设备当时刻的功率总和，即一天里机房每时刻的功率
        //                 for (var i=0;i<data.time.length; i++) {
        //                     powerSumArr.push(0)
        //                 }
        
        //                 data.time.forEach((item,index)=>{
        //                     for (var key in dataObj) {
        //                         if (dataObj.hasOwnProperty(key)) {
        //                             if (!(new RegExp(/Total$/).test(key))) {
        //                                 if (dataObj[key][index]<0 ) {
        //                                     dataObj[key][index] = 0
        //                                 }
        //                                 powerSumArr[index] += dataObj[key][index] 
        //                             }
        //                         }
        //                     }
        //                 })
        
        //                 // 平均功率
        //                 let yesterdayAveragePower = powerList.reduce( (pre,next)=>parseInt(pre) + parseInt(next) )
        
        //                 // 最高功率
        //                 let yesterdayHighestPower = Math.max.apply(null,powerSumArr)
        
        //                 // 全天用电量
        //                 let yesterdayPowerTotal = yesterdayPowerTotalList.reduce( (pre,next)=>parseInt(pre) + parseInt(next) )
        //                 str.push({name:row.name,yesterdayAveragePower,yesterdayHighestPower,yesterdayPowerTotal})
        //                 if(this.state.customGroups.length == (index+1)){
        //                     console.log("leo"+str)
        //                     _this.setState({
        //                         extraEquipment:str,
        //                         loading:false
        //                     })
        //                 }
        //             }
        //             ).catch(
        //                 (err)=>{
        //                     //_this.setState({loading:false})
        //                     message.error(err.msg,2.5)
        //                 }
        //             )
        // })
        
    }

    selectDay = () => this.setState({selectTimes : 'day'})

    // 预留
    selectWeek = () => this.setState({selectTimes : "week"})

    handleChangeDate = (dateMoment,energyDateStr) => {
        // 保存选中日期，添加进浏览器缓存中
        this.setState({energyDateStr},this.getTodayPowerTotal)
        window.localStorage.energyDateStr = energyDateStr
    }

    // 获取饼图数据
    getPieChartInfo = (color,data) => {
        this.setState({color,pieData})
    }

    handelChangeTab = (key) => {
        this.setState({
            activeKey:key
        })
      }

    render(){
        const {todayPowerTotal,averagePower,highestPower,energyDateStr,yesterdayPowerTotal,yesterdayAveragePower,yesterdayHighestPower,roomName,globalConfig} = this.state
        const str = {}
        str[roomName+"ChGroupPowerTotal"] = "冷机总能耗"
        str[roomName+"PriChWPGroupPowerTotal"] = "一次冷冻泵总功耗"
        str[roomName+"CWPGroupPowerTotal"] = "冷却泵总功耗"
        str[roomName+"CTGroupPowerTotal"] = "冷却塔总功耗"
        let currentConfig = []
        if (globalConfig.ChillerPlantRoom != undefined && globalConfig.ChillerPlantRoom.length != 0) {
            globalConfig.ChillerPlantRoom.forEach(item=>{
                if (item.RoomName === roomName) {
                    currentConfig = item
                }
            })
        }else {
            currentConfig = globalConfig.ChillerPlantRoom
        }
        if(currentConfig != undefined && currentConfig.SecChWPGroupList != null){
            str[roomName+"SecChWPGroupPowerTotal"] = "二次冷冻泵总功耗"
        }
        // if(this.state.customGroups && this.state.customGroups.length != 0){
        //     this.state.customGroups.map((item,index)=>{
        //         str[`${item.prefix}PowerTotal${item.no}`] = item.name+'总功耗'
        //     })
        // }

        return (
        <div>

           {
                this.state.Tabloading ? 
                    <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                        <Spin tip="正在读取数据"/>
                    </div>
               
                :

                    <div className={s['container']} style={{color: "#CADCE7"}} >
                        <Tabs activeKey={this.state.activeKey} onChange={this.handelChangeTab}>
                            <TabPane tab="系统1" key="1">
                                <div>
                                    <div className={s['header']}>
                                        <DatePicker
                                            onChange={this.handleChangeDate}
                                            allowClear={false}
                                            value={moment(energyDateStr)}
                                        />
                                    </div>
                                    <div className={s['top']}>
                                        <div className={s['top-left']} >
                                            {
                                                this.state.loading ? 
                                                <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                                                <Spin tip="正在读取数据"/>
                                                </div>
                                                :
                                                <div>
                                                    <div  className={s['top-left-left']} >
                                                        <div  className={s['top-left-item']} >
                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#57BB50'}} >&#xe632;</i>
                                                            <div> 
                                                                <p> <span>{Math.floor(todayPowerTotal) < 0 ? 0: Math.floor(todayPowerTotal)} </span>  </p>
                                                                当日冷冻机房总电量／kWh
                                                            </div>
                                                        </div>  
                                                        <div className={s['top-left-item']} >
                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#57BB50'}} >&#xe63b;</i>
                                                            <div> 
                                                                <p> <span>{Math.floor(todayPowerTotal * Number(this.state.price)) < 0 ? 0 : Math.floor(todayPowerTotal * Number(this.state.price)) }</span>  </p>
                                                                当日冷冻机房累计费用／元
                                                            </div>
                                                        </div>  
                                                        <div className={s['top-left-item']} >
                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#57BB50'}} >&#xe60e;</i>
                                                            <div>
                                                                <p> <span>{Math.floor(averagePower) < 0 ? 0 : Math.floor(averagePower)}</span>  </p>
                                                                当日冷冻机房平均功率／kW
                                                            </div>
                                                        </div> 
                                                        <div className={s['top-left-item']} >
                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#57BB50'}} >&#xe615;</i>
                                                            <div>
                                                                <p> <span>{Math.floor(highestPower) < 0 ? 0 :Math.floor(highestPower)}</span>  </p>
                                                                当日冷冻机房最高功率／kW
                                                            </div>
                                                        </div> 
                                                        {
                                                            this.state.extraEquipment != undefined && this.state.extraEquipment.length != 0?
                                                            this.state.extraEquipment.map((item,index)=>{
                                                                if(item.todayPowerTotal != undefined){
                                                                    return <div>
                                                                        <div  className={s['top-left-item']} >
                                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#57BB50'}} >&#xe632;</i>
                                                                            <div> 
                                                                                <p> <span>{Math.floor(item.todayPowerTotal) < 0 ? 0: Math.floor(item.todayPowerTotal)} </span>  </p>
                                                                                当日{item.name}总电量／kWh
                                                                            </div>
                                                                        </div>  
                                                                        <div className={s['top-left-item']} >
                                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#57BB50'}} >&#xe63b;</i>
                                                                            <div> 
                                                                                <p> <span>{Math.floor(item.todayPowerTotal * Number(this.state.price)) < 0 ? 0 : Math.floor(item.todayPowerTotal * Number(this.state.price)) }</span>  </p>
                                                                                当日{item.name}累计费用／元
                                                                            </div>
                                                                        </div>  
                                                                        <div className={s['top-left-item']} >
                                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#57BB50'}} >&#xe60e;</i>
                                                                            <div>
                                                                                <p> <span>{Math.floor(item.averagePower) < 0 ? 0 : Math.floor(item.averagePower)}</span>  </p>
                                                                                当日{item.name}平均功率／kW
                                                                            </div>
                                                                        </div> 
                                                                        <div className={s['top-left-item']} >
                                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#57BB50'}} >&#xe615;</i>
                                                                            <div>
                                                                                <p> <span>{Math.floor(item.highestPower) < 0 ? 0 :Math.floor(item.highestPower)}</span>  </p>
                                                                                当日{item.name}最高功率／kW
                                                                            </div>
                                                                        </div> 
                                                                    </div>
                                                                }
                                                            })
                                                            :
                                                            ''
                                                        }

                                                    </div> 
                                                    <div  className={s['top-left-right']} >
                                                        <div  className={s['top-left-item']} >
                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#B98434'}} >&#xe632;</i>
                                                            <div> 
                                                                <p> <span>{Math.floor(yesterdayPowerTotal) < 0 ? 0: Math.floor(yesterdayPowerTotal)} </span>  </p>
                                                                昨日冷冻机房总电量／kWh
                                                            </div>
                                                        </div>  
                                                        <div className={s['top-left-item']} >
                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#B98434'}} >&#xe63b;</i>
                                                            <div> 
                                                                <p> <span>{Math.floor(yesterdayPowerTotal * Number(this.state.price)) < 0 ? 0 : Math.floor(yesterdayPowerTotal * Number(this.state.price)) }</span>  </p>
                                                                昨日冷冻机房累计费用／元
                                                            </div>
                                                        </div>  
                                                        <div className={s['top-left-item']} >
                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#B98434'}} >&#xe60e;</i>
                                                            <div>
                                                                <p> <span>{Math.floor(yesterdayAveragePower) < 0 ? 0 : Math.floor(yesterdayAveragePower)}</span>  </p>
                                                                昨日冷冻机房平均功率／kW
                                                            </div>
                                                        </div> 
                                                        <div className={s['top-left-item']} >
                                                            <i className={cx(s['icon'],'iconfont')} style={{color:'#B98434'}} >&#xe615;</i>
                                                            <div>
                                                                <p> <span>{Math.floor(yesterdayHighestPower) < 0 ? 0 :Math.floor(yesterdayHighestPower)}</span>  </p>
                                                                昨日冷冻机房最高功率／kW
                                                            </div>
                                                        </div> 
                                                        {
                                                            this.state.extraEquipment != undefined && this.state.extraEquipment.length != 0?
                                                            this.state.extraEquipment.map((item,index)=>{
                                                                if(item.yesterdayPowerTotal != undefined){
                                                                    return  <div>
                                                                                <div  className={s['top-left-item']} >
                                                                                    <i className={cx(s['icon'],'iconfont')} style={{color:'#B98434'}} >&#xe632;</i>
                                                                                    <div> 
                                                                                        <p> <span>{Math.floor(item.yesterdayPowerTotal) < 0 ? 0: Math.floor(item.yesterdayPowerTotal)} </span>  </p>
                                                                                        昨日{item.name}总电量／kWh
                                                                                    </div>
                                                                                </div>  
                                                                                <div className={s['top-left-item']} >
                                                                                    <i className={cx(s['icon'],'iconfont')} style={{color:'#B98434'}} >&#xe63b;</i>
                                                                                    <div> 
                                                                                        <p> <span>{Math.floor(item.yesterdayPowerTotal * Number(this.state.price)) < 0 ? 0 : Math.floor(item.yesterdayPowerTotal * Number(this.state.price)) }</span>  </p>
                                                                                        昨日{item.name}累计费用／元
                                                                                    </div>
                                                                                </div>  
                                                                                <div className={s['top-left-item']} >
                                                                                    <i className={cx(s['icon'],'iconfont')} style={{color:'#B98434'}} >&#xe60e;</i>
                                                                                    <div>
                                                                                        <p> <span>{Math.floor(item.yesterdayAveragePower) < 0 ? 0 : Math.floor(item.yesterdayAveragePower)}</span>  </p>
                                                                                        昨日{item.name}平均功率／kW
                                                                                    </div>
                                                                                </div> 
                                                                                <div className={s['top-left-item']} >
                                                                                    <i className={cx(s['icon'],'iconfont')} style={{color:'#B98434'}} >&#xe615;</i>
                                                                                    <div>
                                                                                        <p> <span>{Math.floor(item.yesterdayHighestPower) < 0 ? 0 :Math.floor(item.yesterdayHighestPower)}</span>  </p>
                                                                                        昨日{item.name}最高功率／kW
                                                                                    </div>
                                                                                </div> 
                                                                            </div>
                                                                }
                                                            })
                                                            :
                                                            ''
                                                        }

                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <div className={s['top-right']} style={{overflow:'hidden'}}>
                                            <h2 style={{color: "#CADCE7",display:'inline-block'}}>{this.state.initName}逐时能耗</h2>
                                            <div style={{display:'inline-block',marginLeft:20}}>
                                                <Button onClick={()=>{this.setState({initName:'冷机',powerTotalPiont:this.state.roomName+'ChGroupPowerTotal'})}}>冷机</Button>
                                                <Button onClick={()=>{this.setState({initName:'冷却泵',powerTotalPiont:this.state.roomName+'CWPGroupPowerTotal'})}}>冷却泵</Button>
                                                <Button onClick={()=>{this.setState({initName:'冷却塔',powerTotalPiont:this.state.roomName+'CTGroupPowerTotal'})}}>冷却塔</Button>
                                                <Button onClick={()=>{this.setState({initName:'一次冷冻泵',powerTotalPiont:this.state.roomName+'PriChWPGroupPowerTotal'})}}>一次冷冻泵</Button>
                                                {
                                                    currentConfig != undefined && currentConfig.SecChWPGroupList != null?
                                                    <Button onClick={()=>{this.setState({initName:'二次冷冻泵',powerTotalPiont:this.state.roomName+'SecChWPGroupPowerTotal'})}}>二次冷冻泵</Button>
                                                    :
                                                    ''
                                                }
                                                {
                                                this.state.customGroups && this.state.customGroups.length != 0?
                                                    this.state.customGroups.map((item,index)=>{
                                                        return <Button onClick={()=>{this.setState({initName:item.name,powerTotalPiont:`${item.prefix}PowerTotal${item.no}`})}}>{item.name}</Button>
                                                    })
                                                :
                                                ''
                                                }
                                            </div>
                                            <ChartView
                                                point={this.state.powerTotalPiont}
                                                energyDateStr={energyDateStr}
                                                roomName={this.state.roomName}
                                            />
                                        </div>
                                    </div>
                                    <div  className={s['bottom']}>
                                        <div className={s['energy']} >
                                            <div className={s['energy-title']}>
                                                <h2 style={{color: "#CADCE7"}}>各时段能耗统计</h2>
                                                <Button onClick={this.selectDay} type={this.state.selectTimes === 'day' ? "primary" : 'default'} >日</Button>
                                            </div>
                                            <div className={s['energy-details']} >
                                                <div  className={s['energy-pie']} >
                                                    <PieChart
                                                        pieChartTimeRange={this.state.pieChartTimeRange}
                                                        energyDateStr={energyDateStr}
                                                        getPieChartInfo={this.getPieChartInfo}
                                                        roomName={this.state.roomName}
                                                        equipmentdescribe = {str}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={s['equipment']}>
                                            <TableView
                                                config = {this.props.config}
                                                globalConfig={this.state.globalConfig}
                                                searchData={this.props.searchData}
                                                initialPointList  = {this.initialPointList}
                                                roomName={this.state.roomName}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabPane>
                            
                        </Tabs>
                        
                    </div>
           }
          </div>  
        )
    }
}

export default EnergyManageView ;


