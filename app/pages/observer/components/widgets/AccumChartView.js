import React, { Component } from 'react'
import Widget from './Widget.js'
import s from './AccumChartView.css'
import ReactEcharts from '../../../../lib/echarts-for-react';

// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import { subtract } from '../../../../common/utils'

import { DatePicker, Form, Button, Select, message, Spin } from 'antd';
import moment from 'moment'
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const format = 'YYYY-MM-DD';
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option
const getTimeRange = function (period) {
    let startTime, endTime;

    switch (period) {
        case 'today':
            startTime = moment().startOf('day');
            endTime = moment();
            break;
        case 'thisweek':
            startTime = moment().startOf('week');
            endTime = moment();
            break;
        case 'month':
            startTime = moment().startOf('month')
            endTime = moment();
            break;
    }
    return [startTime, endTime];
}

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
const DAY_FORMAT = 'YYYY-MM-DD';
const MONTH_FORMAT = 'YYYY-MM';
const YEAR_FORMAT = 'YYYY'
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type: 'accumbar',
    name: '柱状图图组件',
    description: "生成energy组件",
}


class FormWrap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            data: [],
            xdata: [],
            loading: false,
            input: '',
            data1: [],
            data2: [],
            data3: [],
            time: [],
            j: 0,
            isopen: false
        }

        this.chart = null;
        this.container = null;

        this.getChartData = this.getChartData.bind(this);
        this.getChartData2 = this.getChartData2.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.onLast = this.onLast.bind(this);
        this.onNext = this.onNext.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onLastMonth = this.onLastMonth.bind(this);
        this.onNextMonth = this.onNextMonth.bind(this);
        this.onMonthChange = this.onMonthChange.bind(this);
        this.onLastYear = this.onLastYear.bind(this);
        this.onNextYear = this.onNextYear.bind(this);
        this.onYearChange = this.onYearChange.bind(this);
    }

    static get defaultProps() {
        return {
            points: [],
            data: []
        }
    }


    componentWillMount() {
        const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
        let timeStart, timeEnd;
        if (this.props.config.defaultTimeRange === 'today') {
            timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
                timeEnd = moment(energyDateStr).endOf('day').add(1, 'minutes').format(TIME_FORMAT);
            this.getChartData(timeStart, timeEnd);
        }

        if (this.props.config.defaultTimeRange === "thismonth") {
            timeStart = moment(energyDateStr).startOf('month').format(TIME_FORMAT);
            timeEnd = moment(energyDateStr).endOf('month').add(1, 'hours').format(TIME_FORMAT);
            this.getChartData(timeStart, timeEnd);
        }
        if (this.props.config.defaultTimeRange === "thisyear") {
            timeStart = moment(energyDateStr).startOf('year').format(TIME_FORMAT);
            timeEnd = moment(energyDateStr).endOf('year').add(1, 'month').format(TIME_FORMAT);
            this.getChartData2(timeStart, timeEnd);
        }

    }

    // componentWillReceiveProps(){

    //       this.getChartData();

    //   }
    // echart data
    getChartData(timeStart, timeEnd) {
        //const {name} = this.props.config.bindname
        this.setState({
            loading: true
        });

        http.post('/get_history_data_padded', {
            pointList: this.props.config.pointList,
            ...{
                "timeStart": timeStart,
                "timeEnd": timeEnd,
                "timeFormat": "h1"
            }
        }).then(
            (data) => {
                if (!this.container) {
                    throw new Error('Error: the instance of container is undefined')
                }
                if (data.error) {
                    throw new Error(data.msg)
                }

                this.setState({
                    loading: false,
                    data: data
                });
            }
        ).catch(
            () => {
                this.setState({
                    loading: false,
                    data: []
                });
            }
        )
    }

    getChartData2(timeStart, timeEnd) {
        //const {name} = this.props.config.bindname
        this.setState({
            loading: true
        });

        http.post('/get_history_data_padded', {
            pointList: this.props.config.pointList,
            ...{
                "timeStart": timeStart,
                "timeEnd": timeEnd,
                "timeFormat": "M1"
            }
        }).then(
            (data) => {
                if (!this.container) {
                    throw new Error('Error: the instance of container is undefined')
                }
                if (data.error) {
                    throw new Error(data.msg)
                }

                this.setState({
                    loading: false,
                    data: data
                });
            }
        ).catch(
            () => {
                this.setState({
                    loading: false,
                    data: []
                });
            }
        )
    }

    // echart option
    getChartOption() {

        let vdata = this.state.data;
        let list = this.props.config.pointList;
        let series = [];
        let data = [];
        let time = [];
        let vData = [];
        let min = this.props.config.filter && this.props.config.filter.min != undefined ? this.props.config.filter.min : 0;
        let max = this.props.config.filter && this.props.config.filter.max != undefined ? this.props.config.filter.max : 10000;

        if (this.props.config.defaultTimeRange === "today" || this.props.config.defaultTimeRange === "thisyear") {


            for (let j = 0; j < list.length; j++) {
                let l = list[j];
                let value = this.props.config.header[j];
                if (vdata.map[l] != undefined && vdata.map[l].length != 0) {
                    vData = vdata.map[l];
                    for (let i = 1; i < vdata.map[l].length; i++) {
                        let v
                        if (this.props.config && this.props.config.accumbar && this.props.config.accumbar == 'false') {
                            if (moment(vdata.time[i]) > moment()) {
                                v = 0
                            } else {
                                v = Number(vData[i]).toFixed(2);
                            }
                        } else {
                            v = Number(vData[i] - vData[i - 1]).toFixed(1);
                        }
                        if (min > v || v > max) {
                            v = 0;
                        }
                        data.push(v);
                    }
                    if (this.props.config.displayMode && this.props.config.displayMode == "1") {
                        series.push({
                            name: value,
                            type: 'bar',
                            data: data,
                            barMaxWidth: 30
                        })
                    } else if (this.props.config.displayMode && this.props.config.displayMode == "2") {
                        series.push({
                            name: value,
                            type: 'line',
                            smooth: true,
                            data: data
                        })
                    } else {
                        series.push({
                            name: value,
                            type: 'bar',
                            stack: '总量',
                            label: {
                                normal: {
                                    show: false,
                                    position: 'insideRight'
                                }
                            },
                            data: data
                        })
                    }
                    data = [];
                } else {
                    if (this.props.config.displayMode && this.props.config.displayMode == "1") {
                        series.push({
                            name: value,
                            type: 'bar',
                            data: []
                        })
                    } else if (this.props.config.displayMode && this.props.config.displayMode == "2") {
                        series.push({
                            name: value,
                            type: 'line',
                            smooth: true,
                            data: []
                        })
                    } else {
                        series.push({
                            name: value,
                            type: 'bar',
                            stack: '总量',
                            label: {
                                normal: {
                                    show: false,
                                    position: 'insideRight'
                                }
                            },
                            data: []
                        })
                    }
                }
            }
        }
        if (this.props.config.defaultTimeRange === "thismonth") {
            series = [];
            let sdata = []
            for (let j = 0; j < list.length; j++) {
                let l = list[j];
                let value = this.props.config.header[j];
                if (vdata.map[l] != undefined && vdata.map[l].length != 0) {
                    vData = vdata.map[l];
                    for (let i = 0; i < vData.length; i++) {
                        if (i % 24 == 0 && i > 0) {
                            let v
                            if (this.props.config && this.props.config.accumbar && this.props.config.accumbar == 'false') {
                                if (moment(vdata.time[i]) > moment()) {
                                    v = 0
                                } else {
                                    v = Number(vData[i]).toFixed(2);
                                }
                            } else {
                                v = Number(vData[i] - vData[i - 24]).toFixed(1);
                            }
                            if (min > v || v > max) {
                                v = 0;
                            }
                            sdata.push(v);
                        }
                    }
                    if ((vData.length - 1) % 24 != 0) {
                        let lastData
                        if (this.props.config && this.props.config.accumbar && this.props.config.accumbar == 'false') {
                            lastData = vData[vData.length - 1]
                        } else {
                            let len = vData.length - 1;
                            let leng = len - len % 24;
                            lastData = vData[len] - vData[leng];
                        }
                        sdata.push(lastData);
                    }
                    if (this.props.config.displayMode && this.props.config.displayMode == "1") {
                        series.push({
                            name: value,
                            type: 'bar',
                            data: sdata,
                            barMaxWidth: 30
                        })
                    } else if (this.props.config.displayMode && this.props.config.displayMode == "2") {
                        series.push({
                            name: value,
                            type: 'line',
                            smooth: true,
                            data: sdata
                        })
                    } else {
                        series.push({
                            name: value,
                            type: 'bar',
                            stack: '总量',
                            label: {
                                normal: {
                                    show: false,
                                    position: 'insideRight'
                                }
                            },
                            data: sdata
                        })
                    }
                    data = [];
                    sdata = [];
                } else {
                    if (this.props.config.displayMode && this.props.config.displayMode == "1") {
                        series.push({
                            name: value,
                            type: 'bar',
                            data: []
                        })
                    } else if (this.props.config.displayMode && this.props.config.displayMode == "2") {
                        series.push({
                            name: value,
                            type: 'line',
                            smooth: true,
                            data: []
                        })
                    } else {
                        series.push({
                            name: value,
                            type: 'bar',
                            stack: '总量',
                            label: {
                                normal: {
                                    show: false,
                                    position: 'insideRight'
                                }
                            },
                            data: []
                        })
                    }
                }
            }
        }

        let yName;
        if (this.props.config.defaultTimeRange === "today" && vdata.time != undefined) {
            yName = "逐时子分项"
            vdata.time.forEach(
                (item, index) => {
                    if (new RegExp(/00:00$/).test(item)) {
                        if (index < 24) {
                            time.push(item)
                        }

                    }
                }
            )
        }
        if (this.props.config.defaultTimeRange === "thismonth" && vdata.time != undefined) {
            yName = "逐日子分项"
            vdata.time.forEach(
                (item, index) => {
                    if (new RegExp(/00:00:00$/).test(item)) {
                        if (index < vdata.time.length - 1) {
                            time.push(moment(item).format("YYYY-MM-DD"))
                        }

                    }
                }
            )
        }
        if (this.props.config.defaultTimeRange === "thisyear" && vdata.time != undefined) {
            yName = "逐月子分项"
            vdata.time.forEach(
                (item, index) => {
                    if (new RegExp(/00:00$/).test(item)) {
                        if (index < 12) {
                            time.push(moment(item).format("YYYY-MM"))
                        }

                    }
                }
            )
        }
        return {
            color: this.props.config && this.props.config.barColor ? this.props.config.barColor : ['rgb(255,53,49)', 'rgb(0,192,69)', 'rgb(255,192,0)', 'rgb(212,130,101)', 'rgb(46,157,208)', 'rgb(153,0,153)', 'rgb(80,80,80)'],
            backgroundColor: this.props.config && this.props.config.backgroundColor ? this.props.config.backgroundColor : 'white',
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data: this.props.config.header,
                textStyle: {
                    fontSize: '12',
                    color: this.props.config && this.props.config.titleColor ? this.props.config.titleColor : 'black'
                },
                itemWidth: 12,
                itemHeight: 7
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            yAxis: {
                type: 'value',
                name: yName,
                axisLabel: { color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : "black" },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : 'black',
                        width: 1
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: "dashed",
                        color: this.props.config && this.props.config.splitLineColor ? this.props.config.splitLineColor : 'black'
                    }
                }
            },
            xAxis: {
                type: 'category',
                data: time,
                axisLabel: { color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : "black" },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : 'black',
                        width: 1
                    }
                }
            },
            series: series
        }
    }



    // echart实例
    saveChartRef(refEchart) {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }
    // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }

    onLast() {
        if (this.props.config.defaultTimeRange === "today") {
            let j = this.state.j
            j = j - 1;
            const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
            let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
                timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT);
            timeStart = moment(energyDateStr).startOf('day').add(j, 'days').format(TIME_FORMAT);
            timeEnd = moment(energyDateStr).endOf('day').add(j, 'days').add(1, 'minute').format(TIME_FORMAT)
            this.getChartData(timeStart, timeEnd);
            const { setFieldsValue } = this.props.form
            setFieldsValue({
                rangeDay: moment(moment(timeStart).format(DAY_FORMAT))
            })
            this.setState({
                j: j
            })
        } else if (this.props.config.defaultTimeRange === "thismonth") {
            this.onLastMonth();
        } else {
            this.onLastYear();
        }
    }
    onNext() {
        if (this.props.config.defaultTimeRange === "today") {
            let j = this.state.j
            j = j + 1;
            const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
            let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
                timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT);
            timeStart = moment(energyDateStr).startOf('day').add(j, 'days').format(TIME_FORMAT);
            timeEnd = moment(energyDateStr).endOf('day').add(j, 'days').add(1, 'minute').format(TIME_FORMAT)

            this.getChartData(timeStart, timeEnd);
            const { setFieldsValue } = this.props.form
            setFieldsValue({
                rangeDay: moment(moment(timeStart).format(DAY_FORMAT))
            })
            this.setState({
                j: j
            })
        } else if (this.props.config.defaultTimeRange === "thismonth") {
            this.onNextMonth();
        } else {
            this.onNextYear();
        }
    }

    onChange(value) {
        if (this.props.config.defaultTimeRange === "today") {
            let j = this.state.j
            j = value.diff(moment(moment().format('YYYY-MM-DD')), 'day');
            let timeStart = value.startOf('day').format(TIME_FORMAT);
            let timeEnd = value.endOf('day').add(1, 'minute').format(TIME_FORMAT);
            this.getChartData(timeStart, timeEnd);
            const { setFieldsValue } = this.props.form
            setFieldsValue({
                rangeDay: moment(moment(timeStart).format(DAY_FORMAT))
            })
            this.setState({
                j: j
            })
        }
    }
    onLastMonth() {
        let j = this.state.j
        j = j - 1;
        const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
        let timeStart = moment(energyDateStr).startOf('month').add(j, 'months').format(TIME_FORMAT);
        let timeEnd = moment(timeStart).endOf('month').add(1, 'hours').format(TIME_FORMAT);
        this.getChartData(timeStart, timeEnd);
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            rangeMonth: moment(moment(timeStart).format(MONTH_FORMAT))
        })
        this.setState({
            j: j
        })
    }
    onNextMonth() {
        let j = this.state.j
        j = j + 1;
        const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
        let timeStart = moment(energyDateStr).startOf('month').add(j, 'months').format(TIME_FORMAT);
        let timeEnd = moment(timeStart).endOf('month').add(1, 'hours').format(TIME_FORMAT);

        this.getChartData(timeStart, timeEnd);
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            rangeMonth: moment(moment(timeStart).format(MONTH_FORMAT))
        })
        this.setState({
            j: j
        })
    }

    onLastYear() {
        let j = this.state.j
        j = j - 1;
        const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
        let timeStart = moment(energyDateStr).startOf('year').add(j, 'year').format(TIME_FORMAT);
        let timeEnd = moment(timeStart).endOf('year').add(1, 'month').format(TIME_FORMAT);
        this.getChartData2(timeStart, timeEnd);
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            rangeYear: moment(moment(timeStart).format(YEAR_FORMAT))
        })
        this.setState({
            j: j
        })
    }
    onNextYear() {
        let j = this.state.j
        j = j + 1;
        const energyDateStr = window.localStorage.energyDateStr || moment().format("YYYY-MM-DD");
        let timeStart = moment(energyDateStr).startOf('year').add(j, 'year').format(TIME_FORMAT);
        let timeEnd = moment(timeStart).endOf('year').add(1, 'month').format(TIME_FORMAT);

        this.getChartData2(timeStart, timeEnd);
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            rangeYear: moment(moment(timeStart).format(YEAR_FORMAT))
        })
        this.setState({
            j: j
        })
    }

    onMonthChange(value, string) {
        let j = moment(string).diff(moment(moment().format('YYYY-MM')), 'month');
        let timeStart = moment(string).startOf('month').format(TIME_FORMAT);
        let timeEnd = moment(string).endOf('month').add(1, 'hours').format(TIME_FORMAT);
        this.getChartData(timeStart, timeEnd);
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            rangeMonth: moment(moment(timeStart).add(-1, 'months').format(MONTH_FORMAT))
        })
        this.setState({
            j: j
        })
    }

    onYearChange(value, string) {
        let j = moment(value).diff(moment(moment().format('YYYY')), 'year');
        let timeStart = moment(value).startOf('year').format(TIME_FORMAT);
        let timeEnd = moment(value).endOf('year').add(1, 'hours').format(TIME_FORMAT);
        this.getChartData2(timeStart, timeEnd);
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            rangeYear: moment(moment(timeStart).format(YEAR_FORMAT))
        })
        this.setState({
            j: j,
            isopen: false
        })
    }

    handleOpenChange = (status) => {
        if (status) {
            this.setState({
                isopen: true
            })
        } else {
            this.setState({
                isopen: false
            })
        }
    }

    render() {
        let config = this.props.config
        let flag = config.input != undefined
        const { form } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <div style={{ marginTop: 10 }}>
                    <div style={{ float: "left" }}>
                        <Button style={this.props.config.defaultTimeRange === 'today' ? { backgroundColor: "#CFCFCF", color: "black", border: "#CFCFCF" } :
                            { backgroundColor: "#CFCFCF", color: "black", border: "#CFCFCF" }}
                            onClick={this.onLast}>{this.props.config.defaultTimeRange === 'today' ? '上一天' : this.props.config.defaultTimeRange === 'thismonth' ? '上一月' : "上一年"}</Button>
                        <Button style={this.props.config.defaultTimeRange === 'today' ? { backgroundColor: "#CFCFCF", color: "black", border: "#CFCFCF" } :
                            { backgroundColor: "#CFCFCF", color: "black", border: "#CFCFCF" }}
                            onClick={this.onNext}>{this.props.config.defaultTimeRange === 'today' ? '下一天' : this.props.config.defaultTimeRange === 'thismonth' ? '下一月' : "下一年"}</Button>
                    </div>
                    <div style={{ float: "left" }}>{
                        this.props.config.defaultTimeRange === 'today' ?
                            <Form style={{ marginTop: '-4px' }}>
                                <FormItem>
                                    {getFieldDecorator('rangeDay', {
                                        initialValue: moment(moment().format(DAY_FORMAT), DAY_FORMAT)
                                    })(
                                        <DatePicker
                                            className={s['datePicker']}
                                            style={{ width: 100, backgroundColor: "#CFCFCF", color: "black" }}
                                            popupStyle={{ backgroundColor: "#CFCFCF", color: "black" }}
                                            onChange={this.onChange} format={format} showToday
                                        />
                                    )}
                                </FormItem>
                            </Form>
                            :
                            this.props.config.defaultTimeRange === 'thismonth' ?
                                <Form>
                                    <formItem>
                                        {getFieldDecorator('rangeMonth', {
                                            initialValue: moment(moment().format(MONTH_FORMAT), MONTH_FORMAT)
                                        })(
                                            <MonthPicker
                                                className={s['monthPicker']}
                                                style={{ width: 90, backgroundColor: "#CFCFCF", color: "black" }}
                                                popupStyle={{ backgroundColor: "#CFCFCF", color: "black" }}
                                                onChange={this.onMonthChange} format={'YYYY-MM'}
                                            />
                                        )}
                                    </formItem>
                                </Form>
                                :
                                <Form>
                                    <formItem>
                                        {getFieldDecorator('rangeYear', {
                                            initialValue: moment(moment().format(YEAR_FORMAT), YEAR_FORMAT)
                                        })(
                                            <DatePicker
                                                open={this.state.isopen}
                                                className={s['monthPicker']}
                                                style={{ width: 80, backgroundColor: "#CFCFCF", color: "black" }}
                                                popupStyle={{ backgroundColor: "#CFCFCF", color: "black" }}
                                                onPanelChange={this.onYearChange}
                                                onOpenChange={this.handleOpenChange}
                                                format={'YYYY'}
                                                mode="year"
                                            />
                                        )}
                                    </formItem>
                                </Form>
                    }
                    </div>

                </div>
                <div className={s['chart-container']} ref={this.saveContainerRef}>
                    {
                        this.state.loading ?
                            <div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px' }}>
                                <Spin tip="正在读取数据" />
                            </div>
                            :
                            <ReactEcharts
                                style={{
                                    height: '100%'
                                }}
                                ref={this.saveChartRef()}
                                option={this.getChartOption()}
                                theme="white"
                                notMerge={true}
                            />
                    }

                </div>

            </div>
        )
    }
}


const AccumChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class AccumChartComponent extends Widget {

    constructor(props) {
        super(props)
        this.state = {
            style: {},
        }

    }
    /* @override */
    static get type() {
        return registerInformation.type;
    }
    /* @override */
    static get registerInformation() {
        return registerInformation;
    }

    componentDidMount() {
        // style只提供基础的组件坐标和宽高，自定义需要增加逻辑
        const { style } = this.props
        this.setState({ style })
    }
    /* @override */
    getContent() {
        const { style } = this.state

        return (
            <div style={style} className={s['container']} id={this.props.config.id}>
                <AccumChartView
                    timeRange={getTimeRange('today')}
                    format='m5'
                    {...this.props}

                />
            </div>
        )
    }
}

export default AccumChartComponent