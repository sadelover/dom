import React, { PropTypes } from 'react';
import { Icon } from 'antd';

import s from './IconLabel.css';
import cx from 'classnames';

class IconLabel extends React.Component {
  constructor(props) {
    super(props);
  }
  static get defaultProps() {
    return {
      icon: 'question'
    }
  }
  render() {
    return  (
      <span className={this.props.className}>
        <Icon className={cx(s['icon'], this.props.iconClassName)} type={this.props.icon} />
        {this.props.children}
      </span>
    );
  }
}

export default IconLabel
