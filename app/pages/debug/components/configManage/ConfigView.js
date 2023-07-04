import React, { PropTypes } from 'react';
import CodeMirror from 'react-codemirror';
import {Button} from 'antd'
import 'codemirror/mode/python/python';
// import 'codemirror/lib/codemirror.css';
import cx from 'classnames';
import moment from 'moment';

import s from './ConfigView.css';

const TAB = new Array(5).join(' ');

const codeMirrorOptions = {
  lineNumbers: true,
  extraKeys: {
      Tab: function(cm) {
          if (cm.getSelection().length) {
              CodeMirror.commands.indentMore(cm);
          } else {
              cm.replaceSelection(TAB);
          }
      }
  },
  mode: {
      name : 'javascript',
      json : true
  }
};

class CodeEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      code: this.props.value || 'asdfadsfdsfasfdasadfsasfd'
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    const onChange = this.props.onChange;

    if (!('value' in this.props)) {
    //   this.setState({
    //     code: value
    //   });
        this.props.changeValue(value)
    }

    if (onChange) {
      onChange(value);
    }
  }

  
  componentDidMount() {
      this.props.getConfig()
  }
  

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({
        code: value
      });
    }
  }
  
  render() {
    let {code} = this.props
    return (
        <div>
            <div className={s['header']}>
                <Button className={s['save-btn']} onClick={this.props.saveConfig} >保存</Button>
            </div>
            <div>
                <CodeMirror
                    value={code}
                    className={cx(s['editor'], 'ant-input')}
                    options={codeMirrorOptions}
                    onChange={this.handleChange}
                />
            </div>
        </div>
    );
  }
}

export default CodeEditor;
