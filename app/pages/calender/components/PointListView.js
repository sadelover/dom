/**
 * 历史曲线页面
 */

import React, { PropTypes } from 'react';
import { Button, Icon, Tag, Tooltip, Modal } from 'antd';
import s from './PointListView.css';

class PointList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.showPointModal = this.showPointModal.bind(this);
    this.handleAddPoint = this.handleAddPoint.bind(this);
  }
  static get defaultProps() {
    return {
      points: []
    };
  }
  getPointList() {
    const {
      points,
      showPoint,
      hidePoint,
      addPoint,
      deletePoint
    } = this.props;

    return points.map(
      row => (
        <div key={row.name} className={s['point-row']}>
          <div className={s['eye']}>
            <Tooltip title="显示/隐藏">
              { 
                row.visible ? 
                <Icon type="eye" onClick={() => hidePoint(row.name)} /> : 
                <Icon type="eye-invisible" onClick={() => showPoint(row.name)}  />
              }
            </Tooltip>
          </div>
          <div className={s['point-name']}>
            {row.name}
          </div>
          <div id={s['point-description']}>
            点释义：{row.description}
          </div>
          <div className={s['btns']}>
            <Tooltip title="删除">
              <Icon type="close" onClick={ () => deletePoint(row.name) } />
            </Tooltip>
          </div>
          <div className={s['labels']}>
            <Tag color="#f7981c">
              MAX: <span className={s['label-value']}>{ typeof row.max === 'undefined' ? '-' : row.max }</span>
            </Tag>
            <Tag color="#2ea2f8">
              MIN: <span className={s['label-value']}>{ typeof row.min === 'undefined' ? '-' : row.min }</span>
            </Tag>
            <Tag color="#516173">
              AVG: <span className={s['label-value']}>{ typeof row.avg === 'undefined' ? '-' : row.avg }</span>
            </Tag>
          </div>
        </div>
      )
    ).concat(
      <div key="add-point" className={s['add-placeholder-row']} onClick={this.showPointModal}>
        <Icon type="plus-circle-o" />
      </div>
    );
  }
  handleAddPoint(point) {
    this.props.addPoint(point);
  }
  showPointModal() {
    if (JSON.parse(localStorage.getItem('userData')).role >= JSON.parse(window.localStorage.getItem('accountManageConfig')).command_user_min_level) {
      this.props.showPointModal({
        onOk: this.handleAddPoint
      })
    }else {
      Modal.info({
        title: '提示',
        content: '用户权限不足'
      })
    } 
  }
  render() {
    return (
      <div className={s['container']}>
        {this.getPointList()}
      </div>
    );
  }
}

PointList.propTypes = {
};

export default PointList;
