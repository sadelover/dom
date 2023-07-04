import { connect } from 'react-redux';




import {
    initializeLineChart,
    toggleConfigModal,
    showPointModal,
    hidePointModal,
    getWorkerDict,
    addConfigInfo
} from '../modules/LineModule.js';

import LineModalView from '../components/LineModalView';

const mapActionCreators = {
    initializeLineChart,
    toggleConfigModal,
    showPointModal,
    hidePointModal,
    getWorkerDict,
    addConfigInfo
}

const mapStateToProps = (state) => {
  return{
      ...state.dashboard.lineData,
      selectedData : state.dashboard.pointModal.selectedData,
      pageList: state.dashboard.reducer.pageList
  }
}

export default connect(mapStateToProps, mapActionCreators)(LineModalView)


