import { connect } from 'react-redux';
import {
  addModelToCalendar,
  addModelToCalendarMonth,
  getAllCalendarWithMode,
  getOneTypeCalendarWithMode,
  delModelToCalendar,
  loadingCalendar
} from '../modules/CalendarManageModule.js';

import CalendarManageView from '../components/CalendarManageView';

const mapActionCreators = {
  addModelToCalendar,
  addModelToCalendarMonth,
  getAllCalendarWithMode,
  getOneTypeCalendarWithMode,
  delModelToCalendar,
  loadingCalendar
}

const mapStateToProps = (state) => ({
  ...state.calender
})

export default connect(mapStateToProps, mapActionCreators)(CalendarManageView)
