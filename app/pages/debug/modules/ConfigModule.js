import appConfig from '../../../common/appConfig';
import http from '../../../common/http';
import {Modal} from 'antd'
// ------------------------------------
// Constants
// ------------------------------------

const CHANGE_VALUE = 'Config.CHANGE_VALUE'

// ------------------------------------
// Actions
// ------------------------------------

  export function reset() {
    return {
      type: RESET_POINT_TABLE
    };
  }
  
  export function changeValue(code){
      return {
          type : CHANGE_VALUE,
          code
      }
  }

  export function saveConfig(){
      return function(dispatch,getState){
        let code = getState().debug.config.code
        http.post('/project/saveConfig',{
            config : JSON.stringify(code)
        }).then(
            data=>{
                if(data.status){
                    // message.success('保存成功',2.5)
                }else{
                    Modal.error({
                        title: '错误提示',
                        content: "后台接口-"+data.msg
                    })
                }
            }
        )
      }
  }

  export function getConfig(){
      return function(dispatch,getState){
          http.post('/project/getConfig')
          .then(
              data=>{
                  if(data.status){
                      dispatch({
                          type : CHANGE_VALUE,
                          code : data.data
                      })
                  }
              }
          )
      }
  }
  
  // ------------------------------------
  // Action Handlers
  // ------------------------------------
  const ACTION_HANDLERS = {
      [CHANGE_VALUE] : (state,action) => {
          return {...state,code:action.code}
      }
  }
  
  // ------------------------------------
  // Reducer
  // ------------------------------------
  const initialState = {
    code : ''
  };
  export default function ConfigReducer (state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type];
  
    return handler ? handler(state, action) : state;
  }
  