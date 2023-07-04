/**
 * 历史曲线页面
 */

import React from 'react';
import { Button, message } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../lib/echarts-themes/dark';
import cx from 'classnames';
import ConfigModal from '../components/ConfigModalView';
import RealWorker from '../../observer/components/core/observer.worker';
import appConfig from '../../../common/appConfig';
import http from '../../../common/http';
import moment from 'moment';
import s from './LineModalView.css';

let btnStyle;
if (localStorage.getItem('serverOmd') == "best") {
	btnStyle = {
		background: "#E1E1E1",
		boxShadow: "2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
		border: 0,
		color: "#000",
		fontSize: "12px",
		marginLeft: "20px"
	}
}
if (localStorage.getItem('serverOmd') == "persagy") {
	btnStyle = {
		background: "rgba(255,255,255,1)",
		border: '1px solid rgba(195,198,203,1)',
		color: "rgba(38,38,38,1)",
		borderRadius: '4px',
		fontSize: "14px",
		fontFamily: 'MicrosoftYaHei'
	}
}

var timer;

class LineModalView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: this.props.data,
			isShowConfigModal: false,
			loading: false,
			mounted: false,
			timeData: [],
			pointsData: [],
			index: 0
		};

		this.updateTime = [];
		this.updateData = [];

		this.chart = null;
		this.container = null;

		this.workerUpdate = null;

		this.startWorker = this.startWorker.bind(this);
		this.saveChartRef = this.saveChartRef.bind(this);
		this.saveContainerRef = this.saveContainerRef.bind(this);
		this.handleConfigModalSubmit = this.handleConfigModalSubmit.bind(this);
		this.hideConfigModal = this.hideConfigModal.bind(this);
	}
	static get defaultProps() {
		return {
			points: [],
			data: {
				map: {},
				time: []
			}
		}
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

		if (!localStorage.getItem('linePointDict')) {
			this.stopWorker();
			return;
		}

		//从localStorage里linePointDict过滤出flag为1的页面的所有点名，将所有点名组成数组放到requestPoints
		let linePointDict = JSON.parse(localStorage.getItem('linePointDict'));

		let pointsArr = [];

		this.props.pageList.map(row => {
			if (JSON.parse(localStorage.getItem(row))) {
				if (JSON.parse(localStorage.getItem(row)).flag == 1) {
					linePointDict[row].map(item => {
						pointsArr.push(item)
					})
				}
			}
		})
		//去重
		let requestPoints = Array.from(new Set(pointsArr));
		window.localStorage.setItem('requestPoints', JSON.stringify(requestPoints));

		if (timer) {
			clearInterval(timer);
		}
		var _this  = this;
		//传数据
		timer = setInterval(function(){
			_this.workerUpdate.postMessage({
				pointList: JSON.parse(localStorage.getItem('requestPoints')),
				serverUrl: appConfig.serverUrl,
				type: "lineDataRealtime"
			});
		},2000);
	}

	stopWorker() {
		if (this.workerUpdate) {
			this.workerUpdate.terminate();
			this.workerUpdate.removeEventListener("message", this.refreshData, true);
		}
	}



	//刷新数据
	refreshData(e) {
		var _this = this.self ? this.self : this;
		//将请求回来的所有实时数据放到对应的页面
		_this.props.pageList.map(row => {
			if (JSON.parse(localStorage.getItem(row)) && JSON.parse(localStorage.getItem(row)).flag == 1) {
				let pageSource = JSON.parse(localStorage.getItem(row))
				//若页面没有配置点，直接返回
				if (JSON.stringify(pageSource.map) != "{}") {

					//给开启的页面添加实时数据
					for (var i = 0; i < e.data.length; i++) {
						if (pageSource.map[e.data[i].name]) {
							let index = pageSource.map[e.data[i].name].indexOf(null);
							// console.log(index)
							_this.setState({
								index: index
							})
							if (index != -1) {
								//初始化半小时内，直接赋值
								// _this.setState({
								//   index: index
								// })
								pageSource.map[e.data[i].name][_this.state.index] = parseFloat(e.data[i].value); //转成浮点数
							} else {
								//当点值数组的900个都有数值以后，就要将曲线滚动起来，去掉前面的，将新的插入到最后
								pageSource.map[e.data[i].name].shift();
								pageSource.map[e.data[i].name].push(parseFloat(e.data[i].value));
							}
							//pageSource.map[e.data[i].name].shift();
							//检测当前得到数值的时间是否与初始的时间轴仅相差1秒
							// pageSource.time.map((row,index) => {
							//   if (moment(new Date().getTime()-1000).format('HH:mm:ss') =< row ) {
							//     console.log(row,moment(new Date().getTime()-1000).format('HH:mm:ss'))                    
							//     pageSource.map[e.data[i].name].shift();
							//     //将数值放入与时间点下标对应的位置
							//     pageSource.map[e.data[i].name][index] = parseFloat(e.data[i].value); //转成浮点数
							//   }
							//   return;
							//})

						}
					}
					if (_this.state.index != -1) {
						if (moment(new Date().getTime()).format('HH:mm:ss') != pageSource.time[_this.state.index]) {
							pageSource.time[_this.state.index] = moment(new Date().getTime()).format('HH:mm:ss')
						}
						console.log(pageSource)
					} else {
						pageSource.time.shift();
						pageSource.time.push(moment(new Date().getTime()).format('HH:mm:ss'));
					}



					//给开启的页面添加半小时以后的时间
					// if (pageSource.time)
					// pageSource.time.pop();
					// pageSource.time.unshift(moment().format('HH:mm:ss'));
					//将新的页面数据保存到localStorage
					window.localStorage.setItem(row, JSON.stringify(pageSource));
				}
				return;
			}
		})

		if (JSON.parse(localStorage.getItem(_this.props.params.name))) {
			let data = JSON.parse(localStorage.getItem(_this.props.params.name))
			let pointsData = data.map;
			_this.setState({
				timeData: data.time,
				pointsData: pointsData
			})
		}
		
	}

	componentDidMount() {
		this.props.getWorkerDict({ startWorker: this.startWorker, stopWorker: this.stopWorker });
		this.props.initializeLineChart(this.props.params.name);


	}
	componentWillReceiveProps(nextProps) {
		if (this.props.pageData !== nextProps.pageData) {
			window.setTimeout(() => {
				this.setState({
					mounted: true
				}, this.startWorker);
			}, 0);
		}
		// const pointNames = this.props.points.map(row => row['name']).sort();
		// const nextPointNames = nextProps.points.map(row => row['name']).sort();

		// if (pointNames.join('') !== nextPointNames.join('')) {
		//   return this.getChartData(nextProps.points, nextProps.timeOptions);
		// }
		if (this.props.params.name !== nextProps.params.name) {
			this.props.initializeLineChart(nextProps.params.name);
		}
	}

	//组件即将卸载
	componentWillUnmount() {
		this.workerUpdate.terminate();
		this.setState({
			mounted: false
		})
	}





	getChartOption() {

		let time = [];
		let pointsData = [];

		if (JSON.parse(localStorage.getItem(this.props.params.name))) {
			time = this.state.timeData || this.props.data;
			pointsData = this.state.pointsData;
		} else {
			time = [];
			pointsData = [];
		}
		return {
			title: {
				text: ''
			},
			tooltip: {
				trigger: 'axis'
			},
			toolbox: {
				show: true,
				feature: {
					dataView: {
						show: true,
					}
				},
				right: '2%'
			},
			grid: {
				top: '4%',
				left: '4%',
				right: '5%',
				bottom: '5%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'category',
					data: time
				}
			],
			yAxis: [
				{
					type: 'value'
				}
			],
			series:
				Object.keys(pointsData).map((key) => ({
					name: key,
					type: 'line',
					label: {
						normal: {
							show: false, //折线上不显示数据
							position: 'top'
						}
					},
					data: pointsData[key],
				}))

		}
	}
	saveChartRef(refEchart) {
		if (refEchart) {
			this.chart = refEchart.getEchartsInstance();
		} else {
			this.chart = null;
		}
	}
	saveContainerRef(container) {
		this.container = container;
	}

	hideConfigModal() {
		this.setState({
			isShowConfigModal: false
		});
	}
	handleConfigModalSubmit(values) {
		//this.props.saveChartOptions(values);
	}
	render() {
		const {
			pageData,
			configVisible,
			toggleConfigModal,
			showPointModal,
			hidePointModal,
			addConfigInfo,
			selectedData,
			modalType
		} = this.props;
		//console.log(this.props.params.name,this.props.pageData)
		return (
			<div className={s['container']} ref={this.saveContainerRef}>
				<div className={cx(s['header'], 'clearfix')}>
					{this.props.pageData.pageConfig ? this.props.pageData.pageConfig.name : ""}
					<div className={s['options']}>
						<Button icon="setting" onClick={() => { toggleConfigModal() }} style={btnStyle}>配置</Button>
					</div>
				</div>
				<div className={s['chart-container']}>
					<ReactEcharts
						style={{
							height: '100%'
						}}
						ref={this.saveChartRef}
						option={this.getChartOption()}
						theme="dark"
						notMerge={true}
					/>
				</div>
				<ConfigModal
					visible={configVisible}
					toggleConfigModal={toggleConfigModal}
					showPointModal={showPointModal}
					hidePointModal={hidePointModal}
					selectedData={selectedData}
					addConfigInfo={addConfigInfo}
					pageName={this.props.params.name}
					pageData={pageData}
				/>
			</div>
		);
	}
}

LineModalView.propTypes = {
};

export default LineModalView;

