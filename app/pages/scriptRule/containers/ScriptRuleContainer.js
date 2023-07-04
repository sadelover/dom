import { connect } from 'react-redux';
import ScriptRuleModalView from '../components/ScriptRuleModalView'
import {
	initializePages,
	addPage,
	removePage,
	updatePage,
	showPointModal,
    hidePointModal
} from '../modules/ScriptRuleModule.js';
import {
	showModal,
	hideModal
} from '../../modal/modules/ModalModule.js';

import {
	onSelectChange
} from '../modules/PointModalModule'


const mapActionCreators = {
	initializePages,
	addPage,
	removePage,
	showModal,
	updatePage,
	hideModal,
	showPointModal,
    hidePointModal,
	onSelectChange
}

const mapStateToProps = (state) => {
	const { selectedIds, pointData } = state.alarmManage.pointTable
	return {
		...state.dashboard.reducer,
		selectedIds: selectedIds,
		pointData: pointData,
		scriptRefreshFlag:state.scriptRule.reducer.scriptRefreshFlag
	}
}

export default connect(mapStateToProps, mapActionCreators)(ScriptRuleModalView)
