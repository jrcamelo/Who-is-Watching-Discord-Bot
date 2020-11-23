function Timer(t, fn, args) {
   this.fn = fn;
   this.args = args;
   this.time = Date.now() + t;
   this.updateTimer();
}

Timer.prototype.setTime = function(t) {
    this.time = t;
    this.updateTimer();
}

Timer.prototype.setArgs = function(args) {
   this.args = args;
}

Timer.prototype.stop = function() {
    if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
    }
}

Timer.prototype.updateTimer = function() {
    var self = this;
    this.stop();
    var delta = this.time - Date.now();
    if (delta > 0) { 
        this.timer = setTimeout(function() {
            self.timer = null;
            self.fn(self.args);
        }, delta);
    }
}

module.exports.Timer = Timer;