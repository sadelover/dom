import { Sprite } from '../sprites';
import appConfig from '../../../../../common/appConfig';
import http from '../../../../../common/http';
import  ModelText from './modelText'
import online from '../../../../../static/image/online.png'
import offline from '../../../../../static/image/offline.png'
import ModelPolygon from './modelPolygon'
/////////////
// TOOLTIP //
/////////////
var TOOLTIP_DELAY = 1000;
var $tooltip = null;
var tooltipTimer = null;
var tooltip = {
    show: function () {
        $tooltip.style.display = '';
        $tooltip.style.opacity = configMap.equipmentTooltipOpacity;
        if (tooltipTimer) { window.clearTimeout(tooltipTimer); tooltipTimer = null; }
    },
    hide: function () {
        if (!tooltipTimer) {
            tooltipTimer = window.setTimeout(function () {
                if ($tooltip !== null) {
                    $tooltip.style.opacity = 0;
                    // $tooltip.style.left='-999px';
                    // $tooltip.style.top='-999px';
                    $tooltip.style.display='none'
                }
                tooltipTimer = null;
            }, TOOLTIP_DELAY);
        }
    }
};

var configMap = {
    equipmentTooltipTemplate: `
    <div class="ant-popover ant-popover-placement-top observer-equipment-tooltip" data-ds-id="" style="text-align: center;transition: all 0.3s ease-in-out;">
        <div class="ant-popover-content">
            <div class="ant-popover-inner">
                <div>
                    <div class="ant-popover-inner-content tooltip-inner">
                        <p class="pointName"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    equipmentTooltipZIndex: 2000,
    equipmentTooltipOpacity: .8,
    equipmentTooltipBackgroundColor: '#1A1A1A'
}
var cachedContainerStyle;

let EquipmentAutoDisplay = [],EquipmentEnabledDisplay = []

if(localStorage.getItem('EquipmentAutoDisplay')){
    EquipmentAutoDisplay = localStorage.getItem('EquipmentAutoDisplay').split('/')
}

if(localStorage.getItem('EquipmentEnabledDisplay')){
    EquipmentEnabledDisplay = localStorage.getItem('EquipmentEnabledDisplay').split('/')
}

function ModelStandardEquipment(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [{ execute: this.updateImageIndex }];

    this.url = undefined;
    this.image = undefined;
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
    this.tooltipTemplate = configMap.equipmentTooltipTemplate; //浮动框模板
    this.enableTooltip = true;
    this.navigation = undefined;
    this.history = undefined;
    this.timeLastRefresh = 0;
    this.placeHolder = undefined;
    this.templatePelId = undefined;
    this.children = undefined;
    this.options = undefined;
    this.standardImage = undefined;
    this.templateFileName = undefined;
    this.errPoint = undefined;
    this.enabledPoint = undefined;
    this.isDiffValuePolygon = true;
    this.paintValue = 0;
    this.rectValue = 0;
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

ModelStandardEquipment.prototype = new Sprite();


ModelStandardEquipment.prototype.showModal = function(event,isInfo,widthScale,heightScale){
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


ModelStandardEquipment.prototype.clearEquipmentTooltip = function () {
    document.querySelector('body .observer-equipment-tooltip').remove();
}

/**
 * 创建工具浮动框
 */
ModelStandardEquipment.prototype.createTooltip = function (pointName) {
    var _this = this;
    var template, $template = $tooltip;
    var parser;
    // console.info(arguments)
    if (!$template) {
        template = this.tooltipTemplate;
        parser = new DOMParser();
        $template = parser.parseFromString(template, "text/html").querySelector('.observer-equipment-tooltip');
        //进入tooltip浮动框
        $template.onmouseenter = function (e) {
            
            tooltip.show();
            e.stopPropagation();
        };
        $template.onmouseleave = function (e) {
            tooltip.hide();
            e.stopPropagation();
        };
        $template.ontransitionend = function (e) {
            if (e.propertyName === 'opacity' && e.target.style.opacity === '0') {
                e.target.style.display = 'none';
            }
            e.stopPropagation();
        };
        $template.style.maxWidth = null;
        $template.style.opacity = configMap.equipmentTooltipOpacity;
        $template.style.zIndex = configMap.equipmentTooltipZIndex;
        $template.style.display = 'block';

        let elemTooltipInner = $template.querySelector('.tooltip-inner');
        elemTooltipInner.maxWidth = null;
        elemTooltipInner.opacity = configMap.equipmentTooltipOpacity;
        elemTooltipInner.backgroundColor = configMap.equipmentTooltipBackgroundColor;
        document.querySelector('body').appendChild($template);
    }

    $template.querySelector('.pointName').textContent = this.name;
    $template.dataset.dsId = '@'+appConfig.project.id+'|'+this.idCom;
    return $template;
}

/**
 * 获取浮动框范围
 */
ModelStandardEquipment.prototype.checkPopoverBoundary = function ($popover, offsetX, offsetY) {
    if (!offsetX) {
        offsetX = this.x;
    }
    if (!offsetY) {
        offsetY = this.y;
    }
    if (!cachedContainerStyle) {
        cachedContainerStyle = window.getComputedStyle(document.querySelector('body'));
    }
    var popoverStyle = window.getComputedStyle($popover);
    var documentWidth = parseInt(cachedContainerStyle.width),
        documentHeight = parseInt(cachedContainerStyle.height),
        popoverWidth = parseInt(popoverStyle.width),
        popoverHeight = parseInt(popoverStyle.height),
        popoverX = this.width + offsetX + popoverWidth,
        popoverY = this.height + offsetY + popoverHeight,
        popoverXOffset,
        popoverYOffset;
    popoverXOffset = popoverX > documentWidth ? offsetX - popoverWidth : offsetX - this.width/2; 
    popoverYOffset = popoverY > documentHeight ? offsetY - popoverHeight : offsetY + 30;

    $popover.style.left = popoverXOffset;
    $popover.style.top = popoverYOffset
}

ModelStandardEquipment.prototype.paint = function (ctx) {
    if (this.image) {
        if (this.image.complete) {
            this.drawImage(this, ctx);
        } else {
            let _this = this;
            this.image.onload = function (e) {
                _this.drawImage(_this, ctx)
            };
        }
    }

    let _this = this;
    if (_this._valueLock == false) {
        _this._valueLock = true;//占住锁
        if (Number(_this.rectValue) != Number(_this.paintValue)) {
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

},

ModelStandardEquipment.prototype.drawImage = function (_this, ctx) {
    
    if ((!_this.width) || (!_this.height)) {
        _this.width = _this.image.width;
        _this.height = _this.image.height;
    }

    try {
        _this.rotateAngle = Number(_this.rotateAngle)
        if (_this.rotateAngle) { 
            // 如果需要拉伸
            let imgWidthScale = 1, imgHeightScale = 1;       

            // ctx.translate(Math.ceil(_this.x), Math.ceil(_this.y));
            // ctx.translate(Math.floor(_this.width / 2), Math.floor(_this.height / 2));
            // ctx.rotate(_this.rotateAngle * Math.PI / 180);

            //TODO
            if (Math.abs(_this.rotateAngle) > 90 && Math.abs(_this.rotateAngle)< 270) {
                if (_this.width !== _this.image.width && _this.image.width > 0) {
                    imgWidthScale = _this.width / _this.image.width;
                }
    
                if (_this.height !== _this.image.height && _this.image.height > 0) {
                    imgHeightScale = _this.height / _this.image.height;
                }       

                // ctx.drawImage(_this.image, Math.ceil(-_this.width / 2), Math.ceil(-_this.height / 2), Math.floor(_this.width), Math.floor(_this.height));
                ctx.setAttribute('transform', `matrix(
                    ${Math.cos(_this.rotateAngle * Math.PI / 180)},
                    ${Math.sin(_this.rotateAngle * Math.PI / 180)},
                    ${-Math.sin(_this.rotateAngle * Math.PI / 180)},
                    ${Math.cos(_this.rotateAngle * Math.PI / 180)},
                    ${Math.floor(_this.x + _this.width / 2)},
                    ${Math.floor(_this.y + _this.height / 2)})

                    scale(${imgWidthScale}, ${imgHeightScale})
                    `
                );

                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute('transform', `matrix(
                    ${Math.cos(_this.rotateAngle * Math.PI / 180)},
                    ${Math.sin(_this.rotateAngle * Math.PI / 180)},
                    ${-Math.sin(_this.rotateAngle * Math.PI / 180)},
                    ${Math.cos(_this.rotateAngle * Math.PI / 180)},
                    ${Math.floor(_this.x + _this.width / 2)},
                    ${Math.floor(_this.y + _this.height / 2)})

                    scale(${imgWidthScale}, ${imgHeightScale})
                    `
                );

                // ctx.drawImage(_this.image, Math.ceil(-_this.width / 2), Math.ceil(-_this.height / 2), Math.floor(_this.width), Math.floor(_this.height));
                ctx.setAttribute("href", _this.image.src);
                if (imgWidthScale != 0) {
                    ctx.setAttribute("x", (-_this.width / 2) / imgWidthScale);    
                    ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", (-_this.width / 2) / imgWidthScale);
                }
                if (imgHeightScale !=0) {
                    ctx.setAttribute("y", (-_this.height / 2) / imgHeightScale);
                    ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", (-_this.width / 2) / imgWidthScale);
                }
                ctx.setAttribute("width", _this.image.width);
                ctx.setAttribute("height", _this.image.height); 

                //设置报警rect红色色块的参数
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("width", _this.image.width);
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("height", _this.image.height);
            } else {
                if (_this.width !== _this.image.height && _this.image.height > 0) {
                    imgWidthScale = _this.width / _this.image.height;
                }
    
                if (_this.height !== _this.image.width && _this.image.width > 0) {
                    imgHeightScale = _this.height / _this.image.width;
                }       

                // ctx.drawImage(_this.image, Math.ceil(-_this.height / 2) , Math.ceil(-_this.width / 2) , Math.floor(_this.height), Math.floor(_this.width));
                ctx.setAttribute('transform', `matrix(
                    ${Math.cos(_this.rotateAngle * Math.PI / 180)},
                    ${Math.sin(_this.rotateAngle * Math.PI / 180)},
                    ${-Math.sin(_this.rotateAngle * Math.PI / 180)},
                    ${Math.cos(_this.rotateAngle * Math.PI / 180)},
                    ${Math.floor(_this.x + _this.width / 2)},
                    ${Math.floor(_this.y + _this.height / 2)})

                    scale(${imgHeightScale}, ${imgWidthScale})
                    `
                );

                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute('transform', `matrix(
                    ${Math.cos(_this.rotateAngle * Math.PI / 180)},
                    ${Math.sin(_this.rotateAngle * Math.PI / 180)},
                    ${-Math.sin(_this.rotateAngle * Math.PI / 180)},
                    ${Math.cos(_this.rotateAngle * Math.PI / 180)},
                    ${Math.floor(_this.x + _this.width / 2)},
                    ${Math.floor(_this.y + _this.height / 2)})

                    scale(${imgHeightScale}, ${imgWidthScale})
                    `
                );

                // ctx.drawImage(_this.image, Math.ceil(-_this.height / 2) , Math.ceil(-_this.width / 2) , Math.floor(_this.height), Math.floor(_this.width));
                ctx.setAttribute("href", _this.image.src);
                ctx.setAttribute("x", (-_this.height / 2) / imgHeightScale);
                ctx.setAttribute("y", (-_this.width / 2) / imgWidthScale);
                ctx.setAttribute("width", _this.image.width);
                ctx.setAttribute("height", _this.image.height);
                //设置报警rect红色色块的参数
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", (-_this.height / 2) / imgHeightScale);
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", (-_this.width / 2) / imgWidthScale);
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("width", _this.image.width);
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("height", _this.image.height);
            }
        } else {
            // 如果需要拉伸
            let imgWidthScale = 1, imgHeightScale = 1;
            if (_this.width !== _this.image.width && _this.image.width >0) {
                imgWidthScale = _this.width / _this.image.width;
            }

            if (_this.height !== _this.image.height && _this.image.height >0) {
                imgHeightScale = _this.height / _this.image.height;
            } 
            if (imgHeightScale && imgWidthScale) {
                ctx.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})`);
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})`);
            }
            // ctx.drawImage(_this.image, Math.ceil(_this.x), Math.ceil(_this.y), Math.floor(_this.width), Math.floor(_this.height));
            ctx.setAttribute("href", _this.image.src);
            ctx.setAttribute("x", parseInt(_this.x) / imgWidthScale);     
            ctx.setAttribute("y", parseInt(_this.y) / imgHeightScale);
            ctx.setAttribute("width", parseInt(_this.image.width));
            ctx.setAttribute("height", parseInt(_this.image.height));

            //设置报警rect红色色块的参数
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("x", parseInt(_this.x) / imgWidthScale);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("y", parseInt(_this.y) / imgHeightScale);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("width", _this.image.width);
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("height", _this.image.height);
        }
    } catch (e) {  
        console.log(e);
    }

},

ModelStandardEquipment.prototype.updateImageIndex = function (_this, ctx, time) {
    _this.value = parseInt(_this.value);
    
   

        if (!(_this.animation[_this.value] && _this.animation[_this.value].frameCount)) return;
        if (_this.animation[_this.value].frameCount > 1 && _this.indexImage < _this.animation[_this.value].frameCount-1) {
            if (time && time - _this.timeLastRefresh > _this.animation[_this.value].interval) {
                _this.indexImage++;
                _this.timeLastRefresh = time;
            }
        } else {
            _this.indexImage = 0;
        }
        
    
}

ModelStandardEquipment.prototype.refreshImage = function (dictList, dictImages) {
    if (this.hasAnimation == undefined) {
        this.hasAnimation = false;
        for (var item in this.animation) {
            this.hasAnimation = true; break;
        }
    }
     if (this.hasAnimation && this.animation[this.value] && this.animation[this.value].frameCount) {
        
        let id = this.animation[this.value].frameCount > 1 ? "template/animation_" : "";
        if (this.animation[this.value].frameCount > 1 && dictList[this.animation[this.value].animationId]) {
            let preAnimation =  dictList[this.animation[this.value].animationId][this.indexImage]
            if (preAnimation && preAnimation.toString().indexOf('template/')>=0) {
                //如果大于8，说明时其他模板4db
                if (preAnimation.lastIndexOf("\/")>8){
                    let index = preAnimation.lastIndexOf("\/");
                    
                    id = preAnimation.substring(0,index+1) + "animation_" + preAnimation.substring(index+1);
                }else{
                    id += preAnimation.substring(9);   
                }  
            }else {
                id += preAnimation
            }
        }
        else id = this.animation[this.value].animationId;
        if (dictImages[id]) {
            this.image = dictImages[id];
        }
    }
},

ModelStandardEquipment.prototype.mouseOver = function (event,isInfo) {
    if (this.history == undefined) {
       if(this.link != '-1' || (this.linkinfo && this.linkinfo[2] === "5")){  //兼容没有外链字段的旧接口
            this.history = {};
            this.history.width = this.width;
            this.history.height = this.height;
            this.history.x = this.x;
            this.history.y = this.y;

            this.width += 30;
            this.height += 30;
            this.x -= 15;
            this.y -= 15;
       }

        var _this = this;
        setTimeout(function () {
            _this.mouseOut();
        }, 1000);

        if (!cachedContainerStyle) {
            cachedContainerStyle = window.getComputedStyle(document.querySelector('body'));
        }
        var documentWidth = parseInt(cachedContainerStyle.width),
            documentHeight = parseInt(cachedContainerStyle.height);
    
        if (_this.enableTooltip) {
            // prevent inner elements bubble events
            if (_this.isInMouserOver) return;
    
            if (!this.idCom) return;
            $tooltip = this.createTooltip(this.name);
            tooltip.show();
           
            if (isInfo.isInModal){ //在模态框里
                event.stopPropagation()
                this.checkPopoverBoundary($tooltip, event.offsetX + (documentWidth-isInfo.pageWidth)/2 , event.offsetY + (documentHeight-isInfo.pageHeight)/2);
            }else{
                event.stopPropagation()
                this.checkPopoverBoundary($tooltip, event.offsetX, event.offsetY);
            }
            this.isInMouserOver = true;
        }
    }
},

ModelStandardEquipment.prototype.mouseOut = function () {
    if (this.enableTooltip) {
        tooltip.hide();
        this.isInMouserOver = false;
    }
    if (this.history) {
        this.width = this.history.width;
        this.height = this.history.height;
        this.x = this.history.x;
        this.y = this.history.y;
        this.history = undefined;
    }
}
// static
ModelStandardEquipment.destroy = function () {
    if (tooltipTimer) {
        clearTimeout(tooltipTimer);
        tooltipTimer = null;
    }
    if ($tooltip !== null) {
        $tooltip.parentNode.removeChild($tooltip);
        $tooltip = null;
    }
    if (cachedContainerStyle) {
        cachedContainerStyle = null;
    }
};


function drawOnline(_this, ctx) {
    //如果点值为空，直接退出不渲染，防止回放时出现NaN
     if (_this.netOnlineStatus === "") {
        return;
    }
    var nextValue = Number(_this.netOnlineStatus);
    let modelPolygon = new ModelStandardEquipment()
    try {
        let x = _this.x;
        let y = _this.y;
        let width = _this.width;
        let height = _this.height;

        let xMax = x + width;
        let yMax = y + height;
        let xMin = x;
        let yMin = y;

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
    let modelPolygon = new ModelStandardEquipment()
    try {

        let x = _this.x;
        let y = _this.y;
        let width = _this.width;
        let height = _this.height;

        let xMax = x + width;
        let yMax = y + height;
        let xMin = x;
        let yMin = y;

        if (nextValue != -1) {
            let excursion = _this.width >70?0:_this.width >40?(70-_this.width):40
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
    let modelPolygon = new ModelStandardEquipment()
    try {
        let x = _this.x;
        let y = _this.y;
        let width = _this.width;
        let height = _this.height;

        let xMax = x + width;
        let yMax = y + height;
        let xMin = x;
        let yMin = y;

        if (nextValue != -1) {
            let excursion = _this.width >70?0:_this.width >40?(70-_this.width):40

            nextValue = parseInt(_this.powerValue)
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
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("stroke", localStorage.getItem('equipmentIconStyle')&&localStorage.getItem('equipmentIconStyle')=='black'?"#fff":"#333");
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

        let x = _this.x;
        let y = _this.y;
        let width = _this.width;
        let height = _this.height;

        let xMax = x + width;
        let yMax = y + height;
        let xMin = x;
        let yMin = y;

        if (nextValue != -1) {
            let excursion = _this.width >70?0:_this.width >40?(70-_this.width):40
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
    let modelPolygon = new ModelStandardEquipment()
    try {
        let x = _this.x;
        let y = _this.y;
        let width = _this.width;
        let height = _this.height;

        let xMax = x + width;
        let yMax = y + height;
        let xMin = x;
        let yMin = y;

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
    let modelPolygon = new ModelStandardEquipment()
    try {

        let x = _this.x;
        let y = _this.y;
        let width = _this.width;
        let height = _this.height;

        let xMax = x + width;
        let yMax = y + height;
        let xMin = x;
        let yMin = y;

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
    var nextValue = Number(_this.rectValue);
    try {
        if (nextValue === 4) {
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(204,0,0,0.6)");
            if (localStorage.getItem('animation') == undefined || localStorage.getItem('animation') != 'cheap') {
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.childNodes[0].setAttribute("values", "0.6;0.3;0.6");//运行且报警状态,红色加动画
            }
            _this.paintValue = 4;//标记-可刷新
            _this._valueLock = false;//释放锁
        } else {
            if (nextValue === 2) {
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(204,0,0,0.6)");
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.childNodes[0].setAttribute("values", "");//删除子元素动画
                _this.paintValue = 2;//标记-可刷新
                _this._valueLock = false;//释放锁
            } else {
                // if (nextValue === 1) {
                //     if (localStorage.getItem('animation_status_on_color')) {
                //         ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", localStorage.getItem('animation_status_on_color'));
                //     } else {
                //         ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(102,255,102,0.7)");
                //     }
                //     if (localStorage.getItem('animation') == undefined || localStorage.getItem('animation') != 'cheap') {
                //         ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.childNodes[0].setAttribute("values", "0.7;0.3;0.7");//运行状态加动画
                //     }
                //     _this.paintValue = 1;//标记-可刷新
                //     _this._valueLock = false;//释放锁
                // }
                //  else {
                //     if (nextValue === 3) {
                //         ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(119,119,119,0.9)");
                //         //禁用状态灰色不加动画
                //         ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.childNodes[0].setAttribute("values", "");//删除子元素动画                   
                //         _this.paintValue = 3;//标记-可刷新
                //         _this._valueLock = false;//释放锁
                //     } else {
                //         // ctx.setAttribute("fill", "none"); //无法获取元素上的方法点击失败
                //         ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(0,0,0,0)"); //无状态无颜色显示原图
                //         //无状态不加动画
                //         _this.paintValue = 0;//标记-可刷新
                //         _this._valueLock = false;//释放锁
                //     }
                // }
                // ctx.setAttribute("fill", "none"); //无法获取元素上的方法点击失败
                ctx.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.setAttribute("fill", "rgba(0,0,0,0)"); //无状态无颜色显示原图
                //无状态不加动画
                _this.paintValue = 0;//标记-可刷新
                _this._valueLock = false;//释放锁
            }
        }

    }
    catch (e) {
        console.error(e);
    }
}

function paintIconAutoMode(_this, ctx) {
    var nextValue = Number(_this.autoModeValue);
    let modelPolygon = new ModelStandardEquipment()
    try {
        let x = _this.x;
        let y = _this.y;
        let width = _this.width;
        let height = _this.height;

        let xMax = x + width;
        let yMax = y + height;
        let xMin = x;
        let yMin = y;
 
        if (nextValue === 2) {
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("stroke", '#EEEEEE');
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("x", xMax + 16);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("y", yMin - 13);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("width", 17);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("height", 16);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("rx", 2);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("ry", 2);
            ctx.nextSibling.nextSibling.nextSibling.setAttribute("fill", "#33CC33");
            ctx.nextSibling.nextSibling.nextSibling.nextSibling.textContent = EquipmentAutoDisplay[0]?EquipmentAutoDisplay[0]:'A'
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
    let modelPolygon = new ModelStandardEquipment()
    try {
        let x = _this.x;
        let y = _this.y;
        let width = _this.width;
        let height = _this.height;

        let xMax = x + width;
        let yMax = y + height;
        let xMin = x;
        let yMin = y;

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

export default ModelStandardEquipment;
