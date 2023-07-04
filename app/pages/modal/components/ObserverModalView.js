/**
 * 报警配置页面
 */
import React from 'react';
import { Modal, Spin, Alert, InputNumber, Table, Select, Form, Input, Button, Col, Row, Checkbox, Icon, message, Tabs, Upload } from 'antd'
import s from './ObserverModalView.css'
import cx from 'classnames';
import as from './CommonAlarmModalView.css'
import { getWidgetByType } from '../../observer/components/widgets'
import { downloadUrl } from '../../../common/utils';
import ObserverScreen from '../../observer/components/core/observerScreen';
import http from '../../../common/http';
import appConfig from '../../../common/appConfig';
import LimitDrag from './LimitDrag';
import RcViewer from '@hanyk/rc-viewer'
import { SpriteAnimator } from '../../observer/components/core/sprites';
const { TabPane } = Tabs;
const Option = Select.Option;
const FormItem = Form.Item;
let nameList = [
    { No: "编号", Width: 50 },
    { Year: "购买年份", Width: 50 },
    { Name: "名称", Width: 110 },
    { RatingCoolingCapacity: "额定冷量", Width: 80 },
    { RatingCOP: "额定COP", Width: 80 },
    { RatingPower: "额定功率", Width: 80 },
    { Brand: "品牌", Width: 80 },
    { Model: "型号", Width: 100 },
    { RatingH: "额定扬程", Width: 50 },
    { RatingFlow: "额定流量", Width: 80 },
    { WithVSD: "是否变频", Width: 50 },
    { RatingAirVolume: "额定风量", Width: 80 },
    { Head: "扬程", Width: 50 },
    { TotalHead: "全压", Width: 100 },
    { RoomName: "房间名称", Width: 100 },
    { SystemNo: "系统编号", Width: 50 },
    { EquipName: "设备名称", Width: 100 },
    { Type: "型号及规格", Width: 100 },
    { Quantity: "数量", Width: 50 },
    { Size: "外形尺寸", Width: 100 },
    { AirVolumn: "风量", Width: 80 },
    { PressDrop: "压损", Width: 80 },
    { HeatLoad: "热量", Width: 80 },
    { HotWaterFlow: "热水流量", Width: 80 },
    { Remark: "备注", Width: 100 },
    { FlowVelocity: "流速", Width: 80 },
    { HotWaterDiam: "热水口径", Width: 60 },
    { Length: "管长", Width: 50 },
    { AbsRoughNess: "管道绝对粗糙度", Width: 80 },
    { NorminalDiam: "管道公称直径", Width: 50 },
    { WaterDensity: "冷水密度", Width: 60 },
    { CrossSecArea: "计算断面积", Width: 80 },
    { Efficiency: "效率", Width: 80 },
    { MinimumFlow: "最小流量", Width: 80 },
    { RatingHeatingCapacity: "制热量", Width: 80 },
    { CoolingEfficiency: "制冷效率", Width: 80 },
    { HeatingEfficiency: "制热效率", Width: 80 },
    { Form: "泵形式", Width: 80 },
    { Voltage: "电压", Width: 50 },
    { idCom: "设备标识", Width: 100 },
    { Specs: "规格", Width: 80 },
    { WorkPressure: "工作压力", Width: 80 }
]
let str, instructionStr;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'vertical-center-modal-equipment-best'
    instructionStr = 'warning-config-best'
} else {
    str = 'vertical-center-modal'
    instructionStr = ''
}

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    },
};

const formItemInfo = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
    },
};

const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
    },
};

//添加报警
class AddWarningForm extends React.Component {
    constructor(props) {
        super(props)

        this.toggleHighLowModal = this.toggleHighLowModal.bind(this)

    }

    //报警配置的方法
    handleModalHide() { //关闭模态窗并添加报警配置
        const { form } = this.props
        const { getFieldsValue, validateFields } = form
        const fields = getFieldsValue()
        let hhenable = this.props.form.getFieldValue('hhenable')
        let henable = this.props.form.getFieldValue('henable')
        let llenable = this.props.form.getFieldValue('llenable')
        let lenable = this.props.form.getFieldValue('lenable')
        let hhlimit = this.props.form.getFieldValue('hhlimit')
        let hlimit = this.props.form.getFieldValue('hlimit')
        let llimit = this.props.form.getFieldValue('llimit')
        let lllimit = this.props.form.getFieldValue('lllimit')
        let hhinfo = this.props.form.getFieldValue('hhinfo')
        let hinfo = this.props.form.getFieldValue('hinfo')
        let llinfo = this.props.form.getFieldValue('llinfo')
        let linfo = this.props.form.getFieldValue('linfo')
        let ofPosition = this.props.form.getFieldValue('ofPosition')
        let ofDepartment = this.props.form.getFieldValue('ofDepartment')
        let ofGroup = this.props.form.getFieldValue('ofGroup')
        let ofSystem = this.props.form.getFieldValue('ofSystem')
        let tag = this.props.form.getFieldValue('tag')
        //e.preventDefault()
        validateFields(['pointname', 'warningGroup'], (err, value) => {
            if (!err) {
                this.props.alarmHide();
                //增加报警
                http.post('/warningConfig/add', {
                    "pointname": value.pointname,
                    "boolWarningLevel": 2,
                    "warningGroup": value.warningGroup,
                    "boolWarningInfo": "",
                    "type": 0,
                    "hhenable": hhenable ? 1 : 0,
                    "henable": henable ? 1 : 0,
                    "llenable": llenable ? 1 : 0,
                    "lenable": lenable ? 1 : 0,
                    "hhlimit": hhlimit,
                    "hlimit": hlimit,
                    "llimit": llimit,
                    "lllimit": lllimit,
                    "hhinfo": hhinfo,
                    "hinfo": hinfo,
                    "llinfo": llinfo,
                    "linfo": linfo,
                    "ofPosition": ofPosition ? ofPosition : '',
                    "ofDepartment": ofDepartment ? ofDepartment : '',
                    "ofGroup": ofGroup ? ofGroup : '',
                    "ofSystem": ofSystem ? ofSystem : '',
                    "tag": tag ? tag : ''
                }).then(
                    data => {
                        if (!data.err) {
                            Modal.success({
                                title: '信息提示',
                                content: '添加成功'
                            })
                        } else {
                            Modal.error({
                                title: '错误信息',
                                content: data.msg
                            })
                        }
                    }
                )
            }
        })
    }

