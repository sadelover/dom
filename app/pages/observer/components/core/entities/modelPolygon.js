import { Sprite } from '../sprites';
import ModelText from './modelText';
import http from '../../../../../common/http';
import appConfig from '../../../../../common/appConfig'
import online from '../../../../../static/image/online.png'
import offline from '../../../../../static/image/offline.png'

let EquipmentAutoDisplay = [],EquipmentEnabledDisplay = []

if(localStorage.getItem('EquipmentAutoDisplay')){
    EquipmentAutoDisplay = localStorage.getItem('EquipmentAutoDisplay').split('/')
}

if(localStorage.getItem('EquipmentEnabledDisplay')){
    EquipmentEnabledDisplay = localStorage.getItem('EquipmentEnabledDisplay').split('/')
}

function ModelPolygon(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.id = undefined;
    this.points = undefined;
    this.rotateAngle = undefined;
    this.value = undefined;
    this.hasAnimation = undefined;
    this.animation = undefined;
    this.idCom = undefined;
    this.bindType = undefined;
    this.indexImage = 0;
    this.layer = undefined;
    this.link = undefined; //自定义图元内链
    this.linkinfo = undefined; //自定义图元设置外链的信息
    // this.tooltipTemplate = configMap.equipmentTooltipTemplate; //浮动框模板
    this.enableTooltip = true;

    this.history = undefined;
    this.timeLastRefresh = 0;
    this.placeHolder = undefined;
    this.templatePelId = undefined;
    this.children = undefined;
    this.options = undefined;
    this.templateFileName = undefined;
    this.polygon = undefined;
    this.errPoint = undefined;
    this.enabledPoint = undefined;
    this.isDiffValuePolygon = true;
    this.paintValue = 0;
    this.paintAutoModeValue = 0;
    this.paintEnabledValue = 0;
    this._valueLock = false;
    this._iconAutoModeLock = false;
    this._iconEnabledLock = false;
    this._iconMaintainLock = false;
    this._iconOnOffSettingLock = false;
    this._iconPowerLock = false;
    this._iconPowerPercentLock = false;
    this._iconFreqLock = false;
    this._iconOnlineLock = false;
    this.freqFlag = 1;
    this.powerFlag = 1;
    this.onOffSettingFlag = 1;
    this.autoModeFlag = 1;
    this.enabledFlag = 1;
    this.onlineFlag = 1;
    this.maintainFlag = 1;
};



// ModelPolygon.prototype = Object.create(Sprite.prototype)
ModelPolygon.prototype = new Sprite();

ModelPolygon.prototype.showModal = function (event, isInfo, widthScale, heightScale) {
    let _this = this
    let model = new ModelText()
    if(this.idCom || event.point != null){
        if(this.idCom == undefined){
            this.idCom = event.point
        }
        http.post('/analysis/get_point_info_from_s3db', {
            "pointList": [this.idCom]
        }).then(data => {
            if (data.err == 0) {
                model.description = data.data.realtimeValue[0].description
                model.idCom = data.data.realtimeValue[0].name
                model.value = data.data.realtimeValue[0].value
                model.sourceType = data.data[this.idCom].sourceType
                model.options = {
                    getToolPoint: _this.options&&_this.options.getToolPoint?_this.options.getToolPoint:event.options.getToolPoint,
                    getTendencyModal: _this.options&&_this.options.getTendencyModal?_this.options.getTendencyModal:event.options.getTendencyModal,
                    showCommomAlarm: _this.options&&_this.options.showCommomAlarm?_this.options.showCommomAlarm:event.options.showCommomAlarm,
                    showMainInterfaceModal: _this.options&&_this.options.showMainInterfaceModal?_this.options.showMainInterfaceModal:event.options.showMainInterfaceModal
                }
                model.showModal(event, isInfo, widthScale, heightScale)
            } else {
                model.description = "请求错误"
                model.idCom = this.idCom
                model.value = ""
                model.sourceType = "请求错误"
                model.options = {
                    getToolPoint: _this.options&&_this.options.getToolPoint?_this.options.getToolPoint:event.options.getToolPoint,
                    getTendencyModal: _this.options&&_this.options.getTendencyModal?_this.options.getTendencyModal:event.options.getTendencyModal,
                    showCommomAlarm: _this.options&&_this.options.showCommomAlarm?_this.options.showCommomAlarm:event.options.showCommomAlarm,
                    showMainInterfaceModal: _this.options&&_this.options.showMainInterfaceModal?_this.options.showMainInterfaceModal:event.options.showMainInterfaceModal
                }
                model.showModal(event, isInfo, widthScale, heightScale)
            }
        })
            .catch(err => {
                model.description = "请求错误"
                model.idCom = this.idCom
                model.value = ""
                model.sourceType = "请求错误"
                model.options = {
                    getToolPoint: _this.options&&_this.options.getToolPoint?_this.options.getToolPoint:event.options.getToolPoint,
                    getTendencyModal: _this.options&&_this.options.getTendencyModal?_this.options.getTendencyModal:event.options.getTendencyModal,
                    showCommomAlarm: _this.options&&_this.options.showCommomAlarm?_this.options.showCommomAlarm:event.options.showCommomAlarm,
                    showMainInterfaceModal: _this.options&&_this.options.showMainInterfaceModal?_this.options.showMainInterfaceModal:event.options.showMainInterfaceModal
                }
                model.showModal(event, isInfo, widthScale, heightScale)
            })
    }else{
        if(event.description>3600){
            model.description = '设备已经掉线(最近心跳:'+ parseInt(event.description/3600) +'小时前)'
        }else if(event.description>300){
            model.description = '设备已经掉线(最近心跳:'+ parseInt(event.description/60) +'分钟前)'
        }else if(event.description>60){
            model.description = '设备心跳间隔过长(最近心跳:'+ parseInt(event.description/60) +'分钟前)'
        }else{
            model.description = '(最近心跳:'+ parseInt(event.description) +'秒前)'
        }
        model.idCom = ''
        model.value = ''
        model.sourceType = '心跳点'
        model.showModal(event, isInfo, widthScale, heightScale)
    }
    
}

