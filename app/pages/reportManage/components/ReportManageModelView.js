import React, { PropTypes,Component } from 'react';
import { DatePicker,Row,Col, Form ,Button ,Select ,message,Spin,Input,Layout,Table,Pagination} from 'antd';
import ReactEcharts from '../../../lib/echarts-for-react'; 
import moment from 'moment';
import http from '../../../common/http';
import '../../../lib/echarts-themes/dark';
import { downloadUrl } from '../../../common/utils';
import { stringify } from 'postcss';
import s from './ReportManageModelView.css'


const format = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const ButtonGroup = Button.Group;  
const FormItem = Form.Item;
const Option = Select.Option
const TimeFormat = 'YYYY-MM-DD HH:mm:ss'
const Search = Input.Search
const { Header, Content, Footer, Sider } = Layout;



const ModalForm = Form.create()( class defaultModal extends React.Component{

    constructor(props){
        super(props)
        this.state = {
       
        }

        this.onSearch = this.onSearch.bind(this);
        this.setTime = this.setTime.bind(this);

    }

    onSearch() {
        let _this = this;
        let startTime, endTime;

        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            }
         
            startTime = values.range[0].format(TimeFormat)
            endTime = values.range[1].format(TimeFormat)
            this.props.searchReport(startTime,endTime)
        
        });
    }

    setTime(param) {
        let startTime, endTime;
        switch(param) {
            case 'week':
                startTime = moment().startOf('week');
                endTime = moment();
            break;
            case 'month':
                startTime = moment().startOf('month');
                endTime = moment();
            break;
            case 'day':
            default:
                startTime = moment().startOf('day');
                endTime = moment();
            break;
        }

        this.props.form.setFieldsValue({
            range: [startTime,endTime]
        })

        this.props.searchReport(startTime,endTime,"")

    }


  componentWillReceiveProps(nextProps) {
      if (this.props != nextProps) {
      }
    // if (!this.props.autoSearch && nextProps.autoSearch) {
    //   this.points = nextProps.data.values;
    //   this.setTimeRange('hour');
    // }
  }

    componentDidMount() {
        this.setTime('day')
    }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form layout='inline'>
        <FormItem
          label="快速选择"
        >
          <ButtonGroup size="small">
            <Button size="small" onClick={ () => { this.setTime('day'); } }>今天</Button>
            <Button size="small" onClick={ () => { this.setTime('week'); } }>本周</Button>
            <Button size="small" onClick={ () => { this.setTime('month'); } }>本月</Button>
          </ButtonGroup>
        </FormItem>
        <FormItem
          label="时间范围"
        >
          {getFieldDecorator('range')(
            <RangePicker size="small" showTime format={'YYYY-MM-DD HH:mm'} />
          )}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            size="small"
            onClick={this.onSearch }
          >
            查询
          </Button>
        </FormItem>
      </Form>
    );
  }
})


 
/**
 * @type : 必要，和factory中填写的type字段对应
 * @name | @description ： 可选
 */
const registerInformation = {
    type : 'reportHistory',
    name : '报表下载组件',
    description : "生成报表下载组件",
}
const columns = [{
    title: '编号',
    dataIndex: 'no',
    key:'no',
    width: '3%'
},{
    title: '文件名称',
    dataIndex: 'name',
    key:'name',
    width: '6%'
  }, {
    title: '描述',
    dataIndex: 'description',
    key:'description',
    width: '18%'
  }, {
    title: '生成时间',
    dataIndex: 'gentime',
    width: '8%',
  },{
    title: '文件大小',
    dataIndex: 'size',
    width: '6%',
  },{
      title: '发起人',
      dataIndex: 'author',
      width: '6%',
    },{
        title:"操作",
        dataIndex:'url',
        width:'6%',
        render:(text,record)=>{
            return(<Button onClick={()=>this.download(record.url)}>下载</Button>)
        }
    }];

class FormWrap extends React.Component {
 
    constructor(props){
        super(props)
        this.state={
            tableData : [],
            data:{total:0},
            loading : false,
            current:1,
            pageSize:20,
            pagination: {
                current:1,
                pageSize:20, 
                total: 0,
                showSizeChanger:true
              },
            startTime:'',
            endTime:'',
            currentType:'all'

        }

        this.dateOffset = 0;
        this.chart = null;
        this.container = null;
        this.searchReport = this.searchReport.bind(this);
        this.download = this.download.bind(this);
        this.saveChartRef = this.saveChartRef.bind(this);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.onPaginationChange = this.onPaginationChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.getTypeItem = this.getTypeItem.bind(this);
    }

    static get defaultProps() {
      return {
        points: [],
        data:[]
      }
    }
     
    download(url){
        downloadUrl(`http:\/\/${localStorage.getItem('serverUrl')}/static/projectReports/0/${url}`)
    }
 
