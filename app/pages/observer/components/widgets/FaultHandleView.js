import React, { Component } from 'react'
import Widget from './Widget.js'
import http from '../../../../common/http';
import s from './FaultHandleView.css';
import moment from 'moment'
import {Table, Input,Button,DatePicker,Select,Modal,Form,Steps,Spin} from 'antd';

const Step = Steps.Step;
const { RangePicker} = DatePicker;
const Option = Select.Option;
const confirm = Modal.confirm;
const FormItem = Form.Item
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'FaultHandle',
    name : '故障处理组件',
    description : "生成故障处理组件",
}

class FormWorkOder extends React.Component{

    render () {
        const {form}  =this.props
        const {getFieldDecorator} = form
        return (
            <Form>
                <FormItem label="工单名称">
                    {getFieldDecorator('workOderName', {
                        initialValue: "",
                        rules: [{required : true,message:'请填写工单名称' }]
                    })(<Input />)}
                </FormItem>
                <FormItem label="工单详情">
                    {getFieldDecorator('workOderDetail', {
                        initialValue: "",
                        rules: [{required : true,message:'请填写工单详情' }]
                    })(<Input />)}
                </FormItem>
                <FormItem label="选择处理人">
                    {getFieldDecorator('processor', {
                        initialValue: "",
                        rules: [{required : true,message:'请选择处理人' }]
                    })( 
                        <Select onChange={this.props.handleChange}>
                            {this.props.getWorkerOptions()}
                        </Select> )}
                </FormItem>
                <FormItem label="预计完成时间">
                    {getFieldDecorator('estimatedTime', {
                        initialValue: "",
                        rules: [{required : true,message:'请选择预计完成时间' }]
                    })(
                        <DatePicker 
                            showTime 
                            onChange={this.props.changeEstimatedTime} 
                            placeholder="请选择预计完成时间" 
                            format={TIME_FORMAT}
                            disabledDate={this.props.disabledDate}
                        />
                    )}
                </FormItem>
            </Form>   
        )
        
    }
}
const FormWorkOderWrap = Form.create()(FormWorkOder)

class FormWrap extends React.Component {
    constructor(props){
        super(props)
        this.state={
            media:[],
            FaulType:[],
            position:[],
            worker:[],
            TableData:[],
            view:[],
            status:[],
            StartTime:moment().startOf('day').format(TIME_FORMAT),
            EndTime:moment().format(TIME_FORMAT),
            loading:false,
            visible:false,
            SelectWorker:"",
            SelectStatus:"",
            SelectRecord:"",
            userName:"",
            userName_zh:"",
            estimatedTime:"",
            workOderVisible:false,
            scheduleVisible:false, //鱼骨条模态框visible
            scheduleNumber:"",//鱼骨条：当前的进度
            stepStyle:true,  //鱼骨条：true代表无暂停，fasle代表有暂停
            stepLoading:false, //鱼骨条loading
            handleInfo:[] //鱼骨条：每个流程的时间和操作人员
        }

        this.mediaSelection = this.mediaSelection.bind(this)
        this.typeSelection = this.typeSelection.bind(this)
        this.positionSelection = this.positionSelection.bind(this)
        this.changeTime = this.changeTime.bind(this)
        this.todayTime = this.todayTime.bind(this)
        this.weekTime = this.weekTime.bind(this)
        this.monthTime = this.monthTime.bind(this)
        this.search = this.search.bind(this)
        this.changeWorkerModal = this.changeWorkerModal.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.allStatusBtnClick = this.allStatusBtnClick.bind(this)
        this.allClick = this.allClick.bind(this)
        this.getWorkerOptions = this.getWorkerOptions.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.statusBtn = this.statusBtn.bind(this)
        this.changeFaultStatusBtn = this.changeFaultStatusBtn.bind(this)
        this.changeFaultStatus = this.changeFaultStatus.bind(this)
        this.changeEstimatedTime = this.changeEstimatedTime.bind(this)
        this.onlyMine = this.onlyMine.bind(this)
        this.showCreateWorkOder = this.showCreateWorkOder.bind(this)
        this.handleWorkOderCancel = this.handleWorkOderCancel.bind(this)
        this.handleScheduleCancel = this.handleScheduleCancel.bind(this)
        this.handleOk = this.handleOk.bind(this);
        this.saveFormRef = this.saveFormRef.bind(this);
        this.scheduleModal = this.scheduleModal.bind(this)
        this.getHandleInfo = this.getHandleInfo.bind(this)
    }

