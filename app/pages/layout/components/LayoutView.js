/**
 * 框架页
 */
import React, { PropTypes } from 'react';
import { Menu, Button, Modal, Badge, Spin, Alert, Icon, message, Popover, Dropdown, Select } from 'antd';
import { Link, } from 'react-router';
import cx from 'classnames';
import { history, store } from '../../../index';
import { push } from 'react-router-redux';
import appConfig from '../../../common/appConfig'

import './Layout.global.css';
import s from './LayoutView.css';
import Timer from '../../../components/Timer';
import TimerStyle from '../../../components/TimerStyle';
import IconLabel from '../../../components/IconLabel';
import http from '../../../common/http';
import { hideModal as autoOutHideModal } from '../../modal/modules/ModalModule'
import { downloadUrl, addOperation } from '../../../common/utils';
import { modalTypes, Layout_modalTypes, RealtimeWarning_modalTypes } from '../../../common/enum';

import { closeAppWindow, minimizeAppWindow, maximizeAppWindow, splitAppWindow } from '../../../core/cmdRenderer';
import OperationRecordModal from './OperationRecordModalView';
import UserPanel from './UserPanelView';
import HistoryLayer from '../../history';
import WarningManageLayer from '../../warningManage';
import NetworkManageLayer from '../../networkManage';
import AlarmManageLayer from '../../alarm';
import RealtimeWarningModal from './RealtimeWarningModalView';
import HistoryWarningView from './HistoryWarningModalView';
import ScheduleView from './ScheduleModalView';
import SceneView from './SceneModalView'
// import TrendView from './TrendView'
import ModelManageModalView from './ModelManageModalView'
import SceneControlModalView from './SceneControlModalView'
import TimeShaft from '../containers/TimeShaftContainer'
import DateConfigModal from './DateConfigModalView'
import OptimizeValueModal from '../../modal/components/OptimizeValueModalView';
import DebugLayer from '../../debug';
import ReconnectionView from './ReconnectionModalView'
import Trend from '../../Trend/containers/TrendContainer'
import CommandLog from '../../commandLog/containers/commandLogContainer';
import repair from '../../repairManage/containers/RepairContainer'
import ModeButtonsListView from './ModeButtonsListView';
import DeviceInfo from './DeviceInfo'
import MainModal from '../../modal';
import SecModal from '../../secModal';
import MinutsWarningComponent from './MinutsWarningView';
// import RepairManageModelView from '../../repairManage/components/RepairManageModelView'
import iconLogo from '../../../themes/dark/images/icon_logo.png'
import GuaranteeAddView from './GuaranteeAddView'
import GuaranteeView from './GuaranteeView'
import GuaranteeSearchView from './GuaranteeSearchView'
import WeatherHistoryModal from './WeatherHistoryModalView'
import moment from 'moment';
const { ipcRenderer } = require('electron')
import { SSL_OP_TLS_ROLLBACK_BUG } from 'constants';
import { list } from 'postcss';

const remote = require('@electron/remote');
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuDivider = Menu.Divider;


let argv = remote.process.argv;





var timer
let str, toggleClass, toggleTitleClass;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'warning-config-best';
    toggleClass = 'best-menuList  best-ant-menu-item best-ant-menu-title';
    toggleTitleClass = 'best-content-header-menu';
} else {
    str = '';
    toggleClass = '';
    toggleTitleClass = 'content-header-menu';
}

var modeButtonsTimer, weatherTimer, omSiteVersionTimer;


//页面CSS样式定义
let selectedStyle, defaultStyle, ContentHeaderStyle, LTbtnStyle, RTcontentStyle;    //内容区顶部样式     
let headerStyle, headerStyleSpan, headerStyleLogo, rightMenuStyle, RTbtnStyle, userInfoName, weatherStyle, bestMenuStyle;  //顶部区域样式
let footerStyle, UserInfoStyle, btnStyle, iconLabelStyle;   //底部区域样式
//（css切换）判断是不是佰诗得公司
if (localStorage.getItem('serverOmd') == "best") {
    selectedStyle = {       //选中样式
        position: 'relative',
        left: '-12px',
        color: "#2ea2f8",
        height: 32,
        boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
        padding: '0 5px',
        background: "linear-gradient(RGB(130,130,130),RGB(230,230,230), RGB(80,80,80))",
        borderRadius: '3px',
    }
    //菜单栏默认
    defaultStyle = {       //默认样式
        position: 'relative',
        left: '-12px',
        height: 32,
        boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
        padding: '0 5px',
        background: "linear-gradient(RGB(196,196,196),RGB(230,230,230), RGB(120,120,120))",
        color: '#333',
        borderRadius: '3px',
    }
    bestMenuStyle = {
        marginBottom: '-3px',
        marginLeft: '-3px',
    }
    //顶部样式
    headerStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "48px",
        lineHeight: "48px",
        backgroundColor: "#fff",
    }
    weatherStyle = {
        display: 'inline-block',
        position: 'relative',
        color: "#333"
    }
    headerStyleSpan = {
        color: "#333",
        display: 'inline-block',
        margin: '0 10px'
    }
    //头部左上角logo样式
    headerStyleLogo = {
        float: "left",
        marginLeft: "10px",
        fontWeight: "bold",
        color: "#333"
    }
    //头部内容区样式
    ContentHeaderStyle = {
        height: "48px",
        lineHeight: "48px",
        background: "linear-gradient(RGB(250,250,250), RGB(134,134,134))",
        position: "absolute",
        borderTop: "1px solid RGB(200,200,200)",
        top: 0,
        left: 0,
        right: 0
    }
    //底部样式
    footerStyle = {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "48px",
        lineHeight: "48px",
        borderTop: "1px solid RGB(215,215,215)",
        background: "linear-gradient(RGB(250,250,250), RGB(180,180,180))",
        zIndex: 1000
    }
    //用户信息
    UserInfoStyle = {
        width: "60px",
        textAlign: "center",
        color: "#333",
        display: "inline-block",
        marginLeft: "16px"
    }
    //按钮样式
    btnStyle = {
        background: "#E1E1E1",
        boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
        border: 0,
        color: "#333",
        fontSize: "12px"

    }
    //右上角图标样式
    RTbtnStyle = {
        background: "RGB(133,133,133)",
        textShadow: "1px 1px 2px black,-1px -1px 2px white",
        border: 0,
        marginLeft: '6px'
    }
    //左上角图标样式
    LTbtnStyle = {
        background: "RGB(133,133,133)",
        textShadow: "1px 1px 2px black,-1px -1px 2px white",
        boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
        border: 0
    }
    //右上角内容区侧边栏字体样式
    RTcontentStyle = {
        color: "RGB(33,33,33)",
        fontSize: "13px",
        marginRight: "-3px"
    }
    //时间图标样式
    iconLabelStyle = {
        color: "#333"
    }
    //右上侧边栏样式
    rightMenuStyle = {
        background: "linear-gradient(RGB(250,250,250), RGB(134,134,134))",
        borderBottom: 0,
        borderLeft: "1px solid RGB(99,99,99)",
        height: "55px",
        lineHeight: "55px"
    }
    //二级菜单样式
    // menuListStyle={

    // }
    userInfoName = {
        margin: '0 5px',
        color: "#333"
    }

} else {
    bestMenuStyle = {}
    selectedStyle = {       //选中样式
        borderBottom: '2px solid #3485FF',
        height: 32
    }
    defaultStyle = {       //默认样式
        borderBottom: '2px solid transparent',
        height: 32
    }
    headerStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "48px",
        lineHeight: "48px",
        color: '#aaa'
    }
    headerStyleSpan = {
        display: 'inline-block',
        margin: '0 10px'
    }
    weatherStyle = {
        display: 'inline-block',
        position: 'relative'
    }
    headerStyleLogo = {
        float: "left",
        marginLeft: "10px",
        fontWeight: "bold"
    }
    ContentHeaderStyle = {
        height: "48px",
        lineHeight: "48px",
        background: "#273142",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
    }
    footerStyle = {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "48px",
        lineHeight: "60px",
        borderTop: "1px solid #313d4f",
        background: "#1b2431",
        zIndex: 1000
    }
    UserInfoStyle = {
        width: "60px",
        textAlign: "center",
        display: "inline-block",
        marginLeft: "16px"
    }
    RTbtnStyle = {
        marginLeft: '10px'
    }
    userInfoName = {
        margin: '0 10px'
    }

}

let containerClass, contentClass, contentTimeClass, dropdownClass, btnClass, btnDangerClass
if (localStorage.getItem('serverOmd') == "persagy") {
    containerClass = 'persagy-container'
    contentClass = 'persagy-content'
    contentTimeClass = 'persagy-content-Time'
    ContentHeaderStyle = {
        height: "48px",
        lineHeight: "48px",
        position: "absolute",
        borderTop: "1px solid RGB(200,200,200)",
        borderBottom: "1px solid RGB(200,200,200)",
        top: 0,
        left: 0,
        right: 0,
        fontFamily: 'MicrosoftYaHei',
        color: 'rgba(31,35,41,1)',
        background: 'rgba(247,249,250,1)'
    }
    headerStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "48px",
        lineHeight: "48px",
        background: '#fff'
    }
    headerStyleLogo = {
        float: "left",
        marginLeft: "38px",
        fontWeight: "bold"
    }
    RTbtnStyle = {
        backgroundColor: 'rgba(255,255,255,1)',
        border: 'none',
        color: '#aaa',
        marginLeft: '10px'
    }
    LTbtnStyle = {
        backgroundColor: 'rgba(255,255,255,1)',
        border: 'none',
        color: '#aaa'
    }
    toggleTitleClass = 'persagy-content-header-menu'
    dropdownClass = 'persagy-layout-dropDown'
    btnClass = 'persagy-layout-btn'
    btnDangerClass = 'persagy-layout-btn-danger'
    toggleClass = 'persagy-layout-menu';
} else {
    if (localStorage.getItem('serverOmd') == "best") {
        containerClass = 'best-container'
        contentClass = 'content'
        contentTimeClass = 'content-Time'
    } else {
        containerClass = 'container'
        contentClass = 'content'
        contentTimeClass = 'content-Time'
    }
}


const closeWindow = (dashboardPages) => {
    Modal.confirm({
        title: '是否确认退出应用？',
        content: '点击“确定”按钮退出应用程序。',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
            clearLine(dashboardPages)
        }
    });
}

//当关闭软件时，清空有关仪表盘的所有localStorage
const clearLine = (dashboardPages) => {
    // console.log(dashboardPages)
    if (dashboardPages.length != 0) {
        dashboardPages.map(row => {
            if (localStorage[row]) {
                window.localStorage.removeItem(row)
            }
        })
    }
    if (localStorage['linePointDict']) {
        window.localStorage.removeItem('linePointDict')
    }
    if (localStorage['requestPoints']) {
        window.localStorage.removeItem('requestPoints')
    }
    //删除历史曲线的缓存时间段
    if (localStorage['historyTimeStart']) {
        window.localStorage.removeItem('historyTimeStart')
    }
    if (localStorage['historyTimeEnd']) {
        window.localStorage.removeItem('historyTimeEnd')
    }
    //删除缓存天数
    if (localStorage['leftday']) {
        window.localStorage.removeItem('leftday')
    }

    //删除项目所以点名清单
    if (localStorage['allPointList']) {
        window.localStorage.removeItem('allPointList')
    }

    //删除否是显示天气的配置
    if (localStorage['weatherDis']) {
        window.localStorage.removeItem('weatherDis')
    }

    //删除缓存的项目代号
    if (localStorage['projectName_en']) {
        window.localStorage.removeItem('projectName_en')
    }

    //删除缓存的公司名
    if (localStorage['serverOmd']) {
        window.localStorage.removeItem('serverOmd')
    }

    //删除缓存的简易动画
    if (localStorage['animation']) {
        window.localStorage.removeItem('animation')
    }

    //删除缓存的设备点名
    if (localStorage['selectEquipment']) {
        window.localStorage.removeItem('selectEquipment')
    }
    //删除缓存的设备铭牌信息
    if (localStorage['deviceDetails']) {
        window.localStorage.removeItem('deviceDetails')
    }

    //删除缓存的图标偏移字段
    if (localStorage['animation_icon_move']) {
        window.localStorage.removeItem('animation_icon_move')
    }

    //删除缓存的图标偏移字段
    if (localStorage['projectRightsDefine']) {
        window.localStorage.removeItem('projectRightsDefine')
    }

    //删除缓存的操作记录筛选按钮信息
    if (localStorage['operationBtnInfo']) {
        window.localStorage.removeItem('operationBtnInfo')
    }

    //删除缓存的om标题信息
    if (localStorage['omTitle']) {
        window.localStorage.removeItem('omTitle')
    }

    //删除缓存的分屏页面id
    if (localStorage['splitPageId']) {
        window.localStorage.removeItem('splitPageId')
    }
    //删除初始化窗口需要跳转到首页的标记
    if (localStorage['creatAppWindow']) {
        localStorage.removeItem('creatAppWindow');
    }
    //删除屏幕宽度标记（用于判断显示最大化/向下恢复按钮样式）
    if (localStorage['maxBtn']) {
        localStorage.removeItem('maxBtn');
    }

    //删除页面红色闪烁报警的缓存字段信息
    if (localStorage['pagesRedWarning']) {
        window.localStorage.removeItem('pagesRedWarning')
    }
    if (localStorage['WarningPages']) {
        window.localStorage.removeItem('WarningPages')
    }
    //删除网络架构里的离线列表
    if (localStorage['netDeviceDropWarningList']) {
        window.localStorage.removeItem('netDeviceDropWarningList')
    }

    //删除网络架构里的在线列表
    if (localStorage['netDeviceOnlineList']) {
        window.localStorage.removeItem('netDeviceOnlineList')
    }


    //删除网络架构里的 无法判断状态的列表
    if (localStorage['netDeviceUnclearList']) {
        window.localStorage.removeItem('netDeviceUnclearList')
    }

    //删除初始化页面id
    if (String(localStorage['initPageId'])) {
        localStorage.removeItem('initPageId');
    }

    //删除初始化回放数据开始时间
    if (localStorage['historyStartTime']) {
        localStorage.removeItem('historyStartTime');
    }

    //删除缓存的当前页面信息
    if (localStorage['selectedPageName']) {
        localStorage.removeItem('selectedPageName');
    }
    if (localStorage['selectedPageId']) {
        localStorage.removeItem('selectedPageId');
    }

    //删除通用组件报表页面的数据
    if (localStorage['reportRange'] || localStorage['reportSpan'] || localStorage['energyFee'] || localStorage['energyFeeData'] || localStorage['energyFeePrice'] || localStorage['energyFeeHeader']) {
        window.localStorage.removeItem('reportRange');
        window.localStorage.removeItem('reportSpan');
        window.localStorage.removeItem('energyFee');
        window.localStorage.removeItem('energyFeeData');
        window.localStorage.removeItem('energyFeePrice');
        window.localStorage.removeItem('energyFeeHeader');
    }
    //退出软件

    if (argv.length > 14 && argv[argv.length - 6] == "-count") {
        var start1 = require('child_process').exec("taskkill /im OM.exe /f")

    } else {
        addOperation('/operationRecord/addLogin', {
            "userName": JSON.parse(localStorage.getItem('userData')).name,
            "type": 0,
            "address": '',
            "lang": "zh-cn"
        }, '用户登出记录')
        setTimeout(function () {
            closeAppWindow()
        }, 500)
    }


}

