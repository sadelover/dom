import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './BigDataChartView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import { downloadUrl } from '../../../../common/utils';

import { DatePicker , Form ,Button ,Select ,message,Spin,Icon,Modal,Input,Switch,Row,Col} from 'antd';
import moment from 'moment'

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option

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
    type : 'BigDataAnalysis',
    name : '大数据图组件',
    description : "生成BigDataAnalysis组件",
}


class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state = {
            data:[],
            chartData:[],
            xdata:[],
            ydata:[],
            loading : false,
            input:'',
            output:'',
            value1:0,
            value2:0,
            xunit:'',
            yunit:'',
            visible: false,
            inputFilterFlag:false
        }

        this.chart = null;
        this.container = null;
    
        this.getChartData = this.getChartData.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.handleChange=this.handleChange.bind(this);
        this.onChange=this.onChange.bind(this);
        this.onSearch=this.onSearch.bind(this);
        this.exportData = this.exportData.bind(this);
        this.hide = this.hide.bind(this);
        this.affectOI = this.affectOI.bind(this);
        this.showForm = this.showForm.bind(this);
    }

    static get defaultProps() {
      return {
        points: [],
        data:[],
        chartData:[]
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
            "sampleName":this.props.config.bindname
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
                    data: data.data,
                    chartData:data.data
                });
            }
        ).catch(
            () => {
                this.setState({
                    loading: false,
                    data: [],
                    chartData:[]
                });
            }
        )
    }
   
    // echart option
     getChartOption() {
        let chartData = this.state.chartData;
        let xyData=[];
        let yData=this.state.ydata;
        let xData = this.state.xdata;
        if(xData.length==0||yData.length==0||this.state.inputFilterFlag){
            xData=[]
            yData=[]
            for(let i=0;i<chartData.length;i++){
                xData.push(chartData[i]['input0'+(this.state.value1+1)]);
                yData.push(chartData[i]['output0'+(this.state.value2+1)]);
            }
        }
        for(let i=0;i<xData.length;i++){
            xyData.push([xData[i],yData[i]]);
        }
        
        let input = '';
        let output = '';
        let xunit = '';
        let yunit = '';
        let config = this.props.config;
        let flag = config.input!=undefined&&config.input.length!=0;
        let flag02 = config.output!=undefined&&config.output.length!=0;
        input = flag&&this.state.input==''?this.props.config.input[0].name:this.state.input;
        output = flag02&&this.state.output==''?this.props.config.output[0].name:this.state.output;
        xunit = flag&&this.state.xunit==''?this.props.config.input[0].unit:this.state.xunit;
        yunit = flag02&&this.state.yunit==''?this.props.config.output[0].unit:this.state.yunit;
        
        return{
            backgroundColor: '#FFFFFF',
            xAxis: [{
                name:xunit,
                //nameLocation:'center'
            }],
        yAxis: [{
            name:yunit
        }],
        series: [{
            symbolSize: 5,
            data:xyData,
            type: 'scatter'
        }]   
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
            value1:value
        });  
        let config = this.props.config;
        let flag = config.input!=undefined&&config.input.length!=0;
        let input = this.state.input;
        let xunit = this.state.xunit;
        switch(value){
            case 0:
                this.setState({
                    
                    input:flag?this.props.config.input[0].name:input,
                    xunit:flag?this.props.config.input[0].unit:xunit
                });
            break;
            case 1:
            this.setState({
                
                input:flag?this.props.config.input[1].name:input,
                xunit:flag?this.props.config.input[1].unit:xunit
            });
            break;
            case 2:
            this.setState({
                
                input:flag>1?this.props.config.input[2].name:input,
                xunit:flag?this.props.config.input[2].unit:xunit
            });
            break;
            case 3:
            this.setState({
                
                input:flag?this.props.config.input[3].name:input,
                xunit:flag?this.props.config.input[3].unit:xunit
            });
            break;
            case 4:
            this.setState({
                
                input:flag?this.props.config.input[4].name:input,
                xunit:flag?this.props.config.input[4].unit:xunit
            });
            break;
            case 5:
                this.setState({
                    
                    input:flag?this.props.config.input[5].name:input,
                    xunit:flag?this.props.config.input[5].unit:xunit
                });
            break;
            case 6:
            this.setState({
                
                input:flag?this.props.config.input[6].name:input,
                xunit:flag?this.props.config.input[6].unit:xunit
            });
            break;
            case 7:
            this.setState({
                
                input:flag?this.props.config.input[7].name:input,
                xunit:flag?this.props.config.input[7].unit:xunit
            });
            break;
            case 8:
            this.setState({
                
                input:flag?this.props.config.input[8].name:input,
                xunit:flag?this.props.config.input[8].unit:xunit
            });
            break;
            case 9:
            this.setState({
                
                input:flag?this.props.config.input[9].name:input,
                xunit:flag?this.props.config.input[9].unit:xunit
            });
            break;
            default: this.setState({
                
                input:flag?this.props.config.input[0].name:input,
                xunit:flag?this.props.config.input[0].unit:xunit
            });
        }
      }


      onChange(value) {
        this.setState({
            value2:value
        })   
        let config = this.props.config;
        let flag02 = config.output!=undefined&&config.output.length!=0;
        let output = this.state.output;
        let yunit = this.state.yunit; 
        switch(value){
            case 0:
                this.setState({
                   
                    output:flag02?this.props.config.output[0].name:output,
                    yunit:flag02?this.props.config.output[0].unit:yunit
                });
            break;
            case 1:
            this.setState({
                
                output:flag02?this.props.config.output[1].name:output,
                yunit:flag02?this.props.config.output[1].unit:yunit
            });
            break;
            case 2:
            this.setState({
                output:flag02>1?this.props.config.output[2].name:output,
                yunit:flag02?this.props.config.output[2].unit:yunit
            });
            break;
            case 3:
            this.setState({
               
                output:flag02?this.props.config.output[3].name:output,
                yunit:flag02?this.props.config.output[3].unit:yunit
            });
            break;
            case 4:
            this.setState({
        
                output:flag02?this.props.config.output[4].name:output,
                yunit:flag02?this.props.config.output[4].unit:yunit
            });
            break;
            case 5:
                this.setState({
                    
                    output:flag02?this.props.config.output[5].name:output,
                    yunit:flag02?this.props.config.output[5].unit:yunit
                });
            break;
            case 6:
           this.setState({
               
                output:flag02?this.props.config.output[6].name:output,
                yunit:flag02?this.props.config.output[6].unit:yunit
            });
            break;
            case 7:
            this.setState({
                
                output:flag02?this.props.config.output[7].name:output,
                yunit:flag02?this.props.config.output[7].unit:yunit
            });
            break;
            case 8:
            this.setState({
                
                output:flag02?this.props.config.output[8].name:output,
                yunit:flag02?this.props.config.output[8].unit:yunit
            });
            break;
            case 9:
            this.setState({
               
                output:flag02?this.props.config.output[9].name:output,
                yunit:flag02?this.props.config.output[9].unit:yunit
            });
            break;
            default: this.setState({
                
                output:flag02?this.props.config.output[0].name:output,
                yunit:flag02?this.props.config.output[0].unit:yunit
            });
        }
      }
    onSearch(){
        let data = this.state.data;
        let xData = [];
        let yData = [];
        let input = this.state.input;
        let output = this.state.output;
        let xunit = this.state.xunit;
        let yunit = this.state.yunit;
        let config = this.props.config;
        let flag = config.input!=undefined&&config.input.length!=0;
        let flag02 = config.output!=undefined&&config.output.length!=0;
        //input = flag&&this.state.input==''?this.props.config.input:this.state.input;
        switch(this.state.value1){
            case 0:
                for(let i=0;i<data.length;i++){ 
                    
                    xData.push(data[i].input01);
                };this.setState({
                    xdata:xData,
                    input:flag?this.props.config.input[0].name:input,
                    xunit:flag?this.props.config.input[0].unit:xunit
                });
            break;
            case 1:
            for(let i=0;i<data.length;i++){ 
                
                xData.push(data[i].input02);
            };this.setState({
                xdata:xData,
                input:flag?this.props.config.input[1].name:input,
                xunit:flag?this.props.config.input[1].unit:xunit
            });
            break;
            case 2:
            for(let i=0;i<data.length;i++){ 
                
                xData.push(data[i].input03);
            };this.setState({
                xdata:xData,
                input:flag>1?this.props.config.input[2].name:input,
                xunit:flag?this.props.config.input[2].unit:xunit
            });
            break;
            case 3:
            for(let i=0;i<data.length;i++){ 
               
                xData.push(data[i].input04);
            };this.setState({
                xdata:xData,
                input:flag?this.props.config.input[3].name:input,
                xunit:flag?this.props.config.input[3].unit:xunit
            });
            break;
            case 4:
            for(let i=0;i<data.length;i++){ 
               
                xData.push(data[i].input05);
            };this.setState({
                xdata:xData,
                input:flag?this.props.config.input[4].name:input,
                xunit:flag?this.props.config.input[4].unit:xunit
            });
            break;
            case 5:
                for(let i=0;i<data.length;i++){ 
                    
                    xData.push(data[i].input06);
                };this.setState({
                    xdata:xData,
                    input:flag?this.props.config.input[5]:input,
                    xunit:flag?this.props.config.input[5].unit:xunit
                });
            break;
            case 6:
            for(let i=0;i<data.length;i++){ 
                
                xData.push(data[i].input07);
            };this.setState({
                xdata:xData,
                input:flag?this.props.config.input[6]:input,
                xunit:flag?this.props.config.input[6].unit:xunit
            });
            break;
            case 7:
            for(let i=0;i<data.length;i++){ 
                
                xData.push(data[i].input08);
            };this.setState({
                xdata:xData,
                input:flag?this.props.config.input[7]:input,
                xunit:flag?this.props.config.input[7].unit:xunit
            });
            break;
            case 8:
            for(let i=0;i<data.length;i++){ 
               
                xData.push(data[i].input09);
            };this.setState({
                xdata:xData,
                input:flag?this.props.config.input[8]:input,
                xunit:flag?this.props.config.input[8].unit:xunit
            });
            break;
            case 9:
            for(let i=0;i<data.length;i++){ 
               
                xData.push(data[i].input10);
            };this.setState({
                xdata:xData,
                input:flag?this.props.config.input[9]:input,
                xunit:flag?this.props.config.input[9].unit:xunit
            });
            break;
            default: for(let i=0;i<data.length;i++){ 
                    
                xData.push(data[i].input01);
            };this.setState({
                xdata:xData,
                input:flag?this.props.config.input[0].name:input,
                xunit:flag?this.props.config.input[0].unit:xunit
            });
        }

        switch(this.state.value2){
            case 0:
                for(let i=0;i<data.length;i++){ 
                    
                    yData.push(data[i].output01);
                };this.setState({
                    ydata:yData,
                    output:flag02?this.props.config.output[0].name:output,
                    yunit:flag02?this.props.config.output[0].unit:yunit
                });
            break;
            case 1:
            for(let i=0;i<data.length;i++){ 
                
                yData.push(data[i].output02);
            };this.setState({
                ydata:yData,
                output:flag02?this.props.config.output[1].name:output,
                yunit:flag02?this.props.config.output[1].unit:yunit
            });
            break;
            case 2:
            for(let i=0;i<data.length;i++){ 
                
                yData.push(data[i].output03);
            };this.setState({
                ydata:yData,
                output:flag02>1?this.props.config.output[2].name:output,
                yunit:flag02?this.props.config.output[2].unit:yunit
            });
            break;
            case 3:
            for(let i=0;i<data.length;i++){ 
               
                yData.push(data[i].output04);
            };this.setState({
                ydata:yData,
                output:flag02?this.props.config.output[3].name:output,
                yunit:flag02?this.props.config.output[3].unit:yunit
            });
            break;
            case 4:
            for(let i=0;i<data.length;i++){ 
               
                yData.push(data[i].output05);
            };this.setState({
                ydata:yData,
                output:flag02?this.props.config.output[4].name:output,
                yunit:flag02?this.props.config.output[4].unit:yunit
            });
            break;
            case 5:
                for(let i=0;i<data.length;i++){ 
                    
                    yData.push(data[i].output06);
                };this.setState({
                    ydata:yData,
                    output:flag02?this.props.config.output[5]:output,
                    yunit:flag02?this.props.config.output[5].unit:yunit
                });
            break;
            case 6:
            for(let i=0;i<data.length;i++){ 
                
                yData.push(data[i].output07);
            };this.setState({
                ydata:yData,
                output:flag02?this.props.config.output[6]:output,
                yunit:flag02?this.props.config.output[6].unit:yunit
            });
            break;
            case 7:
            for(let i=0;i<data.length;i++){ 
                
                yData.push(data[i].output08);
            };this.setState({
                ydata:yData,
                output:flag02?this.props.config.output[7]:output,
                yunit:flag02?this.props.config.output[7].unit:yunit
            });
            break;
            case 8:
            for(let i=0;i<data.length;i++){ 
               
                yData.push(data[i].output09);
            };this.setState({
                ydata:yData,
                output:flag02?this.props.config.output[8]:output,
                yunit:flag02?this.props.config.output[8].unit:yunit
            });
            break;
            case 9:
            for(let i=0;i<data.length;i++){ 
               
                yData.push(data[i].output10);
            };this.setState({
                ydata:yData,
                output:flag02?this.props.config.output[9]:output,
                yunit:flag02?this.props.config.output[9].unit:yunit
            });
            break;
            default: for(let i=0;i<data.length;i++){ 
                    
                yData.push(data[i].output01);
            };this.setState({
                ydata:xData,
                output:flag02?this.props.config.output[0].name:output,
                yunit:flag02?this.props.config.output[0].unit:yunit
            });
        }
    }

  //下载数据
  exportData(){
    let Xunit = this.props.config.input.length;
    let Yunit = this.props.config.output.length;
    let Name = this.props.config.bindname;
    http.post('/dataSample/downloadSampleData', {
        sampleName:  Name ,
        inputCount:  Xunit ,
        outputCount:  Yunit
    }).then(
        data=>{
            if (data.err === 0) {
                downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data}`)
            }
            if (status === false) {
                message.error('生成下载文件失败')
            }
        }
    )        
  }

    //隐藏配置模态框
    hide(){
          this.setState({
            visible:false
        })
    }
    //根据配置框内容，筛选原始数据（this.state.data）
    affectOI(values,timeFilter,timeStart,timeEnd){
        let originalData = this.state.data;
        let timeFilterData = [];
        let currentData = [];
        let inputListObj = this.props.config.input

        this.setState({
            inputFilterFlag:false
        })

        if(timeFilter){
            let days = moment(timeEnd)-moment(timeStart);
            let day = [];
            // datas = this.state.datas;             
                days = days/(1000*60*60*24);
                
                //组装日期数组
                for(let i=0;i<=days;i++){
                    day.push(moment(timeStart).subtract(-i,'days').format('YYYY-MM-DD'))
                }
                //组装删选过时间的数据
                for(let i=0;i<=days;i++){
                    for(let j=0;j<originalData.length;j++){
                        if(moment(originalData[j].timeFrom).isAfter(moment(timeStart,'day'))&& moment(originalData[j].timeTo).isBefore(moment(timeEnd,'day'))){
                            timeFilterData.push(originalData[j]);
                        }
                    }
                }
            
                // this.setState({
                //     day:day,
                //     timeFilterData:timeFilterData
                // });  
        }

        if (timeFilter && timeFilterData.length >0) {
            currentData = timeFilterData
        }else {
            currentData = originalData
        }
        let conditionData = [];//条件筛选后的数组
        for(let i=0;i<currentData.length;i++){
            let inputFlag = true
            for (let j=0;j<inputListObj.length;j++) {
                //如果有最小值，先判断这条数据是否满足最小值
                if (values['formItemMin'+j] != '' && Number(values['formItemMin'+j])) {
                    //如果满足了最小值，再判断是否有最大值
                    if (parseFloat(currentData[i]['input0'+(j+1)]) < parseFloat(values['formItemMin'+j])) {
                        inputFlag = false;
                    }
                }
                //判断是否有最大值设置
                //如果有最大值设置
                if (values['formItemMax'+j] != '' && Number(values['formItemMax'+j])) {
                    //且数据满足最大值，才可以放入最终的数组conditionData
                    if (parseFloat(currentData[i]['input0'+(j+1)])>parseFloat(values['formItemMax'+j])) {
                        inputFlag = false;
                    }
                }
            }
            if (inputFlag) {
                conditionData.push(currentData[i])
            }

             
        }
        this.setState({
            timeFilter:timeFilter,
            inputFilterFlag:true,
            chartData:conditionData
        })
    
}


   //根据配置框内容，筛选原始数据（this.state.data）;支持选择时间范围
   affectOI(values,timeFilter,timeStart,timeEnd){
        let originalData = this.state.data;
        let timeFilterData = [];
        let currentData = [];
        let inputListObj = this.props.config.input

        this.setState({
            inputFilterFlag:false,
            loading: true
        })
        //如果设置了时间筛选，则需现在重新请求原始数据
        if(timeFilter && timeStart != "" && timeEnd != ""){
            http.post('/dataSample/getIO', {
                "sampleName":this.props.config.bindname,
                "timeFrom":timeStart,
                "timeTo":timeEnd
            }).then(
                (data)=> {
                     if (!this.container) {
                         throw new Error('Error: the instance of container is undefined')
                     }
                    if (data.err) {
                        Modal.error({
                            title:'数据请求错误',
                            content:data.msg
                        })
                        throw new Error(data.msg)
                    }else{
                        this.setState({    
                            data: data.data,
                            chartData:data.data
                        });
                        originalData = data.data
                    }
                }
            ).catch(
                (error) => {
                    throw new Error(error)
                }
            )
            // let days = moment(timeEnd)-moment(timeStart);
            // let day = [];
            // // datas = this.state.datas;             
            //     days = days/(1000*60*60*24);
                
            //     //组装日期数组
            //     for(let i=0;i<=days;i++){
            //         day.push(moment(timeStart).subtract(-i,'days').format('YYYY-MM-DD'))
            //     }
            //     //组装删选过时间的数据
            //     for(let i=0;i<=days;i++){
            //         for(let j=0;j<originalData.length;j++){
            //             if(moment(originalData[j].timeFrom).isAfter(moment(timeStart,'day'))&& moment(originalData[j].timeTo).isBefore(moment(timeEnd,'day'))){
            //                 timeFilterData.push(originalData[j]);
            //             }
            //         }
            //     }
            
                // this.setState({
                //     day:day,
                //     timeFilterData:timeFilterData
                // });  
        }else {
            //如果没有时间筛选，需要重新请求原始数据；确保这是最新全部的，而不是上次时间筛选过的
            http.post('/dataSample/getIO', {
                "sampleName":this.props.config.bindname
            }).then(
                (data)=> {
                     if (!this.container) {
                         throw new Error('Error: the instance of container is undefined')
                     }
                    if (data.err) {
                        Modal.error({
                            title:'数据请求错误',
                            content:data.msg
                        })
                        throw new Error(data.msg)
                    }else{
                        this.setState({    
                            data: data.data,
                            chartData:data.data
                        });
                        originalData = data.data
                    }
                }
            ).catch(
                (error) => {
                    throw new Error(error)
                }
            )
        }

        if (timeFilter && timeFilterData.length >0) {
            currentData = timeFilterData
        }else {
            currentData = originalData
        }
        let conditionData = [];//条件筛选后的数组
        for(let i=0;i<currentData.length;i++){
            let inputFlag = true
            for (let j=0;j<inputListObj.length;j++) {
                //如果有最小值，先判断这条数据是否满足最小值
                if (values['formItemMin'+j] != '' && Number(values['formItemMin'+j])) {
                    //如果满足了最小值，再判断是否有最大值
                    if (parseFloat(currentData[i]['input0'+(j+1)]) < parseFloat(values['formItemMin'+j])) {
                        inputFlag = false;
                    }
                }
                //判断是否有最大值设置
                //如果有最大值设置
                if (values['formItemMax'+j] != '' && Number(values['formItemMax'+j])) {
                    //且数据满足最大值，才可以放入最终的数组conditionData
                    if (parseFloat(currentData[i]['input0'+(j+1)])>parseFloat(values['formItemMax'+j])) {
                        inputFlag = false;
                    }
                }
            }
            if (inputFlag) {
                conditionData.push(currentData[i])
            }
        }
        this.setState({
            timeFilter:timeFilter,
            inputFilterFlag:true,
            chartData:conditionData,
            loading: false
        })

    }

     //
    showForm(){
       this.setState({
        visible:true
       })
    }

    render() {
        let config = this.props.config
        let flag =  config.input!=undefined
        let flag02 = config.output!=undefined
        let option = flag?config:[];
        let option02 = flag02?config:[];
        let n = [];
        let uoption;  
        if(flag&&option.input.length!=0){uoption = option.input.map((item,index)=>{
            return (<Option className={s['co']} value={index}>{item['name']}</Option>)
        })}else{
            uoption = function(){return (<Option>无法读取到Factory中的“影响因子”属性</Option>)};
        }
        let soption;  
        if(flag02&&option02.output.length!=0){soption = option02.output.map((item,index)=>{
            return (<Option className={s['co']} value={index}>{item['name']}</Option>)
        })}else{
            soption = function(){return (<Option>无法读取到Factory中的“影响因子”属性</Option>)};
        }
        return (
            <div >
                
                <div style={{margin:"10px"}}>
            <div className={s['in']} style={{backgroundColor:"#cccccc" ,color:'#272727',fontSize:14,width:130,height:28, lineHeight:'28px'}}>影响因子分析：</div>
            <div className={s['in']}>
            <Select id="se" defaultValue={flag&&option.input.length!=0?option.input[0].name:"无法读取到Factory中的“影响因子”属性"} style={{ width: 250 }} onChange={this.handleChange}>
            {uoption}
            </Select></div>
            <div style={{backgroundColor:"#cccccc",color:"black",width:"20px",height:28,top:'50%', lineHeight:'28px'}} className={s['in']}>与</div>
            <div className={s['in']}>
            <Select id="st" defaultValue={flag02&&option02.output.length!=0?option02.output[0].name:"无法读取到Factory中的“影响因子”属性"} style={{ width: 250 }} onChange={this.onChange}>
            {soption}
            </Select>
            </div>
            <div >
                <div className={s['in']} style={{width:20,marginLeft:"10px",paddingTop:'4'}} onClick={this.showForm}><Icon type="setting"  style={{color:"black",cursor:"pointer",fontSize:20}} /></div>

                <Button style={{marginLeft:"10px"}} onClick={this.onSearch}>分析</Button>
                <Button style={{marginLeft:"10px"}} onClick={this.exportData}>下载数据</Button>
            </div>
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
                <EfficiencySetModalView
                    input={this.props.config.input}
                    hide={this.hide}
                    visible={this.state.visible}
                    affectOI={this.affectOI}
                />
                
                </div>
                
            </div>
        )
    }
}

  class EfficiencySetModalViewForm extends React.Component{
        constructor(props){
            super(props)
            this.state={
                month:'',
                value:'日',
                timeFilter:false,
                timeStart:'',
                timeEnd:''
                
            }
            
            this.onOk = this.onOk.bind(this)
            this.hide = this.hide.bind(this)
            this.handleChange = this.handleChange.bind(this)
            this.onSubmit = this.onSubmit.bind(this)
            this.onChange = this.onChange.bind(this)
            this.changeCondition = this.changeCondition.bind(this)
            this.getFormItem = this.getFormItem.bind(this)
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
                timeFilter:checked
            })
        }

        hide(){
            this.props.hide();
        }

        //点击提交表单时触发
        onOk(e){
            const {form} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    // let timeStart = this.state.timeStart;
                    // let timeEnd = this.state.timeEnd;
                    // let f = this.state.f;
                    // let date = this.state.value;
                    if(values.timeFilter==true){
                        if(values.timeRange==undefined){
                            Modal.confirm({title:'请选择时间范围！'})
                        }else{
                    
                        if(values.timeRange==undefined){
                            this.props.affectOI(values,values.timeFilter,"","");
                        }else{
                        this.props.affectOI(values,values.timeFilter,values.timeRange[0].format('YYYY-MM-DD'),values.timeRange[1].format('YYYY-MM-DD'));
                        }
                        this.hide();
                    }
                    }else{
                        if(values.timeRange==undefined){
                            this.props.affectOI(values,values.timeFilter,"","");
                        }else{
                        this.props.affectOI(values,values.timeFilter,values.timeRange[0].format('YYYY-MM-DD'),values.timeRange[1].format('YYYY-MM-DD'));
                        }
                        this.hide();
                    }
                    
                }
            })
            
        }

        getFormItem (getFieldDecorator) {
            if (this.props.input != undefined && this.props.input.length > 0) {
                return this.props.input.map((item,i)=>{
                    if (item.name != undefined) {
                        return(
                            <Row gutter={0}>
                                <Col span={16} >
                                    <FormItem
                                            {...formItemLayout}
                                            label={item.name}
                                            labelCol={{span:10}}
                                            wrapperCol={{ span: 5 }}
                                            >
                                                {
                                                    getFieldDecorator('formItemMin'+i,{
                                                        initialValue:''
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
                                                    getFieldDecorator('formItemMax'+i,{
                                                        initialValue:''
                                                    }
                                                    )(
                                                        <Input   style={{ width: 100, textAlign: 'center'}} placeholder="Maximum" />
                                                    )
                                                }
                                        </FormItem>
                                </Col>
                            </Row>
                        )
                    }
                })
            }
            
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
                        <div> 
                            <Row>
                                <Col span={6} offset={8}>
                                最小值
                                </Col>
                                <Col span={4} offset={5}>
                                最大值
                                </Col>
                            </Row>
                            {this.getFormItem(getFieldDecorator)}
                        </div>
                        <div><Input readOnly unselectable="on"  style={{border:'0px',outline:'none',cursor:'auto',backgroundColor:"#001529",'boxShadow': 'none',overflow:'visible'}} value="时间配置"/></div>
                            <FormItem
                                {...formItemLayout}
                                label='是否进行时间筛选'
                                >
                                    {
                                        getFieldDecorator('timeFilter',{
                                           
                                        }
                                        )(<Switch  onChange={this.changeCondition} />)
                                    }
                            </FormItem>
                           {/*
                                <FormItem
                                {...formItemLayout}
                                label='按时间分类'
                                >
                                    {
                                        getFieldDecorator('timeClassify',{
                                            initialValue:"日"
                                        }
                                        )(<Select style={{ width: 100 }} defaultValue="日" onChange={this.onChange}>
                                                <Option value="日">日</Option>
                                                <Option value="月">月</Option>
                                                <Option value="周">周</Option>
                                            </Select>)
                                    }
                            </FormItem>
                                */}
                            
                            <FormItem
                                {...formItemLayout}
                                label='时间范围'
                                >
                                    {
                                        getFieldDecorator('timeRange',{
                                            
                                        }
                                        )(<RangePicker onChange={this.handleChange} />)
                                    }
                            </FormItem>
                    </Form>
                </Modal>
            )
        }
    }
const EfficiencySetModalView = Form.create()(EfficiencySetModalViewForm)








//const efficiencyChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class BigDataChartComponent extends Widget {
    
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
                <div></div>
            </div>
        )
    }
}

export default  BigDataChartComponent


