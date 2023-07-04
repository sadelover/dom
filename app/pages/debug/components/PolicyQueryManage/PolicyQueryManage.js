import React from 'react';
import {Table, Button, Input ,Modal,DatePicker} from 'antd';
import s from './PolicyQuery.css'
import {Debug_modalTypes} from '../../../../common/enum'
import moment from 'moment'
import http from '../../../../common/http'
import { downloadUrl } from '../../../../common/utils'
import PointModalView from '../pointWatch/PointModalView'

const Search = Input.Search
const { RangePicker } = DatePicker
let BtnStyle,toggleTableClass,toggleSearchClass,toggleCalendarClass;
if(localStorage.getItem('serverOmd')=="best"){
    BtnStyle={
        background:"#E1E1E1",
        boxShadow:"2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
        border:0,
        color:"#000",
        fontSize:"12px",
        marginLeft:"20px"
    }
}else if(localStorage.getItem('serverOmd')=="persagy"){
    BtnStyle={
        background:"rgba(255,255,255,1)",
        border:'1px solid rgba(195,198,203,1)',
        color:"rgba(38,38,38,1)",
        borderRadius:'4px',
        fontSize:"14px",
        fontFamily:'MicrosoftYaHei'
    }
    BtnStyle ={
        background:"rgba(255,255,255,1)",
        color:"#0091FF",
        border:'none',
        fontSize:'14px',
        fontFamily:'MicrosoftYaHei',
        lineHeight:'22px',
        marginTop:'6px'
    }
    toggleTableClass = 'persagy-table-tbody persagy-table-thead persagy-pagination-item persagy-table-placeholder';
    toggleSearchClass = "persagy-dataManage-input";
    toggleCalendarClass = 'persagy-log-calendar-picker'
}else{
    BtnStyle = {
        top:'-1px',
        marginRight:'10px'
    }
}
const TIME_FORMAT='YYYY-MM-DD HH:mm:ss'
const TIME_FORMAT_START='YYYY-MM-DD 00:00:00'
/**
 * 表格组件
 * 
 * @class LogDataTable
 * @extends {React.PureComponent}
 */
class LogDataTable extends React.PureComponent {
    
    componentDidMount() {
  
    }

    render() {
    const {
        rowKey,
        data,
        pagination,
        onPaginationChange,
        loading,
        onSelectChange,
        selectedIds
    } = this.props

    return (
        <Table
        columns={[
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width: 300
        }, {
            title: '策略名称',
            dataIndex: 'logicName',
            key: 'logicName',
            width: 300
        }, {
            title: '点名',
            dataIndex: 'pointName',
            key: 'pointName',
            width: 300
        }, {
            title: '点值',
            dataIndex: 'value',
            key: 'value'
        }
    ]}
        className={toggleTableClass}
        bordered={false}
        dataSource={data}
        rowKey={rowKey}
        pagination={pagination}
        scroll={{
        y: 600
        }}
        loading={loading}
        onChange={onPaginationChange}
        rowClassName={(record, index) => {
        if (index %= 2) 
            return s['even-row']
        }}
        // rowSelection={{
        //     selectedRowKeys: selectedIds,
        //     onChange: onSelectChange
        // }}
        ></Table>
    )
    }
};


/**
 * 日志界面
 * 
 * @class PolicyQueryManage
 * @extends {React.Component}
 */