ModelPolygon.prototype.paint = function (ctx) {
    var _this = this;
    if (_this._valueLock == false) {
        _this._valueLock = true;//占住锁
        if (Number(_this.value) != Number(_this.paintValue)) {
            paintPolygon(_this, ctx);
        } else {
            _this._valueLock = false;//释放锁
        }
    }
    if (_this._iconAutoModeLock == false) {
        _this._iconAutoModeLock = true;//占住锁
        if (Number(_this.autoModeValue) != Number(_this.paintAutoModeValue)) {
            paintIconAutoMode(_this, ctx);
        } else {
            _this._iconAutoModeLock = false;//释放锁
        }
    }
    if (_this._iconEnabledLock == false) {
        _this._iconEnabledLock = true;//占住锁
        if (Number(_this.enabledValue) != Number(_this.paintEnabledValue)) {
            paintIconEnabled(_this, ctx);
        } else {
            _this._iconEnabledLock = false;//释放锁
        }
    }
    //摘挂牌
    if (_this._iconMaintainLock == false) {
        _this._iconMaintainLock = true;//占住锁
        if (Number(_this.maintainValue) != Number(_this.paintMaintainValue)) {
            drawMaintain(_this, ctx);
        } else {
            _this._iconMaintainLock = false;//释放锁
        }
    }

    //OnOffSetting设定
    if (_this._iconOnOffSettingLock == false) {
        _this._iconOnOffSettingLock = true;//占住锁
        if (Number(_this.onOffSettingValue) != Number(_this.paintOnOffSettingValue)) {
            drawOnOffSetting(_this, ctx);
        } else {
            _this._iconOnOffSettingLock = false;//释放锁
        }
    }
    
    //功率（血条框及功率值）
    if (_this._iconPowerLock == false) {
        _this._iconPowerLock = true;//占住锁
        if (Number(_this.powerValue) != Number(_this.paintPowerValue)) {
            drawPower(_this, ctx);
        } else {
            _this._iconPowerLock = false;//释放锁
        }
    }

    //负载率(血条)
    if (_this._iconPowerPercentLock == false) {
        _this._iconPowerPercentLock = true;//占住锁
        if (Number(_this.powerPercentValue) != Number(_this.paintPowerPercentValue)) {
            drawPowerPercent(_this, ctx);
        } else {
            _this._iconPowerPercentLock = false;//释放锁
        }
    }

    //频率
    if (_this._iconFreqLock == false) {
        _this._iconFreqLock = true;//占住锁
        if (Number(_this.freqValue) != Number(_this.paintFreqValue)) {
            drawFreq(_this, ctx);
        } else {
            _this._iconFreqLock = false;//释放锁
        }
    }

    //在离线
    if (_this._iconOnlineLock == false) {
        _this._iconOnlineLock = true;//占住锁
        if (Number(_this.netOnlineStatus) != Number(_this.paintNetOnlineStatus)) {
            drawOnline(_this, ctx);
        } else {
            _this._iconOnlineLock = false;//释放锁
        }
    }

}

