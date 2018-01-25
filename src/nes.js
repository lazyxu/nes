var INES = require("./ines");
var CPU = require("./cpu");

var NES = function () {
    this.cpu = new CPU();
};

NES.prototype = {
    load: function (data) {
        this.ines = new INES();
        this.ines.load(data);
    }
};

module.exports = NES;