import http from '../../../../common/http';
import appConfig from '../../../../common/appConfig';
import { getColor, downloadUrl } from '../../../../common/utils';
import CheckWorker from '../../../../common/checkWorker'
import { jumpUrl } from '../../../../common/utils';
import React from 'react';
import questionSvg from '../../../../static/image/question.svg'

import ModelButton from './entities/modelButton';
import ModelText from './entities/modelText';
import ModelGage from './entities/modelGage';
import ModelLiquidLevel from './entities/modelLiquidLevel';
import ModelPipeline from './entities/modelPipeline';
import ModelTimePicker from './entities/modelTimePicker';
import ModelTempDistribution from './entities/modelTempDistribution';
import ModelRect from './entities/modelRect';
import ModelLine from './entities/modelLine';
import ModelStartLine from './entities/modelStartLine';
import ModelEndLine from './entities/modelEndLine';
import ModelRectangle from './entities/modelRectangle';
import ModelRectanglePanel from './entities/ModelRectanglePanel';
import ModelRuler from './entities/modelRuler';
import ModelEquipment from './entities/modelEquipment';
import ModelFix from './entities/modelFix';
import ModelStandardEquip from './entities/modelStandardEquipment';
import ModelCheckBox from './entities/modelCheckbox';
import ModelCustomControl from './entities/modelCustomControl';
import ModelPolygon from './entities/modelPolygon';
import { LineChart, BarChart, PieChart } from './entities/modelChart';
import { message, Modal, Input } from 'antd';
import { HitModel, StringTools } from './commonCanvas';
import { Stopwatch } from './timer';
import { push } from 'react-router-redux';
import { updateFullPage } from '../../../layout/modules/LayoutModule';
import { Layout_modalTypes } from '../../../../common/enum';
import { store } from '../../../../index.js';
import ObserverWorker from './observer.worker.js';
import ObserverWorkerFloat from './observerFloat.worker.js';
import { func } from 'prop-types';
import { resolve } from 'path';
const remote = require('@electron/remote')
const { Menu, MenuItem, ipcRenderer } = require('electron')
// import {Menu, MenuItem} from 'electron';
// const Menu = remote.Menu;
// const MenuItem = remote.MenuItem;

const InputPwd  = Input.Password

const fs = require('fs');
var log = require('electron-log');
var animateTime = new Date().getTime();
var animateFloatTime = new Date().getTime();
var refreshTimer = null;
var refreshFloatTimer = null;
var refreshFlag = true;
var refreshFloatFlag = true;
//var refreshRate = localStorage.getItem('refreshRate') ? Number(localStorage.getItem('refreshRate')) : 40; //获取界面刷新频率配置，默认40ms
var refreshDataArr = null;
var pretectObj = {};
var pwd = "";
var oldThis = null
const serverOmd = localStorage.getItem('serverOmd')


// process.on('uncaughtException', function (err) {
//     err = err.stack || err
//     console.error(err)
//     log.error(err);
// });

// ipcRenderer.on('context-menu-command-fix-modify',(event,conmmand,id,showGuarantee) => {
//       // if (item.id == id) {
//           showGuarantee(Number(id))
//           // ipcRenderer.removeListener('context-menu-command-fix-modify')
//       // }
//     })
//     ipcRenderer.on('context-menu-command-fix-remove',(event,conmmand,id,show) => {
//       // if (item.id == id) {
//           Modal.confirm({
//               title: '删除备注',
//               content: '是否删除备注',
//               onOk: () => {
//                   http.post('/fix/remove',{
//                       fixId:Number(id) 
//                   }).then(
//                       data=>{
//                           if(data.err==0){
//                               show()
//                           }else{
//                               message.info('删除失败')
//                           }
//                       }
//                   ).catch(
//                       err=>{
//                           if(err.err==1){
//                               message.info('删除失败')
//                           }
//                       }
//                   )
//                 }
//           })
//       // }
//     })

window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
    errorMessage = errorMessage.stack || errorMessage;
    console.log(errorMessage);
    console.log(scriptURI);
    console.log(lineNumber);
    console.log(columnNumber);
    console.log(errorObj);
    log.error(errorMessage);
}
var pointDes = [];
var flag = false;

function ObserverScreen(id, container, options) {
    this.id = id;

    this.options = options || {};
    // console.log('ObserverScreen--container')
    // console.log(container)
    this.container = container;
    this.canvasContainer = undefined;

    this.divMain = undefined;
    this.divGages = undefined;
    this.canvas = undefined;
    this.divCommon = undefined; //通用控件的容器
    this.ctx = undefined;
    this.cacheCanvas = undefined;
    this.cacheCtx = undefined;
    this.hitModel = undefined;
    this.workerUpdate = undefined;
    this.workerUpdateFloat = undefined;
    this.workerCheckInterface = undefined;
    this.isRunning = true;
    this.store = {};                      //store of all elements of this page.
    this.dictRefreshMap = undefined;      //用于存储图元绑定的点名（实时请求中会合并一起请求）
    this.bindTypeDictRefreshMap = undefined; //用于存储图元绑定的脚本（实时请求中会合并一起请求）
    this.stopWatch = undefined;

    this.dictPipelines = undefined;
    this.dictEquipments = undefined;
    this.dictFixes = undefined;
    this.dictStandardEquipments = undefined;
    this.dictCharts = undefined;
    this.dictGages = undefined;
    this.dictLiquidLevels = undefined;
    this.dictRulers = undefined;
    this.dictButtons = undefined;
    this.dictCheckboxs = undefined;
    this.dictTexts = undefined;
    this.dictTempDistributions = undefined;
    this.dictTimePicker = undefined;
    // this.dictMutiPointCustomControls = undefined;
    this.dictRects = undefined;
    this.dictLines = undefined;
    this.dictStartLines = undefined;
    this.dictEndLines = undefined;
    this.dictCustomControls = undefined;
    this.dictRectangles = undefined; //矩形-色块
    this.dictRectanglesPanel = undefined; //矩形-面板
    this.dictPolygons = undefined;

    this.dictImages = {};                 //store of all images which is used by every page elements;
    this.indexImageLoaded = 0;            //using for recording the process of loading images.


    this.isDataReady = false;
    this.isPlayback = false;              //whether this screen bases on realtime data or history data.
    this.toolContainer = undefined;       //JQuery object
    this.isTemplate = false;
    this.templateConfig = undefined;
    this.link = undefined;
    this.config = undefined;
    this.templateFileName = undefined;
    this.modalFlag = undefined;    // 用此来标记当前绘制的元素是在模态框内

}





