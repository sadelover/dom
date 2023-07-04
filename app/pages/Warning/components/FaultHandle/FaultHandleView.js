import React from 'react';
import { Table, Input, Button, DatePicker, Select, Modal, Form, Steps, Spin, message, Tooltip, Icon, Upload } from 'antd';
import s from './FaultHandleView.css'
import http from '../../../../common/http'
import moment from 'moment';
import { indexOf } from 'lodash';
import Editor from './FaultEditor'
import SearchEditor from './FaultSearchEditor';
import { downloadUrl } from '../../../../common/utils';
import RcViewer from '@hanyk/rc-viewer'
import appConfig from '../../../../common/appConfig';
import PictureManage from './PictureManagement';

const Step = Steps.Step;
const { TextArea } = Input;
const { RangePicker} = DatePicker;
const Option = Select.Option;
const confirm = Modal.confirm;
const FormItem = Form.Item
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

class FormWorkOder extends React.Component{
    constructor(props){
        super(props)
        this.state={
            SelectWorker:'',
            estimatedTime:'',
            content:'',
        }
        this.changeContent = this.changeContent.bind(this)
    }

    //更改处理人
    handleChange = (name) => {
        this.setState({
            SelectWorker: name
        })
    }

    changeContent(e){
        this.setState({
            content:e.target.value
        })
    }

    changeEstimatedTime = (value) =>{
        let Time = moment(value).format(TIME_FORMAT)
        this.setState({
            estimatedTime: Time,
        })
    }

    handleOk = () => {
        const _this = this;
        _this.props.onCancel()
        let processor = this.state.SelectWorker
        let estimatedTime = this.state.estimatedTime
        let content = this.state.content
        this.props.form.validateFields((err, values) => {
            if (!err) {
                http.post('/fdd/addMaintainanceFault',{
                    name: values['workOderName'],  
                    detail: content, 
                    creator: this.props.userName,
                    processor: processor,
                    estimatedTime: estimatedTime,
                }).then(
                    res=>{
                        if(res.err&&res.err == 1){
                            Modal.warning({
                                title:res.msg
                            })
                        }else{
                            _this.setState({
                                SelectWorker:'',
                                estimatedTime:'',
                                content: '',
                            })
                            _this.props.todayTime()
                        }
                    }
                ).catch(
                    err=>{
                        _this.setState({
                            SelectWorker:'',
                            estimatedTime:'',
                            content: ''
                        })
                    }
                )
            }else{
                this.setState({
                    SelectWorker:'',
                    estimatedTime:'',
                    content: ''
                })
            }
        })
    }

    render () {
        const {form}  =this.props
        const {getFieldDecorator} = form
        return (
            <div>
            <Modal
                title = "创建工单"
                visible = {this.props.visible}
                onCancel = {()=>{
                    this.setState({
                        SelectWorker:'',
                        estimatedTime:'',
                        content: '',
                    })
                    this.props.onCancel()
                }}
                width={650}
                maskClosable = {false}
                footer = {[ 
                    <Button key="submit" type="primary" onClick={this.handleOk}>
                        提交工单
                    </Button>
                ]}
            >  
            <Form>
                <FormItem label="工单名称">
                    {getFieldDecorator('workOderName', {
                        initialValue: "",
                        rules: [{required : true,message:'请填写工单名称' }]
                    })(<Input />)}
                </FormItem>
                <FormItem label="工单详情">
                    {getFieldDecorator('workOderDetail', {
                        initialValue: ""
                    })(<TextArea 
                        content = {this.state.content}
                        onChange = {this.changeContent}
                    />)}
                </FormItem>
                <FormItem label="选择处理人">
                    {getFieldDecorator('processor', {
                        initialValue: ""
                    })( 
                        <Select onChange={this.handleChange}>
                            {this.props.getWorkerOptions()}
                        </Select> )}
                </FormItem>
                <FormItem label="预计完成时间">
                    {getFieldDecorator('estimatedTime', {
                        initialValue: ""
                    })(
                        <DatePicker 
                            showTime 
                            onChange={this.changeEstimatedTime} 
                            placeholder="请选择预计完成时间" 
                            format={TIME_FORMAT}
                            disabledDate={this.props.disabledDate}
                        />
                    )}
                </FormItem>
            </Form>  
            </Modal> 
            </div>
            
        )
        
    }
}
const FormWorkOderWrap = Form.create({
    mapPropsToFields : function(props){
        return {
        
        }
    }
})(FormWorkOder)

class FormModifyWorkOder extends React.Component{
    constructor(props){
        super(props)
        this.state={
            content: '',
            key:''
        }
    }

    componentWillReceiveProps(nextProps,nextState){
        if(nextProps.selectFaultInfo.detail!==this.props.selectFaultInfo.detail){
            this.setState({
                content:nextProps.selectFaultInfo.detail
            })   
        }
      }

    changeContent = (e) => {
        this.setState({
            content:e.target.value 
        }) 
    }

