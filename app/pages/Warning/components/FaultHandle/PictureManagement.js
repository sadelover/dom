
import React from 'react'
import { Table, Input, Button, DatePicker, Select, Modal, Form, Steps, Spin, message, Tooltip, Icon, Upload } from 'antd';
import appConfig from '../../../../common/appConfig';
import http from '../../../../common/http';
function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}
class PictureManage extends React.Component{
    constructor(props) {
      super(props);
  
      this.state = {
        fileList:[],
        previewVisible: false,
        previewImage: '',
        key:''
      };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.visible == true && nextProps.visible!= this.props.visible){
            let arr = []
            nextProps.record.imgList.map((item,index)=>{
                arr.push({
                    uid: index,
                    name: item,
                    status: 'done',
                    url: `https://dom-soft-release.oss-cn-shanghai.aliyuncs.com/static/images/fdd/${localStorage.getItem('projectName_en')}/${item}`,
                })
            })
            this.setState({
                fileList: arr,
                key: Math.random()
            })
        }
    }

    handlePreview = async file => {
        if (!file.url && !file.preview) {
          file.preview = await getBase64(file.originFileObj);
        }
    
        this.setState({
          previewImage: file.url || file.preview,
          previewVisible: true,
        });
    }

    previewHandleCancel = () => this.setState({ previewVisible: false })

    render(){
        const {visible,handleCancel,record} = this.props
        const props = {
            name: 'file01',
            action: `${appConfig.serverUrl}/saveImgToOSS`,
            data:{
                directory: 'static/images/fdd/'+ localStorage.getItem('projectName_en')+ '/'
            },
            headers: {
              authorization: 'authorization-text',
            },
            listType: 'picture-card',
            onChange({ file, fileList }) {
                if (file.status == 'done') {
                    if(file.response.err == 0){
                        http.post('/fdd/addImgToWorkOrder',{
                            "orderId": record.id,  
                            "userName": JSON.parse(localStorage.getItem('userInfo')).name,                
                            "imgList": file.response.data
                        }).then(res=>{
                            if(res.err==0){
                                message.success(res.msg)
                            }else{
                                message.error(res.msg)
                            }
                        }).catch(err=>{
                            message.error('图片绑定工单接口请求失败！')
                        })
                    }else{
                        message.error('上传图片失败！')
                    }
                }
                if(file.status == 'removed'){
                    http.post('/fdd/removeImgFromWorkOrder',{
                        "orderId": record.id,  
                        "userName": JSON.parse(localStorage.getItem('userInfo')).name,                
                        "imgList": [file.name]
                    }).then(res=>{
                        if(res.err==0){
                            message.success('删除成功')
                        }else{
                            message.error(res.msg)
                        }
                    }).catch(err=>{
                        message.error('从工单删除图片接口请求失败！')
                    })
                }
            },
            defaultFileList:this.state.fileList
        }

        return (
            <div>
                <Modal
                    title="工单图片"
                    visible={visible}
                    footer={null}
                    key={this.state.key}
                    onCancel={()=>{handleCancel();this.props.search()}}
                    zIndex={888}
                    maskClosable={false}
                    >
                    <Upload {...props} onPreview={this.handlePreview}>
                        <Icon type="plus" />
                        <div className="ant-upload-text">Upload</div>
                    </Upload>
                </Modal>
                <Modal zIndex={999} visible={this.state.previewVisible} footer={null} onCancel={this.previewHandleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>
            </div>
        )
    }
}

export default PictureManage