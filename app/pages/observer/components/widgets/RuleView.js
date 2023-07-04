import React from 'react'
import { Table, Input, Popconfirm,Modal,Button } from 'antd';
import Widget from './Widget.js'
import s from './RuleView.css'
import http from '../../../../common/http';

let outputColor = s['outputColor']
const registerInformation = {
	type: 'rule',
	name: '规则策略组件',
	description: "生成table组件，覆盖canvas对应区域",
}

class RuleViewComponent extends Widget {

	constructor(props) {
		super(props)

		this.state = {
			style: {},
			config: {},
			inputRealValues: []
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
		const { width, height, left, top } = this.props.style;
		this.setState({
			style: {
				width: width,
				height: height,
				left: left,
				top: top
			}
		})
		if (this.props.config != undefined) {
			this.setState({
				config: this.props.config
			})
		}

	}

	componentWillReceiveProps(nextProps) {
		if (this.props.custom_realtime_data != undefined && this.props.custom_realtime_data.length != 0) {
			if (nextProps.custom_realtime_data.length != 0) {
				if (this.state.inputRealValues.length != 0 && this.props.custom_realtime_data.length != nextProps.custom_realtime_data.length) {
					let realList = this.state.inputRealValues
					this.state.inputRealValues.forEach((item, i) => {
						nextProps.custom_realtime_data.forEach((jtem, j) => {
							if (jtem.name == item.name && jtem.value != item.value) {
								realList[i].value = jtem.value

							}
						})
					})
					this.setState({
						inputRealValues: realList
					})
				} else {
					let realList = []
					this.props.config.input.forEach((item, i) => {
						nextProps.custom_realtime_data.forEach((jtem, j) => {
							if (jtem.name == item) {
								realList.push(jtem);
								return;
							}
						})
					})
					this.setState({
						inputRealValues: realList
					})
				}
			}
		}


	}


	getContent() {
		const { style, config } = this.state
		return (
			<div style={style} className={s['table-container']} >
				<EditableTable
					config={config}
					pointConfig={this.props.config.point}
					inputRealValues={this.state.inputRealValues}
				/>
			</div>
		)
	}
}

export default RuleViewComponent

const EditableCell = ({ editable, value, onChange,color }) => (
	<div style={{backgroundColor:color}}>
		{editable
			? <Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
			: value
		}
	</div>
);

class EditableTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			columns: [{
				title: '',
				dataIndex: 'name',
				width: '5%'
			}],
			config: {},
			configInput: [],
			configOutput: [],
			pointData: {},
			dataSource: [],
			tableLoading: false
		};

		this.getHeaderInput = this.getHeaderInput.bind(this);
		this.getHeaderOutput = this.getHeaderOutput.bind(this);
		this.getDataSource = this.getDataSource.bind(this);
		this.getColor = this.getColor.bind(this);
		this.saveData = this.saveData.bind(this);

	}

	componentDidMount() {
		this.setState({
			config: this.props.config
		})
	}

	componentWillReceiveProps(nextProps) {
		if (JSON.stringify(this.state.config) !== JSON.stringify(nextProps.config) && this.props.config != {}) {
			if (nextProps.config.input != undefined && nextProps.config.input.length != 0 && JSON.stringify(this.state.configInput) !== JSON.stringify(nextProps.config.input) ||
				nextProps.config.output != undefined && nextProps.config.output.length != 0 && JSON.stringify(this.state.configOutput) !== JSON.stringify(nextProps.config.output)) {
				this.getHeaderInput(nextProps.config.input, nextProps.config.output, nextProps.config.point)
			}

			this.setState({
				config: nextProps.config,
				configInput: nextProps.config.input,
				configOutput: nextProps.config.output
			})

		}
		if (JSON.stringify(this.props.inputRealValues) != JSON.stringify(nextProps.inputRealValues)) {
			return true
		}

	}


	getColor(record, column) {
		var inputRealValues = this.props.inputRealValues
		for (var i=0;i<inputRealValues.length;i++) {
			var json = inputRealValues[i]
			if (column == json.name) {
				var text = String(record[column])
				var subscript = text.lastIndexOf("~")
				var minValue = Number(text.substring(0, subscript))
				var maxValue = Number(text.substring(subscript + 1, text.length))
				if (minValue != undefined && maxValue != undefined && Number(json.value) != undefined) {
					
					return (	(minValue <= Number(json.value)) && (Number(json.value) <= maxValue) ? 'green' : '#666')
					
				}
			}
		}
		
	}

	getDataSource(point, headerJson) {
		http.post('/get_realtimedata', {
			proj: 1,
			pointList: [point],
			scriptList: []
		}).then(
			data => {
				if (data.length != 0) {
					try {
						let pointData = (JSON.parse(data[0].value))
						let dataSource = []
						pointData.data.forEach((item, i) => {
							let obj = {
								key: i.toString(),
								name: `规则 ${i+1}`
							}
							item.forEach((str, j) => {
								let num = j + 1
								obj[headerJson[num].dataIndex] = str
							})
							dataSource.push(obj)

						})
						console.log(dataSource)
						this.setState({
							dataSource: dataSource,
							pointData: pointData,
							tableLoading: false
						})
					} catch (e) {
						console.log(e)
						this.setState({
							tableLoading: false
						});
					}

				} else {
					this.setState({
						tableLoading: false
					});
				}
			}
		)
	}

	getHeaderInput(inputArr, outputArr, point) {
		let headerList = inputArr
		let headerListCN = []
		let allPointList = []
		if (localStorage.getItem('allPointList') != undefined) {
			allPointList = JSON.parse(localStorage.getItem('allPointList'))
		}
		//遍历点注释列表，给每个列名点找到相应注释
		headerList.forEach(item => {
			allPointList.forEach(point => {
				if (item == point.name) {
					headerListCN.push(point.description)
				}
			})
		});
		console.log(headerListCN)

		let headerInput = []
		headerList.forEach((header, i) => {
			headerInput.push({
				title: headerListCN[i] + "(" + header + ")",
				dataIndex: header,
				render: (text, record) => this.renderColumns(text, record, header)
			})
		})
		headerInput = this.state.columns.concat(headerInput)
		this.getHeaderOutput(inputArr, outputArr, headerInput, point)
	}

	getHeaderOutput(inputArr, outputArr, headerInput, point) {
		let headerList = outputArr
		let headerListCN = []
		let allPointList = []
		if (localStorage.getItem('allPointList') != undefined) {
			allPointList = JSON.parse(localStorage.getItem('allPointList'))
		}
		//遍历点注释列表，给每个列名点找到相应注释
		headerList.forEach(item => {
			allPointList.forEach(point => {
				if (item == point.name) {
					headerListCN.push(point.description)
				}
			})
		});
		console.log(headerListCN)

		let headerOperation = [
			{
				title: '操作',
				dataIndex: 'operation',
				render: (text, record) => {
					const { editable } = record;
					return (
						<div className={s['editable-row-operations']}>
							{
								editable ?
									<span>
										<a onClick={() => this.save(record.key,record)}>保存</a>
										<Popconfirm title="确定取消吗?" onConfirm={() => this.cancel(record.key)}>
											<a>取消</a>
										</Popconfirm>
										<Popconfirm title="确定删除吗?" onConfirm={() => this.delete(record.key)}>
											<a>删除</a>
										</Popconfirm>
									</span>
									: <a onClick={() => this.edit(record.key)}>编辑</a>
							}
						</div>
					);
				},
			}
		]
		let headerOutput = []
		headerList.forEach((header, i) => {
			headerOutput.push({
				title: headerListCN[i] + "(" + header + ")",
				dataIndex: header,
				render: (text, record) => this.renderColumns(text, record, header)
			})
		})
		//最后的操作列跟output列合并
		headerOutput = headerOutput.concat(headerOperation)

		let headerJson = headerInput.concat(headerOutput)
		this.setState({
			columns: headerJson
		})

		if (point != undefined) {
			this.setState({
				tableLoading: true
			});
			this.getDataSource(point, headerJson)
		}
	}


	renderColumns(text, record, column) {
		return (
			<EditableCell
				editable={record.editable}
				value={text}
				color={this.getColor(record,column)}
				onChange={value => this.handleChange(value, record.key, column)}
			/>
		);
	}
	handleChange(value, key, column) {
		const newData = [...this.state.dataSource];
		const target = newData.filter(item => key === item.key)[0];
		if (target) {
			target[column] = value;
			this.setState({ dataSource: newData });
		}
	}
	edit(key) {
		const newData = [...this.state.dataSource];
		const target = newData.filter(item => key === item.key)[0];
		if (target) {
			target.editable = true;
			this.setState({ dataSource: newData });
		}
	}
	saveData(key,record) {
		const oldData = [...this.state.dataSource];
		const newData = [...this.state.dataSource];
		const index = newData.findIndex(item => key === item.key);
		if (index > -1) {
			//写入state，用于改完立即显示
			const item = newData[index];
			newData.splice(index, 1, {
				...item,
				...record,
			});
			//将修改内容保存后台
			let editData = this.state.pointData
			let list = this.state.pointData.input.concat(this.state.pointData.output)
			for (var i = 0; i < list.length; i++) {
				editData.data[index][i] = record[list[i]]
			}
			console.log(editData)
			http.post('/pointData/setValue', {
				valueList: [JSON.stringify(editData)],
				pointList: [this.props.pointConfig],
				source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
			}).then(
				serverData => {
					if (serverData.err === 0) {
							this.setState({ dataSource: newData,tableLoading:false });
							// delete target.editable;
							// this.cacheData = newData.map(item => ({ ...item }));

					} else if (serverData.err > 0) {
						Modal.error({
							title:'错误提示',
							content:serverData.msg
						 });
							this.setState({dataSource:oldData, tableLoading:false });
							// delete target.editable;
							// this.cacheData = newData.map(item => ({ ...item }));
					}
				}
			).catch(
				err=>{
					this.setState({dataSource:oldData, tableLoading:false });
					Modal.error({
						title:'错误提示',
						content:"保存失败"
					});
				}
			)
		} else {
				// newData.push(record);
				this.setState({dataSource:oldData,tableLoading:false});
				Modal.error({
					title:'错误提示',
					content:"保存失败"
				});
		}
	}

	save(key,record) {
		this.setState({
			tableLoading:true
		})
		const newData = [...this.state.dataSource];
		const target = newData.filter(item => key === item.key)[0];
		if (target) {
		  delete target.editable;
		}
		this.saveData(key,record);
	}

	cancel(key) {
		const newData = [...this.state.dataSource];
		const target = newData.filter(item => key === item.key)[0];
		if (target) {
			delete target.editable;
			this.setState({ dataSource: newData });
		}
	}
	delete = (key) => {
		this.setState ({
			tableLoading:true
		})
		let timeHandle = null;
		const dataSource = [...this.state.dataSource];
		let newData = dataSource.filter(item => item.key !== key) 
		let pointData = this.state.pointData;
		let dataArr = pointData.data.filter(
			(value,index,arr) => index !== Number(key));
		console.log(dataArr)
		pointData.data = dataArr
		http.post('/pointData/setValue', {
			valueList: [JSON.stringify(pointData)],
			pointList: [this.props.pointConfig],
			source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
		}).then(
			serverData => {
				if (serverData.err === 0) {
						if (timeHandle) {
							clearTimeout(timeHandle);
						}
						timeHandle = setTimeout(()=>{
							this.getDataSource(this.state.config.point,this.state.columns)
						},1500)
				} else if (serverData.err > 0) {
					Modal.error({
						title:'错误提示',
						content:serverData.msg
					 });
					this.setState({tableLoading:false });
					if (timeHandle) {
						clearTimeout(timeHandle);
					}
				}
			}
		).catch(
			err=>{
				this.setState({tableLoading:false });
				Modal.error({
					title:'错误提示',
					content:"删除失败"
				});
				if (timeHandle) {
					clearTimeout(timeHandle);
				}
			}
		)
	}
	handleAdd = () => {
		let timeHandle = null;
		let pointData = this.state.pointData;
		pointData.data.push([]);
		console.log(pointData.data)
		this.setState({ tableLoading:true });
		http.post('/pointData/setValue', {
			valueList: [JSON.stringify(pointData)],
			pointList: [this.props.pointConfig],
			source: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).name ? JSON.parse(localStorage.getItem('userInfo')).name : ''
		}).then(
			serverData => {
				if (serverData.err === 0) {
					if (timeHandle) {
						clearTimeout(timeHandle);
					}
					timeHandle = setTimeout(()=>{
						this.getDataSource(this.state.config.point,this.state.columns)
					},1500)
				} else if (serverData.err > 0) {
					Modal.error({
						title:'错误提示',
						content:serverData.msg
					 });
					this.setState({ tableLoading:false });
					if (timeHandle) {
						clearTimeout(timeHandle);
					}
				}
			}
		).catch(
			err=>{
				this.setState({ tableLoading:false });
				Modal.error({
					title:'错误提示',
					content:"添加失败"
				});
				if (timeHandle) {
					clearTimeout(timeHandle);
				}
			}
		)
	}
	render() {
		return (
			<div>
				<Button className={s["editable-add-btn"]} onClick={this.handleAdd}  loading={this.state.tableLoading}>Add</Button>
				<Table bordered dataSource={this.state.dataSource} columns={this.state.columns} loading={this.state.tableLoading}/>
			</div>

		)
	}
}

