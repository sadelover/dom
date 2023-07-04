/**
 * 制冷系统的优化控制信息设定值模态框
 */
import React from 'react';
import { Modal, Form, InputNumber, Spin, Alert, Input, Button, Select } from 'antd'
import s from './OptimizeValueModalView.css'
import cx from 'classnames';

import http from '../../../common/http';

const FormItem = Form.Item;
const { Option } = Select;
let str;
if (localStorage.getItem('serverOmd') == "best") {
	str = 'warning-config-best'
} else {
	str = ''
}

class SettingValueModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isLimit: false,
			currentValue: '',
			textValue: this.props.currentValue,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.getOption = this.getOption.bind(this);
	}

	componentDidMount() {
		let description
		if (this.props.pointInfo && this.props.pointInfo.pointInfo) {
			if (this.props.pointInfo.pointInfo.hight > this.props.pointInfo.pointInfo.low || (this.props.pointInfo.pointInfo.hight && this.props.pointInfo.pointInfo.low == undefined) || (this.props.pointInfo.pointInfo.hight == undefined && this.props.pointInfo.pointInfo.low)) {  //判断有无高低限
				this.setState({
					isLimit: true
				})
			};
			description = this.props.pointInfo && this.props.pointInfo.description
		}

		for (var i = 0; i < this.props.dictBindString.length; i++) {
			for (var j = 0; j < this.props.dictBindString[i].length; j++) {
				if (this.props.dictBindString[i][j] === ':') {
					var flagNum = this.props.dictBindString[i].slice(0, j);
					if (flagNum === this.props.currentValue) {
						this.setState({
							currentValue: this.props.dictBindString[i].slice(j + 1)
						})
					}
				}
			}
		}

	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.visible !== this.props.visible) {
			this.setState({
				textValue: this.props.currentValue
			})
			return true
		}
		if (nextState.textValue !== this.state.textValue) {
			return true
		}
		if (nextState.currentValue !== this.state.currentValue) {
			return true
		}
		if (nextState.isLimit !== this.state.isLimit) {
			return true
		}
		if (this.props.isLoading !== nextProps.isLoading) {
			return true
		}
		return false
	}

	handleChange = (value) => {
		this.setState({
			textValue: value
		})
	}

	//点击确定，提交
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (values.settingValue === undefined && !this.props.isLoading && this.props.dictBindString === '') {
					Modal.warning({
						title: '信息提示',
						content: '设定值格式错误!',
					});
				} else if (!(/(^-?[0-9]+$)|(^-?[0-9]+\.[0-9]+$)/g).test(values.settingValue) && !isNaN(Number(this.props.currentValue)) && this.props.dictBindString === '') { //如果当前值是空或者数字，且输入的新值为空或者非数字，则弹框警报，设置失败
					Modal.warning({
						title: '信息提示',
						content: '设定值格式错误!'
					});
				} else if ((this.state.isLimit === true) && (values.settingValue > this.props.pointInfo.pointInfo.hight || values.settingValue < this.props.pointInfo.pointInfo.low) && this.props.dictBindString == '') {
					Modal.warning({
						title: '信息提示',
						content: '设定值超出高低线!'
					});
				} else if (this.props.dictBindString != '') {
					for (var i = 0; i < this.props.dictBindString.length; i++) {
						for (var j = 0; j < this.props.dictBindString[i].length; j++) {
							if (this.props.dictBindString[i][j] === ':') {
								var flagStr = this.props.dictBindString[i].slice(j + 1);
								if (flagStr === values.settingValue) {
									values.settingValue = this.props.dictBindString[i].slice(0, j)
								}
							}
						}
					}
					this.props.handleOk(values, this.props.idCom);
				} else {
					this.props.handleOk(values, this.props.idCom);
				}

			}
		});
	}

	getOption() {
		let dictBindString = []
		this.props.dictBindString.map((item, index) => {
			for (let i = 0; i < item.length; i++) {
				if (item[i] === ':') {
					dictBindString.push(item.slice(i + 1));
				}
			}
		})
		return dictBindString.map((item, index) => {
			return (
				<Option value={item}>{item}</Option>
			)
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		let { visible } = this.props;
		const formItemLayout = {
			labelCol: {
				span: 8
			},
			wrapperCol: {
				span: 15
			},
		};
		visible = typeof visible === 'undefined' ? true : visible;



		return (
			<Modal
				title={this.props.isLoading ? '指令设置进度提示' : '确认指令'}
				width={500}
				visible={visible}
				onCancel={this.props.hideModal}
				onOk={this.handleSubmit}
				maskClosable={false}
				wrapClassName={str}
				autoFocusButton
				destroyOnClose
				footer={
					this.props.isLoading ?
						[
							<Button onClick={this.props.hideModal} >确认</Button>
						] :
						[

							<Button onClick={this.props.hideModal} >取消</Button>,
							<Button id="textChangeValue" onClick={this.handleSubmit} >确认</Button>
						]
				}
			>
				{
					this.props.isLoading ?
						<Spin tip={this.props.modalConditionDict.status ? '正在修改设定值' : this.props.modalConditionDict.description}>
							<Alert
								message="提示"
								description="数据正在更新"
								type="info"
							/>
						</Spin>
						:
						<Form>
							{this.props.dictBindString != '' ?
								<FormItem
									{...formItemLayout}
									label="当前值："
								>
									{getFieldDecorator('currentValue', {
										initialValue: this.state.currentValue,
									})(
										<Input style={{ width: 160, backgroundColor: "transparent" }} disabled={true} />
									)}
								</FormItem>
								:
								<FormItem
									{...formItemLayout}
									label="当前值："
								>
									{getFieldDecorator('currentValue', {
										initialValue: this.props.currentValue,
									})(
										<Input style={{ width: 160, backgroundColor: "transparent" }} disabled={true} />
									)}
								</FormItem>
							}
							{
								this.state.isLimit ?
									this.props.dictBindString != '' ?
										<FormItem
											{...formItemLayout}
											label="设置新值"
										>
											{getFieldDecorator('settingValue', {
												initialValue: this.state.currentValue,
											})(
												<Select style={{ width: 160 }} onChange={this.handleChange}>
													{this.getOption()}
												</Select>
											)}
										</FormItem>
										:
										!isNaN(Number(this.props.currentValue)) ?
											<FormItem
												{...formItemLayout}
												label="设置新值"
											>
												{getFieldDecorator('settingValue', {
													initialValue: this.props.currentValue,
												})(
													<InputNumber
														autoFocus
														ref={(input) => {input.inputNumberRef.input.select()}}
														style={{ width: 160 }}
														min={this.props.pointInfo.pointInfo.low}
														max={this.props.pointInfo.pointInfo.hight}
														precision={2}
														onChange={this.handleChange}
													/>
												)}
											</FormItem>
											:
											<FormItem
												{...formItemLayout}
												label="设置新值"
											>
												{getFieldDecorator('settingValue', {
													initialValue: this.props.currentValue,
												})(

													<Input autoFocus ref={(input) => {input.input.select()}} style={{ width: 160 }} min={this.props.pointInfo.pointInfo.low} max={this.props.pointInfo.pointInfo.hight} />
												)}
											</FormItem>


									:
									this.props.dictBindString != '' ?
										<FormItem
											{...formItemLayout}
											label="设置新值"
										>
											{getFieldDecorator('settingValue', {
												initialValue: this.state.currentValue,
											})(
												<Select style={{ width: 160 }} onChange={this.handleChange}>
													{
														this.getOption()
													}
												</Select>
											)}
											<span style={{ color: 'red' }}>
												&nbsp;&nbsp;{this.state.currentValue == "" ? "请检查枚举模式配置" : ""}
											</span>
										</FormItem>
										:
										!isNaN(Number(this.props.currentValue)) ?
											<FormItem
												{...formItemLayout}
												label="设置新值"
											>
												{getFieldDecorator('settingValue', {
													initialValue: this.props.currentValue,
												})(
													<InputNumber
														//自动聚焦
														autoFocus
														//自动全选
														ref={(input) => {input.inputNumberRef.input.select()}}
														style={{ width: 160 }}
														precision={2}
														onChange={this.handleChange}
													/>
												)}
											</FormItem>
											:
											<FormItem
												{...formItemLayout}
												label="设置新值"
											>
												{getFieldDecorator('settingValue', {
													initialValue: this.props.currentValue,
												})(
													< Input autoFocus ref={(input) => {input.input.select()}} style={{ width: 160 }} />
												)}
											</FormItem>
							}
							{
								this.state.isLimit ?
									<FormItem
										{...formItemLayout}
										label="高低限"
									>
										{getFieldDecorator('hlLimit', {
											initialValue: this.props.pointInfo.pointInfo.low == undefined || this.props.pointInfo.pointInfo.low == '' ? '高限=' + this.props.pointInfo.pointInfo.hight : this.props.pointInfo.pointInfo.hight == undefined || this.props.pointInfo.pointInfo.hight == '' ? '低限=' + this.props.pointInfo.pointInfo.low : this.props.pointInfo.pointInfo.low + '~' + this.props.pointInfo.pointInfo.hight,
										})(
											<Input style={{ width: 160 }} disabled={true} />
										)}
									</FormItem>
									:
									<FormItem
										{...formItemLayout}
										label="高低限"
									>
										{getFieldDecorator('hlLimit', {
											initialValue: '不受限制',
										})(
											<Input style={{ width: 160 }} disabled={true} />
										)}
									</FormItem>
							}


						</Form>
				}

			</Modal>
		);
	}
}
// 注：Form.create方法会自动收集数据并进行处理
const OptimizeValueModal = Form.create()(SettingValueModal);

export default OptimizeValueModal