    handleOk = () => {
        const _this = this;
        _this.props.onCancel()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                http.post("/fdd/edit",{
                    "orderId": _this.props.selectFaultInfo.id,  
                    "userName": _this.props.userName,
                    "processor": values.processor,
                    "name": values.workOderName, 
                    "detail": this.state.content, // 如果要修改工单详情则传入，否则不用传入
                    "estimatedTime": values.estimatedTime==""?"":moment(values.estimatedTime).format(TIME_FORMAT)// 如果要修改工单预计完成时间则传入，否则不用传入
                }).then(res=>{
                    if(res.err&&res.err == 1){
                        Modal.warning({
                            title:res.msg
                        })
                    }
                    _this.props.search()
                }).catch(err=>{

                })
            }
        })
    }

    render () {
        const {form}  =this.props
        const {getFieldDecorator} = form
        return (
            <Modal
                title = "修改工单"
                visible = {this.props.visible}
                onCancel = {()=>{
                    this.setState({
                        SelectWorker:'',
                        estimatedTime:'',
                        key: Math.random()
                    })
                    this.props.onCancel()
                }}
                key={this.state.key}
                width={650}
                maskClosable = {false}
                footer = {[ 
                    <Button key="submit" type="primary" onClick={this.handleOk}>
                        提交修改
                    </Button>
                ]}
            >  
            <Form>
                <FormItem label="工单名称">
                    {getFieldDecorator('workOderName', {
                        rules: [{required : true,message:'请填写工单名称' }]
                    })(<Input />)}
                </FormItem>
                <FormItem label="工单详情">
                    {getFieldDecorator('workOderDetail', {
                        initialValue: ""
                    })(<TextArea
                        content = {this.state.content}
                        onChange = {this.changeContent}
                    />)}
                </FormItem>
                <FormItem label="选择处理人">
                    {getFieldDecorator('processor', {
                    })( 
                        <Select>
                            {this.props.getWorkerOptions()}
                        </Select> )}
                </FormItem>
                <FormItem label="预计完成时间">
                    {getFieldDecorator('estimatedTime', {
                    })(
                        <DatePicker 
                            showTime 
                            onChange={this.changeEstimatedTime} 
                            placeholder="请选择预计完成时间" 
                            format={TIME_FORMAT}
                            disabledDate={this.props.disabledDate}
                        />
                    )}
                </FormItem>
            </Form>  
            </Modal> 
        )
        
    }
}
const FormModifyWorkOderWrap = Form.create({
    mapPropsToFields : function(props){
        return {
            workOderName:Form.createFormField({
                value:props.selectFaultInfo.name
            }),
            workOderDetail:Form.createFormField({
                value:props.selectFaultInfo.detail
            }),
            processor:Form.createFormField({
                value:props.selectFaultInfo.status == "待分派"||props.selectFaultInfo.status == "待确认"?"":props.selectFaultInfo.owner
            }),
            estimatedTime:Form.createFormField({
                value:props.selectFaultInfo.estimatedTime == "无"?"":moment(props.selectFaultInfo.estimatedTime)
            })
        }
    }
})(FormModifyWorkOder)


