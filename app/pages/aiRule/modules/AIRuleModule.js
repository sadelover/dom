import appConfig from '../../../common/appConfig';
import { combineReducers } from 'redux';
import http from '../../../common/http';
import { message } from 'antd';
import { history } from '../../../index';
import { push } from 'react-router-redux';
import inputPointTable from './InputPointModalModule';
import outputPointTable from './OutputPointModalModule'

// ------------------------------------
// Constants
// ------------------------------------
const RESET = 'PageManage.RESET';
const ADD_PAGE = 'PageManage.ADD_PAGE';
const REMOVE_PAGE = 'PageManage.REMOVE_PAGE';
const SHOW_POINT_MODAL = 'SHOW_POINT_MODAL'
const HIDE_POINT_MODAL = 'HIDE_POINT_MODAL'
// ------------------------------------
// Actions
// ------------------------------------
export const reset = () => {
  return {
    type: RESET
  }
}

//创建左侧页面
//data[arr]
export const addPage = (data) => {
  
}

export const removePage = (data) => {
 
}

//修改页面信息
export const updatePage = (oldName, newData) => {
  
}

//点位选择模态框的显示
export function showPointModal(type, props) {
  return {
      type: SHOW_POINT_MODAL,
      modal: {
          type,
          props
      }
  }
}

export function hidePointModal() {
  return {
      type: HIDE_POINT_MODAL
  }
}



// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RESET]: (state, action) => {
    return initialState;
  },
  [ADD_PAGE]: (state, action) => {
    return { ...state, pageList: [...state.pageList, action.data] }
  },
  [SHOW_POINT_MODAL]: (state, action) => {
      return { ...state, modal: action.modal }
  },
  [HIDE_POINT_MODAL]: (state) => {
      return { ...state, modal: initialState.modal }
  },
  [REMOVE_PAGE]: (state, action) => {
    //let pages = state.pages.slice();
    let pageList = state.pageList.slice();
    //let idxInPages = pages.map(row => row._id).indexOf(action.pageId);
    let idxInPageList = pageList.indexOf(action.pageId);

    // if (idxInPages > -1) {
    //   pages.splice(idxInPages, 1);
    // }
    if (idxInPageList > -1) {
      pageList.splice(idxInPageList, 1);
    }
    return { ...state, pageList: pageList }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  pages: [],
  pageList: [],
  modal: {
      type: undefined,
      props: {}
  }
};

const reducer =  function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
};

export default combineReducers({
  reducer,
  inputPointTable,
  outputPointTable
});