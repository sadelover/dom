import { Form, Modal,Col,Row,Input,Icon,InputNumber,Tag, Select, Switch, Button, message } from "antd";
import React from "react";

const FormItem = Form.Item
const confirm = Modal.confirm
const Option = Select.Option
const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    xs: { span: 12 },
    sm: { span: 8  },
  },
  wrapperCol: {
    xs: { span: 14 },
    sm: { span: 14 },
  },
};

const descriptions = {
    accum_point:`简介：
    accum_point(ptNameFrom, ptNameTo, fRatio=1.0, actTime=None)
    将ptNameFrom的点值累积到ptNameTo的点值
    ptNameFrom: str, 瞬时量点名
    ptNameTo： str, 累积量点名
    fRatio: float, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    condition_last_minutes:`简介：
    判断一个条件是否持续满足一定分钟数返回1表示判断通过返回0表示判断不通过
举例：
    condition_last_minutes("<%ChChWTempSupplySetPoint01%>>11.9", 15)`,
    get_today_data_average_when_running:`简介：
    get_today_data_average_when_running(strPointName, strOnOffPointName, nDecimal=2, actTime=None)
    作用：获取strPointName在今天之内仅当strOnOffPointName点值为1的时间段内的点值平均值
    strPointName: str, 点名
    strOnOffPointName: str, 开关状态点
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    get_day_delta_last_month:`简介：
    get_day_delta_last_month(strPointName, nDay, nDecimal=2, actTime=None)
    作用：获取strPointName在上个月某一天之内的点值之差
    strPointName: str, 点名
    nDay: int， 天
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    get_day_delta_at_month_this_year:`简介：
    get_day_delta_at_month_this_year(strPointName, day, month, nDecimal=2,actTime=None)
    作用：获取strPointName在今年某月某天之内的点值之差
    strPointName: str, 点名
    day: int ，天
    month: int, 月
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_day_delta_this_month:`简介：
    get_day_delta_this_month(strPointName,day,nDecimal=2,actTime=None)
    作用：获取本月strPointName在某一天之内的点值之差
    strPointName: str, 点名
    day: int，天
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为Non
举例：
    `,
    get_month_delta_this_year:`简介：
    get_month_delta_this_year(strPointName,nMonth,nDecimal=2,actTime=None)
    作用：获取strPointName在今年某两个月第一天之间的点值之差
    strPointName: str, 点名
    nMonth: int, 月份
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_yesterday_data_delta: `简介：
    get_yesterday_data_delta(strPointName, strTimeFrom="00:00", strTimeTo="00:00", nDecimal=2,actTime=None)
    作用：获取strPointName在昨日一段时间之内的点值之差
    strPointName: str, 点名
    strTimeFrom：str， 开始时刻，格式为HH：SS
    strTimeTo: str， 结束时刻，格式为HH：SS
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    get_today_data_delta:`简介：
    get_today_data_delta(strPointName, nDecimal=2,actTime=None)
    作用：获取strPointName在今日一天指捏的点值之差
    strPointName: str, 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_yesterday_data_at_time:`简介：
    get_yesterday_data_at_time(strPointName, strTimeFrom,nDecimal=2,actTime=None)
    作用：获取strPointName在昨天同一时刻的点值
    strPointName: str, 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_data_at_time:`简介：
    get_data_at_time(strPointName, strTimeAt,  nDecimal=2,actTime=None)
    作用：获取strPointName在strTimeAt时刻的点值
    strPointName: str, 点名
    strTimeAt: str, 时刻，格式为 yyyy-mm-dd HH:MM:SS
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_this_hour_data_delta:`简介：
    get_this_hour_data_delta(strPointName, nHour, nDecimal=2, actTime=None)
    作用：获取当前小时的累积量差值，如nHour输入4，则计算该日内4:00与3:00 的累积量之差 
    strPointName: str, 点名
    nHour: int ，小时
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_hour_data_delta:`简介：
    get_hour_data_delta(strPointName, nDecimal=2, actTime=None)
    作用：获取strPointName在过去一小时之内的点值之差
    strPointName: str, 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_yesterday_data_avg_in_time_range:`简介：
    get_yesterday_data_avg_in_time_range(strPointName, strTimeFrom, strTimeTo, nDecimal=2,actTime=None)
    作用：计算昨日strPointName 在一天某一个时间范围的平均值
    strPointName： str, 点名
    strTimeFrom：开始时间，格式为：MM:SS ，如09:00
    strTimeTo: 结束时间，格式为：MM:SS ，如09:00
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    get_today_data_at_time:`简介：
    get_today_data_at_time(strPointName, strTimeFrom,nDecimal=2,actTime=None)
    作用：获取strPointName在今天某个时刻的点值
    strPointName:  str, 点名
    strTimeFrom: str, 开始时间，格式为MM:SS， 09:00
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_yesterday_data_at_same_time:`简介：
    get_yesterday_data_at_same_time(strPointName, nDecimal=2,actTime=None)
    作用：获取strPointName 在昨天同一时刻的点值
    strPointName: str, 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_last_week_data_at_same_time:`简介：
    get_last_week_data_at_same_time(strPointName, nDecimal=2,actTime=None)
    作用：获取strPointName在上一周同一时刻的点值
    strPointName: str, 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_today_data_average:`简介：
    get_today_data_average(strPointName, nDecimal=2,actTime=None)
    作用：计算strPointName今日点值的平均值
    strPointName: str， 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_yesterday_data_average:`简介：
    get_yesterday_data_average(strPointName, nDecimal=2,actTime=None)
    作用：计算strPointName 昨日点值的平均值
    strPointName: str， 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_yesterday_data_sum:`简介：
    get_yesterday_data_sum(strPointName, nDecimal=2,actTime=None)
    作用：计算strPointName昨日点值之和
    strPointName: str， 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_today_data_avg_in_time_range:`简介：
    get_today_data_avg_in_time_range(strPointName, strTimeFrom, strTimeTo, nDecimal=2, actTime=None)
    作用：获取strPointName点值在今日某个时间范围之内的平均值
    strPointName: str， 点名
    strTimeFrom： 开始时间，格式为：MM:SS ，如09:00
    strTimeTo: 结束时间，格式为：MM:SS ，如09:00
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    get_today_data_sum:`简介：
    get_today_data_sum(strPointName, nDecimal=2,actTime=None)
    作用：计算今日strPointName点值之和
    strPointName: str， 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_thismonth_delta:`简介：
    get_thismonth_delta(strPointName, nDecimal=2, actTime=None, strStartTime=None)
    计算本月差值
    strPointName：str, 点名
    strStartTime: str, 格式为 "nDay HH:MM"，如"26 08:00"，即开始计算的天和时间分别为 26号和08:00
    actTime: str, 计算时间，用于历史数据补算，默认为None
    nDecimal: int, 计算结果的小数位
举例：`,
    get_thismonth_delta_from_special_day:`简介：
    get_thismonth_delta_from_special_day(strPointName, nDayFrom=1, nDecimal=2, actTime=None)
    计算本月从某一天开始的差值
    strPointName: str，点名
    nDayFrom： int, 计算起始天，默认为1（1号）
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    get_lastyear_sametime_value:`简介：
    get_lastyear_sametime_value(strPointName, nDecimal=2,actTime=None)
    作用：获取去年的当前时刻的点值
    strPointName: str, 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    get_recent_days_data_sum:`简介：
    get_recent_days_data_sum(strPointName, nDecimal=2, nDays=0,actTime=None)
    作用：获取过去几天之内的点值之和
    strPointName: str, 点名
    nDecimal: int, 计算结果的小数位
    nDay: int ,天数，如nDay输入5，则计算过去5天之内strPointName的点值之和
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    get_lastmonth_delta:`简介：
    get_lastmonth_delta(strPointName, nDecimal=2,actTime=None)
    计算上个月的差值
    strPointName: str, 点名
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_data_avg_in_day_range:`简介：
    get_data_avg_in_day_range(strPointName, day, nDecimal=2,actTime=None)
    计算本月某一天之内的平均值
    strPointName: str, 点名
    day：int, 计算起始日
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_moving_average:`简介：
    get_moving_average(strPointName, nMinutes,  nDecimal=2, actTime=None)
    作用：获取strPointName的点值在过去nMinutes分钟范围内的平均值
    strPointName： str, 点名
    nMinutes： int, 分钟数
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    get_moving_average("OutdoorWetTemp", 15)`,
    get_moving_average_when_running:`简介：
    get_moving_average_when_running(strPointName, strOnOffPointName, nMinutes, nDecimal=2, actTime=None)
    作用：获取strPointName 的点值在当strOnOffPointName的点值>0 的nMinutes分钟数范围之内平均值
    strPointName：str, 点名
    strOnOffPointName： str, 状态点点名
    nMinutes： int ,分钟数
    nDecimal: int, 计算结果的小数位
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    get_moving_average("OutdoorWetTemp", 15)`,
    string_date_of_this_month:`简介：
    string_date_of_this_month(nDayIndex, strFormat='%Y/%m/%d', actTime=None)
    作用：获取本月某一天的日期字符串
    nDayIndex：int, 天
    strFormat：str， 日期格式
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：`,
    string_date_of_last_month:`简介：
    string_date_of_last_month(nDayIndex, strFormat='%Y/%m/%d', actTime=None)
    作用：获取上个月某一天的日期字符串
    nDayIndex：int, 天
    strFormat：str， 日期格式
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    run_num_count:`简介：
    run_num_count(pointNameList)
    作用：计算设备的运行台数
    pointNameList： 状态点名列表，[strOnOff01, strOnOff02... ]
举例：
    `,
    is_today_chinese_holiday:`简介：
    is_today_chinese_holiday(actTime=None)
    作用：判断当前时间是否为中国节假日
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    is_today_chinese_holiday()`,
    get_date_string_today:`简介：
    get_date_string_today(nFormat, actTime=None)
    作用：获取今日日期字符串
    nFormat：int，  格式代码， 0- YYYY-MM-DD 1- Y年m月d日  2- yyyy/mm/dd
    actTime: str, 计算时间，用于历史数据补算，默认为None
举例：
    `,
    get_bit:`简介：
    get_bit(strPointName, nBit)
    作用：获取某个点值的第N位，从右往左依次为第1,2,3... 32位
    strPointName: 点名，str
    nBit: 位号，int， 从1开始，最大为32
举例：
    获取point01点值在第3位的值
    get_bit("point01", 3)
    `,
    get_data_is_not_changing:`简介：
    get_data_is_not_changing(strPointName, nMinutes)
    作用：检查某个点是否在一定的时间内点值不发生变化
    strPointName：str，点名
    nMinutes: int，分钟数，默认为30
举例：
    检查1#冷机冷冻水出水温度在10分钟内是否不发生变化
    get_data_is_not_changing("ChLeaveEvapTemp01", 10)`,
    get_data_last_month_at_day_time:`简介：
    get_data_last_month_at_day_time(strPointName, nDay, strTime)
    作用：获取上月某个点在某天某时刻的值
    strPointName: 点名，str
    nDay: 天，int
    strTime: 时间，str ， HH:SS
举例：
    获取ChPowerTotal01 在上月10号12:00的值
    get_data_last_month_at_day_time("ChPowerTotal01", 10, "12:00")`,
    get_data_last_year_at_month_day_time:`简介：
    get_data_last_year_at_month_day_time(strPointName, nMonth, nDay, strTime)
    作用：获取某个点在去年某月某日某时刻的值
    strPointName: 点名，str
    nMonth: 月, int
    nDay: 天，int
    strTime: 时间，str ， HH:SS
举例：
    获取ChPowerTotal01 在去年1月10号12:00的值
    get_data_last_year_at_month_day_time("ChPowerTotal01", 1, 10, "12:00")`,
    get_data_max_in_day_range:`简介：
    get_data_max_in_day_range(strPointName, day, nDecimal=2)
    作用：获取指定点在本月某日一整天的最大值
    strPointName: 点名，str
    day: 日期，int，比如1则为本月1号
    nDecimal: 小数位，int ， 默认2，可以不填
举例：
    获取1#冷机功率在本月1号全天的最大值
    get_data_max_in_day_range("ChPower01", 1)`,
    get_data_min_in_day_range:`简介：
    get_data_min_in_day_range(strPointName, day, nDecimal=2)
    作用：获取指定点在本月某日一整天的最小值
    strPointName: 点名，str
    day: 日期，int，比如1则为本月1号
    nDecimal: 小数位，int ， 默认2，可以不填
举例：
    获取1#冷机功率在本月1号全天的最小值
    get_data_min_in_day_range("ChPower01", 1)`,
    get_data_this_month_at_day_time:`简介：
    get_data_this_month_at_day_time(strPointName, nDay, strTime)
    作用：获取本月某日某一时刻的值，如果传入时间是某月一日的零点到6点之间，那么认为本月的月还是上月
    strPointName: 点名，str
    nDay: 天，int
    strTime: 时间，str ， HH:SS
举例：
    get_data_this_month_at_day_time("ChPowerTotal01", 16, "12:00")`,
    get_data_thisyear_at_month_day_time:`简介：
    get_data_thisyear_at_month_day_time(strPointName, nMonth, nDay, strTime)
    作用：获取今年指定月日时刻的值
    strPointName: 点名，str
    nMonth: 月，int，如2，默认为1
    nDay: 日，int ， 如 11，默认为1
    strTime: 时刻， str, 如 10:00 ， 默认为00:00
举例：
    获取PriChWTempSupply01 在今年1月10号11:00 的值
    get_data_thisyear_at_month_day_time("PriChWTempSupply01", 1, 10, "11:00")`,
    get_date_string_yesterday:`简介：
    get_date_string_yesterday(nFormat)
    作用：获取昨日的日期字符串
    nFormat:  类型索引，int ，  (0- YYYY-MM-DD 1- Y年m月d日 2- yyyy/mm/dd )
举例：
    get_date_string_yesterday(0)`,
    get_day_time_delta_this_month:`简介：
    get_day_time_delta_this_month(strPointName, nDay, strHourMinute, nDecimal=2)
    作用：获取本月某日用量，计算开始时间从strHourMinute 开始
    strPointName: 点名，str
    nDay: 天，int
    strHourMinute: 时间，str
    nDecimal: 小数位，int，默认为2
举例：
    get_day_time_delta_this_month("ChPowerTotal01", 2, "12:00")`,
    get_this_year_data_delta:`简介：
    get_this_year_data_delta(strPointName, nDecimal=2)
    作用：计算strPointName当前时刻的值与今年1月1号0点值之差
    strPointName：str，点名
    nDecimal：int，小数位，默认为2
举例：
    计算1#冷机今年用电量
    get_this_year_data_delta("ChPowerTotal01")`,
    get_thismonth_data_avg:`简介：
    get_thismonth_data_avg(strPointName, nDecimal=2)
    作用：获取指定点在本月的平均值
    strPointName: str, 点名
    nDecimal: int，小数位，默认2
举例：
    获取某温度在本月的均值
    get_thismonth_data_avg("PriChWTempSupply01", 1)`,
    get_thisweek_data_delta:`简介：
    获取本周（周一零点到现在）的差值。
举例：`,
    get_thisyear_data_avg:`简介：
    get_thisyear_data_avg(strPointName, nDecimal=2)
    作用：获取指定点在本年的平均值
    strPointName: str, 点名
    nDecimal: int，小数位，默认2
举例：
    获取某温度在本年平均值
    get_thisyear_data_avg("PriChWTempSupply01", 1)`,
    get_thisyear_delta_from_month_to_now:`简介：
    get_thisyear_delta_from_month_to_now(strPointName, nMonth=1, nDecimal=2)
    作用：查询strPointName 在今年指定月份（仅限指定的月份）的1号到月末中间第一个存在的数值（nData），与该点的当前值做差（当前值 - nData）
    strPointName: str, 点名
    nMonth: int, 月份
    nDecimal: int, 小数位
举例：
    计算从4月份到当前时间的累积运行时间之差
    get_thisyear_delta_from_month_to_now("L01_AHUCHour01", nMonth=4, nDecimal=2)`,
    get_time_string:`简介：
    get_time_string(年,月,日,时,分,秒,时间字符串格式)
    作用：获取指定格式的时间字符串
    年：必填，可填入指定年或枚举量，如可填入2019，也可填入枚举量：   -1 : 当前年； -2： 上一年
    月：必填，可填入指定月或枚举量，如可填入3（3月），也可填入枚举量：-1：当前月；-2：上一月
    日：必填，可填入指定日或枚举量，如可填入12（12号），也可填入枚举量：-1：当前日；-2：上一日
    时：必填，可填入指定时或枚举量，如可填入11（11时），也可填入枚举量：-1：当前小时；-2：上个小时
    分：必填，可填入指定分钟或枚举量，如可填入59（59分），也可填入枚举量：-1：当前分钟；-2：上一分钟
    秒：必填，可填入指定秒或枚举量，如可填入10（10秒），也可填入枚举量：-1：当前秒；-2：上一秒
    时间字符串格式：选填，时间格式，默认为%Y-%m-%d %H:%M:%S（输出的时间格式形如 2022-03-05 12:10:25），
举例：
    本月5号的2点整，格式精确到秒：
    get_time_string(-1,-1,5,2,0,0)`,
    get_today_data_begin:`简介：
    get_today_data_begin(strPointName,nDecimal)
    作用：获取今日0点的值
    strPointName：str，点名
    nDecimal: int, 小数位，默认为2
举例：
    ChAMPS01 在今日0点的值
    get_today_data_begin("ChAMPS01", 1)`,
    get_today_data_delta_in_time_range:`简介：
    暂无描述`,
    get_yesterday_data_delta_in_time_range:`简介：
    暂无描述`,
}

