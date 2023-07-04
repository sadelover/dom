import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './efficiencyChartView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';
import {modalTypes} from '../../../../common/enum'
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
// import efficiencySetModalView from './efficiencySetModal'


import { DatePicker , Form ,Button ,Select ,message,Spin,Icon,Modal,Input,Switch,Row,Col} from 'antd';
import moment from 'moment'

const { MonthPicker,RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option

const getTimeRange = function (period) {
    let startTime, endTime;
  
    switch(period) {
      case 'today':
        startTime = moment().startOf('day');
        endTime = moment();
        break;
      case 'thisweek':
        startTime = moment().startOf('week');
        endTime = moment();
        break;
      case 'month':
        startTime = moment().startOf('month')
        endTime = moment();
        break;
    }
    return [startTime, endTime];
}

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'efficiency',
    name : '冷机散点图图组件',
    description : "生成efficiency组件",
}
let option = {};

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state = {
            data: [],
            xdata:[],
            loading : false,
            inputValue:0,
            input:'',
            xmax:0,
            visible:false,
            data1:[],
            data2:[],
            data3:[],
            data4:[],
            data5:[],
            data6:[],
            data7:[],
            days1:[],
            days2:[],
            days3:[],
            days4:[],
            days5:[],
            days6:[],
            days7:[],
            flag:false,
            f:false,
            date:'',
            day:[],
            days:[],
            months:[]
        }

        this.chart = null;
        this.container = null;
    
        this.getChartData = this.getChartData.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.handleChange=this.handleChange.bind(this);
        this.onSetting = this.onSetting.bind(this);
        this.hide = this.hide.bind(this);
        this.affectoi = this.affectoi.bind(this);
    }

    static get defaultProps() {
      return {
        points: [],
        data:[]
      }
    }
     
    
    componentWillMount(){
        
        this.getChartData();
      
    }
    // componentWillReceiveProps(){
        
    //       this.getChartData();
        
    //   }
    // echart data
    getChartData() {
        //const {name} = this.props.config.bindname
        this.setState({
            loading: true
        });

        http.post('/dataSample/getIO', {
            "sampleName":this.props.config.bindname//"Ch06Eff"//
        }).then(
            (data)=> {
                 if (!this.container) {
                     throw new Error('Error: the instance of container is undefined')
                 }
                if (data.error) {
                    throw new Error(data.msg)
                }

                this.setState({
                    loading: false,
                    data: data.data
                });
            }
        ).catch(
            () => {
                this.setState({
                    loading: false,
                    data: []
                });
            }
        )
    }
    affectoi(a1,a11,a2,a22,a3,a33,a4,a44,a5,a55,a6,a66,a7,a77,f,date,timeStart,timeEnd){
        let data = this.state.data;
        let data1 = [];
        let data2 = [];
        let data3 = [];
        let data4 = [];
        let data5 = [];
        let data6 = [];
        let data7 = [];
        let datas = [];
        let yData1 = [];
        let yData2 = [];
        let yData3 = [];
        let yData4 = [];
        let yData5 = [];
        let yData6 = [];
        let yData7 = [];
        let data11 = [];
        let data22 = [];
        let data33 = [];
        let data44 = [];
        let data55 = [];
        let data66 = [];
        let data77 = [];
        let flag1 = false;
        let flag2 = false;
        let flag3 = false;
        let flag4 = false;
        let flag5 = false;
        let flag6 = false;
        let flag7 = false;
        let b1 = a1==undefined?"":a1;
        let b2 = a2==undefined?"":a2;
        let b3 = a3==undefined?"":a3;
        let b4 = a4==undefined?"":a4;
        let b5 = a5==undefined?"":a5;
        let b6 = a6==undefined?"":a6;
        let b7 = a7==undefined?"":a7;
        let b11 = a1==undefined?"":a11;
        let b22 = a1==undefined?"":a22;
        let b33 = a1==undefined?"":a33;
        let b44 = a1==undefined?"":a44;
        let b55 = a1==undefined?"":a55;
        let b66 = a1==undefined?"":a66;
        let b77 = a1==undefined?"":a77;

        
            for(let i=0;i<data.length;i++){
             flag1 = (data[i].input01=="")||(parseFloat(data[i].input01)>=b1&&parseFloat(data[i].input01)<=b11);
             flag2 = (data[i].input02=="")||(parseFloat(data[i].input02)>=b2&&parseFloat(data[i].input02)<=b22);
             flag3 = (data[i].input03=="")||(parseFloat(data[i].input03)>=b3&&parseFloat(data[i].input03)<=b33);
             flag4 = (data[i].input04=="")||(parseFloat(data[i].input04)>=b4&&parseFloat(data[i].input04)<=b44);
             flag5 = (data[i].input05=="")||(parseFloat(data[i].input05)>=b5&&parseFloat(data[i].input05)<=b55);
             flag6 = (data[i].input06=="")||(parseFloat(data[i].input06)>=b6&&parseFloat(data[i].input06)<=b66);
             flag7 = (data[i].input07=="")||(parseFloat(data[i].input07)>=b7&&parseFloat(data[i].input07)<=b77);
            if(b1==''||b11==''||b1>b11){
                data1.push(data[i])
            }else if(flag1){
                //
                data1.push(data[i])
            }
            if(b2==''||b22==''||b2>b22){

            }else if(!flag2){
                data1=[];
            }
            if(b3==''||b33==''||b3>b33){
                
            }else if(!flag3){
                data1=[];
            }
            if(b4==''||b44==''||b4>b44){
                
            }else if(!flag4){
                data1=[];
            }
            if(b5==''||b55==''||b5>b55){
                
            }else if(!flag5){
                data1=[];
            }
            if(b6==''||b66==''||b6>b66){
                
            }else if(!flag6){
                data1=[];
            }
            if(b7==''||b77==''||b7>b77){
                
            }else if(!flag7){
                data1=[];
            }
           if(data1.length==1){
               datas.push(data1[0]);
           }
           data1=[];
        }
        for(let i=0;i<datas.length;i++){
            yData1.push(((datas[i].output01)/(datas[i].input05))==Infinity?0:(datas[i].output01)/(datas[i].input05));
            data1.push([datas[i].input01,yData1[i]]);
            data2.push([datas[i].input02,yData1[i]]);
            data3.push([datas[i].input03,yData1[i]]);
            data4.push([datas[i].input04,yData1[i]]);
            data5.push([datas[i].input05,yData1[i]]);
            data6.push([datas[i].input06,yData1[i]]);
            data7.push([datas[i].input07,yData1[i]]);
        }
        this.setState({
            f:f,
            flag:true,
            datas:datas,
            data1:data1,
            data2:data2,
            data3:data3,
            data4:data4,
            data5:data5,
            data6:data6,
            data7:data7,
            date:date
        })
    
    
    if(f){
        let days = moment(timeEnd)-moment(timeStart);
        let day = [];
        let day1 = [];
        let day2 = [];
        let day3 = [];
        let day4 = [];
        let day5 = [];
        let day6 = [];
        let day7 = [];
        let days1 = [];
        let days2 = [];
        let days3 = [];
        let days4 = [];
        let days5 = [];
        let days6 = [];
        let days7 = [];
        let daysData = [];
        let daysData1 = [];
        let daysData2 = [];
        let daysData3 = [];
        let daysData4 = [];
        let daysData5 = [];
        let daysData6 = [];
        let daysData7 = [];
        // datas = this.state.datas;
        switch(date){
            case "日":
            
            days = days/(1000*60*60*24);
            
            //组装日期数组
            for(let i=0;i<=days;i++){
                day.push(moment(timeStart).subtract(-i,'days').format('YYYY-MM-DD'))
             }
             //组装删选过时间的数据
            for(let i=0;i<=days;i++){
                for(let j=0;j<datas.length;j++){
                    if(moment(datas[j].timeFrom).format('YYYY-MM-DD')==moment(timeStart).subtract(-i,'days').format('YYYY-MM-DD')){
                        yData2.push(((datas[j].output01)/(datas[j].input05))==Infinity?0:(datas[j].output01)/(datas[j].input05));
                        day1.push([datas[j].input01,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                        day2.push([datas[j].input02,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                        day3.push([datas[j].input03,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                        day4.push([datas[j].input04,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                        day5.push([datas[j].input05,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                        day6.push([datas[j].input06,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                        day7.push([datas[j].input07,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                    }
                }
                daysData1.push(day1);
                day1=[];
                daysData2.push(day2);
                day2=[];
                daysData3.push(day3);
                day3=[];
                daysData4.push(day4);
                day4=[];
                daysData5.push(day5);
                day5=[];
                daysData6.push(day6);
                day6=[];
                daysData7.push(day7);
                day7=[];
            }
            
            
         
        
            this.setState({
                day:day,
                days1:daysData1,
                days2:daysData2,
                days3:daysData3,
                days4:daysData4,
                days5:daysData5,
                days6:daysData6,
                days7:daysData7
            });break;
            case "月":
                    
                    let monthStart = moment(timeStart).month()+1;
                    let monthEnd = moment(timeEnd).month()+1;
                    let months = monthEnd-monthStart;
                    let month = [];
                    let monthData =  [];
                    for(let i=0;i<=months;i++){
                        month.push(monthStart+i+"月");
                        monthData.push(monthStart+i)
                    }
                    for(let i=0;i<month.length;i++){
                        for(let j=0;j<datas.length;j++){
                            if(moment(datas[j].timeFrom).month()==(monthData[i]-1)){
                                yData2.push(((datas[j].output01)/(datas[j].input05))==Infinity?0:(datas[j].output01)/(datas[j].input05));
                                day1.push([datas[j].input01,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day2.push([datas[j].input02,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day3.push([datas[j].input03,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day4.push([datas[j].input04,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day5.push([datas[j].input05,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day6.push([datas[j].input06,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day7.push([datas[j].input07,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                
                            }
                        }
                        daysData1.push(day1);
                        day1=[];
                        daysData2.push(day2);
                        day2=[];
                        daysData3.push(day3);
                        day3=[];
                        daysData4.push(day4);
                        day4=[];
                        daysData5.push(day5);
                        day5=[];
                        daysData6.push(day6);
                        day6=[];
                        daysData7.push(day7);
                        day7=[];
                       
                    }
        
        
                    this.setState({
                        day:month,
                        days1:daysData1,
                        days2:daysData2,
                        days3:daysData3,
                        days4:daysData4,
                        days5:daysData5,
                        days6:daysData6,
                        days7:daysData7
                    });break;
            case "周":
            let wStart = moment(timeStart);
            let wEnd = moment(timeEnd);
            let weekOfdayStart = moment(timeStart).format('E');//计算是本周第几天
            let last_mondayStart = moment(timeStart).subtract(weekOfdayStart-1, 'days');//开始日期的周一日期
            let week = last_mondayStart.format('YYYY-MM-DD');
            let weekOfdayEnd = moment(timeEnd).format('E');
            let last_sundayEnd = moment(timeEnd).subtract(weekOfdayEnd-7, 'days');//结束日期的周日日期
            days = (last_sundayEnd-last_mondayStart)/(1000*60*60*24)+1;
            days = parseInt(days/7);
            day = [];
            let weekDay = [];
            for(let i=0;i<days;i++){
                weekDay.push([moment(week).subtract(-i*7,'days'),moment(week).subtract(-i*7-6,"days")]);
                day.push(moment(week).subtract(-i*7,'days').format('YYYY-MM-DD')+'~'+moment(week).subtract(-i*7-6,"days").format('YYYY-MM-DD'));
            }
            for(let i=0;i<day.length;i++){
                let start = weekDay[i][0];
                let end = weekDay[i][1];
                for(let j=0;j<datas.length;j++){
                    if(start-moment(datas[j].timeFrom)<0&&moment(datas[j].timeFrom)-end<0){
                                yData2.push(((datas[j].output01)/(datas[j].input05))==Infinity?0:(datas[j].output01)/(datas[j].input05));
                                day1.push([datas[j].input01,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day2.push([datas[j].input02,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day3.push([datas[j].input03,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day4.push([datas[j].input04,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day5.push([datas[j].input05,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day6.push([datas[j].input06,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                                day7.push([datas[j].input07,yData2[j],moment(datas[j].timeFrom).format('YYYY-MM-DD')]);
                        
                    }
                }
                daysData1.push(day1);
                day1=[];
                daysData2.push(day2);
                day2=[];
                daysData3.push(day3);
                day3=[];
                daysData4.push(day4);
                day4=[];
                daysData5.push(day5);
                day5=[];
                daysData6.push(day6);
                day6=[];
                daysData7.push(day7);
                day7=[];
               
            }
            this.setState({
                day:day,
                days1:daysData1,
                days2:daysData2,
                days3:daysData3,
                days4:daysData4,
                days5:daysData5,
                days6:daysData6,
                days7:daysData7
            });break;
        }
        
    }
}
    // echart option
     getChartOption() {
        //如果没有选择时间筛选
        if(this.props.config.xmax==undefined){
                Modal.confirm({title:"Factory中影响因子横坐标（xmax数组）未配置！"})
        }else if(this.props.config.input.length!=this.props.config.xmax.length){
            Modal.confirm({title:"Factory中影响因子横坐标（xmax数组）范围设定值个数与影响因子个数不等！"})
        }

        if(!this.state.f){
            let data =this.state.data;
            let xyData=[];
            let yData=[];
            let xdata = this.state.xdata;
            let input = this.state.input;
            let config = this.props.config;
            let flag = config.input!=undefined;
            let input0 = flag&&this.state.input==''?this.props.config.input[0]:this.state.input;
            let xmax0 = flag&&config.xmax!=undefined&&config.xmax.length!=0?config.xmax[0]:0;
            let xmax = flag&&this.state.xmax!=0?this.state.xmax:xmax0;
            if(xdata.length==0&&this.state.flag==false){
                
                 for(let i=0;i<data.length;i++){
                     yData.push(((data[i].output01)/(data[i].input05))==Infinity?0:(data[i].output01)/(data[i].input05));
                     xyData.push([data[i].input01,yData[i]])
                 }
                 xdata=xyData;
             }
             //经过范围设置的数据处理
             if(this.state.flag==true){
                 switch(this.state.inputValue){
                     case 0:
                     input=flag?this.props.config.input[0]:input0;
                     xmax=flag&&config.xmax!=undefined?config.xmax[0]:xmax0;
                     xdata=this.state.data1;
                     break;
                     case 1:
                     input=flag?this.props.config.input[1]:input0;
                     xmax=flag&&config.xmax!=undefined?config.xmax[1]:xmax0;
                     xdata=this.state.data2;break;
                     case 2:
                     input=flag?this.props.config.input[2]:input0;
                     xmax=flag&&config.xmax!=undefined?config.xmax[2]:xmax0;
                     xdata=this.state.data3;break;
                     case 3:
                     input=flag?this.props.config.input[3]:input0;
                     xmax=flag&&config.xmax!=undefined?config.xmax[3]:xmax0;
                     xdata=this.state.data4;break;
                     case 4:
                     input=flag?this.props.config.input[4]:input0;
                     xmax=flag&&config.xmax!=undefined?config.xmax[4]:xmax0;
                     xdata=this.state.data5;break;
                     case 5:
                     input=flag?this.props.config.input[5]:input0;
                     xmax=flag&&config.xmax!=undefined?config.xmax[5]:xmax0;
                     xdata=this.state.data6;break;
                     case 6:
                     input=flag?this.props.config.input[6]:input0;
                     xmax=flag&&config.xmax!=undefined?config.xmax[6]:xmax0;
                     xdata=this.state.data7;break;
                     default:
                     input=flag?this.props.config.input[0]:input0;
                     xmax=flag&&config.xmax!=undefined?config.xmax[0]:xmax0;
                     xdata=this.state.data1;break;
                 }
             }
            // if(this.state.flag){//进行了范围设置
            //      data = this.state.datas;
            // }else{
            //      data = this.state.data;
            // }
            
            // for(let i=0;i<data.length;i++){
            //     yData.push((data[i].output01)/(data[i].input05)===Infinity?0:(data[i].output01)/(data[i].input05));
            // }
            
           
            
            
            return{
                backgroundColor: '#FFFFFF',
                xAxis: [{
                    name:input,
                    nameLocation:'center',
                    max:xmax
                }],
            yAxis: [{
                name:"效率",
                max:flag?config.ymax:1.0
            }],
            series: [{
                symbolSize: 10,
                data:xdata,
                type: 'scatter'
            }]   
        }
            }else{//选择了时间筛选
                
                let input = this.state.input;
                let day = this.state.day;
                let series = [];
                let config = this.props.config;
                let flag = config.input!=undefined;
                let xmax0 = flag?config.xmax[0]:0;
                let xmax = flag&&this.state.xmax!=0?this.state.xmax:xmax0;
                input = flag&&this.state.input==''?this.props.config.input[0]:this.state.input;
                let days = [];
                
                switch(this.state.inputValue){
                        case 0:
                        input=flag?this.props.config.input[0]:input0;
                        xmax=flag&&config.xmax!=undefined?config.xmax[0]:xmax0;
                        days=this.state.days1;break;
                        case 1:
                        input=flag?this.props.config.input[1]:input0;
                        xmax=flag&&config.xmax!=undefined?config.xmax[1]:xmax0;
                        days=this.state.days2;break;
                        case 2:
                        input=flag?this.props.config.input[2]:input0;
                        xmax=flag&&config.xmax!=undefined?config.xmax[2]:xmax0;
                        days=this.state.days3;break;
                        case 3:
                        input=flag?this.props.config.input[3]:input0;
                        xmax=flag&&config.xmax!=undefined?config.xmax[3]:xmax0;
                        days=this.state.days4;break;
                        case 4:
                        input=flag?this.props.config.input[4]:input0;
                        xmax=flag&&config.xmax!=undefined?config.xmax[4]:xmax0;
                        days=this.state.days5;break;
                        case 5:
                        input=flag?this.props.config.input[5]:input0;
                        xmax=flag&&config.xmax!=undefined?config.xmax[5]:xmax0;
                        days=this.state.days6;break;
                        case 6:
                        input=flag?this.props.config.input[6]:input0;
                        xmax=flag&&config.xmax!=undefined?config.xmax[6]:xmax0;
                        days=this.state.days7;break;
                        default:days=this.state.days1;break;
                }
                
                // if(days.length==0){
        
            // switch(this.state.inputValue){
            //     case 0:days=this.state.days1;break;
            //     case 1:days=this.state.days2;break;
            //     case 2:days=this.state.days3;break;
            //     case 3:days=this.state.days4;break;
            //     case 4:days=this.state.days5;break;
            //     case 5:days=this.state.days6;break;
            //     case 6:days=this.state.days7;break;
            //     default:days=this.state.days1;break;
            // }
            // days = this.state.days;
                // }
                
                for(let i=0;i<day.length;i++){
                    series.push({
                        name: day[i],
                        symbolSize: 2,
                        data: days[i],
                        type: 'scatter',
                        label: {
                            emphasis: {
                                show: true,
                                formatter: function (param) {
                                    return param.data[2];
                                },
                                position: 'top'
                            }
                        }
                    })
                }
                return{
                backgroundColor: '#FFFFFF',    
                legend: {
                    right: 10,
                    data: day
                },
                xAxis:[{
                    name:input,
                    nameLocation:'center',
                    max:xmax
                }],
                yAxis:[{
                    name:"效率",
                    max:flag?config.ymax:1.0
                }],
                series: series
                }
            }

       
       
    
     }

    // echart实例
    saveChartRef(refEchart) {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }
    // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }

    handleChange(value) {
        this.setState({
            inputValue:value
        })
        if(!this.state.flag&&!this.state.f){//没有进行设置
            
            let data =[];
            let xyData=[];
            let yData=[];
            
            let input = this.state.input;
            
            
            
                 data = this.state.data;
            
           
            for(let i=0;i<data.length;i++){
                yData.push((data[i].output01)/(data[i].input05)===Infinity?0:(data[i].output01)/(data[i].input05));
            }
            let config = this.props.config;
            let flag = config.input!=undefined;
            input = flag&&this.state.input==''?this.props.config.input[0]:this.state.input;
            let xmax = flag?this.props.config.xmax:[];
            
            switch(`${value}`){
                case '0':
                    for(let i=0;i<data.length;i++){ 
                        
                        xyData.push([data[i].input01,yData[i]]);
                    };this.setState({
                        xdata:xyData,
                        input:flag&&input!=''?this.props.config.input[0]:input,
                        xmax:flag&&xmax.length>0?xmax[0]:0
                    });
                break;
                case '1':
                for(let i=0;i<data.length;i++){ 
                    
                    xyData.push([data[i].input02,yData[i]]);
                };this.setState({
                    xdata:xyData,
                    input:input!=''&&config.input.length>0?this.props.config.input[1]:input,
                    xmax:flag&&xmax.length>1?xmax[1]:0
                });
                break;
                case '2':
                for(let i=0;i<data.length;i++){ 
                    
                    xyData.push([data[i].input03,yData[i]]);
                };this.setState({
                    xdata:xyData,
                    input:input!=''&&config.input.length>1?this.props.config.input[2]:input,
                    xmax:flag&&xmax.length>2?xmax[2]:0
                });
                break;
                case '3':
                for(let i=0;i<data.length;i++){ 
                
                    xyData.push([data[i].input04,yData[i]]);
                };this.setState({
                    xdata:xyData,
                    input:input!=''&&config.input.length>2?this.props.config.input[3]:input,
                    xmax:flag&&xmax.length>3?xmax[3]:0
                });
                break;
                case '4':
                for(let i=0;i<data.length;i++){ 
                
                    xyData.push([data[i].input05,yData[i]]);
                };this.setState({
                    xdata:xyData,
                    input:input!=''&&config.input.length>3?this.props.config.input[4]:input,
                    xmax:flag&&xmax.length>4?xmax[4]:0
                });
                break;
                case '5':
                for(let i=0;i<data.length;i++){ 
                
                    xyData.push([data[i].input06,yData[i]]);
                };this.setState({
                    xdata:xyData,
                    input:input!=''&&config.input.length>4?this.props.config.input[5]:input,
                    xmax:flag&&xmax.length>5?xmax[5]:0
                });
                break;
                case '6':
                for(let i=0;i<data.length;i++){ 
                
                    xyData.push([data[i].input07,yData[i]]);
                };this.setState({
                    xdata:xyData,
                    input:input!=''&&config.input.length>5?this.props.config.input[6]:input,
                    xmax:flag&&xmax.length>6?xmax[6]:0
                });
                break;
                default: for(let i=0;i<data.length;i++){ 
                        
                    xyData.push([data[i].input01,yData[i]]);
                };this.setState({
                    xdata:xyData,
                    input:flag&&input!=''?this.props.config.input[0]:input,
                    xmax:flag&&xmax.length>0?xmax[0]:0
                });
        
            }
            
           
        
        
    }else if(this.state.flag&&this.state.f){//既选择了取值范围又选择了时间
        let input = this.state.input;
        let day = this.state.day;
        
        let config = this.props.config;
        let flag = config.input!=undefined;
        let xmax0 = flag?config.xmax[0]:0;
        let xmax = flag&&this.state.xmax!=0?this.state.xmax:xmax0;
        input = flag&&this.state.input==''?this.props.config.input[0]:this.state.input;
        let daysData = [];
        let days = [];
        let yData = [];
        switch(`${value}`){
            case '0':
            
            this.setState({
               
                input:flag&&input!=''?this.props.config.input[0]:input,
                xmax:flag&&xmax.length>0?xmax[0]:0,
                days:this.state.days1
            });break;
            case '1':
           
            this.setState({
                
                input:flag&&input!=''?this.props.config.input[1]:input,
                xmax:flag&&xmax.length>0?xmax[1]:0,
                days:this.state.days2
            });break;
            case '2':
            
            this.setState({
                
                input:flag&&input!=''?this.props.config.input[2]:input,
                xmax:flag&&xmax.length>0?xmax[2]:0,
                days:this.state.days3
            });break;
            case '3':
            
           
            this.setState({
               
                input:flag&&input!=''?this.props.config.input[3]:input,
                xmax:flag&&xmax.length>0?xmax[3]:0,
                days:this.state.days4
            });break;
            case '4':
            
            this.setState({
                
                input:flag&&input!=''?this.props.config.input[4]:input,
                xmax:flag&&xmax.length>0?xmax[4]:0,
                days:this.state.days5
            });break;
            case '5':
           
            this.setState({
               
                input:flag&&input!=''?this.props.config.input[5]:input,
                xmax:flag&&xmax.length>0?xmax[5]:0,
                days:this.state.days6
            });break;
            case '6':
            
            this.setState({
                
                input:flag&&input!=''?this.props.config.input[6]:input,
                xmax:flag&&xmax.length>0?xmax[6]:0,
                days:this.state.days7
            });break;
            default:
           
            this.setState({
                
                input:flag&&input!=''?this.props.config.input[0]:input,
                xmax:flag&&xmax.length>0?xmax[0]:0,
                days:this.state.days1
            }); break;
        }
    }
        
    
      }
      hide(){
          this.setState({
              visible:false
          })
      }
    onSetting(){
       this.setState({
        visible:true
       })
    }
    render() {
        const {modal} = this.props;
        let config = this.props.config
        let flag =  config.input!=undefined
        let option = flag?config:[];
        let uoption;  
        if(flag&&option.input.length!=0){uoption = option.input.map((item,index)=>{
            return (<Option id={index+''} value={index}>{item}与效率关系</Option>)
        })}else{
            uoption = function(){return (<Option>无法读取到Factory中的“影响因子”属性</Option>)};
        }
        return (
            <div >
                
                <div style={{margin:"10px"}}>
            <div className={s['in']} style={{backgroundColor:'#cccccc',color:'black',textAlign:'center',fontSize:14,width:130,height:28,lineHeight:'28px'}}>影响因子分析：</div>
            <div className={s['in']}>
            <Select id="se" defaultValue={flag&&option.input.length!=0?option.input[0]+'与效率关系':"无法读取到Factory中的“影响因子”属性"} style={{ width: 200 }} onChange={this.handleChange}>
                {uoption}
            {/* <Option value="0">{flag&&config.input.length>0?config.input[0]+"与效率关系":"无法读取到Factory中的“影响因子”属性"}</Option>
            <Option value="1">{flag&&config.input.length>1?config.input[1]+"与效率关系":"无法读取到Factory中的“影响因子”属性"}</Option>
            <Option value="2">{flag&&config.input.length>2?config.input[2]+"与效率关系":"无法读取到Factory中的“影响因子”属性"}</Option>
            <Option value="3">{flag&&config.input.length>3?config.input[3]+"与效率关系":"无法读取到Factory中的“影响因子”属性"}</Option>
            <Option value="4">{flag&&config.input.length>4?config.input[4]+"与效率关系":"无法读取到Factory中的“影响因子”属性"}</Option> */}
            </Select>
            
            </div>
            <div className={s['in']} style={{width:20,right:28,paddingTop:'4'}} onClick={this.onSetting}><Icon type="setting"  style={{color:"black",cursor:"pointer",fontSize:20}} /></div>
            </div> 
                
                <div className={s['header']}>      
               
                </div>
                <div className={s['chart-container']} ref={this.saveContainerRef}>
                {
                        this.state.loading ? 
                            <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                                <Spin tip="正在读取数据"/>
                            </div>
                        :
                        <ReactEcharts
                            style={{
                                height: '100%'
                            }}
                            ref={this.saveChartRef()}
                            option={this.getChartOption()}
                            theme="white"
                            notMerge={true}
                        />
                }
                
                </div>
                <EfficiencySetModalView1
                input={this.props.config.input}
                hide={this.hide}
                visible={this.state.visible}
                affectoi={this.affectoi}
                />
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
class efficiencyChartComponent extends Widget {
    
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
            <div style={style} className={s['container']} id="chart">
            <div  style={{color:'black'}}>{this.props.config.title}</div>
                <FormWrap
                    timeRange={getTimeRange('today')}
                    format='m5'
                    {...this.props}
                    
                />
                <div>
                
                </div>
            </div>
        )
    }
}

export default  efficiencyChartComponent

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  const InputGroup = Input.Group;
  

  class EfficiencySetModalView extends React.Component{
        constructor(props){
            super(props)
            this.state={
                month:'',
                value:'日',
                f:false,
                timeStart:'',
                timeEnd:''
                
            }
            
            this.onOk = this.onOk.bind(this)
            this.hide = this.hide.bind(this)
            this.handleChange = this.handleChange.bind(this)
            this.onSubmit = this.onSubmit.bind(this)
            this.onChange = this.onChange.bind(this)
            this.changeCondition = this.changeCondition.bind(this)
        }
        
        
        shouldComponentUpdate(nextProps,nextState){//?????
            return true;
        }
        
        
        handleChange(dates,dateStrings){
            this.setState({
                timeStart:dateStrings[0],
                timeEnd:dateStrings[1]
            })
        }
        onSubmit(){
            
            this.hide();
        }
        
        onChange(value){
            this.setState({
                value:value
            })
        }
        changeCondition(checked){
            this.setState({
                f:checked
            })
        }

        hide(){
            this.props.hide();
        }

        //点击提交表单时触发
        onOk(e){
            // let a01 =  document.getElementById("0").value;
            // let a02 =  document.getElementById("10").value;
            //  let a1 =  document.getElementById("1").value;
            //  let a11 =  document.getElementById("11").value;
            //  let a2 =  document.getElementById("2").value;
            //  let a22 =  document.getElementById("12").value;
            //  let a3 =  document.getElementById("3").value;
            //  let a32 =  document.getElementById("13").value;
            //  let a4 =  document.getElementById("4").value;
            //  let a44 =  document.getElementById("14").value;
            //  let a5 =  document.getElementById("5").value;
            //  let a55 =  document.getElementById("15").value;
            //  let a6 =  document.getElementById("6").value;
            //  let a66 =  document.getElementById("16").value;
            //  let a7 =  document.getElementById("1").value;
            //  let a77 =  document.getElementById("11").value;
            const {form} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    // let timeStart = this.state.timeStart;
                    // let timeEnd = this.state.timeEnd;
                    // let f = this.state.f;
                    // let date = this.state.value;
                    if(values.a8==true){
                        if(values.a10==undefined){
                            Modal.confirm({title:'请选择时间范围！'})
                        }else{
                    
                        if(values.a10==undefined){
                            this.props.affectoi(values.a1,values.a11,values.a2,values.a22,values.a3,values.a33,values.a4,values.a44,values.a5,values.a55,values.a6,values.a66,values.a7,values.a77,values.a8,values.a9,"","");
                        }else{
                        this.props.affectoi(values.a1,values.a11,values.a2,values.a22,values.a3,values.a33,values.a4,values.a44,values.a5,values.a55,values.a6,values.a66,values.a7,values.a77,values.a8,values.a9,values.a10[0].format('YYYY-MM-DD'),values.a10[1].format('YYYY-MM-DD'));
                        }
                        this.hide();
                    }
                    }else{
                        if(values.a10==undefined){
                            this.props.affectoi(values.a1,values.a11,values.a2,values.a22,values.a3,values.a33,values.a4,values.a44,values.a5,values.a55,values.a6,values.a66,values.a7,values.a77,values.a8,values.a9,"","");
                        }else{
                        this.props.affectoi(values.a1,values.a11,values.a2,values.a22,values.a3,values.a33,values.a4,values.a44,values.a5,values.a55,values.a6,values.a66,values.a7,values.a77,values.a8,values.a9,values.a10[0].format('YYYY-MM-DD'),values.a10[1].format('YYYY-MM-DD'));
                        }
                        this.hide();
                    }
                    
                }
            })
            
        }

        
        render(){
            
            let selIds=this.state.selIds
            const {form,
                rowKey,
                modal,
                table,
                hideModal,
                hide,
                selectedIds,
                onSelectChange, 
                visible,
                input
            } = this.props
            const {getFieldDecorator} = form
            // let div = [];
            // if(input.length!=0&&input!=undefined){
            //  div = input.map((item,index)=>{
            //      return (<div><span style={{width:200}}>{item}</span>:<input id={index+""} type="text" style={{borderColor:"#313d4f",backgroundColor:"#001529"}}/>~<input id={index+10+""} type="text" style={{borderColor:"#313d4f",backgroundColor:"#001529"}}/></div>)
            //  })
            // }
            // let visible = modalTypes.EFFICIENCY_SETTING_MODAL === modal.type ? true : false;
            // const {getFieldDecorator} = form
            return (
                <Modal
                    title='配置'
                    visible={visible}
                    onCancel={this.hide}
                    maskClosable={false}
                    onOk={this.onOk}
                >
                <Form>
                    <div><Input readOnly unselectable="on"  style={{border:'0px',outline:'none',cursor:'auto',backgroundColor:"#001529",'boxShadow': 'none',overflow:'visible'}}          value="条件配置"/></div>
                    <Row>
                        <Col span={6} offset={8}>
                        最小值
                        </Col>
                        <Col span={4} offset={5}>
                        最大值
                        </Col>
                    </Row>
                    <Row gutter={0}>
                        <Col span={16} >
                            <FormItem
                                    {...formItemLayout}
                                    label={input.length>0&&input!=undefined?input[0]:''}
                                    labelCol={{span:10}}
                                    wrapperCol={{ span: 5 }}
                                    >
                                        {
                                            getFieldDecorator('a1',{
                                                initialValue:-1
                                            }
                                            )(
                                                <Input  style={{ width: 100, textAlign: 'center'}} placeholder="Minimum" />
                                            )
                                        }
                            </FormItem>
                        </Col>
                                {/* <Col span={2}>
                                ~
                                </Col> */}
                                
                        <Col span={6}>       
                                <FormItem
                                    
                                    {...formItemLayout}
                                    label='~'
                                    colon={false}
                                    >
                                        {
                                            getFieldDecorator('a11',{
                                                initialValue:50
                                            }
                                            )(
                                                <Input   style={{ width: 100, textAlign: 'center'}} placeholder="Maximum" />
                                            )
                                        }
                                </FormItem>
                        </Col>
                            </Row>
                            <Row gutter={0}>
                            <Col span={16} >
                            <FormItem
                                {...formItemLayout}
                                label={input.length>0&&input!=undefined?input[1]:''}
                                labelCol={{span:10}}
                                wrapperCol={{ span: 5 }}
                                >
                                    {
                                        getFieldDecorator('a2',{
                                            initialValue:-1
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Minimum" />
                                            )
                                    }
                            </FormItem>
                            </Col>
                            <Col  span={6}  >
                            <FormItem
                                {...formItemLayout}
                                label='~'
                                colon={false}
                                >
                                    {
                                        getFieldDecorator('a22',{
                                            initialValue:50
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Maximum" />
                                            )
                                    }
                            </FormItem>
                            </Col>
                            </Row>
                            <Row gutter={0}>
                            <Col  span={16}  >
                            <FormItem
                                {...formItemLayout}
                                label={input.length>0&&input!=undefined?input[2]:''}
                                labelCol={{span:10}}
                                wrapperCol={{ span: 5 }}
                                >
                                    {
                                        getFieldDecorator('a3',{
                                            initialValue:-1
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Minimum" />
                                            )
                                    }
                            </FormItem>
                            </Col>
                            <Col  span={6}  >
                            <FormItem
                                {...formItemLayout}
                                label='~'
                                colon={false}
                                >
                                    {
                                        getFieldDecorator('a33',{
                                            initialValue:10000
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Maximum" />
                                          )
                                    }
                            </FormItem>
                            </Col>
                            </Row>
                            <Row gutter={0}>
                            <Col  span={16}  >
                            <FormItem
                                {...formItemLayout}
                                label={input.length>0&&input!=undefined?input[3]:''}
                                labelCol={{span:10}}
                                wrapperCol={{ span: 5 }}
                                >
                                    {
                                        getFieldDecorator('a4',{
                                            initialValue:-1
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Minimum" />
                                           
                                            )
                                    }
                            </FormItem>
                            </Col>
                            <Col  span={6} >
                            <FormItem
                                {...formItemLayout}
                                label='~'
                                colon={false}
                                >
                                    {
                                        getFieldDecorator('a44',{
                                            initialValue:10000
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Maximum" />
                                        )
                                    }
                            </FormItem>
                            </Col>
                            </Row>
                            <Row gutter={0}>
                            <Col  span={16}  >
                            <FormItem
                                {...formItemLayout}
                                label={input.length>0&&input!=undefined?input[4]:''}
                                labelCol={{span:10}}
                                wrapperCol={{ span: 5 }}
                                >
                                    {
                                        getFieldDecorator('a5',{
                                            initialValue:-1
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Minimum" />
                                           )
                                    }
                            </FormItem>
                            </Col>
                            <Col  span={6} >
                            <FormItem
                                {...formItemLayout}
                                label='~'
                                colon={false}
                                >
                                    {
                                        getFieldDecorator('a55',{
                                            initialValue:10000
                                        }
                                        )(
                                            
                                            <Input  style={{ width: 100, textAlign: 'center' }} placeholder="Maximum" />
                                            )
                                    }
                            </FormItem>
                            </Col>
                            </Row>
                            <Row gutter={0}>
                            <Col  span={16}>
                            <FormItem
                                {...formItemLayout}
                                label={input.length>0&&input!=undefined?input[5]:''}
                                labelCol={{span:10}}
                                wrapperCol={{ span: 5 }}
                                >
                                    {
                                        getFieldDecorator('a6',{
                                            initialValue:-1
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Minimum" />
                                            
                                           )
                                    }
                            </FormItem>
                            </Col>
                            <Col  span={6}  >
                            <FormItem
                                {...formItemLayout}
                                label='~'
                                colon={false}
                                >
                                    {
                                        getFieldDecorator('a66',{
                                            initialValue:50
                                        }
                                        )(
                                            
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Maximum" />
                                            )
                                    }
                            </FormItem>
                            </Col>
                            </Row>
                            <Row gutter={0}>
                            <Col  span={16}  >
                            <FormItem
                                {...formItemLayout}
                                label={input.length>0&&input!=undefined?input[6]:''}
                                labelCol={{span:10}}
                                wrapperCol={{ span: 5 }}
                                >
                                    {
                                        getFieldDecorator('a7',{
                                            initialValue:-1
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Minimum" />
                                            
                                           )
                                    }
                            </FormItem>
                            </Col>
                            <Col  span={6}  >
                            <FormItem
                                {...formItemLayout}
                                label='~'
                                colon={false}
                                >
                                    {
                                        getFieldDecorator('a77',{
                                            initialValue:50
                                        }
                                        )(
                                            <Input   style={{ width: 100, textAlign: 'center' }} placeholder="Maximum" />
                                            )
                                    }
                            </FormItem>
                            </Col>
                            </Row>
                            <div><Input readOnly unselectable="on"  style={{border:'0px',outline:'none',cursor:'auto',backgroundColor:"#001529",'boxShadow': 'none',overflow:'visible'}} value="高级配置"/></div>
                            <FormItem
                                {...formItemLayout}
                                label='是否进行时间筛选'
                                >
                                    {
                                        getFieldDecorator('a8',{
                                           
                                        }
                                        )(<Switch  onChange={this.changeCondition} />)
                                    }
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label='按时间分类'
                                >
                                    {
                                        getFieldDecorator('a9',{
                                            initialValue:"日"
                                        }
                                        )(<Select style={{ width: 100 }} defaultValue="日" onChange={this.onChange}>
                                                <Option value="日">日</Option>
                                                <Option value="月">月</Option>
                                                <Option value="周">周</Option>
                                            </Select>)
                                    }
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label='时间范围'
                                >
                                    {
                                        getFieldDecorator('a10',{
                                            
                                        }
                                        )(<RangePicker onChange={this.handleChange} />)
                                    }
                            </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
const EfficiencySetModalView1 = Form.create()(EfficiencySetModalView)

