import React, { Component } from 'react'
import {Table,Form, Select, DatePicker, Button, Switch, message,Input,Row,Col,Modal,Tag} from 'antd'
import  s from './EquipListControlView.css'
import { modalTypes } from '../../../../common/enum';
import http from '../../../../common/http';
import moment from 'moment';
import WORD_DOWNLOAD_TEMPLATE from './downloadTemplates/word.html';
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';
const registerInformation = {
    type : 'EquipmentListControl',
    name : '测试组件',
    description : "生成table组件，覆盖canvas对应区域",
}

var interval = 5000;
let user_info = localStorage.getItem('userInfo') ? 
                JSON.parse(localStorage.getItem('userInfo')) : {}
const FormItem = Form.Item;

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    var year = this.getFullYear().toString();
    year = year.length >= 4 ? year : '0000'.substr(0, 4 - year.length) + year;

    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (year + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
const getTimeRange = function (period,span,getHistoryData) {
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
    case 'yesterday':
      startTime = moment().subtract(1, 'day');
      endTime = moment();
      break;
  }
  window.localStorage.setItem('reportRange',JSON.stringify({
      startTime,
      endTime
  }));
  window.localStorage.setItem('reportSpan',JSON.stringify({
      span
  }));

  getHistoryData(startTime, endTime, span)

  return [startTime, endTime];
}

class EquipListControlView extends React.Component {

    constructor(props){
        super(props)
        
        this.state = {
            style : {},
            groupList:[],
            headerHeight :0,
            columns : [],
            dataSource:[],
            pointvalue:[],
            changeId:{},
            equipListObj:{},
            reportType: true, //0是传感器值，1是累计量值
            loading: false,
            pointObj:{},
            pointList:[],
            preColumns:[],
            fddGroup:[],
            fddData:[],
            selectName:"",
            isShowModal:false
        }
        this.getPointList = this.getPointList.bind(this);
        this.getRealTime = this.getRealTime.bind(this);
        this.getColumns = this.getColumns.bind(this);
        this.initRenderTable = this.initRenderTable.bind(this);
        this.initName = this.initName.bind(this);
        this.getEquipmentList = this.getEquipmentList.bind(this);
        this.onSwitchChange = this.onSwitchChange.bind(this);
        this.submitData=this.submitData.bind(this)
        this.inputOnChange=this.inputOnChange.bind(this)
        this.checkPointRefresh=this.checkPointRefresh.bind(this)
        this.getAHURealTime = this.getAHURealTime.bind(this)
        this.getOtherColumns = this.getOtherColumns.bind(this)
        this.getOtherEquipmentList = this.getOtherEquipmentList.bind(this)
        this.getFdd = this.getFdd.bind(this)
        this.showFddModal = this.showFddModal.bind(this)
        this.hideModal = this.hideModal.bind(this)
    }
    antdTableHearder = () => {
        // let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header'))
        let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header') || this.tableContainerRef.querySelector('.ant-table-thead'))
        let headerHeight = parseInt( catchedTableHeadStyle.height )
        this.setState({
            headerHeight : headerHeight
        })
    }

    //使表头居中
    initTitle(colName){
        return <span style={{display:'table',margin:'0 auto'}}>{colName}</span>
    }

    //设置表头列
    componentDidMount() {
        // console.log(this.props)
        const {width,height,left,top} = this.props.style
        const groupList = this.props.config.groupList || []
        const controllable = this.props.config.controllable
        let header= []
        let headerJson=[]
        if (controllable === 0) {
            header= ['位置体系','设备','开关状态','运行时长','故障状态','重要参数'] 
            headerJson= ['Position','Name','OnOff','Hour','Err','Param']
        }else {
            header= ['位置体系','设备','开关状态','开关设备','运行时长','故障状态','重要参数',"人工设定"]
            headerJson= ['Position','Name','OnOff','Enabled','Hour','Err','Param',"Action"]
            
        }
        let headerWidth= {'Position':100,'Name':100,'OnOff':100,'Enabled':100,'Hour':100,'Err':100,'Param':200,"Action":150}
        // 初始化
        let columns = []
        header.forEach((col,key)=>{
            if (col=="开关设备" || col=="重要参数" || col=="人工设定" || col == "故障状态") {
                columns.push({
                    title:this.initTitle(col),//标题需要通过返回一个reactNode的方式进行设置
                    dataIndex:headerJson[key],
                    key : headerJson[key],
                    className:s['antdcolumn'],
                    align:"center",
                    width:headerWidth[headerJson[key]],
                    render:(text, record) => this.renderColumns(text, record,col)
                })
            }else{
                columns.push({
                    title:this.initTitle(col),
                    dataIndex:headerJson[key],
                    key : headerJson[key],
                    className:s['antdcolumn'],//设置body里面的列的样式
                    align:"center",
                    width:headerWidth[headerJson[key]],
                    render:(text, record) => {
                        return (text ? <span>{text}</span> : <span></span>);
                    }
                })
            }
        })
       
        this.setState({
            style : {
                width : width,
                height : height,
                left : left,
                top : top
            },
            columns : columns,
            groupList:groupList
        });
        //将查询函数放入store里，用来修改值后调用刷新表格
        this.getPointList(groupList)
    }
    //请求点位配置数据
    getPointList (groupList) {
        //加载中……
        let equipListObj=this.state.equipListObj;
        let list = {}
        if(equipListObj && JSON.stringify(equipListObj) == "{}"){
            http.post('/project/getConfig', {
            }).then(     
                data=>{
                    if (data.status) {
                        if (groupList.length ===0) {
                            this.setState({
                                equipListObj:data.data.EquipmentManagement
                            })
                            //获取点位实时数据
                            this.getRealTime()
                        }else {
                            //筛选出自定义组件groupList中想要显示的设备数组
                            groupList.map((row,index)=>{
                                list[row] = data.data.EquipmentManagement[row]
                            })
                            //获取到点位数据
                            this.setState({
                                equipListObj:list
                            })

                            this.getOtherColumns(list)
                        }

                       

                        //是否开启  定时任务刷新  暂时未开启
                        //setInterval(this.getRealTime, interval);
                    }else {
                        Modal.error({
                            title : '错误提示',
                            content :"Factory中设备系统定义配置内容有误："+ data.msg
                        });
                
                    }
                }    
            )
        }else{
            this.getRealTime()
        }
    }

