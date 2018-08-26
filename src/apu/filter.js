let Fliter = function (B0, B1, A1) {
    this.B0 = B0;
    this.B1 = B1;
    this.A1 = A1;
    this.prevX = 0.0;
    this.prevY = 0.0;
};

// sampleRate: samples per second
// cutoffFreq: oscillations per second
Fliter.LowPassFilter = function (sampleRate, cutoffFreq) {
    let c = sampleRate / Math.PI / cutoffFreq;
    let a0i = 1 / (1 + c);
    return new Fliter(
        a0i,
        a0i,
        (1 - c) * a0i
    );
};

Fliter.HighPassFilter = function (sampleRate, cutoffFreq) {
    let c = sampleRate / Math.PI / cutoffFreq;
    let a0i = 1 / (1 + c);
    return new Fliter(
        c * a0i,
        -c * a0i,
        (1 - c) * a0i
    );
};

Fliter.prototype = {
    step: function (x) {
        this.prevY = this.B0 * x + this.B1 * this.prevX - this.A1 * this.prevY;
        this.prevX = x;
        return this.prevY;
    },
};

module.exports = Fliter;