    //初始化
    componentDidMount(){
        let media = [],FaulType = [],position = [],userName_zh
        let userName = localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ?
          JSON.parse(localStorage.getItem('userInfo')).name : ''
        this.setState({
            userName: userName
        })
        http.post('/project/getConfig',{
            key:"fdd_auth"
        }).then(data=>{
            if(data.data){
                for(let i in data.data){
                    if(i == userName){
                        for(let j in data.data[i]){
                            if(j == "name_zh"){
                                userName_zh = data.data[i][j]
                            }
                            if(j == "visable"){
                                for(let z in data.data[i][j]){
                                    if(z == "介质"){
                                        media = data.data[i][j][z]
                                    }else if(z == "位置"){
                                        position = data.data[i][j][z]
                                    }else if(z == "类型"){
                                        FaulType = data.data[i][j][z]
                                    }else{
                                        console.log("暂未支持介质、位置、类型之外的配置")
                                    }
                                }
                            }
                        } 
                        this.setState({
                            media: media,
                            FaulType: FaulType,
                            position: position,
                            userName_zh: userName_zh
                        })
                    }   
                    
                }
                //从报警统计页面跳转过来携带的参数，从本地缓存中读取，初始化加载。
                // let selectFaultType = localStorage.getItem('selectFaultType')
                // if(selectFaultType&&selectFaultType!=""){
                //     if(document.getElementById(selectFaultType)){
                //         document.getElementById(selectFaultType).style.backgroundColor = 'rgb(46,162,248)'
                //         let view = []
                //         view[0] = selectFaultType
                //         this.setState({
                //             view: view,
                //             StartTime: localStorage.getItem('selectStartTime'),
                //             EndTime: localStorage.getItem('selectEndTime')
                //         })
                //         this.search()
                //     }
                // }else{
                //     this.monthTime()
                // }
                this.monthTime()
            }
        }).catch(
            err=>{
                console.log("读取后台配置失败")
            }
        )
        //获取手下人员名单
        http.post('/fdd/getGroupMembersOfAdmin',{
            admin: userName
        }).then(data=>{
            if(data.err!=1){
                this.setState({
                    worker: data.data
                })
            }
        }).catch(
            err=>{
                console.log("接口请求失败")
            }
        )
    }

    //获取报警介质后台配置
    mediaSelection(){
        return this.state.media.map((item,index)=>{
            return (<Button style={{marginRight:30}} id={item} key={index} onClick={()=>this.btnClick(item)}>{item}</Button>)
        })
    }

    //获取报警位置后台配置
    positionSelection(){
        return this.state.position.map((item,index)=>{
            return (<Button style={{marginRight:30}} id={item} key={index} onClick={()=>this.btnClick(item)}>{item}</Button>)
        })
    }

    //获取报警类型后台配置
    typeSelection(){
        return this.state.FaulType.map((item,index)=>{
            return (<Button style={{marginRight:30}} id={item} key={index} onClick={()=>this.btnClick(item)}>{item}</Button>)
        })
    }

    //获取人员列表
    getWorkerOptions(){
        return this.state.worker.map((item,index)=>{
            return <Option key={index} value={item.name_en}>{item.name_zh}</Option>
        })
    }

