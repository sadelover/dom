import React from 'react'

import s from './PageContentView.css'
import DeviceManageView from "../containers/DeviceManageContainer"
import SystemDeviceView from "../containers/SystemDeviceContainer"
import RegionalManageView from "../containers/RegionalManageContainer"
import TemplateManage from "../containers/TemplateManageContainer"

let ContentStyle;
if(localStorage.getItem('serverOmd')=="best"){
    ContentStyle={
        background:"RGB(255,255,255)"
    }
}

class PageContentView extends React.Component{

    constructor(props){
        super(props)
        
        this.getContentPage = this.getContentPage.bind(this)
    }

    getContentPage(){
        const {selectedKey,modal} = this.props
 
        if( selectedKey === 'deviceManage' ){
            return <DeviceManageView/>
        }else if( selectedKey === 'systemDevice' ){
            return <SystemDeviceView/>
        }else if( selectedKey === 'regionalManage' ){
            return <RegionalManageView/>
        }else if( selectedKey === 'templateManage' ){
            return <TemplateManage/>
        }else{
            return null
        }
    }

    render(){
        return (
            <div className={s['pagecontent-container']} style={ContentStyle} >
                {this.getContentPage()}
            </div>
        )
    }
}

export default PageContentView