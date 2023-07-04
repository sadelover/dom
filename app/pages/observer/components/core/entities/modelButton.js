/**
1、多点的按钮，不管点是否存在，都可点击下发指令
2、多点的按钮，跟单点按钮一样，如果有条件状态，就一样支持
3、多点的按钮，下发指令后，下发指令的循环检测，也是跟单点一样，没有就超时弹框报错
 */

import { Sprite } from '../sprites';
import http from '../../../../../common/http';
import ModelText from './modelText';
import { DatePicker, Form, Button, Modal, Table, Select, message, Spin, Alert, Row, Col, Card, Layout, Switch, Input, InputNumber, Tag } from 'antd';

function ModelButton(id, painter, behaviors) {
    Sprite.call(this, id, painter, behaviors);
    if (!(this.painter && this.painter.print)) this.painter = { paint: this.paint };
    if (!(this.behaviors && this.behaviors[0] && this.behaviors[0].execute)) this.behaviors = [];

    this.image = undefined;
    this.imageComm = undefined;
    this.imageOver = undefined;
    this.imageDown = undefined;
    this.imageDisable = undefined;
    this.url = undefined;
    this.idCom = undefined;
    this.text = undefined;
    this.link = undefined;
    this.description = undefined;
    this.fontSize = undefined;
    this.fontColor = undefined;
    this.PreCheckScript = undefined;
    this.PreCheckScriptDescription = undefined;
    this.idCom = undefined;
    this.setValue = undefined;

    this.status = undefined;
    this.history = undefined;
    this.button = undefined;
    this.relation = undefined;  //原来只是用来判断按钮启用、禁用；现在还可以存放按钮左上角的问号内容（factory里的relation+保护接口里的内容）
    this.relatType = undefined;
    this.enabled = undefined;
    this.list = [];
    this.memberVariables = [];

    this.btnImage = undefined;
    this.btnText = undefined;
    this.options = undefined;

};
ModelButton.prototype = new Sprite();

ModelButton.prototype.showModal = function (event, isInfo, widthScale, heightScale) {
    let _this = this
    let model = new ModelText()
    http.post('/analysis/get_point_info_from_s3db', {
        "pointList": [this.idCom]
    }).then(data => {
        if (data.err == 0) {
            model.description = data.data.realtimeValue[0].description
            model.idCom = data.data.realtimeValue[0].name
            model.value = data.data.realtimeValue[0].value
            model.sourceType = data.data[this.idCom].sourceType
            model.options = {
                getToolPoint: _this.options.getToolPoint,
                getTendencyModal: _this.options.getTendencyModal,
                showCommomAlarm: _this.options.showCommomAlarm,
                showMainInterfaceModal: _this.options.showMainInterfaceModal
            }
            model.showModal(event, isInfo, widthScale, heightScale)
        } else {
            model.description = "请求错误"
            model.idCom = this.idCom
            model.value = ""
            model.sourceType = "请求错误"
            model.options = {
                getToolPoint: _this.options.getToolPoint,
                getTendencyModal: _this.options.getTendencyModal,
                showCommomAlarm: _this.options.showCommomAlarm,
                showMainInterfaceModal: _this.options.showMainInterfaceModal
            }
            model.showModal(event, isInfo, widthScale, heightScale)
        }
    })
        .catch(err => {
            model.description = "请求错误"
            model.idCom = this.idCom
            model.value = ""
            model.sourceType = "请求错误"
            model.options = {
                getToolPoint: _this.options.getToolPoint,
                getTendencyModal: _this.options.getTendencyModal,
                showCommomAlarm: _this.options.showCommomAlarm,
                showMainInterfaceModal: _this.options.showMainInterfaceModal
            }
            model.showModal(event, isInfo, widthScale, heightScale)
        })
}
ModelButton.prototype.paint = function (ctx, btnText) {
    if (this.image !== undefined) {
        if (this.image.complete) {
            this.drawImage(this, ctx, btnText);
        } else {
            var _this = this;
            this.image.onload = function (e) {
                _this.drawImage(_this, ctx, btnText)
            };
        }
    }
},

    ModelButton.prototype.drawImage = function (_this, ctx, btnText) {
        if ((!_this.width) || (!_this.height)) {
            _this.width = _this.image.width;
            _this.height = _this.image.height;
        }
        try {
            // 如果需要拉伸
            let imgWidthScale = 1, imgHeightScale = 1;
            if (_this.width !== _this.image.width && _this.image.width != 0) {
                imgWidthScale = _this.width / _this.image.width;
            }

            if (_this.height !== _this.image.height && _this.image.height != 0) {
                imgHeightScale = _this.height / _this.image.height;
            }

            ctx.setAttribute('transform', `
            scale(${imgWidthScale}, ${imgHeightScale}) 
            `
            );

            // ctx.drawImage(_this.image, _this.x, _this.y, _this.width, _this.height);
            ctx.setAttribute("href", _this.image.src);
            if (imgWidthScale != 0) {
                ctx.setAttribute("x", _this.x / imgWidthScale);
            } else {
                ctx.setAttribute("x", _this.x);
            };
            if (imgHeightScale != 0) {
                ctx.setAttribute("y", _this.y / imgHeightScale);
            } else {
                ctx.setAttribute("y", _this.y);
            };
            ctx.setAttribute("width", _this.image.width);
            ctx.setAttribute("height", _this.image.height);
        } catch (e) {
            console.error(e);
        }
    },

    ModelButton.prototype.mouseEnter = function () {
        if (this.status == "down") return;
        if (this.enabled) {
            this.image = this.imageOver;
        }
    }
