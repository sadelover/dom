export function HitModel(canvas) {
    this.list = {};
    this.scaleX = 1;
    this.scaleY = 1;
    this.scaleBoxX = undefined;
    this.scaleBoxY = undefined;
    this.rectLeft = undefined;
    this.rectTop = undefined;
    this.currentId = undefined;

    this.canvas = canvas;
    this.setScale(canvas); 
}

HitModel.prototype = {
    //获取鼠标碰撞体积
    add: function (id, type, x, y, width, height, layer, link) {
        if (!this.list[type]) this.list[type] = {};
        this.list[type][id] = {
            startX: x,
            startY: y,
            endX: x + width,
            endY: y + height,
            layer: layer,
            link: link
        };
    },

    clear: function () {
        this.list = {};
    },

    remove: function (type, id) {
        if (arguments.length === 1) {
            if (this.list[type]) {
                this.list[type] = null;
            }
        } else if (arguments.length > 1) {
            if (this.list[type] && this.list[type][id]) {
                this.list[type][id] = null;
            }
        }
    },

    isHit: function (x, y, hitModel) {
        if (!(x && y)) return false;
        if (hitModel.startX > x || x > hitModel.endX) return false;
        if (hitModel.startY > y || y > hitModel.endY) return false;
        return true;
    },

    //type = null: traverse all type, else traverse the specified type
    //获取点击图元的id和type
    firstHitId: function (_x, _y, _type) {
        var obj = this.convertToCanvasPosition(_x, _y);
        if (_type) {
            for (var key in this.list[_type]) {
                if (this.isHit(obj.x, obj.y, this.list[_type][key])) {
                    return { id: key, type: _type };
                }
            }
        } else {
            for (var type in this.list) {
                var objArr = Object.keys(this.list)
                var arr = [] 
                for (var key in this.list[type]) {
                    if (this.list[type][key].layer === undefined) {
                        if (this.isHit(obj.x, obj.y, this.list[type][key])) {
                            return { id: key, type: type };
                        }
                    }else {
                        if (this.isHit(obj.x, obj.y, this.list[type][key]) && this.list[type][key].link != undefined) {
                            arr.push({id: key, type: type, layer:this.list[type][key].layer})
                            //return { id: key, type: type };
                        }
                    }
                }
                if (objArr[objArr.length-1] === type) {
                     if (arr.length === 0) {
                        return null
                    }else {
                        if (arr.length === 1) {
                            return(arr[0])
                        }else {
                            if (arr.length > 1) {
                                var k = 0
                                for (var i =0;i<arr.length-1;i++) {
                                    k = i
                                    if (arr[k].layer < arr[i+1].layer) {
                                        k = i+1
                                    }
                                }
                                return (arr[k])
                            }
                        }
                    }
                }               
               
            }
        }
        return null;
    },

    setScale: function (canvas) {
        var rect = canvas.getBoundingClientRect();
        this.scaleBoxX = canvas.width / rect.width;
        this.scaleBoxY = canvas.height / rect.height;

        this.rectLeft = rect.left * this.scaleBoxX;
        this.rectTop = rect.top * this.scaleBoxY;
    },

    convertToCanvasPosition: function (x, y) {
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: (x - rect.left - this.canvas.scrollLeft) * this.scaleX,
            y: (y - rect.top - this.canvas.scrollTop) * this.scaleY
        }
    }
}

export const StringTools = {};
StringTools.wordWrap = function (foreignObject, x, y, width,height) {
    //TODO:

    foreignObject.setAttribute('x', x);
    foreignObject.setAttribute('y', y);
    foreignObject.setAttribute('width', width);
    foreignObject.setAttribute('height', height);
};

StringTools.getRealStringLength = function (str) {
    var length = 0;
    for (i = 0; i < str.length; i++) {
        if ((str.charCodeAt(i) & 0xff00) != 0) {
            length++;
        }
        length++;
    }
    return length;
}

export function CanvasGeometry() { };

CanvasGeometry.fillRadiusRect = function (ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
};