/*
故障处理
*/
class FaultHandleView extends React.Component{
    constructor(props){
        super(props)
        this.state={
            media:[],
            FaulType:[],
            position:[],
            worker:[],
            TableData:[],
            view:[],
            category: [],  
            medium: [],  
            position2:[],
            status:[],
            StartTime:moment().startOf('day').format(TIME_FORMAT),
            EndTime:moment().endOf('day').format(TIME_FORMAT),
            loading:false,
            fenPaiVisible:false,
            zanTingVisible:false,
            wanChengVisible:false,
            SelectWorker:"",
            SelectStatus:"",
            SelectRecord:"",
            userName:"",
            userName_zh:"",
            estimatedTime:"",
            workOderVisible:false,
            modifyWorkOderVisible:false,
            scheduleVisible:false, //鱼骨条模态框visible
            scheduleNumber:"",//鱼骨条：当前的进度
            stepStyle:true,  //鱼骨条：true代表无暂停，fasle代表有暂停
            stepLoading:false, //鱼骨条loading
            handleInfo:[], //鱼骨条：每个流程的时间和操作人员
            selectFaultInfo:{}, //存储被选中的故障信息
            Summp: ''
        }

        this.mediaSelection = this.mediaSelection.bind(this)
        this.typeSelection = this.typeSelection.bind(this)
        this.positionSelection = this.positionSelection.bind(this)
        this.changeTime = this.changeTime.bind(this)
        this.todayTime = this.todayTime.bind(this)
        this.weekTime = this.weekTime.bind(this)
        this.oneMonthTime = this.oneMonthTime.bind(this)
        this.monthTime = this.monthTime.bind(this)
        this.search = this.search.bind(this)
        this.changeWorkerModal = this.changeWorkerModal.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.allStatusBtnClick = this.allStatusBtnClick.bind(this)
        this.allClick = this.allClick.bind(this)
        this.getWorkerOptions = this.getWorkerOptions.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.changeFaultStatusBtn = this.changeFaultStatusBtn.bind(this)
        this.changeFaultStatus = this.changeFaultStatus.bind(this)
        this.changeEstimatedTime = this.changeEstimatedTime.bind(this)
        this.onlyMine = this.onlyMine.bind(this)
        this.showCreateWorkOder = this.showCreateWorkOder.bind(this)
        this.handleWorkOderCancel = this.handleWorkOderCancel.bind(this)
        this.handleScheduleCancel = this.handleScheduleCancel.bind(this)
        this.saveFormRef = this.saveFormRef.bind(this);
        this.scheduleModal = this.scheduleModal.bind(this)
        this.getHandleInfo = this.getHandleInfo.bind(this)
        this.faultEnable = this.faultEnable.bind(this)
        this.disabledDate = this.disabledDate.bind(this)
        this.faultInfo = this.faultInfo.bind(this)
        this.handleModifyWorkOderCancel = this.handleModifyWorkOderCancel.bind(this)
        this.fddExportInfo = this.fddExportInfo.bind(this)
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
                let selectFaultType = localStorage.getItem('selectFaultType')
                if(selectFaultType&&selectFaultType!=""){
                    if(document.getElementById(selectFaultType)){
                        document.getElementById(selectFaultType).style.backgroundColor = 'rgb(46,162,248)'
                        let view = []
                        view[0] = selectFaultType
                        this.setState({
                            view: view,
                            StartTime: localStorage.getItem('selectStartTime'),
                            EndTime: localStorage.getItem('selectEndTime')
                        })
                        this.search()
                    }
                }else{
                    this.monthTime()
                }
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
            return (<Button className={s['select-btn']} id={item} key={index} onClick={()=>this.btnMediumClick(item)}>{item}</Button>)
        })
    }

    //获取报警位置后台配置
    positionSelection(){
        return this.state.position.map((item,index)=>{
            return (<Button className={s['select-btn']} id={item} key={index} onClick={()=>this.btnPositionClick(item)}>{item}</Button>)
        })
    }

    //获取报警类型后台配置
    typeSelection(){
        return this.state.FaulType.map((item,index)=>{
            return (<Button className={s['select-btn']} id={item} key={index} onClick={()=>this.btnCategoryClick(item)}>{item}</Button>)
        })
    }

    //获取人员列表
    getWorkerOptions(){
        return this.state.worker.map((item,index)=>{
            return <Option key={index} value={item.name_en}>{item.name_en} ({item.name_zh})</Option>
        })
    }

    //报警介质数组选取
    btnMediumClick(name){
        let medium = this.state.medium
        let flag = 0,sign
        for(let i=0;i<medium.length;i++){
            if(name == medium[i]){
                flag = 1
                sign = i
            }
        }
        if(flag == 0){
            medium.push(name)
            document.getElementById(name).style.backgroundColor = 'rgb(46,162,248)'
            if(medium.length == this.state.media.length){
                document.getElementById('Media').style.backgroundColor = 'rgb(46,162,248)'
            }
        }else{
            document.getElementById(name).style.backgroundColor = ''
            medium.splice(sign,1)
            if(medium.length != this.state.media.length){
                document.getElementById('Media').style.backgroundColor = ''
            }
        }
        this.setState({
            medium: medium
        })
    }

    //报警位置数组选取
    btnPositionClick(name){
        let position2 = this.state.position2
        let flag = 0,sign
        for(let i=0;i<position2.length;i++){
            if(name == position2[i]){
                flag = 1
                sign = i
            }
        }
        if(flag == 0){
            position2.push(name)
            document.getElementById(name).style.backgroundColor = 'rgb(46,162,248)'
            if(position2.length == this.state.position.length){
                document.getElementById('Position').style.backgroundColor = 'rgb(46,162,248)'
            }
        }else{
            document.getElementById(name).style.backgroundColor = ''
            position2.splice(sign,1)
            if(position2.length != this.state.position.length){
                document.getElementById('Position').style.backgroundColor = ''
            }
        }
        this.setState({
            position2: position2
        })
    }

    //报警类型数组选取
    btnCategoryClick(name){
        let category = this.state.category
        let flag = 0,sign
        for(let i=0;i<category.length;i++){
            if(name == category[i]){
                flag = 1
                sign = i
            }
        }
        if(flag == 0){
            category.push(name)
            document.getElementById(name).style.backgroundColor = 'rgb(46,162,248)'
            if(category.length == this.state.FaulType.length){
                document.getElementById('Type').style.backgroundColor = 'rgb(46,162,248)'
            }
        }else{
            document.getElementById(name).style.backgroundColor = ''
            category.splice(sign,1)
            if(category.length != this.state.FaulType.length){
                document.getElementById('Type').style.backgroundColor = ''
            }
        }
        this.setState({
            category: category
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
            if(status.length==6){
                document.getElementById("6").style.backgroundColor = 'rgb(46,162,248)'
            }
        }else{
            document.getElementById(id).style.backgroundColor = ''
            status.splice(sign,1)
            if(status.length!=6){
                document.getElementById("6").style.backgroundColor = ''
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
        let EndTime = moment().endOf('day').format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
        this.search(StartTime,EndTime)
    }

    //本周时间选择
    weekTime(){
        let StartTime = moment().startOf('week').format(TIME_FORMAT)
        let EndTime = moment().endOf('day').format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
        this.search(StartTime,EndTime)
    }

    //近一月
    oneMonthTime(){
        let StartTime = moment().subtract(1, 'month').format(TIME_FORMAT)
        let EndTime = moment().endOf('day').format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
        this.search(StartTime,EndTime)
    }

    //本月时间选择
    monthTime(){
        let StartTime = moment().startOf('month').format(TIME_FORMAT)
        let EndTime = moment().endOf('day').format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
        this.search(StartTime,EndTime)
    }

    //仅查询我处理的故障(默认查最近一年的时间)
    onlyMine(){
        let StartTime = moment().subtract(1,'year').format(TIME_FORMAT)
        let EndTime = moment().format(TIME_FORMAT)
        this.setState({
            StartTime:StartTime,
            EndTime:EndTime
        })
        this.search(StartTime,EndTime,"Mine")
    }

    //查询函数
    search(start,end,flag){
        this.setState({
            loading:true,
            selectFaultInfo:{}
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
            category: this.state.category,  // 类型 （如果对类型无筛选要求则无需传入）
            medium: this.state.medium,  // 介质  （如果对介质无筛选要求则无需传入）
            position: this.state.position2,
            status: this.state.status,
            startTime: startTime,
            endTime: endTime,
            userName: this.state.userName
        }).then(
            res=>{
                if(res.err == 0){
                    if(flag == "Mine"){
                        let myData = []
                        res.data.map(item=>{
                            if(item.mine == 1){
                                myData.push(item)
                            }
                        })
                        this.setState({
                            TableData: myData,
                            loading:false
                        }) 
                    }else{
                        this.setState({
                            TableData: res.data,
                            loading:false
                        }) 
                    }
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
                console.log("工单查询接口请求失败！")
            }
        )
    }

    //报警状态全部点击切换样式
    allStatusBtnClick(){
        if(document.getElementById("6").style.backgroundColor!='rgb(46, 162, 248)'){
            document.getElementById("0").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("1").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("2").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("3").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("4").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("5").style.backgroundColor='rgb(46,162,248)'
            document.getElementById("6").style.backgroundColor='rgb(46,162,248)'
            this.setState({
                status:[0,1,2,3,4,5]
            })
        }else{
            document.getElementById("0").style.backgroundColor=''
            document.getElementById("1").style.backgroundColor=''
            document.getElementById("2").style.backgroundColor=''
            document.getElementById("3").style.backgroundColor=''
            document.getElementById("4").style.backgroundColor=''
            document.getElementById("5").style.backgroundColor=''
            document.getElementById("6").style.backgroundColor=''
            this.setState({
                status:[]
            })
        }
    }

    allClick(value){
        let ctx,arr
        if(value == "Position"){
            let position2 = this.state.position2
            ctx = document.getElementById("Position")
            arr = this.state.position
            if(ctx.style.backgroundColor!='rgb(46, 162, 248)'){
                ctx.style.backgroundColor='rgb(46,162,248)'
                arr.map((item,index)=>{
                    if(position2.indexOf(item)==-1){
                        position2.push(item)
                        document.getElementById(item).style.backgroundColor='rgb(46,162,248)'
                    }
                })
            }else{
                ctx.style.backgroundColor=''
                arr.map((item,index)=>{
                    if(position2.indexOf(item)!=-1){
                        for(let i=0;i<position2.length;i++){
                            if(item==position2[i]){
                                position2.splice(i,1)
                                document.getElementById(item).style.backgroundColor=''
                                break
                            }
                        }
                    }
                })
            }
            this.setState({
                position2:position2
            })
        }else if(value == "Type"){
            let category = this.state.category
            ctx = document.getElementById("Type")
            arr = this.state.FaulType
            if(ctx.style.backgroundColor!='rgb(46, 162, 248)'){
                ctx.style.backgroundColor='rgb(46,162,248)'
                arr.map((item,index)=>{
                    if(category.indexOf(item)==-1){
                        category.push(item)
                        document.getElementById(item).style.backgroundColor='rgb(46,162,248)'
                    }
                })
            }else{
                ctx.style.backgroundColor=''
                arr.map((item,index)=>{
                    if(category.indexOf(item)!=-1){
                        for(let i=0;i<category.length;i++){
                            if(item==category[i]){
                                category.splice(i,1)
                                document.getElementById(item).style.backgroundColor=''
                                break
                            }
                        }
                    }
                })
            }
            this.setState({
                category:category
            })
        }else{
            let medium = this.state.medium
            ctx = document.getElementById("Media")
            arr = this.state.media
            if(ctx.style.backgroundColor!='rgb(46, 162, 248)'){
                ctx.style.backgroundColor='rgb(46,162,248)'
                arr.map((item,index)=>{
                    if(medium.indexOf(item)==-1){
                        medium.push(item)
                        document.getElementById(item).style.backgroundColor='rgb(46,162,248)'
                    }
                })
            }else{
                ctx.style.backgroundColor=''
                arr.map((item,index)=>{
                    if(medium.indexOf(item)!=-1){
                        for(let i=0;i<medium.length;i++){
                            if(item==medium[i]){
                                medium.splice(i,1)
                                document.getElementById(item).style.backgroundColor=''
                                break
                            }
                        }
                    }
                })
            }
            this.setState({
                medium:medium
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
    changeWorkerModal(record,text){
        if(document.getElementById("reason")){
            document.getElementById("reason").value = ""
        }
        if(document.getElementById("summp")){
            document.getElementById("summp").value = ""
        }
        this.setState({
            SelectStatus: record.status,
            SelectRecord: record,
        });
        if(text == "fenpai"){
            this.changeEstimatedTime(new Date(new Date().getTime()+24*60*60*1000));
            this.setState({
                fenPaiVisible:true
            });
        }else if(text == "zanting"){
            this.setState({
                zanTingVisible:true
            });
        }else if(text == "wancheng"){
            this.setState({
                wanChengVisible:true
            }); 
        }
    }

    handleCancel(){
        this.setState({
            fenPaiVisible: false,
            zanTingVisible:false,
            wanChengVisible:false,
            Summp: ''
        });
    }

    showCreateWorkOder () {
        this.setState({
            SelectWorker:'',
            estimatedTime:'',
            workOderVisible:true
        })
    }

    handleWorkOderCancel(){
        this.setState({
            workOderVisible: false
        });
    }
    handleModifyWorkOderCancel(){
        this.setState({
            modifyWorkOderVisible: false
        });
    }

    handleScheduleCancel(){
        this.setState({
            scheduleVisible: false
        });
    }

    //点击操作按钮，执行故障状态更改
    changeFaultStatusBtn(record,status,targetStatus){
        this.setState({
            SelectRecord: record,
        });
        if(targetStatus == 5){
            confirm({
                title: '是否要将此工单终止？',
                content: '确认无误后,点击确认即可',
                onOk:()=>{
                    this.changeFaultStatus(targetStatus)
                },
                onCancel() {
                
                },
            })
        }else{
            if(this.state.SelectStatus == "待分派"){
                if(this.state.SelectWorker == ""||this.state.estimatedTime == ""){
                    if(targetStatus == 2 && record.allowSubmit == 1){
                        confirm({
                            title: `是否将工单处理结果提交给管理员审核?`,
                            content: '确认无误后,点击确认即可',
                            onOk:()=>{
                                this.changeFaultStatus(targetStatus)
                            },
                            onCancel() {
                            
                            },
                        });
                    }else if(record.allowAdminSubmit == 1){
                        if(document.getElementById("summp").value == ""){
                            Modal.warning({
                                title:"请先填写提交任务的总结"
                            })
                        }else{
                            confirm({
                                title: `是否将工单直接提交完结?`,
                                content: '确认无误后,点击确认即可',
                                onOk:()=>{
                                    this.changeFaultStatus(3)
                                },
                                onCancel() {
                                
                                },
                            });
                        }
                    }else{
                        Modal.warning({
                            title:"请先选择需要分派任务的工作人员和预计结束处理时间"
                        })
                    }
                }else{
                    confirm({
                        title: `是否将工单任务分派给"${this.state.SelectWorker}"?`,
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
                            title: `是否要将此工单任务暂停?`,
                            content: '确认无误后,点击确认即可',
                            onOk:()=>{
                                this.changeFaultStatus(targetStatus)
                            },
                            onCancel() {
                            
                            },
                        });
                    }
                }else if(targetStatus == 2){
                    if(document.getElementById("summp").value == ""){
                        Modal.warning({
                            title:"请先填写提交任务的总结"
                        })
                    }else{
                        if(record.allowAdminSubmit == 1){
                            confirm({
                                title: `是否将工单直接提交完结?`,
                                content: '确认无误后,点击确认即可',
                                onOk:()=>{
                                    this.changeFaultStatus(3)
                                },
                                onCancel() {
                                
                                },
                            });
                        }else{
                            confirm({
                                title: `是否将工单处理结果提交给管理员审核?`,
                                content: '确认无误后,点击确认即可',
                                onOk:()=>{
                                    this.changeFaultStatus(targetStatus)
                                },
                                onCancel() {
                                
                                },
                            });
                        }
                    }
                }else{
                    confirm({
                        title: '是否要将此工单修改为完结状态？',
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
                            this.search()
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
                            this.search()
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
                        this.search()
                    }
                }
            ).catch(
                err=>{
                    
                }
            )
        }else if(targetStatus == 2){
            let summp = document.getElementById("summp").value
            http.post('/fdd/processFault',{
                userName: this.state.userName,  // 用户名
                targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                orderId: this.state.SelectRecord.id,  // 工单id
                reason: summp,
                opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
            }).then(
                res=>{
                    if(res.err&&res.err == 1){
                        Modal.warning({
                            title:res.msg
                        })
                    }else{
                        this.search()
                    }
                }
            ).catch(
                err=>{
    
                }
            )
        }else{
            if(targetStatus == 3 && this.state.SelectRecord.allowAdminSubmit == 1 && this.state.SelectRecord.status != "待确认"){
                http.post('/fdd/processFault',{
                    userName: this.state.userName,  // 用户名
                    targetStatus: targetStatus, // 目标状态  1-分派（工单在进行中）；2-完成待审核；3-已审核；4-等待，暂停
                    orderId: this.state.SelectRecord.id,  // 工单id
                    reason: document.getElementById("summp").value,
                    opType: 0   // 操作类型 0-修改状态；1-修改预计完成时间
                }).then(
                    res=>{
                        if(res.err&&res.err == 1){
                            Modal.warning({
                                title:res.msg
                            })
                        }else{
                            this.search()
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
                            this.search()
                        }
                    }
                ).catch(
                    err=>{
        
                    }
                )
            }
        }
        this.handleCancel()
    }

    disabledDate(current) {
        // Can not select days before today and today
        return current && current < moment().endOf('day');
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

    faultEnable(orderId,enable){
        confirm({
            title: enable==0?'是否要将此工单暂时冻结？':'是否要将此工单解除冻结？',
            content: '确认无误后,点击确认即可',
            onOk:()=>{
                http.post('/fdd/enableFault',{
                    orderId:orderId,
                    enable:enable,
                    userName:JSON.parse(localStorage.getItem('userInfo')).name
                }).then((res)=>{
                    if(res.err && res.err == 1){
                        Modal.warning({
                            title:res.msg
                        })
                    }else{
                        setTimeout(()=>{
                            this.search()
                        },1000)
                    }
                })
            },
            onCancel() {
            
            },
        }); 
    }

    //存储选中的故障信息
    faultInfo(record){
        this.setState({
            selectFaultInfo:record
        })
    }

    summpChange = (e)=>{
        this.setState({
            Summp: e.target.value
        })
    }

    fddExportInfo(){
        http.post('/fdd/export',{
            category: this.state.category,  
            medium: this.state.medium, 
            position: this.state.position2,
            status: this.state.status,
            startTime: this.state.StartTime,
            endTime: this.state.EndTime,
            userName: this.state.userName
        }).then(
            res => {
                if(res.err == 0){
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${res.data}`)     
                }else{
                    message.warning(res.msg)
                }
            }
        )
    }

    changeFaultInfo = (record) =>{
        this.setState({
            selectFaultInfo: record,
            modifyWorkOderVisible: true
        })
    }

    render(){
        let handleInfo = this.state.handleInfo
        return (
            <div className={s['container']}>
                <div className={s['header']}>
                    {
                        this.state.media&&this.state.media[0]==undefined?
                        ""
                        :
                        <div style={{marginBottom:15,height:30}}>
                            <span>介质选择： </span>
                            <Button className={s['select-btn']} id="Media" onClick={()=>this.allClick("Media")}>全部</Button>
                            {this.mediaSelection()}  
                        </div>
                    }
                    {
                        this.state.FaulType&&this.state.FaulType[0]==undefined?
                        ""
                        :
                        <div style={{marginBottom:15,height:30}}>
                            <span>工单选择： </span>
                            <Button className={s['select-btn']} id="Type" onClick={()=>this.allClick("Type")}>全部</Button>
                            {this.typeSelection()}  
                        </div>
                    }
                    {
                        this.state.position&&this.state.position[0]==undefined?
                        ""
                        :
                        <div style={{marginBottom:15,height:30}}>
                            <span>位置选择： </span>
                            <Button className={s['select-btn']} id="Position" onClick={()=>this.allClick("Position")}>全部</Button>
                            {this.positionSelection()}  
                        </div>
                    }
                    <div style={{marginBottom:15}}>
                        <span>工单状态： </span>
                        <Button className={s['select-btn']} id="6" onClick={this.allStatusBtnClick}>全部</Button>
                        <Button className={s['select-btn']} id="0" onClick={()=>this.btnClick2(0)}>待分派</Button>
                        <Button className={s['select-btn']} id="1" onClick={()=>this.btnClick2(1)}>已分派</Button>
                        <Button className={s['select-btn']} id="2" onClick={()=>this.btnClick2(2)}>已提交</Button>   
                        <Button className={s['select-btn']} id="3" onClick={()=>this.btnClick2(3)}>已审核</Button>  
                        <Button className={s['select-btn']} id="4" onClick={()=>this.btnClick2(4)}>已停止</Button>
                        <Button className={s['select-btn']} id="5" onClick={()=>this.btnClick2(5)}>已终止</Button>    
                    </div>
                    <div>
                        <span>工单时间： </span>
                        <RangePicker
                            allowClear = {false}
                            format = {TIME_FORMAT}
                            showTime = {{ format: 'HH:mm:00' }}
                            placeholder = {['开始时间', '结束时间']}
                            style = {{width:350,marginRight:10}}
                            onChange = {this.changeTime}     
                            value = {[moment(this.state.StartTime),moment(this.state.EndTime)]}
                        />
                        <Button className={s['select-btn']} onClick={this.search}>查询</Button>  
                        <Button className={s['select-btn']} onClick={this.todayTime}>今日</Button>
                        <Button className={s['select-btn']} onClick={this.weekTime}>本周</Button>   
                        <Button className={s['select-btn']} onClick={this.monthTime}>本月</Button>
                        <Button className={s['select-btn']} onClick={this.oneMonthTime}>近一月</Button>
                        <Button className={s['select-btn']} onClick={this.onlyMine}>仅我的</Button>
                        <Button className={s['select-btn']} style={{float:'right'}} onClick={this.fddExportInfo}>导出</Button>
                        <Button className={s['select-btn']} style={{float:'right',backgroundColor:'#3399CC'}} onClick={this.showCreateWorkOder}>创建工单</Button>
                    </div>
                </div>
                <div className={s['table-content']}>
                    <FaultTable 
                        data = {this.state.TableData} 
                        loading = {this.state.loading} 
                        changeFaultInfo = {this.changeFaultInfo}
                        changeWorkerModal = {this.changeWorkerModal}
                        changeFaultStatusBtn = {this.changeFaultStatusBtn}
                        scheduleModal = {this.scheduleModal}
                        faultEnable = {this.faultEnable}
                        worker = {this.state.worker}
                        faultInfo = {this.faultInfo}
                        search= {this.search}
                    />
                </div>
                <Modal
                    title = "分派任务"
                    visible = {this.state.fenPaiVisible}
                    onCancel = {this.handleCancel}
                    style = {{ top: 200 ,width:300}}
                    maskClosable = {false}
                    footer = {null}
                >
                    <div style={{fontSize:16,marginBottom:20}}>
                        <div>
                            <div style={{marginBottom:20}}>
                                选择工单处理人员：
                                <Select style={{ width: 195 }} onChange={this.handleChange}>
                                    {this.getWorkerOptions()}
                                </Select> 
                            </div>
                            <div>
                                选择预计完成时间：
                                <DatePicker 
                                    showTime 
                                    onChange = {this.changeEstimatedTime} 
                                    placeholder = "预计完成时间" 
                                    format = {TIME_FORMAT}
                                    disabledDate = {this.disabledDate}
                                    value = {moment(this.state.estimatedTime)}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{fontSize:16,marginBottom:10}}>
                        当前工单的处理状态：{this.state.SelectStatus}
                        <Button className={s['Handle-Btn']} onClick={()=>this.changeFaultStatusBtn(this.state.SelectRecord,"进行中",1)}>分派</Button>
                    </div>  
                </Modal>
                <Modal
                    title = "提交任务"
                    visible = {this.state.wanChengVisible}
                    onCancel = {this.handleCancel}
                    style = {{ top: 200 ,width:300}}
                    maskClosable = {false}
                    footer = {null}
                >
                    <div style={{fontSize:16,marginBottom:20}}>
                        请输入提交任务的总结：<p></p><TextArea id="summp" placeholder="请输入总结" onChange={this.summpChange} value={this.state.Summp} autoSize={{ minRows: 3, maxRows: 6 }}/>
                    </div>
                    <div style={{fontSize:16,marginBottom:10}}>
                        当前工单的处理状态：{this.state.SelectStatus}
                        <Button className={s['Handle-Btn']} onClick={()=>this.changeFaultStatusBtn(this.state.SelectRecord,"待确认",2)}>提交审核</Button>
                    </div>  
                </Modal>
                <Modal
                    title = "暂停任务"
                    visible = {this.state.zanTingVisible}
                    onCancel = {this.handleCancel}
                    style = {{ top: 200 ,width:300}}
                    maskClosable = {false}
                    footer = {null}
                >
                    <div style={{fontSize:16,marginBottom:20}}>
                       请输入暂停任务的原因：<p></p><TextArea id="reason" placeholder="请输入原因" autoSize={{ minRows: 3, maxRows: 6 }}/>
                    </div>
                    <div style={{fontSize:16,marginBottom:10}}>
                        当前工单的处理状态：{this.state.SelectStatus}
                        <Button className={s['Handle-Btn']} onClick={()=>this.changeFaultStatusBtn(this.state.SelectRecord,"暂停",4)}>暂停</Button> 
                    </div>  
                </Modal> 
                    <FormWorkOderWrap
                        todayTime= {this.todayTime}
                        visible = {this.state.workOderVisible}
                        onCancel = {this.handleWorkOderCancel}
                        getWorkerOptions = {this.getWorkerOptions}
                        handleChange = {this.handleChange}
                        changeEstimatedTime = {this.changeEstimatedTime}
                        disabledDate={this.disabledDate}
                        ref={this.saveFormRef}
                        userName = {this.state.userName}
                    />
                    <FormModifyWorkOderWrap
                        search= {this.search}
                        visible = {this.state.modifyWorkOderVisible}
                        onCancel = {this.handleModifyWorkOderCancel}
                        getWorkerOptions = {this.getWorkerOptions}
                        disabledDate={this.disabledDate}
                        ref={this.saveFormRef}
                        userName = {this.state.userName}
                        selectFaultInfo = {this.state.selectFaultInfo}
                    />
                <Modal
                    title = "工单任务进度"
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
        this.state = {
            record: [],
            picVisible: false
        }
    }

    componentDidMount(){
    }

    onClickRow = (record,index) => {
        this.props.faultInfo(record)
        var faults = document.getElementsByClassName('fault');
        for (let i = 0; i < faults.length; i++) {
            faults[i].parentNode.style.backgroundColor = '';
            faults[i].parentNode.parentNode.firstChild.style.backgroundColor = '';
        }
        faults[index*13].parentNode.parentNode.firstChild.style.backgroundColor = '#3399CC';
        faults[index*13].parentNode.style.backgroundColor = '#3399CC'; 
        faults[index*13+1].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+2].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+3].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+4].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+5].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+6].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+7].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+8].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+9].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+10].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+11].parentNode.style.backgroundColor = '#3399CC';
        faults[index*13+12].parentNode.style.backgroundColor = '#3399CC';
    }

    imgAddOrDelete = (record) => {
        this.setState({
            record : record,
            picVisible: true
        })
    }

    handlePicCancel = () => {
        this.setState({
            picVisible: false
        })
    }

    render(){
        const columns = [
            {
                title: '工单号',
                dataIndex: 'id',
                key: 'id',
                width: 25,
                render:(text)=>{
                    return(
                        <div className='fault' style={{textAlign:'center'}}>{text}</div>
                    )
                }
            }, {
                title: '工单名称',
                dataIndex: 'name',
                key: 'name',
                width: 130,
                ellipsis: true,
                render:(text,record)=>{
                    return(
                        <div className='fault' onClick={()=>{
                            Modal.info({
                                title: '工单信息',
                                width:500,
                                content: (
                                    <RcViewer>
                                        <div style={{userSelect:'text',cursor:'pointer',maxHeight:500,overflowY:'auto'}}>
                                            <div style={{padding:'20px',fontSize:'18px'}}>{record.detail}</div>
                                            {
                                                record.imgList?
                                                record.imgList.map(item=>{
                                                    return <img width={150} height={150} src={`https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/static/images/fdd/${localStorage.getItem('projectName_en')}/${item}`}></img>
                                                })
                                                :
                                                ''
                                            }
                                        </div>
                                    </RcViewer>
                                ),
                                onOk() {},
                              });
                        }} style={{userSelect:'text',cursor:'pointer'}}>{text}</div>
                    )
                }
            }, {
                title: '位置',
                dataIndex: 'position',
                key: 'position',
                width: 40,
                render:(text)=>{
                    return(
                        <div className='fault' style={{userSelect:'text'}}>{text}</div>
                    )
                }
            }, {
                title: '类型',
                dataIndex: 'view',
                key: 'view',
                width: 40,
                render:(text)=>{
                    return(
                        <div className='fault' style={{userSelect:'text'}}>{text}</div>
                    )
                }
            }, {
                title: '等级',
                dataIndex: 'level',
                key: 'level',
                width: 20,
                render:(text)=>{
                    return(
                        <div className='fault' style={{userSelect:'text'}}>{text}</div>
                    )
                }
            }, {
                title: '发生时间',
                dataIndex: 'time',
                key: 'time',
                width: 40,
                render:(text)=>{
                    return(
                        <div className='fault' style={{userSelect:'text'}}>{text}</div>
                    )
                }
            }, {
                title: '分组',
                dataIndex: 'group',
                key: 'group',
                width: 25,
                render:(text)=>{
                    return(
                        <div className='fault' style={{userSelect:'text'}}>{text}</div>
                    )
                }
            }, {
                title: '处理人',
                dataIndex: 'processor',
                key: 'processor',
                width: 28,
                render:(text)=>{
                    return(
                        <div className='fault' style={{userSelect:'text'}}>{text}</div>
                    )
                }
            }, {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 25,
                render:(text,record)=>{
                    return(
                        <span className='fault' style={{cursor:"pointer"}} onClick={()=>this.props.scheduleModal(text,record.id)}>{text}</span>
                    )
                }
            }, {
                title: '操作',
                dataIndex: 'handle',
                key: 'handle',
                width: 30,
                render:(text, record)=>{
                    if(record.enabled == 0){
                        return (
                            <div className='fault'>
                                {
                                    record.allowEnable == 1?
                                    <Tooltip title="解冻工单">
                                        <Icon
                                        type="fire"
                                        style={{
                                            cursor: 'pointer',
                                            marginRight: '8px'
                                        }}
                                        onClick={() => {this.props.faultEnable(record.id,1)}}
                                        ></Icon>
                                    </Tooltip>
                                    :
                                    ''
                                }
                                {
                                    record.allowTerminate == 1?
                                    <Tooltip title="终止工单">
                                        <Icon
                                        type="stop"
                                        style={{
                                            cursor: 'pointer',
                                            marginRight: '8px'
                                        }}
                                        onClick={() => {this.props.changeFaultStatusBtn(record,"终止",5)}}
                                        ></Icon>
                                    </Tooltip>
                                    :
                                    ''
                                }
                                {
                                    record.allowEdit == 1?
                                    <Tooltip title="修改工单">
                                        <Icon
                                        type="edit"
                                        style={{
                                            cursor: 'pointer',
                                            marginRight: '8px'
                                        }}
                                        onClick={() => {this.props.changeFaultInfo(record)}}
                                        ></Icon>
                                    </Tooltip>
                                    :
                                    ''
                                }
                                {
                                    record.allowEdit == 1||record.allowSubmit == 1?
                                    <Tooltip title="图片">
                                        <Icon
                                        type="file-image"
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {this.imgAddOrDelete(record)}}
                                        ></Icon>
                                    </Tooltip>
                                    :
                                    ''
                                }
                            </div>
                            ) 
                    }else{
                        if(record.status == "待分派"){
                            return (  
                                <div className='fault'>
                                    {
                                        record.mine == 1?
                                        <Tooltip title="分派工单">
                                            <Icon
                                            type="user-add"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeWorkerModal(record,"fenpai")}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowSubmit == 1?
                                        <Tooltip title="提交工单">
                                            <Icon
                                            type="issues-close"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeWorkerModal(record,"wancheng")}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowAdminSubmit == 1?
                                        <Tooltip title="提交完结工单">
                                            <Icon
                                            type="check-circle"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeWorkerModal(record,"wancheng")}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEnable == 1?
                                        <Tooltip title="冻结工单">
                                            <Icon
                                            type="warning"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.faultEnable(record.id,0)}}
                                            ></Icon>
                                        </Tooltip>
                                        : 
                                        ''
                                    }
                                    {
                                        record.allowTerminate == 1?
                                        <Tooltip title="终止工单">
                                            <Icon
                                            type="stop"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultStatusBtn(record,"终止",5)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEdit == 1?
                                        <Tooltip title="修改工单">
                                            <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultInfo(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEdit == 1||record.allowSubmit == 1?
                                        <Tooltip title="图片">
                                            <Icon
                                            type="file-image"
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {this.imgAddOrDelete(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    </div>
                            ) 
                        }else if(record.status == "进行中"){
                            return (  
                                <div className='fault'>
                                    {
                                        record.allowSubmit == 1?
                                        <Tooltip title="提交工单">
                                            <Icon
                                            type="issues-close"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeWorkerModal(record,"wancheng")}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        '' 
                                    }
                                    {
                                        record.allowAdminSubmit == 1?
                                        <Tooltip title="提交完结工单">
                                            <Icon
                                            type="check-circle"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeWorkerModal(record,"wancheng")}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        '' 
                                    }
                                    {
                                        record.allowPause == 1?
                                        <Tooltip title="暂停工单">
                                            <Icon
                                            type="pause"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeWorkerModal(record,"zanting")}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEnable == 1?
                                        <Tooltip title="冻结工单">
                                            <Icon
                                            type="warning"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.faultEnable(record.id,0)}}
                                            ></Icon>
                                        </Tooltip>
                                        : 
                                        ''   
                                    }
                                    {
                                        record.allowTerminate == 1?
                                        <Tooltip title="终止工单">
                                            <Icon
                                            type="stop"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultStatusBtn(record,"终止",5)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEdit == 1?
                                        <Tooltip title="修改工单">
                                            <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',  
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultInfo(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEdit == 1||record.allowSubmit == 1?
                                        <Tooltip title="图片">
                                            <Icon 
                                            type="file-image"
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {this.imgAddOrDelete(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                </div>   
                            )  
                        }else if(record.status == "暂停"){
                            return (  
                                <div className='fault'>
                                    {
                                        record.mine == 1?
                                        <Tooltip title="继续工单">
                                            <Icon
                                            type="play-circle"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultStatusBtn(record,"进行中",1)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEnable == 1?
                                        <Tooltip title="冻结工单">
                                            <Icon
                                            type="warning"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.faultEnable(record.id,0)}}
                                            ></Icon>
                                        </Tooltip>
                                        : 
                                        ''   
                                    } 
                                    {
                                        record.allowTerminate == 1?
                                        <Tooltip title="终止工单">
                                            <Icon
                                            type="stop"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultStatusBtn(record,"终止",5)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEdit == 1?
                                        <Tooltip title="修改工单">
                                            <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultInfo(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEdit == 1||record.allowSubmit == 1?
                                        <Tooltip title="图片">
                                            <Icon
                                            type="file-image"
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {this.imgAddOrDelete(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                </div>
                                
                            ) 
                        }else if(record.status == "待确认"){
                            return ( 
                                <div className='fault'>
                                    {
                                        record.mine == 1?
                                        <Tooltip title="完结工单">
                                            <Icon
                                            type="check-circle"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultStatusBtn(record,"已确认",3)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEnable == 1?
                                        <Tooltip title="冻结工单">
                                            <Icon
                                            type="warning"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.faultEnable(record.id,0)}}
                                            ></Icon>
                                        </Tooltip>
                                        : 
                                        ''   
                                    } 
                                    {
                                        record.allowTerminate == 1?
                                        <Tooltip title="终止工单">
                                            <Icon
                                            type="stop"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultStatusBtn(record,"终止",5)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    } 
                                    {
                                        record.allowEdit == 1?
                                        <Tooltip title="修改工单">
                                            <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultInfo(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEdit == 1||record.allowSubmit == 1?
                                        <Tooltip title="图片">
                                            <Icon
                                            type="file-image"
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {this.imgAddOrDelete(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                </div> 
                            ) 
                        }else{
                            return ( 
                                <div className='fault'>
                                    {
                                        record.allowTerminate == 1?
                                        <Tooltip title="终止工单">
                                            <Icon
                                            type="stop"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultStatusBtn(record,"终止",5)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    } 
                                    {
                                        record.allowEdit == 1?
                                        <Tooltip title="修改工单">
                                            <Icon
                                            type="edit"
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => {this.props.changeFaultInfo(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                    {
                                        record.allowEdit == 1||record.allowSubmit == 1?
                                        <Tooltip title="图片">
                                            <Icon
                                            type="file-image"
                                            style={{
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => {this.imgAddOrDelete(record)}}
                                            ></Icon>
                                        </Tooltip>
                                        :
                                        ''
                                    }
                                </div> 
                            ) 
                        }
                    }
                } 
            }, {
                title: '开始处理时间',
                dataIndex: 'startTime',
                key: 'startTime',
                width: 40,
                render:(text)=>{
                    return(
                        <div className='fault' style={{userSelect:'text'}}>{text}</div>
                    )
                }
            }, {
                title: '预计完成时间',
                dataIndex: 'estimatedTime',
                key: 'estimatedTime',
                width: 40,
                render:(text, record)=>{
                    if(record.status == '进行中'){
                        if(new Date() > new Date(text)){
                            return <span className='fault' style={{color:'red'}}>{text}</span>
                        }else{
                            return <span className='fault'>{text}</span>
                        }
                    }else{
                        return <span className='fault'>{text}</span>
                    }
                }
            }, {
                title: '处理时长',
                dataIndex: 'duration',
                key: 'duration',
                width: 40,
                render:(text, record)=>{
                    let handleTime = (new Date(record.estimatedTime) - new Date(record.startTime))/1000/60  //分钟
                    if(text.indexOf('小时') != -1){
                        if(text.slice(0,-2) > (handleTime/60)){
                            return <span className='fault' style={{color:'red'}}>{text}</span>
                        }else{
                            return <span className='fault'>{text}</span>
                        }
                    }else{
                        if(text.slice(0,-2) > handleTime){
                            return <span className='fault' style={{color:'red'}}>{text}</span>
                        }else{
                            return <span className='fault'>{text}</span>
                        }
                    }
                }
            }
        ]

        return (
            <div>
            <Table
                columns={columns}
                dataSource={this.props.data}   
                bordered={true}
                loading={this.props.loading}
                scroll={{ y:750 }}
                pagination={false}
                onRowClick={this.onClickRow}
            >
            </Table>
            <PictureManage
                handleCancel = {this.handlePicCancel}
                visible = {this.state.picVisible}
                record = {this.state.record}
                search= {this.props.search}
            />
            </div>
        )
    }
}

export default FaultHandleView