function drawOnline(_this, ctx) {
    //如果点值为空，直接退出不渲染，防止回放时出现NaN
    if (_this.netOnlineStatus === "") {
        return;
    }
    var nextValue = Number(_this.netOnlineStatus);
    let modelPolygon = new ModelPolygon()
    try {
        let xMax = ctx.points[0].x, yMin = ctx.points[0].y;
        for (let item in ctx.points) {
            if (ctx.points[item]['x'] > xMax) {
                xMax = ctx.points[item]['x'];
            }
            if (ctx.points[item]['y'] < yMin) {
                yMin = ctx.points[item]['y'];
            }
        }
        if (yMin < 15) {
            yMin = 15;
        }
        // if (localStorage.getItem('animation_icon_move')) {
        //     xMax += JSON.parse(localStorage.getItem('animation_icon_move'))[0];
        //     yMin += JSON.parse(localStorage.getItem('animation_icon_move'))[1];
        // }
        if (nextValue === 1) {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("href", online);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax + 12);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin + 20);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("width", 15);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("height", 15);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "inline-block");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", "cursor: pointer");
            if(_this.onlineFlag == 1){
                _this.onlineFlag = 0
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.preventDefault()
                    e.currentType = 'online'
                    e.point = null
                    e.description = _this.netHeartTime
                    modelPolygon.showModal(e,'',1,1)
                });
            }

            _this.paintNetOnlineStatus = 1;//刷新显示值
            _this._iconOnlineLock = false;//释放锁
        } else if(nextValue === 0){
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("href", offline);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax + 12);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin + 20);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("width", 15);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("height", 15);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "inline-block");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", "cursor: pointer");
            if(_this.onlineFlag == 1){
                _this.onlineFlag = 0
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.preventDefault()
                    e.currentType = 'online'
                    e.point = null
                    e.description = _this.netHeartTime
                    modelPolygon.showModal(e,'',1,1)
                });
            }
            _this.paintNetOnlineStatus = 0;//刷新显示值
            _this._iconOnlineLock = false;//释放锁
        } else {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "none");
            _this.paintNetOnlineStatus = -1;//刷新显示值
            _this._iconOnlineLock = false;//释放锁
            
        }
    } catch (e) {
        console.error(e);
    }
}

function drawFreq(_this, ctx) {
    //如果点值为空，直接退出不渲染，防止回放时出现NaN
    if (_this.freqValue === "") {
        return;
    }
    var nextValue = Number(_this.freqValue);
    let modelPolygon = new ModelPolygon()
    try {

        let xMax = ctx.points[0].x, yMin = ctx.points[0].y;
        for (let item in ctx.points) {
            if (ctx.points[item]['x'] > xMax) {
                xMax = ctx.points[item]['x'];
            }
            if (ctx.points[item]['y'] < yMin) {
                yMin = ctx.points[item]['y'];
            }
        }
        if (yMin < 15) {
            yMin = 15;
        }
        if (localStorage.getItem('animation_icon_move')) {
            xMax += JSON.parse(localStorage.getItem('animation_icon_move'))[0];
            yMin += JSON.parse(localStorage.getItem('animation_icon_move'))[1];
        }
        if (nextValue != -1) {
            let excursion = _this.xWidth >70?0:_this.xWidth >40?(70-_this.xWidth):40
            nextValue = parseInt(_this.freqValue)
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.textContent = nextValue+(excursion!=40?"Hz":'');
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute ("font-size",10);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax-29+(excursion!=40?0:12));
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin-2);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("stroke", localStorage.getItem('equipmentIconStyle')&&localStorage.getItem('equipmentIconStyle')=='black'?"#fff":"#333");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", "cursor: pointer");
            if(_this.freqFlag == 1){
                _this.freqFlag = 0
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.point = _this.freqPoint
                    e.options = _this.options
                    modelPolygon.showModal(e,'',1,1)
                });
            }
            _this.paintFreqValue = nextValue;//刷新显示值
            _this._iconFreqLock = false;//释放锁
        } else {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "none");
            _this.paintFreqValue = -1;//刷新显示值
            _this._iconFreqLock = false;//释放锁
            
        }
    } catch (e) {
        console.error(e);
    }
}


