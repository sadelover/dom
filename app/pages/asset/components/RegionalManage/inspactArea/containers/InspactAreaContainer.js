import {connect} from 'react-redux'
import InspactAreaView from '../components/InspactAreaView'

/**
 * 将TableModule对象中获取到的ajax数据，通过state传递给InspactPolicyManageView
 * state是参数，
 * state.inspactPolicyManage:  是rootReducer.js中 包含的 inspactPolicyManage对象
 * 
 * state.inspactPolicyManage.base 对应于InspactPolicyManageContainer.js中  
 *  export default combineReducers({
 *    base: InspactPolicyManage, //保存reducer产生的 state对象  数据格式为  initialState内部定义的格式
 *    table
 *  });
 * @param {
 */
const mapStateToProps = (state) => {
    return {
        ...state.inspactArea.base,
        table:state.inspactArea.table
    }
}

//引入业务操作层的操作方法 主要用于请求后台或者传递数据给后台  并将常量传递给DeviceManageView
import {
    searchArea,
    addList,
    delList,
    modifySeq
} from '../modules/TableModule'

//引入Dom操作层方法 主要用于页面操作，并将常量传递给DeviceManageView
import {
    showModal,
    hideModal
} from '../modules/InspactAreaModule'

//Redux连接器，用于组件与数据之间的结合
const mapActionCreator = {
    searchArea,
    showModal,
    hideModal,
    addList,
    delList,
    modifySeq
}
//export 将DeviceManage返回给DeviceManageContainer
export default connect(mapStateToProps,mapActionCreator)(InspactAreaView)