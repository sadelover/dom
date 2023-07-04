import React from 'react'
import { Button,Input ,Modal,message,Layout,Tree,Upload,Icon,DatePicker,Select} from 'antd'
import s from './DeviceManageView.css'
import http from '../../../../../../common/http'
import {modalTypes} from '../../../../../../common/enum'
import appConfig from '../../../../../../common/appConfig'
import {downloadUrl} from '../../../../../../common/utils'

/**
 * 引入组件文件
 */
import TableView from '../containers/TableContainer'
import AddListModalView from './AddListModalView'
import ModifyModalView from './ModifyModalView'
const Search = Input.Search
const { Option } = Select;
class DeviceManageView2 extends React.PureComponent{
    constructor(props){
        super(props)
        this.addList = this.addList.bind(this)
        this.delList = this.delList.bind(this)
        this.modifyList = this.modifyList.bind(this)
        this.searchList = this.searchList.bind(this)
    }
    componentDidMount(){   
        this.props.treeTable()
        this.props.reloadTable()
        this.props.getAssetTemplate()
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
        switch(this.props.table.selectedIds.length){
            case 0:
                Modal.confirm({title:'请至少选中一个设备信息进行编辑'})
                break;
            case 1:
                let table =this.props.table
                let modifyData = table.data.filter((item)=>{
                    if(item.id == table.selectedIds[0]) return item
                })
                let modifyDict = modifyData.length && modifyData[0]
                this.props.setActiveKey('1')
                this.props.saveCurNewEquipId(Number(modifyDict["id"]),Number(modifyDict["model_id"]))
                //2023-4-20如果当前选择的系统是父级，由于无法在table里获取systemId，需要在当前函数中的modifyDict里取到system_id，单独保存到store里
                if (table.systemId == "") {
                    this.props.saveId(modifyDict["system_id"])
                }
                
                http.post('/equipment/getInitAsset',{
                    "project_id":0,
                    "template_id":Number(modifyDict["model_id"]),
                    "equip_id":Number(modifyDict["id"]) 
                }).then(
                    data=>{
                        this.props.savePropertyInfo(data.data)
                        
                    }
                )
                http.post('/equipment/getInitParam',{
                    "project_id":0,
                    "template_id":Number(modifyDict["model_id"]),
                    "equip_id":Number(modifyDict["id"])
                }).then(
                    data=>{
                        this.props.saveParamInfo(data.data)
                    }
                )
                this.props.showModal(modalTypes.MODIFY_EQUIPMENT_MODAL,{})
                break;
            default:
                Modal.confirm({title:'一次只能编辑一个设备'})
        }
    }
    //查询
    searchList(value){
        this.props.searchList(value)
    }
    addList(){
        if(this.props.table.systemId!=''&&this.props.table.systemId!=undefined){
            this.props.showModal(modalTypes.ADD_EQUIPMENT_MODAL,{})
        }else{
            Modal.error({
                content:"请选择一个系统添加设备,点击左侧树型菜单树型系统一栏"
            })
        }
    }