    toggleHighLowModal() {
        this.props.alarmHide()
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                visible={this.props.visible}
                onCancel={this.props.alarmHide}
                footer={null}
                title='添加高低限报警'
            >
                <Form
                >
                    <FormItem
                        label='点名'
                        {...formItemLayout}
                    >
                        {getFieldDecorator('pointname', {
                            rules: [{
                                required: true, message: '请选择点名'
                            }]
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label='分组'
                                {...formItemLayout}
                            >
                                {getFieldDecorator('warningGroup', {
                                    rules: [{
                                        pattern: /^[A-Za-z0-9\u4e00-\u9fa5_-]+$/,
                                        message: '可填写大小写字母／数字／汉字'
                                    }, {
                                        required: true, message: "请填写分组"
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                    </Row>
                    <Row >
                        <Col span={6} >
                            <FormItem
                            >
                                {getFieldDecorator('hhenable', {
                                    valuePropName: 'checked',
                                    initialValue: 0
                                })(
                                    <Checkbox>高高限值报警</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={6} >
                            <FormItem
                            >
                                {getFieldDecorator('hhlimit', {
                                    initialValue: '',
                                    rules: [{
                                        pattern: /^-|[0-9]+$/,
                                        message: '0-9数字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写数值')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                label='报警信息'
                                {...formItemInfo}
                            >
                                {getFieldDecorator('hhinfo', {
                                    initialValue: '',
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6} >
                            <FormItem
                            >
                                {getFieldDecorator('henable', {
                                    valuePropName: "checked",
                                    initialValue: 0,
                                })(
                                    <Checkbox>高限值报警</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={6} >
                            <FormItem
                            >
                                {getFieldDecorator('hlimit', {
                                    initialValue: '',
                                    rules: [{
                                        pattern: /^-|[0-9]+$/,
                                        message: '0-9数字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写数值')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                label='报警信息'
                                {...formItemInfo}
                            >
                                {getFieldDecorator('hinfo', {
                                    initialValue: "",
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6} >
                            <FormItem
                            >
                                {getFieldDecorator('lenable', {
                                    valuePropName: 'checked',
                                    initialValue: 0
                                })(
                                    <Checkbox>低限值报警</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={6} >
                            <FormItem
                            >
                                {getFieldDecorator('llimit', {
                                    initialValue: "",
                                    rules: [{
                                        pattern: /^-|[0-9]+$/,
                                        message: '0-9数字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写数值')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                label='报警信息'
                                {...formItemInfo}
                            >
                                {getFieldDecorator('linfo', {
                                    initialValue: "",
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6} >
                            <FormItem
                            >
                                {getFieldDecorator('llenable', {
                                    valuePropName: 'checked',
                                    initialValue: 0,
                                })(
                                    <Checkbox>低低限值报警</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={6} >
                            <FormItem
                            >
                                {getFieldDecorator('lllimit', {
                                    initialValue: '',
                                    rules: [{
                                        pattern: /^-|[0-9]+$/,
                                        message: '0-9数字'
                                    }, {
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写数值')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12} >
                            <FormItem
                                label='报警信息'
                                {...formItemInfo}
                            >
                                {getFieldDecorator('llinfo', {
                                    initialValue: '',
                                    rules: [{
                                        validator: (rule, value, callback) => {
                                            if (value) {
                                                callback()
                                                return
                                            }
                                            callback('请填写信息')
                                        }
                                    }]
                                })(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={24} >
                            <FormItem
                                label='报警位置'
                                {...formItemLayout}
                            >
                                {getFieldDecorator('ofPosition'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={12}>
                            <FormItem
                                label='部门'
                                {...formItemInfo}
                            >
                                {getFieldDecorator('ofDepartment'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label='分组'
                                {...formItemInfo}
                            >
                                {getFieldDecorator('ofGroup'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={60} >
                        <Col span={12}>
                            <FormItem
                                label='系统'
                                {...formItemInfo}
                            >
                                {getFieldDecorator('ofSystem'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                label='标签'
                                {...formItemInfo}
                            >
                                {getFieldDecorator('tag'
                                )(
                                    <Input />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <FormItem
                        {...formItemLayoutWithOutLabel}
                    >
                        <Button onClick={this.toggleHighLowModal} className={s['cancel-btn']} >取消</Button>
                        <Button onClick={() => { this.handleModalHide() }} >确定</Button>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const AddWarningFormModal = Form.create({
    mapPropsToFields: (props) => {
        return {
            pointname: Form.createFormField({
                value: props.pointname
            })
        }
    }
})(AddWarningForm)


//ObserverModalForm组件
class ObserverModalForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: null,
            textValue: this.props.textData.currentValue,
            selectValue: this.props.selectData.currentValue,
            isLimit: false,
            customListInModal: [],
            LinkList: [],
            id: "",
            infoModalVisible: false,
            dataSource: [],
            equipmentColumns: [],
            titleName: '',
            assetModalVisible: false,
            dataAssetSource: [],
            assetLoading: false,
            activeKey: '1',
            activeKey2: '1',
            activeKey3: '1',
            fileList: [],
            pngList01:[],
            pngList02:[],
            pngList03:[]
        };

        this.container = null;
        this.observerScreen = null;

        this.onOk = this.onOk.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.showLoading = this.showLoading.bind(this);
        this.hideLoading = this.hideLoading.bind(this);
        this.handleText = this.handleText.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.renderScreen = this.renderScreen.bind(this);
        this.initHistroyModal = this.initHistroyModal.bind(this);
        this.initCheckboxs = this.initCheckboxs.bind(this);
        this.handleChange = this.handleChange.bind(this)
        this.getComponent = this.getComponent.bind(this)
    }
    componentDidMount() {
        if (this.props.navigation && this.props.navigation != "" && this.props.navigation != undefined) {
            let str = JSON.parse(this.props.navigation).content
            if (str && str != undefined && str != "") {
                let arr = str.split("|")
                let brr = []
                if (arr != [] && arr[0] != undefined && arr[0] != "") {
                    brr = arr.map((item, index) => {
                        let crr = item.split(",")
                        if (crr[3] && crr[3] != undefined) {
                            return { name: crr[0], roomName: crr[1], id: crr[2], link: crr[3] }
                        } else {
                            return { name: crr[0], roomName: crr[1], id: crr[2] }
                        }

                    })
                    this.setState({
                        LinkList: brr,
                        id: this.props.templateConfig["2"]
                    })
                }
            }
        } else if (this.props.navJsonConfig && this.props.navJsonConfig != "" && this.props.navJsonConfig != undefined) {
            let str = JSON.parse(this.props.navJsonConfig).content
            if (str && str != undefined && str != "") {
                let arr = str.split("|")
                let brr = []
                if (arr != [] && arr[0] != undefined && arr[0] != "") {
                    brr = arr.map((item, index) => {
                        let crr = item.split(",")
                        return { name: crr[0], id: crr[1] }
                    })
                    this.setState({
                        LinkList: brr,
                        id: brr[0] ? brr[0].id : ""
                    })
                }
            }
        } else {

        }
        this.renderScreen(this.props.pageId, this.props.isTemplate, this.props.templateConfig, this.props.templateFileName);
        new LimitDrag('.ant-modal-content');

    }
    // 计算h5控件宽高和坐标
    getStyle = (calH, calW, calX, calY) => {
        var catchedContainerStyle = window.getComputedStyle(document.getElementById('observerModalContainer'))
        // console.info( catchedContainerStyle.width,catchedContainerStyle.height )
        let width = Math.floor(parseInt(catchedContainerStyle.width) * calW),
            height = Math.floor(parseInt(catchedContainerStyle.height) * calH),
            left = Math.floor(parseInt(catchedContainerStyle.width) * calX) - (catchedContainerStyle.x),
            top = Math.floor(parseInt(catchedContainerStyle.height) * calY) - (catchedContainerStyle.y)
        return { width, height, left, top }
    }

    componentWillReceiveProps(newProps) {
        let description
        if (this.props.pointInfo) {
            if (this.props.pointInfo.hight > this.props.pointInfo.low || (this.props.pointInfo.hight == undefined && this.props.pointInfo.low) || (this.props.pointInfo.hight && this.props.pointInfo.low == undefined)) {  //判断有无高低限
                this.setState({
                    isLimit: true
                })
            };
            description = this.props.pointInfo && this.props.pointInfo.description
        }

        // 获取到每个h5控件的实例，包含属性points数组，每个点里包含的数据，根据当前这个实例的type
        if (this.props.customListInModal !== newProps.customListInModal) {
            // customList是实例
            let calCustomList = newProps.customListInModal.map(custom => {
                const { width, height, left, top } = this.getStyle(custom['calH'], custom['calW'], custom['calX'], custom['calY'])
                custom['style']['width'] = width
                custom['style']['height'] = height
                custom['style']['left'] = left
                custom['style']['top'] = top
                return custom
            })
            console.info("===observerView componentWillReceiveProps" + calCustomList)
            // 先获取容器计算的w,h
            this.setState({
                customListInModal: calCustomList
            })
        }
    }

    componentWillUnmount() {
        if (this.observerScreen) {
            //   console.log("575行，observerModalView文件componentWillUnmount，执行observerScreen.close")      
            this.observerScreen.close();
            this.observerScreen.refreshCustomData(this.props.customList)
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.textVisible !== this.props.textVisible) {
            if(nextProps.textVisible == true){
                this.setState({
                    textValue: this.props.textData.currentValue
                })
            }
            
            return true
        }
        if (nextState.textValue !== this.state.textValue) {
            return true
        }
        if (nextState.loading !== this.state.loading) {
            return true;
        }
        if (nextState.selectValue !== this.state.selectValue) {
            return true
        }
        if (nextProps.switchVisible !== this.props.switchVisible) {
            return true;
        }
        if (nextProps.checkboxVisible !== this.props.checkboxVisible) {
            return true;
        }
        if (nextProps.radioVisible !== this.props.radioVisible) {
            return true;
        }
        if (nextState.infoModalVisible !== this.state.infoModalVisible) {
            return true;
        }
        if (nextState.assetModalVisible !== this.state.assetModalVisible) {
            return true;
        }
        if (nextState.dataAssetSource !== this.state.dataAssetSource) {
            return true;
        }
        if (nextProps.isLoading !== this.props.isLoading) {
            return true;
        }
        if (nextState.assetLoading !== this.state.assetLoading) {
            return true;
        }
        if (nextState.activeKey !== this.state.activeKey) {
            return true;
        }
        if (nextState.activeKey2 !== this.state.activeKey2) {
            return true;
        }
        if (nextState.activeKey3 !== this.state.activeKey3) {
            return true;
        }
        if (nextState.fileList !== this.state.fileList) {
            return true;
        }
        if (nextState.pngList01 !== this.state.pngList01) {
            return true;
        }
        if (nextState.pngList02 !== this.state.pngList02) {
            return true;
        }
        if (nextState.pngList03 !== this.state.pngList03) {
            return true;
        }
        if (nextProps.alarmVisible !== this.props.alarmVisible){
            return true;
        }
        return false
    }

    onOk() {
        this.props.onOk(this.state.selectedPoint);
        this.props.hideModal();
    }
    saveContainerRef(container) {
        this.container = container;
    }
    showLoading() {
        this.setState({
            loading: true
        });
    }
    hideLoading() {
        this.setState({
            loading: false
        });
    }
    //切换历史数据
    initHistroyModal(modalDict) {
        return this.observerScreen.initHistroyData(modalDict)
    }

    initCheckboxs(dateDict) {
        this.observerScreen.initCheckboxs(dateDict)
    }

    renderScreen(id, isTemplate, templateConfig, templateFileName) {
        this.observerScreen = new ObserverScreen(id, this.container, {
            showLoading: this.showLoading,
            hideLoading: this.hideLoading,
            isTemplate: isTemplate,
            templateConfig: templateConfig,
            templateFileName: templateFileName,
            showObserverSecModal: this.props.showObserverSecModal,
            showOperatingModal: this.props.showOperatingModal, //弹出设备开关模态框的方法传递
            showCheckboxModal: this.props.showCheckboxModal, //弹出优化选项模态框的方法传递
            showOperatingTextModal: this.props.showOperatingTextModal, //弹出设备详情中所有设置值的模态框的方法传递
            showRadioModal: this.props.showRadioModal, //弹出设备详情里的启用／禁用
            showSelectControlModal: this.props.showSelectControlModal, //弹出设备详情里的控制模式选项
            getToolPoint: this.props.getToolPoint,
            showCommomAlarm: this.props.showCommomAlarm,
            getTendencyModal: this.props.getTendencyModal,
            bShowTimeShaft: this.props.bShowTimeShaft, //判断值，判断是否开启实时刷新
            dateProps: this.props.dateModal.props,
            curValue: this.props.curValue, //当前时间轴拖动的值（对应时间数组的索引）
            refreshCustomData: this.props.refreshCustomData,
            refreshCustomDataInModal: this.props.refreshCustomDataInModal,
            getCustomRealTimeData: this.props.getCustomRealTimeData,
            //   getPointRealTimeData : this.props.getPointRealTimeData,
            getTimePickerRealTimeData: this.props.getTimePickerRealTimeData,
            getRectanglesPanelData: this.props.getRectanglesPanelData,
            getCustomTableData: this.props.getCustomTableData,
            refreshTimePickerData: this.props.refreshTimePickerData
        });
        //保存该实例的方法
        this.props.observerModalDict({
            initHistroyModal: this.initHistroyModal,
            initCheckboxs: this.initCheckboxs
        })
        this.observerScreen.showModal();
    }
    //设备详情内的模态框改值逻辑
    handleText(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                //文本写值时，当前为整数，且只修改小数点前的值为0时，下发后form表单无法获取到0，只能用state,而4月份的版本，state为数字格式的0时，表达式判断为false取了form中的旧值(刚巧只写小数点前的0时，form表单获取的值不对)；
                //2023-6-27日，讲三元表达式修改为string判断，修复上述bug
                values.settingValue = String(this.state.textValue)?String(this.state.textValue):values.settingValue
                if (values.settingValue === undefined && !this.props.isLoading) {
                    Modal.warning({
                        title: '信息提示',
                        content: '设定值格式错误!',
                    });
                } else if (!(/(^-?[0-9]+$)|(^-?[0-9]+\.[0-9]+$)/g).test(values.settingValue)) {
                    Modal.warning({
                        title: '信息提示',
                        content: '设定值格式错误!'
                    });
                } else {
                    this.props.observerSetting(values, this.props.textData.idCom);
                }
            }
        });
    }

    handleChange(value) {
        this.setState({
            textValue: value
        })
    }

    handleSelect(value) {
        this.setState({
            selectValue: value
        })
    }

    getComponent() {
        const { customListInModal, custom_realtime_data, point_realtime_data, tableLoading, custom_table_data } = this.props
        let Components = []

        // console.log("===observerView getComponent开始"+this.props)

        if (customListInModal.length != undefined) {
            // customList是实例
            customListInModal.map(custom => {
                //const {width,height,left,top} = this.getStyle(custom['calH'],custom['calW'],custom['calX'],custom['calY'])
                let paddingLeft = (1920 - custom['pageW']) / 2;
                let paddingTop = (955 - custom['pageH']) / 2;
                custom['style']['left'] = custom['x'] - paddingLeft
                custom['style']['top'] = custom['y'] - paddingTop
            })
        }

        try {
            customListInModal.forEach(row => {
                const widget = getWidgetByType(row.type)
                if (!widget) {
                    throw new Error(`CustomComponet: Widget type '${row.type}' is not available.`)
                }
                let Component = widget.component;
                Components.push(
                    <Component
                        {...row}
                        showModal={this.props.showModal}
                        tableOneClick={this.props.tableOneClick}
                        refreshReportFun={this.props.refreshReportFun}
                        refreshBenchmarkFun={this.props.refreshBenchmarkFun}
                        refreshBenchmark={this.props.refreshBenchmark}
                        custom_realtime_data={custom_realtime_data}
                        /* point_realtime_data={point_realtime_data} */
                        tableLoading={tableLoading}
                        tableLoadingFun={this.props.tableLoadingFun}
                        custom_table_data={custom_table_data}
                    />
                )
            })
        } catch (err) {
            console.error(err)
            Components = []
        }
        // console.log("===observerView getComponent 返回"+Components)
        return Components

    }
    getChangeBtns() {
        let LinkList = this.state.LinkList
        if (LinkList != [] && LinkList[0] != undefined) {
            if (this.props.navigation && this.props.navigation != "" && this.props.navigation != undefined) {
                return (
                    <div style={{ marginTop: -10, marginBottom: 5 }}>
                        <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                            <span>快捷切换导航</span>
                            <Button style={{ marginLeft: 10 }} onClick={() => this.nextEquiment("-")}>上翻</Button>
                            <Button style={{ marginLeft: 10 }} onClick={() => this.nextEquiment("+")}>下翻</Button>
                        </div>
                        <div style={{ display: 'inline-block', overflowX: 'auto', overflowY: 'hidden', maxWidth: JSON.parse(this.props.navigation).width ? JSON.parse(this.props.navigation).width : 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                            {LinkList.map((item) => {
                                return <Button
                                    id={item.id}
                                    style={{ marginLeft: 10, backgroundColor: item.id == this.state.id ? "rgb(46,162,248)" : "" }}
                                    onClick={() => {
                                        if (this.observerScreen) {
                                            this.observerScreen.close();
                                            this.observerScreen.refreshCustomData(this.props.customList)
                                        }
                                        this.setState({ id: item.id, titleName: item.name })
                                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                                    }}>{item.name}</Button>
                            })}
                        </div>
                    </div>
                )
            }
            if (this.props.navJsonConfig && this.props.navJsonConfig != "" && this.props.navJsonConfig != undefined) {
                return (
                    <div style={{ marginTop: -10, marginBottom: 5 }}>
                        <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                            <span>快捷切换导航</span>
                            <Button style={{ marginLeft: 10 }} onClick={() => this.nextPage("-")}>上翻</Button>
                            <Button style={{ marginLeft: 10 }} onClick={() => this.nextPage("+")}>下翻</Button>
                        </div>
                        <div style={{ display: 'inline-block', overflowX: 'auto', overflowY: 'hidden', maxWidth: JSON.parse(this.props.navJsonConfig).width ? JSON.parse(this.props.navJsonConfig).width : 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                            {LinkList.map((item) => {
                                return <Button
                                    id={item.id}
                                    style={{ marginLeft: 10, backgroundColor: item.id == this.state.id ? "rgb(46,162,248)" : "" }}
                                    onClick={() => {
                                        if (this.observerScreen) {
                                            this.observerScreen.close();
                                            this.observerScreen.refreshCustomData(this.props.customList)
                                        }
                                        this.setState({ id: item.id, titleName: item.name })
                                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                                    }}>{item.name}</Button>
                            })}
                        </div>
                    </div>
                )
            }

        }

    }

    nextEquiment(flag) {
        if (this.observerScreen) {
            this.observerScreen.close();
            this.observerScreen.refreshCustomData(this.props.customList)
        }
        let id = this.state.id
        let DQId
        let LinkList = this.state.LinkList
        LinkList.map((item, index) => {
            if (item.id == id) {
                DQId = index
            }
        })
        LinkList.map((item, index) => {
            if (flag == "-") {
                if ((DQId - 1) >= 0) {
                    if (index == (DQId - 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                    }
                } else {
                    if (index == (LinkList.length - 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                    }
                }
            } else {
                if ((DQId + 1) <= (LinkList.length - 1)) {
                    if (index == (DQId + 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                    }
                } else {
                    if (index == 0) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.link ? item.link : this.props.pageId, this.props.isTemplate, { 1: item.roomName, 2: item.id }, this.props.templateFileName)
                    }
                }
            }
        })
    }

    nextPage(flag) {
        if (this.observerScreen) {
            this.observerScreen.close();
            this.observerScreen.refreshCustomData(this.props.customList)
        }
        let id = this.state.id
        let DQId
        let LinkList = this.state.LinkList
        LinkList.map((item, index) => {
            if (item.id == id) {
                DQId = index
            }
        })
        LinkList.map((item, index) => {
            if (flag == "-") {
                if ((DQId - 1) >= 0) {
                    if (index == (DQId - 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                    }
                } else {
                    if (index == (LinkList.length - 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                    }
                }
            } else {
                if ((DQId + 1) <= (LinkList.length - 1)) {
                    if (index == (DQId + 1)) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                    }
                } else {
                    if (index == 0) {
                        this.setState({ id: item.id, titleName: item.name })
                        this.renderScreen(item.id, this.props.isTemplate, {}, this.props.templateFileName)
                    }
                }
            }
        })
    }

    handleCancel = () => {
        this.setState({
            infoModalVisible: false,
        });
    }

    assetHandleCancel = () => {
        this.setState({
            assetModalVisible: false,
        });
    }

    getEquipmentInfo = () => {
        let dataSource = []
        let idCom = localStorage.getItem('selectEquipment')
        if (idCom == undefined || idCom == '') {
            Modal.info({
                title: '提示',
                content: '非设备模板弹窗，无法展示设备铭牌'
            })
            return
        }
        let tableData = JSON.parse(localStorage.getItem('deviceDetails'))
        if (idCom.indexOf('CTFan') != -1) {
            let index = idCom.indexOf('CTFan')
            idCom = idCom.slice(0, index + 2) + idCom.slice(index + 7)
        }
        idCom = idCom.replace('OnOff', '')
        for (let i in tableData) {
            tableData[i].map(item => {
                if (item['idCom'] == idCom) {
                    dataSource.push(item)
                }
            })
        }
        if (dataSource == [] || dataSource[0] == undefined) {
            this.setState({
                assetLoading: true,
                assetModalVisible: true,
                activeKey: '1',
                activeKey2: '1',
                activeKey3:"1"
            })
            http.post('/equipment/getInitAssetByIdentity', {
                identity: idCom
            }).then(res => {
                if (res.status == true) {
                    this.setState({
                        dataAssetSource: res.data,
                        assetLoading: false
                    })
                } else {
                    this.setState({
                        assetLoading: false
                    })
                }
            }).catch(err => {
                this.setState({
                    assetLoading: false
                })
            })
        } else {
            let equipmentColumns = this.getColumns(dataSource)
            this.setState({
                dataSource: dataSource,
                equipmentColumns: equipmentColumns,
                infoModalVisible: true
            })
        }
    }

    //动态改变表头
    getColumns = (items) => {
        let obj = {}
        let arr = []
        let flag
        for (let i = 0; i < items.length; i++) {
            Object.assign(obj, items[i])
        }
        for (let key in obj) {
            arr.push(key)
        }
        let Columns = arr.map((item) => {
            let Index
            for (let i = 0; i < nameList.length; i++) {
                if (nameList[i][item] != undefined) {
                    Index = i
                }
            }
            if (Index != undefined) {
                return { title: nameList[Index][item], key: item, dataIndex: item, width: nameList[Index]["Width"] }
            } else {
                return { title: item, key: item, dataIndex: item, width: 80 }
            }
        })
        for (let i = 0; i < Columns.length; i++) {
            flag = Columns[i]
            if (Columns[i].key == "No" && i != 0) {
                Columns[i] = Columns[0]
                Columns[0] = flag
                i = 0
            }
            if (Columns[i].key == "Name" && i != 1) {
                Columns[i] = Columns[1]
                Columns[1] = flag
                i = 0
            }
            if (Columns[i].key == "Brand" && i != 2) {
                Columns[i] = Columns[2]
                Columns[2] = flag
                i = 0
            }
            if (Columns[i].key == "Model" && i != 3) {
                Columns[i] = Columns[3]
                Columns[3] = flag
                i = 0
            }
        }
        return Columns
    }

    btnControl() {
        let _this = this
        if (_this.props.switchData.preCheckScript == undefined || _this.props.switchData.preCheckScript == '') {
            _this.props.handleOk(_this.props.switchData.idCom, _this.props.switchData.setValue, _this.props.switchData.description)
        } else {
            http.post('/tool/evalStringExpression', {
                "str": _this.props.switchData.preCheckScript,  // 脚本
                "mode": "1"  //  0:表示计算历史某个时刻, 1表示计算实时
            }).then(
                res => {
                    if (res.err == 0 && res.data == 0) {
                        Modal.confirm({
                            title: _this.props.switchData.preCheckScriptDescription,
                            content: '点击确认可继续执行指令',
                            onOk() {
                                _this.props.handleOk(_this.props.switchData.idCom, _this.props.switchData.setValue, _this.props.switchData.description)
                            },
                            onCancel() {
                                _this.props.switchHide()
                            },
                        });
                    } else {
                        _this.props.handleOk(_this.props.switchData.idCom, _this.props.switchData.setValue, _this.props.switchData.description)
                    }
                }
            ).catch(
                err => {
                    _this.props.handleOk(_this.props.switchData.idCom, _this.props.switchData.setValue, _this.props.switchData.description)
                }
            )
        }
    }

    redisReload = () => {
        let key = localStorage.getItem('modalId')
        http.get('/updatePageContentIntoRedis/' + key)
            .then(
                dataPage => {
                    if (dataPage.err) {
                        console.error(dataPage.msg);
                    } else {
                        this.renderScreen(this.props.pageId, this.props.isTemplate, this.props.templateConfig, this.props.templateFileName);
                    }
                }
            ).catch(
                error => {
                    console.error('更新页面失败!');
                }
            )

    }

    getWord = () => {
        let data = this.state.dataAssetSource
        let url = 'https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/documents/'
        let ossDirectory = "documents,"
        data.map((item, index) => {
            if (item['en_name'] == 'identity') {
                if (item['param_value'].indexOf('AirCompressor') != -1) {
                    url += 'airCompressor/';
                    ossDirectory = ossDirectory+`airCompressor,`
                } else if (item['param_value'].indexOf('Ch') != -1) {
                    url += 'Ch/';
                    ossDirectory = ossDirectory+"Ch,"
                } else if (item['param_value'].indexOf('CWP') != -1) {
                    url += 'CWP/'
                    ossDirectory = ossDirectory+"CWP,"
                } else if (item['param_value'].indexOf('CT') != -1) {
                    url += 'CT/'
                    ossDirectory = ossDirectory+"CT,"
                } else if (item['param_value'].indexOf('PriChWP') != -1) {
                    url += 'PriChWP/'
                    ossDirectory = ossDirectory+"PriChWP,"
                } else if (item['param_value'].indexOf('SecChWP') != -1) {
                    url += 'SecChWP/'
                    ossDirectory = ossDirectory+"SecChWP,"
                } else if (item['param_value'].indexOf('Dryer') != -1) {
                    url += 'Dryer/'
                    ossDirectory = ossDirectory+"Dryer,"
                }
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'brand') {
                url += item['param_value'] + '/'
                ossDirectory = ossDirectory+item['param_value']+","
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'model') {
                url += item['param_value']
                ossDirectory = ossDirectory+item['param_value']
            }
        })

        let _this = this

        const catalogProp = {
            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "catalog"
            },

            onChange(info) {
                _this.setState({
                    fileList: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传设备样本成功");
                    } else {
                        message.error("上传设备样本失败");
                    }
                    _this.setState({
                        fileList: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传设备样本失败");
                    _this.setState({
                        fileList: []
                    })
                }
            },
        };
        
        const iomProp = {

            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "Iom"
            },

            onChange(info) {
                _this.setState({
                    fileList: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {

                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传设备说明书成功");
                    } else {
                        message.error("上传设备说明书失败");
                    }
                    _this.setState({
                        fileList: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传设备说明书失败");
                    _this.setState({
                        fileList: []
                    })
                }
            },
        };
        const serviceManualProp = {
            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "service_manual"
            },

            onChange(info) {
                _this.setState({
                    fileList: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传维修手册成功");
                    } else {
                        message.error("上传维修手册失败");
                    }
                    _this.setState({
                        fileList: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传维修手册失败");
                    _this.setState({
                        fileList: []
                    })
                }
            },
        };
        console.log(url)
        return <div style={{ marginTop: '-15px' }}>
            <Tabs activeKey={this.state.activeKey2} onChange={this.callback2}>
                <TabPane tab="设备样本" key="1">
                    <div>
                        <Upload  {...catalogProp} fileList={this.state.fileList}>
                            <Button>
                                <Icon type="upload" />上传pdf文件
                            </Button>
                        </Upload>
                        {
                            _this.state.fileList.length ==0 && (
                                <object data={url + '/catalog.pdf'} type="application/pdf" width='750' height='500'></object>
                            )
                        }
                        
                    </div>
                </TabPane>
                <TabPane tab="设备说明书" key="2">
                 
<div>
                        <Upload  {...iomProp} fileList={this.state.fileList}>
                            <Button>
                                <Icon type="upload" />上传pdf文件
                            </Button>
                        </Upload>
                        {
                            _this.state.fileList.length ==0 && (
                                <object data={url + '/Iom.pdf'}  type="application/pdf" width='750' height='500'></object>
                            )
                        }
                    </div>
                </TabPane>
                <TabPane tab="维修手册" key="3">
                    <div>
                        <Upload  {...serviceManualProp} fileList={this.state.fileList}>
                            <Button>
                                <Icon type="upload" />上传pdf文件
                            </Button>
                        </Upload>
                        {
                            _this.state.fileList.length ==0 && (
                                <object data={url + '/service_manual.pdf'} type="application/pdf" width='750' height='500'></object>
                            )
                        }
                    </div>
                </TabPane>
            </Tabs>
        </div>

    }

    getPic = () => {
        let data = this.state.dataAssetSource
        let url = 'https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/documents/'
        let ossDirectory = "documents,"
        data.map((item, index) => {
            if (item['en_name'] == 'identity') {
                if (item['param_value'].indexOf('AirCompressor') != -1) {
                    url += 'airCompressor/';
                    ossDirectory = ossDirectory+`airCompressor,`
                } else if (item['param_value'].indexOf('Ch') != -1) {
                    url += 'Ch/';
                    ossDirectory = ossDirectory+"Ch,"
                } else if (item['param_value'].indexOf('CWP') != -1) {
                    url += 'CWP/'
                    ossDirectory = ossDirectory+"CWP,"
                } else if (item['param_value'].indexOf('CT') != -1) {
                    url += 'CT/'
                    ossDirectory = ossDirectory+"CT,"
                } else if (item['param_value'].indexOf('PriChWP') != -1) {
                    url += 'PriChWP/'
                    ossDirectory = ossDirectory+"PriChWP,"
                } else if (item['param_value'].indexOf('SecChWP') != -1) {
                    url += 'SecChWP/'
                    ossDirectory = ossDirectory+"SecChWP,"
                } else if (item['param_value'].indexOf('Dryer') != -1) {
                    url += 'Dryer/'
                    ossDirectory = ossDirectory+"Dryer,"
                }
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'brand') {
                url += item['param_value'] + '/'
                ossDirectory = ossDirectory+item['param_value']+","
            }
        })
        data.map((item, index) => {
            if (item['en_name'] == 'model') {
                url += item['param_value']
                ossDirectory = ossDirectory+item['param_value']
            }
        })

        let _this = this

        const pngProp01 = {
            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "01"
            },

            onChange(info) {
                _this.setState({
                    pngList01: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传图片成功");
                    } else {
                        message.error("上传图片失败");
                    }
                    _this.setState({
                        pngList01: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传图片失败");
                    _this.setState({
                        pngList01: []
                    })
                }
            },
        };
        const pngProp02 = {
            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "02"
            },

            onChange(info) {
                _this.setState({
                    pngList02: [...info.fileList]
                })
                if (info.file.status == 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传图片成功");
                    } else {
                        message.error("上传图片失败");
                    }
                    _this.setState({
                        pngList02: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传图片失败");
                    _this.setState({
                        pngList02: []
                    })
                }
            },
        };
        const pngProp03 = {
            name: 'file',
            action: `${appConfig.serverUrl}/oss/uploadFile`,
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                ossDirectory: ossDirectory,
                ossFileName: "03"
            },

            onChange(info) {
                _this.setState({
                    pngList03: [...info.fileList]
                })
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    if (info.file.response.err == 0) {
                        message.success("上传图片成功");
                    } else {
                        message.error("上传图片失败");
                    }
                    _this.setState({
                        pngList03: []
                    })
                } else if (info.file.status === 'error') {
                    message.error("上传图片失败");
                    _this.setState({
                        pngList03: []
                    })
                }
            },
        };
        

        return (
            <div style={{ marginTop: '-15px' }}>
            <Tabs activeKey={this.state.activeKey3} onChange={this.callback3}>
                <TabPane tab="图片1" key="1">
                    <div>
                        <Upload  {...pngProp01} fileList={this.state.pngList01}>
                            <Button>
                                <Icon type="upload" />上传png图片
                            </Button>
                        </Upload>
                        {
                            _this.state.pngList01.length ==0 && (
                            <RcViewer>
                                <div style={{textAlign:'center'}}>
                                    <img width={433} alt="请上传图片" title='01.png' height={400} src={url + '/01.png'} ></img>
                                </div>
                            </RcViewer>
                            )
                        }
                    </div>
                </TabPane>
                <TabPane tab="图片2" key="2">
                    <div>
                        <Upload  {...pngProp02} fileList={this.state.pngList02}>
                            <Button>
                                <Icon type="upload" />上传png图片
                            </Button>
                        </Upload>
                        {
                            _this.state.pngList02.length ==0 && (
                            <RcViewer>
                                <div style={{textAlign:'center'}}>
                                    <img width={433} alt="请上传图片" title='02.png' height={400} src={url + '/02.png'} ></img>
                                </div>
                            </RcViewer>
                            )
                        }
                    </div>
                </TabPane>
                <TabPane tab="图片3" key="3">
                    <div>
                        <Upload  {...pngProp03} fileList={this.state.pngList03}>
                            <Button>
                                <Icon type="upload" />上传png图片
                            </Button>
                        </Upload>
                        {
                            _this.state.pngList03.length ==0 && (
                            <RcViewer>
                                <div style={{textAlign:'center'}}>
                                    <img width={433} alt="请上传图片" title='03.png' height={400} src={url + '/03.png'} ></img>
                                </div>
                                
                            </RcViewer>
                            )
                        }
                    </div>
                </TabPane>
            </Tabs>
        </div>

        )
        
        
    }

    callback = (key) => {
        this.setState({
            activeKey: key
        })
    }
    callback2 = (key) => {
        this.setState({
            activeKey2: key
        })
    }
    callback3 = (key) => {
        this.setState({
            activeKey3: key
        })
    }
    /**
     * 
     * 
     * @returns 
     * @memberof ObserverModalForm
     */
    render() {
        let {
            visible,
            hideModal,
            title
        } = this.props
        visible = typeof visible === 'undefined' ? true : visible;
        const { getFieldDecorator } = this.props.form;
        const formItemLayoutText = {
            labelCol: {
                span: 8
            },
            wrapperCol: {
                span: 15
            },
        };

        if (visible == true) {
            localStorage.setItem("ModalOnOff", 1)
        }
        if (this.state.titleName != '' && this.state.titleName != undefined) {
            title = this.state.titleName
        }
        let assetColumns = [
            { title: '属性中文称', dataIndex: 'cn_name', key: 'cn_name', width: 80 },
            { title: '属性英文称', dataIndex: 'en_name', key: 'en_name', width: 80 },
            { title: '属性值', dataIndex: 'param_value', key: 'param_value', width: 80 }
        ]
        return (
            <Modal
                title={title || '设备详情'}
                visible={visible}
                onCancel={() => { hideModal(); localStorage.removeItem('modalId') }}
                footer={null}
                width="auto"
                maskClosable={false}
                zIndex={999}
                wrapClassName={str}
            >
                {this.getChangeBtns()}
                <Spin tip="正在加载页面..." spinning={this.state.loading} wrapperClassName="absolute-spin">
                    <div
                        id="observerModalContainer"
                        className={s['container']}>
                        <div
                            ref={this.saveContainerRef}
                            className={s['observer-container']}>
                        </div>
                        {
                            this.props.navJsonConfig || this.props.navigation ?
                                <div style={{ position: 'absolute', top: '-87px', right: '30' }}>
                                    <div style={{ display: 'inline-block', marginRight: '10px' }} onClick={() => { this.redisReload() }} title='redis缓存更新'>
                                        <Icon type="reload" style={{ fontSize: '18', cursor: "pointer" }} />
                                    </div>
                                    <div style={{ display: 'inline-block' }} onClick={() => { this.getEquipmentInfo() }} title='设备铭牌'>
                                        <Icon type="question-circle" style={{ fontSize: '18', cursor: "pointer" }} />
                                    </div>
                                </div>
                                :
                                <div style={{ position: 'absolute', top: '-60px', right: '30' }}>
                                    <div style={{ display: 'inline-block', marginRight: '10px' }} onClick={() => { this.redisReload() }} title='redis缓存更新'>
                                        <Icon type="reload" style={{ fontSize: '18', cursor: "pointer" }} />
                                    </div>
                                    <div style={{ display: 'inline-block' }} onClick={() => { this.getEquipmentInfo() }} title='设备铭牌'>
                                        <Icon type="question-circle" style={{ fontSize: '18', cursor: "pointer" }} />
                                    </div>
                                </div>
                        }
                        {!this.state.loading && this.getComponent()}
                    </div>
                </Spin>

                {/*设备指令模态框*/}
                <Modal
                    wrapClassName={instructionStr}
                    title={this.props.isLoading ? '指令设置进度提示' : '确认指令'}
                    visible={this.props.switchVisible}
                    onOk={() => this.props.handleOk(this.props.switchData.idCom, this.props.switchData.setValue, this.props.switchData.description)}
                    onCancel={this.props.switchHide}
                    footer={
                        this.props.isLoading ?
                            [
                                <Button autoFocus onClick={() => this.props.handleOk(this.props.switchData.idCom, this.props.switchData.setValue, this.props.switchData.description)} >确认</Button>
                            ]
                            :
                            [
                                <Button onClick={this.props.switchHide} >取消</Button>,
                                <Button id="switchChangeBtn" onClick={() => this.btnControl()} >确认</Button>
                            ]
                    }
                    maskClosable={false}
                >
                    {
                        this.props.isLoading ?
                            <Spin tip={this.props.modalConditionDict.status ? (this.props.switchData.description != '' ?`正在${this.props.switchData.description}`:`正在将点位 ${this.props.switchData.idCom} 的值修改为 ${this.props.switchData.setValue}`) : this.props.modalConditionDict.description}>
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <div>
                                {
                                    this.props.switchData.description != '' ?
                                    <span>确定要 {this.props.switchData.description}吗？</span>
                                    :
                                    <span>确定要将点位 {this.props.switchData.idCom} 的值修改为 {this.props.switchData.setValue} 吗？</span>
                                }
                            </div>
                    }
                </Modal>
                {/*checkbox模态框*/}
                <Modal
                    wrapClassName={instructionStr}
                    title={this.props.isLoading ? '指令设置进度提示' : '确认指令'}
                    visible={this.props.checkboxVisible}
                    onOk={() => this.props.checkboxSetting(this.props.checkboxData.idCom, this.props.checkboxData.setValue, this.props.checkboxData.text, this.props.checkboxData.unsetValue, this.props.checkboxData.currentValue, this.props.checkboxData.desc)}
                    onCancel={this.props.checkboxHide}
                    footer={
                        this.props.isLoading ?
                            [
                                <Button onClick={() => this.props.checkboxSetting(this.props.checkboxData.idCom, this.props.checkboxData.setValue, this.props.checkboxData.text, this.props.checkboxData.unsetValue, this.props.checkboxData.currentValue, this.props.checkboxData.desc)} >确认</Button>
                            ]
                            :
                            [
                                <Button onClick={this.props.checkboxHide} >取消</Button>,
                                <Button id="checkboxChangeBtn" onClick={() => this.props.checkboxSetting(this.props.checkboxData.idCom, this.props.checkboxData.setValue, this.props.checkboxData.text, this.props.checkboxData.unsetValue, this.props.checkboxData.currentValue, this.props.checkboxData.desc)} >确认</Button>
                            ]
                    }
                    maskClosable={false}
                >
                    {
                        this.props.isLoading ?
                            <Spin tip={this.props.modalConditionDict.status ? `正在${this.props.checkboxData.checkboxState ? '取消勾选' : '勾选'} ${this.props.checkboxData.desc} ` : this.props.modalConditionDict.description}>
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <div>
                                {`是否确定${this.props.checkboxData.checkboxState ? '取消勾选' : '勾选'} ${this.props.checkboxData.desc} ？`}
                            </div>
                    }
                </Modal>
                {/*修改设定值*/}
                <Modal
                    wrapClassName={instructionStr}
                    title={this.props.isLoading ? '指令设置进度提示' : '确认指令'}
                    visible={this.props.textVisible}
                    onOk={this.handleText}
                    onCancel={this.props.textHide}
                    confirmLoading={this.props.isLoading}
                    destroyOnClose
                    footer={
                        this.props.isLoading ?
                            [
                                <Button onClick={this.props.textHide} >确认</Button>
                            ]
                            :
                            [
                                <Button onClick={this.props.textHide} >取消</Button>,
                                <Button id="textChangeBtn" onClick={this.handleText} >确认</Button>
                            ]
                    }
                    maskClosable={false}
                >
                    {
                        this.props.isLoading ?
                            <Spin tip={this.props.modalConditionDict.status ? "正在修改设定值" : this.props.modalConditionDict.description}>
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <Form>
                                <FormItem
                                    {...formItemLayoutText}
                                    label="当前值："
                                >
                                    {getFieldDecorator('currentValue', {
                                        initialValue: parseFloat(this.props.textData.currentValue).toFixed(2),
                                    })(
                                        <Input style={{ width: 160 }} disabled={true} />
                                    )}
                                </FormItem>
                                {
                                    this.state.isLimit ?
                                        <FormItem
                                            {...formItemLayoutText}
                                            label="设置新值"
                                        >
                                            {getFieldDecorator('settingValue', {
                                                initialValue: this.props.textData.currentValue,
                                            })(
                                                <InputNumber
                                                    //自动聚焦
                                                    autoFocus
                                                    //自动全选
                                                    ref={(input) => {input.inputNumberRef.input.select()}}
                                                    style={{ width: 160 }}
                                                    min={this.props.pointInfo.low}
                                                    max={this.props.pointInfo.hight}
                                                    onChange={this.handleChange}
                                                    precision={2}
                                                />
                                            )}
                                        </FormItem>
                                        :
                                        <FormItem
                                            {...formItemLayoutText}
                                            label="设置新值"
                                        >
                                            {getFieldDecorator('settingValue', {
                                                initialValue: this.props.textData.currentValue,
                                            })(
                                                <InputNumber
                                                    //自动聚焦
                                                    autoFocus
                                                    //自动全选
                                                    ref={(input) => {input.inputNumberRef.input.select()}}
                                                    style={{ width: 160 }}
                                                    onChange={this.handleChange}
                                                    precision={2}
                                                />
                                            )}
                                        </FormItem>
                                }
                                {
                                    this.state.isLimit ?
                                        <FormItem
                                            {...formItemLayoutText}
                                            label="高低限"
                                        >
                                            {getFieldDecorator('hlLimit', {
                                                initialValue: this.props.pointInfo.low == undefined || this.props.pointInfo.low == '' ? '高限=' + this.props.pointInfo.hight : this.props.pointInfo.hight == undefined || this.props.pointInfo.hight == '' ? '低限=' + this.props.pointInfo.low : this.props.pointInfo.low + '~' + this.props.pointInfo.hight,
                                            })(
                                                <Input style={{ width: 160 }} disabled={true} />
                                            )}
                                        </FormItem>
                                        :
                                        <FormItem
                                            {...formItemLayoutText}
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
                {/*切换设备状态*/}
                <Modal
                    wrapClassName={instructionStr}
                    title={this.props.isLoading ? '指令设置进度提示' : '确认指令'}
                    visible={this.props.radioVisible}
                    onOk={() => this.props.textSetting(this.props.radioData.idCom, this.props.radioData.setValue, this.props.radioData.description)}
                    onCancel={this.props.radioHide}
                    footer={
                        this.props.isLoading ?
                            [
                                <Button onClick={() => this.props.textSetting(this.props.radioData.idCom, this.props.radioData.setValue, this.props.radioData.description)} >确认</Button>
                            ]
                            :
                            [
                                <Button onClick={this.props.radioHide} >取消</Button>,
                                <Button id="radioChangeBtn" onClick={() => this.props.textSetting(this.props.radioData.idCom, this.props.radioData.setValue, this.props.radioData.description)} >确认</Button>
                            ]
                    }
                    maskClosable={false}
                >
                    {
                        this.props.isLoading ?
                            <Spin tip={this.props.modalConditionDict.status ? `正在${this.props.radioData.description}` : this.props.modalConditionDict.description}>
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <div>
                                {
                                    this.props.radioData.description != '' && this.props.radioData.description != undefined ?
                                        `确定要 ${this.props.radioData.description} 吗？`
                                        :
                                        `确定要切换至 "${this.props.radioData.text}" 吗？`
                                }
                            </div>

                    }
                </Modal>
                <Modal
                    wrapClassName={instructionStr}
                    title={this.props.isLoading ? '指令设置进度提示' : '确认指令'}
                    visible={this.props.selectVisible}
                    onOk={() => this.props.textSetting(this.props.selectData.idCom, this.state.selectValue)}
                    onCancel={this.props.selectHide}
                    footer={
                        this.props.isLoading ?
                            [
                                <Button onClick={() => this.props.textSetting(this.props.selectData.idCom, this.state.selectValue)} >确认</Button>
                            ]
                            :
                            [
                                <Button onClick={this.props.selectHide} >取消</Button>,
                                <Button id="selectChangeBtn" onClick={() => this.props.textSetting(this.props.selectData.idCom, this.state.selectValue)} >确认</Button>
                            ]
                    }
                    maskClosable={false}
                >
                    {
                        this.props.isLoading ?
                            <Spin tip="正在设置故障报警信息">
                                <Alert
                                    message="提示"
                                    description="数据正在更新"
                                    type="info"
                                />
                            </Spin>
                            :
                            <Select value={this.state.selectValue ? this.state.selectValue : this.props.selectData.currentValue} style={{ width: 120 }} onChange={this.handleSelect}>
                                <Option value="0">正常</Option>
                                <Option value="1">故障</Option>
                            </Select>
                    }
                </Modal>
                <Modal
                    title="设备铭牌"
                    visible={this.state.infoModalVisible}
                    onCancel={this.handleCancel}
                    footer={null}
                    style={{ top: 200 }}
                    width={1400}
                >
                    <Table dataSource={this.state.dataSource} columns={this.state.equipmentColumns} pagination={false} />
                </Modal>
                <Modal
                    title="设备铭牌"
                    visible={this.state.assetModalVisible}
                    onCancel={this.assetHandleCancel}
                    footer={null}
                    style={{ top: 200 }}
                    width={800}
                    maskClosable={false}
                >
                    <div style={{ marginTop: '-25px' }}>
                        <Tabs activeKey={this.state.activeKey} onChange={this.callback}>
                            <TabPane tab="参数" key="1">
                                <Table
                                    dataSource={this.state.dataAssetSource}
                                    loading={this.state.assetLoading}
                                    columns={assetColumns}
                                    pagination={false}
                                    scroll={{ y: 500 }}
                                />
                            </TabPane>
                            <TabPane tab="技术手册" key="2">
                                <div>
                                    {this.getWord()}
                                </div>
                            </TabPane>
                            <TabPane tab="图示" key="3">
                                <div>
                                    {this.getPic()}
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </Modal>
                <AddWarningFormModal
                    visible={this.props.alarmVisible}
                    alarmHide={this.props.alarmHide}
                    pointname={this.props.alarmData.pointName}
                />
            </Modal>
        )
    }
}

const ObserverModal = Form.create({
    mapPropsToFields: function (props) {
        return {
            settingValue: Form.createFormField({
                value: props.textData.currentValue
            })
        }
    }
})(ObserverModalForm);

export default ObserverModal
