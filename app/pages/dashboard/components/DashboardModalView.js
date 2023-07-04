/**
 * 首页
 */

import React, { PropTypes } from 'react';
import { Select, Dropdown, Button, Menu, Icon } from 'antd';

import { modalTypes, pageTypes } from '../../../common/enum';
import { history } from '../../../index';
import { push } from 'react-router-redux';
import PageList from './PageListView';
import s from './DashboardModalView.css';

let bgStyle,textStyle,bgContentStyle,footBorderStyle;
if(localStorage.getItem('serverOmd')=="best"){
    bgStyle={
      background:"RGB(240,240,240)",
      borderRight:"1px solid #B5B5B5"
    }
    textStyle={
      color:"#000",
      border:"1px solid #000"
    }
    bgContentStyle={
      background:"RGB(255,255,255)"
    }
    footBorderStyle={
      borderTop:"1px solid #B5B5B5"
    }
}
if(localStorage.getItem('serverOmd')=="persagy"){
    bgStyle={
      background:"rgba(247,249,250,1)",
      borderRight:"1px solid rgba(240,241,242,1)"
    }
    textStyle={
      color:"RGB(31,31,31)",
      border:"1px solid RGB(50,50,50)"
    }
    bgContentStyle={
      background:"RGB(255,255,255)"
    }
    footBorderStyle={
      borderTop:"1px solid RGB(150,150,150)"
    }
}

const Option = Select.Option;
const MenuItem = Menu.Item


const openPage = (pageName) => {

    history.push(`/dashboard/${pageName}`);
}

const closePage = () => {
  history.push("systemToolDashboard")
}

class DashboardModalView extends React.PureComponent {
  constructor(props) {
    super(props);

    
  }
  componentDidMount() {
    this.props.initializePages();
    //openPage(this.props.pages[0]._id,this.props.pages[0].type);
    if (this.props.pageList[0]) {
      history.push(`/dashboard/${this.props.pageList[0]}`); //直接跳转显示第一个页面 
    }
  }
  render() {
    const {
      children,
      addPage,
      removePage,
      showModal,
      pages,
      pageList,
      params
    } = this.props;

    return (
      <div className={s['inner-container']}>
        <div className={s['left-sider']} style={bgStyle}>
          <div className={s['sider-content']}>
           <PageList
              dataSource={pageList}
              onSelect={(row) => { openPage(row) }}
              showModal={showModal}
              onRemove={
                (row) => {
                  return removePage(row).then(
                    () => {
                      // 若删除的页面是当前打开的
                      // 则做一次关闭操作
                      if (params.name === row) {
                        window.setTimeout(closePage, 0);
                      }
                    }
                  );
                }
              }
            />
          </div>
          <div className={s['sider-footer']} style={footBorderStyle}>
            <Button ghost style={textStyle} onClick={()=>showModal(modalTypes.CREATE_DASHBOARD_MODAL, {addPage}) }>
              <Icon type="plus" />
            </Button>
          </div>
        </div>
        <div className={s['content']} style={bgContentStyle}>   
          <div className={s['chart-container-wrap']} >
            {children}
          </div>
        </div>
      </div>
    )
  }
}

DashboardModalView.propTypes = {
};

export default DashboardModalView;