class PolicyQueryManage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            pointModalVisible: false,
            PointValue : ''
        }
        this.searchList = this.searchList.bind(this);
        this.getChangeTime = this.getChangeTime.bind(this)
        this.getToday = this.getToday.bind(this)
        this.getWeek = this.getWeek.bind(this)
        this.showPointModal = this.showPointModal.bind(this);
        this.hidePointModal = this.hidePointModal.bind(this);
        this.addWatchPoints = this.addWatchPoints.bind(this);
    }

    componentDidMount(){
    }

    // 查询策略指令记录
    searchList(e){
        let keyWordList = e.trim()
        // console.log(keyWordList)
        this.props.searchList(keyWordList)
    }

    // 时间发生改变
    getChangeTime(timeArr){
        let timeFrom = moment(timeArr[0]).format(TIME_FORMAT)
        let timeTo = moment(timeArr[1]).format(TIME_FORMAT)
        let days = moment(timeArr[1]).diff(moment(timeArr[0]),'days',true);
        if(days>7){
            Modal.error({
                title: '错误提示',
                content: "至多选择七天，请重新选择时间段！"
            })
            return
        }
        let logTimeRange = {
            timeFrom : timeFrom,
            timeTo : timeTo
        }
        // window.localStorage.logTimeRange =
        this.props.getTimeRange(logTimeRange)
    }

    //获取今天的时间
    getToday(){
        let logTimeRange = {
            timeFrom : moment().startOf('day').format(TIME_FORMAT),
            timeTo : moment().endOf('day').format(TIME_FORMAT),
        }
        this.props.getTimeRange(logTimeRange)
    }
    //获取本周的时间
    getWeek(){
        let logTimeRange = {
            timeFrom : moment().subtract(6, 'day').format(TIME_FORMAT_START),
            timeTo : moment().endOf('day').format(TIME_FORMAT),
        }
        this.props.getTimeRange(logTimeRange)
    }
    showPointModal = () => {
        this.setState({pointModalVisible : true})
    }

    hidePointModal = () => {
        this.setState({pointModalVisible : false})
    }
    //选择的点
    addWatchPoints = (willAddPoints) => {
        const {selectedRowKeys,dataSource,activeContent} = this.state
        const {updateLocalStorage,panes,activeKey} = this.props
        this.setState({
            PointValue:willAddPoints[0]
        })
    }

    change(e){
        this.setState({
            PointValue:e.target.value
        })
    }
    render(){
        const {
            rowKey,
            data,
            pagination,
            onPaginationChange,
            loading,
            onSelectChange,
            selectedIds,
            hideModal,
            logTimeRange
        } = this.props
        
        if(!window.localStorage.logTimeRange){
            let logTimeRange = {
                timeFrom : moment().startOf('day').format(TIME_FORMAT),
                timeTo : moment().format(TIME_FORMAT),
            }
            window.localStorage.logTimeRange=JSON.stringify(logTimeRange)
        }
        
        let win_logTimeRange = JSON.parse(window.localStorage.logTimeRange)

        return (
            <div className={s['container']}>
              <div className={s['header']}>
                <div className={toggleCalendarClass} style={{display:'inline-block'}}>
                    <RangePicker
                        allowClear={false}
                        value={[moment(win_logTimeRange.timeFrom),moment(win_logTimeRange.timeTo)]}
                        showTime={{ format: 'HH:mm:ss' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder={['开始时间', '结束时间']}
                        style={{
                            marginLeft: 20
                        }}
                        onChange={this.getChangeTime}
                    />
                </div>
                <Button 
                    onClick={this.getToday}
                    style={BtnStyle}
                 >今天</Button>
                 <Button 
                    onClick={this.getWeek}
                    style={BtnStyle}
                 >近一周</Button>
                 <div style={{display:'inline-block',float:'right'}}>
                     <Search
                        className={toggleSearchClass}
                        style={{
                            width: 300,
                            marginRight: 20
                        }}
                        placeholder='点名'
                        onChange = {(event)=>{this.change(event)}}
                        value = {this.state.PointValue}
                        onSearch={this.searchList}/>
                    <Button 
                        onClick={this.showPointModal}
                        style={BtnStyle}
                    >选点</Button>
                 </div>
              </div>
              <div className={s['content']} >
                <LogDataTable
                    rowKey={rowKey}
                    data={data}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    loading={loading}
                    selectedIds={selectedIds}
                    onSelectChange={onSelectChange}
                />
              </div>
              <PointModalView
                    hideModal={this.hidePointModal}
                    visible = {this.state.pointModalVisible}
                    onOk={this.addWatchPoints}
                />
            </div>
        )
    }
}

export default PolicyQueryManage