    //报警类型位置介质数组选取
    btnClick(name){
        let view = this.state.view
        let flag = 0,sign,index,index2,index3
        for(let i=0;i<view.length;i++){
            if(name == view[i]){
                flag = 1
                sign = i
            }
        }
        if(flag == 0){
            view.push(name)
            document.getElementById(name).style.backgroundColor = 'rgb(46,162,248)'
        }else{
            document.getElementById(name).style.backgroundColor = ''
            view.splice(sign,1)
        }
        for(let i=0;i<this.state.media.length;i++){
            if(view.indexOf(this.state.media[i])!=-1){
                index = 0
            }else{
                index = 1
                break
            }
        }
        if(index == 1){
            document.getElementById("Media").style.backgroundColor = ''
        }else{
            document.getElementById("Media").style.backgroundColor = 'rgb(46,162,248)'
        }
        for(let i=0;i<this.state.FaulType.length;i++){
            if(view.indexOf(this.state.FaulType[i])!=-1){
                index2 = 0
            }else{
                index2 = 1
                break
            }
        }
        if(index2 == 1){
            document.getElementById("Type").style.backgroundColor = ''
        }else{
            document.getElementById("Type").style.backgroundColor = 'rgb(46,162,248)'
        }
        for(let i=0;i<this.state.position.length;i++){
            if(view.indexOf(this.state.position[i])!=-1){
                index3 = 0
            }else{
                index3 = 1
                break
            }
        }
        if(index3 == 1){
            document.getElementById("Position").style.backgroundColor = ''
        }else{
            document.getElementById("Position").style.backgroundColor = 'rgb(46,162,248)'
        }
        this.setState({
            view: view
        })
    }

    //报警状态数组选取
    btnClick2(id){
        let status = this.state.status
        let flag = 0,sign
        for(let i=0;i<status.length;i++){
            if(id == status[i]){
                flag = 1
                sign = i
            }
        }
        if(flag == 0){
            status.push(id)
            document.getElementById(id).style.backgroundColor = 'rgb(46,162,248)'
            if(status.length==5){
                document.getElementById("5").style.backgroundColor = 'rgb(46,162,248)'
            }
        }else{
            document.getElementById(id).style.backgroundColor = ''
            status.splice(sign,1)
            if(status.length!=5){
                document.getElementById("5").style.backgroundColor = ''
            }
        }
        this.setState({
            status: status
        })
    }

    //时间选择框选择时间范围
    changeTime(value){
        let StartTime = moment(value[0]).format(TIME_FORMAT)
        let EndTime = moment(value[1]).format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
    }

    changeEstimatedTime(value){
        let Time = moment(value).format(TIME_FORMAT)
        this.setState({
            estimatedTime: Time,
        })
    }
    
    //今日时间选择
    todayTime(){
        let StartTime = moment().startOf('day').format(TIME_FORMAT)
        let EndTime = moment().format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
        this.search(StartTime,EndTime)
    }

    //本周时间选择
    weekTime(){
        let StartTime = moment().startOf('week').format(TIME_FORMAT)
        let EndTime = moment().format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
        this.search(StartTime,EndTime)
    }

    //本月时间选择
    monthTime(){
        let StartTime = moment().startOf('month').format(TIME_FORMAT)
        let EndTime = moment().format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
        this.search(StartTime,EndTime)
    }

    //仅查询我处理的故障
    onlyMine(){
        let Data = [],TableData = []
        Data = this.state.TableData.map((item,index)=>{
            if(item.processor == this.state.userName_zh){
                return item
            }
        })
        for(let i=0,j=0;i<Data.length;i++){
            if(Data[i]!=undefined){
                TableData[j++] = Data[i]
            }
        }
        this.setState({
            TableData: TableData
        })
    }

    //查询函数
    search(start,end){
        this.setState({
            loading:true
        })
        let startTime,endTime
        if(start&&end){
            startTime = start
            endTime = end
        }else{
            startTime = this.state.StartTime
            endTime = this.state.EndTime
        }
        http.post('/fdd/query',{
            view: this.state.view,
            status: this.state.status,
            startTime: startTime,
            endTime: endTime,
            userName: this.state.userName
        }).then(
            res=>{
                if(res.err == 0){
                    this.setState({
                        TableData: res.data,
                        loading:false
                    })
                }else{
                    this.setState({
                        loading:false
                    })
                    Modal.warning({
                        title:res.msg
                    })
                }
            }
        ).catch(
            err=>{
                this.setState({
                    loading:false
                })
                console.log("故障查询接口请求失败！")
            }
        )
    }