ObserverScreen.prototype = {
    //展示初始化模态框（控制器）william
    show: function () {
        var _this = this;

        // 清理之前的svg
        let svgWrap = document.getElementById("divMain");
        if (svgWrap) {
            this.container.removeChild(svgWrap);
            // console.log('执行完 removeChild svgWrap')
        }

        // console.log(svgWrap)
        // console.log(this.container)
        if (this.container != null) {
            this.container.innerHTML = '';
        }
        // console.log('执行完this.container.innerHTML = ')
        // console.log(this.container)
        this.initContainer();



        // 初始化视图
        // console.log("===ObserverScreen 初始化refreshCustomData([])" )
        _this.refreshCustomData([])
        _this.refreshCustomDataInModal([])
        _this.refreshTimePickerData([])
        _this.refreshRectanglePanelData([])
        this.showLoading();
        // console.log('show里开始执行init()')


        this.init(_this.isTemplate, _this.templateConfig, _this.options.templateFileName)
    },

    showModal: function () {
        var _this = this;
        this.container.innerHTML = '';
        this.initContainer();

        // 初始化视图
        // console.log("===ObserverScreen 初始化refreshCustomData([])" )
        // _this.refreshCustomData([])
        _this.refreshCustomDataInModal([])
        // _this.refreshTimePickerData([])
        this.showLoading();
        this.init(_this.options.isTemplate, _this.options.templateConfig, _this.options.templateFileName)
    },

    showLoading: function (text = '') {
        if (typeof this.options.showLoading === 'function') {
            this.options.showLoading(text);
        }
    },

    hideLoading: function () {
        if (typeof this.options.hideLoading === 'function') {
            this.options.hideLoading();
        }
    },

    refreshCustomData: function (customList) {
        if (typeof this.options.refreshCustomData === 'function') {
            this.options.refreshCustomData(customList)
        }
    },

    refreshCustomDataInModal: function (customListInModal) {
        if (typeof this.options.refreshCustomDataInModal === 'function') {
            this.options.refreshCustomDataInModal(customListInModal)
        }
    },

    refreshTimePickerData: function (timePickerList) {
        if (typeof this.options.refreshTimePickerData === 'function') {
            this.options.refreshTimePickerData(timePickerList)
        }
    },

    refreshRectanglePanelData: function (rectanglesPanelList) {
        if (typeof this.options.refreshRectanglePanelData === 'function') {
            this.options.refreshRectanglePanelData(rectanglesPanelList)
        }
    },

    getCustomRealTimeData: function (data) {
        if (typeof this.options.getCustomRealTimeData === 'function') {
            this.options.getCustomRealTimeData(data)
        }
    },
    getPointRealTimeData: function (data) {
        if (typeof this.options.getPointRealTimeData === 'function') {
            this.options.getPointRealTimeData(data)
        }
    },
    //新建备注
    createGuarantee: function (data) {
        if (typeof this.options.createGuarantee === 'function') {
            this.options.createGuarantee(data)
        }
    },
    repair: function (id, x, y) {
        if (typeof this.options.repair === 'function') {
            this.options.repair(id, x, y)
        }
    },
    //显示备注修改弹窗
    showGuarantee: function (data) {
        if (typeof this.options.showGuarantee === 'function') {
            this.options.showGuarantee(data)
        }
    },
    //显示备注信息
    viewExperience: function (data) {
        if (typeof this.options.viewExperience === 'function') {
            this.options.viewExperience(data)
        }
    },
    getPointNameList: function (data) {   //获取自定义组件点名的方法
        if (typeof this.options.getPointNameList === 'function') {
            this.options.getPointNameList(data)
        }
    },
    getTimePickerRealTimeData: function (data) {
        if (typeof this.options.getTimePickerRealTimeData === 'function') {
            this.options.getTimePickerRealTimeData(data)
        }
    },

    getRectanglesPanelData: function (data) {
        if (typeof this.options.getRectanglesPanelData === 'function') {
            this.options.getRectanglesPanelData(data)
        }
    },
    getCustomTableData: function (data) {
        if (typeof this.options.getCustomTableData === 'function') {
            this.options.getCustomTableData(data)
        }
    },

    //点击按钮后，先判断即将展示的页面是全屏还是模态框
    chooseShow: function (pageId) {
        var _this = this;
        let isTemplate = false
        let templateConfig = {}
        let templateFileName = undefined
        let navigation = ""
        let pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))
        //如果pysite版本在410以上，新版本可用升级后的新接口，提高响应速度
        if (pysiteVersion >= 410) {
            http.get("/getPageType/" + appConfig.project.id + "/" + pageId)
                .then(result => {
                    if (result.pageType === 'fullscreen') {
                        _this.showFullScreenPage(pageId)
                    } else if (result.pageType === 'floating') {
                        if (typeof this.options.showObserverModal === 'function') {
                            _this.showDetailDialog(pageId, result.pageName, isTemplate, templateConfig, templateFileName, navigation, result.navJsonConfig);
                        } else {
                            if (typeof this.options.showObserverSecModal === 'function') {
                                _this.showDetailDialog_Sec(pageId, result.pageName, isTemplate, templateConfig, templateFileName, navigation, result.navJsonConfig);
                            }
                        }
                    }
                });
        } else {
            http.get("/get_plant/" + appConfig.project.id + "/" + pageId)
                .then(result => {
                    if (result.page.type === 'fullscreen') {
                        _this.showFullScreenPage(pageId)
                    } else if (result.page.type === 'floating') {
                        _this.showDetailDialog(pageId, result.page.name, isTemplate, templateConfig);
                    }
                });
        }
    },
    //标准设备链接到模态框页面，显示设备详情框
    showStandardDetailDialog: function (pageId, title, config, templateFileName, navigation) {
        let _this = this
        let isTemplate = true
        let templateConfig = config

        if (typeof this.options.showObserverModal === 'function') {
            _this.showDetailDialog(pageId, title, isTemplate, templateConfig, templateFileName, navigation);
        } else {
            if (typeof this.options.showObserverSecModal === 'function') {
                _this.showDetailDialog_Sec(pageId, title, isTemplate, templateConfig, templateFileName, navigation);
            }
        }
    },
    //若点击的按钮链接到全屏页面
    showFullScreenPage: function (pageId) {
        var _this = this;
        this.options.updateFullPageState.constructor === Object && this.options.updateFullPageState.goFullPage(pageId);
    },
    //若是链接到模态框页面，显示所有设备详情框
    showDetailDialog: function (pageId, title, isTemplate, templateConfig, templateFileName, navigation, navJsonConfig) {
        if (typeof this.options.showObserverModal === 'function') {
            this.options.showObserverModal({
                pageId,
                title,
                isTemplate,
                templateConfig,
                templateFileName,
                navigation,
                navJsonConfig
            });
        }
    },

    //二级标准设备弹框
    showDetailDialog_Sec: function (pageId, title, isTemplate, templateConfig, templateFileName, navigation, navJsonConfig) {
        if (typeof this.options.showObserverSecModal === 'function') {
            this.options.showObserverSecModal({
                pageId,
                title,
                isTemplate,
                templateConfig,
                templateFileName,
                navigation,
                navJsonConfig
            });
        }
    },

    //优化设定值
    showOptimizeValue: function (idCom, currentValue, dictBindString) {
        if (typeof this.options.showOptimizeModal === 'function') {
            this.options.showOptimizeModal({
                idCom,
                currentValue,
                dictBindString
            })
        } else if (typeof this.options.showOperatingTextModal === 'function') {
            this.options.showOperatingTextModal({
                idCom,
                currentValue
            })
        }
    },

    //设备开关操作
    showOperatingPane: function (idCom, setValue, description,preCheckScript,preCheckScriptDescription) {
        if (typeof this.options.showOperatingModal === 'function') {
            this.options.showOperatingModal({
                idCom,
                setValue,
                description,
                preCheckScript,
                preCheckScriptDescription
            })
        }
    },

    //主界面一键开关机模态框显示
    showMainOperatingPane : function (idCom, setValue, description,downloadEnableCondition,downloadURL,unsetValue,preCheckScript,preCheckScriptDescription,param10) {
        if(param10 != '' && param10 != undefined && param10.slice(param10.indexOf('|') + 1) > JSON.parse(window.localStorage.getItem('userData')).role){
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
            return
        }
        if (typeof this.options.showMainOperatingPane === 'function') {
            this.options.showMainOperatingPane(Layout_modalTypes.ONE_KEY_OPERATE_MODAL, {
                idCom,
                setValue,
                description,
                downloadEnableCondition,
                downloadURL,
                checkDownLoadEnable: this.checkDownLoadEnable.bind(this),
                unsetValue,
                preCheckScript,
                preCheckScriptDescription,
            })
        }
    },

    showMainOperatingRadio: function (idCom, setValue, description,) {
        if (typeof this.options.showMainOperatingPane === 'function') {
            this.options.showMainOperatingPane(Layout_modalTypes.SWITCH_MODAL, {
                idCom,
                setValue,
                description,
            })
        }
    },

    //主界面checkbox改值
    showMainCheckbox: function (idCom, setValue, text, unsetValue, checkboxState, desc) {
        if (typeof this.options.showMainCheckboxModal === 'function') {
            this.options.showMainCheckboxModal(Layout_modalTypes.CHECKBOX_MODAL, {
                idCom,
                setValue,
                text,
                unsetValue,
                checkboxState,
                desc
            })
        }
    },

    //checkbox按钮
    showCheckboxPane: function (idCom, setValue, text, unsetValue, checkboxState, desc, currentValue) {
        if (typeof this.options.showCheckboxModal === 'function') {
            this.options.showCheckboxModal({
                idCom,
                setValue,
                text,
                unsetValue,
                checkboxState,
                desc,
                currentValue
            })
        }
    },

    //设备详情里的启用／禁用
    showRadioPane: function (idCom, setValue, description,text ,param10) {
        if(param10 != '' && param10 != undefined && param10.slice(param10.indexOf('|') + 1) > JSON.parse(window.localStorage.getItem('userData')).role){
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
            return
        }
        if (typeof this.options.showRadioModal === 'function') {
            this.options.showRadioModal({
                idCom,
                setValue,
                description,
                text
            })
        }
    },

    //设备详情里的控制模式选项
    showSelectControlValue: function (idCom, currentValue) {
        if (typeof this.options.showSelectControlModal === 'function') {
            this.options.showSelectControlModal({
                idCom,
                currentValue
            })
        }
    },

    loginCheck: function (idCom,setValue,description) {
        http.post('/login', {
            name: JSON.parse(localStorage.getItem('userInfo')).name,
            pwd: pwd
        }).then(
            res => {
                if(res.err == 0){
                    //如果用户密码验证成功，再弹出设定值弹框
                    this.showRadioPane(idCom,setValue,description);
                }else{
                    Modal.error({
                        title: '错误提示',
                        content: '用户密码验证失败！'
                    })
                }
            }
        ).catch(
            err => {
                Modal.error({
                    title: '错误提示',
                    content: '用户密码验证失败！'
                });
            }
        )
    },

    changePwd: function ({ target: { value } }) {
        pwd = value
    },

    userCheck: function (idCom,setValue,description) {
        Modal.confirm({
            title: '用户验证',
            content: (
                <div>
                    <span style={{display:'inline-block',width:80}}>用户名：</span>
                    <Input
                        style={{ marginTop: '10px',width:180,display:'inline-block', }}
                        disabled={true}
                        value={window.localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''}
                    />
                        
                
                    <div>
                    <span style={{display:'inline-block',width:80}}>密码：</span>
                    <InputPwd
                        style={{ marginTop: '10px',width:180 }}
                        onChange={this.changePwd}
                    />
                    </div>
                </div>
            ),
            onOk: () => { this.loginCheck(idCom,setValue,description) },
            onCancel: () => {},
            okText: "确认",
            width: 400
        })
    },

    //初始化canvas容器
    initContainer: function () {
        this.divMain = document.createElement('div');
        this.divMain.id = 'divMain';
        this.divMain.style.width = '100%';
        this.divMain.style.height = '100%';

        // svg replace canvas
        let nameSpace = 'http://www.w3.org/2000/svg';
        let svgChart = document.createElementNS(nameSpace, 'svg');
        // console.log(svgChart)
        svgChart.id = 'svgChart';
        // console.log(svgChart)
        svgChart.setAttribute('class', 'svgChart');
        // console.log(svgChart)

        // let canvas = document.createElement('canvas');
        // canvas.id = 'canvasOverview';
        // canvas.style.width = '100%';
        // canvas.style.height = '100%';
        // canvas.innerHTML = '浏览器不支持 canvas';

        // this.divMain.appendChild(canvas);
        // this.container.appendChild(this.divMain);

        // this.canvasContainer = canvas;

        this.divMain.appendChild(svgChart);
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.appendChild(this.divMain);
        this.canvasContainer = svgChart;
        let svgChartLen = document.getElementsByClassName("svgChart");
        if (svgChartLen.length > 1) {
            svgChart.setAttribute('width', '100%');
            svgChart.setAttribute('height', '100%');
            //在弹框内绘制
            this.modalFlag = true
        } else {
            svgChart.setAttribute('width', 1920);
            svgChart.setAttribute('height', 950);
            this.modalFlag = false
        }
    },

    close: function () {
        // window.localStorage.removeItem('logoURL');
        // reset tooltip
        ModelText.destroy();
        ModelEquipment.destroy();
        ModelFix.destroy();
        ModelStandardEquip.destroy();
        if (this.workerUpdateFloat) {
            this.workerUpdateFloat.terminate();
            this.workerUpdateFloat.removeEventListener("message", this.refreshDataFloat, true);
        }
        this.workerUpdateFloat = null;
        for (var item in this.dictCharts) this.dictCharts[item].close();
        this.isRunning = null;
        this.canvas = null;
        this.ctx = null;
        this.cacheCanvas = null;
        this.store = null;
        this.dictRefreshMap = null;
        this.bindTypeDictRefreshMap = null;
        this.dictPipelines = null;
        this.dictGages = null;
        this.dictLiquidLevels = null;
        this.dictRulers = null;
        this.dictEquipments = null;
        this.dictFixes = null;
        this.dictStandardEquipments = null;
        this.dictButtons = null;
        this.dictTexts = null;
        this.dictCheckboxs = null;
        this.dictImages = {};
        this.dictRects = null;
        this.dictPolygons = null;
        this.dictLines = null;
        this.dictStartLines = null;
        this.dictEndLines = null;
        this.dictCustomControls = null;
        this.dictRectangles = null;
        this.dictRectanglesPanel = null;
        this.hitModel = null;
        this.stopWatch = null;
        this.container.innerHTML = '';
        this.timer = null

    },

    stop: function () {
        this.isRunning = false;
        if (this.workerUpdate) {
            this.workerUpdate.terminate();
            this.workerUpdate.removeEventListener("message", this.refreshData, true);
            this.workerUpdate.removeEventListener("message", this.refreshCustomList, true);

            this.workerUpdate = null;
        }
        if (this.workerUpdateFloat) {
            this.workerUpdateFloat.terminate();
            this.workerUpdateFloat.removeEventListener("message", this.refreshDataFloat, true);
        }
        if (this.workerCheckInterface) {
            this.workerCheckInterface.terminate();
            this.workerUpdate.removeEventListener("message", this.refreshData, true);
            this.workerUpdate.removeEventListener("message", this.refreshCustomList, true);
            this.workerCheckInterface = null
        }
    },
    resume: function () {
        //TODO
        this.isRunning = true;
        this.initWorkerForUpdating();
        requestAnimationFrame(animate);
        // setTimeout(animate,refreshRate);
    },
    //重置
    resite: function () {
        this.initScreen();
        this.renderElements();
        if (this.workerUpdate) {
            this.workerUpdate.terminate();
            this.workerUpdate.removeEventListener("message", this.refreshData, true);
            this.workerUpdate.removeEventListener("message", this.refreshCustomList, true);
            this.initWorkerForUpdating();
        }
        if (this.workerUpdateFloat) {
            this.workerUpdateFloat.terminate();
            this.workerUpdateFloat.removeEventListener("message", this.refreshDataFloat, true);
            this.initWorkerForUpdatingFloat();
        }
        if (this.workerCheckInterface) {
            this.workerCheckInterface.terminate();
            this.workerUpdate.removeEventListener("message", this.refreshData, true);
            this.workerUpdate.removeEventListener("message", this.refreshCustomList, true);
            this.workerCheckInterface()
        }
    },
    onresize: function () {
        ScreenCurrent.resite();
    },
    downloadFunc: function (downloadReportURL) {
        // downloadReportURL是一个点，则检测
        http.post('/get_realtimedata', {
            pointList: [downloadReportURL],
            proj: 1
        }).then(
            data => {
                if (data[0] && data[0]["value"]) {
                    downloadUrl(`${appConfig.serverUrl}/static/files/${data[0]["value"]}`, 'application/msword')
                } else {
                    message.error('文件不存在', 2.5)
                }
            }
        )
    },
    // 检测是否可以下载报表
    checkDownLoadEnable: function (downloadEnableCondition, downloadReportURL) {
        console.info(this)
        var _this = this,
            reg = /.docx$/i,
            regXls = /\.(?:xls|xlsx)$/i

        // reg = /\.(?:docx|xls|xlsx)$/i
        // doc = /.docx$/i
        // excel = /\.(?:xls|xlsx)$/i
        // downloadReportURL是一个文件
        if (reg.test(downloadReportURL)) {
            return http.post('/report/genWordReportByTemplate', { templateName: downloadReportURL })
                .then(
                    data => {
                        if (!data.err) {
                            downloadUrl(`${appConfig.serverUrl}/static/files/${data['data']}`, 'application/msword')
                        } else {
                            Modal.error({
                                title: '操作提示',
                                content: '文件下载失败'
                            })
                        }
                    }
                )
        }
        else {

            if (regXls.test(downloadReportURL)) {
                return http.post('/report/genExcelReportByTemplate', { templateName: downloadReportURL })
                    .then(
                        data => {
                            if (!data.err) {
                                downloadUrl(`${appConfig.serverUrl}/static/files/${data['data']}`, 'application/vnd.ms-excel')
                            } else {
                                Modal.error({
                                    title: '操作提示',
                                    content: '文件下载失败'
                                })
                            }
                        }
                    )

            } else {
                // downloadReportURL是一个点名
                // “0”：直接跳过
                if (downloadEnableCondition == 0) return false
                else if (downloadEnableCondition == 1) {
                    // 如果是“1”：直接跳过判断，去下载（当url有内容时才下载，没内容就直接退出）
                    _this.downloadFunc(downloadReportURL)
                } else if (downloadEnableCondition && downloadReportURL) {
                    // 点名”（不等于“0”，“1”），且不为空，则判断为点名，取点名的值（需要检测downloadEnableCondition是否为1）
                    this.showLoading("等待报表生成")
                    let checkWorker = new CheckWorker(function (info, next, stop) {
                        http.post('/get_realtimedata', {
                            pointList: [downloadEnableCondition],
                            proj: 1
                        }).then(
                            data => {
                                // console.info( data )
                                if (!data[0] || data[0]["value"] != 1) {
                                    next();
                                } else {
                                    // 会触发 progress 和 stop 事件
                                    // 下载文件
                                    // console.info(  '准备下载文件' )
                                    _this.hideLoading()
                                    stop();
                                }
                            }
                        )
                    }, {
                        // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
                    })
                    checkWorker
                        .on('progress', function ({ progress }) { console.info('progress', progress) })
                        .on('stop', function ({ progress }) {
                            _this.downloadFunc(downloadReportURL)
                        })
                        .on('complete', function ({ progress }) { _this.hideLoading(); message.error("报表获取失败") })
                        .start()
                }
            }

        }

    },

    initDivMainBg: function () {
        var page = this.store.page
        if (page.bgImgId) {
            // 使用背景图
            var bgImgId = page.bgImgId
            this.divMain.style.backgroundImage = `url(${appConfig.staticImage}\/plant\/project\/${bgImgId}.png`
            this.divMain.style.backgroundSize = '100% 100%'
            this.divMain.style.backgroundPosition = "center"
        } else {
            if (page.bgColor2) {
                var bgColor1 = getColor(page.bgColor1),
                    bgColor2 = getColor(page.bgColor2)
                // 使用渐变色
                this.divMain.style.background = "-webkit-linear-gradient(top," + bgColor1 + "," + bgColor2 + ")"
            } else if (page.bgColor1) {
                var bgColor1 = getColor(page.bgColor1)
                console.info(bgColor1)
                this.divMain.style.backgroundColor = bgColor1
            }
        }
    },

    init: function (isTemplate, templateConfig, templateFileName) {
        var _this = this;
        // this.isPlayback = this.options.bShowTimeShaft || this.isPlayback
        //页面显示需要的数据
        console.info(this.id)

        // //获取项目所有点的释义信息
        // http.get('/analysis/get_pointList_from_s3db/1/50000')
        // .then(
        //     data=>{
        //          if(data.status === 'OK') {
        //             pointDes =[].concat(data['data']['pointList']);
        //         }
        //     }  
        // ).catch(
        //    err => {
        //         message.error('服务器访问失败!',0.5);
        //         // console.log(err)
        //     }
        // );


        if (localStorage.getItem('allPointList') != undefined) {
            pointDes = JSON.parse(localStorage.getItem('allPointList'));
        }
        localStorage.setItem('modalId',this.id)
        if (!isTemplate) {
            http.get("/get_plant/" + appConfig.project.id + "/" + this.id)
                .then(result => {
                    _this.store = result;
                    _this.initDivMainBg();
                    _this.initScreen();
                    _this.initImageDictionary();
                    // _this.initTemplateImageDictionary(); 
                    // _this.renderElements();  //为了请求按钮的保护接口，将渲染挪到接口里面，如下
                    // _this.initAnimation(); //start animation.
                    //是实时刷新还是获取历史数据
                    if (!_this.options.bShowTimeShaft) {
                        if (result.page.type === 'floating') {//this is a floating page
                            if (store.getState().observer.loading) {
                                return
                            } else {
                                //数据标识已就绪，等图片标识isCompleted就绪后，弹框loading消失
                                _this.isDataReady = true;

                                //如果弹框里有按钮\checkbox元素，则请求保护接口获取按钮\checkbox的启用禁用状态及信息
                                if (result.buttons.length !=0 || result.checkboxs.length !=0) {
                                    let points = []
                                    if (result.buttons.length !=0) {
                                        result.buttons.forEach(item=>{
                                            if (item.idCom != "") {
                                                points.push(item.idCom)
                                            }
                                        })
                                    }
                                    if (result.checkboxs.length !=0) {
                                        result.checkboxs.forEach(item=>{
                                            if (item.idCom != "") {
                                                points.push(item.idCom)
                                            }
                                        })
                                    }
                                    
                                    if (points.length !=0) {
                                        http.post("/logic/getEquipCommandLockProtect",{ 
                                            "point":points,
                                            "userName":JSON.parse(window.localStorage.getItem('userData')).name
                                        })
                                        .then(result => {
                                            if (result.err ==0) {
                                                pretectObj = result.data
                                                console.log(pretectObj)
                                                _this.renderElements();
                                                _this.initAnimation();
                                                _this.initWorkerForUpdatingFloat();
                                            }else {
                                                _this.renderElements();
                                                _this.initAnimation();
                                                _this.initWorkerForUpdatingFloat();
                                            }
                                        }).catch(err=>{
                                            _this.renderElements();
                                            _this.initAnimation();
                                            _this.initWorkerForUpdatingFloat();
                                            console.error(err);
                                        })
                                    }else {
                                        _this.renderElements();
                                        _this.initAnimation();
                                        _this.initWorkerForUpdatingFloat();
                                    }
                                }else {
                                    _this.renderElements();
                                    _this.initAnimation();
                                    _this.initWorkerForUpdatingFloat();

                                }
                            }
                        } else {// thsi is main page
                            if (_this.id !== store.getState().observer.parmsDict['pageId']) {
                                return
                            } else {
                                _this.renderElements();
                                _this.initAnimation();
                                _this.initWorkerForUpdating();
                                _this.hideLoading()
                            }
                        }

                    } else {
                        _this.renderElements();
                        _this.initAnimation();
                        _this.initHistroyData({ specificTime: _this.options.dateProps.startTime, timeFormat: _this.options.timeFormat })
                    }
                }).catch(function (err) {
                    console.error(err);
                    _this.hideLoading();
                });
        } else {
            let postData = {}
            if (templateFileName != undefined) {
                postData = {
                    templatePageId: this.id,
                    placeHolder: templateConfig,
                    templateFileName: templateFileName
                }
            } else {
                postData = {
                    templatePageId: this.id,
                    placeHolder: templateConfig
                }
            }
           
            http.post("/getSystemEquipmentPage", postData)
                .then(result => {
                    for (let i = 0; i < result.equipments.length; i++) {
                        if (result.equipments[i].idCom != "" && result.equipments[i].idCom != undefined && result.equipments[i].idCom.indexOf('OnOff') != -1) {
                            localStorage.setItem('selectEquipment', result.equipments[i].idCom)
                            break
                        }
                    }
                    //store存放当前所有数据
                    _this.store = result;
                    _this.initDivMainBg();
                    _this.initScreen();
                    _this.initImageDictionary();
                    // _this.initTemplateImageDictionary();                                           
                    // _this.renderElements(); //为了请求按钮的保护接口，将渲染挪到接口里面，如下
                    // _this.initAnimation(); //start animation. //由于renderElements下移，该函数也要跟着移动，不然执行顺序改变后会导致fix备注图标无法显示
                    //是实时刷新还是获取历史数据
                    if (!_this.options.bShowTimeShaft) {
                        if (result.page.type === 'floating') {//this is a floating page
                            if (store.getState().observer.loading) {
                                _this.renderElements();
                                _this.initAnimation();
                                return
                            } else {
                                //如果弹框里有按钮元素，则请求保护接口获取按钮的启用禁用状态及信息
                                if (result.buttons.length !=0 || result.checkboxs.length !=0) {
                                    let points = []
                                    if (result.buttons.length !=0) {
                                        result.buttons.forEach(item=>{
                                            if (item.idCom != "") {
                                                points.push(item.idCom)
                                            }
                                        })
                                    }
                                    if (result.checkboxs.length !=0) {
                                        result.checkboxs.forEach(item=>{
                                            if (item.idCom != "") {
                                                points.push(item.idCom)
                                            }
                                        })
                                    }
                                    if (points.length !=0) {
                                        http.post("/logic/getEquipCommandLockProtect",{ 
                                            "point":points,
                                            "userName":JSON.parse(window.localStorage.getItem('userData')).name
                                        })
                                        .then(result => {
                                            if (result.err ==0) {
                                                pretectObj = result.data
                                                console.log(pretectObj)
                                                _this.renderElements();
                                                _this.initAnimation();
                                                _this.initWorkerForUpdatingFloat();
                                            }else {
                                                _this.renderElements();
                                                _this.initAnimation();
                                                _this.initWorkerForUpdatingFloat();
                                            }
                                        }).catch(err=>{
                                            _this.renderElements();
                                            _this.initAnimation();
                                            _this.initWorkerForUpdatingFloat();
                                            console.error(err);
                                        })
                                    }else {
                                        _this.renderElements();
                                        _this.initAnimation();
                                        _this.initWorkerForUpdatingFloat();
                                    }
                                }else {
                                    _this.renderElements();
                                    _this.initAnimation();
                                    _this.initWorkerForUpdatingFloat();

                                }

                            }
                        } else {// this is main page
                            _this.renderElements();
                            _this.initAnimation();
                            if (_this.id !== store.getState().observer.parmsDict['pageId']) {
                                return
                            } else {

                                _this.initWorkerForUpdating();
                            }
                        }
                    } else {
                        _this.renderElements(); 
                        _this.initAnimation();
                        _this.initHistroyData({ specificTime: _this.options.dateProps.startTime, timeFormat: _this.options.timeFormat })
                    }
                }).catch(function (err) {
                    console.error(err);
                    _this.hideLoading();
                });
        }

    },

    renderElements: function () {
        //实例化HitModel类

        this.hitModel = new HitModel(this.canvas);
        this.dictRefreshMap = {};
        this.bindTypeDictRefreshMap = {};

        this.dictPipelines = {};
        this.dictEquipments = {};
        this.dictFixes = {};
        this.dictGages = {};
        this.dictLiquidLevels = {};
        this.dictButtons = {};
        this.dictTimePicker = {};
        this.dictTexts = {};
        this.dictStandardEquipments = {};
        this.dictRects = {};
        this.dictPolygons = {};
        this.dictLines = {};
        this.dictStartLines = {};
        this.dictEndLines = {};
        this.dictCheckboxs = {};
        this.dictCustomControls = {};
        this.dictRectangles = {};
        this.dictRectanglesPanel = {};
        //增加了多点自定义组件
        // this.dictMutiPointCustomControls={} 

        // 图层共10层
        // this.initGages();
        let _this = this
        // 自定义组件层级不需要，丢出去循环
        _this.initCustomControls(0, _this.dictCustomControls);
        for (var zIndex = 0; zIndex < 10; zIndex++) {
            _this.initPipelines(zIndex, _this.dictPipelines);
            _this.initRectangles(zIndex, _this.dictRectangles);
            _this.initRects(zIndex, _this.dictRects);
            _this.initLines(zIndex, _this.dictLines);
            _this.initStartLines(zIndex, _this.dictStartLines);
            _this.initEndLines(zIndex, _this.dictEndLines);
            _this.initGages(zIndex, _this.dictGages);
            _this.initLiquidLevels(zIndex, _this.dictLiquidLevels);
            _this.initEquipments(zIndex, _this.dictEquipments);
            _this.initFixes(zIndex, _this.dictFixes);
            _this.initButtons(zIndex, _this.dictButtons);
            _this.initTimePicker(zIndex, _this.dictTimePicker);
            // this.initMutiPointCustom(zIndex,this.dictMutiPointCustomControls)
            _this.initPolygons(zIndex, _this.dictPolygons);
            _this.initTexts(zIndex, _this.dictTexts);
            _this.initStandardEquipments(zIndex, _this.dictStandardEquipments);
            _this.initCheckboxs({ specificTime: _this.options.dateProps.startTime, timeFormat: _this.options.dateProps.timeFormat }, zIndex, _this.dictCheckboxs);
            _this.initRectanglesPanel(zIndex, _this.dictRectanglesPanel)
        }
        _this.initHitModel();
        _this.hideLoading();
    },

    resize: function () {
        var styles = window.getComputedStyle(document.documentElement);
        var width = this.store.page.width + 32 > parseInt(styles.width) ? parseInt(styles.width) - 32 : this.store.page.width + 32;
        var height = this.store.page.height / this.store.page.width * width + 32;

        this.container.style.width = width + 'px';
        this.container.style.height = height + 'px';
    },
    //初始化模态框
    initScreenInModal: (function () {
        var paddingLeft, paddingTop;
        //转变x,y定位坐标
        function convertPositionToReal(arr) {
            var temp;
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    temp = arr[i];
                    temp.x = temp.x - paddingLeft;
                    temp.y = temp.y - paddingTop;
                }
            }
        }
        function convertTempDistributionsToReal(dis) {
            if (!dis) {
                return
            }
            dis.x -= paddingLeft;
            dis.y -= paddingTop;
            convertPositionToReal(dis.data);
        }

        function convertPipelinesPositionToReal(arr) {
            if (arr) {
                for (let i = 0; i < arr.length; i++) {
                    arr[i].startX -= paddingLeft
                    arr[i].startY -= paddingTop
                    arr[i].endX -= paddingLeft
                    arr[i].endY -= paddingTop
                }
            }
        }

        return function () {
            paddingLeft = (1920 - this.store.page.width) / 2;
            paddingTop = (955 - this.store.page.height) / 2;

            convertPositionToReal(this.store.equipments);
            convertPositionToReal(this.store.systemEquipments);
            convertPositionToReal(this.store.buttons);
            convertPositionToReal(this.store.texts);
            convertPositionToReal(this.store.rectangles);
            convertPositionToReal(this.store.checkboxs);
            convertPositionToReal(this.store.charts);
            convertTempDistributionsToReal(this.store.tempDistributions);
            convertPipelinesPositionToReal(this.store.pipelines)

            this.resize();
        }
    }()),
    // 设备详情模态框内部容器初始化 --william
    initScreen: function () {
        var isFloat = this.store.page.type !== "fullscreen";

        this.canvas = this.canvasContainer;
        // this.ctx = this.canvas.getContext("2d");
        if (this.store.page.width != undefined && this.store.page.height != undefined) {
            this.canvas.setAttribute('width', this.store.page.width);
            this.canvas.setAttribute('height', this.store.page.height);
        } else {
            this.canvas.setAttribute('width', 1920);
            this.canvas.setAttribute('height', 955);
        }

        // this.canvas.width = this.store.page.width;
        // this.canvas.height = this.store.page.height;
        // this.canvas.style.width = '100%';
        // this.canvas.style.height = '100%';

        if (isFloat) {
            this.initScreenInModal();
        }
    },
    initWorkerForUpdating: function () {
        if (this.workerUpdate) {
            this.workerUpdate.terminate();
            this.workerUpdate.removeEventListener("message", this.refreshData, true);
            this.workerUpdate.removeEventListener("message", this.refreshCustomList, true);
        }
        if (this.workerUpdateFloat) {
            this.workerUpdateFloat.terminate();
            this.workerUpdateFloat.removeEventListener("message", this.refreshDataFloat, true);
        }
        // 创建Worker实例

        // if(store.curPageId!== this.id)
        // {

        //     return
        // }
        this.workerUpdate = new ObserverWorker();
        this.workerUpdate.self = this;
        // 监听，message事件，将子进程返回的数据作为参数传个this.refreshData
        this.workerUpdate.addEventListener("message", this.refreshData, true);

        //morgan添加函数自定义函数Efficiency
        this.workerUpdate.addEventListener("message", this.refreshCustomList, true);
        this.workerUpdate.addEventListener("error", function (e) {
            console.warn(e);
        }, true);

        //将当前进程的数据，通过postMessage传递给子进程
        this.workerUpdate.postMessage({
            serverUrl: appConfig.serverUrl,
            projectId: appConfig.project.id,
            id: this.id,
            pointList: Object.keys(this.dictRefreshMap),
            bindTypePointList: Object.keys(this.bindTypeDictRefreshMap),
            type: "dataRealtimeMain"
        });

    },

    initWorkerForUpdatingFloat: function () {
        if (this.workerUpdateFloat) {
            this.workerUpdateFloat.terminate();
            this.workerUpdateFloat.removeEventListener("message", this.refreshDataFloat, true);
        }
        if (this.workerUpdate) {
            this.workerUpdate.terminate();
            this.workerUpdate.removeEventListener("message", this.refreshData, true);
            this.workerUpdate.removeEventListener("message", this.refreshCustomList, true);
        }
        this.workerUpdateFloat = new ObserverWorkerFloat();
        this.workerUpdateFloat.self = this;
        // 监听，message事件，将子进程返回的数据作为参数传个this.refreshData
        this.workerUpdateFloat.addEventListener("message", this.refreshDataFloat, true);
        //将当前进程的数据，通过postMessage传递给子进程
        this.workerUpdateFloat.postMessage({
            serverUrl: appConfig.serverUrl,
            projectId: appConfig.project.id,
            id: this.id,
            pointList: Object.keys(this.dictRefreshMap),
            bindTypePointList: Object.keys(this.bindTypeDictRefreshMap),
            type: "dataRealtimeFloat"
        });

    },

    initHistroyData: function (dateDict) {
        if (this.workerUpdate) {
            this.workerUpdate.terminate();
            this.workerUpdate.removeEventListener("message", this.refreshData, true);
            this.workerUpdate.removeEventListener("message", this.refreshCustomList, true);
        }
        let pointList = Object.keys(this.dictRefreshMap)
        let scriptList = Object.keys(this.bindTypeDictRefreshMap)
        this.showLoading()
        let _this = this
        //dateDict是开始时传的参数，如果没有这个参数默认使用this.options.dateProps中的采样间隔
        const { timeFormat } = this.options.dateProps
        let id = this.store.texts[0]?this.store.texts[0].id:0
        if (this.dictTexts[id] != undefined &&this.dictTexts[id].bindScript != undefined && this.dictTexts[id].bindScript != 0 && this.dictTexts[id].bindScript != 1 && this.dictTexts[id].bindScript != "") {
            return http.post('/tool/evalStringExpression', {
                "str": this.dictTexts[id].bindScript,
                "mode": 0,
                "actTime": dateDict.specificTime
            }).then(
                data => {
                    if (data.msg === 'ok') {
                        let value = data.data;
                        let initData = {
                            name: this.dictTexts[id].idCom,
                            value: value
                        }
                        _this.renderData(initData);
                        _this.hideLoading()
                    }
                }
            ).catch(
                err => {
                    console.log(err)
                    let value = '--';
                    let initData = {
                        name: this.dictTexts[id].idCom,
                        value: value
                    }
                    _this.renderData(initData);
                    _this.hideLoading()
                }
            );
        } else {
            return http.post('/get_history_data_padded', {
                pointList: pointList,
                timeStart: dateDict.specificTime,
                timeEnd: dateDict.specificTime,
                timeFormat: dateDict.timeFormat || timeFormat,
                scriptList: scriptList
            }).then(
                data => {
                    if (data.map) {
                        var objKeys = Object.keys(data.map)
                        var initData = objKeys.map((point, index) => {
                            let value = data.map[point].length ? data.map[point][0] : ''
                            return {
                                name: point,
                                value: value
                            }
                        })
                        _this.renderData(initData);
                        _this.hideLoading()
                    }
                    if (data.error) {
                        _this.hideLoading()
                        message.error(data.msg, 2.5)
                    }
                }
            )
        }
    },

    initAnimation: function () {
        var _this = this;
        this.stopWatch = new Stopwatch();
        this.stopWatch.start();

        requestAnimationFrame(animate);
        // console.log("animate第一次"+new Date().toLocaleString());
        // setTimeout(animate,refreshRate);

        function animate() {
            // console.log("animate-paint开始"+new Date().toLocaleString());
            var currentTime = new Date().getTime();

            // if (((currentTime - animateTime)/1000 > 60 || !refreshFlag) && !_this.options.bShowTimeShaft) {
            //     console.log("开启refreshdata")

            //     var worker = _this.workerUpdate;
            //     if (typeof worker == "undefined") {
            //         worker = new ObserverWorker();
            //     };
            //     if (_this.dictRefreshMap != null) {
            //         worker.postMessage({
            //             serverUrl: appConfig.serverUrl,
            //             projectId: appConfig.project.id,
            //             id: _this.id,
            //             pointList: Object.keys(_this.dictRefreshMap),
            //             bindTypePointList:Object.keys(_this.bindTypeDictRefreshMap),
            //             type: "dataRealtimeMain"
            //         })
            //         refreshFlag = true;
            //     } else {
            //         console.log("refrashData-dict空"+_this)
            //     }

            // }

            // if ((_this.modalFlag && ((currentTime - animateFloatTime)/1000 > 60 || !refreshFloatFlag)) && !_this.options.bShowTimeShaft) {
            //     console.log("开启refreshdata")
            //     console.log("是否开弹框"+_this.modalFlag)

            //     var workerFloat = _this.workerUpdateFloat;
            //     if (typeof workerFloat == "undefined") {
            //         workerFloat = new ObserverWorkerFloat();
            //     };
            //     if (_this.dictRefreshMap != null) {
            //         workerFloat.postMessage({
            //             serverUrl: appConfig.serverUrl,
            //             projectId: appConfig.project.id,
            //             id: _this.id,
            //             pointList: Object.keys(_this.dictRefreshMap),
            //             bindTypePointList:Object.keys(_this.bindTypeDictRefreshMap),
            //             type: "dataRealtimeFloat"
            //         })
            //         refreshFloatFlag = true;
            //     } else {
            //         console.log("refrashData-dict空"+_this)
            //     }

            // }

            if (_this.isRunning) {
                if (_this.modalFlag) {
                    animateFloatTime = new Date().getTime();
                } else {
                    //绘制时间戳
                    animateTime = new Date().getTime();
                }

                // let svgChart = document.getElementById("svgChart");
                let svgChart = document.getElementsByClassName("svgChart");
                let widthScale = 0, heightScale = 0;

                // 二级弹框 showModal type
                if (svgChart.length == 3) {
                    // 缩放适配屏幕
                    svgChart = document.getElementsByClassName("svgChart")[2];

                    let parentNode = document.getElementById('observerSecModalContainer');
                    let ObserverModalView = parentNode.children[0];

                    let obWidth = parseInt(ObserverModalView.style.width),
                        obHeight = parseInt(ObserverModalView.style.height);

                    let pageW = svgChart.getAttribute('width'),
                        pageH = svgChart.getAttribute('height');

                    widthScale = obWidth / pageW,
                        heightScale = obHeight / pageH;

                    if (widthScale != undefined && !isNaN(widthScale) && !isNaN(heightScale) && obWidth && obHeight) {
                        svgChart.setAttribute("transform", `
                        translate(${obWidth * (widthScale - 1) / 2}, ${obHeight * (heightScale - 1) / 2})
                        scale(${widthScale}, ${heightScale})
                        `);
                    }
                } else {
                    // showModal type
                    if (svgChart.length == 2) {
                        // 缩放适配屏幕
                        svgChart = document.getElementsByClassName("svgChart")[1];

                        let parentNode = document.getElementById('observerModalContainer');
                        let ObserverModalView = parentNode.children[0];

                        let obWidth = parseInt(ObserverModalView.style.width),
                            obHeight = parseInt(ObserverModalView.style.height);

                        let pageW = svgChart.getAttribute('width'),
                            pageH = svgChart.getAttribute('height');

                        widthScale = obWidth / pageW,
                            heightScale = obHeight / pageH;

                        if (widthScale != undefined && !isNaN(widthScale) && !isNaN(heightScale) && obWidth && obHeight) {
                            svgChart.setAttribute("transform", `
                            translate(${obWidth * (widthScale - 1) / 2}, ${obHeight * (heightScale - 1) / 2})
                            scale(${widthScale}, ${heightScale})
                            `);
                        }

                    } else {
                        // 缩放适配屏幕
                        // TimeShaftView type  高度缩小64
                        let antSlider = document.getElementById('timeShaftSlider')
                        if (antSlider) {
                            widthScale = document.documentElement.clientWidth / 1920, heightScale = (document.documentElement.clientHeight - 200) / 955;
                        } else {
                            widthScale = document.documentElement.clientWidth / 1920, heightScale = (document.documentElement.clientHeight - 136) / 955;
                        }

                        svgChart = document.getElementsByClassName("svgChart")[0];

                        svgChart.setAttribute("transform", `
                            translate(${1920 * (widthScale - 1) / 2}, ${955 * (heightScale - 1) / 2})
                            scale(${widthScale}, ${heightScale})
                        `);
                    }
                }


                //update unit detail
                var item, element, time = _this.stopWatch.getElapsedTime();
                for (item in _this.dictPipelines) {
                    element = _this.dictPipelines[item];
                    element.update(_this.ctx, 250);
                }

                for (item in _this.dictEquipments) {
                    element = _this.dictEquipments[item];
                    element.update(null, time);
                    element.refreshImage(_this.store.animationList, _this.dictImages);
                }

                for (item in _this.dictFixes) {
                    element = _this.dictFixes[item];
                    element.update(null, time);
                    element.refreshImage(_this.store.animationList, _this.dictImages);
                }

                for (item in _this.dictStandardEquipments) {
                    element = _this.dictStandardEquipments[item];
                    element.update(null, time);
                    element.refreshImage(_this.store.animationList, _this.dictImages);
                }

                //paint
                // 图层共10层
                for (var i = 0; i < 10; i++) {
                    for (item in _this.dictPipelines) {
                        element = _this.dictPipelines[item];
                        if (element.layer == i) {
                            element.paint(element.pipeLine, element.waterPointList);
                        }
                    }
                    for (item in _this.dictEquipments) {
                        element = _this.dictEquipments[item];
                        if (element.layer == i) element.paint(element.equipImage);
                    }
                    for (item in _this.dictStandardEquipments) {
                        element = _this.dictStandardEquipments[item];
                        if (element.layer == i) element.paint(element.standardImage);
                    }
                    for (item in _this.dictButtons) {
                        element = _this.dictButtons[item];
                        if (element.layer == i) element.paint(element.btnImage, element.btnText);
                    }
                    // for (item in _this.dictTimePicker) {
                    //     element = _this.dictTimePicker[item];
                    //     if (element.layer == i) element.paint(_this.ctx);
                    // }
                    for (item in _this.dictGages) {
                        element = _this.dictGages[item];
                        if (element.layer == i) element.paint(element.gagesImage, element.pointerImage, element.gagesValue);
                    }
                    for (item in _this.dictLiquidLevels) {
                        element = _this.dictLiquidLevels[item];
                        if (element.layer == i) element.paint(element.liquidLevelsIInImage, element.liquidLevelsOutImage, element.liquidLevelPointImage, element.liquidLevelCurrentValue);
                    }
                    for (item in _this.dictTexts) {
                        element = _this.dictTexts[item];
                        if (element.layer == i) element.paint(element.text, element.foreignObject, widthScale, svgChart);
                    }
                    for (item in _this.dictTempDistributions) {
                        element = _this.dictTempDistributions[item];
                        if (element.layer == i) element.paint(element.rect, element.image);
                    }
                    for (item in _this.dictLines) {
                        element = _this.dictLines[item];
                        if (element.layer == i) element.paint(element.line);
                    }
                    for (item in _this.dictStartLines) {
                        element = _this.dictStartLines[item];
                        if (element.layer == i) element.paint(element.circle);
                    }
                    for (item in _this.dictEndLines) {
                        element = _this.dictEndLines[item];
                        if (element.layer == i) element.paint(element.circle);
                    }
                    for (item in _this.dictRects) {
                        element = _this.dictRects[item];
                        if (element.layer == i) element.paint(element.rect);
                    }
                    for (item in _this.dictPolygons) {
                        element = _this.dictPolygons[item];
                        if (element.layer == i) element.paint(element.polygon);
                    }
                    for (item in _this.dictCheckboxs) {
                        element = _this.dictCheckboxs[item];
                        if (element.layer == i) element.paint(element.checkboxImage, element.checkboxText);
                    }
                    for (item in _this.dictRectangles) {
                        element = _this.dictRectangles[item];
                        if (element.layer == i) element.paint(element.rectangle);
                    }
                }
                for (item in _this.dictCharts) {
                    _this.dictCharts[item].paint(_this.ctx);
                }

                for (item in _this.dictRulers) {
                    _this.dictRulers[item].paint(_this.ctx);
                }

                //   //如果有热力图，画出热力图标尺
                //  for (item in _this.dictTempDistributions) {
                //      _this.dictTempDistributions[item].createHeatRuler(_this.ctx);
                //  }

                requestAnimationFrame(animate);
                // console.log("animate-paint结束，开始setTimeout"+new Date().toLocaleString());
                // setTimeout(animate,refreshRate);
            }
        };

        //单独绘制报修图标
        if (_this.isRunning) {
            // let svgChart = document.getElementById("svgChart");
            let svgChart = document.getElementsByClassName("svgChart");
            let widthScale = 0, heightScale = 0;

            // 二级弹框 showModal type
            if (svgChart.length == 3) {
                // 缩放适配屏幕
                svgChart = document.getElementsByClassName("svgChart")[2];

                let parentNode = document.getElementById('observerSecModalContainer');
                let ObserverModalView = parentNode.children[0];

                let obWidth = parseInt(ObserverModalView.style.width),
                    obHeight = parseInt(ObserverModalView.style.height);

                let pageW = svgChart.getAttribute('width'),
                    pageH = svgChart.getAttribute('height');

                widthScale = obWidth / pageW,
                    heightScale = obHeight / pageH;

                if (widthScale != undefined && !isNaN(widthScale) && !isNaN(heightScale) && obWidth && obHeight) {
                    svgChart.setAttribute("transform", `
                    translate(${obWidth * (widthScale - 1) / 2}, ${obHeight * (heightScale - 1) / 2})
                    scale(${widthScale}, ${heightScale})
                    `);
                }
            } else {
                // showModal type
                if (svgChart.length == 2) {
                    // 缩放适配屏幕
                    svgChart = document.getElementsByClassName("svgChart")[1];

                    let parentNode = document.getElementById('observerModalContainer');
                    let ObserverModalView = parentNode.children[0];

                    let obWidth = parseInt(ObserverModalView.style.width),
                        obHeight = parseInt(ObserverModalView.style.height);

                    let pageW = svgChart.getAttribute('width'),
                        pageH = svgChart.getAttribute('height');

                    widthScale = obWidth / pageW,
                        heightScale = obHeight / pageH;

                    if (widthScale != undefined && !isNaN(widthScale) && !isNaN(heightScale) && obWidth && obHeight) {
                        svgChart.setAttribute("transform", `
                        translate(${obWidth * (widthScale - 1) / 2}, ${obHeight * (heightScale - 1) / 2})
                        scale(${widthScale}, ${heightScale})
                        `);
                    }

                } else {
                    // 缩放适配屏幕
                    // TimeShaftView type  高度缩小64
                    let antSlider = document.getElementById('timeShaftSlider')
                    if (antSlider) {
                        widthScale = document.documentElement.clientWidth / 1920, heightScale = (document.documentElement.clientHeight - 200) / 955;
                    } else {
                        widthScale = document.documentElement.clientWidth / 1920, heightScale = (document.documentElement.clientHeight - 136) / 955;
                    }

                    svgChart = document.getElementsByClassName("svgChart")[0];

                    svgChart.setAttribute("transform", `
                        translate(${1920 * (widthScale - 1) / 2}, ${955 * (heightScale - 1) / 2})
                        scale(${widthScale}, ${heightScale})
                    `);
                }
            }
            //update unit detail
            var item, element

            //paint
            // 图层共10层
            for (var i = 0; i < 10; i++) {
                for (item in _this.dictFixes) {
                    element = _this.dictFixes[item];
                    if (element.layer == i) element.paint(element.fixImage, widthScale, heightScale);
                }
            }

        }

    },

    getHitModelItem: function (type, id) {
        var item;
        switch (Number(type)) {
            case this.enmuElementType.equipment:
                item = this.dictEquipments[id];
                break;
            case this.enmuElementType.fix:
                item = this.dictFixes[id];
                break;
            case this.enmuElementType.standardEquipment:
                item = this.dictStandardEquipments[id];
                break;
            case this.enmuElementType.polygon:
                item = this.dictPolygons[id];
                break;
            case this.enmuElementType.button:
                item = this.dictButtons[id];
                break;
            case this.enmuElementType.buttonInfo:
                    item = this.dictButtons[id];
                    break;
            case this.enmuElementType.ruler:
                var index_array = id.split('_');
                if (!index_array || index_array.length != 2) {
                    item = null;
                    break;
                }
                var rulerId = index_array[0], refIndex = index_array[1];
                item = this.dictRulers[rulerId].references[refIndex];
                break;
            case this.enmuElementType.text:
                item = this.dictTexts[id];
                break;
            case this.enmuElementType.checkbox:
                item = this.dictCheckboxs[id];
                break;
            case this.enmuElementType.checkboxInfo:
                item = this.dictCheckboxs[id];
                break;
            default:
                item = null;
        }
        return item;
    },

    initHitModel: function () {
        var _this = this;
        var canvas = this.canvasContainer;
        //click event of canvas.
        if (_this.canvas.scrollWidth > 0) {
            _this.hitModel.scaleX = _this.store.page.width / _this.canvas.scrollWidth;
            _this.hitModel.scaleY = _this.store.page.height / _this.canvas.scrollHeight;
        }
        // mg write
        canvas.oncontextmenu = function (e) {
            
            var result = _this.hitModel.firstHitId(e.clientX, e.clientY, null);
            var type = 0, id = 0;
            if (e.srcElement.attributes.dbId && e.srcElement.attributes.type) {
                type = e.srcElement.attributes.type.nodeValue,
                id = e.srcElement.attributes.dbId.nodeValue
            } else if (e.srcElement.attributes.id && e.srcElement.attributes.type) {
                type = e.srcElement.attributes.type.nodeValue,
                id = e.srcElement.attributes.id.nodeValue       
            } else {

            }
            var item = _this.getHitModelItem(type, id);
            if (_this.store) {
                var isInfo = {
                    isInModal: _this.store.page.type !== "fullscreen",
                    pageWidth: _this.store.page.width,
                    pageHeight: _this.store.page.height
                };
            }
            if (item && item !== null && item.fixImage == undefined && item.idCom !== '') {
                let svgChart = document.getElementsByClassName("svgChart");
                let widthScale = 0, heightScale = 0;
                // 二级弹框 showModal type
                if (svgChart.length == 3) {
                    // 缩放适配屏幕
                    svgChart = document.getElementsByClassName("svgChart")[2];

                    let parentNode = document.getElementById('observerSecModalContainer');
                    let ObserverModalView = parentNode.children[0];

                    let obWidth = parseInt(ObserverModalView.style.width),
                        obHeight = parseInt(ObserverModalView.style.height);

                    let pageW = svgChart.getAttribute('width'),
                        pageH = svgChart.getAttribute('height');

                    widthScale = obWidth / pageW,
                        heightScale = obHeight / pageH;

                    if (widthScale != undefined && !isNaN(widthScale) && !isNaN(heightScale) && obWidth && obHeight) {
                        svgChart.setAttribute("transform", `
                        translate(${obWidth * (widthScale - 1) / 2}, ${obHeight * (heightScale - 1) / 2})
                        scale(${widthScale}, ${heightScale})
                        `);
                    }
                } else {
                    // showModal type
                    if (svgChart.length == 2) {
                        svgChart = document.getElementsByClassName("svgChart")[1];
                        let parentNode = document.getElementById('observerModalContainer');
                        let ObserverModalView = parentNode.children[0];

                        let obWidth = ObserverModalView.style.width,
                            obHeight = ObserverModalView.style.height;
                        widthScale = parseInt(obWidth) / _this.store.page.width,
                            heightScale = parseInt(obHeight) / _this.store.page.height;
                    } else {
                        svgChart = document.getElementsByClassName("svgChart")[0];
                        widthScale = document.documentElement.clientWidth / _this.store.page.width,
                            heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                    }
                }
                if (item.showModal != undefined) {
                    item.showModal(e, isInfo, widthScale, heightScale)
                }
                return false
            } else if (item && item !== null && item.fixImage !== undefined) {
                ipcRenderer.send('show-context-memu-fix', id)
                ipcRenderer.once('context-menu-command-fix-modify', (event, conmmand, id) => {
                    if (item.id == id) {
                        _this.showGuarantee(item.id)
                        ipcRenderer.removeListener('context-menu-command-fix-modify')
                    }
                })
                ipcRenderer.once('context-menu-command-fix-remove', (event, conmmand, id) => {
                    if (item.id == id) {
                        Modal.confirm({
                            title: '删除备注',
                            content: '是否删除备注',
                            onOk: () => {
                                http.post('/fix/remove', {
                                    fixId: item.id
                                }).then(
                                    data => {
                                        if (data.err == 0) {
                                            Modal.success({
                                                content: '删除成功'
                                            })
                                            _this.show()
                                        } else {
                                            message.info('删除失败')
                                        }
                                    }
                                ).catch(
                                    err => {
                                        if (err.err == 1) {
                                            message.info('删除失败')
                                        }
                                    }
                                )
                            }
                        })
                        ipcRenderer.removeListener('context-menu-command-fix-remove')
                    }
                })
            } else if ((item == null || item.idCom == '') && e.point == undefined && e.currentType != 'online') {
                if (e.pageY > 48) {
                    ipcRenderer.send('show-context-memu-fix-create')
                    ipcRenderer.once('context-menu-command-fix-create', (event, conmmand) => {
                        _this.repair(_this.id, e.x, e.y)
                        _this.createGuarantee(true)
                    })
                }
            } else {
                
            }
        }
        canvas.onclick = function (e) {
            var type = 0, id = 0;
            if (e.srcElement.attributes.dbId && e.srcElement.attributes.type) {
                type = e.srcElement.attributes.type.nodeValue,
                    id = e.srcElement.attributes.dbId.nodeValue
            } else if (e.srcElement.attributes.id && e.srcElement.attributes.type) {
                type = e.srcElement.attributes.type.nodeValue,
                    id = e.srcElement.attributes.id.nodeValue
            } else {

            };
            // if (!_this.hitModel) { };
            //根据点击图元的对应开始和结束坐标范围触发
            var result = _this.hitModel.firstHitId(e.clientX, e.clientY, null);

            if (id && id != "") {
                var item = _this.getHitModelItem(type, id);
                item && item.mouseUp && item.mouseUp(e);

                //如果type是15的话，即判断为是按钮的保护信息,则弹出弹框，列出保护信息及逻辑判断内容
                //如果type是16的话，即判断为是checkbox的保护信息,则弹出弹框，列出保护信息及逻辑判断内容
                if (type == "15" || type == "16") {
                    //翻译点名的中文注释
                    let allPointList = []
                    if (localStorage.getItem('allPointList') != undefined) {
                        allPointList = JSON.parse(localStorage.getItem('allPointList'))
                    }

                    let relationType = ""
                    switch (Number(item.relatType)) {
                        case 0:
                            relationType = "与"
                            break;
                        case 1:
                            relationType = "或"
                            break;
                    }
                    let infoList = item.relation.map((obj,o)=>{
                        if (obj.permit != undefined) {
                            if (obj.permit) {
                                return (<p>{o+1}、设备保护诊断: {obj.description}</p>) 
                            }else {
                                return (<p style={{color:"rgb(255 0 10)"}}>{o+1}、设备保护诊断: {obj.description}，因此导致按钮禁用</p>) 
                            }
                        }else{
                            let pointCh = ""
                            if (allPointList.length) {
                                allPointList.forEach(point => {
                                    if (obj.point == point.name) {
                                        pointCh = `（${point.description}）`
                                    }
                                })
                            }
                            let relationText = ""
                            switch (Number(obj.type)) {
                                case 0:
                                    relationText = "等于"
                                    break;
                                case 1:
                                    relationText = "大于"
                                    break;
                                case 2:
                                    relationText = "小于"
                                    break;
                                case 3:
                                    relationText = "大于等于"
                                    break;
                                case 4:
                                    relationText = "小于等于"
                                    break;
                                case 5:
                                    relationText = "不等于"
                                    break;
                            }
                            let curValue = obj.curValue != undefined ? obj.curValue : ""
                            let fontColor = ""
                            if (String(curValue) != "") {
                                if (Number(curValue) === Number(obj.value)) {
                                    if (item.relation.length >1) {
                                        return (<p>{o+1}、有效状态配置（多个有效配置之间是“{relationType}”的关系）: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 当前点值{curValue},因此本条配置通过</p> )
                                    }else {
                                        return (<p>{o+1}、有效状态配置: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 当前点值{curValue},因此本条配置通过</p> )
                                    }
                                }else {
                                    fontColor = "rgb(255 0 10)"
                                    if (item.relation.length >1) {
                                        return (<p style={{color:fontColor}}>{o+1}、有效状态配置（多个有效配置之间是“{relationType}”的关系）: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 当前点值{curValue}，因此导致按钮禁用</p> )
                                    }else {
                                        return (<p style={{color:fontColor}}>{o+1}、有效状态配置: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 当前点值{curValue}，因此导致按钮禁用</p> )
                                    }
                                }
                            }else {
                                if (item.relation.length >1) {
                                    return (<p>{o+1}、有效状态配置（多个有效配置之间是“{relationType}”的关系）: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 无该点位当前值，因此该条件无效</p> )
                                }else {
                                    return (<p>{o+1}、有效状态配置: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 无该点位当前值，因此该条件无效</p> )
                                }
                            }                            
                        }
                    })
                    console.log(infoList)
                    let butText = item.description == "" || item.description == undefined ? item.text : item.description
                    if (item.idCom.indexOf("Maintain") != -1) {
                        //如果是是特殊的Maintain摘挂牌点位，则不提供强制按钮（后台也不允许下发值）
                        Modal.info({
                            title: '禁用原因',
                            width:600,
                            content: (
                                <div>
                                    {infoList}
                                </div>
                            ),
                            onOk() {}
                        })
                    }else {
                        Modal.confirm({
                            title: '禁用原因',
                            width:600,
                            content: (
                                <div>
                                    {infoList}
                                </div>
                            ),
                            okText:"强制"+butText,
                            okType:'danger',
                            onOk: () => { 
                                //在按钮\checkbox禁用情况下强制下发命令，需要用户权限是管理员或以上
                                if (JSON.parse(localStorage.getItem('userData')).role >= 3) {
                                    if (_this.userCheck(item.idCom, item.setValue, item.description)) {
                                    }
                                } else {
                                    Modal.info({
                                        title: '提示',
                                        content: '用户权限不足，需管理员或以上权限'
                                    })
                                }
                            },
                            onCancel:()=>{},
                            cancelText:"知道了"
                        })
                    }
                    
                    return
                }

                //获取被点击元素点名的当前值
                if (item.idCom != undefined && refreshDataArr != undefined && refreshDataArr.length > 0) {
                    refreshDataArr.forEach(row => {
                        if (row.name == item.idCom) {
                            item.currentValue = row.value
                        }
                    })
                }
         
                //如果是按钮绑定多点情况，直接触发点击事件
                if (item != null && item.button === 1 && item.idCom.indexOf(',') != -1) {
                    // item && item.mouseDown && item.mouseDown(e);
                    item.status = 'down'
                }else {
                    //当按钮的relation条件满足时，enabled为true，即可以点击
                    if (item != null && item.enabled != undefined) {
                        item && item.mouseDown && item.mouseDown(e);
                    }
                }
                
                if (item instanceof ModelRuler.ModelRulerCurrentReference) {
                } else if (item && item.readWrite === 1 && item.dictBindString[0] == '正常') {
                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                        _this.showSelectControlValue(item.idCom, item.value);
                    } else {
                        Modal.info({
                            title: '提示',
                            content: '用户权限不足'
                        })
                    }
                } else if (item && item.readWrite === 1) {
                    //} else if (item  && typeof item.readWrite != 'undefined' && JSON.parse(localStorage.getItem('userData')).role !=1){
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
                            console.info('click text')
                            _this.showOptimizeValue(item.idCom, item.value, item.dictBindString);
                        }
                    } else {
                        Modal.info({
                            title: '提示',
                            content: '用户权限不足'
                        })
                    }
                }
                else if (item && item.fixImage !== undefined && item.fixImage.attributes.type.value === '12') {
                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                        _this.viewExperience(item.id)
                    } else {
                        Modal.info({
                            title: '提示',
                            content: '用户权限不足'
                        })
                    };
                }
                else if (item && item.checkbox === 'checkbox') {
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
                            //checkbox点击
                            console.info('click checkbox')
                            if (!item.enabled) {
                                if (item.idCom.indexOf("Maintain") != -1 && type == "8") {
                                    //翻译点名的中文注释
                                    let allPointList = []
                                    if (localStorage.getItem('allPointList') != undefined) {
                                        allPointList = JSON.parse(localStorage.getItem('allPointList'))
                                    }

                                    let relationType = ""
                                    switch (Number(item.relatType)) {
                                        case 0:
                                            relationType = "与"
                                            break;
                                        case 1:
                                            relationType = "或"
                                            break;
                                    }
                                    let infoList = item.relation.map((obj,o)=>{
                                        if (obj.permit != undefined) {
                                            if (obj.permit) {
                                                return (<p>{o+1}、设备保护诊断: {obj.description}</p>) 
                                            }else {
                                                return (<p style={{color:"rgb(255 0 10)"}}>{o+1}、设备保护诊断: {obj.description}，因此导致按钮禁用</p>) 
                                            }
                                        }else{
                                            let pointCh = ""
                                            if (allPointList.length) {
                                                allPointList.forEach(point => {
                                                    if (obj.point == point.name) {
                                                        pointCh = `（${point.description}）`
                                                    }
                                                })
                                            }
                                            let relationText = ""
                                            switch (Number(obj.type)) {
                                                case 0:
                                                    relationText = "等于"
                                                    break;
                                                case 1:
                                                    relationText = "大于"
                                                    break;
                                                case 2:
                                                    relationText = "小于"
                                                    break;
                                                case 3:
                                                    relationText = "大于等于"
                                                    break;
                                                case 4:
                                                    relationText = "小于等于"
                                                    break;
                                                case 5:
                                                    relationText = "不等于"
                                                    break;
                                            }
                                            let curValue = obj.curValue != undefined ? obj.curValue : ""
                                            let fontColor = ""
                                            if (String(curValue) != "") {
                                                if (Number(curValue) === Number(obj.value)) {
                                                    if (item.relation.length >1) {
                                                        return (<p>{o+1}、有效状态配置（多个有效配置之间是“{relationType}”的关系）: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 当前点值{curValue},因此本条配置通过</p> )
                                                    }else {
                                                        return (<p>{o+1}、有效状态配置: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 当前点值{curValue},因此本条配置通过</p> )
                                                    }
                                                }else {
                                                    fontColor = "rgb(255 0 10)"
                                                    if (item.relation.length >1) {
                                                        return (<p style={{color:fontColor}}>{o+1}、有效状态配置（多个有效配置之间是“{relationType}”的关系）: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 当前点值{curValue}，因此导致按钮禁用</p> )
                                                    }else {
                                                        return (<p style={{color:fontColor}}>{o+1}、有效状态配置: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 当前点值{curValue}，因此导致按钮禁用</p> )
                                                    }
                                                }
                                            }else {
                                                if (item.relation.length >1) {
                                                    return (<p>{o+1}、有效状态配置（多个有效配置之间是“{relationType}”的关系）: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 无该点位当前值，因此该条件无效</p> )
                                                }else {
                                                    return (<p>{o+1}、有效状态配置: 当点{obj.point}{pointCh}的值{relationText}{obj.value} 时按钮有效; 无该点位当前值，因此该条件无效</p> )
                                                }
                                            }                            
                                        }
                                    })
                                    //如果是是特殊的Maintain摘挂牌点位，则不提供强制按钮（后台也不允许下发值）
                                    Modal.info({
                                        title: '禁用原因',
                                        width:600,
                                        content: (
                                            <div>
                                                {infoList}
                                            </div>
                                        ),
                                        onOk() {}
                                    })
                                }else {
                                    Modal.error({
                                        title: '操作提示',
                                        content: '该动作当前被系统条件限制，条件详情为：' + item.expression
                                    })
                                }
                            } else {
                                if (_this.store.page.type === 'fullscreen' && item.type === '1') {
                                    //主界面checkbox
                                    _this.showMainCheckbox(item.idCom, item.setValue, item.text, item.unsetValue, item.checkboxState, item.desc)
                                } else if (_this.store.page.type === 'fullscreen' && item.type === '0') {
                                    // 主界面单选
                                    _this.showMainOperatingPane(item.idCom, item.setValue, item.desc, item.unsetValue,'','','','', item.param10)
                                }else if (_this.store.page.type === 'floating' && item.type === '1') {
                                   //模态框内checkbox    
                                    _this.showCheckboxPane(item.idCom, item.setValue, item.text, item.unsetValue, item.checkboxState, item.desc, item.currentValue)
                                }else if (_this.store.page.type === 'floating' && item.type === '0') {
                                    //模态框内的单选  
                                    _this.showRadioPane(item.idCom, item.setValue, item.desc, item.text ,item.param10);
                                    
                                 }
                                
                            }
                        }
                    } else {
                        Modal.info({
                            title: '提示',
                            content: '用户权限不足'
                        })
                    }
                } else if (item && item.button === 1 && item.link === undefined && _this.store.page.type === 'fullscreen') {
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
                        if(flag == 0){
                            if(item.relation.length == 0) {
                                _this.showMainOperatingPane(item.idCom, item.setValue, item.description,item.downloadEnableCondition,item.downloadURL,item.unsetValue,item.PreCheckScript,item.PreCheckScriptDescription);   
                            }else{
                                if (item.relation.length >= 1 && item.enabled) {
                                    _this.showMainOperatingPane(item.idCom, item.setValue, 
                                        item.description,item.downloadEnableCondition,item.downloadURL,item.unsetValue,item.PreCheckScript,item.PreCheckScriptDescription);
                                }
                            }
                        }
                    } else {
                        Modal.info({
                            title: '提示',
                            content: '用户权限不足'
                        })
                    }
                } else {
                    if (item && item.linkinfo && item.linkinfo[2] === "5" && item.linkinfo[7] != "") {
                        jumpUrl(item.linkinfo[7])
                    } else if (item.link != undefined && item.link != "-1" && item && item.linkinfo && item.linkinfo[8] === "template") { //标准设备弹框
                        if (item.templateFileName != undefined) {
                            _this.showStandardDetailDialog(item.link, item.name, item.placeHolder, item.templateFileName, item.navigation);
                        } else {
                            _this.showStandardDetailDialog(item.link, item.name, item.placeHolder);
                        }
                    } else if (item && item.link != undefined) {
                        _this.chooseShow(item.link);
                        // _this.showDetailDialog(item.link, item.name);
                    } else if (item && item.link != undefined && _this.store.page.type === 'fullscreen') {
                        _this.showFullScreenPage(item.link);
                    } else {
                        if (item && item.layer != 2 && item.layer != 3 && item.status === 'down' && item.enabled && item.button === 1) {
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
                                if(flag == 0){
                                    _this.showOperatingPane(item.idCom, item.setValue, item.description,item.PreCheckScript,item.PreCheckScriptDescription); 
                                }
                            } else {
                                Modal.info({
                                    title: '提示',
                                    content: '用户权限不足'
                                })
                            }
                        } else {
                            if (item && item.text != undefined && item.enabled && item.button === 1) {
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
                                        _this.showRadioPane(item.idCom, item.setValue, item.description);
                                    }
                                } else {
                                    Modal.info({
                                        title: '提示',
                                        content: '用户权限不足'
                                    })
                                }
                            }
                        }
                    }
                }
            };
            if (document.getElementsByClassName('observer-text-tooltip')[0] && type != undefined
                // && _this.hitModel.currentModel!= undefined && _this.hitModel.currentModel.type != undefined
            ) {
                document.getElementsByClassName('observer-text-tooltip')[0].style.display = 'none';
                // var item = _this.getHitModelItem(_this.hitModel.currentModel.type, _this.hitModel.currentModel.id);
                // if (item.hidden != undefined) {
                //     item.hidden()       
                // }
            };

            e.preventDefault();
        };
        canvas.onmousemove = function (e) {
            var type = 0, id = 0;
            if (e.srcElement.attributes.dbId && e.srcElement.attributes.type) {
                type = e.srcElement.attributes.type.nodeValue,
                    id = e.srcElement.attributes.dbId.nodeValue;
            } else if (e.srcElement.attributes.id && e.srcElement.attributes.type) {
                type = e.srcElement.attributes.type.nodeValue,
                    id = e.srcElement.attributes.id.nodeValue
            } else {

            }

            if (!_this.hitModel) return;
            var result = _this.hitModel.firstHitId(e.clientX, e.clientY, null);
            if (_this.store) {
                var isInfo = {
                    isInModal: _this.store.page.type !== "fullscreen",
                    pageWidth: _this.store.page.width,
                    pageHeight: _this.store.page.height
                };
            }
            //控制鼠标移动到按钮上的样式
            if (id && id != "") {
                _this.canvas.style.cursor = "pointer";
                _this.hitModel.currentModel = result;
                // var item = _this.getHitModelItem(type, id);
                // 当鼠标放在按钮上时，将浮动框隐藏
                // if (result.type == '2' && document.getElementsByClassName('observer-text-tooltip')[0]) {
                //    document.getElementsByClassName('observer-text-tooltip')[0].style.display='none';
                // }
                // if (type == '11'&& document.getElementsByClassName('observer-text-tooltip')[0]) {
                //        document.getElementsByClassName('observer-text-tooltip')[0].style.display='none';
                //     }
                if (type == '1920' || type == '0') {
                    _this.canvas.style.cursor = "auto";
                }
                // if(item) {
                // //   item && item.mouseOver && item.mouseOver(e,isInfo);           
                // }
            } else {
                _this.canvas.style.cursor = "auto";
            }
            // else {
            // _this.canvas.style.cursor = "auto";
            // if (_this.hitModel.currentModel && _this.hitModel.currentModel.id) {
            // var item = _this.getHitModelItem(_this.hitModel.currentModel.type, _this.hitModel.currentModel.id);
            // if (item) {
            //     // item && item.mouseDown && item.mouseDown();
            // }
            // _this.hitModel.currentModel = null;
            // }
            // }
            e.preventDefault();
            // 满足弹框可移动,需取消事件冒泡
            // let parentNode = document.getElementById("observerModalContainer");
            // if (parentNode&&ProcessNode==null){
            //     let ObserverModalView = parentNode.children[0];
            //     if (!ObserverModalView) {
            //         e.stopPropagation();
            //     }                
            // }
        };
    },

    renderData: function (data) {
        if (this.modalFlag) {
            this.refreshDataFloat({ data: data });
        } else {
            this.refreshData({ data: data });
        }
        this.refreshCustomList({ data: data });
    },
    //更新自定义组件的函数Efficiency
    refreshCustomList: function (e) {
        if (e.data && !e.data.error) {
            var _this = this.self ? this.self : this;
            let Namelist = []
            let _customList = _this.store.customControls
            if (_customList !== undefined && e.data.length > 0) {
                for (let F = 0; F < _customList.length; F++) {
                    let arr = JSON.parse(_customList[F].config)
                    if (arr.type == 'Efficiency') {
                        if (arr.pointNameList !== undefined) {
                            for (let G = 0; G < arr.pointNameList.length; G++) {
                                let newObj = arr.pointNameList[G]
                                newObj['id'] = _customList[F].id
                                Namelist.push(newObj)
                            }
                        } else {
                            let defaultList =
                                [
                                    { "Name": "ThisDayChillerRoomGroupPowerTotal", "InterPretation": "冷冻机房今日总用电量", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayChGroupPowerTotal", "InterPretation": "冷冻站今日冷机组总用电量", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayPriChWPGroupPowerTotal", "InterPretation": "冷冻站今日一次泵冷机组总用电量", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDaySecChWPGroupPowerTotal", "InterPretation": "冷冻站今日二次泵冷机组总用电量", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayCWPGroupPowerTotal", "InterPretation": "冷冻站今日冷却泵组总用电量", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayCTGroupPowerTotal", "InterPretation": "冷冻站今日冷却塔组总用电量", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayCoolingCapacityTotal", "InterPretation": "冷冻站今日总制冷量", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayEfficiencyTotal", "InterPretation": "冷冻站今日机房总效率", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayChGroupEfficiencyTotal", "InterPretation": "冷冻站今日冷机组总效率", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayPriChWPGroupEfficiencyTotal", "InterPretation": "冷冻站今日一次泵组总效率", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDaySecChWPGroupEfficiencyTotal", "InterPretation": "冷冻站今日二次泵组总效率", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayCWPGroupEfficiencyTotal", "InterPretation": "冷冻站今日冷却泵组总效率", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                    { "Name": "ThisDayCTGroupEfficiencyTotal", "InterPretation": "冷冻站今日冷却塔组总效率", "DecimalPoint": "1", "Company": "Kwh", "Coloums": "3" },
                                ]
                            for (let G = 0; G < defaultList.length; G++) {
                                let obj = {}
                                obj = defaultList[G]
                                obj['id'] = _customList[F].id
                                Namelist.push(obj)
                            }
                        }
                    }
                    // else{
                    //     continue
                    // }    
                }
                if (Namelist.length > 0) {
                    for (let k = 0; k < Namelist.length; k++) {
                        for (let h = 0; h < e.data.length; h++) {
                            if (Namelist[k].Name == e.data[h].name) {
                                //该地方赋值去需要判断
                                if (parseFloat(e.data[h].value) == 'NaN' || e.data[h].value == 'undefined') {
                                    continue;
                                } else {
                                    Namelist[k].value = e.data[h].value
                                }

                            }
                        }
                    }
                    _this.getPointRealTimeData(Namelist)
                } else {
                    return
                }
            } else {
                //如果请求为空就赋值为空
                _this.getPointRealTimeData([])
            }
        }
    }
    ,
    //刷新数据
    refreshData: function (e) { //e.data是webworker中传过来的数据
        // console.log("refreshData开始执行"+new Date().toLocaleString());
        var _this = this.self ? this.self : this;

        if(_this.modalFlag === undefined){
            _this = oldThis
        }else{
            oldThis = _this
        }

        if (!_this.modalFlag) {
            if (e.data && !e.data.error) {
                //获取实时数据给其他函数使用(获取checkbox当前值)
                refreshDataArr = e.data;

                var tempDistributionsUpdated = {};
                var tempdata = []
                var tempTimePickerData = []
                var tempRectanglesPanelData = []
                var eDataValueBuffer = {};
                for (let i = 0; i < e.data.length; i++) { //遍历所有的数据 
                    //e.data[i].name是键值
                    var item = _this.dictRefreshMap[e.data[i].name] ? _this.dictRefreshMap[e.data[i].name] : _this.bindTypeDictRefreshMap[e.data[i].name];
                    if (eDataValueBuffer[e.data[i].name] == null || eDataValueBuffer[e.data[i].name] == undefined) {
                        eDataValueBuffer[e.data[i].name] = e.data[i].value;
                    } else {
                        continue;
                    }
                    if (item) {
                        if (item.pipelines && item.pipelines.length != 0) {
                            for (var j = 0; j < item.pipelines.length; j++) {
                                var pipline = _this.dictPipelines[item.pipelines[j]];
                                pipline.dictIdCom[e.data[i].name] = e.data[i].value == 1 || e.data[i].value == -1 ? true : false;
                                //当点值为-1时，方向相反
                                if (e.data[i].value == -1) {
                                    pipline.direction = pipline.initDirection == true ? false : true
                                }
                            }
                        }
                        if (item.equipments && item.equipments.length != 0) {
                            for (var j = 0; j < item.equipments.length; j++) {
                                var equipment = _this.dictEquipments[item.equipments[j]];
                                equipment.value = e.data[i].value;
                                equipment.update(null, null);
                            }
                            _this.isDataReady = true;
                        }
                        if (item.standardEquipments && item.standardEquipments.length != 0) {
                            for (var j = 0; j < item.standardEquipments.length; j++) {
                                var sEquipment = _this.dictStandardEquipments[item.standardEquipments[j]];
                                if (sEquipment.idCom == e.data[i].name) {
                                    sEquipment.value = e.data[i].value;
                                    sEquipment.update(null, null);
                                }
                            }
                            _this.refreshStandardEquipment(item, _this.dictStandardEquipments, e.data, i);
                        }
                        if (item.polygons && item.polygons.length != 0) {
                            _this.refreshPolygon(item, _this.dictPolygons, e.data);
                        }
                        if (item.charts && item.charts.length != 0) {
                            for (var j = 0; j < item.charts.length; j++) {
                                _this.dictCharts[item.charts[j]].update(e.data[i].name, e.data[i].value);
                            }
                        }
                        if (item.gages && item.gages.length != 0) {
                            for (var j = 0; j < item.gages.length; j++) {
                                _this.dictGages[item.gages[j]].update(e.data[i].value);
                            }
                        }
                        if (item.liquidLevels && item.liquidLevels.length != 0) {
                            for (var j = 0; j < item.liquidLevels.length; j++) {
                                _this.dictLiquidLevels[item.liquidLevels[j]].update(e.data[i].value);
                            }
                        }
                        //更新checkbox
                        if (item.checkboxs && item.checkboxs.length != 0) {
                            for (var j = 0; j < item.checkboxs.length; j++) {
                                _this.dictCheckboxs[item.checkboxs[j]].update(e.data[i])
                            }
                        }
                        if (item.texts && item.texts.length != 0) {
                            for (var j = 0; j < item.texts.length; j++) {
                                _this.dictTexts[item.texts[j]].update(e.data[i].value);
                            }
                        }
                        if (item.buttons && item.buttons.length != 0) {
                            for (var j = 0; j < item.buttons.length; j++) {
                                _this.dictButtons[item.buttons[j]].update(e.data[i])
                            }
                        }
                        if (item.customControls && item.customControls.length != 0) {
                            //自定义组件自动刷新
                            if (item.customControls.length > 0) {
                                for (var j = 0; j < item.customControls.length; j++) {
                                    // 将所有自定义组件的实时数据保存到store中
                                    if (tempdata.indexOf(e.data[i]) === -1) {
                                        tempdata.push(e.data[i])
                                    }
                                }

                            }
                            // 每两秒更新一次h5状态
                        }
                        if (item.timePicker && !!item.timePicker.length) {
                            for (var j = 0; j < item.timePicker.length; j++) {
                                // 将实时数据保存到store中
                                tempTimePickerData.push(e.data[i])
                            }
                            // 每两秒更新一次h5状态
                            _this.getTimePickerRealTimeData(tempTimePickerData)
                        }
                        if (item.rectanglesPanel && !!item.rectanglesPanel.length) {
                            for (var j = 0; j < item.rectanglesPanel.length; j++) {
                                // 将实时数据保存到store中
                                tempRectanglesPanelData.push(e.data[i])
                            }
                            // 每两秒更新一次h5状态
                            _this.getRectanglesPanelData(tempRectanglesPanelData)
                        }
                        if (item.tempDistributions) {
                            for (var j = 0; j < item.texts.length; j++) {
                                if (item.tempDistributions && item.tempDistributions.length > 0) {
                                    if (!tempDistributionsUpdated[item.tempDistributions[j]]) {
                                        tempDistributionsUpdated[item.tempDistributions[j]] = [];
                                    }
                                    tempDistributionsUpdated[item.tempDistributions[j]].push(e.data[i]);
                                    // _this.dictTexts[item.texts[j]].update(e.data[i].constructor === Object && e.data[i].value ? e.data[i].value : '--', true);
                                }
                                else {
                                    // _this.dictTexts[item.texts[j]].update(e.data[i].constructor === Object && e.data[i].value ? e.data[i].value : '--');
                                }
                            }
                            _this.isDataReady = true;
                            continue
                        }
                        if (item.rulers) {
                            for (var j = 0; j < item.rulers.length; j++) {
                                _this.dictRulers[item.rulers[j]].update(e.data[i].name, e.data[i].value);
                            }
                        }

                    }
                    //高级自定义图元和高级文本
                    let index = e.data[i].name.indexOf("<%");
                    if (index != -1) {
                        let row = _this.bindTypeDictRefreshMap[e.data[i].name];
                        if (row) {
                            if (row.standardEquipments) {
                                for (var j = 0; j < row.standardEquipments.length; j++) {
                                    var sEquipment = _this.dictStandardEquipments[row.standardEquipments[j]];
                                    sEquipment.value = e.data[i].value;
                                    sEquipment.update(null, null);
                                }
                            }
                            if (row.equipments) {
                                for (let j = 0; j < row.equipments.length; j++) {
                                    let equipment = _this.dictEquipments[row.equipments[j]];
                                    equipment.value = e.data[i].value;
                                    equipment.update(null, null);
                                }
                            }
                            if (row.texts) {
                                for (var j = 0; j < row.texts.length; j++) {
                                    _this.dictTexts[row.texts[j]].update(e.data[i].value);
                                }
                            }
                            if (row.pipelines) {
                                for (var j = 0; j < row.pipelines.length; j++) {
                                    var pipline = _this.dictPipelines[row.pipelines[j]];
                                    pipline.dictIdCom[e.data[i].name] = e.data[i].value == 1 || e.data[i].value == -1 ? true : false;
                                    //当点值为-1时，方向相反
                                    if (e.data[i].value == -1) {
                                        pipline.direction = pipline.initDirection == true ? false : true
                                    }
                                }
                            }
                        }
                    }
                }
                _this.getCustomRealTimeData(tempdata)
                // 防止同一个温度图多次绘制
                for (var tempId in tempDistributionsUpdated) {
                    var tempUpdatedData = tempDistributionsUpdated[tempId];
                    _this.dictTempDistributions[tempId].update(tempUpdatedData);
                }

                //TODO: to be removed;
                for (var pointName in _this.dictCharts) {
                    var chart = _this.dictCharts[pointName];
                    if (!chart.isRunning) {
                        chart.isRunning = true;
                        chart.renderChart(chart);

                    }
                }
            }
            _this.isDataReady = true;
            // console.log("refreshData-update结束"+new Date().toLocaleString());
            //历史数据回放的时候，不请求实时数据
            if (!_this.options.bShowTimeShaft) {
                var worker = _this.workerUpdate;
                var interval = 5000;
                if (appConfig.serverUrl && appConfig.serverUrl.slice(-4) != '5000') {
                    interval = 10000
                }
                if (typeof worker == "undefined") {
                    worker = new ObserverWorker();
                };
                //请求正常，恢复标记
                if (!refreshFlag) {
                    refreshFlag = true;
                }
                // var currentTime = new Date().getTime();
                // if ((currentTime - animateTime)/1000 > 60) {
                //     console.log("暂停refresh")
                //     console.log(currentTime - animateTime)
                // }else {
                if (refreshTimer != null) {
                    clearTimeout(refreshTimer);
                }
                // console.log(interval);
                // console.log("refreshData-准备执行setTimeout请求数据"+new Date().toLocaleString());
                refreshTimer = setTimeout(function () {
                    // console.log("settime")
                    if (_this.dictRefreshMap != null) {
                        worker.postMessage({
                            serverUrl: appConfig.serverUrl,
                            projectId: appConfig.project.id,
                            id: _this.id,
                            pointList: Object.keys(_this.dictRefreshMap),
                            bindTypePointList: Object.keys(_this.bindTypeDictRefreshMap),
                            type: "dataRealtimeMain"
                        })
                        // console.log("refreshData-setTimeout请求数据完成"+new Date().toLocaleString());
                    } else {
                        // console.log("refrashData-dict空"+_this)
                        refreshFlag = false;
                    }
                }, interval);
                // console.log("refreshData-计时setTimeout请求数据"+new Date().toLocaleString());
                // }    
            }
        }


    },

    //刷新数据
    refreshDataFloat: function (e) { //e.data是webworker中传过来的数据
        var _this = this.self ? this.self : this;

        if(_this.modalFlag === undefined){
            _this = oldThis
        }else{
            oldThis = _this
        }
       
        if (_this.modalFlag) {
            if (e.data && !e.data.error) {
                
                //获取实时数据给其他函数使用(获取checkbox当前值)
                refreshDataArr = e.data;

                var tempDistributionsUpdated = {};
                // console.info( e.data )
                var tempdata = []
                var tempTimePickerData = []
                var tempRectanglesPanelData = []
                var eDataValueBuffer = {};
                for (let i = 0; i < e.data.length; i++) { //遍历所有的数据 
                    //e.data[i].name是键值
                    var item = _this.dictRefreshMap[e.data[i].name] ? _this.dictRefreshMap[e.data[i].name] : _this.bindTypeDictRefreshMap[e.data[i].name];
                    if (eDataValueBuffer[e.data[i].name] == null || eDataValueBuffer[e.data[i].name] == undefined) {
                        eDataValueBuffer[e.data[i].name] = e.data[i].value;
                    } else {
                        continue;
                    }
                    if (item) {
                        if (item.pipelines && item.pipelines.length != 0) {
                            for (var j = 0; j < item.pipelines.length; j++) {
                                var pipline = _this.dictPipelines[item.pipelines[j]];
                                pipline.dictIdCom[e.data[i].name] = e.data[i].value == 1 || e.data[i].value == -1 ? true : false;
                                //当点值为-1时，方向相反
                                if (e.data[i].value == -1) {
                                    pipline.direction = pipline.initDirection == true ? false : true
                                }
                            }
                        }
                        if (item.equipments && item.equipments.length != 0) {
                            for (var j = 0; j < item.equipments.length; j++) {
                                var equipment = _this.dictEquipments[item.equipments[j]];
                                equipment.value = e.data[i].value;
                                equipment.update(null, null);
                            }
                            _this.isDataReady = true;
                        }
                        if (item.standardEquipments && item.standardEquipments.length != 0) {
                            for (var j = 0; j < item.standardEquipments.length; j++) {
                                var sEquipment = _this.dictStandardEquipments[item.standardEquipments[j]];
                                sEquipment.value = e.data[i].value;
                                sEquipment.update(null, null);
                            }
                            _this.refreshStandardEquipment(item, _this.dictStandardEquipments, e.data, i);
                        }
                        if (item.polygons && item.polygons.length != 0) {
                            _this.refreshPolygon(item, _this.dictPolygons, e.data);
                        }
                        if (item.charts && item.charts.length != 0) {
                            for (var j = 0; j < item.charts.length; j++) {
                                _this.dictCharts[item.charts[j]].update(e.data[i].name, e.data[i].value);
                            }
                        }
                        if (item.gages && item.gages.length != 0) {
                            for (var j = 0; j < item.gages.length; j++) {
                                _this.dictGages[item.gages[j]].update(e.data[i].value);
                            }
                        }
                        if (item.liquidLevels && item.liquidLevels.length != 0) {
                            for (var j = 0; j < item.liquidLevels.length; j++) {
                                _this.dictLiquidLevels[item.liquidLevels[j]].update(e.data[i].value);
                            }
                        }
                        //更新checkbox
                        if (item.checkboxs && item.checkboxs.length != 0) {
                            for (var j = 0; j < item.checkboxs.length; j++) {
                                _this.dictCheckboxs[item.checkboxs[j]].update(e.data[i])
                            }
                        }
                        if (item.texts && item.texts.length != 0) {
                            for (var j = 0; j < item.texts.length; j++) {
                                _this.dictTexts[item.texts[j]].update(e.data[i].value);
                            }
                        }
                        if (item.buttons && item.buttons.length != 0) {
                            for (var j = 0; j < item.buttons.length; j++) {
                                _this.dictButtons[item.buttons[j]].update(e.data[i])
                            }
                        }
                        if (item.customControls && item.customControls.length != 0) {
                            //自定义组件自动刷新
                            if (item.customControls.length > 0) {
                                for (var j = 0; j < item.customControls.length; j++) {
                                    // 将所有自定义组件的实时数据保存到store中
                                    tempdata.push(e.data[i])
                                }

                            }
                            // 每两秒更新一次h5状态
                        }
                        if (item.timePicker && !!item.timePicker.length) {
                            for (var j = 0; j < item.timePicker.length; j++) {
                                // 将实时数据保存到store中
                                tempTimePickerData.push(e.data[i])
                            }
                            // 每两秒更新一次h5状态
                            _this.getTimePickerRealTimeData(tempTimePickerData)
                        }
                        if (item.rectanglesPanel && !!item.rectanglesPanel.length) {
                            for (var j = 0; j < item.rectanglesPanel.length; j++) {
                                // 将实时数据保存到store中
                                tempRectanglesPanelData.push(e.data[i])
                            }
                            // 每两秒更新一次h5状态
                            _this.getRectanglesPanelData(tempRectanglesPanelData)
                        }
                        if (item.tempDistributions) {
                            for (var j = 0; j < item.texts.length; j++) {
                                if (item.tempDistributions && item.tempDistributions.length > 0) {
                                    if (!tempDistributionsUpdated[item.tempDistributions[j]]) {
                                        tempDistributionsUpdated[item.tempDistributions[j]] = [];
                                    }
                                    tempDistributionsUpdated[item.tempDistributions[j]].push(e.data[i]);
                                    // _this.dictTexts[item.texts[j]].update(e.data[i].constructor === Object && e.data[i].value ? e.data[i].value : '--', true);
                                }
                                else {
                                    // _this.dictTexts[item.texts[j]].update(e.data[i].constructor === Object && e.data[i].value ? e.data[i].value : '--');
                                }
                            }
                            _this.isDataReady = true;
                            continue
                        }
                        if (item.rulers) {
                            for (var j = 0; j < item.rulers.length; j++) {
                                _this.dictRulers[item.rulers[j]].update(e.data[i].name, e.data[i].value);
                            }
                        }

                    }
                    //高级自定义图元和高级文本
                    let index = e.data[i].name.indexOf("<%");
                    if (index != -1) {
                        let row = _this.bindTypeDictRefreshMap[e.data[i].name];
                        if (row) {
                            if (row.standardEquipments) {
                                for (var j = 0; j < row.standardEquipments.length; j++) {
                                    var sEquipment = _this.dictStandardEquipments[row.standardEquipments[j]];
                                    sEquipment.value = e.data[i].value;
                                    sEquipment.update(null, null);
                                }
                            }
                            if (row.equipments) {
                                for (let j = 0; j < row.equipments.length; j++) {
                                    let equipment = _this.dictEquipments[row.equipments[j]];
                                    equipment.value = e.data[i].value;
                                    equipment.update(null, null);
                                }
                            }
                            if (row.texts) {
                                for (var j = 0; j < row.texts.length; j++) {
                                    _this.dictTexts[row.texts[j]].update(e.data[i].value);
                                }
                            }
                            if (row.pipelines) {
                                for (var j = 0; j < row.pipelines.length; j++) {
                                    var pipline = _this.dictPipelines[row.pipelines[j]];
                                    pipline.dictIdCom[e.data[i].name] = e.data[i].value == 1 || e.data[i].value == -1 ? true : false;
                                    //当点值为-1时，方向相反
                                    if (e.data[i].value == -1) {
                                        pipline.direction = pipline.initDirection == true ? false : true
                                    }
                                }
                            }
                        }
                    }
                }
                _this.getCustomRealTimeData(tempdata)
                // 防止同一个温度图多次绘制
                for (var tempId in tempDistributionsUpdated) {
                    var tempUpdatedData = tempDistributionsUpdated[tempId];
                    _this.dictTempDistributions[tempId].update(tempUpdatedData);
                }

                //TODO: to be removed;
                for (var pointName in _this.dictCharts) {
                    var chart = _this.dictCharts[pointName];
                    if (!chart.isRunning) {
                        chart.isRunning = true;
                        chart.renderChart(chart);

                    }
                }
            }
            _this.isDataReady = true;
            //历史数据回放的时候，不请求实时数据
            if (!_this.options.bShowTimeShaft) {
                var workerFloat = _this.workerUpdateFloat;
                var interval = 5000;
                if (appConfig.serverUrl && appConfig.serverUrl.slice(-4) != '5000') {
                    interval = 10000
                }
                if (typeof workerFloat == "undefined") {
                    workerFloat = new ObserverWorkerFloat();
                };
                //请求正常，恢复标记
                if (!refreshFloatFlag) {
                    refreshFloatFlag = true;
                }
                // var currentTime = new Date().getTime();
                // if ((currentTime - animateFloatTime)/1000 > 60) {
                //     console.log("暂停refresh")
                //     console.log(currentTime - animateFloatTime)
                // }else {
                if (refreshFloatTimer != null) {
                    clearTimeout(refreshFloatTimer);
                }
                refreshFloatTimer = setTimeout(function () {
                    // console.log("settime")
                    if (_this.dictRefreshMap != null) {
                        workerFloat.postMessage({
                            serverUrl: appConfig.serverUrl,
                            projectId: appConfig.project.id,
                            id: _this.id,
                            pointList: Object.keys(_this.dictRefreshMap),
                            bindTypePointList: Object.keys(_this.bindTypeDictRefreshMap),
                            type: "dataRealtimeFloat"
                        })
                    } else {
                        // console.log("refrashData-dict空"+_this)
                        refreshFloatFlag = false;
                    }
                }, interval);
                // }   
            }
        }
    },

    refreshStandardEquipment: function (item, dictStandardEquipments, eData, i) {
        if(serverOmd == 'best')return
        //将eData数组格式转为{点名:点值}的对象格式
        let dataObj = {}
        eData.forEach(row => {
            dataObj[row.name] = row.value
        })

        for (var j = 0; j < item.standardEquipments.length; j++) {
            let standardEquipment = dictStandardEquipments[item.standardEquipments[j]];
            //如果当前遍历的点名和元素中的idCom不同，则判断为当前点名是图标点，不再进行下面的处理
            if (standardEquipment.idCom === eData[i].name) {

                this.refreshColorIcon(standardEquipment,dataObj,standardEquipment.rectValue)

                // //A／L右上角图标判断
                // if (standardEquipment.autoModePoint != undefined) {
                //     eData.forEach(row => {
                //         if (standardEquipment.autoModePoint === row.name && row.value == 0) {
                //             //如果手自动点值为0，赋值1
                //             if (standardEquipment._iconAutoModeLock == false) {
                //                 standardEquipment._iconAutoModeLock = true;//占住锁
                //                 if (standardEquipment.paintAutoModeValue === 1) {
                //                     standardEquipment._iconAutoModeLock = false;//释放锁
                //                 } else {
                //                     standardEquipment.autoModeValue = 1;
                //                     standardEquipment._iconAutoModeLock = false;//释放锁
                //                 }
                //             }
                //         } else if (standardEquipment.autoModePoint === row.name && row.value == 1) {
                //             //如果手自动点值为1，赋值2
                //             if (standardEquipment._iconAutoModeLock == false) {
                //                 standardEquipment._iconAutoModeLock = true;//占住锁
                //                 if (standardEquipment.paintAutoModeValue === 2) {
                //                     standardEquipment._iconAutoModeLock = false;//释放锁
                //                 } else {
                //                     standardEquipment.autoModeValue = 2;
                //                     standardEquipment._iconAutoModeLock = false;//释放锁
                //                 }
                //             }
                //         }
                //     })
                // } else {
                //     //如果手自动点值为其他值，跳过，不显示小图标
                //     if (standardEquipment._iconAutoModeLock == false) {
                //         standardEquipment._iconAutoModeLock = true;//占住锁
                //         if (standardEquipment.paintAutoModeValue === 0) {
                //             standardEquipment._iconAutoModeLock = false;//释放锁
                //         } else {
                //             standardEquipment.autoModeValue = 0;
                //             standardEquipment._iconAutoModeLock = false;//释放锁
                //         }
                //     }
                // }
                // //E／D右上角图标判断
                // if (standardEquipment.enabledPoint != undefined) {
                //     eData.forEach(row => {
                //         if (standardEquipment.enabledPoint === row.name && row.value == 0) {
                //             //如果启用禁用点值为0，赋值1
                //             if (standardEquipment._iconEnabledLock == false) {
                //                 standardEquipment._iconEnabledLock = true;//占住锁
                //                 if (standardEquipment.paintEnabledValue === 1) {
                //                     standardEquipment._iconEnabledLock = false;//释放锁
                //                 } else {
                //                     standardEquipment.enabledValue = 1;
                //                     standardEquipment._iconEnabledLock = false;//释放锁
                //                 }
                //             }
                //         } else if (standardEquipment.enabledPoint === row.name && row.value == 1) {
                //             //如果启用禁用点值为1，赋值2
                //             if (standardEquipment._iconEnabledLock == false) {
                //                 standardEquipment._iconEnabledLock = true;//占住锁
                //                 if (standardEquipment.paintEnabledValue === 2) {
                //                     standardEquipment._iconEnabledLock = false;//释放锁
                //                 } else {
                //                     standardEquipment.enabledValue = 2;
                //                     standardEquipment._iconEnabledLock = false;//释放锁
                //                 }
                //             }
                //         }
                //     })
                // } else {
                //     //如果启用禁用点值为其他值,跳过，不显示小图标
                //     if (standardEquipment._iconEnabledLock == false) {
                //         standardEquipment._iconEnabledLock = true;//占住锁
                //         if (standardEquipment.paintEnabledValue === 0) {
                //             standardEquipment._iconEnabledLock = false;//释放锁
                //         } else {
                //             standardEquipment.enabledValue = 0;
                //             standardEquipment._iconEnabledLock = false;//释放锁
                //         }
                //     }
                // }
                // //摘挂牌Maintain右上角图标判断
                // if (standardEquipment.maintainPoint != undefined) {
                //     eData.forEach(row => {
                //         if (standardEquipment.maintainPoint === row.name && row.value == 0) {
                //             //如果摘挂牌Maintain点值为0，赋值0--显示图标
                //             if (standardEquipment._iconMaintainLock == false) {
                //                 standardEquipment._iconMaintainLock = true;//占住锁
                //                 if (standardEquipment.paintMaintainValue === 0) {
                //                     standardEquipment._iconMaintainLock = false;//释放锁
                //                 } else {
                //                     standardEquipment.maintainValue = 0;
                //                     standardEquipment._iconMaintainLock = false;//释放锁
                //                 }
                //             }
                //         } else if (standardEquipment.maintainPoint === row.name && row.value == 1) {
                //             //如果摘挂牌Maintain点值为1，赋值1--显示图标
                //             if (standardEquipment._iconMaintainLock == false) {
                //                 standardEquipment._iconMaintainLock = true;//占住锁
                //                 if (standardEquipment.paintMaintainValue === 1) {
                //                     standardEquipment._iconMaintainLock = false;//释放锁
                //                 } else {
                //                     standardEquipment.maintainValue = 1;
                //                     standardEquipment._iconMaintainLock = false;//释放锁
                //                 }
                //             }
                //         }
                //     })
                // } else {
                //     //如果摘挂牌Maintain点不存在，不显示小图标
                //     if (standardEquipment._iconMaintainLock == false) {
                //         standardEquipment._iconMaintainLock = true;//占住锁
                //         if (standardEquipment.paintMaintainValue === 2) {
                //             standardEquipment._iconMaintainLock = false;//释放锁
                //         } else {
                //             standardEquipment.maintainValue = 2;
                //             standardEquipment._iconMaintainLock = false;//释放锁
                //         }
                //     }
                // }
                // //右下角OnOffSetting图标判断
                // if (standardEquipment.onOffSettingPoint != undefined) {
                //     eData.forEach(row => {
                //         if (standardEquipment.onOffSettingPoint === row.name && row.value == 0) {
                //             //如果OnOffSetting点值为0，赋值0--显示红球
                //             if (standardEquipment._iconOnOffSettingLock == false) {
                //                 standardEquipment._iconOnOffSettingLock = true;//占住锁
                //                 if (standardEquipment.paintOnOffSettingValue === 0) {
                //                     standardEquipment._iconOnOffSettingLock = false;//释放锁
                //                 } else {
                //                     standardEquipment.onOffSettingValue = 0;
                //                     standardEquipment._iconOnOffSettingLock = false;//释放锁
                //                 }
                //             }
                //         } else if (standardEquipment.onOffSettingPoint === row.name && row.value == 1) {
                //             //如果OnOffSetting点值为1，赋值1--显示绿球
                //             if (standardEquipment._iconOnOffSettingLock == false) {
                //                 standardEquipment._iconOnOffSettingLock = true;//占住锁
                //                 if (standardEquipment.paintOnOffSettingValue === 1) {
                //                     standardEquipment._iconOnOffSettingLock = false;//释放锁
                //                 } else {
                //                     standardEquipment.onOffSettingValue = 1;
                //                     standardEquipment._iconOnOffSettingLock = false;//释放锁
                //                 }
                //             }
                //         }
                //     })
                // } else {
                //     //如果OnOffSetting点不存在，赋值-1--不显示小球,
                //     if (standardEquipment._iconOnOffSettingLock == false) {
                //         standardEquipment._iconOnOffSettingLock = true;//占住锁
                //         if (standardEquipment.paintOnOffSettingValue === -1) {
                //             standardEquipment._iconOnOffSettingLock = false;//释放锁
                //         } else {
                //             standardEquipment.onOffSettingValue = -1;
                //             standardEquipment._iconOnOffSettingLock = false;//释放锁
                //         }
                //     }
                // }

                // // 负载量判断
                // if (standardEquipment.powerPercentPoint != undefined) {
                //     eData.forEach(row => {
                //         if (standardEquipment.powerPercentPoint === row.name) {
                //             //如果有power点值，则赋值--显示血条
                //             if (standardEquipment._iconPowerPercentLock == false) {
                //                 standardEquipment._iconPowerPercentLock = true;//占住锁
                //                 standardEquipment.powerPercentValue = row.value;
                //                 standardEquipment._iconPowerPercentLock = false;//释放锁
                //             }
                //         }
                //     })
                // } else {
                //     //如果power点不存在，赋值-1--不显示血条,
                //     if (standardEquipment._iconPowerPercentLock == false) {
                //         standardEquipment._iconPowerPercentLock = true;//占住锁
                //         standardEquipment.powerPercentValue = -1;
                //         standardEquipment._iconPowerPercentLock = false;//释放锁
                //     }
                // }

                // // 功率判断
                // if (standardEquipment.powerPoint != undefined) {
                //     eData.forEach(row => {
                //         if (standardEquipment.powerPoint === row.name) {
                //             //如果有power点值，则赋值--显示血条
                //             if (standardEquipment._iconPowerLock == false) {
                //                 standardEquipment._iconPowerLock = true;//占住锁
                //                 standardEquipment.powerValue = row.value;
                //                 standardEquipment._iconPowerLock = false;//释放锁
                //             }
                //         }
                //     })
                // } else {
                //     //如果power点不存在，赋值-1--不显示血条,
                //     if (standardEquipment._iconPowerLock == false) {
                //         standardEquipment._iconPowerLock = true;//占住锁
                //         standardEquipment.powerValue = -1;
                //         standardEquipment._iconPowerLock = false;//释放锁
                //     }
                // }

                // // 频率判断
                // if (standardEquipment.freqPoint != undefined) {
                //     eData.forEach(row => {
                //         if (standardEquipment.freqPoint === row.name) {
                //             //如果有power点值，则赋值--显示血条
                //             if (standardEquipment._iconFreqLock == false) {
                //                 standardEquipment._iconFreqLock = true;//占住锁
                //                 standardEquipment.freqValue = row.value;
                //                 standardEquipment._iconFreqLock = false;//释放锁
                //             }
                //         }
                //     })
                // } else {
                //     //如果power点不存在，赋值-1--不显示血条,
                //     if (standardEquipment._iconFreqLock == false) {
                //         standardEquipment._iconFreqLock = true;//占住锁
                //         standardEquipment.freqValue = -1;
                //         standardEquipment._iconFreqLock = false;//释放锁
                //     }
                // }

                // //判断是否绘制在离线状态
                // let dropList = JSON.parse(localStorage.getItem('netDeviceDropWarningList'))
                // let onlineList = JSON.parse(localStorage.getItem('netDeviceOnlineList'))
                // //判断是否有前后缀
                // if(standardEquipment.prefix || standardEquipment.suffix){
                //     let flag = 1
                //     if(dropList){
                //         dropList.forEach(item=>{
                //             if(item.prefix == standardEquipment.prefix && item.suffix == standardEquipment.suffix && item['equipType'] != 'PowerMeter'){
                //                 if (standardEquipment._iconOnlineLock == false) {
                //                     standardEquipment._iconOnlineLock = true;//占住锁
                //                     flag = 0
                //                     standardEquipment.netOnlineStatus = 0
                //                     standardEquipment.netHeartTime = item.delay
                //                     standardEquipment._iconOnlineLock = false;//释放锁
                //                 }
                //             }
                //         })
                //     }

                //     if(flag === 1 && onlineList){
                //         onlineList.forEach(item=>{
                //             if(item.prefix == standardEquipment.prefix && item.suffix == standardEquipment.suffix && item['equipType'] != 'PowerMeter'){
                //                 if (standardEquipment._iconOnlineLock == false) {
                //                     standardEquipment._iconOnlineLock = true;//占住锁
                //                     standardEquipment.netOnlineStatus = 1
                //                     standardEquipment.netHeartTime = item.delay
                //                     standardEquipment._iconOnlineLock = false;//释放锁
                //                 }
                //             }
                //         })
                //     }

                // } else {
                //     //如果前后缀都不存在，则不给予任何在离线判断，赋值-1--不显示血条,
                //     if (standardEquipment._iconOnlineLock == false) {
                //         standardEquipment._iconOnlineLock = true;//占住锁
                //         standardEquipment.netOnlineStatus = -1;
                //         standardEquipment.netHeartTime = 0
                //         standardEquipment._iconOnlineLock = false;//释放锁
                //     }
                // }

                // //多边形状态颜色判断
                // if (standardEquipment.errPoint != undefined) {
                //     //有err点，且有值
                //     if (JSON.stringify(eData).indexOf(standardEquipment.errPoint) != -1) {
                //         eData.forEach((row, index) => {
                //             //运行，value为1
                //             if (eData[i].value == 1) {
                //                 if (standardEquipment.errPoint === row.name && row.value == 1) {
                //                     //判断运行且报警，value为4  
                //                     if (standardEquipment._valueLock == false) {
                //                         standardEquipment._valueLock = true;//占住锁
                //                         //当前显示为4，与数据刷新判断的value为4，相同，则不再赋值                                                
                //                         if (standardEquipment.paintValue === 4) {
                //                             standardEquipment._valueLock = false;//释放锁
                //                         } else {
                //                             //当前显示不为4，与数据刷新判断的value为4，不相同，则赋值 
                //                             standardEquipment.rectValue = 4;
                //                             standardEquipment._valueLock = false;//释放锁
                //                         }
                //                     }
                //                 } else {
                //                     if ((standardEquipment.errPoint === row.name && row.value != 1)) {
                //                         //运行非报警，给1，绿色
                //                         if (standardEquipment._valueLock == false) {
                //                             standardEquipment._valueLock = true;//占住锁
                //                             //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                //                             if (standardEquipment.paintValue === 1) {
                //                                 standardEquipment._valueLock = false;//释放锁
                //                             } else {
                //                                 //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                //                                 standardEquipment.rectValue = 1;
                //                                 standardEquipment._valueLock = false;//释放锁
                //                             }
                //                         }
                //                     }
                //                 }
                //             } else {
                //                 if (standardEquipment.errPoint === row.name && row.value == 1) {
                //                     if (standardEquipment._valueLock == false) {
                //                         standardEquipment._valueLock = true;//占住锁
                //                         //当前显示为2，与数据刷新判断的value为2，相同，则不再赋值                                                
                //                         if (standardEquipment.paintValue === 2) {
                //                             standardEquipment._valueLock = false;//释放锁
                //                         } else {
                //                             //当前显示不为2，与数据刷新判断的value为2，不相同，则赋值 
                //                             standardEquipment.rectValue = 2;
                //                             standardEquipment._valueLock = false;//释放锁
                //                         }
                //                     }
                //                 } else {
                //                     if ((standardEquipment.errPoint === row.name && row.value != 1)) {
                //                         eData.forEach(rowE => {
                //                             if (standardEquipment.enabledPoint != undefined && standardEquipment.enabledPoint === rowE.name) {
                //                                 //如果设备既不报警又不运行，当禁用时，则value 为3
                //                                 if (rowE.value == 0) {
                //                                     //先给3禁用
                //                                     if (standardEquipment._valueLock == false) {
                //                                         standardEquipment._valueLock = true;//占住锁
                //                                         //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                //                                         if (standardEquipment.paintValue === 3) {
                //                                             standardEquipment._valueLock = false;//释放锁
                //                                         } else {
                //                                             //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                //                                             standardEquipment.rectValue = 3;
                //                                             standardEquipment._valueLock = false;//释放锁
                //                                         }
                //                                     }
                //                                 } else {
                //                                     //如果设备既不报警又不运行，当启用时，则value 为0
                //                                     if (rowE.value == 1) {
                //                                         if (standardEquipment._valueLock == false) {
                //                                             standardEquipment._valueLock = true;//占住锁
                //                                             //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                                             if (standardEquipment.paintValue === 0) {
                //                                                 standardEquipment._valueLock = false;//释放锁
                //                                             } else {
                //                                                 //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                                                 standardEquipment.rectValue = 0;
                //                                                 standardEquipment._valueLock = false;//释放锁
                //                                             }
                //                                         }
                //                                     }
                //                                 }
                //                             } else {
                //                                 if (JSON.stringify(eData).indexOf(standardEquipment.enabledPoint) == -1) {
                //                                     if (standardEquipment._valueLock == false) {
                //                                         standardEquipment._valueLock = true;//占住锁
                //                                         //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                                         if (standardEquipment.paintValue === 0) {
                //                                             standardEquipment._valueLock = false;//释放锁
                //                                         } else {
                //                                             //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                                             standardEquipment.rectValue = 0;
                //                                             standardEquipment._valueLock = false;//释放锁
                //                                         }
                //                                     }
                //                                 }
                //                             }
                //                         })
                //                     }
                //                 }
                //             }
                //         })
                //     } else {
                //         //模板有err点，但无值
                //         //运行，value为1
                //         if (eData[i].value == 1) {
                //             if (standardEquipment._valueLock == false) {
                //                 standardEquipment._valueLock = true;//占住锁
                //                 //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                //                 if (standardEquipment.paintValue === 1) {
                //                     standardEquipment._valueLock = false;//释放锁
                //                 } else {
                //                     //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                //                     standardEquipment.rectValue = 1;
                //                     standardEquipment._valueLock = false;//释放锁
                //                 }
                //             }
                //         } else {
                //             //模板有enabled点，且实时接口有值（点表有对应点）
                //             if (standardEquipment.enabledPoint != undefined && JSON.stringify(eData).indexOf(standardEquipment.enabledPoint) != -1) {
                //                 eData.forEach(row => {
                //                     //如果设备既不报警又不运行，当禁用时，则value 为3
                //                     if (standardEquipment.enabledPoint === row.name && row.value == 0) {
                //                         if (standardEquipment._valueLock == false) {
                //                             standardEquipment._valueLock = true;//占住锁
                //                             //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                //                             if (standardEquipment.paintValue === 3) {
                //                                 standardEquipment._valueLock = false;//释放锁
                //                             } else {
                //                                 //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                //                                 standardEquipment.rectValue = 3;
                //                                 standardEquipment._valueLock = false;//释放锁
                //                             }
                //                         }
                //                     } else {
                //                         if (standardEquipment.enabledPoint === row.name && row.value == 1) {
                //                             if (standardEquipment._valueLock == false) {
                //                                 standardEquipment._valueLock = true;//占住锁
                //                                 //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                                 if (standardEquipment.paintValue === 0) {
                //                                     standardEquipment._valueLock = false;//释放锁
                //                                 } else {
                //                                     //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                                     standardEquipment.rectValue = 0;
                //                                     standardEquipment._valueLock = false;//释放锁
                //                                 }
                //                             }
                //                         }
                //                     }
                //                 })
                //             } else {
                //                 //模板没有enabled点 或 点表无点    
                //                 if (JSON.stringify(eData).indexOf(standardEquipment.enabledPoint) == -1) {
                //                     if (standardEquipment._valueLock == false) {
                //                         standardEquipment._valueLock = true;//占住锁
                //                         //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                         if (standardEquipment.paintValue === 0) {
                //                             standardEquipment._valueLock = false;//释放锁
                //                         } else {
                //                             //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                             standardEquipment.rectValue = 0;
                //                             standardEquipment._valueLock = false;//释放锁
                //                         }
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // } else {
                //     //无err点
                //     //运行，value为1
                //     if (eData[i].value == 1) {
                //         if (standardEquipment._valueLock == false) {
                //             standardEquipment._valueLock = true;//占住锁
                //             //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                //             if (standardEquipment.paintValue === 1) {
                //                 standardEquipment._valueLock = false;//释放锁
                //             } else {
                //                 //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                //                 standardEquipment.rectValue = 1;
                //                 standardEquipment._valueLock = false;//释放锁
                //             }
                //         }
                //     } else {
                //         //模板有enabled点，且实时接口有值（点表有对应点）
                //         if (standardEquipment.enabledPoint != undefined && JSON.stringify(eData).indexOf(standardEquipment.enabledPoint) != -1) {
                //             eData.forEach(row => {
                //                 //如果设备既不报警又不运行，当禁用时，则value 为3
                //                 if (standardEquipment.enabledPoint === row.name && row.value == 0) {
                //                     if (standardEquipment._valueLock == false) {
                //                         standardEquipment._valueLock = true;//占住锁
                //                         //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                //                         if (standardEquipment.paintValue === 3) {
                //                             standardEquipment._valueLock = false;//释放锁
                //                         } else {
                //                             //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                //                             standardEquipment.rectValue = 3;
                //                             standardEquipment._valueLock = false;//释放锁
                //                         }
                //                     }
                //                 } else {
                //                     if (standardEquipment.enabledPoint === row.name && row.value == 1) {
                //                         if (standardEquipment._valueLock == false) {
                //                             standardEquipment._valueLock = true;//占住锁
                //                             //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                             if (standardEquipment.paintValue === 0) {
                //                                 standardEquipment._valueLock = false;//释放锁
                //                             } else {
                //                                 //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                                 standardEquipment.rectValue = 0;
                //                                 standardEquipment._valueLock = false;//释放锁
                //                             }
                //                         }
                //                     }
                //                 }
                //             })
                //         } else {
                //             //模板没有enabled点 或 点表无点    
                //             if (JSON.stringify(eData).indexOf(standardEquipment.enabledPoint) == -1) {
                //                 if (standardEquipment._valueLock == false) {
                //                     standardEquipment._valueLock = true;//占住锁
                //                     //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                     if (standardEquipment.paintValue === 0) {
                //                         standardEquipment._valueLock = false;//释放锁
                //                     } else {
                //                         //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                         standardEquipment.rectValue = 0;
                //                         standardEquipment._valueLock = false;//释放锁
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }
            }
        }
    },

    refreshPolygon: function (item, dictPolygons, eData) {
        //将eData数组格式转为{点名:点值}的对象格式
        let dataObj = {}
        eData.forEach(row => {
            dataObj[row.name] = row.value
        })

        for (var j = 0; j < item.polygons.length; j++) {
            let polygon = dictPolygons[item.polygons[j]];
            //如果多边形绑的点名不存在，或者点值没有，则不再渲染颜色及右上角的图标
            if (dataObj[polygon.idCom] !== undefined && dataObj[polygon.idCom] !== null) {
                this.refreshColorIcon(polygon,dataObj)
                // //A／L右上角图标判断
                // if (polygon.autoModePoint != undefined) {
                //     //如果eData实时数据里没有该点名或者点值为null时，则不处理，反之进入if
                //     if (dataObj[polygon.autoModePoint] !== undefined && dataObj[polygon.autoModePoint] !== null) {
                //         if (String(dataObj[polygon.autoModePoint]) === "0" ) {
                //             //如果手自动点值为0，赋值1
                //             if (polygon._iconAutoModeLock == false) {
                //                 polygon._iconAutoModeLock = true;//占住锁
                //                 if (polygon.paintAutoModeValue === 1) {
                //                     polygon._iconAutoModeLock = false;//释放锁
                //                 } else {
                //                     polygon.autoModeValue = 1;
                //                     polygon._iconAutoModeLock = false;//释放锁
                //                 }
                //             }
                //         } else if (String(dataObj[polygon.autoModePoint]) === "1") {
                //                 //如果手自动点值为1，赋值2
                //             if (polygon._iconAutoModeLock == false) {
                //                 polygon._iconAutoModeLock = true;//占住锁
                //                 if (polygon.paintAutoModeValue === 2) {
                //                     polygon._iconAutoModeLock = false;//释放锁
                //                 } else {
                //                     polygon.autoModeValue = 2;
                //                     polygon._iconAutoModeLock = false;//释放锁
                //                 }
                //             }
                //         }
                //     }
                // } else {
                //     //如果手自动点值为其他值，跳过，不显示小图标
                //     if (polygon._iconAutoModeLock == false) {
                //         polygon._iconAutoModeLock = true;//占住锁
                //         if (polygon.paintAutoModeValue === 0) {
                //             polygon._iconAutoModeLock = false;//释放锁
                //         } else {
                //             polygon.autoModeValue = 0;
                //             polygon._iconAutoModeLock = false;//释放锁
                //         }
                //     }
                // }
                // //E／D右上角图标判断
                // if (polygon.enabledPoint != undefined) {
                //     if (dataObj[polygon.enabledPoint] !== undefined && dataObj[polygon.enabledPoint] !== null) {
                //         if (String(dataObj[polygon.enabledPoint]) === "0" ) {
                //             //如果启用禁用点值为0，赋值1
                //             if (polygon._iconEnabledLock == false) {
                //                 polygon._iconEnabledLock = true;//占住锁
                //                 if (polygon.paintEnabledValue === 1) {
                //                     polygon._iconEnabledLock = false;//释放锁
                //                 } else {
                //                     polygon.enabledValue = 1;
                //                     polygon._iconEnabledLock = false;//释放锁
                //                 }
                //             }
                //         }else if (String(dataObj[polygon.enabledPoint]) === "1" ) {
                //             //如果启用禁用点值为1，赋值2
                //             if (polygon._iconEnabledLock == false) {
                //                 polygon._iconEnabledLock = true;//占住锁
                //                 if (polygon.paintEnabledValue === 2) {
                //                     polygon._iconEnabledLock = false;//释放锁
                //                 } else {
                //                     polygon.enabledValue = 2;
                //                     polygon._iconEnabledLock = false;//释放锁
                //                 }
                //             }
                //         }
                //     }
                // } else {
                //     //如果启用禁用点值为其他值,跳过，不显示小图标
                //     if (polygon._iconEnabledLock == false) {
                //         polygon._iconEnabledLock = true;//占住锁
                //         if (polygon.paintEnabledValue === 0) {
                //             polygon._iconEnabledLock = false;//释放锁
                //         } else {
                //             polygon.enabledValue = 0;
                //             polygon._iconEnabledLock = false;//释放锁
                //         }
                //     }
                // }
                // //摘挂牌Maintain右上角图标判断
                // if (polygon.maintainPoint != undefined) {
                //     if (dataObj[polygon.maintainPoint] !== undefined && dataObj[polygon.maintainPoint] !== null) {
                //         if (String(dataObj[polygon.maintainPoint]) === "0" ) {
                //             //如果摘挂牌Maintain点值为0，赋值0--显示图标
                //             if (polygon._iconMaintainLock == false) {
                //                 polygon._iconMaintainLock = true;//占住锁
                //                 if (polygon.paintMaintainValue === 0) {
                //                     polygon._iconMaintainLock = false;//释放锁
                //                 } else {
                //                     polygon.maintainValue = 0;
                //                     polygon._iconMaintainLock = false;//释放锁
                //                 }
                //             }
                //         }else if (String(dataObj[polygon.maintainPoint]) === "1" ) {
                //             //如果摘挂牌Maintain点值为1，赋值1--显示图标
                //             if (polygon._iconMaintainLock == false) {
                //                 polygon._iconMaintainLock = true;//占住锁
                //                 if (polygon.paintMaintainValue === 1) {
                //                     polygon._iconMaintainLock = false;//释放锁
                //                 } else {
                //                     polygon.maintainValue = 1;
                //                     polygon._iconMaintainLock = false;//释放锁
                //                 }
                //             }
                //         }
                //     }
                // } else {
                //     //如果摘挂牌Maintain点不存在，不显示小图标
                //     if (polygon._iconMaintainLock == false) {
                //         polygon._iconMaintainLock = true;//占住锁
                //         if (polygon.paintMaintainValue === 2) {
                //             polygon._iconMaintainLock = false;//释放锁
                //         } else {
                //             polygon.maintainValue = 2;
                //             polygon._iconMaintainLock = false;//释放锁
                //         }
                //     }
                // }
                // //右下角OnOffSetting图标判断
                // if (polygon.onOffSettingPoint != undefined) {
                //     if (dataObj[polygon.onOffSettingPoint] !== undefined && dataObj[polygon.onOffSettingPoint] !== null) {
                //         if (String(dataObj[polygon.onOffSettingPoint]) === "0" ) {
                //             //如果OnOffSetting点值为0，赋值0--显示红球
                //             if (polygon._iconOnOffSettingLock == false) {
                //                 polygon._iconOnOffSettingLock = true;//占住锁
                //                 if (polygon.paintOnOffSettingValue === 0) {
                //                     polygon._iconOnOffSettingLock = false;//释放锁
                //                 } else {
                //                     polygon.onOffSettingValue = 0;
                //                     polygon._iconOnOffSettingLock = false;//释放锁
                //                 }
                //             }
                //         }else if (String(dataObj[polygon.onOffSettingPoint]) === "1" ) {
                //             //如果OnOffSetting点值为1，赋值1--显示绿球
                //             if (polygon._iconOnOffSettingLock == false) {
                //                 polygon._iconOnOffSettingLock = true;//占住锁
                //                 if (polygon.paintOnOffSettingValue === 1) {
                //                     polygon._iconOnOffSettingLock = false;//释放锁
                //                 } else {
                //                     polygon.onOffSettingValue = 1;
                //                     polygon._iconOnOffSettingLock = false;//释放锁
                //                 }
                //             }
                //         }
                //     }
                // } else {
                //     //如果OnOffSetting点不存在，赋值-1--不显示小球,
                //     if (polygon._iconOnOffSettingLock == false) {
                //         polygon._iconOnOffSettingLock = true;//占住锁
                //         if (polygon.paintOnOffSettingValue === -1) {
                //             polygon._iconOnOffSettingLock = false;//释放锁
                //         } else {
                //             polygon.onOffSettingValue = -1;
                //             polygon._iconOnOffSettingLock = false;//释放锁
                //         }
                //     }
                // }

                // // 负载量判断
                // if (polygon.powerPercentPoint != undefined) {
                //     if (dataObj[polygon.powerPercentPoint] !== undefined && dataObj[polygon.powerPercentPoint] !== null) {
                //         //如果有power点值，则赋值--显示血条
                //         if (polygon._iconPowerPercentLock == false) {
                //             polygon._iconPowerPercentLock = true;//占住锁
                //             polygon.powerPercentValue = dataObj[polygon.powerPercentPoint];
                //             polygon._iconPowerPercentLock = false;//释放锁
                //         }
                //     }
                // } else {
                //     //如果power点不存在，赋值-1--不显示血条,
                //     if (polygon._iconPowerPercentLock == false) {
                //         polygon._iconPowerPercentLock = true;//占住锁
                //         polygon.powerPercentValue = -1;
                //         polygon._iconPowerPercentLock = false;//释放锁
                //     }
                // }

                // // 功率判断
                // if (polygon.powerPoint != undefined) {
                //     if (dataObj[polygon.powerPoint] !== undefined && dataObj[polygon.powerPoint] !== null) {
                //         //如果有power点值，则赋值--显示血条
                //         if (polygon._iconPowerLock == false) {
                //             polygon._iconPowerLock = true;//占住锁
                //             polygon.powerValue = dataObj[polygon.powerPoint];
                //             polygon._iconPowerLock = false;//释放锁
                //         }
                //     }
                // } else {
                //     //如果power点不存在，赋值-1--不显示血条,
                //     if (polygon._iconPowerLock == false) {
                //         polygon._iconPowerLock = true;//占住锁
                //         polygon.powerValue = -1;
                //         polygon._iconPowerLock = false;//释放锁
                //     }
                // }

                // // 频率判断
                // if (polygon.freqPoint != undefined) {
                //     if (dataObj[polygon.freqPoint] !== undefined && dataObj[polygon.freqPoint] !== null) {
                //         //如果有power点值，则赋值--显示血条
                //         if (polygon._iconFreqLock == false) {
                //             polygon._iconFreqLock = true;//占住锁
                //             polygon.freqValue = dataObj[polygon.freqPoint];
                //             polygon._iconFreqLock = false;//释放锁
                //         }
                //     }
                // } else {
                //     //如果power点不存在，赋值-1--不显示血条,
                //     if (polygon._iconFreqLock == false) {
                //         polygon._iconFreqLock = true;//占住锁
                //         polygon.freqValue = -1;
                //         polygon._iconFreqLock = false;//释放锁
                //     }
                // }

                // //判断是否绘制在离线状态
                // let dropList = JSON.parse(localStorage.getItem('netDeviceDropWarningList'))
                // let onlineList = JSON.parse(localStorage.getItem('netDeviceOnlineList'))
                // //判断是否有前后缀
                // if(polygon.prefix || polygon.suffix){
                //     let flag = 1
                //     if(dropList){
                //         dropList.forEach(item=>{
                //             if(item.prefix == polygon.prefix && item.suffix == polygon.suffix && item['equipType'] != 'PowerMeter'){
                //                 if (polygon._iconOnlineLock == false) {
                //                     polygon._iconOnlineLock = true;//占住锁
                //                     flag = 0
                //                     polygon.netOnlineStatus = 0
                //                     polygon.netHeartTime = item.delay
                //                     polygon._iconOnlineLock = false;//释放锁
                //                 }
                //             }
                //         })
                //     }

                //     if(flag === 1 && onlineList){
                //         onlineList.forEach(item=>{
                //             if(item.prefix == polygon.prefix && item.suffix == polygon.suffix && item['equipType'] != 'PowerMeter'){
                //                 if (polygon._iconOnlineLock == false) {
                //                     polygon._iconOnlineLock = true;//占住锁
                //                     polygon.netOnlineStatus = 1
                //                     polygon.netHeartTime = item.delay
                //                     polygon._iconOnlineLock = false;//释放锁
                //                 }
                //             }
                //         })
                //     }

                // } else {
                //     //如果前后缀都不存在，则不给予任何在离线判断，赋值-1--不显示血条,
                //     if (polygon._iconOnlineLock == false) {
                //         polygon._iconOnlineLock = true;//占住锁
                //         polygon.netOnlineStatus = -1;
                //         polygon.netHeartTime = 0
                //         polygon._iconOnlineLock = false;//释放锁
                //     }
                // }

                // //多边形状态颜色判断
                // if (polygon.errPoint != undefined) {
                //     //有err点，且有值
                //     if (dataObj[polygon.errPoint] !== undefined && dataObj[polygon.errPoint] !== null) {
                //         //运行，value为1
                //         if (String(dataObj[polygon.idCom]) === "1") {
                //             if (String(dataObj[polygon.errPoint]) === "1" ) {
                //                 //判断运行且报警，value为4  
                //                 if (polygon._valueLock == false) {
                //                     polygon._valueLock = true;//占住锁
                //                     //当前显示为4，与数据刷新判断的value为4，相同，则不再赋值                                                
                //                     if (polygon.paintValue === 4) {
                //                         polygon._valueLock = false;//释放锁
                //                     } else {
                //                         //当前显示不为4，与数据刷新判断的value为4，不相同，则赋值 
                //                         polygon.value = 4;
                //                         polygon._valueLock = false;//释放锁
                //                     }
                //                 }
                //             } else if (String(dataObj[polygon.errPoint]) !== "1" ) { //问题：当状态为1，err不是1，则直接给绿，还需要严格判断err是否为0吗？
                //                 //运行非报警，给1，绿色
                //                 if (polygon._valueLock == false) {
                //                     polygon._valueLock = true;//占住锁
                //                     //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                //                     if (polygon.paintValue === 1) {
                //                         polygon._valueLock = false;//释放锁
                //                     } else {
                //                         //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                //                         polygon.value = 1;
                //                         polygon._valueLock = false;//释放锁
                //                     }
                //                 }
                //             }
                //         } else {
                //             if (dataObj[polygon.errPoint] !== undefined && dataObj[polygon.errPoint] !== null) {
                //                 if (String(dataObj[polygon.errPoint]) === "1" ) {
                //                     if (polygon._valueLock == false) {
                //                         polygon._valueLock = true;//占住锁
                //                         //当前显示为2，与数据刷新判断的value为2，相同，则不再赋值                                                
                //                         if (polygon.paintValue === 2) {
                //                             polygon._valueLock = false;//释放锁
                //                         } else {
                //                             //当前显示不为2，与数据刷新判断的value为2，不相同，则赋值 
                //                             polygon.value = 2;
                //                             polygon._valueLock = false;//释放锁
                //                         }
                //                     }
                //                 }else {
                //                     if (dataObj[polygon.enabledPoint] !== undefined && dataObj[polygon.enabledPoint] !== null) {
                //                         //如果设备既不报警又不运行，当禁用时，则value 为3
                //                         if (String(dataObj[polygon.enabledPoint]) === "0" ) {
                //                             //先给3禁用
                //                             if (polygon._valueLock == false) {
                //                                 polygon._valueLock = true;//占住锁
                //                                 //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                //                                 if (polygon.paintValue === 3) {
                //                                     polygon._valueLock = false;//释放锁
                //                                 } else {
                //                                     //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                //                                     polygon.value = 3;
                //                                     polygon._valueLock = false;//释放锁
                //                                 }
                //                             }
                //                         }else {
                //                             //如果设备既不报警又不运行，当启用时，则value 为0
                //                             if (String(dataObj[polygon.enabledPoint]) === "1" ) {
                //                                 if (polygon._valueLock == false) {
                //                                     polygon._valueLock = true;//占住锁
                //                                     //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                                     if (polygon.paintValue === 0) {
                //                                         polygon._valueLock = false;//释放锁
                //                                     } else {
                //                                         //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                                         polygon.value = 0;
                //                                         polygon._valueLock = false;//释放锁
                //                                     }
                //                                 }
                //                             }
                //                         }
                //                     }else {
                //                         //（前提：value不等于1，err不等于1）如果没有enabledPoint点，或者enabledPoint点值为null，则给0
                //                         if (polygon._valueLock == false) {
                //                             polygon._valueLock = true;//占住锁
                //                             //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                             if (polygon.paintValue === 0) {
                //                                 polygon._valueLock = false;//释放锁
                //                             } else {
                //                                 //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                                 polygon.value = 0;
                //                                 polygon._valueLock = false;//释放锁
                //                             }
                //                         }
                //                     }
                //                 }
                //             }
                //         }
                //     } else {
                //         //模板有err点，但无值
                //         //运行，value为1
                //         if (String(dataObj[polygon.idCom]) === "1") {
                //             if (polygon._valueLock == false) {
                //                 polygon._valueLock = true;//占住锁
                //                 //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                //                 if (polygon.paintValue === 1) {
                //                     polygon._valueLock = false;//释放锁
                //                 } else {
                //                     //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                //                     polygon.value = 1;
                //                     polygon._valueLock = false;//释放锁
                //                 }
                //             }
                //         } else {
                //             //模板有enabled点，且实时接口有值（点表有对应点）
                //             if (polygon.enabledPoint != undefined) {
                //                 if (dataObj[polygon.enabledPoint] !== undefined && dataObj[polygon.enabledPoint] !== null) {
                //                     if (String(dataObj[polygon.enabledPoint]) === "0" ) {
                //                         if (polygon._valueLock == false) {
                //                             polygon._valueLock = true;//占住锁
                //                             //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                //                             if (polygon.paintValue === 3) {
                //                                 polygon._valueLock = false;//释放锁
                //                             } else {
                //                                 //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                //                                 polygon.value = 3;
                //                                 polygon._valueLock = false;//释放锁
                //                             }
                //                         }
                //                     }else {
                //                         if (String(dataObj[polygon.enabledPoint]) === "1" ) {
                //                             if (polygon._valueLock == false) {
                //                                 polygon._valueLock = true;//占住锁
                //                                 //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                                 if (polygon.paintValue === 0) {
                //                                     polygon._valueLock = false;//释放锁
                //                                 } else {
                //                                     //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                                     polygon.value = 0;
                //                                     polygon._valueLock = false;//释放锁
                //                                 }
                //                             }
                //                         }
                //                     }
                //                 }
                //             } else {
                //                 //模板没有enabled点 或 点表无点    
                //                 if (dataObj[polygon.enabledPoint] === undefined) {
                //                     if (polygon._valueLock == false) {
                //                         polygon._valueLock = true;//占住锁
                //                         //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                         if (polygon.paintValue === 0) {
                //                             polygon._valueLock = false;//释放锁
                //                         } else {
                //                             //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                             polygon.value = 0;
                //                             polygon._valueLock = false;//释放锁
                //                         }
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // } else {
                //     //无err点
                //     //运行，value为1
                //     if (String(dataObj[polygon.idCom]) === "1") {
                //         if (polygon._valueLock == false) {
                //             polygon._valueLock = true;//占住锁
                //             //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                //             if (polygon.paintValue === 1) {
                //                 polygon._valueLock = false;//释放锁
                //             } else {
                //                 //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                //                 polygon.value = 1;
                //                 polygon._valueLock = false;//释放锁
                //             }
                //         }
                //     } else {
                //         //模板有enabled点，且实时接口有值（点表有对应点）
                //         if (polygon.enabledPoint != undefined) {
                //             if (dataObj[polygon.enabledPoint] !== undefined && dataObj[polygon.enabledPoint] !== null) {
                //                 //如果设备既不报警又不运行，当禁用时，则value 为3
                //                 if (String(dataObj[polygon.enabledPoint]) === "0" ) {
                //                     if (polygon._valueLock == false) {
                //                         polygon._valueLock = true;//占住锁
                //                         //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                //                         if (polygon.paintValue === 3) {
                //                             polygon._valueLock = false;//释放锁
                //                         } else {
                //                             //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                //                             polygon.value = 3;
                //                             polygon._valueLock = false;//释放锁
                //                         }
                //                     }
                //                 }else {
                //                     if (String(dataObj[polygon.enabledPoint]) === "1" ) {
                //                         if (polygon._valueLock == false) {
                //                             polygon._valueLock = true;//占住锁
                //                             //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                             if (polygon.paintValue === 0) {
                //                                 polygon._valueLock = false;//释放锁
                //                             } else {
                //                                 //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                                 polygon.value = 0;
                //                                 polygon._valueLock = false;//释放锁
                //                             }
                //                         }
                //                     }
                //                 }
                //             }
                //         } else {
                //             //模板没有enabled点 或 点表无点    
                //             if (dataObj[polygon.enabledPoint] === undefined) {
                //                 if (polygon._valueLock == false) {
                //                     polygon._valueLock = true;//占住锁
                //                     //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                //                     if (polygon.paintValue === 0) {
                //                         polygon._valueLock = false;//释放锁
                //                     } else {
                //                         //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                //                         polygon.value = 0;
                //                         polygon._valueLock = false;//释放锁
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }
            }
        }
    },


    //多边形、标准设备颜色及右上角图标数据刷新
    refreshColorIcon: function (element,dataObj,rectValue) {
        //A／L右上角图标判断
        if (element.autoModePoint != undefined) {
            //如果eData实时数据里没有该点名或者点值为null时，则不处理，反之进入if
            if (dataObj[element.autoModePoint] !== undefined && dataObj[element.autoModePoint] !== null) {
                if (String(dataObj[element.autoModePoint]) === "0" ) {
                    //如果手自动点值为0，赋值1
                    if (element._iconAutoModeLock == false) {
                        element._iconAutoModeLock = true;//占住锁
                        if (element.paintAutoModeValue === 1) {
                            element._iconAutoModeLock = false;//释放锁
                        } else {
                            element.autoModeValue = 1;
                            element._iconAutoModeLock = false;//释放锁
                        }
                    }
                } else if (String(dataObj[element.autoModePoint]) === "1") {
                        //如果手自动点值为1，赋值2
                    if (element._iconAutoModeLock == false) {
                        element._iconAutoModeLock = true;//占住锁
                        if (element.paintAutoModeValue === 2) {
                            element._iconAutoModeLock = false;//释放锁
                        } else {
                            element.autoModeValue = 2;
                            element._iconAutoModeLock = false;//释放锁
                        }
                    }
                }
            }
        } else {
            //如果手自动点值为其他值，跳过，不显示小图标
            if (element._iconAutoModeLock == false) {
                element._iconAutoModeLock = true;//占住锁
                if (element.paintAutoModeValue === 0) {
                    element._iconAutoModeLock = false;//释放锁
                } else {
                    element.autoModeValue = 0;
                    element._iconAutoModeLock = false;//释放锁
                }
            }
        }
        //E／D右上角图标判断
        if (element.enabledPoint != undefined) {
            if (dataObj[element.enabledPoint] !== undefined && dataObj[element.enabledPoint] !== null) {
                if (String(dataObj[element.enabledPoint]) === "0" ) {
                    //如果启用禁用点值为0，赋值1
                    if (element._iconEnabledLock == false) {
                        element._iconEnabledLock = true;//占住锁
                        if (element.paintEnabledValue === 1) {
                            element._iconEnabledLock = false;//释放锁
                        } else {
                            element.enabledValue = 1;
                            element._iconEnabledLock = false;//释放锁
                        }
                    }
                }else if (String(dataObj[element.enabledPoint]) === "1" ) {
                    //如果启用禁用点值为1，赋值2
                    if (element._iconEnabledLock == false) {
                        element._iconEnabledLock = true;//占住锁
                        if (element.paintEnabledValue === 2) {
                            element._iconEnabledLock = false;//释放锁
                        } else {
                            element.enabledValue = 2;
                            element._iconEnabledLock = false;//释放锁
                        }
                    }
                }
            }
        } else {
            //如果启用禁用点值为其他值,跳过，不显示小图标
            if (element._iconEnabledLock == false) {
                element._iconEnabledLock = true;//占住锁
                if (element.paintEnabledValue === 0) {
                    element._iconEnabledLock = false;//释放锁
                } else {
                    element.enabledValue = 0;
                    element._iconEnabledLock = false;//释放锁
                }
            }
        }
        //摘挂牌Maintain右上角图标判断
        if (element.maintainPoint != undefined) {
            if (dataObj[element.maintainPoint] !== undefined && dataObj[element.maintainPoint] !== null) {
                if (String(dataObj[element.maintainPoint]) === "0" ) {
                    //如果摘挂牌Maintain点值为0，赋值0--显示图标
                    if (element._iconMaintainLock == false) {
                        element._iconMaintainLock = true;//占住锁
                        if (element.paintMaintainValue === 0) {
                            element._iconMaintainLock = false;//释放锁
                        } else {
                            element.maintainValue = 0;
                            element._iconMaintainLock = false;//释放锁
                        }
                    }
                }else if (String(dataObj[element.maintainPoint]) === "1" ) {
                    //如果摘挂牌Maintain点值为1，赋值1--显示图标
                    if (element._iconMaintainLock == false) {
                        element._iconMaintainLock = true;//占住锁
                        if (element.paintMaintainValue === 1) {
                            element._iconMaintainLock = false;//释放锁
                        } else {
                            element.maintainValue = 1;
                            element._iconMaintainLock = false;//释放锁
                        }
                    }
                }
            }
        } else {
            //如果摘挂牌Maintain点不存在，不显示小图标
            if (element._iconMaintainLock == false) {
                element._iconMaintainLock = true;//占住锁
                if (element.paintMaintainValue === 2) {
                    element._iconMaintainLock = false;//释放锁
                } else {
                    element.maintainValue = 2;
                    element._iconMaintainLock = false;//释放锁
                }
            }
        }
        //右下角OnOffSetting图标判断
        if (element.onOffSettingPoint != undefined) {
            if (dataObj[element.onOffSettingPoint] !== undefined && dataObj[element.onOffSettingPoint] !== null) {
                if (String(dataObj[element.onOffSettingPoint]) === "0" ) {
                    //如果OnOffSetting点值为0，赋值0--显示红球
                    if (element._iconOnOffSettingLock == false) {
                        element._iconOnOffSettingLock = true;//占住锁
                        if (element.paintOnOffSettingValue === 0) {
                            element._iconOnOffSettingLock = false;//释放锁
                        } else {
                            element.onOffSettingValue = 0;
                            element._iconOnOffSettingLock = false;//释放锁
                        }
                    }
                }else if (String(dataObj[element.onOffSettingPoint]) === "1" ) {
                    //如果OnOffSetting点值为1，赋值1--显示绿球
                    if (element._iconOnOffSettingLock == false) {
                        element._iconOnOffSettingLock = true;//占住锁
                        if (element.paintOnOffSettingValue === 1) {
                            element._iconOnOffSettingLock = false;//释放锁
                        } else {
                            element.onOffSettingValue = 1;
                            element._iconOnOffSettingLock = false;//释放锁
                        }
                    }
                }
            }
        } else {
            //如果OnOffSetting点不存在，赋值-1--不显示小球,
            if (element._iconOnOffSettingLock == false) {
                element._iconOnOffSettingLock = true;//占住锁
                if (element.paintOnOffSettingValue === -1) {
                    element._iconOnOffSettingLock = false;//释放锁
                } else {
                    element.onOffSettingValue = -1;
                    element._iconOnOffSettingLock = false;//释放锁
                }
            }
        }

        // 负载量判断
        if (element.powerPercentPoint != undefined) {
            if (dataObj[element.powerPercentPoint] !== undefined && dataObj[element.powerPercentPoint] !== null) {
                //如果有power点值，则赋值--显示血条
                if (element._iconPowerPercentLock == false) {
                    element._iconPowerPercentLock = true;//占住锁
                    element.powerPercentValue = dataObj[element.powerPercentPoint];
                    element._iconPowerPercentLock = false;//释放锁
                }
            }
        } else {
            //如果power点不存在，赋值-1--不显示血条,
            if (element._iconPowerPercentLock == false) {
                element._iconPowerPercentLock = true;//占住锁
                element.powerPercentValue = -1;
                element._iconPowerPercentLock = false;//释放锁
            }
        }

        // 功率判断
        if (element.powerPoint != undefined) {
            if (dataObj[element.powerPoint] !== undefined && dataObj[element.powerPoint] !== null) {
                //如果有power点值，则赋值--显示血条
                if (element._iconPowerLock == false) {
                    element._iconPowerLock = true;//占住锁
                    element.powerValue = dataObj[element.powerPoint];
                    element._iconPowerLock = false;//释放锁
                }
            }
        } else {
            //如果power点不存在，赋值-1--不显示血条,
            if (element._iconPowerLock == false) {
                element._iconPowerLock = true;//占住锁
                element.powerValue = -1;
                element._iconPowerLock = false;//释放锁
            }
        }

        // 频率判断
        if (element.freqPoint != undefined) {
            if (dataObj[element.freqPoint] !== undefined && dataObj[element.freqPoint] !== null) {
                //如果有power点值，则赋值--显示血条
                if (element._iconFreqLock == false) {
                    element._iconFreqLock = true;//占住锁
                    element.freqValue = dataObj[element.freqPoint];
                    element._iconFreqLock = false;//释放锁
                }
            }
        } else {
            //如果power点不存在，赋值-1--不显示血条,
            if (element._iconFreqLock == false) {
                element._iconFreqLock = true;//占住锁
                element.freqValue = -1;
                element._iconFreqLock = false;//释放锁
            }
        }

        //判断是否绘制在离线状态
        let dropList = JSON.parse(localStorage.getItem('netDeviceDropWarningList'))
        let onlineList = JSON.parse(localStorage.getItem('netDeviceOnlineList'))
        //判断是否有前后缀
        if(element.prefix || element.suffix){
            let flag = 1
            if(dropList){
                dropList.forEach(item=>{
                    if(item.prefix == element.prefix && item.suffix == element.suffix && item['equipType'] != 'PowerMeter'){
                        if (element._iconOnlineLock == false) {
                            element._iconOnlineLock = true;//占住锁
                            flag = 0
                            element.netOnlineStatus = 0
                            element.netHeartTime = item.delay
                            element._iconOnlineLock = false;//释放锁
                        }
                    }
                })
            }

            if(flag === 1 && onlineList){
                onlineList.forEach(item=>{
                    if(item.prefix == element.prefix && item.suffix == element.suffix && item['equipType'] != 'PowerMeter'){
                        if (element._iconOnlineLock == false) {
                            element._iconOnlineLock = true;//占住锁
                            element.netOnlineStatus = 1
                            element.netHeartTime = item.delay
                            element._iconOnlineLock = false;//释放锁
                        }
                    }
                })
            }

        } else {
            //如果前后缀都不存在，则不给予任何在离线判断，赋值-1--不显示血条,
            if (element._iconOnlineLock == false) {
                element._iconOnlineLock = true;//占住锁
                element.netOnlineStatus = -1;
                element.netHeartTime = 0
                element._iconOnlineLock = false;//释放锁
            }
        }

        //设备状态颜色判断
        if (element.errPoint != undefined) {
            //有err点，且有值
            if (dataObj[element.errPoint] !== undefined && dataObj[element.errPoint] !== null) {
                //运行，value为1
                if (String(dataObj[element.idCom]) === "1") {
                    if (String(dataObj[element.errPoint]) === "1" ) {
                        //判断运行且报警，value为4  
                        if (element._valueLock == false) {
                            element._valueLock = true;//占住锁
                            //当前显示为4，与数据刷新判断的value为4，相同，则不再赋值                                                
                            if (element.paintValue === 4) {
                                element._valueLock = false;//释放锁
                            } else {
                                //当前显示不为4，与数据刷新判断的value为4，不相同，则赋值 
                                if (rectValue !=undefined) {
                                    element.rectValue = 4;
                                }else {
                                    element.value = 4;
                                }
                                element._valueLock = false;//释放锁
                            }
                        }
                    } else if (String(dataObj[element.errPoint]) !== "1" ) { //问题：当状态为1，err不是1，则直接给绿，还需要严格判断err是否为0吗？
                        //运行非报警，给1，绿色
                        if (element._valueLock == false) {
                            element._valueLock = true;//占住锁
                            //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                            if (element.paintValue === 1) {
                                element._valueLock = false;//释放锁
                            } else {
                                //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                                if (rectValue !=undefined) {
                                    element.rectValue = 1;
                                }else {
                                    element.value = 1;
                                }
                                element._valueLock = false;//释放锁
                            }
                        }
                    }
                } else {
                    if (dataObj[element.errPoint] !== undefined && dataObj[element.errPoint] !== null) {
                        if (String(dataObj[element.errPoint]) === "1" ) {
                            if (element._valueLock == false) {
                                element._valueLock = true;//占住锁
                                //当前显示为2，与数据刷新判断的value为2，相同，则不再赋值                                                
                                if (element.paintValue === 2) {
                                    element._valueLock = false;//释放锁
                                } else {
                                    //当前显示不为2，与数据刷新判断的value为2，不相同，则赋值 
                                    if (rectValue !=undefined) {
                                        element.rectValue = 2;
                                    }else {
                                        element.value = 2;
                                    }
                                    element._valueLock = false;//释放锁
                                }
                            }
                        }else {
                            if (dataObj[element.enabledPoint] !== undefined && dataObj[element.enabledPoint] !== null) {
                                //如果设备既不报警又不运行，当禁用时，则value 为3
                                if (String(dataObj[element.enabledPoint]) === "0" ) {
                                    //先给3禁用
                                    if (element._valueLock == false) {
                                        element._valueLock = true;//占住锁
                                        //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                                        if (element.paintValue === 3) {
                                            element._valueLock = false;//释放锁
                                        } else {
                                            //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                                            if (rectValue !=undefined) {
                                                element.rectValue = 3;
                                            }else {
                                                element.value = 3;
                                            }
                                            element._valueLock = false;//释放锁
                                        }
                                    }
                                }else {
                                    //如果设备既不报警又不运行，当启用时，则value 为0
                                    if (String(dataObj[element.enabledPoint]) === "1" ) {
                                        if (element._valueLock == false) {
                                            element._valueLock = true;//占住锁
                                            //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                                            if (element.paintValue === 0) {
                                                element._valueLock = false;//释放锁
                                            } else {
                                                //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                                                if (rectValue !=undefined) {
                                                    element.rectValue = 0;
                                                }else {
                                                    element.value = 0;
                                                }
                                                element._valueLock = false;//释放锁
                                            }
                                        }
                                    }
                                }
                            }else {
                                //（前提：value不等于1，err不等于1）如果没有enabledPoint点，或者enabledPoint点值为null，则给0
                                if (element._valueLock == false) {
                                    element._valueLock = true;//占住锁
                                    //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                                    if (element.paintValue === 0) {
                                        element._valueLock = false;//释放锁
                                    } else {
                                        //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                                        if (rectValue !=undefined) {
                                            element.rectValue = 0;
                                        }else {
                                            element.value = 0;
                                        }
                                        element._valueLock = false;//释放锁
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                //模板有err点，但无值
                //运行，value为1
                if (String(dataObj[element.idCom]) === "1") {
                    if (element._valueLock == false) {
                        element._valueLock = true;//占住锁
                        //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                        if (element.paintValue === 1) {
                            element._valueLock = false;//释放锁
                        } else {
                            //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                            if (rectValue !=undefined) {
                                element.rectValue = 1;
                            }else {
                                element.value = 1;
                            }
                            element._valueLock = false;//释放锁
                        }
                    }
                } else {
                    //模板有enabled点，且实时接口有值（点表有对应点）
                    if (element.enabledPoint != undefined) {
                        if (dataObj[element.enabledPoint] !== undefined && dataObj[element.enabledPoint] !== null) {
                            if (String(dataObj[element.enabledPoint]) === "0" ) {
                                if (element._valueLock == false) {
                                    element._valueLock = true;//占住锁
                                    //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                                    if (element.paintValue === 3) {
                                        element._valueLock = false;//释放锁
                                    } else {
                                        //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                                        if (rectValue !=undefined) {
                                            element.rectValue = 3;
                                        }else {
                                            element.value = 3;
                                        }
                                        element._valueLock = false;//释放锁
                                    }
                                }
                            }else {
                                if (String(dataObj[element.enabledPoint]) === "1" ) {
                                    if (element._valueLock == false) {
                                        element._valueLock = true;//占住锁
                                        //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                                        if (element.paintValue === 0) {
                                            element._valueLock = false;//释放锁
                                        } else {
                                            //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                                            if (rectValue !=undefined) {
                                                element.rectValue = 0;
                                            }else {
                                                element.value = 0;
                                            }
                                            element._valueLock = false;//释放锁
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        //模板没有enabled点 或 点表无点    
                        if (dataObj[element.enabledPoint] === undefined) {
                            if (element._valueLock == false) {
                                element._valueLock = true;//占住锁
                                //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                                if (element.paintValue === 0) {
                                    element._valueLock = false;//释放锁
                                } else {
                                    //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                                    if (rectValue !=undefined) {
                                        element.rectValue = 0;
                                    }else {
                                        element.value = 0;
                                    }
                                    element._valueLock = false;//释放锁
                                }
                            }
                        }
                    }
                }
            }
        } else {
            //无err点
            //运行，value为1
            if (String(dataObj[element.idCom]) === "1") {
                if (element._valueLock == false) {
                    element._valueLock = true;//占住锁
                    //当前显示为1，与数据刷新判断的value为1，相同，则不再赋值                                                
                    if (element.paintValue === 1) {
                        element._valueLock = false;//释放锁
                    } else {
                        //当前显示不为1，与数据刷新判断的value为1，不相同，则赋值 
                        if (rectValue !=undefined) {
                            element.rectValue = 1;
                        }else {
                            element.value = 1;
                        }
                        element._valueLock = false;//释放锁
                    }
                }
            } else {
                //模板有enabled点，且实时接口有值（点表有对应点）
                if (element.enabledPoint != undefined) {
                    if (dataObj[element.enabledPoint] !== undefined && dataObj[element.enabledPoint] !== null) {
                        //如果设备既不报警又不运行，当禁用时，则value 为3
                        if (String(dataObj[element.enabledPoint]) === "0" ) {
                            if (element._valueLock == false) {
                                element._valueLock = true;//占住锁
                                //当前显示为3，与数据刷新判断的value为3，相同，则不再赋值                                                
                                if (element.paintValue === 3) {
                                    element._valueLock = false;//释放锁
                                } else {
                                    //当前显示不为3，与数据刷新判断的value为3，不相同，则赋值 
                                    if (rectValue !=undefined) {
                                        element.rectValue = 3;
                                    }else {
                                        element.value = 3;
                                    }
                                    element._valueLock = false;//释放锁
                                }
                            }
                        }else {
                            if (String(dataObj[element.enabledPoint]) === "1" ) {
                                if (element._valueLock == false) {
                                    element._valueLock = true;//占住锁
                                    //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                                    if (element.paintValue === 0) {
                                        element._valueLock = false;//释放锁
                                    } else {
                                        //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                                        if (rectValue !=undefined) {
                                            element.rectValue = 0;
                                        }else {
                                            element.value = 0;
                                        }
                                        element._valueLock = false;//释放锁
                                    }
                                }
                            }
                        }
                    }
                } else {
                    //模板没有enabled点 或 点表无点    
                    if (dataObj[element.enabledPoint] === undefined) {
                        if (element._valueLock == false) {
                            element._valueLock = true;//占住锁
                            //当前显示为0，与数据刷新判断的value为0，相同，则不再赋值                                                
                            if (element.paintValue === 0) {
                                element._valueLock = false;//释放锁
                            } else {
                                //当前显示不为0，与数据刷新判断的value为0，不相同，则赋值 
                                if (rectValue !=undefined) {
                                    element.rectValue = 0;
                                }else {
                                    element.value = 0;
                                }
                                element._valueLock = false;//释放锁
                            }
                        }
                    }
                }
            }
        }
    },


    initImageDictionary: function () {
        if (this.store.images) {
            var item;
            for (var i = 0; i < this.store.images.length; i++) {
                item = this.store.images[i];
                //当图片名称为空字符时，忽略，不再继续
                if (item != '') {
                    // this.hitModel.add(item.id, this.enmuElementType.equipment, item.x, item.y, item.width, item.height);
                    if (this.store.images[i].toString().indexOf('template/') >= 0) {
                        this.addTemplateImageIntoRequestQueue(item.substring(9));
                    }
                    else {
                        if (this.store.images[i].toString().indexOf('fix/') >= 0) {
                            this.addFixImageIntoRequestQueue(item.substring(4));
                        } else {
                            this.addImageIntoRequestQueue(item);
                        }
                    }
                }
            }
        }
        if (this.store.animationImages) {
            var item;
            for (var i = 0; i < this.store.animationImages.length; i++) {
                item = this.store.animationImages[i];
                if (this.store.animationImages[i].toString().indexOf('template/') >= 0) {
                    //如果大于8，说明时其他模板4db
                    if (item.lastIndexOf("\/") > 8) {
                        let index = item.lastIndexOf("\/");
                        this.addTemplateImageIntoRequestQueue(item.substring(9, index + 1) + "animation_" + item.substring(index + 1));
                    } else {
                        this.addTemplateImageIntoRequestQueue("animation_" + item.substring(9));
                    }
                } else {
                    if (this.store.animationImages[i].toString().indexOf('fix/') >= 0) {
                        this.addFixImageIntoRequestQueue(item.substring(4));
                    } else {
                        this.addImageIntoRequestQueue("animation_" + item);
                    }
                }

            }
        }
        //wait for loading images.
        // var _this = this;
        // var interval = 500;
        // var IMAGE_LOAD_TIMEOUT = interval * 4;
        // var loadingImage = {
        //     key: null,
        //     loadtime: 0
        // };
        // console.info(_this.dictImages)
        // 一张图片加载时间超过2秒，认为加载失败，直接跳过
        // var imagesFailLoad = [];
        //500ms检查一次
        // var timer = setInterval(function (e) {
        //     var isCompleted = true;
        //     for (var key in _this.dictImages) { //遍历所有img对象
        //         if (key in imagesFailLoad) { //如果key在imageFailLoad中，说明加载失败，跳过此次循环
        //             continue;
        //         }
        //         //查看dictImages中是否含已经下载了该图片
        //         if (!_this.dictImages[key].complete) {//img对象状态为false执行
        //             if (loadingImage.key === key) { //loadingIamge.key === img对象时
        //                 loadingImage.loadtime += interval;
        //                 if (loadingImage.loadtime >= IMAGE_LOAD_TIMEOUT) {
        //                     imagesFailLoad.push(key);
        //                     break;
        //                 }
        //             } else {   //修改loadingIamage对象
        //                 loadingImage = {
        //                     key: key,
        //                     loadtime: 0
        //                 }
        //             }
        //             isCompleted = false;
        //             break;
        //         }
        //     }
        //     if (isCompleted && _this.isDataReady) {
        //         clearInterval(timer);
        //         _this.hideLoading();
        //     }
        // }, 500);
    },
    // initMutiPointCustom:function(){
    //     var _this = this;
    //     if (this.store.MultiPointCustomControl) {
    //         var item, tempCustomControl,objConfig;
    //         let customList = []
    //         let customListInModal = []
    //         let pointName = []
    //         for (var i = 0; i < this.store.MultiPointCustomControl.length; i++) {
    //             item = this.store.MultiPointCustomControl[i];
    //             //将得到的config字符串转成json对象
    //             try {
    //                 if(item.config){
    //                     objConfig = JSON.parse(item.config); 
    //                 }else {
    //                     objConfig = {}
    //                     message.error("报表配置格式不合法",2.5)
    //                 }
    //             } catch(err) {
    //                 console.log(err)
    //                 objConfig = {}
    //                 message.error("报表配置格式不合法",2.5)
    //             }



    //             tempCustomControl = new ModelCustomControl();
    //             tempCustomControl.x = item.x;
    //             tempCustomControl.y = item.y;
    //             tempCustomControl.id = item.id;
    //             tempCustomControl.width = item.width;
    //             tempCustomControl.height = item.height;
    //             tempCustomControl.idCom = objConfig.point;  //是否包含实时请求的点
    //             tempCustomControl.bindPoint = objConfig.bindPoint;
    //             tempCustomControl.type = objConfig.type;
    //             tempCustomControl.header = objConfig.header;
    //             tempCustomControl.config = objConfig
    //             tempCustomControl.style = {}
    //             tempCustomControl.pageW = this.store.page.width
    //             tempCustomControl.pageH = this.store.page.height
    //             tempCustomControl.pageType = this.store.page.type
    //             // 1.编写一个action，将初始化的数据保存到store中
    //             // 2.使用初始化数据渲染结构
    //             // 3.将需要添加到实时刷新的点保存下来，传到各个组件内，组件内提取出需要的实时值并覆盖
    //             // 4.组件完成更新
    //             let pageW = this.store.page.width,
    //             pageH = this.store.page.height;
    //             let custom = tempCustomControl;
    //             custom['calW'] = custom['width'] / pageW;
    //             custom['calX'] = custom['x'] /pageW;
    //             custom['calH'] = custom['height'] / pageH;
    //             custom['calY'] = custom['y'] / pageH;
    //             // 需要将点位添加到实时刷新时，需要自定义逻辑
    //             if(objConfig.type == "Efficiency"){
    //                 // 当自定义组件为table时
    //                 custom['pointvalue'] = []
    //                 //如果是CoolingQuality组件，是是请求的点要先从接口里面请求回来
    //                 //=========morgan添加===========
    //                 var _this = this;
    //                 if(objConfig.type === 'Efficiency'){                        
    //                     if(objConfig.pointNameList!==undefined){
    //                         for(let j=0;j<objConfig.pointNameList.length;j++){
    //                             _this.addElementIdIntoDictRefreshMap(objConfig.pointNameList[j].Name, this.enmuElementType.MutiPointCustomControl, item.id)                        
    //                         }                        
    //                     }else{
    //                         let defaultList = 
    //                         [
    //                             {"Name":"ThisDayChillerRoomGroupPowerTotal","InterPretation":"冷冻机房今日总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayChGroupPowerTotal","InterPretation":"冷冻站今日冷机组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayPriChWPGroupPowerTotal","InterPretation":"冷冻站今日一次泵冷机组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDaySecChWPGroupPowerTotal","InterPretation":"冷冻站今日二次泵冷机组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayCWPGroupPowerTotal","InterPretation":"冷冻站今日冷却泵组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayCTGroupPowerTotal","InterPretation":"冷冻站今日冷却塔组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayCoolingCapacityTotal","InterPretation":"冷冻站今日总制冷量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayEfficiencyTotal","InterPretation":"冷冻站今日机房总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayChGroupEfficiencyTotal","InterPretation":"冷冻站今日冷机组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayPriChWPGroupEfficiencyTotal","InterPretation":"冷冻站今日一次泵组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDaySecChWPGroupEfficiencyTotal","InterPretation":"冷冻站今日二次泵组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayCWPGroupEfficiencyTotal","InterPretation":"冷冻站今日冷却泵组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                             {"Name":"ThisDayCTGroupEfficiencyTotal","InterPretation":"冷冻站今日冷却塔组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
    //                         ]
    //                         for(let j=0;j<defaultList.length;j++){
    //                             _this.addElementIdIntoDictRefreshMap(defaultList[j].Name, this.enmuElementType.MutiPointCustomControl, item.id)                        
    //                         } 
    //                     }                                             
    //                         // this.dictMutiPointCustomControls[item.id] = tempCustomControl;
    //                     }
    //                 }
    //             }

    //         }
    // },
    initTimePicker: function (zIndex, dictTimePicker) {
        var _this = this;
        if (this.store.timePickers) {
            var item, tempTimePicker;
            let timePickerList = []
            for (var i = 0; i < _this.store.timePickers.length; i++) {
                if (_this.store.timePickers[i].layer == zIndex) {
                    let svgChart = document.getElementsByClassName("svgChart");
                    let widthScale = 0, heightScale = 0;

                    // 二级弹框 showModal type
                    if (svgChart.length == 3) {
                        // 缩放适配屏幕
                        svgChart = document.getElementsByClassName("svgChart")[2];

                        let parentNode = document.getElementById('observerSecModalContainer');
                        let ObserverModalView = parentNode.children[0];
                        let obWidth = ObserverModalView.style.width,
                            obHeight = ObserverModalView.style.height;

                        widthScale = parseInt(obWidth) / _this.store.page.width,
                            heightScale = parseInt(obHeight) / _this.store.page.height;
                    } else {
                        // showModal type
                        if (svgChart.length == 2) {
                            svgChart = document.getElementsByClassName("svgChart")[1];
                            let parentNode = document.getElementById('observerModalContainer');
                            let ObserverModalView = parentNode.children[0];
                            let obWidth = ObserverModalView.style.width,
                                obHeight = ObserverModalView.style.height;

                            widthScale = parseInt(obWidth) / _this.store.page.width,
                                heightScale = parseInt(obHeight) / _this.store.page.height;
                        } else {
                            svgChart = document.getElementsByClassName("svgChart")[0];
                            widthScale = document.documentElement.clientWidth / _this.store.page.width,
                                heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                        }
                    }
                    item = this.store.timePickers[i];
                    tempTimePicker = new ModelTimePicker();
                    tempTimePicker.id = item.id;
                    tempTimePicker.x = item.x;
                    tempTimePicker.y = item.y;
                    tempTimePicker.rw = item.RW;
                    tempTimePicker.width = item.width;
                    tempTimePicker.height = item.height;
                    tempTimePicker.rw = item.RW;
                    tempTimePicker.bindPoint = item.bindpoint;
                    tempTimePicker.timeFixed = item.timeFixed;
                    tempTimePicker.layer = item.layer;

                    let pageW = this.store.page.width,
                        pageH = this.store.page.height;
                    let timePicker = tempTimePicker
                    timePicker['calW'] = tempTimePicker['width'] / pageW;
                    timePicker['calX'] = tempTimePicker['x'] / pageW;
                    timePicker['calH'] = tempTimePicker['height'] / pageH;
                    timePicker['calY'] = tempTimePicker['y'] / pageH;
                    timePicker['timeFixed'] = tempTimePicker.timeFixed
                    //默认是timeFixed为0，日期时间格式
                    timePicker['timeFormat'] = 'YYYY-MM-DD HH:mm'
                    //timeFixed为1，仅日期格式 
                    if (tempTimePicker.timeFixed != undefined && tempTimePicker.timeFixed == 1) {
                        timePicker['timeFormat'] = 'YYYY-MM-DD'
                    } else {
                        if (tempTimePicker.timeFixed != undefined && tempTimePicker.timeFixed == 2) {
                            timePicker['timeFormat'] = 'HH:mm'
                        }
                    }

                    //添加到实时刷新
                    this.addElementIdIntoDictRefreshMap(item.bindpoint, this.enmuElementType.timePicker, item.id);

                    this.hitModel.add(item.id, this.enmuElementType.timePicker, item.x * widthScale, item.y * heightScale, item.width, item.height);

                    this.dictTimePicker[item.id] = tempTimePicker;

                    timePickerList.push(timePicker)

                    // 将数据初始化到HTML
                    _this.refreshTimePickerData(timePickerList)
                }

            }

        }

    },

    initStandardEquipments: function (zIndex, dictStandardEquipments) {
        let _this = this;
        if (this.store.systemEquipments && this.store.systemEquipments.length) {
            //先循环检测是否有texts,因为下面的children会让this.store.systemEquipments数值增加子元素
            for (var k = 0; k < this.store.systemEquipments.length; k++) {
                //判断标准设备里是否有文本元素
                if (this.store.systemEquipments[k].texts && this.store.systemEquipments[k].texts.length != 0) {
                    for (var j = 0; j < this.store.systemEquipments[k].texts.length; j++) {
                        this.store.texts.push(this.store.systemEquipments[k].texts[j])
                    }
                }
            }
            //=========================
            if(serverOmd == 'best'){
                for (var k = 0; k < this.store.systemEquipments.length; k++) {
                    if (this.store.systemEquipments[k].children && this.store.systemEquipments[k].children.length != 0) {
                        for (var j = 0; j < this.store.systemEquipments[k].children.length; j++) {
                            this.store.systemEquipments.push(this.store.systemEquipments[k].children[j])
                        }
                    }
                }
            }
            //====================
            // iteration function, make systemEquipments array listed from layer low to high
            for (var m = 0; m < this.store.systemEquipments.length - 1; m++) {
                for (var n = 0; n < this.store.systemEquipments.length - m - 1; n++) {
                    if (this.store.systemEquipments[n].layer > this.store.systemEquipments[n + 1].layer) {
                        swapArr(this.store.systemEquipments, n, n + 1);
                    }
                }
            }

            function swapArr(arr, i1, i2) {
                arr[i1] = arr.splice(i2, 1, arr[i1])[0];
                return arr;
            }
            var item, tempEquip;
            for (var i = 0; i < _this.store.systemEquipments.length; i++) {
                if (_this.store.systemEquipments[i].layer == zIndex) {

                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let standardImage = document.createElementNS(nameSpace, "image");
                    let alarmTitle = document.createElementNS(nameSpace, "title");

                    let colorAnimate = document.createElementNS(nameSpace, "animate");
                    let enabledRect = document.createElementNS(nameSpace, "rect");
                    let autoModeRect = document.createElementNS(nameSpace, "rect");
                    let enabledText = document.createElementNS(nameSpace, "text");
                    let autoModeText = document.createElementNS(nameSpace, "text");
                    let maintainImage = document.createElementNS(nameSpace, "image");
                    let onOffSettingCircle = document.createElementNS(nameSpace, "circle");
                    let powerPercentRectIn = document.createElementNS(nameSpace, "rect");
                    let powerPercentRectOut = document.createElementNS(nameSpace, "rect");
                    let powerText = document.createElementNS(nameSpace, "text");
                    let freqText = document.createElementNS(nameSpace, "text");
                    let onlineImage = document.createElementNS(nameSpace, "image");  //在线离线图标
                    let standardErr = document.createElementNS(nameSpace, "rect");  //设备报警红色色块



                    if (document.getElementById("divMain") === undefined) {
                        _this.divMain = document.createElement('div');
                        _this.divMain.id = 'divMain';
                        _this.divMain.style.width = '100%';
                        _this.divMain.style.height = '100%';

                        // svg replace canvas
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let svgChart = document.createElementNS(nameSpace, 'svg');
                        svgChart.id = 'svgChart';
                        svgChart.setAttribute('class', 'svgChart');

                        _this.divMain.appendChild(svgChart);
                        _this.container.style.width = '100%';
                        _this.container.style.height = '100%';
                        _this.container.appendChild(_this.divMain);
                    }
                    // let svgChart = document.getElementById("svgChart");

                    let svgChart = document.getElementsByClassName("svgChart");
                    let widthScale = 0, heightScale = 0;

                    let svgChartObj;
                    // 二级弹框 showModal type
                    if (svgChart.length == 3) {
                        // 缩放适配屏幕
                        svgChartObj = document.getElementsByClassName("svgChart")[2];

                        let parentNode = document.getElementById('observerSecModalContainer');
                        let ObserverModalView = parentNode.children[0];

                        let obWidth = ObserverModalView.style.width,
                            obHeight = ObserverModalView.style.height;

                        widthScale = parseInt(obWidth) / _this.store.page.width,
                            heightScale = parseInt(obHeight) / _this.store.page.height;
                    } else {
                        // showModal type
                        if (svgChart.length == 2) {
                            svgChartObj = document.getElementsByClassName("svgChart")[1];
                            let parentNode = document.getElementById('observerModalContainer');
                            let ObserverModalView = parentNode.children[0];

                            let obWidth = ObserverModalView.style.width,
                                obHeight = ObserverModalView.style.height;

                            widthScale = parseInt(obWidth) / _this.store.page.width,
                                heightScale = parseInt(obHeight) / _this.store.page.height;
                        } else {
                            svgChartObj = document.getElementsByClassName("svgChart")[0];
                            widthScale = document.documentElement.clientWidth / _this.store.page.width,
                                heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                        }
                    }

                    svgChartObj.appendChild(standardImage);

                    if (_this.store.systemEquipments[i].name) {
                        standardImage.appendChild(alarmTitle);
                        alarmTitle.textContent = _this.store.systemEquipments[i].name;
                    }

                    svgChartObj.appendChild(enabledRect);
                    svgChartObj.appendChild(enabledText);
                    svgChartObj.appendChild(autoModeRect);
                    svgChartObj.appendChild(autoModeText);
                    svgChartObj.appendChild(maintainImage);
                    svgChartObj.appendChild(onOffSettingCircle);
                    svgChartObj.appendChild(powerPercentRectIn);
                    svgChartObj.appendChild(powerPercentRectOut);
                    svgChartObj.appendChild(powerText);
                    svgChartObj.appendChild(freqText);
                    svgChartObj.appendChild(onlineImage);
                    svgChartObj.appendChild(standardErr);


                    standardErr.setAttribute("pointer-events", "none");
                    standardErr.setAttribute("fill", "rgba(0,0,0,0)")

                    if (localStorage.getItem('animation') == undefined || localStorage.getItem('animation') != 'cheap') {
                        standardErr.appendChild(colorAnimate);
                    }

                    if (localStorage.getItem('animation') == undefined || localStorage.getItem('animation') != 'cheap') {
                        standardErr.childNodes[0].setAttribute("attributeType", "CSS");
                        standardErr.childNodes[0].setAttribute("attributeName", "opacity");
                        // polygon.childNodes[0].setAttribute("values","0.7;0.3;0.7");
                        // polygon.childNodes[0].setAttribute("to",0.3);
                        standardErr.childNodes[0].setAttribute("dur", "1s");
                        standardErr.childNodes[0].setAttribute("repeatCount", "indefinite");
                    }


                    item = _this.store.systemEquipments[i];
                    tempEquip = new ModelStandardEquip(item.id, null, null);
                    tempEquip.x = item.x;
                    tempEquip.y = item.y;
                    tempEquip.width = item.width;
                    tempEquip.height = item.height;
                    tempEquip.animation = item.animation;
                    tempEquip.idCom = item.idCom;
                    tempEquip.layer = item.layer;
                    tempEquip.name = item.name;
                    tempEquip.bindType = item.bindType;
                    tempEquip.linkinfo = item.linkinfo;
                    tempEquip.placeHolder = item.placeHolder;
                    tempEquip.templatePelId = item.templatePelId;
                    tempEquip.templateFileName = item.templateFileName;
                    tempEquip.children = item.children;
                    tempEquip.standardImage = standardImage;
                    tempEquip.options = _this.options
                    tempEquip.navigation = item.navigation

                    tempEquip.isDiffValuePolygon = true;
                    tempEquip.value = 0;
                    tempEquip.autoModeValue = 0;
                    tempEquip.enabledValue = 0;
                    tempEquip.paintValue = 0;
                    tempEquip.maintainValue = 0;
                    tempEquip.paintAutoModeValue = 0;
                    tempEquip.paintEnabledValue = 0;
                    tempEquip.paintMaintainValue = 0;
                    tempEquip.paintOnOffSettingValue = -1; //默认当前状态-1不渲染
                    tempEquip.onOffSettingValue = -1; //默认初始状态-1不渲染
                    tempEquip.powerValue = -1; //默认初始状态-1不渲染--不显示功率值
                    tempEquip.paintPowerValue = -1;
                    tempEquip.powerPercentValue = -1; //默认初始状态-1不渲染--不显示功率值
                    tempEquip.paintPowerPercentValue = -1;
                    tempEquip.freqValue = -1; //默认初始状态-1不渲染--不显示频率
                    tempEquip.paintFreqValue = -1;
                    tempEquip.netOnlineStatus = -1;  //默认初始状态   -1 不渲染---不显示离线在线
                    tempEquip.paintNetOnlineStatus = -1;
                    tempEquip.netHeartTime = 0

                    if (item.bindType != undefined) { tempEquip.bindType = item.bindType; }
                    let id = '';
                    if (item.bindType != undefined && item.bindType == 1 && item.idCom != '') {
                        let newID = item.idCom
                        let index1 = newID.indexOf('<%')
                        let index2 = newID.indexOf('%>')
                        let id = newID.substring(index1 + 2, index2)
                        if (!item.isFromAnimation) {
                            tempEquip.image = _this.dictImages[item.idPicture];
                        }
                        else {
                            if (tempEquip.animation[1]) {
                                tempEquip.image = _this.dictImages[tempEquip.animation[1].animationId];
                            }
                        }
                        if (item.rotateAngle != "0.0") {
                            tempEquip.rotateAngle = item.rotateAngle
                        }
                        if (item.idCom && item.id != "")
                            _this.addBindTypeIntoDictRefreshMap(item.idCom, _this.enmuElementType.standardEquipment, item.id);

                        if(item.idCom.indexOf('OnOff') != -1){
                            let arr = item.idCom.split('OnOff')
                            tempEquip.prefix = arr[0]
                            tempEquip.suffix = arr[1]
                        }

                        //取出子元素图标的点名，为后面渲染红色（报警状态）灰色（禁用状态）做准备
                        if (item.children && item.children.length != 0) {
                            for (var j = 0; j < item.children.length; j++) {
                                if (item.children[j].idCom != undefined) {
                                    if (item.children[j].idCom.search("Err") != -1) {
                                        _this.addElementIdIntoDictRefreshMap(item.children[j].idCom, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.errPoint = item.children[j].idCom
                                    }
                                    if (item.children[j].idCom.search("Enabled") != -1) {
                                        _this.addElementIdIntoDictRefreshMap(item.children[j].idCom, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.enabledPoint = item.children[j].idCom
                                    }
                                    if (item.children[j].idCom.search("AutoMode") != -1) {
                                        _this.addElementIdIntoDictRefreshMap(item.children[j].idCom, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.autoModePoint = item.children[j].idCom
                                    }
                                    //增加OnOffSetting点状态
                                    if (item.idCom.search("OnOff") != -1) {
                                        let onOffSetting = item.idCom.replace("OnOff","OnOffSetting");
                                        _this.addElementIdIntoDictRefreshMap(onOffSetting, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.onOffSettingPoint = onOffSetting
                                        //增加负载率AMPS点状态
                                        let power = item.idCom.replace("OnOff","Power");
                                        _this.addElementIdIntoDictRefreshMap(power, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.powerPoint = power
                                        //增加功率
                                        let powerPercent = item.idCom.replace("OnOff","PowerPercent")
                                        _this.addElementIdIntoDictRefreshMap(powerPercent, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.powerPercentPoint = powerPercent
                                        //增加频率
                                        let freq = item.idCom.replace("OnOff","VSDFreq")
                                        _this.addElementIdIntoDictRefreshMap(freq, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.freqPoint = freq
                                        //摘挂牌修改   旧代码从接口拿必须配合模板修改，所以舍弃直接写死在前端（leo says:）
                                        let maintain = item.idCom.replace("OnOff","MaintainOnOff")
                                        _this.addElementIdIntoDictRefreshMap(maintain, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.maintainPoint = maintain
                                    }
                                    
                                }
                            }
                        }

                        if (item.link > -1 || item.name) {
                            tempEquip.link = item.link;
                            _this.hitModel.add(item.id, _this.enmuElementType.standardEquipment, item.x * widthScale, item.y * heightScale, item.width, item.height, item.layer, item.link, item.navigation);
                        }
                        dictStandardEquipments[item.id] = tempEquip;
                    } else {
                        id = item.idCom;
                        if (!item.isFromAnimation) {

                            tempEquip.image = _this.dictImages[item.idPicture];
                        }
                        else {

                            if (tempEquip.animation[1]) {
                                tempEquip.image = _this.dictImages[tempEquip.animation[1].animationId];
                            }
                        }
                        if (item.rotateAngle != "0.0") tempEquip.rotateAngle = item.rotateAngle;

                        if (id && item.id != "")
                            _this.addElementIdIntoDictRefreshMap(id, _this.enmuElementType.standardEquipment, item.id);

                        if(item.idCom.indexOf('OnOff') != -1){
                            let arr = item.idCom.split('OnOff')
                            tempEquip.prefix = arr[0]
                            tempEquip.suffix = arr[1]
                        }

                        //取出子元素图标的点名，为后面渲染红色（报警状态）灰色（禁用状态）做准备
                        if (item.children && item.children.length != 0) {
                            for (var j = 0; j < item.children.length; j++) {
                                if (item.children[j].idCom != undefined) {
                                    if (item.children[j].idCom.search("Err") != -1) {
                                        _this.addElementIdIntoDictRefreshMap(item.children[j].idCom, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.errPoint = item.children[j].idCom
                                    }
                                    if (item.children[j].idCom.search("Enabled") != -1) {
                                        _this.addElementIdIntoDictRefreshMap(item.children[j].idCom, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.enabledPoint = item.children[j].idCom
                                    }
                                    if (item.children[j].idCom.search("AutoMode") != -1) {
                                        _this.addElementIdIntoDictRefreshMap(item.children[j].idCom, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.autoModePoint = item.children[j].idCom
                                    }
                                    //增加OnOffSetting点状态
                                    if (item.idCom.search("OnOff") != -1) {
                                        let onOffSetting = item.idCom.replace("OnOff","OnOffSetting");
                                        _this.addElementIdIntoDictRefreshMap(onOffSetting, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.onOffSettingPoint = onOffSetting
                                        //增加负载率AMPS点状态
                                        let power = item.idCom.replace("OnOff","Power");
                                        _this.addElementIdIntoDictRefreshMap(power, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.powerPoint = power
                                        //增加功率
                                        let powerPercent = item.idCom.replace("OnOff","PowerPercent")
                                        _this.addElementIdIntoDictRefreshMap(powerPercent, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.powerPercentPoint = powerPercent
                                        //增加频率
                                        let freq = item.idCom.replace("OnOff","VSDFreq")
                                        _this.addElementIdIntoDictRefreshMap(freq, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.freqPoint = freq
                                        //摘挂牌修改   旧代码从接口拿必须配合模板修改，所以舍弃直接写死在前端（leo says:）
                                        let maintain = item.idCom.replace("OnOff","MaintainOnOff")
                                        _this.addElementIdIntoDictRefreshMap(maintain, _this.enmuElementType.standardEquipment, item.id);
                                        tempEquip.maintainPoint = maintain
                                    }
                                    
                                }
                            }
                        }

                        if (item.link > -1 || item.name) {
                            tempEquip.link = item.link;
                            _this.hitModel.add(item.id, _this.enmuElementType.standardEquipment, item.x * widthScale, item.y * heightScale, item.width, item.height, item.layer, item.link, item.navigation);
                        }

                        dictStandardEquipments[item.id] = tempEquip;
                    }

                    

                    standardImage.setAttribute('category', 'standEquipment');
                    standardImage.setAttribute('id', "standImg" + item.id);
                    standardImage.setAttribute('dbId', item.id);
                    standardImage.setAttribute('type', '11');
                }
            }
        }
    },

    //多边形
    initPolygons: function (zIndex, dictPolygons) {
        var polygonObj, item;
        var _this = this;

        if (this.store.polygons && this.store.polygons.length) {
            //先循环检测是否有texts
            for (var k = 0; k < this.store.polygons.length; k++) {
                //判断标准设备里是否有文本元素
                if (this.store.polygons[k].texts && this.store.polygons[k].texts.length != 0) {
                    for (var j = 0; j < this.store.polygons[k].texts.length; j++) {
                        this.store.texts.push(this.store.polygons[k].texts[j])
                    }
                }
            }
            //添加图标
            // for (var k = 0; k < this.store.polygons.length; k++) {
            //     if (this.store.polygons[k].children && this.store.polygons[k].children.length != 0) {
            //         for (var j = 0; j < this.store.polygons[k].children.length; j++) {
            //             this.store.systemEquipments.push(this.store.polygons[k].children[j])                    
            //         }
            //     }
            // }

            for (var i = 0, len = _this.store.polygons.length; i < len; i++) {
                if (_this.store.polygons[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let polygon = document.createElementNS(nameSpace, "polygon");
                    let colorAnimate = document.createElementNS(nameSpace, "animate");
                    let enabledRect = document.createElementNS(nameSpace, "rect");
                    let autoModeRect = document.createElementNS(nameSpace, "rect");
                    let enabledText = document.createElementNS(nameSpace, "text");
                    let autoModeText = document.createElementNS(nameSpace, "text");
                    let maintainImage = document.createElementNS(nameSpace, "image");
                    let onOffSettingCircle = document.createElementNS(nameSpace, "circle");
                    let powerPercentRectIn = document.createElementNS(nameSpace, "rect");
                    let powerPercentRectOut = document.createElementNS(nameSpace, "rect");
                    let powerText = document.createElementNS(nameSpace, "text");
                    let freqText = document.createElementNS(nameSpace, "text");
                    let onlineImage = document.createElementNS(nameSpace, "image");  //在线离线图标

                    let svgChart = document.getElementsByClassName("svgChart");
                    // showModal type
                    if (svgChart.length > 1) {
                        svgChart = document.getElementsByClassName("svgChart")[1];
                    } else {
                        svgChart = document.getElementsByClassName("svgChart")[0];
                    }

                    svgChart.appendChild(polygon);
                    if (localStorage.getItem('animation') == undefined || localStorage.getItem('animation') != 'cheap') {
                        polygon.appendChild(colorAnimate);
                    }
                    svgChart.appendChild(enabledRect);
                    svgChart.appendChild(enabledText);
                    svgChart.appendChild(autoModeRect);
                    svgChart.appendChild(autoModeText);
                    svgChart.appendChild(maintainImage);
                    svgChart.appendChild(onOffSettingCircle);
                    svgChart.appendChild(powerPercentRectIn);
                    svgChart.appendChild(powerPercentRectOut);
                    svgChart.appendChild(powerText);
                    svgChart.appendChild(freqText);
                    svgChart.appendChild(onlineImage);

                    if (localStorage.getItem('animation') == undefined || localStorage.getItem('animation') != 'cheap') {
                        polygon.childNodes[0].setAttribute("attributeType", "CSS");
                        polygon.childNodes[0].setAttribute("attributeName", "opacity");
                        // polygon.childNodes[0].setAttribute("values","0.7;0.3;0.7");
                        // polygon.childNodes[0].setAttribute("to",0.3);
                        polygon.childNodes[0].setAttribute("dur", "1s");
                        polygon.childNodes[0].setAttribute("repeatCount", "indefinite");
                    }
                    item = _this.store.polygons[i];

                    polygon.setAttribute('category', 'polygon');
                    polygon.setAttribute('id', "polygon" + String(item.id));
                    polygon.setAttribute('dbId', String(item.id));
                    polygon.setAttribute('type', '13');

                    polygonObj = new ModelPolygon(item.id, null, null);
                    polygonObj.points = String(item.coord);
                    polygonObj.layer = item.layer;
                    polygonObj.idCom = item.idCom;
                    polygonObj.name = item.name;
                    polygonObj.bindType = item.bindType;
                    polygonObj.linkinfo = item.linkinfo;
                    polygonObj.placeHolder = item.placeHolder;
                    polygonObj.templatePelId = item.templatePelId;
                    polygonObj.templateFileName = item.templateFileName;
                    polygonObj.children = item.children;
                    polygonObj.animate = colorAnimate;
                    polygonObj.polygon = polygon;
                    polygonObj.options = _this.options;
                    polygonObj.isDiffValuePolygon = true;
                    polygonObj.value = 0;
                    polygonObj.autoModeValue = 0;
                    polygonObj.enabledValue = 0;
                    polygonObj.paintValue = 0;
                    polygonObj.maintainValue = 0;
                    polygonObj.paintAutoModeValue = 0;
                    polygonObj.paintEnabledValue = 0;
                    polygonObj.paintMaintainValue = 0;
                    polygonObj.paintOnOffSettingValue = -1; //默认当前状态-1不渲染
                    polygonObj.onOffSettingValue = -1; //默认初始状态-1不渲染
                    polygonObj.powerValue = -1; //默认初始状态-1不渲染--不显示功率值
                    polygonObj.paintPowerValue = -1;
                    polygonObj.powerPercentValue = -1; //默认初始状态-1不渲染--不显示功率值
                    polygonObj.paintPowerPercentValue = -1;
                    polygonObj.freqValue = -1; //默认初始状态-1不渲染--不显示频率
                    polygonObj.paintFreqValue = -1;
                    polygonObj.netOnlineStatus = -1;  //默认初始状态   -1 不渲染---不显示离线在线
                    polygonObj.paintNetOnlineStatus = -1;
                    polygonObj.netHeartTime = 0

                    //整理每个多边形的最大x和最小x
                    let positionArr = String(item.coord).split(' ')
                    let xArr = []
                    positionArr.map(item=>{
                        let xyArr = item.split(',')
                        xArr.push(Number(xyArr[0]))
                    })

                    polygonObj.xWidth = Math.max(...xArr) - Math.min(...xArr)

                    if(item.idCom.indexOf('OnOff') != -1){
                        let arr = item.idCom.split('OnOff')
                        polygonObj.prefix = arr[0]
                        polygonObj.suffix = arr[1]
                    }


                    let id = '';
                    id = item.idCom;
                    if (id && item.id != "") {
                        _this.addElementIdIntoDictRefreshMap(id, _this.enmuElementType.polygon, item.id);
                    }

                    //取出子元素图标的点名，为后面渲染红色（报警状态）灰色（禁用状态）做准备
                    if (_this.store.polygons[i].children && _this.store.polygons[i].children.length != 0) {
                        for (var j = 0; j < _this.store.polygons[i].children.length; j++) {
                            if (_this.store.polygons[i].children[j].idCom != undefined) {
                                if (_this.store.polygons[i].children[j].idCom.search("Err") != -1) {
                                    _this.addElementIdIntoDictRefreshMap(_this.store.polygons[i].children[j].idCom, _this.enmuElementType.polygon, item.id);
                                    polygonObj.errPoint = _this.store.polygons[i].children[j].idCom
                                }
                                if (_this.store.polygons[i].children[j].idCom.search("Enabled") != -1) {
                                    _this.addElementIdIntoDictRefreshMap(_this.store.polygons[i].children[j].idCom, _this.enmuElementType.polygon, item.id);
                                    polygonObj.enabledPoint = _this.store.polygons[i].children[j].idCom
                                }
                                if (_this.store.polygons[i].children[j].idCom.search("AutoMode") != -1) {
                                    _this.addElementIdIntoDictRefreshMap(_this.store.polygons[i].children[j].idCom, _this.enmuElementType.polygon, item.id);
                                    polygonObj.autoModePoint = _this.store.polygons[i].children[j].idCom
                                }
                                // if (_this.store.polygons[i].children[j].idCom.search("Maintain") != -1) {
                                //     _this.addElementIdIntoDictRefreshMap(_this.store.polygons[i].children[j].idCom, _this.enmuElementType.polygon, item.id);
                                //     polygonObj.maintainPoint = _this.store.polygons[i].children[j].idCom
                                // }
                                //增加OnOffSetting点状态
                                if (item.idCom.search("OnOff") != -1) {
                                    let onOffSetting = item.idCom.replace("OnOff","OnOffSetting");
                                    _this.addElementIdIntoDictRefreshMap(onOffSetting, _this.enmuElementType.polygon, item.id);
                                    polygonObj.onOffSettingPoint = onOffSetting
                                    //增加负载率AMPS点状态
                                    let power = item.idCom.replace("OnOff","Power");
                                    _this.addElementIdIntoDictRefreshMap(power, _this.enmuElementType.polygon, item.id);
                                    polygonObj.powerPoint = power
                                    //增加功率
                                    let powerPercent = item.idCom.replace("OnOff","PowerPercent")
                                    _this.addElementIdIntoDictRefreshMap(powerPercent, _this.enmuElementType.polygon, item.id);
                                    polygonObj.powerPercentPoint = powerPercent
                                    //增加频率
                                    let freq = item.idCom.replace("OnOff","VSDFreq")
                                    _this.addElementIdIntoDictRefreshMap(freq, _this.enmuElementType.polygon, item.id);
                                    polygonObj.freqPoint = freq
                                    //摘挂牌修改   旧代码从接口拿必须配合模板修改，所以舍弃直接写死在前端（leo says:）
                                    let maintain = item.idCom.replace("OnOff","MaintainOnOff")
                                    _this.addElementIdIntoDictRefreshMap(maintain, _this.enmuElementType.polygon, item.id);
                                    polygonObj.maintainPoint = maintain
                                }
                                
                            }
                        }
                    }

                    if (item.link > -1 || item.name) {
                        polygonObj.link = item.link;
                        _this.hitModel.add(item.id, _this.enmuElementType.polygon, item.layer, item.link);
                    }

                    dictPolygons[item.id] = polygonObj;

                    paintPolygon(polygonObj);

                    function paintPolygon(polygonObj) {
                        try {
                            polygon.setAttribute("stroke-width", "4");
                            polygon.setAttribute("points", polygonObj.points);
                            polygon.setAttribute("stroke", "rgba(255,255,255,0)");
                            polygon.setAttribute("fill-rule", "nonzero");
                            polygon.setAttribute("fill", "rgba(0,0,0,0)");
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
        }
    },


    initPipelines: function (zIndex, dictPipelines) {
        var _this = this;

        if (this.store.pipelines) {
            var item, tempLine;
            for (var i = 0; i < _this.store.pipelines.length; i++) {
                if (_this.store.pipelines[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let pipeLine = document.createElementNS(nameSpace, "path");
                    let svgFragment = document.createDocumentFragment();
                    //如果divMain不存在，再次新建插入容器元素
                    if (document.getElementById("divMain") === undefined) {
                        _this.divMain = document.createElement('div');
                        _this.divMain.id = 'divMain';
                        _this.divMain.style.width = '100%';
                        _this.divMain.style.height = '100%';

                        // svg replace canvas
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let svgChart = document.createElementNS(nameSpace, 'svg');
                        svgChart.id = 'svgChart';
                        svgChart.setAttribute('class', 'svgChart');

                        _this.divMain.appendChild(svgChart);
                        _this.container.style.width = '100%';
                        _this.container.style.height = '100%';
                        _this.container.appendChild(_this.divMain);
                    }

                    var waterPointList = [];
                    item = _this.store.pipelines[i];
                    // let svgChart = document.getElementById("svgChart");
                    let svgChartObj;
                    try {
                        let svgChart = document.getElementsByClassName("svgChart");
                        // showModal type
                        if (svgChart.length > 1) {
                            svgChartObj = document.getElementsByClassName("svgChart")[1];
                        } else {
                            svgChartObj = document.getElementsByClassName("svgChart")[0];
                        }
                    } catch (e) {
                    }

                    //将密度判断封装起来，便于复用
                    function getInterval(denSity, lineWidth) {
                        var interval
                        if (item.waterShape === 0) {
                            switch (denSity) {
                                case "0": interval = (lineWidth * 3) * 6; break; //疏松
                                case "1": interval = (lineWidth * 3) * 5; break;
                                case "2": interval = (lineWidth * 3) * 4; break;
                                case "3": interval = (lineWidth * 3) * 3; break;
                                case "4": interval = (lineWidth * 3) * 2.5; break; //密集
                            }
                            return interval
                        } else {
                            switch (denSity) {
                                case "0": interval = lineWidth * 6; break; //疏松
                                case "1": interval = lineWidth * 5; break;
                                case "2": interval = lineWidth * 4; break;
                                case "3": interval = lineWidth * 3; break;
                                case "4": interval = lineWidth * 2.5; break; //密集
                            }
                            return interval
                        }
                    }
                    //根据密度，得到水珠之间的间隔
                    var distance = getInterval(item.denSity, parseInt(item.width));

                    //斜水流
                    if (parseInt(item.startX) != parseInt(item.endX) && parseInt(item.startY) != parseInt(item.endY)) {
                        //倾斜管道长度
                        var biasLineLength = Math.sqrt(Math.pow(parseInt(item.endX) - parseInt(item.startX), 2) + Math.pow(parseInt(item.endY) - parseInt(item.startY), 2))
                        // 根据水流方向创建水流
                        var nPointCountBias = Math.floor(biasLineLength / distance);
                        for (var m = 0; m < nPointCountBias; m++) {
                            let waterPoint;
                            if (item.waterShape === 0) {
                                waterPoint = document.createElementNS(nameSpace, "rect");
                            } else {
                                waterPoint = document.createElementNS(nameSpace, "circle");
                            }
                            waterPointList.push(waterPoint);
                            //svgChart.appendChild(waterPoint);
                            svgFragment.appendChild(waterPoint);
                        }
                    } else {
                        //横竖方向
                        // 根据水流方向创建水流
                        var nPointCountX = Math.floor(Math.abs(parseInt(item.endX) - parseInt(item.startX)) / distance);
                        var nPointCountY = Math.floor(Math.abs(parseInt(item.endY) - parseInt(item.startY)) / distance);

                        // isRunning 
                        if (item.idCom && item.idCom.toString() != "") {
                            if (nPointCountX) {
                                for (var m = 0; m < nPointCountX; m++) {
                                    let waterPoint;
                                    if (item.waterShape === 0) {
                                        waterPoint = document.createElementNS(nameSpace, "rect");
                                    } else {
                                        waterPoint = document.createElementNS(nameSpace, "circle");
                                    }
                                    waterPointList.push(waterPoint);
                                    //svgChart.appendChild(waterPoint);
                                    svgFragment.appendChild(waterPoint);
                                }
                            } else {
                                for (var n = 0; n < nPointCountY; n++) {
                                    let waterPoint
                                    if (item.waterShape === 0) {
                                        waterPoint = document.createElementNS(nameSpace, "rect");
                                    } else {
                                        waterPoint = document.createElementNS(nameSpace, "circle");
                                    }
                                    waterPointList.push(waterPoint);
                                    //svgChart.appendChild(waterPoint);
                                    svgFragment.appendChild(waterPoint);
                                }
                            }
                        }
                    }


                    try {
                        //svgChart.appendChild(pipeLine);
                        svgFragment.appendChild(pipeLine);

                    } catch (e) {
                        console.log(e.name + ": " + e.message);
                    }


                    tempLine = new ModelPipeline(item.id, null, null);
                    tempLine.x = parseInt(item.startX);
                    tempLine.y = parseInt(item.startY);
                    tempLine.startX = parseInt(item.startX);
                    tempLine.startY = parseInt(item.startY);
                    tempLine.endX = parseInt(item.endX);
                    tempLine.endY = parseInt(item.endY);
                    tempLine.lineWidth = parseInt(item.width);
                    tempLine.direction = item.direction == "1" ? false : true;
                    tempLine.initDirection = item.direction == "1" ? false : true;
                    tempLine.speed = parseInt(item.speed) + 1;
                    tempLine.layer = item.layer;
                    tempLine.waterType = item.waterType;
                    tempLine.color = item.color;
                    tempLine.denSity = item.denSity;
                    tempLine.logic = item.logic;
                    tempLine.waterShape = item.waterShape;
                    tempLine.pipeLine = pipeLine;
                    tempLine.waterPointList = waterPointList;

                    if (item.idCom && item.idCom.toString() != "") {
                        tempLine.idCom = item.idCom;
                        //当接口传来的数据是用户自定义的脚本时，要使用try catch保证界面可以正常绘制

                        if (new RegExp(/\<\%.+\%\>/g).test(item.idCom)) {
                            tempLine.dictIdCom[item.idCom] = false;
                            _this.addBindTypeIntoDictRefreshMap(item.idCom, _this.enmuElementType.pipeline, item.id);
                        } else {
                            try {
                                if (new RegExp(/[\(|\)|==|"|\||&&|!|=]+/g).test(item.idCom)) {
                                    // 支持复杂表达式
                                    var arr = item.idCom.match(/"[\w\d]+"/g),
                                        k = 0,
                                        point = null;
                                    for (k; point = arr[k++];) {
                                        point = point.slice(1, -1)
                                        tempLine.dictIdCom[point] = false;
                                        _this.addElementIdIntoDictRefreshMap(point, _this.enmuElementType.pipeline, item.id)
                                    }
                                } else {
                                    // 支持","
                                    var arr = item.idCom.split(',');
                                    for (var j = 0; j < arr.length; j++) {
                                        if (arr[j] && arr[j].toString() != "") {
                                            tempLine.dictIdCom[arr[j]] = false;
                                            _this.addElementIdIntoDictRefreshMap(arr[j], _this.enmuElementType.pipeline, item.id);
                                        }
                                    }
                                }
                            } catch (err) {
                                console.log(err)
                            }
                        }
                    }
                    svgChartObj.appendChild(svgFragment)
                    dictPipelines[item.id] = tempLine;
                }
            }
        }
    },

    initEquipments: function (zIndex, dictEquipments) {
        let _this = this
        if (this.store.equipments) {
            var item, tempEquip;

            // iteration function, make systemEquipments array listed from layer low to high
            for (var m = 0; m < _this.store.equipments.length - 1; m++) {
                for (var n = 0; n < _this.store.equipments.length - m - 1; n++) {
                    if (_this.store.equipments[n].layer > _this.store.equipments[n + 1].layer) {
                        swapArr(_this.store.equipments, n, n + 1);
                    }
                }
            }

            function swapArr(arr, i1, i2) {
                arr[i1] = arr.splice(i2, 1, arr[i1])[0];
                return arr;
            }

            for (var i = 0; i < _this.store.equipments.length; i++) {
                if (_this.store.equipments[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let equipImage = document.createElementNS(nameSpace, "image");
                    //如果divMain不存在，再次新建插入容器元素
                    if (document.getElementById("divMain") === undefined) {
                        _this.divMain = document.createElement('div');
                        _this.divMain.id = 'divMain';
                        _this.divMain.style.width = '100%';
                        _this.divMain.style.height = '100%';

                        // svg replace canvas
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let svgChart = document.createElementNS(nameSpace, 'svg');
                        svgChart.id = 'svgChart';
                        svgChart.setAttribute('class', 'svgChart');

                        _this.divMain.appendChild(svgChart);
                        _this.container.style.width = '100%';
                        _this.container.style.height = '100%';
                        _this.container.appendChild(_this.divMain);
                    }




                    let svgChart = document.getElementsByClassName("svgChart");
                    let widthScale = 0, heightScale = 0;
                    let svgChartObj;
                    // 二级弹框 showModal type
                    if (svgChart.length == 3) {
                        // 缩放适配屏幕
                        svgChartObj = document.getElementsByClassName("svgChart")[2];

                        let parentNode = document.getElementById('observerSecModalContainer');
                        let ObserverModalView = parentNode.children[0];

                        let obWidth = ObserverModalView.style.width,
                            obHeight = ObserverModalView.style.height;

                        widthScale = parseInt(obWidth) / _this.store.page.width,
                            heightScale = parseInt(obHeight) / _this.store.page.height;
                    } else {
                        // showModal type
                        if (svgChart.length == 2) {
                            svgChartObj = document.getElementsByClassName("svgChart")[1];
                            let parentNode = document.getElementById('observerModalContainer');
                            let ObserverModalView = parentNode.children[0];

                            let obWidth = ObserverModalView.style.width,
                                obHeight = ObserverModalView.style.height;

                            widthScale = parseInt(obWidth) / _this.store.page.width,
                                heightScale = parseInt(obHeight) / _this.store.page.height;
                        } else {
                            svgChartObj = document.getElementsByClassName("svgChart")[0];
                            widthScale = document.documentElement.clientWidth / _this.store.page.width,
                                heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                        }
                    }


                    if (svgChart && svgChartObj != undefined && svgChartObj.appendChild != undefined) {
                        svgChartObj.appendChild(equipImage);

                    } else {
                        return;
                    }


                    item = _this.store.equipments[i];

                    tempEquip = new ModelEquipment(item.id, null, null);
                    tempEquip.x = item.x;
                    tempEquip.y = item.y;
                    tempEquip.width = item.width;
                    tempEquip.height = item.height;
                    tempEquip.animation = item.animation;
                    tempEquip.idCom = item.idCom;
                    tempEquip.layer = item.layer;
                    tempEquip.name = item.name;
                    tempEquip.linkinfo = item.linkinfo;
                    tempEquip.bindType = item.bindType;
                    tempEquip.equipImage = equipImage;
                    tempEquip.description = item.description
                    tempEquip.options = _this.options;
                    if (item.bindType != undefined) { tempEquip.bindType = item.bindType; }
                    let id = '';
                    if (item.bindType != undefined && item.bindType == 1 && item.idCom != '') {
                        let newID = item.idCom
                        let index1 = newID.indexOf('<%')
                        let index2 = newID.indexOf('%>')
                        let id = newID.substring(index1 + 2, index2)
                        if (!item.isFromAnimation) {
                            tempEquip.image = this.dictImages[item.idPicture];
                        }
                        else {
                            if (tempEquip.animation[1]) {
                                tempEquip.image = this.dictImages[tempEquip.animation[1].animationId];
                            }
                        }
                        if (item.rotate != "0.0") tempEquip.rotate = item.rotate;
                        if (item.idCom && item.id != "")
                            _this.addBindTypeIntoDictRefreshMap(item.idCom, _this.enmuElementType.equipment, item.id);
                        if (item.link > -1 || item.name) {
                            tempEquip.link = item.link;
                            _this.hitModel.add(item.id, _this.enmuElementType.equipment, item.x * widthScale, item.y * heightScale, item.width, item.height);
                        }
                        dictEquipments[item.id] = tempEquip;
                    } else {
                        id = item.idCom;
                        if (!item.isFromAnimation) {
                            tempEquip.image = _this.dictImages[item.idPicture];
                        }
                        else {

                            if (tempEquip.animation[1]) {
                                tempEquip.image = _this.dictImages[tempEquip.animation[1].animationId];
                            }
                        }
                        if (item.rotate != "0.0") tempEquip.rotate = item.rotate;

                        if (id && item.id != "") {
                            _this.addElementIdIntoDictRefreshMap(id, _this.enmuElementType.equipment, item.id);
                        }
                        if (item.link > -1 || item.name) {
                            tempEquip.link = item.link;
                            _this.hitModel.add(item.id, _this.enmuElementType.equipment, item.x * widthScale, item.y * heightScale, item.width, item.height);
                        }

                        dictEquipments[item.id] = tempEquip;
                    }

                    equipImage.setAttribute('category', 'equipment');
                    equipImage.setAttribute('id', "img" + item.id);
                    equipImage.setAttribute('dbId', item.id);
                    equipImage.setAttribute('type', '1');
                }
            }
        }
    },

    initFixes: function (zIndex, dictFixes) {
        let _this = this
        if (this.store.fix) {
            var item, tempFix;

            // iteration function, make systemEquipments array listed from layer low to high
            for (var m = 0; m < _this.store.fix.length - 1; m++) {
                for (var n = 0; n < _this.store.fix.length - m - 1; n++) {
                    if (_this.store.fix[n].layer > _this.store.fix[n + 1].layer) {
                        swapArr(_this.store.fix, n, n + 1);
                    }
                }
            }

            function swapArr(arr, i1, i2) {
                arr[i1] = arr.splice(i2, 1, arr[i1])[0];
                return arr;
            }

            for (var i = 0; i < _this.store.fix.length; i++) {
                if (_this.store.fix[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let fixImage = document.createElementNS(nameSpace, "image");

                    let svgChart = document.getElementsByClassName("svgChart");
                    let widthScale = 0, heightScale = 0;
                    let svgChartObj;
                    // 二级弹框 showModal type
                    if (svgChart.length == 3) {
                        // 缩放适配屏幕
                        svgChartObj = document.getElementsByClassName("svgChart")[2];

                        let parentNode = document.getElementById('observerSecModalContainer');
                        let ObserverModalView = parentNode.children[0];

                        let obWidth = ObserverModalView.style.width,
                            obHeight = ObserverModalView.style.height;

                        widthScale = parseInt(obWidth) / _this.store.page.width,
                            heightScale = parseInt(obHeight) / _this.store.page.height;
                    } else {
                        // showModal type
                        if (svgChart.length == 2) {
                            svgChartObj = document.getElementsByClassName("svgChart")[1];
                            let parentNode = document.getElementById('observerModalContainer');
                            let ObserverModalView = parentNode.children[0];

                            let obWidth = ObserverModalView.style.width,
                                obHeight = ObserverModalView.style.height;

                            widthScale = parseInt(obWidth) / _this.store.page.width,
                                heightScale = parseInt(obHeight) / _this.store.page.height;
                        } else {
                            svgChartObj = document.getElementsByClassName("svgChart")[0];
                            widthScale = document.documentElement.clientWidth / _this.store.page.width,
                                heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                        }
                    }

                    if (svgChart && svgChartObj != undefined && svgChartObj.appendChild != undefined) {
                        svgChartObj.appendChild(fixImage);

                    } else {
                        return;
                    }


                    item = _this.store.fix[i];

                    tempFix = new ModelFix(item.fixId, null, null);
                    tempFix.x = item.x;
                    tempFix.y = item.y;
                    tempFix.width = item.width;
                    tempFix.height = item.height;
                    tempFix.layer = item.layer;
                    tempFix.fixImage = fixImage;
                    tempFix.image = _this.dictImages[item.idPicture];

                    let id = '';

                    id = item.fixId;

                    if (id && item.fixId != "") {
                        _this.addElementIdIntoDictRefreshMap(id, _this.enmuElementType.fix, item.fixId);
                    }
                    if (item.link > -1) {
                        tempFix.link = item.link;
                        _this.hitModel.add(item.fixId, _this.enmuElementType.fix, item.x * widthScale, item.y * heightScale, item.width, item.height);
                    }

                    dictFixes[item.fixId] = tempFix;


                    fixImage.setAttribute('category', 'fix');
                    fixImage.setAttribute('id', item.fixId);
                    fixImage.setAttribute('type', '12');

                }
            }
        }
    },

    initCharts: function () {
        this.dictCharts = {};
        function ChartFactory(elementType) {
            var chart;
            switch (Number(elementType)) {
                case 52:
                    chart = LineChart;
                    break;
                case 53:
                    chart = BarChart;
                    break;
                case 54:
                    chart = PieChart;
                    break;
                default:
                    chart = LineChart;
            }
            return chart;
        }
        if (this.store.charts) {
            var item, tempChart;
            for (var i = 0; i < this.store.charts.length; i++) {
                let nameSpace = 'http://www.w3.org/2000/svg';
                let standardImage = document.createElementNS(nameSpace, "image");
                // let svgChart = document.getElementById("svgChart");
                //如果divMain不存在，再次新建插入容器元素
                if (document.getElementById("divMain") === undefined) {
                    _this.divMain = document.createElement('div');
                    _this.divMain.id = 'divMain';
                    _this.divMain.style.width = '100%';
                    _this.divMain.style.height = '100%';

                    // svg replace canvas
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let svgChart = document.createElementNS(nameSpace, 'svg');
                    svgChart.id = 'svgChart';
                    svgChart.setAttribute('class', 'svgChart');

                    _this.divMain.appendChild(svgChart);
                    _this.container.style.width = '100%';
                    _this.container.style.height = '100%';
                    _this.container.appendChild(_this.divMain);
                }

                let svgChart = document.getElementsByClassName("svgChart");
                let svgChartObj;
                // showModal type
                if (svgChart.length > 1) {
                    svgChartObj = document.getElementsByClassName("svgChart")[1];
                } else {
                    svgChartObj = document.getElementsByClassName("svgChart")[0];
                }

                svgChartObj.appendChild(standardImage);

                item = this.store.charts[i];
                var ElementChart = ChartFactory(item.elementType)
                tempChart = new ElementChart(item.id, null, null);
                tempChart.x = item.x;
                tempChart.y = item.y;
                tempChart.width = item.width;
                tempChart.height = item.height;
                tempChart.units = item.data;
                if (item.interval && item.interval != '') tempChart.interval = item.interval;

                tempChart.init();

                for (var j = 0; j < item.data.length; j++)
                    this.addElementIdIntoDictRefreshMap(item.data[j].pointName, this.enmuElementType.chart, item.id);
                this.dictCharts[item.id] = tempChart;
            }
        }
    },

    initGages: function (zIndex, dictGages) {
        let _this = this
        if (this.store.gages) {
            var item, tempGage;
            for (var i = 0; i < this.store.gages.length; i++) {
                if (_this.store.gages[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let gagesImage = document.createElementNS(nameSpace, "image");
                    let pointerImage = document.createElementNS(nameSpace, "image");
                    let gagesValue = document.createElementNS(nameSpace, 'text');
                    let text1 = document.createElementNS(nameSpace, "text");
                    let text2 = document.createElementNS(nameSpace, "text");
                    let text3 = document.createElementNS(nameSpace, "text");
                    let text4 = document.createElementNS(nameSpace, "text");
                    let text5 = document.createElementNS(nameSpace, "text");
                    let text6 = document.createElementNS(nameSpace, "text");

                    //如果divGages不存在，再次新建插入容器元素
                    if (document.getElementById("divMain") === undefined) {
                        _this.divMain = document.createElement('div');
                        _this.divMain.id = 'divMain';
                        _this.divMain.style.width = '100%';
                        _this.divMain.style.height = '100%';

                        // svg replace canvas
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let svgChart = document.createElementNS(nameSpace, 'svg');
                        svgChart.id = 'svgChart';
                        svgChart.setAttribute('class', 'svgChart');

                        _this.divGages.appendChild(svgChart);
                        _this.container.style.width = '100%';
                        _this.container.style.height = '100%';
                        _this.container.appendChild(_this.divGages);
                    }
                    let svgChartObj;
                    try {
                        let svgChart = document.getElementsByClassName("svgChart");
                        // showModal type
                        if (svgChart.length > 1) {
                            svgChartObj = document.getElementsByClassName("svgChart")[1];
                        } else {
                            svgChartObj = document.getElementsByClassName("svgChart")[0];
                        }
                    } catch (e) {
                    }
                    let svgFragment = document.createDocumentFragment();
                    if (svgChart && svgChart != undefined) {
                        //    svgChart.appendChild(gagesImage);
                        //    svgChart.appendChild(pointerImage);
                        //    svgChart.appendChild(gagesValue)
                        svgFragment.appendChild(gagesImage);
                        svgFragment.appendChild(pointerImage);
                        svgFragment.appendChild(gagesValue);

                        var textArr = [];
                        for (let i = 0; i < 6; i++) {
                            var text = document.createElementNS(nameSpace, "text");
                            svgFragment.appendChild(text);
                            //   svgChart.appendChild(text);
                            textArr.push(text);
                        }

                    } else {
                        return;
                    }
                    //将文档碎片添加到页面
                    svgChartObj.appendChild(svgFragment)

                    item = this.store.gages[i];

                    //type 0 1 刻度
                    if (item.type === 0 || item.type === 1) {
                        var interval = (item.max - item.min) / 5,
                            pi = Math.PI,
                            angleInterval = pi / 5,
                            radius = item.width * 0.25,
                            centerX = item.width * 0.47,
                            centerY = item.height * 0.5;

                        for (let n = 0; n < 6; n++) {
                            let value = item.min + (n * interval);
                            if (value !== 0) {
                                value = Number(value).toFixed(1);
                            }
                            let angle = angleInterval * n;
                            textArr[n].setAttribute('x', centerX - Math.cos(angle) * radius + item.x)
                            textArr[n].setAttribute('y', centerY - Math.sin(angle) * radius + item.y)
                            textArr[n].setAttribute('fill', '#4ebaff')
                            textArr[n].setAttribute('font-size', `${0.050 * item.width}px`)
                            textArr[n].setAttribute('font-family', 'MicrosoftYaHei,Arial')
                            textArr[n].textContent = value
                        }
                    } else {
                        //type 2 3 刻度
                        var interval = (item.max - item.min) / 5,
                            pi = Math.PI * 14 / 9,
                            angleInterval = pi / 5,
                            radius = item.width * 0.24,
                            centerX = item.width * 0.465,
                            centerY = item.height * 0.51;


                        for (let n = 0; n < 6; n++) {
                            let value = item.min + (n * interval);
                            if (value !== 0) {
                                value = Number(value).toFixed(1);
                            }
                            let angle = angleInterval * n - Math.PI * 5 / 18;
                            textArr[n].setAttribute('x', centerX - Math.cos(angle) * radius + item.x)
                            textArr[n].setAttribute('y', centerY - Math.sin(angle) * radius + item.y)
                            textArr[n].setAttribute('fill', '#4ebaff')
                            textArr[n].setAttribute('font-size', `${0.050 * item.width}px`)
                            textArr[n].setAttribute('font-family', 'MicrosoftYaHei,Arial')
                            textArr[n].textContent = value
                        }
                    }



                    tempGage = new ModelGage(item.id, null, null, item.type);
                    tempGage.width = item.width;
                    tempGage.height = item.height;
                    tempGage.idCom = item.idCom;
                    tempGage.layer = item.layer;
                    tempGage.minValue = item.min;
                    tempGage.maxValue = item.max;
                    tempGage.type = item.type;
                    tempGage.decimal = item.decimal;
                    tempGage.fontColor = item.fontColor;
                    tempGage.gagesImage = gagesImage
                    tempGage.pointerImage = pointerImage
                    tempGage.gagesValue = gagesValue


                    if (item.pagetype === 'fullscreen' && item.xposition && item.yposition) {
                        tempGage.x = item.x - item.xposition;
                        tempGage.y = item.y - item.yposition;
                    } else {
                        tempGage.x = item.x;
                        tempGage.y = item.y;
                    }

                    this.addElementIdIntoDictRefreshMap(item.idCom, this.enmuElementType.gage, item.id);
                    dictGages[item.id] = tempGage;
                }
            }
        }
    },

    initLiquidLevels: function (zIndex, dictLiquidLevels) {
        let _this = this
        if (this.store.liquidLevels) {
            var item, tempLiquidLevel;
            for (var i = 0; i < this.store.liquidLevels.length; i++) {
                if (_this.store.liquidLevels[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let liquidLevelsInImage = document.createElementNS(nameSpace, "image");
                    let liquidLevelsOutImage = document.createElementNS(nameSpace, "image");
                    let liquidLevelPointImage = document.createElementNS(nameSpace, "image");
                    let liquidLevelCurrentValue = document.createElementNS(nameSpace, "text");

                    //如果divLiquidLevels不存在，再次新建插入容器元素
                    if (document.getElementById("divMain") === undefined) {
                        _this.divMain = document.createElement('div');
                        _this.divMain.id = 'divMain';
                        _this.divMain.style.width = '100%';
                        _this.divMain.style.height = '100%';

                        // svg replace canvas
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let svgChart = document.createElementNS(nameSpace, 'svg');
                        svgChart.id = 'svgChart';
                        svgChart.setAttribute('class', 'svgChart');

                        _this.divLiquidLevels.appendChild(svgChart);
                        _this.container.style.width = '100%';
                        _this.container.style.height = '100%';
                        _this.container.appendChild(_this.divLiquidLevels);
                    }
                    let svgFragment = document.createDocumentFragment();
                    if (svgChart && svgChart != undefined && svgChart.appendChild != undefined) {
                        // svgChart.appendChild(liquidLevelsInImage);
                        // svgChart.appendChild(liquidLevelsOutImage);
                        svgFragment.appendChild(liquidLevelsInImage);
                        svgFragment.appendChild(liquidLevelsOutImage);
                        svgChart.appendChild(liquidLevelPointImage);
                        svgChart.appendChild(liquidLevelCurrentValue);


                        var scaleNum = (this.store.liquidLevels[i].max - this.store.liquidLevels[i].min) / 0.5 + 1;
                        var scaleArr = [];
                        var scaleLineArr = [];
                        for (let i = 0; i < scaleNum; i++) {
                            var scale = document.createElementNS(nameSpace, "text");
                            var scaleLine = document.createElementNS(nameSpace, "line");
                            //  svgChart.appendChild(scale);
                            //  svgChart.appendChild(scaleLine);
                            svgFragment.appendChild(scale);
                            svgFragment.appendChild(scaleLine);
                            scaleArr.push(scale);
                            scaleLineArr.push(scaleLine);
                        }


                    } else {
                        return;
                    }
                    //将文档碎片添加到页面
                    svgChart.appendChild(svgFragment);

                    item = this.store.liquidLevels[i];


                    var preFontSize;
                    if (item.height < 250) {
                        preFontSize = 12;
                    } else {
                        preFontSize = 16;
                    }

                    var interval = item.height / (scaleNum - 1);

                    for (let n = 0; n < scaleNum; n++) {
                        let scaleValue = parseInt(item.min) + (n * 0.5);
                        if (scaleValue !== 0) {
                            scaleValue = Number(scaleValue).toFixed(1);
                        }
                        scaleArr[n].setAttribute('x', item.width + item.x)
                        scaleArr[n].setAttribute('y', item.height - n * interval + item.y)
                        scaleArr[n].setAttribute('fill', '#000')
                        scaleArr[n].setAttribute('font-size', `${preFontSize}px`)
                        scaleArr[n].setAttribute('font-family', 'MicrosoftYaHei,Arial')
                        scaleArr[n].textContent = scaleValue

                        scaleLineArr[n].setAttribute('x1', item.width + item.x)
                        scaleLineArr[n].setAttribute('y1', item.height - n * interval + item.y)
                        scaleLineArr[n].setAttribute('x2', 0.95 * item.width + item.x)
                        scaleLineArr[n].setAttribute('y2', item.height - n * interval + item.y)
                        scaleLineArr[n].setAttribute('stroke', '#000')
                    }


                    tempLiquidLevel = new ModelLiquidLevel(item.id, null, null);
                    tempLiquidLevel.width = item.width;
                    tempLiquidLevel.height = item.height;
                    tempLiquidLevel.bindPointName = item.bindPointName;
                    tempLiquidLevel.layer = item.layer;
                    tempLiquidLevel.minValue = item.min;
                    tempLiquidLevel.maxValue = item.max;
                    tempLiquidLevel.minAlarm = item.minAlarm;
                    tempLiquidLevel.maxAlarm = item.maxAlarm;
                    tempLiquidLevel.liquidLevelsInImage = liquidLevelsInImage;
                    tempLiquidLevel.liquidLevelsOutImage = liquidLevelsOutImage;
                    tempLiquidLevel.liquidLevelPointImage = liquidLevelPointImage;
                    tempLiquidLevel.liquidLevelCurrentValue = liquidLevelCurrentValue;


                    if (item.pagetype === 'fullscreen' && item.xposition && item.yposition) {
                        tempLiquidLevel.x = item.x - item.xposition;
                        tempLiquidLevel.y = item.y - item.yposition;
                    } else {
                        tempLiquidLevel.x = item.x;
                        tempLiquidLevel.y = item.y;
                    }

                    this.addElementIdIntoDictRefreshMap(item.bindPointName, this.enmuElementType.liquidLevel, item.id);
                    dictLiquidLevels[item.id] = tempLiquidLevel;
                }
            }
        }
    },

    initRulers: function () {
        this.dictRulers = {};
        if (this.store.rulers) {
            var item, tempRuler;
            for (var i = 0; i < this.store.rulers.length; i++) {
                item = this.store.rulers[i];

                tempRuler = new ModelRuler(this, item.id, null, null);
                tempRuler.x = item.x;
                tempRuler.y = item.y;
                tempRuler.width = item.width;
                tempRuler.height = item.height;

                tempRuler.minValue = item.min;
                tempRuler.maxValue = item.max;
                tempRuler.name = item.name;
                tempRuler.decimal = item.decimal;
                tempRuler.mainScale = item.mainScale;
                tempRuler.minorScale = item.minorScale;

                for (var j = 0; j < item.levels.length; j++) tempRuler.levels.push(item.levels[j]);
                for (var j = 0; j < item.references.length; j++) {
                    if (item.references[j].idCom != "") {
                        this.addElementIdIntoDictRefreshMap(item.references[j].idCom, this.enmuElementType.ruler, item.id);
                    }
                    tempRuler.references.push(item.references[j]);
                }

                tempRuler.init();
                this.dictRulers[item.id] = tempRuler;
                for (var n = 0, len = tempRuler.references.length; n < len; n++) {
                    var ref = tempRuler.references[n];
                    Number(ref.isInUp) !== 1 && ref.panel && this.hitModel.add(item.id + '_' + n, this.enmuElementType.ruler, ref.panel.x, ref.panel.y, ref.panel.w, ref.panel.h);
                }
            }
        }
    },
    // 初始化控件数据
    initCustomControls: function (zIndex, dictCustomControls) {
        var _this = this;
        if (this.store.customControls) {
            var item, tempCustomControl,objConfig;
            let customList = []
            let customListInModal = []
            let pointName = []

            var _this = this;
            for (var i = 0; i < this.store.customControls.length; i++) {
                item = this.store.customControls[i];
                //将得到的config字符串转成json对象
                try {
                    if(item.config){
                        objConfig = JSON.parse(item.config); 
                    }else {
                        objConfig = {}
                        message.error("报表配置格式不合法",2.5)
                    }
                } catch(err) {
                    console.log(err)
                    objConfig = {}
                    message.error("报表配置格式不合法",2.5)
                }
                tempCustomControl = new ModelCustomControl();
                tempCustomControl.x = item.x;
                tempCustomControl.y = item.y;
                tempCustomControl.id = item.id;
                tempCustomControl.width = item.width;
                tempCustomControl.height = item.height;
                tempCustomControl.idCom = objConfig.point;  //是否包含实时请求的点
                tempCustomControl.bindPoint = objConfig.bindPoint;
                tempCustomControl.type = objConfig.type;
                tempCustomControl.header = objConfig.header;
                tempCustomControl.config = objConfig
                tempCustomControl.style = {}
                tempCustomControl.pageW = this.store.page.width
                tempCustomControl.pageH = this.store.page.height
                tempCustomControl.pageType = this.store.page.type


                if (objConfig.type == "StandardEnergyManage") {
                    if (localStorage.getItem("energyManagementDefine") != undefined && localStorage.getItem("energyManagementDefine") != null) {
                        objConfig["distributionGroupList"] = JSON.parse(localStorage.getItem('energyManagementDefine')).distributionGroupList != undefined ? JSON.parse(localStorage.getItem('energyManagementDefine')).distributionGroupList : undefined;
                        objConfig["systemGroupList"] = JSON.parse(localStorage.getItem('energyManagementDefine')).systemGroupList != undefined ? JSON.parse(localStorage.getItem('energyManagementDefine')).systemGroupList : undefined
                    }else {
                        objConfig["distributionGroupList"] = undefined
                        objConfig["systemGroupList"] = undefined
                    }
                }

                // 1.编写一个action，将初始化的数据保存到store中
                // 2.使用初始化数据渲染结构
                // 3.将需要添加到实时刷新的点保存下来，传到各个组件内，组件内提取出需要的实时值并覆盖
                // 4.组件完成更新
                let pageW = this.store.page.width,
                pageH = this.store.page.height;
                let custom = tempCustomControl;
                custom['calW'] = custom['width'] / pageW;
                custom['calX'] = custom['x'] /pageW;
                custom['calH'] = custom['height'] / pageH;
                custom['calY'] = custom['y'] / pageH;
                // 需要将点位添加到实时刷新时，需要自定义逻辑
                if(objConfig.type == "rule" || objConfig.type=="EquipmentControlTable"|| objConfig.type=="StandardEnergyManage"||objConfig.type=='EnvironmentSensor'||
                    objConfig.type=='LightControlTable'||objConfig.type=='FAUControlTable_V01'||objConfig.type =='FCUControlTable_V01'||
                    objConfig.type=='OnOffValve'||objConfig.type == 'pie'|| objConfig.type == 'table' || objConfig.type == 'schedule' || 
                    objConfig.type == 'pan' || objConfig.type == 'echarts'|| objConfig.type == 'linechart' || objConfig.type == 'faultOverview' || 
                    objConfig.type == 'ring' || objConfig.type == 'arrayChart' || objConfig.type == 'evaluationBar'||objConfig.type == "Efficiency"||
                    objConfig.type == "ProcessSlider"||objConfig.type == "copPie"||objConfig.type == "energyBoard"){
                    // 当自定义组件为table时
                    custom['pointvalue'] = []
                    //如果是CoolingQuality组件，是是请求的点要先从接口里面请求回来
                        
                    // 如果是动态表格，则修改点值后刷新
                    if (objConfig.type == 'table' || objConfig.type == 'schedule') {
                        _this.getCustomTableData(objConfig.point)
                        _this.addElementIdIntoDictRefreshMap(objConfig.point, _this.enmuElementType.customControl, item.id);                       
                    }
                    //兼容pan组件配置point（新的是bindPoint）
                    if (objConfig.type === 'pan' && objConfig.bindPoint === undefined) {
                        _this.addElementIdIntoDictRefreshMap(objConfig.point, _this.enmuElementType.customControl, item.id);                       
                    }

                    //rule组件配置point
                    if (objConfig.type === 'rule' && objConfig.point !== undefined) {
                        //将input加入实时刷新
                        if (objConfig.input !== undefined) {
                            for (let j = 0; j < objConfig.input.length; j++) {
                                _this.addElementIdIntoDictRefreshMap(objConfig.input[j], this.enmuElementType.customControl, item.id)
                            }
                        }
                        this.dictCustomControls[item.id] = tempCustomControl; 
                    } 

                    //=========morgan添加===========
                    var _this = this;
                    if(objConfig.type === 'Efficiency'){                        
                        if(objConfig.pointNameList!==undefined){
                            for(let j=0;j<objConfig.pointNameList.length;j++){
                                _this.addElementIdIntoDictRefreshMap(objConfig.pointNameList[j].Name, this.enmuElementType.customControl, item.id)                        
                            }                        
                        }
                        // else{
                        //     let defaultList = 
                        //     [
                        //         {"Name":"ThisDayChillerRoomGroupPowerTotal","InterPretation":"冷冻机房今日总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayChGroupPowerTotal","InterPretation":"冷冻站今日冷机组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayPriChWPGroupPowerTotal","InterPretation":"冷冻站今日一次泵冷机组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDaySecChWPGroupPowerTotal","InterPretation":"冷冻站今日二次泵冷机组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayCWPGroupPowerTotal","InterPretation":"冷冻站今日冷却泵组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayCTGroupPowerTotal","InterPretation":"冷冻站今日冷却塔组总用电量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayCoolingCapacityTotal","InterPretation":"冷冻站今日总制冷量","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayEfficiencyTotal","InterPretation":"冷冻站今日机房总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayChGroupEfficiencyTotal","InterPretation":"冷冻站今日冷机组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayPriChWPGroupEfficiencyTotal","InterPretation":"冷冻站今日一次泵组���效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDaySecChWPGroupEfficiencyTotal","InterPretation":"冷冻站今日二次泵组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayCWPGroupEfficiencyTotal","InterPretation":"冷冻站今日冷却泵组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //         {"Name":"ThisDayCTGroupEfficiencyTotal","InterPretation":"冷冻站今日冷却塔组总效率","DecimalPoint":"1","Company":"Kwh","Coloums":"3"},
                        //     ]
                        //     for(let j=0;j<defaultList.length;j++){
                        //         _this.addElementIdIntoDictRefreshMap(defaultList[j].Name, this.enmuElementType.customControl, item.id)                        
                        //     } 
                        // }
                        this.dictCustomControls[item.id] = tempCustomControl;                                                
                    }
                    //
                    if (objConfig.type!="copPie" &&objConfig.type!="EquipmentControlTable" &&objConfig.type!="StandardEnergyManage" && objConfig.type!='EnvironmentSensor' && objConfig.type !='LightControlTable' && objConfig.type !='FAUControlTable_V01'&&objConfig.type!='FCUControlTable_V01'&&objConfig.type!='OnOffValve'&&objConfig.type != 'Efficiency' && objConfig.type != 'table'&& objConfig.type != 'schedule'&& objConfig.type != 'linechart'&& objConfig.type != 'faultOverview' && objConfig.type != 'pie') {
                        _this.addElementIdIntoDictRefreshMap(objConfig.bindPoint, _this.enmuElementType.customControl, item.id);
                        this.dictCustomControls[item.id] = tempCustomControl; 
                    } 
                    if(objConfig.type == 'linechart'){
                        for(let j=0;j<objConfig.PointNameList.length;j++){
                            _this.addElementIdIntoDictRefreshMap(objConfig.PointNameList[j], _this.enmuElementType.customControl, item.id);
                        }
                        this.dictCustomControls[item.id] = tempCustomControl; 
                    }
                    if(objConfig.type == 'pie'){
                        for(let j=0;j<objConfig.itemList.length;j++){
                            _this.addElementIdIntoDictRefreshMap(objConfig.itemList[j].pointName, _this.enmuElementType.customControl, item.id);
                        }
                        this.dictCustomControls[item.id] = tempCustomControl; 
                    }
                    if(objConfig.type == 'copPie'){
                        _this.addElementIdIntoDictRefreshMap(objConfig.bindPoint, _this.enmuElementType.customControl, item.id);
                    }
                    if(objConfig.type == 'faultOverview'){
                        for(let j=1;j<=objConfig.number;j++){
                            let pointName;
                            if(j<10){
                                pointName = objConfig.roomName + "Fault000" + j
                            }
                            if(j>=10&&j<100){
                                pointName = objConfig.roomName + "Fault00" + j
                            }
                            if(j>=100&&j<=1000){
                                pointName = objConfig.roomName + "Fault0" + j
                            } 
                            _this.addElementIdIntoDictRefreshMap(pointName, _this.enmuElementType.customControl, item.id);
                        }
                        this.dictCustomControls[item.id] = tempCustomControl; 
                    }
                    if(objConfig.type =='OnOffValve'){
                        let OnOffValvePointList = []
                        objConfig.groups.map((i,j)=>{
                            i.children.map((row,index)=>{
                                OnOffValvePointList.push(`${row['Prefix']}On${row['No']}`) 
                                OnOffValvePointList.push(`${row['Prefix']}Off${row['No']}`) 
                                OnOffValvePointList.push(`${row['Prefix']}OnOffSetting${row['No']}`)
                                OnOffValvePointList.push(`${row['Prefix']}Enabled${row['No']}`)
                            })
                        })
                        for(let i=0;i<OnOffValvePointList.length;i++){
                            _this.addElementIdIntoDictRefreshMap(OnOffValvePointList[i], _this.enmuElementType.customControl, item.id);
                        }
                    }
                    if(objConfig.type =='FCUControlTable_V01'){
                        let FCUControlPointList = []
                        objConfig.groups.map((i,j)=>{
                            i.children.map((row,index)=>{
                                FCUControlPointList.push(`${row['Prefix']}OnOffSetting${row['No']}`)
                                FCUControlPointList.push(`${row['Prefix']}OnOff${row['No']}`) 
                                FCUControlPointList.push(`${row['Prefix']}Enabled${row['No']}`)
                                FCUControlPointList.push(`${row['Prefix']}Err${row['No']}`)
                                FCUControlPointList.push(`${row['Prefix']}Online${row['No']}`)
                                FCUControlPointList.push(`${row['Prefix']}AutoMode${row['No']}`)
                            })
                        })
                        for(let i=0;i<FCUControlPointList.length;i++){
                            _this.addElementIdIntoDictRefreshMap(FCUControlPointList[i], _this.enmuElementType.customControl, item.id);
                        }
                    }
                    if(objConfig.type =='FAUControlTable_V01'){
                        let FAUControlPointList = []
                        objConfig.groups.map((i,j)=>{
                            i.children.map((row,index)=>{
                                FAUControlPointList.push(`${row['Prefix']}SAFanAutoMode${row['No']}`) 
                                FAUControlPointList.push(`${row['Prefix']}SAFanOnOffSetting${row['No']}`)
                                FAUControlPointList.push(`${row['Prefix']}Online${row['No']}`)
                                FAUControlPointList.push(`${row['Prefix']}AirTempSupply${row['No']}`)
                                FAUControlPointList.push(`${row['Prefix']}AirTempSupplySetting${row['No']}`)
                                FAUControlPointList.push(`${row['Prefix']}ChWValvePositionSetting${row['No']}`)
                                FAUControlPointList.push(`${row['Prefix']}ChWValvePosition${row['No']}`)
                                FAUControlPointList.push(`${row['Prefix']}SAFanOnOff${row['No']}`)
                                FAUControlPointList.push(`${row['Prefix']}SAFanErr${row['No']}`)
                                FAUControlPointList.push(`${row['Prefix']}SAFanEnabled${row['No']}`)
                            })
                        })
                        for(let i=0;i<FAUControlPointList.length;i++){
                            _this.addElementIdIntoDictRefreshMap(FAUControlPointList[i], _this.enmuElementType.customControl, item.id);
                        }
                    }
                    if(objConfig.type =='LightControlTable'){
                        let LightControlPointList = []
                        objConfig.groups.map((i,j)=>{
                            i.children.map((row,index)=>{
                                LightControlPointList.push(`${row['Prefix']}OnOff${row['No']}`) 
                                LightControlPointList.push(`${row['Prefix']}Err${row['No']}`)
                                LightControlPointList.push(`${row['Prefix']}Online${row['No']}`)
                                LightControlPointList.push(`${row['Prefix']}OnOffSetting${row['No']}`)
                                LightControlPointList.push(`${row['Prefix']}AutoMode${row['No']}`)
                                LightControlPointList.push(`${row['Prefix']}Enabled${row['No']}`)
                            })
                        })
                        for(let i=0;i<LightControlPointList.length;i++){
                            _this.addElementIdIntoDictRefreshMap(LightControlPointList[i], _this.enmuElementType.customControl, item.id);
                        }
                    }
                    if(objConfig.type =='EnvironmentSensor'){
                        let EnvironmentControlPointList = []
                        objConfig.groups.map((i,j)=>{
                            i.children.map((row,index)=>{
                                EnvironmentControlPointList.push(`${row['Prefix']}CO2${row['No']}`) 
                                EnvironmentControlPointList.push(`${row['Prefix']}PM10${row['No']}`)
                                EnvironmentControlPointList.push(`${row['Prefix']}PM25${row['No']}`)
                                EnvironmentControlPointList.push(`${row['Prefix']}RH${row['No']}`)
                                EnvironmentControlPointList.push(`${row['Prefix']}Temp${row['No']}`)
                                EnvironmentControlPointList.push(`${row['Prefix']}TVOC${row['No']}`)
                                EnvironmentControlPointList.push(`${row['Prefix']}Online${row['No']}`)
                            })
                        })
                        for(let i=0;i<EnvironmentControlPointList.length;i++){
                            _this.addElementIdIntoDictRefreshMap(EnvironmentControlPointList[i], _this.enmuElementType.customControl, item.id);
                        }
                    }
                    if(objConfig.type =='EquipmentControlTable'){
                        let EquipmentControlPointList = []

                        if(objConfig.groups && objConfig.groups.length > 0){
                            objConfig.groups.map((i)=>{
                                i.children.map((row)=>{
                                    objConfig.Properties.map((item)=>{
                                        EquipmentControlPointList.push(`${row['Prefix']}${item['Point']}${row['No']}`) 
                                    })
                                })
                            })
                        }else if(objConfig.groupsTemplate && objConfig.groupsTemplate.length > 0){
                            objConfig.groupsTemplate.map((i)=>{
                                i.children$1List.map((row)=>{
                                    objConfig.Properties.map((item)=>{
                                        if(i['childrenTemplate']['Prefix'].indexOf('$2') != -1){
                                            i.children$2List.map(row2=>{
                                                EquipmentControlPointList.push(`${i['childrenTemplate']['Prefix'].replace('$2',row2)}${item['Point']}${row}`) 
                                            })
                                        }else{
                                            EquipmentControlPointList.push(`${i['childrenTemplate']['Prefix']}${item['Point']}${row}`) 
                                        }
                                    })
                                })
                            })
                        }
                        
                        for(let i=0;i<EquipmentControlPointList.length;i++){
                            _this.addElementIdIntoDictRefreshMap(EquipmentControlPointList[i], _this.enmuElementType.customControl, item.id);
                        }
                    }
                    if(objConfig.type =='StandardEnergyManage'){
                        let EquipmentPointList = []

                        if(objConfig.distributionGroupList && objConfig.distributionGroupList.children != undefined && objConfig.distributionGroupList.children.length > 0){
                            objConfig.distributionGroupList.children.map((i)=>{
                                i.children.map((row)=>{
                                    objConfig.Properties.map((item)=>{
                                        EquipmentPointList.push(`${row['pointPrefix']}${item['Point']}${row['no']}`) 
                                    })
                                    EquipmentPointList.push(`${row['pointPrefix']}`+"CT"+`${row['no']}`)
                                    //网关心跳点
                                    if (row['gatewayId'] != undefined) {
                                        //冒号替换下划线
                                        let geteway1 = row['gatewayId'].replace(new RegExp(/\:/g), '_')
                                        //IP里的点替换下划线
                                        let geteway = geteway1.replace(new RegExp(/\./g), '_')
                                        EquipmentPointList.push(`${geteway}`+"_heart_beat_time")
                                    }
                                    //仪表心跳点
                                    if (row['gatewayId'] != undefined && row['meterId'] != undefined) {
                                        //冒号替换下划线
                                        let geteway1 = row['gatewayId'].replace(new RegExp(/\:/g), '_')
                                        //IP里的点替换下划线
                                        let geteway = geteway1.replace(new RegExp(/\./g), '_')
                                        EquipmentPointList.push(`${geteway}`+"_"+`${row['meterId']}`+"_heart_beat_time")
                                    }
                                    
                                })
                            })
                            console.log(EquipmentPointList)

                        }
                        
                        for(let i=0;i<EquipmentPointList.length;i++){
                            _this.addElementIdIntoDictRefreshMap(EquipmentPointList[i], _this.enmuElementType.customControl, item.id);
                        }
                    }

                    if(objConfig.type =='energyBoard' || objConfig.type =='StandardEnergyManage'){
                        if(localStorage.getItem("energyManagementDefine") != undefined && localStorage.getItem("energyManagementDefine") != null){
                            if(JSON.parse(localStorage.getItem("energyManagementDefine")).gatewayCountPointName){
                                _this.addElementIdIntoDictRefreshMap(JSON.parse(localStorage.getItem("energyManagementDefine")).gatewayCountPointName, _this.enmuElementType.customControl, item.id);
                            }
                            if(JSON.parse(localStorage.getItem("energyManagementDefine")).meterCountPointName){
                                _this.addElementIdIntoDictRefreshMap(JSON.parse(localStorage.getItem("energyManagementDefine")).meterCountPointName, _this.enmuElementType.customControl, item.id);
                            }
                            if(JSON.parse(localStorage.getItem("energyManagementDefine")).gatewayOnlinePercentPointName){
                                _this.addElementIdIntoDictRefreshMap(JSON.parse(localStorage.getItem("energyManagementDefine")).gatewayOnlinePercentPointName, _this.enmuElementType.customControl, item.id);
                            }
                            if(JSON.parse(localStorage.getItem("energyManagementDefine")).powerMeterOnlinePercentPointName){
                                _this.addElementIdIntoDictRefreshMap(JSON.parse(localStorage.getItem("energyManagementDefine")).powerMeterOnlinePercentPointName, _this.enmuElementType.customControl, item.id);
                            }
                        }
                    }

                    this.dictCustomControls[item.id] = tempCustomControl;                        
                }
                //判断是否是在弹框中显示，放入相应的数据中
                if (custom.pageType === "floating") {
                        customListInModal.push(custom)  
                }else{
                        customList.push(custom)         
                }
            } 
            
            // _this.getPointNameList(_this.store.customControls)  //morgan删除取消了
            //判断是否是在弹框中显示，
            if (customListInModal.length != 0) {
                this.refreshCustomDataInModal(customListInModal)
            } 
            if (customList.length != 0){
                this.refreshCustomData(customList)      
            }   
        }
    },

    initButtons: function (zIndex, dictButtons) {
        var _this = this;

        if (this.store.buttons) {
            var item, tempButton;
            for (var i = 0; i < _this.store.buttons.length; i++) {
                if (_this.store.buttons[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let btnImage = document.createElementNS(nameSpace, "image");
                    let btnText = document.createElementNS(nameSpace, "text");
                    // let enabledRect = document.createElementNS(nameSpace, "rect");
                    let enabledText = document.createElementNS(nameSpace, "image");
                    let svgFragment = document.createDocumentFragment();
                    // let svgChart = document.getElementById("svgChart");

                    //如果divMain不存在，再次新建插入容器元素
                    if (document.getElementById("divMain") === undefined) {
                        _this.divMain = document.createElement('div');
                        _this.divMain.id = 'divMain';
                        _this.divMain.style.width = '100%';
                        _this.divMain.style.height = '100%';

                        // svg replace canvas
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let svgChart = document.createElementNS(nameSpace, 'svg');
                        svgChart.id = 'svgChart';
                        svgChart.setAttribute('class', 'svgChart');

                        _this.divMain.appendChild(svgChart);
                        _this.container.style.width = '100%';
                        _this.container.style.height = '100%';
                        _this.container.appendChild(_this.divMain);
                    }

                    let svgChart = document.getElementsByClassName("svgChart");
                    let widthScale = 0, heightScale = 0;
                    let svgChartObj;
                    // 二级弹框 showModal type
                    if (svgChart.length == 3) {
                        // 缩放适配屏幕
                        svgChartObj = document.getElementsByClassName("svgChart")[2];

                        let parentNode = document.getElementById('observerSecModalContainer');
                        let ObserverModalView = parentNode.children[0];

                        let obWidth = ObserverModalView.style.width,
                            obHeight = ObserverModalView.style.height;

                        widthScale = parseInt(obWidth) / _this.store.page.width,
                            heightScale = parseInt(obHeight) / _this.store.page.height;
                    } else {
                        // showModal type
                        if (svgChart.length == 2 || this.modalFlag) {
                            svgChartObj = document.getElementsByClassName("svgChart")[1];
                            let parentNode = document.getElementById('observerModalContainer');
                            let ObserverModalView = parentNode.children[0];

                            let obWidth = ObserverModalView.style.width,
                                obHeight = ObserverModalView.style.height;

                            widthScale = parseInt(obWidth) / _this.store.page.width,
                                heightScale = parseInt(obHeight) / _this.store.page.height;
                        } else {
                            svgChartObj = document.getElementsByClassName("svgChart")[0];
                            widthScale = document.documentElement.clientWidth / _this.store.page.width,
                                heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                        }
                    }


                    // svgChart.appendChild(btnImage);
                    // svgChart.appendChild(btnText);
                    svgFragment.appendChild(btnImage);
                    svgFragment.appendChild(btnText);
                    // svgFragment.appendChild(enabledRect);
                    svgFragment.appendChild(enabledText);
                    //将文档碎片添加到页面，减少一倍按钮个数的渲染次数
                    svgChartObj.appendChild(svgFragment);

                    item = _this.store.buttons[i];

                    //判断保护策略中的butPretect里面，对应点名及对应值的，给item的relation属性增加一条保护内容
                    if (JSON.stringify(pretectObj) != "{}") {
                        if (pretectObj[item.idCom] != undefined && pretectObj[item.idCom][item.setValue] != undefined) {
                            item.relation.push(pretectObj[item.idCom][item.setValue])
                        }   
                    }

                    tempButton = new ModelButton(item.id, null, null);
                    tempButton.x = item.x;
                    tempButton.y = item.y;
                    tempButton.width = item.width;
                    tempButton.height = item.height;
                    tempButton.image = _this.dictImages[item.comm];
                    tempButton.imageComm = _this.dictImages[item.comm];
                    tempButton.imageOver = _this.dictImages[item.over];
                    tempButton.imageDown = _this.dictImages[item.down];
                    tempButton.imageDisable = _this.dictImages[item.disable];
                    tempButton.idCom = item.idCom;
                    tempButton.setValue = item.setValue;
                    tempButton.description = item.description;
                    tempButton.layer = item.layer;
                    tempButton.PreCheckScript = item.PreCheckScript;
                    tempButton.PreCheckScriptDescription = item.PreCheckScriptDescription;
                    tempButton.fontSize = item.fontSize;
                    tempButton.fontColor = item.fontColor;
                    tempButton.relation = item.relation;
                    tempButton.relatType = item.relatType;
                    tempButton.downloadEnableCondition = item.downloadEnableCondition;
                    tempButton.downloadURL = item.downloadURL;
                    tempButton.button = 1;
                    tempButton.memberVariables = {};
                    tempButton.btnImage = btnImage;
                    tempButton.btnText = btnText;
                    tempButton.options = _this.options
                    // tempButton.enabledRect = enabledRect;
                    tempButton.enabledText = enabledText;


                    if (item.text) tempButton.text = item.text;
                    if (item.link > -1) tempButton.link = item.link;
                    //根据按钮的逻辑关系里的点，生成关系点字典
                    if (item.relation && item.relation.length >= 1) {
                        item.relation.forEach(row => {
                            tempButton.memberVariables[row.point] = "999999"
                        })
                        // console.log(tempButton.memberVariables)
                    }
                    //按钮是否可用需根据relation判断，将需判断的点请求到实时数据
                    if (item.relation && item.relation.length >= 1) {
                        for (var j = 0; j < item.relation.length; j++) {
                                _this.addElementIdIntoDictRefreshMap(item.relation[j].point, _this.enmuElementType.button, item.id);
                        }
                    }
                    if (item.idCom.toString().indexOf(',') != -1) {
                        //将多个点的第一个点，因为多点中会有不存在的点，所以无法加入刷新，------【多点按钮没有点击效果】
                        //默认给true,如果有relation的逻辑判断，在条件关系点的实时刷新里，会用update方法来更新按钮状态
                        tempButton.enabled = true
                    }else {
                        //添加到实时刷新----当没有条件关系的时候，按钮被点下去，然后依靠刷新为将按钮再点亮凸起（下面单行注释虽然省去刷新，但是没有了按钮点击效果）
                        _this.addElementIdIntoDictRefreshMap(item.idCom, _this.enmuElementType.button, item.id);
                        //【点击效果失效，所以废弃】----废除上面将idcom加入实时刷新，因为idCom并不需要刷新按钮；
                        //【点击效果失效，所以废弃】----默认给true,如果有relation的逻辑判断，在条件关系点的实时刷新里，会用update方法来更新按钮状态
                        //【点击效果失效，所以废弃】---- tempButton.enabled = true
                    }
        

                    _this.hitModel.add(item.id, _this.enmuElementType.button, item.x * widthScale, item.y * heightScale, item.width, item.height);

                    tempButton.btnText.setAttribute('category', 'button');
                    tempButton.btnText.setAttribute('id', "btn" + item.id);
                    tempButton.btnText.setAttribute('dbId', item.id);
                    tempButton.btnText.setAttribute('type', '2');

                    tempButton.btnImage.setAttribute('category', 'button');
                    tempButton.btnImage.setAttribute('id', "btnImg" + item.id);
                    tempButton.btnImage.setAttribute('dbId', item.id);
                    tempButton.btnImage.setAttribute('type', '2');

                    // tempButton.enabledRect.setAttribute('category', 'button');
                    // tempButton.enabledRect.setAttribute('id', "btnEnRect" + item.id);
                    // tempButton.enabledRect.setAttribute('dbId', item.id);
                    // tempButton.enabledRect.setAttribute('type', '15');
                    

                    tempButton.enabledText.setAttribute('category', 'button');
                    tempButton.enabledText.setAttribute('id', "btnEnInfo" + item.id);
                    tempButton.enabledText.setAttribute('dbId', item.id);
                    tempButton.enabledText.setAttribute('type', '15');

                    dictButtons[item.id] = tempButton;

                    // paint buttons
                    // if ((!tempButton.width) || (!tempButton.height)) {
                    //     tempButton.width = tempButton.image.width;
                    //     tempButton.height = tempButton.image.height;
                    // }
                    try {
                        // 如果需要拉伸
                        // let imgWidthScale = 1, imgHeightScale = 1;
                        // if (tempButton.width !== tempButton.image.width) {
                        //     imgWidthScale = tempButton.width / tempButton.image.width;
                        // }

                        // if (tempButton.height !== tempButton.image.height) {
                        //     imgHeightScale = tempButton.height / tempButton.image.height;
                        // } 

                        // if (imgHeightScale * imgWidthScale != Infinity) {
                        //     btnImage.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale}) `);
                        // }

                        // btnImage.setAttribute("href", tempButton.image.src);
                        // btnImage.setAttribute("x", tempButton.x / imgWidthScale);
                        // btnImage.setAttribute("y", tempButton.y / imgHeightScale);
                        // btnImage.setAttribute("width", tempButton.image.width);
                        // btnImage.setAttribute("height", tempButton.image.height);


                        if (tempButton.fontSize) {
                            var strFontSize = tempButton.fontSize + "px";
                            btnText.setAttribute("font-size", strFontSize);
                            btnText.setAttribute("font-family", '微软雅黑');
                        };

                        if (tempButton.fontColor) {
                            btnText.setAttribute("fill", `rgb(${tempButton.fontColor.r}, ${tempButton.fontColor.g}, ${tempButton.fontColor.b})`);
                        } else {
                            btnText.setAttribute("fill", "#333333");
                        }

                        btnText.textContent = tempButton.text;
                        btnText.setAttribute("alignment-baseline", "central");
                        btnText.setAttribute("text-anchor", "middle");
                        btnText.setAttribute("x", tempButton.x + tempButton.width / 2);
                        btnText.setAttribute("y", tempButton.y + tempButton.height / 2);

                        //画左上角的问号
                        if (tempButton.relation.length != 0) {
                            enabledText.setAttribute("x", tempButton.x-15);
                            enabledText.setAttribute("y", tempButton.y-10);
                            enabledText.setAttribute("href", questionSvg);
                            enabledText.setAttribute("width", 18);
                            enabledText.setAttribute("height", 18);
                            enabledText.setAttribute("display", "none");

                            

                            // enabledRect.setAttribute("x", tempButton.x-40);
                            // enabledRect.setAttribute("y", tempButton.y-6);
                            // enabledRect.setAttribute("width", 98);
                            // enabledRect.setAttribute("height", 15);
                            // enabledRect.setAttribute("rx", 2);
                            // enabledRect.setAttribute("ry", 2);
                            // enabledRect.setAttribute("stroke", '#888');
                            // enabledRect.setAttribute("fill", "#fbff00");
                        }

                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    },

    //初始化复选框
    initCheckboxs: function (dateDict, zIndex, dictCheckboxs) {
        var _this = this;

        // const {startTime,endTime,timeFormat} = this.options.dateProps
        if (this.store.checkboxs) {
            var item, tempCheckbox, expressionPoint;
            //循环得到所有的idCom
            for (var i = 0; i < _this.store.checkboxs.length; i++) {
                if (_this.store.checkboxs[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let checkboxImage = document.createElementNS(nameSpace, "image");
                    let checkboxText = document.createElementNS(nameSpace, "text");
                    let enabledText = document.createElementNS(nameSpace, "image");
                    let svgFragment = document.createDocumentFragment();
                    // let svgChart = document.getElementById("svgChart");

                    //如果divMain不存在，再次新建插入容器元素
                    if (document.getElementById("divMain") === undefined) {
                        _this.divMain = document.createElement('div');
                        _this.divMain.id = 'divMain';
                        _this.divMain.style.width = '100%';
                        _this.divMain.style.height = '100%';

                        // svg replace canvas
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let svgChart = document.createElementNS(nameSpace, 'svg');
                        svgChart.id = 'svgChart';
                        svgChart.setAttribute('class', 'svgChart');

                        _this.divMain.appendChild(svgChart);
                        _this.container.style.width = '100%';
                        _this.container.style.height = '100%';
                        _this.container.appendChild(_this.divMain);
                    }

                    let svgChart = document.getElementsByClassName("svgChart");
                    let widthScale = 0, heightScale = 0;
                    let svgChartObj;
                    // 二级弹框 showModal type
                    if (svgChart.length == 3) {
                        // 缩放适配屏幕
                        svgChartObj = document.getElementsByClassName("svgChart")[2];

                        let parentNode = document.getElementById('observerSecModalContainer');
                        let ObserverModalView = parentNode.children[0];

                        let obWidth = ObserverModalView.style.width,
                            obHeight = ObserverModalView.style.height;

                        widthScale = parseInt(obWidth) / _this.store.page.width,
                            heightScale = parseInt(obHeight) / _this.store.page.height;
                    } else {
                        // showModal type
                        if (svgChart.length == 2) {
                            svgChartObj = document.getElementsByClassName("svgChart")[1];
                            let parentNode = document.getElementById('observerModalContainer');
                            let ObserverModalView = parentNode.children[0];

                            let obWidth = ObserverModalView.style.width,
                                obHeight = ObserverModalView.style.height;

                            widthScale = parseInt(obWidth) / _this.store.page.width,
                                heightScale = parseInt(obHeight) / _this.store.page.height;
                        } else {
                            svgChartObj = document.getElementsByClassName("svgChart")[0];
                            widthScale = document.documentElement.clientWidth / _this.store.page.width,
                                heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                        }
                    }


                    // svgChart.appendChild(checkboxImage);
                    // svgChart.appendChild(checkboxText);

                    svgFragment.appendChild(checkboxImage);
                    svgFragment.appendChild(checkboxText);
                    svgFragment.appendChild(enabledText);
                    svgChartObj.appendChild(svgFragment);

                    item = _this.store.checkboxs[i]
                    //给item新增一个字段relation，存放保护接口启用、禁用的内容
                    item["relation"] = []

                    //判断保护策略中的butPretect里面，对应点名及对应值的，给item的relation属性增加一条保护内容
                    if (JSON.stringify(pretectObj) != "{}") {
                        if (pretectObj[item.idCom] != undefined && pretectObj[item.idCom][item.setValue] != undefined) {
                            item.relation.push(pretectObj[item.idCom][item.setValue])
                        }   
                    }

                    tempCheckbox = new ModelCheckBox(item.id, null, null);
                    tempCheckbox.x = item.x;
                    tempCheckbox.y = item.y;
                    tempCheckbox.width = item.width;
                    tempCheckbox.height = item.height;
                    tempCheckbox.layer = item.layer;
                    tempCheckbox.idCom = item.idCom;
                    tempCheckbox.type = item.type;
                    tempCheckbox.fontColor = item.fontColor;
                    tempCheckbox.fontSize = item.fontSize;
                    tempCheckbox.setValue = item.setValue;
                    tempCheckbox.unsetValue = item.unsetValue;
                    tempCheckbox.text = item.text;
                    tempCheckbox.idGroup = item.idGroup;
                    tempCheckbox.expression = item.expression;
                    tempCheckbox.image = new Image();
                    tempCheckbox.checkbox = 'checkbox';
                    tempCheckbox.checkboxImage = checkboxImage;
                    tempCheckbox.checkboxText = checkboxText;
                    tempCheckbox.options = _this.options;
                    tempCheckbox.desc = item.desc;
                    tempCheckbox.relation = item.relation;
                    tempCheckbox.enabledText = enabledText;
                    
                    let pointList = JSON.parse(localStorage.getItem('allPointList'))
                    if (pointList != undefined && pointList.length != 0) {
                        pointList.map(point=>{
                            //需先判断param10是否存在，兼容老版本的dompysite
                            if(item.idCom == point.name && point.param10 != undefined){
                                tempCheckbox.param10 = point.param10
                            }
                        })
                    }

                    //若该点是否可用需要判断表达式，则需将表达式里的点名取出，再调用实时刷新
                    if (_this.store.checkboxs[i].expression) {
                        let str = _this.store.checkboxs[i].expression;
                        str = str.match(/\[[^\]]+\]/g)[0]; //得到表达式中[Number_CWPRunning]
                        if (str) {
                            expressionPoint = str.slice(1, -1); //得到点名Number_CWPRunning
                        }
                        //console.log(expressionPoint);
                        _this.addElementIdIntoDictRefreshMap(expressionPoint, _this.enmuElementType.checkbox, _this.store.checkboxs[i].id); //把表达式里的点加到实时刷新中
                    }

                    if (_this.store.checkboxs[i].idCom && _this.store.checkboxs[i].id != "") {
                        _this.addElementIdIntoDictRefreshMap(_this.store.checkboxs[i].idCom, _this.enmuElementType.checkbox, _this.store.checkboxs[i].id);
                    }
                    _this.hitModel.add(item.id, _this.enmuElementType.checkbox, item.x * widthScale, item.y * heightScale, item.width, item.height);

                    dictCheckboxs[item.id] = tempCheckbox;

                    // paint checkbox
                    if ((!tempCheckbox.width) || (!tempCheckbox.height)) {
                        tempCheckbox.width = tempCheckbox.image.width;
                        tempCheckbox.height = tempCheckbox.image.height;
                    }
                    try {
                        checkboxImage.setAttribute("href", tempCheckbox.image.src);
                        checkboxImage.setAttribute("id", item.id);
                        checkboxImage.setAttribute("type", '8');
                        checkboxImage.setAttribute("x", tempCheckbox.x);
                        checkboxImage.setAttribute("y", tempCheckbox.y);
                        checkboxImage.setAttribute("width", tempCheckbox.width);
                        checkboxImage.setAttribute("height", tempCheckbox.height);

                        
                        enabledText.setAttribute('category', 'checkbox');
                        enabledText.setAttribute('id', "checkboxInfo" + item.id);
                        enabledText.setAttribute('dbId', item.id);
                        enabledText.setAttribute('type', '16');

                        
                        //画左上角的问号
                        if (tempCheckbox.relation.length != 0) {
                            enabledText.setAttribute("x", tempCheckbox.x-20);
                            enabledText.setAttribute("y", tempCheckbox.y-15);
                            enabledText.setAttribute("href", questionSvg);
                            enabledText.setAttribute("width", 18);
                            enabledText.setAttribute("height", 18);
                            enabledText.setAttribute("display", "none");
                        }

                        if (tempCheckbox.text) {
                            checkboxText.setAttribute("font-size", tempCheckbox.fontSize);
                            checkboxText.setAttribute("font-family", '微软雅黑');
                            if (tempCheckbox.fontColor) {
                                checkboxText.setAttribute("fill", `rgb(${tempCheckbox.fontColor.r} , ${tempCheckbox.fontColor.g} , ${tempCheckbox.fontColor.b})`);
                            } else {
                                checkboxText.setAttribute("fill", "#333333");
                            }
                            checkboxText.textContent = tempCheckbox.text;
                            checkboxText.setAttribute("alignment-baseline", "central");
                            checkboxText.setAttribute("text-anchor", "start");
                            checkboxText.setAttribute("x", Math.floor(tempCheckbox.x + tempCheckbox.width / 2 + 10));
                            checkboxText.setAttribute("y", Math.floor(tempCheckbox.y + tempCheckbox.height / 2));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    },

    initTempDistribution: function () {
        this.dictTempDistributions = {};
        if (this.store.tempDistributions
            && !!this.store.tempDistributions.data
            && this.store.tempDistributions.data.length) {
            var item, tempDistribution;
            item = this.store.tempDistributions;
            tempDistribution = new ModelTempDistribution(item.pageid, null, null);
            tempDistribution.layer = item.layer;
            tempDistribution.data = item.data;
            tempDistribution.width = item.width;
            tempDistribution.height = item.height;
            tempDistribution.x = item.x;
            tempDistribution.y = item.y;
            tempDistribution.heatType = item.heatType;
            tempDistribution.init();
            this.dictTempDistributions[item.pageid] = tempDistribution;
            for (var n = 0, len = item.data.length; n < len; n++) {
                var point = item.data[n];
                this.addElementIdIntoDictRefreshMap(point.idCom, this.enmuElementType.temperature, item.pageid);
            }
        } else if (this.id) {
            tempDistribution = new ModelTempDistribution(this.id, null, null);
            tempDistribution.init();
            this.dictTempDistributions[this.id] = tempDistribution;
        }
    },
    //虚线框
    initRects: function (zIndex, dictRects) {
        var rects;
        var _this = this;

        if (this.store.rects && this.store.rects.length) {
            for (var i = 0, row, len = _this.store.rects.length; i < len; i++) {
                if (_this.store.rects[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let rect = document.createElementNS(nameSpace, "rect");
                    // let svgChart = document.getElementById("svgChart");

                    let svgChart = document.getElementsByClassName("svgChart");
                    // showModal type
                    if (svgChart.length > 1) {
                        svgChart = document.getElementsByClassName("svgChart")[1];
                    } else {
                        svgChart = document.getElementsByClassName("svgChart")[0];
                    }

                    svgChart.appendChild(rect);

                    row = _this.store.rects[i];
                    rects = new ModelRect(row.id, null, null);

                    rects.x = parseInt(row.x);
                    rects.y = parseInt(row.y);
                    rects.width = parseInt(row.width);
                    rects.height = parseInt(row.height);
                    rects.layer = row.layer;
                    rects.rect = rect;

                    dictRects[row.id] = rects;

                    // paint rect
                    // rect.setAttribute("stroke-dasharray", [6]);
                    // rect.setAttribute("stroke-width", "4");
                    // rect.setAttribute("x", rects.x);
                    // rect.setAttribute("y", rects.y);
                    // rect.setAttribute("width", rects.width);
                    // rect.setAttribute("height", rects.height);
                    // rect.setAttribute("fill", "rgb(255,255,255,0)");
                    // rect.setAttribute("stroke", "rgb(0,0,0,1)");
                }
            }
        }
    },
    //直线
    initLines: function (zIndex, dictLines) {
        var Lines;
        var _this = this;
        if (this.store.straightLine && this.store.straightLine.length) {
            for (var i = 0, row, len = _this.store.straightLine.length; i < len; i++) {
                if (_this.store.straightLine[i].layer == zIndex) {
                    let nameSpace = 'http://www.w3.org/2000/svg';
                    let line = document.createElementNS(nameSpace, "line");

                    let svgChart = document.getElementsByClassName("svgChart");
                    // showModal type
                    if (svgChart.length > 1) {
                        svgChart = document.getElementsByClassName("svgChart")[1];
                    } else {
                        svgChart = document.getElementsByClassName("svgChart")[0];
                    }

                    svgChart.appendChild(line);

                    row = _this.store.straightLine[i];
                    Lines = new ModelLine(row.id, null, null);

                    Lines.x1 = parseInt(row.x0);
                    Lines.y1 = parseInt(row.y0);
                    Lines.x2 = parseInt(row.x1);
                    Lines.y2 = parseInt(row.y1);
                    Lines.color = 'rgb(' + row.color.r + ',' + row.color.g + ',' + row.color.b + ')';
                    Lines.lineWidth = parseInt(row.lineWidth);
                    Lines.lineType = parseInt(row.lineType);
                    Lines.layer = row.layer;
                    Lines.line = line;

                    dictLines[row.id] = Lines;
                }
            }
        }
    },
    //直线开始位置圆球
    initStartLines: function (zIndex, dictStartLines) {
        var StartLines;
        var _this = this;

        if (this.store.straightLine && this.store.straightLine.length) {
            for (var i = 0, row, len = _this.store.straightLine.length; i < len; i++) {
                if (_this.store.straightLine[i].layer == zIndex) {
                    if (_this.store.straightLine[i].startType == 1) {
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let Startline = document.createElementNS(nameSpace, "circle");
                        // let svgChart = document.getElementById("svgChart");

                        let svgChart = document.getElementsByClassName("svgChart");
                        // showModal type
                        if (svgChart.length > 1) {
                            svgChart = document.getElementsByClassName("svgChart")[1];
                        } else {
                            svgChart = document.getElementsByClassName("svgChart")[0];
                        }

                        svgChart.appendChild(Startline);

                        row = _this.store.straightLine[i];
                        StartLines = new ModelStartLine(row.id, null, null);

                        StartLines.cx = parseInt(row.x0);
                        StartLines.cy = parseInt(row.y0);
                        StartLines.startSize = parseInt(row.startSize);
                        StartLines.color = 'rgb(' + row.color.r + ',' + row.color.g + ',' + row.color.b + ')';
                        StartLines.layer = row.layer;
                        StartLines.circle = Startline;

                        dictStartLines[row.id] = StartLines;
                    }

                }
            }
        }
    },
    //直线结束位置圆球
    initEndLines: function (zIndex, dictEndLines) {
        var EndLines;
        var _this = this;

        if (this.store.straightLine && this.store.straightLine.length) {
            for (var i = 0, row, len = _this.store.straightLine.length; i < len; i++) {
                if (_this.store.straightLine[i].layer == zIndex) {
                    if (_this.store.straightLine[i].endType == 1) {
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let Endline = document.createElementNS(nameSpace, "circle");
                        // let svgChart = document.getElementById("svgChart");

                        let svgChart = document.getElementsByClassName("svgChart");
                        // showModal type
                        if (svgChart.length > 1) {
                            svgChart = document.getElementsByClassName("svgChart")[1];
                        } else {
                            svgChart = document.getElementsByClassName("svgChart")[0];
                        }

                        svgChart.appendChild(Endline);

                        row = _this.store.straightLine[i];
                        EndLines = new ModelEndLine(row.id, null, null);
                        EndLines.endSize = parseInt(row.endSize);
                        EndLines.color = 'rgb(' + row.color.r + ',' + row.color.g + ',' + row.color.b + ')';
                        EndLines.cx = parseInt(row.x1);
                        EndLines.cy = parseInt(row.y1);
                        EndLines.layer = row.layer;
                        EndLines.circle = Endline;

                        dictEndLines[row.id] = EndLines;
                    }

                }
            }
        }
    },
    //初始化文字
    initTexts: function (zIndex, dictTexts) {
        var _this = this;

        console.log("dora【初始化文字】")

        if (this.store.texts) {
            var item, tempText;
            //根据得到的数据遍历
            let pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))
            for (var i = 0; i < _this.store.texts.length; i++) {
                if (_this.store.texts[i].layer == zIndex) {
                    //获取此id元素，若已存在，即删除（防止重复绘制）
                    let element = document.getElementById(_this.store.texts[i].id)
                    if (element != undefined || element != null) {
                        element.parentNode.removeChild(element)
                    }

                    let nameSpace = 'http://www.w3.org/2000/svg';

                    let svgFragment = document.createDocumentFragment();

                    // create foreignObject
                    var foreignObject = document.createElementNS(nameSpace, 'foreignObject');

                    let svgChart = document.getElementsByClassName("svgChart");
                    let widthScale = 0, heightScale = 0;
                    let svgChartObj;
                    // 二级弹框 showModal type
                    if (svgChart.length == 3) {
                        // 缩放适配屏幕
                        svgChartObj = document.getElementsByClassName("svgChart")[2];

                        let parentNode = document.getElementById('observerSecModalContainer');
                        let ObserverModalView = parentNode.children[0];

                        let obWidth = ObserverModalView.style.width,
                            obHeight = ObserverModalView.style.height;

                        widthScale = parseInt(obWidth) / _this.store.page.width,
                            heightScale = parseInt(obHeight) / _this.store.page.height;
                    } else {
                        // showModal type
                        if (svgChart.length == 2 || this.modalFlag) {
                            svgChartObj = document.getElementsByClassName("svgChart")[1];//模态框走这里
                            let parentNode = document.getElementById('observerModalContainer');
                            let ObserverModalView = parentNode.children[0];

                            let obWidth = ObserverModalView.style.width,
                                obHeight = ObserverModalView.style.height;

                            widthScale = parseInt(obWidth) / _this.store.page.width,
                                heightScale = parseInt(obHeight) / _this.store.page.height;
                        } else {
                            svgChartObj = document.getElementsByClassName("svgChart")[0];//主界面走这里流程
                            widthScale = document.documentElement.clientWidth / _this.store.page.width,
                                heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                        }
                    }

                    svgChartObj.appendChild(svgFragment);


                    item = _this.store.texts[i];
                    tempText = new ModelText(item.id, null, null, item.backgroudFrameStyle);

                    let textBg = "";
                    let text = "";
                    let unitBg = "";
                    let unit = "";
                    let bgImage = "";

                

                    //如果值模式是5，即带单位显示，需创建4个svg,单位和值分开加背景
                    if (_this.store.texts[i].showMode == 5) {
                        textBg = document.createElementNS(nameSpace, "rect");
                        text = document.createElementNS(nameSpace, "text");
                        unitBg = document.createElementNS(nameSpace, "rect");
                        unit = document.createElementNS(nameSpace, "text");
                        svgFragment.appendChild(textBg);
                        svgFragment.appendChild(text);
                        svgFragment.appendChild(unitBg);
                        svgFragment.appendChild(unit);
                        tempText.text = text;
                        tempText.textBg = textBg;
                        tempText.unitBg = unitBg;
                        tempText.unit = unit;
                        text.textContent = item.text;
                        unit.textContent = item.unit

                    } else {
                        text = document.createElementNS(nameSpace, "text");
                        bgImage = document.createElementNS(nameSpace, "image");
                        svgFragment.appendChild(bgImage);
                        svgFragment.appendChild(text);
                        tempText.text = text;
                        tempText.bgImage = bgImage;

                        text.textContent = item.text;
                    }

                    //点权限过滤
                    let pointList = JSON.parse(localStorage.getItem('allPointList'))
                    let param10 = ""
                    if (pointList != undefined && pointList.length != 0) {
                        pointList.map(point=>{
                            //需先判断param10是否存在，兼容老版本的dompysite
                            if(item.idCom == point.name && point.param10 != undefined){
                                param10 = point.param10
                            }
                        })
                    }
                    // console.log(param10,item)
                    if(param10 != "" && param10.indexOf('|') != -1 ){
                        if(param10.slice(0,param10.indexOf('|'))>JSON.parse(window.localStorage.getItem('userData')).role){
                            //覆盖上面的默认值
                            text.textContent = '无权限';
                            //保存param10配置，并做标记
                            tempText.param10 = param10;
                            item.param10 = param10;
                            tempText.permission = false;
                            item.permission = false;
                        }else{
                            //保留上面的默认值，正常显示及刷新;为下面的加入实时刷新标记param10
                            tempText.param10 = "";
                            item.param10 = "";
                        }
                    }else{
                        //保留上面的默认值，正常显示及刷新;为下面的加入实时刷新标记param10
                        tempText.param10 = "";
                        item.param10 = "";
                    }


                    //带单位模式——值背景绘制
                    function paintTextBg() {
                        if (item.width !== undefined && item.height !== undefined) {
                            tempText.textBg.setAttribute("stroke-width", "1.5");
                            tempText.textBg.setAttribute("x", item.x);
                            tempText.textBg.setAttribute("y", item.y - item.height / 2);
                            tempText.textBg.setAttribute("rx", 5);
                            tempText.textBg.setAttribute("ry", 1);
                            tempText.textBg.setAttribute("width", item.width / 2);
                            tempText.textBg.setAttribute("height", item.height);
                            tempText.textBg.setAttribute("fill", "#FFFFFF");
                            tempText.textBg.setAttribute("stroke", "#C5C9CD");
                        }
                    }

                    //带单位模式——单位背景绘制
                    function paintUnitBg() {
                        if (item.width !== undefined && item.height !== undefined) {
                            tempText.unitBg.setAttribute("stroke-width", "1.5");
                            tempText.unitBg.setAttribute("x", item.x + item.width / 2);
                            tempText.unitBg.setAttribute("y", item.y - item.height / 2);
                            tempText.unitBg.setAttribute("rx", 5);
                            tempText.unitBg.setAttribute("ry", 1);
                            tempText.unitBg.setAttribute("width", item.width / 2);
                            tempText.unitBg.setAttribute("height", item.height);
                            tempText.unitBg.setAttribute("fill", "#EFF0F1");
                            tempText.unitBg.setAttribute("stroke", "#C5C9CD");
                        }
                    }

                    //自定义背景图绘制
                    function paintBgImg() {
                        var imgBg = new Image();
                        imgBg.src = appConfig.serverUrl + `/static/images/backgroudImg_${item.backgroudFrameStyle}.png`;
                        let imgWidthScale, imgHeightScale;
                        if (item.width !== undefined && item.height !== undefined) {
                            tempText.bgImage.setAttribute("href", imgBg.src);
                            imgWidthScale = item.width / 140;
                            imgHeightScale = item.height / 37;
                            tempText.bgImage.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})`);
                            tempText.bgImage.setAttribute("x", (parseInt(item.x)) / imgWidthScale);
                            tempText.bgImage.setAttribute("y", (parseInt(item.y)) / imgHeightScale - 37 / 2);
                            tempText.bgImage.setAttribute("width", 140);
                            tempText.bgImage.setAttribute("height", 37);
                        }
                        // if (imgHeightScale && imgWidthScale) {
                        // }
                    }


                    // wordWrap
                    if (item.width
                        && item.height >= 60
                        // && item.backgroudFrameStyle == 0
                    ) {
                        setTimeout(function () {
                            svgChartObj.removeChild(text);
                        }, 5)
                        let p = document.createElement('p');
                        p.append(item.text);
                        svgFragment.appendChild(foreignObject);
                        foreignObject.appendChild(p);
                        tempText.text = p;
                        foreignObject.setAttribute('category', 'p');
                        p.setAttribute('category', 'p');
                    } else {
                        foreignObject = false;
                        text.setAttribute('category', 'text');
                    }

                    svgChartObj.appendChild(svgFragment);

                    tempText.x = item.x;
                    tempText.y = item.y;
                    tempText.width = item.width;
                    tempText.height = item.height;
                    tempText.value = item.text;
                    tempText.fontSize = item.fontSize;
                    tempText.decimalplace = item.decimalplace;
                    tempText.font = item.font;
                    tempText.showMode = item.showMode;
                    tempText.readWrite = item.rw;
                    tempText.layer = item.layer;
                    tempText.align = item.align;
                    tempText.options = _this.options;
                    tempText.rw = item.rw; //读写
                    tempText.backgroudFrameStyle = item.backgroudFrameStyle; //背景框样式

                    tempText.foreignObject = foreignObject;

                    if (item.showMode == 0 && item.bindString && item.bindString != "") {
                        var arr = item.bindString.split("|");
                        tempText.dictBindString = arr;
                        // var strs;
                        // for (var j = 0 , len = arr.length ; j < len ; j++) {
                        //     strs = arr[j].split(":");
                        //     // dictBindString是对象
                        //     tempText.dictBindString[strs[0]] = strs[1];
                        // }
                    }
                    

                    if (item.bindScript != undefined && item.bindScript != 0 && item.bindScript != 1 && item.bindScript != "") {
                        tempText.bindScript = item.bindScript;

                        if (item.color) {
                            tempText.color = pysiteVersion && pysiteVersion >= 1473?
                                'rgb(' + item.color.r + ',' + item.color.g + ',' + item.color.b + ')'
                                :'rgb(' + item.color.b + ',' + item.color.g + ',' + item.color.r + ')'
                        }
                        if (item.bindScript && item.id != "") {
                            tempText.idCom = item.idCom;
                            tempText.value = "--";
                            //console.info( item.idCom,item.id )
                            _this.addBindTypeIntoDictRefreshMap(item.bindScript, _this.enmuElementType.text, item.id);
                            for (var j = 0; j < pointDes.length; j++) {
                                if (pointDes[j].name == tempText.idCom) {
                                    tempText.description = pointDes[j].description
                                    tempText.sourceType = pointDes[j].sourceType
                                }
                            }
                        }

                        if (item.idCom && item.id != "") {
                            _this.hitModel.add(item.id, _this.enmuElementType.text, item.x * widthScale, (item.y - (item.height / 2)) * heightScale, item.width, item.height);
                        }
                        dictTexts[item.id] = tempText;
                    } else {
                        if (item.color) {
                            tempText.color = pysiteVersion && pysiteVersion >= 1473?
                                'rgb(' + item.color.r + ',' + item.color.g + ',' + item.color.b + ')'
                                :'rgb(' + item.color.b + ',' + item.color.g + ',' + item.color.r + ')'
                        }

                        if (item.idCom && item.id != "") {
                            tempText.idCom = item.idCom;
                            tempText.value = "--";
                            //console.info( item.idCom,item.id )
                            _this.addElementIdIntoDictRefreshMap(item.idCom, _this.enmuElementType.text, item.id);
                            for (var j = 0; j < pointDes.length; j++) {
                                if (pointDes[j].name == tempText.idCom) {
                                    tempText.description = pointDes[j].description;
                                    tempText.sourceType = pointDes[j].sourceType
                                }
                            }
                        }

                        if (item.idCom && item.id != "") {
                            _this.hitModel.add(item.id, _this.enmuElementType.text, item.x * widthScale, (item.y - (item.height / 2)) * heightScale, item.width, item.height);
                        }
                        //text的id加文本，会导致重绘多次，只能用id
                        tempText.text.setAttribute('id', item.id);
                        tempText.text.setAttribute('dbId', item.id);
                        tempText.text.setAttribute('type', '3');

                        dictTexts[item.id] = tempText;

                    }
                    // paint text
                    var curColor = tempText.color;
                    var strFontSize, strFont;
                    strFontSize = item.fontSize + "px ";
                    strFont = item.font ? item.font : "MicrosoftYaHei,Arial";

                    tempText.text.setAttribute("font-size", strFontSize);
                    tempText.text.setAttribute("font-family", strFont);

                    if (item.backgroudFrameStyle != 0 && item.backgroudFrameStyle != undefined) {
                        if (item.showMode == 5) {
                            paintTextBg();
                            paintUnitBg();
                            paintText(curColor);
                            paintUnit(curColor);
                        } else {
                            paintBgImg();
                            paintText(curColor);
                        }
                    } else {
                        if (item.showMode == 5) {
                            paintTextBg();
                            paintUnitBg();
                            paintText(curColor);
                            paintUnit(curColor);
                        } else {
                            paintText(curColor);
                        }

                    }

                    // function colorAlarm() {
                    //     tempText.text.getBBox();
                    //     let bgColorAlarm = document.createElementNS(nameSpace,"rect");
                    //     let animateAlarm = document.createElementNS(nameSpace,"animate");
                    //     svgChartObj.appendChild(bgColorAlarm);
                    //     bgColorAlarm.appendChild(animateAlarm);
                    //     animateAlarm.setAttribute("attributeType","CSS");
                    //     animateAlarm.setAttribute("attributeName","opacity");
                    //     animateAlarm.setAttribute("values","0.7;0.3;0.7");
                    //     animateAlarm.setAttribute("to",0.3);
                    //     animateAlarm.setAttribute("dur","1s");
                    //     animateAlarm.setAttribute("repeatCount","indefinite");
                    //     bgColorAlarm.setAttribute("x",tempText.x);
                    //     bgColorAlarm.setAttribute("y",tempText.y);
                    //     bgColorAlarm.setAttribute("width",item.width);
                    //     bgColorAlarm.setAttribute("height",item.height);
                    //     bgColorAlarm.setAttribute("fill","rgb(255,0,0)");   
                    // }


                    function paintText(color) {
                        try {
                            tempText.text.setAttribute("font-size", strFontSize);
                            tempText.text.setAttribute("alignment-baseline", "central");
                            if (color) tempText.text.setAttribute("fill", color);
                            //文本右对齐时，x增加一个当前单位的width值，左对齐不变
                            var strX = item.x;
                            var strY = item.y;
                            //如果是带单位文本，宽度需要减一半
                            if (item.showMode == 5) {
                                item.width = item.width / 2
                            }

                            if (item.backgroudFrameStyle != 0 && item.backgroudFrameStyle != undefined && item.showMode != 5) {
                                switch (item.align) {
                                    case 0:
                                        strX = item.x + 4;
                                        strY = item.y;
                                        tempText.text.setAttribute("text-anchor", "start");
                                        break;
                                    case 1:
                                        strX = item.x + item.width - 6;
                                        strY = item.y;
                                        tempText.text.setAttribute("text-anchor", "end");
                                        break;
                                    //中中
                                    case 2:
                                        strX = item.x + item.width / 2;
                                        strY = item.y;
                                        tempText.text.setAttribute("text-anchor", "middle");
                                        break;
                                    //左上
                                    case 3:
                                        strX = item.x + 4;
                                        strY = item.y + 8 - item.height / 2;
                                        tempText.text.setAttribute("text-anchor", "start");
                                        tempText.text.setAttribute("alignment-baseline", "hanging");
                                        break;
                                    //右上   
                                    case 4:
                                        strX = item.x + item.width - 6;
                                        tempText.text.setAttribute("text-anchor", "end");
                                        strY = item.y + 8 - item.height / 2;
                                        tempText.text.setAttribute("alignment-baseline", "hanging");
                                        break;
                                    //中上
                                    case 5:
                                        strX = item.x + item.width / 2;
                                        tempText.text.setAttribute("text-anchor", "middle");
                                        strY = item.y + 8 - item.height / 2;
                                        tempText.text.setAttribute("alignment-baseline", "hanging");
                                        break;
                                    //左下
                                    case 6:
                                        strX = item.x + 4;
                                        tempText.text.setAttribute("text-anchor", "start");
                                        strY = item.y + item.height - item.height / 2 - 8;
                                        tempText.text.setAttribute("alignment-baseline", "baseline");
                                        break;
                                    //右下
                                    case 7:
                                        strX = item.x + item.width - 6;
                                        tempText.text.setAttribute("text-anchor", "end");
                                        strY = item.y + item.height - item.height / 2 - 8;
                                        tempText.text.setAttribute("alignment-baseline", "baseline");
                                        break;
                                    //中下
                                    case 8:
                                        strX = item.x + item.width / 2;
                                        tempText.text.setAttribute("text-anchor", "middle");
                                        strY = item.y + item.height - item.height / 2 - 8;
                                        tempText.text.setAttribute("alignment-baseline", "baseline");
                                        break;
                                    default:
                                        strX = item.x;
                                        tempText.text.setAttribute("text-anchor", "start");
                                        break;
                                }
                            } else {
                                switch (item.align) {
                                    case 0:
                                        strX = item.x;
                                        tempText.text.setAttribute("text-anchor", "start");
                                        break;
                                    case 1:
                                        strX = item.x + item.width;
                                        tempText.text.setAttribute("text-anchor", "end");
                                        break;
                                    //中中
                                    case 2:
                                        strX = item.x + item.width / 2;
                                        tempText.text.setAttribute("text-anchor", "middle");
                                        break;
                                    //左上
                                    case 3:
                                        strX = item.x;
                                        tempText.text.setAttribute("text-anchor", "start");
                                        strY = item.y - item.height / 2 + 3;
                                        tempText.text.setAttribute("alignment-baseline", "hanging");
                                        break;
                                    //右上   
                                    case 4:
                                        strX = item.x + item.width;
                                        tempText.text.setAttribute("text-anchor", "end");
                                        strY = item.y - item.height / 2;
                                        tempText.text.setAttribute("alignment-baseline", "hanging");
                                        break;
                                    //中上
                                    case 5:
                                        strX = item.x + item.width / 2;
                                        tempText.text.setAttribute("text-anchor", "middle");
                                        strY = item.y - item.height / 2;
                                        tempText.text.setAttribute("alignment-baseline", "hanging");
                                        break;
                                    //左下
                                    case 6:
                                        strX = item.x;
                                        tempText.text.setAttribute("text-anchor", "start");
                                        strY = item.y + item.height / 2;
                                        tempText.text.setAttribute("alignment-baseline", "baseline");
                                        break;
                                    //右下
                                    case 7:
                                        strX = item.x + item.width;
                                        tempText.text.setAttribute("text-anchor", "end");
                                        strY = item.y + item.height / 2;
                                        tempText.text.setAttribute("alignment-baseline", "baseline");
                                        break;
                                    //中下
                                    case 8:
                                        strX = item.x + item.width / 2;
                                        tempText.text.setAttribute("text-anchor", "middle");
                                        strY = item.y + item.height / 2;
                                        tempText.text.setAttribute("alignment-baseline", "baseline");
                                        break;
                                    default:
                                        strX = item.x;
                                        tempText.text.setAttribute("text-anchor", "start");
                                        break;
                                }
                            }




                            if (foreignObject) {
                                // p 
                                if (item.align === 0 || item.align === 1 || item.align === 2) {
                                    StringTools.wordWrap(foreignObject, strX, strY, item.width, item.height);
                                } else if (item.align === 6 || item.align === 7 || item.align === 8) {
                                    StringTools.wordWrap(foreignObject, strX, strY, item.width, item.height);
                                } else {
                                    StringTools.wordWrap(foreignObject, strX, item.y - item.height / 2, item.width, item.height);
                                }
                            } else {
                                tempText.text.setAttribute("x", strX);
                                tempText.text.setAttribute("y", strY);
                                // if (item.idCom != undefined) {
                                //     colorAlarm()  
                                // }
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    function paintUnit(color) {
                        try {
                            tempText.unit.setAttribute("font-size", strFontSize);
                            tempText.unit.setAttribute("alignment-baseline", "central");
                            tempText.unit.setAttribute("font-family", strFont);
                            if (color) tempText.unit.setAttribute("fill", color);
                            //文本右对齐时，x增加一个当前单位的width值，左对齐不变
                            var strX = item.x;
                            var strY = item.y;

                            switch (item.align) {
                                case 0:
                                    strX = item.x + item.width;
                                    tempText.unit.setAttribute("text-anchor", "start");
                                    break;
                                case 1:
                                    strX = item.x + item.width + item.width;
                                    tempText.unit.setAttribute("text-anchor", "end");
                                    break;
                                //中中
                                case 2:
                                    strX = item.x + item.width / 2 + item.width;
                                    tempText.unit.setAttribute("text-anchor", "middle");
                                    break;
                                //左上
                                case 3:
                                    strX = item.x + item.width;
                                    tempText.unit.setAttribute("text-anchor", "start");
                                    strY = item.y - item.height / 2 + 3;
                                    tempText.unit.setAttribute("alignment-baseline", "hanging");
                                    break;
                                //右上   
                                case 4:
                                    strX = item.x + item.width + item.width;
                                    tempText.unit.setAttribute("text-anchor", "end");
                                    strY = item.y - item.height / 2;
                                    tempText.unit.setAttribute("alignment-baseline", "hanging");
                                    break;
                                //中上
                                case 5:
                                    strX = item.x + item.width / 2 + item.width;
                                    tempText.unit.setAttribute("text-anchor", "middle");
                                    strY = item.y - item.height / 2;
                                    tempText.unit.setAttribute("alignment-baseline", "hanging");
                                    break;
                                //左下
                                case 6:
                                    strX = item.x + item.width;
                                    tempText.unit.setAttribute("text-anchor", "start");
                                    strY = item.y + item.height / 2;
                                    tempText.unit.setAttribute("alignment-baseline", "baseline");
                                    break;
                                //右下
                                case 7:
                                    strX = item.x + item.width + item.width;
                                    tempText.unit.setAttribute("text-anchor", "end");
                                    strY = item.y + item.height / 2;
                                    tempText.unit.setAttribute("alignment-baseline", "baseline");
                                    break; ß
                                //中下
                                case 8:
                                    strX = item.x + item.width / 2 + item.width;
                                    tempText.unit.setAttribute("text-anchor", "middle");
                                    strY = item.y + item.height / 2;
                                    tempText.unit.setAttribute("alignment-baseline", "baseline");
                                    break;
                                default:
                                    strX = item.x + item.width;
                                    tempText.unit.setAttribute("text-anchor", "start");
                                    break;
                            }

                            tempText.unit.setAttribute("x", strX);
                            tempText.unit.setAttribute("y", strY);

                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
        }
    },
    //矩形-色块
    initRectangles: function (zIndex, dictRectangles) {
        var rectangles;
        var _this = this;

        if (this.store.rectangles && this.store.rectangles.length) {
            for (var i = 0, row, len = _this.store.rectangles.length; i < len; i++) {
                if (_this.store.rectangles[i].rectStyle == undefined || (_this.store.rectangles[i].rectStyle != undefined && _this.store.rectangles[i].rectStyle == 0)) {
                    if (_this.store.rectangles[i].layer == zIndex) {
                        let nameSpace = 'http://www.w3.org/2000/svg';
                        let rectangle = document.createElementNS(nameSpace, "rect");
                        // let svgChart = document.getElementById("svgChart");

                        let svgChart = document.getElementsByClassName("svgChart");
                        // showModal type
                        if (svgChart.length > 1) {
                            svgChart = document.getElementsByClassName("svgChart")[1];
                        } else {
                            svgChart = document.getElementsByClassName("svgChart")[0];
                        }

                        svgChart.appendChild(rectangle);

                        row = _this.store.rectangles[i];
                        rectangles = new ModelRectangle(row.id, null, null);

                        rectangles.x = parseInt(row.x);
                        rectangles.y = parseInt(row.y);
                        rectangles.width = parseInt(row.width);
                        rectangles.height = parseInt(row.height);
                        rectangles.layer = row.layer;
                        if (row.color) {
                            rectangles.color = 'rgb(' + row.color.r + ',' + row.color.g + ',' + row.color.b + ')';
                        }
                        if (row.fillColor) {
                            rectangles.fillColor = 'rgb(' + row.fillColor.r + ',' + row.fillColor.g + ',' + row.fillColor.b + ')';
                        }
                        rectangles.fillOrNot = row.fillOrNot;
                        rectangles.lineWidth = row.lineWidth;
                        rectangles.rectangle = rectangle;
                        rectangles.roundOrNot = row.roundOrNot;
                        rectangles.roundXPox = row.roundXPox;
                        rectangles.roundYPox = row.roundYPox;

                        dictRectangles[row.id] = rectangles;

                    }
                }
            }
        }
    },

    //矩形-面板
    initRectanglesPanel: function (zIndex, dictRectanglesPanel) {
        var tempRectangle;
        var _this = this;
        let timeRectanglesPanelList = []
        if (this.store.rectangles && this.store.rectangles.length) {
            for (var i = 0; i < _this.store.rectangles.length; i++) {
                if (_this.store.rectangles[i].layer == zIndex) {

                    if (_this.store.rectangles[i].rectStyle != undefined && _this.store.rectangles[i].rectStyle > 0) {
                        let svgChart = document.getElementsByClassName("svgChart");
                        let widthScale = 0, heightScale = 0;

                        // 二级弹框 showModal type
                        if (svgChart.length == 3) {
                            // 缩放适配屏幕
                            svgChart = document.getElementsByClassName("svgChart")[2];

                            let parentNode = document.getElementById('observerSecModalContainer');
                            let ObserverModalView = parentNode.children[0];
                            let obWidth = ObserverModalView.style.width,
                                obHeight = ObserverModalView.style.height;

                            widthScale = parseInt(obWidth) / _this.store.page.width,
                                heightScale = parseInt(obHeight) / _this.store.page.height;
                        } else {
                            // showModal type
                            if (svgChart.length == 2) {
                                svgChart = document.getElementsByClassName("svgChart")[1];
                                let parentNode = document.getElementById('observerModalContainer');
                                let ObserverModalView = parentNode.children[0];
                                let obWidth = ObserverModalView.style.width,
                                    obHeight = ObserverModalView.style.height;

                                widthScale = parseInt(obWidth) / _this.store.page.width,
                                    heightScale = parseInt(obHeight) / _this.store.page.height;
                            } else {
                                svgChart = document.getElementsByClassName("svgChart")[0];
                                widthScale = document.documentElement.clientWidth / _this.store.page.width,
                                    heightScale = (document.documentElement.clientHeight - 136) / _this.store.page.height;
                            }
                        }


                        var row = _this.store.rectangles[i];
                        tempRectangle = new ModelRectanglePanel(row.id, null, null);

                        tempRectangle.x = parseInt(row.x);
                        tempRectangle.y = parseInt(row.y);
                        tempRectangle.id = row.id;
                        tempRectangle.width = parseInt(row.width);
                        tempRectangle.height = parseInt(row.height);
                        tempRectangle.layer = row.layer;
                        //面板不支持自定义边框颜色
                        // if (row.color) {
                        //     rectangle.color = 'rgb(' + row.color.r + ',' + row.color.g + ',' + row.color.b + ')';
                        // }
                        if (row.fillColor) {
                            tempRectangle.fillColor = 'rgba(' + row.fillColor.r + ',' + row.fillColor.g + ',' + row.fillColor.b;
                        }
                        if (row.titleColor) {
                            tempRectangle.titleColor = 'rgb(' + row.titleColor.r + ',' + row.titleColor.g + ',' + row.titleColor.b + ')';
                        }
                        if (row.bodyColor) {
                            tempRectangle.bodyColor = 'rgb(' + row.bodyColor.r + ',' + row.bodyColor.g + ',' + row.bodyColor.b + ')';
                        }
                        if (row.descColor) {
                            tempRectangle.descColor = 'rgb(' + row.descColor.r + ',' + row.descColor.g + ',' + row.descColor.b + ')';
                        }
                        tempRectangle.fillOrNot = row.fillOrNot;
                        tempRectangle.lineWidth = row.lineWidth;
                        tempRectangle.rectangle = tempRectangle;
                        tempRectangle.roundOrNot = row.roundOrNot;
                        tempRectangle.roundXPox = row.roundXPox;
                        tempRectangle.roundYPox = row.roundYPox;
                        tempRectangle.bodySize = row.bodySize;
                        tempRectangle.descOrNot = row.descOrNot;
                        tempRectangle.descSize = row.descSize;
                        tempRectangle.title = row.title;
                        tempRectangle.titleSize = row.titleSize;
                        tempRectangle.pointList = row.pointList;
                        tempRectangle.rectStyle = row.rectStyle;

                        let pageW = this.store.page.width,
                            pageH = this.store.page.height;
                        let rectangle = tempRectangle;
                        rectangle['calW'] = tempRectangle['width'] / pageW;
                        rectangle['calX'] = tempRectangle['x'] / pageW;
                        rectangle['calH'] = tempRectangle['height'] / pageH;
                        rectangle['calY'] = tempRectangle['y'] / pageH;


                        //添加到实时刷新
                        for (var n = 0, len = row.pointList.length; n < len; n++) {
                            var point = row.pointList[n];
                            if (point.name != "") {
                                this.addElementIdIntoDictRefreshMap(point.name, this.enmuElementType.rectanglesPanel, row.id);
                            }
                        }

                        this.hitModel.add(row.id, this.enmuElementType.rectanglesPanel, row.x * widthScale, row.y * heightScale, row.width, row.height);

                        this.dictRectanglesPanel[row.id] = tempRectangle;

                        timeRectanglesPanelList.push(rectangle)

                        // 将数据初始化到HTML
                        _this.refreshRectanglePanelData(timeRectanglesPanelList)

                    }

                }
            }
        }
    },

    //添加元素id
    addElementIdIntoDictRefreshMap: function (idCom, enmuElementType, elementId) {
        if (idCom === "" || idCom === " ") {
            return
        }
        if (!this.dictRefreshMap[idCom]) {
            this.dictRefreshMap[idCom] = {
                pipelines: [],
                equipments: [],
                standardEquipments: [],
                buttons: [],
                texts: [],
                charts: [],
                gages: [],
                liquidLevels: [],
                rulers: [],
                tempDistributions: [],
                checkboxs: [],
                customControls: [],
                // MultiPointCustomControl:[],
                timePicker: [],
                fixes: [],
                polygons: [],
                rectanglesPanel: []
            };
        }
        switch (enmuElementType) {
            case this.enmuElementType.timePicker:
                this.dictRefreshMap[idCom].timePicker.push(elementId);
                break;
            case this.enmuElementType.rectanglesPanel:
                this.dictRefreshMap[idCom].rectanglesPanel.push(elementId);
                break;
            case this.enmuElementType.checkbox:
                this.dictRefreshMap[idCom].checkboxs.push(elementId);
                break;
            case this.enmuElementType.text:
                this.dictRefreshMap[idCom].texts.push(elementId);
                break;
            case this.enmuElementType.pipeline:
                this.dictRefreshMap[idCom].pipelines.push(elementId);
                break;
            case this.enmuElementType.equipment:
                this.dictRefreshMap[idCom].equipments.push(elementId);
                break;
            case this.enmuElementType.standardEquipment:
                this.dictRefreshMap[idCom].standardEquipments.push(elementId);
                break;
            case this.enmuElementType.polygon:
                this.dictRefreshMap[idCom].polygons.push(elementId);
                break;
            case this.enmuElementType.chart:
                this.dictRefreshMap[idCom].charts.push(elementId);
                break;
            case this.enmuElementType.button:
                this.dictRefreshMap[idCom].buttons.push(elementId);
                break;
            case this.enmuElementType.gage:
                this.dictRefreshMap[idCom].gages.push(elementId);
                break;
            case this.enmuElementType.liquidLevel:
                this.dictRefreshMap[idCom].liquidLevels.push(elementId);
                break;
            case this.enmuElementType.temperature:
                this.dictRefreshMap[idCom].tempDistributions.push(elementId);
                break;
            case this.enmuElementType.ruler:
                this.dictRefreshMap[idCom].rulers.push(elementId);
                break;
            case this.enmuElementType.customControl:
                this.dictRefreshMap[idCom].customControls.push(elementId);
                break;
            case this.enmuElementType.fix:
                this.dictRefreshMap[idCom].fixes.push(elementId);
                break;
            // case this.enmuElementType.MutiPointCustomControl:
            //     this.dictRefreshMap[idCom].MultiPointCustomControl.push(elementId);        
            default:
                break;
        }
    },

    //添加元素id
    addBindTypeIntoDictRefreshMap: function (idCom, enmuElementType, elementId) {
        if (!this.bindTypeDictRefreshMap[idCom])
            this.bindTypeDictRefreshMap[idCom] = {
                pipelines: [],
                equipments: [],
                standardEquipments: [],
                buttons: [],
                texts: [],
                charts: [],
                gages: [],
                liquidLevels: [],
                rulers: [],
                tempDistributions: [],
                checkboxs: [],
                customControls: [],
                timePicker: [],
                polygons: [],
                rectanglesPanel: []

            };
        switch (enmuElementType) {
            case this.enmuElementType.timePicker:
                this.bindTypeDictRefreshMap[idCom].timePicker.push(elementId);
                break;
            case this.enmuElementType.rectanglesPanel:
                this.bindTypeDictRefreshMap[idCom].rectanglesPanel.push(elementId);
                break;
            case this.enmuElementType.checkbox:
                this.bindTypeDictRefreshMap[idCom].checkboxs.push(elementId);
                break;
            case this.enmuElementType.text:
                this.bindTypeDictRefreshMap[idCom].texts.push(elementId);
                break;
            case this.enmuElementType.pipeline:
                this.bindTypeDictRefreshMap[idCom].pipelines.push(elementId);
                break;
            case this.enmuElementType.equipment:
                this.bindTypeDictRefreshMap[idCom].equipments.push(elementId);
                break;
            case this.enmuElementType.standardEquipment:
                this.bindTypeDictRefreshMap[idCom].standardEquipments.push(elementId);
                break;
            case this.enmuElementType.polygons:
                this.bindTypeDictRefreshMap[idCom].polygons.push(elementId);
                break;
            case this.enmuElementType.chart:
                this.bindTypeDictRefreshMap[idCom].charts.push(elementId);
                break;
            case this.enmuElementType.button:
                this.bindTypeDictRefreshMap[idCom].buttons.push(elementId);
                break;
            case this.enmuElementType.gage:
                this.bindTypeDictRefreshMap[idCom].gages.push(elementId);
                break;
            case this.enmuElementType.liquidLevel:
                this.bindTypeDictRefreshMap[idCom].liquidLevels.push(elementId);
                break;
            case this.enmuElementType.temperature:
                this.bindTypeDictRefreshMap[idCom].tempDistributions.push(elementId);
                break;
            case this.enmuElementType.ruler:
                this.bindTypeDictRefreshMap[idCom].rulers.push(elementId);
                break;
            case this.enmuElementType.customControl:
                this.bindTypeDictRefreshMap[idCom].customControls.push(elementId);
                break;
            case this.enmuElementType.customControl:
                this.bindTypeDictRefreshMap[idCom].customControls.push(elementId);
                break;
            default:
                break;
        }
    },


    addImageIntoRequestQueue: function (id) {
        if (this.dictImages === null) {
            // console.log(this.dictImages +'this.dictImages 为 null')
            return;
        }
        if (id == '') { return }
        if (this.dictImages != null && this.dictImages[id]) return this.dictImages[id];

        var img = new Image();
        img.src = appConfig.imageUrl + `/${id}.png`;

        var _this = this;
        img.addEventListener("load", function (e) {
            _this.indexImageLoaded++;
        });

        this.dictImages[id] = img;

        return img;
    },

    addTemplateImageIntoRequestQueue: function (id) {
        if (this.dictImages === null) {
            // console.log(this.dictImages + 'this.dictImages 为 null')
            return;
        }

        if (this.dictImages != null && this.dictImages[id]) return this.dictImages[id];


        var img = new Image();
        img.src = appConfig.TemplateImageUrl + "/template" + `/${id}.png`;
        var _this = this;
        img.addEventListener("load", function (e) {
            _this.indexImageLoaded++;
        });

        this.dictImages['template/' + id] = img;

        return img;
    },
    //报修图标获取图片
    addFixImageIntoRequestQueue: function (id) {
        if (this.dictImages === null) {
            return;
        }

        if (this.dictImages != null && this.dictImages[id]) return this.dictImages[id];


        var img = new Image();
        img.src = appConfig.TemplateImageUrl + "/fix" + `/${id}.png`;
        var _this = this;
        img.addEventListener("load", function (e) {
            _this.indexImageLoaded++;
        });

        this.dictImages['fix/' + id] = img;

        return img;
    },

    //enmu of element type
    enmuElementType: { pipeline: 0, equipment: 1, button: 2, text: 3, chart: 4, gage: 5, ruler: 6, temperature: 7, checkbox: 8, customControl: 9, timePicker: 10, standardEquipment: 11, fix: 12, polygon: 13, rectanglesPanel: 14, buttonInfo: 15 ,checkboxInfo: 16}
};

export default ObserverScreen;


