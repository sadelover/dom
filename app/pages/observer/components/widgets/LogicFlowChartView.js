import React from 'react'
import { Menu, Layout , Popconfirm,Modal,Button,Input,Icon,Spin ,Tag} from 'antd';
import Widget from './Widget.js'
import http from '../../../../common/http';
import RcViewer from '@hanyk/rc-viewer';
import s from './LogicFlowChartView.css';
import appConfig from '../../../../common/appConfig'

// import {ReactJson} from "react-json-view";

const { Sider, Content, Header } = Layout;

var deltaY

const registerInformation = {
	type: 'logicFlowChart',
	name: '策略流程图展示组件',
	description: "展示svg文件"
}


class LogicFlowChartViewComponent extends Widget {

	constructor(props) {
		super(props)

		this.state = {
			style: {},
			src:"",
			loading:false
			
		};

		this.changeSVG = this.changeSVG.bind(this);
		// this.handleScroll = this.handleScroll.bind(this);
		this.getButtonList = this.getButtonList.bind(this);
		this.getSvgUrl = this.getSvgUrl.bind(this);

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
		var btns = document.getElementsByClassName('bindBtnTag');
		for (let i=0; i< btns.length; i++) {
			if (btns[i].id == 0) {
				btns[i].style.backgroundColor = 'rgb(28 49 78)'
			} else {
				btns[i].style.backgroundColor = '';
			}
		}

		//获取第一个图
		if (this.props.config.list !=undefined && this.props.config.list.length != 0) {
			let url = ""
			if (this.props.config.list[0].url != undefined) {
				url = this.props.config.list[0].url
			}
			this.getSvgUrl(url)

		}
		

	}
	//根据config配置的svg名称，请求接口，使接口去获取oss上同名svg，并保存到dompysite里指定位置，接口返回本地文件路径
	getSvgUrl (url) {
		this.setState({
			loading:true
		});

		http.post('/wizard/downloadPeriodicUpdateManualByKey', {
			"key": "update/logicFlowChart/"+url,
			"period": 24  
		}).then(
			data => {
				if (!data.err) {
					this.setState({
						src:`${appConfig.serverUrl}/static/periodic_update_manual/${data.data}`,
						loading:false
					})
				} else {
					this.setState({
						loading:false
					})
					Modal.error({
						title: '错误提示',
						content: data.msg
					})
				}
			}
		).catch(
			err => {
				this.setState({
					loading:false
				})
				Modal.error({
					title: '错误提示',
					content: err
				})
			}
		)
	}

	changeSVG  (btnId,url)  {
		var btns = document.getElementsByClassName('bindBtnTag');
		for (let i=0; i< btns.length; i++) {
			if (btns[i].id == btnId) {
				btns[i].style.backgroundColor = 'rgb(28 49 78)'
			} else {
				btns[i].style.backgroundColor = '';
			}
		}
		this.getSvgUrl(url)
	}

	// handleScroll (e) {
	// 	let num = e.nativeEvent.deltaY  //滚轮滚动数值分正负
	// 	if (Math.abs(num) >= 100) {  //防止数值太大把图片给倒转之类的bug
	// 		 num = parseInt(Math.abs(num).toString().substring(0,2))
	// 	}
	// 	if (num <= 1) {  //缩小处理
	// 		if (deltaY <= 0.5) {  //防止缩小到0
	// 			return
	// 		}
	// 		num = Math.abs(num)
	// 		num = num / 100
	// 		dispatch ({
	// 			type:'system/updateState',
	// 			payload:{
	// 				deltaY:deltaY-num
	// 			},
	// 		})
	// 	}else {
	// 		num = num/100
	// 		dispatch ({
	// 			type:'system/updateState',
	// 			payload:{
	// 				deltaY:deltaY + num
	// 			}
	// 		})
	// 	}
	// }

	getButtonList = () => {
		let config = this.props.config
		let buttonList = []
		if (config.list != undefined) {
			if (config.list.length != 0) {
				buttonList = config.list.map((item,i)=>{
					return <Button id={i} className="bindBtnTag" type="primary" style={{marginRight:20}} 
							onClick={() => {this.changeSVG(i,item.url)}}>{item.name}</Button>
				})
			}
		}else{
			Modal.error({
				title: '错误提示',
				content: "自定义组件配置错误，缺少list字段"
			})
		}
		return buttonList;
	}


	getContent() {
		const { style } = this.props
		return (
			<div style={style} className={s['table-container']} >
				<Layout>
					<Header style={{backgroundColor:'#c7c9ce'}}>
						{this.getButtonList()}
					</Header>
					<Content style={{backgroundColor:'#c7c9ce'}}>
						<div style={{width:this.props.style.width,height:this.props.style.height-68,overflow:'auto'}}>
							<Spin tip="正在读取数据" spinning={this.state.loading}>
								<RcViewer >
									<div style={{backgroundColor:'rgb(221 235 247)'}}>
										<img src={this.state.src} />
									</div>
								</RcViewer>
							</Spin>
						</div>
					</Content>
				</Layout>
			</div>
		)
	}
}

export default LogicFlowChartViewComponent