    /**
     * 获取点位实时数据方法
     */
    getRealTime () {
        let equipListObj=this.state.equipListObj
        let pointList=[
            'ChEnabled01','CHourCh01','ChErr01','ChLeaveEvapTemp01','ChChWTempSupplySetPoint01','ChAMPS01',
            'ChEnabled02','CHourCh02','ChErr02','ChLeaveEvapTemp02','ChChWTempSupplySetPoint02','ChAMPS02',
            'ChEnabled03','CHourCh03','ChErr03','ChLeaveEvapTemp03','ChChWTempSupplySetPoint03','ChAMPS03',
            'CWPEnabled01','CWPHourCh01','CWPErr01','CWPVSDFreq01','CWPVSDFreqSetting01',
            'CWPEnabled02','CWPHourCh02','CWPErr02','CWPVSDFreq02','CWPVSDFreqSetting02',
            'CWPEnabled03','CWPHourCh03','CWPErr03','CWPVSDFreq03','CWPVSDFreqSetting03',
            'CTEnabled01','CTHourCh01','CTPErr01','CTVSDFreq01','CTVSDFreqSetting01',
            'CTEnabled02','CTHourCh02','CTPErr02','CTVSDFreq02','CTVSDFreqSetting02',
            'CTEnabled03','CTHourCh03','CTPErr03','CTVSDFreq03','CTVSDFreqSetting03',
            'PriChWPEnabled01','PriChWPHourCh01','PriChWPErr01','PriChWPVSDFreq01','PriChWPVSDFreqSetting01',
            'PriChWPEnabled02','PriChWPHourCh02','PriChWPErr02','PriChWPVSDFreq02','PriChWPVSDFreqSetting02',
            'PriChWPEnabled03','PriChWPHourCh03','PriChWPErr03','PriChWPVSDFreq03','PriChWPVSDFreqSetting03'
        ]
        http.post('/get_realtimedata', {
            "proj":1,
            "pointList":pointList
        }).then(
            data=>{
                //通过点位配置信息，先配置好datasource  重要参数的值  默认先设置为空
                let columns=this.getColumns(equipListObj)
                let pointJson = {}
                for(let i=0;i<data.length;i++){
                    let p=data[i]
                    pointJson[p.name]=p.value
                }

                //对为空的重要参数值  设置为点位值
                let ds=this.initRenderTable(columns,pointJson)
                this.setState({
                    dataSource:ds,
                    loading:false
                })
       
                
            }
        )
    }

    //提交数据后，检查后台是否是最新数据，如果不是，则重复检索10次，直到获取到最新数据loading消失
    checkPointRefresh (point,val,count) {
        let pointListArr=this.state.pointList
        const {preColumns,groupList,equipList} = this.state
        let pointList=[
            point
        ]

        count=count+1
       
        http.post('/get_realtimedata', {
            "proj":1,
            "pointList":pointList
        }).then(
            data=>{
                if(data.length>0){
                    //获取的点位值   与提交的点位值进行比较  如果一致，则重新获取表格数据
                    if(val==data[0].value){
                        //if (groupList[0]==="AHUList"){
                        if (groupList.length != 0){
                            this.getAHURealTime(pointListArr,preColumns)
                        }else{
                            this.getRealTime(equipList)                 
                        }
                    }else{
                        //如果不一致，则重试10次，直到获取到最新的点位数据位置
                        if(count<10){
                            setTimeout(this.checkPointRefresh(point,val,count),500)
                        }else{
                            this.setState({
                                loading:false
                            })
                            Modal.error({
                                title : '错误提示',
                                content :"无法获取点位数据!"
                            });
                        }
                    }
                }else{//如果第一次就没有获取到点位数据，则表明  点位配置存在问题，需修正点位名称
                    this.setState({
                        loading:false
                    })
                    Modal.error({
                        title : '错误提示',
                        content :"无法获取点位数据!"
                    });
                }
            }
        )
    }

