import { connect } from 'react-redux';
import {
  hideModal,
  optimizeSetting,
  timeSetting,
  showOperatingModal,
  operateSwitch,
  switchHide,
  showCheckboxModal,
  showSwitchUserModal,
  checkboxHide,
  checkboxSetting,
  showOperatingTextModal,
  showObserverModal,
  textHide,
  textSetting,
  showRadioModal,
  radioHide,
  showSelectControlModal,
  selectHide,
  observerSetting,
  showCommomAlarm,
  alarmHide,
  checkboxMainSetting,
  observerModalDict,
  tableCellSetting,
  newTableCellSetting,
  reportCellSetting,
  showModal,
  tableOneClick,
  tableLoadingFun
} from '../modules/ModalModule';

import {
  showObserverSecModal
} from '../../secModal/modules/SecModalModule';

import {
  // getTendencyModal,
  refreshCustomData,
  refreshCustomDataInModal,
  refreshTimePickerData,
  refreshRectanglePanelData,
  reportCustomData,
  refreshReportFun,
  refreshBenchmarkFun,
  energyCustomData,
  searchData,
  getCustomRealTimeData,
  // getPointRealTimeData,
  getTimePickerRealTimeData,
  getRectanglesPanelData,
  getCustomTableData 
} from '../../observer/modules/ObserverModule'

import {
  getTendencyModal
} from '../../Trend/modules/TrendModule'

import { getToolPoint } from '../../history/modules/HistoryModule';

import { updatePage } from '../../dashboard/modules/DashboardModule';

import ModalView from '../components/ModalView';

const mapActionCreators = {
  hideModal,
  optimizeSetting,
  timeSetting,
  showOperatingModal,
  showObserverSecModal,
  showObserverModal,
  operateSwitch,
  switchHide,
  showCheckboxModal,
  showSwitchUserModal,
  checkboxHide,
  checkboxSetting,
  showOperatingTextModal,
  textHide,
  textSetting,
  showRadioModal,
  radioHide,
  showSelectControlModal,
  selectHide,
  getToolPoint,
  observerSetting,
  showCommomAlarm,
  alarmHide,
  updatePage,
  checkboxMainSetting,
  observerModalDict,
  tableCellSetting,
  newTableCellSetting,
  reportCellSetting,
  showModal,
  tableOneClick,
  tableLoadingFun,
  refreshCustomData,
  refreshCustomDataInModal,
  refreshTimePickerData,
  refreshRectanglePanelData,
  reportCustomData,
  refreshReportFun,
  refreshBenchmarkFun,
  energyCustomData,
  searchData,
  getCustomRealTimeData,
  // getPointRealTimeData,
  getTimePickerRealTimeData,
  getRectanglesPanelData,
  getCustomTableData,
  getTendencyModal
}
const mapStateToProps = (state) => ({
  ...state.modal,
  ...state.layout,
  ...state.observer
})

export default connect(mapStateToProps, mapActionCreators)(ModalView)
