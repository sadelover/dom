import React, { Component } from 'react'
import {Table} from 'antd'
import Widget from './Widget.js'
import  s from './TestComponent.css'

const registerInformation = {
    type : 'test',
    name : '测试组件',
    description : "生成table组件，覆盖canvas对应区域",
}

class TableComponent extends Widget {

    constructor(props){
        super(props)
        
        this.state = {
            style : {}
        }
    }
    /* @override */
    static get type() {
      return registerInformation.type;
    }
    /* @override */
    static get registerInformation() {
      return registerInformation;
    }
    

    getContent() {
        const {style} = this.state
        return (
            <div style={style} className={s['table-container']} >
                测试组件
            </div>
        )
    }
}

export default TableComponent