    /**
     * 用于在datasource中填充  查询到的点位实时数据
     * @param {datasource} 数据源数据 
     * @param {pointJson}  点位数据 
     */
    initRenderTable(columns,pointJson){
        const fddData = this.state.fddData
        if (this.state.groupList.length != 0){
            let ahuListObj = []
            this.state.groupList.map((row,index)=>{
                this.state.equipListObj[row].map((item,j)=>{
                    ahuListObj.push(item)
                })
            })
            
            for(let i=0;i<columns.length;i++){
                //首次组装
                if (typeof columns[i].ParamText === 'undefined') {
                    
                    let cobj=columns[i];
                    let cname=cobj.NameTxt;
                    let dname=cobj.Name;

                    let headerJson= ['Position','Name','OnOff','Enabled','Hour','Err','Param']
                    //let prvName=this.initName(cname)
                    
                    let numberCl=columns[i].Number
                    let ParamCl=columns[i].Param
                    
                    let index="0"+numberCl;

                    let key1= columns[i].Enabled    
                    let key2= columns[i].Hour   
                    let key3= ''
                    let key4=""
                    let key5=""
                    let key6= columns[i].OnOff

                    fddData.forEach((row,j)=>{
                        if (row.groupName === dname) {
                            key3 = row.groupFddFaultCount
                        }
                    })

                    ahuListObj.map((row,index)=>{
                        if (row.Name === cname) {
                            key4 = row[ParamCl]
                            key5 = ParamCl
                        }
                    })
                    columns[i].Enabled=pointJson[key1];
                    columns[i].Hour=(dname ? (pointJson[key2] ? pointJson[key2]+"h" : "0    h") : "    ");
                    columns[i].Err=key3;
                    columns[i].Param=(pointJson[key4] ? pointJson[key4] : "");
                    columns[i].ParamText=key5;
                    columns[i].ParamPoint=key4;
                    columns[i].OnOff=(dname ? (pointJson[key6]==="1" ? "运行" : "停止") : "" );
                }else {
                    let cobj=columns[i];
                    let cname=cobj.NameTxt;
                    let dname=cobj.Name;

                    let headerJson= ['Position','Name','Enabled','Hour','Err','Param']
                    let numberCl=columns[i].Number
                    let ParamCl=columns[i].ParamText
                    
                    let index="0"+numberCl;

                    let key1= columns[i].OnOffPoint    
                    let key2= columns[i].RunHourPoint   
                    let key3= ''
                    let key4=columns[i].ParamPoint
                    let key6= columns[i].OnOff

                    fddData.forEach((row,j)=>{
                        if (row.groupName === dname) {
                            key3 = row.groupFddFaultCount
                        }
                    })


                    columns[i].Enabled=pointJson[key1];
                    columns[i].Hour=(dname ? (pointJson[key2] ? pointJson[key2]+"h" : "0    h") : "    ");
                    columns[i].Err=key3;
                    columns[i].Param=(pointJson[key4] ? pointJson[key4] : "");
                    columns[i].ParamText=ParamCl;
                    columns[i].ParamPoint=key4;
                    columns[i].OnOff=(dname ? (pointJson[key6]==="1" ? "运行" : "停止") : "" );
                }
               
            }

        }else{
            for(let i=0;i<columns.length;i++){
                let cobj=columns[i];
                let cname=cobj.NameTxt;
                let dname=cobj.Name;

                let headerJson= ['Position','Name','Enabled','Hour','Err','Param']
                let prvName=this.initName(cname)
                let numberCl=columns[i].Number

                let ParamCl=columns[i].Param
                let index="0"+numberCl;

                let key1=(prvName=="CH" ? "ChEnabled"+index : prvName+"Enabled"+index)
                let key2=(prvName=="CH" ? "CHour"+index : prvName+"Hour"+index)
                let key3=(prvName=="CH" ? "ChErr"+index : prvName+"Err"+index)
                let key4=(prvName=="CH" ? "Ch"+ParamCl+index : prvName+ParamCl+index)

                columns[i].Enabled=pointJson[key1];
                columns[i].Hour=(dname ? (pointJson[key2] ? pointJson[key2]+"h" : "0    h") : "    ");
                columns[i].Err=(dname ? (pointJson[key3]!=-1 ? "正常" : "异常") : "" );
                columns[i].Param=(pointJson[key4] ? pointJson[key4] : "");
                columns[i].ParamText=key4;
            }
        }
       
        return columns;
    }
    
