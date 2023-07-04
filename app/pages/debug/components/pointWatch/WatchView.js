import React from 'react';
import { Tabs , Modal , Form , Input} from 'antd';
import objectId from '../../../../common/objectId'
import s from './WatchView.css'
import ContentView from './ContentView'
import AddTabsModal from './AddTabModalView'

const TabPane = Tabs.TabPane;
const FormItem = Form.Item

let headerStyle,pointViewClass;
if(localStorage.getItem('serverOmd')=="best"){
    headerStyle={
      color:"#000"
    }
}
if(localStorage.getItem('serverOmd')=="persagy"){
    headerStyle={
        background:"rgba(255,255,255,1)",
        color:"rgba(38,38,38,1)",
        fontSize:"14px",
        fontFamily:'MicrosoftYaHei'
      }
      pointViewClass = 'persagy-pointView'
  } 


/**
 * WatchView组件中的父级组件
 * 
 * @class WatchView
 * @extends {React.Component}
 */
class WatchView extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            activeKey: '',
            panes : [],
            addTabsModalVisible : false
        };
    }

    componentDidMount(){
        // console.log('初始化')
        var pointWatch = localStorage.pointWatch ? JSON.parse(localStorage.pointWatch) : [];
        this.setState({
            panes:pointWatch,
            activeKey : pointWatch[0] ? pointWatch[0].key : '' 
        })
    }

    shouldComponentUpdate(nextProps,nextState){
        if(this.state.activeKey !== nextState.activeKey){
            return true
        }else if(this.state.panes.length !== nextState.panes.length){
            return true
        }else if(this.state.addTabsModalVisible !== nextState.addTabsModalVisible){
            return true
        }
        return false
    }

    onChange = (activeKey) => {
        this.setState({ activeKey });
    }
    
    onEdit = (targetKey, action) => {
        this[action](targetKey);
    }

    // 更新localStorage
    updateLocalStorage = (panes) => {
        localStorage.pointWatch = JSON.stringify(panes)
    }

    add = () => {
        // this.setState({ addTabsModalVisible : true })
        // 增加一个模态框用来确认输入的标题
        this.setState({addTabsModalVisible:true})
    }

    hideAddModal = () => {
        this.setState({addTabsModalVisible:false})
    }

    createTab = (values) => {
        const panes = this.state.panes;
        const activeKey = objectId();
        panes.push({ title:  values.tabname , watchList : [] , key: activeKey });
        this.setState({ panes, activeKey  },()=>{this.updateLocalStorage(this.state.panes)});
    }

    remove = (targetKey) => {
        let _this = this 
        // 删除时弹出确认按钮
        Modal.confirm({
            title : '是否确认删除分组？',
            content: '删除后无法恢复。',
            onCancel(){},
            onOk(){
                let activeKey = _this.state.activeKey;
                let lastIndex;
                _this.state.panes.forEach((pane, i) => {
                    if (pane.key === targetKey) {
                        lastIndex = i - 1;
                    }
                });
                const panes = _this.state.panes.filter(pane => pane.key !== targetKey);
                if (lastIndex >= 0 && activeKey === targetKey) {
                    activeKey = panes[lastIndex].key;
                }else{
                    activeKey = ''
                }
                _this.setState({ panes, activeKey },()=>{_this.updateLocalStorage(_this.state.panes)});
            }
        })
    }

    render(){
        return (
            <div className={pointViewClass}>
                <div className={s['container']}>
                    <Tabs
                        onChange={this.onChange}
                        activeKey={this.state.activeKey}
                        type="editable-card"
                        onEdit={this.onEdit}
                        style={headerStyle}
                    >
                        {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key} closable={pane.closable}></TabPane>)}
                    </Tabs>
                    <div className={s['content']} >
                        <ContentView 
                            panes = {this.state.panes}
                            activeKey={this.state.activeKey}
                            updateLocalStorage={this.updateLocalStorage}
                        />
                    </div>
                    <AddTabsModal
                        visible={this.state.addTabsModalVisible}
                        createTab={this.createTab}
                        hideModal = {this.hideAddModal}
                    /> 
                </div>
            </div>
        )
    }
}

export default WatchView