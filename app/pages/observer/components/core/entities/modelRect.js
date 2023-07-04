import { Sprite } from '../sprites';

function ModelRect(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    this.layer = null;

    this.lineStyle = [6];

    this.rect = undefined;
};

ModelRect.prototype = Object.create(Sprite.prototype);

ModelRect.prototype.paint = function (ctx) {
    try{
        ctx.setAttribute("stroke-dasharray", [6]);
        ctx.setAttribute("stroke-width", "4");
        ctx.setAttribute("x", this.x);
        ctx.setAttribute("y", this.y);
        ctx.setAttribute("width", this.width);
        ctx.setAttribute("height", this.height);
        ctx.setAttribute("fill", "rgb(255,255,255,0)");
        ctx.setAttribute("stroke", "rgb(0,0,0,1)");
    }
    catch(e){
        console.error(e);
    }
},

ModelRect.prototype.mouseEnter = function () {
},

ModelRect.prototype.mouseOut = function () {
}

ModelRect.prototype.mouseDown = function () {
}

export default ModelRect;
