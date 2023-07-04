
import moment from 'moment';
import { DatePicker } from 'antd';

function ModelTimePicker() {
   

    this.rw = undefined;
    this.id = undefined;
    this.bindPoint = undefined;
   
    this.timeFixed = undefined; // 0-日期时间，1-仅日期，2-仅时间
    

    this.color = '#fff';

    this.fontSize = 14;
    this.font = undefined;
    this.value = ""
    this.isDiffValue = undefined;
    this._valueLock = false;

};


export default ModelTimePicker
