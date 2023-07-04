import http from '../../../common/http'
import {message} from 'antd'
import CheckWorker from '../../../common/checkWorker'
import {syncFunc,addOperation} from '../../../common/utils';
import moment from 'moment';

export const AHU_DATASOURCE = 'ahu.AHU_DATASOURCE'
export const AHU_LOADING = 'ahu.AHU_LOADING'
export const AHU_SWITCH_VISIABLE = 'ahu.AHU_SWITCH_VISIABLE'
export const AHU_SETTING_VISIABLED = 'ahu.AHU_SETTING_VISIABLED'
export const LIGHT_DATASOURCE = 'ahu.LIGHT_DATASOURCE'
export const LIGHT_LOADING = 'ahu.LIGHT_LOADING'
export const LIGHT_SWITCH_VISIABLE = 'ahu.LIGHT_SWITCH_VISIABLE'
export const LIGHT_SETTING_VISIABLED = 'ahu.LIGHT_SETTING_VISIABLED'
export const FAU_DATASOURCE = 'ahu.FAU_DATASOURCE'
export const FAU_LOADING = 'ahu.FAU_LOADING'
export const FAU_SWITCH_VISIABLE = 'ahu.FAU_SWITCH_VISIABLE'
export const FAU_SETTING_VISIABLED = 'ahu.FAU_SETTING_VISIABLED'
export const FAN_DATASOURCE = 'ahu.FAN_DATASOURCE'
export const FAN_LOADING = 'ahu.FAN_LOADING'
export const FAN_SWITCH_VISIABLE = 'ahu.FAN_SWITCH_VISIABLE'
export const FAN_SETTING_VISIABLED = 'ahu.FAN_SETTING_VISIABLED'
export const FCU_DATASOURCE = 'ahu.FCU_DATASOURCE'
export const FCU_LOADING = 'ahu.FCU_LOADING'
export const FCU_SWITCH_VISIABLE = 'ahu.FCU_SWITCH_VISIABLE'
export const FCU_SETTING_VISIABLED = 'ahu.FCU_SETTING_VISIABLED'
export const VALVE_DATASOURCE = 'ahu.VALVE_DATASOURCE'
export const VALVE_LOADING = 'ahu.VALVE_LOADING'
export const VALVE_SWITCH_VISIABLE = 'ahu.VALVE_SWITCH_VISIABLE'
export const VALVE_SETTING_VISIABLED = 'ahu.VALVE_SETTING_VISIABLED'
export const ENVIRONMENT_DATASOURCE = 'ahu.ENVIRONMENT_DATASOURCE'
export const ENVIRONMENT_LOADING = 'ahu.ENVIRONMENT_LOADING'
export const ENVIRONMENT_SWITCH_VISIABLE = 'ahu.ENVIRONMENT_SWITCH_VISIABLE'
export const ENVIRONMENT_SETTING_VISIABLED = 'ahu.ENVIRONMENT_SETTING_VISIABLED'
//空调箱数据
export function AHUControlData(data){
    return{
      type:AHU_DATASOURCE,
      AHUControlDataSource:data
    }
}
export function AHUloading(data){
    return{
        type:AHU_LOADING,
        AHUloadingVisiable:data
    }
}
//空调箱开关
export function AHUSwitch(data){
    return{
        type:AHU_SWITCH_VISIABLE,
        AHUSwitchVisiable:data
    }
}
//空调箱设定值
export function AHUSetting(data){
    return{
        type:AHU_SETTING_VISIABLED,
        AHUSettingVisiable:data
    }
}

