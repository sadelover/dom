import React from 'react'
import { Menu, Layout , Popconfirm,Modal,Button,Input,Icon,Spin ,Tag} from 'antd';
import Widget from './Widget.js'
import s from './ScriptRuleView.css'
import http from '../../../../common/http';
import ReactEcharts from '../../../../lib/echarts-for-react';
import RealWorker from '../core/observer.worker';
import appConfig from '../../../../common/appConfig';
import { json } from 'express';
import { T } from 'antd/lib/upload/utils.js';
// import {ReactJson} from "react-json-view";

const { Sider, Content, Header } = Layout;
const MenuItem = Menu.Item;
const { TextArea} = Input;

const scriptRuleListNameArr = Object.keys(Array.from({ length: 100 })).map(function(item) {
	if (+item < 9) {
		return "script_rule_00"+(+item+1);
	}else {
		if (+item < 99) {
			return "script_rule_0"+(+item+1);
		}else {
			return "script_rule_"+(+item+1);
		}
	}
});

var timer;

const registerInformation = {
	type: 'scriptRule',
	name: '脚本规则组件',
	description: "从项目配置中获取脚本配置script_rule_001~100"
}



//右侧脚本逻辑展示部分
class TreeView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			option:{},
			scriptList:[],
			dataList:[],
			inputTree:[],
			outputTree:[]

		};
		
		
		this.workerUpdate = null;


		this.saveChartRef = this.saveChartRef.bind(this);
		this.getChartOption = this.getChartOption.bind(this);
		this.stopWorker = this.stopWorker.bind(this);
		this.startWorker = this.startWorker.bind(this);
		this.refreshData =  this.refreshData.bind(this);

	}

	saveChartRef(refEchart) {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }


	componentWillReceiveProps(nextProps) { 
		if (nextProps.currentKey != this.props.currentKey || nextProps.currentScript != this.props.currentScript) {
			const {currentKey,allContentList} = nextProps
			if (currentKey != "" && allContentList[currentKey] != undefined) {
				let content = allContentList[currentKey]
				let inputTree = {name:"策略模块",children:[]};
				let outputTree = {name:"策略模块",children:[]};
				let scriptList = [];
				if (content.inputList != undefined && content.inputList.length != 0) {
					content.inputList.forEach(inputItem => {
						inputTree.children.push({name:inputItem.title,value:inputItem.script});
						scriptList.push(inputItem.script);
					})
				}
				if (content.outputList != undefined && content.outputList.length != 0) {
					content.outputList.forEach(outputItem => {
						outputTree.children.push({name:outputItem.title,value:outputItem.script});
					})
				}
				console.log(inputTree);
				console.log(outputTree);
				
				this.getChartOption(inputTree,outputTree);

				window.setTimeout(() => {
					this.setState({
						scriptList:scriptList,
						inputTree:inputTree,
						outputTree:outputTree
					}, this.startWorker);
				}, 0);
				
			}
		}
		
	}

	componentWillUnmount () {
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
		}
		this.setState({
			scriptList: [],
			dataList:[],
			inputTree:[],
			outputTree:[]
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

		if (timer) {
			clearInterval(timer);
		}
		var _this  = this;
		//传数据
		timer = setInterval(function(){
			_this.workerUpdate.postMessage({
				scriptList: _this.state.scriptList,
				serverUrl: appConfig.serverUrl,
				type: "scriptRuleRealtime"
			});
		},3000);

		
	}
	
	stopWorker() {
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
			this.workerUpdate.removeEventListener("message", this.refreshData, true);
		}
	}

	

	//脚本值刷新
	refreshData (e) {
		console.log(e.data)
		if (e.data && !e.data.error) {
			if (JSON.stringify(this.state.dataList) !== JSON.stringify(e.data)) {
				let inputTree = this.state.inputTree;
				//输入脚本的颜色	
				if (e.data.length != 0 && inputTree.length !=0) {
					e.data.forEach(item =>{	
						if (inputTree.children && inputTree.children.length !=0) {
							inputTree.children.map(input =>{
								if (item.name == input.value) {
									if (item.value == 1) {
										input["itemStyle"] = {color:"#00FF33"};
										input["lineStyle"] = {color:"#00FF33"};
										input["label"] = {color:"#00FF33",width:320,overflow:"break"};
									}else {
										input["itemStyle"] = {color:"rgb(255 0 10)"};
										input["lineStyle"] = {color:"rgb(255 0 10)"};
										input["label"] = {color:"rgb(255 0 10)",width:320,overflow:"break"};
						
									}
								}
							})
						}
					})
				}
				this.getChartOption(inputTree,this.state.outputTree);
				this.setState({
					dataList:e.data
				})
			}
			
		}
	}

	//画图
	getChartOption (inputTree,outputTree) {
	
		console.log(inputTree)


		let option =  {
			tooltip: {
			  trigger: 'item',
			  triggerOn: 'mousemove'
			},
			series: [
				{	
					type: 'tree',
					data: [inputTree],
					top: '1%',
					left:'400',
					bottom: '1%',
					symbolSize: 15,
					orient: 'RL',
					width:400,
					label: {
						position: 'right',
						verticalAlign: 'middle',
						align: 'left',
						fontSize:16
					},
					leaves: {
						label: {
							position: 'left',
							verticalAlign: 'middle',
							align: 'right'
							
						}
					},
					emphasis: {
						focus: 'descendant'
					},
					animationDuration: 30,
					animationDurationUpdate: 750
				},
				{
					type: 'tree',
					data: [outputTree],
					top: '1%',
					bottom: '1%',
					left:'800',
					symbolSize: 15,
					orient: 'LR',
					width:400,
					label: {
						position: 'left',
						verticalAlign: 'middle',
						align: 'right',
						fontSize:16
					},
					leaves: {
						label: {
							position: 'right',
							verticalAlign: 'middle',
							align: 'left'
						}
					},
					emphasis: {
						focus: 'descendant'
					},
					expandAndCollapse: true,
					animationDuration: 30,
					animationDurationUpdate: 750
				}
			]
		}
		this.setState({
			option:option
		})
	}


	render () {
		const {height,width} = this.props.style
		
		return (

			<ReactEcharts
				style={{
					height: height,
					width: width
				}}
				option={this.state.option}
				theme="dark"
				notMerge={true}
		/>
		)
	}

}




