import React, { Component } from 'react'
import {Table,Form, Select, DatePicker, Button, Switch, message, Modalm,Row,Col,Modal} from 'antd'
import  s from './TableComponent.css'
import { modalTypes } from '../../../../common/enum';
import http from '../../../../common/http';
import moment from 'moment';
import WORD_DOWNLOAD_TEMPLATE from './downloadTemplates/word.html';
import Widget from './Widget.js';
import {downloadUrl} from '../../../../common/utils'

const registerInformation = {
    type : 'energyfee',
    name : '能源费用组件',
    description : "生成table组件，覆盖canvas对应区域",
}

function disabledDate(current) {
  // Can not select days before today and today
  return current && current.valueOf() >= Date.now();
}


const FormItem = Form.Item;


const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

const TIME_FORMAT = 'YYYY-MM-DD';


class EnergyFeeView extends React.Component {

    constructor(props){
        super(props)
        
        this.state = {
            style : {},
            headerHeight :0,
            dataSource:[],
            columns:[],
            loading: false,
            stTime:"",
            enTime:"",
            price : {},
            reportURL:"",
            //headerId:[],
            //header:[]
        }
        this.tableContainerRef = null

        this.getHistoryData = this.getHistoryData.bind(this);
        this._renderTable = this._renderTable.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getEndTime = this.getEndTime.bind(this);
        this.handleDownLoad = this.handleDownLoad.bind(this);
        this.getThisMonth = this.getThisMonth.bind(this);
        this.getLastMonth = this.getLastMonth.bind(this);
    }

    antdTableHearder = () => {
        // let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header'))
        let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header') || this.tableContainerRef.querySelector('.ant-table-thead'))
        
        let headerHeight = parseInt( catchedTableHeadStyle.height )
        this.setState({
            headerHeight : headerHeight
        })
    }

    componentDidMount() {
        // console.log(this.props)
        const {width,height,left,top} = this.props.style

        // 初始化
        let columns = []
        let index = 0
       
        //获取报表的时间段，若localStorage里没有则使用组件传来的初始化的时间段
        //第一次在localStorage里存储以后，只要不退出软件清掉energyFee，都选用localStorage里的时间段
        if (window.localStorage.getItem('energyFee') && window.localStorage.getItem('energyFeePrice') && window.localStorage.getItem('energyFeeData')&& JSON.parse(localStorage.getItem('energyFeeData')).data.length != 0) {
            let startTime = JSON.parse(localStorage.getItem('energyFee')).startTime;
            let endTime = JSON.parse(localStorage.getItem('energyFee')).endTime;
            let price = JSON.parse(localStorage.getItem('energyFeePrice')).price;
            let data = JSON.parse(localStorage.getItem('energyFeeData')).data;
            data.columns.forEach((col,index)=>{
                let key = col.key
                if (col.key === '') {
                    key = col.title
                }
                columns.push({
                    title:col.title,
                    dataIndex:key,
                    key : key,
                    width: 60
                })        
            })
            this.setState({
                reportURL: data.reportURL,
                columns:columns,
                price:price
            },this._renderTable(data,columns))

            //同步时间控件
            this.props.form.setFieldsValue({
                range: [moment(startTime), moment(endTime)],
            });

        }else {
            let endTime = moment().format('YYYY-MM-DD')
            let startTime = moment().startOf('day').format('YYYY-MM-DD');
            try {
                const {defaultDate}  = this.props.config
                if (defaultDate != undefined) {
                    let nowDate = moment().format('DD')
                    if (nowDate < defaultDate) {
                        endTime = moment().subtract(1, 'month').format('YYYY-MM-'+defaultDate)
                        startTime = moment().subtract(2, 'month').format('YYYY-MM-'+defaultDate)
                    }else {
                        endTime = moment().format('YYYY-MM-'+defaultDate);
                        startTime = moment().subtract(1, 'month').format('YYYY-MM-'+defaultDate);
                    }
                }
            } catch (err) {
                console.log(err);
            }

            this.setState({
                stTime: moment(startTime).format(TIME_FORMAT),
                enTime: moment(endTime).format(TIME_FORMAT)
            })

            //同步时间控件
            this.props.form.setFieldsValue({
                range: [moment(startTime), moment(endTime)],
            });

            //保存到localStorage中，以便下次切换页面时时间段不变
            window.localStorage.setItem('energyFee',JSON.stringify({
                startTime,
                endTime
            }));

            this.getGlobalConfig(startTime,endTime)
        }

        this.setState({
            style : {
                width : width,
                height : height,
                left : left,
                top : top
            }
            
        });
       
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
    }