export const closeApp = () => {
    clearLine([])
}

const handleAlarmBtn = (toggleAlarmModal, renderList) => {
    if (JSON.parse(localStorage.getItem('userData')).role >= 2) {
        toggleAlarmModal()
        renderList()
    } else {
        Modal.info({
            title: '提示',
            content: '用户权限不足'
        })
    }
}

const handleWarningBtn = (toggleWarningManageModal) => {
    if (JSON.parse(localStorage.getItem('userData')).role >= 2) {
        toggleWarningManageModal()
    } else {
        Modal.info({
            title: '提示',
            content: '用户权限不足'
        })
    }
}

const handleNetworkBtn = (toggleNetworkManageModal) => {
    if (JSON.parse(localStorage.getItem('userData')).role >= 2) {
        toggleNetworkManageModal()
    } else {
        Modal.info({
            title: '提示',
            content: '用户权限不足'
        })
    }
}

//顶部导航菜单组件
class MenuComponent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            //选中的key
            selectedKeys: ''
        }

        this.goFullPage = this.goFullPage.bind(this);
        // this.getDebugBtn = this.getDebugBtn.bind(this);
        // this.getDashboardBtn = this.getDashboardBtn.bind(this);
        this.reload = this.reload.bind(this);
        this.getHomeId = this.getHomeId.bind(this);
        this.handleClickMenucxMenu = this.handleClickMenucxMenu.bind(this);
        this.handleClickAssetManage = this.handleClickAssetManage.bind(this);
        this.handleClickMenuhistoryMenu = this.handleClickMenuhistoryMenu.bind(this);
        this.handleClickMenuDashboardMenu = this.handleClickMenuDashboardMenu.bind(this);
        this.handleClickMenuCalendarMenu = this.handleClickMenuCalendarMenu.bind(this);
        this.handleClicRepairkMenu = this.handleClicRepairkMenu.bind(this);
        this.handleClickAlarmSystemMenu = this.handleClickAlarmSystemMenu.bind(this);
        this.handleClickEnergyManageMenu = this.handleClickEnergyManageMenu.bind(this);
        this.handleClickMenuScriptRuleMenu = this.handleClickMenuScriptRuleMenu.bind(this);
        this.handleClickMenuAIRuleMenu = this.handleClickMenuAIRuleMenu.bind(this);
    }

    componentDidMount() {
        this.props.initialize(true);
        //将组件内的方法封装
        this.props.updateFullPage({
            goFullPage: this.goFullPage
        });
        let diffMenus = true
        if (String(localStorage.getItem('initPageId')) && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {
            if (localStorage.getItem('initPageId') == '策略管理' ||
                localStorage.getItem('initPageId') == '数据管理' ||
                localStorage.getItem('initPageId') == '数据导入管理' ||
                localStorage.getItem('initPageId') == '报表进度管理' ||
                localStorage.getItem('initPageId') == '点位监控' ||
                localStorage.getItem('initPageId') == '日志信息' ||
                localStorage.getItem('initPageId') == '全局配置' ||
                localStorage.getItem('initPageId') == '策略指令查询') {
                this.setState({
                    selectedKeys: 'cxMenu'
                });
                history.push('systemToolCx')
            } else {
                this.setState({
                    selectedKeys: String(localStorage.getItem('initPageId'))
                });
                this.reload(String(localStorage.getItem('initPageId')), diffMenus);
            }
        } else {
            if (this.props.menus && this.props.gMenusFlag && this.props.menus.length != 0) { //有二级菜单，菜单数据结构不同
                this.setState({
                    selectedKeys: this.props.menus[0].pageList[0]['id']
                });
            } else {
                if (this.props.menus.length != 0) {
                    this.setState({
                        selectedKeys: this.props.menus[0]['id']
                    });
                }
            }
        }
        if (localStorage.getItem('historyStartTime') && localStorage.getItem('historyStartTime') != '' && localStorage.getItem('historyStartTime') != null) {
            setTimeout(() => {
                this.props.historyStart()
            }, 1000)
        }
        timer = setInterval(function () {
            http.get('/static/files/om/omsite.txt').then(
                res => {
                    if (res.version) {
                        if (res.version != appConfig.project.version) {
                            Modal.destroyAll();
                            Modal.confirm({
                                title: '发现OM软件有新版本',
                                content: '点击"确定"按钮开始下载新版本OM(安装时需关闭所有已运行的OM软件)',
                                onOk() {
                                    downloadUrl(`${appConfig.serverUrl}/static/files/om/omsite-setup.exe`)
                                },
                                onCancel() {

                                }
                            })
                        }
                    }
                }
            )
        }, 4 * 60 * 60 * 1000)

    }
    componentWillReceiveProps(nextProps) {
        let diffMenus = true
        //gMenusFlag为true即有二级菜单
        if (nextProps.gMenusFlag) {
            if (this.props.menus.length !== nextProps.menus.length) {
                const { menus } = nextProps

                if (localStorage.getItem('splitPageId') != undefined && localStorage.getItem('splitPageId') != "") {
                    this.setState({
                        selectedKeys: String(localStorage.getItem('splitPageId'))
                    });
                    this.reload(String(localStorage.getItem('splitPageId')), diffMenus);
                } else {
                    if (String(localStorage.getItem('initPageId')) && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {

                    } else {
                        for (var m = 0; m < menus.length; m++) {
                            for (var n = 0; n < menus[m].pageList.length; n++) {
                                if (menus[m].pageList[n]['id'] == this.state.selectedKeys) {
                                    return
                                }
                            }
                        }
                        this.setState({
                            selectedKeys: menus[0].pageList[0] && menus[0].pageList[0]['id']
                        });
                        this.reload(menus[0].pageList[0]['id'], diffMenus);
                    }
                }
                return
            } else {
                for (let i = 0; i < this.props.menus.length; i++) {
                    if (this.props.menus[i].pageList.length != nextProps.menus[i].pageList.length) {
                        const { menus } = nextProps
                        for (var m = 0; m < menus.length; m++) {
                            for (var n = 0; n < menus[m].pageList.length; n++) {
                                if (menus[m].pageList[n]['id'] == this.state.selectedKeys) {
                                    return
                                }
                            }
                        }
                        this.setState({
                            selectedKeys: menus[0].pageList[0] && menus[0].pageList[0]['id']
                        });
                        this.reload(menus[0].pageList[0]['id'], diffMenus);
                        return
                    } else {
                        for (let j = 0; j < this.props.menus[i].pageList.length; j++) {
                            if (this.props.menus[i].pageList[j].id != nextProps.menus[i].pageList[j].id) {
                                const { menus } = nextProps
                                for (var m = 0; m < menus.length; m++) {
                                    for (var n = 0; n < menus[m].pageList.length; n++) {
                                        if (menus[m].pageList[n]['id'] == this.state.selectedKeys) {
                                            return
                                        }
                                    }
                                }
                                this.setState({
                                    selectedKeys: menus[0].pageList[0] && menus[0].pageList[0]['id']
                                });
                                this.reload(menus[0].pageList[0]['id'], diffMenus);
                                return
                            }
                        }
                    }
                }
            }

        } else {
            //一级菜单
            if (this.props.menus.length !== nextProps.menus.length) {
                const { menus } = nextProps
                if (localStorage.getItem('initPageId') && localStorage.getItem('initPageId') != '' && localStorage.getItem('initPageId') != null) {
                    this.setState({
                        selectedKeys: String(localStorage.getItem('initPageId'))
                    });
                    this.reload(String(localStorage.getItem('initPageId')), diffMenus);
                } else {
                    this.setState({
                        selectedKeys: menus[0] && menus[0]['id']
                    });
                    this.reload(menus[0]['id'], diffMenus);
                }

            }
        }
    }

    componentWillUnmount() {
        clearInterval(timer)
    }



    //用户切换菜单的时候保存并修改选中的key
    handleSelectMenuItem(item) {
        const { bShowTimeShaft, updateTimeshaftState } = this.props
        this.props.hideLayer()

        //更新超时退回时间

        if (bShowTimeShaft && typeof updateTimeshaftState.stopPlayer === 'function') {
            updateTimeshaftState.stopPlayer()
        }

        this.setState({
            selectedKeys: item.key
        })
    }

    getMenuGroup(pageList, selectedKeys) {
        if (pageList.map) {
            let warningPageColor = ""
            return pageList.map(menu => {
                warningPageColor = ""
                if (localStorage.getItem('pagesRedWarning') && localStorage.getItem('pagesRedWarning') == 1) {
                    if (localStorage.getItem('WarningPages')) {
                        let List = localStorage.getItem('WarningPages')
                        List = List.split(",")
                        for (let i = 0; i < List.length; i++) {
                            if (menu.id == List[i]) {
                                warningPageColor = "warningPageColor"
                            }
                        }
                    }
                }
                if (menu['id'] == this.state.selectedKeys) {
                    localStorage.setItem('selectedPageName', menu['name'])
                    localStorage.setItem('selectedPageId', menu['id'])
                }
                return (<MenuItem
                    key={menu['id']}
                    disabled={this.props.loading}
                    style={bestMenuStyle}
                >
                    <Link to={"/observer/" + menu['id']}>
                        <div style={menu.id == selectedKeys ? selectedStyle : defaultStyle}>
                            <span className={warningPageColor}>{menu['name']}</span>
                        </div>
                    </Link>
                </MenuItem>)
            }
            );
        }
    }

    getMenuList(menus) {
        //let selectedKeys = this.state ? this.state.selectedKeys : menus[0].id
        const { selectedKeys } = this.state
        let menuListNum = 6; //菜单名字最长字符数
        let pageListArr = [];
        //判断pageList存在兼容一级菜单
        if (this.props.menus.pageList) {
            for (let i = 0; i < this.props.menus.length; i++) {
                pageListArr.push(this.props.menus[i].groupName)
                for (let j = 0; j < this.props.menus[i].pageList.length; j++) {
                    pageListArr.push(this.props.menus[i].pageList[j].name)
                }
            }
            for (let i = 0; i < pageListArr.length; i++) {
                if (pageListArr[i].length >= menuListNum) {
                    menuListNum = pageListArr[i].length;
                }
            }
        }

        if (localStorage.getItem('serverOmd') == "best") {
            //菜单栏选中
            selectedStyle = {       //选中样式
                position: 'relative',
                left: '-12px',
                color: "#2ea2f8",
                height: 40,
                boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
                padding: '0 5px',
                background: "linear-gradient(RGB(130,130,130),RGB(230,230,230), RGB(80,80,80))",
                borderRadius: '3px',
            }
            //菜单栏默认
            defaultStyle = {       //默认样式
                position: 'relative',
                left: '-12px',
                height: 40,
                boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
                padding: '0 5px',
                background: "linear-gradient(RGB(196,196,196),RGB(230,230,230), RGB(120,120,120))",
                color: '#333',
                borderRadius: '3px',
            }
        }
        let warningColor = ""
        if (this.props.menus && this.props.gMenusFlag) {
            return this.props.menus.map(group => {
                warningColor = ""
                if (localStorage.getItem('pagesRedWarning') && localStorage.getItem('pagesRedWarning') == 1) {
                    let List = []
                    if (localStorage.getItem('WarningPages')) {
                        List = localStorage.getItem('WarningPages').split(",")
                    } else {
                        List = []
                    }
                    for (let i = 0; i < group.pageList.length; i++) {
                        for (let j = 0; j < List.length; j++) {
                            if (group.pageList[i].id == List[j]) {
                                warningColor = 'warningColor'
                                break;
                            }
                        }
                    }
                }
                if (localStorage.getItem('serverOmd') == "best") {
                    return (
                        <SubMenu title={group.groupName} disabled={this.props.loading} popupClassName="best-menu" className={toggleClass}>
                            {this.getMenuGroup(group.pageList, selectedKeys)}
                        </SubMenu>
                    )
                } else {
                    return (
                        <SubMenu title={group.groupName} disabled={this.props.loading} className={warningColor}>
                            {this.getMenuGroup(group.pageList, selectedKeys)}
                        </SubMenu>
                    )
                }
            });
        } else {
            return menus.map(menu => (
                <MenuItem
                    key={menu['id']}
                    disabled={this.props.loading}
                    className={toggleClass}
                >
                    <Link to={"/observer/" + menu['id']}>
                        <div style={menu.id == selectedKeys ? selectedStyle : defaultStyle} disabled={this.props.loading}>
                            {menu['name']}
                        </div>
                    </Link>
                </MenuItem>
            ));
        }
    }

    goFullPage(pageId) {
        this.setState({
            selectedKeys: parseInt(pageId)
        });
        // console.log("layoutview 548hang,",pageId)
        history.push("/observer/" + pageId);
        console.log("dora【goFullPage】")
    }

    gobackHome(menus, gMenusFlag) {
        if (gMenusFlag && menus[0].pageList[0]) {
            let key = menus[0].pageList[0]['id']
            this.setState({
                selectedKeys: key
            })
        } else {
            if (menus[0] != undefined) {
                this.setState({
                    selectedKeys: menus[0]['id']
                })
            }
        }
    }
    //右侧菜单栏选中事件
    handleClickMenucxMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "cxMenu"
            })
        }
    }
    handleClickAssetManage() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "assetMenu"
            })
        }
    }
    handleClickMenuhistoryMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "historyMenu"
            })
        }
    }
    handleClickAlarmSystemMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "AlarmSystem"
            })
        }
    }
    handleClickEnergyManageMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "EnergyManage"
            })
        }
    }
    handleClickMenuDashboardMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "DashboardMenu"
            })
        }
    }
    handleClickMenuScriptRuleMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "ScriptRuleMenu"
            })
        }
    }
    handleClickMenuAIRuleMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "AIRuleMenu"
            })
        }
    }
    handleClickMenuCalendarMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "CalendarMenu"
            })
        }
    }
    handleClicRepairkMenu() {
        const { bShowTimeShaft } = this.props;
        if (bShowTimeShaft == false) {
            this.setState({
                selectedKeys: "RepairManage"
            })
        }
    }
    // //调试界面菜单选项
    //   getDebugBtn(){
    //     const {bShowTimeShaft} = this.props
    //     let userData = JSON.parse(window.localStorage.getItem('userData'))
    //     if(userData.role >= 3){
    //       return (
    //         <MenuItem key="cxMenu" >
    //           <Link to={"systemToolCx/"} style={RTcontentStyle} 
    //           onClick = {(e)=>{
    //             if(bShowTimeShaft){
    //               e.preventDefault();
    //               Modal.info({
    //                 title: '温馨提示',
    //                 content: (
    //                   <div>
    //                     <p>如果想要进入系统管理，请先点击数据回放按钮，退出回放功能。</p>
    //                   </div>
    //                 ),
    //               });
    //             }
    //           }}>
    //             <Icon type="appstore" />系统管理 
    //           </Link>
    //         </MenuItem>
    //       )
    //     }
    //     return ''
    //   }

    //   //仪表盘菜单选项最高权限显示
    //   getDashboardBtn(){
    //     const {bShowTimeShaft} = this.props
    //     let userData = JSON.parse(window.localStorage.getItem('userData'))
    //     if(userData.role >= 3){
    //       return (
    //         <MenuItem key="DashboardMenu" >
    //           <Link to={"systemToolDashboard/"} style={RTcontentStyle}
    //           onClick = {(e)=>{
    //             if(bShowTimeShaft){
    //               e.preventDefault();
    //               Modal.info({
    //                 title: '温馨提示',
    //                 content: (
    //                   <div>
    //                     <p>如果想要进入仪表盘，请先点击数据回放按钮，退出回放功能。</p>
    //                   </div>
    //                 ),
    //               });
    //             }
    //           }}>
    //             <Icon type="appstore" />仪表盘
    //           </Link>
    //         </MenuItem>
    //       )
    //     }
    //     return ''
    //   }


    //重新刷新页面
    reload(pageId, diffMenus) {
        localStorage.removeItem('splitPageId')
        let key = pageId;
        //强制刷新-重新获取项目所有点的释义信息
        http.get('/analysis/get_pointList_from_s3db/1/50000')
            .then(
                data => {
                    if (data.status === 'OK') {
                        var pointList = [].concat(data['data']['pointList']);
                        localStorage.setItem('allPointList', JSON.stringify(pointList));
                    }
                    //如果是二级菜单的话，需要重构id结构
                    for (pageId in this.props.menus) {
                        if (diffMenus) {
                            if (localStorage.getItem("FaultPage") && localStorage.getItem("FaultPage") == 1) {
                                console.log('切换用户时,不自动登出到首页')
                            } else {
                                if (key == 'cxMenu') {

                                } else {
                                    if (localStorage.getItem("ModalOnOff") && localStorage.getItem("ModalOnOff") == 1) {
                                        store.dispatch(autoOutHideModal())
                                        history.push("/observer/" + key);
                                        console.log("dora【reload1】")
                                    } else {
                                        history.push("/observer/" + key);
                                        console.log("dora【reload2】")
                                    }
                                }
                            }
                        } else {
                            http.get('/updatePageContentIntoRedis/' + key)
                                .then(
                                    dataPage => {
                                        if (dataPage.err) {
                                            console.error(dataPage.msg);
                                        } else {
                                            this.props.parmsDict.renderScreen(key);
                                        }
                                    }
                                ).catch(
                                    error => {
                                        console.error('更新页面失败!');
                                        this.props.parmsDict.renderScreen(key);
                                    }
                                )
                        }
                        return;
                    }

                    if (key != 'undefined') {
                        if (this.props.parmsDict.renderScreen != undefined) {
                            http.get('/updatePageContentIntoRedis/' + key)
                                .then(
                                    dataPage => {
                                        if (dataPage.err) {
                                            console.error(dataPage.msg);
                                        } else {
                                            this.props.parmsDict.renderScreen(key);
                                        }
                                    }
                                ).catch(
                                    error => {
                                        console.error('更新页面失败!');
                                        this.props.parmsDict.renderScreen(key);
                                    }
                                )
                            return;
                        }
                    }
                }
            ).catch(
                error => {
                    console.error('获取点名清单失败!');

                    //如果是二级菜单的话，需要重构id结构
                    for (pageId in this.props.menus) {
                        if (diffMenus) {
                            if (localStorage.getItem("ModalOnOff") && localStorage.getItem("ModalOnOff") == 1) {
                                store.dispatch(autoOutHideModal())
                                history.push("/observer/" + key);
                                console.log("dora【reload3】")
                            } else {
                                history.push("/observer/" + key);
                                console.log("dora【reload4】")
                            }
                        } else {
                            this.props.parmsDict.renderScreen(key);
                        }
                        return;
                    }
                    if (key != 'undefined') {
                        if (this.props.parmsDict.renderScreen != undefined) {
                            this.props.parmsDict.renderScreen(key);
                            return;
                        }
                    }
                }
            );

        http.post('/project/getConfigMul', {
            keyList: [
                "energy_management_define",
                "expert_optimize_config"
            ]
        }).then(data => {
            //标准能管管理配置
            if (data.data && data.data.energy_management_define != undefined) {
                localStorage.setItem('energyManagementDefine', JSON.stringify(data.data.energy_management_define));
            } else {
                localStorage.setItem('energyManagementDefine', null);
            }
            //获取专家优化调试学习表配置
            if (data.data && data.data.expert_optimize_config != undefined) {
                localStorage.setItem('expertOptimizeConfig', JSON.stringify(data.data.expert_optimize_config));
            } else {
                localStorage.setItem('expertOptimizeConfig', null);
            }
        })
    }

    getHomeId(menus, gMenusFlag) {
        if (menus[0] && gMenusFlag) {
            return "/observer/" + menus[0].pageList[0]['id']
        } else {
            if (menus[0]) {
                return "/observer/" + menus[0]['id']
            } else return ''
        }
    }

    render() {
        const { menus, initialize, parmsDict, gMenusFlag, bShowTimeShaft } = this.props
        return (
            <div>
                <div className={s['content-header-btns']}>
                    {/* <img style={{height:"56px",float:"left"}} src='http://ww1.sinaimg.cn/large/006nKxLmgy1fxehr1t8u5j308x08xaa0.jpg' /> */}
                    <img style={{ height: "48px", float: "left", display: `${window.localStorage.getItem('logoURL') != null && window.localStorage.getItem('logoURL') != "" && window.localStorage.getItem('logoURL') != "undefined" ? "block" : "none"}` }} src={window.localStorage.getItem('logoURL') !== null && window.localStorage.getItem('logoURL') !== "" ? `http:\/\/${localStorage.getItem('serverUrl')}${localStorage.getItem('logoURL')}` : ""} />
                    <Link to={this.getHomeId(menus, gMenusFlag)} >
                        <Button
                            style={LTbtnStyle}
                            icon="home"
                            onClick={() => { this.gobackHome(menus, gMenusFlag) }}
                        />
                    </Link>
                    <Button style={LTbtnStyle} icon="reload" onClick={() => {
                        if (this.state.selectedKeys == "ScriptRuleMenu") {
                            this.props.scriptRefreshAll();
                            return;
                        }
                        parmsDict.closeObserver && parmsDict.closeObserver();

                        this.props.initialize(false);
                        this.props.updateFullPage({
                            goFullPage: this.goFullPage
                        });
                        if (this.props.menus.length == 0) {
                            // message.info('正在请求菜单栏数据')
                            // return this.props.initialize();
                        }
                        this.reload(this.state.selectedKeys);
                    }} />
                    {/* <Button style={LTbtnStyle} type="danger" icon="close" size="large" onClick={ ()=> this.props.closeWindow(this.props.dashboardPages) } /> */}
                </div>
                <Menu
                    className={s[`${toggleTitleClass}`]}
                    theme="dark"
                    mode="horizontal"
                    onSelect={(item) => { this.handleSelectMenuItem(item) }}
                    style={{ zIndex: '999', marginTop: gMenusFlag == false ? '-15px' : '' }}
                    selectedKeys={[String(this.state.selectedKeys && this.state.selectedKeys.toString())]}
                >
                    {this.getMenuList(menus, gMenusFlag)}
                </Menu>
                {/* <div className={s['content-header-rightMenu']}>
            <Menu
                style={rightMenuStyle}
                onClick={this.handleClickMenu}
                selectedKeys={[this.state.selectedKeys && this.state.selectedKeys.toString()]}
                mode="horizontal"
            >
                {this.getDebugBtn()}
                <MenuItem key="historyMenu" >
                <Link to={"systemToolHistoryCurve/"} style={RTcontentStyle}
                onClick = {(e)=>{
                    if(bShowTimeShaft){
                    e.preventDefault();
                    Modal.info({
                        title: '温馨提示',
                        content: (
                        <div>
                            <p>如果想要进入历史曲线，请先点击数据回放按钮，退出回放功能。</p>
                        </div>
                        ),
                    });
                    }
                }}>
                    <Icon type="appstore" />历史曲线
                </Link>
                </MenuItem>
                {this.getDashboardBtn()}
                <MenuItem key="CalendarMenu" >
                <Link to={"systemToolCalender/"} style={RTcontentStyle}
                onClick = {(e)=>{
                    if(bShowTimeShaft){
                    e.preventDefault();
                    Modal.info({
                        title: '温馨提示',
                        content: (
                        <div>
                            <p>如果想要进入日历，请先点击数据回放按钮，退出回放功能。</p>
                        </div>
                        ),
                    });
                    }
                }}>
                    <Icon type="appstore" />日历
                </Link>
                </MenuItem>
                
            </Menu>
         </div> */}
            </div>
        )
    }
}

