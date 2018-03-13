let Fliter = function () {
    this.B0 = 0.0;
    this.B1 = 0.0;
    this.A1 = 0.0;
    this.prevX = 0.0;
    this.prevY = 0.0;
};

Fliter.prototype = {
    step: function (x) {
        this.prevY = this.B0 * x + this.B1 * this.prevX - this.A1 * this.prevY;
        this.prevX = x;
        return this.prevY;
    },
    LowPassFilter: function (sampleRate, cutoffFreq) {
        let c = sampleRate / Math.PI / cutoffFreq;
        let a0i = 1 / (1 + c);
        let filter = new Fliter();
        filter.B0 = a0i;
        filter.B1 = a0i;
        filter.A1 = (1 - c) * a0i;
        return filter;
    },

    HighPassFilter: function (sampleRate, cutoffFreq) {
        let c = sampleRate / Math.PI / cutoffFreq;
        let a0i = 1 / (1 + c);
        let filter = new Fliter();
        filter.B0 = c * a0i;
        filter.B1 = -c * a0i;
        filter.A1 = (1 - c) * a0i;
        return filter;
    },
};

module.exports = Fliter;