class ScriptRuleViewComponent extends Widget {

	constructor(props) {
		super(props)

		this.state = {
			style: {},
			allContentList: {}, //项目配置里的所有键值对内容
			ruleTitleList: [], //项目配置里提取出所有的外层title
			ruleNameList:[],   //项目配置里键名列表
			currentKey:"",  //当前菜单
			currentScript:{}, //当前脚本
			addChangeScript:"", //修改添加的规则
			layoutVisible: true
			
		};

		this.getScriptRuleList = this.getScriptRuleList.bind(this);
		this.getScriptRuleFromConfig = this.getScriptRuleFromConfig.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.editModal = this.editModal.bind(this);
		this.saveScript = this.saveScript.bind(this);
		this.changeScript = this.changeScript.bind(this);
		this.addRuleModal = this.addRuleModal.bind(this);
		this.changeAddScript = this.changeAddScript.bind(this);
		this.addRule = this.addRule.bind(this);
		this.deleteModal = this.deleteModal.bind(this);
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
		this.getScriptRuleFromConfig()

	}
	//检测对比新数据
	componentWillReceiveProps(nextProps) {
		if (this.props.custom_realtime_data != undefined && this.props.custom_realtime_data.length != 0) {
			if (nextProps.custom_realtime_data.length != 0) {
				if (this.state.inputRealValues && this.props.custom_realtime_data && nextProps.custom_realtime_data) {
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
	}

	//从项目配置中获取所有的脚本规则配置
	getScriptRuleFromConfig (currentKey) {
		http.post('/project/getConfigMul',{
			"keyList": scriptRuleListNameArr
		}).then(
			res => {
				if (res.status && Object.keys(res.data).length != 0) {
					console.log(Object.values(res.data)[0])
					let titleList = []
					Object.values(res.data).forEach(element => {
						if (element.title != undefined) {
							titleList.push(element.title)
						}else {
							titleList.push("暂无标题")
						}
					});
					let nameList = Object.keys(res.data);
					if (currentKey != null) {
						this.setState({
							allContentList:res.data,
							ruleNameList:nameList,
							ruleTitleList:titleList,
							currentKey: currentKey,
							currentScript:res.data[currentKey],
							layoutVisible:true
						})
					}else {
						this.setState({
							allContentList:res.data,
							ruleNameList:nameList,
							ruleTitleList:titleList,
							currentKey: nameList[0],
							currentScript:res.data[nameList[0]],
							layoutVisible:true
						})
					}
				}else{
					this.setState({
						layoutVisible:true
					})
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible:true
				})
			}
		)
	}

	//整理左侧菜单
	getScriptRuleList () {
		let menuList = []
		if (this.state.ruleNameList.length !=0) {
			menuList = this.state.ruleNameList.map((item,i)=>{
				return <MenuItem style={{ paddingLeft:"27px",paddingRight:"4px",borderBottom:"1px solid rgb(53 77 86)" }} title={this.state.ruleTitleList[i]} key={item}>
							<span style={{fontSize:"10px",display:"inline-block",width:22,textAlign:'center', height:15,lineHeight:"14px", padding:"0 1px",backgroundColor:"#5a6873",color:"fff",borderRadius:5,position:'absolute',left:2,
								fontWeight:700				
							}}>
							{Number(item.substr(-3))}</span>{this.state.ruleTitleList[i]}
						</MenuItem>
	 		})
		}
		return menuList;
	}

	//左侧菜单点击事件
	handleClick (e) {
		let selectRule = this.state.allContentList[e.key]
		let selectKey = e.key
		this.setState({
			currentKey:selectKey,
			currentScript:selectRule
		})
	}

	deleteModal (currentKey) {
		Modal.confirm({
			title: '确认提示',
			content:'真的要删除此规则脚本吗？',
			onOk:()=>{this.deleteRule(currentKey)},
			onCancel() {}
		});
	}

	deleteRule (currentKey) {
		this.setState({
			layoutVisible:false
		})
		http.post('/project/saveConfig',{
			"key": currentKey,
			"config":JSON.stringify({})
		}).then(
			data=>{
				if (!data.err) {
					this.getScriptRuleFromConfig();
				}else{
					this.setState({
						layoutVisible:true
					})
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible:true
				})
			}
		)
	}


	//修改脚本
	changeScript ({ target: { value } }) {
		this.setState({
			currentScript:JSON.parse(value) 
		})
	}

	editModal (currentKey) {
		Modal.confirm({
			title: '编辑脚本',
			content: (
				<div>
					<TextArea 
						autoSize={{ minRows: 10, maxRows: 20 }}
						defaultValue={JSON.stringify(this.state.currentScript,null,4)}
						onChange={this.changeScript}
					/>
				</div>
			),
			onOk:()=>{this.saveScript(currentKey,this.state.currentScript)},
			onCancel:()=>{	this.setState({
				currentScript:this.state.allContentList[currentKey] 
			})},
			okText:"保存",
			icon:<Icon type="edit" />,
			width:800
		})
	}

	saveScript (currentKey,currentScript) {
		this.setState({
			layoutVisible:false
		})
		http.post('/project/saveConfig',{
			"key": currentKey,
			"config":JSON.stringify(currentScript)
		}).then(
			data=>{
				if (data.status) {
					this.getScriptRuleFromConfig(currentKey);

				}else{
					this.setState({
						layoutVisible:true
					})
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible:true
				})
			}
		)
	}