export function LightData(data){
    return{
      type:LIGHT_DATASOURCE,
      LightingControlDataSource:data
    }
}
export function Lightloading(data){
    return{
        type:LIGHT_LOADING,
       LightingloadingVisiable:data
    }
}
//空调箱开关
export function LightSwitch(data){
    return{
        type:LIGHT_SWITCH_VISIABLE,
        LightingSwitchVisiable:data
    }
}
//空调箱设定值
export function LightSetting(data){
    return{
        type:LIGHT_SETTING_VISIABLED,
        LightingSettingVisiable:data
    }
}
export function FAUData(data){
    return{
      type:FAU_DATASOURCE,
      FAUControlDataSource:data
    }
}
export function FAUloading(data){
    return{
        type:FAU_LOADING,
        FAUloadingVisiable:data
    }
}
export function FAUSwitch(data){
    return{
        type:FAU_SWITCH_VISIABLE,
        FAUSwitchVisiable:data
    }
}
export function FAUSetting(data){
    return{
        type:FAU_SETTING_VISIABLED,
        FAUSettingVisiable:data
    }
}
export function FANData(data){
    return{
      type:FAN_DATASOURCE,
      FANControlDataSource:data
    }
}
export function FANloading(data){
    return{
        type:FAN_LOADING,
        FANloadingVisiable:data
    }
}
export function FANSwitch(data){
    return{
        type:FAN_SWITCH_VISIABLE,
        FANSwitchVisiable:data
    }
}
export function FANSetting(data){
    return{
        type:FAN_SETTING_VISIABLED,
        FANSettingVisiable:data
    }
}

export function FCUData(data){
    return{
      type:FCU_DATASOURCE,
      FCUControlDataSource:data
    }
}
export function FCUloading(data){
    return{
        type:FCU_LOADING,
        FCUloadingVisiable:data
    }
}
export function FCUSwitch(data){
    return{
        type:FCU_SWITCH_VISIABLE,
        FCUSwitchVisiable:data
    }
}
export function FCUSetting(data){
    return{
        type:FCU_SETTING_VISIABLED,
        FCUSettingVisiable:data
    }
}
export function ValveData(data){
    return{
      type:VALVE_DATASOURCE,
      ValveControlDataSource:data
    }
}
export function Valveloading(data){
    return{
        type:VALVE_LOADING,
        ValveloadingVisiable:data
    }
}
export function ValveSwitch(data){
    return{
        type:VALVE_SWITCH_VISIABLE,
        ValveSwitchVisiable:data
    }
}
export function ValveSetting(data){
    return{
        type:VALVE_SETTING_VISIABLED,
        ValveSettingVisiable:data
    }
}
export function EnvironmentData(data){
    return{
      type:ENVIRONMENT_DATASOURCE,
      EnvironmentControlDataSource:data
    }
}
export function Environmentloading(data){
    return{
        type:ENVIRONMENT_LOADING,
        EnvironmentloadingVisiable:data
    }
}
export function EnvironmentSwitch(data){
    return{
        type:ENVIRONMENT_SWITCH_VISIABLE,
        EnvironmentSwitchVisiable:data
    }
}
export function EnvironmentSetting(data){
    return{
        type:ENVIRONMENT_SETTING_VISIABLED,
        EnvironmentSettingVisiable:data
    }
}


