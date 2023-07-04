import React, { Component } from 'react'
import { Input, Button, Select, Layout, Tree,Form,Row,Col,DatePicker,Spin,Modal,message, Checkbox } from 'antd';
import Widget from './Widget.js';
import ReactEcharts from '../../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import '../../../../lib/echarts-themes/light';
import cx from 'classnames';
import  s from './ParamQueryView.css';
import http from '../../../../common/http';
import moment from 'moment';
import { downloadUrl } from '../../../../common/utils';

const { Content, Sider } = Layout;
const TreeNode = Tree.TreeNode;
const TimeFormat = 'YYYY-MM-DD HH:mm'
const Option = Select.Option;
const Search = Input.Search

let paramQueryContainer,treeCtn,btn,dateBtn,viewBtn,str,themeStyle,toggleSelectClass,toggleInputClass,showDateStyle;

if(localStorage.getItem('serverOmd')=="best"){
    paramQueryContainer={
        background:"#F0F0F0",
        color:"#000"
    };
    treeCtn={
        borderRight: "1px solid #B5B5B5",
        backgroundColor: "#F0F0F0",
        color:"#000"
    };
    btn={
        background:"#E1E1E1",
        color:"#000"
    };
    dateBtn = {
        background: "#E1E1E1",
        color: "#000"
    };
    viewBtn = {
      background: "#E1E1E1",
      color: "#000"
    };
    str = 'text-style-best';
}

if(localStorage.getItem('serverOmd')=="persagy"){
    paramQueryContainer={
        background:"#ffffff",
        color:"#000"
    };
    treeCtn={
        borderRight: "1px solid #B5B5B5",
        backgroundColor: "rgba(247,249,250,1)",
        color:"#000",
        fontSize:"14px",
        fontFamily:"MicrosoftYaHei",
        lineHeight:"19px"
    };
    dateBtn={
        background:"rgba(255,255,255,1)",
        color:"#0091FF",
        border:'none',
        fontSize:'14px',
        fontFamily:'MicrosoftYaHei',
        marginTop: '3px'
    };
    btn = {
        background: "rgba(255,255,255,1)",
        color:'rgba(31,35,41,1)',
        borderRadius: '4px',
        border: '1px solid rgba(195, 198, 203, 1)',
        fontSize: '14px',
        fontFamily: 'MicrosoftYaHei',
        marginTop: '3px'
    };
    viewBtn = {
        background: "rgba(255,255,255,1)",
        color: '#8D9399',
        border: 'none',
        fontSize: '14px',
        fontFamily: 'MicrosoftYaHei',
        marginTop: '3px'
    };
    str = 'persagy-ant-tree-text';    
    themeStyle = 'light';
    toggleSelectClass = 'persagy-select-selection persagy-select-selection__rendered';
    toggleInputClass = 'persagy-paramQuery-input';
    showDateStyle = {
        margin:'13px auto 10px',
        width:289,
        height:27,
        fontSize:20,
        fontFamily:'MicrosoftYaHei',
        color:'#1F2329'
    }
}  else {
    themeStyle = 'dark';
    toggleSelectClass = '';
    toggleInputClass = '';
    showDateStyle = {
        margin:'13px auto 10px',
        width:400,
        height:27,
        fontSize:20,
        fontFamily:'MicrosoftYaHei',
        color:'#fff'
    }    
}

const registerInformation = {
    type : 'ParamQuery',
    name : '参数查询组件',
    description : "生成组件，覆盖canvas对应区域",
}


class ParamQueryTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys : [],
      selectedKeys : [],
      autoExpandParent: true,
      loading:false,
      checkedDataKeys: localStorage.getItem('paramQueryData') && JSON.parse(localStorage.getItem('paramQueryData')).checkedDataKeys ? JSON.parse(localStorage.getItem('paramQueryData')).checkedDataKeys : [],
      checkedKeys: localStorage.getItem('paramQueryData') && JSON.parse(localStorage.getItem('paramQueryData')).checkedKeysArr ? JSON.parse(localStorage.getItem('paramQueryData')).checkedKeysArr : []
    }

    this.getTree = this.getTree.bind(this);
    this.getTreeNodes = this.getTreeNodes.bind(this);
    this.getTreeNode = this.getTreeNode.bind(this);  
    this.handleSelect = this.handleSelect.bind(this);
    this.onLoadData = this.onLoadData.bind(this);
    this.onExpand = this.onExpand.bind(this);
  }
  
  //树节点每一项
  getTreeNode(item) {
    if (item.children) {
      return <TreeNode title={item.name} key={item.id} >{this.getTreeNodes(item.children)}</TreeNode>;
    }
    return <TreeNode title={item.name} key={ item.id} isLeaf= {true} />;
  }
  //获取树节点
  getTreeNodes(nodeData) {
    return nodeData.map(
      (row) => ( this.getTreeNode(row) )
    );
  }

  //获取选中的keys  
  onCheck = (checkedKeys,e) => {
    let newCheckedKeys = [] //将父节点去除,用于请求接口数据的数组    
    e.checkedNodes.forEach((item,j)=>{
        if (item.props.isLeaf) {
            newCheckedKeys.push(checkedKeys[j])
        }
    })
    this.setState({ 
        checkedKeys, 
        checkedDataKeys:newCheckedKeys
        });
    this.props.savePoint(checkedKeys,newCheckedKeys)
  }

  //树形根组件
  getTree() {
    let nodeData = this.props.nodeData;
    const { expandedKeys ,autoExpandParent } = this.state
 
   
    if (nodeData.length == 0) {
      return null;
    }
    
    return (

        <Tree 
            checkable     
            onSelect={this.handleSelect}
            onCheck={this.onCheck}
            loadData={this.onLoadData}
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            draggable={false}
            key="tree"
            autoExpandParent={autoExpandParent}
            selectedKeys={this.state.selectedKeys}
            checkedKeys = {this.state.checkedKeys}
        >
            {this.getTreeNodes(nodeData)}
        </Tree>
    );
  }

  handleSelect(selectedIds, e) {
      
    this.setState({
        selectedKeys:selectedIds
    })
  }


  //展开指定节点
  onExpand(expandedKeys){
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onLoadData(treeNode) {
    console.info(treeNode)
    return new Promise((resolve)=>{
        resolve();
        return;
    })
  }


  render() {
     
    return (
      <div className={str}>   
        {
           
            this.getTree()
        }
      </div>
    );
  }
}

