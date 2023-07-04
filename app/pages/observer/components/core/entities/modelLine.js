import { Sprite } from '../sprites';

function ModelLine(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.x1 = null;
    this.y1 = null;
    this.x2 = null;
    this.y2 = null;
    this.color = null;
    this.lineType = null;
    this.layer = null;
    this.lineWidth = null;
    this.line = undefined;
};

ModelLine.prototype = Object.create(Sprite.prototype);

ModelLine.prototype.paint = function (ctx) {
    try{
        ctx.setAttribute("stroke-width", this.lineWidth);
        if(this.lineType == 1){
            ctx.setAttribute("stroke-dasharray", [20,5]); 
        }
        if(this.lineType == 2){
            ctx.setAttribute("stroke-dasharray", [5]); 
        }
        if(this.lineType == 3){
            ctx.setAttribute("stroke-dasharray", [5,5,20,5]); 
        }
        if(this.lineType == 4){
            ctx.setAttribute("stroke-dasharray", [5,5,5,5,20,5]); 
        }
        ctx.setAttribute("x1", this.x1);
        ctx.setAttribute("y1", this.y1);
        ctx.setAttribute("x2", this.x2);
        ctx.setAttribute("y2", this.y2);
        ctx.setAttribute("stroke", this.color);
    }
    catch(e){
        console.error(e);
    }
},

ModelLine.prototype.mouseEnter = function () {
},

ModelLine.prototype.mouseOut = function () {
}

ModelLine.prototype.mouseDown = function () {
}

export default ModelLine;