    searchReport(startTime,endTime,type){
        const _this = this
        this.setState({
            loading : true,
            startTime,
            endTime
        })
        let name = ''
        if (type != undefined) {
            if (type == "all") {
                name = ""
            }else {
                name = type
            }
        }else {
            if (type == "all") {
                name = ""
            }else {
                name = this.state.currentType
            }
        }
        http.post('/report/getReportHistory',{
            timeFrom : moment(startTime).format(TimeFormat), //变量
            timeTo : moment(endTime).format(TimeFormat),
            pageSize:this.state.pageSize,
            pageNum:this.state.current,
            name:name
        }).then( 
            data=>{
                if (data.err === 0) {
                    _this.setState({
                        data:data.data,
                        pagination:{
                            total:data.data.total
                        },
                        tableData : data.data.reportList.length != 0 ? data.data.reportList.map((item,index)=>{
                            item['no'] = index+1;
                            item['size'] = item.filesize/(1024.0*1024)+'';
                            let size = item['size'].split(".");
                            size.length < 2 && (size.push('00'));
                            item['size'] = (size[0]) + '.' + (size[1] + '0').slice(0, 2)+'M';
                            return item
                        }) : [],
                        loading:false
                    })
                }else {
                    _this.setState({
                        loading:false
                    })
                }
                
            }
        ).catch(
            err=>{
                message.error(err)
                _this.setState({
                    loading:false
                })
            }
        )
    }

    onPaginationChange(pagination, filters, sorter){
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        pager.pageSize = pagination.pageSize;
        this.setState({
          pagination: pager,
          current:pagination.current,
          pageSize:pagination.pageSize
        },function(){
            this.searchReport(this.state.startTime,this.state.endTime)
        });
        
    }    
    

    // echart实例
    saveChartRef(refEchart) {
        if (refEchart) {
            this.chart = refEchart.getEchartsInstance();
        } else {
            this.chart = null;
        }
    }
    // 容器实例
    saveContainerRef(container) {
        this.container = container;
    }

    getTypeItem () {
        if (this.props.typeList && this.props.typeList.length != 0) {
            return this.props.typeList.map(item=>{
                return (
                    <Option style={{width:250,backgroundColor:'#D5D5D5',border:'#D5D5D5',color: '#000'}} value={item}> {item} </Option>       
                )
            })
        }    
    }

    
    handleSelect (key) {
        this.setState({
            currentType:key
            })
        this.searchReport(this.state.startTime,this.state.endTime,key)
    }
    
    render() {
        const {width,height} = this.props
        return (
                <div  ref={this.saveContainerRef} style={{overflow:"hidden",marginTop:"5px"}}>
                    <div style={{marginLeft:'10px',float:"left"}}>
                        选择报表：
                        <Select style={{width: "250"}}   value={this.state.currentType} onSelect={this.handleSelect} dropdownMatchSelectWidth={false} >
                            <Option style={{width: "250",backgroundColor:'#D5D5D5',border:'#D5D5D5',color: '#000'}} value='all'>全部</Option>
                           
                            {   
                                this.getTypeItem()
                            }
                        </Select> 
                    </div> 
                    <div style={{float:"right"}}>
                        <ModalForm 
                            searchReport={this.searchReport}
                        />  
                    </div> 
                    <div style={{float:"left",height:height,width:"100%"}} className={s['table-wrap']}>
                        <Layout >
                        <Content> 
                            <div >
                                <Table
                                    columns={[{
                                        title: '编号',
                                        dataIndex: 'no',
                                        key:'no',
                                        width: '3%'
                                    },{
                                        title: '文件名称',
                                        dataIndex: 'name',
                                        key:'name',
                                        width: '6%'
                                    }, {
                                        title: '描述',
                                        dataIndex: 'description',
                                        key:'description',
                                        width: '18%'
                                    }, {
                                        title: '生成时间',
                                        dataIndex: 'gentime',
                                        width: '8%',
                                    },{
                                        title: '文件大小',
                                        dataIndex: 'size',
                                        width: '6%',
                                    },{
                                        title: '发起人',
                                        dataIndex: 'author',
                                        width: '6%',
                                        },{
                                            title:"操作",
                                            dataIndex:'url',
                                            width:'6%',
                                            render:(text,record)=>{
                                                return(<Button onClick={()=>this.download(record.url)}>下载</Button>)
                                            }
                                        }]}
                                    //style={{tableLayout: 'fixed'}}
                                    dataSource={this.state.tableData}
                                    size="small"
                                    rowKey='no'
                                    bordered={localStorage.getItem('serverOmd')=="persagy" ? false : true} 
                                    scroll={{ y: height-150 }}
                                    loading={this.state.loading}
                                    pagination={this.state.pagination}
                                    onChange={this.onPaginationChange}
                                    
                                />
                            </div> 
                            {/* <Pagination  defaultPageSize={10} total={100} onChange={this.onPaginationChange}/>
                            <Pagination  defaultPageSize={10} total={100} onChange={this.onPaginationChange}/> */}
                        </Content>
                        </Layout>
                    </div>    
               
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
class ReportManageModelView extends React.Component {
    
    constructor(props){
        super(props)
        this.state = {
            style : {},
            typeList:[]

        }
        this.getReportType = this.getReportType.bind(this);
       
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
        this.getReportType()
    }

    getReportType () {
        http.post('/report/getReportNameList',{
        }).then( 
            data=>{
                if (data.err === 0) {
                    this.setState({
                        typeList:data.data
                    })
                }
            }
        )
    }
    /* @override */
    render() {
        const {style} = this.state
        
        return (
            <div style={style} className={s['container']} >
              <div style={{textAlign:"center",fontSize:"20px"}}>报表下载</div>
                <FormWrap

                    {...this.props}
                    typeList={this.state.typeList}
                />
            </div>
        )
    }
}

export default ReportManageModelView ;


