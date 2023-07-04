import React from 'react';
import { Button ,Modal,Table} from 'antd';
import s from './OmUpdateView.css'
import http from '../../../../common/http'
import appConfig from '../../../../common/appConfig'
import {closeApp} from '../../../../pages/layout/components/LayoutView';
import { downloadUrl } from '../../../../common/utils';
import { retrieveSourceMap } from 'source-map-support';
const shell = require('electron').shell
/**
 * 软件升级界面
 * 
 * @class OmUpdate
 * @extends {React.Component}
 */
class OmUpdateView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
           no:'',
           url:'',
           dataSource: [],
           loading: false,
           status:{}
        }
    }

    componentDidMount(){
        this.getOmsiteVersion()
        this.getDomVersion()
    }

    getOmsiteVersion = () => {
        this.setState({
            url:appConfig.serverUrl+'/static/files/om/omsite-setup.exe'
        })
        http.get('/static/files/om/omsite.txt').then(
            res=>{
                if(res.version){
                    this.setState({
                        no:res.version
                    })
                }
            }
        )
    }

    getDomVersion = () => {
        this.setState({
            loading: true
        })
        http.get('/processVersion').then(
            res => {
                if(res.err == 0){
                    let data = []
                    for(let i in res.data){
                        let tableStr = {}
                        if(i != "cloudVersion" && i != "updateStatus"){
                            tableStr['name'] = i
                            tableStr['version'] = res.data[i] 
                            tableStr['cloudVersion'] = res.data['cloudVersion'][i]
                            tableStr['key'] = i
                            data.push(tableStr)
                        }
                    }
                    data.push(
                        {
                            key:"omsite",
                            version:appConfig.project.version,
                            cloudVersion:res.data['cloudVersion']['omsite'],
                            name:"omsite"
                        }
                    )
                    this.setState({
                        dataSource: data,
                        status:res.data.updateStatus?res.data.updateStatus:{},
                        loading:false
                    })
                }else{
                    this.setState({
                        dataSource: [],
                        loading:false,
                        status:{}
                    })
                }
            }
        ).catch(
            err => {
                this.setState({
                    dataSource: [],
                    loading:false,
                    status:{}
                })
            }
        )
    }

    upload = () =>{
        Modal.confirm({
            title : '是否退出软件（安装新版本需关闭软件）？',
            content : '点击"确定"按钮退出软件。',
            onOk(){
                closeApp()
            },
            onCancel(){
            }
          })
    }

    onlineUpload = () => {
        downloadUrl('https://file.inwhile.com/omsite-setup.exe')
    }

    reload = (name) => {
        Modal.confirm({
            title: `是否要重启${name}?`,
            content: `重启${name}会直接重启现场进程，请谨慎操作！`,
            onOk() {
                if(name == 'domcore'){
                    http.get('/dom/restartDomCore').then(
                        res => {
                            if(res.status == true){
                                Modal.success({
                                    title:'domcore重启成功'
                                })
                            }else{
                                Modal.error({
                                    title:'domcore重启失败'
                                })
                            }
                        }
                    ).catch(
                        err => {
                            Modal.error({
                                title:'domcore重启接口请求失败，请检查后台进程是否正常运行'
                            })
                        }
                    )
                }else if(name == 'domlogic'){
                    http.get('/dom/restartDomLogic').then(
                        res => {
                            if(res.status == true){
                                Modal.success({
                                    title:'domlogic重启成功'
                                })
                            }else{
                                Modal.error({
                                    title:'domlogic重启失败'
                                })
                            }
                        }
                    ).catch(
                        err => {
                            Modal.error({
                                title:'domlogic重启接口请求失败，请检查后台进程是否正常运行'
                            })
                        }
                    )
                }else{
                    http.get(`/dom/restart/${name}`).then(
                        res => {
                            if(res.status == true){
                                Modal.success({
                                    title: `${name}重启成功`
                                })
                            }else{
                                Modal.error({
                                    title:`${name}重启失败`
                                })
                            }
                        }
                    ).catch(
                        err => {
                            Modal.error({
                                title:`${name}重启接口请求失败，请检查后台进程是否正常运行`
                            })
                        }
                    )
                }
            },
            onCancel() {
            },
        })
    }

    update = (name) => {
        Modal.confirm({
            title: `是否要在线升级${name}?`,
            content: `升级${name}会暂时关闭现场进程，待升级成功后将重启启动，请谨慎操作！`,
            onOk() {
                http.get(`/domUpdate/${name}`).then(
                    res => {
                        if(res.err == 0){
                            Modal.success({
                                title: res.msg
                            })
                        }else{
                            Modal.error({
                                title:res.msg
                            })
                        }
                    }
                ).catch(
                    err => {
                        Modal.error({
                            title:`${name}升级接口请求失败，请检查后台进程是否正常运行`
                        })
                    }
                )
            },
            onCancel() {

            }
        })
    }

    render(){
        const { dataSource , loading , no , url, status} = this.state
        const columns = [
            {
                title: '进程名',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '现场当前版本',
                dataIndex: 'version',
                key: 'version',
            },
            {
                title: '云端版本号',
                dataIndex: 'cloudVersion',
                key: 'cloudVersion',
            },
            {
                title: '操作按钮',
                dataIndex: 'control',
                key: 'control',
                render: (text,record) => {
                    return <div>
                        {
                            record['name'] != 'omsite'?
                                record['name'] != 'redis'?
                                <div>
                                    <Button onClick={() => this.update(record['name'])}>在线升级</Button>&nbsp;
                                    <Button onClick={() => this.reload(record['name'])}>重启</Button>
                                </div>
                                :
                                ''
                            :
                            <div>
                                <Button onClick={this.onlineUpload}>在线升级</Button>&nbsp;
                                {
                                    no!='' && no!=appConfig.project.version?
                                    <Button><a href={url} onClick={this.upload} title='适用于没有网络连接的情况'>离线升级</a></Button>
                                    :
                                    ''
                                }
                            </div>
                        }
                    </div>
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (text,record) =>{
                    let flag = ''
                    for(let i in status){
                        if(i == record['name']){
                            flag = status[i]
                        }
                    }
                    return flag == 1 ?'升级中':''
                }
            }
        ];
        return (
            <div className={s['container']}>
                <Button style={{margin:10}} onClick={this.getDomVersion}>刷新</Button>
                <Table 
                    dataSource={dataSource} 
                    loading = {loading} 
                    columns={columns} 
                    pagination = {{
                        defaultPageSize:15
                    }}
                />
            </div>
        )
    }
}

export default OmUpdateView