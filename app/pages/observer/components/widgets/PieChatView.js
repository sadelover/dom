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
let AllTotal;
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

    this.getChartData = this.getChartData.bind(this);
    this.saveChartRef = this.saveChartRef.bind(this);
    this.saveContainerRef = this.saveContainerRef.bind(this);
    this.getChartOption = this.getChartOption.bind(this)
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
    this.getChartData(Object.keys(this.state.equipmentdescribe),this.props);

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
      this.getChartData(Object.keys(this.state.equipmentdescribe),nextProps);
    }
  }

  getChartData(points,props) {

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
  
getChartOption() {
    const data = this.state.data;
    var _this = this;
    AllTotal = 0;
    return {
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        // legend: {
        //     orient: 'vertical',
        //     x: 'left',
        //     // data:['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
        //     data : Object.keys(data.map)
        // },
        series: [
            {
                name:'访问来源',
                type:'pie',
                radius: ['50%', '70%'],
                label: {
                    normal: {
                        formatter: '{b} : {c} kWh {per|{d}%}  ',
                        rich: {
                          per: {
                              color: '#eee',
                              backgroundColor: '#334455',
                              padding: [2, 4],
                              borderRadius: 2
                          }
                      }
                    },
                },
                data : Object.keys(data.map).map(item=>{
                    var num = Math.floor(data.map[item][ data.map[item].length - 1] - data.map[item][0]) > 0?  Math.floor(data.map[item][ data.map[item].length - 1] - data.map[item][0]):0;          
                      AllTotal = AllTotal + num;
                    return {
                        name : this.state.equipmentdescribe[item] ,
                        value : num
                    }
                })
            }
        ]
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
      <div className={s['charts-container']} ref={this.saveContainerRef}>
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
              theme="dark"
              notMerge={true}
            />
            
          }
              {
                localStorage.getItem('serverOmd')=="persagy" ?
                  <div style={{position:'absolute',marginLeft:'44%',bottom:'40%'}}>
                    <div style={{fontSize:'17px',color:'RGB(71,71,71)'}}>今日总能耗</div>
                    <div style={{fontSize:'18px',color:'RGB(0,0,0)',width:'84px',textAlign:'center'}}>{AllTotal}</div>
                    <div style={{fontSize:'17px',color:'RGB(71,71,71)'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;kwh</div>
                  </div>
                :
                  <div style={{position:'absolute',marginLeft:'44%',bottom:'40%'}}>
                    <div style={{fontSize:'17px'}}>今日总能耗</div>
                    <div style={{fontSize:'18px',width:'84px',textAlign:'center'}}>{AllTotal}</div>
                    <div style={{fontSize:'17px'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;kwh</div>
                  </div>
              }
          
      </div>
    );
  }
}

PieChart.propTypes = {
};

export default PieChart;
