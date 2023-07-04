import React, { Component } from 'react'
import Widget from './Widget.js'
import ReactEcharts from '../../../../lib/echarts-for-react';
import s from './RelationView.css'
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import { DatePicker, Row, Col, Form, Button, Radio, Select, Checkbox, message, Spin, Input, Layout, Table, Progress, Modal } from 'antd';
import moment from 'moment'
import { downloadUrl } from '../../../../common/utils';
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option
const { RangePicker } = DatePicker
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type: 'relation',
    name: '数据相关性分析组件',
    description: "生成数据相关性分析组件",
}

class FormWrap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inputValue: 0,
            outputValue: [0],
            timeSpace: this.props.config.period,
            timeFrom: this.props.config.timeFrom ? this.props.config.timeFrom : moment().startOf('week').format(TIME_FORMAT),
            //2023-4-20 （原本如果没有在config配置timeTo则直接给当前日期，但是会导致from到to的时间超出1000天，后台不支持）
            //与顾博讨论后做如下兼容：当没有配置timeTo时，如果算出当前日期超出1000天，则直接以1000天为结束日期
            timeTo: this.props.config.timeTo ? this.props.config.timeTo : this.props.config.timeFrom ? Number(moment.duration(moment().diff(moment(this.props.config.timeFrom))).as('days'))  >1000 ? moment(this.props.config.timeFrom).add(1000, 'days').format(TIME_FORMAT) : moment().format(TIME_FORMAT) : moment().format(TIME_FORMAT),
            data: [],
            ChineseData: [],
            loading: false,
            zIndex: '',
            chartData: {
                time: [],
                map: []
            },
            xName: '',
            xname: [],
            ZAxis: []
        }
        this.container = null;
        this.handleSelect = this.handleSelect.bind(this)
        this.onChange = this.onChange.bind(this)
        this.SelectTimeSpace = this.SelectTimeSpace.bind(this)
        this.search = this.search.bind(this)
        this.load = this.load.bind(this)
        this.timeChange = this.timeChange.bind(this)
        this.saveContainerRef = this.saveContainerRef.bind(this)
        this.saveChartRef = this.saveChartRef.bind(this)
        this.filterData = this.filterData.bind(this)
    }

    componentDidMount() {
        this.setState({
            loading: true
        })
        let ChineseDataList = (this.props.config.input ? this.props.config.input : []).concat(this.props.config.output ? this.props.config.output : [])
        http.post('/analysis/get_point_info_from_s3db', {
            "pointList": ChineseDataList
        }).then(
            data => {
                let z
                if (this.props.config.input) {
                    if (data.data[this.props.config.input[0]] == undefined) {
                        z = ""
                    }else {
                        z = data.data[this.props.config.input[0]].description == undefined ? undefined : data.data[this.props.config.input[0]].description
                    }
                } else {
                    z = "未检测到后台配置"
                }
                if (z == undefined || z == '') {
                    z = this.props.config.input[0]
                }
                this.setState({
                    ChineseData: data.data,
                    zIndex: z
                })
            }
        )

        if (this.props.config.inputType && this.props.config.inputType == "equation") {
            let pointList = []
            this.props.config.input.map((key, index) => {
                pointList.push(this.props.config.input[index])
            })
            let equation = this.props.config.inputEquation
            equation = equation.replace(/\"/g, "'");
            pointList.push(this.props.config.output[0])
            http.post('/pointCalculation/calHistory', {
                pointNameList: pointList,
                timeFrom: this.state.timeFrom,
                timeTo: this.state.timeTo,
                period: this.state.timeSpace,
                equation: equation
            }).then(
                data => {
                    if (data.err) {
                        this.setState({
                            loading: false
                        })
                        Modal.warning({
                            title: '数据请求失败！',
                            content: (
                                <div>
                                    <p>请查看配置是否有误</p>
                                </div>
                            )
                        })
                    }
                    if (data.map) {
                        let timeArr = data.time;
                        let xAxis = data.map[equation]
                        let YAxis = data.map[this.props.config.output[0]]
                        let Data = [];
                        Data.push(xAxis.map((key, index) => [String(key), YAxis[index], timeArr[index]]))
                        let xname = []
                        xname = xAxis.filter(function (element, index, self) {
                            return self.indexOf(element) === index;
                        });
                        this.setState({
                            data: Data,
                            loading: false,
                            chartData: data,
                            xname: xname
                        })
                        this.filterData()
                    }
                }
            )
        } else {
            let pointList = []
            pointList[0] = this.props.config.input ? this.props.config.input[0] : ''
            pointList[1] = this.props.config.output ? this.props.config.output[0] : ''
            if (this.props.config.classify && this.props.config.classify.pointName) {
                pointList.push(this.props.config.classify.pointName)
            }
            http.post('/get_history_data_padded', {
                pointList: pointList,
                timeStart: this.state.timeFrom,
                timeEnd: this.state.timeTo,
                timeFormat: this.state.timeSpace
            }).then(
                data => {
                    if (data.err) {
                        this.setState({
                            loading: false
                        })
                        Modal.warning({
                            title: '数据请求失败！',
                            content: (
                                <div>
                                    <p>请查看后台配置</p>
                                </div>
                            )
                        })
                    }
                    if (data.error) {
                        this.setState({
                            loading: false
                        })
                        Modal.warning({
                            title: '分析数据失败！',
                            content: (
                                <div>
                                    <p>{data.msg}</p>
                                </div>
                            )
                        })
                    }
                    if (data.map) {
                        let timeArr = data.time;
                        let xAxis = data.map[pointList[0]];
                        let YAxis = data.map[pointList[1]];
                        let Data = [];
                        let ZAxis = []
                        // xName = this.props.config.input?this.state.ChineseData[this.props.config.input[this.state.inputValue]].description:'';
                        if (this.props.config.classify && this.props.config.classify.pointName) {
                            ZAxis = [...new Set(data.map[pointList[pointList.length - 1]])]
                            ZAxis.map((key1, index1) => {
                                Data.push(xAxis.map((key2, index2) => {
                                    if (key1 == data.map[pointList[pointList.length - 1]][index2]) {
                                        if (this.props.config.filter && this.props.config.filter[this.state.outputValue[0]] && this.props.config.filter[this.state.outputValue[0]].max && this.props.config.filter[this.state.outputValue[0]].min) {
                                            if (this.props.config.filter[this.state.outputValue[0]].max > YAxis[index2] && this.props.config.filter[this.state.outputValue[0]].min < YAxis[index2]) {
                                                return [key2, YAxis[index2], timeArr[index2]]
                                            } else {
                                                return [key2, '', timeArr[index2]]
                                            }
                                        } else {
                                            return [key2, YAxis[index2], timeArr[index2]]
                                        }

                                    }
                                }))
                            })


                        } else {
                            Data.push(xAxis.map((key, index) => [key, YAxis[index], timeArr[index]]))
                        }
                        this.setState({
                            data: Data,
                            loading: false,
                            chartData: data,
                            ZAxis: ZAxis
                        });
                        this.filterData()
                    }

                }
            ).catch(
                err => {

                }
            )
        }

    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState == this.state) {
            return false
        } else {
            return true
        }
    }

    //选择输入数据
    handleSelect(value) {
        let z = this.props.config.input && this.state.ChineseData[this.props.config.input[value]] && this.state.ChineseData[this.props.config.input[value]].description != "" ? this.state.ChineseData[this.props.config.input[value]].description : this.props.config.input[value]
        this.setState({
            inputValue: value,
            zIndex: z
        })
    }
    //选择输出数据
    onChange(e) {
        this.setState({
            loading: true
        })
        let arr = []
        arr.push(e.target.value)
        this.setState({
            outputValue: arr
        })
        setTimeout(() => {
            this.search()
        }, 500)
    }
    //选择时间间隔
    SelectTimeSpace(value) {
        this.setState({
            timeSpace: value
        })
    }
    //选择时间范围
    timeChange(timeArr) {
        let timeFrom = moment(timeArr[0]).format(TIME_FORMAT)
        let timeTo = moment(timeArr[1]).format(TIME_FORMAT)
        this.setState({
            timeFrom: timeFrom,
            timeTo: timeTo
        })
    }
    //分析数据
    search() {
        this.setState({
            loading: true
        })
        let xName = this.props.config.input ? (this.state.ChineseData[this.props.config.input[this.state.inputValue]] == undefined ? undefined : this.state.ChineseData[this.props.config.input[this.state.inputValue]].description) : ''
        if (xName == undefined) {
            xName = this.props.config.input[this.state.inputValue]
        }
        this.setState({
            xName: xName
        })
        if (this.props.config.inputType && this.props.config.inputType == "equation") {
            let pointList = []
            this.props.config.input.map((key, index) => {
                pointList.push(this.props.config.input[index])
            })
            let equation = this.props.config.inputEquation
            equation = equation.replace(/\"/g, "'");
            if (this.props.config.output) {
                this.state.outputValue.map((item, index) => {
                    return (
                        pointList.push(this.props.config.output[item])
                    )
                })
            }
            http.post('/pointCalculation/calHistory', {
                pointNameList: pointList,
                timeFrom: this.state.timeFrom,
                timeTo: this.state.timeTo,
                period: this.state.timeSpace,
                equation: equation
            }).then(
                data => {
                    if (data.err) {
                        this.setState({
                            loading: false
                        })
                        Modal.warning({
                            title: '数据请求失败！',
                            content: (
                                <div>
                                    <p>请查看配置是否有误</p>
                                </div>
                            )
                        })
                    }
                    if (data.map) {
                        let timeArr = data.time;
                        let xAxis = data.map[equation]
                        let YAxis = []
                        let Data = []
                        if (this.state.outputValue) {
                            for (let i = 0; i < this.state.outputValue.length; i++) {
                                YAxis.push(data.map[this.props.config.output[this.state.outputValue[i]]])
                            }
                        }
                        if (YAxis != []) {
                            for (let i = 0; i < YAxis.length; i++) {
                                Data.push(xAxis.map((key, index) => [String(key), YAxis[i][index], timeArr[index]]))
                            }
                        }
                        let xname = []
                        xname = xAxis.filter(function (element, index, self) {
                            return self.indexOf(element) === index;
                        });
                        this.setState({
                            data: Data,
                            loading: false,
                            chartData: data,
                            xname: xname
                        })
                        this.filterData()
                    }
                }
            )
        } else {
            let pointList = [];
            if (this.props.config.input) {
                pointList[0] = this.props.config.input[this.state.inputValue]
            }
            if (this.props.config.output) {
                pointList[1] = this.props.config.output[this.state.outputValue]
            }
            if (this.props.config.classify && this.props.config.classify.pointName) {
                pointList.push(this.props.config.classify.pointName)
            }
            http.post('/get_history_data_padded', {
                pointList: pointList,
                timeStart: this.state.timeFrom,
                timeEnd: this.state.timeTo,
                timeFormat: this.state.timeSpace
            }).then(
                data => {
                    if (data.err) {
                        this.setState({
                            loading: false
                        })
                        Modal.warning({
                            title: '数据请求失败！',
                            content: (
                                <div>
                                    <p>请查看后台配置</p>
                                </div>
                            )
                        })
                    }
                    if (data.error) {
                        this.setState({
                            loading: false
                        })
                        Modal.warning({
                            title: '分析数据失败！',
                            content: (
                                <div>
                                    <p>{data.msg}</p>
                                </div>
                            )
                        }
                        )
                    } else {
                        if (data.map) {
                            let timeArr = data.time;
                            let xAxis = data.map[pointList[0]]
                            let YAxis = data.map[pointList[1]]
                            let Data = []
                            let ZAxis = []
                            if (this.props.config.classify && this.props.config.classify.pointName) {
                                ZAxis = [...new Set(data.map[pointList[pointList.length - 1]])]
                                ZAxis.map((key1, index1) => {
                                    Data.push(xAxis.map((key2, index2) => {
                                        if (key1 == data.map[pointList[pointList.length - 1]][index2]) {
                                            if (this.props.config.filter && this.props.config.filter[this.state.outputValue[0]] && this.props.config.filter[this.state.outputValue[0]].max && this.props.config.filter[this.state.outputValue[0]].min) {
                                                if (this.props.config.filter[this.state.outputValue[0]].max > YAxis[index2] && this.props.config.filter[this.state.outputValue[0]].min < YAxis[index2]) {
                                                    return [key2, YAxis[index2], timeArr[index2]]
                                                } else {
                                                    return [key2, '', timeArr[index2]]
                                                }
                                            } else {
                                                return [key2, YAxis[index2], timeArr[index2]]
                                            }

                                        }
                                    }))
                                })
                            } else {
                                Data.push(xAxis.map((key, index) => [key, YAxis[index], timeArr[index]]))
                            }

                            this.setState({
                                data: Data,
                                loading: false,
                                chartData: data,
                                ZAxis: ZAxis
                            })
                            this.filterData()
                        }
                    }

                }
            ).catch(
                err => {

                }
            )
        }

    }
    //过滤数据
    filterData() {
        let data = this.state.data
        let data2 = []
        if (this.props.config.classify && this.props.config.classify.pointName) {

        } else {
            data2 = data.map((item, index) => {
                if (this.props.config.filter && this.props.config.filter[this.state.outputValue[index]] && this.props.config.filter[this.state.outputValue[index]].max && this.props.config.filter[this.state.outputValue[index]].min) {
                    return item.map((item2, index2) => {
                        if (this.props.config.filter[this.state.outputValue[index]].max > item2[1] && this.props.config.filter[this.state.outputValue[index]].min < item2[1]) {
                            return item2
                        } else {
                            return [item2[0], '', item2[2]]
                        }
                    })
                } else {
                    return item
                }
            })
            this.setState({
                data: data2
            })
        }

    }
    //下载数据
    load() {
        //接口请求返回的数据对象
        const data = this.state.chartData;
        //判断，如果data里的time是空，则判断为没有历史数据，则不进行下载并提示
        if (data.time.length === 0) {
            Modal.error({
                title: '信息提示',
                content: '历史数据为空，无法导出表格',
            });
            return
        }

        let pointList = []
        let reportName = '数据分析'
        let pointData = []
        let timeData = data.time

        Object.keys(data.map).map(item => {
            pointList.push(item)
        })

        pointData = timeData.map((item, row) => {
            let line = {}
            line['key'] = row
            pointList.forEach((pitem, i) => {
                if (data.map[pitem].length === 0) {
                    line[pitem] = ''
                } else {
                    line[pitem] = data.map[pitem][row]
                }
            })
            return line
        })

        console.info(pointList, reportName, timeData, pointData);

        http.post('/reportTool/genExcelReportByTableData', {
            reportName: reportName,
            strStartTime: this.state.timeFrom,
            strEndTime: this.state.timeTo,
            headerList: pointList,　 //表头用的点名
            tableDataList: pointData,
            timeList: timeData,
            pointList: pointList
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

    // echart option
    getChartOption() {
        let tip
        let name = []
        let data = this.state.data
        let series = []
        let ZAxis = this.state.ZAxis
        series = data.map((item, index) => {
            // tip = this.state.ChineseData[this.props.config.output[this.state.outputValue[0]]]?this.state.ChineseData[this.props.config.output[this.state.outputValue[0]]].description:''
            if (this.props.config.classify && this.props.config.classify.classifyList) {
                this.props.config.classify.classifyList.map((key, index2) => {
                    if (ZAxis[index] == this.props.config.classify.classifyList[index2].value) {
                        // tip = tip + '-' + this.props.config.classify.classifyList[index2].name
                        tip = this.props.config.classify.classifyList[index2].name
                    }
                })
            }
            name.push(tip)
            let avg = 0
            let avgArr = []
            item.map((item2, index) => {
                if (item2 && item2[1] != '' && item2[1] != undefined && item2[1] != null) {
                    avgArr.push(item2[1])
                }
            })
            for (let i = 0; i < avgArr.length; i++) {
                avg += avgArr[i]
            }
            avg = Number(avg / avgArr.length).toFixed(3)
            if (this.props.config && this.props.config.avgLineColor) {
                return ({
                    name: tip,
                    data: item,
                    type: 'scatter',
                    symbolSize: 10,
                    markLine: {
                        symbol: "none",
                        data: [{
                            name: '平均线',
                            yAxis: avg,
                            itemStyle: {
                                normal: {
                                    lineStyle: {
                                        type: 'dashed',
                                        color: 'black',
                                        opacity: 1,
                                    },
                                    label: {
                                        show: true,
                                        position: 'end',
                                        color: 'black'
                                    }
                                }
                            }
                        }]
                    }
                })
            } else {
                return ({
                    name: tip,
                    data: item,
                    type: 'scatter',
                    symbolSize: 10
                })
            }
        })
        let xAxisName = this.props.config.input && this.state.ChineseData[this.props.config.input[this.state.inputValue]] ? this.state.ChineseData[this.props.config.input[this.state.inputValue]].description : '';
        if (xAxisName == '') {
            xAxisName = this.props.config.input ? this.props.config.input[this.state.inputValue] : ''
        }
        let yAxisName = this.props.config.output && this.state.ChineseData[this.props.config.output[this.state.outputValue]] ? this.state.ChineseData[this.props.config.output[this.state.outputValue]].description : '';
        if (yAxisName == '') {
            yAxisName = this.props.config.output ? this.props.config.output[this.state.outputValue] : ''
        }
        return {
            backgroundColor: this.props.config.transparent && this.props.config.transparent == 'true' ? 'rgba(0,0,0,0)' : '#FFFFFF',
            color: this.props.config && this.props.config.barColor ? this.props.config.barColor : [
                "#0094E6",
                "#00D6B9",
                "#FFBA6B",
                "#FF1493",
                "#9400D3",
                "#483D8B",
                "#FFFF00",
                "#98FB98",
                "#2F4F4F",
            ],
            xAxis: [{
                //nameLocation:'center'
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                nameTextStyle: {
                    fontSize: 14
                },
                axisLabel: { color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : "black" },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : 'black',
                        width: 1
                    }
                }
            }],
            yAxis: [{
                name: '',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                nameTextStyle: {
                    fontSize: 14
                },
                axisLabel: { color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : "black" },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : 'black',
                        width: 1
                    }
                },
            }],
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            legend: {
                top: 10,
                data: name,
                textStyle: {
                    fontSize: 13,
                    color: this.props.config && this.props.config.titleColor ? this.props.config.titleColor : 'black'
                },
                itemWidth: 13,
            },
            //区域放大功能，放大和撤销按钮
            // toolbox: {
            //     show:true,
            //     right: '3%',
            //     feature: {
            //         dataZoom: {
            //             yAxisIndex: "none",
            //             brushStyle: {}
            //         }
            //     }
            // },
            tooltip: {
                formatter: function (obj) {
                    var value = obj.value;
                    return '<div>'
                        + '</div>'
                        + xAxisName + " : " + value[0] + '<br>'
                        + yAxisName + " : " + value[1] + '<br>'
                        + '时间 : ' + value[2] + '<br>';
                }
            },
            series: series
        }

    }
    getChartOption2() {
        let tip
        let data = this.state.data
        let xname = this.state.xname
        let series = []

        if (this.props.config.toZn) {
            xname = xname.map((item, index) => {
                let zn = ''
                item = String(item)
                for (let i = 1; i <= item.length; i++) {
                    if (item[item.length - i] == 1) {
                        zn = this.props.config.toZn[this.props.config.toZn.length - i] + zn
                    }
                }
                return zn
            })
        }

        series = data.map((item, index) => {
            if (this.props.config.toZn) {
                item = item.map((itemZn, index) => {
                    this.state.xname.forEach((itemXn, index) => {
                        if (itemXn == itemZn[0]) {
                            itemZn[0] = xname[index]
                        }
                    })
                    return itemZn
                })
            }
            tip = this.state.ChineseData[this.props.config.output[this.state.outputValue[index]]] ? this.state.ChineseData[this.props.config.output[this.state.outputValue[index]]].description : ''
            return ({
                name: tip,
                data: item,
                type: 'scatter',
                symbolSize: 10
            }

            )
        })
        let xName, yName;
        let name = [];
        name = this.state.outputValue.map((item, index) => {
            yName = this.state.ChineseData[this.props.config.output[item]] ? this.state.ChineseData[this.props.config.output[item]].description : ''
            return yName

        })
        xName = this.props.config.inputEquationName
        return {
            backgroundColor: this.props.config.transparent && this.props.config.transparent == 'true' ? 'rgba(0,0,0,0)' : '#FFFFFF',
            color: this.props.config && this.props.config.barColor ? this.props.config.barColor : [
                "#0094E6",
                "#00D6B9",
                "#FFBA6B",
                "#FF1493",
                "#9400D3",
                "#483D8B",
                "#FFFF00",
                "#98FB98",
                "#2F4F4F",
            ],
            xAxis: [{
                name: xName,
                //nameLocation:'center'
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                nameTextStyle: {
                    fontSize: 14
                },
                type: 'category',
                data: xname,
                axisLabel: { color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : "black" },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : 'black',
                        width: 1
                    }
                },
            }],
            yAxis: [{
                name: '',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                nameTextStyle: {
                    fontSize: 14
                },
                axisLabel: { color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : "black" },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: this.props.config && this.props.config.labelColor ? this.props.config.labelColor : 'black',
                        width: 1
                    }
                },
            }],
            legend: {
                top: 10,
                data: name,
                textStyle: {
                    fontSize: 14,
                    color: this.props.config && this.props.config.titleColor ? this.props.config.titleColor : 'black'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            // toolbox: {
            //     right: '4%',
            //     feature: {
            //         dataZoom: {}
            //     }
            // },
            tooltip: {
                formatter: function (obj) {
                    var value = obj.value;
                    return '<div>'
                        + '</div>'
                        + xName + " : " + value[0] + '<br>'
                        + obj.seriesName + " : " + value[1] + '<br>'
                        + '时间 : ' + value[2] + '<br>';
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

    render() {
        let config = this.props.config
        let flag = config.input != undefined
        let flag2 = config.output != undefined
        let option = flag ? config : [];
        let option2 = flag2 ? config : [];
        let uoption;
        let uoption2;

        if (this.props.config.inputType && this.props.config.inputType == "equation") {
            uoption = '';
        } else {
            if (flag && option.input.length != 0) {
                uoption = option.input.map((item, index) => {
                    item = this.state.ChineseData[item] && this.state.ChineseData[item].description != "" ? this.state.ChineseData[item].description : item
                    return (<Option id={index + ''} value={index}>{item}</Option>)
                })
            } else {
                uoption = function () { return (<Option>未读取到配置信息</Option>) };
            }
        }
        if (flag2 && option.output.length != 0) {
            uoption2 = option2.output.map((item, index) => {
                item = this.state.ChineseData[item] && this.state.ChineseData[item].description != "" ? this.state.ChineseData[item].description : item

                return (
                    <div className={s['checkbox']}>
                        <RadioButton style={{ backgroundColor: 'RGB(27,36,49)' }} value={index}>{item}</RadioButton>
                    </div>

                )


            })
        } else {
            uoption2 = function () { return (<Checkbox>未读取到配置信息</Checkbox>) };
        }

        return (
            <div>
                <div style={{ marginTop: "10px", marginLeft: '5px' }}>
                    <div className={s['input']} style={{ color: this.props.config && this.props.config.titleColor ? this.props.config.titleColor : 'black' }}>X轴：</div>
                    <div className={s['in']} style={{ marginRight: '5px' }}>
                        <Select size='small' id="se" value={this.props.config.inputType && this.props.config.inputType == "equation" ? this.props.config.inputEquationName : this.state.zIndex} style={{ width: 140, marginLeft: '-5px', fontSize: 12 }} onSelect={this.handleSelect}>
                            {uoption}
                        </Select>
                    </div>
                    <div className={s['space']} style={{ color: this.props.config && this.props.config.titleColor ? this.props.config.titleColor : 'black' }}>密度：</div>
                    <div className={s['in']}>
                        <Select size='small' style={{ width: 65, fontSize: 12 }} defaultValue={config.period ? config.period : 'd1'} onChange={this.SelectTimeSpace}>
                            <Option value="m1">1分钟</Option>
                            <Option value="h1">1小时</Option>
                            <Option value="d1">1天</Option>
                        </Select>
                    </div>
                    <div className={s['in']}>
                        <RangePicker
                            size='small'
                            allowClear={false}
                            value={[moment(this.state.timeFrom), moment(this.state.timeTo)]}
                            format="YYYY-MM-DD"
                            placeholder={['开始时间', '结束时间']}
                            style={{
                                marginLeft: 5, width: 200, fontSize: 12
                            }}
                            onChange={this.timeChange}
                        />
                    </div>
                    <div className={s['in']}>
                        <Button style={{ marginLeft: "5px", paddingLeft: 4, paddingRight: 4, fontSize: 12, height: 24 }} onClick={this.search}>分析</Button>
                        {/* <Button style={{marginLeft:"10px"}} onClick={this.filterData}>过滤</Button> */}
                        <Button style={{ marginLeft: "5px", paddingLeft: 4, paddingRight: 4, fontSize: 12, height: 24, display: this.props.config && this.props.config.downLoadDisabled && this.props.config.downLoadDisabled == 'true' ? 'none' : 'inline-block' }} onClick={this.load}>下载</Button>
                    </div>
                    <br />
                    <div style={{ top: 44, position: 'absolute' }}>
                        <div className={s['output']} style={{ color: this.props.config && this.props.config.titleColor ? this.props.config.titleColor : 'black' }}>Y轴：</div>
                        <div className={s['in']}>
                            <RadioGroup name="radiogroup" onChange={this.onChange} defaultValue={0} size="small">
                                {uoption2}
                            </RadioGroup>
                        </div>

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
                                option={this.props.config.inputType && this.props.config.inputType == "equation" ? this.getChartOption2() : this.getChartOption()}
                                className="relationView"
                                theme="white"
                                notMerge={true}
                            />
                    }
                </div>
            </div>
        )
    }
}


//const efficiencyChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class RelationViewComponent extends Widget {

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
            <div style={style} id={this.props.config.id} className={s['container']} >
                <FormWrap

                    {...this.props}

                />
            </div>
        )
    }
}

export default RelationViewComponent


