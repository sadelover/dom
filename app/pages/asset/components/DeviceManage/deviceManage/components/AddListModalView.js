import React from 'react'
import {Modal,Button,Form,Input,Select,Tabs,message} from 'antd'
import {modalTypes} from '../../../../../../common/enum'
import s from './AddListModalView.css'
import DeviceInfoView from './AddDeviceTabs/DeviceInfoView'
import CareManageView from './AddDeviceTabs/CareManageView'
import MaintenManageView from './AddDeviceTabs/MaintenManageView'
import RecordView from './AddDeviceTabs/RecordView'
import PropertyInfoView from './AddDeviceTabs/PropertyInfoView'
import ParamInfoView from './AddDeviceTabs/ParamInfoView'
import http from '../../../../../../common/http'
const FormItem = Form.Item
const Option  = Select.Option
const TabPane = Tabs.TabPane;
const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
const AddListModalView = Form.create()(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state = {
                areaList:[],
                templatesList:[]
            }
            this.getAreaList = this.getAreaList.bind(this);
            this.getTemlatesList = this.getTemlatesList.bind(this)
            this.clearData = this.clearData.bind(this)
            this.callback = this.callback.bind(this)
        }
        //点击提交表单时触发
        // onOk(e){
        //     const {hideModal,form,addList} = this.props
        //     e.preventDefault()
        //     form.validateFields((err,values)=>{
        //         if(!err){
        //             hideModal()
        //             // addList(values)
        //         }
        //     })
        // }
        componentDidMount() {
           
            this.getAreaList();
            this.getTemlatesList();
        }
        callback(key){
            this.props.setActiveKey(key)
            if(this.props.table.waringVisible!=true){
                Modal.info({
                    content:'请先完成第一步设备信息的提交'
                })
            }
        }
        getAreaList() {
            http.post('/deviceManage/searchArea', {
                'projectId': 0,//0,
                'searchKey': '',
                'pageSize': 100,
                'targetPage': 1
            })
            .then(
                (resp) => {
                    if (resp.status) {
                       this.setState({
                           areaList: resp.data
                       })
                    }
                }
            )
            .catch(
                () => {
                    Modal.error({
                        title: '错误提示',
                        content: "后台接口-请求失败!"
                    })
                }
            );
        }

        getTemlatesList () {
            http.post('/equipment/getAssetTemplates', {
                'project_id': 0//0
            })
            .then(
                (resp) => {
                    if (resp.status) {
                       this.setState({
                           templatesList: resp.data
                       })
                    }
                }
            )
            .catch(
                () => {
                    Modal.error({
                        title: '错误提示',
                        content: "后台接口-请求失败!"
                    })
                }
            );
        }
        clearData(){
            this.props.hideModal();
            this.props.clearPropertyData();
        }

        render(){
            const {
                form,
                hideModal,
                hide,
                addDeviceInfo,
                savePropertyInfo,
                addPropertyInfo,
                addParamInfo,
                show,
                hideModify,
                showModify,
                modal,
                hideAdd,
                showAdd,
                hideExamine,
                showExamine,
                table,
                onListSearch,
                searchRecord,
                addFunction,
                showModal,
                modifyFunction,
                removeFunction,
                removeList,
                examineFunction,
                hideAgain,
                showAgain,
                searchInsUser,
                distribute,
                hideDetails,
                showDetails,
                careLoading,
                careData,
                click,
                careShowModel,
                careRender,
                careSelectIds,
                careAdvance,
                careAdvanceModel,
                careAuditModel,
                careAudit,
                careDetails,
                careDetailsModel,
                saveDeviceName,
                saveData  
            } = this.props
            const {getFieldDecorator} = form
            const {areaList,templatesList} = this.state
            const {curEquipId,templateId} = this.props.table
            let visible = modalTypes.ADD_EQUIPMENT_MODAL === modal.type ? true : false
            return (
                <Modal
                    title='添加设备信息'
                    visible={visible}
                    onCancel={this.clearData}
                    width={1300}
                    footer={null}
                    maskClosable={false}
                >
                    <Tabs activeKey={table.ActiveKey} onChange={this.callback} >
                        <TabPane tab="设备信息" key="1">
                            <DeviceInfoView
                                addDeviceInfo={addDeviceInfo}
                                areaList={areaList}
                                templatesList={templatesList}
                                hideModal={hideModal}
                                savePropertyInfo={savePropertyInfo}
                                template_id={templateId}
                                equip_id={curEquipId}
                                saveDeviceName={saveDeviceName}
                                saveData={saveData}
                            />
                    </TabPane>
                    <TabPane tab="资产信息" key="2">
                        <PropertyInfoView
                            addPropertyInfo={addPropertyInfo}
                            table={table}
                            template_id={templateId}
                            equip_id={curEquipId}
                        />
                    </TabPane>
                    <TabPane tab="主机运行参数" key="3">
                        <ParamInfoView
                            addParamInfo={addParamInfo}
                            table={table}
                            template_id={templateId}
                            equip_id={curEquipId}
                        />
                    </TabPane>
                    <TabPane tab="保养管理" key="4">
                        <CareManageView
                        table={table}
                        careLoading={careLoading}
                        careData={careData}
                        click={click}
                        careShowModel={careShowModel}
                        careRender={careRender}
                        careSelectIds={careSelectIds}
                        careAdvance={careAdvance}
                        careAdvanceModel={careAdvanceModel}
                        careAuditModel={careAuditModel}
                        careAudit={careAudit}
                        careDetails={careDetails}
                        careDetailsModel={careDetailsModel}
                        />
                    </TabPane>
                    <TabPane tab="维修管理" key="5">
                        <MaintenManageView
                        table={table}
                        onListSearch={onListSearch}
                        removeList={removeList}
                        hideAdd={hideAdd}
                        showAdd={showAdd}
                        hideExamine={hideExamine}
                        showExamine={showExamine}
                        hideAgain={hideAgain}
                        showAgain={showAgain}
                        examineFunction={examineFunction}
                        searchInsUser={searchInsUser}
                        hideDetails={hideDetails}
                        showDetails={showDetails}
                        distribute={distribute}
                            />
                    </TabPane>
                    <TabPane tab="投产记录管理" key="6">
                            <RecordView
                            modal={modal}
                            table={table}
                            hideModal={hideModal}
                            showModal={showModal}
                            searchRecord={searchRecord}
                            addFunction={addFunction}
                            modifyFunction={modifyFunction}
                            removeFunction={removeFunction}
                            hide={hide}
                            show={show}
                            hideModify={hideModify}
                            showModify={showModify}
                            />
                    </TabPane>
                    </Tabs>
                </Modal>
            )
        }
    }
)

export default AddListModalView