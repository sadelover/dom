/**
 * 历史曲线页面
 */

import React from 'react';
import { Button } from 'antd';
import s from './CalendarManageView.css';

import CalendarView from './CalendarView';
import PointList from './PointListView';

let bgStyle,siteStyle;
if(localStorage.getItem('serverOmd')=="best"){
    bgStyle={
      background:"RGB(240,240,240)",
    }
    siteStyle={
      top:"0"
    }
}else if(localStorage.getItem('serverOmd')=="persagy"){
  bgStyle={
    background:"RGB(255,255,255)",
  }
  siteStyle={
    top:"0",
    background:"#ffffff"
  }
}else{
}

class CalendarManageView extends React.Component {
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
      addModelToCalendar, //将模式绑定到日历上某一天
      addModelToCalendarMonth,//将模式绑定到日历上整月
      delModelToCalendar  //删除某天的模式
    } = this.props;

    return (
      <div className={s['container']}  style={bgStyle}>
        <div className={s['container-inner']}>
          <div className={s['chart-container-wrap']} style={siteStyle}>
            <CalendarView
              addModelToCalendar={addModelToCalendar}
              addModelToCalendarMonth={addModelToCalendarMonth}
              delModelToCalendar={delModelToCalendar}
              calendarData={this.props.calendarData}
              loading={this.props.loading}
              getAllCalendarWithMode={this.props.getAllCalendarWithMode}
              getOneTypeCalendarWithMode={this.props.getOneTypeCalendarWithMode}
              loadingCalendar={this.props.loadingCalendar}
            />
          </div>
        </div>
      </div>
    );
  }
}

CalendarManageView.propTypes = {
};

export default CalendarManageView;
