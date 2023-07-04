/**
 * 日历删除模式模态框
 */
import React from 'react';
import { Button, Modal, message, Form, Input, Select, DatePicker , Row ,Col,Table } from 'antd';
import moment from 'moment';

import http from '../../../common/http';

const Option = Select.Option;
const FormItem = Form.Item;

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00'

let ModalStyle;
if(localStorage.getItem('serverOmd')=="persagy"||localStorage.getItem('serverOmd')=="best"){
    ModalStyle = "PersagyCalendarModal"
}else{
    ModalStyle = "CalendarModal"
}

class DelModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedModelId:null,
      selectedModelType:null,
      selectedRowKey:[]
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.disabledStartDate = this.disabledStartDate.bind(this);
    this.disabledEndDate = this.disabledEndDate.bind(this);
    this.getModalView = this.getModalView.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.visible != this.props.visible) {
      this.setState({
        selectedModelId:null,
        selectedRowKey:[]
      })
    }
  }
  handleSubmit(e) {
    e.preventDefault();
    if (this.state.selectedRowKey.length != 0) {
      this.props.loadingCalendar(true)
      this.props.delModelToCalendar(this.props.selectedDate.format('YYYY-MM-DD'),this.state.selectedModelId,this.props.modalType)
      this.props.handleHide();
    }else{
      Modal.info({
        title:"信息",
        content:"请选择要删除的模式!"
      })
    }
  }
  disabledStartDate(startValue) {
    const endValue = this.props.form.getFieldValue('timeEnd');
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate(endValue) {
    const startValue = this.props.form.getFieldValue('timeStart');
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  //选择要删除的模式
  onSelectChange (key,row) {
    this.setState({
      selectedRowKey:key,
      selectedModelType:row[0].type,
      selectedModelId:row[0].modeId
    })
  }

  getModalView () {
    return(
      <Table
        pagination={false}
        bordered
        loading={false}
        scroll={{ y: 300 }}
        columns={[{
            title:'模式名称',
            dataIndex: 'modeName',
            key: 'modeName',
            width:250
          },
          {
            title:'模式类型',
            dataIndex: 'type',
            key: 'type',
            width:150,
            render:(text,record,index)=>{
              if (this.props.typeModeList.length !=0) {
                return this.props.typeModeList.map((item,i)=>{
                  if (record.type == i) {
                    return(
                      <div>
                        {item.name}
                      </div>
                    )
                  }
                })
              }else {
                switch (record.type) {
                  case 0:
                    return(
                      <div>
                      冷站
                      </div>
                    );
                    break;
                  case 1:
                    return(
                      <div>
                        热站
                      </div>
                    );
                    break;
                  case 2:
                    return(
                      <div>
                        BA末端
                      </div>
                    );
                    break;
                  case 3:
                    return(
                      <div>
                        照明
                      </div>
                    );
                    break;
                  case 4:
                    return(
                      <div>
                        自定义1
                      </div>
                    );
                    break;
                  case 5:
                    return(
                      <div>
                        自定义2
                      </div>
                    );
                    break;
                  case 6:
                    return(
                      <div>
                        自定义3
                      </div>
                    );
                    break;
                  case 7:
                    return(
                      <div>
                        自定义4
                      </div>
                    );
                    break;
                  case 8:
                    return(
                      <div>
                        自定义5
                      </div>
                    );
                    break;
                  case 9:
                    return(
                      <div>
                        自定义6
                      </div>
                    );
                    break;
                  case 10:
                    return(
                      <div>
                        自定义7
                      </div>
                    );
                    break;
                  case 11:
                    return(
                      <div>
                        自定义8
                      </div>
                    );
                    break;
                  case 12:
                    return(
                      <div>
                        自定义9
                      </div>
                    );
                    break;
                  case 13:
                    return(
                      <div>
                        自定义10
                      </div>
                    );
                    break;
                  case 14:
                    return(
                      <div>
                        自定义11
                      </div>
                    );
                    break;
                  case 15:
                    return(
                      <div>
                        自定义12
                      </div>
                    );
                    break;
                  case 16:
                    return(
                      <div>
                        自定义13
                      </div>
                    );
                    break;
                  case 17:
                    return(
                      <div>
                        自定义14
                      </div>
                    );
                    break;
                  case 18:
                    return(
                      <div>
                        自定义15
                      </div>
                    );
                    break;
                  case 19:
                    return(
                      <div>
                        自定义16
                      </div>
                    );
                    break;
                  case 20:
                    return(
                      <div>
                        自定义17
                      </div>
                    );
                    break;
                  case 21:
                    return(
                      <div>
                        自定义18
                      </div>
                    );
                    break;
                  case 22:
                    return(
                      <div>
                        自定义19
                      </div>
                    );
                    break;
                  case 23:
                    return(
                      <div>
                        自定义20
                      </div>
                    );
                    break;
                }
              }
            }
          }
        ]}
        dataSource={this.props.modalList} 
        size="small" 
        rowSelection={{
            type:'radio',
            selectedRowKeys : this.state.selectedRowKey,
            onChange : this.onSelectChange
        }}
      />
    )
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout1 = {
      labelCol: {
        span: 4,
        offset:1
      },
      wrapperCol: {
        span: 24
      },
    };

    const formItemLayout2 = {
      labelCol: {
        span: 4,
        offset:1
      },
      wrapperCol: {
        span: 10
      },
    };
    
    return (
      <Modal
        title="模式删除"
        width={600}
        visible={this.props.visible}
        onCancel={this.props.handleHide}
        onOk={this.handleSubmit}
        maskClosable={false}
        wrapClassName={ModalStyle}
      >
        <Form>
          <FormItem label="选中日期" {...formItemLayout2} style={{float:"right"}}>
            <Row>
              {this.props.selectedDate.format('YYYY-MM-DD')}
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout1}
            label="选择要删除的模式"
            hasFeedback
          >
            {this.getModalView()}
          </FormItem>
         
        </Form>
      </Modal>
    );
  }
}
const WrappedDelModal = Form.create()(DelModal);

export default WrappedDelModal