function drawPower(_this, ctx) {
    //如果点值为空，直接退出不渲染，防止回放时出现NaN
    if (_this.powerValue === "") {
        return;
    }
    var nextValue = Number(_this.powerValue);
    let modelPolygon = new ModelPolygon()
    try {

        let xMax = ctx.points[0].x, yMin = ctx.points[0].y;
        for (let item in ctx.points) {
            if (ctx.points[item]['x'] > xMax) {
                xMax = ctx.points[item]['x'];
            }
            if (ctx.points[item]['y'] < yMin) {
                yMin = ctx.points[item]['y'];
            }
        }
        if (yMin < 15) {
            yMin = 15;
        }
        if (localStorage.getItem('animation_icon_move')) {
            xMax += JSON.parse(localStorage.getItem('animation_icon_move'))[0];
            yMin += JSON.parse(localStorage.getItem('animation_icon_move'))[1];
        }
        if (nextValue != -1 && nextValue<10000) {
            let excursion = _this.xWidth >70?0:_this.xWidth >40?(70-_this.xWidth):40

            nextValue = _this.powerValue<0 ? 0 : parseInt(_this.powerValue)
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax-75+excursion);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin-12);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("width", 70-excursion);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("height", 13);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(0,0,0,0.1)");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("stroke", "#33CC33");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("stroke-width", "2");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.textContent = nextValue+(excursion!=40?"kW":'');
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute ("font-size",10);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax-75+excursion);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin-2);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("stroke",  localStorage.getItem('equipmentIconStyle')&&localStorage.getItem('equipmentIconStyle')=='black'?"#fff":"#333");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", "cursor: pointer");
            if(_this.powerFlag == 1){
                _this.powerFlag = 0
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.point = _this.powerPoint
                    e.options = _this.options
                    modelPolygon.showModal(e,'',1,1)
                });
            }
            _this.paintPowerValue = nextValue;//刷新显示值
            _this._iconPowerLock = false;//释放锁
        } else {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "none");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "none");
            _this.paintPowerValue = -1;//刷新显示值
            _this._iconPowerLock = false;//释放锁
            
        }
    } catch (e) {
        console.error(e);
    }
}

function drawPowerPercent(_this, ctx) {
    //如果点值为空，直接退出不渲染，防止回放时出现NaN
    if (_this.powerPercentValue === "") {
        return;
    }
    var nextValue = Number(_this.powerPercentValue);

    try {

        let xMax = ctx.points[0].x, yMin = ctx.points[0].y;
        for (let item in ctx.points) {
            if (ctx.points[item]['x'] > xMax) {
                xMax = ctx.points[item]['x'];
            }
            if (ctx.points[item]['y'] < yMin) {
                yMin = ctx.points[item]['y'];
            }
        }
        if (yMin < 15) {
            yMin = 15;
        }
        if (localStorage.getItem('animation_icon_move')) {
            xMax += JSON.parse(localStorage.getItem('animation_icon_move'))[0];
            yMin += JSON.parse(localStorage.getItem('animation_icon_move'))[1];
        }
        if (nextValue > 0) {
            if(nextValue > 100){
                nextValue = 100
            }
            let excursion = _this.xWidth >70?0:_this.xWidth >40?(70-_this.xWidth):40
            let width = nextValue/100*(70-excursion)
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax-75+excursion);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin-12);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("width", width);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("height", 13);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(102,255,102,0.7)");
            _this.paintPowerPercentValue = nextValue;//刷新显示值
            _this._iconPowerPercentLock = false;//释放锁
        } else {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "none");
            _this.paintPowerPercentValue = -1;//刷新显示值
            _this._iconPowerPercentLock = false;//释放锁
            
        }
    } catch (e) {
        console.error(e);
    }
}

