/**
 * 项目统一模态框
 */

import React from 'react';
import { Button } from 'antd';

import { modalTypes,SecModalTypes } from '../../../common/enum';

import PointModal from './PointModalView';
import ObserverModal from './ObserverModalView';
import OptimizeValueModal from './OptimizeValueModalView'; 
import TimePickerModal from './TimePickerModalView';
import MainInterfaceModal from './CommonAlarmModalView';
import HighestCheckboxModal from './HighestCheckboxModalView';
import CreateDashboardModal from './CreateDashboardModalView';
import TableValueModal from './TableValueModalView';
import ReportValueModal from './ReportValueModalView';
import SwitchUser from '../../layout/components/SwitchUserModalView'
import {initialize} from '../../layout/modules/LayoutModule'
import {store} from '../../../index'

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      alarmVisible:false,
      switchUserVisible:false
    };
  }

  shouldComponentUpdate(nextProps,nextState){
    if (nextProps.type === this.props.type && (this.props.type === modalTypes.CREATE_DASHBOARD_MODAL||this.props.type === modalTypes.ALARM_MAININTERFACE_MODAL)) {
      return false
    };
    if (nextProps.type != this.props.type && nextProps.type === modalTypes.SWITCH_USER_MODAL) {
      this.setState({
        switchUserVisible:true
      })
    };
    if(nextProps.alarmVisible==true){
      if(this.state.alarmVisible==false){
        this.setState({
          alarmVisible:!this.state.alarmVisible
        })
        return true
      }
      return false
    }else{
      if(this.state.alarmVisible==true){
        this.setState({
          alarmVisible:!this.state.alarmVisible
        })
      }
      return true
    }
  }

  hideSwitchUserModal = () => {
      this.setState({
        switchUserVisible:false
      })
      this.props.hideModal()
  }

  render() {
    const {
      type,
      props,
      isLoading,
      pointInfo,
      dictBindString,
      switchVisible,
      switchData,
      hideModal,
      optimizeSetting,
      timeSetting,
      showOperatingModal,
      showObserverSecModal,
      showObserverModal,
      operateSwitch,
      switchHide,
      showCheckboxModal,
      checkboxVisible,
      checkboxData,
      checkboxHide,
      checkboxSetting,
      showOperatingTextModal,
      textVisible,
      textData,
      textHide,
      textSetting,
      showRadioModal,
      radioVisible,
      radioData,
      radioHide,
      showSelectControlModal,
      selectVisible,
      selectData,
      selectHide,
      getToolPoint,
      observerSetting,
      showCommomAlarm,
      getTendencyModal,
      alarmHide,
      alarmVisible,
      alarmData,
      checkboxMainSetting,
      bShowTimeShaft,
      dateModal,
      curValue,
      observerModalDict,
      tableCellSetting,
      newTableCellSetting,
      reportCellSetting,
      updatePage,
      modalConditionDict,
      customList,
      customListInModal,
      custom_realtime_data,
      // point_realtime_data,
      tableLoading,
      custom_table_data,
      showModal,
      tableOneClick,
      refreshReportFun,
      refreshBenchmarkFun,
      refreshBenchmark,
      tableLoadingFun,
      getTimePickerRealTimeData,
      getRectanglesPanelData,
      refreshTimePickerData,
      refreshRectanglePanelData,
      refreshCustomData,
      refreshCustomDataInModal,
      getCustomRealTimeData,
      hideTendencyModal,
      tendencyVisible,
      tendencyData
      // getPointRealTimeData
    } = this.props;
    if (!this.props.type) {
        return null;  
    }
    if (type === modalTypes.POINT_MODAL) {
      return (
        <PointModal
          { ...props }
          hideModal={hideModal}
        />
      );
    }
    else if (type === modalTypes.OBSERVER_MODAL) { 
      return (
        <ObserverModal
          { ...props }
          hideModal={hideModal}
          showOperatingModal={showOperatingModal}
          showObserverSecModal={showObserverSecModal}
          showObserverModal={showObserverModal}
          switchVisible={switchVisible}
          switchData={switchData}
          switchHide={switchHide}
          handleOk={operateSwitch}
          isLoading={isLoading}
          pointInfo={pointInfo.pointInfo}
          showCheckboxModal={showCheckboxModal}
          checkboxVisible={checkboxVisible}
          checkboxData={checkboxData}
          checkboxHide={checkboxHide}
          checkboxSetting={checkboxSetting}
          showOperatingTextModal={showOperatingTextModal}
          textVisible={textVisible}
          textData={textData}
          textHide={textHide}
          textSetting={textSetting}
          showRadioModal={showRadioModal}
          radioVisible={radioVisible}
          radioData={radioData}
          radioHide={radioHide}
          showSelectControlModal={showSelectControlModal}
          selectVisible={selectVisible}
          selectData={selectData}
          selectHide={selectHide}
          getToolPoint={getToolPoint}
          observerSetting={observerSetting}
          showCommomAlarm={showCommomAlarm}
          getTendencyModal={getTendencyModal}
          alarmHide={alarmHide}
          alarmVisible={alarmVisible}
          alarmData={alarmData}
          bShowTimeShaft={bShowTimeShaft}
          dateModal={dateModal}
          curValue={curValue}
          observerModalDict={observerModalDict}
          modalConditionDict={modalConditionDict}
          customList={customList}
          custom_realtime_data={custom_realtime_data}
          /* point_realtime_data ={point_realtime_data} */
          tableLoading={tableLoading}
          custom_table_data={custom_table_data}
          showModal={showModal}
          tableOneClick={tableOneClick}
          refreshReportFun={refreshReportFun}
          refreshBenchmarkFun={refreshBenchmarkFun}
          refreshBenchmark={refreshBenchmark}
          tableLoadingFun={tableLoadingFun}
          getTimePickerRealTimeData={getTimePickerRealTimeData}
          getRectanglesPanelData={getRectanglesPanelData}
          refreshTimePickerData={refreshTimePickerData}
          refreshRectanglePanelData={refreshRectanglePanelData}
          refreshCustomData={refreshCustomData  }
          refreshCustomDataInModal={refreshCustomDataInModal}
          customListInModal={customListInModal}
          getCustomRealTimeData={getCustomRealTimeData}
          /* getPointRealTimeData ={getPointRealTimeData} */
        />
      );
    }
    else if (type === modalTypes.SWITCH_USER_MODAL) { 
      return (
        <SwitchUser
          visible = {this.state.switchUserVisible}
          handleHide={this.hideSwitchUserModal}
          initialize={()=>{store.dispatch(initialize())}}
        />
      );
    } else if (type === modalTypes.OPTIMIZE_VALUE_MODAL) {
      return  (
       <OptimizeValueModal
          { ...props }
          hideModal={hideModal}
          handleOk={optimizeSetting}
          isLoading={isLoading}
          pointInfo={pointInfo}
          dictBindString={dictBindString}
          modalConditionDict={modalConditionDict}
        />
      );
    }else if (type === modalTypes.TIME_PICKER_MODAL) {
      return  (
       <TimePickerModal
          { ...props }
          hideModal={hideModal}
          handleOk={timeSetting}
          isLoading={isLoading}
          pointInfo={pointInfo}
          modalConditionDict={modalConditionDict}
        />
      );
    }  else if (type === modalTypes.TABLE_CELL_MODAL){
      return (
          <TableValueModal
            { ...props }
            hideModal={hideModal}
            handleOk={newTableCellSetting}
            isLoading={isLoading}
            pointInfo={pointInfo}
            modalConditionDict={modalConditionDict}
          />
      )
    }else if (type === modalTypes.SCHEDULE_CELL_MODAL){
      return (
          <TableValueModal
            { ...props }
            hideModal={hideModal}
            handleOk={tableCellSetting}
            isLoading={isLoading}
            pointInfo={pointInfo}
            modalConditionDict={modalConditionDict}
          />
      )
    }  else if (type === modalTypes.REPORT_CELL_MODAL){
      return (
          <ReportValueModal
            { ...props }
            hideModal={hideModal}
            handleOk={reportCellSetting}
            isLoading={isLoading}
            pointInfo={pointInfo}
            modalConditionDict={modalConditionDict}
          />
      )
    } else if( type === modalTypes.ALARM_MAININTERFACE_MODAL ){
      return (
        <MainInterfaceModal
          { ...props }
          hideModal={hideModal}
        /> 
      )
    } 
    // else if( type === modalTypes.MAIN_CHECKBOX_SET_VALUE_MODAL ){
    //     // return (
    //     //   <HighestCheckboxModal
    //     //     {...props}
    //     //     hideModal={hideModal}
    //     //     isLoading={isLoading}
    //     //     checkboxMainSetting={checkboxMainSetting}
    //     //     modalConditionDict={modalConditionDict}
    //     //   />
    //     // )
    // } 
    else if (type === modalTypes.CREATE_DASHBOARD_MODAL) { 
      return (
        <CreateDashboardModal
          { ...props }
          hideModal={hideModal}
          updatePage={updatePage}
        />
      );
    } else {
      return null;
    }
  }
}

Modal.propTypes = {
};

export default Modal;
