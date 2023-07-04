/**
 * 历史曲线页面
 */

import React from 'react';
import { Button, Spin } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../lib/echarts-themes/dark';
import cx from 'classnames';
import appConfig from '../../../common/appConfig';
import http from '../../../common/http';
import moment from 'moment';
import s from './RightModalView.css';

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

var colors = ['#4587E7','#35AB33','#F5AD1D','#ff7f50','#da70d6','#32cd32','#6495ed',
'#458fB7','#35Af13','#F5Af2D','#ff7e70','#da7fa6','#32cf62','#649ffd',
'#45efB7','#35ef13','#F5ef2D','#ffee70','#daefa6','#32ef62','#64effd'

];

class RightModalView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			modeList:[],
			seriesList:[] //每个柱状图的数据都是一个对象，如果{"平均干球温度":[ 3.3, 5.8, 3.7],"平均湿球温度":[ 13.3, 15.8, 13.7]}
		};

		this.updateTime = [];
		this.updateData = [];

		this.chart = null;
		this.container = null;

		this.workerUpdate = null;

		this.saveChartRef = this.saveChartRef.bind(this);
		this.saveContainerRef = this.saveContainerRef.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.barData !== nextProps.barData && nextProps.barData.length !=0) {
			this.getData(nextProps.barData);
		}
	}

	getData (barData) {
		this.setState({
			loading:true
		})
		let modeList = [];
		let list = this.props.envPointsName
		list.push("总累积单耗")
		let dataList = {}  //多个柱状图的数据，每个字段就是一个柱状图的数据{"":[],"":[]}
		list.forEach(jtem=>{
			dataList[jtem] = []
		})
		barData.forEach((item,i) => {
			if ( item.map != undefined) {
				modeList.push(item.action);
				list.forEach(name=>{
					dataList[name].push(item[name])
				})
			}
		});
		console.log(modeList,dataList)
		this.setState({
			modeList:modeList,
			seriesList:dataList,
			loading:false
		})
	}


	getChartOption(title) {		
		return {
			title: {
				text: `不同模式下 ${title} 的对比`,
				left: "center",
				top:'2px'
			},
			tooltip: {
			},
			toolbox: {
	
			},
			
			grid: {
				top: '8%',
				left: '4%',
				right: '5%',
				bottom: '5%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'category',
					data: this.state.modeList,
					axisLabel: {
						show: true,
						interval: 0,//横轴信息全部显示
					  }
				}
			],
			yAxis: [
				{
					type: 'value'
				}
			],
			series:
				[{
					type: 'bar',
					data: this.state.seriesList[title],
					itemStyle: {
						normal:{  
							//每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
							color: function (params){
								// var colorList = ['rgb(164,205,238)','rgb(42,170,227)','rgb(25,46,94)','rgb(195,229,235)'];
								return colors[params.dataIndex];
							}
						}
					},
					//设置柱子的宽度
					barWidth : 20,
					label:{
						show:true,
						color:'#fff'
					}
				}]
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
	render() {
		const {
			barData,
			envPointsName,
			endFlag
		} = this.props;
		
		return (
			<div className={s['container']} ref={this.saveContainerRef}>
				<div className={s['chart-container']}>
					<Spin tip="正在加载页面..." spinning={this.state.loading} wrapperClassName="absolute-spin" style={{paddingTop:'20%',paddingLeft:'50%'}}>
						{
							envPointsName != undefined && envPointsName.length !=0 && endFlag ?
								envPointsName.map((ele,e)=> {
										return(
											<ReactEcharts
												key={e}
												style={{
													height: '100%',
													marginBottom:"20px"
												}}
												ref={this.saveChartRef}
												option={this.getChartOption(ele)}
												theme="dark"
												notMerge={true}
											/>
										)
									})
								:
								""
							
							}
							
					</Spin>
				</div>
				
			</div>
		);
	}
}

RightModalView.propTypes = {
};

export default RightModalView;

