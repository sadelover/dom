/**
 * 新增AI决策-模态框
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

class AddRuleModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			day: 0,
			week: 0,
			month: 0,
			type:1
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.getInputList = this.getInputList.bind(this);
		this.getOutputList = this.getOutputList.bind(this);
		this.handleHidePointAndGetSelectInput = this.handleHidePointAndGetSelectInput.bind(this);
		this.handleHidePointAndGetSelectOutput = this.handleHidePointAndGetSelectOutput.bind(this);
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err && values.input != "") {
				let obj = {}
				obj['input'] = values.input
				obj['title'] = values.title
				obj['output'] = values.output
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

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible && !this.props.visible) {
			const { setFieldsValue } = this.props.form
			setFieldsValue({
				input: "",
				output:"",
				title: ""
			})
		}
	}

	handleHidePointAndGetSelectInput= ()=> {
		this.props.hidePointModal();
		let newPointObj = this.props.selectedPointInput
		
		Modal.confirm({
			zIndex:1100,
			title: '确认提示',
			content: `确定要添加 “${newPointObj.description}(${newPointObj.name})” 吗？`,
			onOk: () => { 
				this.getInputList(newPointObj.name)
			},
			onCancel() { }
		})
	}

	getInputList = (pointName)=>{
			let input = this.props.form.getFieldValue('input') != undefined ? this.props.form.getFieldValue('input') : '';
			if (input == "" || input.indexOf(pointName) == -1) {
				const { setFieldsValue } = this.props.form
				setFieldsValue({
					input: `${input}${pointName},`,
				})
			}else {
				Modal.error({
					title: '错误提示',
					content: "新增点名与已选点名重复，请重新选择！"
				});
			}
	}

	handleHidePointAndGetSelectOutput= ()=> {
		this.props.hidePointModal();
		let newPointObj = this.props.selectedPointOutput
		
		Modal.confirm({
			zIndex:1100,
			title: '确认提示',
			content: `确定要添加 “${newPointObj.description}(${newPointObj.name})” 吗？`,
			onOk: () => { 
				this.getOutputList(newPointObj.name)
			},
			onCancel() { }
		})
	}

	getOutputList = (pointName)=>{
		let output = this.props.form.getFieldValue('output') != undefined ? this.props.form.getFieldValue('output') : '';
		if (output == "" || output.indexOf(pointName) == -1) {
			const { setFieldsValue } = this.props.form
			setFieldsValue({
				output: `${output}${pointName},`,
			})
		}else {
			Modal.error({
				title: '错误提示',
				content: "新增点名与已选点名重复，请重新选择！"
			});
		}
		
	}


	render() {
		const { getFieldDecorator } = this.props.form;
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
				title="新增AI决策"
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
							})(
								<Input 
									
								/>
							)}
					</FormItem>
					<FormItem
						className={calendarToggleClass}
						{...formItemLayout}
						label="参考环境"
					>
						{getFieldDecorator('input', {
							rules: [{
								required: true, message: '请添加“参考环境”!'
							}],
						})(
							<Input addonAfter={<Icon type="plus" style={{cursor:"pointer"}} onClick={this.handleHidePointModal} />}  />
						)}
					</FormItem>
					<FormItem
						className={calendarToggleClass}
						{...formItemLayout}
						label="动作输出"
					>
						{getFieldDecorator('output', {
							rules: [{
								required: true, message: '请添加“动作输出”!'
							}],
						})(
							<Input addonAfter={<Icon type="plus" style={{cursor:"pointer"}} onClick={this.handleOutputPointModal} />}  />
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
							initialValue:300
						})(
							<InputNumber
							/>
						)}
					</FormItem>
				</Form>
				<InputPointModalView
					hidePointModal={this.props.hidePointModal}
					handleOk = {this.handleHidePointAndGetSelectInput}
				/>
				<OutputPointModalView
					hidePointModal={this.props.hidePointModal}
					handleOk = {this.handleHidePointAndGetSelectOutput}
				/>
			</Modal>
		);
	}
}
const WrappedAddRuleModal = Form.create()(AddRuleModal);

export default WrappedAddRuleModal
