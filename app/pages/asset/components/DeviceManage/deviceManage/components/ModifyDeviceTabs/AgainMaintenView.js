import React from 'react'
import {Modal,Button,Form,Input,Select,Upload,Icon,Table,icon,Row,Col,DatePicker} from 'antd'
import s from './AgainMaintenView.css'
import moment from 'moment';
const Search = Input.Search;
moment.locale('zh-cn');
//import EditableTableView from './EditableTableView'
const dateFormat = 'YYYY/MM/DD HH/mm/ss';
const FormItem = Form.Item
const Option  = Select.Option

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  
  

const AgainMaintenView = Form.create({
    mapPropsToFields : function(props){
        let table = props.table
        let modifyData = table.searchData.filter( (item)=>{
            if(item.id == table.maintenId) return item
        })
        let modifyDict = modifyData.length && modifyData[0]
        
        //使用obj保存变更后的属性类型
        let obj = {}
        
        if(modifyData.length){
            
        }

        return {
            name : {
                value : modifyDict.name
            }
            
        }
    }
}




)(
    class extends React.PureComponent{
        constructor(props){
            super(props)
            this.state={
                visible:true,
                selIds:[],
                beginTime:"",
                againUser:[]
            }
            
            this.onOk = this.onOk.bind(this)
            this.onSelectChange=this.onSelectChange.bind(this)
            this.onChange = this.onChange.bind(this)
            this.hide = this.hide.bind(this)
            this.moveToRight = this.moveToRight.bind(this)
            this.moveToLeft = this.moveToLeft.bind(this)
            this.distribute = this.distribute.bind(this)
            this.adopt = this.adopt.bind(this)
            this.noAdopt = this.noAdopt.bind(this)
        }
        
        
        shouldComponentUpdate(nextProps,nextState){//?????
            return true;
        }
        
        // componentWillReceiveProps(nextProps){
        //     if(this.props.visible!=nextProps.visible){
        //         this.setState({
        //             visible:false
        //         })
        //     }
        // }    

        searchInsUser(){
            let searchKey = document.getElementById('s')?document.getElementById('s')[0]:"";
            searchKey = "";
            this.props.searchInsUser(searchKey);
        }

        moveToRight(){
            //获取用户名称和用户ID
            let selObj=document.getElementById("select1");
            let uname=selObj.options[selObj.selectedIndex].text;
            let id=selObj.value;
           
            //获取到state
            let sdata=this.state.againUser
    
            //判断用户是否属于重新发布，在全局的state中是否有该用户的ID
            //并且用心的数组存起来
            let data2=[];
            let flag=false
            for(let i=0;i<sdata.length;i++){
                if(sdata[i].userid==id){
                    flag=true
                }else{
                data2.push(sdata[i])
                }
            }
    
            if(flag){
                Modal.confirm({tatle:'用户不能重复发布!'})
            }else{
            
    
            //在添加  删除时，不能直接对state进行操作，否则会导致render方法不会被调用
            //如 let data=this.state.publishUser
            //   data.push({"userid":id,"username":uname})
            //以上方式虽然数据已经存入进入 state中了，但是render方法不会被重新调用，导致数据虽然变了，但右侧下拉列表页面  还是展示不出刚刚右移的用户
    
            data2.push({"userid":id,"username":uname});
            this.setState({
                againUser:data2
             })
            }
        }

        moveToLeft(){
            //获取到右侧选择的select options  选中的下拉用户
            let selObj=document.getElementById("select2");
            //获取ID
            let id=selObj.value;
            
            //从state中取出，已发布的用户
            let sdata=this.state.againUser
            
            //数组无法直接提供删除，只能形成一个新的数组
            //原理： 1 2 3  要删除2   遍历数组，等于2的不做处理  不等于2的 用新数组存起来
            let data2=[]
            let flag=false
            for(let i=0;i<sdata.length;i++){
                if(sdata[i].userid==id){
                    flag=true
                }else{
                    data2.push(sdata[i])
                }
            }
            
            //重新放回state
            this.setState({
                againUser:data2
             })
        }

        adopt(){
            this.props.examineFunction();
            this.props.onListSearch();
            this.props.hideExamine();
        }

        noAdopt(){
            this.props.examineFunction();
            this.props.onListSearch();
            this.props.hideExamine();
        }

        onSelectChange(selIds){
            this.setState({
                selIds:selIds
             })
        }

        distribute(){
            if(this.state.againUser.length==0){
                Modal.confirm({tatle:'请选择下发用户！'})
            }else{
                let id = this.state.againUser.map(item=>{return item.userid})
            this.props.distribute(id);
            this.props.hideAgain();
            Modal.confirm({title:'下发成功！'})
            }
        }

        onChange(date,dateString) {
            this.setState({
                beginTime: dateString
            })
        }

        hide(){
            this.props.hideAgain()
        }

        //点击提交表单时触发
        onOk(e){
            const {form} = this.props
            e.preventDefault()
            form.validateFields((err,values)=>{
                if(!err){
                    this.props.hideAgain()
                }
            })
            this.props.form.resetFields();
        }

        
        render(){
            
            let selIds=this.state.selIds
            const {form,
                rowKey,
                modal,
                table,
                hideModal,
                selectedIds,
                onSelectChange, 
                pagination, 
                onShowSizeChange, 
                onPaginationChange,
                addFunction,
                searchInsUser,
                distribute,
                visible
            } = this.props
            const {getFieldDecorator} = form
            var uoptions="";
            var soptions="";
            if(table.tableData){
                uoptions = table.tableData.map(row => {
                    return <option value={row.id}>{row.username}</option>
                });  
            }
            /**
             * 组装发布用户下拉列表
             */
            if(this.state.againUser){
                soptions = this.state.againUser.map(row => {
                    return <option value={row.userid}>{row.username}</option>
                });  
            }
             //直接获取表格行的数据
             let modifyData = table.data.filter( (item)=>{
                if(item.id == table.selectedIds[0]) return item
            })
            return (
                <Modal
                    title='重新维修'
                    visible={table.againData?table.againData:false}
                    onCancel={this.hide}
                    onOk={this.onOk}
                    footer={null}
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label='当前选择的保养任务'
                            >
                                {
                                    getFieldDecorator('name',)(<Input type="text" readOnly="true"/>)
                                }
                        </FormItem>
                        <Search
                        id="s"
                        placeholder="请输入姓名查询"
                        style={{ width: 160 ,marginLeft:30}}
                        onSearch={()=>{this.searchInsUser()}}
                    />
                <div className={s['header']}>
                    <div className={s['row select-body']}>
                        <div className={s['span2']}>
                            <select multiple='multiple' id='select1' className={s['select-left']}>
                                {/* {searchData} */}
                               {uoptions}
                            </select>
                        </div>
                        <div className={s['span2']}>
                            <div className={s['btn-bar']}>
                                <div><input style={{width:'100'}} type='button' className={s['btn']} value='Add to List' title='右移' onClick={this.moveToRight}></input></div>
                                <div style={{marginTop:20}}><input style={{width:'100'}} type='button' className={s['btn']} value='Remove from List' title='左移' onClick={this.moveToLeft}></input></div>
                            </div>
                        </div>
                        <div className={s['span2']}>
                            <select multiple='multiple' id='select2' className={s['select-right']}>
                                {soptions}
                            </select>
                        </div>
                        <div>
                        
                        {/* 预期完成时间<input type="text"/> */}
                        <Button className={s['btn-common']} onClick={this.distribute}>发布</Button>
                        <Button className={s['btn-common']} onClick={this.hide}>取消</Button>
                        </div>
                    </div>
                </div>
                    </Form>
                </Modal>
            )
        }
    }
)

export default AgainMaintenView