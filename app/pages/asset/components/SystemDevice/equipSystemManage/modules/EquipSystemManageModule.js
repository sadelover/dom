import {combineReducers} from 'redux'
import table from './TableModule'
// ------------------------------------
// Constants
// ------------------------------------
export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'

// ------------------------------------
// Reducer
// ------------------------------------

//显示模态框
export function showModal(type,props){
  return {
    type : SHOW_MODAL,
    modal : {
      type : type,
      props : props
    }
  }
}

export function hideModal(){
  return {
    type : HIDE_MODAL,
    modal : {
      type : null,
      props : {}
    }
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const  ACTION_HANDLERS = {
  [SHOW_MODAL] :  (state,action)=>{
    return Object.assign({},state,{modal:action.modal})
  },
  [HIDE_MODAL] : (state,action) => {
    return Object.assign({},state,{modal:action.modal})
  }
}

const initialState = {
  modal : {
    type : null,
    props : {}
  }
};

const EquipSystemManage =  function(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}

export default combineReducers({
  base: EquipSystemManage,
  table
});

