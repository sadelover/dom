import React from 'react'
import { Modal, Button, Spin, Alert, Dropdown, Menu, Popover, Icon } from 'antd'
import { history } from '../../../index';
import http from '../../../common/http';
import s from './LayoutView.css';
import moment from 'moment';
import { modalTypes } from '../../../common/enum';
import ModelText from '../../observer/components/core/entities/modelText';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const MenuDivider = Menu.Divider;
const DropdownButton = Dropdown.Button;

class ModeButtonsListView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }

        this.showModeList = this.showModeList.bind(this);
        this.getCurrentMode = this.getCurrentMode.bind(this);
        this.getMenuMode = this.getMenuMode.bind(this);
        this.getMenuItem = this.getMenuItem.bind(this);
        this.addModeToCalendar = this.addModeToCalendar.bind(this);
        this.modeControlOperation = this.modeControlOperation.bind(this);
        this.manualMode = this.manualMode.bind(this);
        this.getManalMenuItem = this.getManalMenuItem.bind(this);
        this.linkManageModal = this.linkManageModal.bind(this);
    }

    manualMode(list) {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            let flag = 0
            if (localStorage.getItem('projectRightsDefine') != undefined) {
                let modeRights = JSON.parse(localStorage.getItem('projectRightsDefine')).modeRights
                for (let item in modeRights) {
                    if (item == list.type) {
                        if (modeRights[item].blockControlUsers && modeRights[item].blockControlUsers[0] != undefined) {
                            modeRights[item].blockControlUsers.map(item2 => {
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
                Modal.confirm({
                    title: '手动模式',
                    content: `是否确认将${list.name}运行模式切换为手动模式，注意切换后会清除当前${list.name}运行模式。`,
                    onOk: () => {
                        for (let i = 0; i < list.modeList.length; i++) {
                            if (list.modeList[i].active === 1)
                                var modeId = list.modeList[i].modeId
                        }
                        http.post('/calendar/removeModeFromCalendar', {
                            "modeId": modeId,
                            "date": moment().locale('zh-cn').format('YYYY-MM-DD'),
                            "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
                        }).then(
                            data => {
                                if (!data.err) {
                                    //主动更新一次模式列表内容
                                    this.props.getModeButtonsList()
                                    //写入操作记录
                                    this.modeControlOperation(list.name)
                                    //修改模式后，主动更新日历界面
                                    this.props.loadingCalendar(true)
                                    this.props.getAllCalendarWithMode(moment())
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
            }
        } else {
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
        }
    }


    modeControlOperation(typeModeName, modeName = "手动模式") {
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

    addModeToCalendar(list, modeInfo) {
        if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
            let flag = 0
            if (localStorage.getItem('projectRightsDefine') != undefined) {
                let modeRights = JSON.parse(localStorage.getItem('projectRightsDefine')).modeRights
                for (let item in modeRights) {
                    if (item == list.type) {
                        if (modeRights[item].blockControlUsers && modeRights[item].blockControlUsers[0] != undefined) {
                            modeRights[item].blockControlUsers.map(item2 => {
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
                Modal.confirm({
                    title: '模式切换',
                    content: `是否确认将${list.name}运行模式切换为${modeInfo.name}，注意切换后可能会产生设备动作。`,
                    onOk: () => {
                        http.post('/calendar/addModeToCalendar', {
                            "modeId": modeInfo.modeId,
                            "date": moment().locale('zh-cn').format('YYYY-MM-DD'),
                            "type": modeInfo.type,
                            "creator": modeInfo.creator,
                            "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
                        }).then(
                            data => {
                                if (!data.err) {
                                    //主动更新一次模式列表内容
                                    this.props.getModeButtonsList()
                                    //写入操作记录
                                    this.modeControlOperation(list.name, modeInfo.name)
                                    //修改模式后，主动更新日历界面
                                    this.props.loadingCalendar(true)
                                    this.props.getAllCalendarWithMode(moment())
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
            }
        } else {
            Modal.info({
                title: '提示',
                content: '用户权限不足'
            })
        }
    }

    onContextMenu = (e,id) => {
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
        e.offsetX = e.clientX - 5
        e.offsetY = e.clientY - 80

        let name = 'dom_system_mode_of_sys'+id
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

    getMenuItem(menuList, modeGroup) {
        return menuList.map((item, i) => {
            if (item.active === 1) {
                if (item.description != '') {
                    return (
                        <MenuItem key={i}>
                            <Popover placement="right" content={(<pre style={{ backgroundColor: "#29304A" }}>{item.description}</pre>)} >
                                <span style={{ display: 'inline-block', width: '20px' }} >
                                    {item.modeId}
                                </span>
                                <Button type="primary" style={{ height: '100%', width: JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ? '81%' : '100%' }} onClick={() => { this.addModeToCalendar(modeGroup, item) }}>{item.name}</Button>
                                {
                                    JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ?
                                        <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: '3%'
                                            }}
                                            onClick={() => { this.linkManageModal(item) }}
                                        ></Icon>
                                        :
                                        ''
                                }
                            </Popover>

                        </MenuItem>
                    )
                } else {
                    return (<MenuItem key={i}>
                        <span style={{ display: 'inline-block', width: '20px' }} >
                            {item.modeId}
                        </span>
                        <Button type="primary" style={{ height: '100%', width: JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ? '81%' : '100%' }} onClick={() => { this.addModeToCalendar(modeGroup, item) }} >{item.name}</Button>
                        {
                            JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ?
                                <Icon
                                    type="edit"
                                    style={{
                                        cursor: 'pointer',
                                        marginLeft: '3%'
                                    }}
                                    onClick={() => { this.linkManageModal(item) }}
                                ></Icon>
                                :
                                ''
                        }
                    </MenuItem>)
                }
            } else {
                if (item.description != '') {
                    return (
                        <MenuItem key={i}>
                            <span style={{ display: 'inline-block', width: '20px' }} >
                                {item.modeId}
                            </span>
                            <Popover placement="right" content={(<pre style={{ backgroundColor: "#29304A" }}>{item.description}</pre>)} >
                                <Button style={{ height: '100%', width: JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ? '81%' : '100%' }} onClick={() => { this.addModeToCalendar(modeGroup, item) }} >{item.name}</Button>

                                {
                                    JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ?
                                        <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: '3%'
                                            }}
                                            onClick={() => { this.linkManageModal(item) }}
                                        ></Icon>
                                        :
                                        ''
                                }
                            </Popover>
                        </MenuItem>
                    )
                } else {
                    return (
                        <MenuItem key={i}>
                            <span style={{ display: 'inline-block', width: '20px' }} >
                                {item.modeId}
                            </span>
                            <Button style={{ height: '100%', width: JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ? '81%' : '100%' }} onClick={() => { this.addModeToCalendar(modeGroup, item) }} >{item.name}</Button>
                            {
                                JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level ?
                                    <Icon
                                        type="edit"
                                        style={{
                                            cursor: 'pointer',
                                            marginLeft: '3%'
                                        }}
                                        onClick={() => { this.linkManageModal(item) }}
                                    ></Icon>
                                    :
                                    ''
                            }
                        </MenuItem>
                    )
                }
            }
        })
    }

    getManalMenuItem(menuList, modeGroup) {
        return menuList.map((item, i) => {
            if (item.active === 1) {
                return (<MenuItem key={menuList.length}>
                    <Button style={{ height: '100%', width: '100%', color: 'rgb(201,201,201)' }} onClick={() => { this.manualMode(modeGroup) }}>手动模式</Button>
                </MenuItem>
                )
            } else {
                if (i == menuList.length - 1) {
                    return (
                        <MenuItem key={menuList.length}>
                            <Button type="primary" style={{ height: '100%', width: '100%', color: 'rgb(201,201,201)' }} onClick={() => { this.manualMode(modeGroup) }}>手动模式</Button>
                        </MenuItem>
                    )
                }


            }
        })
    }

    getMenuMode(modeGroup) {
        if (modeGroup.modeList.length != 0) {
            return (
                <Menu>
                    {this.getMenuItem(modeGroup.modeList, modeGroup)}
                    {this.getManalMenuItem(modeGroup.modeList, modeGroup)}
                </Menu>
            )
        }
    }

    getCurrentMode(modeGroup) {
        let button = (

            <Button style={{ borderRadius: '5px', marginRight: '15px', color: 'rgb(201,201,201)' }} onContextMenu={(e)=>this.onContextMenu(e,modeGroup.type)}><span className={s['footer-button-span']}>{modeGroup.name}</span>手动模式</Button>
        )
        if (modeGroup.modeList.length != 0) {
            modeGroup.modeList.forEach((item, i) => {
                if (item.active === 1) {
                    button = (<Button style={{ borderRadius: '5px', marginRight: '15px' }} onContextMenu={(e)=>this.onContextMenu(e,modeGroup.type)}><span className={s['footer-button-span']}>{modeGroup.name}</span>{item.name}</Button>)
                }
            })
        }
        return button
    }

    showModeList() {
        if (this.props.modeButtonsList.length != 0) {
            return this.props.modeButtonsList.map(group => {
                let flag = 0
                if (localStorage.getItem('projectRightsDefine') != undefined) {
                    let modeRights = JSON.parse(localStorage.getItem('projectRightsDefine')).modeRights
                    for (let item in modeRights) {
                        if (item == group.type) {
                            if (modeRights[item].blockVisitUsers && modeRights[item].blockVisitUsers[0] != undefined) {
                                modeRights[item].blockVisitUsers.map(item2 => {
                                    if (JSON.parse(window.localStorage.getItem('userData')).name == item2) {
                                        flag = 1
                                    }
                                })
                            }
                        }
                    }
                }
                if (flag == 0) {
                    return (<Dropdown overlay={this.getMenuMode(group)} trigger={['click']}>
                        {this.getCurrentMode(group)}
                    </Dropdown>)
                }
            })
        }
    }

    //跳转模式管理弹框
    linkManageModal(mode) {
        this.props.showManageModal(modalTypes.MODEL_MANAGE_MODAL)
        this.props.saveModelListId([mode.modeId], mode.name)
        this.props.getModelContent(mode.modeId)
    }

    render() {
        const { modeButtonsList } = this.props
        return (
            <div>
                {this.showModeList()}
            </div>

        )
    }

}

export default ModeButtonsListView