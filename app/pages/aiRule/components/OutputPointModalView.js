// ====输出的点名===
import React from 'react'
import { Modal, Table, Button, Input } from "antd";
import { modalTypes } from '../../../common/enum'
import AddVPointModal from './AddVPointModalView'
const Search = Input.Search
let pointToggleClass, modalToggleClass, OutputToggleClass;
if (localStorage.getItem('serverOmd') == "persagy") {
    pointToggleClass = 'persagy-table-tbody persagy-table-thead persagy-table-placeholder persagy-pagination-item';
    modalToggleClass = 'persagy-modal-style persagy-point-modal';
    OutputToggleClass = 'persagy-point-input';
}

const columns = [
    {
        title: '点名',
        dataIndex: 'name',
        width: 200,
    }, {
        title: '点名释义',
        dataIndex: 'description',
        width: 200
    }, {
        title: '来源',
        dataIndex: 'sourceType',
        width: 100
    }, {
        title: '地址',
        dataIndex: 'addr',
        width: 100
    }
]

class PointView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedPoint: null,
            isShowAddVPointModal:false
        }

        this.handleShowAddPointModal = this.handleShowAddPointModal.bind(this);
        this.hideAddVPointModal = this.hideAddVPointModal.bind(this);
        this.onChange = this.onChange.bind(this);
        this.setSearch = this.setSearch.bind(this);
    }

    componentDidMount() {
        const { initializeOutput } = this.props
        initializeOutput()
    }

    hideAddVPointModal () {
        this.setState({
            isShowAddVPointModal:false
        })
    }

    handleShowAddPointModal () {
        this.setState({
            isShowAddVPointModal:true
        })
    }

    setSearch(value) {
        this.setState({
            searchValue:value
        })
    }
    onChange(e){
        this.setState({
            searchValue:e.target.value
        })
    }

    render() {
        const {
            pagination,
            pointDataOutput,
            onPaginationChange,
            modal,
            hidePointModal,
            searchPointData,
            loading,
            onSelectChangeOutput,
            handleOk,
            selectedIdsOutput
        } = this.props
        return (
            <div>
            <Modal
                className={modalToggleClass}
                title="点位选择"
                visible={modal.type === modalTypes.AI_OUTPUT_POINT_MODAL}
                onCancel={hidePointModal}
                maskClosable={false}
                width={600}
                footer={[
                    <Button key="ok" type="primary" size="large" onClick={handleOk} disabled={!selectedIdsOutput.length}>
                        确定
                    </Button>,
                    <Button key="cancel" size="large" onClick={hidePointModal}>
                        取消
                    </Button>,
                ]}
            >
                <Button type="primary" style={{marginBottom:10}} onClick={this.handleShowAddPointModal}>
                        新建虚拟点
                    </Button>
                <div className={OutputToggleClass} style={{ marginBottom: '10px' }}>
                    <Search
                        placeholder='请搜索具体的点名'
                        onSearch={value => searchPointData(value)}
                        onChange={this.onChange}
                        value={this.state.searchValue}
                    />
                </div>
                <Table
                    className={pointToggleClass}
                    columns={columns}
                    dataSource={pointDataOutput}
                    rowKey="name"
                    pagination={{
                        ...pagination,
                        style: { marginBottom: 0 }
                    }}
                    onChange={onPaginationChange}
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: selectedIdsOutput,
                        onChange: onSelectChangeOutput
                    }}
                    scroll={{ y: 400 }}
                    loading={loading}
                />
            </Modal>
            <AddVPointModal
                visible={this.state.isShowAddVPointModal}
                handleCancel={this.hideAddVPointModal}
                searchPointData= {searchPointData}
                setSearch={this.setSearch}
            />
        </div>
        )
    }
}

export default PointView