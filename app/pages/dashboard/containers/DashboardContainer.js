import { connect } from 'react-redux';
import {
  initializePages,
  addPage,
  removePage,
  updatePage,
} from '../modules/DashboardModule.js';
import {
  showModal,
  hideModal
} from '../../modal/modules/ModalModule.js';

import DashboardModalView from '../components/DashboardModalView';

const mapActionCreators = {
  initializePages,
  addPage,
  removePage,
  showModal,
  updatePage,
  hideModal
}

const mapStateToProps = (state) => {
  return{
    ...state.dashboard.reducer
  }
}

export default connect(mapStateToProps, mapActionCreators)(DashboardModalView)