    //报警状态全部点击切换样式
    allStatusBtnClick(){
        if(document.getElementById("5").style.backgroundColor!='rgb(46, 162, 248)'){
            document.getElementById("0").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("1").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("2").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("3").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("4").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("5").style.backgroundColor='rgb(46,162,248)'
            this.setState({
                status:[0,1,2,3,4]
            })
        }else{
            document.getElementById("0").style.backgroundColor=''
            document.getElementById("1").style.backgroundColor=''
            document.getElementById("2").style.backgroundColor=''
            document.getElementById("3").style.backgroundColor=''
            document.getElementById("4").style.backgroundColor=''
            document.getElementById("5").style.backgroundColor=''
            this.setState({
                status:[]
            })
        }
    }

    allClick(value){
        let view = this.state.view
        let ctx,arr
        if(value == "Position"){
            ctx = document.getElementById("Position")
            arr = this.state.position
        }else if(value == "Type"){
            ctx = document.getElementById("Type")
            arr = this.state.FaulType
        }else{
            ctx = document.getElementById("Media")
            arr = this.state.media
        }
        if(ctx.style.backgroundColor!='rgb(46, 162, 248)'){
            ctx.style.backgroundColor='rgb(46,162,248)'
            arr.map((item,index)=>{
                if(view.indexOf(item)==-1){
                    view.push(item)
                    document.getElementById(item).style.backgroundColor='rgb(46,162,248)'
                }
            })
        }else{
            ctx.style.backgroundColor=''
            arr.map((item,index)=>{
                if(view.indexOf(item)!=-1){
                    for(let i=0;i<view.length;i++){
                        if(item==view[i]){
                            view.splice(i,1)
                            document.getElementById(item).style.backgroundColor=''
                            break
                        }
                    }
                }
            })
        }
    }

    //更改处理人
    handleChange(name) {
        this.setState({
            SelectWorker: name
        })
    }

    //选择处理人模态框
    changeWorkerModal(record){
        if(document.getElementById("reason")){
            document.getElementById("reason").value = ""
        }
        this.setState({
            visible: true,
            SelectWorker: record.processor,
            SelectStatus: record.status,
            SelectRecord: record,
        });
    }

    handleCancel(){
        this.setState({
            visible: false,
        });
    }

    showCreateWorkOder () {
        this.setState({
            workOderVisible:true
        })
    }

    handleWorkOderCancel(){
        this.setState({
            workOderVisible: false
        });
    }

    handleScheduleCancel(){
        this.setState({
            scheduleVisible: false
        });
    }

    //点击操作按钮，执行故障状态更改
    changeFaultStatusBtn(record,status,targetStatus){
        if(this.state.SelectStatus == "待分派"){
            if(this.state.SelectWorker == ""||this.state.estimatedTime == ""){
                Modal.warning({
                    title:"请先选择需要分派任务的工作人员和预计结束处理时间"
                })
            }else{
                confirm({
                    title: `是否将故障任务分派给"${this.state.SelectWorker}"?`,
                    content: '确认无误后,点击确认即可',
                    onOk:()=>{
                        this.changeFaultStatus(targetStatus)
                    },
                    onCancel() {
                    
                    },
                }); 
            }
        }else{
            if(targetStatus == 4){
                if(document.getElementById("reason").value == ""){
                    Modal.warning({
                        title:"请先填写暂停任务的原因"
                    })
                }else{
                    confirm({
                        title: `是否将故障状态由"${record.status}"更改为"${status}"?`,
                        content: '确认无误后,点击确认即可',
                        onOk:()=>{
                            this.changeFaultStatus(targetStatus)
                        },
                        onCancel() {
                        
                        },
                    });
                }
            }else{
                confirm({
                    title: `是否将故障状态由"${record.status}"更改为"${status}"?`,
                    content: '确认无误后,点击确认即可',
                    onOk:()=>{
                        this.changeFaultStatus(targetStatus)
                    },
                    onCancel() {
                    
                    },
                });
            }
            
        }
        
    }

