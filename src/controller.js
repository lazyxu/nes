let Controller = function () {
    this.strobe = 0;
    this.buttons = new Array(8);
    this.index = 0;
};

Controller.prototype = {
    ButtonA: 0,
    ButtonB: 1,
    ButtonSelect: 2,
    ButtonStart: 3,
    ButtonUp: 4,
    ButtonDown: 5,
    ButtonLeft: 6,
    ButtonRight: 7,
    setA: function (value) {
        this.buttons[this.ButtonA] = value;
    },
    setB: function (value) {
        this.buttons[this.ButtonB] = value;
    },
    setSelect: function (value) {
        this.buttons[this.ButtonSelect] = value;
    },
    setStart: function (value) {
        this.buttons[this.ButtonStart] = value;
    },
    setUp: function (value) {
        this.buttons[this.ButtonUp] = value;
    },
    setDown: function (value) {
        this.buttons[this.ButtonDown] = value;
    },
    setLeft: function (value) {
        this.buttons[this.ButtonLeft] = value;
    },
    setRight: function (value) {
        this.buttons[this.ButtonRight] = value;
    },

    setButton(button, value) {
        this.buttons[button] = value;
    },

    setButtons(buttons) {
        this.buttons = buttons;
    },

    read: function () {
        let value = 0;
        if (this.index < 8 && this.buttons[this.index]) {
            value = 1;
        }
        this.index++;
        if (this.strobe) {
            this.index = 0;
        }
        return value;
    },

    write: function (value) {
        this.strobe = value;
        if (this.strobe) {
            this.index = 0;
        }
    }
};

module.exports = Controller;