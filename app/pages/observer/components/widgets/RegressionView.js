import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import s from './RegressionView.css';
import { Row,Col,Button ,Select ,message,Spin,Upload,Icon,Table,Slider,Switch,Modal} from 'antd';
import { downloadUrl } from '../../../../common/utils';
import appConfig from '../../../../common/appConfig'
const { Option } = Select;
let flag = 0
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'regression',
    name : '能耗模型组件',
    description : "生成能耗模型组件",
}

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
          loading:false,
          tableLoading:false,
          switchList:[],    //用来表示哪些被锁定
          defaultInput:[],  //x初始值
          data:[],       //散点图总数据
          echartsData:[],  //散点图数据
          dataSource:[],     //表格数组对象数据
          tableData:[],    //表格数组
          selectX:this.props.config.input[0].pointNameZh,
          selectY:this.props.config.output[0].pointNameZh
        }
        this.container = null;
        this.saveChartRef = this.saveChartRef.bind(this)
        this.saveContainerRef = this.saveContainerRef.bind(this)
        this.inputControl = this.inputControl.bind(this)
    }

    componentDidMount() {
        let defaultInput = []
        let switchList = []
        this.props.config.input.map((item,index)=>{
            if((item.visible==undefined||item.visible!=0)&&flag==0){
                flag = index
            }
            defaultInput.push(item.range[0])
            switchList.push(1)
        })
        this.setState({
            defaultInput: defaultInput,
            switchList: switchList
        })
    }

    shouldComponentUpdate(nextProps,nextState){
        if(nextState.echartsData!=this.state.echartsData||nextState.loading!=this.state.loading||nextState.tableLoading!=this.state.tableLoading){
            return true
        }else{
            return false
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

    getChartOption(){
        let selectX = this.state.selectX
        let selectY = this.state.selectY
        return{
            backgroundColor:'rgba(0,0,0,0)',
            color: [
                "#0094E6",
                "#00D6B9",
                "#FFBA6B",
                "#FF1493",
                "#9400D3",
                "#483D8B",
                "#FFFF00",
                "#98FB98",
                "#2F4F4F",
            ],
            xAxis: [{
                //nameLocation:'center'
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                nameTextStyle:{
                    fontSize:14
                },
                axisLabel:{color:"white"},
                axisLine:{
                    show:true,
                    lineStyle:{
                        color:'white',
                        width:1
                    }
                }
            }],
            yAxis: [{
                name:'',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                nameTextStyle:{
                    fontSize:14
                },
                axisLabel:{color:"white"},
                axisLine:{
                    show:true,
                    lineStyle:{
                        color:'white',
                        width:1
                    }
                },
            }],
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            legend: {
                top: 10,
                data: [selectY],
                textStyle:{
                    fontSize:13,
                    color:'white'
                },
                itemWidth:13,
            },
            //区域放大功能，放大和撤销按钮
            // toolbox: {
            //     right: '3%',
            //     feature: {
            //         dataZoom: {}
            //     }
            // },
            tooltip: {
                formatter: function (obj) {
                    var value = obj.value;
                    return '<div>'
                        + '</div>'
                        +selectX+" : " + value[0] + '<br>'
                        +selectY+" : " + value[1] + '<br>';
                }
            },
            series: [{
                name:selectY,
                symbolSize: 15,
                data: this.state.echartsData,
                type: 'scatter'
            }]
        }
    }

    onChange = (value,index) => {
        let defaultInput = this.state.defaultInput
        defaultInput[index] = value
        this.setState({
            defaultInput: defaultInput
        })
        document.getElementById(index).innerText = value
    }

    onOffChange = (checked,index) => {
        let switchList = this.state.switchList
        if(checked==true){
            switchList[index] = 0
        }else{
            switchList[index] = 1
        }
        this.setState({
            switchList: switchList
        })
    }

    inputControl(){
        const inputList = this.props.config.input
        return inputList.map((item,index)=>{
            let marks = {}
            marks[item.range[0]] = {style:{marginTop:-10},label:item.range[0]}
            marks[item.range[1]] = {style:{marginTop:-10},label:item.range[1]}
            if(item.visible==undefined||item.visible!=0){
                return <div>
                    <div style={{fontSize:16}}>{item.pointNameZh}</div>
                    <div>
                        <Slider style={{width:'85%'}} marks={marks} step={item.step} min={item.range[0]} max={item.range[1]} onChange={(value)=>this.onChange(value,index)}/>
                        <Switch style={{position:'relative',left:'94%',marginTop:-90}} onChange={(checked)=>this.onOffChange(checked,index)} />
                        <span style={{position:'relative',left:'28%',top:-62}}>当前值:<span id={index} >{item.range[0]}</span></span>
                    </div>
                </div>
            }
        })
    }
    
    handleChangeX = (value) => {
        this.setState({
            loading: true,
            selectX: value
        })
        setTimeout(()=>{
            this.search()   
        },500)
        
    }

    search = () => {
        let input = this.props.config.input
        let selectX = this.state.selectX
        let data = this.state.data
        input.map((item,index)=>{
            if(item.pointNameZh == selectX){
                this.setState({
                    loading: false,
                    echartsData: data[index]
                })
            }
        })
    }

    //二维数组排列组合函数
    ArrayReorganization = array => {
        let resultArr = []
        array.forEach((arrItem) => {
          if (resultArr.length === 0) {
            let firstItem = [];
            arrItem.forEach(item => {
              firstItem.push([item]);
            })
            resultArr = firstItem
          } else {
            const emptyArray = [];
            resultArr.forEach((item) => {
              arrItem.forEach((value) => {
                emptyArray.push([...item, value])
              })
            })
            resultArr = emptyArray
          }
        })
        return resultArr
      }

    //巡优
    searchGood = () => {
        let rangeArr = []  //用来整理每个点位的所有可能值
        let xdataArr = []  //传给接口的所有二维排列组合
        let defaultInput = this.state.defaultInput
        let switchList = this.state.switchList
        let inputList = this.props.config.input
        let Data = []  //散点图总三维数组数据
        let modelName = this.props.config.modelName
        inputList.map((item)=>{
            let rangeList = []
            for(let i=item.range[0];i<=item.range[1];i = (i*10+item.step*10)/10){
                rangeList.push(i)
            } 
            rangeArr.push(rangeList)
        })
        for(let i=0;i<switchList.length;i++){
            if(switchList[i]==1){
                rangeArr[i] = [defaultInput[i]]
            }
        }
        let number = 1
        rangeArr.map((item)=>{
            number = number*(item.length)
        })
        if(number<=3000){
            Modal.confirm({
                title : '信息提示',
                content : `系统检测到 ${number} 种优化组合，组合过多可能要等待加载一会，确定要寻优吗？`,
                onOk:()=>{
                    this.setState({
                        loading:true
                    })
                    xdataArr = this.ArrayReorganization(rangeArr);
                    http.post("/learnModel/predict",{
                        model_name: modelName,
                        x_data_list: xdataArr
                    }).then(
                        res => {
                            if(res.err == 0){
                                for(let i=0;i<rangeArr.length;i++){
                                    let arr = xdataArr.map((item,index)=>{
                                        return [item[i],res.data[index]]
                                    })
                                    Data.push(arr)
                                }
                                this.setState({
                                    data:Data,
                                })
                                this.search()
                            }else{
                                message.error(res.msg)
                                this.setState({
                                    loading:false
                                })
                            }
                        }
                    ).catch(
                        err => {
            
                        }
                    )
                }
            })
        }else{
            Modal.info({
                titile:"信息提示",
                content:`系统检测到的模型组合为 ${number} 种，组合超过3000种请求会缓慢且可能会导致系统崩溃，请锁定一些数据,重新寻优。`
              })
        }
        
    }

    forecast = () => {
        this.setState({
            loading:true
        })
        let modelName = this.props.config.modelName
        http.post("/learnModel/predict",{
            model_name: modelName,
            x_data_list: [this.state.defaultInput]
        }).then(
            res => {
                if(res.err == 0){
                    let arr = this.state.defaultInput.map((item)=>{
                        return [[item,res.data[0]]]
                    })
                    this.setState({
                        data:arr,
                    })
                    this.search()
                }else{
                    message.error(res.msg)
                    this.setState({
                        loading:false
                    })
                }
            }
        ).catch(
            err => {
                message.error('接口请求失败')
            }
        )
    }

    downloadData= () => {
        http.post("/tool/ConvertTableToExcel",{
            data:this.state.tableData
        }).then(
            res => {
                if(res.err == 0){
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/temp/${res.data}`)
                }else{
                    message.error('生成下载文件失败')
                }
            }
        ).catch(
            err => {
                message.error('接口请求失败')
            }
        )
    }

    excelSearch = (dataList) => {
        let modelName = this.props.config.modelName
        let dataSource = []
        let tableData = []
        dataList = dataList.map(item=>{
            return item.map(item2=>{
                return Number(item2)
            })
        })
        http.post("/learnModel/predict",{
            model_name: modelName,
            x_data_list: dataList
        }).then(
            res => {
                if(res.err == 0){
                    tableData = dataList.map((item,index)=>{
                        if(res.data[index][0]&&res.data[index][0]!==undefined){
                            item.push(res.data[index][0].toFixed(2))
                        }else{
                            item.push(res.data[index].toFixed(2))
                        }
                        let str = {}
                        str['key'] = index
                        item.map((item2,index2)=>{
                            str[index2] = item2
                        })
                        dataSource.push(str)
                        return item
                    })
                    this.setState({
                        tableLoading:false,
                        tableData: tableData,
                        dataSource: dataSource
                    })
                }else{
                    message.error(res.msg)
                    this.setState({
                        tableLoading:false
                    }) 
                }
            }
        ).catch(
            err => {
                this.setState({
                    tableLoading:false
                }) 
                message.error('接口请求失败')
            }
        )
    }


    render() {
        let input = this.props.config.input
        let output = this.props.config.output
        let op1 = ()=>{
            return input.map((item,index)=>{
                if(item.visible==undefined||item.visible!=0){
                    return <Option value={item.pointNameZh}>{item.pointNameZh}</Option>
                }
            })
        }
        let op2 = ()=>{
            return output.map((item)=>{
                return <Option value={item.pointNameZh}>{item.pointNameZh}</Option>
            })
        }
        let _this = this
        const prop = {
            name: 'file',
            action: `${appConfig.serverUrl}/tool/ConvertExcelToTable`,
            headers: {
              authorization: 'authorization-text',
            },
            onChange(info) {
                _this.setState({
                    tableLoading:true
                });
                if (info.file.status === 'done') {
                  if (info.file.response.err >0) {
                    _this.setState({
                        tableLoading:false
                    });
                    Modal.error({
                      title: '错误提示',
                      content: `${info.file.response.msg}`
                    })
                  }else {
                    _this.excelSearch(info.file.response.data)
                  }
                } else if (info.file.status === 'error') {
                  Modal.error({
                    title: '错误提示',
                    content: `${info.file.name} 更新失败.`
                  })
                  _this.setState({
                    tableLoading:false
                  });
                }
            },
          };
        return (
            <div style={{padding:"10px 0 10px 0"}}>
                    <Row>
                        <Col span={6}>
                            <h2 style={{textAlign:'center',marginBottom:30}}>参数设置</h2>
                            <div style={{padding:"10px 35px 15px 20px",border:'1px solid white',maxHeight:800,overflowY:'scroll',overflowX:'hidden'}}>
                                <h2 style={{textAlign:'center'}}>输入X轴参数</h2>
                                {this.inputControl()}
                            </div>
                            <div style={{textAlign:'right',marginRight:10,marginTop:15}}>
                                <Button style={{marginRight:10}} onClick={this.forecast}>预测</Button>
                                <Button onClick={this.searchGood}>寻优</Button> 
                            </div>
                        </Col>
                        <Col span={12} style={{borderLeft: '2px solid RGB(39,49,66)',borderRight: '2px solid RGB(39,49,66)'}}>
                            <h2 style={{textAlign:'center',marginBottom:30}}>能耗模型图</h2>
                            <div style={{padding:"10px 10px 10px 5px"}}>
                                <div style={{textAlign:'center'}}>
                                    X轴参数选择：
                                    <Select defaultValue={input[flag]?input[flag].pointNameZh:""} style={{ width: 200,marginRight:30 }} onChange={this.handleChangeX}>
                                        {op1()}
                                    </Select>
                                    Y轴参数选择：
                                    <Select defaultValue={output[0]?output[0].pointNameZh:""} style={{ width: 200 }}>
                                        {op2()}
                                    </Select>
                                </div>
                                <div className={s['chart-container']} ref={this.saveContainerRef}>
                                {   this.state.loading ? 
                                    <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '100px'}}>
                                        <Spin tip="正在读取数据"/>
                                    </div>
                                    :
                                    <EchartsView
                                        getChartOption = {this.getChartOption()}
                                        saveChartRef = {this.saveChartRef()}
                                        echartsData = {this.state.echartsData}
                                    />
                                    
                                }
                                </div>
                            </div>
                            
                        </Col>
                        <Col span={6}>
                            <h2 style={{textAlign:'center',marginBottom:40}}>数据表格</h2>
                            <div style={{textAlign:'center'}}>
                                <Upload {...prop} showUploadList={false}>
                                    <Button>
                                        <Icon type="download"/>Excel导入计算
                                    </Button>
                                </Upload>
                                <Button onClick={this.downloadData} style={{marginLeft:30}}>
                                    <Icon type="upload"/>结果导出Excel
                                </Button> 
                            </div>
                            <TableView
                                loading={this.state.tableLoading}
                                dataSource={this.state.dataSource}
                                config = {this.props.config}
                            />
                        </Col>
                    </Row>
            </div>
        )
    }
}

class EchartsView extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps,nextState){
        if(nextProps.echartsData!=this.props.echartsData){
            return true
        }else{
            return false
        }
    }

    render(){
        return(
            <ReactEcharts
                style={{
                    height: '100%'
                }}
                ref={this.props.saveChartRef}
                option={this.props.getChartOption}
                theme="white"
                notMerge={true}
            />
        )
    }
}

class TableView extends React.Component {
    constructor(props) {
        super(props);
    }

    columns=()=>{
        let columns = this.props.config.input.map((item,index)=>{
            return {
                title:item.pointNameZh,
                dataIndex:index,
                key:index,
                width:80,
                render:(text)=>{
                    return <div style={{marginLeft:8}}>{text}</div>
                }
            } 
        })
        this.props.config.output.map((item)=>{
            columns.push({
                title:item.pointNameZh,
                dataIndex:this.props.config.input.length,
                key:this.props.config.input.length,
                width:100,
                fixed: 'right',
                render:(text)=>{
                    return <div style={{marginLeft:8}}>{text}</div>
                }
            })
        })
        return columns
    }

    render(){
        return(
            <Table 
                dataSource={this.props.dataSource} 
                columns={this.columns()}
                loading={this.props.loading}
                scroll={{ x: 430,y:600 }}
                pagination={{
                    pageSize:20,
                    hideOnSinglePage:true,
                    size:'small'
                }}
            />
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
class RegressionViewComponent extends Widget {
    
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

export default  RegressionViewComponent


