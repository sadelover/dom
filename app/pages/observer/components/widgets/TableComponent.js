import React, { Component } from 'react'
import {Table,message,Spin,Row,Col,Button,Modal,Input} from 'antd'
import Widget from './Widget.js'
import  s from './TableComponent.css'
import { modalTypes } from '../../../../common/enum';

const { TextArea } = Input;
const registerInformation = {
    type : 'table',
    name : '表格组件',
    description : "生成table组件，覆盖canvas对应区域",
}

class TableComponent extends Widget {
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
        const {columnWidth} = this.props.config
        // 初始化
        let columns = []
        let newKey = 0
        //当config里配置了columnDataIndex，即显示columnDataIndex里的列；否则全显示
        if(this.props.config.showIndex == 1){
            columns.push({
                title:'序号',
                dataIndex:'id',
                key : 'id',
                width: 25,
                render : (text, record,index) => index+1
            })
        }
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
                    width: columnWidth&&columnWidth[key]!=undefined&&columnWidth[key]!=''&&columnWidth[key]>0?columnWidth[key]:60,
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
        pointvalue = ( pointvalue && pointvalue.value && Array.isArray(JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'])) ? JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'] : []
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
        let nextPoint =  nextProps.custom_realtime_data.filter(item=>item.name === nextProps.config.point)[0];
        if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(nextPoint)){
            this._renderTable(nextProps)
        }
    }

    // 生成数据
    _renderTable = (props) => {
        const {custom_realtime_data,header} = props || this.props
        let pointvalue = custom_realtime_data.filter(item=>item.name === this.props.config.point)[0];
        try {
            if (pointvalue === undefined ||!JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))) {
                // 跟arrayChart组件一起时，实时数据组里其他点会判断不一致，导致一直弹框报错信息
                // message.error('数据格式有误', 3)
                return ;
            }    
        }catch(err) {
            // Modal.error({
            //     title: '表格绑定的点（'+this.props.config.point+'）内容有误',
            //     content: (
            //             <TextArea autoSize={{ minRows: 2, maxRows: 10 }} value={pointvalue.value} />
                   
            //     )
            // });
        }
        
        pointvalue = (pointvalue.value && Array.isArray(JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'])) ? JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'] : []
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

        if(this.props.config.autoScroll && this.props.config.autoScroll != null&& this.props.config.autoScroll != undefined && this.props.config.autoScroll != ''){
            let v=document.getElementById(this.props.config.autoScroll).children[0].children[0].children[1]; 
            let height = document.getElementById(this.props.config.autoScroll).children[0].children[0].children[1].children[0].children[1].offsetHeight
            if(v){
                v.scrollTop = height;
            }        
        }

    }
    
    handleCellClick = (record,column) => {
        const {config,showModal,custom_realtime_data,idCom} = this.props
        let pointvalue = custom_realtime_data.filter(item=>item.name === config.point)[0];
        pointvalue = (pointvalue.value && Array.isArray(JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'])) ? JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'] : []
        // console.info( record,column )
        // config.readonly true or false?
        if(config.readonly) return false
        let curvalue = pointvalue[record.key][Number(column)];
        showModal( modalTypes.TABLE_CELL_MODAL , {
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
        pointvalue = (pointvalue.value && Array.isArray(JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'])) ? JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'] : []
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
        pointvalue = (pointvalue.value && Array.isArray(JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'])) ? JSON.parse(pointvalue.value.replaceAll("-1.#IND00","0"))['data'] : []
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
                        id={this.props.config.autoScroll && this.props.config.autoScroll != null && this.props.config.autoScroll != '' ? this.props.config.autoScroll:''}
                        columns={this.state.columns}
                        dataSource={this.state.dataSource}
                        pagination={false}
                        bordered={localStorage.getItem('serverOmd')=="persagy" ? false : true} 
                        scroll={{
                            x:this.props.config.maxWidth?this.props.config.maxWidth:'',
                            y:this.state.style.height - this.state.headerHeight
                        }}
                    />
                               
            </div>
        )
    }
}

export default TableComponent




