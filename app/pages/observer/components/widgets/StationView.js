import React from 'react'
import Widget from './Widget.js'
import http from '../../../../common/http';
import s from './StationView.css';
import { Popover} from 'antd';
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'station',
    name : '状态点方格组件',
    description : "生成状态点方格组件",
}

let timer
class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
            realtimeData:[],
        }    
        this.statusSquare = this.statusSquare.bind(this)
    }

    componentDidMount(){
        const config =this.props.config
        if(config&&config.PointPrefix){
            http.post('/pointData/getRealtimeWithPages',{
                keyWordList:[config.PointPrefix],
                pageSize:100,
                targetPage:1
            }).then(
                data => {
                    this.setState({
                        realtimeData:data.data
                    })
                }
            )  
            timer = setInterval(()=>{
                http.post('/pointData/getRealtimeWithPages',{
                    keyWordList:[config.PointPrefix],
                    pageSize:100,
                    targetPage:1
                }).then(
                    data => {
                        data.data.map((item,index)=>{
                            if(item.value != this.state.realtimeData[index].value){
                                this.setState({
                                    realtimeData:data.data
                                }) 
                            }
                        })                
                    }
                )  
            },60000) 
        }     
    }

    componentWillUnmount(){
        window.clearInterval(timer)
    }

    statusSquare(){
        const config =this.props.config
        let sqWidth = 100/(config&&config.xNumber?config.xNumber:10)+'%'
        return(
            this.state.realtimeData.map((item,index)=>{
                if(item.value==0){
                    return <Popover content={(<div>
                                <p>点名：{item.name}</p>
                                <p>释义：{item.description}</p>
                            </div>)} title="点位信息"
                            >
                                <div className={s['green']} style={{width:sqWidth,paddingTop:sqWidth}}></div>
                            </Popover> 
                }else{
                    return <Popover content={(<div>
                                <p>点名：{item.name}</p>
                                <p>释义：{item.description}</p>
                                </div>)} title="点位信息"
                            >
                                <div className={s['red']} style={{width:sqWidth,paddingTop:sqWidth}}></div>
                            </Popover> 
                }
            })
        )    
    }

    render() {
        return (   
            <div style={{marginLeft:'10px',marginTop:"10px"}}>
                {this.statusSquare()}               
            </div>
        )
    }
}


//const efficiencyChartView = Form.create()(FormWrap)

/**
 * 继承自基类，需要重写基类中提供的方法，如 @getContent()方法用来生成自定义组件，最后通过调用基类的render方法渲染组件
 * 
 * @class LineChartComponent
 * @extends {Widget}
 */
class StationViewComponent extends Widget {
    
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

export default  StationViewComponent