    //处理任务
    changeFaultStatus(targetStatus){
        if(targetStatus == 1){
            if(this.state.SelectStatus == "暂停"){
                http.post('/fdd/processFault',{
                    userName: this.state.userName,  // 用户名
                    targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                    orderId: this.state.SelectRecord.id,  // 工单id
                    opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
                }).then(
                    res=>{
                        if(res.err&&res.err == 1){
                            Modal.warning({
                                title:res.msg
                            })
                        }else{
                            Modal.success({
                                title:res.msg,
                                onOk:()=>{
                                    this.search()
                                }
                            })
                        }
                    }
                ).catch(
                    err=>{
        
                    }
                )
            }else{
                http.post('/fdd/processFault',{
                    userName: this.state.userName,  // 用户名
                    targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                    orderId: this.state.SelectRecord.id,  // 工单id
                    processor: this.state.SelectWorker,  // 处理人 （只在分派任务时传入，其他操作无需传入）
                    estimatedTime: this.state.estimatedTime, // 预计完成时间（只有分派任务和修改预计完成时间时传入）
                    opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
                }).then(
                    res=>{
                        if(res.err&&res.err == 1){
                            Modal.warning({
                                title:res.msg
                            })
                        }else{
                            Modal.success({
                                title:res.msg,
                                onOk:()=>{
                                    this.search()
                                }
                            })
                        }
                    }
                ).catch(
                    err=>{

                    }
                )
            }
            
        }else if(targetStatus == 4){
            let reason = document.getElementById("reason").value
            http.post('/fdd/processFault',{
                userName: this.state.userName,  // 用户名
                targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                orderId: this.state.SelectRecord.id,  // 工单id
                reason: reason,  // 故障修改为等待中时需要传入的原因字段，只在修改为等待中时需要传入
                opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
            }).then(
                res=>{
                    if(res.err&&res.err == 1){
                        Modal.warning({
                            title:res.msg
                        })
                    }else{
                        Modal.success({
                            title:res.msg,
                            onOk:()=>{
                                this.search()
                            }
                        })
                    }
                }
            ).catch(
                err=>{
                    
                }
            )
        }else{
            http.post('/fdd/processFault',{
                userName: this.state.userName,  // 用户名
                targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                orderId: this.state.SelectRecord.id,  // 工单id
                opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
            }).then(
                res=>{
                    if(res.err&&res.err == 1){
                        Modal.warning({
                            title:res.msg
                        })
                    }else{
                        Modal.success({
                            title:res.msg,
                            onOk:()=>{
                                this.search()
                            }
                        })
                    }
                }
            ).catch(
                err=>{
    
                }
            )
        }
        
    }

    statusBtn(){
        let SelectStatus = this.state.SelectStatus
        if(SelectStatus == '待分派'){
            return <Button className={s['Handle-Btn']} onClick={()=>this.changeFaultStatusBtn(this.state.SelectRecord,"进行中",1)}>分派</Button>
        }else if(SelectStatus == '进行中'){
            return  <div style={{display:'inline-block'}}>
                        <Button className={s['Handle-Btn']} onClick={()=>this.changeFaultStatusBtn(this.state.SelectRecord,"待确认",2)}>提交审核</Button>
                        <Button className={s['Handle-Btn']} onClick={()=>this.changeFaultStatusBtn(this.state.SelectRecord,"暂停",4)}>暂停</Button> 
                    </div>   
        }else if(SelectStatus == '待确认'){
            return <Button className={s['Handle-Btn']} onClick={()=>this.changeFaultStatusBtn(this.state.SelectRecord,"已确认",3)}>审核完毕</Button>
        }else if(SelectStatus == '暂停'){
            return <Button className={s['Handle-Btn']} onClick={()=>this.changeFaultStatusBtn(this.state.SelectRecord,"进行中",1)}>继续任务</Button>
        }else{
            return
        }
    }

    disabledDate = (current)=> {
        // Can not select days before today and today
        return current && current.valueOf() < Date.now();
    }

    handleOk () {
        const _this = this;
        let processor = this.state.SelectWorker
        let estimatedTime = this.state.estimatedTime
        this.form.validateFields((err, values) => {
            if (!err) {
                http.post('/fdd/addMaintainanceFault',{
                    name: values['workOderName'],  
                    detail: values['workOderDetail'], 
                    creator: this.state.userName,
                    processor: processor,
                    estimatedTime: estimatedTime  
                }).then(
                    res=>{
                        if(res.err&&res.err == 1){
                            Modal.warning({
                                title:res.msg
                            })
                        }else{
                            Modal.success({
                                title:res.msg,
                                onOk:()=>{
                                    this.search()
                                    this.handleWorkOderCancel()
                                }
                            })
                        }
                    }
                ).catch(
                    err=>{
        
                    }
                )
            }
        })
    }

