import { Sprite } from '../sprites';

function ModelEndLine(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.layer = null;
    this.cx = null;
    this.cy = null;
    this.color = null;
    this.endSize = null;

    this.circle = undefined;
};

ModelEndLine.prototype = Object.create(Sprite.prototype);

ModelEndLine.prototype.paint = function (ctx) {
    try{
     
        ctx.setAttribute("cx", this.cx);
        ctx.setAttribute("cy", this.cy);
        ctx.setAttribute("r", this.endSize);
        ctx.setAttribute("fill", this.color);
    }
    catch(e){
        console.error(e);
    }
},

ModelEndLine.prototype.mouseEnter = function () {
},

ModelEndLine.prototype.mouseOut = function () {
}

ModelEndLine.prototype.mouseDown = function () {
}

export default ModelEndLine;
