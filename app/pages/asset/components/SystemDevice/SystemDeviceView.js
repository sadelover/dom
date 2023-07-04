import React from 'react';
import s from './SystemDeviceView.css'
import EquipSystemManageView from './equipSystemManage/containers/EquipSystemManageContainer'

/*
系统设备
*/
class SystemDeviceView extends React.Component{
    constructor(props){
        super(props)
        this.state={
        }
    }

    componentDidMount(){
    }

    render(){
        return (
            <div className={s['container']}>   
                <EquipSystemManageView/>
            </div>
        ) 
    }
}

export default SystemDeviceView