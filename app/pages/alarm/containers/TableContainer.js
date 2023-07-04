import {connect} from 'react-redux'
import TableView from '../components/TableView'

const mapStateToProps = ( state ) => {
    let data = state.alarmManage.table.data.map( (item,index)=>{
        item["key"] =  item.id
        switch (item.type) { //分辨报警类型
            case 1:
                item['mold']='非零报警'
                return item
            case 0:
                item['mold']='高低限报警'
                return item
            default:
                return item
        }
    } )
    return {
        data : data,
        rowKey:'key', //不能重复
        loading : state.alarmManage.table.loading,
        selectedIds : state.alarmManage.table.selectedIds
    }
}

import {toggleIsChose,currentRowInfo,onSelectChange} from '../modules/TableModule'

const mapActionCreator = {
    toggleIsChose,
    currentRowInfo,
    onSelectChange
}

export default connect(mapStateToProps,mapActionCreator)(TableView)