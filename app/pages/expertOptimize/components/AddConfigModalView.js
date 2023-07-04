/**
 * 新建记录表-模态框
 */
import React from 'react';
import { Button, Modal, Radio, Switch, Form, Input, Select, DatePicker, Row, Col } from 'antd';
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

class AddConfigModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			envList:`${roomName}OutdoorTdbin,${roomName}OutdoorWetTemp,${roomName}RealtimeLoad`,
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
				obj['name'] = values.name
				let env = []
				let list = values.envList.split(',')
				if (list != 0) {
					list.forEach((item,i) => {
						let jec = {"point":item}
						env.push(jec)
					});
				}
				obj['env'] = env
				let reward = {}
				//判断是否是自定义奖励点
				if (values.customReward) {
					//如果是自定义奖励点
					reward["custom"] = values.customPoint
				}else {
					reward["cost"] = values.powerTotalPoint
					reward["win"] = values.coolingPoint
				}
				obj['reward'] = reward

				this.props.handleOk(obj);
				this.props.hideAddConfigModal();
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
		const { getFieldDecorator,getFieldValue } = this.props.form;
		const formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 18
			},
		};

		return (
			<Modal
				className={modalToggleClass}
				title="新建调优记录表"
				width={680}
				visible={this.props.isShowAddConfigModal}
				onCancel={this.props.hideAddConfigModal}
				onOk={this.handleSubmit}
				maskClosable={false}
                destroyOnClose={true}    //关闭时消除子组件，防止多个弹框打开点表框时，层叠顺序错乱，点名弹框在下面的bug
				cancelText="取消"
				okText="确定"
			>
				<Form style={{ marginTop: '10px' }}>
					<FormItem
						className={calendarToggleClass}
						{...formItemLayout}
						label="记录表名称"
					>
						{getFieldDecorator('name', {
							rules: [{
								required: true, message: '请输入调优记录表名称!'
							}]
						})(
							<Input 
								width={300}
							/>
						)}
					</FormItem>
					<FormItem
						style={{ marginBottom: 10 }}
						{...formItemLayout}
						label="环境因素"
						className={selectToggleClass}
						>
						{getFieldDecorator('envList', {
							initialValue:this.state.envList,
							rules: [{
								required: true, message: '环境因素不能为空!'
							}]
						})(
							<TextArea 
								autoSize={{ minRows: 2, maxRows: 10 }}
							/>
						)}
					</FormItem>
					<FormItem
						style={{ marginBottom: 10 }}
						{...formItemLayout}
						label="是否自定义奖励点名"
						className={selectToggleClass}
						>
						{getFieldDecorator('customReward', {
							valuePropName: 'checked' 
						})(
							<Switch checkedChildren="是" unCheckedChildren="否"/>
						)}
					</FormItem>
					{
						getFieldValue("customReward") == true? 
						<FormItem
							style={{ marginBottom: 10 }}
							{...formItemLayout}
							label="自定义优化奖励点"
							className={selectToggleClass}
							>
							{getFieldDecorator('customPoint', {
								initialValue:"",
								rules: [{
									required: true, message: '自定义优化奖励点不能为空!'
								}]
							})(
								<Input 
									width={200}
								/>
							)}
						</FormItem>
						:
						<div>
							<FormItem
								style={{ marginBottom: 10 }}
								{...formItemLayout}
								label="优化奖励的电量点"
								className={selectToggleClass}
								>
								{getFieldDecorator('powerTotalPoint', {
									initialValue:this.state.rewardCost,
									rules: [{
										required: true, message: '优化奖励的电量点不能为空!'
									}]
								})(
									<Input 
										width={200}
									/>
								)}
							</FormItem>
							<FormItem
								style={{ marginBottom: 10 }}
								{...formItemLayout}
								label="优化奖励的冷量点"
								className={selectToggleClass}
								>
								{getFieldDecorator('coolingPoint', {
									initialValue:this.state.rewardWin,
									rules: [{
										required: true, message: '优化奖励的冷量点不能为空!'
									}]
								})(
									<Input 
										width={200}
									/>
								)}
							</FormItem>
						</div>
					}
					
				</Form>
			</Modal>
		);
	}
}
const WrappedAddConfigModal = Form.create()(AddConfigModal);

export default WrappedAddConfigModal
