/**
 * 环境管理模态框
 */
import React, { PropTypes } from 'react';
import { Button, Modal, Layout, Table, Icon, Tooltip, Select, Form, Input } from 'antd';
import s from './EditInputModalView';
import {modalTypes} from '../../../common/enum'
import InputPointModalView from '../containers/InputPointModalContainer';

import http from '../../../common/http';
import { TouchBarPopover } from '@electron/remote';

const { Sider, Content, Header } = Layout;
const Option = Select.Option;
const FormItem = Form.Item;

let str, toggleModalClass, toggleTableClass, btnStyle;

if (localStorage.getItem('serverOmd') == "best") {
	str = 'user-manager-modal-wrap-best'
} else {
	str = 'user-manager-modal-wrap'
}
if (localStorage.getItem('serverOmd') == "persagy") {
	toggleModalClass = 'persagy-userManage-Modal';
	toggleTableClass = 'persagy-userManage-table';
	btnStyle = {
		background: "rgba(255,255,255,1)",
		border: '1px solid rgba(195,198,203,1)',
		color: "rgba(38,38,38,1)",
		borderRadius: '4px',
		fontSize: "12px",
		fontFamily: 'MicrosoftYaHei'
	}
} else {
	toggleModalClass = 'user-modify-modal-wrap';
}

class ValueList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			input: this.props.input || [],
			loading:false
		};

		this.valueTableColumns = [{
			key: 'name',
			dataIndex: 'name',
			title:"点名"
		}, {
			key: 'desc',
			dataIndex: 'desc',
			title:"释义"
		}, {
			key: 'tools',
			dataIndex:"tools",
			title:"操作",
			width: 100,
			render: (text, record, index) => (
				<span style={{ fontSize: '16px' }}>
					<Button
						type='danger'
						onClick={() => {
							
							Modal.confirm({
								title: '确认提示',
								content: `确定要删除 “${record.desc}(${record.name})” 吗？`,
								onOk: () => { this.handleDelete(record)},
								onCancel() { }
							});
							
						}}
					>删除</Button>
				</span>
			)
		}];

		this.showPointModal = this.showPointModal.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.handleHidePointAndGetSelect = this.handleHidePointAndGetSelect.bind(this);

	}
	
	showPointModal=()=>{
		const {showPointModal,onSelectChangeInput} = this.props
		onSelectChangeInput([])
		showPointModal(modalTypes.AI_INPUT_POINT_MODAL)
	}

	handleDelete=(record)=>{
		let config = this.props.config
		let input = this.props.input
		let data = this.props.data
		data.map((item,i)=>{
			item.splice(record['key'],1)
		})
		input.splice(record['key'],1)
		console.log(data)
		config.data = data
		config.input = input
		this.props.saveAIP(this.props.currentKey,config)
		this.props.handleHide()
	}

	handleHidePointAndGetSelect () {
		this.props.hidePointModal();
		let input = this.props.input
		let newPointObj = this.props.selectedPointInput
		if (input.length !=0 && JSON.stringify(input).indexOf(newPointObj.name) != -1) {
			Modal.error({
				title: '错误提示',
				content: "新增点名与已有点名重复，请重新选择！"
			});
		}else {
			Modal.confirm({
				zIndex:1100,
				title: '确认提示',
				content: `确定要添加 “${newPointObj.description}(${newPointObj.name})” 吗？`,
				onOk: () => { 
					let config = this.props.config
					let data = this.props.data
					data.map((item,i)=>{
						item.splice(input.length,0,"")
					})
					input.splice(input.length,0,newPointObj.name)
					console.log(data)
					config.data = data
					config.input = input
					this.props.saveAIP(this.props.currentKey,config);
					this.props.handleHide()
				},
				onCancel() { }
			})
		}
	}

	render() {
		return (
			<Layout className={s['value-list-layout']}>
				<Header className={s['value-list-header']} style={{paddingLeft:20}}>
					<Button
						style={btnStyle}
						onClick={this.showPointModal}
						type='primary'
					>添加环境</Button>
				</Header>
				<Content className={s['table-wrap']}>
					<Table
						className={toggleTableClass}
						loading={this.props.tableLoading}
						bordered={false}
						showHeader={true}
						pagination={false}
						columns={this.valueTableColumns}
						dataSource={this.props.dataSource}
					/>
				</Content>
				<InputPointModalView
					hidePointModal={this.props.hidePointModal}
					handleOk={this.handleHidePointAndGetSelect}
				/>
			</Layout>
		);
	}
}

class EditInputModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			tableLoading: false,
			config: {},
			loading: false,
			dataSource:[]
		};


	}

	componentWillReceiveProps(nextProps) {
		if (!this.props.visible && nextProps.visible) {
			if (nextProps.visible == true ) {
				this.setState({
					tableLoading:true
				},()=>{this.getDataSource(nextProps.config.input);})
			}
		}
	}


	getDataSource=(input)=>{
		let pointList = input
		let allPointList = []
		let dataSource = []
		if (localStorage.getItem('allPointList') != undefined) {
			allPointList = JSON.parse(localStorage.getItem('allPointList'))
		}
		//遍历点注释列表，给每个列名点找到相应注释
		pointList.forEach((item,i) => {
			let description = ""
			try{
				allPointList.forEach((point,j) => {
					//如果点名匹配，则用抛出异常的方法停止循环
					if (item == point.name) {
						description = point.description
						throw new Error("break");
					}else {
						//否则如果已判断到最后还未抛出，则视为无该点名
						if (j == allPointList.length-1) {
							let obj = {}
							obj["name"] = item
							obj["desc"] = "点名不存在"
							obj["key"] = i
							dataSource.push(obj)
						}
					}
				})
			}catch(err) {
				if (err.message == "break") {
					let obj = {}
					obj["name"] = item
					obj["desc"] = description
					obj["key"] = i
					dataSource.push(obj)
				}
			}
		});

		this.setState({
			dataSource:dataSource,
			tableLoading:false
		})
	}

	

	render() {
		const {config} = this.props
		let data = config != undefined && config.data != undefined ? config.data : []
		let input = config != undefined && config.input != undefined ? config.input : []
		const {
			selectedPointInput,
			showPointModal,
			onSelectChangeInput,
			hidePointModal
		}=this.props
		return (
			<div>
				<Modal
					className={toggleModalClass}
					wrapClassName={str}
					title="环境管理"
					width={730}
					visible={this.props.visible}
					onCancel={this.props.handleHide}
					maskClosable={false}
					footer={null}
				> 
					<ValueList
						data={data}
						input={input}
						config={this.props.config}
						visible={this.props.visible}
						dataSource={this.state.dataSource}
						currentKey={this.props.currentKey}
						saveAIP={this.props.saveAIP}
						handleHide={this.props.handleHide}
						selectedPointInput={selectedPointInput}
						showPointModal={showPointModal}
						onSelectChangeInput={onSelectChangeInput}
						hidePointModal={hidePointModal}
					/>
				</Modal>
			</div>

		);
	}
}

export default EditInputModal
