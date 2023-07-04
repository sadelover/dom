import { connect } from 'react-redux';
import {
  showLayer,
  hideLayer,
  showPoint,
  hidePoint,
  addPoint,
  deletePoint,
  updatePointInfo,
  saveChartOptions
} from '../modules/HistoryModule';
import {
  showPointModal
} from '../../modal/modules/ModalModule';
import HistoryView from '../components/HistoryView';

const mapActionCreators = {
  showLayer,
  hideLayer,
  showPoint,
  hidePoint,
  addPoint,
  deletePoint,
  updatePointInfo,
  saveChartOptions,
  showPointModal
}

const mapStateToProps = (state) => ({
  ...state.history
})

export default connect(mapStateToProps, mapActionCreators)(HistoryView)
