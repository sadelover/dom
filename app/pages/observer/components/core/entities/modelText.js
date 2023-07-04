import { Sprite } from '../sprites';
import appConfig from '../../../../../common/appConfig';
import { StringTools } from '../commonCanvas';
import {store} from '../../../../../index'
import http from '../../../../../common/http';
import { type } from 'os';
import { duration } from 'moment';
import {showCommandLogModal} from '../../../../commandLog/modules/commandLogModule'
import { Icon} from 'antd';
/////////////
// TOOLTIP //
/////////////

var tooltipPointList = []; //绑定多点名右击浮动框使用
var pointIndex = 0; //绑定多点名右击浮动框使用
var flag = false;
var n = 0
var TOOLTIP_DELAY = 1000;
var $tooltip = null;
var tooltipTimer = null;
var tooltip = {
    show: function (rw,pointName) {
        $tooltip.style.display = 'block';
        $tooltip.style.opacity = configMap.textTooltipOpacity;
        if (flag == true) {
            document.getElementsByClassName('lastSpan')[0].style.display = '';
            document.getElementsByClassName('nextSpan')[0].style.display = '';
            document.getElementsByClassName('pointName')[0].style.marginLeft = 30;
        }else {
            document.getElementsByClassName('lastSpan')[0].style.display = 'none';
            document.getElementsByClassName('nextSpan')[0].style.display = 'none';
            document.getElementsByClassName('pointName')[0].style.marginLeft = 15;
        }
        if (document.getElementsByClassName('description')[0].innerText == "请求错误" ||document.getElementsByClassName('description')[0].innerText == "点表中不存在该点名") {
            if(document.getElementsByClassName('pointName')[0].innerText.indexOf('%') != -1){
                document.getElementsByClassName('description')[0].innerText = "脚本"
            }else{
                document.getElementsByClassName('description')[0].innerText = "点表中不存在该点名"
            }
            document.getElementsByClassName('description')[0].style.color = 'red'
            document.getElementsByClassName('copyValue')[0].style.display = 'none'
            document.getElementsByClassName('linkAddToHistory')[0].style.display = 'none'
            document.getElementsByClassName('sourceType')[0].style.display = 'none'
            document.getElementsByClassName('warningInfo')[0].style.display = 'none'
            document.getElementsByClassName('linkAddToTendency')[0].style.display = 'none'
            document.getElementsByClassName('linkAddAlert')[0].style.display = 'none'
            document.getElementsByClassName('linkAddToValueLog')[0].style.display = 'none'
        }else {
            if(JSON.parse(window.localStorage.getItem('userData')).role < 3){
                document.getElementsByClassName('linkAddToValueLog')[0].style.display = 'none'
            }else{
                if(rw != 1 || document.getElementsByClassName('description')[0].innerText == "点表中不存在该点名"){
                    document.getElementsByClassName('linkAddToValueLog')[0].style.display = 'none'
                }else{
                    document.getElementsByClassName('linkAddToValueLog')[0].style.display = ''
                }
            }
            document.getElementsByClassName('warningInfo')[0].style.display = 'none'
            document.getElementsByClassName('warningInfo')[0].textContent = ''
            let warningInfoList = localStorage.getItem('WarningInfo')? JSON.parse(localStorage.getItem('WarningInfo')): []
            if(warningInfoList != undefined && warningInfoList != '' && warningInfoList != [] && warningInfoList.length > 0){
                warningInfoList.map(item=>{
                    if(pointName == item.pointName){
                        document.getElementsByClassName('warningInfo')[0].style.display = ''
                        document.getElementsByClassName('warningInfo')[0].textContent = '报警：'+ item.warningInfo
                        document.getElementsByClassName('warningInfo')[0].title = item.warningInfo
                    }
                })
            }
           
            document.getElementsByClassName('description')[0].style.color = 'black'
            document.getElementsByClassName('copyValue')[0].style.display = ''
            document.getElementsByClassName('linkAddToHistory')[0].style.display = ''
            document.getElementsByClassName('sourceType')[0].style.display = ''
            document.getElementsByClassName('linkAddToTendency')[0].style.display = ''
            document.getElementsByClassName('linkAddAlert')[0].style.display = ''
        }
        // if (tooltipTimer) { window.clearTimeout(tooltipTimer); tooltipTimer = null;}
    },
    hide: function () {
        $tooltip.style.display='none'
        $tooltip.style.opacity = 0
        document.getElementsByClassName('description')[0].style.color = 'black'
        document.getElementsByClassName('copyValue')[0].style.display = ''
        document.getElementsByClassName('linkAddToHistory')[0].style.display = ''
        document.getElementsByClassName('sourceType')[0].style.display = ''
        document.getElementsByClassName('linkAddToTendency')[0].style.display = ''
        document.getElementsByClassName('linkAddAlert')[0].style.display = ''
        if (!tooltipTimer) {
        //   tooltipTimer =  window.setTimeout(function () {
                if ($tooltip !== null) {
                    $tooltip.style.opacity = 0;
                    // $tooltip.style.left='-999px';
                    // $tooltip.style.top='-999px';
                    $tooltip.style.display='none'
                }
                // tooltipTimer = null;
            // }, TOOLTIP_DELAY);
        }
    }
    
}
var containerBgColor,navBgColor,pointNameColor,descriptionColor,btnBgColor,btnColor
if(localStorage.getItem('serverOmd')=="persagy" || localStorage.getItem('serverOmd')=="best") {
    containerBgColor = 'rgba(255,255,255,1)';
    navBgColor = 'rgba(248,249,250,1)';
    pointNameColor = 'rgba(31,36,41,1)';
    descriptionColor = 'rgba(141,147,153,1)';
    btnBgColor = '#FFFFFF';
    btnColor = '#1F2329';
} else {
    containerBgColor = '#eee';
    navBgColor = '#273147';
    pointNameColor = '#fff';
    descriptionColor = 'rgba(31,36,41,1)';
    btnBgColor = '#aaa';
    btnColor = '#000';
}
//ant-popover-inner-content  
//  transition: all 0.3s ease-in-out;
var configMap = {
    textTooltipTemplate: `
    <div class="ant-popover ant-popover-placement-top observer-text-tooltip" data-ds-id="" text-align: center;transition: all 0.3s ease-in-out">
        <div class="ant-popover-content" style="border-radius:4px;>
            <div class="ant-popover-inner">
                <div class="observer-text-tooltip" style="display:inline-block;min-height:170px;background:${containerBgColor};box-shadow:0px 5px 10px 0px rgba(31,35,41,0.1);border:1px solid rgba(228,229,231,1);border-radius:4px;">
                    <div class=" tooltip-inner">
                        <div style="display:inline-block;height:39px;background:${navBgColor};border-radius:4px;margin:1px;">
                            <span class="lastSpan" style="position:absolute;top:5px"><a  class="lastPoint" style="color:#fdf7f7;user-select:none;"> <svg t="1675934382731" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7971" width="32" height="32"><path d="M452.266667 507.733333l-29.866667 29.866667 29.866667 29.866667 115.2 115.2 29.866666-29.866667-115.2-115.2L597.333333 422.4l-29.866666-29.866667-115.2 115.2z m81.066666 388.266667c200.533333 0 362.666667-162.133333 362.666667-362.666667S733.866667 170.666667 533.333333 170.666667 170.666667 332.8 170.666667 533.333333 332.8 896 533.333333 896z m0-42.666667C358.4 853.333333 213.333333 708.266667 213.333333 533.333333S358.4 213.333333 533.333333 213.333333 853.333333 358.4 853.333333 533.333333 708.266667 853.333333 533.333333 853.333333z" fill="#dbdbdb" p-id="7972"></path></svg></a></span>
                            <div class="pointName" id="first" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;width:320px;float:left;height:21px;display:inline-block;margin:9px 10px 9px 35px;font-size:16px;font-family:MicrosoftYaHeiSemibold;color:${pointNameColor};line-height:21px;"></div>
                            <input id='three' style="opacity:0;width:10px;position:absolute;top:0;left:0;z-index:0;"/>
                            <input id='four' style="opacity:0;width:10px;position:absolute;top:0;left:0;z-index:0;"/>     
                            <span class="nextSpan" style="float:left;margin:4px 24px 9px 0"><a  class="nextPoint" style="color:#fdf7f7;user-select:none;"><svg t="1675934654789" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8318" width="32" height="32"><path d="M614.4 507.733333l29.866667 29.866667-29.866667 29.866667-115.2 115.2-29.866667-34.133334 115.2-115.2L469.333333 422.4l29.866667-29.866667 115.2 115.2zM533.333333 896C332.8 896 170.666667 733.866667 170.666667 533.333333S332.8 170.666667 533.333333 170.666667 896 332.8 896 533.333333 733.866667 896 533.333333 896z m0-42.666667c174.933333 0 320-145.066667 320-320S708.266667 213.333333 533.333333 213.333333 213.333333 358.4 213.333333 533.333333 358.4 853.333333 533.333333 853.333333z" fill="#dbdbdb" p-id="8319"></path></svg> </a></span>                 
                            <span style="float:left;margin:9px 16px 9px 0"><a  class="copy"  style="font-size:16px;font-family:MicrosoftYaHei;color:#0091FF;line-height:21px;font-weight:600;">复制</a></span>
                            <span style="float:left;margin:9px 31px 9px 0"><a  class="copyValue" style="font-size:16px;font-family:MicrosoftYaHei;color:#0091FF;line-height:21px;font-weight:600;">复制值</a></span>                         
                        </div>
                    </div>
                    <div  class="description" style="max-width:52%;height:60px; word-wrap:break-word;font-size:14px;font-family:MicrosoftYaHei;color:${descriptionColor};line-height:19px;display:inline-block;position:absolute;top:50px;left:24px;"></div>
                    <div  class="sourceType" style="max-width:52%;height:60px; word-wrap:break-word;font-size:14px;font-family:MicrosoftYaHei;color:${descriptionColor};line-height:19px;display:inline-block;position:absolute;top:86px;left:24px;"></div>
                    <div  class="warningInfo" style="cursor: pointer;max-width:90%;height:30px; text-overflow:ellipsis;overflow:hidden;white-space:nowrap;font-size:13px;font-family:MicrosoftYaHei;color:red;line-height:19px;display:inline-block;position:absolute;top:108px;left:24px;"></div>
                    <div style="display:inline-block;position:absolute;top:50px;right:32px;"><a class="linkAddToHistory" href="javascript:;" style="color:#0091FF;font-size:14px;font-family:MicrosoftYaHei,PingFangSC-Regular,PingFang SC;font-weight:400;line-height:20px;">添加到历史曲线</a></div>
                    <div style="display:inline-block;position:absolute;top:80px;right:32px;"><a class="linkAddToValueLog" href="javascript:;" style="color:#0091FF;font-size:14px;font-family:MicrosoftYaHei,PingFangSC-Regular,PingFang SC;font-weight:400;line-height:20px;">指令记录查询</a></div>
                    <div style="display:inline-block;">
                        <button class="cancel" style="width:80px;height:32px;background:${btnBgColor};border-radius:4px;border:1px solid #C3C6CB;font-size:14px;font-weight:400;font-family:MicrosoftYaHei;color:${btnColor};line-height:22px;position:absolute;bottom:20px;left:calc((100% - 248px)/4);font-weight:400;cursor:pointer;">取消</button>
                        <a class="linkAddToTendency" href="javascript:;"style="color:${btnColor};font-weight:400;"><button style="width:80px;height:32px;background:${btnBgColor};border-radius:4px;border:1px solid #C3C6CB;font-size:14px;font-weight:400;font-family:MicrosoftYaHei;cursor:pointer;line-height:22px;position:absolute;bottom:20px;right:calc((100% - 248px)/2 + 88px);">趋势</button></a>
                        <a class="linkAddAlert"  href="javascript:;" style="color:#FFFFFF;font-weight:400;"><button style="width:88px;height:32px;background:#0091FF;border-radius:4px;font-size:14px;font-family:MicrosoftYaHei;line-height:22px;position:absolute;bottom:20px;cursor:pointer;right:calc((100% - 248px)/4);border:1px solid #0091FF;">添加报警</button></a>
                    </div>
                    <div class="readWrite"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    textTooltipZIndex: 2000,
    textTooltipOpacity: 1,
    textTooltipBackgroundColor: '#ffffff'
}
var cachedContainerStyle;


function ModelText(id, painter, behaviors,type) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [{ execute: this.executeAnimation }];
    this.bindScript = undefined;
    this.value = undefined;
    this.isDiffValue = undefined;
    this.font = undefined;
    this.color = undefined;
    this.fontSize = undefined;
    this.align = undefined;
    this.decimalplace = undefined;
    this.idCom = undefined;
    this.dictBindString = [];
    this.showMode = undefined;
    this.tooltipTemplate = configMap.textTooltipTemplate; //浮动框模板
    this.enableTooltip = true;
    this.isInMouserOver = false;
    this.isNeedMark = undefined;
    this.options = undefined;
    this.oldColor = undefined;
    this._valueLock = false;
    this.sourceType = undefined;
    this.description = undefined; //点释义
    this.rw = undefined; //读写
    this.readWrite = undefined
    this.backgroudFrameStyle = undefined; //背景框样式
    // if(type != 0) {
    //     this.imgBg = new Image();
    //     this.imgBg.src = appConfig.serverUrl + `/static/images/backgroudImg_${type}.png`;
    // }
    

    this.text = undefined;
    this.foreignObject = undefined;
    this.bgImage = undefined;
    //带单位模式
    this.unitBg = undefined;
    this.textBg = undefined;
    this.unit = undefined;
    this.param10 = ""; //点权限配置
    this.permission = true;//默认有点权限

};

ModelText.prototype = new Sprite();
ModelText.prototype.clearTextTooltip = function () {
    document.querySelector('body .observer-text-tooltip').remove();
}


ModelText.prototype.paint = function (ctx, foreignObject, widthScale, svgChart) {
    var _this = this;

    // if(_this.backgroudFrameStyle != 0 && !_this.bgImage.getAttribute('href')) {
    //     this.drawBgImage(this, this.bgImage);  
    // }
    if (!_this.permission) {
        return;
    }
    var curColor = this.color;
    var strFontSize, strFont; 
    if (this.fontSize) strFontSize = this.fontSize + "px ";
    strFont = _this.font ? _this.font : "Arial";
    ctx.font = strFont;

    // ctx.setAttribute("font-size", strFontSize);
    // ctx.setAttribute("font-family", strFont);

    if (this.bgColor) {
        curColor = "#ffffff";
        paintDiagNoticeBg();
    }
    if (!this.isDiffValue) {
        paintText(curColor);
    } else {
        // strFont = 'bold ' + strFont;
        ctx.setAttribute("font-weight", 'bold ');
        paintText(curColor);
    }

    
    
    function paintText(color) {
        var copyThisValue = '';
        //拿锁后才能拿值
        if(_this._valueLock==false){
            _this._valueLock = true;//占住锁
            copyThisValue = _this.value;
            // console.info(  "pain" )
            _this._valueLock = false;//释放锁
        }
        else{
            // console.info(  "paint:没拿到锁,放弃绘制" )
            return false; //拿不到锁，就放弃绘制
        }
        // ctx.save();
        try{
            // ctx.font = strFont;
            // ctx.setAttribute("font-size", strFontSize);
            
            // ctx.textBaseline = "middle";
            // ctx.setAttribute("alignment-baseline","central");

            // if (color) ctx.setAttribute("fill", color); // ctx.fillStyle = color;

            var str;
            
            if(copyThisValue ===''){
                str = ''
            }
            else if (!isNaN(copyThisValue) && _this.decimalplace != undefined) {
                str = parseFloat(copyThisValue).toFixed(_this.decimalplace);
                if (str == "NaN") str = "--";
            }
            else {
                str = copyThisValue;
            }
            
            var index = parseInt(copyThisValue);
            var num;
            var STR;
            ctx.setAttribute('fill',`${_this.color}`);
            for(let i=0;i<_this.dictBindString.length;i++){
                for (let z = 0; z < _this.dictBindString[i].length; z++) {
                    if (_this.dictBindString[i][z] === ':') {
                       num = _this.dictBindString[i].slice(0,z);
                       if(num == index){
                        STR =  _this.dictBindString[i];
                        if (STR.match(/,/)) {
                            let arrBindString = STR.split(',');
                             for(let i=0;i<arrBindString[0].length;i++) {
                                 if (arrBindString[0][i] === ':') {
                                     str = arrBindString[0].slice(i+1);
                                 }
                             }
                             var colorStr = arrBindString[1].slice(6); 
                             ctx.setAttribute('fill', `${colorStr}`);
                         } else {
                             for (let i = 0; i < STR.length; i++) {
                               if (STR[i] === ':') {
                                 str = STR.slice(i + 1);
                               }
                             }
                             ctx.setAttribute('fill',`${_this.color}`);
                         }
                       }
                    }  
                }
            }
           
            // if (_this.permission) {
            //     ctx.textContent = str;
            // }
            if(_this.idCom!=undefined){ 
                let data = localStorage.getItem('WarningInfo')?JSON.parse(localStorage.getItem('WarningInfo')):[]
                let flag = 0
                if(data != '' && data != undefined && data != []){
                    for(let i=0;i<data.length;i++){
                        if(_this.idCom == data[i]['pointName']){
                            flag = 1
                            // if(n%40==0||n%40==1||n%40==2||n%40==3||n%40==4||n%40==5||n%40==6||n%40==7||n%40==8||n%40==9||n%40==10){
                            //     if(n<40){
                            //         n++
                            //     }else{
                            //         n = 0
                            //     }
                            //     ctx.setAttribute('fill','rgba(255,0,0,0.05)');
                            // }else{
                            //     n++
                            //     ctx.setAttribute('fill','rgba(255,0,0,1)');
                            // }  
                            if(ctx.children[0] != undefined){
                            }else{
                                let nameSpace = 'http://www.w3.org/2000/svg';
                                let colorAnimate = document.createElementNS(nameSpace, "animate"); 
                                colorAnimate.setAttribute("attributeType", "CSS");
                                colorAnimate.setAttribute("attributeName", "fill");
                                colorAnimate.setAttribute("from","red");
                                colorAnimate.setAttribute("to","rgba(255,0,0,0.2)");
                                colorAnimate.setAttribute("dur", "1s");
                                colorAnimate.setAttribute("repeatCount", "indefinite");   
                                
                                ctx.appendChild(colorAnimate)
                           
                            }
                        }
                    }
                }
                if(flag == 0){
                    ctx.textContent = str;
                }else{
                     // //新值赋值-待优化
                    if(ctx.children[0] != undefined){
                        ctx.childNodes[0].data = str
                    }else{
                        ctx.textContent = str;
                    }
                }
            }
            
            // let nameSpace = 'http://www.w3.org/2000/svg';
            // if (
            //     str.length > 15 || _this.width < _this.height - 20
            //     // && typeof(ctx.getComputedTextLength) !== 'undefined'
            //     // && ctx.getComputedTextLength() > _this.width * widthScale
            //  ) {
            //     foreignObject = document.createElementNS( nameSpace, 'foreignObject');
            //     // 做判断 fb or p
            //     let category = ctx.getAttribute('category');
            //     if (category == 'text') {
            //         let id = ctx.getAttribute('id');
            //         // 替换为fb元素
            //         let xixi = document.getElementById(id);
            //         let haha = document.getElementsByClassName('text' + id);
            //         if (haha.length > 1) {
            //             svgChart.removeChild(haha[1]);
            //         }

            //         // 得到xixi在节点树中nextsibil的位置
            //         var nextSibling;                    
            //         if (xixi) {
            //             if (xixi.parentNode.getAttribute('category') == "p") {     
            //                 nextSibling = xixi.parentElement.nextSibling;
            //                 svgChart.removeChild(xixi.parentElement);
            //             } else {    
            //                 nextSibling = xixi.nextSibling;                         
            //                 svgChart.removeChild(xixi);
            //             }
            //         }
                    
            //         let p = document.createElement('p');
            //         p.append(str);
            //         if (nextSibling) {
            //             svgChart.insertBefore(foreignObject, nextSibling);
            //         } else {
            //             svgChart.appendChild(foreignObject);
            //         }
            //         foreignObject.appendChild(p); 
            //         ctx = p;
            //         foreignObject.setAttribute('category', 'p');
            //         foreignObject.setAttribute('class', 'text' + id);
            //         ctx.setAttribute('category', 'p');
            //         ctx.setAttribute('id', id);
            //         ctx.setAttribute('type', '3');
            //     }
            // } else {
            //     // 做判断 fb or p
            //     let category = ctx.getAttribute('category');
            //     if (category == 'text') {
            //         let id = ctx.getAttribute('id');
            //         // 替换为text元素
            //         let xixi = document.getElementById(id);
            //         let haha = document.getElementsByClassName('text' + id);
            //         if (haha.length > 1) {
            //             svgChart.removeChild(haha[1]);
            //         }   

            //         // 得到xixi元素在节点树中的位置
            //         var nextSibling; 
            //         if (xixi) {
            //             if (xixi.parentNode.getAttribute('category') == "p") {         
            //                 nextSibling = xixi.parentElement.nextSibling;                 
            //                 svgChart.removeChild(xixi.parentElement);
            //             } else {
            //                 nextSibling = xixi.nextSibling;                              
            //                 svgChart.removeChild(xixi);
            //             }
            //         }
            //         ctx.setAttribute('class', 'text' + id);
            //         if (nextSibling) {
            //             svgChart.insertBefore(ctx, nextSibling);
            //         } else {
            //             svgChart.appendChild(ctx);
            //         }
            //     }                
            // }  
                  

            if (
                foreignObject
                ) {
                    // p 
                    if (!_this.isDiffValue) {
                        ctx.setAttribute('style', `
                        font-size: ${strFontSize}; 
                        font-family: ${strFont};
                        color: ${color};
                        `);
                    } else {
                        ctx.setAttribute('style', `
                        font-size: ${strFontSize};
                        font-family: ${strFont};
                        color: ${color};
                        font-weight: bold;
                        `);
                    }

                    // if (_this.align === 0 || _this.align === 1 || _this.align === 2) {
                    //     StringTools.wordWrap(foreignObject, strX,  strY , _this.width);
                    // }else if (_this.align === 6 || _this.align === 7 || _this.align === 8) {
                    //     StringTools.wordWrap(foreignObject, strX, strY  , _this.width);
                    // }else {
                    //     StringTools.wordWrap(foreignObject, strX, _this.y - _this.height / 2 , _this.width);
                    // }
                } else {
                    if (!_this.isNeedMark) {
                        // ctx.fillText(str, strX, strY);
                        // ctx.textContent = str;
                        // ctx.setAttribute("x", strX );	  
                        // ctx.setAttribute("y", strY );
                    } else {
                        // ctx.strokeStyle = '#222';
                        // ctx.strokeText(str, strX, strY);
                        // ctx.setAttribute("stroke", '#222');
                        ctx.setAttribute("stroke", '#222');
                        // ctx.textContent = str;
                        // ctx.setAttribute("x", strX );
                        // ctx.setAttribute("y", strY );
                    }
                }
        }catch(e){
            console.error(e);
        }
        // ctx.restore();
        
    }
    
    function paintDiagNoticeBg() {
        if (!_this.alphaBg) _this.alphaBg = 1;

        if (!(_this.grade == 0 || _this.grade == undefined)) {
            if (_this.alphaBg < 0.3 || _this.alphaBg > 1) {
                _this.isFade = !_this.isFade;
            }
            _this.alphaBg = _this.isFade ? _this.alphaBg + 0.02 : _this.alphaBg - 0.02;
        }

        // ctx.save();
        try{
            // ctx.fillStyle = _this.bgColor;
            ctx.setAttribute("fill", _this.bgColor);
            ctx.globalAlpha = Number(_this.alphaBg).toFixed(2);
            // var tw = ctx.measureText(_this.value);
            var tw = ctx.getAttribute(_this.value);
            if (_this.width && tw.width < _this.width) {
                // CanvasGeometry.fillRadiusRect(ctx, _this.x - 5, Math.floor(_this.y - _this.height / 2) , tw.width + 12, _this.height, 3);
            } else {
                // CanvasGeometry.fillRadiusRect(ctx, _this.x - 5, Math.floor(_this.y - _this.height / 2) , tw.width -30, _this.height, 3);
            }
            ctx.fill();
        }catch(e){
            console.error(e);
        }
        // ctx.restore();
    }
}

// ModelText.prototype.drawBgImage = function(_this,ctx) {
//     var _this = this;

//     let imgWidthScale,imgHeightScale;
//     imgWidthScale = _this.width/_this.imgBg.width;
//     imgHeightScale = _this.height/_this.imgBg.height;

//   if (imgHeightScale && imgWidthScale) {
//     ctx.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})`);
//   }

