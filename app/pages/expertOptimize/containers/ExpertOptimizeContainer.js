import { connect } from 'react-redux';
import {
  getHistory,
  saveActionList,
  saveEndFlag
} from '../modules/ExpertOptimizeModule.js';

import ExpertOptimizeModalView from '../components/ExpertOptimizeModalView.js';

const mapActionCreators = {
  getHistory,
  saveActionList,
  saveEndFlag
}

const mapStateToProps = (state) => {
  return{
    ...state.expertOptimize.reducer
  }
}

export default connect(mapStateToProps, mapActionCreators)(ExpertOptimizeModalView)
