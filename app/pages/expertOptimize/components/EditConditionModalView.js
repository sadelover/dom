/**
 * 修改工况-模态框
 */
import React from 'react';
import { Button, Modal, Radio, message, Form, Input, Select, DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import { modalTypes } from '../../../common/enum'

import http from '../../../common/http';

const RadioGroup = Radio.Group;
const { TextArea } = Input;
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

class EditConditionModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			envList: [roomName + "OutdoorTdbin", roomName + "OutdoorWetTemp", roomName + "RealtimeLoad"],
			rewardCost: roomName + "ChillerRoomGroupPowerTotal",
			rewardWin: roomName + "CoolingCapacityTotal"
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err && values.name != "") {
				let obj = {}
				let endTime = ""
				endTime = moment(values.startTime).add(Number(values.hours), 'hours').format(TIME_FORMAT)
				obj['action'] = values.name
				if (values.minutes != "0") {
					obj['actStartTime'] = moment(values.startTime).add(Number(values.minutes), 'minutes').format(TIME_FORMAT)
				} else {
					obj['actStartTime'] = moment(values.startTime).format(TIME_FORMAT)
				}
				obj['actEndTime'] = endTime
				if (values.benchmark == "yes") {
					obj['benchmark'] = 1
				}
				console.log(obj)

				this.props.handleOk(obj);
				this.props.hideEditConditionModal();
			}
		});
	}

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
				title="编辑工况"
				width={680}
				visible={this.props.isShowEditConditionModal}
				onCancel={this.props.hideEditConditionModal}
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
							rules: [{
								required: true, message: '开始时间不能为空!'
							}]
						})(
							<DatePicker showTime showToday format={TIME_FORMAT} />

						)}
					</FormItem>
					<FormItem
						style={{ marginBottom: 10 }}
						{...formItemLayout}
						label="工况采集时长"
						className={selectToggleClass}
					>
						{getFieldDecorator('hours', {
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
const WrappedEditConditionModal = Form.create({
	
	mapPropsToFields: (props) => {
		const {actionListData,selectKey,selectRow} = props
		let hours = "1"
		if (actionListData != undefined && actionListData.length != 0 && selectKey.length != 0) {
			hours = moment.duration(moment(actionListData[selectKey].actEndTime).diff(moment(actionListData[selectKey].actStartTime))).as('hours')
		}
		return {
			startTime: Form.createFormField({ value: actionListData != undefined && actionListData.length != 0 && selectKey.length != 0 ? moment(actionListData[selectKey].actStartTime) : "" }),
			name: Form.createFormField({ value: actionListData != undefined && actionListData.length != 0  && selectKey.length != 0  ? actionListData[selectKey].action : "" }),
			hours: Form.createFormField({ value:String(hours) }),
			benchmark: Form.createFormField({ value: actionListData != undefined && actionListData.length != 0  && selectKey.length != 0 ? (actionListData[selectKey].benchmark == 1 ? "yes" : "no") : "no" })
		}
	}
})(EditConditionModal);

export default WrappedEditConditionModal
