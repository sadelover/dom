import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';
import {addOperation} from '../../../../common/utils'
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import ModelText from '../core/entities/modelText.js';
import s from './EquipmentControlTableView.css';
import { Tag, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Progress, Slider,Modal, InputNumber} from 'antd';
import moment from 'moment'
const { Header, Footer, Sider, Content } = Layout;
const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {
      span: 8
    },
    wrapperCol: {
      span: 15
    },
  }
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'EquipmentControlTable',
    name : '通用控制表格组件',
    description : "生成通用控制表格组件",
}

class SettingValueModal extends React.Component{
    constructor(props){
        super(props)
        this.state={

        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.onCancel = this.onCancel.bind(this)
        this.checkPointRefresh = this.checkPointRefresh.bind(this)
    }

      //点击确定，提交
    handleSubmit(e) {
        const {form,pointName,equipmentName,title,currentValue} = this.props
        let _this = this
        let StartTime = moment().format('YYYY-MM-DD HH:mm:ss')      
        form.validateFields((err,values)=>{
            if(!err){
                if(Array.isArray(pointName)){
                    if(parseInt(values.settingValue)==''){
                        form.resetFields()
                        return
                    }else{
                        let value = []
                        pointName.map((item)=>{
                            value.push(values.settingValue)
                        })
                        _this.props.renderLoading(true)
                        _this.onCancel()
                        http.post('/pointData/setValue',{
                            pointList:pointName,
                            valueList:value,
                            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
                        }).then(
                            data=>{
                                if(data.err==0) {
                                    addOperation("/operationRecord/add",{
                                        "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                                        "content":`将${equipmentName}的${title}值设置为${values.settingValue}
                                        `
                                    },'操作记录')
                                    form.resetFields()  
                                }else{
                                    Modal.warning({
                                        title:'写值设定失败！'
                                    })
                                    _this.props.renderLoading(false)
                                }
                            }
                        ).catch(
                            err=>{
                                this.props.renderLoading(false)
                            }
                        ) 
                    }
                }else{
                    if(parseInt(values.settingValue)==parseInt(currentValue)){
                        form.resetFields()
                        return
                    }else{
                        _this.props.renderLoading(true)
                        _this.onCancel()
                        http.post('/pointData/setValue',{
                            pointList:[pointName],
                            valueList:[values.settingValue],
                            source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
                        }).then(
                            data=>{
                                if(data.err==0) {
                                    _this.checkPointRefresh(StartTime,pointName,values.settingValue,title,equipmentName,1)
                                    form.resetFields()  
                                }else{
                                    Modal.warning({
                                        title:'写值设定失败！'
                                    })
                                    _this.props.renderLoading(false)
                                }
                            }
                        ).catch(
                            err=>{
                                this.props.renderLoading(false)
                            }
                        )            //操作记录
                    }
                }
            }
        })
    }
    checkPointRefresh(StartTime,pointName,value,title,equipmentName,count){
        let _this = this
        count=count+1
        http.post('/get_realtimedata', {
            "proj":1,
            "pointList":[pointName]
        }).then(
            data=>{
                if(data.length>0){
                    if(value==data[0].value){
                        this.props.renderLoading(false)
                        addOperation("/operationRecord/add",{
                            "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                            "content":`将${equipmentName}的${title}值设置为${value},检测值设定成功
                            `
                        },'操作记录')
                    }else{
                        if(count<10){
                            setTimeout(function(){
                                _this.checkPointRefresh(StartTime,pointName,value,title,equipmentName,count)
                            },15000)
                        }else{
                            this.props.renderLoading(false)
                            let EndTime = moment().format('YYYY-MM-DD HH:mm:ss')
                            let date1 = new Date(StartTime);
                            let date2 = new Date(EndTime);
                            let s1 = date1.getTime();
                            let s2 = date2.getTime();
                            let total = (s2 - s1)/1000/60;
                            addOperation("/operationRecord/add",{
                                "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                                "content":`将${equipmentName}的${title}值设置为${value},检测指令${parseInt(total)}分钟仍不一致,认为设置失败
                                `
                            },'改值操作记录失败')

                        }
                    }
                }else{
                    this.props.renderLoading(false)
                }
            }
        ).catch(
            err=>{
                this.props.renderLoading(false)
            }
        )
    }

    onCancel(){
        this.props.setValueCancel()
    }

    render(){
        const {getFieldDecorator} = this.props.form
        return(
            <Modal
                title= '确认指令'
                visible = {this.props.setValueModalVisible}
                width={400}
                onCancel={this.onCancel}
                onOk= {this.handleSubmit}
                maskClosable={false}
            >
                <Form>
                    {Array.isArray(this.props.pointName)?
                        ''
                        :
                        <FormItem
                        {...formItemLayout}
                        label="当前值："
                        >
                        {getFieldDecorator('currentValue', {
                            initialValue:this.props.currentValue,
                        })(
                            <Input style={{width:160,backgroundColor:"transparent"}} disabled={true} />
                        )}
                        </FormItem>   
                    }
                    <FormItem
                    {...formItemLayout}
                    label="设置新值"
                    >
                    {getFieldDecorator('settingValue', {
                        initialValue:this.props.currentValue,
                        rules: [
                            {
                              required: true,
                              message: '设定值不可以为空',
                            },
                          ],
                    })(
                        <InputNumber style={{width:160}} />
                    )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}


const OptimizeValueModal = Form.create({
    mapPropsToFields : function(props){
        return {
            currentValue : Form.createFormField({
                value : props.currentValue
            })
        }
    }
})(SettingValueModal);

class CommandWindow extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onCancel = this.onCancel.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.checkPointRefresh = this.checkPointRefresh.bind(this)
     }
     onCancel(){
        this.props.switchCancel()
     }
     handleSubmit(){
        this.props.renderLoading(true)
        this.onCancel()
        const {pointName,pointValue,equipmentName} = this.props
        let StartTime = moment().format('YYYY-MM-DD HH:mm:ss')
        if(Array.isArray(pointName)){
            let value = []
            if(Array.isArray(pointValue)){
                if(pointValue.length == 1){
                    pointName.map((item)=>{
                        value.push(pointValue[0])
                    })
                }else{
                    value = pointValue
                }
            }else{
                pointName.map((item)=>{
                    value.push(pointValue)
                })
            }
            http.post('/pointData/setValue',{
                pointList:pointName,
                valueList:value,
                source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
            }).then(
                data=>{
                    if(data.err===0) {
                        addOperation("/operationRecord/add",{
                            "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                            "content":`将${equipmentName}设置为${pointValue==1?'开':'关'}`
                        },'操作记录')
                    }
                }
            )
        }else{
            // //操作记录
            http.post('/pointData/setValue',{
                pointList:[pointName],
                valueList:[pointValue.toString()],
                source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?  JSON.parse(localStorage.getItem('userInfo')).name : ''
            }).then(
                data=>{
                    if(data.err===0) {
                        addOperation("/operationRecord/add",{
                            "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                            "content":`将${equipmentName}设置为${pointValue==1?'开':'关'}`
                        },'操作记录')
                        this.checkPointRefresh(StartTime,pointName,pointValue,equipmentName,1)
                    }
                }
            )
        }
     }
   
     checkPointRefresh(StartTime,pointName,pointValue,equipmentName,count){
        let _this = this
         count=count+1
         http.post('/get_realtimedata', {
             "proj":1,
             "pointList":[pointName]
         }).then(
            data=>{
                if(data.length>0){
                    if(pointValue==data[0].value){
                        addOperation("/operationRecord/add",{
                            "userName":`${localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                            "content":`${equipmentName}设置${pointValue==1?'开启成功':'关闭成功'}`
                        },'改值操作成功')
                    }else{
                        if(count<10){
                            setTimeout(function(){
                                _this.checkPointRefresh(StartTime,pointName,pointValue,equipmentName,count)          
                            },15000)          
                        }else{
                            this.props.renderLoading(false)
                                let EndTime = moment().format('YYYY-MM-DD HH:mm:ss')
                                let date1 = new Date(StartTime);
                                let date2 = new Date(EndTime);
                                let s1 = date1.getTime();
                                let s2 = date2.getTime();
                                let total = (s2 - s1)/1000/60;
                            addOperation("/operationRecord/add",{
                                "userName":`${localStorage.getItem('userInfo')&&JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                                "content":`将${pointName}设置为${pointValue},经过${parseInt(total)}分钟后仍不一致,认为设置失败`
                            },'改值操作记录失败')
                        }
                    }
                }
            }
         ).catch(
             err=>{
                let EndTime = moment().format('YYYY-MM-DD HH:mm:ss')
                let date1 = new Date(StartTime);
                let date2 = new Date(EndTime);
                let s1 = date1.getTime();
                let s2 = date2.getTime();
                let total = (s2 - s1)/1000/60;
                addOperation("/operationRecord/add",{
                    "userName":`${localStorage.getItem('userInfo')&&JSON.parse(localStorage.getItem('userInfo')).name?JSON.parse(localStorage.getItem('userInfo')).name:''}`,
                    "content":`将${pointName}设置为${pointValue},经过${parseInt(total)}分钟后仍不一致,认为设置失败`
                },'改值操作记录失败')
             }
         )
     }
    render(){
        const {pointValue,equipmentName,SwitchVisiable} = this.props
        return(
            <Modal
                title='确认指令'
                width={500}
                visible={SwitchVisiable}
                onCancel={this.onCancel}
                onOk= {this.handleSubmit}
            >
                {
                    <div>
                        {
                            Array.isArray(pointValue)?
                            <div>是否{equipmentName}?</div>
                            :
                            <div>
                                是否确认将{equipmentName}{
                                    pointValue==1?'设置为开':'设置为关'
                                }
                            </div>
                        }
                    </div>

                }
            </Modal>
        )
    }
}

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
            columns: [],
            dataSource: [],
            pointList: [],
            indexId: 0,
            loading: false,
            SwitchVisiable: false,
            pointName:'',
            pointValue:'',
            equipmentName: '',
            setValueModalVisible: false,
            title:'',
            currentValue:''
        }
        this.renderLeftList = this.renderLeftList.bind(this)
        this.selectList = this.selectList.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.renderDataSource = this.renderDataSource.bind(this)
        this.renderDataTemplateSource = this.renderDataTemplateSource.bind(this)
        this.ButtonChange = this.ButtonChange.bind(this)
        this.ButtonCancel = this.ButtonCancel.bind(this)
        this.setValueCancel = this.setValueCancel.bind(this)
        this.renderLoading = this.renderLoading.bind(this)
        this.defaultBtnList = this.defaultBtnList.bind(this)
        this.extraBtnList = this.extraBtnList.bind(this)
    }

    componentWillReceiveProps(nextProps){
        if(this.props.custom_realtime_data.length != nextProps.custom_realtime_data.length){
            this.setState({
                pointList: nextProps.custom_realtime_data
            })
            if(this.props.config.groups && this.props.config.groups != undefined){
                this.renderDataSource(this.state.indexId,nextProps.custom_realtime_data) 
            }else if(this.props.config.groupsTemplate && this.props.config.groupsTemplate != undefined){
                this.renderDataTemplateSource(this.state.indexId,nextProps.custom_realtime_data)
            }
        }else{
            if(this.state.pointList && this.state.pointList.length == 0){
                this.setState({
                    pointList: nextProps.custom_realtime_data
                })
                if(this.props.config.groups && this.props.config.groups != undefined){
                    this.renderDataSource(this.state.indexId,nextProps.custom_realtime_data) 
                }else if(this.props.config.groupsTemplate && this.props.config.groupsTemplate != undefined){
                    this.renderDataTemplateSource(this.state.indexId,nextProps.custom_realtime_data)
                }
            }else{
                this.props.custom_realtime_data.map((item,index)=>{
                    nextProps.custom_realtime_data.map((nextItem,nextIndex)=>{
                        if(item['name'] == nextItem['name']){
                            if(item['value'] != nextItem['value']){
                                this.setState({
                                    pointList: nextProps.custom_realtime_data
                                })
                                if(this.props.config.groups && this.props.config.groups != undefined){
                                    this.renderDataSource(this.state.indexId,nextProps.custom_realtime_data) 
                                }else if(this.props.config.groupsTemplate && this.props.config.groupsTemplate != undefined){
                                    this.renderDataTemplateSource(this.state.indexId,nextProps.custom_realtime_data)
                                }
                            }
                        }
                    })
                })
            }
        }
    }
  
    componentWillMount(){
     
    }

    shouldComponentUpdate(nextProps,nextState){
        if(this.state != nextState){
            return true
        }
        return false
    }

    componentDidMount() {
        this.renderHeader()
        let newArr2 = this.props.config.groupsTemplate
        let newArr = this.props.config.groups
        if(newArr !== undefined){
            this.renderLeftList(newArr)
            document.getElementById('Select').childNodes[0].style.backgroundColor='#2ea2f8'    
        }else if(newArr2 !== undefined){
            this.renderLeftList(newArr2)
            document.getElementById('Select').childNodes[0].style.backgroundColor='#2ea2f8'    
        }
    }

    renderDataSource(indexId,data){
        this.setState({
            loading: true
        })
        let pointList = data?data:this.state.pointList
        let newArr = this.props.config.groups
        let Properties = this.props.config.Properties
        let bodyArr = []  //存储循环出来的dataSource
        newArr[indexId].children.map((itemA,indexA)=>{
            let obj = {}
            obj['id'] = indexA + 1
            obj['EquipName'] = itemA.EquipName
            Properties.map((itemB,indexB)=>{
                obj[`${itemB['Point']}Name`] = `${itemA['Prefix']}${itemB['Point']}${itemA['No']}`
                pointList.map((itemC,indexC)=>{
                    if(itemC['name'] == `${itemA['Prefix']}${itemB['Point']}${itemA['No']}`){
                        obj[itemB['Point']] = itemC['value']
                    }
                })
            })
            bodyArr.push(obj)
        })
        this.setState({
            dataSource: bodyArr,
            loading: false
        })
    }

    renderDataTemplateSource(indexId,data){
        this.setState({
            loading: true
        })
        let pointList = data?data:this.state.pointList
        let newArr = this.props.config.groupsTemplate
        let Properties = this.props.config.Properties
        let bodyArr = []  //存储循环出来的dataSource
        let i = 1
        newArr[indexId].children$1List.map((itemA,indexA)=>{
            if(newArr[indexId].childrenTemplate['Prefix'].indexOf('$2') != -1){
                newArr[indexId].children$2List.map((item2,index2)=>{
                    let obj = {}
                    obj['id'] = i++
                    obj['EquipName'] = newArr[indexId].childrenTemplate.EquipName.replace("$1", itemA).replace("$2",item2)
                    Properties.map((itemB,indexB)=>{
                        obj[`${itemB['Point']}Name`] = `${newArr[indexId].childrenTemplate['Prefix'].replace('$2',item2)}${itemB['Point']}${itemA}`
                        pointList.map((itemC,indexC)=>{
                            if(itemC['name'] == `${newArr[indexId].childrenTemplate['Prefix'].replace('$2',item2)}${itemB['Point']}${itemA}`){
                                obj[itemB['Point']] = itemC['value']
                            }
                        })
                    })
                    bodyArr.push(obj)
                })
            }else{
                let obj = {}
                obj['id'] = indexA + 1
                if(newArr[indexId].children$2List && newArr[indexId].children$2List.length > 0){
                    obj['EquipName'] = newArr[indexId].childrenTemplate.EquipName.replace("$2", newArr[indexId].children$2List[indexA])
                }else{
                    obj['EquipName'] = newArr[indexId].childrenTemplate.EquipName.replace("$1", itemA)
                }
                Properties.map((itemB,indexB)=>{
                    obj[`${itemB['Point']}Name`] = `${newArr[indexId].childrenTemplate['Prefix']}${itemB['Point']}${itemA}`
                    pointList.map((itemC,indexC)=>{
                        if(itemC['name'] == `${newArr[indexId].childrenTemplate['Prefix']}${itemB['Point']}${itemA}`){
                            obj[itemB['Point']] = itemC['value']
                        }
                    })
                })
                bodyArr.push(obj)
            }
        })
        this.setState({
            dataSource: bodyArr,
            loading: false
        })
    }

    renderHeader(){
        let columns = [
            {
                title: '编号',
                dataIndex: 'id',
                key: 'id',
                width:100
            }
            ,{
                title: '设备名称',
                dataIndex: 'EquipName',
                key: 'EquipName',
            }
        ]
        let Properties = this.props.config.Properties
        Properties.map((item,index)=>{
            if(item.ElementType && item.ElementType == "enum"){
                columns.push({
                    title:item.title,
                    dataIndex:item.Point,
                    key:item.Point,
                    render:(text,record)=>{
                        for(let i in item.ElementProperty){
                            if(i == text){
                                return <div style={{cursor:'pointer',marginLeft:5}} onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)}>{item.ElementProperty[i]}</div>
                            }
                        }
                        return <div style={{cursor:'pointer',marginLeft:5}} onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)}>未知</div>
                    }
                })
            }else if(item.ElementType && item.ElementType == "edit"){
                if(item.Writable && item.Writable == 1){
                    columns.push({
                        title:item.title,
                        dataIndex:item.Point,
                        key:item.Point,
                        render:(text,record)=>{
                            return <div>
                                <Input style={{width:"50px"}} value={parseInt(text)} disabled />&nbsp;
                                    <Button onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)} onClick={
                                        ()=>{
                                            if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                                let flag = 0
                                                if(localStorage.getItem('projectRightsDefine')!=undefined){
                                                    let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                                    for(let item in pageRights){
                                                        if(item == localStorage.getItem('selectedPageName')){
                                                            if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                                pageRights[item].blockControlUsers.map(item2=>{
                                                                    if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                        flag = 1
                                                                        Modal.info({
                                                                            title: '提示',
                                                                            content: '用户权限不足'
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                }
                                                if(flag == 0){
                                                    this.showSettingValue(record[`${item.Point}Name`],text,record['EquipName'],item.title)
                                                }
                                            }else{
                                                Modal.info({
                                                    title: '提示',
                                                    content: '用户权限不足'
                                                }) 
                                            }
                                        }
                                        } >设定</Button>
                                </div>
                        }
                    })
                }else{
                    columns.push({
                        title:item.title,
                        dataIndex:item.Point,
                        key:item.Point,
                        render:(text,record)=>{
                            return <div>
                                <Input style={{width:"50px"}} value={parseInt(text)} disabled />&nbsp;
                                    <Button onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)} onClick={
                                        ()=>{
                                            message.info('禁止修改设定值')
                                        }} >设定</Button>
                                </div>
                        }
                    })
                }
            }else if(item.ElementType && item.ElementType == "button"){
                if(item.Writable && item.Writable == 1){
                    columns.push({
                        title:item.title,
                        dataIndex:item.Point,
                        key:item.Point,
                        render:(text,record)=>{
                            return <div>
                                <Button type='primary' style={{marginRight:3}} onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)} onClick={()=>{
                                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                        let flag = 0
                                        if(localStorage.getItem('projectRightsDefine')!=undefined){
                                            let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                            for(let item in pageRights){
                                                if(item == localStorage.getItem('selectedPageName')){
                                                    if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                        pageRights[item].blockControlUsers.map(item2=>{
                                                            if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                flag = 1
                                                                Modal.info({
                                                                    title: '提示',
                                                                    content: '用户权限不足'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        if(flag == 0){
                                            this.ButtonChange(record[`${item.Point}Name`],1,record['EquipName'])
                                        }
                                    }else{
                                        Modal.info({
                                            title: '提示',
                                            content: '用户权限不足'
                                        }) 
                                    }
                                    }} disabled={text==1?true:false}>开启</Button>
                                <Button type='primary' onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)} onClick={()=>{
                                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                        let flag = 0
                                        if(localStorage.getItem('projectRightsDefine')!=undefined){
                                            let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                            for(let item in pageRights){
                                                if(item == localStorage.getItem('selectedPageName')){
                                                    if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                        pageRights[item].blockControlUsers.map(item2=>{
                                                            if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                flag = 1
                                                                Modal.info({
                                                                    title: '提示',
                                                                    content: '用户权限不足'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        if(flag == 0){
                                            this.ButtonChange(record[`${item.Point}Name`],0,record['EquipName'])
                                        }
                                    }else{
                                        Modal.info({
                                            title: '提示',
                                            content: '用户权限不足'
                                        }) 
                                    }
                                }} disabled={text==0?true:false}>关闭</Button>
                            </div>
                        }
                    })
                }else{
                    columns.push({
                        title:item.title,
                        dataIndex:item.Point,
                        key:item.Point,
                        render:(text,record)=>{
                            return <div>
                                <Button type='primary' style={{marginRight:3}} onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)} onClick={()=>{message.info('禁止开关设备')}} disabled={text==1?true:false}>开启</Button>
                                <Button type='primary' onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)} onClick={()=>{message.info('禁止开关设备')}} disabled={text==0?true:false}>关闭</Button>
                            </div>
                        }
                    })
                }
            }else{
                columns.push({
                    title:item.title,
                    dataIndex:item.Point,
                    key:item.Point,
                    render:(text,record)=>{
                        if(item.unit && item.unit!=undefined&&item.unit!=''){
                            return <div style={{cursor:'pointer',marginLeft:10}} onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)}>{text}&nbsp;&nbsp;{item.unit}</div>
                        }else{
                            return <div style={{cursor:'pointer',marginLeft:10}} onContextMenu={(e)=>this.onContextMenu(record[`${item.Point}Name`],e)}>{text}</div>
                        }
                    }
                })
            }
        })
        if(this.props.config.EnableDiagnosisControlFeedbackSame && this.props.config.EnableDiagnosisControlFeedbackSame == 1){
            columns.push({
                title:"诊断",
                dataIndex:"Diagnosis",
                key:"Diagnosis",
                width:100,
                render:(text,record)=>{
                    if(record['OnOff'] && record['OnOff'] != null && record['OnOff'] != undefined && record['OnOffSetting'] && record['OnOffSetting'] != null && record['OnOffSetting'] != undefined){
                        if(record['OnOff'] != record['OnOffSetting']){
                            return <Tag color="rgb(255,0,0)">控反不一致</Tag>
                        }
                    }
                }
            })
        }
        this.setState({
            columns: columns
        })
    }

    showSettingValue(pointName,currentValue,equipmentName,title){
        this.setState({
            setValueModalVisible: true,
            pointName: pointName,
            currentValue: currentValue,
            equipmentName: equipmentName,
            title:title
        })
    }

    ButtonChange(pointName,pointValue,equipmentName){
        this.setState({
            SwitchVisiable: true,
            pointName: pointName,
            pointValue: pointValue,
            equipmentName: equipmentName
        })
    }

    ButtonCancel(){
        this.setState({
            SwitchVisiable: false
        })
    }

    setValueCancel(){
        this.setState({
            setValueModalVisible: false
        })
    }

    renderLoading(flag){
        this.setState({
            loading: flag
        })
    }

    //右击文本事件
    onContextMenu = (name,e) => {
        e.preventDefault() 
            // 设置属性是否在弹窗里面
            let  isInfo = {
                "isInModal":false
            }
            //重新定义函数，继承原函数所有的属性和函数        
            let  model = new ModelText()
            model.options = {
                getTendencyModal: this.props.getTendencyModal,
                showCommomAlarm: this.props.showCommomAlarm,
                showMainInterfaceModal:this.props.showMainInterfaceModal,
                getToolPoint:this.props.getToolPoint
            }
        
            let clientWidth = document.documentElement.clientWidth,
            clientHeight = document.documentElement.clientHeight - 32 - 56 - 48;
            let widthScale = 0, heightScale = 0;
            widthScale = clientWidth/1920 
            heightScale = clientHeight/955
            e.offsetX = e.clientX-5,
            e.offsetY = e.clientY-80
            http.post('/analysis/get_point_info_from_s3db',{
                "pointList":[name]
            }).then(
                data=>{
                    if(data.err==0){
                        model.description = data.data[name].description
                        model.idCom = data.data[name].name
                        model.value = data.data[name].value
                        model.sourceType = data.data[name].sourceType
                        model.showModal(e,isInfo,widthScale,heightScale)
                    }else{
                        message.error("数据请求失败")
                    }
                })
    }

    //渲染左侧一列
    renderLeftList(list){
        if(list.length>0){
            let arr = list.map((item,index)=>{
                return (
                    <div title={item.name} style={{background:'none',color:"white",borderBottom:"1px solid #ccc",textAlign:'center',cursor:'pointer',lineHeight:'35px'}} 
                    onClick={(e)=>{this.selectList(item.name,list,index,e)}}   
                    >{item.name}
                    </div>
                )
           })
           return arr
       }
   }
    //筛选对应的列表
    selectList(name,list,index,e){
        this.renderLeftList(list)
        this.setState({
            indexId: index
        })
        let arr = document.getElementById('Select').childNodes
        for(let i=0;i<arr.length;i++){
            arr[i].style.backgroundColor='transparent'
        }
        e.target.style.backgroundColor='#2ea2f8'
        if(this.props.config.groups && this.props.config.groups != undefined){
            this.renderDataSource(index) 
        }else if(this.props.config.groupsTemplate && this.props.config.groupsTemplate != undefined){
            this.renderDataTemplateSource(index)
        }
   }

   defaultBtnList(){
        let Properties = this.props.config.Properties
        let pointList = this.state.pointList
        let groups
        if(this.props.config.groups && this.props.config.groups != undefined){
            groups = this.props.config.groups
        }else if(this.props.config.groupsTemplate && this.props.config.groupsTemplate != undefined){
            groups = this.props.config.groupsTemplate
        }
        return Properties.map((item,index)=>{
            let arr = []
            if(this.props.config.groups && this.props.config.groups != undefined){
                groups[this.state.indexId].children.map((item2,index2)=>{
                    arr.push(`${item2['Prefix']}${item['Point']}${item2['No']}`)
                })
            }else if(this.props.config.groupsTemplate && this.props.config.groupsTemplate != undefined){
                groups[this.state.indexId].children$1List.map((row,index)=>{
                    arr.push(`${groups[this.state.indexId]['childrenTemplate']['Prefix']}${item['Point']}${row}`)
                })
            }
            if(item.ElementType && item.ElementType == 'button' && item.Writable && item.Writable == 1){
                let arrValue = [],onOffFlag = 2
                arr.map(item => {
                    pointList.map(pointItem => {
                        if(item == pointItem.name){
                            arrValue.push(pointItem.value)
                        }
                    })
                })
                arrValue = Array.from(new Set(arrValue))
                if(arrValue.length == 1 && arrValue[0] == "1"){
                    onOffFlag = 1   //不能点击全开按钮
                }else if(arrValue.length == 1 && arrValue[0] == "0"){
                    onOffFlag = 0   //不能点击全关按钮
                }
                return <div style={{display:'inline-block',marginRight:10}}>
                    <Button disabled={onOffFlag!=1?false:true} type='primary' style={{marginRight:3}} onClick={()=>{
                                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                        let flag = 0
                                        if(localStorage.getItem('projectRightsDefine')!=undefined){
                                            let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                            for(let item in pageRights){
                                                if(item == localStorage.getItem('selectedPageName')){
                                                    if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                        pageRights[item].blockControlUsers.map(item2=>{
                                                            if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                flag = 1
                                                                Modal.info({
                                                                    title: '提示',
                                                                    content: '用户权限不足'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        if(flag == 0){
                                            this.ButtonChange(arr,1,`${groups[this.state.indexId]['name']}所有设备`)
                                        }
                                    }else{
                                        Modal.info({
                                            title: '提示',
                                            content: '用户权限不足'
                                        }) 
                                    }
                                }}>{item.title}-全开</Button>
                    <Button disabled={onOffFlag!=0?false:true} type='primary' onClick={()=>{
                                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                        let flag = 0
                                        if(localStorage.getItem('projectRightsDefine')!=undefined){
                                            let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                            for(let item in pageRights){
                                                if(item == localStorage.getItem('selectedPageName')){
                                                    if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                        pageRights[item].blockControlUsers.map(item2=>{
                                                            if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                flag = 1
                                                                Modal.info({
                                                                    title: '提示',
                                                                    content: '用户权限不足'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        if(flag == 0){
                                            this.ButtonChange(arr,0,`${groups[this.state.indexId]['name']}所有设备`)
                                        }
                                    }else{
                                        Modal.info({
                                            title: '提示',
                                            content: '用户权限不足'
                                        }) 
                                    }
                                }}>{item.title}-全关</Button>
                </div>
            }else if(item.ElementType && item.ElementType == 'edit' && item.Writable && item.Writable == 1){
                return <div style={{display:'inline-block',marginRight:10}}>
                                    <Button onClick={
                                        ()=>{
                                            if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                                let flag = 0
                                                if(localStorage.getItem('projectRightsDefine')!=undefined){
                                                    let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                                    for(let item in pageRights){
                                                        if(item == localStorage.getItem('selectedPageName')){
                                                            if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                                pageRights[item].blockControlUsers.map(item2=>{
                                                                    if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                        flag = 1
                                                                        Modal.info({
                                                                            title: '提示',
                                                                            content: '用户权限不足'
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                }
                                                if(flag == 0){
                                                    this.showSettingValue(arr,'',`${groups[this.state.indexId]['name']}所有设备`,item.title)
                                                }
                                            }else{
                                                Modal.info({
                                                    title: '提示',
                                                    content: '用户权限不足'
                                                }) 
                                            }
                                        }
                                        } >{item.title}-批量设定</Button>
                                </div>
            }
        })
   }

    extraBtnList(){
        let config = this.props.config
        if(config.toolbarButtonDefine && config.toolbarButtonDefine.customButtons != undefined && config.toolbarButtonDefine.customButtons.length != 0){
            return config.toolbarButtonDefine.customButtons.map((item,index)=>{
                return <div style={{display:'inline-block',marginRight:10}}>
                    <Button onClick={()=>{
                                    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                                        let flag = 0
                                        if(localStorage.getItem('projectRightsDefine')!=undefined){
                                            let pageRights = JSON.parse(localStorage.getItem('projectRightsDefine')).pageRights
                                            for(let item in pageRights){
                                                if(item == localStorage.getItem('selectedPageName')){
                                                    if(pageRights[item].blockControlUsers&&pageRights[item].blockControlUsers[0]!=undefined){
                                                        pageRights[item].blockControlUsers.map(item2=>{
                                                            if(JSON.parse(window.localStorage.getItem('userData')).name == item2){
                                                                flag = 1
                                                                Modal.info({
                                                                    title: '提示',
                                                                    content: '用户权限不足'
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        if(flag == 0){
                                            this.ButtonChange(item.commandPointNameList,item.commandPointValueList,item.name)
                                        }
                                    }else{
                                        Modal.info({
                                            title: '提示',
                                            content: '用户权限不足'
                                        }) 
                                    }
                                }}>{item.name}</Button> 
                </div>
            })
        }
    }

    render() {
        return (
            <div>
                <Layout>
                    <Sider style={{display:this.props.config.groupPaneEnable !=undefined && this.props.config.groupPaneEnable == 0?"none":''}}>
                        <div id="Select">
                            {
                                this.props.config.groups && this.props.config.groups != undefined?
                                this.renderLeftList(this.props.config.groups)
                                :
                                this.renderLeftList(this.props.config.groupsTemplate)
                            }
                        </div>
                    </Sider>
                    <Layout>
                        {
                            this.props.config.toolbarButtonDefine && this.props.config.toolbarButtonDefine.visible != undefined && this.props.config.toolbarButtonDefine.visible == 0?
                            ''
                            :
                            <Header style={{height:"auto"}}>
                                <div>
                                    {this.defaultBtnList()}
                                    {this.extraBtnList()}
                                </div>
                            </Header>
                        }
                        <Content>
                            <Table 
                                dataSource = {this.state.dataSource}
                                columns = {this.state.columns}
                                pagination = {false}
                                loading= {this.state.loading}
                                scroll = {{y:800}}
                            />
                        </Content>
                    </Layout>
                </Layout>
                <CommandWindow   //开关指令窗口
                    SwitchVisiable={this.state.SwitchVisiable}
                    pointValue = {this.state.pointValue}
                    pointName = {this.state.pointName}
                    switchCancel = {this.ButtonCancel}
                    equipmentName = {this.state.equipmentName}
                    renderLoading = {this.renderLoading}
                />
                <OptimizeValueModal
                    setValueModalVisible={this.state.setValueModalVisible}
                    pointName = {this.state.pointName}
                    currentValue = {this.state.currentValue}
                    title = {this.state.title}
                    equipmentName = {this.state.equipmentName}
                    renderLoading = {this.renderLoading}
                    setValueCancel = {this.setValueCancel}
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
class EquipmentControlTableComponent extends Widget {
    
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

export default  EquipmentControlTableComponent


