/**
 * 页面列表组件
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'antd';
import { modalTypes, pageTypes } from '../../../common/enum';
import cx from 'classnames';

import s from './PageListView.css';

let ListStyle;
if(localStorage.getItem('serverOmd')=="best"){
  ListStyle={
    background:"RGB(240,240,240)",
    color:"#000",
    borderBottom:"1px solid #B5B5B5"
  }
}
if(localStorage.getItem('serverOmd')=="persagy"){
  ListStyle={
    fontSize:'14px',
    fontFamily:'MicrosoftYaHei',
    color:'rgba(31,35,41,1)',
    background:'rgba(247,249,250,1)',
    borderBottom:"1px solid rgba(199,199,199,1)"
  }
}

class PageListItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const {rowKey, data, onClick, onRemove, isOpen, showModal} = this.props;
    let optionalProps = {};

    if (typeof onClick === 'function') {
      optionalProps['onClick'] = () => onClick(data);
    }

    return (
      <div
        {...optionalProps}
        className={cx(s['page-list-item'], {[s['open']]: isOpen})}
        style={ListStyle}
      >
        <div className={s['item-left']}>
          <div className={s['item-name']}>{data}</div>
        </div>
        <div className={s['item-right']}>
          <Button icon="setting" size='large' shape="circle" onClick={ (e) => { e.stopPropagation(); showModal(data) } } />
          <Button icon="close" size='large' shape="circle" onClick={ (e) => { e.stopPropagation(); onRemove(data) } } />
        </div>
      </div>
    )
  }
}

PageListItem.propTypes = {
  rowKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  isOpen: PropTypes.bool,
  data: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  onRemove: PropTypes.func.isRequired,
  showModal: PropTypes.func
};

class PageList extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      openKey: this.props.openKey
    }

    this.handleClick = this.handleClick.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleShowModal = this.handleShowModal.bind(this);
  }

  componentDidMount() {
    if (this.props.pageList) {
      this.handleClick(this.props.pageList[0])      
    }
  }

  handleClick(name) {
    this.setState({
      openKey: name
    });

    if (typeof this.props.onSelect === 'function') {
      //执行父级HomeView的方法
      this.props.onSelect(name);
    }
  }
  handleRemove(row) {
    Modal.confirm({
      title: `确认删除页面 "${row}"?`,
      content: '删除后将不可恢复',
      okText: '确认删除',
      cancelText: '取消',
      onOk: () => { 
        return this.props.onRemove(row);
      }
    });
  }
  //显示修改页面配置模态框
  handleShowModal(row) {
    this.props.showModal(modalTypes.CREATE_DASHBOARD_MODAL,{name:row})
  }

  generateList() {
    const { dataSource } = this.props;
    const openKey = this.state.openKey;

    if (dataSource) {
       return dataSource.map(
        row => {
          let key = row;
          return (
            <PageListItem
              key={key}
              rowKey={key}
              isOpen={key === openKey}
              data={row}
              onClick={this.handleClick}
              onRemove={this.handleRemove}
              showModal={this.handleShowModal}
            />
          )
        }
      );
    }

   
  }
  render() {
    return (
      <div className={s['container']}>
        {this.generateList()}
      </div>
    )
  }
}

PageList.propTypes = {
  rowKey: PropTypes.string,
  dataSource: PropTypes.array.isRequired,
  onSelect: PropTypes.func
};

export default PageList;
