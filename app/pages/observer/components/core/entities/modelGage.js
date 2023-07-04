import appConfig from '../../../../../common/appConfig';
import { Sprite } from '../sprites';



function ModelGage(id, painter, behaviors,type) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    
    this.value = -1;
    this.maxValue = 1.5;
    this.minValue = 0;
    this.idCom = undefined;
    this.layer = undefined;
    this.type = undefined;
    this.decimal = undefined;
    this.fontColor = undefined;
    

    this.imgMeterPan = new Image();
    this.imgMeterPan.src = appConfig.serverUrl + `/static/images/meterpan_p${type}.png`;
    this.imgMeterPointer = new Image();
    this.imgMeterPointer.src = appConfig.serverUrl + `/static/images/meterpointer_0${type}.png`;

    this.gagesImage = undefined;  //表盘
    this.pointerImage = undefined;  //指针
    this.gagesValue = undefined;  //值

};

ModelGage.prototype = new Sprite();

ModelGage.prototype.close = function () {

}

ModelGage.prototype.paint = function (ctx) {
     var _this = this;
     if (this.imgMeterPan != undefined) {
       if (this.imgMeterPan.complete) {
         this.drawMeterPan(this, this.gagesImage);
       } else {

         this.imgMeterPan.onload = function (e) {
           _this.drawMeterPan(_this, _this.gagesImage);
         };
       }
     }

     if (this.imgMeterPointer != undefined) {
       if (this.imgMeterPointer.complete) {
         this.drawMeterPointer(this, this.pointerImage);
       } else {
         this.imgMeterPointer.onload = function (e) {
           _this.drawMeterPointer(_this, _this.pointerImage);
         };
       }
     }
     
        this.drawGageValue(this, this.gagesValue);
    
}

ModelGage.prototype.drawMeterPan = function(_this, ctx) {
     if ((!_this.width) || (!_this.height)) {
       _this.width = _this.imgMeterPan.width;
       _this.height = _this.imgMeterPan.height;
     }
    let imgWidthScale = 1,
      imgHeightScale = 1;
    if (_this.width !== _this.imgMeterPan.width && _this.imgMeterPan.width >0) {
      imgWidthScale = _this.width / _this.imgMeterPan.width;
    }

    if (_this.height !== _this.imgMeterPan.height && _this.imgMeterPan.height >0) {
      imgHeightScale = _this.height / _this.imgMeterPan.height;
    }

    if (imgHeightScale && imgWidthScale) {
      ctx.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})`);
    }

    ctx.setAttribute("href", _this.imgMeterPan.src);
    ctx.setAttribute("x", parseInt(_this.x) / imgWidthScale);
    ctx.setAttribute("y", parseInt(_this.y) / imgHeightScale);
    ctx.setAttribute("width", parseInt(_this.imgMeterPan.width));
    ctx.setAttribute("height", parseInt(_this.imgMeterPan.height));
}

ModelGage.prototype.drawMeterPointer = function (_this, ctx) {
    //draw pointer
    if(_this.type === 0 || _this.type === 1) {
      var maxValueAsAngle = Math.PI / 2.0 * 3.0;
      var minValueAsAngle = Math.PI / 2.0;
    } else {
      //type为2和3时指针最小最大角度分别为40和320
      var maxValueAsAngle = Math.PI / 4.5 * 8.08;
      var minValueAsAngle = Math.PI / 4.5*0.92;
    }
    
    var curValueAngle = 0.0;
    if (Number(_this.value) > _this.maxValue) {
        curValueAngle = maxValueAsAngle;
    } else if (Number(_this.value) < _this.minValue) {
        curValueAngle = minValueAsAngle;
    } else {
        if (_this.maxValue > _this.minValue) {
            curValueAngle = minValueAsAngle + (maxValueAsAngle - minValueAsAngle) / (_this.maxValue - _this.minValue) * (_this.value - _this.minValue);
        }
    }

    if ((!_this.width) || (!_this.height)) {
       _this.width = _this.imgMeterPointer.width;
       _this.height = _this.imgMeterPointer.height;
    }
    let imgWidthScale = 1,
      imgHeightScale = 1;
    if (_this.width !== _this.imgMeterPointer.width) {
      imgWidthScale = _this.width / (_this.imgMeterPointer.width*8);
    }
    if (_this.height !== _this.imgMeterPointer.height) {
      imgHeightScale = _this.height / (_this.imgMeterPointer.height*4);
    }
    ctx.setAttribute("href", _this.imgMeterPointer.src);
    ctx.setAttribute("x", parseInt(_this.x) / imgWidthScale  + _this.imgMeterPointer.width*3.5);
    ctx.setAttribute("y", parseInt(_this.y) / imgHeightScale + _this.imgMeterPointer.height*1.75);
    ctx.setAttribute("width", parseInt(_this.imgMeterPointer.width));
    ctx.setAttribute("height", parseInt(_this.imgMeterPointer.height));
    ctx.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})
            rotate(${curValueAngle*180/Math.PI} ${parseInt(_this.x) / imgWidthScale  + _this.imgMeterPointer.width*4} ${parseInt(_this.y) / imgHeightScale + _this.imgMeterPointer.height*2})
              `);
}

