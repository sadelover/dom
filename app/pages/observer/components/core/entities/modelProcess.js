
var configMap = {
    textTooltipTemplate:`
        <div id="lanren" style="width:300px;margin:100px auto;">
            <div style="font-size:12px;line-height:50px;position:relative;height:50px;list-style:none;">red<span id="title">0</span>
                <div class="scale_panel" style="width:200px;position:absolute;line-height:18px;left:60px;top:-0px;">
                    <span class="r" style="float:right;">100</span>0
                    <div class="scale" id="bar" style="background-repeat: repeat-x; background-position: 0 100%; background-color: #E4E4E4; border-left: 1px #83BBD9 solid;  width: 200px; height: 3px; position: relative; font-size: 0px; border-radius: 3px;">
                        <div style="background-repeat: repeat-x; background-color: #3BE3FF; width: 0px; position: absolute; height: 3px; width: 0; left: 0; bottom: 0; "></div>
                        <span id="btn" style="background:red;width:8px;height:16px;position:absolute;left:-2px;top:-5px;cursor:pointer;"></span>
                    </div>
                </div>
            </div>
        </div>
    `
}
function ModelProcess(){
		this.btn =null;
		this.bar = null;
		this.title = null;
		this.step = null;
		// this.btn=document.getElementById("btn");
		// this.bar=document.getElementById("bar");
		// this.title=document.getElementById("title");
		// this.step=this.bar.getElementsByTagName("div")[0];
	// return $template
};
ModelProcess.prototype.show = function(){
	var parser;
	var $template;
	var template;
	template = configMap.textTooltipTemplate
	parser = new DOMParser();
	$template = parser.parseFromString(template,"text/html").querySelector('#lanren');
	document.querySelector('body').appendChild($template);
	// this.init();
	return $template
}
ModelProcess.prototype.clear = function(){
	document.querySelector("#lanren").remove();
}
ModelProcess.prototype.init = function(){
	this.btn=document.getElementById("btn");
	this.bar=document.getElementById("bar");
	this.title=document.getElementById("title");
	this.step=this.bar.getElementsByTagName("div")[0];
	var f=this,g=document,b=window,m=Math;
		f.btn.onmousedown=function (e){
			var x=(e||b.event).clientX;
			var l=this.offsetLeft;
			var max=bar.offsetWidth-this.offsetWidth;
			g.onmousemove=function (e){
				var thisX=(e||b.event).clientX;
				var to=m.min(max,m.max(-2,l+(thisX-x)));
				btn.style.left=to+'px';
				f.ondrag(m.round(m.max(0,to/max)*100),to);
				b.getSelection ? b.getSelection().removeAllRanges() : g.selection.empty();
			};
			g.onmouseup=new Function('this.onmousemove=null');
		}
}
// 动态获取值
ModelProcess.prototype.getValue = function(value){
	this.btn=document.getElementById("btn");
	this.step=this.bar.getElementsByTagName("div")[0];
	this.step.style.width = value+'px'
	btn.style.left=value+'px';
}
ModelProcess.prototype.ondrag = function(pos,x){
		this.step.style.width=Math.max(0,x)+'px';
		this.title.innerHTML=pos+'%';
}
export default ModelProcess;