//     ctx.setAttribute("href", _this.imgBg.src);
//     ctx.setAttribute("x", (parseInt(_this.x))/imgWidthScale);
//     ctx.setAttribute("y", (parseInt(_this.y))/imgHeightScale-_this.imgBg.height/2);
//     ctx.setAttribute("width", parseInt(_this.imgBg.width));
//     ctx.setAttribute("height", parseInt(_this.imgBg.height));
// }

//isNeedMark 暂时用于标记是否为温度梯度图
ModelText.prototype.update = function (value, isNeedMark) {
    
    this.isDiffValue = !(this.value == value);//对比新旧value差异
    if (this.value == '--') this.isDiffValue = false;
    this.isNeedMark = isNeedMark;
    //改变值前拿锁
    if(this._valueLock==false){
        this._valueLock= true; //占住锁
                    this.value = value;
        // console.info( 'update....' )
        
        this._valueLock = false;//释放锁
    }
    else{
        // console.info( "update:没拿到锁，跳过" )
        return false;//没拿到锁的话，本次update被跳过
    }

}

ModelText.prototype.updateDiagnosisGrade = function (grade) {
    this.grade = grade;
    switch (grade) {
        case 0: this.bgColor = '#5bc0de'; break;
        case 1: this.bgColor = '#f0ad4e'; break;
        case 2: this.bgColor = '#d9534f'; break;
        default: this.bgColor = '#d9534f'; break;
    }
}

