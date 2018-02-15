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
                this.writeOAMData(value);
                return;
                // // ???
                // throw new Error("invalid ppu register write at address: " + address.toString(16));
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
            this.t = (this.t & 0xFFE0) | (value >> 3);
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
            var buffered = this.bufferedData;
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
            this.oamData[this.oamAddress] = cpu.read(address);
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