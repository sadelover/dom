import { Sprite } from '../sprites';

function ModelStartLine(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.layer = null;
    this.cx = null;
    this.cy = null;
    this.startSize = null;
    this.color = null;
    this.circle = undefined;
};

ModelStartLine.prototype = Object.create(Sprite.prototype);

ModelStartLine.prototype.paint = function (ctx) {

    try{
        ctx.setAttribute("cx", this.cx);
        ctx.setAttribute("cy", this.cy);
        ctx.setAttribute("r", this.startSize);
        ctx.setAttribute("fill", this.color);
    }
    catch(e){
        console.error(e);
    }
},

ModelStartLine.prototype.mouseEnter = function () {
},

ModelStartLine.prototype.mouseOut = function () {
}

ModelStartLine.prototype.mouseDown = function () {
}

export default ModelStartLine;