// ModelText.prototype.hideTip = function () {
// $tooltip.style.display='none'
    
// }



/**
 * 创建工具浮动框
 */
ModelText.prototype.createTooltip = function (pointName,readWrite,description,singleValue,singleFlag) {
    var _this = this;
    var template, $template = $tooltip;
    var parser;
    var state = store.getState()  //获取到全局store树
    this.rw = readWrite
    if (singleFlag == true) {
        this.sourceType = undefined
    }
    if(this.description == undefined || this.sourceType == undefined || this.rw == undefined){
        let pointList = JSON.parse(localStorage.getItem('allPointList'))
        if (pointList != null) {
            pointList.map(item=>{
                if(pointName == item.name){
                    this.description = item.description 
                    this.sourceType = item.sourceType
                    this.rw = item.RW
                }
            })
        }
    }
    if(this.sourceType == undefined){
        this.description = '点表中不存在该点名'
    }
    // true 为已添加 false 未添加
    var isAdded = state.history.points
                    .map( point=> point.name )
                    .some( name => name === pointName )

    if (!$template) {
        template = this.tooltipTemplate;
        parser = new DOMParser();
        $template = parser.parseFromString(template, "text/html").querySelector('.observer-text-tooltip');
        // 进入tooltip浮动框
        $template.onmouseover = function (e) {
           
        };
        $template.onmouseout = function (e) {
           
        }; 
        $template.ontransitionend = function (e) {
            if (e.propertyName === 'opacity' && e.target.style.opacity === '0') {
                e.target.style.display = 'none';
            }
            e.stopPropagation();
        };
        $template.style.maxWidth = null;
        $template.style.opacity = configMap.textTooltipOpacity;
        $template.style.zIndex = configMap.textTooltipZIndex;
        $template.style.display = 'none';

        let elemTooltipInner = $template.querySelector('.tooltip-inner');
        elemTooltipInner.maxWidth = null;
        elemTooltipInner.opacity = configMap.textTooltipOpacity;
        elemTooltipInner.backgroundColor = configMap.textTooltipBackgroundColor;
        document.querySelector('body').appendChild($template);
    }
    var DomLinkAddToHistory = $template.querySelector('.linkAddToHistory')
    DomLinkAddToHistory.style.color = '#0091FF'
    // DomLinkAddToHistory.style.cursor= 'pointer'
    if(isAdded){
        DomLinkAddToHistory.style.color= '#747474'
    } 
    DomLinkAddToHistory.onclick = function (e) {
        if(typeof _this.options.getToolPoint == 'function'){
            if(!isAdded){
                _this.options.getToolPoint([pointName])
                isAdded = true
                DomLinkAddToHistory.style.color= '#747474'
            }
        }
        _this.hidden()
        e.preventDefault();
        e.stopPropagation();
    }
    $template.querySelector('.linkAddToTendency').onclick = function (e) {
        if(typeof _this.options.getTendencyModal == 'function'){
            _this.options.getTendencyModal(
                pointName,
                _this.description
            )
        }
        _this.hidden()
        e.preventDefault();
        e.stopPropagation();
    }

     //多点名切换下一个
     $template.querySelector('.nextPoint').onclick = function (e) {
        if (tooltipPointList.length >(pointIndex+1)) {
            pointIndex++;
            let singleName = tooltipPointList[pointIndex]
            http.post('/analysis/get_point_info_from_s3db',{
                "pointList": [singleName]
            }).then(data=>{
                if(data.err==0){
                    $tooltip = _this.createTooltip(singleName,_this.readWrite,_this.description,data.data.realtimeValue[0].value,true);
      
                    tooltip.show(_this.rw,singleName,_this.idCom)
                }else{
                    $tooltip = _this.createTooltip(singleName,_this.readWrite,"","",true);
      
                    tooltip.show(_this.rw,singleName,_this.idCom)
                }
            })
            .catch(err=>{
                $tooltip = _this.createTooltip(singleName,_this.readWrite,"","",true);

                tooltip.show(_this.rw,singleName,_this.idCom)
            })
        };
        e.preventDefault();
        e.stopPropagation();
    }

    //多点名切换上一个
    $template.querySelector('.lastPoint').onclick = function (e) {
        if (pointIndex>0) {
            pointIndex--;
            let singleName = tooltipPointList[pointIndex]
            http.post('/analysis/get_point_info_from_s3db',{
                "pointList": [singleName]
            }).then(data=>{
                if(data.err==0){
                    $tooltip = _this.createTooltip(singleName,_this.readWrite,data.data.realtimeValue[0].description,data.data.realtimeValue[0].value,true);
      
                    tooltip.show(_this.rw,singleName,_this.idCom)
                }else{
                    $tooltip = _this.createTooltip(singleName,_this.readWrite,"","",true);
      
                    tooltip.show(_this.rw,singleName,_this.idCom)
                }
            })
            .catch(err=>{
                $tooltip = _this.createTooltip(singleName,_this.readWrite,"","",true);

                tooltip.show(_this.rw,singleName,_this.idCom)
            })
        }
        e.preventDefault();
        e.stopPropagation();
    }

    //指令记录查询功能
    $template.querySelector('.linkAddToValueLog').onclick = function (e) {
        store.dispatch(showCommandLogModal(pointName))
        _this.hidden()
        e.preventDefault();
        e.stopPropagation();
    }

    // 复制点名
    $template.querySelector('.copy').onclick = function(e){
        let first = document.getElementById("first")
        let three = document.getElementById("three");
        three.value = first.innerText
        three.select(); // 选择对象
        document.execCommand("Copy"); // 执行
    }
    //复制点值
    $template.querySelector('.copyValue').onclick = function(e){
        let first = document.getElementById("first")
        let four = document.getElementById("three");
        if (singleValue !=undefined) {
            four.value = singleValue
        }else {
            four.value = _this.value
        }
        
        four.select();
        document.execCommand("Copy"); // 执行
    }
    // $template.querySelector('.readWrite').onclick = function(e){
    //     if(typeof _this.options.showOptimizeModal === 'function'){
    //         _this.options.showOptimizeModal({
    //             idCom:_this.idCom,
    //             value:_this.value
    //         })
    //     }else if (typeof _this.options.showOperatingTextModal === 'function') {
    //         _this.options.showOperatingTextModal({
    //             idCom:_this.idCom,
    //             value:_this.value
                
    //         })
    //     }
    // }
    $template.querySelector('.linkAddAlert').onclick = function (e) {
        
        // morgan发现，这才是真正决定报警弹窗显示的主函数 
        if(typeof _this.options.showMainInterfaceModal === 'function'){
            _this.options.showMainInterfaceModal({
                pointName : pointName,
                description : _this.description
            })
        }else{
            if(typeof _this.options.showCommomAlarm == 'function'){
                _this.options.showCommomAlarm({
                    pointName : pointName,
                    description : _this.description
                })
            }
        }
        _this.hidden()
        e.preventDefault();
        e.stopPropagation();
    }

    //取消按钮
    $template.querySelector('.cancel').onclick = function (e) {
        _this.hidden()
        e.preventDefault();
        e.stopPropagation();
    }
    $template.querySelector('.pointName').textContent = pointName;
    $template.querySelector('.pointName').title = pointName;
    $template.querySelector('.description').textContent = this.description;
    $template.querySelector('.sourceType').textContent = '点类型：'+this.sourceType;
    $template.querySelector('.readWrite').style.color='#f00'

    // if (this.idCom === undefined ) {
    //     template.hidden();  
    // }
    // if(readWrite){
    //     $template.querySelector('.readWrite').textContent = '编辑'
    // }else{
    //     $template.querySelector('.readWrite').textContent = ''
    // }
    $template.dataset.dsId = '@'+appConfig.project.id+'|'+this.idCom;
    return $template;
}