	addRuleModal () {
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
			onOk:()=>{this.addRule(this.state.addChangeScript)},
			onCancel:()=>{},
			okText:"添加",
			icon:<Icon type="file-add" />,
			width:800
		})
	}

	changeAddScript  ({ target: { value } })  {
		this.setState({
			addChangeScript:value 
		})
	}

	addRule (addChangeScript) {
		let newItem = "script_rule_450"
		if (this.state.ruleNameList.length == 0) {
			newItem = "script_rule_001"
		}else {
			let ruleMax = this.state.ruleNameList[this.state.ruleNameList.length-1]
			let newRuleKey = Number(ruleMax.substr(-3))+1
			
			if (newRuleKey < 10) {
				newItem = "script_rule_00"+newRuleKey;
			}else {
				if (newRuleKey < 100) {
					newItem = "script_rule_0"+newRuleKey;
				}else {
					newItem = "script_rule_"+newRuleKey;
				}
			}
		}
		

		this.setState({
			layoutVisible:false
		})

		http.post('/project/saveConfig',{
			"key": newItem,
			"config":addChangeScript
		}).then(
			data=>{
				if (data.status) {
					this.getScriptRuleFromConfig();

				}else {
					this.setState({
						layoutVisible:true
					})
					Modal.error({
						title:'错误提示',
						content:"添加规则策略失败"
					 })	
				}
			}
		).catch(
			err => {
				this.setState({
					layoutVisible:true
				})
				Modal.error({
					title:'错误提示',
					content:"添加规则策略失败"
				})	
			}
		)
	}

	getContent() {
		const { style } = this.props
		return (
			<div style={style} className={s['table-container']} >
				<Spin tip="正在读取数据" spinning={!this.state.layoutVisible}>
					<Layout>
						<Sider width={260}> 
							<div style={{height:"90%",borderBottom:'1px solid white',overflowY:'scroll'}}>
								<Menu
									selectedKeys={[this.state.currentKey]}
									mode="inline"
									onClick={this.handleClick}
									>
										{this.getScriptRuleList()}
								</Menu>
							</div>
						
							<div className={s['sider-footer']} >
								<Button  type='primary'  icon="plus" 
									onClick={this.addRuleModal}
								>
								</Button>
							</div>
						</Sider>
						<Layout>
							<Header>
								{
									this.state.ruleNameList.length != 0 ?
									<div style={{float:"right"}}>
										<Button  type="primary" icon="edit" onClick={()=>{this.editModal(this.state.currentKey)}}>编辑</Button>
										<Button style={{marginLeft:"10px"}}  icon="delete" onClick={()=>{this.deleteModal(this.state.currentKey)}}>清空</Button>
									</div>
									:
									""
								}
								
							</Header>
							<Content>
								<div style={{height:style.height-68}}>
									<TreeView
										allContentList = {this.state.allContentList}
										currentKey = {this.state.currentKey}
										style= {style}
										currentScript = {this.state.currentScript}
									
									/>
								</div>
							</Content>
						</Layout>
					</Layout>
				</Spin>
				
				
			</div>
		)
	}
}

export default ScriptRuleViewComponent

