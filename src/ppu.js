var PPU = function (nes) {
    this.cycle = 0;    // 0-340
    this.scanLine = 0; // 0-261, 0-239=visible, 240=post, 241-260=vblank, 261=pre
    this.frame = 0;    // frame counter
    this.reset();
};

PPU.prototype = {
    reset: function () {
        this.cycle = 340;
        this.scanLine = 240;
        this.frame = 0;
    },

    step: function () {

    },

    read: function (address) {

    },

    write: function (address, value) {

    }
};

module.exports = PPU;