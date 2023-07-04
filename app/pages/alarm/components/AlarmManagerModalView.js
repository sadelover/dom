/**
 * 报警配置页面
 */
import React from 'react' ;
import { Modal ,Button,Input,Row,Col} from 'antd'
import s from './AlarmManagerModalView.css'
import cx from 'classnames';

import TableView from '../containers/TableContainer'
import BoolAlarmModal from '../containers/BoolAlarmModalContainer'
import HighLowLimitAlarmModal from '../containers/HighLowLimitModalContainer'
import RuleAlarmModal from './RuleAlarmModalView'
import BoolAlarmEditModalView from '../containers/EditModalContainer'
import HighLowLIMITEditModalView from '../containers/HighLowEditModalContainer'
// import TendencyModalView from './TrendContainer'
const Search = Input.Search
/**
 * 
 * 
 * @class AlarmManageModalView
 * @extends {React.Component}
 */

let str,toggleSearchClass,btnStyle;
if(localStorage.getItem('serverOmd')=="best"){
  str = 'warning-config-best'
}else{
  str = ''
}
if(localStorage.getItem('serverOmd')=="persagy"){
    str = 'persagy-warningManage-table';
    toggleSearchClass = 'persagy-warningManage-input';
    btnStyle = {
        background:"rgba(255,255,255,1)",
        border:'1px solid rgba(195,198,203,1)',
        color:"rgba(38,38,38,1)",
        borderRadius:'4px',
        fontFamily:'MicrosoftYaHei',
        fontSize:'14px'
    }
  }else{
    str = ''
    toggleSearchClass = ''
  }

class AlarmManageModalView extends React.Component{
   
    componentWillMount() {
        const {searchTableData} = this.props;
        searchTableData();
    }

    shouldComponentUpdate(nextProps,nextState){
        if(nextProps.visible != this.props.visible && nextProps.visible == true){
            this.props.renderList()
        }
        return true
    }

    WaringModify(){
        const {table,toggleEditModal,HighLowEditModal,toggleRuleModal} = this.props
        // userRole !=1?(type==1?toggleEditModal():HighLowEditModal()):""}
        let type = ''
        if(table.selectedIds.length<1){
            Modal.info({
                title:"请选择一个点进行修改"
            })
        }else{
           let record = table.data.filter((item,index) =>{
                if(item.id===table.selectedIds[0]) return item
            })
            if (JSON.parse(window.localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
                type = record[0].type
                if(type==1){
                    toggleEditModal()
                }else {
                    if (type==0){
                        HighLowEditModal()
                    }else{
                        if (type==3) {
                            toggleRuleModal('edit')
                        }
                    }
                }
            }  
        }
    }
    render(){
        const {
            onCancel,
            visible,
            toggleBoolModal,
            boolModalVisible,
            highLowVisible,
            ruleModalVisible,
            editVisible,
            highLowEditVisible,
            toggleEditModal,
            HighLowEditModal,
            toggleHighLowModal,
            toggleRuleModal,
            removeWarningConfig,
            searchTableData,
            onSelectChange,
            showPointModal,
            hidePointModal,
            addRuleWarning,
            editRuleWarning,
            selectedIds,
            pointData,
            mode,
            table,
            trend,
            tendencyVisible,
            tendencyData,
            hideTendencyModal
        } = this.props;
        let userRole = JSON.parse(window.localStorage.getItem('userData')).role;
        let userLevel = JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level
        return (
        <div style={{width:"865px"}} className={str}>
            {/* <TendencyModalView
                tendencyVisible ={tendencyVisible}
                tendencyData = {tendencyData}
                hideTendencyModal = {hideTendencyModal}
            />  */}
            {/* <Modal
                title='报警配置'
                visible={visible}
                onCancel={onCancel}
                footer={null}
                maskClosable={false}
                width={800}
                wrapClassName={str}
            > */} 
                 <div className={s['alarm-wrap']}>
                    <div className={s['table-search']}   >
                        <Row type="flex" justify="center">
                            <Col span={10} className={toggleSearchClass}> 
                                <Search                    
                                    onSearch={value => searchTableData(value)}
                                    placeholder='请输入要搜索的点名或报警信息'
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className={s['table-wrap']} >
                        <TableView/>
                    </div>
                    <div className={s['alarm-footer']} >
                        <Button className={s['config-btn']} onClick={()=>{userRole >= userLevel ? toggleBoolModal() :  Modal.info({title: '提示',content: '用户权限不足'})}} style={btnStyle}>新建布尔报警</Button>
                        <Button className={s['config-btn']} onClick={()=>{userRole >= userLevel ? toggleHighLowModal() : Modal.info({title: '提示',content: '用户权限不足'})}} style={btnStyle}>新建高低限报警</Button>
                        <Button className={s['config-btn']} onClick={()=>{userRole >= userLevel ? toggleRuleModal('add') : Modal.info({title: '提示',content: '用户权限不足'})}} style={btnStyle}>新建规则报警</Button>
                        <Button  
                            className={cx(s['config-btn'],s['edit-btn'],s['success-btn'])}
                            onClick={()=>this.WaringModify()}
                        >编辑</Button>
                        <Button type='danger'  className={cx(s['config-btn'],s['edit-btn'])}
                            onClick={()=>{userRole >= userLevel ? removeWarningConfig() : ''}}
                        >删除</Button>
                    </div>
                </div>
                <BoolAlarmModal 
                    visible={boolModalVisible} 
                    toggleBoolModal={toggleBoolModal}
                    onSelectChange={onSelectChange}
                />
                <HighLowLimitAlarmModal
                    visible={highLowVisible}
                    toggleHighLowModal={toggleHighLowModal}
                    onSelectChange={onSelectChange}
                />
                <RuleAlarmModal
                    visible={ruleModalVisible}
                    toggleRuleModal={toggleRuleModal}
                    onSelectChange={onSelectChange}
                    showPointModal={showPointModal}
                    hidePointModal={hidePointModal}
                    addRuleWarning={addRuleWarning}
                    editRuleWarning={editRuleWarning}
                    selectedIds={selectedIds}
                    pointData={pointData}
                    mode={mode}
                    table={table}
                />
                <BoolAlarmEditModalView
                    visible={editVisible}
                    toggleEditModal={toggleEditModal}
                    table={table}
                    onSelectChange={onSelectChange}
                />
                <HighLowLIMITEditModalView
                    visible={highLowEditVisible}
                    HighLowEditModal={HighLowEditModal}
                    table={table}
                    onSelectChange={onSelectChange}
                />
            {/* </Modal> */}
        </div>   
        )
    }
}

export default AlarmManageModalView