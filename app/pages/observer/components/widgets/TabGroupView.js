import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import s from './RingView.css';
import { DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Progress} from 'antd';
import moment from 'moment'

 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'tab',
    name : '切换组件组件',
    description : "生成切换组件组件",
}

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
           
        }     
        this.getButtons = this.getButtons.bind(this)
        this.changeView = this.changeView.bind(this)
    }

    componentWillReceiveProps(nextProps){
        
    }
  
    componentWillMount(){
    
    }

    componentDidMount() {
        this.props.config.buttons.map((item,index)=>{
            if(index==0){
                document.getElementById(item.id).style.visibility=''
            }else{
                document.getElementById(item.id).style.visibility='hidden'
            }
        })
    }

    getButtons(){
        return this.props.config.buttons.map((item,index)=>{
            return <Button onClick={()=>{this.changeView(item.id)}}>{item.name}</Button>
        })
    }

    changeView(id){
        this.props.config.buttons.map((item,index)=>{
            if(item.id==id){
                document.getElementById(item.id).style.visibility=''
            }else{
                document.getElementById(item.id).style.visibility='hidden'
            }
        })
    }

    render() {
        return (
           
                <div>
                    {this.getButtons()}
                </div>
           
        )
    }
}


//const efficiencyChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class TabGroupViewComponent extends Widget {
    
    constructor(props){
        super(props)
        this.state = {
            style : {},
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
        const {style} = this.props
        this.setState({style})
    }
    /* @override */
    getContent() {
        const {style} = this.state
        
        return (
            <div style={style} className={s['container']} >
                <FormWrap

                    {...this.props}
                    
                />
            </div>
        )
    }
}

export default  TabGroupViewComponent