ModelButton.prototype.click = function () {
    if (this.status == "down") return;
    if (this.enabled) {
        this.image = this.imageOver;
    }
}
ModelButton.prototype.mouseOut = function () {
    if (this.enabled) {
        this.image = this.imageComm;
    }
    this.status = undefined;
}

ModelButton.prototype.mouseDown = function () {
    this.status = "down";
    if (this.enabled) {
        this.image = this.imageDown;
    }
}

ModelButton.prototype.update = function (obj) {
    if (this.memberVariables) {
        //将更新的点值放到关系对象的相应点值里
        this.memberVariables[obj.name] = obj.value
        //console.log(this.memberVariables)

        if (this.relation && this.relation.length >= 1) {
            var strRelation = '', result;
            // console.log(this.relation)
            for (var j = 0; j < this.relation.length; j++) {
                if (this.relation[j].permit != undefined) {
                    //如果permit是false即禁用
                    if (this.relation[j].permit == false) {
                        result = false;
                    }
                }else {
                    let realValue = ""
                    if (this.memberVariables[this.relation[j].point]) {
                        realValue = parseFloat(this.memberVariables[this.relation[j].point]);
                    }
                    //当点值关系为“等于”且点和点的关系为“与”时
                    if (this.relation[j].type == '0' && this.relatType == '0') {
                        //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串
                        // strRelation = ( this.memberVariables[this.relation[j].point] || 9999)  + "==" + this.relation[j].value + "&&" + strRelation
                        if (realValue === parseFloat(this.relation[j].value)) {
                            result = true;
                            continue;
                        } else {
                            //为了忽略条件中有不存在的点，使按钮在缺少该点时，依然可以点击，增加下面的判断--2023-4-11--dora
                            if (realValue == 999999) {
                                result = true;
                                break;
                            }else {
                                result = false;
                                break;
                            }
                            //为了忽略条件中有不存在的点，使按钮在缺少该点时，依然可以点击，注掉下面两行代码，增加上面的判断--2023-4-11--dora
                            // result = false;
                            // break;
                        }
                    } else
                        //当点值关系为“等于”且点和点的关系为“或”时
                        if (this.relation[j].type == '0' && this.relatType == '1') {
                            //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串 （eval方法在上面用过，后被William换掉了，原因不明）
                            strRelation = (this.memberVariables[this.relation[j].point] || 9999) + "==" + this.relation[j].value + "||" + strRelation
                            //删掉字符串中最后多余的||
                            result = eval((strRelation.substring(0, strRelation.length - 2)))
                        }
                    //当点值关系为“大于”且点和点的关系为“与”时
                    if (this.relation[j].type == '1' && this.relatType == '0') {
                        //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串
                        // strRelation = ( this.memberVariables[this.relation[j].point] || 9999)  + "==" + this.relation[j].value + "&&" + strRelation
                        if (realValue > parseFloat(this.relation[j].value)) {
                            result = true;
                            continue;
                        } else {
                            result = false;
                            break;
                        }
                    } else
                        //当点值关系为“大于”且点和点的关系为“或”时
                        if (this.relation[j].type == '1' && this.relatType == '1') {
                            //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串 （eval方法在上面用过，后被William换掉了，原因不明）
                            strRelation = (this.memberVariables[this.relation[j].point] || 9999) + "==" + this.relation[j].value + "||" + strRelation
                            //删掉字符串中最后多余的||
                            result = eval((strRelation.substring(0, strRelation.length - 2)))
                        }
                    //当点值关系为“小于”且点和点的关系为“与”时
                    if (this.relation[j].type == '2' && this.relatType == '0') {
                        //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串
                        // strRelation = ( this.memberVariables[this.relation[j].point] || 9999)  + "==" + this.relation[j].value + "&&" + strRelation
                        if (realValue < parseFloat(this.relation[j].value)) {
                            result = true;
                            continue;
                        } else {
                            result = false;
                            break;
                        }
                    } else
                        //当点值关系为“小于”且点和点的关系为“或”时
                        if (this.relation[j].type == '2' && this.relatType == '1') {
                            //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串 （eval方法在上面用过，后被William换掉了，原因不明）
                            strRelation = (this.memberVariables[this.relation[j].point] || 9999) + "==" + this.relation[j].value + "||" + strRelation
                            //删掉字符串中最后多余的||
                            result = eval((strRelation.substring(0, strRelation.length - 2)))
                        }
                    //当点值关系为“大于等于”且点和点的关系为“与”时
                    if (this.relation[j].type == '3' && this.relatType == '0') {
                        //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串
                        // strRelation = ( this.memberVariables[this.relation[j].point] || 9999)  + "==" + this.relation[j].value + "&&" + strRelation
                        if (realValue >= parseFloat(this.relation[j].value)) {
                            result = true;
                            continue;
                        } else {
                            result = false;
                            break;
                        }
                    } else
                        //当点值关系为“大于等于”且点和点的关系为“或”时
                        if (this.relation[j].type == '3' && this.relatType == '1') {
                            //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串 （eval方法在上面用过，后被William换掉了，原因不明）
                            strRelation = (this.memberVariables[this.relation[j].point] || 9999) + "==" + this.relation[j].value + "||" + strRelation
                            //删掉字符串中最后多余的||
                            result = eval((strRelation.substring(0, strRelation.length - 2)))
                        }
                    //当点值关系为“小于等于”且点和点的关系为“与”时
                    if (this.relation[j].type == '4' && this.relatType == '0') {
                        //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串
                        // strRelation = ( this.memberVariables[this.relation[j].point] || 9999)  + "==" + this.relation[j].value + "&&" + strRelation
                        if (realValue <= parseFloat(this.relation[j].value)) {
                            result = true;
                            continue;
                        } else {
                            result = false;
                            break;
                        }
                    } else
                        //当点值关系为“小于等于”且点和点的关系为“或”时
                        if (this.relation[j].type == '4' && this.relatType == '1') {
                            //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串 （eval方法在上面用过，后被William换掉了，原因不明）
                            strRelation = (this.memberVariables[this.relation[j].point] || 9999) + "==" + this.relation[j].value + "||" + strRelation
                            //删掉字符串中最后多余的||
                            result = eval((strRelation.substring(0, strRelation.length - 2)))
                        }
                    //当点值关系为“不等于”且点和点的关系为“与”时
                    if (this.relation[j].type == '5' && this.relatType == '0') {
                        //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串
                        // strRelation = ( this.memberVariables[this.relation[j].point] || 9999)  + "==" + this.relation[j].value + "&&" + strRelation
                        if (realValue != parseFloat(this.relation[j].value)) {
                            result = true;
                            continue;
                        } else {
                            result = false;
                            break;
                        }
                    } else
                        //当点值关系为“不等于”且点和点的关系为“或”时
                        if (this.relation[j].type == '5' && this.relatType == '1') {
                            //将当前关系对象的点与给出的逻辑关系中相对应的点值组成逻辑字符串 （eval方法在上面用过，后被William换掉了，原因不明）
                            strRelation = (this.memberVariables[this.relation[j].point] || 9999) + "==" + this.relation[j].value + "||" + strRelation
                            //删掉字符串中最后多余的||
                            result = eval((strRelation.substring(0, strRelation.length - 2)))
                        }
                    
                }
            }
            //给判断条件里的点名，存放对应的当前值，用于问号弹框里显示
            for (var j = 0; j < this.relation.length; j++) {
                if (this.relation[j].permit == undefined) {
                    if (this.relation[j].point == obj.name) {
                        this.relation[j]["curValue"] = parseFloat(obj.value)
                    }
                }
            }
            //删掉字符串中最后多余的&&
            // let result = eval((strRelation.substring(0,strRelation.length-2)))
            //  console.log(result)
            if (result) {
                this.enabled = true;
                this.image = this.imageComm;
                this.enabledText.setAttribute("display", "none");
            } else {
                this.enabled = false;
                this.image = this.imageDisable;
                this.enabledText.setAttribute("display", "inline-block");
            }
        } else {
            //有的点如果没有给关系，就是不需要限制的按钮，所以默认高亮
            this.enabled = true;
            this.image = this.imageComm;
            this.enabledText.setAttribute("display", "none");
        }
    }
    else {
        this.enabled = false;
        this.image = this.imageDisable;
        this.enabledText.setAttribute("display", "inline-block");
    }

}

export default ModelButton;