    //用于组装中文名称与点位的对应关系
    initName(name){
        let nameMap={"冷水机组":"CH","冷却水泵":"CWP","冷冻水泵":"PriChWP","冷却塔":"CT"}
        for(let key in nameMap){
            if(name.indexOf(key)!=-1){
                return nameMap[key]
            }
        }

    }

    //组装datasource对象，getColumns应该叫做  getDatasource 
    //先通过配置信息  组装好表格所需要的基本的datasource对象， 在通过获取到的点位数据与datasource对象赋值
    //完善datasource数据，（主要为了填充  重要参数列所有的参数对应的值）
    getColumns = (equipListObj) => {
        //根据groupList,筛选组装
        let groupList = this.state.groupList
        if (groupList.length === 0) {
            let ctList=equipListObj.CTList
            let cwpList=equipListObj.CWPList
            let chList=equipListObj.ChList
            let priList=equipListObj.PriChWPList
            //增加分组，morgan添加
            let ahuList = equipListObj.AHUList

            let a1=this.getEquipmentList(chList,"Ch")
            let a2=this.getEquipmentList(cwpList,"CWP")
            let a3=this.getEquipmentList(priList,"PriChWP")
            let a4=this.getEquipmentList(ctList,"CT")
            let a5= this.getEquipmentList(ahuList,"AHU")
            return a1.concat(a2,a3,a4,a5);
        }else{

        }    
    }
    //除了冷机的其他设备
    getOtherColumns (equipListObj) {
        const groupList = this.state.groupList
        let listArr = []
        groupList.map((row,index)=>{
           equipListObj[row].map((item,j)=>{
               listArr.push(item)
           })

            // switch (row) {
            //     case "AHUList":
            //         this.getOtherEquipmentList(equipListObj.AHUList,"AHU")
            //         break;
            // }
            //listArr = listArr.concat(arr)
        })
        this.getOtherEquipmentList(listArr)
        // console.log(listArr)
        // return listArr
    }

    //除了冷机的其他设备
    getOtherEquipmentList= (list) => {
        let arr = []
        let params = []
        let param = []
        let fddGroup = []
        
        let pointList=[];
        for(var i=0;i<list.length;i++){
            let iobj=list[i];
            let groupName = ''
            let fddList = []
            params = ["OnOffStatePoint","OnOffPoint","ErrPoint","RunHourPoint","FANVSDFreq","FANVSDFreqSetting","AirSupplyTempSetting","AirSupplyTemp","AirReturnTemp"] 
            param = ["FANVSDFreq","FANVSDFreqSetting","AirSupplyTempSetting","AirSupplyTemp","AirReturnTemp"]     
       
            let listArr = []
            let nowParam = []
            //组装每个设备的诊断请求信息
            groupName = iobj.Name
            fddList = iobj.fddList
            fddGroup.push({
                groupName,
                fddList
            })

            params.map((row,index)=>{
                if (typeof iobj[row] != 'undefined') {
                    listArr.push(iobj[row]) 
                }
            })
            pointList = pointList.concat(listArr)

            //遍历出该组件配置的参数
            param.map((item,i)=>{
                if (typeof iobj[item] != 'undefined') {
                    nowParam.push(item) 
                }
            })

            nowParam.map((item,j)=>{
                let aobj={'Position':'','Name':'','OnOff':'','Enabled':'','Hour':'','Err':'',"Action":""}
                if(j===0){
                    aobj=iobj
                }
                if (typeof iobj[item] != 'undefined') {
                    aobj.NameTxt=iobj.Name
                    aobj.Number=iobj.Number
                    aobj.Action=""
                    aobj.OnOff=iobj["OnOffStatePoint"]
                    aobj.Enabled=iobj["OnOffPoint"]
                    aobj.Hour=iobj["RunHourPoint"]
                    aobj.Err=iobj["ErrPoint"]
                    aobj["Param"]=item
                    
                }      
                arr.push(aobj)
            })
        
        }
        this.setState({
            pointList:pointList,
            preColumns:arr,
            fddGroup:fddGroup
        })
        this.getFdd(fddGroup)
        this.getAHURealTime(pointList,arr)
    }

    //通过配置文件，组装datasource对象
    getEquipmentList = (list,type) => {
        let arr=[];
        // morgan增加了一个判断语句
        if(list!==undefined){
            for(var i=0;i<list.length;i++){
                let iobj=list[i];
                let params=(type=="Ch" ? ["LeaveEvapTemp","ChWTempSupplySetPoint","AMPS"] : ["VSDFreq","VSDFreqSetting"])
                for(let j=0;j<params.length;j++){
                    let aobj={'Position':'','Name':'','Enabled':'','Hour':'','Err':'',"Action":""}
                    if(j==0){
                        aobj=iobj
                    }
                    aobj.NameTxt=iobj.Name
                    aobj.Number=iobj.Number
                    aobj.Action=""
                    aobj["Param"]=params[j]
                    arr.push(aobj)
                }
            }
        }
        return arr;
    }

