/**
 * 历史曲线页面
 */

import React from 'react';
import { Button, message,Spin,Modal } from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../lib/echarts-themes/dark';
import '../../../lib/echarts-themes/light';
import cx from 'classnames'
import http from '../../../common/http';
import { downloadUrl } from '../../../common/utils';

import ConfigModal from './ConfigModalView';

import s from './ChartView.css';
import moment from 'moment';

let btnStyle,textStyle,themeStyle;
if(localStorage.getItem('serverOmd')=="best"){
    btnStyle={
      background:"#E1E1E1",
      boxShadow:"2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
      border:0,
      color:"#000",
      fontSize:"12px",
      marginLeft:"20px"
    }
    textStyle={
      color:"#000"
    }
}
if(localStorage.getItem('serverOmd')=="persagy"){
  themeStyle = 'light'
  btnStyle={
    background:"rgba(255,255,255,1)",
    border:'1px solid rgba(195,198,203,1)',
    color:"rgba(38,38,38,1)",
    borderRadius:'4px',
    fontSize:"14px",
    fontFamily:'MicrosoftYaHei'
  }
} else {
  themeStyle = 'dark'  
}

class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: this.props.data,
      isShowConfigModal: false,
      loading: false
    };

    this.chart = null;
    this.container = null;

    this.getChartData = this.getChartData.bind(this);
    this.saveChartRef = this.saveChartRef.bind(this);
    this.saveContainerRef = this.saveContainerRef.bind(this);
    this.handleConfigModalSubmit = this.handleConfigModalSubmit.bind(this);
    this.showConfigModal = this.showConfigModal.bind(this);
    this.hideConfigModal = this.hideConfigModal.bind(this);
    this.exportChart = this.exportChart.bind(this);
    this.handleDownLoad = this.handleDownLoad.bind(this);
  }
  static get defaultProps() {
    return {
      points: [],
      data: {
        map: {},
        time: []
      }
    }
  }
  componentDidMount() {
    const {points,timeOptions} = this.props
    this.getChartData(points,timeOptions);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.timeOptions !== nextProps.timeOptions) {
      return this.getChartData(nextProps.points, nextProps.timeOptions);
    }
    let pointNames = this.props.points.map(row => row['name']).sort();
    let nextPointNames = nextProps.points.map(row => row['name']).sort();
    
    if (pointNames.join('') !== nextPointNames.join('')) {
      return this.getChartData(nextProps.points, nextProps.timeOptions);
    }

    // pointNames = null;
    // nextPointNames = null;

  }

  exportChart() {
    downloadUrl(this.chart.getDataURL());
  }

  //生成excel并下载
  handleDownLoad() {
      //接口请求返回的数据对象
      const data = this.state.data;
      //判断，如果data里的time是空，则判断为没有历史数据，则不进行下载并提示
      if (data.time.length === 0) {
        Modal.error({
          title: '信息提示',
          content: '历史数据为空，无法导出表格',
        });
        return
      }
      let pointList = []
      let reportName = '历史数据表格'
      let strStartTime = moment(this.props.timeOptions['timeStart']).format('YYYY-MM-DD HH:mm:00')
      let strEndTime = moment(this.props.timeOptions['timeEnd']).format('YYYY-MM-DD HH:mm:00')
      let pointData = []
      let timeData = data.time
      let headerList = []
      
      this.props.points.forEach(point=>{
        Object.keys(data.map).map(item=>{
          if (point.name === item) {
            pointList.push(item)
            headerList.push(item + (point.description!=""&&point.description!=undefined?`（${point.description}）`:''))  
          }
        })
      })
      

      pointData = timeData.map( (item,row)=>{
          let line = {}
          line['key']= row
          pointList.forEach( (pitem,i)=>{
              if (data.map[pitem].length === 0) {
                line[pitem] = ''
              }else {
                line[pitem] = data.map[pitem][row]                
              }
          })
          return line
      })

      
      http.post('/reportTool/genExcelReportByTableData', {
          reportName: reportName,
          strStartTime: strStartTime,
          strEndTime: strEndTime,
          headerList: headerList,　 //表头用的点名
          tableDataList:pointData,
          timeList:timeData,
          pointList:pointList
      }).then(
          data=>{
              if (data.err === 0) {
                  downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/temp/${data.data.reportfilename}`)
              }
              if (status === false) {
                  message.error('生成下载文件失败')
              }
          }
      )         
  }


  getChartData(points, timeOptions) {
    points = points
    timeOptions = timeOptions
    this.setState({
      loading: true
    });

    // 判断是否还有需要请求的点
    if(!points.length){
      return this.setState({
        loading : false,
        data: {
          map: {},
          time: []
        }
      })
    } 
    
    http.post('/get_history_data_padded', {
      pointList: points.map(row => row['name']),
      ...{
        timeStart: moment(timeOptions['timeStart']).format('YYYY-MM-DD HH:mm:00'),
        timeEnd: moment(timeOptions['timeEnd']).format('YYYY-MM-DD HH:mm:00'),
        timeFormat: timeOptions['timeFormat']
      }
    }).then(
      data => {
        if (!this.container) {
          return;
        }
        if (data.error) {
          this.setState({
            loading: false
          });
          return message.warning(data.msg, 3);
        }
        this.props.updatePointInfo(data.map);
        this.setState({
          loading: false,
          data: data
        });
      }
    ).catch(
      () => {
        if (!this.container) {
          return;
        }
        this.setState({
          loading: false,
          data: []
        });
      }
    )
  }
  getChartOption() {
    const data = this.state.data;
    const hiddenPoints = this.props.points
      .filter(row => !row['visible'])
      .map(row => row['name']);

    return {
      title: {
        text: ''
      },
      tooltip : {
        trigger: 'axis'
      },
      // toolbox: {
      //   show: true,
      //   feature: {
      //     dataZoom: {show: true},
      //     dataView: {show: true}
      //   },
      //   right:'2%'
      // },
      grid: {
        top: '4%',
        left: '4%',
        right: '5%',
        bottom: '5%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          data : data.time
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series: Object.keys(data.map)
        .filter(row => hiddenPoints.indexOf(row) === -1)
        .map((key) =>{
            let name = key
            this.props.points.map(item=>{
              if(item.name == name && item.description != "" && item.description != undefined){
                name = item.description
              }
            })
            return {
              name: name,
              type: 'line',
              data: data.map[key]
            }
          }
        )
    };
  }
  saveChartRef(refEchart) {
    if (refEchart) {
      this.chart = refEchart.getEchartsInstance();
    } else {
      this.chart = null;
    }
  }
  saveContainerRef(container) {
    this.container = container;
  }
  showConfigModal() {
    this.setState({
      isShowConfigModal: true
    });
  }
  hideConfigModal() {
    this.setState({
      isShowConfigModal: false
    });
  }
  handleConfigModalSubmit(values) {
    this.props.saveChartOptions(values);
  }
  render() {
    const { timeOptions } = this.props

    return (
      <div className={s['container']} ref={this.saveContainerRef}>
        <div className={cx(s['header'], 'clearfix')}>
          <span style={textStyle}>历史曲线</span>
          <div className={s['options']}>
            <Button icon="setting" onClick={this.showConfigModal} style={btnStyle}>配置</Button>
            <Button icon="export" onClick={this.exportChart} style={btnStyle}>导出图片</Button>
            <Button icon="export" onClick={this.handleDownLoad} style={btnStyle}>导出表格</Button>
          </div>
        </div>
        <div className={s['chart-container']}>
          {
            this.state.loading ? 
            <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
              <Spin tip="正在读取数据"/>
            </div>
            
            :
             <ReactEcharts
              style={{
                height: '100%'
              }}
              ref={this.saveChartRef}
              option={this.getChartOption()}
              theme={themeStyle}
              notMerge={true}
            />
          }
         
        </div>
        <div style={{width:'70px',height:'22px',fontSize:'14px',fontFamily:'MicrosoftYaHei',color:'rgba(31,35,41,1)',lineHeight:'22px',position:'absolute',top:'397px',right:'50%',display:`${this.props.points != '' ? 'none' : ''}`}}>暂无数据</div>
        <ConfigModal
          visible={ this.state.isShowConfigModal }
          handleHide={ this.hideConfigModal }
          handleOk={ this.handleConfigModalSubmit }
          timeOptions={timeOptions }
          showLoading={this.state.loading}
        />
      </div>
    );
  }
}

Chart.propTypes = {
};

export default Chart;
