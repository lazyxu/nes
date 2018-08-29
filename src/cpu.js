const ABSOLUTE = 0;
const ABSOLUTE_X = 1;
const ABSOLUTE_Y = 2;
const ACCUMULATOR = 3;
const IMMEDIATE = 4;
const IMPLIED = 5;
const INDEXED_INDIRECT = 6;
const INDIRECT = 7;
const INDIRECT_INDEXED = 8;
const RELATIVE = 9;
const ZERO_PAGE = 10;
const ZERO_PAGE_X = 11;
const ZERO_PAGE_Y = 12;

// MODE indicates the addressing mode for each instruction
const MODE = [
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

// SIZE indicates the size of each instruction in bytes
const SIZE = [
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

// CYCLE indicates the number of cycles used by each instruction,
// not including conditional cycles
const CYCLE = [
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

// PAGE_CYCLE indicates the number of cycles used by each instruction when a page is crossed
const PAGE_CYCLE = [
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

const ADC = 0, AHX = 1, ALR = 2, ANC = 3, AND = 4, ARR = 5, ASL = 6, AXS = 7;
const BCC = 8, BCS = 9, BEQ = 10, BIT = 11, BMI = 12, BNE = 13, BPL = 14, BRK = 15;
const BVC = 16, BVS = 17, CLC = 18, CLD = 19, CLI = 20, CLV = 21, CMP = 22, CPX = 23;
const CPY = 24, DCP = 25, DEC = 26, DEX = 27, DEY = 28, EOR = 29, INC = 30, INX = 31;
const INY = 32, ISB = 33, JMP = 34, JSR = 35, KIL = 36, LAS = 37, LAX = 38, LDA = 39;
const LDX = 40, LDY = 41, LSR = 42, NOP = 43, ORA = 44, PHA = 45, PHP = 46, PLA = 47;
const PLP = 48, RLA = 49, ROL = 50, ROR = 51, RRA = 52, RTI = 53, RTS = 54, SAX = 55;
const SBC = 56, SEC = 57, SED = 58, SEI = 59, SHX = 60, SHY = 61, SLO = 62, SRE = 63;
const STA = 64, STX = 65, STY = 66, TAS = 67, TAX = 68, TAY = 69, TSX = 70, TXA = 71;
const TXS = 72, TYA = 73, XAA = 74;

// instructionNames indicates the name of each instruction
const OPCODE = [
    BRK, ORA, KIL, SLO, NOP, ORA, ASL, SLO, PHP, ORA, ASL, ANC, NOP, ORA, ASL, SLO,
    BPL, ORA, KIL, SLO, NOP, ORA, ASL, SLO, CLC, ORA, NOP, SLO, NOP, ORA, ASL, SLO,
    JSR, AND, KIL, RLA, BIT, AND, ROL, RLA, PLP, AND, ROL, ANC, BIT, AND, ROL, RLA,
    BMI, AND, KIL, RLA, NOP, AND, ROL, RLA, SEC, AND, NOP, RLA, NOP, AND, ROL, RLA,
    RTI, EOR, KIL, SRE, NOP, EOR, LSR, SRE, PHA, EOR, LSR, ALR, JMP, EOR, LSR, SRE,
    BVC, EOR, KIL, SRE, NOP, EOR, LSR, SRE, CLI, EOR, NOP, SRE, NOP, EOR, LSR, SRE,
    RTS, ADC, KIL, RRA, NOP, ADC, ROR, RRA, PLA, ADC, ROR, ARR, JMP, ADC, ROR, RRA,
    BVS, ADC, KIL, RRA, NOP, ADC, ROR, RRA, SEI, ADC, NOP, RRA, NOP, ADC, ROR, RRA,
    NOP, STA, NOP, SAX, STY, STA, STX, SAX, DEY, NOP, TXA, XAA, STY, STA, STX, SAX,
    BCC, STA, KIL, AHX, STY, STA, STX, SAX, TYA, STA, TXS, TAS, SHY, STA, SHX, AHX,
    LDY, LDA, LDX, LAX, LDY, LDA, LDX, LAX, TAY, LDA, TAX, LAX, LDY, LDA, LDX, LAX,
    BCS, LDA, KIL, LAX, LDY, LDA, LDX, LAX, CLV, LDA, TSX, LAS, LDY, LDA, LDX, LAX,
    CPY, CMP, NOP, DCP, CPY, CMP, DEC, DCP, INY, CMP, DEX, AXS, CPY, CMP, DEC, DCP,
    BNE, CMP, KIL, DCP, NOP, CMP, DEC, DCP, CLD, CMP, NOP, DCP, NOP, CMP, DEC, DCP,
    CPX, SBC, NOP, ISB, CPX, SBC, INC, ISB, INX, SBC, NOP, SBC, CPX, SBC, INC, ISB,
    BEQ, SBC, KIL, ISB, NOP, SBC, INC, ISB, SED, SBC, NOP, ISB, NOP, SBC, INC, ISB
];

// interrupt types
const INT_NONE = 0;
const INT_NMI = 1;
const INT_IRQ = 2;
const INT_RESET = 3;

let CPU = function (nes) {
    this.nes = nes;
    this.ramBuf = new ArrayBuffer(0x800); // 2048 bytes
    this.ram = new Uint8Array(this.ramBuf);
    for (let i = 0; i < this.ram.length; i++) {
        this.ram[i] = 0;
    }
    this.cycles = null;
    this.stall = null; // number of cycles to stall
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
};
let util = require('./util');

CPU.prototype = {
    CPUFrequency: 1789773, // 1.789773 MHz NTSC NES/Famicom

    // reset resets the CPU to its initial power_up state
    reset: function () {
        this.SP = 0xFD;
        this.setFlags(0x24);
        this.interrupt = INT_NONE; // interrupt type to perform
        this.PC = this.read16(0xFFFC);
    },

    /* debug -------------------------------------------------------------------------------------------------------- */

    // PrintInstruction prints the current CPU state
    printInstruction: function (showOpdata = true) {
        let instruction = this.read(this.PC);
        let bytes = SIZE[instruction];
        let opcode = OPCODE[instruction];
        let w1 = "  ";
        let w2 = "  ";
        if (bytes > 1) {
            w1 = this.read(this.PC + 1).toString(16).toUpperCase();
        }
        if (bytes > 2) {
            w2 = this.read(this.PC + 2).toString(16).toUpperCase();
        }
        let mode = MODE[instruction];

        let prefix = " ";
        if ((opcode === "NOP" && instruction !== 0xEA) ||
            opcode === "LAX" ||
            opcode === "SAX" ||
            opcode === "DCP" ||
            opcode === "ISB" ||
            opcode === "SLO" ||
            opcode === "RLA" ||
            opcode === "SRE" ||
            opcode === "RRA" ||
            (instruction === 0xEB)) {
            prefix = "*";
        }
        let opdata = this.opdataDisassembly(this.PC, mode);
        let address = this.addressing(instruction, mode, false);
        if (opcode === "STA") {
            opdata += util.sprintf(" = %02s", this.A.toString(16).toUpperCase());
        }
        if (opcode === "STX") {
            opdata += util.sprintf(" = %02s", this.X.toString(16).toUpperCase());
        }
        if (opcode === "STY") {
            opdata += util.sprintf(" = %02s", this.Y.toString(16).toUpperCase());
        }
        if (opcode === "BIT" ||
            opcode === "LDA" ||
            opcode === "LDX" ||
            opcode === "LDY") {
            opdata += util.sprintf(" = %02s", this.read(address).toString(16).toUpperCase());
        }
        return console.log(util.sprintf("%04X  %02s %02s %02s %01s%s %-28s" +
            "A:%02X X:%02X Y:%02X P:%02X SP:%02X CYC:%3d",
            this.PC, instruction.toString(16).toUpperCase(), w1, w2, prefix, opcode, showOpdata ? opdata : "",
            this.A, this.X, this.Y, this.flags(), this.SP, (this.cycles * 3) % 341));
    },

    // https://zhuanlan.zhihu.com/p/21330930
    linearScanDisassembly(start) {
        let disasm = {};
        start.sort(function (a, b) {
            return a > b;
        });
        for (let i = 0; i < start.length; i++) {
            let PC = start[i];
            let end = i === start.length - 1 ? 0xFFFA : start[i + 1];
            console.log("from ", PC.toString(16), " to ", end.toString(16));
            for (; PC < end;) {
                let opcode = this.read(PC);
                let size = SIZE[opcode];
                let hexDump;
                switch (size) {
                    case 0:
                    // throw new Error("invalid instruction");
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
                let operator = instructionNames[opcode];
                let mode = MODE[opcode];
                let opdata = this.opdataDisassembly(PC, mode);
                if (operator === "NOP") {
                    opdata = "";
                }
                // console.log(util.sprintf("%04X: %8s %s %s", PC, hexDump, operator, opdata));
                let hexAddr = util.sprintf("%04X", PC);
                disasm[PC] = {
                    hexAddr,
                    hexDump,
                    operator,
                    opdata,
                };
                PC += size;
            }
        }
        return disasm;
    },

    opdataDisassembly: function (PC, mode) {
        switch (mode) {
            case ABSOLUTE:
                return util.sprintf("$%04X", this.read16(PC + 1));
            case ABSOLUTE_X:
                return util.sprintf("$%04X, X", this.read16(PC + 1));
            case ABSOLUTE_Y:
                return util.sprintf("$%04X, Y", this.read16(PC + 1));
            case ACCUMULATOR:
                return "A";
            case IMMEDIATE:
                return util.sprintf("#$%02X", this.read(PC + 1));
            // return util.sprintf("#%02X", this.read(PC + 1));
            case IMPLIED:
                return "";
            case INDEXED_INDIRECT:
                return util.sprintf("($%02X, X)", this.read(PC + 1));
            case INDIRECT:
                return util.sprintf("($%04X)", this.read16(PC + 1));
            case INDIRECT_INDEXED:
                return util.sprintf("($%02X), Y", this.read(PC + 1));
            case RELATIVE:
                let address;
                let offset = this.read(PC + 1);
                if (offset < 0x80) {
                    address = (PC + 2 + offset) & 0xFFFF;
                } else {
                    address = (PC + 2 + offset - 0x100) & 0xFFFF;
                }
                return util.sprintf("$%04X", address);
            case ZERO_PAGE:
                return util.sprintf("$%02X", this.read(PC + 1));
            case ZERO_PAGE_X:
                return util.sprintf("$%02X, X", this.read(PC + 1));
            case ZERO_PAGE_Y:
                return util.sprintf("$%02X, Y", this.read(PC + 1));
        }
    },

    addressing: function (mode, pageCycle, addCycle = true) {
        let address = null;
        let pageCrossed = null;
        switch (mode) {
            case ABSOLUTE:
                address = this.read16(this.PC + 1);
                break;
            case ABSOLUTE_X:
                address = this.read16(this.PC + 1) + this.X;
                pageCrossed = this.pagesDiffer(address - this.X, address);
                break;
            case ABSOLUTE_Y:
                address = this.read16(this.PC + 1) + this.Y;
                pageCrossed = this.pagesDiffer(address - this.Y, address);
                break;
            case ACCUMULATOR:
                address = 0;
                break;
            case IMMEDIATE:
                address = this.PC + 1;
                break;
            case IMPLIED:
                address = 0;
                break;
            case INDEXED_INDIRECT:
                address = this.read16bug((this.read(this.PC + 1) + this.X) & 0xff);
                break;
            case INDIRECT:
                address = this.read16bug(this.read16(this.PC + 1));
                break;
            case INDIRECT_INDEXED:
                address = this.read16bug(this.read(this.PC + 1)) + this.Y;
                pageCrossed = this.pagesDiffer(address - this.Y, address);
                break;
            case RELATIVE:
                let offset = this.read(this.PC + 1);
                if (offset < 0x80) {
                    address = (this.PC + 2 + offset) & 0xFFFF;
                } else {
                    address = (this.PC + 2 + offset - 0x100) & 0xFFFF;
                }
                break;
            case ZERO_PAGE:
                address = this.read(this.PC + 1);
                break;
            case ZERO_PAGE_X:
                address = (this.read(this.PC + 1) + this.X) & 0xff;
                break;
            case ZERO_PAGE_Y:
                address = (this.read(this.PC + 1) + this.Y) & 0xff;
                break;
        }
        if (addCycle) {
            if (pageCrossed) {
                this.cycles += pageCycle;
            }
        }
        return address;
    },

    // step executes a single CPU instruction
    step: function () {
        if (this.stall > 0) {
            this.stall--;
            return 1;
        }

        let cycles = this.cycles;

        // interrupt
        switch (this.interrupt) {
            case INT_IRQ:
                this.irq();
                break;
            case INT_NMI:
                this.nmi();
                break;
        }
        this.interrupt = INT_NONE;
        let instruction = this.read(this.PC);

        let mode = MODE[instruction];
        let pageCycle = PAGE_CYCLE[instruction];
        let address = this.addressing(mode, pageCycle);

        this.PC += SIZE[instruction];
        this.cycles += CYCLE[instruction];
        let pc = this.PC;
        let value, a, b, c;
        switch (OPCODE[instruction]) {
            case ADC: // Add with Carry
                a = this.A;
                b = this.read(address);
                c = this.C;
                this.A = (a + b + c) & 0XFF;
                this.setZN(this.A);
                this.C = (a + b + c) > 0xFF ? 1 : 0;
                this.V = ((a ^ b) & 0x80) === 0 && ((a ^ this.A) & 0x80) !== 0;
                break;
            case AHX: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case ALR: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case ANC: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case AND: // Logical AND
                this.A = this.A & this.read(address);
                this.setZN(this.A);
                break;
            case ARR: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case ASL: // Arithmetic Shift Left
                if (mode === ACCUMULATOR) {
                    this.C = (this.A >> 7) & 1;
                    this.A = (this.A << 1) & 0xff;
                    this.setZN(this.A);
                } else {
                    value = this.read(address);
                    this.C = (value >> 7) & 1;
                    // value <<= 1;
                    value = (value << 1) & 0xff;
                    this.write(address, value);
                    this.setZN(value);
                }
                break;
            case AXS: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case BCC: // Branch if Carry Clear
                if (this.C === 0) {
                    this.PC = address;
                    this.addBranchCycles(address, pc);
                }
                break;
            case BCS: // Branch if Carry Set
                if (this.C !== 0) {
                    this.PC = address;
                    this.addBranchCycles(address, pc);
                }
                break;
            case BEQ: // Branch if Equal
                if (this.Z !== 0) {
                    this.PC = address;
                    this.addBranchCycles(address, pc);
                }
                break;
            case BIT: // Bit Test
                value = this.read(address);
                this.V = (value >> 6) & 1;
                this.setZ(value & this.A);
                this.setN(value);
                break;
            case BMI: // Branch if Minus
                if (this.N !== 0) {
                    this.PC = address;
                    this.addBranchCycles(address, pc);
                }
                break;
            case BNE: // Branch if Not Equal
                if (this.Z === 0) {
                    this.PC = address;
                    this.addBranchCycles(address, pc);
                }
                break;
            case BPL: // Branch if Positive
                if (this.N === 0) {
                    this.PC = address;
                    this.addBranchCycles(address, pc);
                }
                break;
            case BRK: // Force Interrupt
                this.push16(this.PC);
                this.push(this.flags() | 0x10);
                this.I = 1;
                this.PC = this.read16(0xFFFE);
                break;
            case BVC: // Branch if Overflow Clear
                if (this.V === 0) {
                    this.PC = address;
                    this.addBranchCycles(address, pc);
                }
                break;
            case BVS: // Branch if Overflow Set
                if (this.V !== 0) {
                    this.PC = address;
                    this.addBranchCycles(address, pc);
                }
                break;
            case CLC: // Clear Carry Flag
                this.C = 0;
                break;
            case CLD: // Clear Decimal Mode
                this.D = 0;
                break;
            case CLI: // Clear Interrupt Disable
                this.I = 0;
                break;
            case CLV: // Clear Overflow Flag
                this.V = 0;
                break;
            case CMP: // Compare
                value = this.read(address);
                this.compare(this.A, value);
                break;
            case CPX: // Compare X Register
                value = this.read(address);
                this.compare(this.X, value);
                break;
            case CPY: // Compare Y Register
                value = this.read(address);
                this.compare(this.Y, value);
                break;
            case DCP: // DEC CMP
                value = (this.read(address) - 1) & 0XFF;
                this.write(address, value);
                this.setZN(value);
                value = this.read(address);
                this.compare(this.A, value);
                break;
            case DEC: // Decrement Memory
                value = (this.read(address) - 1) & 0XFF;
                this.write(address, value);
                this.setZN(value);
                break;
            case DEX: // Decrement X Register
                this.X = (this.X - 1) & 0xff;
                this.setZN(this.X);
                break;
            case DEY: // Decrement Y Register
                this.Y = (this.Y - 1) & 0xff;
                this.setZN(this.Y);
                break;
            case EOR: // Exclusive OR
                this.A = this.A ^ this.read(address);
                this.setZN(this.A);
                break;
            case INC: // Increment Memory
                value = (this.read(address) + 1) & 0XFF;
                this.write(address, value);
                this.setZN(value);
                break;
            case INX: // Increment X Register
                this.X = (this.X + 1) & 0xff;
                this.setZN(this.X);
                break;
            case INY: // Increment Y Register
                this.Y = (this.Y + 1) & 0xff;
                this.setZN(this.Y);
                break;
            case ISB: // INC SBC
                value = (this.read(address) + 1) & 0XFF;
                this.write(address, value);
                this.setZN(value);
                a = this.A;
                b = this.read(address);
                c = this.C;
                this.A = (a - b - (1 - c)) & 0XFF;
                this.setZN(this.A);
                this.C = (a - b - (1 - c)) >= 0 ? 1 : 0;
                this.V = ((a ^ b) & 0x80) !== 0 && ((a ^ this.A) & 0x80) !== 0;
                break;
            case JMP: // Jump
                this.PC = address;
                break;
            case JSR: // Jump to Subroutine
                this.push16(this.PC - 1);
                this.PC = address;
                break;
            case KIL: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case LAS: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case LAX:
                value = this.read(address);
                this.A = value;
                this.X = value;
                this.setZN(value);
                break;
            case LDA: // Load Accumulator
                this.A = this.read(address);
                this.setZN(this.A);
                break;
            case LDX: // Load X Register
                this.X = this.read(address);
                this.setZN(this.X);
                break;
            case LDY: // Load Y Register
                this.Y = this.read(address);
                this.setZN(this.Y);
                break;
            case LSR: // Logical Shift Right
                if (mode === ACCUMULATOR) {
                    this.C = this.A & 1;
                    this.A >>= 1;
                    this.setZN(this.A);
                } else {
                    value = this.read(address);
                    this.C = value & 1;
                    value >>= 1;
                    this.write(address, value);
                    this.setZN(value);
                }
                break;
            case NOP: // No Operation
                break;
            case ORA: // Logical Inclusive OR
                this.A = this.A | this.read(address);
                this.setZN(this.A);
                break;
            case PHA: // Push Accumulator
                this.push(this.A);
                break;
            case PHP: // Push Processor Status
                this.push(this.flags() | 0x10);
                break;
            case PLA: // Pull Accumulator
                this.A = this.pull();
                this.setZN(this.A);
                break;
            case PLP: // Pull Processor Status
                this.setFlags(this.pull() & 0xEF | 0x20)
                break;
            case RLA: // ROL AND
                c = this.C;
                if (mode === ACCUMULATOR) {
                    this.C = (this.A >> 7) & 1;
                    this.A = ((this.A << 1) | c) & 0xff;
                    this.setZN(this.A);
                } else {
                    value = this.read(address);
                    this.C = (value >> 7) & 1;
                    value = ((value << 1) | c) & 0xff;
                    this.write(address, value);
                    this.setZN(value);
                }
                this.A = this.A & this.read(address);
                this.setZN(this.A);
                break;
            case ROL: // Rotate Left
                c = this.C;
                if (mode === ACCUMULATOR) {
                    this.C = (this.A >> 7) & 1;
                    this.A = ((this.A << 1) | c) & 0xff;
                    this.setZN(this.A);
                } else {
                    value = this.read(address);
                    this.C = (value >> 7) & 1;
                    value = ((value << 1) | c) & 0xff;
                    this.write(address, value);
                    this.setZN(value);
                }
                break;
            case ROR: // Rotate Right
                c = this.C;
                if (mode === ACCUMULATOR) {
                    this.C = this.A & 1;
                    this.A = ((this.A >> 1) | (c << 7)) & 0xff;
                    this.setZN(this.A);
                } else {
                    value = this.read(address);
                    this.C = value & 1;
                    value = ((value >> 1) | (c << 7)) & 0xff;
                    this.write(address, value);
                    this.setZN(value);
                }
                break;
            case RRA: // ROR ADC
                c = this.C;
                if (mode === ACCUMULATOR) {
                    this.C = this.A & 1;
                    this.A = ((this.A >> 1) | (c << 7)) & 0xff;
                    this.setZN(this.A);
                } else {
                    value = this.read(address);
                    this.C = value & 1;
                    value = ((value >> 1) | (c << 7)) & 0xff;
                    this.write(address, value);
                    this.setZN(value);
                }
                a = this.A;
                b = this.read(address);
                c = this.C;
                this.A = (a + b + c) & 0XFF;
                this.setZN(this.A);
                this.C = (a + b + c) > 0xFF ? 1 : 0;
                this.V = ((a ^ b) & 0x80) === 0 && ((a ^ this.A) & 0x80) !== 0;
                break;
            case RTI: // Return from Interrupt
                this.setFlags(this.pull() & 0xEF | 0x20);
                this.PC = this.pull16();
                break;
            case RTS: // Return from Subroutine
                this.PC = this.pull16() + 1;
                break;
            case SAX:
                this.write(address, this.A & this.X);
                break;
            case SBC: // Subtract with Carry
                a = this.A;
                b = this.read(address);
                c = this.C;
                this.A = (a - b - (1 - c)) & 0XFF;
                this.setZN(this.A);
                this.C = (a - b - (1 - c)) >= 0 ? 1 : 0;
                this.V = ((a ^ b) & 0x80) !== 0 && ((a ^ this.A) & 0x80) !== 0;
                break;
            case SEC: // Set Carry Flag
                this.C = 1;
                break;
            case SED: // Set Decimal Flag
                this.D = 1;
                break;
            case SEI: // Set Interrupt Disable
                this.I = 1;
                break;
            case SHX: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case SHY: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case SLO: // ASL ORA
                if (mode === ACCUMULATOR) {
                    this.C = (this.A >> 7) & 1;
                    this.A = (this.A << 1) & 0xff;
                    this.setZN(this.A);
                } else {
                    value = this.read(address);
                    this.C = (value >> 7) & 1;
                    // value <<= 1;
                    value = (value << 1) & 0xff;
                    this.write(address, value);
                    this.setZN(value);
                }
                this.A = this.A | this.read(address);
                this.setZN(this.A);
                break;
            case SRE: // LSR EOR
                if (mode === ACCUMULATOR) {
                    this.C = this.A & 1;
                    this.A >>= 1;
                    this.setZN(this.A);
                } else {
                    value = this.read(address);
                    this.C = value & 1;
                    value >>= 1;
                    this.write(address, value);
                    this.setZN(value);
                }
                this.A = this.A ^ this.read(address);
                this.setZN(this.A);
                break;
            case STA: // Store Accumulator
                this.write(address, this.A);
                break;
            case STX: // Store X Register
                this.write(address, this.X);
                break;
            case STY: // Store Y Register
                this.write(address, this.Y);
                break;
            case TAS: // illegal opcode
                // throw new Error("illegal instruction");
                break;
            case TAX: // Transfer Accumulator to X
                this.X = this.A;
                this.setZN(this.X)
                break;
            case TAY: // Transfer Accumulator to Y
                this.Y = this.A;
                this.setZN(this.Y)
                break;
            case TSX: // Transfer Stack Pointer to X
                this.X = this.SP;
                this.setZN(this.X)
                break;
            case TXA: // Transfer Index X to Accumulator
                this.A = this.X;
                this.setZN(this.A)
                break;
            case TXS: // Transfer Index X to Stack Pointer
                this.SP = this.X;
                break;
            case TYA: // Transfer Index Y to Accumulator
                this.A = this.Y;
                this.setZN(this.A)
                break;
            case XAA: // illegal opcode
                // throw new Error("illegal instruction");
                break;
        }

        return this.cycles - cycles;
    },

    /* interrupt ---------------------------------------------------------------------------------------------------- */

    /**
     * triggerNMI causes a Non-Maskable Interrupt to occur on the next cycle
     */
    triggerNMI: function () {
        this.interrupt = INT_NMI;
    },

    /**
     * triggerIRQ causes an IRQ interrupt to occur on the next cycle
     */
    triggerIRQ: function () {
        if (this.I === 0) {
            this.interrupt = INT_IRQ;
        }
    },

    /**
     * NMI - Non-Maskable Interrupt
     * "Non-maskable" means that no state inside the CPU can prevent the NMI from being processed as an interrupt.
     * However, most boards that use a 6502 CPU's /NMI line allow the CPU to disable the generation of /NMI signals by writing to a memory-mapped I/O device.
     * In the case of the NES, the /NMI line is connected to the NES PPU and is used to detect vertical blanking.
     */
    nmi: function () {
        this.push16(this.PC);
        this.push(this.flags() | 0x10);
        this.PC = this.read16(0xFFFA);
        this.I = 1;
        this.cycles += 7;
    },

    /**
     *  IRQ - IRQ Interrupt
     */
    irq: function () {
        this.push16(this.PC);
        this.push(this.flags() | 0x10);
        this.PC = this.read16(0xFFFE);
        this.I = 1;
        this.cycles += 7;
    },

    /**
     * RESET - RESET Interrupt
     */
    RESET: function () {
        this.push16(this.PC);
        this.push(this.flags() | 0x10);
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
        this.Z = value === 0 ? 1 : 0;
    },

    // setN sets the negative flag if the argument is negative (high bit is set)
    setN: function (value) {
        this.N = (value & 0x80) !== 0 ? 1 : 0;
    },

    // setZN sets the zero flag and the negative flag
    setZN: function (value) {
        this.Z = value === 0 ? 1 : 0;
        this.N = (value & 0x80) !== 0 ? 1 : 0;
    },

    /* memory ------------------------------------------------------------------------------------------------------- */
    // pagesDiffer returns true if the two addresses reference different pages
    pagesDiffer: function (a, b) {
        return (a & 0xFF00) !== (b & 0xFF00);
    },

    // addBranchCycles adds a cycle for taking a branch and adds another cycle if the branch jumps to a new page
    addBranchCycles: function (address, pc) {
        this.cycles += this.pagesDiffer(pc, address) ? 2 : 1;
    },

    compare: function (a, b) {
        this.setZN(a - b);
        this.C = a >= b ? 1 : 0;
    },

    read: function (address) {
        address &= 0xFFFF;
        switch (true) {
            case address < 0x2000:
                return this.ram[address % 0x800];
            case address < 0x4000:
                return this.nes.ppu.readRegister(0x2000 + (address - 0x2000) % 8);
            case address < 0x4020:
                switch (address) {
                    case 0x4014:
                        return this.nes.ppu.readRegister(address);
                    case 0x4015:
                        return this.nes.apu.readRegister(address, value);
                    case 0x4016:
                        return this.nes.controller[0].read();
                    case 0x4017:
                        return this.nes.controller[1].read();
                    default:
                        // console.warn("unhandled I/O Registers II read at address: " + address.toString(16));
                        return;
                }
            case address < 0x6000:
                return;
            default:
                return this.nes.mapper.read(address);
        }
    },

    write: function (address, value) {
        address &= 0xFFFF;
        value &= 0xff;
        switch (true) {
            case address < 0x2000:
                this.ram[address % 0x800] = value;
                return;
            case address < 0x4000:
                this.nes.ppu.writeRegister(0x2000 + (address - 0x2000) % 8, value);
                return;
            case address < 0x4014:
                this.nes.apu.writeRegister(address, value);
                return;
            case address < 0x4020:
                switch (address) {
                    case 0x4014:
                        this.nes.ppu.writeRegister(address, value);
                        return;
                    case 0x4015:
                        this.nes.apu.writeRegister(address, value);
                        return;
                    case 0x4016:
                        this.nes.controller[0].write(value);
                        this.nes.controller[1].write(value);
                        return;
                    case 0x4017:
                        this.nes.apu.writeRegister(address, value);
                        return;
                    default:
                        // console.warn("unhandled I/O Registers II read at address: " + address.toString(16));
                        return;
                }
            case address < 0x6000:
                return;
            default:
                this.nes.mapper.write(address, value);
                return;
        }
    },

    // read16 reads two bytes using read to return a double-word value
    read16: function (address) {
        let lo = this.read(address);
        let hi = this.read(address + 1);
        return ((hi & 0xff) << 8) | (lo & 0xff);
    },

    // read16bug emulates a 6502 bug that caused the low byte to wrap without
    // incrementing the high byte
    read16bug: function (address) {
        let a = address;
        let b = (a & 0xFF00) | ((a + 1) & 0xff);
        let lo = this.read(a);
        let hi = this.read(b);
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
        let hi = (value >> 8) & 0xff;
        let lo = value & 0xff;
        this.push(hi);
        this.push(lo);
    },

    pull16: function () {
        let lo = this.pull();
        let hi = this.pull();
        return ((hi & 0xff) << 8) | (lo & 0xff);
    },
};

module.exports = CPU;

// http://obelisk.me.uk/6502/reference.html