    handleChange = (value) => {
        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/asset_template/${value}`)
    }

    /**
     * 组件渲染
     * 
     * @returns 
     * @memberof DeviceManageView
     */
    render(){
        const {
            showModal, //func
            hideModal,
            addList,
            delList,
            modifyList,
            searchList,
            onListSearch,
            searchRecord,
            addFunction,
            modifyFunction,
            removeFunction,
            removeList,
            hide,
            show,
            hideAdd,
            showAdd,
            hideModify,
            showModify,
            hideExamine,
            showExamine,
            hideAgain,
            showAgain,
            hideDetails,
            showDetails,
            examineFunction,
            addDeviceInfo,
            addPropertyInfo,
            addParamInfo,
            savePropertyInfo,
            saveId,
            clearPropertyData,
            modal, //props
            table,
            searchInsUser,
            distribute,           
            careLoading,
            careData,
            click,
            careShowModel,
            careRender,
            careSelectIds,
            careAdvance,
            careAdvanceModel,
            careAudit,
            careAuditModel,
            careDetails,
            careDetailsModel,
            reloadTable,
            treeTable,
            saveDeviceName,
            setActiveKey,
            setModyActiveKey,
            saveParamInfo,
            modyPropertyInfo,
            saveCurNewEquipId,
            saveData   
        } = this.props
        const prop = {
            name: 'commfile',
            action: `${appConfig.serverUrl}/equipment/importFile`,
            data:{
                project_id:0
            },
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
                console.log(table)
                }
                if (info.file.status === 'done') {
                reloadTable()
                } else if (info.file.status === 'error') {
                    Modal.error({
                        title: '错误提示',
                        content: `${info.file.name} file upload failed.`
                    })
                }
            },
        }
        let option = ''
        if(this.props.table.assetData != undefined){
        option = this.props.table.assetData.map(item=>{
            return <Option value={item}>{item}</Option>
        })
        }
        return (
            <div className={s['inner-container']}>
                <div className={s['header']} >
                    <div className={s['outer-wrap']}>
                        <div className={s['btns-wrap']} >
                            <Button type='primary'  icon="plus" className={s['btn-common']} onClick={this.addList}>添加</Button>
                            <Button icon='edit' className={s['btn-common']} onClick={this.modifyList}>编辑</Button>
                            <Button icon='close' className={s['btn-common']} onClick={this.delList}>删除</Button>
                            <Upload {...prop} showUploadList={false} >
                                <Button className={s['btn-common']}><Icon type="upload" />从Excel导入</Button>
                            </Upload>
                            <Select placeholder="选择下载示范模板" style={{ width: 249 }} onSelect={this.handleChange}>
                                {option}
                            </Select>
                        </div>
                        <div className={s['search-wrap']} >
                            <Search
                                placeholder='请搜索设备名称'
                                onSearch={this.searchList}
                            />
                        </div>
                    </div>
                </div>
                <div className={s['table-wrap']} >
                    <TableView/>
                </div>
                <AddListModalView
                    hideModal={hideModal}
                    showModal={showModal}
                    modal={modal}
                    addList={addList}
                    table={table}
                    careData={careData}
                    careLoading={careLoading}
                    onListSearch={onListSearch}
                    searchRecord={searchRecord}
                    addFunction={addFunction}
                    modifyFunction={modifyFunction}
                    removeFunction={removeFunction}
                    hide={hide}
                    show={show}
                    hideAdd={hideAdd}
                    showAdd={showAdd}
                    hideModify={hideModify}
                    showModify={showModify}
                    hideExamine={hideExamine}
                    showExamine={showExamine}
                    hideAgain={hideAgain}
                    showAgain={showAgain}
                    removeList={removeList}
                    examineFunction={examineFunction}
                    addDeviceInfo={addDeviceInfo}
                    addPropertyInfo={addPropertyInfo}
                    addParamInfo={addParamInfo}
                    savePropertyInfo={savePropertyInfo}
                    click={click}
                    careShowModel={careShowModel}
                    careRender={careRender}
                    careAdvance={careAdvance}
                    careAdvanceModel={careAdvanceModel}
                    careSelectIds={careSelectIds}
                    careAudit={careAudit}
                    careAuditModel={careAuditModel}
                    careDetails={careDetails}
                    careDetailsModel={careDetailsModel}
                    searchInsUser={searchInsUser}
                    hideDetails={hideDetails}
                    showDetails={showDetails}
                    distribute={distribute}
                    clearPropertyData= {clearPropertyData}
                    saveDeviceName={saveDeviceName}
                    setActiveKey={setActiveKey}
                    saveData={saveData}
                />
                <ModifyModalView
                    hideModal={hideModal} //action
                    modifyList={modifyList}
                    modal={modal} //props
                    table={table}
                    careData={careData}
                    careLoading={careLoading}
                    onListSearch={onListSearch}
                    searchRecord={searchRecord}
                    addFunction={addFunction}
                    modifyFunction={modifyFunction}
                    removeFunction={removeFunction}
                    hide={hide}
                    show={show}
                    hideAdd={hideAdd}
                    showAdd={showAdd}
                    hideModify={hideModify}
                    showModify={showModify}
                    hideExamine={hideExamine}
                    showExamine={showExamine}
                    hideAgain={hideAgain}
                    showAgain={showAgain}
                    removeList={removeList}
                    examineFunction={examineFunction}
                    addDeviceInfo={addDeviceInfo}
                    addPropertyInfo={addPropertyInfo}
                    addParamInfo={addParamInfo}
                    savePropertyInfo={savePropertyInfo}
                    click={click}
                    careShowModel={careShowModel}
                    careRender={careRender}
                    careAdvance={careAdvance}
                    careAdvanceModel={careAdvanceModel}
                    careSelectIds={careSelectIds}
                    careAudit={careAudit}
                    careAuditModel={careAuditModel}
                    careDetails={careDetails}
                    careDetailsModel={careDetailsModel}
                    searchInsUser={searchInsUser}
                    hideDetails={hideDetails}
                    showDetails={showDetails}
                    distribute={distribute}
                    clearPropertyData= {clearPropertyData}
                    saveDeviceName={saveDeviceName}
                    setActiveKey={setActiveKey}
                    setModyActiveKey={setModyActiveKey}
                    modyPropertyInfo={modyPropertyInfo}
                    saveCurNewEquipId={saveCurNewEquipId}
                />
            </div>
        )
    }
}

export default DeviceManageView2