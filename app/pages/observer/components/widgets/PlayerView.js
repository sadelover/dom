import React, { Component } from 'react'
import {Table} from 'antd'
import Widget from './Widget.js'
import  s from './PlayerView.css';
import  EZUIKit from 'ezuikit-js';

const registerInformation = {
    type : 'player',
    name : '视频组件',
    description : "接入萤石云视频",
}

class PlayerView extends Widget {

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

    componentDidMount() {
        // style只提供基础的组件坐标和宽高，自定义需要增加逻辑
        const {style} = this.props;
        this.setState({style});

        var player = new EZUIKit.EZUIKitPlayer({
            id: 'video-container', // 视频容器ID
            accessToken: this.props.config.accessToken,
            url: this.props.config.url
        });

        player.play();
    }
    

    getContent() {
        const {style} = this.state
        return (
            <div style={style} className={s['table-container']} >
                <div style={style} id="video-container"></div>
            </div>
        )
    }
}

export default PlayerView