class ApiModal extends React.Component{
    constructor(props){
        super(props);
        this.state={
            description: ''
        }
    }

    componentDidMount(){
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
               this.props.setAddr(values['api'])
               this.props.handleCancel()
            }
        });
    }

    selectApi = (value)=> {
        console.log(value)
        const form = this.props.form
        let flag = 0
        for(let i in descriptions){
            if(value.slice(0,-2) == i){
                flag = 1
                form.setFieldsValue({
                    description: descriptions[i]
                })
            }
        }
        if(flag ==0){
            form.setFieldsValue({
                description: value
            })
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form 
        const form = this.props.form 
        return(
            <Modal
                title='API选择'
                visible={this.props.visible}
                maskClosable={false}
                onOk={this.handleSubmit}
                zIndex={1200}
                onCancel={this.props.handleCancel}
                width={500}
            >
                <Form> 
                    <FormItem
                        label="API"
                    >
                        {getFieldDecorator('api', {
                        })(
                            <Select onChange={this.selectApi} zIndex={1200}>
                                <Option value='accum_point()'>accum_point()</Option>
                                <Option value='condition_last_minutes()'>condition_last_minutes()</Option>
                                <Option value='get_bit()'>get_bit()</Option>
                                <Option value='get_data_at_time()'>get_data_at_time()</Option>
                                <Option value='get_data_avg_in_day_range()'>get_data_avg_in_day_range()</Option>
                                <Option value='get_data_is_not_changing()'>get_data_is_not_changing()</Option>
                                <Option value='get_data_last_month_at_day_time()'>get_data_last_month_at_day_time()</Option>
                                <Option value='get_data_last_year_at_month_day_time()'>get_data_last_year_at_month_day_time()</Option>
                                <Option value='get_data_max_in_day_range()'>get_data_max_in_day_range()</Option>
                                <Option value='get_data_min_in_day_range()'>get_data_min_in_day_range()</Option>
                                <Option value='get_data_this_month_at_day_time()'>get_data_this_month_at_day_time()</Option>
                                <Option value='get_data_thisyear_at_month_day_time()'>get_data_thisyear_at_month_day_time()</Option>
                                <Option value='get_date_string_today()'>get_date_string_today()</Option>
                                <Option value='get_date_string_yesterday()'>get_date_string_yesterday()</Option>
                                <Option value='get_day_delta_this_month()'>get_day_delta_this_month()</Option>
                                <Option value='get_day_time_delta_this_month()'>get_day_time_delta_this_month()</Option>
                                <Option value='get_hour_data_delta()'>get_hour_data_delta()</Option>
                                <Option value='get_moving_average()'>get_moving_average()</Option>
                                <Option value='get_this_year_data_delta()'>get_this_year_data_delta()</Option>
                                <Option value='get_thismonth_data_avg()'>get_thismonth_data_avg()</Option>
                                <Option value='get_thismonth_delta_from_special_day()'>get_thismonth_delta_from_special_day()</Option>
                                <Option value='get_thismonth_delta()'>get_thismonth_delta()</Option>
                                <Option value='get_thisweek_data_delta()'>get_thisweek_data_delta()</Option>
                                <Option value='get_thisyear_data_avg()'>get_thisyear_data_avg()</Option>
                                <Option value='get_thisyear_delta_from_month_to_now()'>get_thisyear_delta_from_month_to_now()</Option>
                                <Option value='get_time_string()'>get_time_string()</Option>
                                <Option value='get_today_data_at_time()'>get_today_data_at_time()</Option>
                                <Option value='get_today_data_average()'>get_today_data_average()</Option>
                                <Option value='get_today_data_begin()'>get_today_data_begin()</Option>
                                <Option value='get_today_data_delta_in_time_range()'>get_today_data_delta_in_time_range()</Option>
                                <Option value='get_today_data_delta()'>get_today_data_delta()</Option>
                                <Option value='get_yesterday_data_at_time()'>get_yesterday_data_at_time()</Option>
                                <Option value='get_yesterday_data_avg_in_time_range()'>get_yesterday_data_avg_in_time_range()</Option>
                                <Option value='get_yesterday_data_delta_in_time_range()'>get_yesterday_data_delta_in_time_range()</Option>
                                <Option value='is_today_chinese_holiday()'>is_today_chinese_holiday()</Option>
                                <Option value='run_num_count()'>run_num_count()</Option>
                                <Option value='string_date_of_last_month()'>string_date_of_last_month()</Option>
                                <Option value='string_date_of_this_month()'>string_date_of_this_month()</Option>
                                <Option value='get_lastyear_sametime_value()'>get_lastyear_sametime_value()</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        label="API描述"
                    >
                        {getFieldDecorator('description', {
                        })(
                            <TextArea rows={10}/>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

const ApiModalView = Form.create({
   
})(ApiModal)

export default ApiModalView