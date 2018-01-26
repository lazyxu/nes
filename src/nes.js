var INES = require("./ines");
var CPU = require("./cpu");

var NES = function (data) {
    this.ines = null;
    this.load(data);
    console.log(this);
    this.cpu = new CPU(this);
};

NES.prototype = {
    load: function (data) {
        this.ines = new INES();
        this.ines.load(data);
    }
};

module.exports = NES;