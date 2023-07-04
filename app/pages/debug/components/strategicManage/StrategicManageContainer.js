import React , { Component } from "react";
import http from '../../../../common/http';
import { Button,Table,Modal } from 'antd';

import StrategicLogModalView from './StrategicLogModalView';
import s from "./StrategicManageContainer.css";

let btnStyle,toggleTableClass,toggleDetailTableClass;
if(localStorage.getItem('serverOmd')=="persagy"){
  btnStyle={
    background:"rgba(255,255,255,1)",
    border:'1px solid rgba(195,198,203,1)',
    color:"rgba(38,38,38,1)",
    borderRadius:'4px',
    fontSize:"14px",
    fontFamily:'MicrosoftYaHei'
  }
  
  toggleTableClass = 'persagy-table-tbody persagy-table-thead persagy-pagination-item persagy-table-placeholder';
  toggleDetailTableClass = 'persagy-detailTable-tbody persagy-detailTable-thead persagy-pagination-item persagy-detailTable-placeholder ';
} 
const threadNameColumns = [
	{
	title: 'threadName',
	dataIndex: 'threadName',
	key: 'threadName',
	width:220,
	render:(text,record,index)=>{
		return (
			<div className = 'threadName' style={{marginLeft:'12px'}}>
				{text}
			</div>
		)
	}
  },
  {
	title: 'onoff',
	dataIndex: 'onoff',
	key: 'onoff',
	width:80,
	render:(text,record,index)=>{
		return (
			<div className = 'onoff' id= 'onoff' style={{marginLeft:'12px',fontSize:12}}>
				{
					text==0?
					<span className={s['off']}>未启用</span>
					:
					<span className={s['on']}>正在运行</span>
				}
			</div>
		)
	}
  }
]  


class TableView extends Component {
	constructor(props) {
		super(props)
		this.state = {
		  
		}

    }

	render(){
		const detailThreadColumns = [
			{
				title: '名称',
				dataIndex: 'DllName',
				key: 'DllName',
				width:150,
				render:(text)=>{
					return (
						< div className= 'detailThread' >
							{text.slice(0,-4)}
						</div>
					)
				}
			},
			{
				title: 'DLL标识名',
				dataIndex: 'unitproperty03',
				key: 'unitproperty03',
				width:150,
				render: (text) => {
					return (
						< div className='detailThread' >
							{text}
						</div>
					)
				}
			},
			{
				title: '导入时间',
				dataIndex: 'importtime',
				key: 'importtime',
				width:90,
				render: (text) => {
					return (
						< div className='detailThread' >
							{text}
						</div>
					)
				}
			},
			{
				title: '作者',
				dataIndex: 'author',
				key: 'author',
				width:60,
				render: (text) => {
					return (
						<div className='detailThread' >
							{text}
						</div>
					)
				}
			},
			{
				title: '版本',
				dataIndex: 'unitproperty01',
				key: 'unitproperty01',
				width:60,
				render: (text) => {
					return (
						< div className='detailThread' >
							{text}
						</div>
					)
				}
			},
			{
				title: '操作',
				dataIndex: 'unitproperty02',
				key: 'unitproperty02',
				width:70,
				render: (record,text) => {
					return(
						< div className='detailThread' >
							<Button style={btnStyle} onClick={()=>this.props.showStrategicLogModal(record.DllName)}>Log查询</Button>
						</div>
					) 
				}
			},
		]  
		return(
			<Table 
				className={toggleDetailTableClass}
				loading = {this.props.loading}
				bordered={false}
				rowKey='detailThread'
				columns={detailThreadColumns}
				dataSource={this.props.dataSource}
				pagination={false}
				scroll={{y:450}}
				onRow={(record,index) => {
					return {
					  onClick: event => {this.props.onRowClick(record,index)}, // 点击行
					};
				}}
			/>
		)
	}
}
class StrategicManageView extends Component {
    constructor(props) {
		super(props)
		this.state = {
		  detailThread: [],
		  threadData: [],
		  strategicLogModalVisible: false,
		  dllName:'',
		  loadingFlag:false,
		  loadingStr:true,
		  dllText:''
		}
		this.handleSelectRow = this.handleSelectRow.bind(this)
		this.showStrategicLogModal = this.showStrategicLogModal.bind(this)
		this.onClickRow = this.onClickRow.bind(this)

    }

	componentDidMount() {
		http.get('/strategy/getThreadDetailList').then(
            res => {
				this.setState({
					threadData:res.data,
					loadingStr:false
				})
            }
		).catch(err=>{
			this.setState({
				loadingStr:false
			})
		})
	}  
 
    showStrategicLogModal=(dllName)=>{
		this.setState({ 
			strategicLogModalVisible : true,
			dllName:dllName 
		})
	}
	
