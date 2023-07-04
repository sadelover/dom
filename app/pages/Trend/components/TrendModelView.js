import React, { PropTypes } from 'react';
import { Button, Modal, Form, InputNumber, DatePicker, Checkbox, Select, message, Icon, Switch, Table, Spin } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
const ButtonGroup = Button.Group;
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
const DAY_FORMAT = 'YYYY-MM-DD';
const MONTH_FORMAT = 'YYYY-MM';
let themeStyle, toggleModalClass, btnStyle, toggleSelectClass, toggleCalendarClass;
if (localStorage.getItem('serverOmd') == "persagy") {
    themeStyle = 'light';
    toggleModalClass = 'persagy-modal-style';
    btnStyle = {
        background: "rgba(255,255,255,1)",
        border: '1px solid rgba(195,198,203,1)',
        color: "rgba(38,38,38,1)",
        borderRadius: '4px',
        fontSize: "14px",
        fontFamily: 'MicrosoftYaHei',
        marginRight: '2px'
    }
    toggleSelectClass = 'persagy-historyModal-select-selection';
    toggleCalendarClass = 'persagy-historyModal-calendar-picker';
}
let str;
if (localStorage.getItem('serverOmd') == "best") {
    str = 'trend-best'
} else {
    str = 'vertical-center-modal'
}

