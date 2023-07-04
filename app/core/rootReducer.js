import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import layout from '../pages/layout/modules/LayoutModule';
import home from '../pages/home/modules/HomeModule';
import observer from '../pages/observer/modules/ObserverModule';
import AhuLight from '../pages/observer/modules/AHUListModule'
import history from '../pages/history/modules/HistoryModule';
import alarmManage from '../pages/alarm/modules/AlarmManageModule';
import scriptRule from '../pages/scriptRule/modules/ScriptRuleModule';
import aiRule from '../pages/aiRule/modules/AIRuleModule';
import warningManage from '../pages/warningManage/modules/WarningManageModule';
import networkManage from '../pages/networkManage/modules/NetworkManageModule';
import modal from '../pages/modal/modules/ModalModule';
import secModal from '../pages/secModal/modules/SecModalModule';
import debug from '../pages/debug/modules/DebugModule';
import dashboard from '../pages/dashboard/modules/DashboardModule';
import expertOptimize from '../pages/expertOptimize/modules/ExpertOptimizeModule';
import schedulePoint from '../pages/layout/modules/PointModalModule';
import reconnection from '../pages/layout/modules/ReconnectionModule';
import calender from '../pages/calender/modules/CalendarManageModule';
import trend from '../pages/Trend/modules/TrendModule';
import commandlog from '../pages/commandLog/modules/commandLogModule';
import SceneModel from '../pages/layout/modules/SceneModule';
import repairManage from '../pages/repairManage/modules/RepairModule';
import reportManage from '../pages/reportManage/modules/ReportModule';
import energyManage from '../pages/energyManage/modules/EnergyModule';
import inspactArea from '../pages/asset/components/RegionalManage/inspactArea/modules/InspactAreaModule';
import templateManage from '../pages/asset/components/TemplateManage/templateManage/modules/TemplateManageModule';
import equipSystemManage from '../pages/asset/components/SystemDevice/equipSystemManage/modules/EquipSystemManageModule';
import deviceManage from '../pages/asset/components/DeviceManage/deviceManage/modules/DeviceManageModule';

const rootReducer = combineReducers({
    routing,
    layout,
    home,
    observer,
    history,
    alarmManage,
    warningManage,
    networkManage,
    modal,
    secModal,
    debug,
    dashboard,
    expertOptimize,
    schedulePoint,
    reconnection,
    calender,
    AhuLight,
    trend,
    commandlog,
    SceneModel,
    repairManage,
    reportManage,
    energyManage,
    inspactArea,
    templateManage,
    equipSystemManage,
    deviceManage,
    scriptRule,
    aiRule
});

export default rootReducer;