	hideModal=() => {
		this.setState({ 
			strategicLogModalVisible : false
		})
    }

	handleSelectRow(record,index) {
		this.setState({
		  dllName: '',
		  loadingFlag:true
		})
		let threadName = this.state.threadData[index].threadName
        http.post('/strategy/fromThreadNameGetStrategyList', {
            threadName: threadName
          }).then(
            res => {
				this.setState({
				  detailThread: res.data,
				  loadingFlag:false,
				  dllText: res.data[0].unitproperty02
				})
					let detailThreads = document.getElementsByClassName('detailThread')
					for(let i=0;i<6;i++){
						detailThreads[i].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
						detailThreads[i].parentNode.style.color = '#0491FF';
					}
			})
		let threadNames = document.getElementsByClassName('threadName');
		let onoffs = document.getElementsByClassName('onoff');
		for (let i = 0; i < threadNames.length; i++) {
		  threadNames[i].parentNode.style.backgroundColor = '';
		  threadNames[i].parentNode.style.color = '';
		  onoffs[i].parentNode.style.backgroundColor = '';
		  onoffs[i].parentNode.style.color = '';
		}
		threadNames[index].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
		threadNames[index].parentNode.style.color = '#0491FF';
		onoffs[index].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
		onoffs[index].parentNode.style.color = '#0491FF';
		let detailThreads = document.getElementsByClassName('detailThread');
		for (let i = 0; i < detailThreads.length; i++) {
		  detailThreads[i].parentNode.style.backgroundColor = '';
		  detailThreads[i].parentNode.style.color = '';
		}
	}


	onClickRow(record,index) {
		this.setState({
		  dllName: this.state.detailThread[index].DllName,
		  dllText: record.unitproperty02
		})
		var detailThreads = document.getElementsByClassName('detailThread');
		for (let i = 0; i < detailThreads.length; i++) {
		  detailThreads[i].parentNode.style.backgroundColor = '';
		  detailThreads[i].parentNode.style.color = '';
		}
		//tr -> td -> div
		detailThreads[6*index].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
		detailThreads[6*index+1].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
		detailThreads[6*index+2].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
		detailThreads[6*index+3].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
		detailThreads[6*index+4].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
		detailThreads[6*index+5].parentNode.style.backgroundColor = 'rgba(255,255,255,0.2)';
		detailThreads[6*index].parentNode.style.color = '#0491FF';
		detailThreads[6*index+1].parentNode.style.color = '#0491FF';
		detailThreads[6*index+2].parentNode.style.color = '#0491FF';
		detailThreads[6*index+3].parentNode.style.color = '#0491FF';
		detailThreads[6*index+4].parentNode.style.color = '#0491FF';
		detailThreads[6*index+5].parentNode.style.color = '#0491FF';
	}
	
	render() {
		if(document.getElementById('dllText')){
			document.getElementById('dllText').innerHTML = this.state.dllText
		}
        return (
			<div className={s['container']}>
				<div className={s['header']}>
					<div>
						{/* <Button style={btnStyle} disabled>导入配置从另一db</Button>
						<Button style={btnStyle} disabled>新建自定义策略</Button>
						<Button style={btnStyle} disabled>删除策略</Button>
						<Button style={btnStyle} disabled>配置</Button>
						<Button style={btnStyle} disabled>改名</Button> */}
						
						{/* <Button style={btnStyle} disabled>从选中复制新建</Button>
						<Button style={btnStyle} disabled>历史补测</Button> */}
					</div>
				</div>
				<div className={s['tableLeft']}>
					<Table 	
						loading = {this.state.loadingStr}
						className={toggleTableClass}
						showHeader={false}
						columns={threadNameColumns}
						dataSource={this.state.threadData} 
						rowKey='threadName'
						pagination={false}
						scroll={{ y:930 }}
						onRow={(record,index) => {
							return {
							  onClick: event => {this.handleSelectRow(record,index)}, // 点击行
							};
						}}
					/>
				</div>
				<div className={s['tableRight']}>
					<TableView 
						loading = {this.state.loadingFlag}
						dataSource={this.state.detailThread}
						onRowClick={this.onClickRow}
						showStrategicLogModal = {this.showStrategicLogModal}
					/>
					{
						this.state.dllText?
						<div style={{padding:20,maxHeight:500,overflowY:'auto'}}>
							<h1>策略详细描述</h1>
							<div id="dllText">
							</div>
						</div>
						:
						''
					}
				</div>
				<StrategicLogModalView
					dllName={this.state.dllName}
					visible = {this.state.strategicLogModalVisible}
					hideModal={this.hideModal}
				/>
			</div>
        )
    }
}


export default StrategicManageView
