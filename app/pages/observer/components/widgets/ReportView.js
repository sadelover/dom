import React, { Component } from 'react'
import { Table, Form, Select, DatePicker, Button, Switch, message, Modal, Spin } from 'antd'
import s from './TableComponent.css'
import { modalTypes } from '../../../../common/enum';
import http from '../../../../common/http';
import moment from 'moment';
import WORD_DOWNLOAD_TEMPLATE from './downloadTemplates/word.html';
import Widget from './Widget.js';
import { downloadUrl } from '../../../../common/utils'

const registerInformation = {
    type: 'report',
    name: '测试组件',
    description: "生成table组件，覆盖canvas对应区域",
}

function disabledDate(current) {
    // Can not select days before today and today
    return current && current.valueOf() >= Date.now();
}

const formItemLayout = {
    labelCol: {
        xs: { span: 8 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
    },
};



const FormItem = Form.Item;


const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
const getTimeRange = function (period, span, getHistoryData) {
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
        case 'yesterday':
            startTime = moment().subtract(1, 'day');
            endTime = moment();
            break;
        case 'thismonth':
            startTime = moment().startOf('month').format(TIME_FORMAT);
            endTime = moment().endOf('month').add(1,'hours').format(TIME_FORMAT);
            break;
    }
    window.localStorage.setItem('reportRange', JSON.stringify({
        startTime,
        endTime
    }));
    window.localStorage.setItem('reportSpan', JSON.stringify({
        span
    }));

    getHistoryData(startTime, endTime, span)

    return [startTime, endTime];
}

