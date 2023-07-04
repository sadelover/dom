/**
 * 系统工具--优化调试展示页面
 */

import React, { PropTypes } from 'react';
import { Select, Dropdown, Button, Menu, Tabs, Spin, Modal } from 'antd';
import AddConfigModal from './AddConfigModalView';
import PageList from './PageListView';
import RightModal from './RightModalView';
import ConditionModal from './ConditionModalView';
import EditConditionModal from './EditConditionModalView';
import s from './ExpertOptimizeModalView.css';
import http from '../../../common/http';
import moment from 'moment';

const TabPane = Tabs.TabPane;
const Option = Select.Option

let bgStyle, textStyle, bgContentStyle, footBorderStyle;
if (localStorage.getItem('serverOmd') == "best") {
	bgStyle = {
		background: "RGB(240,240,240)",
		borderRight: "1px solid #B5B5B5"
	}
	textStyle = {
		color: "#000",
		border: "1px solid #000"
	}
	bgContentStyle = {
		background: "RGB(255,255,255)"
	}
	footBorderStyle = {
		borderTop: "1px solid #B5B5B5"
	}
}
if (localStorage.getItem('serverOmd') == "persagy") {
	bgStyle = {
		background: "rgba(247,249,250,1)",
		borderRight: "1px solid rgba(240,241,242,1)"
	}
	textStyle = {
		color: "RGB(31,31,31)",
		border: "1px solid RGB(50,50,50)"
	}
	bgContentStyle = {
		background: "RGB(255,255,255)"
	}
	footBorderStyle = {
		borderTop: "1px solid RGB(150,150,150)"
	}
}


