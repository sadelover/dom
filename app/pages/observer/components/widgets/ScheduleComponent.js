import React, { Component } from 'react'
import {Table,message,Spin,Row,Col,Button,Modal,Input} from 'antd'
import Widget from './Widget.js'
import  s from './ScheduleComponent.css'
import { modalTypes } from '../../../../common/enum';
const { TextArea } = Input;
const registerInformation = {
    type : 'schedule',
    name : '排班组件',
    description : "生成schedule组件，覆盖canvas对应区域",
}

class ScheduleComponent extends Widget {
    constructor(props){
        super(props)
        
        this.state = {
            style : {},
            headerHeight :0,
            columns : [],
            dataSource:[],
            pointvalue:[],
            data:{}
        }
        this.tableContainerRef = null
        this.oneClickOpenClose = this.oneClickOpenClose.bind(this);
    }
    /* @override */
    static get type() {
      return registerInformation.type;
    }
    /* @override */
    static get registerInformation() {
      return registerInformation;
    }

    antdTableHearder = () => {
        let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header')||this.tableContainerRef.querySelector('.ant-table-thead'))
        let headerHeight = parseInt( catchedTableHeadStyle.height )
        this.setState({
            headerHeight : headerHeight
        })
    }

    componentDidMount() {
        const {width,height,left,top} = this.props.style
        const {header,custom_table_data}  = this.props
        // 初始化
        let columns = []
        let newKey = 0
        //当config里配置了columnDataIndex，即显示columnDataIndex里的列；否则全显示
        if (this.props.config.columnDataIndex != undefined) {
            header.forEach((col,key)=>{
                this.props.config.columnDataIndex.forEach((row,j)=>{
                    if (key === row) {
                        newKey = row
                        columns.push({
                            title:col,
                            dataIndex:newKey,
                            key : newKey,
                            width: 60,
                            render : (text, record) => this.renderColumns(text, record,key)
                        })
                    }
                    
                })
            })
        }else {
            header.forEach((col,key)=>{
                columns.push({
                    title:col,
                    dataIndex:key,
                    key : key,
                    width: 60,
                    render : (text, record) => this.renderColumns(text, record,key)
                })
            })
        }
    
        this.setState({
            style : {
                width : width,
                height : height,
                left : left,
                top : top
            },
            columns : columns,
            data:custom_table_data
        },this._renderTable(this.props))
    }