ModelText.prototype.checkPopoverBoundary = function ($popover,offsetX, offsetY) {
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
        popoverXOffset = popoverX > documentWidth ? offsetX - popoverWidth - 20 : offsetX + 15; 
        popoverYOffset = offsetY < 94 ? offsetY + 48 : offsetY + 10;
        if(popoverY > documentHeight) popoverYOffset = offsetY - popoverHeight;
        $popover.style.left = popoverXOffset;
        $popover.style.top = popoverYOffset;
}
var timeout = null
// tooltip.hide()
// ModelText.prototype.mouseOver = function (event,isInfo){
//     var _this = this;
//     var data, dataNew, modelType;
//     var requestDataNew = [];
//     if (!cachedContainerStyle) {
//         cachedContainerStyle = window.getComputedStyle(document.querySelector('body'));
//     }
//     var documentWidth = parseInt(cachedContainerStyle.width),
//         documentHeight = parseInt(cachedContainerStyle.height);
//     // if (_this.enableTooltip) {
//     //     // prevent inner elements bubble events
//     //     if (_this.isInMouserOver) return;
//     //     if (!this.idCom) return;
//         $tooltip = this.createTooltip(this.idCom,this.readWrite,this.description);
//         //    tooltip.hide();
//     //     timeout = window.setTimeout(function(){
//     //         tooltip.show();
//             //  if (isInfo.isInModal){ //在模态框里
//             //      event.stopPropagation()
//             //     _this.checkPopoverBoundary($tooltip, event.offsetX - 40 + (documentWidth-isInfo.pageWidth)/2 , event.offsetY-40+(documentHeight-isInfo.pageHeight)/2 );
//             //  }else{
//             //     event.stopPropagation()
//             //     _this.checkPopoverBoundary($tooltip, event.offsetX, event.offsetY);
//             //  }
//     //     },2000)
//     //     this.isInMouserOver = true;
//     // }
// }


