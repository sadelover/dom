import React from 'react';
import {Table, Button} from 'antd';
import s from './DataImportManageView.css'
import http from '../../../../common/http'

/**
 * 数据导入管理界面
 * 
 * @class DataImportManage
 * @extends {React.Component}
 */
class DataImportManageView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data:[],
            loading:false
        }
        this.getAllDataProgress = this.getAllDataProgress.bind(this)
        this.getDataProgress = this.getDataProgress.bind(this)
        this.reload = this.reload.bind(this)
    }

    componentDidMount(){
        this.getAllDataProgress()
    }

    getAllDataProgress(){
        this.setState({
            loading:true
        })
        let data = []
        let i = 0
        http.get('/redis/get/import_history_data_progress'
        ).then(
            res=>{
                if(res.err==0){
                    for(let index in res.data){
                        let str = {}
                        str.no = ++i
                        str.name = index
                        str.startTime = res.data[index].startTime
                        str.total = res.data[index].dataTotalCount
                        str.progress = res.data[index].endTime&&new Date(res.data[index].endTime).getTime()>new Date(res.data[index].startTime).getTime()?'已完成':''
                        str.endTime = res.data[index].endTime?res.data[index].endTime:''
                        if(str.startTime&&str.startTime!=undefined&&str.startTime!=''){
                            data.push(str)
                        }
                    }
                    for(let i=0;i<data.length-1;i++){
                        for(let j=0;j<data.length-1-i;j++){
                            if(new Date(data[j].startTime).getTime()<new Date(data[j+1].startTime).getTime()){
                                let flag = data[j]
                                data[j] = data[j+1]
                                data[j+1] = flag
                            }
                        }
                    }
                    this.setState({
                        data:data
                    })
                    this.getDataProgress(data)
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

    getDataProgress(data){
        for(let i=0;i<data.length;i++){
            if(data[i].endTime==''||new Date(data[i].endTime).getTime()<new Date(data[i].startTime).getTime()){
                http.get(`/redis/get/import_history_data_progress_${data[i].name}`).then(
                    res=>{
                        if(res.err==0){
                            if(res.data&&res.data.successCount){
                                data[i].progress = (res.data.successCount/data[i].total*100).toFixed(1)+'%'
                            }else{
                                data[i].progress = '已完成'
                            }
                            this.setState({
                                data:data
                            })
                        }
                    }
                )
            }
        }
        this.setState({
            loading:false
        })
    }

    reload(){
        this.getAllDataProgress()
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
              dataIndex: 'total',
              width:50,
              key: 'total',
              render:(text)=>{
                return <div style={{marginLeft:10}}>{text}</div>
            }
            },
            {
                title: '当前进度',
                dataIndex: 'progress',
                width:60,
                key: 'progress',
                render:(text)=>{
                    return <div style={{marginLeft:12}}>{text}</div>
                }
            },
            {
                title: '完成导入时间',
                dataIndex: 'endTime',
                width:100,
                key: 'endTime',
            },
            {
                title: '用时',
                dataIndex: 'doTime',
                width:70,
                key: 'doTime',
                render:(text, record)=>{
                    let endTime = new Date(record.endTime).getTime()
                    let startTime = new Date(record.startTime).getTime()
                    let doTime
                    if(record.endTime!=''&&endTime>startTime){
                        doTime = ((endTime - startTime)/1000/60).toFixed(2) + '分钟'
                        return doTime
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

export default DataImportManageView