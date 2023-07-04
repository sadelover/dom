import React, { PropTypes } from 'react';
import moment from 'moment';


/**
 * 
 * 
 * @class Timer
 * @extends {React.Component}
 */
let timerColor
if(localStorage.getItem('serverOmd')=="best"){
  timerColor ={color:"black"}
}else{
  timerColor ={}
}

class Timer extends React.Component {
  constructor(props) {
    super(props);

    this.timer = undefined;

    this.state = {
      time: this.props.time
    };

    this.tick = this.tick.bind(this);
  }
  static get defaultProps() {
    let timeFormat = 'YYYY-MM-DD HH:mm'
    return {
      time: moment().format(timeFormat),
      checkInterval: 5,
      timeFormat
    }
  }
  componentDidMount() {
    this.timer = setInterval(this.tick, this.props.checkInterval);
  }
  tick() {
    this.setState({
      time: moment().format(this.props.timeFormat)
    });
  }
  render() {
    return  (
      <span className={this.props.className} style={timerColor}>{ this.state.time }</span>
    );
  }
}

export default Timer
