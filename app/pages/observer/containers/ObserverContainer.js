import { connect } from 'react-redux';
import {
    observerScreenParms,
    updatePageId,
    showOperatingModal,
    switchHide,
    toggleLoading,
    showMainCheckboxModal,
    refreshCustomData,
    refreshTimePickerData,
    refreshRectanglePanelData,
    reportCustomData,
    refreshReportFun,
    refreshBenchmarkFun,
    energyCustomData,
    searchData,
    getCustomRealTimeData,
    getPointRealTimeData,
    getTimePickerRealTimeData,
    getRectanglesPanelData,
    getCustomTableData,
    refreshCustomDataInModal,
    settingTableDataFlagFun,
    getPointNameList,  //morgan添加
    LightControlList,   //morgan添加
    LightControlIndexOf,
    LightControlData,
    LightControlColoum,
    LightControlShow,
    ValueSetting,
    SwitchControlShow,
    ChangeControlShow,
    createGuarantee,
    repair,
    showGuarantee,
    viewExperience
} from '../modules/ObserverModule';
import {
    RepairDataAction
} from '../../layout/modules/LayoutModule'

import {
    AHUControlData,
    AHUloading,
    AHUSwitch,
    AHUSetting,
    LightData,
    Lightloading,
    LightSwitch,
    LightSetting,
    FAUData,
    FAUloading,
    FAUSwitch,
    FAUSetting,
    FANData,
    FANloading,
    FANSwitch,
    FANSetting,
    FCUData,
    FCUloading,
    FCUSwitch,
    FCUSetting,
    ValveData,
    Valveloading,
    ValveSwitch,
    ValveSetting,
    EnvironmentData,
    Environmentloading,
    EnvironmentSwitch,
    EnvironmentSetting
} from '../modules/AHUListModule';

import ObserverView from '../components/ObserverView';

import { getToolPoint } from '../../history/modules/HistoryModule'

import { showModal, tableOneClick, tableLoadingFun } from '../../modal/modules/ModalModule'

import { getConfig } from '../../debug/modules/ConfigModule'


import {
    showCommomAlarm,
    showMainInterfaceModal,
    showObserverModal,
    showOptimizeModal,
    showTimeModal,
    // showOperatingModal,
    operateSwitch,

} from '../../modal/modules/ModalModule'

import {
    showObserverSecModal
} from '../../secModal/modules/SecModalModule'

import {
    hideTendencyModal,
    getTendencyModal
} from '../../Trend/modules/TrendModule'
import { Form } from 'antd';

const mapActionCreators = {
    showObserverModal,
    showObserverSecModal,
    showOptimizeModal,
    showTimeModal,
    getToolPoint,
    showCommomAlarm,
    getTendencyModal,
    showMainInterfaceModal,
    observerScreenParms,
    updatePageId,
    showOperatingModal,
    operateSwitch,
    switchHide,
    toggleLoading,
    showMainCheckboxModal,
    refreshCustomData,
    refreshTimePickerData,
    refreshRectanglePanelData,
    reportCustomData,
    refreshReportFun,
    refreshBenchmarkFun,
    showModal,
    tableOneClick,
    tableLoadingFun,
    energyCustomData,
    getConfig,
    searchData,
    getCustomRealTimeData,
    getPointRealTimeData,
    getTimePickerRealTimeData,
    getRectanglesPanelData,
    getCustomTableData,
    refreshCustomDataInModal,
    settingTableDataFlagFun,
    getPointNameList,
    LightControlList,
    LightControlIndexOf,
    LightControlData,
    LightControlColoum,
    LightControlShow,
    ValueSetting,
    SwitchControlShow,
    ChangeControlShow,
    AHUControlData,
    AHUloading,
    AHUSwitch,
    AHUSetting,
    LightData,
    Lightloading,
    LightSwitch,
    LightSetting,
    hideTendencyModal,
    createGuarantee,
    repair,
    showGuarantee,
    viewExperience,
    RepairDataAction,
    FAUData,
    FAUloading,
    FAUSwitch,
    FAUSetting,
    FANData,
    FANloading,
    FANSwitch,
    FANSetting,
    FCUData,
    FCUloading,
    FCUSwitch,
    FCUSetting,
    ValveData,
    Valveloading,
    ValveSwitch,
    ValveSetting,
    EnvironmentData,
    Environmentloading,
    EnvironmentSwitch,
    EnvironmentSetting
}

const mapStateToProps = (state) => ({
    ...state.layout,
    ...state.modal,
    ...state.observer,
    ...state.AhuLight,
    code: state.debug.config.code
})

export default connect(mapStateToProps, mapActionCreators)(ObserverView)
