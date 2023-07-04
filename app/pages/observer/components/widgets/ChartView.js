/**
 * 历史曲线页面
 */

import React from 'react';
import { Button, message,Spin } from 'antd';
import ReactEcharts from '../../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import '../../../../lib/echarts-themes/light';
import cx from 'classnames'

import moment from 'moment';
import http from '../../../../common/http';
import {subtract} from '../../../../common/utils'
// import { downloadUrl } from '../../../common/utils';
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

import s from './ChartView.css';

let themeStyle;
if(localStorage.getItem('serverOmd')=="best"||localStorage.getItem('serverOmd')=="persagy"){
  themeStyle = "light"
}else{
  themeStyle = "dark"
}

class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: false
    };

    this.chart = null;
    this.container = null;

    this.getChartData = this.getChartData.bind(this);
    this.saveChartRef = this.saveChartRef.bind(this);
    this.saveContainerRef = this.saveContainerRef.bind(this);
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
    this.getChartData([this.props.roomName+'ChGroupPowerTotal'],this.props);
  }

  componentWillReceiveProps(nextProps){
    if(this.props.energyDateStr !== nextProps.energyDateStr){
      this.getChartData([this.props.point],nextProps);
    }
    if(this.props.point !== nextProps.point){
      this.getChartData([nextProps.point],nextProps);
    }
  }

  getChartData(points,props) {
    const {energyDateStr} = props
    let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
    timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT);

    this.setState({
      loading: true
    });

    // 时间段要向后延长一个小时，获取到该时间点的数据
    http.post('/get_history_data_padded', {
      pointList: points,
      ...{
      "timeStart":timeStart,
      "timeEnd":timeEnd,
      "timeFormat":"m1"
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
        // 1.筛选出整点的数据
        var tempData = {
          map : {},
          time : []
        }

        var pointList = Object.keys(data.map)

        data.time.forEach((item,index)=>{
          // 获取整点时间
          if(new RegExp(/00:00$/).test(item)){
            tempData.time.push(item)
            pointList.forEach(point=>{
              if(!tempData.map[point]){
                tempData.map[point]=[]
              } 
              // 拿出整点数据
              
              let num = Math.floor(data.map[point][index])
            
              tempData.map[point].push(num)
            })
          }
        })
        // console.log(tempData)
        // 2.利用求差函数计算出新的数组 
        pointList.forEach(point=>{
          let diffArr = subtract(tempData.map[point])
          //过滤大于一万的数据，强制为一千;为负值时，转0
          diffArr.forEach((diff,index)=>{
            if (diff > 10000) {
                diffArr[index] = 1000
            }else {
              if (diff < 0) {
                diffArr[index] = 0
              }
            }
          })
          tempData.map[point] = diffArr
        })
        tempData.time.pop()

        this.setState({
          loading: false,
          data: tempData
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
      toolbox: {
        show: true,
        feature: {
          dataView: {
            show: true ,
          }
        },
        right:'2%'
      },
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
        .map((key) => ({
          name: key,
          type: 'bar',
          label: {
            normal: {
              show: true,
              position: 'top'
            }
          },
          data: data.map[key]
        }))
    };
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
    const { timeOptions } = this.props

    return (
      <div className={s['container']} ref={this.saveContainerRef}>
        <div className={s['chart-container']}>
          {
            this.state.loading ? 
            <div style={{width: '100%',height: '100%',textAlign: 'center',marginTop: '30px'}}>
              <Spin tip="正在读取数据"/>
            </div>
            :
             <ReactEcharts
              style={{
                height: '95%'
              }}
              ref={this.saveChartRef}
              option={this.getChartOption()}
              theme={themeStyle}
              notMerge={true}
            />
          }
        </div>
      </div>
    );
  }
}

Chart.propTypes = {
};

export default Chart;
