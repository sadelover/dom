import React, { PropTypes } from 'react';
import {Button,Form,Input,Tag,Select, Radio} from 'antd'
import cx from 'classnames';
import moment from 'moment';
import appConfig from '../../../../common/appConfig'
import http from '../../../../common/http'
const FormItem = Form.Item
const Option = Select.Option
import s from './GlobalConfigView.css';
import ImageConfigView from './ImageConfigView'
import ProcessView from './ProcessView'
import RegistModal from './RegistModal'

let btnStyle,primaryStyle,textStyle,toggleSelectClass;
if(localStorage.getItem('serverOmd')=="best"){
    btnStyle={
      background:"#E1E1E1",
      boxShadow:"2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
      border:0,
      color:"#000",
      fontSize:"12px"
    }
    primaryStyle={
      background:"RGB(43,162,69)",
      boxShadow:"2px 2px 2px RGB(66,66,66),-1px -1px 2px RGB(166,166,166)",
      border:0,
      color:"#000",
      fontSize:"12px"
    }
    textStyle={
        color:"#000"
    }
}else {
    primaryStyle={
        width:'112px',
        height:'32px'
    }
}
if(localStorage.getItem('serverOmd')=="persagy"){
    btnStyle={
        background:"rgba(255,255,255,1)",
        border:'1px solid rgba(195,198,203,1)',
        color:"rgba(38,38,38,1)",
        borderRadius:'4px',
        fontSize:"14px",
        fontFamily:'MicrosoftYaHei'
      }
      primaryStyle={
        borderRadius:'4px',
        width:'112px',
        height:'32px'
    }
    textStyle={
        color:"#000"
    }
    toggleSelectClass = 'persagy-globalConfig'
}

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class GlobalConfigView extends React.PureComponent{

    constructor(props) {
        super(props)
        this.state={
            value : "imageConfig",
            machinecode:''
        }
        this.impower = this.impower.bind(this)
    }
    handleChange = (e) => {
        this.setState({value:e.target.value})
    }
    switchComponent = () =>{
        const {value} = this.state
        const {imgPath,uploadBg} = this.props
        if(value == 'imageConfig'){
            return (<ImageConfigView 
                    imgPath={imgPath}
                    uploadBg={uploadBg}
                />)
        }else if(value == 'processConfig'){
            return (
                <ProcessView/>
            )
        }
    }
    impower(){
        this.props.RegistModal(true)
        http.post('/license/getRequestNo',{
        }).then(
          data=>{
            this.setState({
                machinecode:data.data
              })
          }
        )
    }
    render(){
        return(
            <div className={s['container']} style={textStyle}>
                <div className={s['header']}>
                    
                    <div className={toggleSelectClass}>
                        <RadioGroup
                            defaultValue={this.state.value}
                            onChange={this.handleChange}
                        >
                            <RadioButton value="imageConfig" >项目图片配置</RadioButton>
                            <RadioButton value="processConfig" >守护进程配置</RadioButton>
                        </RadioGroup>
                    </div>
                </div>
                <div className={s['content']} >
                    {this.switchComponent()}
                </div>
                <RegistModal 
                visible = {this.props.visible}
                machinecode = {this.state.machinecode}
                RegistModal={this.props.RegistModal}
                />
                <div style={{width:'400px',fontSize:'14px',margin:'4px auto',lineHeight:'19px',textAlign:'center'}}><span style={{fontSize:'14px',color:'#646A73',fontFamily:'MicrosoftYaHei'}}>软件版本号:&nbsp;</span>{appConfig.project.version}</div>
                <div style={{width:'400px',fontSize:'14px',margin:'4px auto',lineHeight:'19px',textAlign:'center'}}><span style={{fontSize:'14px',color:'#646A73',fontFamily:'MicrosoftYaHei'}}>到期日期:&nbsp;</span>{window.localStorage.getItem('leftday')!==null?moment().add(JSON.parse(window.localStorage.getItem('leftday')).leftday,'days').format('YYYY-MM-DD'):moment().format('YYYY-MM-DD')}</div>
                <div style={{width:'400px',fontSize:'14px',margin:'4px auto',lineHeight:'19px',textAlign:'center'}}><span style={{fontSize:'14px',color:'#646A73',fontFamily:'MicrosoftYaHei'}}>登录服务器IP地址:&nbsp;</span>{localStorage.getItem('serverUrl')}</div>   
                <div style={{width:'400px',fontSize:'14px',margin:'4px auto',textAlign:'center'}}>
                    {/* <Button className={s['btn-margin']} onClick={()=>{process.crash()}} style={btnStyle}>发送崩溃日志</Button> */}
                    <Button style={{fontSize:'14px',display:`${window.localStorage.getItem('leftday')===null?'none':'block'}`}} type='primary' onClick={this.impower} style={primaryStyle}>重新授权</Button>
                </div>
            </div>
            
        )
    }
}

export default GlobalConfigView