    //获取所有设备的诊断信息
    getFdd(fddGroup) {
        let start = moment().startOf('day').format(TIME_FORMAT)
        let end = moment().format(TIME_FORMAT)
        http.post('/fdditem/get_realtime_status',{
            fddGroup:fddGroup,
            QueryTimeFrom:start,
            QueryTimeTo:end
        }).then(
            data=>{
                if (data.err === 0) {
                    this.setState({
                        fddData:data.data
                    })
                    this.packageFddData(data.data)
                }else{
                    message.error(data.err,3)
                }
            }
        ).catch(
            ()=>{
                message.error('请求诊断信息失败',3)
            }
        )
    }

    //整理所有的设备诊断内容
    packageFddData(fddData) {
        if (fddData.length != 0) {
            
        }
    }


    getAHURealTime(pointList,columns){   
         http.post('/get_realtimedata', {
            "proj":1,
            "pointList":pointList
        }).then(
            data=>{
                if (data.length === 0) {
                    // let arr = []
                    // for(let j=0;j<params.length;j++){
                    //     let aobj={'Position':'','Name':'','Enabled':'','Hour':'','Err':'',"Action":""}
                    //     if(j==0){
                    //         aobj=iobj
                    //     }
                    //     aobj.NameTxt=iobj.Name
                    //     aobj.Number=iobj.Number
                    //     aobj.Action=""
                    //     aobj["Param"]=params[j]
                    //     arr.push(aobj)
                    // }
                    // return arr
                }else{

                    let pointJson = {}
                    for(let i=0;i<data.length;i++){
                        let p=data[i]
                        pointJson[p.name]=p.value
                    }

                    this.setState({
                        pointObj:pointJson
                    })

                     //对为空的重要参数值  设置为点位值
                    let ds=this.initRenderTable(columns,pointJson)
                    this.setState({
                        dataSource:ds
                    })
                

                }
            }
        )
    }



    componentWillReceiveProps(nextProps){
        if(this.state.style.width !== nextProps.style.width || this.state.style.height !== nextProps.style.height ){
            const {width,height,left,top} = nextProps.style
            this.setState({
                style : {
                    width : width,
                    height : height,
                    left : left,
                    top : top
                }
            })
        }
        // // 判断两个数组内容是否相等
        // if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(nextProps.pointvalue)){
        //     this._renderTable(nextProps)
        // }
    }

    //提交重要参数 数据设定值，并添加日志以及刷新表格数据
    submitData(id,nameTxt){
        id=""+id
        let val=this.state.changeId[id]
        this.setState({loading:true});
        http.post('/pointData/setValue', {
                "pointList": [id],
                "valueList":[val],
                "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            data=>{
                this.checkPointRefresh(id,val,1)
                this.actionSetLog(id,nameTxt,val,val);
            }
        )
    }

    showFddModal(selectName) {
        this.setState({
            isShowModal:true,
            selectName:selectName
        })
    }

    hideModal() {
        this.setState({
            isShowModal:false
        })
    }
 
    //设定值onchange回调函数
    inputOnChange(e){
        let id=e.target.id;
        id=""+id
        let val=e.target.value;
        let json={};
        json[id]=val;
        this.setState({
            changeId:json
        })
    }

    //启用，禁用开关 提交点位值函数
    onSwitchChange(checked,id,nameTxt){
        id=""+id
        let val=(checked ? "1" : "0")
        this.setState({loading:true});
        http.post('/pointData/setValue', {
                "pointList": [id],
                "valueList":[val],
                "source": localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
        }).then(
            data=>{
                this.checkPointRefresh(id,val,1)

                let description=nameTxt+"于"+moment().format("YYYY-MM-DD HH:mm:00")+"进行了"+(checked ? "开机" : "关机");
                this.actionEnabledLog(description)
            }
        )
    }