function drawOnOffSetting(_this, ctx) {
    //如果点值为空，直接退出不渲染，防止回放时出现NaN
    if (_this.onOffSettingValue === "") {
        return;
    }
    var nextValue = Number(_this.onOffSettingValue);
    let modelPolygon = new ModelPolygon()
    try {
        let xMax = ctx.points[0].x, yMin = ctx.points[0].y;
        for (let item in ctx.points) {
            if (ctx.points[item]['x'] > xMax) {
                xMax = ctx.points[item]['x'];
            }
            if (ctx.points[item]['y'] < yMin) {
                yMin = ctx.points[item]['y'];
            }
        }
        if (yMin < 15) {
            yMin = 15;
        }
        if (localStorage.getItem('animation_icon_move')) {
            xMax += JSON.parse(localStorage.getItem('animation_icon_move'))[0];
            yMin += JSON.parse(localStorage.getItem('animation_icon_move'))[1];
        }
        if (nextValue === 1) {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("cx", xMax + 20);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("cy", yMin + 12);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("r", 5);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "#00FFFF");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", "cursor: pointer");
            if(_this.onOffSettingFlag == 1){
                _this.onOffSettingFlag = 0
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.point = _this.onOffSettingPoint
                    e.options = _this.options
                    modelPolygon.showModal(e,'',1,1)
                });
            }
            _this.paintOnOffSettingValue = 1;//当前状态
            _this._iconOnOffSettingLock = false;//释放锁
        } else {
            if (nextValue === 0) {
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("cx", xMax + 20);
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("cy", yMin + 12);
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("r", 5);
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(204,0,0,0.9)");
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", "cursor: pointer");
                if(_this.onOffSettingFlag == 1){
                    _this.onOffSettingFlag = 0
                    ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                        e.point = _this.onOffSettingPoint
                        e.options = _this.options
                        modelPolygon.showModal(e,'',1,1)
                    });
                }
                _this.paintOnOffSettingValue = 0;//当前状态
                _this._iconOnOffSettingLock = false;//释放锁
            }else {
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "none");
                _this.paintOnOffSettingValue = -1;//当前状态
                _this._iconOnOffSettingLock = false;//释放锁
            }
        }
    } catch (e) {
        console.error(e);
    }
}


function drawMaintain(_this, ctx) {
    //如果点值为空，直接退出不渲染，防止回放时出现NaN
    if (_this.maintainValue === "") {
        return;
    }
    var nextValue = Number(_this.maintainValue);
    let modelPolygon = new ModelPolygon()
    try {

        let xMax = ctx.points[0].x, yMin = ctx.points[0].y;
        for (let item in ctx.points) {
            if (ctx.points[item]['x'] > xMax) {
                xMax = ctx.points[item]['x'];
            }
            if (ctx.points[item]['y'] < yMin) {
                yMin = ctx.points[item]['y'];
            }
        }
        if (yMin < 15) {
            yMin = 15;
        }
        if (localStorage.getItem('animation_icon_move')) {
            xMax += JSON.parse(localStorage.getItem('animation_icon_move'))[0];
            yMin += JSON.parse(localStorage.getItem('animation_icon_move'))[1];
        }
        if (nextValue === 1) {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("href", `${appConfig.serverUrl}/static/images/maintain.png`);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax + 12);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin + 37);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("width", 16);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("height", 16);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "inline-block");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", "cursor: pointer");
            if(_this.maintainFlag == 1){
                _this.maintainFlag = 0
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.point = _this.maintainPoint
                    e.options = _this.options
                    modelPolygon.showModal(e,'',1,1)
                });
            }
            _this.paintMaintainValue = 1;//当前状态
            _this._iconMaintainLock = false;//释放锁
        } else {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("display", "none");
            _this.paintMaintainValue = 0;//当前状态
            _this._iconMaintainLock = false;//释放锁
        }
    } catch (e) {
        console.error(e);
    }
}

