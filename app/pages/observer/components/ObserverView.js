/**
 * Observer 页面
 */

import React from 'react';
import { Icon, Spin, Modal, DatePicker, Button ,TimePicker,Card,Tag, Input} from 'antd';
import s from './ObserverView.css';
import ObserverScreen from './core/observerScreen';
import OptimizeValueModal from '../../modal/components/OptimizeValueModalView';
import { getWidgetByType } from './widgets';
import moment from 'moment';
import http from '../../../common/http';
import appConfig from '../../../common/appConfig';
import ModelText from './core/entities/modelText';

var cardWrap = "rectanglePanelCard"
var cardWrapList = ["rectanglePanelCard","","ractanglesDark"]

class Observer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            text: "",
            customList: [],
            reportList: this.props.reportList ? this.props.reportList : [],
            energyList: this.props.energyList || [],
            panels:[]
        };
        this.divRef = null;
        this.observerScreen = null;
        this.saveDivRef = this.saveDivRef.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.hideLoading = this.hideLoading.bind(this);
        this.renderScreen = this.renderScreen.bind(this);
        this.closeRealTimeFresh = this.closeRealTimeFresh.bind(this);
        this.closeObserver = this.closeObserver.bind(this)
        this.startRealTimeFresh = this.startRealTimeFresh.bind(this);
        this.initHistroyData = this.initHistroyData.bind(this);
        this.initObserverCheckboxs = this.initObserverCheckboxs.bind(this);
        this.getComponent = this.getComponent.bind(this)
        this.getTimePicker = this.getTimePicker.bind(this);
        this.getRectanglePanel = this.getRectanglePanel.bind(this);
        this.getPanel = this.getPanel.bind(this);
        this.showChangeTimeModal = this.showChangeTimeModal.bind(this)
        this.getPicker = this.getPicker.bind(this);
        this.getPickerRead = this.getPickerRead.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
    }
    saveDivRef(divRef) {
        this.divRef = divRef;
    }
    showLoading(text) {
        let sText = "正在加载页面..."
        if (text) {
            sText = text
        }
        this.props.toggleLoading(true)
        this.setState({
            loading: true,
            text: sText
        });
    }
    hideLoading() {
        this.props.toggleLoading(false)
        this.setState({
            loading: false
        });
    }
    // 计算h5控件宽高和坐标
    getStyle = (calH, calW, calX, calY) => {
        var catchedContainerStyle = window.getComputedStyle(document.getElementById('observerContainer'))
        // console.info( catchedContainerStyle.width,catchedContainerStyle.height )
        let width = Math.floor(parseInt(catchedContainerStyle.width) * calW),
            height = Math.floor(parseInt(catchedContainerStyle.height) * calH),
            left = Math.floor(parseInt(catchedContainerStyle.width) * calX),
            top = Math.floor(parseInt(catchedContainerStyle.height) * calY)
        return { width, height, left, top }
    }

    componentDidMount() {
        this.renderScreen();
        var _this = this

    }

    componentWillReceiveProps(nextProps) {
        if (this.props.params.id !== nextProps.params.id) {
            // 初始化自定义控件的实时数据
            let ss = document.getElementById('svgChart');
            if(ss != null){
            ss.innerHTML = '';
            }
            // console.log("===切换菜单时 初始化refreshCustomData([])" )

            this.props.refreshCustomData([])
            this.props.refreshCustomDataInModal([])
            //停止动态表格的定时setting
            this.props.settingTableDataFlagFun(false)
            if (nextProps.params.id != 'undefined') {
                if (this.observerScreen) {
                    this.observerScreen.close();
                }
                this.renderScreen(nextProps.params.id);
            }
        }
        // 获取到每个h5控件的实例，包含属性points数组，每个点里包含的数据，根据当前这个实例的type
        if (this.props.customList !== nextProps.customList) {
            // customList是实例
            let calCustomList = nextProps.customList.map(custom => {
                const { width, height, left, top } = this.getStyle(custom['calH'], custom['calW'], custom['calX'], custom['calY'])
                custom['style']['width'] = width
                custom['style']['height'] = height
                custom['style']['left'] = left
                custom['style']['top'] = top
                return custom
            })
            // 先获取容器计算的w,h
            this.setState({
                customList: calCustomList
            })
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.loading !== this.state.loading) {
            this.state.panels = []
            return true;
        }
        if (nextProps.bShowTimeShaft !== this.props.bShowTimeShaft) {
            return true;
        }
        if (nextProps.LightControlDataSource !== this.props.LightControlDataSource) {
            return true;
        }
        let pointvalue = this.props.custom_realtime_data.map(point => point.value).join(''),
            _pointvalue = nextProps.custom_realtime_data.map(point => point.value).join('');

        let pointvalueTable = this.props.custom_table_data.map(point => point.value).join(''),
            _pointvalueTable = nextProps.custom_table_data.map(point => point.value).join('');

        let timevalue = this.props.timePicker_realtime_data.map(point => point.value).join(''),
            _timevalue = nextProps.timePicker_realtime_data.map(point => point.value).join('');

        let efficiencyValue = this.props.point_realtime_data.map(point => point.value).join(''),
            _efficiencyValue = nextProps.point_realtime_data.map(point => point.value).join('');

        if (efficiencyValue ==_efficiencyValue){
            return true
        }
        if (timevalue !== _timevalue) {
            return true
        }

        if (pointvalue !== _pointvalue) {
            return true
        }

        if (pointvalueTable != _pointvalueTable || _pointvalueTable === "0") {
            //this.props.tableLoadingFun(false)
            return true
        }

        return false;
    }
    componentWillUnmount() {
        if (this.observerScreen) {
            this.observerScreen.close();
        }
    }
    closeRealTimeFresh() {
        this.observerScreen.stop()
    }

    closeObserver() {
        this.observerScreen.close()
    }

    initHistroyData(dictDate) {
        return this.observerScreen.initHistroyData(dictDate)
    }
    //退出回放，开始实时刷新
    startRealTimeFresh() {
        this.observerScreen.resite();
        this.observerScreen.show();
    }

    initObserverCheckboxs(dateDict) {
        this.observerScreen.initCheckboxs(dateDict)
    }
    showChangeTimeModal(name, value,timeFormat,timeFixed) {
        this.props.showTimeModal({
            name, value,timeFormat,timeFixed
        })
    }
    // get custom layouts
    getComponent() {
        // const {customList} = this.state
        const { customList, custom_realtime_data, point_realtime_data, tableLoading, custom_table_data
            , getTendencyModal, showCommomAlarm, showMainInterfaceModal, customNameList, LightControlList, LightControlLoading,
            LightControlIndex, LightControlDataSource, LightControlIndexOf, LightControlData, LightControlColoum, LightControlColoums
            , LightControlShow, LightControlVisible, CurrentValue, ValueSetting, SwitchControlShow, SwitchControlVisible, ChangeControlShow, LightControlChange,
            AHUControlData, AHUControlDataSource, AHUloading, AHUloadingVisiable, AHUSwitch, AHUSwitchVisiable, AHUSetting, AHUSettingVisiable,
            LightData, LightingControlDataSource, Lightloading, LightingloadingVisiable, LightSwitch, LightingSwitchVisiable, LightSetting, LightingSettingVisiable,
            showObserverModal,showObserverSecModal,createGuarantee,repair,showGuarantee,viewExperience,RepairDataAction,getToolPoint,
            FAUData, FAUControlDataSource, FAUloading, FAUloadingVisiable, FAUSwitch, FAUSwitchVisiable, FAUSetting, FAUSettingVisiable,
            FANData, FANControlDataSource, FANloading, FANloadingVisiable, FANSwitch, FANSwitchVisiable, FANSetting, FANSettingVisiable,
            FCUData, FCUControlDataSource, FCUloading, FCUloadingVisiable, FCUSwitch, FCUSwitchVisiable, FCUSetting, FCUSettingVisiable,
            ValveData, ValveControlDataSource, Valveloading, ValveloadingVisiable, ValveSwitch, ValveSwitchVisiable, ValveSetting, ValveSettingVisiable,
            EnvironmentData,EnvironmentControlDataSource,Environmentloading, EnvironmentloadingVisiable, EnvironmentSwitch, EnvironmentSwitchVisiable, EnvironmentSetting,EnvironmentSettingVisiable,
        } = this.props
        let Components = []

        try {
            customList.forEach(row => {
                const widget = getWidgetByType(row.type)
                if (!widget) {
                    throw new Error(`CustomComponet: Widget type '${row.type}' is not available.`)
                }
                let Component = widget.component;
                Components.push(
                    <Component
                        {...row}
                        showModal={this.props.showModal}
                        tableOneClick={this.props.tableOneClick}
                        refreshReportFun={this.props.refreshReportFun}
                        refreshBenchmarkFun={this.props.refreshBenchmarkFun}
                        refreshBenchmark={this.props.refreshBenchmark}
                        custom_realtime_data={custom_realtime_data}
                        point_realtime_data={point_realtime_data}
                        tableLoading={tableLoading}
                        tableLoadingFun={this.props.tableLoadingFun}
                        custom_table_data={custom_table_data}
                        getTendencyModal={getTendencyModal}
                        showCommomAlarm={showCommomAlarm}
                        showMainInterfaceModal={showMainInterfaceModal}
                        customNameList={customNameList}
                        LightControlList={LightControlList}
                        LightControlLoading={LightControlLoading}
                        LightControlIndexOf={LightControlIndexOf}
                        LightControlData={LightControlData}
                        LightControlIndex={LightControlIndex}
                        LightControlDataSource={LightControlDataSource}
                        LightControlColoum={LightControlColoum}
                        LightControlColoums={LightControlColoums}
                        LightControlShow={LightControlShow}
                        LightControlVisible={LightControlVisible}
                        ValueSetting={ValueSetting}
                        CurrentValue={CurrentValue}
                        SwitchControlShow={SwitchControlShow}
                        SwitchControlVisible={SwitchControlVisible}
                        ChangeControlShow={ChangeControlShow}
                        LightControlChange={LightControlChange}
                        AHUControlData={AHUControlData}
                        AHUControlDataSource={AHUControlDataSource}
                        AHUloadingVisiable={AHUloadingVisiable}
                        AHUloading={AHUloading}
                        AHUSwitch={AHUSwitch}
                        AHUSwitchVisiable={AHUSwitchVisiable}
                        AHUSetting={AHUSetting}
                        AHUSettingVisiable={AHUSettingVisiable}
                        LightData={LightData}
                        LightingControlDataSource={LightingControlDataSource}
                        LightingloadingVisiable={LightingloadingVisiable}
                        Lightloading={Lightloading}
                        LightSwitch={LightSwitch}
                        LightingSwitchVisiable={LightingSwitchVisiable}
                        LightSetting={LightSetting}
                        LightingSettingVisiable={LightingSettingVisiable}
                        showObserverModal={showObserverModal}
                        showObserverSecModal={showObserverSecModal}
                        RepairDataAction = {RepairDataAction}
                        getToolPoint={getToolPoint}
                        FAUData={FAUData}
                        FAUControlDataSource={FAUControlDataSource}
                        FAUloadingVisiable={FAUloadingVisiable}
                        FAUloading={FAUloading}
                        FAUSwitch={FAUSwitch}
                        FAUSwitchVisiable={FAUSwitchVisiable}
                        FAUSetting={FAUSetting}
                        FAUSettingVisiable={FAUSettingVisiable}
                        FANData={FANData}
                        FANControlDataSource={FANControlDataSource}
                        FANloadingVisiable={FANloadingVisiable}
                        FANloading={FANloading}
                        FANSwitch={FANSwitch}
                        FANSwitchVisiable={FANSwitchVisiable}
                        FANSetting={FANSetting}
                        FANSettingVisiable={FANSettingVisiable}
                        FCUData={FCUData}
                        FCUControlDataSource={FCUControlDataSource}
                        FCUloadingVisiable={FCUloadingVisiable}
                        FCUloading={FCUloading}
                        FCUSwitch={FCUSwitch}
                        FCUSwitchVisiable={FCUSwitchVisiable}
                        FCUSetting={FCUSetting}
                        FCUSettingVisiable={FCUSettingVisiable}
                        ValveData={ValveData}
                        ValveControlDataSource={ValveControlDataSource}
                        ValveloadingVisiable={ValveloadingVisiable}
                        Valveloading={Valveloading}
                        ValveSwitch={ValveSwitch}
                        ValveSwitchVisiable={ValveSwitchVisiable}
                        ValveSetting={ValveSetting}
                        ValveSettingVisiable={ValveSettingVisiable}
                        EnvironmentData={EnvironmentData}
                        EnvironmentControlDataSource={EnvironmentControlDataSource}
                        EnvironmentloadingVisiable={EnvironmentloadingVisiable}
                        Environmentloading={Environmentloading}
                        EnvironmentSwitch={EnvironmentSwitch}
                        EnvironmentSwitchVisiable={EnvironmentSwitchVisiable}
                        EnvironmentSetting={EnvironmentSetting}
                        EnvironmentSettingVisiable={EnvironmentSettingVisiable}
                    />
                )
            })
        } catch (err) {
            console.error(err)
            Components = []
        }
        return Components
    }

    getPicker(row,width, height, left, top) {
        //1,仅日期
        if (row.timeFixed == 1) {
            return (
                <div style={{ zIndex: 2, position: 'absolute', top: top, left: left, width: '280px', height: height, display: "inline" }} >
                    <DatePicker
                        format={row.timeFormat}
                        style={{minWidth:160,width:160}}
                        placeholder="Select Time"
                        disabled={true}
                        value={moment(row.value)}
                    />
                    <Button
                        style={{
                            display: 'inline',
                            marginLeft: '10'
                        }}
                        onClick={() => { this.showChangeTimeModal(row.bindPoint, row.value,row.timeFormat,row.timeFixed) }}
                    >修改日期</Button>
                </div>
            )
        }else {
            //2仅时间
            if (row.timeFixed == 2) {
                return(
                    <div style={{ zIndex: 2, position: 'absolute', top: top, left: left, width: '280px', height: height, display: "inline" }} >
                        <TimePicker
                            format={row.timeFormat}
                            placeholder="Select Time"
                            disabled={true}
                            value={moment(row.value,row.timeFormat)}
                        />
                        <Button
                            style={{
                                display: 'inline',
                                marginLeft: '10'
                            }}
                            onClick={() => { this.showChangeTimeModal(row.bindPoint, row.value,row.timeFormat,row.timeFixed) }}
                        >修改时间</Button>
                    </div>
                )
           
            }else{
                return(
                    <div style={{ zIndex: 2, position: 'absolute', top: top, left: left, width: '250px', height: height, display: "inline" }} >
                        <Input size="small" style={{width:140}} value={moment(row.value).format(row.timeFormat)}/>
                        <Button
                            style={{
                                display: 'inline',
                                marginLeft: '5'
                            }}
                            size="small"
                            onClick={() => { this.showChangeTimeModal(row.bindPoint, row.value,row.timeFormat,row.timeFixed) }}
                        >修改时间</Button>
                    </div>
                )
                
            }
        }
    }

    getPickerRead(row,width, height, left, top) {
        //1,仅日期
        if (row.timeFixed == 1) {
            return(
                <div style={{ zIndex: 2, position: 'absolute', top: top, left: left, width: '280px', height: height, display: "inline" }} >
                    <DatePicker
                        format={row.timeFormat}
                        placeholder="Select Time"
                        disabled={true}
                        value={moment(row.value)}
                    />
                </div>
            )
        }else {
            //2仅时间
            if (row.timeFixed == 2) {
                return(
                    <div style={{ zIndex: 2, position: 'absolute', top: top, left: left, width: '280px', height: height, display: "inline" }} >
                        <TimePicker
                            format={row.timeFormat}
                            placeholder="Select Time"
                            disabled={true}
                            value={moment(row.value)}
                        />
                    </div>
                )
             
            }else{
                return(
                    <div style={{ zIndex: 2, position: 'absolute', top: top, left: left, width: '280px', height: height, display: "inline" }} >
                        <DatePicker
                            showTime
                            format={row.timeFormat}
                            placeholder="Select Time"
                            disabled={true}
                            value={moment(row.value)}
                        />
                    </div>
                )
               
            }
        }
    }   

    //右击文本事件
    onContextMenu (e,value,desc,pointName,type) {
        e.preventDefault() 
        // 设置属性是否在弹窗里面
        let  isInfo = {
            "isInModal":false
        }
            e.offsetX = e.clientX-5,
            e.offsetY = e.clientY-90
        //重新定义函数，继承原函数所有的属性和函数        
        let  model = new ModelText()
        model.options = {
            getTendencyModal: this.props.getTendencyModal,
            showCommomAlarm: this.props.showCommomAlarm,
            showMainInterfaceModal:this.props.showMainInterfaceModal,
            getToolPoint:this.props.getToolPoint
        }
        model.description = desc
        model.idCom = pointName
        model.value = value
        model.sourceType = type
        let clientWidth = document.body.clientWidth,
        clientHeight = document.body.clientHeight - 32 - 56 - 48;
        let widthScale = 0, heightScale = 0;
        widthScale = clientWidth/1920 
        heightScale = clientHeight/955
        model.showModal(e,isInfo,widthScale,heightScale)
    }

    getPanel(row,width, height, left, top) {
        return(
            <div className={cardWrap} >
            {
                row.pointList.length >0 ?         
                    <Card title={row.title} headStyle={{color:row.titleColor?row.titleColor:'',
                        borderTopLeftRadius: row.roundOrNot==1? (row.roundXPox?row.roundXPox:'') :'',
                        borderTopRightRadius: row.roundOrNot==1? (row.roundXPox?row.roundXPox:'') :'',
                        fontSize: row.titleSize?row.titleSize:''
                    }}
                    bodyStyle={{
                        borderBottomLeftRadius: row.roundOrNot==1? (row.roundYPox?row.roundYPox:'') :'',
                        borderBottomRightRadius: row.roundOrNot==1? (row.roundYPox?row.roundYPox:'') :'',
                    }}
                    style={{
                        backgroundColor:row.fillColor+",0)" ,
                        zIndex: 2, 
                        position: 'absolute', 
                        top: top, 
                        left: left, 
                        width: width, 
                        height: height,
                        borderBottomLeftRadius: row.roundOrNot==1? (row.roundYPox?row.roundYPox:'') :'',
                        borderBottomRightRadius: row.roundOrNot==1? (row.roundYPox?row.roundYPox:'') :'',
                        borderTopLeftRadius: row.roundOrNot==1? (row.roundXPox?row.roundXPox:'') :'',
                        borderTopRightRadius: row.roundOrNot==1? (row.roundXPox?row.roundXPox:'') :'',
                    }} >
                        {
                            row.pointList.map(item=>{
                                return(
                                    <div style={{fontSize:row.bodySize,lineHeight:"30px"}}>
                                        <div style={{width:'70%',float:'left',display:'flex',flexDirection:'row',alignItems:'center'}}>
                                            <img src={appConfig.imageUrl +`/${item.img}.png`} alt=""style={{marginRight:'10px',width:row.bodySize +5+ 'px'}}  />
                                            <span style={{color:row.descColor?row.descColor:''}}>{item.desc}</span>
                                        </div>
                                        <div style={{width:'30%',float:'right',color:row.bodyColor?row.bodyColor:''}}>
                                            <div style={{float:'left',cursor:"pointer"}} onContextMenu={(e)=>this.onContextMenu(e,item.value,item.desc,item.name,item.type)}>{item.value}</div>
                                            <div style={{float:'right'}}>{item.unit}</div>
                                            <div style={{clear:'both'}}></div>
                                        </div>
                                        {/* <span style={{position: 'absolute',  left:row.bodySize +40+'px',color:row.descColor,fontSize:row.descSize}} >{item.desc}</span>
                                        <span style={{position: 'absolute',right:'73px',color:row.bodyColor,fontSize:row.bodySize,cursor:"pointer"}} onContextMenu={(e)=>this.onContextMenu(e,item.value,item.desc,item.name)} >{item.value}</span>
                                        <span style={{position: 'absolute',right:'20px',color:row.bodyColor,fontSize:row.bodySize}} >{item.unit}</span> */}
                                    </div>
                                      
                                ) 

                            })
                        }
                    </Card>
                   
                :
                    <div style={{pointerEvents:'none'}}>
                        <Card title={row.title} style={{backgroundColor:row.fillColor+",0)", zIndex: 2, position: 'absolute', top: top, left: left, width: width, height: height}} >
                            {
                                row.pointList.map(item=>{
                                    return(
                                        <p>
                                            <img src={appConfig.imageUrl +`/${item.img}.png`} alt=""style={{height:row.bodySize+"px",width:row.bodySize,verticalAlign:"baseline"}}  />
                                            <span style={{position: 'absolute',  left:row.bodySize +40+'px',color:row.descColor,fontSize:row.descSize}} >{item.desc}</span>
                                            <span style={{position: 'absolute',right:'73px',color:row.bodyColor,fontSize:row.bodySize,cursor:"pointer"}} onContextMenu={(e)=>this.onContextMenu(e,item.value,item.desc,item.name,item.type)} >{item.value}</span>
                                            <span style={{position: 'absolute',right:'20px',color:row.bodyColor,fontSize:row.bodySize}} >{item.unit}</span>
                                        </p>  
                                    ) 

                                })
                            }
                        </Card>
                    </div>

            }
            </div> 
           
         
        )
    }


    getTimePicker() {
        const { timePickerList, timePicker_realtime_data } = this.props
        let Timepickers = []

        try {
            timePickerList.forEach(row => {
                const { width, height, left, top } = this.getStyle(row['calH'], row['calW'], row['calX'], row['calY'])
                let value = moment().format(row.timeFormat)
                if (timePicker_realtime_data != undefined && timePicker_realtime_data.length > 0) {
                    timePicker_realtime_data.forEach(item => {
                        //console.log(moment(item.value))
                        if (item.name === row.bindPoint && item.value != '0') {
                            row['value'] = item.value
                            
                       
                        }
                    })
                }
                Timepickers.push(
                    row.rw ==1 ?
                        this.getPicker(row,width, height, left, top)
                    :
                    this.getPickerRead(row,width, height, left, top)
                )
            })

        } catch (err) {
            console.error(err)
            Timepickers = []
        }

        return Timepickers
    }
 

    getRectanglePanel() {
        const { rectanglesPanelList, rectangles_panel_data } = this.props
        let panels = []
        try {
            rectanglesPanelList.forEach(row => {
                const { width, height, left, top } = this.getStyle(row['calH'], row['calW'], row['calX'], row['calY'])
                cardWrap = cardWrapList[row.rectStyle-1]
                if (rectangles_panel_data != undefined && rectangles_panel_data.length > 0) {
                    rectangles_panel_data.forEach(item => {
                        if(row.pointList.length>0) {
                            row.pointList.map(obj =>{
                                //找出对应点值
                                if (item.name === obj.name && item.value != undefined) {
                                    //根据配置保留小数位数
                                    if (obj.decimal != undefined) {
                                        obj['value'] = Number(item.value).toFixed(obj.decimal)
                                    }else {
                                        obj['value'] = item.value
                                    }
                                }
                            })
                        }
                    })
                    panels.push(
                        this.getPanel(row,width, height, left, top)
                    )
                }else {
                    //当面板没有绑点的时候，也支持显示标题和边框
                    panels.push(
                        this.getPanel(row,width, height, left, top)
                    )
                }
            })

        } catch (err) {
            console.error(err)
        }

        return panels
    }

    renderScreen(id, bShowTimeShaft) {
        let newId = id || this.props.params.id
        if(newId == undefined || newId == 'undefined'){
            if(this.props.parmsDict.pageId != undefined && this.props.parmsDict.pageId != 'undefined'){
                newId = this.props.parmsDict.pageId
                console.log('leo1+'+newId)
            }else{
                newId = localStorage.getItem('selectedPageId')
                console.log('leo2+'+newId)
            }
        }
        console.log('leo3+'+newId)
        this.observerScreen = new ObserverScreen(newId, this.divRef, {
            showLoading: this.showLoading,
            hideLoading: this.hideLoading,
            showObserverModal: this.props.showObserverModal,
            showObserverSecModal:this.props.showObserverSecModal,
            showOptimizeModal: this.props.showOptimizeModal,
            showMainOperatingPane: this.props.showOperatingModal,
            showMainCheckboxModal: this.props.showMainCheckboxModal,
            showOperatingTextModal: this.props.showOperatingTextModal,
            updateFullPageState: this.props.updateFullPageState,
            getToolPoint: this.props.getToolPoint,
            showCommomAlarm: this.props.showCommomAlarm,
            getTendencyModal: this.props.getTendencyModal, //展示趋势模态框
            showMainInterfaceModal: this.props.showMainInterfaceModal,
            bShowTimeShaft: bShowTimeShaft || this.props.bShowTimeShaft, //判断值，判断是否开启实时刷新
            dateProps: this.props.dateModal.props,
            refreshCustomData: this.props.refreshCustomData,
            refreshCustomDataInModal: this.props.refreshCustomDataInModal,
            getCustomRealTimeData: this.props.getCustomRealTimeData,
            getPointRealTimeData: this.props.getPointRealTimeData,
            getTimePickerRealTimeData: this.props.getTimePickerRealTimeData,
            getRectanglesPanelData: this.props.getRectanglesPanelData,
            getCustomTableData: this.props.getCustomTableData,
            refreshTimePickerData: this.props.refreshTimePickerData,
            refreshRectanglePanelData: this.props.refreshRectanglePanelData,
            getPointNameList: this.props.getPointNameList,
            createGuarantee:this.props.createGuarantee,
            repair:this.props.repair,
            showGuarantee:this.props.showGuarantee,
            viewExperience:this.props.viewExperience,
        });
        //保存方法
        this.props.observerScreenParms({
            pageId: newId, //页面id
            divRef: this.divRef, //容器
            closeRealTimeFresh: this.closeRealTimeFresh, //关闭实时刷新
            closeObserver: this.closeObserver,
            initHistroyData: this.initHistroyData, //刷新历史数据
            renderScreen: this.renderScreen,
            startRealTimeFresh: this.startRealTimeFresh,
            initObserverCheckboxs: this.initObserverCheckboxs
        })
        this.observerScreen.show();
    }

    render() {
        const { params, bShowTimeShaft, switchVisible, reportList, setPageLoading
            // , tendencyVisible, tendencyData, hideTendencyModal
        } = this.props;


        //捕捉意外，打印
        // process.on('uncaughtException', function (err) {
        //     console.log(err.stack);
        // });
        try{
            return (
                <Spin tip={this.state.text} spinning={this.state.loading} wrapperClassName="absolute-spin">
                    <div
                        id="observerContainer"
                        className={s['container']}
                    >
                        <div className={s['observer-container']} ref={this.saveDivRef}>
                        </div>
                        {this.getComponent()}
                        {this.getTimePicker()}
                        {this.getRectanglePanel()}
                    </div>
    
                </Spin>
            );
        }catch(e){
            console.log(e)
        }
     
    }
}

Observer.propTypes = {
};



export default Observer;
