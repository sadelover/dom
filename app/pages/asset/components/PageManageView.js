import React from 'react'

import s from './PageManageView.css'
import { Menu, Icon } from 'antd';
const MenuItem = Menu.Item

/**
 * 页面导航栏容器
 * 
 * @class PageManageView
 * @extends {React.Component}
 */

 let MenuStyle,MenuItemStyle,toggleClass;
if(localStorage.getItem('serverOmd')=="best"){
    MenuStyle={
        background:"RGB(240,240,240)",
        color:"#000"
    }
    MenuItemStyle={
        borderBottom:"1px solid RGB(155,155,155)"
    }

}
if(localStorage.getItem('serverOmd')=="persagy"){
    MenuStyle={
        background:"rgba(255,255,255,1)",
        color:"rgba(31,35,41,1)",
        textAlign:'center'
    }
    MenuItemStyle={
        border:"1px solid #EEEEEE",
        borderRight:"0px",
        borderRight:'0px',
        fontSize:"16px",
        fontFamily:"MicrosoftYaHei",
    }
    toggleClass='persagy-menu'
}

class PageManageView extends React.Component{
    constructor(props){
        super(props)
        
        this.choseMenuItem = this.choseMenuItem.bind(this)
    }
    //切换页面
    choseMenuItem = (value) => {
        this.props.choseMenuItem(value.key)
    }

    render(){
        return (
            <div className={s['pagemanage-container']}>
                <Menu 
                    className={toggleClass}
                    selectedKeys={[this.props.selectedKey]}
                    onClick={this.choseMenuItem}
                    style={MenuStyle}
                >  
                    <MenuItem key="deviceManage" style={MenuItemStyle}>设备管理</MenuItem>
                    <MenuItem key="systemDevice" style={MenuItemStyle}>系统管理</MenuItem>
                    <MenuItem key="regionalManage" style={MenuItemStyle}>区域管理</MenuItem>
                    <MenuItem key="templateManage" style={MenuItemStyle}>模板管理</MenuItem>
                </Menu>
            </div>
        )
    }
}

export default PageManageView