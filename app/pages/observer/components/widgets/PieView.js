import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import { DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Progress} from 'antd';
import moment from 'moment'
import s from './RingView.css';

 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'pie',
    name : '饼图',
    description : "饼图组件",
}

class FormWrap extends React.Component {
    constructor(props){
        super(props)
        this.state={
           tableData:'',
           pointvalue:[],
           textList:[],
           realtimeData:[]
        }
        this.chart = null;
        this.container = null;
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);   
    }
    static get defaultProps() {
      return {
        points: [],
        data:[]
      }
    }
    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        this.setState({
            realtimeData:custom_realtime_data
        })  
    }
    componentWillMount(){}
    componentDidMount() {}
    saveChartRef(refEchart) {
        if (refEchart) {
          this.chart = refEchart.getEchartsInstance();
        } else {
          this.chart = null;
        }
    }
    getChartOption(){
        const { config,custom_realtime_data} = this.props
        //处理中文注释
        let ChineseNote = []
        let RingData = []
        if(config.itemList!==undefined){
            for (let i = 0; i < config.itemList.length; i++) {
                ChineseNote.push(config.itemList[i].itemName)
                for (let j = 0; j < custom_realtime_data.length; j++) {
                    if(config.itemList[i].pointName===custom_realtime_data[j].name){
                        let obj = {}
                        obj['value']= parseInt(custom_realtime_data[j].value)
                        obj['name'] = config.itemList[i].itemName
                        RingData.push(obj)
                    }
                }
            }
        }
        var legend = {}
        //配置文字标题位置
        if(config.legendPosition!==undefined){
            if(parseInt(config.legendPosition)==0){
                legend['data'] = ChineseNote
            }else if(parseInt(config.legendPosition)==1){
                legend['data'] = ChineseNote
                legend['orient'] = 'vertical'
                legend['right'] = 10
                legend['top'] = 0
            }else if(parseInt(config.legendPosition)==2){
                legend['data'] = ChineseNote
                legend['orient'] = 'vertical'
                legend['left'] = 10
                legend['top'] = 0
            }else{
                legend['data'] = ChineseNote
            }
        }
        return{
            tooltip: {
                trigger: 'item',
                formatter: '{b} : {c} ({d}%)'
            },
            title:{
               text:`${config.title}`,
               left:'center',
               padding:[25,0,0,0]
            },
            legend:legend,
            series: [
                {
                    name:'访问来源',
                    type:'pie',
                    selectedMode:'single',
                    radius:[`${config.style==='0'?'0':'25%'}`,'50%'],
                    label: {
                        normal: {
                            formatter: '{b}:{c} 占比: {per|{d}%}',
                            show:parseInt(config.percentVisible)===0?false:true,
                            position:'outside',
                            rich: {
                                per: {
                                    color: '#eee',
                                    backgroundColor: '#334455',
                                    padding: [2,2],
                                    borderRadius: 2
                                }
                            }
                        },
                    },
                    labelLine:{
                        show:true
                    },
                    data: RingData
                }
            ]
        }
    }
    // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }
    render() {
        const {style} = this.props
        return(
            <div style={{width:`${style.width}`,height:`${style.height}`}} ref={this.saveContainerRef}>
                <ReactEcharts
                    style={{height:'100%',width:'100%'}}
                    ref={this.saveChartRef}
                    option={this.getChartOption()}
                    notMerge={true}
                />
            </div>
        )
    }
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class PieViewComponent extends Widget {
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
            <div style={style} className={s['container']}>
                <FormWrap
                    {...this.props}
                />
            </div>
        )
    }
}
export default  PieViewComponent


