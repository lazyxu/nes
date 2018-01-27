var INES = require("./ines");
var CPU = require("./cpu");
var PPU = require("./ppu");
var Mapper2 = require("./mapper2");

var NES = function (data) {
    this.ines = null;
    this.mapper = null;
    this.reset(data);
    console.log(this);
};

NES.prototype = {
    reset: function (data) {
        this.ines = new INES();
        this.ines.load(data);
        this.setMapper(this.ines.mapperType);
        console.log(this);
        this.cpu = new CPU(this);
        this.ppu = new PPU(this);
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