const ACTION_HANDLERS = {
    [AHU_DATASOURCE]:(state,action)=>{
        return{...state,AHUControlDataSource:action.AHUControlDataSource}
    },
    [AHU_LOADING]:(state,action)=>{
        return {...state,AHUloadingVisiable:action.AHUloadingVisiable}
    },
    [AHU_SWITCH_VISIABLE]:(state,action)=>{
        return{...state,AHUSwitchVisiable:action.AHUSwitchVisiable}
    },
    [AHU_SETTING_VISIABLED]:(state,action)=>{
        return{...state,AHUSettingVisiable:action.AHUSettingVisiable}
    },
    [LIGHT_DATASOURCE]:(state,action)=>{
        return{...state,LightingControlDataSource:action.LightingControlDataSource}
    },
    [LIGHT_LOADING]:(state,action)=>{
        return {...state,LightingloadingVisiable:action.LightingloadingVisiable}
    },
    [LIGHT_SWITCH_VISIABLE]:(state,action)=>{
        return{...state,LightingSwitchVisiable:action.LightingSwitchVisiable}
    },
    [LIGHT_SETTING_VISIABLED]:(state,action)=>{
        return{...state,LightingSettingVisiable:action.LightingSettingVisiable}
    },
    [FAU_DATASOURCE]:(state,action)=>{
        return{...state,FAUControlDataSource:action.FAUControlDataSource}
    },
    [FAU_LOADING]:(state,action)=>{
        return {...state,FAUloadingVisiable:action.FAUloadingVisiable}
    },
    [FAU_SWITCH_VISIABLE]:(state,action)=>{
        return{...state,FAUSwitchVisiable:action.FAUSwitchVisiable}
    },
    [FAU_SETTING_VISIABLED]:(state,action)=>{
        return{...state,FAUSettingVisiable:action.FAUSettingVisiable}
    },
    [FAN_DATASOURCE]:(state,action)=>{
        return{...state,FANControlDataSource:action.FANControlDataSource}
    },
    [FAN_LOADING]:(state,action)=>{
        return {...state,FANloadingVisiable:action.FANloadingVisiable}
    },
    [FAN_SWITCH_VISIABLE]:(state,action)=>{
        return{...state,FANSwitchVisiable:action.FANSwitchVisiable}
    },
    [FAN_SETTING_VISIABLED]:(state,action)=>{
        return{...state,FANSettingVisiable:action.FANSettingVisiable}
    },
    [FCU_DATASOURCE]:(state,action)=>{
        return{...state,FCUControlDataSource:action.FCUControlDataSource}
    },
    [FCU_LOADING]:(state,action)=>{
        return {...state,FCUloadingVisiable:action.FCUloadingVisiable}
    },
    [FCU_SWITCH_VISIABLE]:(state,action)=>{
        return{...state,FCUSwitchVisiable:action.FCUSwitchVisiable}
    },
    [FCU_SETTING_VISIABLED]:(state,action)=>{
        return{...state,FCUSettingVisiable:action.FCUSettingVisiable}
    },
    [VALVE_DATASOURCE]:(state,action)=>{
        return{...state,ValveControlDataSource:action.ValveControlDataSource}
    },
    [VALVE_LOADING]:(state,action)=>{
        return {...state,ValveloadingVisiable:action.ValveloadingVisiable}
    },
    [VALVE_SWITCH_VISIABLE]:(state,action)=>{
        return{...state,ValveSwitchVisiable:action.ValveSwitchVisiable}
    },
    [VALVE_SETTING_VISIABLED]:(state,action)=>{
        return{...state,ValveSettingVisiable:action.ValveSettingVisiable}
    },
    [ENVIRONMENT_DATASOURCE]:(state,action)=>{
        return{...state,EnvironmentControlDataSource:action.EnvironmentControlDataSource}
    },
    [ENVIRONMENT_LOADING]:(state,action)=>{
        return {...state,EnvironmentloadingVisiable:action.EnvironmentloadingVisiable}
    },
    [ENVIRONMENT_SWITCH_VISIABLE]:(state,action)=>{
        return{...state,EnvironmentSwitchVisiable:action.EnvironmentSwitchVisiable}
    },
    [ENVIRONMENT_SETTING_VISIABLED]:(state,action)=>{
        return{...state,EnvironmentSettingVisiable:action.EnvironmentSettingVisiable}
    }
    
}
const initialState = {
    AHUControlDataSource:[],
    AHUloadingVisiable:false,
    AHUSwitchVisiable:false,
    AHUSettingVisiable:false,
    LightingControlDataSource:[],
    LightingloadingVisiable:false,
    LightingSwitchVisiable:false,
    LightingSettingVisiable:false,
    FAUControlDataSource:[],
    FAUloadingVisiable:false,
    FAUSwitchVisiable:false,
    FAUSettingVisiable:false,
    FANControlDataSource:[],
    FANloadingVisiable:false,
    FANSwitchVisiable:false,
    FANSettingVisiable:false,
    FCUControlDataSource:[],
    FCUloadingVisiable:false,
    FCUSwitchVisiable:false,
    FCUSettingVisiable:false,
    ValveControlDataSource:[],
    ValveloadingVisiable:false,
    ValveSwitchVisiable:false,
    ValveSettingVisiable:false,
    EnvironmentControlDataSource:[],
    EnvironmentloadingVisiable:false,
    EnvironmentSwitchVisiable:false,
    EnvironmentSettingVisiable:false
};  
export default function homeReducer (state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
  }
  
  