    componentWillReceiveProps(nextProps){
        const {custom_table_data} = nextProps
        let pointvalue = custom_table_data.filter(item=>item.name === nextProps.config.point)[0];
        pointvalue = ( pointvalue && pointvalue.value && Array.isArray(JSON.parse(pointvalue.value)['data'])) ? JSON.parse(pointvalue.value)['data'] : []
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
        // 判断两个数组内容是否相等
        //let nextPoint =  nextProps.custom_realtime_data.filter(item=>item.name === nextProps.config.point)[0];
        if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(pointvalue)){
            this._renderTable(nextProps)
        }
    }

    // 生成数据
    _renderTable = (props) => {
        const {custom_table_data,header} = props || this.props
        let pointvalue = custom_table_data.filter(item=>item.name === this.props.config.point)[0];
        try {
            if (pointvalue === undefined ||!JSON.parse(pointvalue.value)) {
                message.error('数据格式有误', 3)
                return ;
            }    
        }catch(err) {
            Modal.error({
                title: '表格绑定的点（'+this.props.config.point+'）内容有误',
                content: (
                        <TextArea autoSize={{ minRows: 2, maxRows: 10 }} value={pointvalue.value} />
                   
                )
            });
        }
        
        pointvalue = (pointvalue.value && Array.isArray(JSON.parse(pointvalue.value)['data'])) ? JSON.parse(pointvalue.value)['data'] : []
        // pointvalue [ [1,2,3,4] , [1,2,3,4] ]
        let dataSource = []
        if (this.props.config.decimal != undefined) {
            let num = Number(this.props.config.decimal)
            dataSource = pointvalue.map( (item,row)=>{
                let line = {}
                line['key']= row
                item.forEach( (item,i)=>{
                    if (Number(item).toFixed(num) === "NaN") {
                        line[header.indexOf(header[i])] = item
                    }else {
                        line[header.indexOf(header[i])] = Number(item).toFixed(num)     
                    }
                })
                return line
            })
        }else {
            dataSource = pointvalue.map( (item,row)=>{
                let line = {}
                line['key']= row
                item.forEach( (item,i)=>{
                    line[header.indexOf(header[i])] = item
                })
                return line
            })
        }

        if (dataSource === undefined) {
            dataSource = []
        }

        this.setState({
            pointvalue:pointvalue, //保存数据到state上，对比下一次
            dataSource:dataSource
        },this.antdTableHearder)
    }
    
    handleCellClick = (record,column) => {
        const {config,showModal,custom_table_data,idCom} = this.props
        let pointvalue = custom_table_data.filter(item=>item.name === config.point)[0];
        pointvalue = (pointvalue.value && Array.isArray(JSON.parse(pointvalue.value)['data'])) ? JSON.parse(pointvalue.value)['data'] : []
        // console.info( record,column )
        // config.readonly true or false?
        if(config.readonly) return false
        let curvalue = pointvalue[record.key][Number(column)];
        showModal( modalTypes.SCHEDULE_CELL_MODAL , {
            currentValue : curvalue,
            idCom : idCom,
            firstKey : record.key,
            secondKey : column,
            pointvalue : pointvalue,
            _renderTable : this._renderTable
        })
    }
    //一键开关的请求方法
    handleOneClick = (record,column,text) => {
        const {config,tableOneClick,custom_table_data,idCom} = this.props
        let pointvalue = custom_table_data.filter(item=>item.name === config.point)[0];
        if (pointvalue === undefined) {
            return
        }
        pointvalue = (pointvalue.value && Array.isArray(JSON.parse(pointvalue.value)['data'])) ? JSON.parse(pointvalue.value)['data'] : []
        // console.info( record,column )
        // config.readonly true or false?
        if(config.readonly) return false
        //let curvalue = pointvalue[record.key][Number(column)];
        let curvalue = text
        let setValue = ''
        if (Number(text) === 1) {
            setValue = '0'
        }else {
            setValue = '1'
        }
        let valueList = {
            currentValue : curvalue,
            settingValue: setValue,
            idCom : idCom,
            firstKey : record.key,
            secondKey : column,
            pointvalue : pointvalue,
            clickAll:false
        }
        tableOneClick(valueList)
    }

    //一键全开||一键全关
    oneClickOpenClose (value) {
        let setStr = value
        const {config,tableOneClick,custom_table_data,idCom} = this.props
        let pointvalue = custom_table_data.filter(item=>item.name === config.point)[0];
        if (pointvalue === undefined) {
            return
        }
        pointvalue = (pointvalue.value && Array.isArray(JSON.parse(pointvalue.value)['data'])) ? JSON.parse(pointvalue.value)['data'] : []
        if(config.readonly) return false

        let newPointValue = []
        
        pointvalue.forEach((row,i)=>{
            let newValue = []
            row.forEach((item,j)=>{
                if (j!=0) {
                    item = setStr
                }
                newValue.push(item)
            })
            newPointValue.push(newValue)
        })
  
        let valueList = {
            idCom : idCom,
            pointvalue : newPointValue,
            clickAll:true
        }
        tableOneClick(valueList)

    }

    // 渲染列
    renderColumns = (text,record,column) => {
        const {clickonoff,offcolor,oncolor,fixColumn} =this.props.config 
        //fixColumn === 1 表示第一列锁定不让修改（表示时间）
        if (fixColumn != undefined && fixColumn === 1) {
            if (column === 0) {
                return (
                    <span 
                        className={s['time']}    
                    >{text}</span>
                )
            }
        //clickonoff为1，则根据用户配置显示1和0的颜色，且提供一键改值
        }if (clickonoff != undefined && clickonoff === 1) {
            if (Number(text) === 1) {
                return (
                    <a 
                        href="javascript:void(0)" 
                        className={s['cell']} 
                        style={{backgroundColor:offcolor,color:'#fff'}}
                        onClick={(e)=>{this.handleOneClick(record,column,text)}} 
                    >{text}</a>
                )
            }else{
                return (
                    <a 
                        href="javascript:void(0)" 
                        className={s['cell']} 
                        style={{backgroundColor:oncolor,color:'#fff'}}
                        onClick={(e)=>{this.handleOneClick(record,column,text)}} 
                    >{text}</a>
                )
            }
        }
        return (
            <a 
                href="javascript:void(0)" 
                className={s['cell']} 
                onClick={(e)=>{this.handleCellClick(record,column)}} 
            >{text}</a>
        )
    }

    getTableContainerRef = (ref) => {
        this.tableContainerRef = ref
    }

    getContent() {
        const {style} = this.state
        return (
            <div 
                style={Object.assign(style,{overflowY:"hidden"})} 
                className={s['table-container']} 
                ref={this.getTableContainerRef}
                >
                {
                    this.props.config.clickonoff === 1 ?
                  
                        <div className={s['tittle']}>
                            <Row>
                                <Col span={1} offset={22}>
                                    <Button  type="primary" onClick={()=>{this.oneClickOpenClose('1')}} >全开</Button>
                                </Col>
                                <Col span={1} >
                                    <Button type="primary"  onClick={()=>{this.oneClickOpenClose('0')}}>全关</Button>
                                </Col>         
                            </Row>    
                        </div>
                    
                    :
                    ""
                }
          
                    <Table
                        columns={this.state.columns}
                        dataSource={this.state.dataSource}
                        pagination={false}
                        bordered={true}
                        scroll={{
                            y:this.state.style.height - this.state.headerHeight -34
                        }}
                    />
                               
            </div>
        )
    }
}

export default ScheduleComponent


