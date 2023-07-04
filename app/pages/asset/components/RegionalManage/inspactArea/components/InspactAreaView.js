import React from 'react'
import { Button , Input ,Modal,message,Select} from 'antd'
import s from './InspactAreaView.css'
import {modalTypes} from '../../../../../../common/enum'



/**
 * 引入组件文件
 */
import TableView from '../containers/TableContainer'
import AddListModalView from './AddListModalView'

const Search = Input.Search

class InspactAreaView extends React.PureComponent{
    //构造函数
    constructor(props){
        super(props)
        this.state={
            insId:''
        }
        this.searchArea = this.searchArea.bind(this)
        this.addList = this.addList.bind(this)
        this.delList = this.delList.bind(this)
    }

    componentDidMount(){
        this.props.searchArea('')
    }


    //查询
    searchArea(values){
        //调用TableModule的方法，查询巡检统计
        this.props.searchArea(values)
    }

    addList(){
        //调用TableModule的方法，查询巡检任务，展示下拉列表
        this.props.showModal(modalTypes.ADD_INSPACT_AREA_MODAL,{})
    }

    delList(value){
        var _this = this
        if(this.props.table.selectedIds.length>0){
            Modal.confirm({
                title : '确定要删除选中数据吗？',
                content : '点击确认后数据将无法找回。',
                onOk(){
                    //这里的delList调用的是TableModule.js里面定义的delList方法，已经作为参数传递过来
                    _this.props.delList()
                }
            })
            return 
        }else{
            showMessage('请至少选中一条数据')
        }
    }

    render(){
        const {
            showModal, //func
            hideModal,
            addList,
            delList,
            modifySeq,
            modal, //props
            table
        } = this.props

        var children ='';
        if(table.insdata){
            children=table.insdata.map(row => {
                return <Option key={row.id}>{row.title}</Option>
            });  
        }

        return (
             //查询头部信息
        <div className={s['inner-container']}>
             <div className={s['header']} >
                    <div className={s['btns-wrap']} >
                        <Button type='primary'  icon="plus" className={s['btn-common']} onClick={this.addList}  >添加</Button>
                        <Button icon='delete' className={s['btn-common']} onClick={this.delList}  >删除</Button>
                     </div>
             </div>
         
             <div className={s['table-wrap']} >
                 <TableView modifySeq={modifySeq}/>
             </div>
             <AddListModalView //添加巡检计划窗口
                    hideModal={hideModal}
                    modal={modal}
                    table={table}
                    addList={addList}
             />
        </div>
            
        )
    }
}

export default InspactAreaView