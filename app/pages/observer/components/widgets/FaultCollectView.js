import React, { Component } from 'react'
import Widget from './Widget.js'
import http from '../../../../common/http';
import s from './FaultCollectView.css';
import moment from 'moment'
import {Table,Modal} from 'antd';

/*
故障统计-简单版
*/
const TimeFormat = 'YYYY-MM'

 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'FaultCollect',
    name : '故障统计简单版组件',
    description : "生成故障统计简单版组件",
}

class FormWrap extends React.Component {
    constructor(props){
        super(props)
        this.state={
            data:[],
            number:0,
            loading:false,
            time:moment().format(TimeFormat),
        }

        this.searchTypeTable = this.searchTypeTable.bind(this)
    }

    componentDidMount(){
        this.searchTypeTable()
    }

    searchTypeTable(){
        let data = [],userName,Number=0
        this.setState({
            loading:true
        })
        let userInfo = localStorage.getItem('userInfo')
        userName = userInfo.slice(9,userInfo.indexOf('"',10))
        http.post('/fdd/statistic',{
            userName: userName,
            yearMonth: this.state.time,
            view: this.props.config&&this.props.config.faultType?this.props.config.faultType:"类型"
        }).then(
            res=>{
                if(res.data&&res.err==0){
                    for(let i in res.data){
                        if(res.data[i].type!="工单"){
                            Number = Number + res.data[i].total
                            data.push(res.data[i])
                        }
                    }
                    this.setState({
                        data: data,
                        number: Number,
                        loading: false
                    })
                }else{
                    this.setState({
                        loading: false
                    })
                }
            }
        ).catch(
            err=>{
                this.setState({
                    loading: false
                })
            }
        )
    }

    render(){
        return (
            <div className={s['container-table']}>    
                    <h2 className={s['table-title']}>
                        报警类型统计    
                    </h2>  
                    <div className={s['table-text']}>当月报警总数：<span className={s['table-faultNumber']}>{this.state.number}</span> 次</div>
                    <FaultTable
                        data={this.state.data}
                        loading={this.state.loading}
                    />              
            </div>
        )
    }
    
}

class FaultTable extends React.Component{
    constructor(props){
        super(props)
        this.state={
            data:[]
        }
    }

    componentDidMount(){
    }
    
    render(){
        const columns = [
            {
                title: '报警类型',
                dataIndex: 'type',
                key: 'type',
                width: 80,
            }, {
                title: '当月累计',
                dataIndex: 'total',
                key: 'total',
                width: 70
            }, {
                title: '报警逾期率',
                dataIndex: 'overdueRate',
                key: 'overdueRate',
                width: 70
            }, {
                title: '报警解决率',
                dataIndex: 'solveRate',
                key: 'solveRate',
                width: 70
            }
        ]
        return (
            <Table
                columns={columns}
                dataSource={this.props.data}
                pagination={false}
                bordered={true}
                loading={this.props.loading}
            >
            </Table>
        )
    }
}


/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class FaultCollectComponent extends Widget {
    
    constructor(props){
        super(props)
        this.state = {
            style : {},
        }
       
    }
    /* @override */
    static get type() {
        return registerInformation.type;
    }
    /* @override */
    static get registerInformation() {
        return registerInformation;
    }

    componentDidMount() {
        // style只提供基础的组件坐标和宽高，自定义需要增加逻辑
        const {style} = this.props
        this.setState({style})
    }
    /* @override */
    getContent() {
        const {style} = this.state
        
        return (
            <div style={style} className={s['container']} >
                <FormWrap

                    {...this.props}
                    
                />
            </div>
        )
    }
}

export default  FaultCollectComponent



