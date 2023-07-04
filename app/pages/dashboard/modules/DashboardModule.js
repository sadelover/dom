import appConfig from '../../../common/appConfig';
import { combineReducers } from 'redux';
import http from '../../../common/http';
import { Modal } from 'antd';
import { history } from '../../../index';
import { push } from 'react-router-redux';
import lineData from '../../dashboardLine/modules/LineModule';
import pointModal from '../../dashboardLine/modules/PointModalModule';

// ------------------------------------
// Constants
// ------------------------------------
const RESET = 'PageManage.RESET';
const ADD_PAGE = 'PageManage.ADD_PAGE';
const REMOVE_PAGE = 'PageManage.REMOVE_PAGE';
const INITIALIZE_PAGES = 'PageManage.INITIALIZE_PAGES';
// ------------------------------------
// Actions
// ------------------------------------
export const reset = () => {
  return {
    type: RESET
  }
}

export const initializePages = () => {
  return function (dispatch, getState) {
    // let state = getState();
    // let projects = state.login.projects;
    // let projectId = state.pageManage.selectedProjectId;

    return http.get('/dashboard/getPages').then(
      resp => {
        //得到page数据,需要传到pageListView中生成页面列表
        if (resp.err === 0) {
          dispatch({
            type : INITIALIZE_PAGES,
            pages: resp.data
          });
        } else {
          Modal.error({
            title: '错误提示',
            content: "后台接口-获取页面列表失败！"
          })
        }
      }
    )
  }
}

//创建左侧页面
//data[arr]
export const addPage = (data) => {
  return function (dispatch, getState) {
    // let postData = Object.assign({
    //   pageName: data,
    //   pageConfig: {
    //     name:"",
    //     points:[]
    //   }
    // })

    return http.post('/dashboard/createPage', {
      pageName: data.name
    }).then(
      resp => {
        if (resp.err === 0) {
          // message.success('新增成功！');
          dispatch({
            type : ADD_PAGE,
            data: data.name
          });
          
        } else {
          Modal.error({
            title: '错误提示',
            content: "后台接口-新增失败！"
          })
        }
      }
    )
    // .catch(
    //   error => {
    //     message.error('网络通讯失败！');
    //   }
    // )
  }
}

export const removePage = (data) => {
  let nameList = [data];
  return function (dispatch, getState) {
    return http.post('/dashboard/removePages', {
      pageNameList: nameList
    }).then(
      resp => {
        if (resp.err === 0) {
          // message.success('删除成功！');
          dispatch({
            type: REMOVE_PAGE,
            pageId: data
          });
          window.localStorage.removeItem(nameList)
        }
      }
    ).catch(
      error => {
        Modal.error({
          title: '错误提示',
          content: "后台接口-删除失败！"
        })
      }
    )
  }
}

//修改页面信息
export const updatePage = (oldName, newData) => {
  return function (dispatch, getState) {
    // let state = getState().pageManage;
    // let postData = Object.assign({
    //   _id: pageId,
    //   projectId: state.selectedProjectId
    // }, data)

    return http.post('/dashboard/updatePage', {
      pageName: oldName,
      newPageName: newData.name
    }).then(
      resp => {
        if (resp.err === 0) {
          // message.success('修改成功！');
          dispatch(initializePages());
        } else {
          Modal.error({
            title: '错误提示',
            content: "后台接口-修改失败！"
          })
        }
      }
    ).catch(
      error => {
        Modal.error({
          title: '错误提示',
          content: "后台接口-请求修改接口失败！"
        })
      }
    )
  }
}


// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RESET]: (state, action) => {
    return initialState;
  },
  [INITIALIZE_PAGES]: (state, action) => {
    return { ...state, pageList: action.pages }
  },
  [ADD_PAGE]: (state, action) => {
    return { ...state, pageList: [...state.pageList, action.data] }
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
  pageList: []
};

const reducer =  function (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
};

export default combineReducers({
  reducer,
  lineData,
  pointModal
});