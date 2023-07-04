import React from 'react';
import {Table, Button, DatePicker, Select, Modal} from 'antd';
import s from './LogView.css'
import moment from 'moment'
import http from '../../../../common/http'
import { downloadUrl } from '../../../../common/utils'

const { Option } = Select;
const { RangePicker } = DatePicker
const dateFormat = 'YYYY-MM-DD';
let BtnStyle,toggleCalendarClass;
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
        marginLeft:'20px'
    }
} 
const TIME_FORMAT='YYYY-MM-DD HH:mm:ss'
/**
 * 表格组件
 * 
 * @class LogDataTable
 * @extends {React.PureComponent}
 */
// class LogDataTable extends React.PureComponent {
    
//     componentDidMount() {
//     this.props.reloadTable()
//     }

//     render() {
//     const {
//         rowKey,
//         data,
//         pagination,
//         onPaginationChange,
//         loading,
//         reloadTable,
//         onSelectChange,
//         selectedIds
//     } = this.props

//     return (
//         <Table
//         columns={[
//         {
//             title: '编号',
//             dataIndex: 'no',
//             key: 'no',
//             width: 60,
//             className:s['no']
//         }, {
//             title: '时间',
//             dataIndex: 'time',
//             key: 'time',
//             width: 200
//         }, {
//             title: '日志信息',
//             dataIndex: 'loginfo',
//             key: 'loginfo',
//         }]}
//         className={toggleTableClass}
//         bordered={false}
//         dataSource={data}
//         rowKey={rowKey}
//         pagination={pagination}
//         scroll={{
//         y: 500
//         }}
//         loading={loading}
//         onChange={onPaginationChange}
//         rowClassName={(record, index) => {
//         if (index %= 2) 
//             return s['even-row']
//         }}
//         // rowSelection={{
//         //     selectedRowKeys: selectedIds,
//         //     onChange: onSelectChange
//         // }}
//         ></Table>
//     )
//     }
// };


// /**
//  * 日志界面
//  * 
//  * @class LogView
//  * @extends {React.Component}
//  */
// class LogView extends React.Component{
//     constructor(props){
//         super(props)

//         this.searchList = this.searchList.bind(this);
//         this.getChangeTime = this.getChangeTime.bind(this)
//         this.exportLog = this.exportLog.bind(this)
//         this.getToday = this.getToday.bind(this)
//         this.refreshData = this.refreshData.bind(this)
//     }

//     componentDidMount(){
//     }

//     // 根据日志信息查询
//     searchList(e){
//         let keyWordList = e.split(' ')
//         this.props.searchList(keyWordList)
//     }


//     // 时间发生改变
//     getChangeTime(timeArr){
//         let timeFrom = moment(timeArr[0]).format(TIME_FORMAT)
//         let timeTo = moment(timeArr[1]).format(TIME_FORMAT)
//         let logTimeRange = {
//             timeFrom : timeFrom,
//             timeTo : timeTo
//         }
//         // window.localStorage.logTimeRange =
//         this.props.getTimeRange(logTimeRange)
//     }
//     //导出日志
//     exportLog(){
//         let keyWordList = this.props.keyWordList
//         let logTimeRange = JSON.parse(window.localStorage.logTimeRange)
//         http.post('/log/download',{
//             "keyWordList": keyWordList,
//             "timeFrom": logTimeRange.timeFrom,
//             "timeTo": logTimeRange.timeTo
//         }).then(
//             data=>{
//                 if( data.msg === 'success'){
//                     downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/${data.filePath}`)
//                 }else{
//                     message.error(data.msg,2.5)
//                 }
//             }
//         )
//     }

//     //获取今天的时间
//     getToday(){
//         let logTimeRange = {
//             timeFrom : moment().startOf('day').format(TIME_FORMAT),
//             timeTo : moment().format(TIME_FORMAT),
//         }
//         this.props.getTimeRange(logTimeRange)
//     }

//     //刷新数据
//     refreshData(){
//         this.props.reloadTable()
//     }

//     render(){
//         const {
//             rowKey,
//             data,
//             pagination,
//             onPaginationChange,
//             loading,
//             reloadTable,
//             onSelectChange,
//             selectedIds,
//             hideModal,
//             logTimeRange
//         } = this.props
        
//         if(!window.localStorage.logTimeRange){
//             let logTimeRange = {
//                 timeFrom : moment().startOf('day').format(TIME_FORMAT),
//                 timeTo : moment().format(TIME_FORMAT),
//             }
//             window.localStorage.logTimeRange=JSON.stringify(logTimeRange)
//         }
        
//         let win_logTimeRange = JSON.parse(window.localStorage.logTimeRange)

