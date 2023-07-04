import React from 'react';
import {Table, Button, Input ,message,DatePicker} from 'antd';
import s from './DeviceManageView.css'
import DeviceManageView2 from './deviceManage/containers/DeviceManageContainer'
/*
设备管理
*/
class DeviceManageView extends React.Component{
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }

    render(){
        return (
            <div className={s['container']}>
                <DeviceManageView2/>
            </div>
        )
    }
}

export default DeviceManageView