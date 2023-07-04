import React from 'react'
import { Button , Input ,Modal,message,Tabs} from 'antd'
import s from './TemplateManageView.css'
import {modalTypes} from '../../../../../../common/enum'
/**
 * 引入组件文件
 */
import TableView from '../containers/TableContainer'
import AddListModalView   from './AddListModalView'
import ModifyModalView   from './ModifyModalView'
import AssetModalView from './AssetModalView'
import ParemeterModal from './ParemeterModal'
const TabPane = Tabs.TabPane;
const Search = Input.Search
class TemplateManageView extends React.PureComponent{
    constructor(props){
        super(props)
        this.delList = this.delList.bind(this)
        this.modifyList = this.modifyList.bind(this)
        this.searchList = this.searchList.bind(this)
        this.release = this.release.bind(this)
    }
    componentDidMount(){
        this.props.reloadTable()
    }
    //删除delList
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
    //修改list
    modifyList(){
        const {searchTitle,table} = this.props
        let This = this
        switch(this.props.table.selectedIds.length){
            case 0:
            Modal.confirm({
                title:'请至少选中一条数据'
            })
                break;
            case 1:
                this.props.showModal(modalTypes.MODIFY_EXAM_MODAL,{})
                // searchTitle(table.selectedIds[0].toString())
                break;
            default:
            Modal.confirm({
                title:'只能编辑一条数据'
            })              
        }
    }
    release(){
        const {table} = this.props
        switch(this.props.table.selectedIds.length){
            case 0:
            Modal.confirm({
                title:'请至少选中一条考题'
            })
                break;
            case 1:
                this.props.searchUser(this.props.table.selectedIds[0])
                this.props.showModal(modalTypes.RELEASE_EXAM_MODAL,{})
                break;
            default:
            Modal.confirm({
                title:'只能发布一条考题'
            })              
        }
    }
    //查询
    searchList(value){
        this.props.searchList(value)
    }
    //showModal(modalTypes.RELEASE_EXAM_MODAL
    /**
     * 组件渲染
     * 
     * @returns 
     * @memberof TemplateManageView
     */
    render(){
        const {
            showModal, //func
            hideModal,
            addList,
            delList,
            modifyList,
            searchList,  
            modal, //props
            table,
            getData,
            reloadTable,   //刷新数据
            searchInsUser,
            searchUser,
            AddMadol,
            ModifyModal,
            AssetData,
            AssetLoading,
            ParemeterAddMoadal,
            ParemeterModifyMoadl,
            ParemeterLoading,
            ParemeterData,
            assetSelect
        } = this.props
        return (
            <div className={s['inner-container']}>
                <div className={s['header']} >
                    <div className={s['outer-wrap']}>
                        <div className={s['btns-wrap']} >
                            <Button type='primary'  icon="plus" className={s['btn-common']} onClick={()=>showModal(modalTypes.ASSET_VISIBLE_MODAL,{})}>新增</Button>
                            <Button icon='edit' className={s['btn-common']} onClick={this.modifyList}>修改</Button>
                            <Button icon='close' className={s['btn-common']} onClick={this.delList}  >删除</Button>
                        </div>
                        <div className={s['search-wrap']} >
                            <Search
                                placeholder='模板名称'
                                onSearch={this.searchList}
                            />
                        </div>
                    </div>
                </div>
                <div className={s['table-wrap']} > 
                    <TableView              //表单组件
                    showModal={showModal}
                    AddMadol={AddMadol}
                    />      
                </div>  
                <ModifyModalView
                    modifyList={modifyList}         
                    modal={modal}                     //考核成绩
                    hideModal={hideModal}
                    reloadTable={reloadTable}
                    table={table}
                />
                <AddListModalView       
                    modal={modal}                     //考核成绩
                    hideModal={hideModal}
                    addList={addList}
                    reloadTable={reloadTable}
                    table={table}
                />            
                <AssetModalView
                    modal={modal}
                    hideModal={hideModal}
                    showModal={showModal}
                    AddMadol={AddMadol}
                    ModifyModal={ModifyModal}
                    AssetData={AssetData}
                    AssetLoading={AssetLoading}            
                    table={table}
                    assetSelect={assetSelect}
                />
                <ParemeterModal
                    modal={modal}
                    hideModal={hideModal}
                    showModal={showModal}
                    ParemeterLoading={ParemeterLoading}
                    ParemeterData={ParemeterData}
                    ParemeterAddMoadal={ParemeterAddMoadal}
                    ParemeterModifyMoadl={ParemeterModifyMoadl}
                    table={table}
                />

            </div>
        )
    }
}

export default TemplateManageView