//获取时间范围
const getTimeRange = function (period, day) {
    let startTime, endTime;
    switch (period) {
        case 'day':
            startTime = moment().startOf('day');
            endTime = moment();
            break;
        case 'week':
            startTime = moment().startOf('week');
            endTime = moment();
            break;
        case 'month':
            startTime = moment().startOf('month');
            endTime = moment();
            break;
        case 'hour':
        default:
            startTime = moment().subtract(1, 'hour');
            endTime = moment();
            break;
    }
    return [startTime, endTime];
}
const ModalForm = Form.create()(class defaultModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            value: "m1",
            time: '',
            data: '',
            data2: '',
            timeFrom: '',
            timeTo: '',
            lastDay: 1,
            nextDay: -1,
            filterVisible: false,
            maxValue: 0,
            minValue: 0,
            type: '',
            maxChecked: false,
            minChecked: false
        }
        this.handleSelect = this.handleSelect.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onSwitchChange = this.onSwitchChange.bind(this);
        this.getData = this.getData.bind(this);
        this.setTimeRange = this.setTimeRange.bind(this);
        this.ExportData = this.ExportData.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.tendencyData !== this.props.tendencyData) {
            localStorage.setItem('newPoint', nextProps.tendencyData.point);
            this.setState({
                value: 'm1',
                visible: nextProps.tendencyVisible,
                data: nextProps.tendencyData.dataSource,
                time: nextProps.tendencyData.time,
                point: nextProps.tendencyData.point,
                timeFrom: moment().subtract(1, 'hour').format(TIME_FORMAT),
                timeTo: moment().format(TIME_FORMAT)
            })
            this.props.form.setFieldsValue({
                range: [moment().startOf('hour'), moment()],
                timeFormat: 'm1'
            });
            this.setTimeRange('hour');
        }
    }
    componentDidMount() {
        const { tendencyData } = this.props
        if(tendencyData.initTime){
            let endTime = moment(moment()).isBefore(moment(tendencyData.initTime).add(1,'hour')) ? moment(): moment(tendencyData.initTime).add(1,'hour')
            let startTime = moment(tendencyData.initTime).subtract(1, 'hour')
            this.setState({
                value: 'm1',
                data: tendencyData,
                time: tendencyData.time,
                point: tendencyData.point,
                timeFrom: startTime.format(TIME_FORMAT),
                timeTo: endTime.format(TIME_FORMAT)
            })
            this.props.form.setFieldsValue({
                range: [startTime, endTime],
                timeFormat: 'm1'
            });
            this.onSearch();
        }else{
            this.setState({
                value: 'm1',
                data: tendencyData,
                time: tendencyData.time,
                point: tendencyData.point,
                timeFrom: moment().subtract(1, 'hour').format(TIME_FORMAT),
                timeTo: moment().format(TIME_FORMAT)
            })
            this.props.form.setFieldsValue({
                range: [moment().startOf('hour'), moment()],
                timeFormat: 'm1'
            });
            this.setTimeRange('hour');
        }
    }
    // shouldComponentUpdate(nextProps,nextState){
    //     if(nextProps.visible!==this.props.visible){
    //         return true
    //     }else{
    //         if(nextState==this.state){
    //             return false
    //         }else{
    //             return true
    //         }
    //     }
    // }
    onSearch() {
        let _this = this;
        _this.props.showChartLoading()
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            let timediff = moment(values.range[1]).diff(moment(values.range[0]), 'days')
            this.setState({
                timeFrom: values.range[0].format(TIME_FORMAT),
                timeTo: values.range[1].format(TIME_FORMAT)
            })
            _this.getData(
                values.range[0].format(TIME_FORMAT),
                values.range[1].format(TIME_FORMAT),
                values.timeFormat
            ).then(
                (data) => {

                    if (!data.error) {
                        _this.setState({
                            time: data.time,
                            data: data.map,
                            data2: ''
                        })
                        if (_this.state.maxChecked == true || _this.state.minChecked == true) {
                            for (let i in data.map) {
                                if (_this.state.maxChecked == true && _this.state.maxValue !== '' && typeof (_this.state.maxValue) == 'number') {
                                    data.map[i].map((item, index) => {
                                        if (Number(item) > Number(_this.state.maxValue)) {
                                            data.map[i][index] = undefined
                                            data.time[index] = undefined
                                        }
                                    })
                                }
                                if (_this.state.minChecked == true && _this.state.minValue !== '' && typeof (_this.state.minValue) == 'number') {
                                    data.map[i].map((item, index) => {
                                        if (Number(item) < Number(_this.state.minValue)) {
                                            data.map[i][index] = undefined
                                            data.time[index] = undefined
                                        }
                                    })
                                }
                                data.map[i] = data.map[i].filter((item) => {
                                    return item != undefined
                                })
                                data.time = data.time.filter((item) => {
                                    return item != undefined
                                })
                            }
                        }
                        _this.props.renderChart(data);
                    } else {
                        if (_this.state.value == 'm1') {
                            if (timediff > 7) {
                                Modal.confirm({
                                    title: '取样间隔为1分钟时，最多支持查询7天的数据',
                                    onOk() {
                                        _this.props.hideChartLoading()
                                    },
                                    onCancel() {
                                        _this.props.hideChartLoading()
                                    }
                                })
                            }
                        }
                        if (_this.state.value == 'm5') {
                            if (timediff > 14) {
                                Modal.confirm({
                                    title: '取样间隔为5分钟时，最多支持查询14天的数据',
                                    onOk() {
                                        _this.props.hideChartLoading()
                                    },
                                    onCancel() {
                                        _this.props.hideChartLoading()
                                    }
                                })

                            }
                        }
                        if (_this.state.value == 'h1') {
                            if (timediff > 60) {
                                Modal.confirm({
                                    title: '取样间隔为1小时时，最多支持查询60天的数据',
                                    onOk() {
                                        _this.props.hideChartLoading()
                                    },
                                    onCancel() {
                                        _this.props.hideChartLoading()
                                    }

                                })
                            }
                        }
                        if (_this.state.value == 'd1') {
                            if (timediff > 365) {
                                Modal.confirm({
                                    title: '取样间隔为1天时，最多支持查询365天的数据',
                                    onOk() {
                                        _this.props.hideChartLoading()
                                    },
                                    onCancel() {
                                        _this.props.hideChartLoading()
                                    }
                                })
                            }
                        }

                    }
                }
            )

        });
    }
    ExportData() {
        const { tendencyData } = this.props
        let pointList = []
        let pointData = []
        let reportName = '历史数据'
        let strStartTime = this.state.timeFrom
        let strEndTime = this.state.timeTo
        let timeData = this.state.time
        let data = this.state.data

        if (data.dataSouce !== undefined) {
            let newdata = data.dataSouce
            Object.keys(newdata).map(item => {
                pointList.push(item)
            })
            pointData = timeData.map((item, row) => {
                let line = {}
                line['key'] = row
                pointList.forEach((iteml, i) => {
                    if (newdata[iteml].length === 0) {
                        line[1] = ''
                    } else {
                        line[iteml] = newdata[iteml][row]
                    }
                })
                return line
            })
            http.post('/reportTool/genExcelReportByTableData', {
                reportName: reportName,
                strStartTime: strStartTime,
                strEndTime: strEndTime,
                headerList: [`${tendencyData.point}`],　 //表头用的点名
                tableDataList: pointData,
                timeList: data.time,
                pointList: [`${tendencyData.point}`]
            }).then(
                data => {
                    if (data.err === 0) {
                        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                    }
                    if (status === false) {
                        message.error('生成下载文件失败')
                    }
                }
            )
        } else {
            Object.keys(data).map(item => {
                pointList.push(item)
            })
            pointData = timeData.map((item, row) => {
                let line = {}
                line['key'] = row
                pointList.forEach((iteml, i) => {
                    if (data[iteml].length === 0) {
                        line[item] = ''
                    } else {
                        line[iteml] = data[iteml][row]
                    }
                })
                return line
            })
        }
        http.post('/reportTool/genExcelReportByTableData', {
            reportName: reportName,
            strStartTime: strStartTime,
            strEndTime: strEndTime,
            headerList: [`${tendencyData.point}`],　 //表头用的点名
            tableDataList: pointData,
            timeList: this.state.time,
            pointList: [`${tendencyData.point}`]
        }).then(
            data => {
                if (data.err === 0) {
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                }
                if (status === false) {
                    message.error('生成下载文件失败')
                }
            }
        )
    }
    onSwitchChange() {
        let _this = this;
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            _this.getData(
                values.range[0].format(TIME_FORMAT),
                values.range[1].format(TIME_FORMAT),
                values.timeFormat
            ).then(
                (data) => {
                    if (!data.error) {
                        let arrValue = [], arrValues = []
                        //先判断点值是非数字还是数字类型
                        if (isNaN(Number(data[0].history[0].value))) {
                            //console.log('非数字')
                            //筛选去掉补齐的内容（error为true即自动补齐的）
                            for (let i = 0; i < data.length; i++) {
                                arrValue = data[i].history.filter(
                                    (row) => {
                                        if (!row.error) {
                                            return row
                                        }
                                    }
                                )
                                //将原data里的数值数组替换成筛选后的
                                data[i].history = arrValue
                            }
                            //console.log(data)
                        }
                        //如果点值为数字类型，补齐的值将为undefind,但条目数量不变，提供给echart的数据视图
                        for (let i = 0; i < data.length; i++) {
                            arrValue = data[i].history.map(
                                (row) => {
                                    if (!row.error) {
                                        return row.value
                                    }
                                }
                            )
                            arrValues.push(arrValue)
                        }
                        let arrName = data.map(
                            (row) => {
                                return row.name
                            }
                        )
                        let obj = {}
                        arrName.forEach(
                            (item, index) => {
                                obj[item] = arrValues[index]
                            }
                        )
                        let arrTime = data[0].history.map(
                            (row) => {
                                return row.time
                            }
                        )
                        let arrData = {
                            data: obj,
                            timeStamp: arrTime
                        }
                        //判断点值是非数字还是数字类型，调用对应方法
                        if (isNaN(Number(arrValue[0]))) {
                            _this.renderTextarea(data, obj);
                        } else {
                            _this.props.renderChart(arrData);
                        }
                    } else {
                        message.error("no history data");
                    }
                }
            )
        });
    }
    getData(timeStart, timeEnd, timeFormat) {
        return http.post('/get_history_data_padded', {
            'pointList': [`${localStorage.getItem('newPoint')}`],
            'timeStart': `${moment(timeStart).format('YYYY-MM-DD HH:mm')}:00`,
            'timeEnd': `${moment(timeEnd).format('YYYY-MM-DD HH:mm')}:00`,
            'timeFormat': timeFormat,
        }).catch(
            (error) => {
                message.error('服务器通讯失败！');
            }
        )
    }
    handleSelect(value) {
        this.setState({
            value: value
        })
    }
    setTimeRange(period) {
        // let captureds = echarts.init(document.getElementById('capturedsDetails'));
        const { lastDay, nextDay } = this.state
        let _this = this
        if (period == 'lastday') {
            this.setState({
                lastDay: lastDay + 1,
                nextDay: nextDay + 1
            })
        } else if (period == 'nextday') {
            this.setState({
                lastDay: lastDay - 1,
                nextDay: nextDay - 1
            })
        } else {
            this.setState({
                lastDay: 1,
                nextDay: -1
            })
        }
        let range = getTimeRange(period, this.state.lastDay)
        let starTime = moment().subtract(this.state.lastDay, 'days').startOf('day')
        let endTime = moment().subtract(this.state.lastDay, "days").endOf('day')
        let _starTime = moment().subtract(this.state.nextDay, 'days').startOf('day')
        let _endTime = moment().subtract(this.state.nextDay, "days").endOf('day')
        switch (period) {
            case 'nextday':
                this.props.form.setFieldsValue({
                    range: [_starTime, _endTime],
                    timeFormat: 'm1'
                });
                break;
            case 'lastday':
                this.props.form.setFieldsValue({
                    range: [starTime, endTime],
                    timeFormat: 'm1'
                });
                break;
            case 'hour':
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'm1'
                });
                break;
            case 'day':
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'm1'
                });
                break;
            case 'week':
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'h1'
                }); break;
            case 'month':
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'd1'
                }); break;
            default:
                this.props.form.setFieldsValue({
                    range: range,
                    timeFormat: 'm1'
                });
                break;
        }
        this.onSearch();
    }

    TodayHuanBi(days, type) {
        let _this = this;
        let data1, data2, starTime, endTime, _starTime, _endTime
        _this.props.showChartLoading()
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            starTime = values.range[0].format(TIME_FORMAT)
            endTime = values.range[1].format(TIME_FORMAT)
            _starTime = moment(starTime).add(days, 'days').format(TIME_FORMAT)
            _endTime = moment(endTime).add(days, 'days').format(TIME_FORMAT)
            _this.getData(
                starTime,
                endTime,
                'm1'
            ).then(
                (data) => {
                    if (!data.error) {
                        _this.setState({
                            time: data.time,
                            data: data.map,
                            type: type
                        })
                        data1 = data
                        _this.getData(
                            _starTime,
                            _endTime,
                            values.timeFormat
                        ).then(
                            (data) => {
                                if (!data.error) {
                                    _this.setState({
                                        data2: data.map
                                    })
                                    data2 = data
                                    _this.props.renderChart2(data1, data2, type)
                                }
                            }
                        )
                    }
                }
            )
        });
    }

    showModal = () => {
        this.setState({
            filterVisible: true,
        });
    }
    handleOk = (e) => {
        if (this.state.maxValue != '' && this.state.minValue != '') {
            if (this.state.maxValue <= this.state.minValue) {
                Modal.error({
                    title: "低限必须大于高限！"
                })
                return
            }
        }
        const { tendencyData } = this.props
        this.setState({
            filterVisible: false,
        });
        let data11 = this.state.data
        let data22 = this.state.data2
        let time = this.state.time
        let data_1 = [], data_2 = [], time_1 = []
        let data = {}, data2 = {}
        data[`${tendencyData.point}`] = data11[`${tendencyData.point}`]
        data2[`${tendencyData.point}`] = data22[`${tendencyData.point}`]
        if (this.state.maxChecked == true && this.state.minChecked == false) {
            data[`${tendencyData.point}`] = data[`${tendencyData.point}`].map((item, index) => {
                if (item < this.state.maxValue) {
                    return item
                }
            })
            for (let i = 0, j = 0, z = 0; i < data[`${tendencyData.point}`].length; i++) {
                if (data[`${tendencyData.point}`][i] != undefined) {
                    data_1[j++] = data[`${tendencyData.point}`][i]
                    time_1[z++] = time[i]
                }
            }
            data[`${tendencyData.point}`] = data_1
            if (data22 != '' && data22 != [] && data22 != undefined) {
                data2[`${tendencyData.point}`] = data2[`${tendencyData.point}`].map((item, index) => {
                    if (item < this.state.maxValue) {
                        return item
                    }
                })
                for (let i = 0, j = 0, z = 0; i < data2[`${tendencyData.point}`].length; i++) {
                    if (data2[`${tendencyData.point}`][i] != undefined) {
                        data_2[j++] = data2[`${tendencyData.point}`][i]
                    }
                }
                data2[`${tendencyData.point}`] = data_2
            }
        } else if (this.state.maxChecked == false && this.state.minChecked == true) {
            data[`${tendencyData.point}`] = data[`${tendencyData.point}`].map((item, index) => {
                if (item > this.state.minValue) {
                    return item
                }
            })
            for (let i = 0, j = 0, z = 0; i < data[`${tendencyData.point}`].length; i++) {
                if (data[`${tendencyData.point}`][i] != undefined) {
                    data_1[j++] = data[`${tendencyData.point}`][i]
                    time_1[z++] = time[i]
                }
            }
            data[`${tendencyData.point}`] = data_1
            if (data22 != '' && data22 != [] && data22 != undefined) {
                data2[`${tendencyData.point}`] = data2[`${tendencyData.point}`].map((item, index) => {
                    if (item > this.state.minValue) {
                        return item
                    }
                })
                for (let i = 0, j = 0, z = 0; i < data2[`${tendencyData.point}`].length; i++) {
                    if (data2[`${tendencyData.point}`][i] != undefined) {
                        data_2[j++] = data2[`${tendencyData.point}`][i]
                    }
                }
                data2[`${tendencyData.point}`] = data_2
            }
        } else if (this.state.maxChecked == true && this.state.minChecked == true) {
            data[`${tendencyData.point}`] = data[`${tendencyData.point}`].map((item, index) => {
                if (item > this.state.minValue && item < this.state.maxValue) {
                    return item
                }
            })
            for (let i = 0, j = 0, z = 0; i < data[`${tendencyData.point}`].length; i++) {
                if (data[`${tendencyData.point}`][i] != undefined) {
                    data_1[j++] = data[`${tendencyData.point}`][i]
                    time_1[z++] = time[i]
                }
            }
            data[`${tendencyData.point}`] = data_1
            if (data22 != '' && data22 != [] && data22 != undefined) {
                data2[`${tendencyData.point}`] = data2[`${tendencyData.point}`].map((item, index) => {
                    if (item > this.state.minValue && item < this.state.maxValue) {
                        return item
                    }
                })
                for (let i = 0, j = 0, z = 0; i < data2[`${tendencyData.point}`].length; i++) {
                    if (data2[`${tendencyData.point}`][i] != undefined) {
                        data_2[j++] = data2[`${tendencyData.point}`][i]
                    }
                }
                data2[`${tendencyData.point}`] = data_2
            }
        } else {
            if (data2 != '' && data2 != [] && data2 != undefined) {
                this.props.renderChart2({ map: data, time: time }, { map: data2, time: time }, this.state.type)
            } else {
                this.props.renderChart({ map: data, time: time })
            }
            return
        }

        if (data2 != '' && data2 != [] && data2 != undefined) {
            this.props.renderChart2({ map: data, time: time_1 }, { map: data2, time: time_1 }, this.state.type)
        } else {
            this.props.renderChart({ map: data, time: time_1 == [] })
        }

    }
    handleCancel = (e) => {
        this.setState({
            filterVisible: false,
        });
    }

    onMaxChange = (value) => {
        this.setState({
            maxValue: value
        })
    }

    onMinChange = (value) => {
        this.setState({
            minValue: value
        })
    }

    onOffMaxChange = (e) => {
        this.setState({
            maxChecked: e.target.checked
        })
    }

    onOffMinChange = (e) => {
        this.setState({
            minChecked: e.target.checked
        })
    }

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;

        return (
            <Form layout='inline'>
                <FormItem
                    label="快速选择"
                >
                    <ButtonGroup size="small">
                        <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('hour'); }}>小时</Button>
                        <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('day'); }}>今天</Button>
                        <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('lastday') }}>前一天</Button>
                        <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('nextday') }}>后一天</Button>
                        <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('week'); }}>本周</Button>
                        <Button style={btnStyle} size="small" onClick={() => { this.setTimeRange('month'); }}>本月</Button>
                        <Button style={btnStyle} size="small" onClick={() => { this.TodayHuanBi(-1, "today"); }}>日环比</Button>
                        <Button style={btnStyle} size="small" onClick={() => { this.TodayHuanBi(-7, "week"); }}>日同比</Button>
                        <Icon type="setting" style={{ fontSize: 16, marginLeft: 15, marginRight: -5, cursor: "pointer" }} onClick={this.showModal} />
                    </ButtonGroup>
                </FormItem>
                <Modal
                    title="过滤设置"
                    visible={this.state.filterVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={400}
                    okText="确认"
                    cancelText="取消"
                >
                    <div style={{ marginBottom: 5 }}>
                        高限过滤设置：<InputNumber onChange={this.onMaxChange} defaultValue={0} disabled={!this.state.maxChecked} />
                        <span style={{ marginLeft: 30 }}>高限过滤启用：</span><Checkbox onChange={this.onOffMaxChange}></Checkbox>
                    </div>
                    <div>
                        低限过滤设置：<InputNumber onChange={this.onMinChange} defaultValue={0} disabled={!this.state.minChecked} />
                        <span style={{ marginLeft: 30 }}>低限过滤启用：</span><Checkbox onChange={this.onOffMinChange}></Checkbox>
                    </div>
                </Modal>
                <FormItem
                    label="取样间隔"
                >
                    {getFieldDecorator('timeFormat', {
                        initialValue: 'm1'
                    })(
                        <Select size="small" onSelect={this.handleSelect} className={toggleSelectClass}>
                            <Option value="m1">1分钟</Option>
                            <Option value="m5">5分钟</Option>
                            <Option value="h1">1小时</Option>
                            <Option value="d1">1天</Option>
                        </Select>
                    )}
                </FormItem>
                <FormItem
                    label="时间范围"
                    className={toggleCalendarClass}
                >
                    {getFieldDecorator('range')(
                        <RangePicker size="small" showTime format={'YYYY-MM-DD HH:mm'} style={{ width: 270 }} />
                    )}
                </FormItem>
                <FormItem>
                    <Button
                        type="primary"
                        size="small"
                        style={{ marginLeft: '-6px' }}
                        onClick={this.props.switchData ? this.onSwitchChange : this.onSearch}
                    >
                        查询
                    </Button>

                </FormItem>
                <FormItem>
                    <Button
                        type="primary"
                        size="small"
                        style={{ marginLeft: '-6px' }}
                        onClick={this.ExportData}
                    >
                        下载
                    </Button>
                </FormItem>
            </Form>
        );
    }
})

class TendencyModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chartOption: null,
            text: null,
            columnsData: [],
            textArea: false,
            visible: false,
            value: "m1",
            description: '',
            data: '',
            timeFrom: '',
            timeTo: '',
            lastDay: 1,
            nextDay: -1,
            time: '',
            point: ''
        };
        this.getChartOption = this.getChartOption.bind(this);
        this.getChartOption2 = this.getChartOption2.bind(this);
        this.saveFormRef = this.saveFormRef.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.renderChart = this.renderChart.bind(this);
        this.renderChart2 = this.renderChart2.bind(this);
        this.showChartLoading = this.showChartLoading.bind(this);
        this.hideChartLoading = this.hideChartLoading.bind(this);
        // this.handleSelect = this.handleSelect.bind(this);
        // this.onSearch = this.onSearch.bind(this);
        // this.onSwitchChange = this.onSwitchChange.bind(this);
        // this.getData = this.getData.bind(this);
        // this.setTimeRange = this.setTimeRange.bind(this);
        this.cancel = this.cancel.bind(this);
        // this.ExportData = this.ExportData.bind(this)
        this.form = null;

    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.tendencyData !== this.props.tendencyData) {
            localStorage.setItem('newPoint', nextProps.tendencyData.point);
            this.setState({
                value: 'm1',
                visible: nextProps.tendencyVisible,
                data: nextProps.tendencyData.dataSource,
                time: nextProps.tendencyData.time,
                point: nextProps.tendencyData.point,
                timeFrom: moment().subtract(1, 'hour').format(TIME_FORMAT),
                timeTo: moment().format(TIME_FORMAT)
            })
            // this.props.form.setFieldsValue({
            //     range: [moment().startOf('hour'), moment()],
            //     timeFormat: 'm1'
            // });
            
        }
    }
    // componentDidMount(){
    //     const { tendencyData,tendencyVisible} = this.props
    //         this.setState({
    //             value: 'm1',
    //             data:tendencyData,
    //             time: tendencyData.time,
    //             point:tendencyData.point,
    //             timeFrom: moment().subtract(1, 'hour').format(TIME_FORMAT),
    //             timeTo: moment().format(TIME_FORMAT)
    //         })
    //         this.props.form.setFieldsValue({
    //             range: [moment().startOf('hour'), moment()],
    //             timeFormat: 'm1'
    //         });
    //         // this.renderChart(tendencyData)
    //         this.setTimeRange('hour');
    // }

    getChartOption(pointsData) {
        const { tendencyData } = this.props
        let arr = []
        arr = pointsData.map[`${tendencyData.point}`]
        pointsData.map[`${tendencyData.point}`].map((item, index) => {
            if(String(item).indexOf('.') == -1){
                arr[index] = item
            }else{
                if (item >= 10000) {
                    arr[index] = item.toFixed(0)
                }else{
                    arr[index] = item.toFixed(2)
                }
            }
        })
        try {
            return {
                title: {
                    text: tendencyData.point,
                    subtext: tendencyData.description,
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {
                            show: true
                        }
                    },
                    right: '2%'
                },
                grid: {
                    top: '14%',
                    left: '4%',
                    right: '4%',
                    bottom: '4%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: pointsData.time
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [{
                    name: tendencyData.point,
                    type: 'line',
                    endLabel: {
                        show: true
                    },

                    data: arr
                }]
            };
        } catch (err) {
            console.log('23')
        }
    }

    getChartOption2(pointsData, pointsData2, flag) {
        const { tendencyData } = this.props
        let name
        if (flag == "today") {
            name = "上一天同时刻数值"
        } else {
            name = "上一周同时刻数值"
        }
        try {
            return {
                title: {
                    text: tendencyData.point,
                    subtext: tendencyData.description,
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {
                            show: true
                        }
                    },
                    right: '2%'
                },
                grid: {
                    top: '14%',
                    left: '4%',
                    right: '4%',
                    bottom: '4%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: pointsData.time
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [{
                    name: tendencyData.point,
                    type: 'line',
                    // label: {
                    //     normal: {
                    //         show: true,
                    //         position: 'top'
                    //     }
                    // },
                    data: pointsData.map[`${tendencyData.point}`]
                }, {
                    name: name,
                    type: 'line',
                    // label: {
                    //     normal: {
                    //         show: true,
                    //         position: 'top'
                    //     }
                    // },
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    },
                    data: pointsData2.map[`${tendencyData.point}`]
                },]
            };
        } catch (err) {
            console.log('23')
        }
    }

    //点值为非数值时，处理数据格式
    renderTextarea(data, obj) {
        let tableData, arrTextValue, arrTextValues = []
        //dataSource
        for (let j = 0; j < data.length; j++) {
            arrTextValue = data[j].history.map(
                (row) => {
                    return row.value
                }
            )
            // arrTextValues.push(arrTextValue)
            tableData = data[0].history.map(function (row, i) {
                row['key'] = i;
                row[`value${j}`] = arrTextValue[i];
                row.value = null
                return row;
            });
        }
        //columns动态生成列
        let columnsData = Object.keys(obj).map(
            (name, i) => ({
                title: name,
                dataIndex: `value${i}`,
                key: `value${i}`,
                width: 200
            })
        )
        let defaultColumn = {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width: 60
        }
        columnsData.unshift(defaultColumn)



        this.setState({
            textArea: true,
            text: tableData,
            columnsData: columnsData
        })
    }

    renderChart(data) {
        this.setState({
            chartOption: this.getChartOption(data)
        });
        this.hideChartLoading();
    }

    renderChart2(data1, data2, flag) {
        this.setState({
            chartOption: this.getChartOption2(data1, data2, flag)
        });
        this.hideChartLoading();
    }

    showChartLoading() {  //动画
        if (this.chart) {
            this.chart.showLoading();
        }
    }

    hideChartLoading() {
        if (this.chart) {
            this.chart.hideLoading();
        }
    }

    saveFormRef(form) {
        this.form = form;
    }

    saveChartRef(chart) {
        if (chart) {
            this.chart = chart.getEchartsInstance();
        } else {
            this.chart = chart;
        }
    }

    cancel() {
        this.props.hideTendencyModal();
        this.setState({
            chartOption: null
        })
    }
    render() {
        const { tendencyData, tendencyVisible, hideTendencyModal, form } = this.props;
        // const { visible } = this.state;
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                {
                    this.state.visible ?
                        <Modal
                            visible={this.state.visible}
                            title=''
                            onCancel={this.cancel}
                            wrapClassName={str}
                            footer=''
                            width={1220}
                            maskClosable={false}
                            Index={1002}
                        >
                            <ModalForm
                                ref={this.saveFormRef}
                                autoSearch={this.state.visible}
                                tendencyData={tendencyData}
                                renderChart={this.renderChart}
                                renderChart2={this.renderChart2}
                                showChartLoading={this.showChartLoading}
                                hideChartLoading={this.hideChartLoading}
                                renderTextarea={this.renderTextarea}
                            />
                            {this.state.chartOption == null ? <div
                                style={{
                                    margin: '16px 0 8px',
                                    height: '480px',
                                    textAlign: 'center'
                                }}>
                                <Spin tip="正在读取数据" />
                            </div> :
                                <ReactEcharts
                                    style={{
                                        margin: '16px 0 8px',
                                        height: '480px'
                                    }}
                                    ref={this.saveChartRef}
                                    option={this.state.chartOption}
                                    theme="dark"
                                    notMerge={true}
                                    lazyUpdate={true}
                                />
                            }

                        </Modal>
                        :
                        ''
                }
            </div>

        );
    }
}
const TrendModelView = Form.create()(TendencyModal);
export default TrendModelView