    // 获取Factory里全局配置的电价
    getGlobalConfig = (startTime,endTime) => {
        var _this = this 
        let priceName = ''
        let reqPrice = {}
        //如果config里面配置了price
        if (this.props.config.price != undefined) {
            priceName = this.props.config.price
            http.post('/project/getConfig')
            .then(
                data=>{
                    if(data.status){
                        //如果全局中没有配置price对应名称的对象，则使用默认空对象
                        if (data.data[priceName] === undefined) {
                            Modal.error({
                                title : '错误提示',
                                content :"Factory中设备系统定义配置内容中不存在："+ priceName+"默认使用1"
                            });
                        } else {
                            reqPrice = data.data[priceName]
                        }
                        _this.setState({price : reqPrice});
                        //保存到localStorage中，以便下次切换页面时时间段不变
                        window.localStorage.setItem('energyFeePrice',JSON.stringify({
                            price: reqPrice
                        }));
                        //请求数据
                        this.getHistoryData(
                            startTime,endTime,reqPrice
                        );
                    }else {
                        Modal.error({
                            title : '错误提示',
                            content :"Factory中设备系统定义配置内容有误："+ data.msg
                        });
                    }
                }
            )
        }
        //如果config中没有配置priceName，使用默认空对象{}
        else {
            _this.setState({price : reqPrice});
            //保存到localStorage中，以便下次切换页面时时间段不变
            window.localStorage.setItem('energyFeePrice',JSON.stringify({
                price: reqPrice
            }));
            //请求数据
            this.getHistoryData(
                startTime,endTime,reqPrice
            );
        }
    }
  