//         return (
//             <div className={s['container']}>
//               <div className={s['header']}>
//                 <div className={toggleCalendarClass} style={{display:'inline-block'}}>
//                     <RangePicker
//                         allowClear={false}
//                         value={[moment(win_logTimeRange.timeFrom),moment(win_logTimeRange.timeTo)]}
//                         showTime={{ format: 'HH:mm:ss' }}
//                         format="YYYY-MM-DD HH:mm:ss"
//                         placeholder={['开始时间', '结束时间']}
//                         style={{
//                             marginLeft: 20
//                         }}
//                         onChange={this.getChangeTime}
//                     />
//                 </div>
//                 <Button 
//                     onClick={this.getToday}
//                     style={BtnStyle}
//                  >今天</Button>
//                  <Button 
//                     onClick={this.refreshData}
//                     style={BtnStyle}
//                  >刷新</Button>
//                  <div style={{display:'inline-block',float:'right'}}>
//                      <Search
//                         className={toggleSearchClass}
//                         style={{
//                             width: 200,
//                             marginRight: 20
//                         }}
//                         placeholder='点名'
//                         onSearch={this.searchList}/>
//                     <Button
//                         onClick={this.exportLog}
//                         style={BtnStyle}
//                     >
//                         导出日志
//                     </Button>
//                  </div>
//               </div>
//               <div className={s['content']} >
//                 <LogDataTable
//                     rowKey={rowKey}
//                     data={data}
//                     pagination={pagination}
//                     onPaginationChange={onPaginationChange}
//                     loading={loading}
//                     reloadTable={reloadTable}
//                     selectedIds={selectedIds}
//                     onSelectChange={onSelectChange}
//                 />
//               </div>
//             </div>
//         )
//     }
// }

// export default LogView

class LogDownLoadTable extends React.Component {
    constructor(props){
        super(props)

    }
    componentDidMount() {
    
    }
    
    render() {
        const { dataSource , loading } = this.props
        const columns = [
            {
              title: '日志生成时间',
              dataIndex: 'time',
              key: 'time',
            },
            {
              title: '日志名称',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: '日志下载',
              dataIndex: 'download',
              key: 'download',
              render:(text)=>{
                return <Button onClick={()=>{
                            let data
                            if(text.indexOf(':')!=-1){
                            let index = text.lastIndexOf('static')
                                data = text.slice(index)
                            }else{
                                data = text
                            } 
                            data = data.replace(/\\/g, '\/')
                            downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/${data}`)     
                        }}
                    >下载</Button>
                }
            },
        ];
        return (
            <Table 
                dataSource={dataSource} 
                columns={columns}
                loading={loading}    
            ></Table>
        )
    }
}
    
class LogView extends React.Component{
    constructor(props){
        super(props)
        this.state={
            selectCourse: 'dompysite',
            dataSource: [],
            loading: false,
            time: moment().format(dateFormat)
        }
        this.handleChange = this.handleChange.bind(this)
        this.ChangeTime = this.ChangeTime.bind(this)
        this.search = this.search.bind(this)
    }

    componentDidMount(){
    }

    handleChange(value){
        this.setState({
            selectCourse: value
        })
    }

    ChangeTime(time){
        this.setState({
            time: moment(time).format(dateFormat)
        })
    }

    search(){
        let Time = this.state.time
        let selectCourse = this.state.selectCourse
        this.setState({
            loading: true,
            dataSource: []
        })
        http.post("/log/getProcessLogInfoOfOneDay",{
            date: Time, 
            process: selectCourse
        }).then(
            res => {
                if(res.err == 0){
                    this.setState({
                        dataSource: [{ time: Time, name: selectCourse+'-log-'+Time, download: res.data , key: 1 }],
                        loading: false
                    })
                }else{
                    this.setState({
                        loading: false
                    })
                    Modal.info({
                        titile:"信息提示",
                        content: res.msg 
                    })
                }
            }
        ).catch(err=>{
            this.setState({
                loading: false
            })
            console.log("日志查询失败")
        })
    }

    render(){            
        return (
            <div className={s['container']}>
                <div className={s['header']}>
                    <div className={toggleCalendarClass} style={{display:'inline-block'}}>
                        <span>进程列表：</span>
                        <Select defaultValue="dompysite" style={{ width: 200,marginRight: 20 }} onChange={this.handleChange}>
                            <Option value="domhost">domhost</Option>
                            <Option value="dompysite">dompysite</Option>
                            <Option value="domUpload">domUpload</Option>
                            <Option value="domcore">domcore</Option>
                            <Option value="domlogic">domlogic</Option>
                            <Option value="domCloudSync">domCloudSync</Option>
                            <Option value="domBackupMysql">domBackupMysql</Option>
                            <Option value="domSiemenseTCPCore">domSiemenseTCPCore</Option>
                            <Option value="domMoxaTelnetCore">domMoxaTelnetCore</Option>
                            <Option value="domLogixCore">domLogixCore</Option>
                            <Option value="domModbusClientCore">domModbusClientCore</Option>
                            <Option value="domModbusServer">domModbusServer</Option>
                            <Option value="domSoundCenter">domSoundCenter</Option>
                            <Option value="domOPCUACore">domOPCUACore</Option>
                            <Option value="domPersagyDataClientCore">domPersagyDataClientCore</Option>
                        </Select>
                        <span>日期选择：</span>
                        <DatePicker 
                            format={dateFormat} 
                            onChange={this.ChangeTime} 
                            defaultValue={moment()}
                            style={{width:120}}
                        />
                    </div>
                    <Button style={BtnStyle} onClick={this.search}>查询日志</Button>
                </div>
                <div className={s['content']} >
                    <LogDownLoadTable 
                        dataSource={this.state.dataSource} 
                        loading={this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default LogView