    // 渲染列
    renderColumns (text,record,column) {
        if (this.state.groupList.length != 0) {
            if(column=="开关设备"){
                let defaultChecked=false
                // //let index="0"+record.Number;
                // let prvName=this.initName(record.NameTxt)

                // let jvalText=(prvName=="CH" ? "ChEnabled"+index : prvName+"Enabled"+index)
                if(record.Enabled=="1"){
                    defaultChecked=true
                }
                 let nameTxt=record.NameTxt
                if(record.Name){
                    return (
                        <div className={s['inrow-div2']}>
                            <Switch defaultChecked={defaultChecked} onClick={(checked)=>{this.onSwitchChange(checked,record.OnOffPoint,nameTxt)}} />
                        </div>
                    )
                }else{
                    return ""
                }
            }else if(column=="重要参数"){
                let tjson={"AirSupplyTempSetting":"供水温度设定值","AirSupplyTemp":"供水温度","AirReturnTemp":"回水温度","FANVSDFreq":"运行频率","FANVSDFreqSetting":"频率设定值"}
                let jtxt="";
                let jval="";
                let unit="";
                for(let key in tjson){
                    let keytxt="";
                    if(record.ParamText.indexOf(key)!=-1){
                        keytxt=key;
                    }
                    if(record.ParamText.indexOf("FANVSDFreqSetting")!=-1){
                        keytxt="FANVSDFreqSetting";
                    }
                    if(keytxt){
                        jtxt=tjson[keytxt]
                        jval=record.Param
                        if(jval){
                            if(keytxt=="AirSupplyTempSetting" || keytxt=="AirSupplyTemp"|| keytxt=="AirReturnTemp"){
                                unit="℃"
                            }else if(keytxt=="FANVSDFreq" || keytxt=="FANVSDFreqSetting"){
                                unit="Hz";
                            }
                        }
                        break;
                    }
                }
                let pointCode=record.ParamText;
                let changeJson=this.state.changeId;
                if(changeJson[pointCode] && changeJson[pointCode]==jval){
                    return (
                        <div>
                        <div className={s['inrow-divRight']}>{jtxt}</div>
                        <div className={s['inrow-divLeft2']}>{jval}&nbsp;&nbsp;&nbsp;{unit}</div>
                        </div>
                    )
                }else{
                    return (
                        <div>
                        <div className={s['inrow-divLeft']}>{jtxt}</div>
                        <div className={s['inrow-divRight']}>{jval}&nbsp;&nbsp;&nbsp;{unit}</div>
                        </div>
                    )    
                }
            }else if(column=="人工设定"){
                let jval=record.Param;
                let nameTxt=record.NameTxt;
                let jvalText=record.ParamText;
                let jPoint = record.ParamPoint;
                let tjson={"AirSupplyTempSetting":"供水温度设定值","AirSupplyTemp":"供水温度","AirReturnTemp":"回水温度","FANVSDFreq":"运行频率","FANVSDFreqSetting":"频率设定值"}
                let defValue=""
                if(jvalText.indexOf("AirSupplyTempSetting")!=-1 || jvalText.indexOf("FANVSDFreqSetting")!=-1){
                    return (
                        <div className={s['inrow-div']}><Input className={s['inrow-input']} style={{ width:80,display:'inline-block'}} id={jPoint} onChange={this.inputOnChange} defaultValue={defValue}/><Button className={s['inrow-btn']} style={{ width:60,display:'inline-block'}} onClick={(e)=>{this.submitData(jPoint,nameTxt)}} >设定</Button></div>
                    )
                }else{
                    return ""
                }
            }else if(column=="故障状态"){
               
                let nameTxt=record.NameTxt;
                if (record.Name) {
                    return (
                        <div className={s['inrow-div']}>故障数量：<Button className={s['inrow-btn']} type="danger" style={{ width:60,display:'inline-block'}} onClick={(e)=>{this.showFddModal(nameTxt)}} >{record.Err}</Button></div>
                    )
                }else {
                    return ""
                }     
               
            }

        }else {
            if(column=="开关设备"){
                let defaultChecked=false
                let index="0"+record.Number;
                let prvName=this.initName(record.NameTxt)

                let jvalText=(prvName=="CH" ? "ChEnabled"+index : prvName+"Enabled"+index)
                if(record.Enabled=="0"){
                    defaultChecked=true
                }
                let nameTxt=record.NameTxt
                if(record.Name){
                    return (
                        <div className={s['inrow-div2']}>
                            <Switch defaultChecked={defaultChecked} onClick={(checked)=>{this.onSwitchChange(checked,jvalText,nameTxt)}} />
                        </div>
                    )
                }else{
                    return ""
                }
            }else if(column=="重要参数"){
                let tjson={"LeaveEvapTemp":"冷冻水出水温度","ChWTempSupplySetPoint":"冷冻水出水温度设定值","AMPS":"冷机负载率","VSDFreq":"运行频率","VSDFreqSetting":"频率设定值"}
                let jtxt="";
                let jval="";
                let unit="";
                for(let key in tjson){
                    let keytxt="";
                    if(record.ParamText.indexOf(key)!=-1){
                        keytxt=key;
                    }
                    if(record.ParamText.indexOf("VSDFreqSetting")!=-1){
                        keytxt="VSDFreqSetting";
                    }
                    if(keytxt){
                        jtxt=tjson[keytxt]
                        jval=record.Param
                        if(jval){
                            if(keytxt=="LeaveEvapTemp" || keytxt=="ChWTempSupplySetPoint"){
                                unit="℃"
                            }else if(keytxt=="AMPS"){
                                unit="%";
                            }else if(keytxt=="VSDFreq" || keytxt=="VSDFreqSetting"){
                                unit="Hz";
                            }
                        }
                        break;
                    }
                }
                let pointCode=record.ParamText;
                let changeJson=this.state.changeId;
                if(changeJson[pointCode] && changeJson[pointCode]==jval){
                    return (
                        <div>
                            <div className={s['inrow-divRight']}>{jtxt}</div>
                            <div className={s['inrow-divLeft2']}>{jval}&nbsp;&nbsp;&nbsp;{unit}</div>
                        </div>
                    )
                }else{
                    return (
                        <div>
                            <div className={s['inrow-divLeft']}>{jtxt}</div>
                            <div className={s['inrow-divRight']}>{jval}&nbsp;&nbsp;&nbsp;{unit}</div>
                        </div>
                    )    
                }
            }else if(column=="人工设定"){
                let jval=record.Param;
                let nameTxt=record.NameTxt;
                let jvalText=record.ParamText;
                let tjson={"LeaveEvapTemp":"冷冻水出水温度","ChWTempSupplySetPoint":"冷冻水出水温度设定值","AMPS":"冷机负载率","VSDFreq":"运行频率","VSDFreqSetting":"频率设定值"}
                let defValue=""
                if(jvalText.indexOf("ChWTempSupplySetPoint")!=-1 || jvalText.indexOf("VSDFreqSetting")!=-1){
                    return (
                        <div className={s['inrow-div']}><Input className={s['inrow-input']} style={{ width:80,display:'inline-block'}} id={jvalText} onChange={this.inputOnChange} defaultValue={defValue}/><Button className={s['inrow-btn']} style={{ width:60,display:'inline-block'}} onClick={(e)=>{this.submitData(jvalText,nameTxt)}} >设定</Button></div>
                    )
                }else{
                    return ""
                }
            }else if(column=="故障状态"){
                let nameTxt=record.NameTxt;
                let jvalText=record.ParamText;
                let defValue=""
                if (record.Name) {
                    return (
                        <div className={s['inrow-div']}>故障数量：<Button className={s['inrow-btn']} type="danger" style={{ width:60,display:'inline-block'}} onClick={(e)=>{this.showFddModal(nameTxt)}} >{record.Err}</Button></div>
                    )
                }else {
                    return ""
                }                  
            }
        }
        this.setState({
           loading:false
        })
        
    }

