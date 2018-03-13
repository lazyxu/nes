let dmcTable = [
    214, 190, 170, 160, 143, 127, 113, 107, 95, 80, 71, 64, 53, 42, 36, 27,
];

let DMC = function () {
    this.enabled = false;
    this.value = 0x00;
    this.sampleAddress = 0x0000;
    this.sampleLength = 0x0000;
    this.currentAddress = 0x0000;
    this.currentLength = 0x0000;

    this.shiftRegister = 0x00;
    this.bitCount = 0x00;
    this.tickPeriod = 0x00;
    this.tickValue = 0x00;

    this.loop = false;
    this.irq = false;
};

DMC.prototype = {
    writeControl: function (value) {
        this.irq = value & 0x80 === 0x80;
        this.loop = value & 0x40 === 0x40;
        this.tickPeriod = dmcTable[value & 0x0F]
    },

    writeValue: function (value) {
        this.value = value & 0x7F;
    },

    writeAddress: function (value) {
        // Sample address = %11AAAAAA.AA000000
        this.sampleAddress = 0xC000 | (value << 6);
    },

    writeLength: function (value) {
        // Sample length = %0000LLLL.LLLL0001
        this.sampleLength = (value << 4) | 1;
    },

    restart: function () {
        this.currentAddress = this.sampleAddress;
        this.currentLength = this.sampleLength;
    },

    stepTimer: function () {
        if (!this.enabled) {
            return;
        }
        this.stepReader();
        if (this.tickValue === 0) {
            this.tickValue = this.tickPeriod;
            this.stepShifter();
        } else {
            this.tickValue--;
        }
    },

    stepReader: function () {
        if (this.currentLength > 0 && this.bitCount === 0) {
            this.cpu.stall += 4;
            this.shiftRegister = this.cpu.read(this.currentAddress);
            this.bitCount = 8;
            this.currentAddress++;
            if (this.currentAddress === 0) {
                this.currentAddress = 0x8000;
            }
            this.currentLength--;
            if (this.currentLength === 0 && this.loop) {
                this.restart();
            }
        }
    },

    stepShifter: function () {
        if (this.bitCount === 0) {
            return;
        }
        if ((this.shiftRegister & 1) === 1) {
            if (this.value <= 125) {
                this.value += 2;
            }
        } else {
            if (this.value >= 2) {
                this.value -= 2;
            }
        }
        this.shiftRegister >>= 1;
        this.bitCount--;
    },

    output: function () {
        return this.value;
    }
};

module.exports = DMC;