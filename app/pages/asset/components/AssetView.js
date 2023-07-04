
import React from 'react'
import s from './AssetView.css'

import PageManageView from './PageManageView'
import PageContentView from './PageContentView'

let leftSiderStyle,containerClass;
if(localStorage.getItem('serverOmd')=="best"){
    leftSiderStyle={
        background:"RGB(240,240,240)",
        borderRight:"1px solid RGB(155,155,155)"
    }
   
}
if(localStorage.getItem('serverOmd')=="persagy"){
    containerClass = 'persagy-container'
    leftSiderStyle={
        background:"#fff",
        borderRight:"1px solid #EEEEEE"
    }
} else {
    containerClass = 'container'    
}


class AssetView extends React.Component{
    constructor(props) {
      super(props);
  
      this.state = {
  
      };
    }
    render(){
        const {debugVisible,selectedKey} = this.props.base
        const {
            choseMenuItem,
            dataManageReset,
            logReset
        } = this.props
        // if(!debugVisible){
        //     return null
        // }

        return (
            <div className={s[`${containerClass}`]}>
                <div className={s['left-sider']} style={leftSiderStyle}>
                    <div className={s['sider-content']}>
                        <PageManageView
                            selectedKey={selectedKey}
                            choseMenuItem={choseMenuItem}
                            dataManageReset={dataManageReset}
                            logReset={logReset}
                        />
                    </div>
                </div>
                <div className={s['content']}>
                    <PageContentView
                        selectedKey={selectedKey}
                    />
                </div>
            </div>
        )
    }
}

export default AssetView