class ExpertOptimizeModalView extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			configList: [],
			curConfig: {},
			configNameList: [],
			pointList: [],
			pointNameList: [],
			actionList: [],
			env: [],
			reward: {},
			headerListCN: [],
			headerList: [],
			envPoints: [],
			envPointsName: [],
			barData: [],
			activeKey: "1",
			curConfigKey: "",
			layoutVisible: false,
			isShowAddConfigModal: false,
			isShowConditionModal: false,
			isShowConditionTimeModal: false,
			isShowEditConditionModal: false,
			selectKey: [],
			selectRow: []
		}

		this.saveBarData = this.saveBarData.bind(this);
		this.handelChangeTab = this.handelChangeTab.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.changeConfig = this.changeConfig.bind(this);
		this.collateData = this.collateData.bind(this);
		this.tidyConfig = this.tidyConfig.bind(this);
		this.tidyCondition = this.tidyCondition.bind(this);
		this.handelSelectRow = this.handelSelectRow.bind(this);

	}
	componentDidMount() {
		let configList = []
		let curConfig = {}
		let configNameList = []
		this.setState({
			layoutVisible: true
		})
		http.post('/project/getConfigMul', {
			keyList: [
				"expert_optimize_config"
			]
		}).then(data => {
			//获取专家优化调试学习表配置
			if (data.data && data.data.expert_optimize_config != undefined) {
				localStorage.setItem('expertOptimizeConfig', JSON.stringify(data.data.expert_optimize_config));
				//数组-多个调试配置结构
				configList = data.data.expert_optimize_config.data
				if (configList.length != 0) {
					curConfig = configList[0]
					configList.forEach(item => {
						configNameList.push(item.name)
					})

					this.setState({
						configList: configList,
						curConfig: curConfig,
						configNameList: configNameList,
						curConfigKey: 0,
						layoutVisible: false
					})
					// console.log(configList,curConfig)

					//整理数据
					// this.collateData(curConfig)
				}else {
					//如果将配置都删除了，则data里是空数组
					localStorage.setItem('expertOptimizeConfig', null);
					this.setState({
						configList: configList,
						curConfig: curConfig,
						configNameList: configNameList,
						layoutVisible: false
					})
				}

			} else {
				localStorage.setItem('expertOptimizeConfig', null);
				this.setState({
					configList: configList,
					curConfig: curConfig,
					configNameList: configNameList,
					layoutVisible: false
				})
			}

		}).catch(
			err => {
				this.setState({
					configList: configList,
					curConfig: curConfig,
					configNameList: configNameList,
					layoutVisible: false
				})
			}
		)
	}

	getConfigList = (key) => {
		let configList = []

		let curConfig = {}
		let configNameList = []
		this.setState({
			layoutVisible: true
		})
		http.post('/project/getConfigMul', {
			keyList: [
				"expert_optimize_config"
			]
		}).then(data => {
			//获取专家优化调试学习表配置
			if (data.data && data.data.expert_optimize_config != undefined) {
				localStorage.setItem('expertOptimizeConfig', JSON.stringify(data.data.expert_optimize_config));
				//数组-多个调试配置结构
				configList = data.data.expert_optimize_config.data
				if (configList.length != 0) {
					// console.log(configList,curConfig)
					if (key != undefined) {
						//传key说明是修改工况，需要直接请求展示出数据
						curConfig = configList[key]
						configList.forEach(item => {
							configNameList.push(item.name)
						})

						this.setState({
							configList: configList,
							curConfig: curConfig,
							configNameList: configNameList,
							curConfigKey: key,
							layoutVisible: false
						})
						//整理数据
						this.collateData(curConfig)
					} else {
						//不传key说明是新建，不需要直接请求历史数据，默认选择
						curConfig = configList[configList.length - 1]
						configList.forEach(item => {
							configNameList.push(item.name)
						})

						this.setState({
							configList: configList,
							curConfig: curConfig,
							configNameList: configNameList,
							curConfigKey: configList.length - 1,
							layoutVisible: false
						})
					}

				}else {
					//如果将配置都删除了，则data里是空数组
					localStorage.setItem('expertOptimizeConfig', null);
					this.setState({
						configList: configList,
						curConfig: curConfig,
						configNameList: configNameList,
						layoutVisible: false
					})
				}
			} else {
				localStorage.setItem('expertOptimizeConfig', null);
				this.setState({
					configList: configList,
					curConfig: curConfig,
					configNameList: configNameList,
					layoutVisible: false
				})
			}

		}).catch(
			err => {
				this.setState({
					configList: configList,
					curConfig: curConfig,
					configNameList: configNameList,
					layoutVisible: false
				})
			}
		)
	}

	//整理表格、右侧图表的数据
	collateData = (curConfig) => {
		let pointList = []
		let actionList = []
		let env = []
		let reward = {}
		let allPointList = []
		let pointNameList = []
		let envPoints = []
		let envPointsName = []

		if (localStorage.getItem('allPointList') != undefined) {
			allPointList = JSON.parse(localStorage.getItem('allPointList'))
		}

		if (curConfig.actionList != undefined) {
			actionList = curConfig.actionList
		}
		if (curConfig.env != undefined) {
			env = curConfig.env
		}
		if (curConfig.reward != undefined) {
			reward = curConfig.reward
		}
		if (curConfig.reward != undefined && curConfig.env != undefined) {
			if (env.length) {
				env.forEach((item, index) => {
					if (item.point) {
						pointList.push(item.point);
						envPoints.push(item.point)
						//遍历点注释列表，给每个列名点找到相应注释
						if (allPointList.length) {
							allPointList.forEach(point => {
								if (item.point == point.name) {
									pointNameList.push(`平均${point.description}`)
									envPointsName.push(`平均${point.description}`)
								}
							})
						}
					}
				})
			}

			if (curConfig.reward.cost != undefined && curConfig.reward.win != undefined) {
				//遍历点注释列表，给每个列名点找到相应注释
				if (allPointList.length) {
					allPointList.forEach(point => {
						if (curConfig.reward.cost == point.name) {
							pointNameList.push(`总累积${point.description}`)
						}
					})
					pointList.push(curConfig.reward.cost);


					allPointList.forEach(point => {
						if (curConfig.reward.win == point.name) {
							pointNameList.push(`总累积${point.description}`)
						}
					})
					pointList.push(curConfig.reward.win);

				}
			}else {
				if (curConfig.reward.custom != undefined) {
					pointList.push(curConfig.reward.custom);
				}
			}

			//保存数据结构
			this.props.saveActionList(actionList);
			//请求数据
			if (actionList.length) {
				this.props.saveEndFlag(false)
				actionList.forEach((item, index) => {
					//如果“采集工况”配置的是延时时间，暂且请求接口，且写空；下面的if判断可排除未来时间的配置，但是这样表格无法显示未来的配置信息
					// if (moment(item.actStartTime).isBefore(moment(),"seconds") ) {
					this.props.getHistory(item.actStartTime, item.actEndTime, pointList, actionList)
					// }
				})
			}
		}
		this.setState({
			pointList: pointList,
			actionList: actionList,
			env: env,
			reward: reward,
			pointNameList: pointNameList,
			envPoints: envPoints,
			envPointsName: envPointsName
		})
		// console.log(curConfig)
	}

	//保存从表格里整理的柱状图所需的数据
	saveBarData(data) {
		this.setState({
			barData: data
		})
	}

	handelChangeTab = (key) => {
		this.setState({
			activeKey: key
		})
	}

	getOptions = () => {
		return this.state.configNameList.map((tab, t) => {
			return (
				<Option value={t} key={t} >{tab}</Option>
			)
		})
	}
	//选择不同的调试表
	handleChange = (value) => {
		this.setState({
			curConfigKey: value
		})
	}
	//查询对应的调试表的数据
	changeConfig = () => {
		//要使用原本的数据结构，不然数据结构是增加后的，导致endFlag判断有误，柱状图一直刷新
		let originalConfigList = JSON.parse(localStorage.getItem("expertOptimizeConfig")).data
		this.setState({
			curConfig: originalConfigList[this.state.curConfigKey]
		})
		if (originalConfigList[this.state.curConfigKey].actionList == undefined) {
			return;
		}
		this.props.saveActionList([]);
		this.collateData(originalConfigList[this.state.curConfigKey])
	}

	handelShowAddConfigModal = () => {
		this.setState({
			isShowAddConfigModal: true
		})
	}

	hideAddConfigModal = () => {
		this.setState({
			isShowAddConfigModal: false
		})
	}

	editCondition=(action)=> {
		if (this.state.selectKey.length !=0) {
			//要使用原本的数据结构，不然数据结构是增加后的，有map、time等
			let originalConfigList = JSON.parse(localStorage.getItem("expertOptimizeConfig")).data
			if (originalConfigList[this.state.curConfigKey].actionList != undefined && originalConfigList[this.state.curConfigKey].actionList.length != 0) {
				//防止重复添加“基准工况”
				let benchmarkFlag = false;
				let benchmarkIndex = null;
				originalConfigList[this.state.curConfigKey].actionList.forEach((item,index) => {
					if (item.benchmark != undefined && item.benchmark == 1) {
						benchmarkFlag = true;
						benchmarkIndex = index
					}
				})
				if (benchmarkFlag && action.benchmark != undefined && benchmarkIndex != this.state.selectKey[0]) {
					Modal.error({
						title: '错误提示',
						content: "该记录下已存在“基准工况”，所以此次修改工况添加失败。"
					})
					return;
				}

				if (action.benchmark != undefined) {
					action['benchmark'] = 1
				}
				originalConfigList[this.state.curConfigKey].actionList[this.state.selectKey[0]]=action
				let wrapConfig = {
					"data": originalConfigList
				}
				this.saveConfig(wrapConfig, this.state.curConfigKey)
			}
		}
	}

	//整理工况结构
	 tidyCondition(action) {
		//先检测当前配置中，是否有外层的actionList配置结构（即是否是第一次新建）
		if (this.state.curConfig.actionList != undefined && this.state.curConfig.actionList.length != 0) {
			console.log(this.state.curConfig.actionList)
			//要使用原本的数据结构，不然数据结构是增加后的，有map、time等
			let originalConfigList = JSON.parse(localStorage.getItem("expertOptimizeConfig")).data
			if (originalConfigList[this.state.curConfigKey].actionList != undefined && originalConfigList[this.state.curConfigKey].actionList.length != 0) {
				//防止重复添加“基准工况”
				let benchmarkFlag = false;
				originalConfigList[this.state.curConfigKey].actionList.forEach(item => {
					if (item.benchmark != undefined && item.benchmark == 1) {
						benchmarkFlag = true
					}
				})
				if (benchmarkFlag && action.benchmark != undefined) {
					Modal.error({
						title: '错误提示',
						content: "该记录下已存在“基准工况”，所以此次采集工况添加失败，请重新填写。"
					})
					return;
				}

				if (action.benchmark != undefined) {
					action['benchmark'] = 1
				}
				originalConfigList[this.state.curConfigKey].actionList.push(action)
				let wrapConfig = {
					"data": originalConfigList
				}
				this.saveConfig(wrapConfig, this.state.curConfigKey)
			}
		} else {
			let actionList = [action]
			//要使用原本的数据结构，不然数据结构是增加后的，有map、time等
			let originalConfigList = JSON.parse(localStorage.getItem("expertOptimizeConfig")).data
			originalConfigList[this.state.curConfigKey]["actionList"] = actionList
			let wrapConfig = {
				"data": originalConfigList
			}
			this.saveConfig(wrapConfig)
		}
	}

	//整理新建的记录表结构
	tidyConfig(config) {
		//先检测当前配置中，是否有最外层的配置结构（即是否是第一次新建）
		if (this.state.configList != undefined && this.state.configList.length != 0) {
			//要使用原本的数据结构，不然数据结构是增加后的，有map、time等
			let originalConfigList = JSON.parse(localStorage.getItem("expertOptimizeConfig")).data
			originalConfigList.push(config)
			let wrapConfig = {
				"data": originalConfigList
			}
			this.saveConfig(wrapConfig)
		} else {
			let wrapConfig = {
				"data": [config]
			}
			this.saveConfig(wrapConfig)
		}
	}

	//保存整个配置
	saveConfig = (configList, configKey) => {
		this.setState({
			layoutVisible: true
		})
		http.post('/project/saveConfig', {
			"key": "expert_optimize_config",
			"config": JSON.stringify(configList)
		}).then(
			data => {
				if (data.status) {
					if (configKey != undefined) {
						this.getConfigList(configKey);
					} else {
						this.getConfigList();
					}


				} else {
					this.setState({
						layoutVisible: false
					})
					Modal.error({
						title: '错误提示',
						content: "保存记录表失败"
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
					content: "保存记录表失败"
				})
			}
		)
	}

	handelShowConditionModal = () => {
		if (this.state.configList == undefined || this.state.configList.length == 0 || JSON.stringify(this.state.curConfig) == "{}") {
			Modal.info({
				title: '操作提示',
				content: "无法创建工况，请先创建记录表！"
			})
			return;
		}
		this.setState({
			isShowConditionModal: true
		})
	}

	handelShowEditConditionModal = () => {
		if (this.state.configList == undefined || this.state.configList.length == 0 || JSON.stringify(this.state.curConfig) == "{}") {
			Modal.info({
				title: '操作提示',
				content: "无法修改工况，请先创建记录表！"
			})
			return;
		}
		if (this.state.selectKey.length ==0) {
			Modal.info({
				title: '操作提示',
				content: "请先在表格第一列选中要修改的工况！"
			})
			return;
		}
		this.setState({
			isShowEditConditionModal: true
		})
	}

	handelShowConditionTimeModal = () => {
		this.setState({
			isShowConditionTimeModal: true
		})
	}

	hideConditionModal = () => {
		this.setState({
			isShowConditionModal: false
		})
	}

	hideEditConditionModal = () => {
		this.setState({
			isShowEditConditionModal: false
		})
	}

	hideConditionTimeModal = () => {
		this.setState({
			isShowConditionTimeModal: false
		})
	}

	handelSelectRow = (key, row) => {
		this.setState({
			selectKey: key,
			selectRow: row
		})
	}

	handelDel = () => {
		if (this.state.curConfigKey === "" || this.state.configNameList[this.state.curConfigKey] == undefined) {
			Modal.info({
				title: '操作提示',
				content: "请在下拉列表里选择要删除的记录表。"
			})
			return;
		}
		Modal.confirm({
			title: '确认删除',
			content: `确认要删除 ${this.state.configNameList[this.state.curConfigKey]} 记录表吗？`,
			okText: '删除',
			cancelText: '取消',
			onOk: () => {
				let config = this.state.configList
				config.splice(this.state.curConfigKey,1)
				let wrapConfig = {
					"data": config
				}
				this.saveConfig(wrapConfig)
			}
		});
	}



	render() {
		const {
			actionListData,
			endFlag
		} = this.props;
		return (
			<div>
				{
					this.state.layoutVisible ?
						<div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
							<Spin tip="正在读取数据" />
						</div>

						:
						<div className={s['inner-container']}>
							<div className={s['left-sider']} style={bgStyle}>
								<div className={s['sider-content']}>
									<Button onClick={this.handelShowAddConfigModal} style={{ marginRight: 5, display: 'inline-block', marginTop: 10 }}>新建记录表</Button>
									<Button onClick={this.handelDel} style={{ marginRight: 5, display: 'inline-block', marginTop: 10 }}>删除记录表</Button>
									<Select value={this.state.curConfigKey} style={{ width: 280, display: 'inline-block', marginTop: 10, marginLeft: 10 }} onChange={this.handleChange} >
										{this.getOptions()}
									</Select>
									<Button type="primary" onClick={this.changeConfig} style={{ marginRight: 5, display: 'inline-block', marginTop: 10 }}>查询</Button>
									<div style={{ float: 'right', display: 'inline-block', marginTop: 10 }}>
										<Button onClick={this.handelShowEditConditionModal} style={{ marginRight: 10, display: 'inline-block' }}>修改工况</Button>
										<Button onClick={this.handelShowConditionModal} style={{ marginRight: 5, display: 'inline-block' }}>采集工况</Button>
										{/* <Button onClick={this.handelShowConditionTimeModal} style={{ marginRight: 5, display:'inline-block'}}>自定义任意时间工况</Button> */}
									</div>
									<PageList
										actionListData={actionListData}
										env={this.state.env}
										reward={this.state.reward}
										pointNameList={this.state.pointNameList}
										pointList={this.state.pointList}
										endFlag={endFlag}
										envPoints={this.state.envPoints}
										envPointsName={this.state.envPointsName}
										saveBarData={this.saveBarData}
										handelSelectRow={this.handelSelectRow}
										selectKey={this.state.selectKey}
									/>
								</div>
							</div>
							<div className={s['content']} style={bgContentStyle}>
								<div className={s['chart-container-wrap']} >
									<Tabs activeKey={this.state.activeKey} onChange={this.handelChangeTab} >
										<TabPane tab="调优汇总" key="1">
											<div style={{ height: 860, width: '100%', overflowY: 'scroll' }}>
												<RightModal
													barData={this.state.barData}
													envPointsName={this.state.envPointsName}
													endFlag={endFlag}
												/>
											</div>

										</TabPane>
										<TabPane tab="优化动作实时响应" key="2">

										</TabPane>
									</Tabs>

								</div>
							</div>
						</div>
				}
				<AddConfigModal
					isShowAddConfigModal={this.state.isShowAddConfigModal}
					hideAddConfigModal={this.hideAddConfigModal}
					handleOk={this.tidyConfig}
				/>
				<ConditionModal
					isShowConditionModal={this.state.isShowConditionModal}
					hideConditionModal={this.hideConditionModal}
					handleOk={this.tidyCondition}
				/>
				<EditConditionModal
					isShowEditConditionModal={this.state.isShowEditConditionModal}
					hideEditConditionModal={this.hideEditConditionModal}
					handleOk={this.editCondition}
					selectKey={this.state.selectKey}
					selectRow={this.state.selectRow}
					actionListData={actionListData}
				/>
			</div>
		)
	}
}

ExpertOptimizeModalView.propTypes = {
};

export default ExpertOptimizeModalView;
