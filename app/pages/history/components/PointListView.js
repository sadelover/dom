/**
 * 历史曲线页面
 */

import React, { PropTypes } from 'react';
import { Button, Icon, Tag, Tooltip, Modal } from 'antd';
import s from './PointListView.css';
import imgMasterless from '../../../themes/dark/images/masterless.png'

let textStyle;
if(localStorage.getItem('serverOmd')=="best"){
    textStyle={
      color:"#000"
    }
}
class PointList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
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
    // console.log('[naveen-debug]'+points)
    return points.map(
      row => (
        <div key={row.name} className={s['point-row']}>
          <div className={s['eye']} style={textStyle}>
            <Tooltip title="显示/隐藏">
              { 
                row.visible ? 
                <Icon type="eye" onClick={() => hidePoint(row.name)} /> : 
                <Icon type="eye-invisible" onClick={() => showPoint(row.name)}  />
              }
            </Tooltip>
          </div>
          <div className={s['point-name']} style={textStyle}>
            {row.name}
          </div>
          <div id={s['point-description']} style={textStyle}>
            点释义：{row.description}
          </div>
          <div className={s['btns']} style={textStyle}>
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
      <div key="add-point" className={s['add-placeholder-row']} onClick={this.showPointModal} style={textStyle} style={{display:`${this.props.points == '' ? 'none' : ''}`}}>
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
        <span style={{display:`${this.props.points != '' ? 'none' : ''}`}}>
          <img src={imgMasterless} style={{width:'115px',height:'115px',position:'absolute',top:'236px',left:'143px'}}/>
          <div style={{width:'96px',height:'21px',fontSize:'16px',fontFamily:'MicrosoftYaHei',color:'rgba(0,0,0,1)',lineHeight:'21px',position:'absolute',top:'365px',left:'152px'}}>请先添加点位</div>
          <div style={{width:'144px',height:'16px',fontSize:'12px',fontFamily:'MicrosoftYaHei',color:'rgba(141,147,153,1)',lineHeight:'16px',position:'absolute',top:'397px',left:'128px'}}>点击下方按钮即可开始添加</div>
          <div onClick={this.showPointModal} style={{width:'104px',height:'32px',fontSize:'12px',borderRadius:'4px',background:'rgba(0,145,255,1)',fontFamily:'MicrosoftYaHei',color:'rgba(255,255,255,1)',textAlign:'center',lineHeight:'32px',position:'absolute',top:'433px',left:'148px'}}>添加点位</div>
        </span>
        
        {this.getPointList()}
      </div>
    );
  }
}

PointList.propTypes = {
};

export default PointList;