    saveFormRef(form) {
        this.form = form;
    }
    //鱼骨条    
    scheduleModal(text,id){
        this.setState({
            stepLoading:true,
            scheduleVisible: true
        })
        let stepStyleStatus,scheduleNumber
        http.post('/fdd/flow',{
            orderId: id
        }).then(
            data=>{
                if(data.data.flow[2].status == 4){
                    stepStyleStatus = false
                    if(text == "待分派"){
                        scheduleNumber = 0 
                    }else if(text == "进行中"){
                        scheduleNumber = 1
                    }else if(text == "暂停"){
                        scheduleNumber = 2
                    }else if(text == "待确认"){
                        scheduleNumber = 3
                    }else{
                        scheduleNumber = 4 
                    }
                }else{
                    stepStyleStatus = true
                    if(text == "待分派"){
                        scheduleNumber = 0 
                    }else if(text == "进行中"){
                        scheduleNumber = 1
                    }else if(text == "待确认"){
                        scheduleNumber = 2 
                    }else{
                        scheduleNumber = 3
                    }
                }
                this.setState({
                    stepStyle: stepStyleStatus,
                    scheduleNumber: scheduleNumber,
                    stepLoading: false,
                    handleInfo: data.data.flow
                })
            }
        )
    }

    getHandleInfo(status){
        let handleInfo = this.state.handleInfo
        return handleInfo.map((item)=>{
            if(item.status == status){
                if(item.time){
                    return <div style={{marginBottom:5}}>
                        <div>{item.time}</div>
                        <div>操作人员：{item.name}</div>
                    </div>
                }
            }
        })
    }

