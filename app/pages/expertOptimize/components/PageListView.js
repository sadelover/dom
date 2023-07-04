/**
 * 优化调试页面--左侧汇总表格
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'antd';
import { modalTypes, pageTypes } from '../../../common/enum';
import cx from 'classnames';
import moment from 'moment';

import s from './PageListView.css';

let ListStyle;
if (localStorage.getItem('serverOmd') == "best") {
	ListStyle = {
		background: "RGB(240,240,240)",
		color: "#000",
		borderBottom: "1px solid #B5B5B5"
	}
}
if (localStorage.getItem('serverOmd') == "persagy") {
	ListStyle = {
		fontSize: '14px',
		fontFamily: 'MicrosoftYaHei',
		color: 'rgba(31,35,41,1)',
		background: 'rgba(247,249,250,1)',
		borderBottom: "1px solid rgba(199,199,199,1)"
	}
}


class PageList extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			columns: [],
			dataSource: [],
			loading:false
		}


	}

	componentDidMount() {
		// this.getColumns(this.props.pointList,this.props.pointNameList);
		// this.setState({
		// 	loading:true
		// })
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.pointList !== nextProps.pointList || this.props.pointNameList !== nextProps.pointNameList) {
			this.getColumns(nextProps.pointList,nextProps.pointNameList);
		}
		if (nextProps.endFlag && nextProps.pointList.length !=0) {
			this.getDataSource(nextProps.actionListData,nextProps.pointList,nextProps.pointNameList);
		}
	}

	getColumns(pointList,pointNameList) {
		this.setState({
			loading:true
		})
		if (pointNameList.length && pointList.length) {
			let columnsData = pointList.map(
				(name, i) => ({
					title: pointNameList[i],
					dataIndex:name,
					key: name
				})
			)
			let defaultColumn = []
			if (pointList.length - pointNameList.length == 1) {
				columnsData.splice(pointNameList.length,1);
				defaultColumn = [{
						title: '平均单耗（kW/ton）',
						dataIndex: 'efficiencyAVG',
						key: 'efficiencyAVG'
					},
					{
						title: '节能率(%)',
						dataIndex: 'rate',
						key: 'rate',
						width: 70
					}
				]
			}else {
				defaultColumn = [{
						title: '总累积单耗（kW/ton）',
						dataIndex: 'efficiency',
						key: 'efficiency'
					},
					{
						title: '节能率(%)',
						dataIndex: 'rate',
						key: 'rate',
						width: 70
					}
				]
			}
			let firstColumn = {
				title: '模式',
				dataIndex: 'mode',
				key: 'mode'
			}
			let timeStartColumn = {
				title: '工况开始时间',
				dataIndex: 'timeStart',
				key: 'timeStart'
			}
			let durationColumn = {
				title: '工况时长',
				dataIndex: 'duration',
				key: 'duration'
			}

			let arr = columnsData.concat(defaultColumn);
			arr.unshift(durationColumn);
			arr.unshift(timeStartColumn);
			arr.unshift(firstColumn);

			this.setState({
				columns:arr
			});
		}
		
	}

	getDataSource (actionListData,pointList,pointNameList) {
		this.setState({
			loading:true
		})
		let dataSource = []
		let reward = this.props.reward
		let envPoints = this.props.envPoints
		let envPointsName = this.props.envPointsName
		let bench = 1
		
		if (actionListData.length && pointList.length) { 
			actionListData.forEach((row,r) => {
				if (row.map != undefined) {
					let obj = {
						key:r
					}
					let start = moment(row.actStartTime).format('YYYY-MM-DD HH:mm')
					let end = moment(row.actEndTime).format('YYYY-MM-DD HH:mm')
					if (row.benchmark == 1) {
						obj["mode"] = row.action+"(基准)"
					}else {
						obj["mode"] = row.action
					}
					obj["timeStart"] = row.actStartTime
					obj["duration"] =  `${Number(moment.duration(moment(end).diff(start)).asHours()).toFixed(1)}小时 `

					envPoints.forEach((item,i)=>{
						if (row.map[item].length) {
							let envValue = Number(row.map[item].reduce((acc,curr)=>acc + curr)/row.map[item].length);
							if (envValue < 1) {
								obj[item] = envValue.toFixed(3)
							}else {
								if (envValue < 10) {
									obj[item] = envValue.toFixed(2)
								}else {
									obj[item] = envValue.toFixed(1)
								}
							}
							
							row[envPointsName[i]] = obj[item]
						}
					})

					//判断是否是自定义奖励
					if (reward.custom != undefined && reward.custom != "") {
						//如果是自定义奖励，则把求该点名的平均值，作为“总累积单耗”列表中
						let custom = row.map[reward.custom]
						let customAvg = custom.reduce(function(acc,val){
							return Number(acc) + Number(val);
						},0) / custom.length;
						console.log(customAvg)
						obj["efficiencyAVG"] = Number(customAvg).toFixed(3) 
						row["平均单耗"] = obj["efficiencyAVG"]
								
						//只有等于1才是基准工况，其他（没有benchmark字段或者为0的，都不是）
						if (row.benchmark == 1) bench =  obj["efficiencyAVG"]

						obj["rate"] = Number((-((obj["efficiencyAVG"]/bench)-1))*100).toFixed(2)
					}else {
						let winLength = row.map[reward.win].length
						obj[reward.win] = Number(row.map[reward.win][winLength-1] - row.map[reward.win][0]).toFixed(1)
						
						let costLength = row.map[reward.win].length
						obj[reward.cost] = Number(row.map[reward.cost][costLength-1] - row.map[reward.cost][0]).toFixed(1)

						obj["efficiency"] = Number(obj[reward.cost]/obj[reward.win]).toFixed(2)
						row["总累积单耗"] = obj["efficiency"]
						
						//只有等于1才是基准工况，其他（没有benchmark字段或者为0的，都不是）
						if (row.benchmark == 1) bench =  obj["efficiency"]

						obj["rate"] = Number((-((obj["efficiency"]/bench)-1))*100).toFixed(2)
					}

					dataSource.push(obj)
				}else {
					//没有map的应该是未来时间的配置，则不显示数据，仅显示配置信息
					let obj = {
						key:r
					}
					let start = moment(row.actStartTime).format('YYYY-MM-DD HH:mm')
					let end = moment(row.actEndTime).format('YYYY-MM-DD HH:mm')
					if (row.benchmark == 1) {
						obj["mode"] = row.action+"(基准)"
					}else {
						obj["mode"] = row.action
					}
					obj["timeStart"] = row.actStartTime
					obj["duration"] =  `${Number(moment.duration(moment(end).diff(start)).asHours()).toFixed(1)}小时 `;
					dataSource.push(obj)
				}
			})
			// console.log(actionListData)
			//将柱状图所用数据保存到父组件
			this.props.saveBarData(actionListData)

			this.setState({
				dataSource:dataSource,
				loading:false
			})
		}
		
	}

	onSelectChange=(record, selected)=>{
		this.props.handelSelectRow(record,selected)
		
	}


	render() {
		return (
			<div className={s['container']}>
				<div style={{height:45,fontSize:20,textAlign:"center",marginTop:10}}>调优汇总表</div>
				<div>
					<Table
						columns={this.state.columns}
						dataSource={this.state.dataSource}
						pagination={false}
						bordered={true}
						loading={this.state.loading}
						scroll={{x:true}}
						rowSelection={{
							type: 'radio',
							columnWidth:20,
							selectedRowKeys: this.props.selectKey,
							onChange: this.onSelectChange
						}}
					>
					</Table>
				</div>
				
			</div>
		)
	}
}

export default PageList;
