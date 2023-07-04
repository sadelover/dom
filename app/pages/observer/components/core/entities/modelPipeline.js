import { Sprite } from '../sprites';

const pysiteVersion = JSON.parse(window.localStorage.getItem('pysiteVersion'))

function ModelPipeline(id, painter, behaviors) { 
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [{ execute: this.executeAnimation }];

    this.idCom = undefined;
    this.dictIdCom = {};
    this.startX = undefined;
    this.startY = undefined;
    this.endX = undefined;
    this.endY = undefined;
    this.layer = undefined;
    this.lineWidth = 10;
    this.color = undefined;
    this.logic = undefined;//当是高级定义时无效

    this.pathLengthX = undefined;
    this.pathLengthY = undefined;
    this.originX = undefined;
    this.originY = undefined;

    this.direction = undefined; //方向
    this.initDirection = undefined;
    this.speed = undefined; 
    this.pointX = undefined;
    this.pointY = undefined;
    this.radius = 10;
    this.waterType = undefined;
    this.isRunning = false;
    this.denSity = undefined; //密度
    this.moveX = false; //移动的方向
    this.moveY = false;
    this.moveBias = false; //倾斜

    this.pipeLine = undefined;
    this.waterPointList = [];
    this.waterShape = undefined; //水流形状
};

ModelPipeline.prototype = new Sprite();

