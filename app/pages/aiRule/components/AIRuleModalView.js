/**
 * 工具菜单-AI决策（从原来的高级自定义组件rule升级来的）
 */

import React from 'react'
import { Menu, Layout, Modal, Button, Input, Icon, Spin, Tabs, Table, Popconfirm } from 'antd';
import s from './AIRuleModalView.css'
import http from '../../../common/http';
import appConfig from '../../../common/appConfig';
import AddRuleModal from './AddRuleModalView';
import EditRuleModal from './EditRuleModalView';
import EditInputModal from './EditInputModalView';
import EditOutputModal from './EditOutputModalView';
import SimulateModal from './SimulateModalView';

const { Sider, Content, Header } = Layout;
const MenuItem = Menu.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const tabNumArr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

const aiRuleListNameArr = Object.keys(Array.from({ length: 160 })).map(function (item) {
	if (+item < 9) {
		return "AI_rule_00" + (+item + 1);
	} else {
		if (+item < 99) {
			return "AI_rule_0" + (+item + 1);
		} else {
			return "AI_rule_" + (+item + 1);
		}
	}
});

var timer;

const columnsStyle = {
	backgroundColor: "green",
}

//右侧表格展示部分
const EditableCell = ({ editable, value, onChange, color }) => (
	<div style={{ backgroundColor: color }}>
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
		this.saveData = this.saveData.bind(this);
		this.getColor = this.getColor.bind(this);

	}

	componentDidMount() {
		if (this.props.config != undefined && this.props.config.input !=undefined && this.props.config.data !=undefined ) {
			this.setState({
				columns: [{
					title: '',
					dataIndex: 'name',
					width: '5%'
				}]
			}, () => {
				this.getHeaderInput(this.props.config.input, this.props.config.output, this.props.config.data)
			})
			this.setState({
				config: {...this.props.config},
				configInput: this.props.config.input,
				configOutput: this.props.config.output,
				pointData:this.props.config
			})
		}
		
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.layoutVisible != nextProps.layoutVisible) {
			//本次渲染是为了确保第一次新增一行时可以刷新展示
			this.setState({
				columns: [{
					title: '',
					dataIndex: 'name',
					width: '5%'
				}]
			}, () => {
				this.getHeaderInput(nextProps.config.input, nextProps.config.output, nextProps.config.data)
			})
			this.setState({
				config: nextProps.config,
				configInput: nextProps.config.input,
				configOutput: nextProps.config.output,
				pointData:nextProps.config
			})
			return;
		}
		if (nextProps.config == undefined) {
			return;
		}
		// console.log(this.state.config)
		// console.log(this.props.config)
		if (this.props.currentKey != nextProps.currentKey ||( JSON.stringify(this.state.config) !== JSON.stringify(nextProps.config) && JSON.stringify(this.props.config) != "{}" && nextProps.config != undefined && nextProps.config.input != undefined && nextProps.config.output != undefined)) {
			if (nextProps.config.input.length == 0 && nextProps.config.output.length == 0) {
				this.setState({
					dataSource: [],
					columns: []
				})
			}else {
				this.setState({
					columns: [{
						title: '',
						dataIndex: 'name',
						width: '5%'
					}]
				}, () => {
					if (nextProps.config.input.length == 0 && nextProps.config.output.length != 0) {
						this.getHeaderOutput(nextProps.config.output, [], nextProps.config.data)
						return;
					}
					this.getHeaderInput(nextProps.config.input, nextProps.config.output, nextProps.config.data)
				})
			}
			this.setState({
				config: {...nextProps.config},
				configInput: nextProps.config.input,
				configOutput: nextProps.config.output,
				pointData:{...nextProps.config}
			})
		}
		if ((this.props.isShowEditInputModal != nextProps.isShowEditInputModal && nextProps.isShowEditInputModal == false) || (this.props.isShowEditOutputModal != nextProps.isShowEditOutputModal && nextProps.isShowEditOutputModal == false)) {
			this.setState({
				columns: [{
					title: '',
					dataIndex: 'name',
					width: '5%'
				}]
			}, () => {
				this.getHeaderInput(nextProps.config.input, nextProps.config.output, nextProps.config.data)
			})
			this.setState({
				config: {...nextProps.config},
				configInput: nextProps.config.input,
				configOutput: nextProps.config.output,
				pointData:nextProps.config
			})
		}
	}


	getDataSource(data, headerJson) {
		let dataObj = this.state.pointData
		dataObj.data = data
		if (data.length != 0) {
			try {
				let dataSource = []
				data.forEach((item, i) => {
					let obj = {
						key: i.toString(),
						name: `编号 ${i + 1}`
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
				tableLoading: false,
				dataSource:[]
			});
		}
	}

	getHeaderInput(inputArr, outputArr, data) {
		let headerList = inputArr
		let headerListCN = []
		let allPointList = []
		if (localStorage.getItem('allPointList') != undefined) {
			allPointList = JSON.parse(localStorage.getItem('allPointList'))
		}
		//遍历点注释列表，给每个列名点找到相应注释
		headerList.forEach(item => {
			let description = ""
			try{
				allPointList.forEach((point,j) => {
					//如果点名匹配，则用抛出异常的方法停止循环
					if (item == point.name) {
						description = point.description
						throw new Error("break");
					}
					//否则如果已判断到最后还未抛出，则视为无该点名
					if (j == allPointList.length-1) {
						headerListCN.push("点名不存在");
					}
				})
			}catch(err) {
				if (err.message == "break") {
					headerListCN.push(description)
				}
			}
		});
		console.log(headerListCN)

		let headerInput = []
		headerList.forEach((header, i) => {
			headerInput.push({
				title: headerListCN[i] + "(" + header + ")",
				dataIndex: header,
				width:150,
				render: (text, record) => this.renderColumns(text, record, header)
			})
		})
		headerInput = this.state.columns.concat(headerInput)
		this.getHeaderOutput(outputArr, headerInput, data)
	}

	getHeaderOutput(outputArr, headerInput, data) {
		let headerList = outputArr
		let headerListCN = []
		let allPointList = []
		if (localStorage.getItem('allPointList') != undefined) {
			allPointList = JSON.parse(localStorage.getItem('allPointList'))
		}
		//遍历点注释列表，给每个列名点找到相应注释
		headerList.forEach(item => {
			let description = ""
			try{
				allPointList.forEach((point,j) => {
					//如果点名匹配，则用抛出异常的方法停止循环
					if (item == point.name) {
						description = point.description
						throw new Error("break");
					}
					//否则如果已判断到最后还未抛出，则视为无该点名
					if (j == allPointList.length-1) {
						headerListCN.push("点名不存在");
					}
				})
			}catch(err) {
				if (err.message == "break") {
					headerListCN.push(description)
				}
			}
		});
		console.log(headerListCN)

		let headerOperation = [
			{
				title: '操作',
				dataIndex: 'operation',
				width:100,
				render: (text, record) => {
					const { editable } = record;
					return (
						<div className={s['editable-row-operations']}>
							{
								editable ?
									<span>
										<a onClick={() => this.save(record.key, record)}>保存</a>
										<Popconfirm  title="确定取消吗?" onConfirm={() => this.cancel(record.key)}>
											<a style={{marginRight:10,marginLeft:10}}>取消</a>
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
				width:150,
				render: (text, record) => this.renderColumns(text, record, header)
			})
		})
		//最后的操作列跟output列合并
		headerOutput = headerOutput.concat(headerOperation)

		let headerJson = headerInput.concat(headerOutput)
		this.setState({
			columns: headerJson
		})

		if (data != undefined) {
			this.setState({
				tableLoading: true
			});
			this.getDataSource(data, headerJson)
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

	
	getColor(record, column){
		if (this.props.config != undefined) {
			let input = this.props.config.input
			if (input.length != 0) {
				for (var i=0;i<input.length;i++) {
					var json = input[i]
					if (column == json) {
						return ('rgb(1 152 138)')
					}
				}
			}
		}
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
	saveData(key, record) {
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

			

			//保存结构
			http.post('/project/saveConfig', {
				"key": this.props.currentKey,
				"config": JSON.stringify(editData)
			}).then(
				data => {
					if (data.status) {
						//重新获取项目所有点的释义信息;防止新建点后，表格里释义不同步-2023-4-26新增
						http.get('/analysis/get_pointList_from_s3db/1/50000')
						.then(
							data => {
								if (data.status === 'OK') {
									var pointList = [].concat(data['data']['pointList']);
									localStorage.setItem('allPointList', JSON.stringify(pointList));
								}
							this.setState({ dataSource: newData, tableLoading: false });
							}
						).catch(
							err => {

								this.setState({ dataSource: newData, tableLoading: false });
								console.error('初始化-获取点名清单失败!');
							}
						);

					} else {
						Modal.error({
							title: '错误提示',
							content: "后台返回错误提示" + data.msg
						});
						this.setState({ dataSource: oldData, tableLoading: false });
					}
				}
			).catch(
				err => {
					this.setState({ dataSource: oldData, tableLoading: false });
					Modal.error({
						title: '错误提示',
						content: "保存失败，接口请求失败！"
					});
				}
			)
			
		} else {
			// newData.push(record);
			this.setState({ dataSource: oldData, tableLoading: false });
			Modal.error({
				title: '错误提示',
				content: "保存失败"
			});
		}
	}

	save(key, record) {
		this.setState({
			tableLoading: true
		})
		const newData = [...this.state.dataSource];
		const target = newData.filter(item => key === item.key)[0];
		if (target) {
			delete target.editable;
		}
		this.saveData(key, record);
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
		this.setState({
			tableLoading: true
		})
		let timeHandle = null;
		const dataSource = [...this.state.dataSource];
		let newData = dataSource.filter(item => item.key !== key)
		let pointData = this.state.pointData;
		let dataArr = pointData.data.filter(
			(value, index, arr) => index !== Number(key));
		// console.log(dataArr)
		pointData.data = dataArr
		// console.log(this.props)
		let config = this.props.config
		config.data = dataArr

		//保存删除后的结构
		http.post('/project/saveConfig', {
			"key": this.props.currentKey,
			"config": JSON.stringify(config)
		}).then(
			data => {
				if (data.status) {
					if (timeHandle) {
						clearTimeout(timeHandle);
					}
					timeHandle = setTimeout(() => {
						this.getDataSource(dataArr, this.state.columns)
					}, 1500)

				} else {
					Modal.error({
						title: '错误提示',
						content: "后台返回错误提示" + data.msg
					});
					this.setState({ tableLoading: false });
					if (timeHandle) {
						clearTimeout(timeHandle);
					}
				}
			}
		).catch(
			err => {
				this.setState({ tableLoading: false });
				Modal.error({
					title: '错误提示',
					content: "删除失败，接口请求失败！"
				});
				if (timeHandle) {
					clearTimeout(timeHandle);
				}
			}
		)
	}
	handleAdd = () => {
		this.props.addOneRowData()
	}

	render() {
		return (
			<div>
				<Button type="primary" className={s["editable-add-btn"]} onClick={this.handleAdd} loading={this.state.tableLoading}>增加一行训练数据</Button>
				<Table scroll={{ y: 500,x:"max-content" }} pagination={{ pageSize: 100 }} bordered dataSource={this.state.dataSource} columns={this.state.columns} loading={this.state.tableLoading} />
			</div>

		)
	}
}




class AIRuleModalView extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			allContentList: {}, //项目配置里的所有键值对内容
			ruleTitleList: [], //项目配置里提取出所有的外层title
			ruleNameList: [],   //项目配置里键名列表
			currentKey: "",  //当前菜单
			currentScript: {}, //当前脚本
			layoutVisible: true,
			addChangeTitle: "", //修改页面标题
			isShowAddRuleModal: false,
			addChangeTime: 10,
			isShowEditRuleModal: false,
			editInputScript: "",
			editInputDesc: "",
			isShowAddOutputModal: false,
			editOutputScript: "",
			editOutputDesc: "",
			editTime: null,
			editTitle: "",
			curTabkey: "1",
			copyFlag: false,
			isShowEditInputModal: false,
			isShowEditOutputModal: false,
			isShowSimulateModal:false,
			inputRealValues:[]

		};

		this.getAIRuleList = this.getAIRuleList.bind(this);
		this.getAIRuleFromConfig = this.getAIRuleFromConfig.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.saveScript = this.saveScript.bind(this);
		this.deleteModal = this.deleteModal.bind(this);
		this.handleAddRuleModal = this.handleAddRuleModal.bind(this);
		this.hideAddRuleModal = this.hideAddRuleModal.bind(this);
		this.handleAddRuleModalSubmit = this.handleAddRuleModalSubmit.bind(this);
		this.showEditRuleModal = this.showEditRuleModal.bind(this);
		this.hideEditRuleModal = this.hideEditRuleModal.bind(this);
		this.handleEditRuleModalSubmit = this.handleEditRuleModalSubmit.bind(this);
		this.saveAIP = this.saveAIP.bind(this);
		this.addOneRowData = this.addOneRowData.bind(this);
	}

	isEmptyFun = () => {
		let isEmpty = false;
		//先判断该分组tab中，数量是否为空
		let newRuleKey = 0
		let key = Number(this.state.curTabkey)
		let curRuleNum = 0
		//判断符合该tab下的已有规则后缀的数量
		if (this.state.ruleNameList.length != 0) {
			this.state.ruleNameList.forEach((item, i) => {
				if ((key - 1) * 15 < Number(item.substr(-3)) && Number(item.substr(-3)) < (key * 15 + 1)) {
					curRuleNum++
				}
			});
		}
		//判断该tab下的数量是否为0
		if (curRuleNum < 1) {
			isEmpty = true
		}
		return isEmpty
	}

	handleCopy = () => {
		Modal.confirm({
			title: '确认提示',
			content: '确定要复制此规则，并添加一条新规则吗？',
			onOk: () => { this.copyRule() },
			onCancel() { }
		});
	}

	copyRule = () => {
		let currentScript = this.state.currentScript
		this.setState({
			copyFlag: true
		}, () => { this.showAddRuleModal(currentScript) })

	}

	handlePlay = () => {
		Modal.confirm({
			title: '确认提示',
			content: '确定要运行此规则吗？',
			onOk: () => { this.playRule() },
			onCancel() { }
		});
	}

	playRule = () => {
		let currentScript = this.state.currentScript
		currentScript.enabled = 1
		this.saveScript(this.state.currentKey, currentScript)
	}

	handlePause = () => {
		Modal.confirm({
			title: '确认提示',
			content: '确定要停止此规则吗？',
			onOk: () => { this.pauseRule() },
			onCancel() { }
		});
	}

	pauseRule = () => {
		let currentScript = this.state.currentScript
		currentScript.enabled = 0
		this.saveScript(this.state.currentKey, currentScript)
	}

	componentDidMount() {
		this.getAIRuleFromConfig()

	}

	//从项目配置中获取所有的脚本规则配置
	getAIRuleFromConfig(currentKey) {
		//获取脚本配置
		http.post('/project/getConfigMul', {
			"keyList": aiRuleListNameArr
		}).then(
			res => {
				if (res.status && Object.keys(res.data).length != 0) {
					console.log(Object.values(res.data)[0])
					let titleList = []
					Object.values(res.data).forEach(element => {
						if (element.title != undefined) {
							titleList.push(element.title)
						} else {
							titleList.push("暂无标题")
						}
					});
					let nameList = Object.keys(res.data);
					if (currentKey != null) {
						this.setState({
							allContentList: res.data,
							ruleNameList: nameList,
							ruleTitleList: titleList,
							currentKey: currentKey,
							currentScript: res.data[currentKey],
							layoutVisible: true
						})
					} else {
						this.setState({
							allContentList: res.data,
							ruleNameList: nameList,
							ruleTitleList: titleList,
							currentKey: nameList[0],
							currentScript: res.data[nameList[0]],
							layoutVisible: true
						})
					}
				} else {
					this.setState({
						layoutVisible: true
					})
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible: true
				})
			}
		)
	}

	//整理左侧菜单
	getAIRuleList() {
		let menuList = []
		let key = Number(this.state.curTabkey)
		if (this.state.ruleNameList.length != 0) {
			menuList = this.state.ruleNameList.map((item, i) => {
				//分tab,每个tab最多显示15个
				if ((key - 1) * 15 < Number(item.substr(-3)) && Number(item.substr(-3)) < (key * 15 + 1)) {
					return <MenuItem className={s['menuItem']} style={{ marginTop: "-5px", paddingLeft: "27px", paddingRight: "4px", backgroundColor: this.state.allContentList[item].enabled == 0 ? '#666666' : '#003366', color: '#FFFFFF', borderBottom: "1px solid rgb(53 77 86)" }} title={this.state.ruleTitleList[i]} key={item}>
						<span style={{
							fontSize: "10px", display: "inline-block", width: 22, textAlign: 'center', height: 15, lineHeight: "14px", padding: "0 1px", backgroundColor: "#5a6873", color: "fff", borderRadius: 5, position: 'absolute', left: 2,
							fontWeight: 700
						}}>
							{Number(item.substr(-3))}</span>{this.state.ruleTitleList[i]}
						{
							this.state.allContentList[item].enabled == 0 ?
								<Icon style={{ fontSize: "18px" }} type="play-circle" className={s['btnPlay']} onClick={() => { this.handlePlay() }} />
								:
								<Icon style={{ fontSize: "18px" }} type="pause-circle" className={s['btnPause']} onClick={() => { this.handlePause() }} />
						}
						{/* <Icon style={{ fontSize: "18px" }} type="copy" className={s['btnCopy']} onClick={() => { this.handleCopy() }} /> */}
					</MenuItem>
				}
			})
		}
		return menuList;
	}

	//左侧菜单点击事件
	handleClick(e) {
		let selectRule = this.state.allContentList[e.key]
		let selectKey = e.key
		this.setState({
			currentKey: selectKey,
			currentScript: selectRule
		})
	}

	deleteModal(currentKey) {
		//修改规则及标题前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: '错误提示',
				content: "请先在当前分组中创建规则！"
			})
		} else {
			Modal.confirm({
				title: '确认提示',
				content: '真的要删除此AI决策吗？',
				onOk: () => { this.deleteRule(currentKey) },
				onCancel() { }
			});
		}
	}

	deleteRule(currentKey) {
		this.setState({
			layoutVisible: false
		})
		http.post('/project/saveConfig', {
			"key": currentKey,
			"config": JSON.stringify({
				"title": "暂无标题",
				"intervalSeconds": 300,
				"input": [],
				"output": [],
				"modelType":'Linear',
				"data": [],
				"enabled": 0

			})
		}).then(
			data => {
				if (!data.err) {
					this.getAIRuleFromConfig(currentKey);
				} else {
					this.setState({
						layoutVisible: true
					})
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible: true
				})
			}
		)
	}

	saveScript(currentKey, currentScript) {
		this.setState({
			layoutVisible: false
		})
		http.post('/project/saveConfig', {
			"key": currentKey,
			"config": JSON.stringify(currentScript)
		}).then(
			data => {
				if (data.status) {
					this.getAIRuleFromConfig(currentKey);

				} else {
					this.setState({
						layoutVisible: true
					})
					Modal.error({
						title: '错误提示',
						content: "保存规则失败"
					})
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible: true
				})
				Modal.error({
					title: '错误提示',
					content: "保存规则失败"
				})
			}
		)
	}

	hideAddRuleModal = () => {
		this.setState({
			isShowAddRuleModal: false
		})
	}
	//弹出新增AI决策框
	showAddRuleModal = (currentScript) => {
		//先判断该分组tab中，数量是否已满
		let newRuleKey = 0
		let key = Number(this.state.curTabkey)
		let curRuleNum = 0
		//循环检测符合该tab下的已有规则后缀的数量
		if (this.state.ruleNameList.length != 0) {
			this.state.ruleNameList.forEach((item, i) => {
				if ((key - 1) * 15 < Number(item.substr(-3)) && Number(item.substr(-3)) < (key * 15 + 1)) {
					curRuleNum++
				}
			});
		}
		//如果该tab下不超过15个规则，则可以新建
		if (curRuleNum < 15) {
			newRuleKey = (key - 1) * 15 + 1 + curRuleNum

			//如果是复制，直接调接口添加，无需弹框
			if (this.state.copyFlag) {
				this.handleAddRuleModalSubmit();
				this.setState({
					copyFlag: false
				});
			} else {
				//如果是新建，弹出新增框
				this.setState({
					isShowAddRuleModal: true
				})
			}
		} else {
			Modal.confirm({
				title: '提示',
				content: '该分组已存满15个规则，请切换至其他分组创建新AI决策',
				onOk: () => { }
			});
			this.setState({
				copyFlag: false
			})
		}
	}

	showEditRuleModal = () => {
		this.setState({
			isShowEditRuleModal: true
		})
	}

	hideEditRuleModal = () => {
		this.setState({
			isShowEditRuleModal: false
		})
	}

	showSimulateModal = () =>{
		if (!this.isEmptyFun() && this.state.currentScript !=undefined && this.state.currentScript.input !=undefined) {
			let input = this.state.currentScript.input
			this.setState({
				layoutVisible: false
			})
			//给环境参数请求当前数据，自动填入模拟决策中
			http.post('/get_realtimedata', {
				proj: 1,
				pointList: input,
				scriptList: []
			}).then(
				res => {
					if (res.length != 0) {
						try {
							this.setState({
								isShowSimulateModal: true,
								inputRealValues:res,
								layoutVisible: true
							})
						} catch (e) {
							Modal.error({
								title: '错误提示',
								content: "请求实时数据为空！"
							});
							this.setState({
								isShowSimulateModal: true,
								inputRealValues:[],
								layoutVisible: true
							})
						}
					} else {
						Modal.error({
							title: '错误提示',
							content: "请求实时数据为空！"
						});
						this.setState({
							isShowSimulateModal: true,
							inputRealValues:[],
							layoutVisible: true
						})
					}
					
				}
			).catch(
				err => {
					Modal.error({
						title: '错误提示',
						content: "请求实时数据为空！"
					});
					this.setState({
						isShowSimulateModal: true,
						inputRealValues:[],
						layoutVisible: true
					})
				}
			)
			
		}else {
			Modal.error({
				title: '错误提示',
				content: "环境条件不能为空！"
			});
			this.setState({
				layoutVisible: true,
				inputRealValues:[]
			})
		}
		
	}

	hideSimulateModal = ()=>{
		this.setState({
			isShowSimulateModal: false
		})
	}

	addOneRowData () {
		this.setState({
			layoutVisible:false
		})
		const {currentScript,currentKey} = this.state
		let inputPointList = currentScript.input
		let outputPointList = currentScript.output
		let obj = {...currentScript}
		//整合in和out的点名，获取到实时数据，作为新增的训练数据
		let pointList = inputPointList.concat(outputPointList)
		let pointData = []
		//先给数值数组预制点值，防止不存在的点不返回点值后，导致数值列错乱
		pointList.forEach((jtem)=>{
			pointData.push(null)
		})

		http.post('/get_realtimedata', {
			proj: 1,
			pointList: pointList,
			scriptList: []
		}).then(
			res => {
				if (res.length != 0) {
					try {
						pointList.forEach((jtem,j)=>{
							res.forEach((item, i) => {
								if (jtem == item.name) {
									pointData[j] = item.value
								}
							})
						})
						obj.data.push(pointData)
						this.saveAIP(currentKey,obj);
					} catch (e) {
						console.log("请求实时数据失败")
						this.saveAIP(currentKey,obj);
					}

				} else {
					console.log("请求实时数据为空")
					this.saveAIP(currentKey,obj);
				}
			}
		)
	}



	//子组件新增弹框，点击确认后的调用--新增AI决策，调接口
	handleAddRuleModalSubmit = (objFrom, currentScript) => {
		//先判断该分组tab中，数量是否已满
		let newRuleKey = 0
		let key = Number(this.state.curTabkey)
		let curRuleNum = 0
		//循环检测符合该tab下的已有规则后缀的数量
		if (this.state.ruleNameList.length != 0) {
			this.state.ruleNameList.forEach((item, i) => {
				if ((key - 1) * 15 < Number(item.substr(-3)) && Number(item.substr(-3)) < (key * 15 + 1)) {
					curRuleNum++
				}
			});
		}
		newRuleKey = (key - 1) * 15 + 1 + curRuleNum
		let newItem = "AI_rule_450"
		if (newRuleKey < 10) {
			newItem = "AI_rule_00" + newRuleKey;
		} else {
			if (newRuleKey < 100) {
				newItem = "AI_rule_0" + newRuleKey;
			} else {
				newItem = "AI_rule_" + newRuleKey;
			}
		}

		this.setState({
			layoutVisible: false
		})
		console.log(objFrom)

		let reg = /,/,
			inputPointList = [],
			outputPointList = [];

		if (reg.test(objFrom.input)) { //多个点(或加了一个点最后有逗号)
			if (objFrom.input.substr(objFrom.input.length - 1, 1) == ",") {
				objFrom.input = objFrom.input.substr(0, objFrom.input.length - 1)//删除最后一个逗号
			}
			inputPointList = objFrom.input.split(',')
		} else {
			inputPointList = [objFrom.input] //单个点
		}

		if (reg.test(objFrom.output)) { //多个点
			if (objFrom.output.substr(objFrom.output.length - 1, 1) == ",") {
				objFrom.output = objFrom.output.substr(0, objFrom.output.length - 1)//删除最后一个逗号
			}
			outputPointList = objFrom.output.split(',')
		} else {
			outputPointList = [objFrom.output] //单个点
		}

		let obj = {
			"title": objFrom.title,
			"modelType": objFrom.modelType,
			"input": inputPointList,
			"output": outputPointList,
			"intervalSeconds": objFrom.intervalSeconds,
			"data": [],
			"enabled": 0   //新建的规则默认是停止的，enabled是0，0是停止
		}

		//整合in和out的点名，获取到实时数据，作为第一行训练数据
		let pointList = inputPointList.concat(outputPointList)
		let pointData = []
		//先给数值数组预制点值，防止不存在的点不返回点值后，导致数值列错乱
		pointList.forEach((jtem)=>{
			pointData.push(null)
		})

		http.post('/get_realtimedata', {
			proj: 1,
			pointList: pointList,
			scriptList: []
		}).then(
			res => {
				if (res.length != 0) {
					try {
						pointList.forEach((jtem,j)=>{
							res.forEach((item, i) => {
								if (jtem == item.name) {
									pointData[j] = item.value
								}
							})
						})
						obj.data = [pointData]
						this.saveAIP(newItem,obj);
					} catch (e) {
						console.log("请求第一行数据失败")
						this.saveAIP(newItem,obj);
					}

				} else {
					console.log("请求第一行数据为空")
					this.saveAIP(newItem,obj);
				}
			}
		)

		//判断是不是点击的复制，复制的话，直接给脚本
		if (currentScript != undefined) {
			obj.title = currentScript.title + "_copy" + newRuleKey
			obj.keepMinutes = currentScript.keepMinutes
			obj.inputList = currentScript.inputList
			obj.outputList = currentScript.outputList
			obj.enabled = currentScript.enabled

			this.saveAIP(newItem,obj);
		}

	}

	saveAIP = (key,obj) => {
		this.setState({
			layoutVisible: false
		})
		
		http.post('/project/saveConfig', {
			"key": key,
			"config": JSON.stringify(obj)
		}).then(
			data => {
				if (data.status) {
					//重新获取项目所有点的释义信息;防止新建点后，表格里释义不同步-2023-4-26新增
					http.get('/analysis/get_pointList_from_s3db/1/50000')
					.then(
						data => {
							if (data.status === 'OK') {
								var pointList = [].concat(data['data']['pointList']);
								localStorage.setItem('allPointList', JSON.stringify(pointList));
							}
							this.getAIRuleFromConfig(key);
						}
					).catch(
						err => {
							this.getAIRuleFromConfig(key);
							console.error('初始化-获取点名清单失败!');
						}
					);

				} else {
					this.setState({
						layoutVisible: true
					})
					Modal.error({
						title: '错误提示',
						content: "保存AI决策失败，后台返回：" + data.msg
					})
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible: true
				})
				Modal.error({
					title: '错误提示',
					content: "保存AI决策失败,接口请求失败"
				})
			}
		)
	}

	handleSimulateModal = () =>{
		//模拟前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: '错误提示',
				content: "当前分组中未检测到决策，请先在当前分组中创建决策！"
			})
		} else {
			this.showSimulateModal();
		}
	}

	//点击-修改决策配置
	handleEditRuleModal = (currentKey) => {
		//修改前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: '错误提示',
				content: "当前分组中未检测到决策，请先在当前分组中创建决策！"
			})
		} else {
			// let currentScript = this.state.currentScript
			// let orgTitle = currentScript.title
			// let orgKeepTime = currentScript.keepMinutes
			// //先给state里同步当前信息，防止保存时未修改的信息保存为空
			// this.setState({
			// 	editTitle: orgTitle,
			// 	editTime: orgKeepTime
			// })

			this.showEditRuleModal();
			
			// this.editRulePage(this.state.editTitle, this.state.editTime, currentKey, currentScript)
		}

	}

	//编辑信息-保存
	handleEditRuleModalSubmit(obj) {
		this.setState({
			layoutVisible: false
		})
		let currentScript = this.state.currentScript
		currentScript.title = obj.title
		currentScript.modelType = obj.modelType
		currentScript.intervalSeconds = obj.intervalSeconds

		http.post('/project/saveConfig', {
			"key": this.state.currentKey,
			"config": JSON.stringify(currentScript)
		}).then(
			data => {
				if (data.status) {
					this.getAIRuleFromConfig(this.state.currentKey);

				} else {
					this.setState({
						layoutVisible: true
					})
					Modal.error({
						title: '错误提示',
						content: "修改AI决策信息页面失败，后台返回信息："+data.msg
					})
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible: true
				})
				Modal.error({
					title: '错误提示',
					content: " 修改AI决策信息失败"
				})
			}
		)
	}

	//点击增加决策
	handleAddRuleModal = () => {
		this.showAddRuleModal()
	}
	
	//环境管理
	handleEditInputModal = () =>{
		//修改前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: '错误提示',
				content: "当前分组中未检测到决策，请先在当前分组中创建决策！"
			})
		} else {
			this.showEditInputModal();
		}
	}

	showEditInputModal =()=>{
		this.setState({
			isShowEditInputModal: true
		})
	}

	hideEditInputModal =()=>{
		this.setState({
			isShowEditInputModal: false
		})
	}

	showEditOutputModal =()=>{
		this.setState({
			isShowEditOutputModal: true
		})
	}

	hideEditOutputModal =()=>{
		this.setState({
			isShowEditOutputModal: false
		})
	}

	//动作管理
	handleEditOutputModal=()=>{
		//修改前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: '错误提示',
				content: "当前分组中未检测到决策，请先在当前分组中创建决策！"
			})
		} else {
			this.showEditOutputModal();
		}
	}


	callback = (key) => {
		this.setState({
			curTabkey: key
		})
		//当切换的分组不为空时，自动选中分组中的第一个
		if (this.isEmptyFun) {
			let firstNo = (Number(key) - 1) * 15 + 1
			let firstRuleName = ""
			if (firstNo < 10) {
				firstRuleName = "AI_rule_00" + firstNo;
			} else {
				if (firstNo < 100) {
					firstRuleName = "AI_rule_0" + firstNo;
				} else {
					firstRuleName = "AI_rule_" + firstNo;
				}
			}
			let selectRule = this.state.allContentList[firstRuleName]
			let selectKey = firstRuleName
			this.setState({
				currentKey: selectKey,
				currentScript: selectRule
			})
		}
	}

	render() {
		console.log(this.state.currentScript)
		const style = { height: 950, width: '100%' }
		const {
			hidePointModal,
			selectedIdsInput,
			pointDataInput,
			showPointModal,
			selectedIdsOutput,
			pointDataOutput,
			onSelectChangeInput,
			onSelectChangeOutput
		} = this.props

		let selectedPointInput = pointDataInput != undefined ? pointDataInput.filter(item => {
			if (selectedIdsInput[0] === item.name) return item
		})[0] || {} : {};

		let selectedPointOutput = pointDataOutput != undefined ?  pointDataOutput.filter(item => {
			if (selectedIdsOutput[0] === item.name) return item
		})[0] || {} : {};

		return (
			<div style={style} className={s['inner-container']} >
				<Spin tip="正在读取数据" spinning={!this.state.layoutVisible} style={{ height: '800px' }}>
					<Tabs activeKey={this.state.curTabkey} onChange={this.callback} >
						{
							tabNumArr.map((item, i) => {
								return (
									<TabPane tab={"分组" + item} key={item}>
										<Layout>
											<Sider width={260}>
												<div style={{ height: '800px', borderBottom: '1px solid white' }}>
													<Menu
														selectedKeys={[this.state.currentKey]}
														mode="inline"
														onClick={this.handleClick}
														className='aiRule'
													>
														{this.getAIRuleList()}
													</Menu>
												</div>

												<div className={s['sider-footer']} >
													<Button type='primary' icon="plus"
														onClick={this.handleAddRuleModal}
													>
													</Button>
												</div>
											</Sider>
											<Layout>
												<Header>
													{
														this.state.ruleNameList.length != 0 ?
															<div style={{ overflow: 'hidden' }}>
																<div style={{ float: "right" }}>
																	<Button type="primary" style={{ marginLeft: "15px",backgroundColor:"rgb(1 152 138)",borderColor:"rgb(1 152 138)" }} onClick={() => { this.handleEditInputModal(this.state.currentKey) }}>环境管理</Button>
																	<Button type="primary" style={{ marginLeft: "15px" }} onClick={() => { this.handleEditOutputModal(this.state.currentKey) }}>动作管理</Button>
																	<Button type="primary" style={{ marginLeft: "15px" }} onClick={() => { this.handleEditRuleModal(this.state.currentKey) }}>编辑</Button>
																	<Button type="danger" style={{ marginLeft: "15px" }} icon="delete" onClick={() => { this.deleteModal(this.state.currentKey) }}>清空</Button>
																	<Button type="primary" style={{ marginLeft: "15px" }} onClick={() => { this.handleSimulateModal(this.state.currentKey) }}>模拟决策</Button>
																</div>
															</div>
															:
															""
													}
												</Header>
												<Content>
													<div className={s['table-container']} style={{ height: 730, marginRight: 10, marginLeft: 10 }}>
														{
															!this.isEmptyFun() ? 
															<EditableTable
																allContentList={this.state.allContentList}
																currentKey={this.state.currentKey}
																style={style}
																config={this.state.currentScript}
																isShowEditInputModal={this.state.isShowEditInputModal}
																isShowEditOutputModal={this.state.isShowEditOutputModal}
																addOneRowData={this.addOneRowData}
																layoutVisible={this.state.layoutVisible}
															/> : ""
														}
													</div>
												</Content>
											</Layout>
										</Layout>
									</TabPane>
								)
							})
						}
					</Tabs>

				</Spin>
				<AddRuleModal
					visible={this.state.isShowAddRuleModal}
					handleHide={this.hideAddRuleModal}
					handleOk={this.handleAddRuleModalSubmit}
					selectedPointInput={selectedPointInput}
					showPointModal={showPointModal}
					onSelectChangeInput={onSelectChangeInput}
					hidePointModal={hidePointModal}
					selectedPointOutput={selectedPointOutput}
					onSelectChangeOutput={onSelectChangeOutput}
				/>
				<EditRuleModal
					visible={this.state.isShowEditRuleModal}
					handleHide={this.hideEditRuleModal}
					handleOk={this.handleEditRuleModalSubmit}
					config={this.state.currentScript}
					selectedPointInput={selectedPointInput}
					showPointModal={showPointModal}
					onSelectChangeInput={onSelectChangeInput}
					hidePointModal={hidePointModal}
					selectedPointOutput={selectedPointOutput}
					onSelectChangeOutput={onSelectChangeOutput}
				/> 
				<EditInputModal
					visible={this.state.isShowEditInputModal}
					handleHide={this.hideEditInputModal}
					config={this.state.currentScript}
					selectedPointInput={selectedPointInput}
					showPointModal={showPointModal}
					onSelectChangeInput={onSelectChangeInput}
					hidePointModal={hidePointModal}
					saveAIP={this.saveAIP}
					currentKey={this.state.currentKey}
				/> 
				<EditOutputModal
					visible={this.state.isShowEditOutputModal}
					handleHide={this.hideEditOutputModal}
					config={this.state.currentScript}
					selectedPointOutput={selectedPointOutput}
					showPointModal={showPointModal}
					onSelectChangeOutput={onSelectChangeOutput}
					hidePointModal={hidePointModal}
					saveAIP={this.saveAIP}
					currentKey={this.state.currentKey}
				/>
				<SimulateModal
					visible={this.state.isShowSimulateModal}
					inputRealValues={this.state.inputRealValues}
					handleHide={this.hideSimulateModal}
					handleOk={this.handleEditRuleModalSubmit}
					config={this.state.currentScript}
					currentKey = {this.state.currentKey}
				/> 
				
			</div>
		)
	}
}
export default AIRuleModalView;
