import React from 'react';
import {Table, Button, Input ,message,DatePicker} from 'antd';
import s from './RegionalManageView.css'
import InspactAreaView from './inspactArea/containers/InspactAreaContainer'
/*
区域管理
*/
class RegionalManageView extends React.Component{
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }

    render(){
        return (
            <div className={s['container']}>
                <InspactAreaView/>
            </div>
        )
    }
}

export default RegionalManageView