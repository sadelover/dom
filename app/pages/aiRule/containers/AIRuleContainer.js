import { connect } from 'react-redux';
import AIRuleModalView from '../components/AIRuleModalView'
import {
	addPage,
	removePage,
	updatePage,
	showPointModal,
    hidePointModal
} from '../modules/AIRuleModule.js';
import {
	showModal,
	hideModal
} from '../../modal/modules/ModalModule.js';

import {
	onSelectChangeInput
} from '../modules/InputPointModalModule'

import {
	onSelectChangeOutput
} from '../modules/OutputPointModalModule'


const mapActionCreators = {
	addPage,
	removePage,
	showModal,
	updatePage,
	hideModal,
	showPointModal,
    hidePointModal,
	onSelectChangeInput,
	onSelectChangeOutput
}

const mapStateToProps = (state) => {
	const { selectedIdsInput, pointDataInput } = state.aiRule.inputPointTable
	const { selectedIdsOutput, pointDataOutput } = state.aiRule.outputPointTable
	return {
		...state.dashboard.reducer,
		selectedIdsInput: selectedIdsInput,
		pointDataInput: pointDataInput,
		selectedIdsOutput: selectedIdsOutput,
		pointDataOutput: pointDataOutput
	}
}

export default connect(mapStateToProps, mapActionCreators)(AIRuleModalView)