    onSearch () {  
        let startTime,endTime
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.getHistoryData(
                values.range[0].format(TIME_FORMAT),
                values.range[1].format(TIME_FORMAT),
                this.state.price
            );
            startTime = values.range[0].format(TIME_FORMAT),
            endTime = values.range[1].format(TIME_FORMAT)
        });
        //保存到localStorage中，以便下次切换页面时时间段不变
         window.localStorage.setItem('energyFee',JSON.stringify({
            startTime,
            endTime
        }));

    }

    //根据不同时间间隔处理开始时间
    getEndTime (timeStart, timeFormat) {
        let timeEndData
        switch(timeFormat) {
            case 'm5':
            timeEndData = moment(timeStart).add(5,'minute');
            break;
            case 'h1':
            timeEndData = moment(timeStart).add(1,'hour');
            break;
            case 'd1':
            timeEndData = moment(timeStart).add(1,'day');
            break;
        }
        return timeEndData.format(TIME_FORMAT)
    }

    //请求历史数据
    getHistoryData (timeStart, timeEnd,price) { 
        let columns = []        
        if (moment(timeStart).isAfter(moment())) {
            Modal.warning({
                title: '信息提示',
                content: '查询时间不支持!',
            });
            return
        }
        //加载中……
        this.setState({
            loading:true
        });

        let timeEndData,timeStartData

        if (moment(timeEnd).isAfter(moment())) {
            timeEndData = moment()
        }else {
            timeEndData = timeEnd
        }

        this.setState({
            stTime: moment(timeStart).format(TIME_FORMAT),
            enTime: moment(timeEndData).format(TIME_FORMAT)
        })
        let obj = {}
        if (Object.keys(price).length === 0) {
            obj = { pointList: this.props.config.pointList,
                dateFrom: moment(timeStart).format(TIME_FORMAT),
                dateTo: moment(timeEndData).format(TIME_FORMAT),
                price:{}
            }
        }else {
            obj = { pointList: this.props.config.pointList,
                price: price,
                dateFrom: moment(timeStart).format(TIME_FORMAT),
                dateTo: moment(timeEndData).format(TIME_FORMAT)
            }
        }

        http.post('/energy/feeReportGen', {
            ...obj
            }).then(
                data=>{
                    if (data.err != 0) {
                        Modal.error({
                            title: '错误提示',
                            content: data.msg,
                        });
                        message.error(data.msg);
                        let dataSource = []
                        this.setState({
                            dataSource: dataSource,
                            loading: false
                        })
                    }else {
                        if (data.msg != '' && data.msg != undefined) {
                            Modal.error({
                                title: '错误提示',
                                content: data.msg,
                            });
                        }
                        data.data.columns.forEach((col,index)=>{
                            let key = col.key
                            if (col.key === '') {
                                key = col.title
                            }
                            columns.push({
                                title:col.title,
                                dataIndex:key,
                                key : key,
                                width: 60
                            })        
                        })
                        this.setState({
                            reportURL: data.reportURL,
                            columns:columns
                        })
                        this._renderTable(data.data);                        
                        window.localStorage.setItem('energyFeeData',JSON.stringify({
                           data:data.data
                        }));
                    }    
                }
            ).catch(
                error =>{
                    message.error('数据读取失败！');
                    let dataSource = []
                    this.setState({
                        dataSource: dataSource,
                        loading: false
                    })
                    window.localStorage.setItem('energyFeeData',JSON.stringify({
                        data:[]
                    }));
                }
            )
    }
  
    // 生成数据
    _renderTable = (data,columns) => {
        const config = this.props.config
        let pointList  = data.pointList
        let columnsList = this.state.columns
        if (typeof(columns) != "undefined"){
            columnsList  = columns
        }
        let dataSource = []
        let pointData = []
        let timeData = []
        
        if (data.length != 0) {
            dataSource = pointList.map( (item,row)=>{
                let line = {}
                line['key']= row
                columnsList.forEach( (hitem,i)=>{
                    //如果配置信息里有此列，直接取出即可
                    if ( data[item] === undefined||data[item].stat[hitem.key] === undefined||data[item].stat[hitem.key] === null) {
                        line[hitem.key] = ""
                    }else {
                        if (typeof(data[item].stat[hitem.key]) === "number") {
                            line[hitem.key] =  Number(data[item].stat[hitem.key]).toFixed(1)
                        }else {
                            line[hitem.key] = data[item].stat[hitem.key]     
                        }
                                  
                    }
                })
                
                return line
            })
        }
        
       

        // //如果有丢失的数据，需根据索引值将对应行的所有值清空
        // if (data.lostTime && data.lostTime.length != 0) {
        //     data.lostTime.forEach((row,r)=>{
        //         pointList.forEach((pitem,i)=>{
        //                 dataSource[row][pitem] = ''
        //         })  
        //     })
        // }
    

        // //抽出所有点值，便于下载传值
        // pointData = dataSource.map( (item,row)=>{
        //     let line = {}
        //     line['key']= row
        //     pointList.forEach( (pitem,i)=>{
        //         line[pitem] = item[pitem]
        //     })
        //     return line
        // })
        // //抽出所有时间，便于下载传值
        // timeData = dataSource.map( (item,row)=>{
        //     return item['时间']
        // })            
    
        this.setState({
            //pointvalue:pointvalue, //保存数据到state上，对比下一次
            dataSource: dataSource,
            loading: false
        },this.antdTableHearder)
    }
    

    getTableContainerRef = (ref) => {
        this.tableContainerRef = ref
    }

    //生成word并下载
    handleDownLoad() {
        // let pointList = this.state.headerId
        // let header = this.state.header
        // let reportName = this.props.config.energyfeeName
        // let strStartTime = this.state.stTime
        // let strEndTime = this.state.enTime
        // let tableDataList = this.state.dataSource
        
        // http.post('/reportTool/genExcelReportByTableData', {
        //     reportName: reportName,
        //     strStartTime: strStartTime,
        //     strEndTime: strEndTime,
        //     headerList: header,
        //     tableDataList:tableDataList,
        //     pointList:pointList
        // }).then(
        //     data=>{
        //         if (data.err === 0) {
        //             downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
        //         }
        //         if (status === false) {
        //             message.error('生成下载文件失败')
        //         }
        //     }
        // ).catch(
        //     error =>{
        //         message.err(error.msg)
        //         console.log(error)
        //     }
        // )      

        if (this.state.reportURL != "") {
            downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${this.state.reportURL}`)
        }
        else {
            message.error('生成下载文件失败')
        }
    }
    // 获取上月日期
    getLastMonth = () => {
        const {setFieldsValue} = this.props.form
        let startTime,endTime
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            startTime = values.range[0].format(TIME_FORMAT),
            endTime = values.range[1].format(TIME_FORMAT)
        });
        var timeStart = moment(startTime).add(-1, 'month'),
            timeEnd = moment(endTime).add(-1, 'month').endOf('month')
        setFieldsValue({
            range: [moment(timeStart), moment(timeEnd)]
        })
    }
    //获取本月日期
    getThisMonth = () => {
        const {setFieldsValue} = this.props.form

        var timeStart = moment().startOf('month'),
            timeEnd = moment().endOf('day')
        
        setFieldsValue({
            range: [moment(timeStart), moment(timeEnd)]
        })
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
                <div style={{textAlign:"center",fontSize:"20px"}} >{this.props.config.reportName}</div>
                <Form layout= 'inline'>
                    <FormItem wrapperCol={{offset:3}}>
                        <Row>
                            <Col span={12} >
                                <Button onClick={this.getLastMonth} style = {{width:"100px"}} >上一月</Button>
                            </Col>
                            <Col span={10} >
                                <Button onClick={this.getThisMonth} style = {{width:"80px"}}>本月</Button>
                            </Col>
                        </Row>
                    </FormItem>

                    <FormItem
                        label="时间范围"
                    >
                        {getFieldDecorator('range')(
                            <RangePicker size="small" format={TIME_FORMAT} />
                        )}
                    </FormItem>
                    <FormItem>
                        <Button
                            type="primary"
                            size="small"
                            onClick={ this.onSearch }
                        >
                            查询
                        </Button>
                    </FormItem>
                    <FormItem>
                        <Button
                            type="primary"
                            size="small"
                            onClick={ this.handleDownLoad }
                        >
                            下载
                        </Button>
                    </FormItem>
                </Form>
                 <div 
                    id= "reportContainer"
                    ref={this.getTableContainerRef}
                 >
                    <Table
                        columns={this.state.columns}
                        dataSource={this.state.dataSource}
                        pagination={false}
                        bordered={localStorage.getItem('serverOmd')=="persagy" ? false : true} 
                        loading={this.state.loading}
                        scroll={{
                            y:this.state.style.height - this.state.headerHeight,
                            x:this.state.style.width 
                        }}
                    />
                </div>
            </div>
        )
    }
}


const EnergyFeeViewModal = Form.create()(EnergyFeeView)



class EnergyFeeComponent extends Widget{

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
            <EnergyFeeViewModal {...this.props} />
        )
    }
}

export default EnergyFeeComponent

