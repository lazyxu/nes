var INES = require("./ines");
var CPU = require("./cpu");
var PPU = require("./ppu");
var Mapper2 = require("./mapper2");

var NES = function () {
    this.ines = null;
    this.mapper = null;
    this.reset();
    this.isRunning = false;
};

NES.prototype = {
    reset: function () {
        this.ines = new INES();
        this.cpu = new CPU(this);
        this.ppu = new PPU(this);
    },

    load: function (data) {
        this.ines.load(data);
        this.setMapper(this.ines.mapperType);
        this.cpu.load();
        this.isRunning = true;
    },

    // cpu step
    step: function () {
        let i;
        let cpuCycles = this.cpu.step();
        for (i = 0; i < cpuCycles * 3; i++) {
            this.ppu.step();
        }
        return cpuCycles;
    },

    run: function () {
        for (; this.isRunning === true;) {
            this.step();
        }
    },

    stop: function () {
        this.isRunning = false;
    },

    continue: function () {
        this.isRunning = true;
    },

    exit: function () {

    },

    setMapper: function (mapperType) {
        switch (mapperType) {
            case 0:
                this.mapper = new Mapper2(this);
                break;
            case 2:
                this.mapper = new Mapper2(this);
                break;
            default:
                throw new Error("unsupported mapper " + mapperType);
        }
    }
};

module.exports = NES;