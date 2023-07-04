import React from 'react';
import {Table, Button} from 'antd';
import s from './ReportProgressView.css'
import http from '../../../../common/http'

/**
 * 报表进度管理界面
 * 
 * @class ReportProgressView
 * @extends {React.Component}
 */
class ReportProgressView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data:[],
            loading:false
        }
        this.getReportProgress = this.getReportProgress.bind(this)
        this.reload = this.reload.bind(this)
    }

    componentDidMount(){
        this.getReportProgress()
    }

    getReportProgress(){
        this.setState({
            loading:true
        })
        http.get('/report/getAllProgress'
        ).then(
            res=>{
                if(res.err==0){
                    res.data.forEach((item,index) => {
                        res.data[index].no = index+1
                    })
                    for(let i=0;i<res.data.length-1;i++){
                        for(let j=0;j<res.data.length-1-i;j++){
                            if(new Date(res.data[j].startTime).getTime()<new Date(res.data[j+1].startTime).getTime()){
                                let flag = res.data[j]
                                res.data[j] = res.data[j+1]
                                res.data[j+1] = flag
                            }
                        }
                    }
                    this.setState({
                        loading:false,
                        data:res.data
                    })
                }else{
                    this.setState({
                        loading:false
                    })
                }
        }).catch(
            err=>{
                this.setState({
                    loading:false
                })  
        })
    }

    reload(){
        this.getReportProgress()
    }

    render(){
        return (
            <div className={s['container']}>
                <Button style={{margin:10}} onClick={this.reload}>刷新</Button>
                <TableView data={this.state.data} loading={this.state.loading}/>
            </div>
        )
    }
}

class TableView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
        }
    }

    componentDidMount(){

    }

    render(){
        const columns = [
            {
                title: '编号',
                dataIndex: 'no',
                width:50,
                key: 'no',
                render:(text)=>{
                    return <div style={{marginLeft:5}}>{text}</div>
                }
            },
            {
                title: '文件名',
                dataIndex: 'name',
                width:100,
                key: 'name',
            },
            {
                title: '开始导入时间',
                dataIndex: 'startTime',
                width:100,
                key: 'startTime',
            },
            {
                title: '数据总量',
                dataIndex: 'totalProgress',
                width:60,
                key: 'totalProgress',
                render:(text)=>{
                    return <div style={{marginLeft:12}}>{text}</div>
                }
            },
            {
                title: '当前进度',
                dataIndex: 'percent',
                width:60,
                key: 'percent',
                render:(text)=>{
                    if(text == 100){
                        return <div style={{marginLeft:12}}>已完成</div>
                    }else{
                        return <div style={{marginLeft:12}}>{text}%</div>
                    }
                }
            },
            {
                title: '完成导入时间',
                dataIndex: 'stopTime',
                width:100,
                key: 'stopTime',
            },
            {
                title: '用时',
                dataIndex: 'doTime',
                width:70,
                key: 'doTime',
                render:(text, record)=>{
                    let stopTime = new Date(record.stopTime).getTime()
                    let startTime = new Date(record.startTime).getTime()
                    let doTime
                    if(record.stopTime!=undefined&&stopTime>startTime){
                        if((stopTime - startTime)/1000/60>60){
                            doTime = ((stopTime - startTime)/1000/60/60).toFixed(2) + '小时'
                            return doTime
                        }else{
                            doTime = ((stopTime - startTime)/1000/60).toFixed(2) + '分钟'
                            return doTime
                        }
                    }else{
                        return ''
                    }
                }
            },
        ];
        return (
            <Table 
                dataSource={this.props.data} 
                columns={columns} 
                pagination={{
                    pageSize: 20,
                }}
                scroll={{
                    y:760
                }}
                loading={this.props.loading}
            />
        )
    }
}

export default ReportProgressView