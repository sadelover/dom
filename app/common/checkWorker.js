const DEFAULT_OPTIONS = {
    checkTimes: 120,
    // 单位：ms，间隔为500ms原因是：点值在现场刷新很快，由于点值后续会被修改，所以一旦检测到就可执行
    checkInterval: 500,
    // 遇到错误时是否停止 check
    stopWhenEncounterError: false
}
class CheckWorker {
    constructor(checkFn, options=DEFAULT_OPTIONS) {
        this.checkFn = checkFn;

        if (options !== DEFAULT_OPTIONS) {
            options = Object.assign({}, DEFAULT_OPTIONS, options);
        }

        this.checkTimes = options['checkTimes']; //w-总的检查次数
        this.checkInterval = options['checkInterval']; //w-时间间隔(2s)
        this.stopWhenEncounterError = options['stopWhenEncounterError'];

        // 当前 check 过的次数
        this.times = 0;

        // ready - 准备阶段
        // pending - 运行阶段
        // stopped - 停止状态
        this._status = 'ready';

        // event handlers
        this.handlers = [];

        // bind this
        this.next = this.next.bind(this);
        this.stop = this.stop.bind(this);
    }
    //w-下一次检测
    next() {
        this.times += 1;
        // w-发送事件
        this.onCheckProgress();
        //w-如果当前检查次数this.times > this.checkTimes 则停止check
        if (this.times >= this.checkTimes) {
            // w-状态变为stopped
            this._status = 'stopped';
            // w-检查完成
            this.onCheckComplete();
            return;
        }
        this._check();
    }
    // w-如果完成或者超时就停止
    stop() {
        this.times += 1;
        this.onCheckProgress();
        this._status = 'stopped';
        this.onCheckStopped();
        return;
    }
    // w-获取check的次数，和进度
    getCheckInfo() {
        return {
            times: this.times,
            progress: Math.round(this.times / this.checkTimes * 100) / 100
        };
    }
    //w-发送事件
    onCheckProgress() {
        this.emit('progress', this.getCheckInfo());
    }
    onCheckComplete() {
        this.emit('complete', this.getCheckInfo());
    }
    onCheckStopped() {
        this.emit('stop', this.getCheckInfo());
    }
    //w-开始检查
    start() {
        let status = this.status();
        if (status !== 'ready') {
            return ;
        }
        //w-状态改变
        this._status = 'pending';
        this._check(); //w-调用检查逻辑
    }
    callCustomCheck() {
        try {
            this.checkFn.call(
                null,
                this.getCheckInfo(),
                this.next,
                this.stop
            );
        } catch(err) {
            // console.log(err);
            if (this.stopWhenEncounterError) {
                this.stop();
            }
        }
    }
    _check() {
        //判断状态
        if (this._status !== 'pending') {
            return;
        }
        // 如果是第一次check，则调用callCutomCheck
        if (this.times === 0) {
            this.callCustomCheck();
        } else {
            window.setTimeout(() => {
                this.callCustomCheck();
            }, this.checkInterval);
        }
    }
    status() {
        return this._status;
    }
    on(event, handler, context) {
        if (!event || typeof handler !== 'function') {
            return this;
        }
        this.handlers[event] = this.handlers[event] || [];
        this.handlers[event].push(handler, context);
        return this;
    }
    off(event) {
        if (!event) {
            return this;
        }
        if (this.handlers[event] && this.handlers[event].length) {
            this.handlers[event].length = 0;
        }
        return this;
    }
    emit(event, ...data) {
        if (!event) {
            return this;
        }
        let handlers = this.handlers[event];
        if (handlers && handlers.length) {
            for (let i = 0, len = handlers.length; i < len; i += 2) {
                handlers[i].apply(handlers[i+1], data);
            }
        }
    }
}

export default CheckWorker

/*=== Test Case ===

new CheckWorker(function (info, next, stop) {
    // 模拟异步（这里换成你的 check 逻辑）
    setTimeout(function () {
        if (Math.random() > 0.1) {
            // 执行下一次 check
            // 会触发 progress 事件
            // 若已经达到了设置的 check 次数，则还会触发 complete 事件
            next();
        } else {
            // 直接停止，无需执行下一次 check
            // 会触发 progress 和 stop 事件
            stop();
        }
    }, 1000)
}, {
 // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
})
.on('progress', function ({progress}) {console.info('progress', progress)})
.on('stop', function ({progress}) {console.info('stop', progress)})
.on('complete', function ({progress}) { console.info('complete', progress) })
.start()

=== End ===*/