    render(){
        let handleInfo = this.state.handleInfo
        return (
            <div className={s['container2']}>
                <div className={s['header']}>
                    {
                        this.state.media==[]?
                        ""
                        :
                        <div style={{marginBottom:20,height:30}}>
                            <span>介质选择： </span>
                            <Button style={{marginRight:30}} id="Media" onClick={()=>this.allClick("Media")}>全部</Button>
                            {this.mediaSelection()}  
                        </div>
                    }
                    {
                        this.state.FaulType==[]?
                        ""
                        :
                        <div style={{marginBottom:20,height:30}}>
                            <span>报警类型： </span>
                            <Button style={{marginRight:30}} id="Type" onClick={()=>this.allClick("Type")}>全部</Button>
                            {this.typeSelection()}  
                        </div>
                    }
                    {
                        this.state.position==[]?
                        ""
                        :
                        <div style={{marginBottom:20,height:30}}>
                            <span>位置选择： </span>
                            <Button style={{marginRight:30}} id="Position" onClick={()=>this.allClick("Position")}>全部</Button>
                            {this.positionSelection()}  
                        </div>
                    }
                    <div style={{marginBottom:20}}>
                        <span>报警状态： </span>
                        <Button style={{marginRight:30}} id="5" onClick={this.allStatusBtnClick}>全部</Button>
                        <Button style={{marginRight:30}} id="0" onClick={()=>this.btnClick2(0)}>待分派</Button>
                        <Button style={{marginRight:30}} id="1" onClick={()=>this.btnClick2(1)}>已分派</Button>
                        <Button style={{marginRight:30}} id="2" onClick={()=>this.btnClick2(2)}>完成待审核</Button>   
                        <Button style={{marginRight:30}} id="3" onClick={()=>this.btnClick2(3)}>已审核</Button>  
                        <Button style={{marginRight:30}} id="4" onClick={()=>this.btnClick2(4)}>中止</Button>  
                    </div>
                    <div style={{marginBottom:20}}>
                        <span>报警时间： </span>
                        <RangePicker
                            allowClear = {false}
                            format = {TIME_FORMAT}
                            showTime = {{ format: 'HH:mm:00' }}
                            placeholder = {['开始时间', '结束时间']}
                            style = {{width:300,marginRight:10}}
                            onChange = {this.changeTime}     
                            value = {[moment(this.state.StartTime),moment(this.state.EndTime)]}
                        />
                        <Button style={{marginRight:30}} onClick={this.search}>查询</Button>  
                        <Button style={{marginRight:30}} onClick={this.todayTime}>今日报警</Button>
                        <Button style={{marginRight:30}} onClick={this.weekTime}>本周报警</Button>   
                        <Button style={{marginRight:30}} onClick={this.monthTime}>本月报警</Button>
                
                    </div>
                    <div>
                        <Button style={{marginRight:30}} onClick={this.onlyMine}>仅我的</Button>
                        <Button style={{marginRight:30}} onClick={this.showCreateWorkOder}>创建工单</Button>
                    </div>
                </div>
                <div className={s['table-content']}>
                    <FaultTable 
                        data = {this.state.TableData} 
                        loading = {this.state.loading} 
                        changeWorkerModal = {this.changeWorkerModal}
                        scheduleModal = {this.scheduleModal}
                        worker = {this.state.worker}
                    />
                </div>
                <Modal
                    title = "选择处理人"
                    visible = {this.state.visible}
                    onCancel = {this.handleCancel}
                    style = {{ top: 200 ,width:300}}
                    maskClosable = {false}
                    footer = {null}
                >
                    <div style={{fontSize:16,marginBottom:20}}>
                        {
                            this.state.SelectStatus == "待分派"?
                                <div>
                                    <div style={{marginBottom:20}}>
                                        选择故障的处理人员：
                                        <Select style={{ width: 80 }} onChange={this.handleChange}>
                                            {this.getWorkerOptions()}
                                        </Select> 
                                    </div>
                                    <div>
                                        选择预计完成时间：
                                        <DatePicker 
                                            showTime 
                                            onChange={this.changeEstimatedTime} 
                                            placeholder="预计完成时间" 
                                            format={TIME_FORMAT}
                                            disabledDate={this.disabledDate}
                                        />
                                    </div>
                                </div>
                            :
                            ""
                        }
                        {
                            this.state.SelectStatus == "进行中"?
                                <div>
                                    在此填写暂停任务的原因：
                                    <Input style={{width:220}} placeholder="在此填写" id="reason"/>
                                </div>
                            :
                            ""
                        }
                    </div>
                    <div style={{fontSize:16,marginBottom:10}}>
                        当前故障的处理状态：{this.state.SelectStatus}
                        {this.statusBtn()}
                    </div>
                    
                </Modal>
                <Modal
                    title = "创建工单"
                    visible = {this.state.workOderVisible}
                    onCancel = {this.handleWorkOderCancel}
                    style = {{ top: 200 ,width:300}}
                    maskClosable = {false}
                    footer = {[ 
                        <Button key="submit" type="primary" onClick={this.handleOk}>
                            提交工单
                        </Button>
                    ]}
                >   
                    <FormWorkOderWrap
                        getWorkerOptions = {this.getWorkerOptions}
                        handleChange = {this.handleChange}
                        changeEstimatedTime = {this.changeEstimatedTime}
                        disabledDate={this.disabledDate}
                        handleOk={this.handleOk}
                        ref={this.saveFormRef}
                    />
                </Modal>
                <Modal
                    title = "故障任务进度"
                    visible = {this.state.scheduleVisible}
                    onCancel = {this.handleScheduleCancel}
                    style = {{ top: 200 }}
                    width = {666}
                    maskClosable = {false}
                    footer = {null}
                >
                    {
                        this.state.stepLoading?
                        <div style={{width: '100%',height: 70,textAlign: 'center',marginTop: '30px'}}>
                            <Spin tip="正在加载进度条..."/>
                        </div>
                        :
                        <div style={{marginBottom:10}}>
                        {
                            this.state.stepStyle?
                            <div>
                                <Steps current={this.state.scheduleNumber}>
                                    <Step title="待分派" description="任务未分派" />
                                    <Step title="进行中" description="任务进行中" />
                                    <Step title="待审核" description="任务已提交,等待审核" />
                                    <Step title="已确认" description="任务已结束" />
                                </Steps>
                                {
                                    handleInfo!=[]&&handleInfo[0]!=undefined?
                                    <div style={{marginTop:5}}>
                                        <div style={{display:'inline-block',width:170}}>{this.getHandleInfo(0)}</div>
                                        <div style={{display:'inline-block',verticalAlign:'top',width:180}}>{this.getHandleInfo(1)}</div>
                                        <div style={{display:'inline-block',verticalAlign:'top',width:170}}>{this.getHandleInfo(2)}</div>
                                        <div style={{display:'inline-block',verticalAlign:'top'}}>{this.getHandleInfo(3)}</div>
                                    </div>
                                    :
                                    ''
                                }       
                            </div>
                            :
                            <div>
                                <Steps current={this.state.scheduleNumber}>
                                    <Step title="待分派" description="任务未分派" />
                                    <Step title="进行中" description="任务进行中" />
                                    <Step title="暂停" description="任务已暂停" /> 
                                    <Step title="待审核" description="任务已提交,等待审核" />
                                    <Step title="已确认" description="任务已结束" />
                                </Steps>
                                {
                                    handleInfo!=[]&&handleInfo[0]!=undefined?
                                    <div style={{marginTop:5}}>
                                        <div style={{display:'inline-block',width:125}}>{this.getHandleInfo(0)}</div>
                                        <div style={{display:'inline-block',verticalAlign:'top',width:130}}>{this.getHandleInfo(1)}</div>
                                        <div style={{display:'inline-block',verticalAlign:'top',width:133}}>{this.getHandleInfo(4)}</div>
                                        <div style={{display:'inline-block',verticalAlign:'top',width:131}}>{this.getHandleInfo(2)}</div>
                                        <div style={{display:'inline-block',verticalAlign:'top'}}>{this.getHandleInfo(3)}</div>
                                    </div>
                                    :
                                    ''
                                }       
                            </div>
                        }
                        </div>
                    }
                    
                </Modal>
            </div>
        )
    }
    
}

