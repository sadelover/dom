/**
 * 历史曲线页面
 */

import React from 'react';
import { Button, message,Spin } from 'antd';
import ReactEcharts from '../../../../lib/echarts-for-react';
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import cx from 'classnames'

import moment from 'moment';
import http from '../../../../common/http';
// import { downloadUrl } from '../../../common/utils';
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

import s from './EnergyView.css';

class PieChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: false,
      equipmentdescribe : this.props.equipmentdescribe
    //   color : []
    };

    this.chart = null;
    this.container = null;

    this.getChartData2 = this.getChartData2.bind(this);
    this.saveChartRef2 = this.saveChartRef2.bind(this);
    this.saveContainerRef2 = this.saveContainerRef2.bind(this);
    this.getChartOption2 = this.getChartOption2.bind(this)
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
    if (this.state.equipmentdescribe) {
      this.getChartData2(Object.keys(this.state.equipmentdescribe),this.props);

    }

    // var newdata = Object.keys(data.map).map(item=>{
    //     var num = Math.floor(data.map[item][ data.map[item].length - 1] - data.map[item][0]) < 0 ? 0 : Math.floor(data.map[item][ data.map[item].length - 1] - data.map[item][0])
    //     return {
    //         name : this.equipmentdescribe[item] ,
    //         value : num
    //     }
    // })
    // this.props.getPieChartInfo(this.chart.getOption().color.slice(0,5),newData)
  }   

  componentWillReceiveProps(nextProps){
    if(this.props.energyDateStr !== nextProps.energyDateStr){
      this.getChartData2(Object.keys(this.state.equipmentdescribe),nextProps);
    }
  }

  getChartData2(points,props) {

    const {energyDateStr} = props
    let timeStart = moment(energyDateStr).startOf('day').format(TIME_FORMAT),
    timeEnd = moment(energyDateStr).endOf('day').format(TIME_FORMAT);


    this.setState({
      loading: true
    });

    
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
  
getChartOption2() {
    let {energySavingSH,bgcolor} = this.props;
    const data = this.state.data;
    var _this = this
    return {
        tooltip: {
            trigger: 'item',
            formatter: "{b}: {c}%"
        },
        // legend: {
        //     orient: 'vertical',
        //     x: 'left',
        //     // data:['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
        //     data : Object.keys(data.map)
        // },
        series: [
          {
              name: '',
              type: 'pie',
              radius: ['40%', '75%'],
              avoidLabelOverlap: false,
              label: {
                  normal: {
                      show: false,
                      position: 'center'
                  },
                  emphasis: {
                      show: true,
                      textStyle: {
                          fontSize: '30',
                          fontWeight: 'bold'
                      }
                  }
              },
              labelLine: {
                  normal: {
                      show: false
                  }
              },
              color:['#0091FF', 'RGB(230,245,255)'],
              data: [
                  {value: energySavingSH, name: '节能率'},
                  {value: 100-energySavingSH, name: ''},
              ]
          }
      ]
    };
  }
  // echart实例
  saveChartRef2(refEchart) {
    if (refEchart) {
      this.chart = refEchart.getEchartsInstance();
    } else {
      this.chart = null;
    }
  }
// 容器实例
  saveContainerRef2(container) {
    this.container = container;
  }

  render() {
    const { timeOptions } = this.props

    return (
      <div className={s['charts-container']} ref={this.saveContainerRef2}>
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
              ref={this.saveChartRef2}
              option={this.getChartOption2()}
              theme={this.props.bgcolor && this.props.bgcolor == 'light' ? "light" : "dark"}
              notMerge={true}
            />
          }
      </div>
    );
  }
}

PieChart.propTypes = {
};

export default PieChart;
