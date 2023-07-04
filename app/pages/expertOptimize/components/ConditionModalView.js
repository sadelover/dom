/**
 * 新增采集工况-模态框
 */
import React from 'react';
import { Button, Modal, Radio, message, Form, Input, Select, DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import {modalTypes} from '../../../common/enum'

import http from '../../../common/http';

const RadioGroup = Radio.Group;
const { TextArea} = Input;
const roomName = localStorage.getItem("ChillerPlantRoom")



let modalToggleClass, calendarToggleClass, selectToggleClass, btnStyle;
if (localStorage.getItem('serverOmd') == "persagy") {
	modalToggleClass = 'persagy-modal-style persagy-history-label persagy-history-modal';
	calendarToggleClass = 'persagy-history-calendar-picker';
	selectToggleClass = 'persagy-history-select-selection';
	btnStyle = {
		background: "rgba(255,255,255,1)",
		border: '1px solid rgba(195,198,203,1)',
		color: "rgba(38,38,38,1)",
		borderRadius: '4px',
		fontSize: "14px",
		fontFamily: 'MicrosoftYaHei'
	}
}

const Option = Select.Option;
const FormItem = Form.Item;

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

class ConditionModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			envList:[roomName+"OutdoorTdbin",roomName+"OutdoorWetTemp",roomName+"RealtimeLoad"],
			rewardCost:roomName+"ChillerRoomGroupPowerTotal",
			rewardWin:roomName+"CoolingCapacityTotal"
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err && values.name != "") {
				let obj = {}
				obj['action'] = values.name
				if (values.minutes != "0") {
					obj['actStartTime'] = moment(values.startTime).add(Number(values.minutes),'minutes').format(TIME_FORMAT) 
				}else {
					obj['actStartTime'] = moment(values.startTime).format(TIME_FORMAT) 
				}
				obj['actEndTime'] = moment(obj.actStartTime).add(Number(values.hours), 'hours').format(TIME_FORMAT)  
				if (values.benchmark == "yes") {
					obj['benchmark'] = 1
				}
				console.log(obj)

				this.props.handleOk(obj);
				this.props.hideConditionModal();
			}
		});
	}

	handleHidePointModal = ()=> {
        const {showPointModal,onSelectChange} = this.props
		onSelectChange([])
        showPointModal(modalTypes.POINT_MODAL)
    }	

	// componentWillReceiveProps(nextProps) {
	// 	if (nextProps.selectedPoint !== this.props.selectedPoint && nextProps.selectedPoint.name !== this.props.selectedPoint.name && nextProps.selectedPoint.name != undefined) {
	// 		let pointName = nextProps.selectedPoint.name
	// 		let inputScript = nextProps.form.getFieldValue('inputScript') != undefined ? nextProps.form.getFieldValue('inputScript') : '';
	// 		let scriptDesc = nextProps.form.getFieldValue('scriptDesc') != undefined ?  nextProps.form.getFieldValue('scriptDesc') :'';
	// 		const { setFieldsValue } = this.props.form
	// 		setFieldsValue({
	// 			inputScript: `${inputScript}<%${pointName}%>`,
	// 			scriptDesc: scriptDesc+nextProps.selectedPoint.description
	// 		})
	// 	}
	// 	if (nextProps.visible && !this.props.visible) {
	// 		const { setFieldsValue } = this.props.form
	// 		setFieldsValue({
	// 			inputScript: "",
	// 			scriptDesc: ""
	// 		})
	// 	}
	// }

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 18
			},
		};
		const formItemLayoutRadio = {
			labelCol: {
				span: 14
			},
			wrapperCol: {
				span: 10
			},
		};

		return (
			<Modal
				className={modalToggleClass}
				title="采集工况"
				width={680}
				visible={this.props.isShowConditionModal}
				onCancel={this.props.hideConditionModal}
				onOk={this.handleSubmit}
				maskClosable={false}
                //destroyOnClose={true}    //关闭时消除子组件，防止多个弹框打开点表框时，层叠顺序错乱，点名弹框在下面的bug
				cancelText="取消"
				okText="确定"
			>
				<Form style={{ marginTop: '10px' }}>
					<FormItem
						className={calendarToggleClass}
						{...formItemLayout}
						label="工况名称"
					>
						{getFieldDecorator('name', {
							rules: [{
								required: true, message: '请输入工况名称!'
							}]
						})(
							<Input 
								width={300}
							/>
						)}
					</FormItem>
					<FormItem
						className={calendarToggleClass}
						{...formItemLayout}
						label="工况开始时间"
					>
						{getFieldDecorator('startTime', {
							initialValue:moment(),
						})(
							<DatePicker disabled  showTime showToday format={TIME_FORMAT} />
							
						)}
					</FormItem>
					<FormItem
						style={{ marginBottom: 10 }}
						{...formItemLayout}
						label="开始时间延后"
						className={selectToggleClass}
						>
						{getFieldDecorator('minutes', {
							initialValue:'0',
						})(
							<Select>
                                    <Option value='0' >不延时</Option>
                                    <Option value='5' >5分钟</Option>
                                    <Option value='10' >10分钟</Option>
									<Option value='15' >15分钟</Option>
									<Option value='30' >30分钟</Option>
									<Option value='60' >1小时</Option>
							</Select>
						)}
					</FormItem>
					<FormItem
						style={{ marginBottom: 10 }}
						{...formItemLayout}
						label="工况采集时长"
						className={selectToggleClass}
						>
						{getFieldDecorator('hours', {
							initialValue:'2',
							rules: [{
								required: true, message: '采集时长不能为空!'
							}]
						})(
							<Select>
                                    <Option value='1' >1小时</Option>
                                    <Option value='1.5' >1.5小时</Option>
                                    <Option value='2' >2小时</Option>
									<Option value='2.5' >2.5小时</Option>
									<Option value='3' >3小时</Option>
							</Select>
						)}
					</FormItem>
					<FormItem
						className={calendarToggleClass}
						{...formItemLayoutRadio}
						label="是否为基准工况（一页记录表中只能有一个基准工况）"
					>
						{getFieldDecorator('benchmark', {
							rules: [{
								required: true, message: '请确认是否为基准工况！'
							}]
						})(
							<RadioGroup >
								<Radio value="yes">
									是
								</Radio>
								<Radio value="no">
									否
								</Radio>
							</RadioGroup>
						)}
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedConditionModal = Form.create()(ConditionModal);

export default WrappedConditionModal
