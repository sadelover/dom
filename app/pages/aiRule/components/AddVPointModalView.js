/**
 * 新增虚拟点-模态框
 */
import React from 'react';
import { Button, Modal, Radio, Icon, Form, Input, Select, Row, Col } from 'antd';

import http from '../../../common/http';
import ApiModalView from "./ApiModalView";

const { TextArea } = Input;

const Option = Select.Option;
const FormItem = Form.Item;

const formItemLayout = {
	labelCol: {
		xs: { span: 12 },
		sm: { span: 7 },
	},
	wrapperCol: {
		xs: { span: 14 },
		sm: { span: 15 },
	},
};

const formItemLayout3 = {
	labelCol: {
		xs: { span: 13 },
		sm: { span: 12 },
	},
	wrapperCol: {
		xs: { span: 14 },
		sm: { span: 11 },
	},
};
const formItemLayout4 = {
	labelCol: {
		xs: { span: 13 },
		sm: { span: 10 },
	},
	wrapperCol: {
		xs: { span: 14 },
		sm: { span: 11 },
	},
};

const btnStyle = {
	borderRadius: '5px',
	marginRight: '8px'
}

class AddVPointModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			apiVisible: false,
			loading: false,
			pdfLoading: false
		}
	}

	componentDidMount() {

	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.setState({
					loading: true
				})
				http.post('/point/addOnePoint', values)
					.then(res => {
						if (res.err == 0) {
							//新增点名后，需要重新获取项目所有点的释义信息
							http.get('/analysis/get_pointList_from_s3db/1/50000')
							.then(
								data => {
									if (data.status === 'OK') {
										var pointList = [].concat(data['data']['pointList']);
										localStorage.setItem('allPointList', JSON.stringify(pointList));
									}
								}
							).catch(
								err => {
									console.error('初始化-获取点名清单失败!');
								}
							);

							this.props.handleCancel()
							// this.props.reload()
							Modal.success({
								title:'成功提示',
								zIndex:1200,
								content: '创建点名成功！'
							})
							this.props.searchPointData(values.name) //搜索新建点名
							this.props.setSearch(values.name)  //搜索框内如 同步新建点名
						} else {
							Modal.error({
								title:'错误提示',
								zIndex:1200,
								content: '后台报错-创建点名请求失败'+res.msg
							})
						}
						this.setState({
							loading: false
						})
					}).catch(err => {
						this.setState({
							loading: false
						})
						Modal.error({
							title:'错误提示',
							zIndex:1200,
							content: '后台报错-创建点名请求失败'
						})
					})
			}
		});
	}

	// 公式试算
	addrCalculation = () => {
		const addr = this.props.form.getFieldValue('addr')
		http.post('/tool/evalStringExpression', {
			"str": addr,
			"debug": 1
		}).then(res => {
			if (res.err == 0) {
				Modal.info({
					title: '测试信息',
					zIndex:1200,
					content: (
						<div style={{ marginTop: 15 }}>
							<p style={{ marginBottom: 10, fontSize: 20 }}>计算结果为：{res.data}</p>
							<TextArea autoSize={{ minRows: 9, maxRows: 18 }} value={res.debugInfo} />
						</div>
					)
				})
			} else {
				Modal.error({
					title:'错误提示',
					zIndex:1200,
					content: '后台报错-试算接口请求失败'
				})
			}
		}).catch(err => {
			Modal.error({
				title:'错误提示',
				zIndex:1200,
				content: '后台报错-试算接口请求失败'
			})
		})
	}

	showApiModal = () => {
		this.setState({
			apiVisible: true
		})
	}

	handleCancelApiModal = () => {
		this.setState({
			apiVisible: false
		})
	}

	setAddr = (api) => {
		let addr = this.props.form.getFieldValue('addr')
		if (addr == undefined) {
			addr = ""
		}
		this.props.form.setFieldsValue({
			addr: addr + api
		})
	}

	render() {
		const { getFieldDecorator } = this.props.form
		const form = this.props.form
		return (
			<Modal
				title='新建虚拟点'
				visible={this.props.visible}
				maskClosable={false}
				onOk={this.handleSubmit}
				onCancel={this.props.handleCancel}
				width={1100}
				zIndex={1100}
				destroyOnClose={true} 
				footer={
					<div>
						<Button onClick={this.props.handleCancel}>取消</Button>
						<Button loading={this.state.loading} onClick={this.handleSubmit}>确定</Button>
					</div>
				}
			>
				<Form>
					<Row>
						<Col span={9}>
							<FormItem
								{...formItemLayout}
								label="变量ID"
							>
								{getFieldDecorator('name', {
									rules: [
										{
											required: true,
											message: 'PhysicalID不能为空！',
										}
									],
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="点来源/类型"
							>
								{getFieldDecorator('sourceType', {
									initialValue:"vpoint"
								})(
									<Select>
										<Option key="1" value="vpoint">vpoint</Option>
									</Select>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="释义/注释"
							>
								{getFieldDecorator('description', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="单位"
							>
								{getFieldDecorator('unit', {
								})(
									<Select>
										<Option value='%'>%</Option>
										<Option value='Pa'>Pa</Option>
										<Option value='kPa'>kPa</Option>
										<Option value='℃'>℃</Option>
										<Option value='h'>h</Option>
										<Option value='Hz'>Hz</Option>
										<Option value='V'>V</Option>
										<Option value='kW'>kW</Option>
										<Option value='l/s'>l/s</Option>
										<Option value='kWh'>kWh</Option>
										<Option value='m³/h'>m³/h</Option>
										<Option value='Ton'>Ton</Option>
										<Option value='kW/Ton'>kW/Ton</Option>
										<Option value='kWh/Nm3'>kWh/Nm3</Option>
										<Option value='kg'>kg</Option>
										<Option value='kg/cm²'>kg/cm²</Option>
										<Option value='bar'>bar</Option>
										<Option value='MPa'>MPa</Option>
										<Option value='mH20'>mH20</Option>
										<Option value='m'>m</Option>
										<Option value='cm'>cm</Option>
										<Option value='mm'>mm</Option>
										<Option value='J'>J</Option>
										<Option value='KJ'>KJ</Option>
										<Option value='GJ'>GJ</Option>
										<Option value='HP'>HP</Option>
										<Option value='RT'>RT</Option>
										<Option value='W/m²'>W/m²</Option>
										<Option value='KJ/kg'>KJ/kg</Option>
									</Select>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="读写属性"
							>
								{getFieldDecorator('RW', {
								})(
									<Select>
										<Option value={0}>R</Option>
										<Option value={1}>W</Option>
									</Select>
								)}
							</FormItem>
							<FormItem
								labelCol={{
									xs: { span: 12 },
									sm: { span: form.getFieldValue('sourceType') == 'vpoint' ? 17 : 8 },
								}}
								wrapperCol={{
									xs: { span: 16 },
									sm: { span: 19, offset: 3 },
								}}
								colon={form.getFieldValue('sourceType') == 'vpoint' ? false : true}
								label={
									<div style={{ display: 'inline-block' }}>
										{
											form.getFieldValue('sourceType') == 'bacnet' ? "Bacnet Server"
												: form.getFieldValue('sourceType') == 'logix' || form.getFieldValue('sourceType') == 'ModbusEquipment' || form.getFieldValue('sourceType') == 'DCIM' ? "预留参数1"
													: form.getFieldValue('sourceType') == 'modbus' ? "MODBUS地址"
														: form.getFieldValue('sourceType') == 'simense1200TCP' ? "PLC绝对地址"
															: form.getFieldValue('sourceType') == 'vpoint' ?
																<div>
																	逻辑语法脚本：
																	<Button size="small" style={btnStyle} onClick={this.showApiModal}>API选择</Button>
																	<Button size="small" style={btnStyle} onClick={this.addrCalculation}>试算</Button>
																</div>
																: "预留参数1"
										}

									</div>
								}
							>
								{getFieldDecorator('addr', {
								})(
									<TextArea rows={5} />
								)}
							</FormItem>
						</Col>
						<Col span={8}>
							<FormItem
								{...formItemLayout3}
								label={
									form.getFieldValue('sourceType') == 'bacnet' ? "点类型(AI/AO/BI/BO/AV...)"
										: form.getFieldValue('sourceType') == 'logix' || form.getFieldValue('sourceType') == 'ModbusEquipment' || form.getFieldValue('sourceType') == 'DCIM' ? "预留参数2"
											: form.getFieldValue('sourceType') == 'simense1200TCP' ? '点类型(VT_R4/VT_BOOL...)'
												: form.getFieldValue('sourceType') == 'modbus' ? "点地址号"
													: "计算执行周期(秒)"
								}
							>
								{getFieldDecorator('param2', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout3}
								label={
									form.getFieldValue('sourceType') == 'bacnet' ? "点相对地址(RegAddress)"
										: form.getFieldValue('sourceType') == 'simense1200TCP' ? "PLC TCP/IP网络地址"
											: form.getFieldValue('sourceType') == 'modbus' ? "功能号(默认03)"
												: "预留参数3"
								}
							>
								{getFieldDecorator('param3', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout3}
								label={
									form.getFieldValue('sourceType') == 'bacnet' || form.getFieldValue('sourceType') == 'modbus' ? "倍率(最终值=采集值/倍率)"
										: form.getFieldValue('sourceType') == 'simense1200TCP' ? "rack(机架号)"
											: "预留参数4"
								}
							>
								{getFieldDecorator('param4', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout3}
								label={
									form.getFieldValue('sourceType') == 'modbus' ? "IP地址(如192.168.0.1)"
										: form.getFieldValue('sourceType') == 'simense1200TCP' ? "slot(槽号)"
											: "预留参数5"
								}
							>
								{getFieldDecorator('param5', {
								})(
									<Input
										disabled={
											form.getFieldValue('sourceType') == 'bacnet' ? true : false
										}
									/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout3}
								label={
									form.getFieldValue('sourceType') == 'modbus' ? "类型"
										: form.getFieldValue('sourceType') == 'simense1200TCP' ? "倍率或映射定义"
											: "预留参数6"
								}
							>
								{getFieldDecorator('param6', {
								})(
									form.getFieldValue('sourceType') == 'modbus' ?
										<Select>
											<Option value='Signed'>Signed</Option>
											<Option value='Unsigned'>Unsigned</Option>
											<Option value='Bit'>Bit</Option>
											<Option value='Long'>Long</Option>
											<Option value='Long Inverse'>Long Inverse</Option>
											<Option value='Float'>Float</Option>
											<Option value='Floatlnverese'>Floatlnverese</Option>
											<Option value='Double'>Double</Option>
											<Option value='Doublelnverse'>Doublelnverse</Option>
											<Option value='String'>String</Option>
											<Option value='Stringlnverse'>Stringlnverse</Option>
											<Option value='PowerLink'>PowerLink</Option>
											<Option value='Unsigned Long'>Unsigned Long</Option>
											<Option value='Unsigned Longlnverse'>Unsigned Longlnverse</Option>
										</Select>
										:
										<Input
											disabled={
												form.getFieldValue('sourceType') == 'bacnet' ? true : false
											}
										/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout3}
								label={
									form.getFieldValue('sourceType') == 'modbus' ? "数据长度"
										: form.getFieldValue('sourceType') == 'simense1200TCP' ? "归属进程号(0-9)"
											: "预留参数7"
								}
							>
								{getFieldDecorator('param7', {
								})(
									<Input
										disabled={
											form.getFieldValue('sourceType') == 'bacnet' || form.getFieldValue('sourceType') == 'modbus' ? true : false
										}
									/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout3}
								label="预留参数8"
							>
								{getFieldDecorator('param8', {
								})(
									<Input
										disabled={
											form.getFieldValue('sourceType') == 'bacnet' || form.getFieldValue('sourceType') == 'simense1200TCP' || form.getFieldValue('sourceType') == 'vpoint' || form.getFieldValue('sourceType') == 'modbus' ? true : false
										}
									/>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout3}
								label="预留参数9"
							>
								{getFieldDecorator('param9', {
								})(
									<Input
										disabled={
											form.getFieldValue('sourceType') == 'bacnet' || form.getFieldValue('sourceType') == 'simense1200TCP' || form.getFieldValue('sourceType') == 'vpoint' || form.getFieldValue('sourceType') == 'modbus' ? true : false
										}
									/>
								)}
							</FormItem>
						</Col>
						<Col span={7}>
							<FormItem
								{...formItemLayout4}
								label="预留参数10"
							>
								{getFieldDecorator('param10', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout4}
								label="最大值"
							>
								{getFieldDecorator('highhigh', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout4}
								label="最小值"
							>
								{getFieldDecorator('low', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout4}
								label="存储周期"
							>
								{getFieldDecorator('storecycle', {
								})(
									<Select>
										<Option value="0">不存储</Option>
										<Option value="1">5秒</Option>
										<Option value="2">1分钟</Option>
										<Option value="3">5分钟</Option>
										<Option value="4">半小时</Option>
										<Option value="5">1小时</Option>
										<Option value="6">1天</Option>
										<Option value="7">1周</Option>
									</Select>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout4}
								label="自定义"
							>
								{getFieldDecorator('customName', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout4}
								label="系统"
							>
								{getFieldDecorator('system', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout4}
								label="设备"
							>
								{getFieldDecorator('device', {
								})(
									<Input />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout4}
								label="类型"
							>
								{getFieldDecorator('type', {
								})(
									<Input />
								)}
							</FormItem>
						</Col>

					</Row>
				</Form>
				<ApiModalView
					visible={this.state.apiVisible}
					handleCancel={this.handleCancelApiModal}
					setAddr={this.setAddr}
				/>
			</Modal>
		)
	}
}
const WrappedAddVPointModal = Form.create()(AddVPointModal);

export default WrappedAddVPointModal
