let triangleTable = [
    15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
];

let lengthTable = [
    10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14,
    12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30,
];

let Triangle = function () {
    this.enabled = false;
    this.lengthEnabled = false;
    this.lengthValue = 0x00;
    this.timerPeriod = 0x0000;
    this.timerCounter = 0x0000;
    this.dutyCounter = 0x00;
    this.counterPeriod = 0x00;
    this.counterValue = 0x00;
    this.counterReload = false;
};

Triangle.prototype = {

    writeControl: function (value) {
        this.lengthEnabled = (value & 0x80) === 0;
        this.counterPeriod = value & 0x7F;
    },

    writeTimerLow: function (value) {
        this.timerPeriod = (this.timerPeriod & 0xFF00) | value;
    },

    writeTimerHigh: function (value) {
        this.lengthValue = lengthTable[value >> 3];
        this.timerPeriod = (this.timerPeriod & 0x00FF) | ((value & 7) << 8);
        this.timerCounter = this.timerPeriod;
        this.counterReload = true;
    },

    stepTimer: function () {
        if (this.timerCounter === 0) {
            this.timerCounter = this.timerPeriod;
            if (this.lengthValue > 0 && this.counterValue > 0) {
                this.dutyCounter = (this.dutyCounter + 1) & 31;
            }
        } else {
            this.timerCounter--;
        }
    },

    stepLength: function () {
        if (this.lengthEnabled === true && this.lengthValue > 0) {
            this.lengthValue--;
        }
    },

    stepCounter: function () {
        if (this.counterReload === true) {
            this.counterValue = this.counterPeriod;
        } else if (this.counterValue > 0) {
            this.counterValue--;
        }
        if (this.lengthEnabled === true) {
            this.counterReload = false;
        }
    },

    output: function () {
        if(this.enabled === false) {
            return 0;
        }
        if (this.lengthValue === 0) {
            return 0;
        }
        if (this.counterValue === 0) {
            return 0;
        }
        return triangleTable[this.dutyCounter];
    }

};
module.exports = Triangle;