    /**
     * 保存启用禁用日志
     * @param {} description 
     */
    actionEnabledLog(description){
        http.post('/operationRecord/add', {
            "userName": user_info.name,
            "content": description,
            "address":''
        }).then(
            data=>{
               
            }
        )

    }

    /**
     * 保存参数值设定日志
     * @param {} idCom 
     * @param {*} text 
     * @param {*} value 
     * @param {*} setValue 
     */
    actionSetLog(idCom,text,value,setValue){
        http.post('/operationRecord/add', {
            "userName": user_info.name,
            "pointName":idCom,
            "pointDescription": text,
            "valueChangeFrom": value.toString(),
            "valueChangeTo": setValue.toString(),
            "address":localStorage.getItem('serverUrl'),
            "lang":"zh-cn"
        }).then(
            data=>{
               
            }
        )

    }


render() {
    const {style} = this.state
    const { form } = this.props;
    const { getFieldDecorator } = this.props.form;
        return (
            <div  
                className={s['table-container']} 
                style={Object.assign(style)} 
            >     
                    <Table
                        columns={this.state.columns}
                        dataSource={this.state.dataSource}
                        pagination={false}
                        bordered={true}
                        loading={this.state.loading}
                        scroll={{
                            y:this.state.style.height - this.state.headerHeight
                        }}
                    />
                    <FDDModal   
                        selectName={this.state.selectName}
                        fddData={this.state.fddData}
                        isShowModal={this.state.isShowModal}
                        hideModal={this.hideModal}
                    />
            </div>
        )
    }
}


const ReportViewModal = Form.create()(EquipListControlView)

// export default ReportViewModal;


class FDDModal extends React.Component{
    constructor(props){
        super(props)
        this.state={
            selectedEquip : this.props.selectName ? this.props.selectName : '',
            groupNameArr:[],
            dataSource:[],
            selectedState: 'allState'
       
        }        

        this.chart = null;
        this.container = null;

        //this.onOk = this.onOk.bind(this)
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.hidePointModal = this.hidePointModal.bind(this)
        this.getEquipList = this.getEquipList.bind(this)
        this.handleSelectEquip = this.handleSelectEquip.bind(this)
        this.refresh = this.refresh.bind(this)
        this.handleSelectState = this.handleSelectState.bind(this)
    }

