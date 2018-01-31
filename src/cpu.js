const modeAbsolute = 0;
const modeAbsoluteX = 1;
const modeAbsoluteY = 2;
const modeAccumulator = 3;
const modeImmediate = 4;
const modeImplied = 5;
const modeIndexedIndirect = 6;
const modeIndirect = 7;
const modeIndirectIndexed = 8;
const modeRelative = 9;
const modeZeroPage = 10;
const modeZeroPageX = 11;
const modeZeroPageY = 12;

var modeSize = [
    3, 3, 3, 1, 2, 1, 2, 3, 2, 2, 2, 2, 2
];
// instructionModes indicates the addressing mode for each instruction
var instructionModes = [
    5, 6, 5, 6, 10, 10, 10, 10, 5, 4, 3, 4, 0, 0, 0, 0,
    9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
    0, 6, 5, 6, 10, 10, 10, 10, 5, 4, 3, 4, 0, 0, 0, 0,
    9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
    5, 6, 5, 6, 10, 10, 10, 10, 5, 4, 3, 4, 0, 0, 0, 0,
    9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
    5, 6, 5, 6, 10, 10, 10, 10, 5, 4, 3, 4, 7, 0, 0, 0,
    9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
    4, 6, 4, 6, 10, 10, 10, 10, 5, 4, 5, 4, 0, 0, 0, 0,
    9, 8, 5, 8, 11, 11, 12, 12, 5, 2, 5, 2, 1, 1, 2, 2,
    4, 6, 4, 6, 10, 10, 10, 10, 5, 4, 5, 4, 0, 0, 0, 0,
    9, 8, 5, 8, 11, 11, 12, 12, 5, 2, 5, 2, 1, 1, 2, 2,
    4, 6, 4, 6, 10, 10, 10, 10, 5, 4, 5, 4, 0, 0, 0, 0,
    9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1,
    4, 6, 4, 6, 10, 10, 10, 10, 5, 4, 5, 4, 0, 0, 0, 0,
    9, 8, 5, 8, 11, 11, 11, 11, 5, 2, 5, 2, 1, 1, 1, 1
];

// instructionSizes indicates the size of each instruction in bytes
var instructionSizes = [
    1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3,
    2, 2, 1, 2, 2, 2, 2, 2, 1, 3, 1, 3, 3, 3, 3, 3,
    3, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3,
    2, 2, 1, 2, 2, 2, 2, 2, 1, 3, 1, 3, 3, 3, 3, 3,
    1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3,
    2, 2, 1, 2, 2, 2, 2, 2, 1, 3, 1, 3, 3, 3, 3, 3,
    1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3,
    2, 2, 1, 2, 2, 2, 2, 2, 1, 3, 1, 3, 3, 3, 3, 3,
    2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3,
    2, 2, 1, 2, 2, 2, 2, 2, 1, 3, 1, 3, 3, 3, 3, 3,
    2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3,
    2, 2, 1, 2, 2, 2, 2, 2, 1, 3, 1, 3, 3, 3, 3, 3,
    2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3,
    2, 2, 1, 2, 2, 2, 2, 2, 1, 3, 1, 3, 3, 3, 3, 3,
    2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 3, 3, 3, 3,
    2, 2, 1, 2, 2, 2, 2, 2, 1, 3, 1, 3, 3, 3, 3, 3
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
    this.PC = 0;
    this.A = 0;
    this.X = 0;
    this.Y = 0;
    this.SP = 0;
    this.N = 0;
    this.V = 0;
    this.U = 0;
    this.B = 0;
    this.D = 0;
    this.I = 0;
    this.Z = 0;
    this.C = 0;
    this.reset();
};
var util = require('./util');

CPU.prototype = {
    // reset resets the CPU to its initial power_up state
    reset: function () {
        this.SP = 0xFD;
        this.setFlags(0x24);
        this.interrupt = interruptNone;
    },

    load: function () {
        this.PC = this.read16(0xFFFC);
        console.log(this.PC.toString(16))
    },

    /* debug -------------------------------------------------------------------------------------------------------- */

    // PrintInstruction prints the current CPU state
    printInstruction: function () {
        let opcode = this.read(this.PC);
        let bytes = instructionSizes[opcode];
        let name = instructionNames[opcode];
        let w1 = "  ";
        let w2 = "  ";
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

    decode(start) {
        let decode = [];
        for (let i = 0; i < start.length; i++) {
            let PC = start[i];
            let run = true;
            let konwnAddress = [];
            for (; run;) {
                if (PC in konwnAddress) {
                    break;
                }
                if (PC >= 0xFFFA) {
                    break;
                }
                let opcode = this.read(PC);
                let size = instructionSizes[opcode];
                let hexDump;
                switch (size) {
                    case 0:
                        throw new Error("invalid instruction");
                    case 1:
                        hexDump = util.sprintf("%02X", opcode);
                        break;
                    case 2:
                        hexDump = util.sprintf("%02X %02X", opcode, this.read(PC + 1));
                        break;
                    case 3:
                        hexDump = util.sprintf("%02X %02X %02X", opcode, this.read(PC + 1), this.read(PC + 2));
                        break;
                }
                decode[PC] = {
                    hexDump,
                };
                console.log(util.sprintf("%04X: %s", PC, hexDump));
                konwnAddress.push(PC);
                let mode = instructionModes[opcode];
                // eval('this.' + instructionNames[opcode] + 'DISASSEMBLY(this.PC, mode)');
                PC += size;
            }
        }
        return decode;
    },

    addressing: function (mode) {
        let address = null;
        let pageCrossed = null;
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
        if (pageCrossed) {
            this.cycles += instructionPagecycles[opcode];
        }
        return address;
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
        let opcode = this.read(this.PC);

        let mode = instructionModes[opcode];
        let address = this.addressing(mode);

        this.PC += instructionSizes[opcode];
        this.cycles += instructioncycles[opcode];
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

// http://obelisk.me.uk/6502/reference.html