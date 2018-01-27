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
	    NES: __webpack_require__(1)
	};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var INES = __webpack_require__(2);
	var CPU = __webpack_require__(3);

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
	    this.numRam = null;
	    this.sram = new Array(0x2000);
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
	        this.PC = this.read16(0xFFFC);
	        this.SP = 0xFD;
	        this.setFlags(0x24);
	        this.interrupt = interruptNone;
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
	        console.log(instructionNames[opcode], address.toString(16), mode, instructioncycles[opcode], pageCrossed, instructionPagecycles[opcode]);
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
	        console.warn('read', address.toString(16));
	        if (address < 0x2000) {
	            return this.nes.ines.chrRom[0][address] & 0xff;
	        }
	        if (address >= 0xc000) {
	            if (this.nes.ines.rpgRom.length === 1) {
	                return this.nes.ines.rpgRom[0][address - 0xc000] & 0xff;
	            }
	            return this.nes.ines.rpgRom[1][address - 0xc000] & 0xff;
	        }
	        if (address >= 0x8000) {
	            return this.nes.ines.rpgRom[0][address - 0x8000] & 0xff;
	        }
	        if (address >= 0x6000) {
	            return this.nes.ines.sram[address - 0x6000] & 0xff;
	        }
	        throw new Error("unhandled mapper2 read at address: " + address.toString(16));
	    },

	    write: function (address, value) {
	        address &= 0xFFFF;
	        value &= 0xff;
	        console.warn('write', address.toString(16), value.toString(16));
	        if (address < 0x2000) {
	            this.nes.ines.chrRom[0][address] = value;
	            return;
	        }
	        if (address >= 0xc000) {
	            if (this.nes.ines.rpgRom.length === 1) {
	                this.nes.ines.rpgRom[0][address - 0xc000] = value;
	            } else {
	                this.nes.ines.rpgRom[1][address - 0xc000] = value;
	            }
	            return;
	        }
	        if (address >= 0x8000) {
	            this.nes.ines.rpgRom[0][address - 0x8000] = value;
	            return;
	        }
	        if (address >= 0x6000) {
	            this.nes.ines.sram[address - 0x6000] = value;
	            return;
	        }
	        throw new Error("unhandled mapper2 write at address: " + address.toString(16));
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
	        console.log("LDA", this.A.toString(16), address.toString(16));
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

/***/ })
/******/ ])
});
;