ModelPipeline.prototype.paint = function (ctx, waterPointList) {
    // ctx.save();
    if(localStorage.getItem('AplhaNoFlow')){
        var alpha = this.isRunning ? '0.4' : localStorage.getItem('AplhaNoFlow'); 
        var alpha1 = this.isRunning ? '0.7' : localStorage.getItem('AplhaNoFlow'); //更冷更热
    }else{
        var alpha = this.isRunning ? '0.4' : '0.25'; 
        var alpha1 = this.isRunning ? '0.7' : '0.25'; //更冷更热
    }
    switch (this.waterType) {
        case "0": ctx.setAttribute("stroke", 'rgba(0, 114, 201, ' + alpha1 + ')'); break;
        case "1": ctx.setAttribute("stroke", 'rgba(255, 102, 153, ' + alpha + ')'); break; // 粉
        case "2": ctx.setAttribute("stroke", 'rgba(244, 191, 88, ' + alpha1 + ')'); break;
        case "3": ctx.setAttribute("stroke", 'rgba(255, 50, 0, ' + alpha1 + ')'); break;
        case "4": ctx.setAttribute("stroke", 'rgba(51, 204, 102, ' + alpha + ')'); break; //绿
        case "5": ctx.setAttribute("stroke", 'rgba(255, 153, 0, ' + alpha1 + ')'); break; //橙
        default: 
            //dompsyte0.14.73版本及以上，已将颜色修复为rgb顺序
            ctx.setAttribute("stroke", pysiteVersion && pysiteVersion >= 1473? "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + ","+alpha +")" : "rgba(" + this.color.b + "," + this.color.g + "," + this.color.r + ","+alpha +")");
            break;
    }
    var waterShape = this.waterShape
    //将密度判断封装起来，便于复用
    function getInterval (denSity,lineWidth) {
        var interval 
        if(waterShape === 0) {
            switch (denSity) {
                case "0": interval = (lineWidth*3) * 6; break; //疏松
                case "1": interval = (lineWidth*3) * 5; break; 
                case "2": interval = (lineWidth*3) * 4; break;
                case "3": interval = (lineWidth*3) * 3; break;
                case "4": interval = (lineWidth*3) * 2.5; break; //密集
            }
            return interval
        }else {
            switch (denSity) {
                case "0": interval = lineWidth * 6; break; //疏松
                case "1": interval = lineWidth * 5; break; 
                case "2": interval = lineWidth * 4; break;
                case "3": interval = lineWidth * 3; break;
                case "4": interval = lineWidth * 2.5; break; //密集
            }
            return interval
        }
    }

    
    try{

        // svg paint pipeline
        let pipeLinePath = "M " + this.startX + " " + this.startY + " " + "L " + this.endX + " " + this.endY + " " + "Z";
        ctx.setAttribute("d", pipeLinePath);
        ctx.setAttribute("stroke-width", this.lineWidth);
    }
    catch(e){
        console.error(e);
    }
    
    if (this.isRunning) {
        for (var i = 0; i < waterPointList.length; i++) {
            // if (this.waterType) {
                // if (this.waterType == 0) {
                //     waterPointList[i].setAttribute("fill", "#017db6");
                // } else {
                //     waterPointList[i].setAttribute("fill", "#6fc88f");
                // }
                var alpha = 0.99
                var alpha1 = 0.99
                switch (this.waterType) {
                    case "0": waterPointList[i].setAttribute("fill", 'rgba(0, 114, 201, ' + alpha1 + ')'); break;
                    case "1": waterPointList[i].setAttribute("fill", 'rgba(255, 102, 153, ' + alpha + ')'); break; // 粉
                    case "2": waterPointList[i].setAttribute("fill", 'rgba(244, 191, 88, ' + alpha1 + ')'); break;
                    case "3": waterPointList[i].setAttribute("fill", 'rgba(255, 50, 0, ' + alpha1 + ')'); break;
                    case "4": waterPointList[i].setAttribute("fill", 'rgba(51, 204, 102, ' + alpha + ')'); break; //绿
                    case "5": waterPointList[i].setAttribute("fill", 'rgba(255, 30, 0, ' + alpha1 + ')'); break; //橙
                    default: waterPointList[i].setAttribute("fill", "#6fc88f");break;
            
                }
            // }                    
        }
        
        //根据密度，得到水珠之间的间隔
        var distance
        if(localStorage.getItem('animation')&&localStorage.getItem('animation')=='cheap'){
            this.speed = this.speed/Math.abs(this.speed)/2
            distance = getInterval('0',this.lineWidth);
        }else{
            distance = getInterval(this.denSity,this.lineWidth);
        }
        //横向
        if (this.moveX) {
            //draw point
            try{
                let curX = 0;
                //管道从右到左画，选“正向”，speed为负
                if (this.startX > this.endX) {
                    //根据速度计算移动位置
                    this.pointX += this.speed;
                    //水流动画为矩形
                    if(this.waterShape === 0) {
                        for (var m=0; m<waterPointList.length;m++) {
                            if (this.speed<0) {
                                //factory正向，X越来越小；
                                curX = this.pointX - m * distance;
                                if( curX >= this.endX && curX <= this.startX ){ 
                                    // 当水流元素移动到下一个元素的位置，返回起点
                                    if (curX < this.originX-(m+1)*distance) {
                                        this.pointX = this.originX-3*this.lineWidth
                                    }else{
                                        waterPointList[m].setAttribute("x", Math.floor(curX));
                                        waterPointList[m].setAttribute("y", Math.floor(this.pointY - this.lineWidth / 2));
                                        waterPointList[m].setAttribute("width", 3*this.lineWidth);
                                        waterPointList[m].setAttribute("height", this.lineWidth);
                                    }
                                }
                            }else {
                                //factory反向，X越来越大
                                curX = this.pointX + m * distance;
                                if( curX >= this.endX && curX <= this.startX-3*this.lineWidth){ 
                                    //当水流元素移动到下一个元素的位置，返回起点
                                    if (curX > this.originX + (m+1) * distance) {
                                        this.pointX = this.originX
                                    }else{
                                        waterPointList[m].setAttribute("x", Math.floor(curX));
                                        waterPointList[m].setAttribute("y", Math.floor(this.pointY - this.lineWidth / 2));
                                        waterPointList[m].setAttribute("width", 3*this.lineWidth);
                                        waterPointList[m].setAttribute("height", this.lineWidth);
                                    }
                                }
                            }
                            
                        }
                    }else {
                        //圆形水流
                        for (var m=0; m<waterPointList.length-1;m++) {
                            if (this.speed<0) {
                                //factory正向，X越来越小；
                                curX = this.pointX - m * distance;
                                if( curX >= this.endX && curX <= this.startX ){ 
                                    // 当水流元素移动到下一个元素的位置，返回起点
                                    if (curX < this.originX-(m+1)*distance) {
                                        this.pointX = this.originX
                                    }else{
                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                        waterPointList[m].setAttribute("cy", Math.floor(this.pointY));
                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                    }
                                }
                            }else {
                                //factory反向，X越来越大
                                curX = this.pointX + m * distance;
                                if( curX >= this.endX && curX <= this.startX  ){ 
                                    //当水流元素移动到下一个元素的位置，返回起点
                                    if (curX > this.originX + (m+1) * distance) {
                                        this.pointX = this.originX
                                    }else{
                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                        waterPointList[m].setAttribute("cy", Math.floor(this.pointY));
                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                    }
                                }
                            }
                            
                        }
                    }
                    
                } else {
                    //管道从左到右画，选“正向”，speed为负
                    //根据速度计算移动位置
                    this.pointX += this.speed;
                    //从左到右管道的矩形水流
                    if(this.waterShape === 0) {
                        for (var m=0; m<waterPointList.length;m++) {
                            if (this.speed<0) {
                                //(实际流动反向)，X越来越小；
                                curX = this.pointX - m * distance;
                                if( curX >= this.startX && curX <= this.endX ){ 
                                    // 当水流元素移动到下一个元素的位置，返回起点
                                    if (curX < this.originX-(m+1)*distance) {
                                        this.pointX = this.originX-3*this.lineWidth
                                    }else{
                                        waterPointList[m].setAttribute("x", Math.floor(curX));
                                        waterPointList[m].setAttribute("y", Math.floor(this.pointY - this.lineWidth / 2));
                                        waterPointList[m].setAttribute("width", 3*this.lineWidth);
                                        waterPointList[m].setAttribute("height", this.lineWidth);
                                    }
                                }
                            }else {
                                //(实际流动正向)，X越来越大
                                curX = this.pointX + m * distance;
                                if( curX >= this.startX && curX <= this.endX-3*this.lineWidth){ 
                                    //当水流元素移动到下一个元素的位置，返回起点
                                    if (curX > this.originX + (m+1) * distance ) {
                                        this.pointX = this.originX
                                    }else{
                                        waterPointList[m].setAttribute("x", Math.floor(curX));
                                        waterPointList[m].setAttribute("y", Math.floor(this.pointY - this.lineWidth / 2));
                                        waterPointList[m].setAttribute("width", 3*this.lineWidth);
                                        waterPointList[m].setAttribute("height", this.lineWidth);
                                    }
                                }
                            }
                            
                        }
                    }else {
                        //从左到右管道的圆形水流
                        for (var m=0; m<waterPointList.length-1;m++) {
                            if (this.speed<0) {
                                //factory反向，X越来越小；
                                curX = this.pointX - m * distance;
                                if( curX >= this.startX && curX <= this.endX ){ 
                                    // 当水流元素移动到下一个元素的位置，返回起点
                                    if (curX < this.originX-(m+1)*distance) {
                                        this.pointX = this.originX
                                    }else{
                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                        waterPointList[m].setAttribute("cy", Math.floor(this.pointY));
                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                    }
                                }
                            }else {
                                //factory正向，X越来越大
                                curX = this.pointX + m * distance;
                                if( curX >= this.startX && curX <= this.endX ){ 
                                    //当水流元素移动到下一个元素的位置，返回起点
                                    if (curX > this.originX + (m+1) * distance) {
                                        this.pointX = this.originX
                                    }else{
                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                        waterPointList[m].setAttribute("cy", Math.floor(this.pointY));
                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                    }
                                }
                            }
                            
                        }
                    }
                    
                }
            }catch(e){
                console.error(e);
            }
        }else {
            //纵向水流
            if (this.moveY) {
                //draw point
                try{

                    let curY = 0;
                    //管道从右到左画，选“正向”，speed为负
                    if (this.startY > this.endY) {
                        //根据速度计算移动位置
                        this.pointY += this.speed;
                        //水流动画为矩形
                        if(this.waterShape === 0){
                            for (var m=0; m<waterPointList.length;m++) {
                                if (this.speed<0) {
                                    //factory正向，y越来越小；
                                    curY = this.pointY - m * distance;
                                    if( curY >= this.endY && curY <= this.startY ){ 
                                        // 当水流元素移动到下一个元素的位置，返回起点
                                        if (curY < this.originY-(m+1)*distance) {
                                            this.pointY = this.originY-3*this.lineWidth
                                        }else{
                                            waterPointList[m].setAttribute("x", Math.floor(this.pointX - this.lineWidth/2));
                                            waterPointList[m].setAttribute("y", Math.floor(curY));
                                            waterPointList[m].setAttribute("width", this.lineWidth);
                                            waterPointList[m].setAttribute("height", 3*this.lineWidth);
                                        }
                                    }
                                }else {
                                    //factory反向，X越来越大
                                    curY = this.pointY + m * distance;
                                    if( curY >= this.endY && curY <= this.startY -3*this.lineWidth ){ 
                                        //当水流元素移动到下一个元素的位置，返回起点
                                        if (curY > this.originY + (m+1) * distance) {
                                            this.pointY = this.originY
                                        }else{
                                            waterPointList[m].setAttribute("x", Math.floor(this.pointX - this.lineWidth/2));
                                            waterPointList[m].setAttribute("y", Math.floor(curY));
                                            waterPointList[m].setAttribute("width", this.lineWidth);
                                            waterPointList[m].setAttribute("height", 3*this.lineWidth);
                                        }
                                    }
                                } 
                            }
                        }else {
                            for (var m=0; m<waterPointList.length-1;m++) {
                                if (this.speed<0) {
                                    //factory正向，y越来越小；
                                    curY = this.pointY - m * distance;
                                    if( curY >= this.endY && curY <= this.startY ){ 
                                        // 当水流元素移动到下一个元素的位置，返回起点
                                        if (curY < this.originY-(m+1)*distance) {
                                            this.pointY = this.originY
                                        }else{
                                            waterPointList[m].setAttribute("cx", Math.floor(this.pointX));
                                            waterPointList[m].setAttribute("cy", Math.floor(curY));
                                            waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                        }
                                    }
                                }else {
                                    //factory反向，X越来越大
                                    curY = this.pointY + m * distance;
                                    if( curY >= this.endY && curY <= this.startY  ){ 
                                        //当水流元素移动到下一个元素的位置，返回起点
                                        if (curY > this.originY + (m+1) * distance) {
                                            this.pointY = this.originY
                                        }else{
                                            waterPointList[m].setAttribute("cx", Math.floor(this.pointX));
                                            waterPointList[m].setAttribute("cy", Math.floor(curY));
                                            waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                        }
                                    }
                                } 
                            }
                        }

                    } else {
                        //管道从左到右画，选“正向”，speed为负
                        //根据速度计算移动位置
                        this.pointY += this.speed;
                        //水流动画为矩形
                        if(this.waterShape === 0){
                            for (var m=0; m<waterPointList.length;m++) {
                                if (this.speed<0) {
                                    //(实际流动反向)，Y越来越小；
                                    curY = this.pointY - m * distance;
                                    if( curY >= this.startY && curY <= this.endY ){ 
                                        // 当水流元素移动到下一个元素的位置，返回起点
                                        if (curY < this.originY-(m+1)*distance) {
                                            this.pointY = this.originY-3*this.lineWidth
                                        }else{
                                            waterPointList[m].setAttribute("x", Math.floor(this.pointX - this.lineWidth/2));
                                            waterPointList[m].setAttribute("y", Math.floor(curY));
                                            waterPointList[m].setAttribute("width", this.lineWidth);
                                            waterPointList[m].setAttribute("height", 3*this.lineWidth);
                                        }
                                    }
                                }else {
                                    //(实际流动正向)，Y越来越大
                                    curY = this.pointY + m * distance;
                                    if( curY >= this.startY && curY <= this.endY-3*this.lineWidth){ 
                                        //当水流元素移动到下一个元素的位置，返回起点
                                        if (curY > this.originY + (m+1) * distance ) {
                                            this.pointY = this.originY
                                        }else{
                                            waterPointList[m].setAttribute("x", Math.floor(this.pointX - this.lineWidth/2));
                                            waterPointList[m].setAttribute("y", Math.floor(curY));
                                            waterPointList[m].setAttribute("width", this.lineWidth);
                                            waterPointList[m].setAttribute("height", 3*this.lineWidth);
                                        }
                                    }
                                }
                                
                            }
                        }else {
                            for (var m=0; m<waterPointList.length-1;m++) {
                                if (this.speed<0) {
                                    //factory反向，y越来越小；
                                    curY = this.pointY - m * distance;
                                    if( curY >= this.startY && curY <= this.endY ){ 
                                        // 当水流元素移动到下一个元素的位置，返回起点
                                        if (curY < this.originY-(m+1)*distance) {
                                            this.pointY = this.originY
                                        }else{
                                            waterPointList[m].setAttribute("cx", Math.floor(this.pointX));
                                            waterPointList[m].setAttribute("cy", Math.floor(curY));
                                            waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                        }
                                    }
                                }else {
                                    //factory正向，y越来越大
                                    curY = this.pointY + m * distance;
                                    if( curY >= this.startY && curY <= this.endY ){ 
                                        //当水流元素移动到下一个元素的位置，返回起点
                                        if (curY > this.originY + (m+1) * distance) {
                                            this.pointY = this.originY
                                        }else{
                                            waterPointList[m].setAttribute("cx", Math.floor(this.pointX));
                                            waterPointList[m].setAttribute("cy", Math.floor(curY));
                                            waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                        }
                                    }
                                }
                                
                            }
                        }
                        
                    }


                }catch(e){
                    console.error(e);
                }
            } else {
                //倾斜水流
                if (this.moveBias) {
                    // let biasLineLength = Math.sqrt(Math.pow(item.endX-item.startX,2)+Math.pow(item.endY-item.startY,2))
                    try{
                        let [curX,curY] = [0,0];
                        //管道从右到左画，选“正向”，speed为负
                        if (this.startX > this.endX) {
                            //管道从左到右画
                            //根据速度计算移动位置
                            this.pointX += this.speed;
                            this.pointY += this.speed;
                            //从左到右管道的水流
                            if(this.waterShape === 1) {
                                //从左到右管道的圆形水流
                                for (var m=0; m<waterPointList.length;m++) {
                                    if (this.speed<0) {
                                        //第三象限
                                        if (this.startY < this.endY) {
                                            if (Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY)) {
                                                 //1.偏x轴:从右上到左下，选“正向”
                                                curX = this.pointX - m * distance;
                                                curY = this.startY+(this.endY-this.startY)/(this.endX-this.startX)*(curX-this.startX)
                                                if( curX <= this.startX && curX >= this.endX && curY >= this.startY && curY <= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curX < this.originX - (m+1) * distance) {
                                                        this.pointX = this.originX
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }else {
                                                //2.偏y轴:从左上到右下，选“反向”
                                                curY = this.pointY - m * distance;
                                                curX = this.startX+(curY-this.startY)/((this.endY-this.startY)/(this.endX-this.startX))
                                                if( curX <= this.startX && curX >= this.endX && curY >= this.startY && curY <= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curY < this.originY - (m+1) * distance) {
                                                        this.pointY = this.originY
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }
                                        }else {
                                            //第一象限
                                            if (Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY)) {
                                                 //1.偏x轴:从左下到右上，选“反向”
                                                curX = this.pointX - m * distance;
                                                curY = this.startY+(this.endY-this.startY)/(this.endX-this.startX)*(curX-this.startX)
                                                if( curX <= this.startX && curX >= this.endX && curY <= this.startY && curY >= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curX < this.originX - (m+1) * distance) {
                                                        this.pointX = this.originX
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }else {
                                                //2.偏y轴:从左下到右上，选“正向”
                                                curY = this.pointY - m * distance;
                                                curX = this.startX+(curY-this.startY)/((this.endY-this.startY)/(this.endX-this.startX))
                                                if( curX <= this.startX && curX >= this.endX && curY >= this.endY && curY <= this.startY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curY < this.originY - (m+1) * distance) {
                                                        this.pointY = this.originY
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }
                                        }
                                    }else {
                                        //第四象限
                                        if (this.startY < this.endY) {
                                            if (Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY)) {
                                                 //1.偏x轴
                                                curX = this.pointX + m * distance;
                                                curY = this.startY+(this.endY-this.startY)/(this.endX-this.startX)*(curX-this.startX)
                                                if( curX <= this.startX && curX >= this.endX && curY >= this.startY && curY <= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curX > this.originX + (m+1) * distance) {
                                                        this.pointX = this.originX
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }else {
                                                //2.偏y轴
                                                curY = this.pointY + m * distance;
                                                curX = this.startX+(curY-this.startY)/((this.endY-this.startY)/(this.endX-this.startX))
                                                if( curX <= this.startX && curX >= this.endX && curY >= this.startY && curY <= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curY > this.originY + (m+1) * distance) {
                                                        this.pointY = this.originY
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }
                                        }else {
                                            //第一象限
                                            if (Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY)) {
                                                 //1.偏x轴:从左下到右上画，选“正向”
                                                curX = this.pointX + m * distance;
                                                curY = this.startY+(this.endY-this.startY)/(this.endX-this.startX)*(curX-this.startX)
                                                if( curX <= this.startX && curX >= this.endX && curY <= this.startY && curY >= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curX > this.originX + (m+1) * distance) {
                                                        this.pointX = this.originX
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }else {
                                                //2.偏y轴
                                                curY = this.pointY + m * distance;
                                                curX = this.startX+(curY-this.startY)/((this.endY-this.startY)/(this.endX-this.startX))
                                                if( curX <= this.startX && curX >= this.endX && curY >= this.endY && curY <= this.startY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curY > this.originY + (m+1) * distance) {
                                                        this.pointY = this.originY
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }
                                        }
                                       
                                    }
                                    
                                }
                            }
                            
                        } else {
                            //管道从左到右画
                            //根据速度计算移动位置
                            this.pointX += this.speed;
                            this.pointY += this.speed;
                            //从左到右管道的水流
                            if(this.waterShape === 1) {
                                //从左到右管道的圆形水流
                                for (var m=0; m<waterPointList.length;m++) {
                                    if (this.speed<0) {
                                        //第四象限
                                        if (this.startY < this.endY) {
                                            if (Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY)) {
                                                 //1.偏x轴:从左上到右下，选“反向”
                                                curX = this.pointX - m * distance;
                                                curY = this.startY+(this.endY-this.startY)/(this.endX-this.startX)*(curX-this.startX)
                                                if( curX >= this.startX && curX <= this.endX && curY >= this.startY && curY <= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curX < this.originX - (m+1) * distance) {
                                                        this.pointX = this.originX
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }else {
                                                //2.偏y轴:从左上到右下，选“反向”
                                                curY = this.pointY - m * distance;
                                                curX = this.startX+(curY-this.startY)/((this.endY-this.startY)/(this.endX-this.startX))
                                                if( curX >= this.startX && curX <= this.endX && curY >= this.startY && curY <= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curY < this.originY - (m+1) * distance) {
                                                        this.pointY = this.originY
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }
                                        }else {
                                            //第一象限
                                            if (Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY)) {
                                                 //1.偏x轴:从左下到右上，选“反向”
                                                curX = this.pointX - m * distance;
                                                curY = this.startY+(this.endY-this.startY)/(this.endX-this.startX)*(curX-this.startX)
                                                if( curX >= this.startX && curX <= this.endX && curY <= this.startY && curY >= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curX < this.originX - (m+1) * distance) {
                                                        this.pointX = this.originX
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }else {
                                                //2.偏y轴:从左下到右上，选“正向”
                                                curY = this.pointY - m * distance;
                                                curX = this.startX+(curY-this.startY)/((this.endY-this.startY)/(this.endX-this.startX))
                                                if( curX >= this.startX && curX <= this.endX && curY >= this.endY && curY <= this.startY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curY < this.originY - (m+1) * distance) {
                                                        this.pointY = this.originY
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }
                                        }
                                    }else {
                                        //第四象限
                                        if (this.startY < this.endY) {
                                            if (Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY)) {
                                                 //1.偏x轴
                                                curX = this.pointX + m * distance;
                                                curY = this.startY+(this.endY-this.startY)/(this.endX-this.startX)*(curX-this.startX)
                                                if( curX >= this.startX && curX <= this.endX && curY >= this.startY && curY <= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curX > this.originX + (m+1) * distance) {
                                                        this.pointX = this.originX
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }else {
                                                //2.偏y轴
                                                curY = this.pointY + m * distance;
                                                curX = this.startX+(curY-this.startY)/((this.endY-this.startY)/(this.endX-this.startX))
                                                if( curX >= this.startX && curX <= this.endX && curY >= this.startY && curY <= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curY > this.originY + (m+1) * distance) {
                                                        this.pointY = this.originY
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }
                                        }else {
                                            //第一象限
                                            if (Math.abs(this.startX-this.endX)>Math.abs(this.startY-this.endY)) {
                                                 //1.偏x轴:从左下到右上画，选“正向”
                                                curX = this.pointX + m * distance;
                                                curY = this.startY+(this.endY-this.startY)/(this.endX-this.startX)*(curX-this.startX)
                                                if( curX >= this.startX && curX <= this.endX && curY <= this.startY && curY >= this.endY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curX > this.originX + (m+1) * distance) {
                                                        this.pointX = this.originX
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }else {
                                                //2.偏y轴
                                                curY = this.pointY + m * distance;
                                                curX = this.startX+(curY-this.startY)/((this.endY-this.startY)/(this.endX-this.startX))
                                                if( curX >= this.startX && curX <= this.endX && curY >= this.endY && curY <= this.startY ){ 
                                                    //当水流元素移动到下一个元素的位置，返回起点
                                                    if (curY > this.originY + (m+1) * distance) {
                                                        this.pointY = this.originY
                                    
                                                    }else{
                                                        waterPointList[m].setAttribute("cx", Math.floor(curX));
                                                        waterPointList[m].setAttribute("cy", Math.floor(curY));
                                                        waterPointList[m].setAttribute("r", Math.floor(this.lineWidth / 2 - 1));
                                                    }
                                                }
                                            }
                                        }
                                       
                                    }
                                    
                                }
                            }
                            
                        }
                    }catch(e){
                        console.error(e);
                    }
                }
            }
        }   
    } else {
        if (this.waterShape === 0) {
            //矩形
            for (var i = 0; i < waterPointList.length; i++) {
                if (waterPointList[i].getAttribute('x') && waterPointList[i].getAttribute('y')  && waterPointList[i].getAttribute('width') && waterPointList[i].getAttribute('height')!== 0) {
                    waterPointList[i].setAttribute("x", 0);
                    waterPointList[i].setAttribute("y", 0);
                    waterPointList[i].setAttribute("width", 0);
                    waterPointList[i].setAttribute("height", 0);
                }
            } 
        }else {
            //圆形
            for (var i = 0; i < waterPointList.length; i++) {
                if (waterPointList[i].getAttribute('cx') && waterPointList[i].getAttribute('cx') !== 0) {
                    waterPointList[i].setAttribute("cx", 0);
                    waterPointList[i].setAttribute("cy", 0);
                    waterPointList[i].setAttribute("r", 0);
                }
            } 
        }
                           
    } 
    
    
}

ModelPipeline.prototype.executeAnimation = function (sprite) {
    //status: 1 = open, 0 = close.
    sprite.isRunning = false;
    if (new RegExp(/\<\%.+\%\>/g).test(sprite.idCom)) {
        var str = ""
        for (var item in sprite.dictIdCom) {
            //str = str + sprite.dictIdCom[item] +" == true,"
            if (item === sprite.idCom) {
                sprite.isRunning = sprite.dictIdCom[sprite.idCom]
            }
        }
        
        
        // console.log(str)
        
        // console.log(sprite.isRunning)
    }else {
         // "("ChOnOff"==1 && "PumpOnOff"==0) || ("ChOnOff"==0 && "PumpOnOff"!=0) "
        if(new RegExp(/[\(|\)|==|"|\||&&|!|=]+/g).test(sprite.idCom)){
            var str = sprite.idCom
            for( var item in sprite.dictIdCom ){
                // 替换实时点值
                if(sprite.dictIdCom[item]){
                    str = str.replace(/"[\w\d]+"/,1)
                }else{
                    str = str.replace(/"[\w\d]+"/,0)
                }
            }
            // 
            try {
                sprite.isRunning = eval(str)
                
            }catch (e) {
                console.log(e)
            }
        }else{
            var str = ""
            for (var item in sprite.dictIdCom) {
                str = str + sprite.dictIdCom[item] +" == true,"
            }
            if (sprite.logic == 1) {
                str = str.replace(/,/g,"&&")
                str = str.slice(0,str.length-2)
                
            }else if (sprite.logic == 2 || sprite.logic == 0) {
                str = str.replace(/,/g,"||")
                str = str.slice(0,str.length-2)
            
            }else {
                return;
            }
            // console.log(str)
            sprite.isRunning = eval(str)
            // console.log(sprite.isRunning)
            

        }
    }

   
    if (!sprite.isRunning) return;

    if (sprite.pointX == undefined || sprite.pointY == undefined) sprite.initAnimationParams();

    if (sprite.endY == sprite.startY) {
        //moving as axis X
        if (Math.abs(sprite.pointX - sprite.originX) > sprite.pathLengthX) sprite.initAnimationParams();
        // sprite.pointX += sprite.speed; //水流动画新逻辑取消在外层的位置变化，放到每个动画元素的循环里，可控
        sprite.moveX = true;
    } else {
        if (sprite.endX == sprite.startX) {
            //moving as axis Y
            if (Math.abs(sprite.pointY - sprite.originY) > sprite.pathLengthY) sprite.initAnimationParams();
            // sprite.pointY += sprite.speed;  //水流动画新逻辑取消在外层的位置变化，放到每个动画元素的循环里，可控
            sprite.moveY = true;
        }else {
            sprite.moveBias = true;
        }
        
    }
}

//animation start point and the length of path.
ModelPipeline.prototype.initAnimationParams = function () {
    this.pathLengthX = Math.abs(this.endX - this.startX) - this.radius;
    this.pathLengthY = Math.abs(this.endY - this.startY) - this.radius;

    if (this.direction) {
        //forward direction                                   
        this.originX = this.startX;
        this.originY = this.startY;
        //判断是否是倾斜
        if (this.endX != this.startX && this.endY != this.startY) {
            if (Math.abs(this.startX-this.endX)<Math.abs(this.startY-this.endY)) {
                if (this.speed > 0 && this.endY < this.startY) this.speed = -1 * this.speed;
            }else{
                if (this.speed > 0 && this.endX < this.startX) this.speed = -1 * this.speed;
            }
        }else{
            if (this.speed > 0 && (this.endX < this.startX || this.endY < this.startY)) this.speed = -1 * this.speed;
        }
    } else {
        //backward direction
        this.originX = this.endX;
        this.originY = this.endY;
        //判断是否是倾斜
        if (this.endX != this.startX && this.endY != this.startY) {
            if (Math.abs(this.startX-this.endX)<Math.abs(this.startY-this.endY)) {
                if (this.speed > 0 && this.endY > this.startY) this.speed = -1 * this.speed;
            }else{
                if (this.speed > 0 && this.endX > this.startX) this.speed = -1 * this.speed;
            }
        }else{
            if (this.speed > 0 && (this.endX > this.startX || this.endY > this.startY)) this.speed = -1 * this.speed;
        }
    }

    this.pointX = this.originX;
    this.pointY = this.originY;
}
export default ModelPipeline;
