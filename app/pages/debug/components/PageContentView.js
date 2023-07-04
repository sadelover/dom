import React from 'react'

import s from './PageContentView.css'
import DataManagePage from '../containers/DataManagePageContainer'
import DataImportManageView from '../components/dataImportManage/DataImportManageView'
import LogView from "../containers/LogViewContainer"
import ConfigView from '../containers/ConfigContainer'
import GlobalConfigView from '../containers/GlobalConfigContainer';
import WatchView from '../components/pointWatch/WatchView'
import StrategicManageView from '../components/strategicManage/StrategicManageContainer';
import PolicyQueryManage from '../containers/PolicyQueryContainer'
import OmUpdateView from '../components/omUpdate/OmUpdateView'
import ReportProgressView from '../components/reportProgressManage/ReportProgressView'

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
        const {selectedKey} = this.props

        if( selectedKey === 'dataManage' ){
            return <DataManagePage/>
        }else if( selectedKey === 'pointWatch' ){
            return <WatchView/>
        }else if( selectedKey === 'logInfo' ){
            return <LogView/>
        }else if( selectedKey === 'projConfig' ){
            return <ConfigView/>
        }else if( selectedKey === 'globalConfig' ){
            return <GlobalConfigView/>
        }else if (selectedKey === 'strategicManage') {
          return <StrategicManageView/>
        }else if (selectedKey === 'PolicyQueryManage') {
            return <PolicyQueryManage/>
        }else if (selectedKey === 'dataImportManage') {
            return <DataImportManageView/>
        }else if (selectedKey === 'omUpdate') {
            return <OmUpdateView/>
        }else if (selectedKey === 'reportProgressManage') {
            return <ReportProgressView/>
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