function paintPolygon(_this, ctx) {
    var nextValue = Number(_this.value);
    try {
        if (nextValue === 4) {
            ctx.setAttribute("fill", "rgba(204,0,0,0.9)");
            if (localStorage.getItem('animation') == undefined || localStorage.getItem('animation') != 'cheap') {
                ctx.childNodes[0].setAttribute("values", "0.9;0.3;0.9");//运行且报警状态,红色加动画
            }
            _this.paintValue = 4;//标记-可刷新
            _this._valueLock = false;//释放锁
        } else {
            if (nextValue === 2) {
                ctx.setAttribute("fill", "rgba(204,0,0,0.9)");
                ctx.childNodes[0].setAttribute("values", "");//删除子元素动画
                _this.paintValue = 2;//标记-可刷新
                _this._valueLock = false;//释放锁
            } else {
                if (nextValue === 1) {
                    if (localStorage.getItem('animation_status_on_color')) {
                        ctx.setAttribute("fill", localStorage.getItem('animation_status_on_color'));
                    } else {
                        ctx.setAttribute("fill", "rgba(102,255,102,0.7)");
                    }
                    if (localStorage.getItem('animation') == undefined || localStorage.getItem('animation') != 'cheap') {
                        ctx.childNodes[0].setAttribute("values", "0.7;0.3;0.7");//运行状态加动画
                    }
                    _this.paintValue = 1;//标记-可刷新
                    _this._valueLock = false;//释放锁
                } else {
                    if (nextValue === 3) {
                        ctx.setAttribute("fill", "rgba(119,119,119,0.9)");
                        //禁用状态灰色不加动画
                        ctx.childNodes[0].setAttribute("values", "");//删除子元素动画                   
                        _this.paintValue = 3;//标记-可刷新
                        _this._valueLock = false;//释放锁
                    } else if(nextValue === 0){
                        ctx.setAttribute("fill", "rgba(0,0,0,0)"); //无状态无颜色显示原图
                        //无状态不加动画
                        _this.paintValue = 0;//标记-可刷新
                        _this._valueLock = false;//释放锁
                    } 

                     //2023-5-4——dora 将下面的else内容注掉，使得当点值是null时，还是界面还是显示上次的状态（否则下面代码会使设备无状态，误以为是关着的）
                    // else {
                    //     // ctx.setAttribute("fill", "none"); //无法获取元素上的方法点击失败
                    //     ctx.setAttribute("fill", "rgba(0,0,0,0)"); //无状态无颜色显示原图
                    //     //无状态不加动画
                    //     _this.paintValue = 0;//标记-可刷新
                    //     _this._valueLock = false;//释放锁
                    // }
                }
            }
        }

    }
    catch (e) {
        console.error(e);
    }
}

function paintIconAutoMode(_this, ctx) {
    var nextValue = Number(_this.autoModeValue);
    let modelPolygon = new ModelPolygon()
    try {
        let xMax = ctx.points[0].x, yMin = ctx.points[0].y;
        for (let item in ctx.points) {
            if (ctx.points[item]['x'] > xMax) {
                xMax = ctx.points[item]['x'];
            }
            if (ctx.points[item]['y'] < yMin) {
                yMin = ctx.points[item]['y'];
            }
        }
        if (yMin < 15) {
            yMin = 15;
        }
        if (localStorage.getItem('animation_icon_move')) {
            xMax += JSON.parse(localStorage.getItem('animation_icon_move'))[0];
            yMin += JSON.parse(localStorage.getItem('animation_icon_move'))[1];
        }
        if (nextValue === 2) {
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("stroke", '#EEEEEE');
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax + 16);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin - 13);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("width", 17);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("height", 16);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("rx", 2);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("ry", 2);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("fill", "#33CC33");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.textContent = EquipmentAutoDisplay[0]?EquipmentAutoDisplay[0]:'A';
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("stroke", '#FFFFFF');
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax + 21);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", 'cursor: pointer');
            if(_this.autoModeFlag == 1){
                _this.autoModeFlag = 0
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.point = _this.autoModePoint
                    e.options = _this.options
                    modelPolygon.showModal(e,'',1,1)
                });
            }
            
            _this.paintAutoModeValue = 2;//当前状态
            _this._iconAutoModeLock = false;//释放锁
        } else if (nextValue === 1) {
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("stroke", '#888');
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax + 16);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin - 13);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("width", 17);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("height", 16);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("rx", 2);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("ry", 2);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("fill", "#A9A9A9");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.textContent = EquipmentAutoDisplay[1]?EquipmentAutoDisplay[1]:'L';
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("stroke", '#444');
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax + 21);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("style", 'cursor: pointer');
            if(_this.autoModeFlag == 1){
                _this.autoModeFlag = 0
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.point = _this.autoModePoint
                    e.options = _this.options
                    modelPolygon.showModal(e,'',1,1)
                });
            }
            _this.paintAutoModeValue = 1;//当前状态
            _this._iconAutoModeLock = false;//释放锁
        } else {
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("stroke", 'rgba(0,0,0,0)');
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(0,0,0,0)");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.textContent = '';
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("stroke", 'rgba(0,0,0,0)');
            _this.paintAutoModeValue = 0;//当前状态
            _this._iconAutoModeLock = false;//释放锁
        }
    }
    catch (e) {
        console.error(e);
    }
}

