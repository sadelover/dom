/**
 * 制冷系统的优化控制信息设定值模态框
 */
import React from 'react' ;
import { Modal, Form, InputNumber, Spin, Alert ,Input,Button,DatePicker,TimePicker} from 'antd'
import cx from 'classnames';
import moment from 'moment'


import http from '../../../common/http';

const FormItem = Form.Item;

class SettingValueModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLimit: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getPicker = this.getPicker.bind(this);
  }

  componentDidMount() {
    const {setFieldsValue} = this.props.form
    setFieldsValue({
        settingTime: moment(this.props.value,this.props.timeFormat)
    })
  }

  //点击确定，提交
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.handleOk(values,this.props.name,this.props.timeFormat);
      }
    });
  }

  onChange(value){
      const {setFieldsValue} = this.props.form
      setFieldsValue({
          settingTime: moment(value)
      })
  }

  getPicker(formItemLayout,getFieldDecorator) {
    //timeFixed=1,仅日期 
    if (this.props.timeFixed == 1) {
      return(
        <FormItem
          {...formItemLayout}
          label="修改日期"
        >
          {getFieldDecorator('settingTime', {
          })(
              <DatePicker
                  style={{width:160}}
                  format={this.props.timeFormat}
                  placeholder="Select Date"
                  onChange={this.onChange}
              />
          )}
        </FormItem>
      )
    }else {
      //timeFixed=2,仅时间
      if (this.props.timeFixed == 2) {
        return(
          <FormItem
            {...formItemLayout}
            label="修改时间"
          >
            {getFieldDecorator('settingTime', {
            })(
                <TimePicker
                    style={{width:160}}
                    format={this.props.timeFormat}
                    placeholder="Select Time"
                    onChange={this.onChange}
                />
            )}
          </FormItem>
        )
      }else {
        return(
          <FormItem
            {...formItemLayout}
            label="修改日期时间"
          >
            {getFieldDecorator('settingTime', {
            })(
                <DatePicker
                    style={{width:160}}
                    showTime
                    format={this.props.timeFormat}
                    placeholder="Select Date"
                    onChange={this.onChange}
                />
            )}
          </FormItem>
        )
      }
    }
  }
 
  render() {
    const { getFieldDecorator } = this.props.form;
    let { visible } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 15
      },
    };
     visible = typeof visible === 'undefined' ? true : visible;
     let description
     if(this.props.pointInfo){
       if (this.props.pointInfo.hight>this.props.pointInfo.low){  //判断有无高低限
        this.setState({
          isLimit: true
        })
      };
      description=this.props.pointInfo && this.props.pointInfo.description
     }
      
    return (
      <Modal
        title={this.props.isLoading ? '指令设置进度提示':'确认指令' }
        width={500}
        visible={visible}
        onCancel={this.props.hideModal}
        onOk={this.handleSubmit}
        maskClosable={false}
        footer={
          this.props.isLoading ? 
          [
            <Button onClick={this.handleSubmit} >确认</Button>
          ] :
          [

            <Button onClick={this.props.hideModal} >取消</Button>,
            <Button onClick={this.handleSubmit} >确认</Button>
          ]
        }
      >
      {
        this.props.isLoading ? 
            <Spin tip={this.props.modalConditionDict.status? '正在修改设定值' : this.props.modalConditionDict.description}>
              <Alert
                  message="提示"
                  description="数据正在更新"
                  type="info" 
              />
            </Spin>
          : 
          <Form>
            {
              this.getPicker(formItemLayout,getFieldDecorator)
            }
          </Form>
      }
      </Modal>
    );
  }
}
// 注：Form.create方法会自动收集数据并进行处理
const TimePickerModal = Form.create()(SettingValueModal);

export default TimePickerModal


