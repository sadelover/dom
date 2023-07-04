/**
 * 历史曲线页面
 */

import React from 'react';
import { Button } from 'antd';
import s from './HistoryView.css';

import Chart from './ChartView';
import PointList from './PointListView';

let bgStyle,leftBgStyle;
if(localStorage.getItem('serverOmd')=="best"){
    bgStyle={
      background:"RGB(240,240,240)"
    }
    leftBgStyle={
      background:"RGB(240,240,240)"
    }
}
if(localStorage.getItem('serverOmd')=="persagy"){
  bgStyle={
    border:'none',
    background:"rgba(255,255,255,1)",
    color:"rgba(31,35,41,1)"
  }
  leftBgStyle={
    border:'none',
    background:"#F7F9FA",
    color:"rgba(31,35,41,1)"    
  }
}

class History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }
  render() {
    // if (!this.props.visible) {
    //   return null;
    // }

    const {
      points,
      timeOptions,
      showPoint,
      hidePoint,
      addPoint,
      deletePoint,
      updatePointInfo,
      saveChartOptions,
      showPointModal,
      tendencyVisible,
      tendencyData,
      hideTendencyModal
    } = this.props;

    return (
      <div className={s['container']} style={bgStyle}>
        <div className={s['container-inner']} style={bgStyle}>
          <div className={s['chart-container-wrap']} style={bgStyle}>
            <Chart
              points={points}
              timeOptions={timeOptions}
              updatePointInfo={updatePointInfo}
              saveChartOptions={saveChartOptions}
            />
          </div>
          <div className={s['points-container-wrap']} style={leftBgStyle}>
            <PointList
              points={points}
              showPoint={showPoint}
              hidePoint={hidePoint}
              addPoint={addPoint}
              deletePoint={deletePoint}
              showPointModal={showPointModal}
            />
          </div>
        </div>
      </div>
    );
  }
}

History.propTypes = {
};

export default History;