class FaultTable extends React.Component{
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }
    
    render(){
        const columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 30,
            }, {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
                width: 70
            }, {
                title: '位置',
                dataIndex: 'position',
                key: 'position',
                width: 70
            }, {
                title: '类型',
                dataIndex: 'view',
                key: 'view',
                width: 80
            }, {
                title: '等级',
                dataIndex: 'level',
                key: 'level',
                width: 40
            }, {
                title: '发生时间',
                dataIndex: 'time',
                key: 'time',
                width: 75
            }, {
                title: '详情',
                dataIndex: 'detail',
                key: 'detail',
                width: 70
            }, {
                title: '分组',
                dataIndex: 'group',
                key: 'group',
                width: 60
            }, {
                title: '部门',
                dataIndex: 'department',
                key: 'department',
                width: 60
            }, {
                title: '处理人',
                dataIndex: 'processor',
                key: 'processor',
                width: 40
            }, {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 40,
                render:(text,record)=>{
                    return(
                        <span style={{cursor:"pointer"}} onClick={()=>this.props.scheduleModal(text,record.id)}>{text}</span>
                    )
                }
            }, {
                title: '操作',
                dataIndex: 'handle',
                key: 'handle',
                width: 55,
                render:(text, record)=>{
                    if(record.status != "已确认"){
                       return (  
                            <Button style={{padding:3,height:20}} onClick={()=>this.props.changeWorkerModal(record)}>操作</Button>
                        ) 
                    }
                } 
            }, {
                title: '开始处理时间',
                dataIndex: 'startTime',
                key: 'startTime',
                width: 75
            }, {
                title: '预计完成时间',
                dataIndex: 'estimatedTime',
                key: 'estimatedTime',
                width: 75
            }, {
                title: '处理时长',
                dataIndex: 'duration',
                key: 'duration',
                width: 50
            }
        ]
        return (
            <Table
                columns={columns}
                dataSource={this.props.data}
                pagination={false}
                bordered={true}
                loading={this.props.loading}
                scroll={{ y: 500 }}
            >
            </Table>
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
class FaultHandleComponent extends Widget {
    
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

export default  FaultHandleComponent



