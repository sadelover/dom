import React, { PropTypes } from 'react';
import {Button,Form,Input,Tag} from 'antd'
import cx from 'classnames';
import moment from 'moment';

const FormItem = Form.Item
import s from './ImageConfigView.css';

let toggleLableClass;
if(localStorage.getItem('serverOmd')=="persagy"){
    toggleLableClass = 'persagy-globalConfig-label';
  } else {
    toggleLableClass = 'om-globalConfig-label'
  }

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 14,
        offset: 6,
      },
    },
  };
class ImageConfigView extends React.PureComponent{

    constructor(props) {
        super(props)
        
        this.state = {
            bgPath : '',
            imageSrc : `http:\/\/${localStorage.getItem('serverUrl')}/static/images/logo.png`
        }

        this.refFileInput = null
    }
    
    fileInput = (refFileInput) =>{
        this.refFileInput = refFileInput
    }

    componentDidMount() {
        console.info( `http:\/\/${localStorage.getItem('serverUrl')}/static/images/logo.png` )
    }
    

    uploadBg = () => {
        console.info( this.refFileInput.files[0] )
        var files = this.refFileInput.files[0]
        this.setState({
            bgPath : files['path']
        })
        this.props.uploadBg(files)
        
        this.refFileInput.value = null
    }

    render(){
        return(
            <div className={s['container']} >
            <Form>
                <FormItem
                    {...formItemLayout}
                    label="项目图片上传"
                    className={toggleLableClass}
                >
                    <input style={{display:'none'}} id='file-input' ref={this.fileInput} type="file" accept="image/x-png" onChange={this.uploadBg}  />
                    <Input disabled style={{width:200}} value={this.state.bgPath} title={this.state.bgPath} />
                    <label htmlFor="file-input">
                        <Tag style={{height:'32.5px',lineHeight:'32.5px'}}>
                            上传
                        </Tag>
                    </label>
                </FormItem>
                <FormItem
                >
                    <div className={s['logo-pre']} >
                        <img src={this.props.imgPath} alt=""/>
                    </div>
                </FormItem>
            </Form>
            </div>
        )
    }
}

export default ImageConfigView