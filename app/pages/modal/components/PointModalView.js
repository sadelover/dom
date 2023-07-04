/**
 * 添加点页面
 */
import React from 'react' ;
import { Modal ,Button, Table ,Input,message,Row,Col } from 'antd'
import s from './PointModalView.css'
import cx from 'classnames';

import http from '../../../common/http';

let pointToggleClass,modalToggleClass,inputToggleClass,btnStyle;
if(localStorage.getItem('serverOmd')=="persagy"){
    pointToggleClass = 'persagy-table-tbody persagy-table-thead persagy-table-placeholder persagy-pagination-item persagy-point-table';
    modalToggleClass = 'persagy-modal-style persagy-point-modal';
    inputToggleClass = 'persagy-point-input';
    btnStyle = {
      height:'32px',
      lineHeight:'32px'
    }
}

const Search = Input.Search
const columns = [
  {
    title : '点名',
    dataIndex : 'name',
    width : 200
  }, {
    title :'点名释义',
    dataIndex : 'description'
  }, {
    title : '来源',
    dataIndex : 'sourceType',
    width : 100
  }, {
    title : '地址',
    dataIndex : 'addr',
    width : 100
  }
]

class PointModal extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pagination: {
        current: 1,
        pageSize: 50,
        total: 0,
        pageSizeOptions: ['50', '100', '200'],
        showSizeChanger: true
      },
      selectedPoints: [],
      selectedData:{},
      data: [],
      searchValue:''
    };

    this.container = null;

    //this.onRowClick = this.onRowClick.bind(this);
    //this.rowClassName = this.rowClassName.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this)
    this.onOk = this.onOk.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.saveContainerRef = this.saveContainerRef.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.onSearchValue = this.onSearchValue.bind(this);
  }
  componentDidMount() {
    this.searchPointData('');
  }
  //在换页时，用搜索的接口
  getPointData() {
    // this.setState({
    //   loading: true
    // });
    // http.get(`/analysis/get_pointList_from_s3db/${current}/${pageSize}`)
    // .then(
    //   data => {
    //     if (!this.container) {
    //       return;
    //     }
    //     if (data.status === 'OK') {
    //       this.setState({
    //         loading: false,
    //         pagination: {
    //           ...this.state.pagination,
    //           total: data['data']['total']
    //         },
    //         data: data['data']['pointList']
    //       })
    //     } else {
    //       this.setState({
    //         loading: false,
    //         data: []
    //       })
    //     }
    //   }
    // ).catch(
    //   err => {
    //     if (!this.container) {
    //       return;
    //     }
    //     console.error(err);
    //     this.setState({
    //       loading: false
    //     });
    //   }
    // )
     this.setState({
        loading: true
      });
      const searchValue = this.state.searchValue
      http.post('/point/findByKeyword',{
          "keyword": searchValue
      }).then(
        result => {
          if (result||result[value]) {
            let pointList = Object.keys(result).map(row =>{
              return {
                name: row,
                addr: result[row].addr,
                sourceType: result[row].sourceType,
                description: result[row].description
              }
            })
            let data = {
              pointList: pointList,
              total: pointList.length
            }
            this.setState({
              loading: false,
              pagination: {
                ...this.state.pagination,
                total: pointList.length
              },
              data: pointList
            })
          } else {
            this.setState({
              loading: false,
              data: []
            })
          }
      })  
  }
  //分页器切换页数时
  onTableChange(pagination) {
    const pager = { ...this.state.pagination };
    pager.pageSize = pagination.pageSize;
    pager.current = pagination.current;
    this.getPointData();
    console.info( pagination )
    this.setState({
      pagination: pager,
    });
  }
  
  onOk() {
    console.info(this.state.selectedPoints)
    this.props.onOk(this.state.selectedData);
    this.props.hideModal();
  }
  // onRowClick(record, index) {
  //   this.setState({
  //     selectedPoint: record
  //   });
  // }
  // rowClassName(record) {
  //   if (record === this.state.selectedPoint) {
  //     return s['point-selected'];
  //   }
  //   return '';
  // }
  saveContainerRef(container) {
    this.container = container;
  }
  searchPointData(value){
    const {current,pageSize} = this.state.pagination
    const _this =  this
    this.setState({
      loading : true,
      searchValue: value
    })
    if(value){
          http.post('/point/findByKeyword',{
              "keyword": value
          }).then(
              result=>{
                if(result||result[value]){
                  let pointList = Object.keys(result).map(row => {
                    return {
                      name: row,
                      addr: result[row].addr,
                      sourceType: result[row].sourceType,
                      description: result[row].description
                    }
                  })
                  let data ={
                    pointList:pointList,
                    total: pointList.length
                  }
                 
                  _this.setState({
                    loading: false,
                    data: data['pointList'],
                    pagination: {
                      ..._this.state.pagination,
                      total: data['total']
                    }
                  })
                }else{
                  _this.setState({
                    loading : false,
                    data: []
                  });
                }
                  // console.log(_this.state.data)
              }
          )
      } else{
          http.get(`/analysis/get_pointList_from_s3db/${current}/${pageSize}`)
              .then(
                  data => {
                      if(data.status === 'OK'){
                        this.setState({
                          loading: false,
                          pagination: {
                            ...this.state.pagination,
                            total: data['data']['total']
                          },
                          data: data['data']['pointList']
                        })
                      }else {
                        this.setState({
                          loading: false,
                          data: []
                        })
                      }
                  }
              )
      }
  }

  //清空搜索内容，显示全部点位列表
  clearSearch() {
    this.searchPointData('');
    this.setState({
      searchValue:''
    })
  }

  onSelectChange(value, rows){
    this.setState({
      selectedPoints : value,
      selectedData: rows
    })
  }
  
  //搜索框的值
  onSearchValue(e) {
    this.setState({
      searchValue: e.target.value
    })
  }

  render(){
    let {
      visible,
      hideModal
    } = this.props

    visible = typeof visible === 'undefined' ? true : visible;

    return (
      <Modal
        className={modalToggleClass}
        ref={this.saveContainerRef}
        title='点位选择'
        visible={visible}
        maskClosable={false}
        onCancel={hideModal}
        footer={[
          <Button key="ok" type="primary" size="large" onClick={this.onOk} disabled={ !this.state.selectedPoints[0] }>
            确定
          </Button>,
          <Button key="cancel" size="large" onClick={hideModal}>
            取消
          </Button>,
        ]}
        width={880}
      >
        <div className={s['table-wrap']}>
          <div className={s['search-point']} >
            <Row type="flex">
              <Col span={19} className={inputToggleClass}>
                <Search
                  placeholder="请输入准确的点名搜索"
                  onSearch={value=>this.searchPointData(value)}
                  value={this.state.searchValue}
                  onChange={this.onSearchValue}
                />
              </Col>
              <Col span={1} ></Col>
              <Col span={4} >
                <Button 
                  style={btnStyle}
                  onClick={this.clearSearch}
                >清空搜索</Button>
              </Col>
            </Row>
          </div>
          <Table
            className={pointToggleClass}
            loading={this.state.loading}
            columns={columns}
            dataSource={this.state.data}
            size='small'
            rowKey="name"
            pagination={{
              ...this.state.pagination,
              style: { marginBottom: 0 }
            }}
            onChange={this.onTableChange}
            //onRowClick={this.onRowClick}
            //rowClassName={this.rowClassName}
            scroll={{ y: 400 }}
            rowSelection={{
              selectedRowKeys: this.state.selectedPoints,
              onChange: this.onSelectChange
            }}
          />
        </div>
      </Modal>
    )
  }
}

export default PointModal