//主界面设备开关统一模态框
class UnifyModal extends React.PureComponent {

    btnControl() {
        const {
            operateSwitch,
            switchHide,
            operateData,
        } = this.props

        if (operateData.description.trim() == '') {
            operateData.description = '将点位 ' + operateData.idCom + ' 的值修改为 ' + operateData.setValue
        }

        if (operateData.preCheckScript == undefined || operateData.preCheckScript == '') {
            operateSwitch(
                operateData.idCom,
                operateData.setValue,
                operateData.description,
                operateData.downloadEnableCondition,
                operateData.downloadURL,
                operateData.checkDownLoadEnable,
                operateData.unsetValue,
            )
        } else {
            http.post('/tool/evalStringExpression', {
                "str": operateData.preCheckScript,  // 脚本
                "mode": "1"  //  0:表示计算历史某个时刻, 1表示计算实时
            }).then(
                res => {
                    if (res.err == 0 && res.data == 0) {
                        Modal.confirm({
                            title: operateData.preCheckScriptDescription,
                            content: '点击确认可继续执行指令',
                            onOk() {
                                operateSwitch(
                                    operateData.idCom,
                                    operateData.setValue,
                                    operateData.description,
                                    operateData.downloadEnableCondition,
                                    operateData.downloadURL,
                                    operateData.checkDownLoadEnable,
                                    operateData.unsetValue,
                                )
                            },
                            onCancel() {
                                switchHide()
                            },
                        });
                    } else {
                        operateSwitch(
                            operateData.idCom,
                            operateData.setValue,
                            operateData.description,
                            operateData.downloadEnableCondition,
                            operateData.downloadURL,
                            operateData.checkDownLoadEnable,
                            operateData.unsetValue,
                        )
                    }
                }
            ).catch(
                err => {
                    operateSwitch(
                        operateData.idCom,
                        operateData.setValue,
                        operateData.description,
                        operateData.downloadEnableCondition,
                        operateData.downloadURL,
                        operateData.checkDownLoadEnable,
                        operateData.unsetValue,
                    )
                }
            )
        }
        // Modal.confirm({
        //     title: 'Do you Want to delete these items?',
        //     content: 'Some descriptions',
        //     onOk() {

        //     },
        //     onCancel() {
        //       console.log('Cancel');
        //     },
        // });

    }