ModelGage.prototype.drawGageValue = function(_this, ctx) {
  if ((!_this.width) || (!_this.height)) {
    _this.width = _this.imgMeterPan.width;
    _this.height = _this.imgMeterPan.height;
  }
 let imgWidthScale = 1,
   imgHeightScale = 1;
 if (_this.width !== _this.imgMeterPan.width && _this.imgMeterPan.width != 0) {
   imgWidthScale = _this.width / _this.imgMeterPan.width;
 }

 if (_this.height !== _this.imgMeterPan.height && _this.imgMeterPan.height != 0) {
   imgHeightScale = _this.height / _this.imgMeterPan.height;
 }

 if (imgHeightScale && imgWidthScale) {
   ctx.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})`);
 }
 let curValue=Number(_this.value),textColor;
 //处理小数位数
 if (curValue !== 0) {
  curValue = Number(curValue).toFixed(_this.decimal);
 } else {
  curValue = curValue;
 }

 //对传来的颜色进行处理
 textColor = `rgba(${_this.fontColor & 0xff}, ${_this.fontColor >> 8 & 0xff}, ${_this.fontColor >> 16 & 0xff })`;
  
 //type 为0 1时
 if(_this.type === 0 || _this.type === 1) {
  ctx.setAttribute("x", parseInt(_this.x) / imgWidthScale + _this.imgMeterPan.width*0.5);
  ctx.setAttribute("y", parseInt(_this.y) / imgHeightScale +_this.imgMeterPan.height*0.711);
  ctx.setAttribute("font-size", '18px');
 } else {
  ctx.setAttribute("x", parseInt(_this.x) / imgWidthScale + _this.imgMeterPan.width*0.5);
  ctx.setAttribute("y", parseInt(_this.y) / imgHeightScale +_this.imgMeterPan.height*0.782);
  ctx.setAttribute("font-size", '36px');
 }
 

 ctx.setAttribute("fill", `${textColor}`);
 ctx.setAttribute("text-anchor", 'middle');
 ctx.setAttribute("dominant-baseline", 'middle');
 ctx.textContent = curValue;
}



ModelGage.prototype.renderGage = function (_this) {
       if (this.imgMeterPan != undefined) {
         if (this.imgMeterPan.complete) {
           this.drawMeterPan(this, this.gagesImage);
         } else {

           this.imgMeterPan.onload = function (e) {
             _this.drawMeterPan(_this, _this.gagesImage);
           };
         }
       }

    if (this.imgMeterPointer != undefined) {
        if (this.imgMeterPointer.complete) {
            this.drawMeterPointer(this, this.pointerImage);
        } else {
            this.imgMeterPointer.onload = function (e) {
                _this.drawMeterPointer(_this, _this.pointerImage);
            };
        }
    }
        this.drawGageValue(this, this.gagesValue);
     
}

ModelGage.prototype.update = function (value)
{
    if (value == this.value) return;
    this.value = value;
    this.renderGage();
}

export default ModelGage;
