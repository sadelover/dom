import TableComponent from './TableComponent'
import TestComponent from './TestComponet'
import EnergyCompnent from './EnergyView.js'
import ReportComponent from './ReportView.js'
import LineChartComponent from './LineChartView.js'
import efficiencyChartComponent from './efficiencyChartView.js'
import EquipListControlComponent from './EquipListControlView.js'
import ParamQueryComponent from './ParamQueryView.js'
import AccumChartComponent from './AccumChartView.js'
import PlayerComponent from './PlayerView'
import EnergyFeeComponent from './EnergyFeeView'
import CoolingComponent from './CoolingView'
import GaugeChartComponent from './GaugeChartView'
import BenchmarkView from './BenchmarkView'
import BigDataChartComponent from './BigDataChartView'
import FDDTerminalComponent from './FDDTerminalView'
import MinLineChartComponent from './MinLineChartView.js'
//import HTMLComponent from './HTMLComponent.js'
import FDDCommonComponent from './FDDCommon'
import HeatmapTableComponent from './HeatmapTable'
import WarningManagerComponent from './WarningManager'
import RingViewComponent from './RingView'
import ArrayLineChartComponent from './ArrayLineChartView'
import ReportHistoryComponent from './ReportHistoryView'
import EvaluationBar from './EvaluationBar.js'
import ScheduleComponent from './ScheduleComponent.js'
import EfficiencyComponent from './Efficiency.js'
import LightingControlListComponent from './LightingControlList.js'
import ModelControlComponent from './ModelControlView';
import AHUControlListComponent from './AHUListView'
import LightControlListComponent from './LightingList'
import ProcessSliderView from './ProcessSliderView'
import GuaranteeComponentView from './GuaranteeComponentView'
import RelationView from './RelationView'
import FreshAirFanListComponent from './FreshAirFanListView'
import FANControlListComponent  from './SupplyExhaust'
import FCUControlListComponent  from './FCUListView'
import PieViewComponent from './PieView'
import FaultOverViewComponent from './FaultOverView'
import FaultQueryViewComponent from './FaultQueryView'
import FaultHandleViewComponent from './FaultHandleView'
import StationViewComponent from './StationView'
import FaultCollectViewComponent from './FaultCollectView'
import TabGroupViewComponent from './TabGroupView'
import ValveListViewComponent from './ValveListView'
import RegressionViewComponent from './RegressionView'
import EnvironmentControlComponent from './EnvironmentSersor'
import EfficiencyRankComponent from './EfficiencyRankView'
import EquipmentControlTableComponent from './EquipmentControlTableView'
import CopPieViewComponent from './CopPieView'
import RuleViewComponent from './RuleView'
import LogicLogComponent from './LogicLog'
import ScriptRuleViewComponent from './ScriptRuleView'
import LogicFlowChartViewComponent from './LogicFlowChartView'
import EquipmentTableComponent from './EquipmentTableView.js'
import EnergyBoardComponent from './EnergyManageView'
const widgets = []

// 注册
export const register = function(Widget){
    widgets.push(
        Object.assign({
            component : Widget
        },Widget.registerInformation)
    )
}

// 查找
export const getWidgetByType = type => {
    return widgets.find( row=>{
        return row.type === type
    })
}

// 注册组件入口
register(TableComponent)
register(TestComponent)
register(EnergyCompnent)
register(ReportComponent)
register(LineChartComponent)
register(efficiencyChartComponent)
register(ParamQueryComponent)
register(EquipListControlComponent)
register(AccumChartComponent)
register(PlayerComponent)
register(EnergyFeeComponent)
register(CoolingComponent)
register(GaugeChartComponent)
register(BenchmarkView)
register(BigDataChartComponent)
register(FDDTerminalComponent)
register(MinLineChartComponent)
//register(HTMLComponent)
register(FDDCommonComponent)
register(HeatmapTableComponent)
register(WarningManagerComponent)
register(RingViewComponent)
register(ArrayLineChartComponent)
register(ReportHistoryComponent)
register(EvaluationBar)
register(ScheduleComponent)
register(EfficiencyComponent)
register(LightingControlListComponent)
register(ModelControlComponent)
register(AHUControlListComponent)
register(LightControlListComponent)
register(ProcessSliderView)
register(GuaranteeComponentView)
register(RelationView)
register(FreshAirFanListComponent)
register(FANControlListComponent)
register(FCUControlListComponent)
register(PieViewComponent)
register(FaultOverViewComponent)
register(FaultQueryViewComponent)
register(FaultHandleViewComponent)
register(StationViewComponent)
register(FaultCollectViewComponent)
register(TabGroupViewComponent)
register(ValveListViewComponent)
register(RegressionViewComponent)
register(EnvironmentControlComponent)
register(EfficiencyRankComponent)
register(EquipmentControlTableComponent)
register(CopPieViewComponent)
register(RuleViewComponent)
register(LogicLogComponent)
register(ScriptRuleViewComponent)
register(LogicFlowChartViewComponent)
register(EquipmentTableComponent)
register(EnergyBoardComponent)
export default widgets