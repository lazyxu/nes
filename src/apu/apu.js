let Pulse = require("./pulse");
let Triangle = require("./triangle");
let Noise = require("./noise");
let DMC = require("./dmc");
let Filter = require("./filter");
let pulseTable = new Array(31);
let tndTable = new Array(203);

let APU = function (cpu) {
    this.cpu = cpu;
    let i;
    for (i = 0; i < 31; i++) {
        pulseTable[i] = 95.52 / (8128.0 / i + 100);
    }
    for (i = 0; i < 203; i++) {
        tndTable[i] = 163.67 / (24329.0 / i + 100);
    }

    this.sampleRate = 44100.0;
    // 2个方波，1个三角波，1个噪声，1个差值调制通道（DMC）
    this.pulse1 = new Pulse(1);
    this.pulse2 = new Pulse(2);
    this.triangle = new Triangle();
    this.noise = new Noise();
    this.dmc = new DMC(this.cpu);
    this.cycle = 0x0000;
    this.framePeriod = 0x00;
    this.frameValue = 0x00;
    this.frameIRQ = false;

    this.noise.shiftRegister = 1;

    this.filters = [
        Filter.HighPassFilter(this.sampleRate, 90),
        Filter.HighPassFilter(this.sampleRate, 440),
        Filter.LowPassFilter(this.sampleRate, 14000)
    ];
    this.bufferSize = 44100;
    this.sampleBuffer = new Array(this.bufferSize);
    this.bufferIndex = 0;
    this.writeSamples = function () {

    };
};

