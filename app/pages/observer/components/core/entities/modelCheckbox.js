import { Sprite } from '../sprites';
import appConfig from '../../../../../common/appConfig'
import http from '../../../../../common/http'
import  ModelText from './modelText'

function ModelCheckbox(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.idCom = undefined;
    this.type = undefined;
    this.fontColor = undefined;
    this.fontSize = undefined;
    this.setValue = undefined;
    this.unsetValue = undefined;
    this.text = undefined;
    this.idGroup = undefined;
    this.expression = undefined;  //factory里的有效条件，用来判断按钮启用、禁用；
    this.relation = undefined;  //新增字段，用于存放左上角的问号内容
    this.checkboxUrl = appConfig.checkboxUrl;
    this.width = undefined;
    this.height = undefined;
    this.image = undefined;
    this.enabled = true;
    this.list = [];
    this.checkboxState = undefined;
    this.options = undefined;
    this.checkboxImage = undefined;
    this.checkboxText = undefined;
    this.desc = undefined;
    this.param10 = undefined;
};
ModelCheckbox.prototype = new Sprite();

ModelCheckbox.prototype.showModal = function(event,isInfo,widthScale,heightScale){
    let _this = this
    let model = new ModelText()
    http.post('/analysis/get_point_info_from_s3db',{
        "pointList": [this.idCom]
    }).then(data=>{
        if(data.err==0){
            model.description = data.data.realtimeValue[0].description
            model.idCom = data.data.realtimeValue[0].name
            model.value = data.data.realtimeValue[0].value
            model.sourceType = data.data[this.idCom].sourceType
            model.options = {
                getToolPoint: _this.options.getToolPoint,
                getTendencyModal: _this.options.getTendencyModal,
                showCommomAlarm: _this.options.showCommomAlarm,
                showMainInterfaceModal:_this.options.showMainInterfaceModal
            }
            model.showModal(event,isInfo,widthScale,heightScale)
        }else{
            model.description = "请求错误"
            model.idCom = this.idCom
            model.value = ""
            model.sourceType = "请求错误"
            model.options = {
                getToolPoint: _this.options.getToolPoint,
                getTendencyModal: _this.options.getTendencyModal,
                showCommomAlarm: _this.options.showCommomAlarm,
                showMainInterfaceModal:_this.options.showMainInterfaceModal
            }
            model.showModal(event,isInfo,widthScale,heightScale)
        }
    })
    .catch(err=>{
        model.description = "请求错误"
        model.idCom = this.idCom
        model.value = ""
        model.sourceType = "请求错误"
        model.options = {
            getToolPoint: _this.options.getToolPoint,
            getTendencyModal: _this.options.getTendencyModal,
            showCommomAlarm: _this.options.showCommomAlarm,
            showMainInterfaceModal:_this.options.showMainInterfaceModal
        }
        model.showModal(event,isInfo,widthScale,heightScale)
    })
}
ModelCheckbox.prototype.paint = function (ctx, checkboxText) {
    var _this = this;
    if (this.image !== undefined) {
        if (this.image.complete) {
            _this.drawImage(_this, ctx, checkboxText);
        } else {
            this.image.onload = function (e) {
                _this.drawImage(_this, ctx, checkboxText)
            };
        }
    }
};

ModelCheckbox.prototype.drawImage = function(_this,ctx, checkboxText){
    
    ctx.setAttribute("href", _this.image.src);

    // // ctx.save();
    // if ((!_this.width) || (!_this.height)) { 
    //     _this.width = _this.image.width;
    //     _this.height = _this.image.height;
    // }
    // try {
    //     // ctx.drawImage(_this.image, _this.x, _this.y, _this.width, _this.height);
    // ctx.setAttribute("href", _this.image.src);
    //     ctx.setAttribute("x", _this.x);     
    //     ctx.setAttribute("y", _this.y);  
    //     ctx.setAttribute("width", _this.width);
    //     ctx.setAttribute("height", _this.height);
        
    //     if (_this.text) {
    //         // if (this.fontSize) {
    //         //     ctx.font = _this.fontSize + "px \'微软雅黑\'";
    //         // };
    //         // ctx.fillStyle = _this.fontColor ? "rgb(" + _this.fontColor.r + "," + _this.fontColor.g + "," + _this.fontColor.b + ")" : "#333333";
    //         // ctx.textBaseline = "middle";
    //         // ctx.textAlign = "left";
    //         // ctx.fillText(_this.text,  Math.floor(_this.x + _this.width / 2 + 10) , Math.floor(_this.y + _this.height / 2));
        
    //         checkboxText.setAttribute("font-size", _this.fontSize);
    //         checkboxText.setAttribute("font-family", '微软雅黑');
    //         if (_this.fontColor) {
    //             checkboxText.setAttribute("fill", `rgb(${_this.fontColor.r} , ${_this.fontColor.g} , ${_this.fontColor.b})`);
    //         } else {
    //             checkboxText.setAttribute("fill", "#333333");
    //         }
    //         checkboxText.textContent = _this.text;
    //         checkboxText.setAttribute("alignment-baseline","central");
    //         checkboxText.setAttribute("text-anchor", "start");
    //         checkboxText.setAttribute("x", Math.floor(_this.x + _this.width / 2 + 10));	  
    //         checkboxText.setAttribute("y", Math.floor(_this.y + _this.height / 2));
    //     }
    // } catch (e) {
    //     console.error(e);
    // }
    // // ctx.restore();
}



//更新后改变image的图片
// 从static/images里引入标准控件名
ModelCheckbox.prototype.update = function (obj) {
    //还有expression表达式的checkbox，进行是否可用判断
    if (this.expression != "" && this.expression.indexOf(obj.name) != -1) {
        if (this.expression.match(/\[[^\]]+\]/g)[0].slice(1,-1) == obj.name ) { 
            let strPoint = this.expression.match(/\[[^\]]+\]/g)[0]
            //根据表达式来判断checkbox是否可用
            if(obj.value){
                console.info( this.expression.replace(strPoint,obj.value) )
                this.enabled = eval((this.expression.replace(strPoint,obj.value)))
            }else{
                this.enabled = false
            }
        }
    }else{
        if(this.type === '1'){
            if(this.setValue==parseInt(obj.value) ){
                this.image.src=appConfig.staticImage+"/check_btn_sel_com.png";
                this.checkboxState = true  //状态缓存
            }else if(obj.value == ''){
                this.image.src=appConfig.staticImage+"/check_btn_unsel_com.png";
                this.checkboxState = false
            }else{
                this.image.src=appConfig.staticImage+"/check_btn_unsel_com.png";
                this.checkboxState = false
            }
        }else if(this.type === '0'){
            if(this.setValue==parseInt(obj.value)){
                this.image.src = appConfig.staticImage + `/radio_btn_sel_com.png`;
            }else if(obj.value == ''){
                this.image.src = appConfig.staticImage + `/radio_btn_unsel_com.png`;
            }else{
                this.image.src = appConfig.staticImage + `/radio_btn_unsel_com.png`;
            }
        }
    }
    //根据relation里存放的保护接口给的信息，判断是否可用
    if(this.relation.length !=0){
        for (var j = 0; j < this.relation.length; j++) {
            if (this.relation[j].permit != undefined) {
                //如果permit是false即禁用
                if (this.relation[j].permit == false) {
                    this.enabled = false;
                }
            }
        }
    }
    if (this.enabled) {
        this.enabledText.setAttribute("display", "none");
    } else {
        this.enabledText.setAttribute("display", "inline-block");
    }
}

export default ModelCheckbox;
