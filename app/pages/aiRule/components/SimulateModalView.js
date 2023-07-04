/**
 * AI决策-模拟决策-模态框
 */
import React from 'react';
import { Button, Modal, Radio, Icon, Form, Input, Select, Spin, Row, Col } from 'antd';
import moment from 'moment';
import {modalTypes} from '../../../common/enum'
import InputPointModalView from '../containers/InputPointModalContainer';
import OutputPointModalView from '../containers/OutputPointModalContainer';

import http from '../../../common/http';
import Item from 'antd/lib/list/Item';

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
			loading:false
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	// componentWillReceiveProps(nextProps) {
	// 	if (!this.props.visible && nextProps.visible) {
	// 		if (nextProps.visible == true ) {
	// 			this.setState({
	// 				tableLoading:true
	// 			},()=>{this.getDataSource(nextProps.config.output);})
	// 		}
	// 	}
	// }

	componentDidMount() {
		
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

	
	handleOutputPointModal = ()=> {
        const {showPointModal,onSelectChangeInput} = this.props
		onSelectChangeInput([])
        showPointModal(modalTypes.AI_OUTPUT_POINT_MODAL)
    }

	getInputItem =(input,inputRealValues)=>{
		const { getFieldDecorator,setFieldsValue } = this.props.form;
		const formTimeItemLayout = {
			labelCol: {
				span: 14
			},
			wrapperCol: {
				span: 10
			},
		};
		if (input !=undefined && input.length !=0) {
			let allPointList = []
			let inputCN = []
			if (localStorage.getItem('allPointList') != undefined) {
				allPointList = JSON.parse(localStorage.getItem('allPointList'))
			}
			//遍历点注释列表，给每个列名点找到相应注释
			input.forEach(item => {
				let description = ""
				try{
					allPointList.forEach((point,j) => {
						//如果点名匹配，则用抛出异常的方法停止循环
						if (item == point.name) {
							description = point.description
							throw new Error("break");
						}
						//否则如果已判断到最后还未抛出，则视为无该点名
						if (j == allPointList.length-1) {
							inputCN.push("点名不存在");
						}
					})
				}catch(err) {
					if (err.message == "break") {
						inputCN.push(description)
					}
				}
			});
			
			let inputItems = input.map((item,i)=>{
				return(
					<FormItem
							className={calendarToggleClass}
							{...formTimeItemLayout}
							colon={false}
							label={
								<div style={{display:'inline-block'}}>
									<p style={{overflowWrap:'normal',height:20}}>{item}</p>
									<p style={{overflowWrap:'normal',height:20}}>{inputCN[i]}</p>
								</div>
							}
					>
							{getFieldDecorator(item, {
								rules: [{
									required: true, message: '请输入环境参数!'
								}]
							})(
								<Input/>
							)}
					</FormItem>
				)
				
			})
			
			return inputItems;
		}
	}

	getOutputItem =(output)=>{
		const { getFieldDecorator } = this.props.form;
		const formTimeItemLayout = {
			labelCol: {
				span: 14
			},
			wrapperCol: {
				span: 10
			},
		};
		if (output !=undefined && output.length !=0) {
			let allPointList = []
			let outputCN = []
			if (localStorage.getItem('allPointList') != undefined) {
				allPointList = JSON.parse(localStorage.getItem('allPointList'))
			}
			//遍历点注释列表，给每个列名点找到相应注释
			output.forEach(item => {
				let description = ""
				try{
					allPointList.forEach((point,j) => {
						//如果点名匹配，则用抛出异常的方法停止循环
						if (item == point.name) {
							description = point.description
							throw new Error("break");
						}
						//否则如果已判断到最后还未抛出，则视为无该点名
						if (j == allPointList.length-1) {
							outputCN.push("点名不存在");
						}
					})
				}catch(err) {
					if (err.message == "break") {
						outputCN.push(description)
					}
				}
			});

			let outputItems = output.map((item,i)=>{
				return(
					<FormItem
							className={calendarToggleClass}
							{...formTimeItemLayout}
							colon={false}
							label={
								<div style={{display:'inline-block'}}>
									<p style={{overflowWrap:'normal',height:20}}>{item}</p>
									<p style={{overflowWrap:'normal',height:20}}>{outputCN[i]}</p>
								</div>
							}
					>
							{getFieldDecorator(item, {
								
							})(
								<Input 
									
								/>
							)}
					</FormItem>
				)
			})
			return outputItems;
		}
	}

	getSimulateData =()=>{
		const { getFieldsValue,validateFields,setFieldsValue } = this.props.form
		const {input,output} = this.props.config
		validateFields((errors, values) => {
			if (!errors) {
				let inputData = []
				if (input.length != 0) {
					input.forEach(element => {
						if (values[element] != undefined) {
							inputData.push(Number(values[element]))
						}
					});
					console.log(inputData)

					this.setState({
						loading:true
					})

					http.post('/learnModel/predict', {
						"model_name": this.props.currentKey,
						"x_data_list": [inputData]
					}).then(
						data => {
							this.setState({
								loading:false
							})
							if (!data.err) {
								if (output.length !=0) {
									//输出是一个时，返回的结构是一维数组
									if (output.length == 1) {
										output.forEach((item,i)=>{
											setFieldsValue({
												[item] : data.data[0]
											})
										})
									}else {
										//输出是多个时，返回的结构是二维数组
										output.forEach((item,i)=>{
											setFieldsValue({
												[item] : data.data[0][i]
											})
										})
									}
								}
							} 
						}
					).catch(
						err => {
							Modal.error({
								title: '错误提示',
								content: "模拟失败，接口请求失败！"
							});
							this.setState({
								loading:false
							})
						}
					)
				}

			}
		})
	}


	render() {
		let input = JSON.stringify(this.props.config) != "{}" && this.props.config != undefined ? this.props.config.input: []
		let output = JSON.stringify(this.props.config) != "{}" && this.props.config != undefined ? this.props.config.output: []
		const formButItemLayout = {
			labelCol: {
				span: 16
			},
			wrapperCol: {
				span: 8
			},
		}

		return (
			<Modal
				className={modalToggleClass}
				title="模拟决策"
				width={600}
				visible={this.props.visible}
				onCancel={this.props.handleHide}
				onOk={this.handleSubmit}
				maskClosable={false}
                destroyOnClose={true}    //关闭时消除子组件，防止多个弹框打开点表框时，层叠顺序错乱，点名弹框在下面的bug
				cancelText="取消"
				okText="确定"
				footer={null}
			>
				<div style={{ height: '700px',overflowY:'auto' }}>
					<Spin tip="正在请求数据" spinning={this.state.loading} style={{ height: '100%' }}>
						<Form style={{ marginTop: '5px' }} labelAlign='left'>
							{
								this.props.visible ?
							this.getInputItem(input,this.props.inputRealValues)
							:""
							}
						
							<FormItem
								style={{ marginTop: 20,marginBottom:20 }}
								{...formButItemLayout}
								label="点击按钮，获取下面模拟后的动作数据"
								>
								
								<Button type="primary" onClick={() => {this.getSimulateData()}}>开始模拟决策</Button>
							</FormItem>
							{
								this.props.visible ?
							this.getOutputItem(output)
							:""
							}
						</Form>
					</Spin>
				</div>
			</Modal>
		);
	}
}
const WrappedEditRuleModal = Form.create({
	mapPropsToFields : function(props){
		if (props.config !=undefined && props.config.input != undefined && props.config.input.length !=0 && props.inputRealValues.length !=0) {
			let input = props.config.input
			let inputRealValues = props.inputRealValues
			let str = {}
			input.map((jtem,j)=>{
				inputRealValues.forEach((item, i) => {
					if (jtem == item.name) {
						str[jtem] = Form.createFormField({value:item.value})
					}
				})
			})
			return str
		}
	}
})(EditRuleModal);

export default WrappedEditRuleModal
