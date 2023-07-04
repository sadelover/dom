import React  from  'react'
import {  Modal , Table ,Button,Input} from "antd";
import { modalTypes } from '../../../common/enum'
import s from './PointModalView.css'
const Search = Input.Search

let pointToggleClass,modalToggleClass,inputToggleClass;
if(localStorage.getItem('serverOmd')=="persagy"){
    pointToggleClass = 'persagy-table-tbody persagy-table-thead persagy-table-placeholder persagy-pagination-item';
    modalToggleClass = 'persagy-modal-style persagy-point-modal';
    inputToggleClass = 'persagy-point-input';    
}

const columns = [
  {
    title : '点名',
    dataIndex : 'name',
    width : 200
    
  }, {
    title :'点名释义',
    dataIndex : 'description',
    width : 200
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

class PointView extends React.Component{
    constructor(props){
        super(props)
        this.state={
            selectedPoint : [],
           // selectedData:{}
        }        

        //this.onRowClick = this.onRowClick.bind(this)
        this.onOk = this.onOk.bind(this);
        //this.rowClassName = this.rowClassName.bind(this)
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onCancel = this.onCancel.bind(this);
    }

    componentDidMount(){
        const {initialize} = this.props
        initialize()
    }

    onOk(){
        const {saveSelectedPoint,showPointModal,props} = this.props
        showPointModal(false)
        props.onOk(this.state.selectedPoint)
        this.setState({
            selectedPoint : []
        })
    }

    onSelectChange(value){
        this.setState({
            selectedPoint : value
        })
    }

     //关闭模态框
    onCancel(){
        this.props.showPointModal(false)
        this.setState({
            selectedPoint : []
        })
    }

    render(){
        const {
            pagination,
            pointData,
            onPaginationChange,
            visible,
            props,
            searchPointData,
            loading
        } = this.props
        return (
            <Modal
                className={modalToggleClass}
                zIndex={4000}
                title="点位选择"
                visible= {visible}
                onCancel={this.onCancel}
                maskClosable={false}
                width={600}
                footer={[
                    <Button key="ok" type="primary" size="large" onClick={this.onOk} disabled={ !this.state.selectedPoint }>
                        确定
                    </Button>,
                    <Button key="cancel" size="large" onClick={this.onCancel}>
                        取消
                    </Button>,
                ]}
            >
                <div className={inputToggleClass} style={{marginBottom: '10px'}}>
                    <Search
                        placeholder='请搜索具体的点名'
                        onSearch={value=>searchPointData(value)}
                    />
                </div>
                <Table
                    className={pointToggleClass}
                    columns={columns}
                    dataSource={pointData}
                    rowKey="name"
                    pagination={{
                    ...pagination,
                    style: { marginBottom: 0 }
                    }}
                    onChange={onPaginationChange}
                    
                    // onRowClick={this.onRowClick}
                    // rowClassName={this.rowClassName}
                    scroll={{ y: 400 }}
                    loading={loading}
                    rowSelection={{
                        selectedRowKeys: this.state.selectedPoint,
                        onChange: this.onSelectChange
                    }}
                />
            </Modal>
        )
    }
}

export default PointView