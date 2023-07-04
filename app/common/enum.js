//模态框类型枚举
export const modalTypes = {
  // 操作记录模态框
  OPERATION_RECORD_MODAL: 0,
  // 报警管理模态框
  ALARM_MANAGE_MODAL: 1,
  // 点选择模态框
  POINT_MODAL: 2,
  // 报警历史模态框
  HISTORY_WARNING_MODAL: 3,
  // 设备弹出模态框
  OBSERVER_MODAL: 5,
  // 优化设置值模态框
  OPTIMIZE_VALUE_MODAL: 6,
  // 切换用户模态框
  SWITCH_USER_MODAL: 7,
  //设备开关模态框
  OPERATE_SWITCH_MODAL: 8,
  //添加报警模态框
  ALARM_MAININTERFACE_MODAL: 9,
  //主界面checkbox改值确认对话框
  MAIN_CHECKBOX_SET_VALUE_MODAL: 10,
  // table单元格改值模态框
  TABLE_CELL_MODAL: 11,
  //创建dashboard页面模态框
  CREATE_DASHBOARD_MODAL: 12,
  // 仪表盘的点选择模态框
  LINE_POINT_MODAL: 13,
  // report单元格改值模态框
  REPORT_CELL_MODAL: 14,
  // 日程模态框
  SCHEDULE_MODAL: 15,
  //时间控件模态框
  TIME_PICKER_MODAL: 16,
  //排班改值模态框
  SCHEDULE_CELL_MODAL: 17,
  //场景管理模态框
  SCENE_MODAL: 18,
  //模式管理模态框
  MODEL_MANAGE_MODAL: 19,
  //保修管理模态框
  REPAIR_MANAGEMENT_MODAL: 20,
  //场景控制模态框
  SCENE_CONTROL_MODAL: 21,
  //设备台账模态框
  DEVICE_MODAL: 22,
  //历史天气模态框
  WEATHERHISTORY_MODAL: 23,
  //资产模块
  ASSET_MODAL: 24,
  //资产心中modal
  ASSET_ADD_MODAL: 25,
  //资产模板
  ASSET_VISIBLE_MODAL: 26,
  //参数模板
  PARAMETER_MODAL: 27,
  //新增系统设备
  EQUIPSYSTEM_MODAL: 28,
  //修改系统设备
  EQUIPSYSTEM_MODIFY_MODAL: 29,
  //设备管理页面的添加模态框
  ADD_EQUIPMENT_MODAL: 30,
  //修改设备信息配置模态框
  MODIFY_EQUIPMENT_MODAL: 31,
  //显示选择页面的模态框
  SELECT_PAGES_MODAL: 32,
  // AI决策输入的点选择模态框
  AI_INPUT_POINT_MODAL: 33,
  // AI决策输出的点选择模态框
  AI_OUTPUT_POINT_MODAL: 34,
}

export const SecModalTypes = {
  // 设备二级弹出模态框
  OBSERVER_SEC_MODAL: 100
}

//实时报警模态框类型枚举
export const RealtimeWarning_modalTypes = {
  REALTIME_WARNING_MODAL: 1,
}


//Layout中设备开关模态框类型枚举
export const Layout_modalTypes = {
  ONE_KEY_OPERATE_MODAL: 1,
  SWITCH_MODAL: 2,
  CHECKBOX_MODAL: 3
}

//调试界面模态框类型
export const Debug_modalTypes = {
  MODIFY_POINT_MODAL: 1,
  HISTORY_MODAL: 2,
  MODEL_FORMULA_MODAL: 3,
  MODEL_DESCRIPTION_MODAL: 4
}

export const userRoles = {
  // 浏览访客
  VISITOR: '1',
  // 操作人员
  OPERATOR: '2',
  // 管理员
  ADMIN: '3',
  //调试人员
  DEBUG: '4',
  //高级调试人员
  HIGHDEBUG: '5'
}

export const userRoleNames = {
  [userRoles.VISITOR]: '等级1-浏览访客',
  [userRoles.OPERATOR]: '等级2-操作人员',
  [userRoles.ADMIN]: '等级3-管理人员',
  [userRoles.DEBUG]: '等级4-调试人员',
  [userRoles.HIGHDEBUG]: '等级5-高级调试人员'
}