APU.prototype = {
    frameCounterRate: 1789773 / 240.0,// CPUFrequency
    step: function () {
        let cycle1 = this.cycle;
        this.cycle++;
        if (this.cycle === Number.MAX_VALUE) {
            this.cycle = 0;
        }
        let cycle2 = this.cycle;
        this.stepTimer();
        let f1 = Math.floor(cycle1 / this.frameCounterRate);
        let f2 = Math.floor(cycle2 / this.frameCounterRate);
        if (f1 !== f2) {
            this.stepFrameCounter();
        }
        // let s1 = Math.floor(cycle1 / this.sampleRate);
        // let s2 = Math.floor(cycle2 / this.sampleRate);
        // if (s1 !== s2) {
        this.sample();
        // }
    },

    sample: function () {
        let x = this.output();
        for (let i = 0; i < this.filters.length; i++) {
            x = this.filters[i].step(x);
        }
        this.sampleBuffer[this.bufferIndex++] = x;
        if (this.bufferIndex === this.sampleBuffer.length) {
            this.writeSamples(this.sampleBuffer);
            this.sampleBuffer = new Array(this.bufferSize);
            this.bufferIndex = 0;
        }
    },

    /**
     * The following formula calculates the audio output level within the range of 0.0 to 1.0.
     * It is the sum of two sub-groupings of the channels:
     * output = pulse_out + tnd_out
     *
     *                             95.88
     * pulse_out = ------------------------------------
     *              (8128 / (pulse1 + pulse2)) + 100
     *
     *                                        159.79
     * tnd_out = -------------------------------------------------------------
     *                                     1
     *            ----------------------------------------------------- + 100
     *             (triangle / 8227) + (noise / 12241) + (dmc / 22638)
     *
     * The values for pulse1, pulse2, triangle, noise, and dmc are the output values for the corresponding channel.
     * The dmc value ranges from 0 to 127 and the others range from 0 to 15.
     *
     * @returns {number} [0.0, 1.0]
     */
    output: function () {
        let p1 = this.pulse1.output();
        let p2 = this.pulse2.output();
        let t = this.triangle.output();
        let n = this.noise.output();
        let d = this.dmc.output();
        let pulseOut = pulseTable[p1 + p2];
        // let pulseOut = 95.88 / ((8128 / (p1 + p2)) + 100);
        // let pulseOut = 95.88 / ((8128.0 / (this.pulse1.output() + this.pulse2.output())) + 100);
        let tndOut = tndTable[3 * t + 2 * n + d];
        // let tndOut = 159.79 / (100+1 / (t / 8227 + n / 12241 + d / 22638));
        // let tndOut = 159.79 / (100 + 1 / (this.triangle.output() / 8227.0 + this.noise.output() / 12241.0 + this.dmc.output() / 22638.0));
        // console.log(p1, p2, t, n, d, pulseOut + tndOut);
        return pulseOut + tndOut;
    },

// mode 0:    mode 1:       function
// ---------  -----------  -----------------------------
//  - - - f    - - - - -    IRQ (if bit 6 is clear)
//  - l - l    l - l - -    Length counter and sweep
//  e e e e    e e e e -    Envelope and linear counter
    stepFrameCounter: function () {
        switch (this.framePeriod) {
            case 4:
                this.frameValue = (this.frameValue + 1) % 4;
                switch (this.frameValue) {
                    case 0:
                    case 2:
                        this.stepEnvelope();
                        break;
                    case 1:
                        this.stepEnvelope();
                        this.stepSweep();
                        this.stepLength();
                        break;
                    case 3:
                        this.stepEnvelope();
                        this.stepSweep();
                        this.stepLength();
                        this.fireIRQ();
                        break;
                }
                break;
            case 5:
                this.frameValue = (this.frameValue + 1) % 5;
                switch (this.frameValue) {
                    case 1:
                    case 3:
                        this.stepEnvelope();
                        break;
                    case 0:
                    case 2:
                        this.stepEnvelope();
                        this.stepSweep();
                        this.stepLength();
                        break;
                }
                break;
        }
    },

    stepTimer: function () {
        if (this.cycle % 2 === 0) {
            this.pulse1.stepTimer();
            this.pulse2.stepTimer();
            this.noise.stepTimer();
            this.dmc.stepTimer();
        }
        this.triangle.stepTimer();
    },

    stepEnvelope: function () {
        this.pulse1.stepEnvelope();
        this.pulse2.stepEnvelope();
        this.triangle.stepCounter();
        this.noise.stepEnvelope();
    },

    stepSweep: function () {
        this.pulse1.stepSweep();
        this.pulse2.stepSweep();
    },

    stepLength: function () {
        this.pulse1.stepLength();
        this.pulse2.stepLength();
        this.triangle.stepLength();
        this.noise.stepLength();
    },

    fireIRQ: function () {
        if (this.frameIRQ) {
            this.cpu.triggerIRQ();
        }
    },

    readRegister: function (address) {
        switch (address) {
            case 0x4015:
                return this.readStatus();
            default:
                console.warn("unhandled apu register read at address: ", address)
        }
        return 0;
    },

    writeRegister: function (address, value) {
        value &= 0xff;
        switch (address) {
            case 0x4000:
                this.pulse1.writeControl(value);
                break;
            case 0x4001:
                this.pulse1.writeSweep(value);
                break;
            case 0x4002:
                this.pulse1.writeTimerLow(value);
                break;
            case 0x4003:
                this.pulse1.writeTimerHigh(value);
                break;
            case 0x4004:
                this.pulse2.writeControl(value);
                break;
            case 0x4005:
                this.pulse2.writeSweep(value);
                break;
            case 0x4006:
                this.pulse2.writeTimerLow(value);
                break;
            case 0x4007:
                this.pulse2.writeTimerHigh(value);
                break;
            case 0x4008:
                this.triangle.writeControl(value);
                break;
            case 0x4009:
                break;
            case 0x400A:
                this.triangle.writeTimerLow(value);
                break;
            case 0x400B:
                this.triangle.writeTimerHigh(value);
                break;
            case 0x400C:
                this.noise.writeControl(value);
                break;
            case 0x400D:
                break;
            case 0x400E:
                this.noise.writePeriod(value);
                break;
            case 0x400F:
                this.noise.writeLength(value);
                break;
            case 0x4010:
                this.dmc.writeControl(value);
                break;
            case 0x4011:
                this.dmc.writeValue(value);
                break;
            case 0x4012:
                this.dmc.writeAddress(value);
                break;
            case 0x4013:
                this.dmc.writeLength(value);
                break;
            case 0x4015:
                this.writeControl(value);
                break;
            case 0x4017:
                this.writeFrameCounter(value);
                break;
            default:
                console.warn("unhandled apu register write at address: ", address)
        }
    },

    /**
     * Status ($4015)
     * $4015 read    IF-D NT21    DMC interrupt (I), frame interrupt (F), DMC active (D), length counter > 0 (N/T/2/1)
     * N/T/2/1 will read as 1 if the corresponding length counter is greater than 0.
     * For the triangle channel, the status of the linear counter is irrelevant.
     * @returns {number}
     */
    readStatus: function () {
        let result = 0;
        if (this.pulse1.lengthValue > 0) {
            result |= 1;
        }
        if (this.pulse2.lengthValue > 0) {
            result |= 2;
        }
        if (this.triangle.lengthValue > 0) {
            result |= 4;
        }
        if (this.noise.lengthValue > 0) {
            result |= 8;
        }
        // D will read as 1 if the DMC bytes remaining is more than 0.
        if (this.dmc.currentLength > 0) {
            result |= 16;
        }
        // TODO: Reading this register clears the frame interrupt flag (but not the DMC interrupt flag).
        // TODO: If an interrupt flag was set at the same moment of the read, it will read back as 1 but it will not be cleared.
        return result;
    },

    /**
     * Status ($4015)
     * $4015 write    ---D NT21    Enable DMC (D), noise (N), triangle (T), and pulse channels (2/1)
     * Writing a zero to any of the channel enable bits will silence that channel and immediately set its length counter to 0.
     * @param value: 8bit
     */
    writeControl: function (value) {
        this.pulse1.enabled = (value & 1) === 1;
        this.pulse2.enabled = (value & 2) === 2;
        this.triangle.enabled = (value & 4) === 4;
        this.noise.enabled = (value & 8) === 8;
        this.dmc.enabled = (value & 16) === 16;
        if (!this.pulse1.enabled) {
            this.pulse1.lengthValue = 0;
        }
        if (!this.pulse2.enabled) {
            this.pulse2.lengthValue = 0;
        }
        if (!this.triangle.enabled) {
            this.triangle.lengthValue = 0;
        }
        if (!this.noise.enabled) {
            this.noise.lengthValue = 0;
        }
        if (!this.dmc.enabled) { // If the DMC bit is clear, the DMC bytes remaining will be set to 0 and the DMC will silence when it empties.
            this.dmc.currentLength = 0;
        } else {
            // If the DMC bit is set, the DMC sample will be restarted only if its bytes remaining is 0.
            // TODO： If there are bits remaining in the 1-byte sample buffer, these will finish playing before the next sample is fetched.
            if (this.dmc.currentLength === 0) {
                this.dmc.restart();
            }
        }
        // TODO: Writing to this register clears the DMC interrupt flag.
        // TODO: Power-up and reset have the effect of writing $00, silencing all channels.
    },

    // TODO: not complete
    /**
     * Frame Counter ($4017)
     * $4017    MI-- ----    Mode (M, 0 = 4-step, 1 = 5-step), IRQ inhibit flag (I)
     * @param value: 8bit
     */
    writeFrameCounter: function (value) {
        this.framePeriod = ((value >> 7) & 1) === 0 ? 4 : 5;
        this.frameIRQ = (value >> 6) & 1 === 0;
        // this.frameValue = 0;
        if (this.framePeriod === 5) {
            this.stepEnvelope();
            this.stepSweep();
            this.stepLength();
        }
    }

};
module.exports = APU;