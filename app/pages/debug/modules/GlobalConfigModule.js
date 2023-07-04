import appConfig from '../../../common/appConfig';
import http from '../../../common/http';
import {message} from 'antd'
// ------------------------------------
// Constants
// ------------------------------------
const UPDATE_IMG_URL = 'Global.UPDATE_IMG_URL'
const REGIST_MODAL = 'Global.REGIST_MODAL'

// ------------------------------------
// Actions
// ------------------------------------

  
  export function uploadBg(files){
    return function(dispatch,getState){
      
      let data =new FormData();
      data.append('logofile',files);
      http.post('/globalSetting/uploadLogo',data,{
        headers: {
          // 'Content-Type': 'multipart/form-data'
        }
      }).then(
        data=>{
          if(!data.err){
              message.success('上传成功')
              dispatch(updateImgUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/images/logo.png?r=${Math.random()}`))
          }else{
            message.error(data.msg,2.5)
          }
        }
      )
    }
  }
  
  export function updateImgUrl(imgPath){
    return {
      type : UPDATE_IMG_URL,
      imgPath : imgPath
    }
  }
  export function RegistModal(data){
     return {
       type:REGIST_MODAL,
       data:data
     }
  }
  // ------------------------------------
  // Action Handlers
  // ------------------------------------
  const ACTION_HANDLERS = {
    [UPDATE_IMG_URL] : (state,action) => {
      return {...state,imgPath:action.imgPath}
    },
    [REGIST_MODAL]:(state,action)=>{
      return {...state,visible:action.data}
    }
  }
  
  // ------------------------------------
  // Reducer
  // ------------------------------------
  const initialState = {
    visible:false,
    imgPath : `http:\/\/${localStorage.getItem('serverUrl')}/static/images/logo.png?r=${Math.random()}`
  };
  export default function ConfigReducer (state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type];
  
    return handler ? handler(state, action) : state;
  }
  