    render() {
        const {
            operateModalVisible,
            switchHide,
            operateSwitch,
            conditionDict,
            operateIsLoading,
            operateData,
            checkboxSetting,
            checkboxHide
        } = this.props

        //conditionDict dict
        // operateData dict

        if (Layout_modalTypes.ONE_KEY_OPERATE_MODAL === operateModalVisible) {
            return (
                <Modal
                    title={operateIsLoading ? '指令设置进度提示' : '确认指令'}
                    visible={true}
                    onCancel={switchHide}
                    maskClosable={false}
                    wrapClassName={str}
                    footer={
                        operateIsLoading ?
                            [<Button onClick={() => {
                                if (operateData.description.trim() == '') {
                                    operateData.description = '将点位 ' + operateData.idCom + ' 的值修改为 ' + operateData.setValue
                                }
                                operateSwitch(
                                    operateData.idCom,
                                    operateData.setValue,
                                    operateData.description,
                                    operateData.downloadEnableCondition,
                                    operateData.downloadURL,
                                    operateData.checkDownLoadEnable
                                )
                            }
                            }>确认</Button>]
                            :
                            [
                                <Button onClick={switchHide} >取消</Button>,
                                <Button onClick={() => this.btnControl()}>确认</Button>
                            ]
                    }
                >
                    {
                        operateIsLoading ?
                            <Spin tip={conditionDict.status ? (operateData.description.trim() != '' ? `正在${operateData.description}` : `正在将点位 ${operateData.idCom} 的值设置为 ${operateData.setValue}`) : conditionDict.description}>
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <div>
                                {
                                    operateData.description.trim() != '' ?
                                        <span>确定要 {operateData.description} 吗?</span>
                                        :
                                        <span>确定要将点位 {operateData.idCom} 的值设置为 {operateData.setValue} 吗?</span>
                                }
                            </div>
                    }
                </Modal>
            )
        } else if (Layout_modalTypes.CHECKBOX_MODAL === operateModalVisible) {
            return (
                <Modal
                    title={operateIsLoading ? '指令设置进度提示' : '确认指令'}
                    visible={true}
                    onCancel={checkboxHide}
                    maskClosable={false}
                    wrapClassName={str}
                    footer={
                        operateIsLoading ?
                            [<Button onClick={() => checkboxSetting(operateData.idCom, operateData.setValue, operateData.text)} >确认</Button>]
                            :
                            [
                                <Button onClick={checkboxHide} >取消</Button>,
                                <Button onClick={() => checkboxSetting(operateData.idCom, operateData.setValue, operateData.text, operateData.unsetValue, operateData.desc)} >确认</Button>
                            ]
                    }
                >
                    {
                        operateIsLoading ?
                            <Spin tip={conditionDict.status ? `正在 ${operateData.checkboxState == true ? '取消勾选' : '勾选'} ${operateData.desc} ` : conditionDict.description}>
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <div>
                                {`是否确定${operateData.checkboxState == true ? '取消勾选' : '勾选'}  ${operateData.desc} ?`}
                            </div>
                    }
                </Modal>
            )
        }
        else {
            return null
        }
    }
}



