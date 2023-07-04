import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import s from './RingView.css';
import { DatePicker,Row,Col, Form ,Button ,Modal, Select ,message,Spin,Input,Layout,Table,Progress,Slider} from 'antd';
import moment from 'moment'
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'ProcessSlider',
    name : '进度条组件',
    description : "生成进度条组件",
}
const marks = {
    0: '0%',
    100:'100%',
};
class FormWrap extends React.Component {
    constructor(props){
        super(props)
        this.state = {
           pointvalue:0,
           value:null
        } 
        this.onAfterChange = this.onAfterChange.bind(this)
        this.onChange = this.onChange.bind(this)
        this.formatter = this.formatter.bind(this)
    }
    static get defaultProps() {
      return {
        points: [],
        data:[]
      }
    }
    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        let value = 0
        if (custom_realtime_data.length != 0) {
            value = parseFloat(custom_realtime_data.filter(item=>item.name === nextProps.bindPoint)[0].value)
        }
        if(this.state.pointvalue==value){
            return false
        }else{
            this.setState({
                pointvalue:value,
            })
        }
    }
    onAfterChange(value){
        let pointName = this.props.config.point
        let _this = this
        Modal.confirm({
                    title:"确认指令",
                    content:"是否确定修改阀位开度",
                    onOk:()=>{
                        _this.setState({
                            value:null,
                            pointvalue:value
                        })
                        http.post('/pointData/setValue',{
                                pointList:[pointName],
                                valueList:[value.toString()],
                                source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
                            }).then(
                                data=>{
                                    _this.setState({
                                    value:null
                                  })
                                }
                            )
                    },
                    onCancel:()=>{
                         _this.setState({
                             value:null
                         })
                    }
                })
    }
    onChange(value){
        this.setState({
            value:value
        })
    }
    formatter(value){
        return `${value}%`
    }
    render() {
        const {value,pointvalue} = this.state
        return (
           <div id="observerProcessSliderView">
                 <Input
                  
                  
                 />
           </div>
        )
    }
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * @class LineChartComponent
 * @extends {Widget}
 */
class ProcessSliderView extends Widget{
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
export default  ProcessSliderView