    componentDidMount(){
        let fddResult = []
        if (this.props.fddData && this.props.fddData.length != 0) {
            this.props.fddData.forEach((item,i)=>{
                if (item.groupName === this.props.selectName) {
                    fddResult = item.fddResult
                }
            })
        }
        this.setState({
            dataSource:fddResult
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isShowModal != nextProps.isShowModal) {
            let fddResult = []
            nextProps.fddData.forEach((item,i)=>{
                if (item.groupName === nextProps.selectName) {
                    fddResult = item.fddResult
                }
            })
            this.setState({
                dataSource:fddResult,
                selectedEquip:nextProps.selectName
            })
        } 
    }

    //chart图
    saveChartRef(refEchart) {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }
    saveContainerRef(container) {
        this.container = container;
    }

    getChartOption(history) {
        let data = []
        data = history
        let time = []
       
        for (var i=1;i<97;i++){
            time.push(moment().startOf('day').add(15*i, 'm').format("HH:mm"))
        }
     

        return {
        title: {
            text: ''
        },
        tooltip : {
            trigger: 'axis'
        },
        grid: {
            
            containLabel: true,
            bottom: '0%',
            top: '0%',
            left: '0%',
            right: '0%'
        },
        xAxis : [
            {
            type : 'category',
            data : time
            }
        ],
        yAxis : [
            {
            type : 'value',
            show:false,
            name:"故障"
            }
        ],
        series: [{
            data: data,
            type: 'bar'
        }]
        };
    }

    hidePointModal() {
        this.props.hideModal()
    }

    getContent() {
        var _this = this
        const dataSource = this.state.dataSource
        if (dataSource.length != 0) {
            return dataSource.map((row,j)=>{
                return(
                    <div className={s['content-wrap']}>
                        <div className={s['content-left']}>
                            <p><Tag color="#006600">设备名称</Tag><span>{row.ofEquipment}</span></p>
                            <p><Tag color="#006600">故障内容</Tag><span>{row.fddInfo.content}</span></p>
                            <p><Tag color="#006600">故障描述</Tag><span>{row.fddInfo.analysis}</span></p>
                            <p><Tag color="#006600">故障建议</Tag><span>{row.fddInfo.suggestion}</span></p>
                        </div>
                        <div className={s['content-right']}>
                                <ReactEcharts
                                style={{
                                    height: '100%'
                                }}
                                ref={_this.saveChartRef}
                                option={_this.getChartOption(row.fddInfo.history)}
                                theme="dark"
                                notMerge={true}
                            />
                        </div>
                    </div>
                )
            })
        }
      
    }

    getEquipList() {
        let arr = []
        if (this.props.fddData && this.props.fddData.length != 0) {
            return this.props.fddData.map((item,i)=>{
                arr.push(item.groupName)
                return(
                    <Option value={item.groupName}>{item.groupName}</Option>
                )
            })
            this.setState({
                groupNameArr:arr
            })
        }
    }

    handleSelectEquip(value) {
        this.setState({
            selectedEquip:value
        })
    }

    handleSelectState(value) {
        this.setState({
            selectedState:value
        })
    }

    refresh() {
        let result = []
        const data = this.props.fddData
        if (this.state.selectedEquip === "all") {
            if (this.state.selectedState === 'allState') {
                data.forEach((item,i)=>{
                    item.fddResult.forEach((row,j)=>{
                        result.push(row)
                    })
                })
            }else{
                data.forEach((item,i)=>{
                    item.fddResult.forEach((row,j)=>{
                        if (row.fddInfo.faultStatus === 1) {
                            result.push(row)                        
                        }
                    })
                })
            }
            this.setState({
                dataSource:result
            })
        }else {
            if (this.state.selectedState === 'allState') {
                data.forEach((item,i)=>{
                    if(item.groupName === this.state.selectedEquip) {
                        item.fddResult.forEach((row,j)=>{
                            result.push(row)
                        })
                    }
                })
            }else {
                data.forEach((item,i)=>{
                    if(item.groupName === this.state.selectedEquip) {
                        item.fddResult.forEach((row,j)=>{
                            if (row.fddInfo.faultStatus === 1) {
                                result.push(row)                              
                            }
                        })
                    }
                })
            }
           
            this.setState({
                dataSource:result
            })
        }
    }

 
    render(){
        const {
          isShowModal,fddData,selectName
        } = this.props
        return (
            <Modal
                title="诊断信息"
                visible={isShowModal}
                onCancel={this.hidePointModal}
                maskClosable={false}
                width={1200}
                footer={null}
            >
                <div className={s['tittle']}>
                    <Row>
                        <Col span={4} >
                            设备：
                            <Select value={this.state.selectedEquip} style={{ width: 80 }} onChange={this.handleSelectEquip}>
                                <Option value="all">全部</Option>
                                {this.getEquipList()}
                            </Select>
                        </Col>
                        <Col span={4} >
                            状态：
                            <Select value={this.state.selectedState} style={{ width: 80 }} onChange={this.handleSelectState}>
                                <Option value="allState">全部</Option>
                                <Option value="errState">故障</Option>
                            </Select>
                        </Col>
                        <Col span={2} >
                            <Button  type="primary" onClick={this.refresh} >刷新</Button>
                        </Col>
                        <Col span={2} >
                            <Button  >下载</Button>
                        </Col>         
                    </Row>    
                </div>
                { this.getContent() }
                
            </Modal>
        )
    }
}



class EquipListControlComponent extends Widget{

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
            <ReportViewModal {...this.props} />
        )
    }
}

export default EquipListControlComponent