//改变LayoutView组件为有状态组件
class LayoutView extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            num: 0,
            offLineNum: 0,
            faultNum: 0,
            tempMax: "",
            tempMin: "",
            temp: "",
            weatherDesc: "",
            weatherCode: "",
            hum: "",
            windDir: "",
            windSc: "",
            showWeatherModal: false,
            weekWeather: [],
            weatherList: [],
            modeButtonsList: [],
            maxBtnIcon: "block",
            maxBtnTitle: "向下还原",
            visible: false,
            omCloudVersion: "",
            newVersionFlag: false


        }
        this.refreshNum = this.refreshNum.bind(this);
        this.refreshOffLineNum = this.refreshOffLineNum.bind(this);
        this.refreshFaultNum = this.refreshFaultNum.bind(this);
        //this.getDebugBtn = this.getDebugBtn.bind(this)
        this.getHealthBulb = this.getHealthBulb.bind(this);
        this.getWeather = this.getWeather.bind(this);
        //this.getWarningData = this.getWarningData.bind(this);
        this.handleSchedule = this.handleSchedule.bind(this);
        this.handleScene = this.handleScene.bind(this);
        this.handleModelManage = this.handleModelManage.bind(this);
        // this.handleRepairManage = this.handleRepairManage.bind(this);
        this.refreshWeather = this.refreshWeather.bind(this);
        this.getWeatherData = this.getWeatherData.bind(this);
        this.showWeatherInfoModal = this.showWeatherInfoModal.bind(this);
        this.hideWeatherModal = this.hideWeatherModal.bind(this);
        this.weatherInfoModal = this.weatherInfoModal.bind(this);
        this.getWeatherWeekData = this.getWeatherWeekData.bind(this);
        this.getModeButtonsList = this.getModeButtonsList.bind(this);
        this.handleSceneControl = this.handleSceneControl.bind(this);
        this.handleDevice = this.handleDevice.bind(this);
        this.WeatherHistoryShowModal = this.WeatherHistoryShowModal.bind(this);
        this.handleSelectSplit = this.handleSelectSplit.bind(this);
        this.handleMax = this.handleMax.bind(this);
        this.callBackMainWindow = this.callBackMainWindow.bind(this);
        this.getOmsiteVersion = this.getOmsiteVersion.bind(this);
        this.updateOM = this.updateOM.bind(this);

    }

    //返回OMCloud窗口
    callBackMainWindow() {
        const { shell } = require('electron');
        // Open a local file in the default app
        shell.openPath('run.vbs');
        var start1 = require('child_process').exec("taskkill /im OM.exe /f")
    }

    componentDidMount() {
        if (window.localStorage.getItem('leftday') === null) {
            this.props.onTrial()
        }
        //刚登录时，触发检查最新OM版本号，每12个小时检查一次
        this.getOmsiteVersion();
        omSiteVersionTimer = setInterval(this.getOmsiteVersion, 12 * 3600 * 1000);

        //第一次获取天气信息
        this.getWeatherData();
        this.refreshWeather();
        //this.getWeatherWeekData()

        //获取底部模式内容
        this.getModeButtonsList();
        modeButtonsTimer = setInterval(this.getModeButtonsList, 20 * 1000);
    }

    componentWillUnmount() {
        clearInterval(modeButtonsTimer);
        clearInterval(weatherTimer);
        clearInterval(omSiteVersionTimer);
    }

    getOmsiteVersion() {
        http.get('/processVersion').then(
            res => {
                if (res.err == 0) {
                    res.data.process.forEach((item, i) => {
                        if (item.name == "omsite") {
                            localStorage.setItem('omCloudVersion', item.cloudVersion);
                            this.setState({
                                omCloudVersion: item.cloudVersion
                            })
                            let curVersion = appConfig.project.version.split('.');
                            let cloudVersion = item.cloudVersion.split('.');
                            // let cloudVersion = "2.5.54".split('.');
                            for (var i = 0; i < curVersion.length; ++i) {
                                if (Number(curVersion[i]) == Number(cloudVersion[i]) ) {
                                    continue;
                                } else if (Number(curVersion[i]) < Number(cloudVersion[i])) {
                                    this.setState({
                                        newVersionFlag: true
                                    })
                                    break;
                                } else {
                                    this.setState({
                                        newVersionFlag: false
                                    })
                                    break;
                                }
                            }
                        }
                    })
                } else {
                    localStorage.setItem('omCloudVersion', "");
                    this.setState({
                        omCloudVersion: "",
                        newVersionFlag: false
                    })
                }
            }
        ).catch(
            err => {
                localStorage.setItem('omCloudVersion', "");
                this.setState({
                    omCloudVersion: "",
                    newVersionFlag: false
                })
            }
        )
    }

    updateOM() {
        let serverUrl = localStorage.getItem('serverUrl')
        let port = serverUrl.slice(-4)
        let host = serverUrl.substring(0,serverUrl.indexOf(":"))
     
        // let name = JSON.parse(localStorage.getItem('userInfo')).name
        // const exec = require('child_process').exec
        const spawn = require('child_process').spawn
        let process = require('process');
		console.log(process.argv);
        // 任何你期望执行的cmd命令，ls都可以
        let cmdStr = `domUpdateOM.exe -host ${host} -port ${port} -cwd ${process.argv[0]}`
        // 子进程名称
        let workerProcess

        function runExec() {
            workerProcess = spawn(
                cmdStr, [] , 
                {   
                    shell: true,
                    detached: true
                });
            workerProcess.stdout.on('data', d => console.log(d.toString('utf8')));
    
            process.stdin.on('data', d => workerProcess.stdin.write(d));


            // // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
            // workerProcess = exec(cmdStr, {
            //     shell: true,
            //     detached: true
            // })
            // // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})

            // // 打印正常的后台可执行程序输出
            // workerProcess.stdout.on('data', function (data) {
            //     console.log('stdout: ' + data);
            // });

            // // 打印错误的后台可执行程序输出
            // workerProcess.stderr.on('data', function (data) {
            //     console.log('stderr: ' + data);
            // });

            // // 退出之后的输出
            // workerProcess.on('close', function (code) {
            //     console.log('out code：' + code);
            // })
        }

        Modal.confirm({
            title: '提示',
            content: "是否确定启动自动更新进程？请注意：更新进程需要一定耗时。",
            onOk() {
                runExec()
            },
            onCancel() {
            }
        })

        //前端自己下载安装包，但是不能自动安装，并重启；所以用上面的domUpdateOM.exe代替，支持自动安装重启；
        // Modal.confirm({
        //     title: '确定信息',
        //     content: `点击“确定”后，需手动关闭当前软件，等待安装包下载完毕后双击逐步安装即可。确定要下载最新OM（${this.state.omCloudVersion}）安装包吗？`,
        //     onOk() {
        //         //用oss上的这个img图片来判断是否联网，联网就从oss直接下载，否则从接口拿
        //         let img = new Image()
        //         img.onload = function () {
        //             downloadUrl('https://file.inwhile.com/omsite-setup.exe')
        //         }
        //         img.onerror = function () {
        //             http.post('/wizard/downloadPeriodicUpdateManualByKey', {
        //                 key: "omsite-setup.exe",
        //                 period: 1
        //             }).then(
        //                 res => {
        //                     if (!res.err) {
        //                         downloadUrl(`${appConfig.serverUrl}/static/periodic_update_manual/${res.data}`)
        //                     } else {
        //                         Modal.error({
        //                             title: '后台返回信息',
        //                             content: "离线获取安装包失败" + res.msg
        //                         })
        //                     }
        //                 }
        //             ).catch(
        //                 err => {
        //                     Modal.error({
        //                         title: '错误提示',
        //                         content: "后台返回错误，离线获取安装包失败"
        //                     })
        //                 }
        //             )
        //         }
        //         //该图片仅用来判断是否能上网
        //         img.src = "https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/OM/omOnline.png"
        //     },
        //     onCancel() {
        //     }
        // })

    }


    //刷新num
    refreshNum(num) {
        this.setState({
            num: num
        })
    }


    refreshOffLineNum(offLineNum) {
        this.setState({
            offLineNum: offLineNum
        })
    }

    refreshFaultNum(num) {
        this.setState({
            faultNum: num
        })
    }

    //获取天气信息
    getWeatherData() {
        http.get('/weather/getTodayWeatherInfo')
            .then(
                res => {
                    if (res.err == 0) {
                        this.setState({
                            tempMax: res.data.tempMax,
                            tempMin: res.data.tempMin,
                            weatherCode: res.data.code,
                            weatherDesc: res.data.desc,
                            hum: res.data.hum,
                            temp: res.data.temp,
                            windSc: res.data.windSc,
                            windDir: res.data.windDir
                        })
                    }
                })
            .catch(
                err => {
                    // console.log("当天天气信息接口请求失败");
                });
    }
    //分屏按钮
    handleSelectSplit(value) {
        if (value === "100") {
            //返回主窗口OMCloud
            this.callBackMainWindow()
        } else {
            splitAppWindow({ numId: value, pageId: this.child.state.selectedKeys })
            localStorage.setItem('splitPageId', this.child.state.selectedKeys);
            if (value == 0) {
                localStorage.setItem('maxBtn', 0);
            } else {
                //1展示最大化按钮样式
                localStorage.setItem('maxBtn', 1);
            }
        }
    }
    //最大化按钮
    handleMax() {
        maximizeAppWindow();
        localStorage.setItem('splitPageId', this.child.state.selectedKeys);
        if (localStorage.getItem('maxBtn') == 1) {
            localStorage.setItem('maxBtn', 0);
        } else {
            localStorage.setItem('maxBtn', 1);
        }

    }



    //半小时刷新天气
    refreshWeather() {
        weatherTimer = setInterval(this.getWeatherData, 30 * 60 * 1000);

    }

    //调试按钮
    // getDebugBtn(){
    //   let userData = JSON.parse(window.localStorage.getItem('userData'))
    //   const {toggleDebugLayer,isDebugLayerVisible} = this.props
    //   if(userData.role >= 4){
    //     return (
    //       <Button 
    //         type={isDebugLayerVisible?'primary':'default'} 
    //         onClick={()=>{toggleDebugLayer(!isDebugLayerVisible)}}>调试界面</Button>
    //     )
    //   }
    //   return ''
    // }

    //
    getWarningData() {
        let startTime = moment().subtract(5, "minute").format("YYYY-MM-DD HH:mm:ss");
        let endTime = moment().format("YYYY-MM-DD HH:mm:ss");
        this.props.searchPoint("", startTime, endTime);
        this.props.showModal(2019, {});

    }
    handleSchedule() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            this.props.ModifySchedule(-1, [])
            this.props.AddIdSchedule([])
            this.props.showModal(modalTypes.SCHEDULE_MODAL)
        } else {
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
        }
    }

    handleScene() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            //this.props.ModifySchedule(-1,[])
            //this.props.AddIdSchedule([])
            this.props.showModal(modalTypes.SCENE_MODAL)
        } else {
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
        }
    }

    handleDevice() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            //this.props.ModifySchedule(-1,[])
            //this.props.AddIdSchedule([])
            this.props.showModal(modalTypes.DEVICE_MODAL)
        } else {
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
        }
    }
    // handleRepairManage(){
    //   if (JSON.parse(localStorage.getItem('userData')).role!=1) {
    //     this.props.RepairDataAction(moment().startOf('year').format("YYYY-MM-DD HH:mm:ss"),moment().format("YYYY-MM-DD HH:mm:ss"))
    //     // this.props.showModal(modalTypes.REPAIR_MANAGEMENT_MODAL) 
    //   }else {
    //     Modal.info({
    //       title: '提示',
    //       content: '用户权限不足'
    //     })
    //   }
    // }
    handleModelManage() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            this.props.showModal(modalTypes.MODEL_MANAGE_MODAL)
        } else {
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
        }
    }
    handleSceneControl() {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            this.props.showModal(modalTypes.SCENE_CONTROL_MODAL)
        } else {
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
        }
    }
    getHealthBulb() {
        let healthData = this.props.healthData
        let healthDataStatus = this.props.healthDataStatus
        if (!healthDataStatus) {
            return null
        } else {
            return healthData.map(item => {
                if (item.err === 0 || item.err === -1) {
                    return (
                        <Popover content={item.name + item.msg} >
                            <i className={cx(s['round'])} style={{ width: '8px', height: '8px' }} />
                        </Popover>
                    )
                } else {
                    return (
                        <Popover content={item.name + item.msg} >
                            <i className={cx(s['round_red'])} style={{ width: '8px', height: '8px' }} />
                        </Popover>
                    )
                }
            })
        }

    }
    WeatherHistoryShowModal() {
        this.props.showModal(modalTypes.WEATHERHISTORY_MODAL)
    }
    hideWeatherModal() {
        this.setState({
            showWeatherModal: false
        })
    }
    // 请求7天的天气数据
    getWeatherWeekData() {
        let today = moment().format("YYYY-MM-DD")
        http.get(`/weather/getForcastWeatherInfoV2/${today}/7`)
            .then(
                res => {
                    if (res.err == 0) {
                        let weatherList = []
                        let location = ''
                        if (res.data.length != 0) {
                            res.data.forEach((item, i) => {
                                if (item.forcast === null) {
                                    return
                                }
                                if (item.forcast.basic && item.forcast.basic.location) {
                                    location = item.forcast.basic.location
                                }
                                let arr = [];
                                for (let i = 0; i < item.forcast.date.length; i++) {
                                    if (item.forcast.date[i] == '月') {
                                        arr[0] = item.forcast.date.slice(0, i);
                                        arr[1] = item.forcast.date.slice(i + 1, -1);
                                    }
                                }
                                if (arr[0] < 10 && arr[1] < 10) {
                                    item.forcast.date = '\xa0' + arr[0] + '\xa0' + '月' + '\xa0' + arr[1] + '\xa0' + '日'
                                } else if (arr[0] < 10 && arr[1] >= 10) {
                                    item.forcast.date = '\xa0' + arr[0] + '\xa0' + '月' + arr[1] + '日'
                                } else if (arr[0] >= 10 && arr[1] < 10) {
                                    item.forcast.date = arr[0] + '月' + '\xa0' + arr[1] + '\xa0' + '日'
                                } else {
                                    item.forcast.date = arr[0] + '月' + arr[1] + '日'
                                }
                                let weekday = moment(item.date).format('dddd')

                                if (i > 0) {
                                    weatherList.push(
                                        <li style={{ marginBottom: 5 }}>
                                            <span style={{ marginRight: '15px' }}>{item.forcast.date}</span>
                                            <span style={{ marginRight: '15px' }}>{weekday}</span>
                                            <img src={appConfig.serverUrl + `/static/images/cond-icon-heweather` + `/${item.forcast.cond_code_d}.png`} alt="" style={{ marginRight: '15px', height: '25px', position: 'relative' }} />
                                            <span style={{ marginRight: '15px' }}>{item.forcast.tmp_max}°C / {item.forcast.tmp_min}°C </span>
                                            <span>{item.forcast.hum} %</span>
                                        </li>
                                    )
                                }
                            })
                            this.setState({
                                showWeatherModal: true,
                                weatherList: weatherList
                            })
                        }
                        this.setState({
                            weekWeather: res.data,
                            // showWeatherModal:true
                        })
                        Modal.info({
                            title: '天气预报',
                            content: (
                                <div>
                                    <p style={{ position: 'absolute' }}>
                                        <span style={{ fontSize: '34px', position: 'absolute', marginTop: '-8px', marginLeft: '-5px' }}>{location}</span>
                                        <span style={{ position: 'absolute', marginLeft: '80px', top: '-20px' }}>当前温度  {this.state.temp != null && this.state.temp != undefined && this.state.temp != "" ? this.state.temp : "--"}°C</span>
                                        <span style={{ position: 'relative', fontSize: '11px', marginLeft: '223px', top: '-15px' }}>最高/最低</span>
                                    </p>
                                    <p style={{ marginTop: '20px', marginBottom: '8px' }}>
                                        <span style={{ marginRight: '18px', marginTop: '3px', marginLeft: '80px', width: '75px', display: 'inline-block' }}>今日 {this.state.weatherDesc}</span>
                                        <img src={appConfig.serverUrl + `/static/images/cond-icon-heweather` + `/${this.state.weatherCode}.png`} alt="" style={{ marginRight: '21px', height: '25px', position: 'relative' }} />
                                        <span style={{ marginTop: '2px' }}>{this.state.tempMax}°C/{this.state.tempMin}°C </span>
                                        <br />
                                        <span style={{ marginRight: '20px', marginLeft: '80px' }}>相对湿度 {this.state.hum} %</span>
                                        <span style={{ marginRight: '18px' }}>{this.state.windDir} </span>
                                        <span>{this.state.windSc} 级</span>
                                    </p>
                                    <hr style={{ marginBottom: '15px', width: '300px', marginLeft: '-7px' }} />
                                    <p>
                                        <span style={{ fontSize: '16px' }}>未来一周天气预报</span>
                                        <Button style={{ marginLeft: '60px' }} onClick={this.WeatherHistoryShowModal}>历史天气</Button>
                                    </p>
                                    <ul style={{ marginTop: '5px', marginBottom: '-10px', marginLeft: '-42px', listStyleType: 'none' }}>
                                        {this.state.weatherList}
                                    </ul>
                                    <span style={{ fontSize: '11px', position: 'absolute', bottom: '37px' }}>数据更新时间：{this.state.weekWeather[0].forcast.update.loc}</span>
                                </div>
                            ),
                            onOk: () => { this.hideWeatherModal() },
                        });
                    } else {
                        // console.log("获取7天天气预报接口请求失败")
                        Modal.info({
                            title: '天气预报',
                            content: (
                                <div>
                                    <p>
                                        <span style={{ fontSize: '30px' }}>{location}</span>
                                        <span style={{ position: 'relative', fontSize: '11px', marginLeft: '143px', top: '-30px' }}>最高/最低</span>
                                    </p>
                                    <p style={{ marginTop: '-50px', marginBottom: '10px' }}>
                                        <span style={{ marginRight: '18px', marginLeft: '80px', width: '75px', display: 'inline-block' }}>今日 {this.state.weatherDesc}</span>
                                        <img src={appConfig.serverUrl + `/static/images/cond-icon-heweather` + `/${this.state.weatherCode}.png`} alt="" style={{ marginRight: '23px', height: '25px', position: 'relative' }} />
                                        <span>{this.state.tempMax}°C/{this.state.tempMin}°C </span>
                                        <br />
                                        <span style={{ marginRight: '20px', marginLeft: '80px' }}>相对湿度 {this.state.hum} %</span>
                                        <span style={{ marginRight: '20px' }}>{this.state.windDir} </span>
                                        <span>{this.state.windSc} 级</span>
                                    </p>
                                    <hr style={{ marginLeft: '-40px', marginBottom: '15px', width: '300px', marginLeft: '-7px' }} />
                                    <p>
                                        <span style={{ fontSize: '16px' }}>未来一周天气预报</span>
                                    </p>
                                    <ul style={{ marginTop: '5px', marginBottom: '-10px', marginLeft: '-42px', listStyleType: 'none' }}>
                                        {this.state.weatherList}
                                    </ul>
                                    <span style={{ fontSize: '11px', position: 'absolute', bottom: '37px' }}>数据更新时间：{this.state.weekWeather[0].forcast.update.loc}</span>
                                </div>
                            ),
                            onOk: () => { this.hideWeatherModal() },
                        });
                    }
                })
            .catch(
                err => {
                    // console.log("获取7天天气预报接口请求失败");
                    Modal.info({
                        title: '天气预报',
                        content: (
                            <div>
                                <p>
                                    <span style={{ fontSize: '30px' }}>{location}</span>
                                    <span style={{ position: 'relative', fontSize: '11px', marginLeft: '143px', top: '-30px' }}>最高/最低</span>
                                </p>
                                <p style={{ marginTop: '-50px', marginBottom: '10px' }}>
                                    <span style={{ marginRight: '18px', marginLeft: '80px', width: '75px', display: 'inline-block' }}>今日 {this.state.weatherDesc}</span>
                                    <img src={appConfig.serverUrl + `/static/images/cond-icon-heweather` + `/${this.state.weatherCode}.png`} alt="" style={{ marginRight: '23px', height: '25px', position: 'relative' }} />
                                    <span>{this.state.tempMax}°C/{this.state.tempMin}°C </span>
                                    <br />
                                    <span style={{ marginRight: '20px', marginLeft: '80px' }}>相对湿度 {this.state.hum} %</span>
                                    <span style={{ marginRight: '20px' }}>{this.state.windDir} </span>
                                    <span>{this.state.windSc} 级</span>
                                </p>
                                <hr style={{ marginLeft: '-40px', marginBottom: '15px', width: '300px', marginLeft: '-7px' }} />
                                <p>
                                    <span style={{ fontSize: '16px' }}>未来一周天气预报</span>
                                </p>
                                <ul style={{ marginTop: '5px', marginBottom: '-10px', marginLeft: '-42px', listStyleType: 'none' }}>
                                    {this.state.weatherList}
                                </ul>
                                <span style={{ fontSize: '11px', position: 'absolute', bottom: '37px' }}>数据更新时间：'--'</span>
                            </div>
                        ),
                        onOk: () => { this.hideWeatherModal() },
                    });
                });
    }

    showWeatherInfoModal() {
        if (this.state.showWeatherModal == false) {
            this.setState({
                showWeatherModal: true,
            })
            this.getWeatherWeekData()
        }
    }
    weatherInfoModal() {
        let data = this.state.weekWeather
        Modal.info({
            title: '天气预报',
            content: (
                this.state.showWeatherModal ?
                    <div>
                        <p>
                            <span style={{ fontSize: '30px' }}>{location}</span>
                        </p>
                        <p>
                            <span style={{ marginRight: '30px' }}>相对湿度 {this.state.hum} %</span>
                            <span style={{ marginRight: '30px' }}>{this.state.windDir} </span>
                            <span>{this.state.windSc} 级</span>
                        </p>
                        <ul style={{ marginTop: '15px' }}>
                            {this.state.weatherList}
                        </ul>
                    </div>
                    :
                    <div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
                        <Spin tip="正在读取数据" />
                    </div>
            ),
        });

    }

    //天气样式
    getWeather() {
        //let url = WeatherImgs+"/"+this.state.weatherCode+".png"
        let sr = '../../../'
        //let url = require(sr+"themes/dark/images/cond-icon-heweather/"+this.state.weatherCode+".png")
        let url = appConfig.serverUrl + `/static/images/cond-icon-heweather` + `/${this.state.weatherCode}.png`
        return (
            <div style={weatherStyle}>
                <TimerStyle className={s['icon-label-inner-label']} />
                <div style={{ display: 'inline-block', position: 'relative', top: '4px', width: "50px", cursor: "pointer" }} onClick={this.showWeatherInfoModal}>
                    <span style={{ display: 'inline-block', position: 'absolute', top: '-27px', height: "20px", lineHeight: "20px", width: "40px", textAlign: "center" }}>
                        {
                            this.state.weatherCode && this.state.weatherCode != undefined && this.state.weatherCode != '' ?
                                <img src={url} alt="" style={{ width: '26px', height: '26px' }} />
                                :
                                ''
                        }
                    </span>
                    {
                        this.state.weatherDesc.length > 2 ?
                            <span style={{ display: 'inline-block', fontSize: '10px', position: 'absolute', top: '-9px', left: '-3px', height: "12px", lineHeight: "23px", width: "45px", textAlign: "center" }}>
                                {this.state.weatherDesc}
                            </span>
                            :
                            <span style={{ display: 'inline-block', position: 'absolute', top: '-9px', height: "12px", lineHeight: "23px", width: "40px", textAlign: "center" }}>
                                {this.state.weatherDesc}
                            </span>
                    }
                </div>
                <div style={{ display: 'inline-block', position: 'relative', top: '4px', width: "75px", cursor: "pointer" }} onClick={this.showWeatherInfoModal}>
                    <p style={{ display: 'inline-block', position: 'absolute', top: '-27px', height: "20px", lineHeight: "20px", width: "70px", fontSize: "10px" }}>
                        最高
                        <span style={{ display: 'inline-block', height: "20px", lineHeight: "20px", width: "25px", textAlign: "center", fontSize: "14px" }}>
                            {this.state.tempMax}
                        </span>
                        <span style={{ display: 'inline-block', position: 'absolute', height: "20px", lineHeight: "22px", width: "15px", fontSize: "10px" }}>
                            度
                        </span>
                    </p>
                    <p style={{ display: 'inline-block', position: 'absolute', top: '-9px', height: "20px", lineHeight: "20px", width: "70px", fontSize: "10px" }}>
                        最低
                        <span style={{ display: 'inline-block', height: "20px", lineHeight: "20px", width: "25px", textAlign: "center", fontSize: "14px" }}>
                            {this.state.tempMin}
                        </span>
                        <span style={{ display: 'inline-block', position: 'absolute', height: "20px", lineHeight: "22px", width: "15px", fontSize: "10px" }}>
                            度
                        </span>
                    </p>
                </div>
            </div>
        )
    }

    getModeButtonsList() {
        let configType = JSON.parse(window.localStorage.modeButtons) != undefined ? JSON.parse(window.localStorage.modeButtons).type : []
        if (configType.length != 0) {
            http.post('/mode/getTodayModeListOfTypes', {
                type: configType
            }).then(
                res => {
                    if (res.err === 0 && res.data.length != 0) {
                        //判断一下如果是全手动模式，则打log
                        let manualNum = 0
                        for (let i = 0; i < res.data.length; i++) {
                            for (let j = 0; j < res.data[i].modeList.length; j++) {
                                if (res.data[i].modeList[j].active == 1) {
                                    manualNum += 1
                                }
                            }
                        }
                        if (manualNum == 0) {
                            // console.log('[debug-dora] 底部模式栏全手动log'+ JSON.stringify(res.data))
                        }
                        this.setState({
                            modeButtonsList: res.data
                        })
                    } else {
                        // console.log(res)
                    }
                }
            ).catch(
                err => {
                    // console.log('获取底部模式内容失败')
                }
            )
        }
    }

    historyStart = () => {
        const {
            toggleTimeShaft,
            toggleDateConfigModal,
            parmsDict,
        } = this.props
        toggleDateConfigModal(true);
        toggleTimeShaft(true);
        parmsDict.closeRealTimeFresh()
    }
    handleVisibleChange = visible => {
        this.setState({ visible });
    };

    render() {
        const {
            showModal,
            hideLayer,
            showAlarmModal,
            hideModal,
            hideAlarmModal,
            toggleHistoryLayer,
            modal,
            alarmModal,
            menus,
            gMenusFlag, //是否有二级菜单
            children,
            isHistoryLayerVisible,
            toggleAlarmModal,
            toggleWarningManageModal,
            toggleNetworkManageModal,
            isAlarmManageVisible,
            isWarningManageVisible,
            isNetworkManageVisible,
            renderList,
            initialize,
            toggleTimeShaft,
            bShowTimeShaft,
            dateModal,
            toggleDateConfigModal,
            getTimeArr,
            parmsDict,
            showCommomAlarm,  //增加
            getTendencyModal, //趋势模态框
            showMainInterfaceModal,
            getToolPoint,
            showMainCheckboxModal,
            showObserverModal,
            showOptimizeModal,
            showTimeModal,
            addPoint,
            upDateCurValue,
            timeArr,
            hide,
            optimizeSetting,
            timeSetting,
            operateModalVisible, //observer主页面
            operateData,
            operateSwitch,
            switchHide,
            checkboxSetting,
            checkboxHide,
            operateIsLoading,
            conditionDict,
            refreshRealWarning, //func
            refreshChoseKey,
            getWorkerDict,
            recordFailedTime,
            resetFailedTime,
            changeReconnectModalVisible,
            updateTimeshaftState,
            chosedKey, //props
            updateFullPage,
            realtimeWarningData,
            toggleDebugLayer,
            reconnectModal,
            dashboardPages, //仪表盘页面名称数组
            isDebugLayerVisible,
            refreshCustomData,
            refreshCustomDataInModal,
            settingTableDataFlagFun,
            showPointModal,
            selectedData,
            saveHealthData,
            switchUser,
            changeHealthDataStatus,
            tendencyVisible,
            tendencyData,
            hideTendencyModal,
            addSchedule,        //添加日程
            editSchedule,       //修改日程
            scheduleData,       //日程数据
            scheduleLoading,    //数据加载
            delSchedule,        //删除日程
            searchSchedule,     //初始化日程
            useSchedule,        //启用,禁用
            obtainSchedule,     //获取数据 
            loadDate,           //日期加载中
            nodeData,           //日期数据
            fetchID,            //获取ID
            scheduleId,         //id
            ModifySchedule,      //修改
            onTrial,
            warningData,
            AddIdSchedule,       //获取日程Id选项
            CheckId,              //选择的ID
            addScene,             //添加场景
            getSceneList,
            delScene,             //删除场景
            sceneList,           //场景列表数据
            sceneListSelectedId,
            sceneListSelectedName,
            saveSceneListId,
            editScene,
            savePoint,
            preSavePoint,
            changeSceneSavePoint,
            handleSimulation,
            searchList,
            loading,  //svg页面loading
            sceneLoading,         //场景列表loading
            addModel,
            modelList,           //模式列表数据
            modelLoading,         //模式列表loading
            modelContentLoading,   //模式内容loading
            getModelList,
            modelListSelectedId,
            saveModelListId,
            editModel,
            copyModel,
            delModel,
            addModelContent,  //给模式添加内容
            editModelContent, //修改模式内容
            modelContent,  //模式内容数据
            getModelContent,
            delModelContent,
            getSceneData,
            SceneDataSource,
            SceneSelectId,
            SceneId,
            SceneLoad,
            SceneDataLoaing,
            createGuarantee,  //创建保修管理
            Guarantee,
            RepairData,
            SeachGuarantee,
            SeachGuaranteeVisiable,  //获取保修页面和数据
            SeachGuaranteeSourceData,
            GuaranteeFixid,
            ViewMessage,
            ViewDisplay,
            RepairDataAction,   //报修管理
            RepairManageData,
            viewExperience,
            getRepairData,
            RepairVisiable,
            visiable,
            getAllCalendarWithMode,
            loadingCalendar,
            hideCommandLogModal,
            commandLogVisible,
            commandLogPoint
        } = this.props
        let user_info =
            window.localStorage.getItem('userInfo') ?
                JSON.parse(window.localStorage.getItem('userInfo')) : {}
        const menu = (
            <Menu
                className={dropdownClass}
                selectedKeys={[this.child ? String(this.child.state.selectedKeys) : '']}
            >
                <MenuItem key="userPanel">
                    <UserPanel
                        initialize={initialize}
                        switchUser={switchUser}
                    />
                </MenuItem>
                <MenuItem key="operationRecord">
                    <div
                        onClick={() => showModal(modalTypes.OPERATION_RECORD_MODAL)}
                    >
                        <Icon type="file-text" style={{ marginRight: '5px' }} />操作记录
                    </div>
                </MenuItem>
                {/**
                    <MenuItem key="schedule">
                        <div
                            onClick={this.handleSchedule}
                        >
                            <Icon type="schedule" style={{ marginRight: '5px' }} />设备日程
                        </div>
                    </MenuItem>
                  
                  */}

                <MenuItem key="cxMenu"
                    visible={JSON.parse(window.localStorage.getItem('userData')).role >= 3 ? true : false}
                >
                    <Link to={"systemToolCx/"}
                        onClick={(e) => {
                            this.child.handleClickMenucxMenu();
                            if (bShowTimeShaft) {
                                e.preventDefault();
                                Modal.info({
                                    title: '温馨提示',
                                    content: (
                                        <div>
                                            <p>如果想要进入系统管理，请先点击数据回放按钮，退出回放功能。</p>
                                        </div>
                                    ),
                                });
                            }
                        }}>
                        <Icon type="appstore-o" style={{ marginRight: '5px' }} />系统管理
                    </Link>
                </MenuItem>
                <MenuItem key="historyMenu">
                    <Link to={"systemToolHistoryCurve/"}
                        onClick={(e) => {
                            this.child.handleClickMenuhistoryMenu();
                            if (bShowTimeShaft) {
                                e.preventDefault();
                                Modal.info({
                                    title: '温馨提示',
                                    content: (
                                        <div>
                                            <p>如果想要进入历史曲线，请先点击数据回放按钮，退出回放功能。</p>
                                        </div>
                                    ),
                                });
                            }
                        }}>
                        <Icon type="line-chart" style={{ marginRight: '5px' }} />历史曲线
                    </Link>
                </MenuItem>
                <MenuItem key="DashboardMenu"
                    visible={JSON.parse(window.localStorage.getItem('userData')).role >= 3 ? true : false}
                >
                    <Link to={"systemToolExpertOptimize/"}
                        onClick={(e) => {
                            this.child.handleClickMenuDashboardMenu();
                            if (bShowTimeShaft) {
                                e.preventDefault();
                                Modal.info({
                                    title: '温馨提示',
                                    content: (
                                        <div>
                                            <p>如果想要进入专家优化调试学习表，请先点击数据回放按钮，退出回放功能。</p>
                                        </div>
                                    ),
                                });
                            }
                        }}>
                        <Icon type="compass" style={{ marginRight: '5px' }} />优化调试
                    </Link>
                </MenuItem>
                <MenuItem key="ScriptRuleMenu"
                    visible={JSON.parse(window.localStorage.getItem('userData')).role >= 3 ? true : false}
                >
                    <Link to={"systemToolScriptRule/"}
                        onClick={(e) => {
                            this.child.handleClickMenuScriptRuleMenu();
                            if (bShowTimeShaft) {
                                e.preventDefault();
                                Modal.info({
                                    title: '温馨提示',
                                    content: (
                                        <div>
                                            <p>如果想要进入规则控制，请先点击数据回放按钮，退出回放功能。</p>
                                        </div>
                                    ),
                                });
                            }
                        }}>
                        <Icon type="fork" style={{ marginRight: '5px' }} />规则控制
                    </Link>
                </MenuItem>
                <MenuItem key="AIRuleMenu"
                    visible={JSON.parse(window.localStorage.getItem('userData')).role >= 3 ? true : false}
                >
                    <Link to={"systemToolAIRule/"}
                        onClick={(e) => {
                            this.child.handleClickMenuAIRuleMenu();
                            if (bShowTimeShaft) {
                                e.preventDefault();
                                Modal.info({
                                    title: '温馨提示',
                                    content: (
                                        <div>
                                            <p>如果想要进入AI决策，请先点击数据回放按钮，退出回放功能。</p>
                                        </div>
                                    ),
                                });
                            }
                        }}>
                        <Icon type="font-colors" style={{ marginRight: '5px' }} />AI决策
                    </Link>
                </MenuItem>
                <MenuItem key="SceneManage">
                    <div
                        onClick={this.handleScene}
                    >
                        <Icon type="book" style={{ marginRight: '5px' }} />场景管理
                    </div>
                </MenuItem>
                {/** 
                    <MenuItem key="RepairManage">
                        <Link to={"repairManage/"}
                            onClick={(e) => {
                                this.child.handleClicRepairkMenu();
                                if (bShowTimeShaft) {
                                    e.preventDefault();
                                    Modal.info({
                                        title: '温馨提示',
                                        content: (
                                            <div>
                                                <p>如果想要进入报修管理，请先点击数据回放按钮，退出回放功能。</p>
                                            </div>
                                        ),
                                    });
                                }
                            }}
                        >
                            <Icon type="share-alt" style={{ marginRight: '5px' }} />报修管理
                        </Link>
                    </MenuItem>
                 */}

                {/**
                    user_info.name == 'cx'?
                    <MenuItem key="DeviceManage">
                        <div
                            onClick={this.handleDevice}
                        >
                            <Icon type="idcard" style={{ marginRight: '5px' }} />设备台账
                        </div>
                    </MenuItem>
                    :
                    ''
                  */}
                <MenuItem key="assetMenu"
                    visible={JSON.parse(window.localStorage.getItem('userData')).role >= 3 ? true : false}
                >
                    <Link to={"AssetToolCx/"}
                        onClick={(e) => {
                            this.child.handleClickAssetManage();
                            if (bShowTimeShaft) {
                                e.preventDefault();
                                Modal.info({
                                    title: '温馨提示',
                                    content: (
                                        <div>
                                            <p>如果想要进入资产管理，请先点击数据回放按钮，退出回放功能。</p>
                                        </div>
                                    ),
                                });
                            }
                        }}>
                        <Icon type="account-book" style={{ marginRight: '5px' }} />资产管理
                    </Link>
                </MenuItem>
            </Menu>
        )
        let tempMarginLeft
        if (this.state.num === 0) {
            tempMarginLeft = '10px'
        }
        return (
            <div className={s[`${containerClass}`]}>
                <Trend
                    tendencyData={tendencyData}
                    tendencyVisible={tendencyVisible}
                    handleCancel={hideTendencyModal}
                />
                <CommandLog
                    commandLogPoint={commandLogPoint}
                    commandLogVisible={commandLogVisible}
                    handleCancel={hideCommandLogModal}
                />
                {/* <repair
              RepairDataAction={RepairDataAction}  
              RepairManageData={RepairManageData}
              viewExperience = {viewExperience}
              getRepairData = {getRepairData}
              RepairDataAction = {RepairDataAction}
              RepairVisiable={RepairVisiable}
              visible = {visiable}
           /> */}
                <div style={headerStyle}>

                    <div style={headerStyleLogo}>
                        {
                            localStorage.getItem('serverOmd') == "persagy" ?
                                <span>
                                    <img src={iconLogo} style={{ width: '20px', height: '20px', position: 'absolute', top: '14px', left: '10px' }} />
                                    <span style={{ fontSize: '16px' }}>冷站群控管理&nbsp;</span>
                                    <span>OM site{appConfig.project.version}</span>
                                </span>
                                :
                                <span>
                                    <span style={{cursor:'pointer'}} onClick={this.getOmsiteVersion}>{localStorage.getItem('omTitle') && localStorage.getItem('omTitle') != '' ? localStorage.getItem('omTitle') : 'OM site'}{appConfig.project.version}</span>
                                    {
                                        this.state.newVersionFlag ?
                                            <span className={s['cloudVersion']} onClick={this.updateOM}>
                                                发现新版本
                                            </span>
                                            : ""
                                    }
                                </span>
                        }
                    </div>
                    <div className={s['header-right']}>
                        <div style={{ display: 'inline-block', marginRight: '10px' }}>
                            <RealtimeWarningModal

                                onCancel={hideAlarmModal}
                                showModal={showAlarmModal}
                                realtimeWarningData={realtimeWarningData}
                                refreshRealWarning={refreshRealWarning}
                                refreshChoseKey={refreshChoseKey}
                                chosedKey={chosedKey}
                                modal={alarmModal}
                                refreshNum={this.refreshNum}
                                refreshOffLineNum={this.refreshOffLineNum}
                                refreshFaultNum={this.refreshFaultNum}
                                saveHealthData={saveHealthData}
                                changeHealthDataStatus={changeHealthDataStatus}
                                getWorkerDict={getWorkerDict}
                                recordFailedTime={recordFailedTime}
                                resetFailedTime={resetFailedTime}
                                changeReconnectModalVisible={changeReconnectModalVisible}
                                reconnectModal={reconnectModal}
                            />
                            <div style={{ display: 'inline-block' }}>
                                <audio id="music1" preload controls="controls" crossOrigin="anonymous" src={appConfig.serverUrl + `/static/警报音.mp3`} hidden />
                            </div>
                        </div>

                        {localStorage.getItem('weatherDis') && localStorage.getItem('weatherDis') == 1 ?
                            this.getWeather()
                            :
                            <Timer className={s['icon-label-inner-label']} />

                        }

                        {
                            this.getHealthBulb()
                        }
                        <div className={s['min-display']} style={{ position: 'relative', top: '4px' }}>
                            <div
                                title='数据回放'
                                className={s['top-right-btnIcon']}
                                disabled={this.props.loading}
                                onClick={() => {
                                    if (bShowTimeShaft) {
                                        if (typeof updateTimeshaftState.stopPlayer === 'function') {
                                            updateTimeshaftState.stopPlayer()
                                        }
                                        var thenStart = new Promise(function (resolve, reject) {
                                            resolve(function () {
                                                toggleTimeShaft(false)
                                                return true
                                            })
                                        })
                                        thenStart.then(function (first) {
                                            return first()
                                        }).then(function (second) {
                                            parmsDict.renderScreen()    //重新使用实时刷新                                            
                                        })
                                    } else {
                                        toggleDateConfigModal(true);
                                        toggleTimeShaft(true);
                                        parmsDict.closeRealTimeFresh()
                                    }
                                }
                                }
                            >
                                {
                                    bShowTimeShaft == false ?
                                        <Icon type="clock-circle-o" className={s['icon-select-before']} />
                                        :
                                        <Icon type="clock-circle" className={s['icon-select-after']} />
                                }
                            </div>
                            <div
                                title='场景控制'
                                className={s['top-right-btnIcon']}
                                onClick={this.handleSceneControl}
                            >
                                <Icon type="code-o" className={s['icon-select-before']} />
                            </div>
                            <div
                                title='模式管理'
                                className={s['top-right-btnIcon']}
                                onClick={this.handleModelManage}
                            >
                                <Icon type="layout" className={s['icon-select-before']} />
                            </div>
                            <div
                                title='日历管理'
                                className={s['top-right-btnIcon']}
                            >
                                <Link to={"systemToolCalender/"}
                                    onClick={(e) => {
                                        this.child.handleClickMenuCalendarMenu();
                                        if (bShowTimeShaft) {
                                            e.preventDefault();
                                            Modal.info({
                                                title: '温馨提示',
                                                content: (
                                                    <div>
                                                        <p>如果想要进入日历，请先点击数据回放按钮，退出回放功能。</p>
                                                    </div>
                                                ),
                                            });
                                        }
                                    }}>
                                    <Icon className={s['icon-select-before']} type="calendar" />
                                </Link>
                            </div>
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer', margin: '0 0 0 10px' }}
                                onClick={() => { handleWarningBtn(toggleWarningManageModal) }}
                            >
                                <div
                                    title='报警管理'
                                    style={{ display: 'inline-block', boxSizing: 'border-box', cursor: 'pointer' }}
                                >
                                    <Icon type="bell" className={s['icon-select-before']} />
                                </div>
                                {/* <Badge count={this.state.num} overflowCount={99} showZero={false} style={{ fontSize: '12px', color: 'white', margin: '-25px 0px 0px -5px', cursor: 'pointer' }}></Badge> */}
                            </div>
                            <div
                                style={{ display: 'inline-block', cursor: 'pointer', margin: '0 0 0 10px' }}
                                onClick={() => { handleNetworkBtn(toggleNetworkManageModal) }}
                            >
                                <div
                                    title='网络拓扑图'
                                    style={{ display: 'inline-block', boxSizing: 'border-box', cursor: 'pointer' }}
                                >
                                    <Icon type="cluster" className={s['icon-select-before']} />
                                </div>
                                <Badge count={this.state.offLineNum} overflowCount={999} showZero={false} style={{ fontSize: '12px', color: 'white', margin: '-25px 0px 0px -5px', cursor: 'pointer' }}></Badge>
                            </div>
                            <div
                                title='报表下载'
                                className={s['top-right-btnIcon']}
                            >
                                <Link to={"reportManage/"}
                                    onClick={(e) => {
                                        this.child.handleClicRepairkMenu();
                                        if (bShowTimeShaft) {
                                            e.preventDefault();
                                            Modal.info({
                                                title: '温馨提示',
                                                content: (
                                                    <div>
                                                        <p>如果想要进入报表下载，请先点击数据回放按钮，退出回放功能。</p>
                                                    </div>
                                                ),
                                            });
                                        }
                                    }}
                                >
                                    <Icon type="file-text" className={s['icon-select-before']} />
                                </Link>
                            </div>
                            <div
                                title='工单管理'
                                className={s['top-right-btnIcon']}
                            >
                                <Link to={"AlarmSystemManage/"}
                                    onClick={(e) => {
                                        this.child.handleClickAlarmSystemMenu();
                                        if (bShowTimeShaft) {
                                            e.preventDefault();
                                            Modal.info({
                                                title: '温馨提示',
                                                content: (
                                                    <div>
                                                        <p>如果想要进入工单管理，请先点击数据回放按钮，退出回放功能。</p>
                                                    </div>
                                                ),
                                            });
                                        }
                                    }}>
                                    <Icon type="medicine-box" className={s['icon-select-before']} />
                                </Link>
                            </div>
                            {/** 
                                <div
                                 title='能源管理'
                                 className={s['top-right-btnIcon']}
                                >
                                    <Link to={"energyManage/"}
                                        onClick={(e) => {
                                            this.child.handleClickEnergyManageMenu();
                                            if (bShowTimeShaft) {
                                                e.preventDefault();
                                                Modal.info({
                                                    title: '温馨提示',
                                                    content: (
                                                        <div>
                                                            <p>如果想要进入能源管理，请先点击数据回放按钮，退出回放功能。</p>
                                                        </div>
                                                    ),
                                                });
                                            }
                                        }}>
                                        <Icon type="medicine-box" className={s['icon-select-before']} />
                                    </Link>
                                </div>
                             */}

                            <Badge count={this.state.faultNum} overflowCount={99} showZero={false} style={{ fontSize: '12px', color: 'white', margin: '-25px 0px 0px -5px', cursor: 'pointer' }}></Badge>
                        </div>
                        <span style={{ color: '#aaa', marginLeft: `${tempMarginLeft}` }}>|</span>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <span className="ant-dropdown-link" style={userInfoName}>
                                <span style={{ display: 'inline-block', minWidth: '70px', textAlign: 'center' }}>{user_info.name || ''}</span> <Icon type="down" className={s['icon-select-before']} style={{ cursor: 'pointer' }} />
                            </span>
                        </Dropdown>
                        <span style={{ color: '#aaa' }}>|</span>
                        <div style={headerStyleSpan}>

                            {localStorage.getItem('serverName') === '' ?
                                localStorage.getItem('projectName_en') != '' && localStorage.getItem('projectName_en') != undefined ? localStorage.getItem('projectName_en') : localStorage.getItem('serverUrl')
                                :
                                <span className={s['header-url-left-span']} style={headerStyleSpan}>
                                    {localStorage.getItem('serverName')}&nbsp;&nbsp;
                                    {localStorage.getItem('projectName_en') != '' && localStorage.getItem('projectName_en') != undefined ? localStorage.getItem('projectName_en') : localStorage.getItem('serverUrl')}
                                </span>
                            }
                        </div>
                        <span style={{ color: '#aaa' }}>|</span>

                        {
                            argv.length > 14 && argv[argv.length - 6] == "-count" ?

                                <div
                                    title='返回主窗'
                                    className={s['top-right-btnIcon']}
                                    onClick={this.callBackMainWindow}
                                >
                                    <Icon type="cloud" className={s['icon-select-before']} />
                                </div>

                                :

                                ""
                        }

                        {/* <Select style={RTbtnStyle} size="small" defaultValue="0" onSelect={this.handleSelectSplit} >
                                <Option value="0">全屏显示</Option>
                                <Option value="1">置于左上</Option>
                                <Option value="2">置于右上</Option>
                                <Option value="3">置于左下</Option>
                                <Option value="4">置于右下</Option>
                                <Option value="100"></Option>

                            </Select> */}
                        <Popover
                            content={<div><Button onClick={() => this.handleSelectSplit(0)}>全屏显示</Button><br />
                                <Button onClick={() => this.handleSelectSplit(1)}>置于左上</Button><br />
                                <Button onClick={() => this.handleSelectSplit(2)}>置于右上</Button><br />
                                <Button onClick={() => this.handleSelectSplit(3)}>置于左下</Button><br />
                                <Button onClick={() => this.handleSelectSplit(4)}>置于右下</Button>
                            </div>
                            }
                            trigger="hover"
                            visible={this.state.visible}
                            onVisibleChange={this.handleVisibleChange}
                        >
                            <Button shape="circle" title='显示位置' style={RTbtnStyle} icon='environment' size="small"></Button>
                        </Popover>
                        <Button shape="circle" style={RTbtnStyle} icon="minus" size="small" onClick={minimizeAppWindow} />
                        {
                            localStorage.getItem('maxBtn') == 1 ?
                                <div
                                    title="最大化"
                                    style={{ display: 'inline-block' }}
                                >
                                    <Button shape="circle" style={RTbtnStyle} icon="border" size="small" onClick={this.handleMax} />

                                </div>
                                :
                                <div
                                    title="向下还原"
                                    style={{ display: 'inline-block' }}
                                >
                                    <Button shape="circle" style={RTbtnStyle} icon="switcher" size="small" onClick={this.handleMax} />

                                </div>
                        }
                        <Button type="danger" style={RTbtnStyle} shape="circle" icon="close" size="small" onClick={() => closeWindow(dashboardPages)} />
                    </div>
                </div>

                {
                    bShowTimeShaft ?
                        <div className={s[`${contentTimeClass}`]}>
                            <div style={ContentHeaderStyle}>
                                <MenuComponent
                                    menus={menus}
                                    initialize={initialize}
                                    hideLayer={hideLayer}
                                    updateTimeshaftState={updateTimeshaftState}
                                    bShowTimeShaft={bShowTimeShaft}
                                    updateFullPage={updateFullPage}
                                    parmsDict={parmsDict}
                                    closeWindow={closeWindow}
                                    dashboardPages={dashboardPages}
                                    refreshCustomData={refreshCustomData}
                                    refreshCustomDataInModal={refreshCustomDataInModal}
                                    settingTableDataFlagFun={settingTableDataFlagFun}
                                    gMenusFlag={gMenusFlag}
                                    loading={this.props.loading}
                                    historyStart={this.historyStart}
                                    ref={ref => this.child = ref}
                                    scriptRefreshAll={this.props.scriptRefreshAll}
                                />

                            </div>
                            <div className={s['content-inner']}>
                                {children}
                                <div className={s['float-layers']}>
                                    {isHistoryLayerVisible ? <HistoryLayer /> : null}
                                </div>
                                <div className={s['float-layers']}>
                                    {isDebugLayerVisible ? <DebugLayer /> : null}
                                </div>
                            </div>
                        </div>
                        :
                        <div className={s[`${contentClass}`]}>
                            <div style={ContentHeaderStyle}>

                                <MenuComponent
                                    menus={menus}
                                    initialize={initialize}
                                    hideLayer={hideLayer}
                                    updateTimeshaftState={updateTimeshaftState}
                                    bShowTimeShaft={bShowTimeShaft}
                                    updateFullPage={updateFullPage}
                                    parmsDict={parmsDict}
                                    closeWindow={closeWindow}
                                    dashboardPages={dashboardPages}
                                    refreshCustomData={refreshCustomData}
                                    refreshCustomDataInModal={refreshCustomDataInModal}
                                    settingTableDataFlagFun={settingTableDataFlagFun}
                                    gMenusFlag={gMenusFlag}
                                    loading={this.props.loading}
                                    historyStart={this.historyStart}
                                    ref={ref => this.child = ref}
                                    scriptRefreshAll={this.props.scriptRefreshAll}
                                />
                            </div>
                            <div className={s['content-inner']}>
                                {children}
                                <div className={s['float-layers']}>
                                    {isHistoryLayerVisible ? <HistoryLayer /> : null}
                                </div>
                                <div className={s['float-layers']}>
                                    {isDebugLayerVisible ? <DebugLayer /> : null}
                                </div>
                            </div>
                        </div>
                }
                <div style={footerStyle}>
                    <div className={s['footer-content']}>
                        {
                            this.state.modeButtonsList.length != 0 ?
                                <ModeButtonsListView
                                    modeButtonsList={this.state.modeButtonsList}
                                    getModeButtonsList={this.getModeButtonsList}
                                    getModelContent={getModelContent}
                                    saveModelListId={saveModelListId}
                                    showManageModal={showModal}
                                    getAllCalendarWithMode={getAllCalendarWithMode}
                                    loadingCalendar={loadingCalendar}
                                    getTendencyModal={getTendencyModal}
                                    showCommomAlarm={showCommomAlarm}
                                    showMainInterfaceModal={showMainInterfaceModal}
                                    getToolPoint={getToolPoint}
                                />
                                :
                                ''
                        }
                    </div>
                </div>

                <OperationRecordModal
                    visible={modal.type === modalTypes.OPERATION_RECORD_MODAL}
                    onCancel={hideModal}
                />
                <WarningManageLayer
                    visible={isWarningManageVisible}
                    onCancel={toggleWarningManageModal}
                />
                <NetworkManageLayer
                    visible={isNetworkManageVisible}
                    onCancel={toggleNetworkManageModal}
                />

                <MainModal />
                <SecModal />
                <TimeShaft
                    show={dateModal.visible}
                    // dateOptions={this.state.dateOptions}
                    onOk={toggleDateConfigModal}
                    onCancel={toggleDateConfigModal}
                    toggleTimeShaft={toggleTimeShaft}
                />
                <DateConfigModal
                    show={dateModal.visible}
                    // dateOptions={this.state.dateOptions}
                    onOk={toggleDateConfigModal}
                    onCancel={toggleDateConfigModal}
                    toggleTimeShaft={toggleTimeShaft}
                    getTimeArr={getTimeArr}
                    addPoint={addPoint}
                    parmsDict={parmsDict}
                    bShowTimeShaft={bShowTimeShaft}
                    dateProps={dateModal.props}
                    upDateCurValue={upDateCurValue}
                    timeArr={timeArr}
                />
                {/*设备台账模态框*/}
                <DeviceInfo
                    visible={modal.type === modalTypes.DEVICE_MODAL}
                    onCancel={hideModal}
                />
                {/*场景管理模态框*/}
                <SceneView
                    visible={modal.type === modalTypes.SCENE_MODAL}
                    onCancel={hideModal}
                    selectedData={selectedData}
                    showPointModal={showPointModal}
                    addScene={addScene}
                    editScene={editScene}
                    sceneList={sceneList}
                    delScene={delScene}
                    sceneLoading={sceneLoading}
                    getSceneList={getSceneList}
                    handleSimulation={handleSimulation}
                    loadDate={loadDate}
                    savePoint={savePoint}
                    preSavePoint={preSavePoint}
                    changeSceneSavePoint={changeSceneSavePoint}
                    hideModal={hideModal}
                    saveSceneListId={saveSceneListId}
                    selectedId={sceneListSelectedId}
                    selectedName={sceneListSelectedName}
                    searchList={searchList}
                />
                {/* 场景控制面板*/}
                <SceneControlModalView
                    visible={modal.type === modalTypes.SCENE_CONTROL_MODAL}
                    onCancel={hideModal}
                    selectedData={selectedData}
                    showPointModal={showPointModal}
                    addModel={addModel}
                    editModel={editModel}
                    copyModel={copyModel}
                    modelList={modelList}
                    delModel={delModel}
                    modelLoading={modelLoading}
                    modelContentLoading={modelContentLoading}
                    getModelList={getModelList}
                    handleSimulation={handleSimulation}
                    loadDate={loadDate}
                    savePoint={savePoint}
                    hideModal={hideModal}
                    saveModelListId={saveModelListId}
                    selectedId={modelListSelectedId}
                    addModelContent={addModelContent}
                    editModelContent={editModelContent}
                    modelContent={modelContent}
                    getModelContent={getModelContent}
                    delModelContent={delModelContent}
                    getSceneData={getSceneData}
                    SceneDataSource={SceneDataSource}
                    SceneSelectId={SceneSelectId}
                    SceneId={SceneId}
                    SceneLoad={SceneLoad}
                    SceneLoading={SceneDataLoaing}
                    getTendencyModal={getTendencyModal}
                    showCommomAlarm={showCommomAlarm}
                    showMainInterfaceModal={showMainInterfaceModal}
                    getToolPoint={getToolPoint}
                />
                {/* 模式管理模态框*/}
                <ModelManageModalView
                    visible={modal.type === modalTypes.MODEL_MANAGE_MODAL}
                    onCancel={hideModal}
                    selectedData={selectedData}
                    showPointModal={showPointModal}
                    addModel={addModel}
                    editModel={editModel}
                    copyModel={copyModel}
                    modelList={modelList}
                    delModel={delModel}
                    modelLoading={modelLoading}
                    modelContentLoading={modelContentLoading}
                    getModelList={getModelList}
                    handleSimulation={handleSimulation}
                    loadDate={loadDate}
                    savePoint={savePoint}
                    hideModal={hideModal}
                    saveModelListId={saveModelListId}
                    selectedId={modelListSelectedId}
                    addModelContent={addModelContent}
                    editModelContent={editModelContent}
                    modelContent={modelContent}
                    getModelContent={getModelContent}
                    delModelContent={delModelContent}
                    getSceneData={getSceneData}
                    SceneDataSource={SceneDataSource}
                    SceneSelectId={SceneSelectId}
                    SceneId={SceneId}
                    SceneLoad={SceneLoad}
                    SceneLoading={SceneDataLoaing}
                />
                {/*日程模态框*/}
                <ScheduleView
                    visible={modal.type === modalTypes.SCHEDULE_MODAL}
                    onCancel={hideModal}
                    selectedData={selectedData}
                    showPointModal={showPointModal}
                    addSchedule={addSchedule}
                    editSchedule={editSchedule}
                    scheduleData={scheduleData}
                    delSchedule={delSchedule}
                    scheduleLoading={scheduleLoading}
                    searchSchedule={searchSchedule}
                    useSchedule={useSchedule}
                    obtainSchedule={obtainSchedule}
                    nodeData={nodeData}
                    loadDate={loadDate}
                    fetchID={fetchID}
                    scheduleId={scheduleId}
                    ModifySchedule={ModifySchedule}
                    hideModal={hideModal}
                    AddIdSchedule={AddIdSchedule}
                    CheckId={CheckId}
                />

                {/*layout中的模态框*/}
                <UnifyModal
                    conditionDict={conditionDict}
                    operateData={operateData}
                    operateIsLoading={operateIsLoading}
                    operateModalVisible={operateModalVisible}
                    switchHide={switchHide}
                    operateSwitch={operateSwitch}
                    checkboxSetting={checkboxSetting}
                    checkboxHide={checkboxHide}
                />
                {/* 重新连接模态框  */}
                <ReconnectionView
                    resetFailedTime={resetFailedTime}
                    reconnectModal={reconnectModal}
                    parmsDict={parmsDict}
                    hide={hide}
                />
                {/*点趋势模态框 */}
                {/* <TrendView
                    tendencyVisible ={tendencyVisible}
                    tendencyData = {tendencyData}
                    handleCancel = {hideTendencyModal}
           /> */}
                <GuaranteeAddView
                    createGuarantee={createGuarantee}
                    Guarantee={Guarantee}
                    RepairData={RepairData}
                    parmsDict={parmsDict}
                />
                <GuaranteeView
                    SeachGuarantee={SeachGuarantee}
                    SeachGuaranteeVisiable={SeachGuaranteeVisiable}
                    SeachGuaranteeSourceData={SeachGuaranteeSourceData}
                    GuaranteeFixid={GuaranteeFixid}
                />
                <GuaranteeSearchView
                    ViewMessage={ViewMessage}
                    ViewDisplay={ViewDisplay}
                    GuaranteeFixid={GuaranteeFixid}
                    SeachGuaranteeSourceData={SeachGuaranteeSourceData}
                />
                <WeatherHistoryModal
                    visible={modal.type === modalTypes.WEATHERHISTORY_MODAL}
                    onCancel={hideModal}
                />
                {/*报修管理模态框*/}
                {/* <RepairManageModelView
                    visible={modal.type === modalTypes.REPAIR_MANAGEMENT_MODAL}
                    onCancel={ hideModal }
                    RepairDataAction = {RepairDataAction}
                    RepairManageData = {RepairManageData}
                    viewExperience = {viewExperience}
                    ViewMessage = {ViewMessage}
                    getRepairData={getRepairData}
                /> */}
            </div>

        );
    }
}
LayoutView.propTypes = {};

export default LayoutView;


