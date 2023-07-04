import React, { Component } from 'react';
import {Icon,Modal} from 'antd';
import Widget from './Widget.js';
import  s from './EvaluationBar.css';
import http from '../../../../common/http';
import appConfig from '../../../../common/appConfig';
import evaluationBarImg from "../../../../themes/dark/images/evaluationBar.jpg";
import evaluationJJImg from "../../../../themes/dark/images/evaluationJJ.png";
import evaluationPImg from "../../../../themes/dark/images/evaluationP.png";
import evaluationBImg from "../../../../themes/dark/images/evaluationB.png";
import evaluationYImg from "../../../../themes/dark/images/evaluationY.png";
import evaluationGImg from "../../../../themes/dark/images/evaluationG.png";

const registerInformation = {
    type : 'evaluationBar',
    name : '评估条组件',
    description : "评估条组件组件，覆盖canvas对应区域",
}

class EvaluationBar extends Widget {
    constructor(props){
        super(props)
        this.state = {
            style : {},
            pointValue: 0,
            end:0,
            start:0            
        }
        this.getBar = this.getBar.bind(this)
    }
    /* @override */
    static get type() {
      return registerInformation.type;
    }
    /* @override */
    static get registerInformation() {
      return registerInformation;
    }

    componentDidMount () {
        const {width,height,left,top} = this.props.style
        let value = 0
        if (this.props.config != undefined && this.props.config.end!= undefined && this.props.config.start!= undefined && this.props.config.bindPoint != undefined) {
            const {end,start} = this.props.config
            
            // http.post('/get_realtimedata',{
            //     pointList:[this.props.config.bindPoint],
            //     proj:appConfig.project.id
            // }).then(
            //     data=>{
            //         if (data.length != 0 && data[0].name === this.props.config.bindPoint&&data[0].value!="Null") {
            //             this.setState({
            //                 pointValue: value
            //             })
            //         }
            //     }
            // )
            this.setState({
                end:end,
                start:start,
                pointValue: value
            })
        }
       
         this.setState({
            style : {
                width : width,
                height : height,
                left : left,
                top : top
            },

        })
    } 
    
    componentWillReceiveProps(nextProps){
        const {custom_realtime_data} = nextProps
        let value = 0
        let _this = this
        if (custom_realtime_data.length != 0) {
            custom_realtime_data.filter((item,index)=>{
                if(item.name === nextProps.bindPoint){
                    value = item.value
                    _this.setState({
                        pointValue:value
                    })
                }
            })
        }
        //let value = custom_realtime_data.filter(item=>item.name === nextProps.idCom)[0].value;
        if (_this.props.style != nextProps.style) {
            _this.setState({
                style:nextProps.style
            })
        }
    //    this.setState({
    //        pointValue:value
    //    })
        // 判断两个数组内容是否相等
        // if(JSON.stringify(this.state.pointvalue) !== JSON.stringify(pointvalue)){
        //     this._renderTable(nextProps)
        // }
    }

