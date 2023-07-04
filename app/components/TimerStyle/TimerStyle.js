import React, { PropTypes } from 'react';
import moment from 'moment';


/**
 * 
 * 
 * @class TimerStyle
 * @extends {React.Component}
 */
class TimerStyle extends React.Component {
  constructor(props) {
    super(props);

    this.timer = undefined;

    this.state = {
      time: this.props.time,
      timaA:this.props.timeA,
      date: this.props.date,
      week: this.props.week
    };

    this.tick = this.tick.bind(this);
  }
  static get defaultProps() {
    let timeFormat = 'HH:mm'
    // let timeAFormat = 'a'
    // let timeFormat = 'h:mm'
    let dateFormat = "MMM Do"
    let weekFormat = "dddd"
    return {
      time: moment().format(timeFormat),
      // timaA: moment().format(timeAFormat),
      date: moment().format(dateFormat),
      week:moment().format(weekFormat),
      checkInterval: 5,
      timeFormat,
      // timeAFormat,
      dateFormat,
      weekFormat
    }
  }
  componentDidMount() {
    this.timer = setInterval(this.tick, this.props.checkInterval);
  }
  tick() {
    this.setState({
      time: moment().format(this.props.timeFormat),
      // timaA:moment().format(this.props.timeAFormat),
      date: moment().format(this.props.dateFormat),
      week: moment().format(this.props.weekFormat),
    });
  }
  render() {
    return  (
      <div style={{display:'inline-block',position:'relative',top:'4px'}}>
        <div style={{display:'inline-block',position:'relative',width:"98px"}}>
          <span style={{display:'inline-block',position:'absolute',top:'-32px',textAlign:"center",fontSize:"36px",fontFamily:"Tahoma"}}>
          { this.state.time }
          </span>
          {/*<span style={{display:'inline-block',position:'absolute',top:'-9px',height:"20px",lineHeight:"20px",width:"30px",textAlign:"center"}}>
            {this.state.timaA}
          </span>*/}
        </div>
        <div style={{display:'inline-block',position:'relative',width:"60px"}}>
          <span style={{display:'inline-block',position:'absolute',top:'-27px',height:"20px",lineHeight:"20px"}}>
          { this.state.date.replace(" ","") }
          </span>
          <span style={{display:'inline-block',position:'absolute',top:'-9px',height:"20px",lineHeight:"20px"}}>
            {this.state.week}
          </span>
        </div>
      </div>
    );
  }
}

export default TimerStyle