function paintIconEnabled(_this, ctx) {
    var nextValue = Number(_this.enabledValue);
    let modelPolygon = new ModelPolygon()
    try {
        let xMax = ctx.points[0].x, yMin = ctx.points[0].y;
        for (let item in ctx.points) {
            if (ctx.points[item]['x'] > xMax) {
                xMax = ctx.points[item]['x'];
            }
            if (ctx.points[item]['y'] < yMin) {
                yMin = ctx.points[item]['y'];
            }
        }
        if (yMin < 15) {
            yMin = 15;
        }
        if (localStorage.getItem('animation_icon_move')) {
            xMax += JSON.parse(localStorage.getItem('animation_icon_move'))[0];
            yMin += JSON.parse(localStorage.getItem('animation_icon_move'))[1];
        }
        if (nextValue === 2) {
            ctx.nextSibling.setAttribute("stroke", '#EEEEEE');
            ctx.nextSibling.setAttribute("x", xMax - 3);
            ctx.nextSibling.setAttribute("y", yMin - 13);
            ctx.nextSibling.setAttribute("width", 17);
            ctx.nextSibling.setAttribute("height", 16);
            ctx.nextSibling.setAttribute("rx", 2);
            ctx.nextSibling.setAttribute("ry", 2);
            ctx.nextSibling.setAttribute("fill", "#33CC33");
            ctx.nextSibling.nextSibling.textContent = EquipmentEnabledDisplay[0]?EquipmentEnabledDisplay[0]:'E';
            ctx.nextSibling.nextSibling.setAttribute("stroke", '#FFFFFF');
            ctx.nextSibling.nextSibling.setAttribute("x", xMax);
            ctx.nextSibling.nextSibling.setAttribute("y", yMin);
            ctx.nextSibling.nextSibling.setAttribute("style", 'cursor: pointer');
            if(_this.enabledFlag == 1){
                _this.enabledFlag = 0
                ctx.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.point = _this.enabledPoint
                    e.options = _this.options
                    modelPolygon.showModal(e,'',1,1)
                });
            }
           
            _this.paintEnabledValue = 2;//当前状态
            _this._iconEnabledLock = false;//释放锁
        } else if (nextValue === 1) {
            ctx.nextSibling.setAttribute("stroke", '#888');
            ctx.nextSibling.setAttribute("x", xMax - 3);
            ctx.nextSibling.setAttribute("y", yMin - 13);
            ctx.nextSibling.setAttribute("width", 17);
            ctx.nextSibling.setAttribute("height", 16);
            ctx.nextSibling.setAttribute("rx", 2);
            ctx.nextSibling.setAttribute("ry", 2);
            ctx.nextSibling.setAttribute("fill", "#A9A9A9");
            ctx.nextSibling.nextSibling.textContent = EquipmentEnabledDisplay[1]?EquipmentEnabledDisplay[1]:'D';
            ctx.nextSibling.nextSibling.setAttribute("stroke", '#444');
            ctx.nextSibling.nextSibling.setAttribute("x", xMax);
            ctx.nextSibling.nextSibling.setAttribute("y", yMin);
            ctx.nextSibling.nextSibling.setAttribute("style", 'cursor: pointer');
            if(_this.enabledFlag == 1){
                _this.enabledFlag = 0
                ctx.nextSibling.nextSibling.addEventListener("contextmenu", (e)=> {
                    e.point = _this.enabledPoint
                    e.options = _this.options
                    modelPolygon.showModal(e,'',1,1)
                });
            }
            _this.paintEnabledValue = 1;//当前状态
            _this._iconEnabledLock = false;//释放锁
        } else {
            ctx.nextSibling.setAttribute("stroke", 'rgba(0,0,0,0)');
            ctx.nextSibling.setAttribute("fill", "rgba(0,0,0,0)");
            ctx.nextSibling.nextSibling.textContent = '';
            ctx.nextSibling.nextSibling.setAttribute("stroke", 'rgba(0,0,0,0)');
            _this.paintEnabledValue = 0;//当前状态
            _this._iconEnabledLock = false;//释放锁
        }
    }
    catch (e) {
        console.error(e);
    }
}

export default ModelPolygon;


