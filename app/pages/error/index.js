/**
 * 错误页面
 */

import React from 'react';
import s from './styles.css';
import { Link } from 'react-router';
import { hashHistory } from 'react-router';
import PropTypes from 'prop-types'

class ErrorPage extends React.Component {

  static propTypes = {
    error: PropTypes.object,
  };

  componentDidMount() {
    document.title = this.props.error && this.props.error.status === 404 ?
      'Page Not Found' : 'Error';
  }

  goBack = event => {
    event.preventDefault();
    hashHistory.goBack();
  };

  render() {
    if (this.props.error) console.error(this.props.error);

    const [code, title] = this.props.error && this.props.error.status === 404 ?
      ['404', 'Page not found'] :
      ['Error', 'Oups, something went wrong'];

    return (
      <div className={s.container}>
        <main className={s.content}>
          <h1 className={s.code}>{code}</h1>
          <p className={s.title}>{title}</p>
          {code === '404' &&
            <p className={s.text}>
              页面不存在或发生了一个错误！
            </p>
          }
          <p className={s.text}>
            <a href="javascript:;" onClick={this.goBack}>返回</a>, 或者跳转到&nbsp;
            <Link to="/">首页</Link>
          </p>
        </main>
      </div>
    );
  }

}

export default ErrorPage;
