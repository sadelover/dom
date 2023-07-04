import React from 'react'
import { Table } from 'antd'
import s from './TableView.css'
import cx from 'classnames';
const columns = [
    {
        title : '报警点ID',
        dataIndex : 'pointname',
        width:200
    },
    {
        title :'报警类型',
        dataIndex : 'mold',
        className : cx(s['warning-type']),
        width:200,
        render:(text) => {
            return (
                <span style={{marginLeft:'8px'}}>{text}</span>
            )
        }
        
    },
    {
        title : '报警信息',
        dataIndex : 'boolWarningInfo',
        className : cx(s['warning-config']),
        width:200
    },
    {
        title : '报警分类',
        dataIndex : 'warningGroup',
        className : cx(s['warning-group']),
        width:200
    }
]

const TableView = ({data,rowKey,loading,onSelectChange,selectedIds}) => {
    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey='key'
            pagination={false}
            scroll={{ y: 300 }}
            loading={loading}
            rowSelection={{
                selectedRowKeys : selectedIds,
                onChange : onSelectChange,
                type:'radio'
            }}
        />
    )
}

export default TableView