    getBar (themes) {
        if (this.props.config != undefined && this.props.config.color != undefined
            && this.props.config.color.length !=0 && this.props.config.segments != undefined && this.props.config.start != undefined && this.props.config.end != undefined ) {
                let start = this.props.config.start
                let end = this.props.config.end
                let colorList = this.props.config.color
                let segments = this.props.config.segments
                let range = Math.abs(end - start)
                return (
                    colorList.map((item,index)=>{
                        if (index === 0) {
                            return(
                                <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-start))/range))*100 + '%'}}>
                                    <div className={s['content_bar_start']} style={{'backgroundColor':item}}></div>
                                    <div style={{'overflow':'hidden'}}>
                                        <div style={{'float':'left',"color":themes?themes:"black"}}>{start}</div>
                                    </div>
                                </div>
                            )
                        }else {
                            if (index === (colorList.length-1)) {
                                //最后一个
                                return (
                                    <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(end-segments[index-1]))/range))*100 + '%'}}>
                                        <div className={s['content_bar_end']} style={{'backgroundColor':item}}></div>
                                        <div style={{'overflow':'hidden'}}>
                                            <div style={{'float':'left',"color":themes?themes:"black"}}>{segments[index-1]}</div>
                                            <div style={{'float':'right',"color":themes?themes:"black"}}>{end}</div>
                                        </div>
                                    </div>
                                ) 
                            }else {
                                return (
                                    <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-segments[index-1]))/range))*100 + '%'}}>
                                        <div className={s['content_bar']} style={{'backgroundColor':item}}></div>
                                        <div style={{'overflow':'hidden'}}>
                                            <div style={{'float':'left',"color":themes?themes:"black"}}>{segments[index-1]}</div>
                                        </div>
                                    </div>
                                ) 
                            }
                        }
                       
                    })
                )          
        }else {
            Modal.error({
                title:'配置有误' ,
                content:'Factory中该组件配置有误或不全'
            })
        }
    }
    
    getBarHeat (themes) {
        if (this.props.config != undefined && this.props.config.color != undefined
            && this.props.config.color.length !=0 && this.props.config.segments != undefined && this.props.config.start != undefined && this.props.config.end != undefined ) {
                let start = this.props.config.start
                let end = this.props.config.end
                let colorList = this.props.config.color
                let segments = this.props.config.segments
                let range = Math.abs(end - start)
                if(this.props.config.title === '' || this.props.config.title === " " || this.props.config.title === undefined){
                    if(themes===''||themes===" "||themes===undefined){
                        themes="white";
                    }
                }else{
                    if(themes===''||themes===" "||themes===undefined){
                        themes="black";
                    }
                }
                return (
                    colorList.map((item,index)=>{
                        if (index === 0) {
                            return(
                                <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-start))/range))*100 + '%'}}>
                                    <div className={s['content_bar']} style={{'backgroundColor':item}}></div>
                                    <div style={{'overflow':'hidden','marginTop':'12px'}}>
                                        <div style={{'float':'left'}}>&nbsp;</div>
                                    </div>
                                </div>
                            )
                        }else {
                            if (index === (colorList.length-1)) {
                                //最后一个
                                return (
                                    <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(end-segments[index-1]))/range))*100 + '%'}}>
                                        <div className={s['content_bar']} style={{'backgroundColor':item}}></div>      
                                        <div style={{'overflow':'hidden','marginLeft':'-9px'}}>  
                                            <span className={s["heat_span"]} style={{"color":themes}}>|</span>                    
                                            <div className={s["content_bar_text"]} style={{"color":themes}}>{segments[index-1]} %</div>
                                        </div>
                                    </div>
                                ) 
                            }else {
                                return (
                                    <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-segments[index-1]))/range))*100 + '%'}}>
                                        <div className={s['content_bar']} style={{'backgroundColor':item}}></div>
                                        <div style={{'overflow':'hidden','marginLeft':'-9px'}}> 
                                            <span className={s["heat_span"]} style={{"color":themes}}>|</span> 
                                            <div className={s["content_bar_text"]} style={{"color":themes}}>{segments[index-1]} %</div>
                                        </div>
                                    </div>
                                ) 
                            }
                        }  
                    })
                )     
        }else {
            Modal.error({
                title:'配置有误' ,
                content:'Factory中该组件配置有误或不全'
            })
        }
    }

    getBarEnergy (themes) {
        if (this.props.config != undefined && this.props.config.color != undefined
            && this.props.config.color.length !=0 && this.props.config.segments != undefined && this.props.config.start != undefined && this.props.config.end != undefined ) {
                let start = this.props.config.start
                let end = this.props.config.end
                let colorList = this.props.config.color
                let segments = this.props.config.segments
                let range = Math.abs(end - start)
                let colorA,colorB,colorC
                let height
                let width = 0.1/range*(this.state.style.width-100)-5
                height=this.state.style.height*0.7*0.28*0.4+"px";
                if(themes===''||themes===" "||themes===undefined){
                    themes="white";
                }
                return (
                    colorList.map((item,index)=>{
                        if (index === 0) {
                            colorA=item;
                            colorB="";
                            return(
                                <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-start))/range))*100 + '%'}}>
                                    <div className={s['content_bar']} style={{'backgroundColor':item,"lineHeight":height}}><span className={s["bar_text_YX"]}>优秀</span></div>
                                        <div style={{'overflow':'hidden'}}>
                                            <div className={s["content_bar_text_energy"]} style={{"color":themes,"marginLeft":"18px"}}>C.O.P</div>
                                        </div>
                                    <div className={s["content_bar_text_energy_consumption"]} style={{"color":themes,"marginLeft":"14px"}}>KW/RT</div>
                                </div>    
                            )
                        }else {
                            if (index === (colorList.length-1)) {
                                //最后一个
                                return (
                                    <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(end-segments[index-1]))/range))*100 + '%'}}>
                                        <div className={s['content_bar']} style={{'backgroundColor':item,"lineHeight":height}}><span className={s["bar_text_GS"]}>急需改善</span></div>      
                                           <div className={s["energy_bar_COP"]}>  
                                                <span className={s["energy_span"]} style={{"color":themes}}>|</span>                    
                                            <div className={s["content_bar_text_energy"]} style={{"color":themes}}>({Number(3.517/segments[index-1]).toFixed(1)})</div>
                                        </div>
                                        <div className={s["content_bar_text_energy_consumption"]} style={{"color":themes}}>{Number(segments[index-1]).toFixed(1)}</div>
                                    </div>
                                ) 
                            }else {
                                if(item==colorA){
                                    colorA=item;
                                    colorB="";
                                    return (
                                        <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-segments[index-1]))/range))*100 + '%'}}>
                                            <div className={s['content_bar']} style={{'backgroundColor':item}}></div>
                                            <div className={s["energy_bar_COP"]}>  
                                                <span className={s["energy_span"]} style={{"color":themes}}>|</span> 
                                                <span className={s["energy_span_center"]} style={{"color":themes,"marginLeft":width/2}}>|</span> 
                                                <div className={s["content_bar_text_energy"]} style={{"color":themes}}>({Number(3.517/segments[index-1]).toFixed(1)})</div>
                                            </div>
                                            <div className={s["content_bar_text_energy_consumption"]} style={{"color":themes}}>{Number(segments[index-1]).toFixed(1)}</div>
                                        </div>
                                    ) 
                                }else if(item!=colorA&&colorB==""){
                                    colorB=item;
                                    colorC="";
                                    return (
                                        <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-segments[index-1]))/range))*100 + '%'}}>
                                            <div className={s['content_bar']} style={{'backgroundColor':item,"lineHeight":height}}><span className={s["bar_text_LH"]}>良好</span></div>
                                            <div className={s["energy_bar_COP"]}>  
                                                <span className={s["energy_span"]} style={{"color":themes}}>|</span> 
                                                <span className={s["energy_span_center"]} style={{"color":themes,"marginLeft":width/2}}>|</span> 
                                                <div className={s["content_bar_text_energy"]} style={{"color":themes}}>({(3.517/segments[index-1]).toFixed(1)})</div>
                                            </div>
                                            <div className={s["content_bar_text_energy_consumption"]} style={{"color":themes}}>{segments[index-1].toFixed(1)}</div>
                                        </div>
                                    ) 
                                }else if(item==colorB){
                                    colorB=item;
                                    colorC="";
                                        return (
                                            <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-segments[index-1]))/range))*100 + '%'}}>
                                                <div className={s['content_bar']} style={{'backgroundColor':item}}></div>
                                                <div className={s["energy_bar_COP"]}> 
                                                    <span className={s["energy_span"]} style={{"color":themes}}>|</span> 
                                                 
                                                    <div className={s["content_bar_text_energy"]} style={{"color":themes}}>({(3.517/segments[index-1]).toFixed(1)})</div>
                                                </div>
                                                <div className={s["content_bar_text_energy_consumption"]} style={{"color":themes}}>{segments[index-1].toFixed(1)}</div>
                                            </div>
                                        )   
                                    
                                }else if(item!=colorB&&colorC==""){
                                    colorC=item;
                                    if(segments[index-1]==0.85){
                                        return (
                                          <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-segments[index-1]))/range))*100 + '%'}}>
                                                <div className={s['content_bar']} style={{'backgroundColor':item,"lineHeight":height}}><span className={s["bar_text_YB"]}>一般</span></div>
                                                <span className={s["energy_span_center"]} style={{"color":themes,"marginLeft":"-1.43px"}}>|</span> 
                                                <div className={s["energy_bar_COP"]}> 
                                                    <div className={s["content_bar_text_energy"]} style={{"color":themes}}>&nbsp;</div>
                                                </div>
                                              <div className={s["content_bar_text_energy_consumption"]} style={{"color":themes}}>&nbsp;</div>
                                          </div>
                                          )   
                                      }else{
                                    return (
                                        <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-segments[index-1]))/range))*100 + '%'}}>
                                            <div className={s['content_bar']} style={{'backgroundColor':item,"lineHeight":height}}>一般</div>
                                            <div className={s["energy_bar_COP"]}> 
                                                <span className={s["energy_span"]} style={{"color":themes}}>|</span> 
                                                <span className={s["energy_span_center"]} style={{"color":themes,"marginLeft":width/2}}>|</span> 
                                                <div className={s["content_bar_text_energy"]} style={{"color":themes}}>({(3.517/segments[index-1]).toFixed(1)})</div>
                                            </div>
                                            <div className={s["content_bar_text_energy_consumption"]} style={{"color":themes}}>{segments[index-1].toFixed(1)}</div>
                                        </div>
                                    ) }
                                }else{
                                    return (
                                        <div className={s['content_bar_wrap']} style={{'width':parseFloat((Number(Math.abs(segments[index]-segments[index-1]))/range))*100 + '%'}}>
                                            <div className={s['content_bar']} style={{'backgroundColor':item}}></div>
                                            <div className={s["energy_bar_COP"]}> 
                                            <span className={s["energy_span"]} style={{"color":themes}}>|</span> 
                                            <span className={s["energy_span_center"]} style={{"color":themes,"marginLeft":width/2}}>|</span> 
                                                <div className={s["content_bar_text_energy"]} style={{"color":themes}}>({(3.517/segments[index-1]).toFixed(1)})</div>
                                            </div>
                                            <div className={s["content_bar_text_energy_consumption"]} style={{"color":themes}}>{segments[index-1].toFixed(1)}</div>
                                        </div>
                                    ) 
                                }
                               
                            }
                        }
                       
                    })
                )     
        }else {
            Modal.error({
                title:'配置有误' ,
                content:'Factory中该组件配置有误或不全'
            })
        }
    }

    getContent() {
        const {style} = this.state
        let range = Math.abs(this.state.end - this.state.start) 
        let scale = (Math.abs(Number(this.state.pointValue) - this.state.start))/range < 1 ? (Math.abs(Number(this.state.pointValue) - this.state.start))/range : 1
        let bgcolor
        if(this.props.config.bgcolor === '' || this.props.config.bgcolor === " " || this.props.config.bgcolor === undefined){
            bgcolor =""
        }{
            bgcolor = this.props.config.bgcolor;
        }
        if(this.props.config.subType=="default"||this.props.config.subType==""||this.props.config.subType==" "||this.props.config.subType==undefined){
                return (
                <div>
                    {this.props.config.title === '' || this.props.config.title === " " || this.props.config.title === undefined ?
                        <div style={Object.assign(style,{overflow:"hidden"})} 
                        className={s['table-container-default']} >
                            <div className={s['content']}>
                                <div className={s['content_point_wrap']}>
                                    { 
                                        <div style={{position: 'relative',height:'64%'}}>                             
                                            <img src={evaluationBarImg} alt="" className={s['content_point_default']}
                                            style ={{'left':scale*(this.state.style.width-20),'marginTop':(this.state.style.height*0.7*0.63*0.28*0.4/2-11)}} />
                                        </div>
                                    }
                                 {this.props.config.themes===''||this.props.config.themes===" "||this.props.config.themes===undefined?
                                      this.getBar():this.getBar(this.props.config.themes)}                                     
                                </div>
                            </div>
                        </div>
                        :
                        <div style={Object.assign(style,{backgroundColor:bgcolor})} 
                            className={s['table-container']} >
                            <div className={s['content']}>
                                <div className={s['content_point_wrap_title']}>
                                    <div className={s['content_point_num_notitle']} style ={{'left':scale*(this.state.style.width-20)-8}} >{this.state.pointValue}</div>
                                    <Icon className={s['content_point']} type="caret-down" 
                                        style ={{'left':scale*(this.state.style.width-20)-8,
                                        'color':this.props.config.caretDownColor}} />
                                </div>
                                {this.props.config.themes===''||this.props.config.themes===" "||this.props.config.themes===undefined?
                                      this.getBar():this.getBar(this.props.config.themes)}     
                            </div>
                            <div>
                                {
                                    this.props.config.themes===''||this.props.config.themes===" "||this.props.config.themes===undefined?
                                    <div className={s['footer']}>
                                        {this.props.config.title ? this.props.config.title : ''}
                                    </div>
                                    :
                                    <div className={s['footer']} style={{"color":this.props.config.themes}}>
                                        {this.props.config.title ? this.props.config.title : ''}
                                    </div>
                                }   
                        </div>
                        </div>
                    }
                </div>
                )
        };
        if(this.props.config.subType=="heat balance"){
            return (
            <div>
                <div style={Object.assign(style,{backgroundColor:bgcolor})} 
                    className={s['table-container']}>
                    <div className={s['content']}>
                        <div className={s['content_point_wrap_title']}>
                            <div className={s['content_point_num_dingwei']} style ={{'left':scale*(this.state.style.width-20)-30}} >热平衡率:({this.state.pointValue}%)</div>
                            <img src={evaluationJJImg} alt="" className={s['content_point_heat']} style ={{'left':scale*(this.state.style.width-20)-13}} />      
                        </div>
                        {this.props.config.themes===''||this.props.config.themes===" "||this.props.config.themes===undefined?
                        this.getBarHeat():this.getBarHeat(this.props.config.themes)}
                    </div>
                    <div>
                    {
                        this.props.config.themes===''||this.props.config.themes===" "||this.props.config.themes===undefined?
                        <div className={s['footer']}>
                            {this.props.config.title ? this.props.config.title : ''}
                        </div>
                        :
                        <div className={s['footer']} style={{"color":this.props.config.themes}}>
                            {this.props.config.title ? this.props.config.title : ''}
                        </div>
                    }   
                    </div>
                </div>
            </div>
            );
        }; 
        if(this.props.config.subType=="efficiency"){
            let result,evaluationImg,color
            if(this.state.pointValue==0||this.state.pointValue=="Null"){
                result = 0;
                scale = 1;
            }else{
                result = Number(3.517/this.state.pointValue).toFixed(2)
            }
            if(this.state.pointValue<=0.3&&this.state.pointValue>0){
                scale = 0;
            }
            if(this.state.pointValue>0.3&&this.state.pointValue<1.3){
                scale = this.state.pointValue-this.state.start
            }
            if(this.state.pointValue>=1.3){
                scale = 1;
            }
            if(this.state.pointValue<0){
                scale = 1;
                result = 0;
            }
            if(result>=5.0){
                color = "#528CED"
                evaluationImg = evaluationBImg;
            }else if(result>=4.1){
                color = "#3DD7C1"
                evaluationImg = evaluationGImg;
            }else if(result>=3.5){
                color = "#E5BB3C"
                evaluationImg = evaluationYImg;
            }else{
                color = "#EF5286"
                evaluationImg = evaluationPImg;
            }
            return (
            <div>
                <div style={Object.assign(style,{backgroundColor:bgcolor})} 
                    className={s['table-container-efficiency']} >
                    <div className={s['content']}>
                        <div className={s['content_point_wrap_title']}>
                            <div className={s['content_point_num_dingwei']} style ={{'left':scale*(this.state.style.width-100)-45,"color":color}} >当前能效:({result})</div>
                            <img src={evaluationImg} alt="" className={s['content_point_heat']} style ={{'left':scale*(this.state.style.width-100)-13}} />     
                        </div>    
                        {this.props.config.themes===''||this.props.config.themes===" "||this.props.config.themes===undefined?
                        this.getBarEnergy():this.getBarEnergy(this.props.config.themes)}
                    </div>
                    <div>
                    {
                        this.props.config.themes===''||this.props.config.themes===" "||this.props.config.themes===undefined?
                        <div className={s['footer-efficiency']}>
                            {this.props.config.title ? this.props.config.title : ''}
                        </div>
                        :
                        <div className={s['footer-efficiency']} style={{"color":this.props.config.themes}}>
                            {this.props.config.title ? this.props.config.title : ''}
                        </div>
                    }   
                    </div>
                </div>
            </div>
            );
        };             
    }
}

export default EvaluationBar;