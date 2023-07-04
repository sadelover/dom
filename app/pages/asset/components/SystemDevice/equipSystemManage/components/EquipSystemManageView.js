import React from 'react'
import { Button ,Select, Input ,Modal,message,DatePicker } from 'antd'
import s from './EquipSystemManageView.css'
import {modalTypes} from '../../../../../../common/enum'
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const {  MonthPicker, RangePicker } = DatePicker;
const monthFormat = 'YYYY/MM';
/**
 * 引入组件文件
 */
import TableView from '../containers/TableContainer'
import AddListModalView   from './AddListModalView'
import ModifyModalView   from './ModifyModalView'
const Search = Input.Search;
const Option = Select.Option;
class EquipSystemManageView extends React.PureComponent{
    constructor(props){
        super(props)
        this.state={
            time:""
        }
        this.handleChange = this.handleChange.bind(this);
        this.delList = this.delList.bind(this);
        this.modifyList = this.modifyList.bind(this);
    }
    // componentwillMount(){
    //     this.props.searchList()
    // }
    componentDidMount(){
       let time = moment().format(monthFormat);
       this.props.reloadTable(time)
    }
    delList(){
        var _this = this
        if(this.props.table.selectedIds.length){
            Modal.confirm({
                title : '确定要删除选中数据吗？',
                content : '点击确认后数据将无法找回。',
                onOk(){
                    _this.props.delList()
                }
            })
            return 
        }else{
            Modal.confirm({
                title:'请至少选中一条数据'
            })
        }
    }
    modifyList(){
        const {table} = this.props
        switch(this.props.table.selectedIds.length){
            case 0:
            Modal.confirm({
                title:'请至少选中一条数据'
            })
                break;
            case 1:
                this.props.showModal(modalTypes.EQUIPSYSTEM_MODIFY_MODAL,{})
                break;
            default:
            Modal.confirm({
                title:'只能编辑一条数据'
            })              
        }
    }
    handleChange(dates,dateStrings) {
        this.setState({
            time:dateStrings
        })
        // let searchKey = document.getElementById("in").value?document.getElementById("in").value:"";
        // let time = this.state.time;
        // this.props.searcherList(searchKey,time)
      }
    /**
     * 组件渲染
     * 
     * @returns 
     * @memberof DeviceManage2View
     */
    render(){
        const {
            showModal, //func
            hideModal,
            modal, //props
            table,
            addList,
            delList,
            modifyList
        } = this.props
        let fileList = table.fileList
        let recordData = table.recordData
        let searchData = table.searchData
        let userData = table.userData
        return (
            <div className={s['inner-container']}>
                <div className={s['header']} >
                    <div className={s['btns-wrap']} >
                        <Button type='primary'  icon="plus" className={s['btn-common']} onClick={()=>showModal(modalTypes.EQUIPSYSTEM_MODAL,{})}>添加</Button>
                        <Button icon='edit' className={s['btn-common']} onClick={this.modifyList} >修改</Button>                        
                        <Button icon='delete' className={s['btn-common']} onClick={this.delList}>删除</Button>
                    </div>
                </div>
                <div className={s['table-wrap']} >
                    <TableView/>
                </div>
                <AddListModalView       
                    modal={modal}                    
                    hideModal={hideModal}
                    table={table}
                    addList={addList}
                />
                <ModifyModalView
                    modal={modal}                    
                    hideModal={hideModal}
                    table={table}
                    modifyList={modifyList}
                />  
            </div>
        )
    }
}

export default EquipSystemManageView