class ParamQuery extends React.Component {
    constructor(props){
        super(props)
        
        this.state = {
            style : {},
            pointName : [], //所有点名数组
            nodeData: [] ,   //含有点name的整体数据结构      
            startTime:null,
            endTime:null,
            endOpen: false,
            loading: false,
            chartData:{
                time:[],
                map:[]
            },
            checkedKeysArr:[],
            checkedDataKeys:[],
            timeFormat:'m5',
            showDateStart:'',
            showDateEnd:'',
            cumulativePoint:[],  //累计点名的数组
            JudgeBar:false,                   //判断是线性还是柱状
            filters:[]
        }

        this.dateOffset = 0;

        this.chart = null;
        this.container = null;

        this.disposalData = this.disposalData.bind(this);
        this.getPointInfo = this.getPointInfo.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this)
        this.disabledStartDate = this.disabledStartDate.bind(this);
        this.disabledEndDate = this.disabledEndDate.bind(this);
        this.handleStartOpenChange = this.handleStartOpenChange.bind(this);
        this.handleEndOpenChange = this.handleEndOpenChange.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handleSelectFormat = this.handleSelectFormat.bind(this);
        this.exportChart = this.exportChart.bind(this);
        this.getPointArr = this.getPointArr.bind(this);
        this.exportData = this.exportData.bind(this);
        this.pushPoint = this.pushPoint.bind(this);
        this.cumulative = this.cumulative.bind(this)
      
    }

    componentDidMount(){
        const config = this.props.config
        if (localStorage.getItem('paramQueryData') && JSON.parse(localStorage.getItem('paramQueryData')).startTime) {
            this.setState({
                startTime:JSON.parse(localStorage.getItem('paramQueryData')).startTime,
                endTime: JSON.parse(localStorage.getItem('paramQueryData')).endTime,
                timeFormat: JSON.parse(localStorage.getItem('paramQueryData')).timeFormat,
                checkedKeysArr: JSON.parse(localStorage.getItem('paramQueryData')).checkedKeysArr,
                checkedDataKeys:JSON.parse(localStorage.getItem('paramQueryData')).checkedDataKeys,
                showDateStart:JSON.parse(localStorage.getItem('paramQueryData')).startTime.slice(0, 10),
                showDateEnd:JSON.parse(localStorage.getItem('paramQueryData')).endTime.slice(0, 10)
            },this.handleOk)
        }else {
            let startTime =  moment().startOf('days')
            let endTime =   moment()
            this.setState({
                startTime:startTime,
                endTime:endTime,
                showDateStart:moment().startOf('days').format('YYYY-MM-DD'),
                showDateEnd:moment().format('YYYY-MM-DD')
            })
        }        
        if (!config.structure || !config.structure.length) {
            this.setState({
                nodeData:[]
            })
            return 
        }else {
            const dataList = config.structure
            let point = []
            this.getPointArr(dataList,point)
            
            
        }
       
    }
    //组件被销毁时
    componentWillUnmount() {
        const {startTime,endTime,checkedKeysArr,timeFormat,checkedDataKeys} = this.state
        window.localStorage.setItem('paramQueryData',JSON.stringify({
            startTime,
            endTime,
            checkedKeysArr,
            timeFormat,
            checkedDataKeys 
        }));
    }
    //增加点数据
    pushPoint (dataList,point) {
        var _this = this
        dataList.map(
            (row) => {
                if ((row.type) === "group") {
                    row.children.forEach(
                        (item,i)=>{
                            if (item.type === "point") {
                                point.push(item.pointname)
                            }else {
                                if (item.type === "group" && item.children && item.children.length) {
                                    item.children.forEach(
                                        (jtem,j)=>{
                                            if (jtem.type === "point") {
                                                point.push(jtem.pointname)
                                            }
                                        }
                                    )
                                    _this.pushPoint(item.children,point)                                    
                                }
                            }
                        }
                    )
                }else {
                    //处理单个树节点，直接将点值放入数组
                    if (row.pointname) {
                        point.push(row.pointname)
                    }
                }         
            }
        )
        return point
    }
    //增加累计点数据
    cumulative(dataList,point){
        var _this = this
        dataList.map(
            (row) => {
                if ((row.type) === "group") {
                    row.children.forEach(
                        (item,i)=>{
                            if (item.accum === 1) {
                                point.push(item.pointname)
                            }else {
                                if (item.type === "group" && item.children && item.children.length) {
                                    item.children.forEach(
                                        (jtem,j)=>{
                                            if (jtem.accum === 1) {
                                                point.push(jtem.pointname)
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    )
                }else {
                    //处理单个树节点，直接将点值放入数组
                    if (row.accum) {
                        point.push(row.pointname)
                    }
                }         
            }
        )
        return point
    }
    
    getPointArr (dataList,point){　　　　　
        var _this = this
       
        point = this.pushPoint(dataList,point)
        let cumulativePoint = this.cumulative(dataList,[])
        this.setState({
            pointName : point,
            cumulativePoint:cumulativePoint
        },
        this.getPointInfo(point,dataList)
        )
    } 

    //请求点名对应的点释义
    getPointInfo(pointName,dataList) {
        let pointData =[]
        http.post('/analysis/get_point_info_from_s3db',{
            pointList: pointName
        }).then(
            serverData =>{
                
                for ( var key in serverData.data) {
                    pointData = pointName.map(row =>{
                        if (serverData.data[row] && serverData.data[row].description != '') {
                            return {
                                name: row,
                                description: serverData.data[row].description
                            }
                        }else {
                            return {
                                name: row,
                                description: row
                            }
                        }
                        
                    })
                    
                } 
                this.disposalData(dataList,pointData)
                return
            //     //若没有请求到点的信息，则将释义写为空
            //     pointData = pointName.map(row =>{
            //         return {
            //         name: row,
            //         description: row
            //         }
            //     })
            
            // this.disposalData(dataList,pointData)
                
            }
        ).catch(
                () => {
                    message.warning('请求点名中文释义失败', 3)
                    //若没有请求到点的信息，则将释义写为空
                    pointData = pointName.map(row =>{
                        return {
                        name: row,
                        description: row
                        }
                    })
                
                    this.disposalData(dataList,pointData)
                }
        )   
        
    }

    //整理数据（将点释义放入数组）
    disposalData (dataList,pointData,treeNode) {
        var _this = this;
        var pointData = pointData
        dataList.map(
            (row) => {
                if ((row.type) === "group") {
                    row.children.forEach(
                        (item,i)=>{
                            if (item.type === "point") {
                                for (var j=0; j < pointData.length; j++) {
                                    if (pointData[j].name === item.pointname) {
                                        item['name'] = pointData[j].description;
                                        item['id'] = row.name+"$$"+item.pointname
                                    }  
                                }
                            }else {
                                if (item.type === 'group' && item.children && item.children.length) {
                                    item['id'] = row.name+"$$"+item.name
                                    _this.disposalData(item.children,pointData,item.name)

                                }
                            }
                        }
                    )
                }else {
                    if (row.type === "point") {
                        for (var j=0; j < pointData.length; j++) {
                            if (pointData[j].name === row.pointname) {
                                row['name'] = pointData[j].description
                                //解决多层里同名问题
                                if (treeNode != undefined) {
                                    row['id'] = treeNode+"$$"+row.pointname
                                    
                                }else{
                                    row['id'] = "$$"+row.pointname
                                }
                            }  
                        }
                    }
                }   
            }
        );
        if (treeNode == undefined) {
            this.setState({
                nodeData: dataList
            })
        }
       
        
    }

    //时间控件的方法
    disabledStartDate(startValue) {
      const endValue = this.state.endTime;
      if (!startValue || !endValue) {
        return false;
      }
      return startValue.valueOf() > endValue.valueOf();
      
    }

    disabledEndDate(endValue) {
      const startValue = this.state.startTime;
      if (!endValue || !startValue) {
        return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
    }

    handleStartOpenChange(open) {
      if (!open) {
        this.setState({ endOpen: true })
      }
    }

    handleEndOpenChange(open) {
      this.setState({ endOpen: open })
    }

    handleStartTimeChange = (value) => {
      this.setState({
        startTime : value,
        showDateStart:moment(value).format('YYYY-MM-DD')
      })
    }

    handleEndTimeChange = (value) => {
      this.setState({
        endTime:value,
        showDateEnd:moment(value).format('YYYY-MM-DD')
      })
    }

    handleSelectFormat(value) {
        this.setState({
            timeFormat:value
        },this.handleOk)
    }

    //增加时间快捷选项，时间段做加减一天的处理
    handleChangeDate(offset) {
       let s_time,end_time;
        if (offset == 0) {
            s_time =moment().startOf('day').format(TimeFormat);
            end_time= new Date();
            this.setState({
                startTime : s_time,
                endTime : end_time,
                showDateStart:moment().startOf('day').format('YYYY-MM-DD'),
                showDateEnd:moment().startOf('day').format('YYYY-MM-DD')  
            }, this.handleOk);
        }else {
            this.dateOffset = typeof offset === 'undefined' ? 0 : offset;
            s_time = moment(this.state.startTime).add(this.dateOffset, 'days').format(TimeFormat);
            end_time = moment(this.state.endTime).add(this.dateOffset, 'days').endOf('day').format(TimeFormat);
            this.setState({
                startTime : s_time,
                endTime : end_time,
                showDateStart:moment(this.state.startTime).add(this.dateOffset, 'days').format('YYYY-MM-DD'),
                showDateEnd:moment(this.state.endTime).add(this.dateOffset, 'days').endOf('day').format('YYYY-MM-DD')   
            }, this.handleOk);
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
    //柱状
    getChartOptionBar(){
        const data = this.state.chartData;
        return {
        title: {
            text: ''
        },
        tooltip : {
            trigger: 'axis'
        },
        toolbox: {
            show: true,
            feature: {
            dataView: {
                show: true ,
            }
            },
            right:'2%'
        },
        grid: {
            top: '4%',
            left: '4%',
            right: '5%',
            bottom: '5%',
            containLabel: true
        },
        xAxis : [
            {
            type : 'category',
            data : data.time
            }
        ],
        yAxis : [
            {
            type : 'value'
            }
        ],
        series: Object.keys(data.map)
            .map((key) => ({
            name: key,
            type: 'bar',
            label: {
                normal: {
                show: true,
                position: 'top'
                }
            },
            data: data.map[key]
            }))
        };
    }
    //初始线条
    getChartOptionLine(){
        const data = this.state.chartData;
        let nodeData = this.state.nodeData
        return {
        title: {
            text: ''
        },
        tooltip : {
            trigger: 'axis'
        },
        //区域放大功能，放大和撤销按钮
        // toolbox: {
        //     right: '3%',
        //     // feature: {
        //     //     dataZoom: {show: true},
        //     //     dataView: {show: true}
        //     // }
        // },
        grid: {
            top: '4%',
            left: '4%',
            right: '5%',
            bottom: '5%',
            containLabel: true
        },
        xAxis : [
            {
            type : 'category',
            data : data.time
            }
        ],
        yAxis : [
            {
            type : 'value'
            }
        ],
        series: Object.keys(data.map)
            .map((key) => {
                let keyZh
                nodeData.map( item => {
                    item.children.map( item2 => {
                        if(item2.children!=undefined){
                            item2.children.map( item3 => {
                                if(item3.pointname == key){
                                    keyZh = item3.name 
                                }
                            })
                        }else{
                            if(item2.pointname == key){
                                keyZh = item2.name 
                            }  
                        }
                    })
                })
                return {
                    name: keyZh,
                    type: 'line',
                    data: data.map[key]
                } 
            })
        };
    }
    // 判断数组包含关系
    isContained =(a, b)=>{
        if(!(a instanceof Array) || !(b instanceof Array)) return false;
        if(a.length < b.length) return false;
        var aStr = a.toString();
        for(var i = 0, len = b.length; i < len; i++){
          if(aStr.indexOf(b[i]) == -1) return false;
        }
        return true;
      }

    savePoint = (checkedKeys,checkedDataKeys) => {
        const {startTime, endTime,checkedKeysArr,timeFormat} = this.state
        
        let keys = [] //存放截取以后的点名，用来请求历史数据
        let checkedArr = checkedDataKeys === undefined ? this.state.checkedDataKeys : checkedDataKeys
        if (checkedKeys != undefined || checkedKeysArr.length !=0) {
            
            if (checkedKeys != undefined) {
                
                this.setState({
                    checkedKeysArr:checkedKeys,
                    checkedDataKeys:checkedArr
                });
                checkedArr.forEach((item,i)=>{
                    let index = item.lastIndexOf('\$');
                    item = item.substring(index+1,item.length);
                    keys.push(item) 
                })
            }else {
                checkedArr.forEach((item,i)=>{
                    let index = item.lastIndexOf('\$');
                    item = item.substring(index+1,item.length);
                    keys.push(item) 
                })
            }
            window.localStorage.setItem('paramQueryData',JSON.stringify({
                startTime,
                endTime,
                checkedKeysArr,
                timeFormat,
                checkedDataKeys: checkedArr
            }));
        }else {
          
        }
    }

    //请求历史数据
    handleOk(checkedKeys,checkedDataKeys) {      
        const {startTime, endTime,checkedKeysArr,timeFormat} = this.state
        
        let keys = [] //存放截取以后的点名，用来请求历史数据
        let checkedArr = checkedDataKeys === undefined ? this.state.checkedDataKeys : checkedDataKeys
        if (checkedKeys != undefined || checkedKeysArr.length !=0) {
            this.setState({
                loading: true
            });
            
            if (checkedKeys != undefined) {
                
                this.setState({
                    checkedKeysArr:checkedKeys,
                    checkedDataKeys:checkedArr
                });
                checkedArr.forEach((item,i)=>{
                    let index = item.lastIndexOf('\$');
                    item = item.substring(index+1,item.length);
                    keys.push(item) 
                })
            }else {
                checkedArr.forEach((item,i)=>{
                    let index = item.lastIndexOf('\$');
                    item = item.substring(index+1,item.length);
                    keys.push(item) 
                })
            }
            window.localStorage.setItem('paramQueryData',JSON.stringify({
                startTime,
                endTime,
                checkedKeysArr,
                timeFormat,
                checkedDataKeys: checkedArr
            }));
            http.post('/get_history_data_padded', {
                pointList: keys,
                filter: this.state.filters,
                timeStart: moment(startTime).format('YYYY-MM-DD HH:mm:00'),
                timeEnd: moment(endTime).format('YYYY-MM-DD HH:mm:00'),
                timeFormat: timeFormat
            }).then(
                data=>{
                    if (!this.container) {
                        return;
                    }
                    if (data.error) {
                        this.setState({
                            loading: false
                        });
                        Modal.error({
                            title: '信息提示',
                            content: data.msg,
                        });
                        return                         
                    }
                    //判断是否有乘系数的点，如果有需要直接处理数据
                    let scaleObj = {}
                    if (this.props.config.structure != undefined && this.props.config.structure.length != 0) {
                            this.props.config.structure.map(
                                (row) => {
                                    if ((row.type) === "group") {
                                        row.children.forEach(
                                            (item,i)=>{
                                                if (item.type === "point") {
                                                    //将所有有系数的点取出，则放入点名和系数的对象中，格数如：{pointName:scale}
                                                    if (item.scale != undefined) {
                                                        scaleObj[item.pointname]=item.scale
                                                    }
                                                }else {
                                                    if (item.type === "group" && item.children && item.children.length) {
                                                        item.children.forEach(
                                                            (jtem,j)=>{
                                                                if (jtem.type === "point") {
                                                                    //将所有有系数的点取出，则放入点名和系数的对象中，格数如：{pointName:scale}
                                                                    if (jtem.scale != undefined) {
                                                                        scaleObj[jtem.pointname]=jtem.scale
                                                                    }
                                                                }
                                                            }
                                                        )                                 
                                                    }
                                                }
                                            }
                                        )
                                    }else {
                                        //处理单个树节点，直接将点值放入数组
                                        //将所有有系数的点取出，则放入点名和系数的对象中，格数如：{pointName:scale}
                                        if (row.scale != undefined && row.pointname) {
                                            scaleObj[row.pointname]=row.scale
                                        }
                                    }         
                                }
                            )
                    }

                    //将返回的data.map按左侧列表顺序排序,并将系数算进去
                    let obj = {}
                    keys.forEach((item,j)=>{
                        if (scaleObj[item]) {
                            let dataArr = []
                            data.map[item].forEach((num,i)=>{
                                dataArr.push((num * eval(scaleObj[item])).toFixed(3)) 
                                obj[item] = dataArr
                            })
                        }else{
                            obj[item] = data.map[item]
                        }
                    })
                    let list = []   //累计数据的数组
                    let cumulativePointArr = this.state.cumulativePoint   // 累计点名的数组
                    // 判断是否是柱状还是线性
                    if(this.isContained(cumulativePointArr,keys)){
                        this.setState({
                            JudgeBar:true
                        })
                        for(let i = 0; i < cumulativePointArr.length; i++) {
                            for (let j = 0; j < keys.length; j++) {
                                if(keys[j] === cumulativePointArr[i]){
                                    list.push(keys[j]);
                                }
                            }
                        }
                        list.forEach((item,j)=>{
                            let NewArr = [] 
                            for (let i=0;i<obj[item].length;i++){
                                if(obj[item][i-1]==undefined){
                                    NewArr.push(0)
                                }else{
                                    //逐时参数或者逐天参数变量
                                    let TimeSlotData = parseInt(obj[item][i]-obj[item][i-1])
                                    NewArr.push(TimeSlotData)
                                }
                            }
                            obj[item] = NewArr
                        })
                        data.map = obj
                    }else{
                        this.setState({
                            JudgeBar:false
                        })
                        data.map = obj
                    } 
                    this.setState({
                        loading: false,
                        chartData: data
                    });
                }
            ).catch(
                () => {
                    if (!this.container) {
                        return;
                    }
                    this.setState({
                        loading: false,
                        chartData: []
                    });
                }
            )    
        }else {
            // Modal.warning({
            //     title: '信息提示',
            //     content: '请选择左侧列表点名！',
            // });
        }
    }

    exportChart() {
        downloadUrl(this.chart.getDataURL());
    }

    //生成excel并下载
    exportData() {
        //接口请求返回的数据对象
        const data = this.state.chartData;
        //判断，如果data里的time是空，则判断为没有历史数据，则不进行下载并提示
        if (data.time.length === 0) {
            Modal.error({
            title: '信息提示',
            content: '历史数据为空，无法导出表格',
            });
            return
        }

        let pointList = []
        let reportName = '分类查询数据'
        let strStartTime = moment(this.state.startTime).format('YYYY-MM-DD HH:mm:00')
        let strEndTime = moment(this.state.endTime).format('YYYY-MM-DD HH:mm:00')
        let pointData = []
        let timeData = data.time
        let headerList = []

        Object.keys(data.map).map(item=>{
            pointList.push(item)
        })

        pointData = timeData.map( (item,row)=>{
            let line = {}
            line['key']= row
            pointList.forEach( (pitem,i)=>{
                if (data.map[pitem].length === 0) {
                    line[pitem] = ''
                }else {
                    line[pitem] = data.map[pitem][row]                
                }
            })
            return line
        })

        console.info(pointList,reportName,timeData,pointData);
        
        http.post('/reportTool/genExcelReportByTableData', {
            reportName: reportName,
            strStartTime: strStartTime,
            strEndTime: strEndTime,
            headerList: pointList,　 //表头用的点名
            tableDataList:pointData,
            timeList:timeData,
            pointList:pointList
        }).then(
            data=>{
                if (data.err === 0) {
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                }
                if (status === false) {
                    message.error('生成下载文件失败')
                }
            }
        )    
    }

    //读取后台配置，列出供筛选列表
    getSelects(){
        if(this.props.config.relation&&this.props.config.relation[0]!=undefined){
            return this.props.config.relation.map((item)=>{
                return <div style={{marginLeft:20,marginBottom:10}}>
                    <h2 style={{marginBottom:5}}>{item.name}</h2>
                    {item.group.map((item2)=>{
                        return <div style={{marginBottom:7}}> 
                            <span className={s['selectTitle']}>{item2.name}</span>
                            {item2.children.map((item3)=>{
                                return <Checkbox onChange={()=>this.onChange(item3.pointName,item3.filterType,item3.params)}>{item3.name}</Checkbox>
                            })}
                        </div>
                    })}
                </div>
            })
        } 
    }

    //选中筛选条件
    onChange(pointName,filterType,params){
        if(pointName == undefined || filterType == undefined || params ==undefined){
            return
        }
        let filters = this.state.filters
        let onlyFilter = {pointName:pointName,filterType:filterType,params:params}
        let flag = 0,i = 0
        let newFilters = []
        filters.map((item)=>{
            if(item.pointName == onlyFilter.pointName && item.filterType == onlyFilter.filterType && item.params == onlyFilter.params){
                flag = 1
            }else{
                newFilters[i++] = item
            }
        })
        if(flag == 0){
            newFilters.push(onlyFilter)
        }
        this.setState({
            filters:newFilters
        })
    }

    render() {
        const {style,config} = this.props
        const {endTime,startTime,endOpen,nodeData} = this.state
        let selectStyle,lineStyle
        if(config.relation&&config.relation[0]!=undefined){
            selectStyle = {
                height:'80%'
            }
            lineStyle={
                borderTop: '1px solid rgba(239,240,241,1)'
            }

        }else{
            selectStyle = {
                height:'100%'
            }
            lineStyle={
            }
        }
        return (
              <Layout className={s['container']} style={style} >
                <Sider className={ s['tree-ctn'] } style={treeCtn} >
                    <ParamQueryTree
                        {...this.state}
                        savePoint={this.savePoint}
                    />
                </Sider>
                <Content className={ s['main-ctn'] } style={paramQueryContainer}>
                    {
                        config.relation&&config.relation[0]!=undefined?
                        <div style={{height:'20%'}}>
                            <div style={{marginTop:10}}>{this.getSelects()}</div>
                        </div>
                        :
                        ''
                    }
                    <div style={selectStyle}> 
                    <div className={s['date-btns-wrap']} style={lineStyle} ref={this.saveContainerRef}>
                        <Row>
                            <Col span={1} >
                                <Select value={this.state.timeFormat} style={{ width: 80 }} onChange={this.handleSelectFormat} style={s[`$[ant-select-dropdown-menu-item-selected]`]} className={toggleSelectClass}>
                                    <Option value="m1">1分钟</Option>
                                    <Option value="m5">5分钟</Option>
                                    <Option value="h1">1小时</Option>
                                    <Option value="d1">1天</Option>
                                </Select>
                            </Col>
                            <Col span={6} className={toggleInputClass}>                         
                                <DatePicker 
                                    showTime 
                                    placeholder="开始时间"
                                    allowClear={false}
                                    format={TimeFormat}
                                    value={moment(startTime,TimeFormat)}
                                    disabledDate={this.disabledStartDate}
                                    onChange={this.handleStartTimeChange}
                                    onOpenChange={this.handleStartOpenChange}
                                />
                                <DatePicker
                                    showTime 
                                    placeholder="结束时间"
                                    allowClear={false}
                                    format={TimeFormat}
                                    value={moment(endTime,TimeFormat)}
                                    disabledDate={this.disabledEndDate}
                                    open={endOpen}
                                    onChange={this.handleEndTimeChange}
                                    onOpenChange={this.handleEndOpenChange}
                                />
                            </Col>
                            <Col span={2} >
                                <Button icon="search" type="primary" onClick={()=>{this.handleOk()}} style={btn}   >查询</Button>
                            </Col>
                            <Col span={1} >
                                <Button onClick={()=>{this.handleChangeDate(-1)}} style={dateBtn}>前一日</Button>
                            </Col>
                            <Col span={1} >
                                <Button onClick={()=>{this.handleChangeDate(0)}} style={dateBtn}>今天</Button>
                            </Col>
                            <Col span={1} >
                                <Button onClick={()=>{this.handleChangeDate(1)}} style={dateBtn}>后一日</Button>
                            </Col>
                            <Col span={10} >
                                <Button icon="export" 
                                    style={{
                                        float : 'right',
                                        marginRight : 1
                                    }}
                                    onClick={()=>{this.exportChart()}}

                                    // style={btn}
                                >截图</Button>
                            </Col>
                            <Col span={1} >
                                <Button icon="download" 
                                    style={{
                                        float : 'right',
                                        marginRight : 1
                                    }}
                                    onClick={()=>{this.exportData()}}

                                    // style={btn}
                                >下载</Button>
                            </Col>
                        </Row>                  
                    </div>  
                    <div style={showDateStyle}>
                        数据展示 {this.state.showDateStart}~{this.state.showDateEnd}
                    </div> 
                    <div className={s['chart-wrap']} >
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
                                ref={this.saveChartRef}
                                option={this.state.JudgeBar?this.getChartOptionBar():this.getChartOptionLine()}
                                theme={themeStyle}
                                notMerge={true}
                            />
                        }
                    </div>
                    </div>
                </Content>
           
            </Layout>
        )
    }
}

const ParamQueryView = Form.create()(ParamQuery)

class ParamQueryComponent extends Widget {

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
        const {style} = this.props.style
        return (
        
            <ParamQueryView {...this.props} />
          
          
        )
    }
}

export default ParamQueryComponent