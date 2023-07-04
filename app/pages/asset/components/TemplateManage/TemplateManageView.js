import React from 'react';
import {Table, Button, Input ,message,DatePicker} from 'antd';
import s from './TemplateManageView.css'
import TemplateManageView from './templateManage/containers/TemplateManageContainer'
/*
模板管理
*/
class TemplateManage extends React.Component{
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }

    render(){
        return (
            <div className={s['container']}>
                <TemplateManageView/>
            </div>
        )
    }
}

export default TemplateManage