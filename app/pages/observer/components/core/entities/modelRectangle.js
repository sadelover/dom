import { Sprite } from '../sprites';

function ModelRectangle(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    this.layer = null;
    this.color = null;
    this.fillOrNot = null;
    this.lineWidth = null;
    this.fillColor = null;
    this.roundOrNot = null;
    this.roundXPox = null;
    this.roundYPox = null;

    this.rectangle = undefined;
};

ModelRectangle.prototype = Object.create(Sprite.prototype);

ModelRectangle.prototype.paint = function (ctx) {
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

ModelRectangle.prototype.mouseEnter = function () {
},

ModelRectangle.prototype.mouseOut = function () {
}

ModelRectangle.prototype.mouseDown = function () {
}

export default ModelRectangle;
