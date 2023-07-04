import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './CoolingView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';
import echarts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';


import { DatePicker , Form ,Button ,Select ,message,Spin} from 'antd';
import moment from 'moment'

const { RangePicker } = DatePicker;
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
let t1;
let t2;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'CoolingQuality',
    name : '散点图图组件',
    description : "生成efficiency组件",
}


class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state = {
            AirConditionZoneList:[],
            List:[],
            Listi:[],
            pointList:[],
            pointListi:[],
            point:[],
            pointi:[],
            roomName:[],
            roomNamei:[],
            zoneName:[],
            zoneNamei:[],
            fdata: {},
            fData:[],
            name:[],
            namei:[],
            xdata:[],
            loadingAHU :false,
            loadingValve: false,
            loadingTemp:false,
            loadingTempTrend:false,
            input:'',
            i:0,
            j:'1',
            LoadName:[],
            AHUList:[],
            AHUListMap:[],
            AHUMap:[[]],
            AHUmap:[[]],
            AHUdata:{},
            AHUData:[],
            valveData:[]
        }

        this.chart = null;
        this.container = null;
        this.getChartData = this.getChartData.bind(this)
        this.getGlobalConfig = this.getGlobalConfig.bind(this)
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.getChart = this.getChart.bind(this);
        this.handleChange = this.handleChange.bind(this);
        //this.onOption = this.onOption.bind(this);
        this.handle = this.handle.bind(this);
        this.onChartReady = this.onChartReady.bind(this);
        this.getChartData2 = this.getChartData2.bind(this);
        this.refreshCountTemp = this.refreshCountTemp.bind(this);
        this.refreshCountAHU = this.refreshCountAHU.bind(this);
        this.onRenovate = this.onRenovate.bind(this);
    }

    static get defaultProps() {
      return {
        
        points: [],
        data:[]
      }
    }

    
    componentWillMount(){
        
        //this.getChartData(timeStart,timeEnd);
       
        this.getGlobalConfig();
        
        //this.get()
      
    }
    // componentWillReceiveProps(){
        
    //       this.getChartData();
        
    //   }
    // echart data

    //获取全局配置
     getGlobalConfig = () => {
        // this.setState({
        //     loadingAHU:true,
        //     loadingValve: true,
        //     loadingTemp:true,
        //     loadingTempTrend:true
        // })
         http.post('/project/getConfig')
         .then(
             data=>{
                 if(data.status){
                     let list = data.data["LoadSide"];
                     let LoadName = list[0]["LoadName"]!=undefined?data.data["LoadSide"].map(item=>{ return item["LoadName"]}):[];
                     let List = list.map(item=>{return item['AirConditionZoneList']});
                     let pointList = [];
                     let roomName =[];
                    
                     let p = [];
                     let n = [];
                     let name = [];
                     let point = [];
                     let zoneName= [];
                     let AHUList = [];
                     //获取整理AHU信息
                     for(let i=0;i<List.length;i++){
                        let room =  List[i].map(item=>{return item.RoomEnvironmentIndexList.map(item=>{return item.RoomName})});
                        //RoomEnvironmentIndexList.map(item=>{return item.RoomName})
                        roomName.push(room)
                        }
                        for(let i=0;i<roomName.length;i++){
                            for(let j = 0;j<roomName[i].length;j++){
                                for(let k=0;k<roomName[i][j].length;k++){
                                n.push(roomName[i][j][k]);
                                }
                            } 
                            name.push(n)
                            n=[];
                    }
                    for(let i=0;i<List.length;i++){
                        let zN = List[i].map(item=>{return  item.zoneName});
                        zoneName.push(zN)
                    }
                    for(let i=0;i<List.length;i++){
                        let zN = List[i].map(item=>{return  item.AHUList});
                        AHUList.push(zN)
                    }  
                    //如果有SPNVersion字段，且为2，则用新标准点名，不再去取RoomEnvironmentIndexList里面的内容
                    if (this.props.config.SPNVersion != undefined && this.props.config.SPNVersion ==2) {
                        for(let i=0;i<AHUList.length;i++){
                            for(let j=0;j<AHUList[i].length;j++){
                                for(let k=0;k<AHUList[i][j].length;k++){
                                    p.push(AHUList[i][j][k]['Prefix']+'AirTempReturn'+AHUList[i][j][k]['EquipNo']);
                                }
                                point.push(p);
                                p = [];
                            }
                           
                        }
                        pointList.push(point)
                    }else {
                        for(let i = 0;i<List.length;i++){
                        let pl = List[i].map(item=>{return item.RoomEnvironmentIndexList.map(item=>{return item.TempPointName})});
                            pointList.push(pl);
                        }
                        for(let i=0;i<pointList.length;i++){
                            for(let j = 0;j<pointList[i].length;j++){
                                for(let k=0;k<pointList[i][j].length;k++){
                                       p.push(pointList[i][j][k]);
                                }
                            }  
                            point.push(p);
                            p = [];                  
                       }
                    }
                     this.setState({
                         roomName:roomName,
                         zoneName:zoneName,
                         AHUList:AHUList,
                         pointList:pointList,
                         point:point,
                         name:name,
                         List:List,
                         LoadName:LoadName,
                         pointi:point[0],
                         roomNamei:roomName[0],
                         zoneNamei:zoneName[0],
                         pointListi:pointList[0],
                         namei:name[0],
                         Listi:List[0],
                     },console.log("===============++="))
                     //const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
                     let timeStart = moment().subtract(1, "hour").format(TIME_FORMAT);
                     let timeEnd = moment().format(TIME_FORMAT);
                     
                     this.getChartData(timeStart,timeEnd);
                     //保存到localStorage中，以便下次切换页面时时间段不变
                     // window.localStorage.setItem('energyFeePrice',JSON.stringify({
                     //     price: data.data[priceName]
                     //}));
                     this.getChartData2();
                     //this.refreshCountTemp();
                    t1=window.setInterval(this.refreshCountTemp(), 5*60*1000);
                    this.getChartData3();
                    
                 }
             }
         )
     }
     componentWillUnmount (){
        window.clearInterval(t1)
        window.clearInterval(t2);
     }

    //温度与趋势点名整理及数据请求
    getChartData(timeStart,timeEnd) {
        //const {name} = this.props.config.bindname
        this.setState({
            loadingTempTrend: true
        });
        let point = this.state.AHUList?this.state.AHUList:[];
        let pointList = []
        //如果有SPNVersion字段，且为2，则用新标准点名
        if (this.props.config.SPNVersion != undefined && this.props.config.SPNVersion ==2) {
            for(let i=0;i<point.length;i++){
                for(let j=0;j<point[i].length;j++){
                    for(let k=0;k<point[i][j].length;k++){
                        pointList.push(point[i][j][k]['Prefix']+'AirTempReturn'+point[i][j][k]['EquipNo']);
                    }
                }
            }
        }else{
            pointList =this.state.pointi.length==0?this.state.point[0]:this.state.pointi;
        }
        http.post('/get_history_data_padded', {
            pointList:pointList,
            ...{
            "timeStart":timeStart,//
            "timeEnd":timeEnd,//
            "timeFormat":"m1"
            }
        }).then(
            (data)=> {
                 if (!this.container) {
                     throw new Error('Error: the instance of container is undefined')
                 }
                if (data.error) {
                    throw new Error(data.msg)
                }
                this.setState({
                    loadingTempTrend: false,
                    fdata: data
                });
                //5*60*1000
                
            }
        ).catch(
            () => {
                this.setState({
                    loadingTempTrend: false,
                    fdata: {}
                });
            }
        )
        
    }
    //AHU运行状态点名整理及数据请求
    getChartData2(){
        
        let point = this.state.AHUList?this.state.AHUList:[];
        let AHUList = [];
        let AHUMap = [];
        let AHUmap = [];
        let AHUMapName = [];
        let AHUListName = [];
        let map = [];
        //如果有SPNVersion字段，且为2，则用新标准点名
        if (this.props.config.SPNVersion != undefined && this.props.config.SPNVersion ==2) {
            for(let i=0;i<point.length;i++){
                for(let j=0;j<point[i].length;j++){
                    for(let k=0;k<point[i][j].length;k++){
                        AHUList.push(point[i][j][k]['Prefix']+'SAFanOnOff'+point[i][j][k]['EquipNo']);
                        map.push(point[i][j][k]['Prefix']+'SAFanOnOff'+point[i][j][k]['EquipNo']);
                    }
                    AHUmap.push(map);
                    map = [];
                }
                AHUMap.push(AHUmap);
                AHUmap = [];
            }
        }else {
            for(let i=0;i<point.length;i++){
                for(let j=0;j<point[i].length;j++){
                    for(let k=0;k<point[i][j].length;k++){
                        AHUList.push(point[i][j][k]['Prefix']+'SupplyFanOnOff'+point[i][j][k]['EquipNo']);
                        map.push(point[i][j][k]['Prefix']+'SupplyFanOnOff'+point[i][j][k]['EquipNo']);
                    }
                    AHUmap.push(map);
                    map = [];
                }
                AHUMap.push(AHUmap);
                AHUmap = [];
            }
        }
       
        for(let i=0;i<point.length;i++){
            for(let j=0;j<point[i].length;j++){
                for(let k=0;k<point[i][j].length;k++){
                        AHUListName.push(point[i][j][k]['name']);
                        map.push(point[i][j][k]['name']);
                }
                AHUmap.push(map);
                map = [];
            }
            AHUMapName.push(AHUmap);
            AHUmap = [];
        }
        let timeStart = moment().format(TIME_FORMAT);
        let timeEnd = timeStart;
        this.setState({
            loadingAHU: true,
            AHUMap:AHUMap,
            AHUListMap:AHUList,
            AHUMapName:AHUMapName
        });
        http.post('/get_history_data_padded', {
            pointList:AHUList,
      ...{
      "timeStart":timeStart,//
      "timeEnd":timeEnd,//
      "timeFormat":"m1"
      }
        }).then(
            (data)=> {
                 if (!this.container) {
                     throw new Error('Error: the instance of container is undefined')
                 }
                if (data.error) {
                    throw new Error(data.msg)
                }
                let AHUMap = this.state.AHUMap;
                if(JSON.stringify(this.state.AHUdata) != "{}"){
                    let i = this.state.i;
                        for(let j=0;j<AHUMap[i].length;j++){
                            for(let k=0;k<AHUMap[i][j].length;k++){
                                let ahu = AHUMap[i][j][k]
                                AHUMap[i][j][k] = [];
                                if(this.state.AHUdata.map[ahu]!=undefined&&this.state.AHUdata.map[ahu].length!=0){
                                    AHUMap[i][j][k].push(1);
                                }else{
                                    AHUMap[i][j][k].push(0);
                                }
                            }
                        }
                    
                }
                this.setState({
                    loadingAHU: false,
                    AHUdata: data,
                    AHUmap:AHUMap
                });
                //5*60*1000
                
                
            }
            
        ).catch(
            () => {
                this.setState({
                    loadingAHU: false,
                    AHUdata: {}
                });
            }
        )
    }
    //阀门分布点名整理及数据请求
    getChartData3(){
        let point = this.state.AHUList?this.state.AHUList:[];
        let valveList = [];
        let valveMap = [];
        let valvemap = [];
        let map = [];
        //如果有SPNVersion字段，且为2，则用新标准点名
        if (this.props.config.SPNVersion != undefined && this.props.config.SPNVersion ==2) {
            for(let i=0;i<point.length;i++){
                for(let j=0;j<point[i].length;j++){
                    for(let k=0;k<point[i][j].length;k++){
                        valveList.push(point[i][j][k]['Prefix']+'ChWValvePosition'+point[i][j][k]['EquipNo']);
                        map.push(point[i][j][k]['Prefix']+'ChWValvePosition'+point[i][j][k]['EquipNo']);
                    }
                    valvemap.push(map);
                    map = [];
                }
                valveMap.push(valvemap);
                valvemap = [];
            }
        }else {
            for(let i=0;i<point.length;i++){
                for(let j=0;j<point[i].length;j++){
                    for(let k=0;k<point[i][j].length;k++){
                        valveList.push(point[i][j][k]['Prefix']+'CoolingWaterValveOpenRatioSetting'+point[i][j][k]['EquipNo']);
                        map.push(point[i][j][k]['Prefix']+'CoolingWaterValveOpenRatioSetting'+point[i][j][k]['EquipNo']);
                    }
                    valvemap.push(map);
                    map = [];
                }
                valveMap.push(valvemap);
                valvemap = [];
            }
        }

        this.setState({
            loadingValve: true,
            valveMap:valveMap
        });

        http.post('/get_realtimedata',{
            pointList:valveList,
            proj:1,
            scriptList:[]
        })
        .then(
            data=>{
                
            if (data.error) {
                throw new Error(data.msg)
            }
                this.setState({
                    valveData:data,
                    loadingValve:false
                })
            }).catch((err)=>{
                this.setState({
                    valveData:[],
                    loadingValve:false
                })
            }
            
            )
    }
    //5小时刷新数据-过冷过热一览
    refreshCountTemp() {
        let point = this.state.pointi.length==0?this.state.point[0]:this.state.pointi;
        http.post('/get_realtimedata',{
            pointList:point,
            proj:1,
            scriptList:[]
        })
        .then(
            data=>{
                this.setState({
                    fData:data,
                    loadingTemp:false
                })
            }).catch((err)=>{
                this.setState({
                    fData:[],
                    loadingTemp:false
                    
                })
            }
               
            )
    }
