/**
 * 工具菜单-脚本规则控制
 */

import React from 'react'
import { Menu, Layout, Modal, Button, Input, Icon, Spin, InputNumber, Tabs, Badge } from 'antd';
import s from '../components/ScriptRuleModalView.css'
import http from '../../../common/http';
import ReactEcharts from '../../../lib/echarts-for-react';
import RealWorker from '../../observer/components/core/observer.worker';
import appConfig from '../../../common/appConfig';
import AddInputModal from '../components/AddInputModalView';
import EditInputModal from '../components/EditInputModalView';
import PointModalView from '../containers/PointModalContainer';
import AddOutputModal from '../components/AddOutputModalView';
import EditOutputModal from '../components/EditOutputModalView';

const { Sider, Content, Header } = Layout;
const MenuItem = Menu.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const tabNumArr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

const scriptRuleListNameArr = Object.keys(Array.from({ length: 160 })).map(function (item) {
	if (+item < 9) {
		return "script_rule_00" + (+item + 1);
	} else {
		if (+item < 99) {
			return "script_rule_0" + (+item + 1);
		} else {
			return "script_rule_" + (+item + 1);
		}
	}
});

var timer;


//右侧脚本逻辑展示部分
class TreeView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			option: {},
			scriptList: [],
			dataList: [],
			inputTree: [],
			outputTree: [],
			isChartEmpty: false,
			loading:false

		};


		this.workerUpdate = null;

		this.getChartOption = this.getChartOption.bind(this);
		this.stopWorker = this.stopWorker.bind(this);
		this.startWorker = this.startWorker.bind(this);
		this.refreshData = this.refreshData.bind(this);

	}


	componentWillReceiveProps(nextProps) {
		if (nextProps.currentKey != this.props.currentKey || nextProps.currentScript != this.props.currentScript) {
			const { currentKey, allContentList } = nextProps
			if (currentKey != "") {
				if (allContentList[currentKey] != undefined) {
					let content = allContentList[currentKey]
					let inputTree = {
						name: "运算模块", children: [], symbolSize: 50, symbol: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABvtJREFUeF7tW11SIzcQlrD8vJsTZKmyXMVT4ASBEwROAJxg2RMEThD2BGtOEPYEa04Q+4kqa6rYPUHg2TJKfSppStZoRpofe2DDVKXCetSj1qdW99ctiZL/+UM3Mf6Hh4f3y+XydGdnZx/ff35+ng2Hw5vd3d3HlP7ayqf0Ydt0DsBisTijlP5FCHnvKfKolPo0Ho8nVQpWyVNKz0ej0W2dAcbadgpAlmXHSqm/I50ecc6noTZt5WODDb3vGoAHpdQH09EVY+waf0spLwghf+JvSun30Wi0WwJAK/leAVgsFvuU0n+ghFLqZjwen7kKCSFgun+Y9wfj8Xjmvm8r32TwekKaCvpyQohDQsg3M8Bzf60LIWAF8A14CsugrXzTcWwEAErp59FohAHnT5Zl10qpj2UW4ALQRL53AKCAEAJh7h0hBB7/yJq5MW9YByLDE+fcjxBa/7byTUDozALMAC6tszPKWG+P5WGfT5xz7RwDy6iVfO8AQIHFYjGhlJ6GlAk5R79dW/m6IHRqAbZzE8/hA343v91RSq9TSYwhQ4gijeTrgLARAMxyyKNCyOuD7q5WKx02B4PBgU+TXacYkq8zyKq2vQEQG2Ds/RsAHSHwZgEdARkKaZU+IGbisfdd6V2wAENawNmRy4Ov35Vlb74S9/f3HxhjCIGQRVKk6wHmO34tAGSozvvv+I6U8mZvbw9/R58sy05NcqbHEpJdA0AIAa6+RmFNL1PG2ElVQcOEri9RrTpooJQq5BruZ81EQBeXgNkm15zzT/YfOQAuVy/RccYYOwqB4GZyHYwv6RNSyt2QJSC8SilBu611Fb7n5hoaAG8AT0qpC2Rz5ndUcH4zXwnSWCFETmFjs5M0upJGnpVdcc7R79rj6kIImSulzpCTGFlQcOQqqFFoADUAVQMwiMIX/Iokx6xnv1+grRMczvnGIovRVeH/KKwopUK+wOrygzG271psCEALQF6sCA1ACIGkxtLSykncFgAJlgTnXfABQggLoE7ZQxZQqNYIIUBZS9eUq8wLAmDGOT9wdfOWul5CGgCvGLnm7IQQqOXptVaWzbkWskUAgjPsZZOXnPMr6O47R0rpCZKzfL0KIbDOrbOza92N1U9Syv2Q500FwOEYofAEPadKqa9+vdCdRWvChp8UvmNCIMainZ3DQXI/5crmABhB+AILwtoyq/LuKQDU4QmRvvQaLgPARDXsTZRxkrmU8thO5JrHNmYCIoRcHF7/h1JqulqtLqvYVwwAA+5DguPKm5TF+ZgF2A+gz8FgcEkphZXosRBCJijVu5Ghk5AVAyCVJyTG+agF1AF6WwDkYTTmJGMzHHtfZ/CaT9QVMMvE9xNgWDpMxnhEhwDA0a3lLYyxeeoGrB13bQCyLHO3rwr4bRGAQt9V225lE10bACEE6CecSvDpEwA4Os653ZtMMu7aAJgl4LNCLAG9LLYIwDywBGYbXwIhWBOiQGWuUUJ0vnLOj/3+eneCDQFISpd7D4PGvD9SSs9QSoJTAT1dLpdXr5EIDYdD5DGHdixKKRChz0EiBOY0HA6/OQccflYqjNrgSYEKeykvaCNmH8lQniBJKQ/aJEOGEoNmu4mJBVonYFLKScTaKpmg6QPpu92BhrPEtxEdbPTKU+VQOjxnjB1aM/FobOHkB7SPOcGkeJTYKOYEvXQ4L5uZ5Q1Gqid0LR32BhkqiLipcqWqMaaXOM7SZg4AsU/NOedr4bq0IOKe34nF8VivLwiAypIYIUSH2dSiKFJZfbqjoiiqCxBbBMD6KX9OMOvvEMH8XefSoqhnGo+U0ovRaHRjfkdhwZrSayuLz0xxZWZ2icBYtXNcK4vjh4SNkTXn6ML+AjdGcmcXWrKFjRHbqAKEO8bY8WvZGjMeH/S7UMr3T6CVbY6Cg9vN0WnNzVEb5xF3LYewsdidEJdjpLy3m6OVPMHLK1AOw392c7QgWzsbjEUB+z62vd32faoesXZvAMQQavq+7QzH5Jvq5cv1ZgGGQusdp5Jd3soTJj8FAFWDeNUWIITAERtUbO3W1ZRSOgG5Spk5Q1oQTRrJp/Rh23S+BLIs+4JDCSUEBCCcVynYVr7O4NG2UwC8OwH4/p1RyCUkwZMdjk/QN0vMU0u+7uA3AcC/NmlSSh16x+VBT/VRes75LyFlhRCt5HsFwM0HYhceYjdGmsg3GXynFtD2yktb+d4B8DLCW875iauUEALX6XSdXylVeWmKEFJbvncAjBNzt80ucTITv5vTo/ZIW+n2lbftVlu+CQhdRwGXvZXpU3px0iM/teV7BwAKmANXOFxpz+hYvfIDmBEegNunQXls2KTeOkkFo1MLsJ2ay8/H9vI0DjQyxiapG5e+vLl8fZsqnzr4TqNAnU5fUtv/AFaxwozsyWQ8AAAAAElFTkSuQmCC"
					};
					let outputTree = {
						name: "运算模块", children: [], symbolSize: 50, symbol: "image://data:image/png;base64,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"
					};
					let scriptList = [];
					if (content.inputList != undefined && content.inputList.length != 0) {
						content.inputList.forEach(inputItem => {
							inputTree.children.push({ name: inputItem.title, value: inputItem.script });
							scriptList.push(inputItem.script);
						})
					}
					if (content.outputList != undefined && content.outputList.length != 0) {
						content.outputList.forEach(outputItem => {
							outputTree.children.push({ name: outputItem.title, value: outputItem.script });
						})
					}

					// this.getChartOption(inputTree, outputTree);

					window.setTimeout(() => {
						this.setState({
							scriptList: scriptList,
							inputTree: inputTree,
							outputTree: outputTree,
							isChartEmpty: false,
							loading:true
						}, ()=>{
							this.startWorker();
							this.getChartOption();
						});
					}, 0);
				} else {
					this.setState({
						isChartEmpty: true
					})
				}
			}
		}

	}

	componentWillUnmount() {
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
		}
		this.setState({
			scriptList: [],
			dataList: [],
			inputTree: [],
			outputTree: []
		})
	}

	//开始建立一个实时请求
	startWorker() {

		this.stopWorker()

		// 创建Worker实例
		this.workerUpdate = new RealWorker();
		this.workerUpdate.self = this;

		this.workerUpdate.addEventListener("message", this.refreshData, true);

		this.workerUpdate.addEventListener("error", function (e) {
			console.warn(e);
		}, true);

		if (!this.state.scriptList.length) {
			this.stopWorker();
			return;
		}

		// if (timer) {
		// 	clearInterval(timer);
		// }
		var _this = this;
		// //传数据
		// timer = setInterval(function () {
		// 	_this.workerUpdate.postMessage({
		// 		scriptList: _this.state.scriptList,
		// 		serverUrl: appConfig.serverUrl,
		// 		type: "scriptRuleRealtime"
		// 	});
		// }, 3000);

		//暂时关闭动态刷新，注掉上面的计时器，执行下面的一次性代码
		
		_this.workerUpdate.postMessage({
			scriptList: _this.state.scriptList,
			serverUrl: appConfig.serverUrl,
			type: "scriptRuleRealtime"
		});
	


	}

	stopWorker() {
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
			this.workerUpdate.removeEventListener("message", this.refreshData, true);
		}
	}



	//脚本值刷新
	refreshData(e) {
		if (e.data && !e.data.error) {
			let newData = []
			e.data.forEach((item,i)=>{
				if (item.time == undefined) {
					newData.push(item)
				}
			})
			let inputString = JSON.stringify(this.state.inputTree)
			
			let inputTree = this.state.inputTree;
			//输入脚本的颜色	
			if (newData.length != 0 && inputTree.length != 0) {
				newData.forEach(item => {
					if (inputTree.children && inputTree.children.length != 0) {
						inputTree.children.map(input => {
							if (item.name == input.value) {
								if (item.value == 1) {
									input["itemStyle"] = { color: "#00FF33" };
									input["lineStyle"] = { color: "#00FF33" };
									input["label"] = { color: "#00FF33", width: 320, overflow: "break" };
								} else {
									input["itemStyle"] = { color: "rgb(255 0 10)" };
									input["lineStyle"] = { color: "rgb(255 0 10)" };
									input["label"] = { color: "rgb(255 0 10)", width: 320, overflow: "break" };

								}
							}
						})
					}
				})
			}
			//当输入条件的颜色或者内容不同时，再调用渲染函数
			// if ( inputString !== JSON.stringify(inputTree)) {   //暂时关闭动态刷新功能，为了使刷新按钮每次都生效，就不判断内容是否不同了
				// this.getChartOption(inputTree, this.state.outputTree);
				this.setState({
					dataList: newData,
					inputTree:inputTree
				},()=>{this.getChartOption()})
			// }
		}
	}

	treeNodeclick = (param) => {
		/* true 代表点击的是圆点
			fasle 表示点击的是当前节点的文本
		*/
		if (param.event.target.culling === true) {
			if (param.name === "运算模块") {
				//如果是根节点，则显示“修改规则信息”
				this.props.editTitleModal(this.props.currentKey)
			} else {
				//第一个tree应该是输入
				if (param.seriesIndex == 0) {
					this.props.showEditInputModal(param.value, param.name)
				} else {
					this.props.showEditOutputModal(param.value, param.name)
				}
			}

		} else if (param.event.target.culling === false) {
			return
		}
	}

	saveChartRef = (chart) => {
		if (chart) {
			this.chart = chart.getEchartsInstance();
			this.chart.on('click', this.treeNodeclick)
		} else {
			this.chart = chart;
		}
	}

	//画图
	getChartOption() {

		let option = {

			series: [
				{
					type: 'tree',
					data: [this.state.inputTree],
					top: '1%',
					left: '400',
					bottom: '1%',
					symbolSize: 15,
					orient: 'RL',
					width: 400,
					label: {
						position: 'right',
						verticalAlign: 'middle',
						align: 'left',
						fontSize: 16
					},
					leaves: {
						label: {
							position: 'left',
							verticalAlign: 'middle',
							align: 'right'

						}
					},
					expandAndCollapse: false //不支持折叠、展开功能
					// emphasis: {
					// 	focus: 'descendant'
					// },
					// animationDuration: 30,
					// animationDurationUpdate: 750
				},
				{
					type: 'tree',
					data: [this.state.outputTree],
					top: '1%',
					bottom: '1%',
					left: '800',
					symbolSize: 15,
					orient: 'LR',
					width: 400,
					label: {
						position: 'left',
						verticalAlign: 'middle',
						align: 'right',
						fontSize: 16
					},
					leaves: {
						label: {
							position: 'right',
							verticalAlign: 'middle',
							align: 'left'
						}
					},
					expandAndCollapse: false //不支持折叠、展开功能
					// emphasis: {
					// 	focus: 'descendant'
					// },
					// expandAndCollapse: true,
					// animationDuration: 30,
					// animationDurationUpdate: 750
				}
			]
		}
		this.setState({
			option: option,
			loading:false
		})
	}

	handleRender =()=>{
		let _this = this
		if (_this.state.scriptList.length !=0) {
			_this.setState({
					loading:true})
			_this.startWorker()
		}
	}


	render() {
		const { height, width } = this.props.style

		return (
			<div>
				<Spin tip="正在加载页面..." spinning={this.state.loading} style={{paddingTop:'20%'}}>
				{
					this.state.isChartEmpty ?
						""
						:
						(
						<div>
							<div style={{ display:'inline-block',position:'absolute',top:'-48px',left:'210px' }}>
								<Button type="primary" onClick={() => { this.handleRender() }}>刷新条件状态</Button>
							</div>
							<ReactEcharts
								style={{
									height: height - 180,
									width: width
								}}
								id="chart"
								ref={this.saveChartRef}
								option={this.state.option}
								theme="dark"
								notMerge={true}
								lazyUpdate={false}
							/>
						</div>
						)
				}
				</Spin>
			</div>
		)
	}

}




