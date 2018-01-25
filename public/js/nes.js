(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("nesEmulator", [], factory);
	else if(typeof exports === 'object')
		exports["nesEmulator"] = factory();
	else
		root["nesEmulator"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = {
	    NES: __webpack_require__(1),
	    CPU: __webpack_require__(3)
	};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var INES = __webpack_require__(2);
	var CPU = __webpack_require__(3);

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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	// http://wiki.nesdev.com/w/index.php/INES
	// http://nesdev.com/NESDoc.pdf (p28)

	// The software that can be run using an emulator is usually referred to as a ROM image in
	// reference to the original ROM chips used to store it. A simple dump of the contents of the
	// cartridge is unlikely to be sufficient as it leaves no way to identify what each part of the file
	// means. Two different file formats have emerged to provide this information.
	// The iNES file format was originally defined by Marat Fayzullin for use in his iNES emulator.
	// The format has since been used by most emulators and is the most common format for ROM
	// images. INES format files should have the file extension *.nes. The format provides a 16 byte
	// header at the start of the file which contains important information.
	var INES = function () {
	    this.rpgRom = null; // rom
	    this.chrRom = null; // vrom
	    this.mapperType = null;
	    this.mirroring = null;
	    this.batteryRam = null;
	};

	INES.prototype = {
	    // Mirroring types:
	    HORIZONTAL_MIRRORING: 0,
	    VERTICAL_MIRRORING: 1,
	    FOURSCREEN_MIRRORING: 2,

	    // load reads an iNES file (.nes)
	    load: function (data) {
	        var header = new Array(16);
	        for (var i = 0; i < 16; i++) {
	            header[i] = data.charCodeAt(i) & 0xff;
	        }
	        //  identify the file as an iNES file: NES\x1a
	        if (header[0] !== 0x4e ||
	            header[1] !== 0x45 ||
	            header[2] !== 0x53 ||
	            header[3] !== 0x1a
	        ) {
	            throw new Error("Not a valid iNES file.");
	        }

	        // Number of 16 KB PRG-ROM banks.
	        // The PRG-ROM (Program ROM) is the area of ROM used to store the program code.
	        var numPRG = header[4];

	        // Number of 8 KB CHR-ROM / VROM banks.
	        // The names CHR-ROM (Character ROM) and VROM are used synonymously to
	        // refer to the area of ROM used to store graphics information, the pattern tables.
	        var numCHR = header[5];

	        // ROM Control Byte 1:
	        // • Bit 0 - Indicates the type of mirroring used by the game
	        //     where 0 indicates horizontal mirroring, 1 indicates
	        //     vertical mirroring.
	        // • Bit 1 - Indicates the presence of battery-backed RAM at
	        //     memory locations $6000-$7FFF.
	        // • Bit 2 - Indicates the presence of a 512-byte trainer at
	        //     memory locations $7000-$71FF.
	        // • Bit 3 - If this bit is set it overrides bit 0 to indicate fourscreen
	        //     mirroring should be used.
	        // • Bits 4-7 - Four lower bits of the mapper number.
	        var control1 = header[6];

	        this.mirroring = control1 & 1;
	        if (control1 & 8) {
	            this.mirroring = this.FOURSCREEN_MIRRORING;
	        }

	        this.batteryRam = (control1 & 2) !== 0;

	        var trainer = (control1 & 4) !== 0;

	        // ROM Control Byte 2:
	        // • Bits 0-3 - Reserved for future usage and should all be 0.
	        // • Bits 4-7 - Four upper bits of the mapper number.
	        var control2 = header[7];

	        this.mapperType = (control2 & 0xf0) | (control1 >> 4);

	        // Number of 8 KB RAM banks. For compatibility with previous
	        // versions of the iNES format, assume 1 page of RAM when
	        // this is 0.
	        var numRAM = header[8];

	        // Reserved for future usage and should all be 0.
	        for (var i = 9; i < 16; i++) {
	            if (header[i] !== 0) {
	                throw new Error("Reserved for future usage and should all be 0.");
	            }
	        }

	        // Following the header is the 512-byte trainer, if one is present, otherwise the ROM banks
	        // begin here, starting with PRG-ROM then CHR-ROM.

	        // Load PRG-ROM banks:
	        this.rpgRom = new Array(numPRG);
	        var offset = 16;
	        for (var i = 0; i < numPRG; i++) {
	            this.rpgRom[i] = new Array(0x4000);
	            for (var j = 0; j < 0x4000; j++) {
	                if (offset + j >= data.length) {
	                    break;
	                }
	                this.rpgRom[i][j] = data.charCodeAt(offset + j) & 0xff;
	            }
	            offset += 0x4000;
	        }

	        // Load CHR-ROM banks:
	        this.chrRom = new Array(numCHR);
	        for (i = 0; i < numCHR; i++) {
	            this.chrRom[i] = new Array(0x1000);
	            for (j = 0; j < 0x1000; j++) {
	                if (offset + j >= data.length) {
	                    break;
	                }
	                this.chrRom[i][j] = data.charCodeAt(offset + j) & 0xff;
	            }
	            offset += 0x1000;
	        }

	    }
	};

	module.exports = INES;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(6);
	module.exports = __webpack_require__(5);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	var CPU = __webpack_require__(5)

	CPU.read = function () {

	};
	CPU.write = function () {

	};

	// read16 reads two bytes using Read to return a double-word value
	CPU.read16 = function (address) {
	    return this.read(address) << 8
	        | this.read(address) << 8;
	};

	// push pushes a byte onto the stack
	CPU.push = function (value) {
	    this.Write(0x100 | this.SP, value);
	    this.SP--;
	};

	// pull pops a byte from the stack
	CPU.pull = function () {
	    this.SP++;
	    return this.Read(0x100 | this.SP);
	};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	// instructionSizes indicates the size of each instruction in bytes
	var instructionSizes = [
	    1, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
	    3, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
	    1, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
	    1, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 0, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 0, 3, 0, 0,
	    2, 2, 2, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 2, 1, 0, 3, 3, 3, 0,
	    2, 2, 0, 0, 2, 2, 2, 0, 1, 3, 1, 0, 3, 3, 3, 0
	];

	// instructionCycles indicates the number of cycles used by each instruction,
	// not including conditional cycles
	var instructionCycles = [
	    7, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 4, 4, 6, 6,
	    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
	    6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 4, 4, 6, 6,
	    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
	    6, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 3, 4, 6, 6,
	    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
	    6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 5, 4, 6, 6,
	    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
	    2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4,
	    2, 6, 2, 6, 4, 4, 4, 4, 2, 5, 2, 5, 5, 5, 5, 5,
	    2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4,
	    2, 5, 2, 5, 4, 4, 4, 4, 2, 4, 2, 4, 4, 4, 4, 4,
	    2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6,
	    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7,
	    2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6,
	    2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7
	];

	// instructionPageCycles indicates the number of cycles used by each
	// instruction when a page is crossed
	var instructionPageCycles = [
	    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
	    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
	    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
	    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
	    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1,
	    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0,
	    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0
	];

	const CPUFrequency = 1789773;

	var CPU = function () {
	};

	CPU.prototype = {
	    // interrupt types
	    interruptNone: 0,
	    interruptNMI: 1,
	    interruptIRQ: 2,
	    // IRQ_NORMAL: 0,
	    // IRQ_NMI: 1,
	    // IRQ_RESET: 2,

	    reset: function () {
	        this.PC = this.read16(0xFFFC);
	        this.SP = 0xFD;
	        this.setFlags(0x24);
	    }
	};

	module.exports = CPU;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var CPU = __webpack_require__(5)

	// flags returns the processor status flags
	CPU.flags = function () {
	    return this.N << 7
	        | this.V << 6
	        | this.U << 5
	        | this.B << 4
	        | this.D << 3
	        | this.I << 2
	        | this.Z << 1
	        | this.C << 0;
	};

	// setFlags sets the processor status flags
	CPU.setFlags = function (flags) {
	    this.C = (flags >> 0) & 1;
	    this.Z = (flags >> 1) & 1;
	    this.I = (flags >> 2) & 1;
	    this.D = (flags >> 3) & 1;
	    this.B = (flags >> 4) & 1;
	    this.U = (flags >> 5) & 1;
	    this.V = (flags >> 6) & 1;
	    this.N = (flags >> 7) & 1;
	};

	// setZ sets the zero flag if the argument is zero
	CPU.setZ = function (value) {
	    this.Z = value === 0;
	};

	// setN sets the negative flag if the argument is negative (high bit is set)
	CPU.setN = function (value) {
	    this.N = value & 0x80 !== 0;
	};

	// setZN sets the zero flag and the negative flag
	CPU.setZN = function (value) {
	    this.setZ(value);
	    this.setN(value);
	};



/***/ })
/******/ ])
});
;