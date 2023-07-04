import { Sprite } from '../sprites';
import appConfig from '../../../../../common/appConfig';
import http from '../../../../../common/http';
import  ModelText from './modelText'
import { DatePicker,Form,Button,Modal,Table,Select,message,Spin,Alert,Row,Col,Card,Layout,Switch,Input,InputNumber,Tag} from 'antd';
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


function ModelFix(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [{ execute: this.updateImageIndex }];

  
    this.image = undefined;
    this.indexImage = 0;
    this.layer = undefined;
    this.link = undefined; //自定义图元内链
    this.linkinfo = undefined; //自定义图元设置外链的信息
    this.tooltipTemplate = configMap.equipmentTooltipTemplate; //浮动框模板
    this.enableTooltip = true;
    this.description = undefined;

    this.history = undefined;
    this.timeLastRefresh = 0;

    this.equipImage = undefined; 
};

ModelFix.prototype = new Sprite();


ModelFix.prototype.clearEquipmentTooltip = function () {
    document.querySelector('body .observer-equipment-tooltip').remove();
}

/**
 * 创建工具浮动框
 */
ModelFix.prototype.createTooltip = function (pointName) {
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

ModelFix.prototype.showModal = function(event,isInfo,widthScale,heightScale){
    let model = new ModelText()
    http.post('/analysis/get_point_info_from_s3db',{
        "pointList": [this.idCom]
    }).then(data=>{
        if(data.err==0){
            model.description = data.data.realtimeValue[0].description
            model.idCom = data.data.realtimeValue[0].name
            model.value = data.data.realtimeValue[0].value
            model.sourceType = data.data[this.idCom].sourceType
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
    // model.showModal(event,isInfo,widthScale,heightScale)
    // setTimeout(function(){
    //     // e.offsetX = e.clientX-5,
    //     // e.offsetY = e.clientY-80
    //     model.showModal(event,isInfo,widthScale,heightScale)
    // },700)
}


/**
 * 获取浮动框范围
 */
ModelFix.prototype.checkPopoverBoundary = function ($popover, offsetX, offsetY) {
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

ModelFix.prototype.paint = function (ctx,widthScale,heightScale) {
    if (this.image) {
        if (this.image.complete) {
            this.drawImage(this, ctx,widthScale,heightScale);
        } else {
            var _this = this;
            this.image.onload = function (e) {
                _this.drawImage(_this, ctx,widthScale,heightScale)
            };
        }
    }
},

ModelFix.prototype.drawImage = function (_this, ctx,widthScale,heightScale) {
    
    if ((!_this.width) || (!_this.height)) {
        _this.width = _this.image.width;
        _this.height = _this.image.height;
    }


    try {
        if (_this.rotate) {
            // 如果需要拉伸
            let imgWidthScale = 1, imgHeightScale = 1;         
            
            // ctx.translate(Math.ceil(_this.x), Math.ceil(_this.y));
            // ctx.translate(Math.floor(_this.width / 2), Math.floor(_this.height / 2));
            // ctx.rotate(_this.rotate * Math.PI / 180);
            
            // ctx.setAttribute('transform', `translate(${Math.ceil(_this.x)}, ${Math.ceil(_this.y)})`);
            // ctx.setAttribute('transform', `translate(${Math.floor(_this.width / 2)}, ${Math.floor(_this.height / 2)})`);  
            // ctx.setAttribute('transform', `rotate(${_this.rotate * Math.PI / 180})`);


            //TODO
            if (Math.abs(_this.rotate) > 90 && Math.abs(_this.rotate)< 270) {
                if (_this.width !== _this.image.width && _this.image.width >0) {
                    imgWidthScale = _this.width / _this.image.width;
                }
    
                if (_this.height !== _this.image.height && _this.image.height >0) {
                    imgHeightScale = _this.height / _this.image.height;
                }   
                ctx.setAttribute('transform', `matrix(
                    ${Math.cos(_this.rotate * Math.PI / 180)},
                    ${Math.sin(_this.rotate * Math.PI / 180)},
                    ${-Math.sin(_this.rotate * Math.PI / 180)},
                    ${Math.cos(_this.rotate * Math.PI / 180)},
                    ${Math.floor(_this.x + _this.width / 2)},
                    ${Math.floor(_this.y + _this.height / 2)})

                    scale(${imgWidthScale}, ${imgHeightScale})
                    `
                );

                // ctx.drawImage(_this.image, Math.ceil(-_this.width / 2), Math.ceil(-_this.height / 2), Math.floor(_this.width), Math.floor(_this.height));
                ctx.setAttribute("href", _this.image.src);
                ctx.setAttribute("x", (-_this.width / 2) / imgWidthScale);	  
                ctx.setAttribute("y", (-_this.height / 2) / imgHeightScale);
                ctx.setAttribute("width", _this.image.width);
                ctx.setAttribute("height", _this.image.height);
            } else {
                if (_this.width !== _this.image.height && _this.image.height >0) {
                    imgWidthScale = _this.width / _this.image.height;
                }
    
                if (_this.height !== _this.image.width && _this.image.width >0) {
                    imgHeightScale = _this.height / _this.image.width;
                }   
                ctx.setAttribute('transform', `
                    matrix(
                    ${Math.cos(_this.rotate * Math.PI / 180)},
                    ${Math.sin(_this.rotate * Math.PI / 180)},
                    ${-Math.sin(_this.rotate * Math.PI / 180)},
                    ${Math.cos(_this.rotate * Math.PI / 180)},
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
            }
        } else {
       
            // 如果需要拉伸
            // let imgWidthScale = 1, imgHeightScale = 1;
            // if (_this.width !== _this.image.width) {
            //     imgWidthScale = _this.width / _this.image.width;
            // }

            // if (_this.height !== _this.image.height) {
            //     imgHeightScale = _this.height / _this.image.height;
            // } 

            // if (imgHeightScale && imgWidthScale) {
            //     ctx.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})`);
            // }
            // ctx.setAttribute("transform", `
            //         translate(${ -1920 * (widthScale - 1) / 2}, ${ -955 * (heightScale - 1) / 2})
                    
            //     `);
            // ctx.drawImage(_this.image, Math.ceil(_this.x), Math.ceil(_this.y), Math.floor(_this.width), Math.floor(_this.height));
            ctx.setAttribute("href", _this.image.src);
            ctx.setAttribute("x", parseInt(_this.x) / widthScale);	  
            ctx.setAttribute("y", (parseInt(_this.y)/1)-96);
            ctx.setAttribute("width", parseInt(_this.image.width));
            ctx.setAttribute("height", parseInt(_this.image.height));
        }
    } catch (e) {  
        console.log(e);
    }

},

ModelFix.prototype.updateImageIndex = function (_this, ctx, time) {


    _this.indexImage = 0;
        
        
    
}

ModelFix.prototype.refreshImage = function (dictList, dictImages) {
    if (this.hasAnimation == undefined) {
        this.hasAnimation = false;
        for (var item in this.animation) {
            this.hasAnimation = true; break;
        }
    }
     if (this.hasAnimation && this.animation[this.value] && this.animation[this.value].frameCount) {
        
        let id = this.animation[this.value].frameCount > 1 ? "animation_" : "";
        if (this.animation[this.value].frameCount > 1 && dictList[this.animation[this.value].animationId]){
            //如果是模版弹框，需加前缀
            if (dictList[this.animation[this.value].animationId][this.indexImage] && dictList[this.animation[this.value].animationId][this.indexImage].toString().indexOf('template/')>=0) {
                id = "template/animation_" 
                id += dictList[this.animation[this.value].animationId][this.indexImage].substring(9);       
            }else {
                id += dictList[this.animation[this.value].animationId][this.indexImage]
            }
        }
            //id += dictList[this.animation[this.value].animationId][this.indexImage];
        else id = this.animation[this.value].animationId;
        if (dictImages[id]) {
            this.image = dictImages[id];
        }
        
    
    }
},

ModelFix.prototype.mouseOver = function (event,isInfo) {
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

ModelFix.prototype.mouseOut = function () {
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
ModelFix.destroy = function () {
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

export default ModelFix;