ModelText.prototype.mouseOut = function (event) {
    // var _this = this;
    // if (this.enableTooltip){
        // clearTimeout(timeout);
        // window.setTimeout(function(){
        //     tooltip.hide()
        // },1000)
        // this.isInMouserOver = false;
    // }
}

ModelText.prototype.mouseUp = function(event){
        // tooltip.show()
}
ModelText.prototype.showModal = function(event,isInfo,widthScale,heightScale){
    
    var _this = this;
    if (!cachedContainerStyle) {
        cachedContainerStyle = window.getComputedStyle(document.querySelector('body'));
    }
    var documentWidth = parseInt(cachedContainerStyle.width),
        documentHeight = parseInt(cachedContainerStyle.height); 

    if (this.idCom != undefined) {
        if (this.idCom.match(/,/)) {
            //绑定多点，支持浮动框切换显示
            flag = true;
            tooltipPointList = this.idCom.split(',');
            if (tooltipPointList.length >0) {
                pointIndex = 0;
                let singleName = tooltipPointList[0]
                http.post('/analysis/get_point_info_from_s3db',{
                    "pointList": [singleName]
                }).then(data=>{
                    if(data.err==0){
                        $tooltip = _this.createTooltip(singleName,_this.readWrite,data.data.realtimeValue[0].description,data.data.realtimeValue[0].value,true);
          
                        tooltip.show(_this.rw,singleName,_this.idCom);
                        if (isInfo.isInModal){ //在模态框里
                            event.stopPropagation()
                           _this.checkPopoverBoundary($tooltip, (event.layerX/widthScale - 30 + (documentWidth-isInfo.pageWidth)/2)*widthScale , (event.layerY/heightScale-40+(documentHeight-isInfo.pageHeight)/2)*heightScale );
                        }else{
                            event.stopPropagation()
                           if(event.clientX==null||event.clientY==null){
                               _this.checkPopoverBoundary($tooltip, event.offsetX + 5, event.offsetY + 50);
                           }else{
                               _this.checkPopoverBoundary($tooltip, event.clientX, event.clientY - 30);
                           }
                           
                        }
                    }else{
                        $tooltip = _this.createTooltip(singleName,_this.readWrite,"","",true);
          
                        tooltip.show(_this.rw,singleName,_this.idCom);
                        if (isInfo.isInModal){ //在模态框里
                            event.stopPropagation()
                           _this.checkPopoverBoundary($tooltip, (event.layerX/widthScale - 30 + (documentWidth-isInfo.pageWidth)/2)*widthScale , (event.layerY/heightScale-40+(documentHeight-isInfo.pageHeight)/2)*heightScale );
                        }else{
                            event.stopPropagation()
                           if(event.clientX==null||event.clientY==null){
                               _this.checkPopoverBoundary($tooltip, event.offsetX + 5, event.offsetY + 50);
                           }else{
                               _this.checkPopoverBoundary($tooltip, event.clientX, event.clientY - 30);
                           }
                           
                        }
                    }
                })
                .catch(err=>{
                    $tooltip = _this.createTooltip(singleName,_this.readWrite,"","",true);
    
                    tooltip.show(_this.rw,singleName,_this.idCom);
                    if (isInfo.isInModal){ //在模态框里
                        event.stopPropagation()
                       _this.checkPopoverBoundary($tooltip, (event.layerX/widthScale - 30 + (documentWidth-isInfo.pageWidth)/2)*widthScale , (event.layerY/heightScale-40+(documentHeight-isInfo.pageHeight)/2)*heightScale );
                    }else{
                        event.stopPropagation()
                       if(event.clientX==null||event.clientY==null){
                           _this.checkPopoverBoundary($tooltip, event.offsetX + 5, event.offsetY + 50);
                       }else{
                           _this.checkPopoverBoundary($tooltip, event.clientX, event.clientY - 30);
                       }
                       
                    }
                })
            }
            
        } else {
            //绑定单点显示
            tooltipPointList = [];
            flag = false;
            $tooltip = this.createTooltip(this.idCom,this.readWrite,this.description);
          
            tooltip.show(this.rw,this.idCom);
            if (isInfo.isInModal){ //在模态框里
                event.stopPropagation()
               _this.checkPopoverBoundary($tooltip, (event.layerX/widthScale - 30 + (documentWidth-isInfo.pageWidth)/2)*widthScale , (event.layerY/heightScale-40+(documentHeight-isInfo.pageHeight)/2)*heightScale );
            }else{
                event.stopPropagation()
               if(event.clientX==null||event.clientY==null){
                   _this.checkPopoverBoundary($tooltip, event.offsetX + 5, event.offsetY + 50);
               }else{
                   _this.checkPopoverBoundary($tooltip, event.clientX, event.clientY - 30);
               }
               
            }
        }
    }
    
}
ModelText.prototype.hidden = function (event) {
    tooltip.hide()
    
}

// static
ModelText.destroy = function () {
    if (tooltipTimer) {
        clearTimeout(timeout)
        clearTimeout(tooltipTimer);        
        tooltipTimer = null;
    }
    if ($tooltip !== null) {
        $tooltip.parentNode.removeChild($tooltip);
        $tooltip = null;
        clearTimeout(timeout)        
    }
    if (cachedContainerStyle) {
        cachedContainerStyle = null;
        clearTimeout(timeout)        
    }
};

export default ModelText;


