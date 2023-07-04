import http from '../../../common/http'
import {message} from 'antd'
import CheckWorker from '../../../common/checkWorker'
import {syncFunc,addOperation} from '../../../common/utils';
import moment from 'moment';
import {modalTypes} from '../../../common/enum'
import { showModal} from  '../../modal/modules/ModalModule'

export const SHOW_COMMANDLOG = 'commandLog.SHOW_COMMANDLOG';
export const HIDE_COMMANDLOG = 'commandLog.HIDE_COMMANDLOG';

export function getCommandLogModal(point) {
    return function (dispatch,getState) { 
      dispatch(showCommandLogModal({point}))
    }
}

export function showCommandLogModal(point){
    return {
     type: SHOW_COMMANDLOG,
     visible:true,
     point
   }
 }

 export function hideCommandLogModal() {
   return {
     type: HIDE_COMMANDLOG
   }
 }

const ACTION_HANDLERS = {
    [SHOW_COMMANDLOG] : (state, action) => {
          return {...state, commandLogVisible: action.visible, commandLogPoint: action.point }
        },
    [HIDE_COMMANDLOG] : (state) => {
          return {...state,commandLogVisible:false, point:'' }
    }
}
const initialState = {
  commandLogVisible: false,
  commandLogPoint: ''
};  
export default function homeReducer (state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ? handler(state, action) : state
  }
  
  