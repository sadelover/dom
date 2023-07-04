

import React, { Component } from 'react'
import Widget from './Widget.js'
import L from './CoolingView.css'
// echars 皮肤注册
import '../../../../lib/echarts-themes/dark';
import http from '../../../../common/http';
import { downloadUrl } from '../../../../common/utils'
import { DatePicker , Form,Button,Table,Select,Modal,message,Spin,Row,Col,Card,Layout} from 'antd';
import moment from 'moment'
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:00';
const { Option } = Select;
const { Header, Footer, Sider, Content } = Layout;
class ViewWrap extends React.Component {
       constructor(props){
           super(props)
           this.state={
            columns:[
                {
                    title:this.initTitle('标题'),
                    dataIndex: 'title',
                    key: 'title',
                    render:(text,record)=>{
                        return(
                            <div className={L['Center']}>{text}</div>
                        )
                    }
                }
            ],
            dataSource:[],
            value:0
           } 
           this.download = this.download.bind(this);
           this.handleChange = this.handleChange.bind(this);
           this.Management = this.Management.bind(this);
        //    this.GuranteeContent = this.GuranteeContent.bind(this)
        }
        
        componentDidMount(){
            let Arr = []
            // http.get('/fix/getByPeriod', {    
            //         "timeFrom": moment().startOf('year').format("YYYY-MM-DD HH:mm:ss"),
            //         "timeTo": moment().format("YYYY-MM-DD HH:mm:ss")
            // }).then(
            http.get('/fix/getAll').then( 
                data=>{
                    if(data.err==0){
                        data.data.map((item)=>{
                            if(item.result=='0'){
                                Arr.push(item)
                            }
                        })
                        this.setState({
                            dataSource:Arr
                        })
                    }
                }
            ).catch(
                err=>{
                    Modal.error({
                        title:'提示',
                        content:'数据请求失败'
                    })
                }
            )
        }
        initTitle(colName){
            return <span style={{display:'table',margin:'0 auto'}}>{colName}</span>
        }
       static get defaultProps() {
         return {
           points: [],
           data:[]
         }
       }
       download(){
            const {value} = this.state
            http.post('/fix/downloadFixContentInExcel',{
                "result": value
            }).then(
                data=>{
                    if(data.err==0){
                        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/files/${data.data}`)
                    }else{
                        Modal.error({
                            title:'提示',
                            content:`${data.msg}`
                        })
                    }
                }
            ).catch(
                err=>{
                    Modal.error({
                        title:'提示',
                        content:'获取失败或无内容'
                    })
                }
            )
       }
       handleChange(e){
            this.setState({
                value:parseInt(e)
            })
       }
       //管理
       Management(){
            this.props.RepairDataAction(moment().startOf('year').format("YYYY-MM-DD HH:mm:ss"),moment().format("YYYY-MM-DD HH:mm:ss"))
       }
    //    GuranteeContent(){
    //        let list = this.state.dataSource
    //        if(list.length>0){
    //             let arr = list.map((item,index)=>{
    //                 return (
    //                     <div style={{background:'none',color:"white",borderBottom:"1px solid #ccc",textAlign:'center',cursor:'pointer',lineHeight:'35px'}} 

    //                     >
    //                         {item.title}
    //                     </div>
    //                 )
    //             })
    //             return arr
    //        }
    //    }
       // 容器实例     
       render() {
           const {height,width} = this.props
           let newHeight = height-64
           return (
               <div style={{color:'black',height:`${height}px`,width:`${width}`}}>
                   <Layout style={{background:'none'}}>
                        <Header style={{padding:'0',background:'none',fontSize:'22px',position:'relative',color:'white',textAlign:'center'}}>
                            {/* <Select defaultValue='0' style={{ width: 120 }} onChange={this.handleChange}>
                                <Option value='0'>未解决</Option>
                                <Option value='1'>已解决</Option>
                                <Option value='2'>已关闭</Option>
                            </Select>                         */}
                            报修概览
                            {/* <h2 style={{width:'70%',textAlign:'center',float:'left'}}>报修概览</h2> */}
                            <Button type='primary' size='small' style={{position:'absolute',right:'0px',bottom:'0px'}} onClick={this.Management}>管理</Button>
                            <Button type='primary' size='small' style={{position:'absolute',right:'50px',bottom:"0px"}} onClick={this.download}>下载</Button>
                        </Header>
                        <Content className={L['hideScroll']} style={{overflowY:'scroll',height:`${newHeight}px`}}>
                            {this.state.dataSource.length>0?
                                this.state.dataSource.map((item)=>{
                                   return (
                                    <div style={{height:'70px',borderBottom:'1px solid #687077'}}>
                                        <div style={{float:'left',width:'80%',padding:'0px 0px 0px 10px',lineHeight:'35px'}}>
                                            <p style={{fontSize:'20px',color:'white'}}>{item.title}</p>
                                            <p style={{color:'#A6A6A6',width:'80%',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                                                {item.content}
                                            </p>
                                        </div>
                                        <div style={{lineHeight:'20px',float:'left',width:'20%',textAlign:'right',padding:'5px 5px 0 0'}}>
                                            <p style={{color:'#A6A6A6'}}>{moment(item.reportTime).format("YYYY-MM-DD")
                                            }</p>
                                            <p style={{color:'#A6A6A6'}}>{item.reportUser}</p>
                                            <p style={item.urgent=='2'?{color:'#E20205'}:(item.urgent=='1'?{color:'#FFFF00'}:{color:'#00B050'})}>{item.urgent=='2'?'紧急':(item.urgent=='1'?'普通':'次要')}</p>
                                        </div>
                                    </div>
                                   )
                                })
                                  
                            :0}
                            {/* <Table
                                columns={this.state.columns}
                                dataSource={this.state.dataSource}
                                bordered
                                pagination={false}
                                scroll={{
                                    y:this.props.style.height
                                    }}
                            /> */}
                        </Content>
                   </Layout>
                    
               </div>  
           )
       }
   }
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'FixOverview',
    name : '保修带待办一览组件',
    description : "生成FixOverview组件",
}
/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class GuaranteeViewComponent extends Widget {
    constructor(props){
        super(props)
        this.state = {
            style : {},
            AirConditionZoneList:[]
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
            <div style={style} className={L['container']} >    
                <ViewWrap
                    {...this.props}
                />
            </div>
        )
    }
}

export default  GuaranteeViewComponent