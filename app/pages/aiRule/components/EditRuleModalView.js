/**
 * 修改AI决策-模态框
 */
import React from 'react';
import { Button, Modal, Radio, Icon, Form, Input, Select, InputNumber, Row, Col } from 'antd';
import moment from 'moment';
import {modalTypes} from '../../../common/enum'
import InputPointModalView from '../containers/InputPointModalContainer';
import OutputPointModalView from '../containers/OutputPointModalContainer';

import http from '../../../common/http';

const RadioGroup = Radio.Group;
const { TextArea} = Input;


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

class EditRuleModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			day: 0,
			week: 0,
			month: 0,
			type:1
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err && values.input != "") {
				let obj = {}
				obj['title'] = values.title
				obj['modelType'] = values.modelType
				obj['intervalSeconds'] = values.intervalSeconds

				this.props.handleOk(obj);
				this.props.handleHide();
			}
		});
	}

	handleHidePointModal = ()=> {
        const {showPointModal,onSelectChangeInput} = this.props
		onSelectChangeInput([])
        showPointModal(modalTypes.AI_INPUT_POINT_MODAL)
    }

	
	handleOutputPointModal = ()=> {
        const {showPointModal,onSelectChangeInput} = this.props
		onSelectChangeInput([])
        showPointModal(modalTypes.AI_OUTPUT_POINT_MODAL)
    }

	// componentWillReceiveProps(nextProps) {
	// 	if (nextProps.selectedPointInput !== this.props.selectedPointInput && nextProps.selectedPointInput.name !== this.props.selectedPointInput.name && nextProps.selectedPointInput.name != undefined) {
	// 		let pointName = nextProps.selectedPointInput.name
	// 		let input = nextProps.form.getFieldValue('input') != undefined ? nextProps.form.getFieldValue('input') : '';
	// 		const { setFieldsValue } = this.props.form
	// 		if (input.substr(input.length - 1, 1) == ",") {
	// 			setFieldsValue({
	// 				input: `${input}${pointName},`,
	// 			})
	// 		}else{
	// 			setFieldsValue({
	// 				input: `${input},${pointName},`,
	// 			})
	// 		}
	// 	}
	// 	if (nextProps.selectedPointOutput !== this.props.selectedPointOutput && nextProps.selectedPointOutput.name !== this.props.selectedPointOutput.name && nextProps.selectedPointOutput.name != undefined) {
	// 		let pointName = nextProps.selectedPointOutput.name
	// 		let output = nextProps.form.getFieldValue('output') != undefined ? nextProps.form.getFieldValue('output') : '';
	// 		const { setFieldsValue } = this.props.form
	// 		if (output.substr(output.length - 1, 1) == ",") {
	// 			setFieldsValue({
	// 				input: `${output}${pointName},`,
	// 			})
	// 		}else{
	// 			setFieldsValue({
	// 				input: `${output},${pointName},`,
	// 			})
	// 		}
	// 	}
	// 	// if (nextProps.visible && !this.props.visible) {
	// 	// 	const { setFieldsValue } = this.props.form
	// 	// 	setFieldsValue({
	// 	// 		input: "",
	// 	// 		output:"",
	// 	// 		title: ""
	// 	// 	})
	// 	// }

	// }


	render() {
		const { getFieldDecorator } = this.props.form;
		const {config} = this.props
		let title = config != undefined && config.title != undefined ? config.title : ""
		let modelType = config != undefined && config.modelType != undefined ? config.modelType : ""
		let intervalSeconds = config != undefined && config.intervalSeconds != undefined ? config.intervalSeconds : ""

		const formItemLayout = {
			labelCol: {
				span: 4
			},
			wrapperCol: {
				span: 20
			},
		};
		const formTimeItemLayout = {
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
				title="修改AI决策信息"
				width={680}
				visible={this.props.visible}
				onCancel={this.props.handleHide}
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
							label="决策名称"
					>
							{getFieldDecorator('title', {
								rules: [{
									required: true, message: '请输入“决策名称”!'
								}],
								initialValue: title
							})(
								<Input 
									
								/>
							)}
					</FormItem>
					<FormItem
						style={{ marginBottom: 10 }}
						{...formItemLayout}
						label="决策模型"
						className={selectToggleClass}
						>
						{getFieldDecorator('modelType', {
							rules: [{
								required: true, message: '请选择“决策模型”脚本!'
							}],
							initialValue: modelType
						})(
							<Select>
                                    <Option value='Linear' >线性回归</Option>
                                    <Option value='DicisionTree' >决策树</Option>
							</Select>
						)}
					</FormItem>
					<FormItem
						style={{ marginBottom: 10 }}
						{...formTimeItemLayout}
						label="一轮输出的间隔秒数"
						className={selectToggleClass}
						>
						{getFieldDecorator('intervalSeconds', {
							rules: [{
								required: true, message: '请编辑“输入条件”脚本!'
							}],
							initialValue:intervalSeconds
						})(
							<InputNumber
							/>
						)}
					</FormItem>
				</Form>
			</Modal>
		);
	}
}
const WrappedEditRuleModal = Form.create()(EditRuleModal);

export default WrappedEditRuleModal
