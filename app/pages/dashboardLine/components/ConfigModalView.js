/**
 * Boolean
 */
import React from 'react'
import {Modal,Form,Input,Button,Select,Row,Col,Checkbox,Icon, Tag} from 'antd'
import {modalTypes} from '../../../common/enum'
import PointModalView from '../containers/PointModalContainer'
import s from './ConfigModalView.css'

let formClass,toggleModalClass,btnWarp
if(localStorage.getItem('serverOmd')=="persagy") {
    toggleModalClass = 'persagy-modal'
    formClass = 'persagy-dashBoardLine-form'
    btnWarp = 'persagy-btn-wrap'
} else {
    btnWarp = 'btn-wrap'
}

const FormItem = Form.Item
const Option = Select.Option


const pointListLabel = {
    top:'-20px',
    left:'20px',
    position:'absolute',
    color:'#fff',
    width:'130px'
  }

const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };

 const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      },
    };
class FormData extends React.Component{

    constructor(props) {
    super(props);

    this.state = {
      selectedPoints: this.props.selectedData,//this.props.pageData.pageConfig.points,
      range: [],
    };

   
     this.handleSelectPoints = this.handleSelectPoints.bind(this);
    //this.handleSelectInfo = this.handleSelectInfo.bind(this)
     this.delSelectedPoints = this.delSelectedPoints.bind(this)
  }

  componentWillReceiveProps(nextProps) {
        if (nextProps.selectedData != this.props.selectedData && this.props.selectedData == this.state.selectedPoints ) {
            this.setState({
                selectedPoints: nextProps.selectedData
            }) 
        }
        // console.log(this.state.selectedPoints)
    }

    handleModalHide(){
        const { toggleConfigModal ,form, addConfigInfo, pageName, selectedData} = this.props
        const {  validateFields } = form
        validateFields( (err,value) => {
            if( !err ){
                toggleConfigModal()
                addConfigInfo(pageName,this.state.selectedPoints,value.lineName)
            }
        })
    }
    
    handleHidePointModal(){
        const {showPointModal,toggleConfigModal} = this.props
        // toggleConfigModal()
        showPointModal(modalTypes.LINE_POINT_MODAL)
    }

    //处理选择点
    handleSelectPoints(points) {
        let selectedPoints = this.state.selectedPoints
        if (points && points.length) {
        this.setState({
            selectedPoints: [...selectedPoints,...points]
        });
        }
    }
    
    // 获取组件
    getComponents() {
        return this.state.selectedPoints.map((point, i) => {
        return (
            <Tag key={point} style={{backgroundColor:"#1C2530"}} closable onClose={(e)=>{this.delSelectedPoints(e,point)}} >{point}</Tag>
        )
        })
    }

    delSelectedPoints(e,delpoint){
        let newPoints = this.state.selectedPoints.filter( point=>{
            return point !== delpoint
        })
        console.info( newPoints )
        this.setState({
            selectedPoints: newPoints
        })
    }
    

    render(){
        const { 
            toggleConfigModal, 
            showPointModal
        } = this.props
        const { getFieldDecorator } = this.props.form;

        return (
            <Form
                className={formClass}
            >
                <FormItem>
                    <span>
                        配置曲线信息
                    </span>
                </FormItem>
                <FormItem
                      wrapperCol={{
                    xs: { span: 10 },
                    sm: { span: 8 },
                    }}
                >
                    <div className={s[`${btnWarp}`]} >
                        <span style={{color:"red",left:"8px",width:"5px",fontSize:"15px",position:'absolute',top:"-18px"}} >*</span><span style={pointListLabel}>绑定点名的列表清单</span>
                        {this.getComponents()}
                        <Button
                        onClick={
                            () => this.props.showPointModal(true, {
                                onOk: this.handleSelectPoints
                            })
                        }
                        >+</Button>  
                    </div>
                </FormItem>
                <FormItem
                    label='名称'
                    {...formItemLayout}
                >
                    {getFieldDecorator('lineName',{
                        rules:[{
                            validator : (rule,value,callback) => {
                                if(value){
                                    callback()
                                    return 
                                }
                                callback('请填写曲线图的名称')
                            }
                        }]
                    })(
                        <Input/>
                    )}
                </FormItem>          
                <FormItem
                    {...formItemLayoutWithOutLabel}
                >
                    <Button onClick={toggleConfigModal}  style={{marginRight:'10px'}}>取消</Button>
                    <Button onClick={()=>{this.handleModalHide()}} >确定</Button>
                </FormItem>
            </Form>
        )
    }
}

const FromWrap = Form.create()(FormData)

class ConfigModal extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            getPoints: [],
        };

       // this.handleModalHide = this.handleModalHide.bind(this)
    }
    // handleModalHide(){
    //     const { toggleConfigModal } = this.props
    //     toggleConfigModal()
    // }

    componentDidMount() {
        let requestData = this.props.pageData
        if (requestData && requestData.pageConfig && requestData.pageConfig.points) {
            this.setState({
                getPoints: [...requestData.pageConfig.points]
            }) 
        }
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.pageData.pageName != this.props.pageData.pageName) {
          if (nextProps.pageData.pageConfig.points) {
            this.setState({
                getPoints: nextProps.pageData.pageConfig.points
            })  
          }else {
            this.setState({
                getPoints: []
            }) 
          }
                   
        } 
        else {
           let requestData = this.props.pageData
            if (requestData && requestData.pageConfig && requestData.pageConfig.points) {
                this.setState({
                    getPoints: [...requestData.pageConfig.points]
                }) 
            }       
        }
    }
    render(){
        const {
            visible,
            toggleConfigModal,
            addConfigInfo,
            selectedData,
            showPointModal,
            pageName,
            pageData
        } = this.props;
        const getPoints = this.state.getPoints;
        return (
            <Modal
                className={toggleModalClass}
                visible={visible}
                closable={false}
                onCancel={toggleConfigModal}
                footer={null}
                maskClosable={false}
            >
                <FromWrap 
                    toggleConfigModal={toggleConfigModal} 
                    addConfigInfo={addConfigInfo}
                    pageName={pageName}
                    showPointModal={showPointModal}
                    selectedData={getPoints}
                    pageData={pageData}
                />
                <PointModalView
                />
            </Modal>
        )
    }
}


export default ConfigModal