class ScriptRuleModalView extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			allContentList: {}, //项目配置里的所有键值对内容
			ruleTitleList: [], //项目配置里提取出所有的外层title
			ruleNameList: [],   //项目配置里键名列表
			currentKey: "",  //当前菜单
			currentScript: {}, //当前脚本
			addChangeScript: "", //修改添加的规则
			layoutVisible: true,
			addChangeTitle: "", //修改页面标题
			isShowAddInputModal: false,
			addChangeTime: 10,
			isShowEditInputModal: false,
			editInputScript: "",
			editInputDesc: "",
			isShowAddOutputModal: false,
			isShowEditOutputModal: false,
			editOutputScript: "",
			editOutputDesc: "",
			editTime: null,
			editTitle: "",
			curTabkey: "1",
			copyFlag: false,
			statusList:{},
			runningNubList:[0,0,0,0,0,0,0,0,0,0]


		};

		this.getScriptRuleList = this.getScriptRuleList.bind(this);
		this.getScriptRuleFromConfig = this.getScriptRuleFromConfig.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.editModal = this.editModal.bind(this);
		this.saveScript = this.saveScript.bind(this);
		this.changeScript = this.changeScript.bind(this);
		this.addRuleModal = this.addRuleModal.bind(this);
		this.changeAddScript = this.changeAddScript.bind(this);
		this.addRulePage = this.addRulePage.bind(this);
		this.deleteModal = this.deleteModal.bind(this);
		this.changeTitle = this.changeTitle.bind(this);
		this.addTitleModal = this.addTitleModal.bind(this);
		this.hideAddInputModal = this.hideAddInputModal.bind(this);
		this.showAddInputModal = this.showAddInputModal.bind(this);
		this.handleAddInputModalSubmit = this.handleAddInputModalSubmit.bind(this);
		this.changeTime = this.changeTime.bind(this);
		this.showEditInputModal = this.showEditInputModal.bind(this);
		this.hideEditInputModal = this.hideEditInputModal.bind(this);
		this.showEditOutputModal = this.showEditOutputModal.bind(this);
		this.hideEditOutputModal = this.hideEditOutputModal.bind(this);
		this.hideAddOutputModal = this.hideAddOutputModal.bind(this);
		this.showAddOutputModal = this.showAddOutputModal.bind(this);
		this.handleAddOutputModalSubmit = this.handleAddOutputModalSubmit.bind(this);
		this.editChangeTime = this.editChangeTime.bind(this);
		this.editChangeTitle = this.editChangeTitle.bind(this);
		this.editRulePage = this.editRulePage.bind(this);
		this.getTabRuleStatus = this.getTabRuleStatus.bind(this);
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

	handleHidePointModal = () => {
		const { showPointModal } = this.props
		showPointModal(modalTypes.POINT_MODAL)

	}

	hideAddInputModal = () => {
		this.setState({
			isShowAddInputModal: false
		})
	}

	showAddInputModal = () => {
		//添加输入条件前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: '错误提示',
				content: "请先在当前分组中创建规则！"
			})
		} else {
			this.setState({
				isShowAddInputModal: true
			})
		}
	}

	showEditInputModal = (value, name) => {
		this.setState({
			isShowEditInputModal: true,
			editInputScript: value,
			editInputDesc: name
		})
	}

	hideEditInputModal = () => {
		this.setState({
			isShowEditInputModal: false
		})
	}

	//输出
	hideAddOutputModal = () => {
		this.setState({
			isShowAddOutputModal: false
		})
	}

	showAddOutputModal = () => {
		//添加输出动作前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: '错误提示',
				content: "请先在当前分组中创建规则！"
			})
		} else {
			this.setState({
				isShowAddOutputModal: true
			})
		}
	}

	showEditOutputModal = (value, name) => {
		this.setState({
			isShowEditOutputModal: true,
			editOutputScript: value,
			editOutputDesc: name
		})
	}

	hideEditOutputModal = () => {
		this.setState({
			isShowEditOutputModal: false
		})
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
		//复制的规则，默认是关闭状态
		currentScript.enabled = 0
		this.setState({
			copyFlag: true
		}, () => { this.addTitleModal(currentScript) })

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




	//删除输入条件
	deleteInput = () => {
		let currentKey = this.state.currentKey
		if (this.state.currentScript.inputList.length != 0) {
			let deleteIndex = -1
			let newInputList = []
			let currentScript = this.state.currentScript
			let inputList = this.state.currentScript.inputList
			inputList.forEach((item, i) => {
				if (item.script == this.state.editInputScript) {
					deleteIndex = i
				}
			})
			if (deleteIndex != -1) {
				for (let m = 0, len = inputList.length; m < len; m++) {
					if (m != deleteIndex) {
						newInputList.push(inputList[m])
					}
				}
				currentScript.inputList = newInputList
				console.log(currentScript)

				this.setState({
					layoutVisible: false
				})

				//保存删除后的结构
				http.post('/project/saveConfig', {
					"key": currentKey,
					"config": JSON.stringify(currentScript)
				}).then(
					data => {
						if (data.status) {
							this.getScriptRuleFromConfig(currentKey);

						} else {
							this.setState({
								layoutVisible: true
							})
							Modal.error({
								title: '错误提示',
								content: "删除输入条件失败"
							})
						}
						this.hideEditInputModal();
					}
				).catch(
					err => {
						this.setState({
							layoutVisible: true
						})
						Modal.error({
							title: '错误提示',
							content: "删除输入条件失败"
						})
					}
				)

			}
		}
	}

	//输入
	handleAddInputModal = () => {
		this.showAddInputModal()
	}
	//添加输入条件
	handleAddInputModalSubmit = (obj) => {
		let currentKey = this.state.currentKey
		let currentScript = this.state.currentScript
		console.log(currentScript)
		if (currentScript != undefined && currentScript.inputList != undefined) {
			currentScript.inputList.push(obj)

			this.setState({
				layoutVisible: false
			})

			http.post('/project/saveConfig', {
				"key": currentKey,
				"config": JSON.stringify(currentScript)
			}).then(
				data => {
					if (data.status) {
						this.getScriptRuleFromConfig(currentKey);

					} else {
						this.setState({
							layoutVisible: true
						})
						Modal.error({
							title: '错误提示',
							content: "添加规则页面失败"
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
						content: "添加条件失败"
					})
				}
			)
		} else {
			Modal.error({
				title: '错误提示',
				content: "添加条件失败，该规则结构错误，请点击“清空”后重新操作！"
			})
		}
	}

	handleEditInputModalSubmit = (obj) => {
		console.log(this.state, obj)
		let currentKey = this.state.currentKey
		if (this.state.currentScript.inputList.length != 0) {
			let editIndex = -1
			let newInputList = []
			let currentScript = this.state.currentScript
			let inputList = this.state.currentScript.inputList
			inputList.forEach((item, i) => {
				if (item.script == this.state.editInputScript) {
					editIndex = i
				}
			})
			if (editIndex != -1) {
				for (let m = 0, len = inputList.length; m < len; m++) {
					if (m != editIndex) {
						newInputList.push(inputList[m])
					} else {
						newInputList.push(obj)
					}
				}
				currentScript.inputList = newInputList
				console.log(currentScript)

				this.setState({
					layoutVisible: false
				})
				//保存编辑后的条件
				http.post('/project/saveConfig', {
					"key": currentKey,
					"config": JSON.stringify(currentScript)
				}).then(
					data => {
						if (data.status) {
							this.getScriptRuleFromConfig(currentKey);

						} else {
							this.setState({
								layoutVisible: true
							})
							Modal.error({
								title: '错误提示',
								content: "修改输入条件失败"
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
							content: "修改输入条件失败"
						})
					}
				)
			} else {
				Modal.error({
					title: '错误提示',
					content: "修改输入条件失败"
				})
			}
		} else {
			Modal.error({
				title: '错误提示',
				content: "修改输入条件失败"
			})
		}

	}

	//输出
	handleAddOutputModal = () => {
		this.showAddOutputModal()
	}
	//添加 输出动作
	handleAddOutputModalSubmit = (obj) => {
		let currentKey = this.state.currentKey
		let currentScript = this.state.currentScript
		console.log(currentScript)
		if (currentScript.outputList != undefined) {
			currentScript.outputList.push(obj)

			this.setState({
				layoutVisible: false
			})

			http.post('/project/saveConfig', {
				"key": currentKey,
				"config": JSON.stringify(currentScript)
			}).then(
				data => {
					if (data.status) {
						this.getScriptRuleFromConfig(currentKey);

					} else {
						this.setState({
							layoutVisible: true
						})
						Modal.error({
							title: '错误提示',
							content: "添加输出动作失败"
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
						content: "添加输出动作失败"
					})
				}
			)
		} else {
			Modal.error({
				title: '错误提示',
				content: "添加输出动作失败，该规则结构错误，请点击“清空”后重新操作！"
			})
		}
	}

	handleEditOutputModalSubmit = (obj) => {
		console.log(this.state, obj)
		let currentKey = this.state.currentKey
		if (this.state.currentScript.outputList.length != 0) {
			let editIndex = -1
			let newInputList = []
			let currentScript = this.state.currentScript
			let outputList = this.state.currentScript.outputList
			outputList.forEach((item, i) => {
				if (item.script == this.state.editOutputScript) {
					editIndex = i
				}
			})
			if (editIndex != -1) {
				for (let m = 0, len = outputList.length; m < len; m++) {
					if (m != editIndex) {
						newInputList.push(outputList[m])
					} else {
						newInputList.push(obj)
					}
				}
				currentScript.outputList = newInputList
				console.log(currentScript)

				this.setState({
					layoutVisible: false
				})
				//保存编辑后的条件
				http.post('/project/saveConfig', {
					"key": currentKey,
					"config": JSON.stringify(currentScript)
				}).then(
					data => {
						if (data.status) {
							this.getScriptRuleFromConfig(currentKey);

						} else {
							this.setState({
								layoutVisible: true
							})
							Modal.error({
								title: '错误提示',
								content: "修改输出动作失败"
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
							content: "修改输出动作失败"
						})
					}
				)
			} else {
				Modal.error({
					title: '错误提示',
					content: "修改输出动作失败"
				})
			}
		} else {
			Modal.error({
				title: '错误提示',
				content: "修改输出动作失败"
			})
		}

	}

	//删除输出动作
	deleteOutput = () => {
		let currentKey = this.state.currentKey
		if (this.state.currentScript.outputList.length != 0) {
			let deleteIndex = -1
			let newOutputList = []
			let currentScript = this.state.currentScript
			let outputList = this.state.currentScript.outputList
			outputList.forEach((item, i) => {
				if (item.script == this.state.editOutputScript) {
					deleteIndex = i
				}
			})
			if (deleteIndex != -1) {
				for (let m = 0, len = outputList.length; m < len; m++) {
					if (m != deleteIndex) {
						newOutputList.push(outputList[m])
					}
				}
				currentScript.outputList = newOutputList
				console.log(currentScript)

				this.setState({
					layoutVisible: false
				})

				//保存删除后的结构
				http.post('/project/saveConfig', {
					"key": currentKey,
					"config": JSON.stringify(currentScript)
				}).then(
					data => {
						if (data.status) {
							this.getScriptRuleFromConfig(currentKey);

						} else {
							this.setState({
								layoutVisible: true
							})
							Modal.error({
								title: '错误提示',
								content: "删除输出动作失败"
							})
						}
						this.hideEditOutputModal();
					}
				).catch(
					err => {
						this.setState({
							layoutVisible: true
						})
						Modal.error({
							title: '错误提示',
							content: "删除输出动作失败"
						})
					}
				)

			}
		}
	}

	componentDidMount() {
		this.getScriptRuleFromConfig();
		localStorage.setItem("scriptTabKey",'1');

	}
	//检测对比新数据
	componentWillReceiveProps(nextProps) {
		if (this.props.scriptRefreshFlag != nextProps.scriptRefreshFlag) {
			//刷新时，是刷新所有的规则，并保留在当前tab,自动跳转到当前tab的第一个
			if (localStorage.getItem("scriptTabKey") != undefined) {
				let tabKey = localStorage.getItem("scriptTabKey")
				let newRuleKey = (Number(tabKey)-1)*15+1
				let scriptKey = ""
				if (newRuleKey < 10) {
					scriptKey = "script_rule_00" + newRuleKey;
				} else {
					if (newRuleKey < 100) {
						scriptKey = "script_rule_0" + newRuleKey;
					} else {
						scriptKey = "script_rule_" + newRuleKey;
					}
				}
				this.setState({
					currentKey: scriptKey,
					curTabkey:tabKey
				});
				this.getScriptRuleFromConfig(scriptKey);
			} else {
				this.getScriptRuleFromConfig();
			}
		}
	}

	//从项目配置中获取所有的脚本规则配置
	getScriptRuleFromConfig(currentKey) {
		http.post('/project/getConfigMul', {
			"keyList": scriptRuleListNameArr
		}).then(
			res => {
				if (res.status && Object.keys(res.data).length != 0) {
					// console.log(Object.values(res.data)[0])
					let titleList = [];
					let nubList = [0,0,0,0,0,0,0,0,0,0]
					let nameList = Object.keys(res.data);
					Object.values(res.data).forEach((element,ele) => {
						if (element.title != undefined) {
							titleList.push(element.title)
						} else {
							titleList.push("暂无标题")
						}
						//整理每组正在运行的规则数量
						for (let i=0;i<10;i++) {
							if (i*15 < Number(nameList[ele].substr(-3)) && Number(nameList[ele].substr(-3)) < ((i+1)*15+1)) {
								if (element.enabled == 1 || element.enabled == undefined) {
									nubList[i]+= 1;
								}
							}
						}
					});
					if (currentKey != null) {
						if (nameList.length ==1) {
							this.getTabRuleStatus(this.state.curTabkey,nameList,res.data,true).then((statusList)=>{
								this.setState({
									allContentList: res.data,
									ruleNameList: nameList,
									ruleTitleList: titleList,
									currentKey: currentKey,
									currentScript: res.data[currentKey],
									layoutVisible: true,
									statusList:statusList,
									runningNubList:nubList
								})
							})
						}else {
							this.getTabRuleStatus(this.state.curTabkey).then((statusList)=>{
								this.setState({
									allContentList: res.data,
									ruleNameList: nameList,
									ruleTitleList: titleList,
									currentKey: currentKey,
									currentScript: res.data[currentKey],
									layoutVisible: true,
									statusList:statusList,
									runningNubList:nubList
								})
							})
						}
					} else {
						this.getTabRuleStatus(1,nameList,res.data,true).then((statusList)=>{
							this.setState({
								allContentList: res.data,
								ruleNameList: nameList,
								ruleTitleList: titleList,
								currentKey: nameList[0],
								currentScript: res.data[nameList[0]],
								layoutVisible: true,
								statusList:statusList,
								runningNubList:nubList
							})
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

	//获取规则的输入条件当前状态
	getTabRuleStatus(key,nameList,allContent,flag) {
		let ruleNameList = flag == true ? nameList :  this.state.ruleNameList 
		let allContentList = flag == true ? allContent : this.state.allContentList 
		this.setState({
			layoutVisible: false
		})
		return new Promise((resolve,reject)=>{
			let scriptList = []
			let statusList = {}
			let scriptDataObj = {}
			if (ruleNameList.length != 0) {
				//将tab里的所有规则里的输入条件点名整理出来，一起去请求实时数据，然后检测每个规则当前输入条件是否全部满足，满足则“规则名称”显示红色；否则显示绿色
				ruleNameList.forEach((jtem, j) => {
					if ((key - 1) * 15 < Number(jtem.substr(-3)) && Number(jtem.substr(-3)) < (key * 15 + 1)) {
						if (allContentList[jtem].inputList !=undefined) {
							if (allContentList[jtem].inputList.length !=0 && allContentList[jtem].enabled !=0) {
								//先默认开着的规则输入条件都不满足
								statusList[jtem]=false
								//取脚本
								allContentList[jtem].inputList.forEach((item,i)=>{
									if (item.script != undefined) {
										scriptList.push(item.script)
									}
								})
							}
						}else {
							console.log("规则脚本有误"+JSON.stringify(allContentList[jtem]))
						}
						
					}
				})
				if (scriptList.length !=0) {
					http.post('/get_realtimedata', {
						proj: 1,
						pointList: [],
						scriptList: scriptList
					}).then(
						res => {
							if (res.length != 0) {
								try {
									res.forEach(row => {
										scriptDataObj[row.name] = row.value
									})
									ruleNameList.forEach((jtem, j) => {
										if ((key - 1) * 15 < Number(jtem.substr(-3)) && Number(jtem.substr(-3)) < (key * 15 + 1)) {
											if (allContentList[jtem].inputList !=undefined && allContentList[jtem].enabled !=undefined) {
												if (allContentList[jtem].inputList.length !=0 && allContentList[jtem].enabled !=0) {
													try {
														allContentList[jtem].inputList.forEach((item,i)=>{
															if (scriptDataObj[item.script]) {
																if (i == allContentList[jtem].inputList.length-1) {
																	statusList[jtem]=true
																}
															}else {
																throw Error();
															}
														})
													} catch(error) {
		
													}
												}
											}else {
												console.log("规则脚本有误"+JSON.stringify(allContentList[jtem]))
											}
										}
									})
									
									resolve(statusList) 
								} catch (e) {
									Modal.error({
										title: '错误提示',
										content: "后台请求实时数据失败！"
									});
									resolve({}) 
								}
							} else {
								Modal.error({
									title: '错误提示',
									content: "后台请求实时数据失败！"
								});
								resolve({}) 
							}
							
						}
					).catch(
						err => {
							Modal.error({
								title: '错误提示',
								content: "后台请求实时数据失败！"
							});
							resolve({}) 
						}
					)
				}else {
					this.setState({
						layoutVisible: true
					})
					resolve({}) 
					
				}
			}else{
				this.setState({
					layoutVisible: true
				})
			}
			})
		
	}


	//整理左侧菜单
	getScriptRuleList() {
		let menuList = []
		let key = Number(this.state.curTabkey)
		if (this.state.ruleNameList.length != 0) {
				let statusList = this.state.statusList
				menuList = this.state.ruleNameList.map((item, i) => {
					//分tab,每个tab最多显示15个
					if ((key - 1) * 15 < Number(item.substr(-3)) && Number(item.substr(-3)) < (key * 15 + 1)) {
						//默认是白色字体，未启用也是白色
						let titleColor = "#FFFFFF"
						if (this.state.allContentList[item].enabled != 0 && Object.keys(statusList).length !=0) {
							if (statusList[item]) {
								titleColor = "rgb(55 255 95)"
							}else {
								titleColor = "rgb(255 76 76)"
							}
						}
						
						return <MenuItem className={s['menuItem']} style={{ marginTop: "-5px", paddingLeft: "27px", paddingRight: "4px", backgroundColor: this.state.allContentList[item].enabled == 0 ? '#666666' : '#003366', color: "#fff", borderBottom: "1px solid rgb(53 77 86)" }} title={this.state.ruleTitleList[i]} key={item}>
							<span style={{
								fontSize: "10px", display: "inline-block", width: 22, textAlign: 'center', height: 15, lineHeight: "14px", padding: "0 1px", backgroundColor: "#5a6873", color: "#fff", borderRadius: 5, position: 'absolute', left: 2,
								fontWeight: 700
							}}>
								{Number(item.substr(-3))}</span><span style={{color: titleColor}}>{this.state.ruleTitleList[i]}</span> 
							{
								this.state.allContentList[item].enabled == 0 ?
									<Icon style={{ fontSize: "18px" }} type="play-circle" className={s['btnPlay']} onClick={() => { this.handlePlay() }} />
									:
									<Icon style={{ fontSize: "18px" }} type="pause-circle" className={s['btnPause']} onClick={() => { this.handlePause() }} />
							}
							<Icon style={{ fontSize: "18px" }} type="copy" className={s['btnCopy']} onClick={() => { this.handleCopy() }} />
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
				content: '真的要删除此规则脚本吗？',
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
				"keepMinutes": 10,
				"inputList": [],
				"outputList": [],
				"enabled": 0

			})
		}).then(
			data => {
				if (!data.err) {
					this.getScriptRuleFromConfig(currentKey);
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


	//修改脚本
	changeScript({ target: { value } }) {
		this.setState({
			currentScript: JSON.parse(value)
		})
	}

	editModal(currentKey) {
		Modal.confirm({
			title: '编辑脚本',
			content: (
				<div>
					<TextArea
						autoSize={{ minRows: 10, maxRows: 20 }}
						defaultValue={JSON.stringify(this.state.currentScript, null, 4)}
						onChange={this.changeScript}
					/>
				</div>
			),
			onOk: () => { this.saveScript(currentKey, this.state.currentScript) },
			onCancel: () => {
				this.setState({
					currentScript: this.state.allContentList[currentKey]
				})
			},
			okText: "保存",
			icon: <Icon type="edit" />,
			width: 800
		})
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
					this.getScriptRuleFromConfig(currentKey);

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

	addRuleModal() {
		Modal.confirm({
			title: '添加规则脚本',
			content: (
				<div>
					<TextArea
						autoSize={{ minRows: 10, maxRows: 20 }}
						onChange={this.changeAddScript}
					/>
				</div>
			),
			onOk: () => { this.addRulePage(this.state.addChangeScript) },
			onCancel: () => { },
			okText: "添加",
			icon: <Icon type="file-add" />,
			width: 800
		})
	}

	changeAddScript({ target: { value } }) {
		this.setState({
			addChangeScript: value
		})
	}

	//修改规则及标题
	editTitleModal = (currentKey) => {
		//修改规则及标题前，需先判断当前分组是否为空
		if (this.isEmptyFun()) {
			Modal.error({
				title: '错误提示',
				content: "请先在当前分组中创建规则！"
			})
		} else {
			let currentScript = this.state.currentScript
			let orgTitle = currentScript.title
			let orgKeepTime = currentScript.keepMinutes
			//先给state里同步当前信息，防止保存时未修改的信息保存为空
			this.setState({
				editTitle: orgTitle,
				editTime: orgKeepTime
			})
			Modal.confirm({
				title: '修改规则',
				content: (
					<div>
						<span style={{ display: 'inline-block', width: 110 }}>规则名称：</span>
						<Input
							style={{ width: '180px' }}
							onChange={this.editChangeTitle}
							defaultValue={orgTitle}
						/>
						<div>
							<span style={{ display: 'inline-block', width: 110 }}>条件保持时间：</span>
							<InputNumber
								style={{ marginTop: '10px' }}
								defaultValue={orgKeepTime}
								onChange={this.editChangeTime}
							/>
						</div>

					</div>
				),
				onOk: () => { this.editRulePage(this.state.editTitle, this.state.editTime, currentKey, currentScript) },
				onCancel: () => { },
				okText: "修改",
				width: 400
			})
		}

	}

	editChangeTitle({ target: { value } }) {
		this.setState({
			editTitle: value
		})
	}

	editChangeTime(value) {
		this.setState({
			editTime: value
		})
	}

	//修改规则-保存
	editRulePage(editTitle, editTime, currentKey, currentScript) {
		this.setState({
			layoutVisible: false
		})
		currentScript.title = editTitle
		currentScript.keepMinutes = editTime


		http.post('/project/saveConfig', {
			"key": currentKey,
			"config": JSON.stringify(currentScript)
		}).then(
			data => {
				if (data.status) {
					this.getScriptRuleFromConfig(currentKey);

				} else {
					this.setState({
						layoutVisible: true
					})
					Modal.error({
						title: '错误提示',
						content: "修改规则页面失败"
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
					content: " 修改规则页面失败"
				})
			}
		)
	}



	//添加规则及标题
	addTitleModal = (currentScript) => {
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
				this.addRulePage(this.state.addChangeTitle, this.state.addChangeTime, newRuleKey, currentScript);
				this.setState({
					copyFlag: false
				});
			} else {
				Modal.confirm({
					title: '新建规则',
					content: (
						<div>
							<span style={{ display: 'inline-block', width: 110 }}>规则名称：</span>
							<Input
								style={{ width: '180px' }}
								onChange={this.changeTitle}
							/>
							<div>
								<span style={{ display: 'inline-block', width: 110 }}>条件保持时间：</span>
								<InputNumber
									style={{ marginTop: '10px' }}
									defaultValue={this.state.addChangeTime}
									onChange={this.changeTime}
								/>
							</div>

						</div>
					),
					onOk: () => { this.addRulePage(this.state.addChangeTitle, this.state.addChangeTime, newRuleKey) },
					onCancel: () => { },
					okText: "添加",
					icon: <Icon type="file-add" />,
					width: 400
				})
			}
		} else {
			Modal.confirm({
				title: '提示',
				content: '该分组已存满15个规则，请切换至其他分组创建新规则',
				onOk: () => { }
			});
			this.setState({
				copyFlag: false
			})
		}
	}

	changeTitle({ target: { value } }) {
		this.setState({
			addChangeTitle: value
		})
	}

	changeTime(value) {
		this.setState({
			addChangeTime: value
		})
	}


	//新建规则
	addRulePage(addChangeTitle, addChangeTime, newRuleKey, currentScript) {
		/** 不分tab时的新建编号
		let newItem = "script_rule_450"
		if (this.state.ruleNameList.length == 0) {
			newItem = "script_rule_001"
		} else {
			let ruleMax = this.state.ruleNameList[this.state.ruleNameList.length - 1]
			let newRuleKey = Number(ruleMax.substr(-3)) + 1

			if (newRuleKey < 10) {
				newItem = "script_rule_00" + newRuleKey;
			} else {
				if (newRuleKey < 100) {
					newItem = "script_rule_0" + newRuleKey;
				} else {
					newItem = "script_rule_" + newRuleKey;
				}
			}
		}
		*/
		let newItem = "script_rule_450"
		if (newRuleKey < 10) {
			newItem = "script_rule_00" + newRuleKey;
		} else {
			if (newRuleKey < 100) {
				newItem = "script_rule_0" + newRuleKey;
			} else {
				newItem = "script_rule_" + newRuleKey;
			}
		}

		this.setState({
			layoutVisible: false
		})

		let obj = {
			"title": addChangeTitle,
			"keepMinutes": addChangeTime,
			"inputList": [],
			"outputList": [],
			"enabled": 0   //新建的规则默认是停止的，enabled是0，0是停止
		}

		//判断是不是点击的复制，复制的话，直接给脚本
		if (currentScript != undefined) {
			obj.title = currentScript.title + "_copy" + newRuleKey
			obj.keepMinutes = currentScript.keepMinutes
			obj.inputList = currentScript.inputList
			obj.outputList = currentScript.outputList
			obj.enabled = currentScript.enabled
		}

		http.post('/project/saveConfig', {
			"key": newItem,
			"config": JSON.stringify(obj)
		}).then(
			data => {
				if (data.status) {
					this.getScriptRuleFromConfig(newItem);

				} else {
					this.setState({
						layoutVisible: true
					})
					Modal.error({
						title: '错误提示',
						content: "添加规则页面失败"
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
					content: "添加规则页面失败"
				})
			}
		)
	}

	callback = (key) => {
		this.getTabRuleStatus(key).then((statusList)=>{
			this.setState({
				curTabkey: key,
				statusList:statusList,
				layoutVisible:true
			})
			//当切换的分组不为空时，自动选中分组中的第一个
			if (this.isEmptyFun) {
				let firstNo = (Number(key) - 1) * 15 + 1
				let firstRuleName = ""
				if (firstNo < 10) {
					firstRuleName = "script_rule_00" + firstNo;
				} else {
					if (firstNo < 100) {
						firstRuleName = "script_rule_0" + firstNo;
					} else {
						firstRuleName = "script_rule_" + firstNo;
					}
				}
				let selectRule = this.state.allContentList[firstRuleName]
				let selectKey = firstRuleName
				this.setState({
					currentKey: selectKey,
					currentScript: selectRule
				})
			}
			localStorage.setItem("scriptTabKey",key);
		})
		
	}

	render() {
		const style = { height: 950, width: '100%' }
		const {
			hidePointModal,
			selectedIds,
			pointData,
			showPointModal,
			onSelectChange
		} = this.props

		let selectedPoint = pointData != undefined ? pointData.filter(item => {
			if (selectedIds[0] === item.name) return item
		})[0] || {} : {};

		return (
			<div style={style} className={s['inner-container']} >
				<Spin tip="正在读取数据" spinning={!this.state.layoutVisible}>
					<Tabs activeKey={this.state.curTabkey} onChange={this.callback} >
					
						{
							tabNumArr.map((item, i) => {
								return (
									<TabPane 
										tab={<Badge count={this.state.runningNubList[i]} offset={[5,0]} style={{ backgroundColor: 'rgb(26 165 196)', height:15,lineHeight:'15px',color:'#fff'}}>
												<span>{"分组" + item}</span>
											</Badge>} 
										key={item}
									>
										<Layout>
											<Sider width={260}>
												<div style={{ height: '787px', borderBottom: '1px solid white' }}>
													<Menu
														selectedKeys={[this.state.currentKey]}
														mode="inline"
														onClick={this.handleClick}
														className='scriptRule'
													>
														{this.getScriptRuleList()}
													</Menu>
												</div>

												<div className={s['sider-footer']} >
													<Button type='primary' icon="plus"
														onClick={this.addTitleModal}
													>
													</Button>
												</div>
											</Sider>
											<Layout>
												<Header>
													{
														this.state.ruleNameList.length != 0 ?
															<div style={{ overflow: 'hidden' }}>
																<div style={{ float: "left" }}>
																	<Button type="primary" onClick={() => { this.handleAddInputModal(this.state.currentKey) }}>添加输入条件</Button>
																</div>
																<div style={{ float: "right" }}>
																	<Button type="primary" onClick={() => { this.handleAddOutputModal(this.state.currentKey) }}>添加输出动作</Button>
																	<Button style={{ marginLeft: "15px" }} onClick={() => { this.editTitleModal(this.state.currentKey) }}>修改规则信息</Button>
																	<Button type="danger" style={{ marginLeft: "10px" }} icon="delete" onClick={() => { this.deleteModal(this.state.currentKey) }}>清空</Button>
																</div>
															</div>
															:
															""
													}
												</Header>
												<Content>
													<div id={item} style={{ height: style.height - 180 }}>
														<TreeView
															allContentList={this.state.allContentList}
															currentKey={this.state.currentKey}
															style={style}
															currentScript={this.state.currentScript}
															showEditInputModal={this.showEditInputModal}
															showEditOutputModal={this.showEditOutputModal}
															editTitleModal={this.editTitleModal}
														/>
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
				<AddInputModal
					visible={this.state.isShowAddInputModal}
					handleHide={this.hideAddInputModal}
					handleOk={this.handleAddInputModalSubmit}
					selectedPoint={selectedPoint}
					showPointModal={showPointModal}
					onSelectChange={onSelectChange}
					hidePointModal={hidePointModal}
				/>

				<EditInputModal
					visible={this.state.isShowEditInputModal}
					handleHide={this.hideEditInputModal}
					handleOk={this.handleEditInputModalSubmit}
					selectedPoint={selectedPoint}
					showPointModal={showPointModal}
					editInputScript={this.state.editInputScript}
					editInputDesc={this.state.editInputDesc}
					deleteInput={this.deleteInput}
					hidePointModal={hidePointModal}
					onSelectChange={onSelectChange}
				/>
				<AddOutputModal
					visible={this.state.isShowAddOutputModal}
					handleHide={this.hideAddOutputModal}
					handleOk={this.handleAddOutputModalSubmit}
					selectedPoint={selectedPoint}
					showPointModal={showPointModal}
					onSelectChange={onSelectChange}
					hidePointModal={hidePointModal}
				/>

				<EditOutputModal
					visible={this.state.isShowEditOutputModal}
					handleHide={this.hideEditOutputModal}
					handleOk={this.handleEditOutputModalSubmit}
					selectedPoint={selectedPoint}
					showPointModal={showPointModal}
					editOutputScript={this.state.editOutputScript}
					editOutputDesc={this.state.editOutputDesc}
					deleteOutput={this.deleteOutput}
					hidePointModal={hidePointModal}
					onSelectChange={onSelectChange}
				/>
				<PointModalView
					hidePointModal={this.props.hidePointModal}
				/>
			</div>
		)
	}
}
export default ScriptRuleModalView;
