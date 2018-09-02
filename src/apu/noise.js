let noiseTable = [
    4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068,
];

let lengthTable = [
    10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14,
    12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30,
];

let Noise = function () {
    this.enabled = false;
    this.mode = false;
    this.shiftRegister = 0x0000;
    this.lengthEnabled = false;
    this.lengthValue = 0x00;
    this.timerPeriod = 0x0000;
    this.timerCounter = 0x0000;
    this.envelopeEnabled = false;
    this.envelopeLoop = false;
    this.envelopeStart = false;
    this.envelopePeriod = 0x00;
    this.envelopeCounter = 0x00;
    this.envelopeVolume = 0x00;
    this.constantVolume = 0x00;
};

Noise.prototype = {

    writeControl: function (value) {
        this.lengthEnabled = (value & 0x20) === 0;
        this.envelopeLoop = (value & 0x20) === 0x20;
        this.envelopeEnabled = (value & 0x10) === 0;
        this.envelopePeriod = value & 15;
        this.constantVolume = value & 15;
        this.envelopeStart = true;
    },

    writePeriod: function (value) {
        this.mode = value & 0x80 === 0x80;
        this.timerPeriod = noiseTable[value & 0x0F];
    },

    writeLength: function (value) {
        this.lengthValue = lengthTable[value >> 3];
        this.envelopeStart = true;
    },

    stepTimer: function () {
        if (this.timerCounter === 0) {
            this.timerCounter = this.timerPeriod;
            let shift = this.mode ? 6 : 1;
            let b1 = this.shiftRegister & 1;
            let b2 = (this.shiftRegister >> shift) & 1;
            this.shiftRegister >>= 1;
            this.shiftRegister |= (b1 ^ b2) << 14;
        } else {
            this.timerCounter--;
        }
    },

    stepEnvelope: function () {
        if (this.envelopeStart === true) {
            this.envelopeVolume = 15;
            this.envelopeCounter = this.envelopePeriod;
            this.envelopeStart = false;
        } else if (this.envelopeCounter > 0) {
            this.envelopeCounter--;
        } else {
            if (this.envelopeVolume > 0) {
                this.envelopeVolume--;
            } else if (this.envelopeLoop === true) {
                this.envelopeVolume = 15;
            }
            this.envelopeCounter = this.envelopePeriod;
        }
    },

    stepLength: function () {
        if (this.lengthEnabled === true && this.lengthValue > 0) {
            this.lengthValue--;
        }
    },

    output: function () {
        if(this.enabled === false) {
            return 0;
        }
        if (this.lengthValue === 0) {
            return 0;
        }
        if ((this.shiftRegister & 1) === 1) {
            return 0;
        }
        return this.envelopeEnabled ? this.envelopeVolume : this.constantVolume;
    }

};
module.exports = Noise;