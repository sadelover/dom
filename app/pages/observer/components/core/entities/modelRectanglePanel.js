import { Sprite } from '../sprites';
import  ModelText from './modelText';
import http from '../../../../../common/http';

function ModelRectanglePanel(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    this.layer = null;
    // this.color = null;
    this.fillOrNot = null;
    this.lineWidth = null;
    this.fillColor = null;
    this.roundOrNot = null;
    this.roundXPox = null;
    this.roundYPox = null;
    this.bodySize = null; //正文字体大小
    this.bodyColor = null;//正文字体颜色
    this.descColor = null;//注释字体颜色
    this.descOrNot = null;//是否有注释，1:有，0:没有
    this.descSize = null;//注释字体大小
    this.title = null;//标题
    this.titleSize = null;//标题字体大小
    this.titleColor = null;//标题字体颜色
    this.pointList = null;//点名；图片ID
    this.rectStyle = null;//矩形面板类型

    this.rectangle = undefined;
};

ModelRectanglePanel.prototype = Object.create(Sprite.prototype);

ModelRectanglePanel.prototype.paint = function (ctx) {
    try{
        ctx.setAttribute("stroke-width", this.lineWidth);
        ctx.setAttribute("x", this.x);
        ctx.setAttribute("y", this.y);
        ctx.setAttribute("width", this.width);
        ctx.setAttribute("height", this.height);
        ctx.setAttribute("stroke", this.color); //边框颜色
        if (this.fillOrNot) {
            if(this.fillColor){
                ctx.setAttribute("fill", this.fillColor);  
            }else{
                ctx.setAttribute("fill", this.color);  
            }
        }else {
            ctx.setAttribute("fill", "none");
        }
        if (this.roundOrNot) {
            ctx.setAttribute("rx", this.roundXPox);
            ctx.setAttribute("ry", this.roundYPox);
        }
    }
    catch(e){
        console.error(e);
    }
},

ModelRectanglePanel.prototype.mouseEnter = function () {
},

ModelRectanglePanel.prototype.mouseOut = function () {
}

ModelRectanglePanel.prototype.mouseDown = function () {
}

export default ModelRectanglePanel;
