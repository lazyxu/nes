(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("nesEmulator", [], factory);
	else if(typeof exports === 'object')
		exports["nesEmulator"] = factory();
	else
		root["nesEmulator"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
    NES: __webpack_require__(1)
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var INES = __webpack_require__(2);
var CPU = __webpack_require__(3);
var PPU = __webpack_require__(5);
var Mapper2 = __webpack_require__(6);

var NES = function () {
    this.ines = null;
    this.mapper = null;
    this.reset();
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
    },

    step: function () {
        var i;
        var cpuCycles = this.cpu.step();
        for (i = 0; i < cpuCycles * 3; i++) {
            this.ppu.step();
        }
        return cpuCycles;
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
    this.sram = new Array(0x2000); // save ram
    for (var i = 0; i < this.sram.length; i++) {
        this.sram[i] = 0;
    }
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
        this.data = data;
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
        var numPpgRom = header[4];

        // Number of 8 KB CHR-ROM / VROM banks.
        // The names CHR-ROM (Character ROM) and VROM are used synonymously to
        // refer to the area of ROM used to store graphics information, the pattern tables.
        var numChrRom = header[5];

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
        var numRpgRam = header[8];

        // Reserved for future usage and should all be 0.
        for (var i = 9; i < 16; i++) {
            if (header[i] !== 0) {
                throw new Error("Reserved for future usage and should all be 0.");
            }
        }

        // Following the header is the 512-byte trainer, if one is present, otherwise the ROM banks
        // begin here, starting with PRG-ROM then CHR-ROM.

        // Load PRG-ROM banks:
        this.rpgRom = new Array(numPpgRom);
        var offset = 16;
        for (var i = 0; i < numPpgRom; i++) {
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
        this.chrRom = new Array(numChrRom);
        for (var i = 0; i < numChrRom; i++) {
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

const modeAbsolute = 1;
const modeAbsoluteX = 2;
const modeAbsoluteY = 3;
const modeAccumulator = 4;
const modeImmediate = 5;
const modeImplied = 6;
const modeIndexedIndirect = 7;
const modeIndirect = 8;
const modeIndirectIndexed = 9;
const modeRelative = 10;
const modeZeroPage = 11;
const modeZeroPageX = 12;
const modeZeroPageY = 13;

// instructionModes indicates the addressing mode for each instruction
var instructionModes = [
    6, 7, 6, 7, 11, 11, 11, 11, 6, 5, 4, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    1, 7, 6, 7, 11, 11, 11, 11, 6, 5, 4, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    6, 7, 6, 7, 11, 11, 11, 11, 6, 5, 4, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    6, 7, 6, 7, 11, 11, 11, 11, 6, 5, 4, 5, 8, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    5, 7, 5, 7, 11, 11, 11, 11, 6, 5, 6, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 13, 13, 6, 3, 6, 3, 2, 2, 3, 3,
    5, 7, 5, 7, 11, 11, 11, 11, 6, 5, 6, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 13, 13, 6, 3, 6, 3, 2, 2, 3, 3,
    5, 7, 5, 7, 11, 11, 11, 11, 6, 5, 6, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2,
    5, 7, 5, 7, 11, 11, 11, 11, 6, 5, 6, 5, 1, 1, 1, 1,
    10, 9, 6, 9, 12, 12, 12, 12, 6, 3, 6, 3, 2, 2, 2, 2
];

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

// instructioncycles indicates the number of cycles used by each instruction,
// not including conditional cycles
var instructioncycles = [
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

// instructionPagecycles indicates the number of cycles used by each
// instruction when a page is crossed
var instructionPagecycles = [
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

// instructionNames indicates the name of each instruction
var instructionNames = [
    "BRK", "ORA", "KIL", "SLO", "NOP", "ORA", "ASL", "SLO", "PHP", "ORA", "ASL", "ANC", "NOP", "ORA", "ASL", "SLO",
    "BPL", "ORA", "KIL", "SLO", "NOP", "ORA", "ASL", "SLO", "CLC", "ORA", "NOP", "SLO", "NOP", "ORA", "ASL", "SLO",
    "JSR", "AND", "KIL", "RLA", "BIT", "AND", "ROL", "RLA", "PLP", "AND", "ROL", "ANC", "BIT", "AND", "ROL", "RLA",
    "BMI", "AND", "KIL", "RLA", "NOP", "AND", "ROL", "RLA", "SEC", "AND", "NOP", "RLA", "NOP", "AND", "ROL", "RLA",
    "RTI", "EOR", "KIL", "SRE", "NOP", "EOR", "LSR", "SRE", "PHA", "EOR", "LSR", "ALR", "JMP", "EOR", "LSR", "SRE",
    "BVC", "EOR", "KIL", "SRE", "NOP", "EOR", "LSR", "SRE", "CLI", "EOR", "NOP", "SRE", "NOP", "EOR", "LSR", "SRE",
    "RTS", "ADC", "KIL", "RRA", "NOP", "ADC", "ROR", "RRA", "PLA", "ADC", "ROR", "ARR", "JMP", "ADC", "ROR", "RRA",
    "BVS", "ADC", "KIL", "RRA", "NOP", "ADC", "ROR", "RRA", "SEI", "ADC", "NOP", "RRA", "NOP", "ADC", "ROR", "RRA",
    "NOP", "STA", "NOP", "SAX", "STY", "STA", "STX", "SAX", "DEY", "NOP", "TXA", "XAA", "STY", "STA", "STX", "SAX",
    "BCC", "STA", "KIL", "AHX", "STY", "STA", "STX", "SAX", "TYA", "STA", "TXS", "TAS", "SHY", "STA", "SHX", "AHX",
    "LDY", "LDA", "LDX", "LAX", "LDY", "LDA", "LDX", "LAX", "TAY", "LDA", "TAX", "LAX", "LDY", "LDA", "LDX", "LAX",
    "BCS", "LDA", "KIL", "LAX", "LDY", "LDA", "LDX", "LAX", "CLV", "LDA", "TSX", "LAS", "LDY", "LDA", "LDX", "LAX",
    "CPY", "CMP", "NOP", "DCP", "CPY", "CMP", "DEC", "DCP", "INY", "CMP", "DEX", "AXS", "CPY", "CMP", "DEC", "DCP",
    "BNE", "CMP", "KIL", "DCP", "NOP", "CMP", "DEC", "DCP", "CLD", "CMP", "NOP", "DCP", "NOP", "CMP", "DEC", "DCP",
    "CPX", "SBC", "NOP", "ISC", "CPX", "SBC", "INC", "ISC", "INX", "SBC", "NOP", "SBC", "CPX", "SBC", "INC", "ISC",
    "BEQ", "SBC", "KIL", "ISC", "NOP", "SBC", "INC", "ISC", "SED", "SBC", "NOP", "ISC", "NOP", "SBC", "INC", "ISC"
];

const CPUFrequency = 1789773;

// interrupt types
const interruptNone = 0;
const interruptNMI = 1;
const interruptIRQ = 2;
const interruptRESET = 3;

var CPU = function (nes) {
    this.nes = nes;
    this.ram = new Array(2048);
    for (var i = 0; i < this.ram.length; i++) {
        this.ram = 0;
    }
    this.cycles = null;
    this.stall = null;
    this.A = 0;
    this.X = 0;
    this.Y = 0;
    this.SP = null;
    this.N = null;
    this.V = null;
    this.U = null;
    this.B = null;
    this.D = null;
    this.I = null;
    this.Z = null;
    this.C = null;
    this.reset();
};
var util = __webpack_require__(4);

CPU.prototype = {
    // reset resets the CPU to its initial power_up state
    reset: function () {
        this.SP = 0xFD;
        this.setFlags(0x24);
        this.interrupt = interruptNone;
    },

    load: function () {
        this.PC = this.read16(0xFFFC);
    },

    // PrintInstruction prints the current CPU state
    printInstruction: function () {
        var opcode = this.read(this.PC);
        var bytes = instructionSizes[opcode];
        var name = instructionNames[opcode];
        var w1 = "  ";
        var w2 = "  ";
        if (bytes > 1) {
            w1 = this.read(this.PC + 1).toString(16);
        }
        if (bytes > 2) {
            w2 = this.read(this.PC + 2).toString(16);
        }
        return util.sprintf("%04X  %02s %02s %02s %01s%s %28s" +
            "A:%02X X:%02X Y:%02X P:%02X SP:%02X CYC:%3d\n",
            this.PC, opcode.toString(16), w1, w2, name === "NOP" && opcode !== 0xEA ? "*" : " ", name, "",
            this.A, this.X, this.Y, this.flags(), this.SP, (this.cycles * 3) % 341);
    },

    // step executes a single CPU instruction
    step: function () {
        if (this.stall > 0) {
            this.stall--;
            return 1;
        }

        var cycles = this.cycles;

        // interrupt
        switch (this.interrupt) {
            case interruptIRQ:
                this.irq();
            case interruptNMI:
                this.nmi();
        }
        this.interrupt = interruptNone;
        var opcode = this.read(this.PC);
        var mode = instructionModes[opcode];

        var address = null;
        var pageCrossed = null;
        switch (mode) {
            case modeAbsolute:
                address = this.read16(this.PC + 1);
                break;
            case modeAbsoluteX:
                address = this.read16(this.PC + 1) + this.X;
                pageCrossed = this.pagesDiffer(address - this.X, address);
                break;
            case modeAbsoluteY:
                address = this.read16(this.PC + 1) + this.Y;
                pageCrossed = this.pagesDiffer(address - this.Y, address);
                break;
            case modeAccumulator:
                address = 0;
                break;
            case modeImmediate:
                address = this.PC + 1;
                break;
            case modeImplied:
                address = 0;
                break;
            case modeIndexedIndirect:
                address = this.read16bug((this.read(this.PC + 1) + this.X) & 0xff);
                break;
            case modeIndirect:
                address = this.read16bug(this.read16(this.PC + 1));
                break;
            case modeIndirectIndexed:
                address = this.read16bug(this.read(this.PC + 1)) + this.Y;
                pageCrossed = this.pagesDiffer(address - this.Y, address);
                break;
            case modeRelative:
                var offset = this.read(this.PC + 1);
                if (offset < 0x80) {
                    address = (this.PC + 2 + offset) & 0xFFFF;
                } else {
                    address = (this.PC + 2 + offset - 0x100) & 0xFFFF;
                }
                break;
            case modeZeroPage:
                address = this.read(this.PC + 1);
                break;
            case modeZeroPageX:
                address = (this.read(this.PC + 1) + this.X) & 0xff;
                break;
            case modeZeroPageY:
                address = (this.read(this.PC + 1) + this.Y) & 0xff;
                break;
        }
        this.PC += instructionSizes[opcode];
        this.cycles += instructioncycles[opcode];
        if (pageCrossed) {
            this.cycles += instructionPagecycles[opcode];
        }
        // console.log(opcode, instructionNames[opcode], address.toString(16), mode, instructioncycles[opcode], pageCrossed, instructionPagecycles[opcode]);
        eval('this.' + instructionNames[opcode] + '(address, this.PC, mode)');

        return this.cycles - cycles;
    },

    /* interrupt ---------------------------------------------------------------------------------------------------- */

    // triggerNMI causes a non-maskable interrupt to occur on the next cycle
    triggerNMI: function () {
        this.interrupt = interruptNMI;
    },

    // triggerIRQ causes an IRQ interrupt to occur on the next cycle
    triggerIRQ: function () {
        if (this.I === 0) {
            this.interrupt = interruptIRQ;
        }
    },

    // NMI - Non-Maskable Interrupt
    nmi: function () {
        this.push16(this.PC);
        this.PHP(null);
        this.PC = this.read16(0xFFFA);
        this.I = 1;
        this.cycles += 7;
    },

    // IRQ - IRQ Interrupt
    irq: function () {
        this.push16(this.PC);
        this.PHP(null);
        this.PC = this.read16(0xFFFE);
        this.I = 1;
        this.cycles += 7;
    },

    // RESET - RESET Interrupt
    RESET: function () {
        this.push16(this.PC);
        this.PHP(null);
        this.PC = this.read16(0xFFFC);
        this.I = 1;
        this.cycles += 7;
    },

    /* register ----------------------------------------------------------------------------------------------------- */
    // flags returns the processor status flags
    flags: function () {
        return this.N << 7
            | this.V << 6
            | this.U << 5
            | this.B << 4
            | this.D << 3
            | this.I << 2
            | this.Z << 1
            | this.C << 0;
    },

    // setFlags sets the processor status flags
    setFlags: function (flags) {
        this.C = (flags >> 0) & 1;
        this.Z = (flags >> 1) & 1;
        this.I = (flags >> 2) & 1;
        this.D = (flags >> 3) & 1;
        this.B = (flags >> 4) & 1;
        this.U = (flags >> 5) & 1;
        this.V = (flags >> 6) & 1;
        this.N = (flags >> 7) & 1;
    },

    // setZ sets the zero flag if the argument is zero
    setZ: function (value) {
        value &= 0xff;
        this.Z = value === 0 ? 1 : 0;
    },

    // setN sets the negative flag if the argument is negative (high bit is set)
    setN: function (value) {
        value &= 0xff;
        this.N = (value & 0x80) !== 0 ? 1 : 0;
    },

    // setZN sets the zero flag and the negative flag
    setZN: function (value) {
        this.setZ(value);
        this.setN(value);
    },

    /* memory ------------------------------------------------------------------------------------------------------- */
    // pagesDiffer returns true if the two addresses reference different pages
    pagesDiffer: function (a, b) {
        return (a & 0xFF00) !== (b & 0xFF00);
    },

    read: function (address) {
        address &= 0xFFFF;
        // console.warn('cpu memory read', address.toString(16));
        if (address < 0x2000) {
            return this.ram[address % 0x800];
        }
        if (address < 0x4000) {
            return this.nes.ppu.readRegister(0x2000 + (address - 0x2000) % 8);
        }
        if (address < 0x4020) {
            switch (address - 0x4000) {
                case 4014:
                    return this.nes.ppu.readRegister(address);
                default:
                    throw new Error("unhandled I/O Registers II read at address: " + address.toString(16));
            }
        }
        if (address < 0x6000) {
            throw new Error("unhandled Expansion ROM read at address: " + address.toString(16));
        }
        if (address >= 0x6000) {
            return this.nes.mapper.read(address);
        }
        throw new Error("unhandled cpu memory read at address: " + address.toString(16));
    },

    write: function (address, value) {
        address &= 0xFFFF;
        value &= 0xff;
        // console.warn('cpu memory write', address.toString(16), value.toString(16));
        if (address < 0x2000) {
            this.ram[address % 0x800] = value;
            return;
        }
        if (address < 0x4000) {
            this.nes.ppu.writeRegister(0x2000 + (address - 0x2000) % 8, value);
            return;
        }
        if (address < 0x4020) {
            switch (address - 0x4000) {
                case 4014:
                    this.nes.ppu.writeRegister(address, value);
                    return;
                default:
                    throw new Error("unhandled I/O Registers II write at address: " + address.toString(16));
            }
        }
        if (address < 0x6000) {
            throw new Error("unhandled Expansion ROM write at address: " + address.toString(16));
        }
        if (address >= 0x6000) {
            this.nes.mapper.write(address, value);
            return;
        }
        throw new Error("unhandled cpu memory write at address: " + address.toString(16));
    },

    // read16 reads two bytes using read to return a double-word value
    read16: function (address) {
        var lo = this.read(address);
        var hi = this.read(address + 1);
        return ((hi & 0xff) << 8) | (lo & 0xff);
    },

    // read16bug emulates a 6502 bug that caused the low byte to wrap without
    // incrementing the high byte
    read16bug: function (address) {
        var a = address;
        var b = (a & 0xFF00) | ((a + 1) & 0xff);
        var lo = this.read(a);
        var hi = this.read(b);
        return ((hi & 0xff) << 8) | (lo & 0xff);
    },

    // push pushes a byte onto the stack
    push: function (value) {
        this.write(0x100 | this.SP, value);
        this.SP = (this.SP - 1) & 0xFF;
    },

    // pull pops a byte from the stack
    pull: function () {
        this.SP = (this.SP + 1) & 0xFF;
        return this.read(0x100 | this.SP);
    },

    push16: function (value) {
        var hi = (value >> 8) & 0xff;
        var lo = value & 0xff;
        this.push(hi);
        this.push(lo);
    },

    pull16: function () {
        var lo = this.pull();
        var hi = this.pull();
        return ((hi & 0xff) << 8) | (lo & 0xff);
    },

    /* instruction -------------------------------------------------------------------------------------------------- */
    // ADC - Add with Carry
    ADC: function (address, pc, mode) {
        var a = this.A;
        var b = this.read(address);
        var c = this.C;
        this.A = (a + b + c) & 0XFF;
        this.setZN(this.A);
        this.C = (a + b + c) > 0xFF ? 1 : 0;
        if (((a ^ b) & 0x80) === 0 && ((a ^ this.A) & 0x80) !== 0) {
            this.V = 1;
        } else {
            this.V = 0;
        }
    },

    // AND - Logical AND
    AND: function (address, pc, mode) {
        this.A = this.A & this.read(address);
        this.setZN(this.A);
    },

    // ASL - Arithmetic Shift Left
    ASL: function (address, pc, mode) {
        if (mode === modeAccumulator) {
            this.C = (this.A >> 7) & 1;
            this.A = (this.A << 1) & 0xff;
            this.setZN(this.A);
        } else {
            var value = this.read(address);
            this.C = (value >> 7) & 1;
            // value <<= 1;
            value = (value << 1) & 0xff;
            this.write(address, value);
            this.setZN(value);
        }
    },

    // addBranchCycles adds a cycle for taking a branch and adds another cycle if the branch jumps to a new page
    addBranchCycles: function (address, pc) {
        this.cycles++;
        if (this.pagesDiffer(pc, address)) {
            this.cycles++;
        }
    },

    // BCC - Branch if Carry Clear
    BCC: function (address, pc, mode) {
        if (this.C === 0) {
            this.PC = address;
            this.addBranchCycles(address, pc);
        }
    },

    // BCS - Branch if Carry Set
    BCS: function (address, pc, mode) {
        if (this.C !== 0) {
            this.PC = address;
            this.addBranchCycles(address, pc);
        }
    },

    // BEQ - Branch if Equal
    BEQ: function (address, pc, mode) {
        if (this.Z !== 0) {
            this.PC = address;
            this.addBranchCycles(address, pc);
        }
    },

    // BIT - Bit Test
    BIT: function (address, pc, mode) {
        var value = this.read(address);
        this.V = (value >> 6) & 1;
        this.setZ(value & this.A);
        this.setN(value);
    },

    // BMI - Branch if Minus
    BMI: function (address, pc, mode) {
        if (this.N !== 0) {
            this.PC = address;
            this.addBranchCycles(address, pc);
        }
    },

    // BNE - Branch if Not Equal
    BNE: function (address, pc, mode) {
        if (this.Z === 0) {
            this.PC = address;
            this.addBranchCycles(address, pc);
        }
    },

    // BPL - Branch if Positive
    BPL: function (address, pc, mode) {
        if (this.N === 0) {
            this.PC = address;
            this.addBranchCycles(address, pc);
        }
    },

    // BRK - Force Interrupt
    BRK: function (address, pc, mode) {
        this.push16(this.PC);
        this.PHP(address, pc, mode);
        this.SEI(address, pc, mode);
        this.PC = this.read16(0xFFFE);
    },

    // BVC - Branch if Overflow Clear
    BVC: function (address, pc, mode) {
        if (this.V === 0) {
            this.PC = address;
            this.addBranchCycles(address, pc);
        }
    },

    // BVS - Branch if Overflow Set
    BVS: function (address, pc, mode) {
        if (this.V !== 0) {
            this.PC = address;
            this.addBranchCycles(address, pc);
        }
    },

    // CLC - Clear Carry Flag
    CLC: function (address, pc, mode) {
        this.C = 0;
    },

    // CLD - Clear Decimal Mode
    CLD: function (address, pc, mode) {
        this.D = 0;
    },

    // CLI - Clear Interrupt Disable
    CLI: function (address, pc, mode) {
        this.I = 0;
    },

    // CLV - Clear Overflow Flag
    CLV: function (address, pc, mode) {
        this.V = 0;
    },

    compare: function (a, b) {
        this.setZN(a - b);
        this.C = a >= b ? 1 : 0;
    },

    // CMP - Compare
    CMP: function (address, pc, mode) {
        var value = this.read(address);
        this.compare(this.A, value);
    },

    // CPX - Compare X Register
    CPX: function (address, pc, mode) {
        var value = this.read(address);
        this.compare(this.X, value);
    },

    // CPY - Compare Y Register
    CPY: function (address, pc, mode) {
        var value = this.read(address);
        this.compare(this.Y, value);
    },

    // DEC - Decrement Memory
    DEC: function (address, pc, mode) {
        var value = (this.read(address) - 1) & 0XFF;
        this.write(address, value);
        this.setZN(value);
    },

    // DEX - Decrement X Register
    DEX: function (address, pc, mode) {
        this.X = (this.X - 1) & 0xff;
        this.setZN(this.X);
    },

    // DEY - Decrement Y Register
    DEY: function (address, pc, mode) {
        this.Y = (this.Y - 1) & 0xff;
        this.setZN(this.Y);
    },

    // EOR - Exclusive OR
    EOR: function (address, pc, mode) {
        this.A = this.A ^ this.read(address);
        this.setZN(this.A);
    },

    // INC - Increment Memory
    INC: function (address, pc, mode) {
        var value = (this.read(address) + 1) & 0XFF;
        this.write(address, value);
        this.setZN(value);
    },

    // INX - Increment X Register
    INX: function (address, pc, mode) {
        this.X = (this.X + 1) & 0xff;
        this.setZN(this.X);
    },

    // INY - Increment Y Register
    INY: function (address, pc, mode) {
        this.Y = (this.Y + 1) & 0xff;
        this.setZN(this.Y);
    },

    // JMP - Jump
    JMP: function (address, pc, mode) {
        this.PC = address;
    },

    // JSR - Jump to Subroutine
    JSR: function (address, pc, mode) {
        this.push16(this.PC - 1);
        this.PC = address;
    },

    // LDA - Load Accumulator
    LDA: function (address, pc, mode) {
        this.A = this.read(address);
        this.setZN(this.A);
    },

    // LDX - Load X Register
    LDX: function (address, pc, mode) {
        this.X = this.read(address);
        this.setZN(this.X);
    },

    // LDY - Load Y Register
    LDY: function (address, pc, mode) {
        this.Y = this.read(address);
        this.setZN(this.Y);
    },

    // LSR - Logical Shift Right
    LSR: function (address, pc, mode) {
        if (mode === modeAccumulator) {
            this.C = this.A & 1;
            this.A >>= 1;
            this.setZN(this.A);
        } else {
            var value = this.read(address);
            this.C = value & 1;
            value >>= 1;
            this.write(address, value);
            this.setZN(value);
        }
    },

    // NOP - No Operation
    NOP: function (address, pc, mode) {
    },

    // ORA - Logical Inclusive OR
    ORA: function (address, pc, mode) {
        this.A = this.A | this.read(address);
        this.setZN(this.A);
    },

    // PHA - Push Accumulator
    PHA: function (address, pc, mode) {
        this.push(this.A);
    },

    // PHP - Push Processor Status
    PHP: function (address, pc, mode) {
        this.push(this.flags() | 0x10);
    },

    // PLA - Pull Accumulator
    PLA: function (address, pc, mode) {
        this.A = this.pull();
        this.setZN(this.A);
    },

    // PLP - Pull Processor Status
    PLP: function (address, pc, mode) {
        this.setFlags(this.pull() & 0xEF | 0x20)
    },

    // ROL - Rotate Left
    ROL: function (address, pc, mode) {
        var c = this.C;
        if (mode === modeAccumulator) {
            this.C = (this.A >> 7) & 1;
            this.A = ((this.A << 1) | c) & 0xff;
            this.setZN(this.A);
        } else {
            var value = this.read(address);
            this.C = (value >> 7) & 1;
            value = ((value << 1) | c) & 0xff;
            this.write(address, value);
            this.setZN(value);
        }
    },

    // ROR - Rotate Right
    ROR: function (address, pc, mode) {
        var c = this.C;
        if (mode === modeAccumulator) {
            this.C = this.A & 1;
            this.A = ((this.A >> 1) | (c << 7)) & 0xff;
            this.setZN(this.A);
        } else {
            var value = this.read(address);
            this.C = value & 1;
            value = ((value >> 1) | (c << 7)) & 0xff;
            this.write(address, value);
            this.setZN(value);
        }
    },

    // RTI - Return from Interrupt
    RTI: function (address, pc, mode) {
        this.setFlags(this.pull() & 0xEF | 0x20);
        this.PC = this.pull16();
    },

    // RTS - Return from Subroutine
    RTS: function (address, pc, mode) {
        this.PC = this.pull16() + 1;
    },

    // SBC - Subtract with Carry
    SBC: function (address, pc, mode) {
        var a = this.A;
        var b = this.read(address);
        var c = this.C;
        this.A = (a - b - (1 - c)) & 0XFF;
        this.setZN(this.A);
        if ((a - b - (1 - c)) >= 0) {
            this.C = 1;
        } else {
            this.C = 0;
        }
        if (((a ^ b) & 0x80) !== 0 && ((a ^ this.A) & 0x80) !== 0) {
            this.V = 1;
        } else {
            this.V = 0;
        }
    },

    // SEC - Set Carry Flag
    SEC: function (address, pc, mode) {
        this.C = 1;
    },

    // SED - Set Decimal Flag
    SED: function (address, pc, mode) {
        this.D = 1;
    },

    // SEI - Set Interrupt Disable
    SEI: function (address, pc, mode) {
        this.I = 1;
    },

    // STA - Store Accumulator
    STA: function (address, pc, mode) {
        this.write(address, this.A);
    },

    // STX - Store X Register
    STX: function (address, pc, mode) {
        this.write(address, this.X);
    },

    // STY - Store Y Register
    STY: function (address, pc, mode) {
        this.write(address, this.Y);
    },

    // TAX - Transfer Accumulator to X
    TAX: function (address, pc, mode) {
        this.X = this.A;
        this.setZN(this.X)

    },

    // TAY - Transfer Accumulator to Y
    TAY: function (address, pc, mode) {
        this.Y = this.A;
        this.setZN(this.Y)
    },

    // TSX - Transfer Stack Pointer to X
    TSX: function (address, pc, mode) {
        this.X = this.SP;
        this.setZN(this.X)
    },

    // TXA - Transfer Index X to Accumulator
    TXA: function (address, pc, mode) {
        this.A = this.X;
        this.setZN(this.A)
    },

    // TXS - Transfer Index X to Stack Pointer
    TXS: function (address, pc, mode) {
        this.SP = this.X;
    },

    // TYA - Transfer Index Y to Accumulator
    TYA: function (address, pc, mode) {
        this.A = this.Y;
        this.setZN(this.A)
    },

    // illegal opcodes below
    AHX: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    ALR: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    ANC: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    ARR: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    AXS: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    DCP: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    ISC: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    KIL: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    LAS: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    LAX: function (address, pc, mode) {
        // var value = this.read(address);
        // this.A = value;
        // this.X = value;
        // this.setZN(value);
        throw new Error("illegal instruction");
    },
    RLA: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    RRA: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    SAX: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    SHX: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    SHY: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    SLO: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    SRE: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    TAS: function (address, pc, mode) {
        throw new Error("illegal instruction");
    },
    XAA: function (address, pc, mode) {
        throw new Error("illegal instruction");
    }
};

module.exports = CPU;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function str_repeat(i, m) {
    for (var o = []; m > 0; o[--m] = i) ;
    return o.join('');
}

exports.sprintf = function() {
    var i = 0, a, f = arguments[i++], o = [], m, p, c, x, s = '';
    while (f) {
        if (m = /^[^\x25]+/.exec(f)) {
            o.push(m[0]);
        }
        else if (m = /^\x25{2}/.exec(f)) {
            o.push('%');
        }
        else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
            if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) {
                throw('Too few arguments.');
            }
            if (/[^s]/.test(m[7]) && (typeof(a) != 'number')) {
                throw('Expecting number but found ' + typeof(a));
            }
            switch (m[7]) {
                case 'b':
                    a = a.toString(2);
                    break;
                case 'c':
                    a = String.fromCharCode(a);
                    break;
                case 'd':
                    a = parseInt(a);
                    break;
                case 'e':
                    a = m[6] ? a.toExponential(m[6]) : a.toExponential();
                    break;
                case 'f':
                    a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a);
                    break;
                case 'o':
                    a = a.toString(8);
                    break;
                case 's':
                    a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a);
                    break;
                case 'u':
                    a = Math.abs(a);
                    break;
                case 'x':
                    a = a.toString(16);
                    break;
                case 'X':
                    a = a.toString(16).toUpperCase();
                    break;
            }
            a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+' + a : a);
            c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
            x = m[5] - String(a).length - s.length;
            p = m[5] ? str_repeat(c, x) : '';
            o.push(s + (m[4] ? a + p : p + a));
        }
        else {
            throw('Huh ?!');
        }
        f = f.substring(m[0].length);
    }
    return o.join('');
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

const mirrorHorizontal = 0;
const mirrorVertical = 1;
const mirrorSingle0 = 2;
const mirrorSingle1 = 3;
const mirrorFour = 4;
var mirrorLookup = [
    [0, 0, 1, 1],
    [0, 1, 0, 1],
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 1, 2, 3]
];
var palette = [
    0x666666, 0x002A88, 0x1412A7, 0x3B00A4, 0x5C007E, 0x6E0040, 0x6C0600, 0x561D00,
    0x333500, 0x0B4800, 0x005200, 0x004F08, 0x00404D, 0x000000, 0x000000, 0x000000,
    0xADADAD, 0x155FD9, 0x4240FF, 0x7527FE, 0xA01ACC, 0xB71E7B, 0xB53120, 0x994E00,
    0x6B6D00, 0x388700, 0x0C9300, 0x008F32, 0x007C8D, 0x000000, 0x000000, 0x000000,
    0xFFFEFF, 0x64B0FF, 0x9290FF, 0xC676FF, 0xF36AFF, 0xFE6ECC, 0xFE8170, 0xEA9E22,
    0xBCBE00, 0x88D800, 0x5CE430, 0x45E082, 0x48CDDE, 0x4F4F4F, 0x000000, 0x000000,
    0xFFFEFF, 0xC0DFFF, 0xD3D2FF, 0xE8C8FF, 0xFBC2FF, 0xFEC4EA, 0xFECCC5, 0xF7D8A5,
    0xE4E594, 0xCFEF96, 0xBDF4AB, 0xB3F3CC, 0xB5EBF2, 0xB8B8B8, 0x000000, 0x000000
];

function mirrorAddress(mode, address) {
    address = (address - 0x2000) % 0x1000;
    return 0x2000 + mirrorLookup[mode][address / 0x0400] * 0x0400 + address % 0x0400;
}

var PPU = function (nes) {
    this.nes = nes;
    this.cycle = 0;    // 0-340
    this.scanLine = 0; // 0-261, 0-239=visible, 240=post, 241-260=vblank, 261=pre
    this.frame = 0;    // frame counter
    var i;
    this.paletteIndex = new Array(0x20); //  the image palette ($3F00-$3F0F) and the sprite palette ($3F10-$3F1F)
    for (i = 0; i < this.paletteIndex.length; i++) {
        this.paletteIndex[i] = 0;
    }
    this.nameTableData = new Array(0x800);
    for (i = 0; i < this.nameTableData.length; i++) {
        this.nameTableData[i] = 0;
    }
    this.oamData = new Array(0x100);
    for (i = 0; i < this.oamData.length; i++) {
        this.oamData[i] = 0;
    }
    // PPU registers
    this.v = 0; // current vram address (15 bit)
    this.t = 0; // temporary vram address (15 bit)
    this.x = 0; // fine x scroll (3 bit)
    this.w = 0; // write toggle (1 bit)
    this.f = 0; // even/odd frame flag (1 bit)
    this.reset();
};

PPU.prototype = {
    reset: function () {
        this.cycle = 340;
        this.scanLine = 240;
        this.frame = 0;
        this.writeControl1(0);
        this.writeControl2(0);
        this.writeOAMAddress(0);
    },

    step: function () {

    },

    // $3F00-$3F0F: image palette
    readImagePalette: function () {
        var p = [];
        for (var i = 0; i < 0x10; i++) {
            p[i] = palette[this.readPaletteIndex(i)];
        }
        return p;
    },

    // $3F10-$3F1F: sprite palette
    readSpritePalette: function () {
        var p = [];
        for (var i = 0; i < 0x10; i++) {
            p[i] = palette[this.readPaletteIndex(i + 0x10)];
        }
        return p;
    },

    readPaletteIndex: function (address) {
        return this.paletteIndex[address];
    },

    writePaletteIndex: function (address, value) {
        this.paletteIndex[address] = value;
    },

    read: function (address) {
        console.warn('ppu read', address.toString(16));
        address = address % 0x4000;
        if (address < 0x2000) {
            return this.nes.mapper.read(address);
        }
        if (address < 0x3F00) {
            var mode = this.nes.ines.mirroring;
            return this.nameTableData[mirrorAddress(mode, address) % 0x800];
        }
        if (address < 0x4000) {
            return this.readPaletteIndex(address % 32);
        }
        throw new Error("unhandled ppu memory read at address: " + address.toString(16));
    },

    write: function (address, value) {
        console.warn('ppu write', address.toString(16), value.toString(16));
        address = address % 0x4000;
        if (address < 0x2000) {
            this.nes.mapper.write(address, value);
        }
        if (address < 0x3F00) {
            var mode = this.nes.ines.mirroring;
            return this.nameTableData[mirrorAddress(mode, address) % 0x800];
        }
        if (address < 0x4000) {
            return this.writePaletteIndex(address % 32, value);
        }
        throw new Error("unhandled ppu memory write at address: " + address.toString(16));

    },

    readRegister: function (address) {
        console.warn('ppu register read', address.toString(16));
        switch (address) {
            case 0x2000:
                throw new Error("invalid ppu register read at address: " + address.toString(16));
            case 0x2001:
                throw new Error("invalid ppu register read at address: " + address.toString(16));
            case 0x2002:
                return this.readStatus();
            case 0x2003:
                throw new Error("invalid ppu register read at address: " + address.toString(16));
            case 0x2004:
                return this.readOAMData();
            case 0x2005:
                throw new Error("invalid ppu register read at address: " + address.toString(16));
            case 0x2006:
                throw new Error("invalid ppu register read at address: " + address.toString(16));
            case 0x2007:
                return this.readData();
            case 0x4014:
                throw new Error("invalid ppu register read at address: " + address.toString(16));
            default:
                throw new Error("unhandled ppu register read at address: " + address.toString(16));
        }
    },

    writeRegister: function (address, value) {
        console.warn('ppu register write', address.toString(16), value.toString(16));
        switch (address) {
            case 0x2000:
                this.writeControl1(value);
                return;
            case 0x2001:
                this.writeControl2(value);
                return;
            case 0x2002:
                throw new Error("invalid ppu register write at address: " + address.toString(16));
            case 0x2003:
                this.writeOAMAddress(value);
                return;
            case 0x2004:
                // ???
                throw new Error("invalid ppu register write at address: " + address.toString(16));
            case 0x2005:
                this.writeScroll(value);
                return;
            case 0x2006:
                this.writeAddress(value);
                return;
            case 0x2007:
                this.writeData(value);
                return;
            case 0x4014:
                this.writeDMA(value);
                return;
            default:
                throw new Error("unhandled ppu register write at address: " + address.toString(16));
        }
    },

    // $2000: PPU Control Register 1
    writeControl1: function (value) {
        value &= 0xF;
        // Bits 0-1 - Name table address, changes between the four name tables at $2000 (0), $2400 (1), $2800 (2) and $2C00 (3).
        this.flagNameTable = (value >> 0) & 3;
        // Bit 2 - Specifies amount to increment address by, either 1 if this is 0 or 32 if this is 1.
        this.flagIncrement = (value >> 2) & 1;
        // Bit 3 - Identifies which pattern table sprites are stored in, either $0000 (0) or $1000 (1).
        this.flagSpriteTable = (value >> 3) & 1;
        // Bit 4 - Identifies which pattern table the background is stored in, either $0000 (0) or $1000 (1).
        this.flagBackgroundTable = (value >> 4) & 1;
        // Bit 5 - Specifies the size of sprites in pixels, 8x8 if this is 0, otherwise 8x16.
        this.flagSpriteSize = (value >> 5) & 1;
        // Bit 6 - Changes PPU between master and slave modes. This is not used by the NES.
        this.flagMasterSlave = (value >> 6) & 1;
        // Bit 7 - Indicates whether a NMI should occur upon V-Blank.
        this.nmiOutput = ((value >> 7) & 1) === 1;
        // this.nmiChange();
        // // t: ....BA.. ........ = d: ......BA
        // this.t = (this.t & 0xF3FF) | ((value & 0x03) << 10);
    },

    // PPU Control Register 2
    writeControl2: function (value) {
        value &= 0xF;
        // Bit 0 - Indicates whether the system is in colour (0) or monochrome mode (1),
        this.flagGrayscale = (value >> 0) & 1;
        // Bit 1 - Specifies whether to clip the background,
        // that is whether to hide the background in the left 8 pixels on screen (0) or to show them (1).
        this.flagShowLeftBackground = (value >> 1) & 1;
        // Bit 2 - Specifies whether to clip the sprites,
        // that is whether to hide sprites in the left 8 pixels on screen (0) or to show them (1).
        this.flagShowLeftSprites = (value >> 2) & 1;
        // Bit 3 - If this is 0, the background should not be displayed.
        this.flagShowBackground = (value >> 3) & 1;
        // Bit 4 - If this is 0, sprites should not be displayed.
        this.flagShowSprites = (value >> 4) & 1;
        // Bits 5-7 - Indicates background colour in monochrome mode or colour intensity in colour mode.
        this.flagRedTint = (value >> 5) & 1;
        this.flagGreenTint = (value >> 6) & 1;
        this.flagBlueTint = (value >> 7) & 1;
    },

    // $2002: PPU Status Register:
    readStatus: function () {
        // Bit 4 - If set, indicates that writes to VRAM should be ignored.
        // Bit 5 - Scanline sprite count, if set, indicates more than 8 sprites on the current scanline.
        // Bit 6 - Sprite 0 hit flag, set when a non-transparent pixel of sprite 0 overlaps a non-transparent background pixel.
        // Bit 7 - Indicates whether V-Blank is occurring.
        var result = this.register & 0x1F;
        result |= this.flagSpriteOverflow << 5;
        result |= this.flagSpriteZeroHit << 6;
        if (this.nmiOccurred) {
            result |= 1 << 7;
        }
        this.nmiOccurred = false;
        // this.nmiChange();
        // w:                   = 0
        this.w = 0;
        return result;
    },

    // $2003: SPR-RAM Address Register:
    writeOAMAddress: function (value) {
        value &= 0xF;
        // Holds the address in SPR-RAM to access on the next write to $2004.
        this.oamAddress = value
    },

    // $2004: SPR-RAM I/O Register:
    readOAMData: function () {
        // writes a byte to SPR-RAM at the address indicated by $2003.
        return this.oamData[this.oamAddress];
    },

    // $2004: OAMDATA (write) ???
    writeOAMData: function (value) {
        value &= 0xF;
        this.oamData[this.oamAddress] = value;
        this.oamAddress++;
    },

    // $2005: VRAM Address Register 1.
    writeScroll: function (value) {
        value &= 0xff;
        if (this.w === 0) {
            // t: ........ ...HGFED = d: HGFED...
            // x:               CBA = d: .....CBA
            // w:                   = 1
            this.t = (ppu.t & 0xFFE0) | (value >> 3);
            this.x = value & 0x07;
            this.w = 1;
        } else {
            // t: .CBA..HG FED..... = d: HGFEDCBA
            // w:                   = 0
            this.t = (this.t & 0x8FFF) | ((value & 0x07) << 12);
            this.t = (this.t & 0xFC1F) | ((value & 0xF8) << 2);
            this.w = 0;
        }
    },

    // $2006: VRAM Address Register 2.
    writeAddress: function (value) {
        if (this.w === 0) {
            // t: ..FEDCBA ........ = d: ..FEDCBA
            // t: .X...... ........ = 0
            // w:                   = 1
            this.t = (this.t & 0x80FF) | ((value & 0x3F) << 8);
            this.w = 1;
        } else {
            // t: ........ HGFEDCBA = d: HGFEDCBA
            // v                    = t
            // w:                   = 0
            this.t = (this.t & 0xFF00) | value;
            this.v = this.t;
            this.w = 0;
        }
    },

    // $2007: VRAM I/O Register (read)
    // Reads or writes a byte from VRAM at the current address.
    readData: function () {
        var value = this.read(this.v);
        // emulate buffered reads
        if (this.v % 0x4000 < 0x3F00) {
            var buffered = ppu.bufferedData;
            this.bufferedData = value;
            value = buffered;
        } else {
            this.bufferedData = this.read(this.v - 0x1000);
        }
        // increment address
        if (this.flagIncrement === 0) {
            this.v += 1;
        } else {
            this.v += 32;
        }
        return value;
    },

    // $2007: VRAM I/O Register (write)
    writeData: function (value) {
        this.write(this.v, value);
        if (this.flagIncrement === 0) {
            this.v += 1;
        } else {
            this.v += 32;
        }
    },

    // $4014: Sprite DMA Register
    // Writes cause a DMA transfer to occur from CPU memory at address $100 x n, where n is the value written, to SPR-RAM.
    writeDMA: function (value) {
        var cpu = this.nes.cpu;
        var address = value << 8;
        for (var i = 0; i < 256; i++) {
            this.oamData[ppu.oamAddress] = cpu.read(address);
            this.oamAddress++;
            address++;
        }
        cpu.stall += 513;
        if (cpu.cycles % 2 === 1) {
            cpu.stall++;
        }
    }
};

module.exports = PPU;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var Mapper2 = function (nes) {
    this.nes = nes;
    this.rpgRomBanks = this.nes.ines.rpgRom.length;
    this.rpgRomUpperBank = this.rpgRomBanks - 1;
    this.rpgRomLowerBank = 0;
};

Mapper2.prototype = {

    read: function (address) {
        address &= 0xFFFF;
        // console.warn('mapper2 read', address.toString(16));
        if (address < 0x2000) {
            return this.nes.ines.chrRom[0][address] & 0xff;
        }
        if (address >= 0xc000) {
            return this.nes.ines.rpgRom[this.rpgRomUpperBank][address - 0xc000] & 0xff;
        }
        if (address >= 0x8000) {
            return this.nes.ines.rpgRom[this.rpgRomLowerBank][address - 0x8000] & 0xff;
        }
        if (address >= 0x6000) {
            return this.nes.ines.sram[address - 0x6000] & 0xff;
        }
        throw new Error("unhandled mapper2 read at address: " + address.toString(16));
    },

    write: function (address, value) {
        address &= 0xFFFF;
        value &= 0xff;
        // console.warn('mapper2 write', address.toString(16), value.toString(16));
        if (address < 0x2000) {
            this.nes.ines.chrRom[0][address] = value;
            return;
        }
        if (address >= 0x8000) {
            this.rpgRomLowerBank = value % this.rpgRomBanks;
            return;
        }
        if (address >= 0x6000) {
            this.nes.ines.sram[address - 0x6000] = value;
            return;
        }
        throw new Error("unhandled mapper2 write at address: " + address.toString(16));
    }
};

module.exports = Mapper2;

/***/ })
/******/ ]);
});