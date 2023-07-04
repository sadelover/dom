import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import { Modal,DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Progress} from 'antd';
import moment from 'moment'
import s from './RingView.css';
import Item from 'antd/lib/list/Item';

 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'EfficiencyRank',
    name : '横向叠加柱状图',
    description : "能效排名组件",
}

var xAxisData = [];
var thisdayeff = [];
var thisdayeff_ch = [];
var thisdayeff_prichwp = [];
var thisdayeff_secchwp = [];
var thisdayeff_cwp = [];
var thisdayeff_ct = [];

class FormWrap extends React.Component {
    constructor(props){
        super(props)
        this.state={
            data:[]
        }
        this.chart = null;
        this.container = null;
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);   
        this.getChartData = this.getChartData.bind(this);
        this.getChartOption = this.getChartOption.bind(this)
    }
    static get defaultProps() {
      return {
        points: []
  
      }
    }
    componentWillReceiveProps(nextProps){
    }
    componentWillMount(){
        this.getChartData();
    }
    componentDidMount() {
        this.getChartData();
    }
    saveChartRef(refEchart) {
        if (refEchart) {
          this.chart = refEchart.getEchartsInstance();
        } else {
          this.chart = null;
        }
    }

    getChartData() {
        http.post('/project/getWorkConditionByProjectTimeRange', {
            "timeFrom":"2000-01-01 00:00:00",
            "timeTo":"2000-01-01 00:00:00",
            "sortColumn": 16
        }).then(
            data => {
                console.log(data);
                console.log(data.data.sortResut);
                if (!this.container) {
                    return;
                }
                if (data.err) {
                    Modal.error({
                        title:'错误提示',
                        content:data.msg
                    });
                }
                this.setState({
                    data: data.data.sortResut
                });
                xAxisData = [];
                thisdayeff_ch = [];
                thisdayeff_prichwp = [];
                thisdayeff_secchwp = [];
                thisdayeff_cwp = [];
                thisdayeff_ct = [];
                this.state.data.map((item,row)=>{
                    thisdayeff_ch.push(item[16]);
                    thisdayeff_prichwp.push(item[17]);
                    thisdayeff_secchwp.push(item[18]);
                    thisdayeff_cwp.push(item[20]);
                    thisdayeff_ct.push(item[21]);
                    if (this.props.config.projectName == item[1]){
                        xAxisData.push(String(row+1)+"(本项目)");
                    }else {
                        xAxisData.push(String(row+1));
                    }
                    
                })
            }
        ).catch(
            () => {
              if (!this.container) {
                return;
              }
              this.setState({
                loading: false,
                data: []
              });
            }
        )
    }

    getChartOption(){




        return{
            backgroundColor: '#eee',
            // legend: {
            //     data: ['bar', 'bar2', 'bar3', 'bar4'],
            //     left: 10
            // },
            tooltip: {},
            xAxis: {
                data: xAxisData,
                name: '效率排名',
                axisLine: {onZero: true},
                splitLine: {show: false},
                splitArea: {show: false}
            },
            yAxis: {
                inverse: false,
                name:"机房总效率kW/ton"

            },
            grid: {
                left: 100
            },
            series: [
                {
                    name: '冷机效率',
                    type: 'bar',
                    stack: 'one',
                    barGap:'-100%',
                    data: thisdayeff_ch
                },
                {
                    name: '一次泵效率',
                    type: 'bar',
                    stack: 'one',
                    data: thisdayeff_prichwp
                },
                {
                    name: '二次泵效率',
                    type: 'bar',
                    stack: 'one',
                    data: thisdayeff_secchwp
                },
                {
                    name: '冷却泵效率',
                    type: 'bar',
                    stack: 'one',
                    data: thisdayeff_cwp
                },
                {
                    name: '冷却塔效率',
                    type: 'bar',
                    stack: 'one',
                    data: thisdayeff_ct
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
class EfficiencyRankComponent extends Widget {
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
export default  EfficiencyRankComponent