class ReportView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            style: {},
            headerHeight: 0,
            columns: [],
            dataSource: [],
            pointvalue: [],
            reportType: true, //0是传感器值，1是累计量值
            loading: false,
            stTime: "",
            enTime: "",
            timeFormat: "",
            reportLoading: 'none'
        }
        this.tableContainerRef = null

        this.getHistoryData = this.getHistoryData.bind(this);
        this._renderTable = this._renderTable.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.getEndTime = this.getEndTime.bind(this);
        this.handleDownLoad = this.handleDownLoad.bind(this);
        this.renderColumns = this.renderColumns.bind(this);
        this.handleCellClick = this.handleCellClick.bind(this);
        this.refreshData = this.refreshData.bind(this);
    }

    antdTableHearder = () => {
        // let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header'))
        let catchedTableHeadStyle = window.getComputedStyle(this.tableContainerRef.querySelector('.ant-table-header') || this.tableContainerRef.querySelector('.ant-table-thead'))

        let headerHeight = parseInt(catchedTableHeadStyle.height)
        this.setState({
            headerHeight: headerHeight
        })
    }

    componentDidMount() {
        // console.log(this.props)
        const { width, height, left, top } = this.props.style
        const { header } = this.props
        let defaultTimeRange = this.props.config.defaultTimeRange
        let defaultTimeSpan = this.props.config.defaultTimeSpan
        let timeSpanArr = this.props.config.timeSpanArr != undefined ? this.props.config.timeSpanArr : []
        let pointList = this.props.config.pointList
        let changeEnable = this.props.config.changeEnable
        // 初始化
        let columns = []
        header.forEach((col, key) => {
            if (key != 0) {
                if (changeEnable) {
                    columns.push({
                        title: col,
                        dataIndex: pointList[key - 1],
                        key: key,
                        width: 60,
                        render: (text, record) => this.renderColumns(text, record, key)
                    })
                } else {
                    columns.push({
                        title: col,
                        dataIndex: pointList[key - 1],
                        key: key,
                        width: 60,
                    })
                }
            } else {
                columns.push({
                    title: col,
                    dataIndex: col,
                    key: key,
                    width: 80
                })
            }
        })

        if (this.props.config.reportType == 0) {
            this.setState({
                reportType: false
            })
        } else {
            this.setState({
                reportType: true
            })
        }

        //获取报表的时间段，若localStorage里没有则使用组件传来的初始化的时间段
        //第一次在localStorage里存储以后，只要不退出软件清掉reportRange，都选用localStorage里的时间段
        if (!window.localStorage.getItem('reportRange') || !window.localStorage.getItem('reportSpan')||window.localStorage.getItem('reportRange') =="{}") {
            this.props.form.setFieldsValue({
                range: getTimeRange(defaultTimeRange, defaultTimeSpan, this.getHistoryData),
                timeFormat: defaultTimeSpan
            });
        } else {
            let startTime = JSON.parse(localStorage.getItem('reportRange')).startTime;
            let endTime = JSON.parse(localStorage.getItem('reportRange')).endTime;
            //2023-6-1-dora 检测缓存里的间隔是否在配置的timeSpanArr里也有，如果没有，则用defaultTimeSpan；如果有，则用缓存里的
            let span = defaultTimeSpan
            let saveSpan = JSON.parse(localStorage.getItem('reportSpan')).span;
            if (timeSpanArr.length != 0) {
                timeSpanArr.forEach(item => {
                    if (item == saveSpan) {
                        span = saveSpan;
                    }
                })
            }
            //获取历史数据
            this.getHistoryData(startTime, endTime, span);
            //同步时间控件
            this.props.form.setFieldsValue({
                range: [moment(startTime), moment(endTime)],
                timeFormat: span
            });
        }

        this.setState({
            style: {
                width: width,
                height: height,
                left: left,
                top: top
            },
            columns: columns

        });
        //将查询函数放入store里，用来修改值后调用刷新表格
        this.refreshData()

    }

    componentWillReceiveProps(nextProps) {
        if (this.state.style.width !== nextProps.style.width || this.state.style.height !== nextProps.style.height) {
            const { width, height, left, top } = nextProps.style
            this.setState({
                style: {
                    width: width,
                    height: height,
                    left: left,
                    top: top
                }
            })
        }
        // // 判断两个数组内容是否相等
        // if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(nextProps.pointvalue)){
        //     this._renderTable(nextProps)
        // }
    }

    handleCellClick = (text, record, column) => {
        const { showModal } = this.props
        let config = this.props.config
        let header = config.header
        let pointList = config.pointList
        //得到被选点的时间、当前值、点名
        let pointTime = record['时间']
        let pointName = pointList[Number(column) - 1]
        let pointValue = text
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if (config.displayDelta && values.timeFormat == 'd1') {
                pointTime = moment(pointTime).add(config.displayDelta, 'd').format('YYYY-MM-DD 00:00:00')
            } else if (config.displayDelta && values.timeFormat == 'M1') {
                pointTime = moment(pointTime).add(config.displayDelta, 'month').format('YYYY-MM')
            }
        })
        // config.readonly true or false?
        //if(config.readonly) return false
        showModal(modalTypes.REPORT_CELL_MODAL, {
            pointTime,
            pointName,
            pointValue,
        })
    }


    // 渲染列
    renderColumns(text, record, column) {
        return (
            <a
                href="javascript:void(0)"
                style={{ textDecoration: "none", height: "20px" }}
                className={s['cell']}
                onClick={(e) => { this.handleCellClick(text, record, column) }}
            >{text}</a>
        )
    }

    refreshData() {
        this.props.refreshReportFun(this.onSearch)
    }

    onSearch() {
        let startTime, endTime, span
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.getHistoryData(
                values.range[0].format(TIME_FORMAT),
                values.range[1].format(TIME_FORMAT),
                values.timeFormat
            );
            startTime = values.range[0].format(TIME_FORMAT),
                endTime = values.range[1].format(TIME_FORMAT),
                span = values.timeFormat
        });
        //保存到localStorage中，以便下次切换页面时时间段不变
        window.localStorage.setItem('reportRange', JSON.stringify({
            startTime,
            endTime
        }));
        window.localStorage.setItem('reportSpan', JSON.stringify({
            span
        }));

    }

    //根据不同时间间隔处理开始时间
    getEndTime(timeStart, timeFormat) {
        let timeEndData
        switch (timeFormat) {
            case 'm1':
                timeEndData = moment(timeStart).add(1, 'minute');
                break;
            case 'm5':
                timeEndData = moment(timeStart).add(5, 'minute');
                break;
            case 'h1':
                timeEndData = moment(timeStart).add(1, 'hour');
                break;
            case 'd1':
                timeEndData = moment(timeStart).add(1, 'day');
                break;
            case 'M1':
                timeEndData = moment(timeStart).add(1, 'month');
                break;
        }
        return timeEndData.format(TIME_FORMAT)
    }

    //请求历史数据
    getHistoryData(timeStart, timeEnd, timeFormat) {
        if (moment(timeStart).isAfter(moment())) {
            Modal.warning({
                title: '信息提示',
                content: '查询时间不支持!',
            });
            return
        }
        //加载中……
        this.setState({
            loading: true
        });

        var pointList = [].concat(this.props.config.pointList);
        let timeEndData, timeStartData

        if (moment(timeEnd).isAfter(moment())) {
            timeEndData = moment()
        } else {
            timeEndData = timeEnd
        }

        //若累积量模式，则需往后面多请求一个时间点，方便求差
        if (this.props.config.reportType != 0) {
            timeEndData = this.getEndTime(timeEndData, timeFormat)
            //如果有scale定义里的type是point，则需请求里加上value的电价点名
            if (this.props.config.scale && this.props.config.scale.type === "point") {
                pointList.push(this.props.config.scale.value)
            }
        } else {
            timeEndData = moment(timeEndData).format(TIME_FORMAT)
        }

        this.setState({
            stTime: moment(timeStart).format(TIME_FORMAT),
            enTime: timeEndData,
            timeFormat: timeFormat
        })
        if (this.props.config.coreURL) {
            fetch('http://' + this.props.config.coreURL + '/get_history_data_padded', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pointList: pointList,
                    timeStart: moment(timeStart).format(TIME_FORMAT),
                    timeEnd: timeEndData,
                    timeFormat: timeFormat
                })
            }).then(
                res => {
                    res.json().then(
                        data => {
                            if (data.error) {
                                message.error(data.msg);
                                this.setState({ loading: false });
                            } else {
                                if (data.time.length != 0) {
                                    this._renderTable(data)
                                } else {
                                    let dataSource = []
                                    this.setState({
                                        dataSource: dataSource,
                                        loading: false
                                    })
                                }
                            }
                        }
                    ).catch(
                        error => {
                            message.error('网络通讯失败！');
                            let dataSource = []
                            this.setState({
                                dataSource: dataSource,
                                loading: false
                            })
                        }
                    )
                }
            )
        } else {
            http.post('/get_history_data_padded', {
                pointList: pointList,
                timeStart: moment(timeStart).format(TIME_FORMAT),
                timeEnd: timeEndData,
                timeFormat: timeFormat
            }).then(
                data => {
                    if (data.error) {
                        message.error(data.msg);
                        this.setState({ loading: false });
                    } else {
                        if (data.time.length != 0) {
                            this._renderTable(data)
                        } else {
                            let dataSource = []
                            this.setState({
                                dataSource: dataSource,
                                loading: false
                            })
                        }
                    }
                }
            ).catch(
                error => {
                    message.error('网络通讯失败！');
                    let dataSource = []
                    this.setState({
                        dataSource: dataSource,
                        loading: false
                    })
                }
            )
        }
    }

    // 生成数据
    _renderTable = (data) => {
        let pointList = this.props.config.pointList
        let changeEnable = this.props.config.changeEnable
        let enableSummarize = this.props.config.enableSummarize
        let dataSource = []
        let pointData = []
        let timeData = []
        if (enableSummarize) {
            data.time.push("统计汇总")
            for (var i = 0; i < pointList.length; i++) {
                if (data.map[pointList[i]].length != 0) {
                    let sum = 0
                    data.map[pointList[i]].forEach(item => {
                        sum += Number(item)
                    })
                    if (enableSummarize[i] == "sum") {
                        data.map[pointList[i]].push(sum)
                    } else {
                        data.map[pointList[i]].push((sum / data.map[pointList[i]].length).toFixed(3))
                    }
                }
            }
        }
        if (changeEnable) {
            for (var i = 0; i < pointList.length; i++) {
                if (data.map[pointList[i]].length == 0) {
                    let pointArr = data.map[pointList[i]]
                    for (var j = 0; j < data.time.length; j++) {
                        pointArr.push(' ');
                    }
                    data.map[pointList[i]] = pointArr;
                }
            }
            dataSource = data.time.map((item, row) => {
                let line = {}
                line['key'] = row
                pointList.forEach((pitem, i) => {
                    if (this.props.config.decimal && this.props.config.decimal != undefined) {
                        line[pitem] = Number(data.map[pitem][row]).toFixed(Number(this.props.config.decimal))
                    } else {
                        line[pitem] = data.map[pitem][row]
                    }
                    //显示Factory里配置valueType的点值映射
                    if (this.props.config.valueType) {
                        for (var key in this.props.config.valueType[i]) {
                            if (parseInt(key) === parseInt(data.map[pitem][row])) {
                                line[pitem] = this.props.config.valueType[i][key]
                            }
                        }
                    }
                })
                switch (this.state.timeFormat) {
                    case 'm1':
                        line["时间"] = moment(item).format("YYYY-MM-DD HH:mm:00")
                        break;
                    case 'm5':
                        line["时间"] = moment(item).format("YYYY-MM-DD HH:mm:00")
                        break;
                    case 'h1':
                        line["时间"] = moment(item).format("YYYY-MM-DD HH:00:00");
                        break;
                    case 'd1':
                        line["时间"] = moment(item).format("YYYY-MM-DD 00:00:00");
                        break;
                    case 'M1':
                        line["时间"] = moment(item).format("YYYY-MM-DD 00:00:00");
                        break;
                }
                return line
            })


            //抽出所有点值，便于下载传值
            pointData = dataSource.map((item, row) => {
                let line = {}
                line['key'] = row
                pointList.forEach((pitem, i) => {
                    line[pitem] = item[pitem]
                })
                return line
            })
            //抽出所有时间，便于下载传值
            timeData = dataSource.map((item, row) => {
                return item['时间']
            })


        } else {
            //累计量值
            if (this.state.reportType) {
                let scaleNum = 1
                //默认保留一位小数点
                let decimal = 1
                if (this.props.config.scale) {
                    //如果type是常数，就乘以value里的常数值
                    if (this.props.config.scale.type === "const") {
                        scaleNum = Number(this.props.config.scale.value)
                        if (this.props.config.decimal != undefined) {
                            decimal = Number(this.props.config.decimal)
                        }
                        for (var i = 0; i < data.time.length - 1; i++) {
                            let line = {}
                            line['key'] = i;
                            pointList.forEach((pitem, j) => {
                                if (data.map[pitem][i + 1] === undefined || data.map[pitem][i] === undefined) {
                                    line[pitem] = ''
                                } else {
                                    line[pitem] = ((parseFloat(data.map[pitem][i + 1] - data.map[pitem][i])) * scaleNum).toFixed(decimal)
                                }
                            })
                            switch (this.state.timeFormat) {
                                case 'm1':
                                    line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm")
                                    break;
                                case 'm5':
                                    line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm")
                                    break;
                                case 'h1':
                                    line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH");
                                    break;
                                case 'd1':
                                    line["时间"] = moment(data.time[i]).format("YYYY-MM-DD");
                                    break;
                                case 'M1':
                                    line["时间"] = moment(data.time[i]).format("YYYY-MM-DD");
                                    break;
                            }
                            dataSource.push(line);
                        }
                    } else {
                        //如果scale定义里的type是point，那么每个时段的报表值 = 累积量时刻差值*该point在7:00-7:59的最后一个时刻值，如果该点历史值缺失的话，认为=1.
                        if (this.props.config.scale.type === "point" && this.props.config.scale.value) {
                            let value = this.props.config.scale.value
                            for (var i = 0; i < data.time.length - 1; i++) {
                                let line = {}
                                line['key'] = i;
                                pointList.forEach((pitem, j) => {
                                    if (data.map[pitem][i + 1] === undefined || data.map[pitem][i] === undefined) {
                                        line[pitem] = ''
                                    } else {
                                        if (data.map[value][i] != undefined) {
                                            scaleNum = parseInt(data.map[value][i])
                                        } else {
                                            scaleNum = 1
                                        }
                                        line[pitem] = ((parseFloat(data.map[pitem][i + 1] - data.map[pitem][i])) * scaleNum).toFixed(decimal)
                                    }
                                })
                                switch (this.state.timeFormat) {
                                    case 'm1':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm")
                                        break;
                                    case 'm5':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm")
                                        break;
                                    case 'h1':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH");
                                        break;
                                    case 'd1':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD");
                                        break;
                                    case 'M1':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD");
                                        break;
                                }
                                dataSource.push(line);
                            }
                        } else {
                            for (var i = 0; i < data.time.length - 1; i++) {
                                let line = {}
                                line['key'] = i;
                                pointList.forEach((pitem, j) => {
                                    if (data.map[pitem][i + 1] === undefined || data.map[pitem][i] === undefined) {
                                        line[pitem] = ''
                                    } else {
                                        line[pitem] = ((parseFloat(data.map[pitem][i + 1] - data.map[pitem][i])) * scaleNum).toFixed(decimal)
                                    }
                                })
                                switch (this.state.timeFormat) {
                                    case 'm1':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm")
                                        break;
                                    case 'm5':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm")
                                        break;
                                    case 'h1':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH");
                                        break;
                                    case 'd1':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD");
                                        break;
                                    case 'M1':
                                        line["时间"] = moment(data.time[i]).format("YYYY-MM-DD");
                                        break;
                                }
                                dataSource.push(line);
                            }
                        }
                    }

                } else {
                    if (this.props.config.decimal != undefined) {
                        decimal = Number(this.props.config.decimal)
                    }
                    for (var i = 0; i < data.time.length - 1; i++) {
                        let line = {}
                        line['key'] = i;
                        pointList.forEach((pitem, j) => {
                            if (data.map[pitem][i + 1] === undefined || data.map[pitem][i] === undefined) {
                                line[pitem] = ''
                            } else {
                                line[pitem] = ((parseFloat(data.map[pitem][i + 1] - data.map[pitem][i])) * scaleNum).toFixed(decimal)
                            }
                        })
                        switch (this.state.timeFormat) {
                            case 'm1':
                                line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm")
                                break;
                            case 'm5':
                                line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH:mm")
                                break;
                            case 'h1':
                                line["时间"] = moment(data.time[i]).format("YYYY-MM-DD HH");
                                break;
                            case 'd1':
                                line["时间"] = moment(data.time[i]).format("YYYY-MM-DD");
                                break;
                            case 'M1':
                                line["时间"] = moment(data.time[i]).format("YYYY-MM-DD");
                                break;
                        }
                        dataSource.push(line);
                    }
                }

                //如果有丢失的数据，需根据索引值将与之有关的的所有值清空（一天为空，当天和前一天为空）
                if (data.lostTime && data.lostTime.length != 0) {
                    data.lostTime.forEach((row, r) => {
                        if (parseInt(row) === dataSource.length) {
                            pointList.forEach((pitem, i) => {
                                dataSource[row - 1][pitem] = '';
                            })
                        } else {
                            pointList.forEach((pitem, i) => {
                                dataSource[row][pitem] = '';
                                if (parseInt(row) != 0) {
                                    dataSource[row - 1][pitem] = '';
                                }
                            })
                        }
                    })
                }

                //抽出所有点值，便于下载传值
                pointData = dataSource.map((item, row) => {
                    let line = {}
                    line['key'] = row
                    pointList.forEach((pitem, i) => {
                        line[pitem] = item[pitem]
                    })
                    return line
                })
                //抽出所有时间，便于下载传值
                timeData = dataSource.map((item, row) => {
                    return item['时间']
                })


            } else {
                //传感器值
                dataSource = data.time.map((item, row) => {
                    let line = {}
                    line['key'] = row
                    pointList.forEach((pitem, i) => {
                        //如果返回的是空数组，要将undefined显示为空
                        if (data.map[pitem][row] === undefined) {
                            line[pitem] = ''
                        } else
                        //有返回数据时，直接显示
                        {
                            if (this.props.config.decimal) {
                                line[pitem] = Number(data.map[pitem][row]).toFixed(this.props.config.decimal)
                            } else {
                                if (data.map[pitem][row] >= 1000) {
                                    line[pitem] = Number(data.map[pitem][row]).toFixed(0)
                                } else if (data.map[pitem][row] < 1000 && data.map[pitem][row] >= 10) {
                                    line[pitem] = Number(data.map[pitem][row]).toFixed(1)
                                } else if (data.map[pitem][row] < 10 && data.map[pitem][row] >= 1) {
                                    line[pitem] = Number(data.map[pitem][row]).toFixed(2)
                                } else if (data.map[pitem][row] < 1 && data.map[pitem][row] > 0) {
                                    line[pitem] = Number(data.map[pitem][row]).toFixed(3)
                                } else if (data.map[pitem][row] == 0) {
                                    line[pitem] = Number(data.map[pitem][row]).toFixed(0)
                                } else {
                                    line[pitem] = Number(data.map[pitem][row]).toPrecision(4)
                                }
                            }

                            //显示Factory里配置valueType的点值映射
                            if (this.props.config.valueType) {
                                for (var key in this.props.config.valueType[i]) {
                                    if (parseInt(key) === parseInt(data.map[pitem][row])) {
                                        line[pitem] = this.props.config.valueType[i][key]
                                    }
                                }
                            }
                        }

                    })

                    switch (this.state.timeFormat) {
                        case 'm1':
                            line["时间"] = moment(item).format("YYYY-MM-DD HH:mm")
                            break;
                        case 'm5':
                            line["时间"] = moment(item).format("YYYY-MM-DD HH:mm")
                            break;
                        case 'h1':
                            line["时间"] = moment(item).format("YYYY-MM-DD HH");
                            break;
                        case 'd1':
                            line["时间"] = moment(item).format("YYYY-MM-DD");
                            break;
                        case 'M1':
                            line["时间"] = moment(item).format("YYYY-MM-DD");
                            break;
                    }
                    return line
                })
                //如果有丢失的数据，需根据索引值将对应行的所有值清空
                if (data.lostTime && data.lostTime.length != 0) {
                    data.lostTime.forEach((row, r) => {
                        pointList.forEach((pitem, i) => {
                            dataSource[row][pitem] = ''
                        })
                    })
                }


                //抽出所有点值，便于下载传值
                pointData = dataSource.map((item, row) => {
                    let line = {}
                    line['key'] = row
                    pointList.forEach((pitem, i) => {
                        line[pitem] = item[pitem]
                    })
                    return line
                })
                //抽出所有时间，便于下载传值
                timeData = dataSource.map((item, row) => {
                    return item['时间']
                })
            }
        }
        if (this.props.config.displayDelta && this.props.config.displayDelta != '' && this.props.config.displayDelta != undefined && JSON.parse(localStorage.getItem('reportSpan')).span == 'd1') {
            dataSource.map(item => {
                item['时间'] = moment(item['时间']).subtract(this.props.config.displayDelta, 'days').format('YYYY-MM-DD')
            })
        } else if (this.props.config.displayDelta && this.props.config.displayDelta != '' && this.props.config.displayDelta != undefined && JSON.parse(localStorage.getItem('reportSpan')).span == 'M1') {
            dataSource.map(item => {
                item['时间'] = moment(item['时间']).subtract(this.props.config.displayDelta, 'month').format('YYYY-MM')
            })
        }
        if (enableSummarize) {
            dataSource[dataSource.length - 1]['时间'] = '统计汇总'
        }
        this.setState({
            //pointvalue:pointvalue, //保存数据到state上，对比下一次
            dataSource: dataSource,
            pointData: pointData,
            timeData: timeData,
            loading: false
        }, this.antdTableHearder)
    }


    getTableContainerRef = (ref) => {
        this.tableContainerRef = ref
    }

    //生成excel并下载
    handleDownLoad() {
        let pointList = this.props.config.pointList
        let header = this.props.config.header
        let reportName = this.props.config.reportName
        let strStartTime = this.state.stTime
        let strEndTime = this.state.enTime
        let pointData = this.state.pointData
        let timeData = this.state.timeData
        //删除“时间”
        let headerList = header.slice(1)
        let displayDelta = this.props.config.displayDelta ? this.props.config.displayDelta : 0
        console.info(pointList, header, reportName, strStartTime, strEndTime, timeData, pointData);
        this.setState({
            reportLoading: 'block'
        })
        console.info(this.state.reportLoading)
        http.post('/reportTool/genExcelReportByTableData', {
            reportName: reportName,
            strStartTime: strStartTime,
            strEndTime: strEndTime,
            headerList: headerList,
            tableDataList: pointData,
            timeList: timeData,
            pointList: pointList,
            displayDelta: displayDelta
        }).then(
            data => {
                this.setState({
                    reportLoading: 'none'
                })
                if (data.err === 0) {
                    downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
                }
                if (status === false) {
                    message.error('生成下载文件失败')
                }
                if (data.err > 0) {
                    Modal.warning({
                        title: '信息提示',
                        content: data.msg,
                    });
                }
            }
        )
    }

    Options = () => {
        let timeSpan = this.props.config.timeSpanArr
        if (timeSpan && timeSpan.length != 0) {
            return <Select size="small" style={{ width: 70 }}>
                {
                    timeSpan.map(item => {
                        if (item == "m5") {
                            return <Option value="m5">5分钟</Option>
                        } else if (item == "h1") {
                            return <Option value="h1">1小时</Option>
                        } else if (item == "d1") {
                            return <Option value="d1">1天</Option>
                        } else if (item == "M1") {
                            return <Option value="M1">1个月</Option>
                        } else if (item == "m1") {
                            return <Option value="m1">1分钟</Option>
                        }
                    })
                }
            </Select>
        } else {
            return <Select size="small" style={{ width: 70 }}>
                <Option value="m1">1分钟</Option>
                <Option value="m5">5分钟</Option>
                <Option value="h1">1小时</Option>
                <Option value="d1">1天</Option>
                <Option value="M1">1个月</Option>
            </Select>
        }

    }

    getTodyBut = () => {
        let timeSpan = this.props.config.timeSpanArr
        let todayButFlag = false
        if (timeSpan && timeSpan.length != 0) {
            if (timeSpan.indexOf("d1") == -1 && timeSpan.indexOf("M1") == -1) {
                todayButFlag = true;
            }
        }
        if (todayButFlag) {
            return (
                <FormItem>
                    <Button
                        type="primary"
                        size="small"
                        onClick={this.onSearchToday}
                    >
                        当日
                    </Button>
                </FormItem>
            )
        } else {
            return;
        }
    }

    onSearchToday = () => {
        let startTime = moment().startOf('day').format(TIME_FORMAT)
        let endTime = moment().format(TIME_FORMAT)
        this.props.form.setFieldsValue({
            range: [moment(startTime), moment(endTime)]
        });
        this.onSearch();
    }

    render() {
        const { style } = this.state
        const { form } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <div
                className={s['table-container']}
                style={Object.assign(style)}
            >
                <div style={{ textAlign: "center", fontSize: "20px" }} >{this.props.config.reportName}</div>
                <div style={{ width: '100%', height: '100%', textAlign: 'center', marginTop: '30px', display: `${this.state.reportLoading}` }}>
                    <Spin tip="正在读取数据" />
                </div>
                <Form layout='inline'>
                    <FormItem
                        label="取样间隔"
                        style={{
                            marginLeft: '30px'
                        }}
                    >
                        {getFieldDecorator('timeFormat', {
                            initialValue: 'm5'
                        })(
                            this.Options()
                        )}
                    </FormItem>
                    <FormItem
                        label="时间范围"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('range')(
                            <RangePicker size="small" showTime format={TIME_FORMAT} />
                        )}
                    </FormItem>
                    <FormItem>
                        <Button
                            type="primary"
                            size="small"
                            onClick={this.onSearch}
                        >
                            查询
                        </Button>
                    </FormItem>
                    <FormItem>
                        <Button
                            type="primary"
                            size="small"
                            onClick={this.handleDownLoad}
                        >
                            下载
                        </Button>
                    </FormItem>
                    {
                        this.getTodyBut()
                    }
                </Form>
                <div
                    id="reportContainer"
                    ref={this.getTableContainerRef}
                >
                    <Table
                        columns={this.state.columns}
                        dataSource={this.state.dataSource}
                        pagination={false}
                        bordered={localStorage.getItem('serverOmd') == "persagy" ? false : true}
                        loading={this.state.loading}
                        scroll={{
                            y: this.state.style.height - this.state.headerHeight - 50,
                            x: this.state.style.width
                        }}
                    />
                </div>
            </div>
        )
    }
}
const ReportViewModal = Form.create()(ReportView)
// export default ReportViewModal;

class ReportComponent extends Widget {

    constructor(props) {
        super(props)

        this.state = {
            style: {}
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


    getContent() {
        const { style } = this.state
        return (
            <ReportViewModal {...this.props} />
        )
    }
}

export default ReportComponent