//5小时定时刷新-AHU运行状态
refreshCountAHU() {
        let AHUListMap = this.state.AHUListMap;
    http.post('/get_realtimedata',{
        pointList:AHUListMap,
        proj:1,
        scriptList:[]
    })
    .then(
        data=>{
            
           if (data.error) {
               throw new Error(data.msg)
           }
            this.setState({
                AHUData:data,
                loadingAHU:false
                
            })
        }).catch((err)=>{
            this.setState({
                AHUData:[],
                loadingAHU:false
            })
        }
           
        )
}

    handle(value){
        let point  = this.state.point;
        let name1 = this.state.LoadName[0];
        let name2 = this.state.LoadName[1];
        let name3 = this.state.LoadName[2];
        let name4 = this.state.LoadName[3];
        let name5 = this.state.LoadName[4];
        let name6 = this.state.LoadName[5];
        let name7 = this.state.LoadName[6];
        let name8 = this.state.LoadName[7];
        let name9 = this.state.LoadName[8];
        let name10 = this.state.LoadName[9];
        let roomName  = this.state.roomName;
         let zoneName  = this.state.zoneName;
         let pointList  = this.state.pointList;
         let name  = this.state.name;
         let List  = this.state.List;
         let timeStart = moment().subtract(1, "hour").format(TIME_FORMAT);
        let timeEnd = moment().format(TIME_FORMAT);
        switch(value){
            case 0:
                    this.setState({i:0,pointi:point[0],roomNamei:roomName[0],zoneNamei:zoneName[0],pointListi:pointList[0],namei:name[0],Listi:List[0]});
                    this.getChartData(timeStart,timeEnd);
                    break;
            case 1:
            this.setState({i:1,pointi:point[1],roomNamei:roomName[1],zoneNamei:zoneName[1],pointListi:pointList[1],namei:name[1],Listi:List[1]});
            this.getChartData(timeStart,timeEnd);
            break;
            case 2:
            this.setState({i:2,pointi:point[2],roomNamei:roomName[2],zoneNamei:zoneName[2],pointListi:pointList[2],namei:name[2],Listi:List[2]});
            this.getChartData(timeStart,timeEnd);
            break;
            case 3:
            this.setState({i:3,pointi:point[3],roomNamei:roomName[3],zoneNamei:zoneName[3],pointListi:pointList[3],namei:name[3],Listi:List[3]});
            this.getChartData(timeStart,timeEnd);
            break;
            case 4:
            this.setState({i:4,pointi:point[4],roomNamei:roomName[4],zoneNamei:zoneName[4],pointListi:pointList[4],namei:name[4],Listi:List[4]});
            this.getChartData(timeStart,timeEnd);
            break;
            case 5:
            this.setState({i:5,pointi:point[5],roomNamei:roomName[5],zoneNamei:zoneName[5],pointListi:pointList[5],namei:name[5],Listi:List[5]});
            this.getChartData(timeStart,timeEnd);
            break;
            case 6:this.setState({i:6,pointi:point[6],roomNamei:roomName[6],zoneNamei:zoneName[6],pointListi:pointList[6],namei:name[6],Listi:List[6]});
            this.getChartData(timeStart,timeEnd);
            break;
            case 7:this.setState({i:7,pointi:point[7],roomNamei:roomName[7],zoneNamei:zoneName[7],pointListi:pointList[7],namei:name[7],Listi:List[7]});
            this.getChartData(timeStart,timeEnd);
            break;
            case 8:this.setState({i:8,pointi:point[8],roomNamei:roomName[8],zoneNamei:zoneName[8],pointListi:pointList[8],namei:name[8],Listi:List[8]});
            this.getChartData(timeStart,timeEnd);
            break;
            case 9:this.setState({i:9,pointi:point[9],roomNamei:roomName[9],zoneNamei:zoneName[9],pointListi:pointList[9],namei:name[9],Listi:List[9]});
            this.getChartData(timeStart,timeEnd);
            break;
            default:this.setState({i:0,pointi:point[0],roomNamei:roomName[0],zoneNamei:zoneName[0],pointListi:pointList[0],namei:name[0],Listi:List[0]});
            this.getChartData(timeStart,timeEnd);
            break;
        }
    }
    handleChange(value){
        switch(value){
            case "1":window.clearInterval(t1);window.clearInterval(t2);t1=window.setInterval(this.refreshCountAHU, 5*60*1000);this.setState({j:"1"});break;
            case "2":window.clearInterval(t1);window.clearInterval(t2);this.setState({j:"2"});break;
            case "3":window.clearInterval(t1);window.clearInterval(t2);this.setState({j:"3"});break;
            case "4":window.clearInterval(t1);window.clearInterval(t2);t2=window.setInterval(this.refreshCountTemp, 5*60*1000);this.setState({j:"4"});break;
            default:window.clearInterval(t1);window.clearInterval(t2);t1=window.setInterval(this.refreshCountAHU, 5*60*1000);this.setState({j:"1"});break;
        }
    }
    // echart option
    getChart(){
         let roomName = this.state.roomNamei?this.state.roomNamei:[];
         let zoneName = this.state.zoneNamei?this.state.zoneNamei:[];
         let pointList = this.state.pointListi?this.state.pointListi:[];
         let point = this.state.pointi?this.state.pointi:[];
         let series = [];
         let List = this.state.Listi?this.state.Listi:[];
         let room = '';
         let name =this.state.namei.length>0?this.state.namei:[];
         let index =[];
         let filter = [];
         let environment = [];
         let fdata = this.state.fdata?this.state.fdata:{};
         let tdata = [];
         let legend = [];
         let hours = [];
        if(this.state.j==1){
            let AHUMap = this.state.AHUMap;
            let AHUMapName = this.state.AHUMapName;
            let AHUmap = [];
           

            
                if(JSON.stringify(this.state.AHUdata) != "{}"){
                    let i = this.state.i;
                    let map = [];
                        for(let j=0;j<AHUMap[i].length;j++){
                            for(let k=0;k<AHUMap[i][j].length;k++){
                                let ahu = AHUMap[i][j][k]
                                
                                if(this.state.AHUdata.map[ahu]!=undefined&&this.state.AHUdata.map[ahu].length!=0){
                                    if(this.state.AHUdata.map[ahu][0]==0){
                                        map.push(0);
                                    }else{
                                        map.push(1);
                                    }
                                   
                                }else if(this.state.AHUdata.map[ahu]!=undefined&&this.state.AHUdata.map[ahu].length==0){
                                    map.push(-1);
                                }else if(this.state.AHUdata.map[ahu]==undefined){
                                    map.push(-1)
                                }
                            }
                            AHUmap.push(map);
                            map=[];
                        }
                    
                }
            
                    let max = 0;
                    for(let i=0;i<AHUMap[this.state.i].length;i++){
                        if(max<AHUMap[this.state.i][i].length){
                            max = AHUMap[this.state.i][i].length
                        }
                    }
                    for(let i=1;i<=max;i++){
                        hours.push(i)
                    }
                    if(this.state.AHUData.length==0){
                    for(let i=0;i<AHUmap.length;i++){
                        for(let j=0;j<AHUmap[i].length;j++){
                        let data = [[j,i,AHUmap[i][j]]];
                        series.push({
                            name: AHUMapName[this.state.i][i][j],
                            type: 'heatmap',
                            data: data,
                            label: {
                                    show: true
                            },
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        })
                        data=[];
                  
                }
                }
                }
        
                if(this.state.AHUData.length!=0){
                    let i = this.state.i;
                    for(let j=0;j<AHUMap[i].length;j++){
                        for(let k=0;k<AHUMap[i][j].length;k++){
                            let datai = this.state.AHUData.filter(item=>{
                                
                                    return item.name==AHUMap[i][j][k]
                                });
                                let datay=0;
                                if(datai.length==1){
                                datay = parseInt(datai[0].value);//AHUMap[i][j][k]
                                }else{
                                datay=0;
                                }
                            let data = [[k,j,datay]];
                            series.push({
                                name: AHUMapName[this.state.i][j][k],
                                type: 'heatmap',
                                data: data,
                                label: {
                                        show: true
                                },
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            })
                            data=[];
                    
                        }
                    
                    }
                }
            
                    return{
                        tooltip: {
                            position: 'top'
                        },
                        animation: false,
                        grid: {
                            right:50,
                            height: '50%',
                            y: '20%'
                        },
                        xAxis: {
                            type: 'category',
                            data: hours,
                            splitArea: {
                                show: true
                            }
                        },
                        yAxis: {
                            type: 'category',
                            data: zoneName,
                            splitArea: {
                                show: true
                            }
                        },
                        visualMap: {
                            orient: 'horizontal',
                            left: 'center',
                            bottom: '15%',
                            pieces: [
                                {gt: 0,color:'green'},  // (0,+无穷]
                                
                                {lte: 0,color:'gray'},
                                {lte:-1,color:'black'} // (-1, 0]
                                
                                           
                            ],
                            bottom: '10px'
                        },
                        series: series,
                        grid:{
                            top:30,
                            bottom:50,
                            left:80,
                            right:30
                        }
                    }
        }
        if(this.state.j==2){
            let valveMap = this.state.valveMap;
            let AHUMapName = this.state.AHUMapName;
            let i = this.state.i;
            for(let j=0;j<valveMap[i].length;j++){
                for(let k=0;k<valveMap[i][j].length;k++){
                    let datai = this.state.valveData.filter(item=>{
                        
                            return item.name==valveMap[i][j][k]
                        });
                        let datay=0;
                        if(datai.length==1){
                        datay = parseInt(datai[0].value);//AHUMap[i][j][k]
                        }else{
                        datay='-';
                        }
                    let data = [[k,j,datay]];
                    series.push({
                        name: AHUMapName[this.state.i][j][k],
                        type: 'heatmap',
                        data: data,
                        label: {
                                show: true,
                                fontSize:28,
                                color:'rgba(0,0,0,1)'
                        },
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    })
                    data=[];
            
                }
            
            }
            let max = 0;
                    for(let i=0;i<valveMap[this.state.i].length;i++){
                        if(max<valveMap[this.state.i][i].length){
                            max = valveMap[this.state.i][i].length
                        }
                    }
                    for(let i=1;i<=max;i++){
                        hours.push(i)
                    }
            let high = this.props.config.valveHigh!=undefined?this.props.config.valveHigh:80;
            let low = this.props.config.valveLow!=undefined?this.props.config.valveLow:20;
            return{
                tooltip: {
                    position: 'top'
                },
                animation: false,
                grid: {
                    right:50,
                    height: '50%',
                    y: '20%'
                },
                xAxis: {
                    type: 'category',
                    data: hours,
                    splitArea: {
                        show: true
                    }
                },
                yAxis: {
                    type: 'category',
                    data: zoneName,
                    splitArea: {
                        show: true
                    }
                },
                visualMap: {
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '15%',
                    pieces: [
                        {gt: high,color:'red'},  // (0,+无穷]
                        
                        {gt: low,lte :high,color:'yellow'},
                        {lte:low,color:'green'} // (-1, 0]
                        
                                   
                    ],
                    bottom: '10px'
                },
                series: series,
                grid:{
                    top:30,
                    bottom:50,
                    left:80,
                    right:30
                }
        }
    }
        if(this.state.j==4){
                
                    let max = 0;
                    for(let i=0;i<roomName.length;i++){
                        if(max<roomName[i].length){
                            max = roomName[i].length
                        }
                    }
                    for(let i=1;i<=max;i++){
                        hours.push(i)
                    }
                    let AHUMap = this.state.AHUMap;
                    let AHUmap = [];
                    
                    if(JSON.stringify(this.state.AHUdata) != "{}"){
                        let i = this.state.i;
                        let map = [];
                            for(let j=0;j<AHUMap[i].length;j++){
                                for(let k=0;k<AHUMap[i][j].length;k++){
                                    let ahu = AHUMap[i][j][k]
                                    
                                    if(this.state.AHUdata.map[ahu]!=undefined&&this.state.AHUdata.map[ahu].length!=0){
                                        if(this.state.AHUdata.map[ahu][0]==0){
                                            map.push(0);
                                        }else{
                                            map.push(1);
                                        }
                                    
                                    }else if(this.state.AHUdata.map[ahu]!=undefined&&this.state.AHUdata.map[ahu].length==0){
                                        map.push('-');
                                    }else if(this.state.AHUdata.map[ahu]==undefined){
                                        map.push('-')
                                    }
                                }
                                AHUmap.push(map);
                                map=[];
                            }
                        
                    }
                    if(this.state.fData.length!=0){

                        for(let i=0;i<pointList.length;i++){
                            for(let j=0;j<pointList[i].length;j++){
                                
                            let data = this.state.fData.filter(item=>{
                                
                                    return item.name==pointList[i][j]
                                });
                            if(data.length != 0 && data[0].value!=undefined){
                            let len = data.length>0?data.length-1:0;
                                if(len==0&&data[len].value>=0){
                                    let y = 0;
                                    for(let k=0;k<AHUmap[i].length;k++){
                                        if(AHUmap[i][k]==1){
                                            y=data[len].value;break;
                                        }
                                    }
    
                                        tdata.push([i,hours[j]-1,y])
                                    }
                            tdata = tdata.map(function (item) {
                                return [item[1], item[0], item[2] || '-'];
                            });
                            series.push({
                                name: roomName[i][j],
                                type: 'heatmap',
                                data: tdata,
                                label: {
                                    show: true
                                },
                                emphasis: {
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            })
                            tdata=[];
                        }
                    }
                    }
                    }
                    if(JSON.stringify(fdata) != "{}"&&this.state.fData.length!=0){
                    for(let i=0;i<pointList.length;i++){
                        for(let j=0;j<pointList[i].length;j++){
                        let data = fdata.map[pointList[i][j]];
                        if(data!=undefined){
                        let len = data.length-1>0?data.length-1:0;
                            if(len>0&&data[len]>=0){
                                let y = 0;
                                for(let k=0;k<AHUmap[i].length;k++){
                                    if(AHUmap[i][k]==1){
                                        y=data[len];break;
                                    }
                                }

                                    tdata.push([i,hours[j]-1,y])
                                }
                        tdata = tdata.map(function (item) {
                            return [item[1], item[0], item[2] || '-'];
                        });
                        series.push({
                            name: roomName[i][j],
                            type: 'heatmap',
                            data: tdata,
                            label: {
                                show: true
                            },
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        })
                        tdata=[];
                    }
                }
                }
                }

            let tempRed = this.props.config.tempRed!=undefined?this.props.config.tempRed:28;
            let tempOrangeGt = this.props.config.tempOrange!=undefined && this.props.config.tempOrange[0]!=undefined?this.props.config.tempOrange[0]:27;
            let tempOrangelte = this.props.config.tempOrange!=undefined && this.props.config.tempOrange[1]!=undefined?this.props.config.tempOrange[1]:28;
            let tempGreenGt = this.props.config.tempGreen!=undefined && this.props.config.tempGreen[0]!=undefined?this.props.config.tempGreen[0]:23;
            let tempGreenlte = this.props.config.tempGreen!=undefined && this.props.config.tempGreen[1]!=undefined?this.props.config.tempGreen[1]:27;
            let tempBlue = this.props.config.tempBlue!=undefined ?this.props.config.tempBlue:23;

            return{
                tooltip: {
                    position: 'top'
                },
                animation: false,
                grid: {
                    right:50,
                    height: '50%',
                    y: '20%'
                },
                xAxis: {
                    type: 'category',
                    data: hours,
                    splitArea: {
                        show: true
                    }
                },
                yAxis: {
                    type: 'category',
                    data: zoneName,
                    splitArea: {
                        show: true
                    }
                },
                visualMap: {
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '15%',
                    pieces: [
                        // {gt: 28,color:'red'},  // (28,+无穷]
                        // {gt: 27, lte: 28,color:'orange'},  // (900, 1500]
                        // {gt: 23, lte: 27,color:'green'},  // (310, 1000]
                        // { lte: 23,color:'blue'} // (200, 300]
                        //             // (-Infinity, 5)
                        {gt: tempRed,color:'red'},  // (28,+无穷]
                        {gt: tempOrangeGt, lte: tempOrangelte,color:'orange'},  // (900, 1500]
                        {gt: tempGreenGt, lte: tempGreenlte,color:'green'},  // (310, 1000]
                        { lte: tempBlue,color:'blue'} // (200, 300]
                                    // (-Infinity, 5)
                    ],
                    bottom: '10px'
                },
                series: series,
                grid:{
                    top:30,
                    bottom:50,
                    left:80,
                    right:30
                }
            }
        }
    }

     getChartOption() {
        
         let roomName = this.state.roomNamei?this.state.roomNamei:[];
         let zoneName = this.state.zoneNamei?this.state.zoneNamei:[];
         let pointList = this.state.pointListi?this.state.pointListi:[];
         let point = this.state.pointi?this.state.point:[];
         let series = [];
         let List = this.state.Listi?this.state.Listi:[];
         let room = '';
         let name =this.state.namei.length>0?this.state.namei:[];
         let index =[];
         let filter = [];
         let environment = [];
         let fdata = this.state.fdata?this.state.fdata:{};
         let tdata = [];
         let legend = [];
        if(JSON.stringify(fdata) != "{}"){
            for(let i=0;i<pointList.length;i++){
                for(let j=0;j<pointList[i].length;j++){
                    let pl = pointList[i][j];
                    let len = fdata.map[pl].length-1>0?fdata.map[pl].length-1:0;
                    let k = fdata.map[pl];
                 if(len>0&&k[len]>=0){
                        
                        let x =k[len]-k[0];
                        let y = k[len];
                        
                        let z = parseInt(y*100,10)/100;
                            z=Math.pow(z,3);
                        tdata.push([x,y,z,roomName[i][j]],0)
                    }
                }   
                series.push({
                        name: zoneName[i],
                        data: tdata,
                        type: 'scatter',
                        symbolSize: function (data) {
                             
                            return Math.sqrt(data[2])/10;
                        },
                        label: {
                            emphasis: {
                                show: true,
                                formatter: function (param) {
                                    return param.data[3];
                                },
                                position: 'top'
                            }
                        },
                        itemStyle: {
                            normal: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(120, 36, 50, 0.5)',
                                shadowOffsetY: 5,
                                
                            }
                        }
                    })
                    tdata=[];
                }
            
        
            }
            
                    
        return{
            
            
                
                legend:{
                    right: 10,
                    data:zoneName
                },
                xAxis: {
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    }
                },
                yAxis: {
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                    scale: true
                },
                series: series
            }
           
     }


     

     onChartClick = (param, echarts) => {
        //let reactEcharts = 
        // alert(reactEcharts);
        this.setState({
          cnt: this.state.cnt + 1,
        })
      };
    
      onChartLegendselectchanged = (param, echart) => {
        
      };
    

     onChartReady(echarts){
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

    // onOption(){
    //     return(<div>{
    //        this.state.LoadName.map(item=>{return <Option value={item}>item</Option>})
    //     }
    //     </div>)
    // }

    //点击刷新按钮
    onRenovate(){
        switch(this.state.j){
            case '1':    
                this.setState({
                    loadingAHU:true
                })
                this.refreshCountAHU(); 
            break;
            case '2':
                this.setState({
                    loadingValve:true
                })
                this.getChartData3(); 
            break;
            case '3':
                this.setState({
                    loadingTempTrend:true
                })
                let startTime = moment().subtract(1, "hour").format(TIME_FORMAT);
                let endTime = moment().format(TIME_FORMAT);
                this.getChartData(startTime,endTime);
                break;
            case '4':
                this.setState({
                    loadingTemp:true
                })
                this.refreshCountTemp();
                break;
            default:
                this.setState({
                    loadingAHU:true
                })
                this.refreshCountAHU(); 
             break;
        }
    }
        
    render() {
       
        let config = this.props.config
        let flag =  config.input!=undefined
        let option = this.state.LoadName.map((item,index)=>{return <Option value={index}>{item}</Option>});
        let LoadName = this.state.LoadName[0];
        let onEvents = {
            'click': this.onChartClick,
            'legendselectchanged': this.onChartLegendselectchanged
          }
        return (
            <div >
            <div style={{margin:"20px",color:"black"}}>
                <div style={{float:'left'}}>
            切换楼宇：<Select defaultValue={LoadName} style={{ width: 120 }} onChange={this.handle}>
                {option}
                </Select>
                切换视图：<Select defaultValue="1" style={{ width: 120 }} onChange={this.handleChange}>
                <Option value="1">AHU运行状态</Option>
                <Option value="2">阀位分布</Option>
                <Option value="3">温度与趋势视图</Option>
                <Option value="4">过冷过热一览</Option>
                </Select>
                </div>
                <div style={{float:'left',marginLeft:20}}>
                <Button onClick={this.onRenovate}>刷新</Button>
                </div>
                </div>
                {/* <div style={{width:1918,height:880}}>{this.getDivData()}</div> */}
                <div className={s['chart-container']} ref={this.saveContainerRef}>
                {
                        this.state.loadingAHU ||  this.state.loadingValve || this.state.loadingTempTrend || this.state.loadingTemp? 
                            <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
                                <Spin tip="正在读取数据"/>
                            </div>
                        : 
                            <ReactEcharts
                                style={{
                                    height: '100%'
                                }}
                                ref={this.saveChartRef()}
                                option={this.state.j=="3"?this.getChartOption():this.getChart()}
                                theme="white"
                                notMerge={true}
                                onChartReady={this.onChartReady} 
                                onEvents={onEvents}
                            />
                        
        
                }
                
                </div>
                <div>

                </div>
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
class CoolingComponent extends Widget {
    
    constructor(props){
        super(props)
        this.state = {
            style : {},
            AirConditionZoneList:[]
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
            <div  style={{color:'black'}}>
            </div>

                <FormWrap
                    data={this.state.AirConditionZoneList}
                    timeRange={getTimeRange('today')}
                    format='m5'
                    {...this.props}
                    
                />
                <div></div>
            </div>
        )
    }
}

export default  CoolingComponent