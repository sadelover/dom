import appConfig from '../../../../../common/appConfig';
import { Sprite } from '../sprites';

function ModelLiquidLevel(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    
    this.value = 0;
    this.maxAlarm = 1.5;
    this.minAlarm = 0;
    this.minValue = 0;
    this.maxValue = 0;
    this.layer = undefined;
    this.bindPointName = undefined;

    this.imgLiquidLevelOut = new Image();
    this.imgLiquidLevelOut.src = appConfig.serverUrl + `/static/images/liquidLevelO.png`;
    
    this.imgLiquidLevelIn = new Image();
    this.imgLiquidLevelIn.src = appConfig.serverUrl + `/static/images/liquidLevelI.png`;

    this.liquidLevelsOutImage = undefined;
    this.liquidLevelsInImage = undefined;

};

ModelLiquidLevel.prototype = new Sprite();

ModelLiquidLevel.prototype.close = function () {

}

ModelLiquidLevel.prototype.paint = function (ctx) {
     var _this = this;
     if (this.imgLiquidLevelOut != undefined) {
       if (this.imgLiquidLevelOut.complete) {
        //  this.drawLiquidLevelOut(this, this.liquidLevelsOutImage);
       } else {

         this.imgLiquidLevelOut.onload = function (e) {
           _this.drawLiquidLevelOut(_this, _this.liquidLevelsOutImage);
         };
       }
     }
     if (this.imgLiquidLevelIn != undefined) {
      //complete加载状态，在IE浏览器可用，goolge即使加载失败，还会返回true，所以不可用
       if (this.imgLiquidLevelIn.complete) {
        //  this.drawLiquidLevelIn(this, this.liquidLevelsInImage);
       } else {

         this.imgLiquidLevelIn.onload = function (e) {
           _this.drawLiquidLevelIn(_this, _this.liquidLevelsInImage);
         };
       }
     }
}

ModelLiquidLevel.prototype.drawLiquidLevelOut = function (_this, ctx) {
     if ((!_this.width) || (!_this.height)) {
       _this.width = _this.imgLiquidLevelOut.width;
       _this.height = _this.imgLiquidLevelOut.height;
     }
    let imgWidthScale = 1,
      imgHeightScale = 1;
    if (_this.width !== _this.imgLiquidLevelOut.width) {
      imgWidthScale = _this.width / _this.imgLiquidLevelOut.width;
    }

    if (_this.height !== _this.imgLiquidLevelOut.height) {
      imgHeightScale = _this.height / _this.imgLiquidLevelOut.height;
    }

    if (imgHeightScale && imgWidthScale) {
      ctx.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale})`);
    }

    ctx.setAttribute("href", _this.imgLiquidLevelOut.src);
    ctx.setAttribute("x", parseInt(_this.x) / imgWidthScale);
    ctx.setAttribute("y", parseInt(_this.y) / imgHeightScale);
    ctx.setAttribute("width", parseInt(_this.imgLiquidLevelOut.width));
    ctx.setAttribute("height", parseInt(_this.imgLiquidLevelOut.height));
}

ModelLiquidLevel.prototype.drawLiquidLevelIn = function (_this, ctx) {
     if ((!_this.width) || (!_this.height)) {
       _this.width = _this.imgLiquidLevelIn.width;
       _this.height = _this.imgLiquidLevelIn.height;
     }
    let imgWidthScale = 1,
      imgHeightScale = 1;
    

    if (_this.width !== _this.imgLiquidLevelIn.width) {
      imgWidthScale = _this.width / _this.imgLiquidLevelIn.width;
    }

    if (_this.height !== _this.imgLiquidLevelIn.height) {
      imgHeightScale = _this.height / _this.imgLiquidLevelIn.height;
    }
    if (Number(_this.value) > _this.maxAlarm || Number(_this.value) < _this.minAlarm) {
          this.imgLiquidLevelIn.src = appConfig.serverUrl + `/static/images/liquidLevelAlarmIn3.png` ? appConfig.serverUrl + `/static/images/liquidLevelAlarmIn3.png` : "";
    } else {
        this.imgLiquidLevelIn.src = appConfig.serverUrl + `/static/images/liquidLevelI.png` ? appConfig.serverUrl + `/static/images/liquidLevelI.png` : "";
    }
    var scaleNum = _this.height/60+1;
    var HeightScale = 1 / scaleNum * ((_this.value - _this.minValue) / ((_this.maxValue - _this.minValue) / scaleNum));

  if(_this.value>=_this.minValue) {
    if (imgHeightScale && imgWidthScale) {
      ctx.setAttribute('transform', `scale(${imgWidthScale}, ${imgHeightScale*HeightScale})`);
    }
    
      ctx.setAttribute("href", _this.imgLiquidLevelIn.src);
      ctx.setAttribute("x", parseInt(_this.x) / imgWidthScale);
      ctx.setAttribute("y", parseInt(_this.y) / imgHeightScale / HeightScale + _this.height / imgHeightScale / HeightScale * (1 - HeightScale));
      ctx.setAttribute("width", parseInt(_this.imgLiquidLevelIn.width));
      ctx.setAttribute("height", parseInt(_this.imgLiquidLevelIn.height));
    }
}

ModelLiquidLevel.prototype.renderLiquidLevel = function (_this) {
  
       if (this.imgLiquidLevelIn != undefined) {
         if (this.imgLiquidLevelIn.complete) {
          //  this.drawLiquidLevelIn(this, this.liquidLevelsInImage);
         } else {

           this.imgLiquidLevelIn.onload = function (e) {
             _this.drawLiquidLevelIn(_this, _this.liquidLevelsInImage);
           };
         }
       }
       if (this.imgLiquidLevelOut != undefined) {
         if (this.imgLiquidLevelOut.complete) {
          //  this.drawLiquidLevelOut(this, this.liquidLevelsOutImage);
         } else {

           this.imgLiquidLevelOut.onload = function (e) {
             _this.drawLiquidLevelOut(_this, _this.liquidLevelsOutImage);
           };
         }
       }
}

ModelLiquidLevel.prototype.update = function (value)
{
    if (value == this.value) return;
    this.value = value;
    this.renderLiquidLevel();
}

export default ModelLiquidLevel;
