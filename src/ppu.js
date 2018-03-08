const mirrorHorizontal = 0;
const mirrorVertical = 1;
const mirrorSingle0 = 2;
const mirrorSingle1 = 3;
const mirrorFour = 4;
let mirrorLookup = [
    [0, 0, 1, 1],
    [0, 1, 0, 1],
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 1, 2, 3]
];

function mirrorAddress(mode, address) {
    address = (address - 0x2000) % 0x1000;
    return 0x2000 + mirrorLookup[mode][Math.floor(address / 0x0400)] * 0x0400 + address % 0x0400;
}

let PPU = function (nes) {
    let i;
    this.nes = nes;
    this.cycle = 0;    // 0-340
    this.scanLine = 0; // 0-261, 0-239=visible, 240=post, 241-260=vblank, 261=pre
    this.buffer = new Array(256);
    for (i = 0; i < this.buffer.length; i++) {
        this.buffer[i] = new Array(240);
    }
    this.frame = 0;    // frame counter
    this.paletteIndex = new Array(0x20); //  the image palette ($3F00-$3F0F) and the sprite palette ($3F10-$3F1F)
    for (i = 0; i < this.paletteIndex.length; i++) {
        this.paletteIndex[i] = 0;
    }
    this.nameTableData = new Array(0x800);
    for (i = 0; i < this.nameTableData.length; i++) {
        this.nameTableData[i] = 0;
    }
    this.oamData = new Array(0x100); // SPR-RAM
    for (i = 0; i < this.oamData.length; i++) {
        this.oamData[i] = 0;
    }
    // used for debugger
    this.debuggerScrollX = 0;
    this.debuggerScrollY = 0;
    this.debuggerNameTable = 0;
    this.debuggerX = 0;
    // PPU registers
    /**
     * Current VRAM address (15 bits).
     * The PPU uses the current VRAM address for both reading and writing PPU memory thru $2007,
     * and for fetching nametable data to draw the background. As it's drawing the background,
     * it updates the address to point to the nametable data currently being drawn.
     * Bits 10-11 hold the base address of the nametable minus $2000.
     * Bits 12-14 are the Y offset of a scanline within a tile.
     * The 15 bit registers t and v are composed this way during rendering:
     yyy NN YYYYY XXXXX
     ||| || ||||| +++++-- coarse X scroll
     ||| || +++++-------- coarse Y scroll
     ||| ++-------------- nametable select
     +++----------------- fine Y scroll
     */
    this.v = 0;
    this.t = 0; // Temporary VRAM address (15 bits); can also be thought of as the address of the top left onscreen tile.
    this.x = 0; // Fine X scroll (3 bits)
    this.w = 0; // First or second write toggle (1 bit)

    this.oddFrameFlag = 0; // even/odd frame flag (1 bit), set if odd

    this.nmiDelay = 0;

    // sprite temporary variables
    this.spriteCount = 0;
    this.spritePatterns = new Array(8);
    this.spriteXs = new Array(8);
    this.spritePriorities = new Array(8);
    this.spriteIndexes = new Array(8);

    this.flagBackgroundTable = 0;
    this.backgroundPix = new Array(16);

    this.result = new Array(16);
    for (i = 0; i < this.result.length; i++) {
        this.result[i] = i;
    }
};

PPU.prototype = {
    palette: [
        0x525252, 0xB40000, 0xA00000, 0xB1003D, 0x740069, 0x00005B, 0x00005F, 0x001840,
        0x002F10, 0x084A08, 0x006700, 0x124200, 0x6D2800, 0x000000, 0x000000, 0x000000,
        0xC4D5E7, 0xFF4000, 0xDC0E22, 0xFF476B, 0xD7009F, 0x680AD7, 0x0019BC, 0x0054B1,
        0x006A5B, 0x008C03, 0x00AB00, 0x2C8800, 0xA47200, 0x000000, 0x000000, 0x000000,
        0xF8F8F8, 0xFFAB3C, 0xFF7981, 0xFF5BC5, 0xFF48F2, 0xDF49FF, 0x476DFF, 0x00B4F7,
        0x00E0FF, 0x00E375, 0x03F42B, 0x78B82E, 0xE5E218, 0x787878, 0x000000, 0x000000,
        0xFFFFFF, 0xFFF2BE, 0xF8B8B8, 0xF8B8D8, 0xFFB6FF, 0xFFC3FF, 0xC7D1FF, 0x9ADAFF,
        0x88EDF8, 0x83FFDD, 0xB8F8B8, 0xF5F8AC, 0xFFFFB0, 0xF8D8F8, 0x000000, 0x000000
    ],

    reset: function () {
        this.cycle = 340;
        this.scanLine = 240;
        this.frame = 0;
        this.writeController(0);
        this.writeMask(0);
        this.writeOAMAddress(0);
    },

    // TODO: this.nmiDelay
    /**
     * Tick updates Cycle, ScanLine and Frame counters
     */
    tick: function () {
        if (this.nmiDelay > 0) {
            this.nmiDelay--;
            if (this.nmiDelay === 0 && this.nmiOutput && this.nmiOccurred) {
                this.nes.cpu.triggerNMI();
            }
        }
        // Pre-render scanLine (-1, 261): This scanLine varies in length, depending on whether an even or an odd frame is being rendered.
        // For odd frames, the cycle at the end of the scanLine is skipped
        // (this is done internally by jumping directly from (339,261) to (0,0),
        // replacing the idle tick at the beginning of the first visible scanLine with the last tick of the last dummy nametable fetch).
        // For even frames, the last cycle occurs normally.
        if (this.flagShowBackground !== 0 || this.flagShowSprites !== 0) {
            if (this.oddFrameFlag === 1 && this.scanLine === 261 && this.cycle === 339) {
                this.cycle = 0;
                this.scanLine = 0;
                this.frame++;
                this.oddFrameFlag ^= 1;
                return;
            }
        }
        this.cycle++;
        if (this.cycle > 340) { // [0,340]
            this.cycle = 0;
            this.scanLine++;
            if (this.scanLine > 261) { // [0, 261]
                this.scanLine = 0;
                this.frame++;
                this.oddFrameFlag ^= 1;
            }
        }
    },

    /**
     * Render Pixel
     */
    renderPixel: function () {
        let x = this.cycle - 1;
        let y = this.scanLine;
        let backgroundColor = this.backgroundPix[this.x];
        let spriteIndex = 0, spriteColor = 0;
        // spritePixel
        if (this.flagShowSprites !== 0) {
            for (let i = 0; i < this.spriteCount; i++) {
                let offset = x - this.spriteXs[i];
                if (offset < 0 || offset > 7) {
                    continue;
                }
                offset = 7 - offset;
                let color = (this.spritePatterns[i] >> (offset * 4)) & 0x0F;
                if (color % 4 === 0) {
                    continue;
                }
                spriteIndex = i;
                spriteColor = color;
                break;
            }
        }

        if (x < 8 && this.flagShowLeftBackground === 0) {
            backgroundColor = 0;
        }
        if (x < 8 && this.flagShowLeftSprites === 0) {
            spriteColor = 0;
        }
        /**
         * Priority multiplexer decision table
         * BG pixel    Sprite pixel    Priority    Output
         *   0             0              X        BG ($3F00)
         *   0             1-3            X        Sprite
         *   1-3           0              X        BG
         *   1-3           1-3            0        Sprite
         *   1-3           1-3            1        BG
         */
        let b = backgroundColor % 4 !== 0;
        let s = spriteColor % 4 !== 0;
        let color;
        if (!b && !s) {
            color = 0;
        } else if (!b && s) {
            color = spriteColor | 0x10;
        } else if (b && !s) {
            color = backgroundColor;
        } else {
            if (this.spriteIndexes[spriteIndex] === 0 && x < 255) {
                this.flagSpriteZeroHit = 1;
            }
            if (this.spritePriorities[spriteIndex] === 0) {
                color = spriteColor | 0x10;
            } else {
                color = backgroundColor;
            }
        }
        this.buffer[x][y] = this.palette[this.readPaletteIndex(color) % 64];
    },

    /**
     * Fetch sprite's pattern.
     * @param i: sprite index in SPR-RAM.
     * @param row: row in sprite ( 8x8 or 8x16 ).
     * @returns {number}
     */
    fetchSpritePattern: function (i, row) {
        let tileIndex = this.oamData[i * 4 + 1];  // Byte 1: Tile index number
        /** attributes
         76543210
         ||||||||
         ||||||++- Palette (4 to 7) of sprite
         |||+++--- Unimplemented
         ||+------ Priority (0: in front of background; 1: behind background)
         |+------- Flip sprite horizontally
         +-------- Flip sprite vertically
         */
        let attributes = this.oamData[i * 4 + 2]; // Byte 2: Attributes
        let paletteBase = (attributes & 3) << 2;
        let priority = (attributes >> 5) & 1;
        let flipHorizontally = (attributes >> 6) & 1;
        let flipVertically = (attributes >> 7) & 1;
        let address;
        if (this.flagSpriteSize === 0) {
            if (flipVertically) {
                row = 7 - row;
            }
            let table = this.flagSpriteTable;
            address = 0x1000 * table + tileIndex * 16 + row;
        } else {
            if (flipVertically) {
                row = 15 - row;
            }
            let table = tileIndex & 1;
            tileIndex &= 0xFE;
            if (row > 7) {
                tileIndex++;
                row -= 8;
            }
            address = 0x1000 * table + tileIndex * 16 + row;
        }
        let lowTileByte = this.read(address);
        let highTileByte = this.read(address + 8);
        let data = 0;
        for (let i = 0; i < 8; i++) {
            let p1, p2;
            if (flipHorizontally) {
                p1 = (lowTileByte & 1) << 0;
                p2 = (highTileByte & 1) << 1;
                lowTileByte >>= 1;
                highTileByte >>= 1;
            } else {
                p1 = (lowTileByte & 0x80) >> 7;
                p2 = (highTileByte & 0x80) >> 6;
                lowTileByte <<= 1;
                highTileByte <<= 1;
            }
            data <<= 4;
            data |= paletteBase | p1 | p2;
        }
        return data;
    },

    /**
     * Evaluate next scanLine's sprites
     */
    fetchSprites: function () {
        let h;
        if (this.flagSpriteSize === 0) {
            h = 8;
        } else {
            h = 16;
        }
        let count = 0;
        for (let i = 0; i < 64; i++) {
            let y = this.oamData[i * 4];     // Byte 0: Y position of top of sprite
            let a = this.oamData[i * 4 + 2];
            let x = this.oamData[i * 4 + 3];
            let row = this.scanLine - y;
            if (row < 0 || row >= h) {
                continue;
            }
            if (count < 8) {
                this.spritePatterns[count] = this.fetchSpritePattern(i, row);
                this.spriteXs[count] = x;
                this.spritePriorities[count] = (a >> 5) & 1;
                this.spriteIndexes[count] = i;
            }
            count++;
        }
        if (count > 8) {
            count = 8;
            this.flagSpriteOverflow = 1;
        }
        this.spriteCount = count;
    },

    /**
     * increment horizontal(v)
     */
    incrementX: function () {
        if ((this.v & 0x001F) === 31) {   // if coarse X == 31
            this.v &= 0xFFE0;             // coarse X = 0
            this.v ^= 0x0400;             // switch horizontal nameTable
        } else {
            this.v++;                     // increment coarse X
        }
    },

    /**
     * increment vertical(v)
     */
    incrementY: function () {
        // increment vert(v)
        // If rendering is enabled, fine Y is incremented at dot 256 of each scanLine,
        // overflowing to coarse Y, and finally adjusted to wrap among the nameTables vertically.
        // Bits 12-14 are fine Y. Bits 5-9 are coarse Y. Bit 11 selects the vertical nameTable.
        if ((this.v & 0x7000) !== 0x7000) {        // if fine Y < 7
            this.v += 0x1000;                      // increment fine Y
        } else {
            this.v &= 0x8FFF;                      // fine Y = 0
            let y = (this.v & 0x03E0) >> 5;        // let y = coarse Y
            if (y === 29) {
                y = 0;                             // coarse Y = 0
                this.v ^= 0x0800;                  // switch vertical nameTable
            } else if (y === 31) {
                y = 0;                             // coarse Y = 0, nameTable not switched
            } else {
                y++;                               // increment coarse Y
            }
            this.v = (this.v & 0xFC1F) | (y << 5); // put coarse Y back into v
        }
    },

    /**
     * ppu step. Render 1 pix.
     */
    step: function () {

        this.tick();

        let renderingEnabled = this.flagShowBackground !== 0 || this.flagShowSprites !== 0;
        let preLine = this.scanLine === 261;
        let visibleLine = this.scanLine < 240; // Visible scanLines (0-239)
        let renderLine = preLine || visibleLine;
        let preFetchCycle = this.cycle >= 321 && this.cycle <= 336;
        let visibleCycle = this.cycle >= 1 && this.cycle <= 256;
        let fetchCycle = preFetchCycle || visibleCycle;

        if (renderingEnabled) {
            // Visible scanlines (0-239)
            if (visibleLine && visibleCycle) {
                this.renderPixel();
            }
            // prepare tile data of the next scanLine
            if (renderLine && fetchCycle) {
                // The data for each tile is fetched during this phase.
                // Each memory access takes 2 PPU cycles to complete, and 4 must be performed per tile:
                this.backgroundPix.shift();
                let address;
                let v = this.v;
                let table = this.flagBackgroundTable;
                let tileIndex = this.nameTableByte;
                let fineY = (v >> 12) & 7;
                switch (this.cycle % 8) {
                    case 1: // Nametable byte
                        address = 0x2000 | (v & 0x0FFF);
                        this.nameTableByte = this.read(address);
                        break;
                    case 3: // Attribute table byte
                        /**
                         * 0yyy NNYY YYYX XXXX
                         *      G FE D  C BA
                         *      G       FEDCBA - address
                         *            b     a
                         *                 ba0 - shift
                         */
                        address = 0x23C0 | (v & 0x0C00) | ((v >> 4) & 0x38) | ((v >> 2) & 0x07);
                        let shift = ((v >> 4) & 4) | (v & 2);
                        this.attributeTableByte = ((this.read(address) >> shift) & 3) << 2;
                        break;
                    case 5: // Tile bitmap low
                        address = 0x1000 * table + tileIndex * 16 + fineY;
                        this.lowTileByte = this.read(address);
                        break;
                    case 7: // Tile bitmap high (+8 bytes from tile bitmap low)
                        address = 0x1000 * table + tileIndex * 16 + fineY;
                        this.highTileByte = this.read(address + 8);
                        break;
                    case 0:
                        // The data fetched from these accesses is placed into internal latches,
                        // and then fed to the appropriate shift registers when it's time to do so (every 8 cycles).
                        let a = this.attributeTableByte;
                        for (let i = 0; i < 8; i++) {
                            let p1 = (this.lowTileByte & 0x80) >> 7;
                            let p2 = (this.highTileByte & 0x80) >> 6;
                            this.lowTileByte <<= 1;
                            this.highTileByte <<= 1;
                            this.backgroundPix.push(a | p1 | p2);
                        }
                        break;
                }
            }

            // Pre-render scanLine (-1, 261)
            // During pixels 280 through 304 of the Pre-render scanLine, the vertical scroll bits are reloaded if rendering is enabled.
            if (preLine) {
                if (this.cycle >= 280 && this.cycle <= 304) {
                    // During dots 280 to 304 of the pre-render scanline (end of vblank)
                    // If rendering is enabled, at the end of vBlank,
                    // shortly after the horizontal bits are copied from t to v at dot 257,
                    // the PPU will repeatedly copy the vertical bits from t to v from dots 280 to 304,
                    // completing the full initialization of v from t:
                    // vert(v) = vert(t)
                    // v: .IHGF.ED CBA..... = t: .IHGF.ED CBA.....
                    this.v = (this.v & 0x841F) | (this.t & 0x7BE0);
                }
            }
            // if (renderLine) {
            if (fetchCycle && this.cycle % 8 === 0) {
                this.incrementX();
            }
            if (this.cycle === 256) {
                // At dot 256 of each scanline
                // If rendering is enabled, the PPU increments the vertical position in v.
                // The effective Y scroll coordinate is incremented,
                // which is a complex operation that will correctly skip the attribute table memory regions,
                // and wrap to the next nameTable appropriately.
                this.incrementY();
            }
            if (this.cycle === 257) {
                // At dot 257 of each scanline
                // If rendering is enabled, the PPU copies all bits related to horizontal position from t to v:
                // hori(v) = hori(t)
                // v: .....F.. ...EDCBA = t: .....F.. ...EDCBA
                this.v = (this.v & 0xFBE0) | (this.t & 0x041F);
            }
            // }

            // Cycles 257-320: Sprite fetches (8 sprites total, 8 cycles per sprite)
            // evaluate sprites of the next scanLine
            if (this.cycle === 257) {
                if (visibleLine) {
                    this.fetchSprites();
                } else {
                    this.spriteCount = 0;
                }
            }
        }

        if (this.cycle === 0 && this.scanLine === 239) {
            this.debuggerScrollX = (this.v & 0b11111) - 1;
            this.debuggerScrollY = (this.v >> 5) & 0b11111;
            this.debuggerNameTable = (this.v >> 10) & 0b11;
            this.debuggerX = this.x;
        }

        // Post-render scanLine (240)
        // The PPU just idles during this scanLine.
        // Even though accessing PPU memory from the program would be safe here, the VBlank flag isn't set until after this scanLine.
        let postLine = this.scanLine === 240;

        // Vertical blanking lines (241-260)
        // The VBlank flag of the PPU is set at tick 1 (the second tick) of scanLine 241, where the VBlank NMI also occurs.
        // The PPU makes no memory accesses during these scanLines, so PPU memory can be freely accessed by the program.
        if (this.scanLine === 241 && this.cycle === 1) {
            this.startVerticalBlank();
        }

        if (preLine && this.cycle === 1) {
            this.endVerticalBlank();
            this.flagSpriteZeroHit = 0;
            this.flagSpriteOverflow = 0;
        }
    },

    // TODO: this.nmiPrevious, this.nmiDelay
    /**
     * The PPU pulls /NMI low if and only if both NMI_occurred and NMI_output are true.
     * By toggling NMI_output (PPUCTRL.7) during vertical blank without reading PPUSTATUS,
     * a program can cause /NMI to be pulled low multiple times, causing multiple NMIs to be generated.
     */
    nmiChange: function () {
        let nmi = this.nmiOutput && this.nmiOccurred;
        if (nmi && !this.nmiPrevious) {
            // TODO: this fixes some games but the delay shouldn't have to be so
            // long, so the timings are off somewhere
            this.nmiDelay = 15;
        }
        this.nmiPrevious = nmi;
    },

    /**
     * Start of vertical blanking: Set NMI_occurred in PPU to true.
     */
    startVerticalBlank: function () {
        this.nmiOccurred = true;
        this.nmiChange();
    },

    /**
     * End of vertical blanking, sometime in pre-render scanLine: Set NMI_occurred to false.
     */
    endVerticalBlank: function () {
        this.nmiOccurred = false;
        this.nmiChange();
    },

    /**
     * Reads palette index by image(background)/sprite palette index.
     * @param address: [0, 31].
     * @returns {number}: [0, 63].
     */
    readPaletteIndex: function (address) {
        return this.paletteIndex[address];
    },

    /**
     * Writes palette index by image(background)/sprite palette index.
     * @param address: [0, 31].
     * @param value: [0, 63].
     */
    writePaletteIndex: function (address, value) {
        this.paletteIndex[address] = value;
    },

    /**
     * Reads PPU Memory.
     * @param address: 16bit.
     * @returns {number}: 8bit.
     */
    read: function (address) {
        // console.warn('ppu read', address.toString(16));
        address = address % 0x4000;
        if (address < 0x2000) {
            return this.nes.mapper.read(address);
        }
        if (address < 0x3F00) {
            let mode = this.nes.ines.mirroring;
            return this.nameTableData[mirrorAddress(mode, address) % 0x800];
        }
        if (address < 0x4000) {
            return this.readPaletteIndex(address % 32);
        }
        throw new Error("unhandled ppu memory read at address: " + address.toString(16));
    },

    /**
     * Writes PPU Memory.
     * @param address: 16bit.
     * @param value: 8bit.
     */
    write: function (address, value) {
        // console.warn('ppu write', address.toString(16), value.toString(16));
        address = address % 0x4000;
        if (address < 0x2000) {
            this.nes.mapper.write(address, value);
            return;
        }
        if (address < 0x3F00) {
            let mode = this.nes.ines.mirroring;
            this.nameTableData[mirrorAddress(mode, address) % 0x800] = value;
            return;
        }
        if (address < 0x4000) {
            this.writePaletteIndex(address % 0x20, value);
            return;
        }
        throw new Error("unhandled ppu memory write at address: " + address.toString(16));
    },

    /**
     * Reads PPU Register.
     * @param address: 16bit.
     * @returns {number}: 8bit.
     */
    readRegister: function (address) {
        // console.warn('ppu register read', address.toString(16));
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

    /**
     * Writes PPU Register.
     * @param address: 16bit.
     * @param value: 8bit.
     */
    writeRegister: function (address, value) {
        // console.warn('ppu register write', address.toString(16), value.toString(16));
        value &= 0xFF;
        this.register = value;
        switch (address) {
            case 0x2000:
                this.writeController(value);
                return;
            case 0x2001:
                this.writeMask(value);
                return;
            case 0x2002:
                throw new Error("invalid ppu register write at address: " + address.toString(16));
            case 0x2003:
                this.writeOAMAddress(value);
                return;
            case 0x2004:
                this.writeOAMData(value);
                return;
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
                this.write_OAM_DMA(value);
                return;
            default:
                throw new Error("unhandled ppu register write at address: " + address.toString(16));
        }
    },

    // TODO: this.nmiChange()
    /**
     * Controller ($2000) > write
     * Common name: PPUCTRL
     * Description: PPU control register
     * Access: write
     7  bit  0
     ---- ----
     VPHB SINN
     |||| ||||
     |||| ||++- Base nametable address
     |||| ||    (0 = $2000; 1 = $2400; 2 = $2800; 3 = $2C00)
     |||| |+--- VRAM address increment per CPU read/write of PPUDATA
     |||| |     (0: add 1, going across; 1: add 32, going down)
     |||| +---- Sprite pattern table address for 8x8 sprites
     ||||       (0: $0000; 1: $1000; ignored in 8x16 mode)
     |||+------ Background pattern table address (0: $0000; 1: $1000)
     ||+------- Sprite size (0: 8x8; 1: 8x16)
     |+-------- PPU master/slave select
     |          (0: read backdrop from EXT pins; 1: output color on EXT pins)
     +--------- Generate an NMI at the start of the vertical blanking interval (0: off; 1: on)
     *
     * @param value: 8bit.
     */
    writeController: function (value) {
        value &= 0xFF;
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
        // Write to PPUCTRL: Set NMI_output to bit 7.
        this.nmiOutput = ((value >> 7) & 1) === 1;
        // When turning on the NMI flag in bit 7, if the PPU is currently in vertical blank and the PPUSTATUS ($2002) vblank flag is set, an NMI will be generated immediately.
        this.nmiChange();
        // In the following, d refers to the data written to the port, and A through H to individual bits of a value.
        // update name table
        // t: ....BA.. ........ = d: ......BA
        this.t = (this.t & 0xF3FF) | (this.flagNameTable << 10);
    },

    /**
     * Mask ($2001) > write: PPU mask register.
     *
     7  bit  0
     ---- ----
     BGRs bMmG
     |||| ||||
     |||| |||+- Greyscale (0: normal color, 1: produce a greyscale display)
     |||| ||+-- 1: Show background in leftmost 8 pixels of screen, 0: Hide
     |||| |+--- 1: Show sprites in leftmost 8 pixels of screen, 0: Hide
     |||| +---- 1: Show background
     |||+------ 1: Show sprites
     ||+------- Emphasize red*
     |+-------- Emphasize green*
     +--------- Emphasize blue*
     *
     * @param value: 8bit.
     */
    writeMask: function (value) {
        value &= 0xFF;
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
        this.flagRedEmphasize = (value >> 5) & 1;
        this.flagGreenEmphasize = (value >> 6) & 1;
        this.flagBlueEmphasize = (value >> 7) & 1;
    },

    /**
     * Status ($2002) < read
     * Common name: PPUSTATUS
     * Description: PPU status register
     * Access: read
     * @returns {number}: 8bit.
     */
    readStatus: function () {
        // Bit 4 - If set, indicates that writes to VRAM should be ignored.
        // Bit 5 - Scanline sprite count, if set, indicates more than 8 sprites on the current scanLine.
        // Bit 6 - Sprite 0 hit flag, set when a non-transparent pixel of sprite 0 overlaps a non-transparent background pixel.
        // Bit 7 - Indicates whether V-Blank is occurring.
        let value = this.register & 0x1F;
        value |= this.flagSpriteOverflow << 5;
        value |= this.flagSpriteZeroHit << 6;
        // Reading the status register will clear D7 mentioned above and also the address latch used by PPUSCROLL and PPUADDR.
        // It does not clear the sprite 0 hit or overflow bit.
        // Read PPUSTATUS: Return old status of NMI_occurred in bit 7, then set NMI_occurred to false.
        if (this.nmiOccurred) {
            value |= 1 << 7;
        }
        this.nmiOccurred = false;
        this.nmiChange();
        // w:                   = 0
        this.w = 0;
        return value;
    },

    /**
     * OAM address ($2003) > write: SPR-RAM Address Register.
     * Holds the address in SPR-RAM to access on the next write to $2004.
     * @param value: 8bit.
     */
    writeOAMAddress: function (value) {
        this.oamAddress = value & 0xFF;
    },

    /**
     * OAM data ($2004) <> read/write: SPR-RAM I/O Register.
     * Reads a byte from SPR-RAM at the address indicated by $2003.
     */
    readOAMData: function () {
        return this.oamData[this.oamAddress];
    },

    /**
     * OAM data ($2004) <> read/write: SPR-RAM I/O Register.
     * Writes a byte to SPR-RAM at the address indicated by $2003.
     * @param value: 8bit.
     */
    writeOAMData: function (value) {
        this.oamData[this.oamAddress] = value & 0xFF;
        this.oamAddress++;
    },

    /**
     * Scroll ($2005) >> write x2: VRAM Address Register 1.
     * @param value: 8bit.
     */
    writeScroll: function (value) {
        value &= 0xff;
        if (this.w === 0) {
            // $2005 first write (w is 0): update coarse X scroll
            // t: ........ ...HGFED = d: HGFED...
            // x:               CBA = d: .....CBA
            // w:                   = 1
            this.t = (this.t & 0xFFE0) | (value >> 3);
            this.x = value & 0x07;
            this.w = 1;
        } else {
            // $2005 second write (w is 1): update coarse Y scroll
            // t: .CBA..HG FED..... = d: HGFEDCBA
            // w:                   = 0
            this.t = (this.t & 0x8FFF) | ((value & 0x07) << 12);
            this.t = (this.t & 0xFC1F) | ((value & 0xF8) << 2);
            this.w = 0;
        }
    },

    /**
     * Address ($2006) >> write x2: VRAM Address Register 2.
     * Since PPU memory uses 16-bit addresses but I/O registers are only 8-bit, two writes to $2006 are required to set the address required.
     * @param value: 8bit
     */
    writeAddress: function (value) {
        if (this.w === 0) {
            // $2006 first write (w is 0): update vram higher address
            // t: ..FEDCBA ........ = d: ..FEDCBA
            // t: .X...... ........ = 0
            // w:                   = 1
            this.t = (this.t & 0x80FF) | ((value & 0x3F) << 8);
            this.w = 1;
        } else {
            // $2006 second write (w is 1): update vram lower address
            // t: ........ HGFEDCBA = d: HGFEDCBA
            // v                    = t
            // w:                   = 0
            this.t = (this.t & 0xFF00) | value;
            this.v = this.t;
            this.w = 0;
        }
    },

    /**
     * Data ($2007) <> read/write: VRAM I/O Register.
     * Reads a byte from VRAM at the current address.
     * The first read from $2007 is invalid and the data will actually be buffered and returned on the next read. This does not apply to colour palettes.
     * Reading the palettes still updates the internal buffer though, but the data placed in it is the mirrored nametable data that would appear "underneath" the palette.
     * @returns {number}: 8bit.
     */
    readData: function () {
        let value = this.read(this.v);
        if (this.v % 0x4000 < 0x3F00) {
            let buffered = this.readBufferData;
            this.readBufferData = value;
            value = buffered;
        } else { // palettes
            this.readBufferData = this.read(this.v - 0x1000);
        }
        this.incrementVramAddress();
        return value;
    },

    /**
     * Data ($2007) <> read/write: VRAM I/O Register.
     * Writes a byte to VRAM at the current address.
     * @param value: 8bit
     */
    writeData: function (value) {
        this.write(this.v, value);
        this.incrementVramAddress();
    },

    /**
     * After each read from or write to $2007, the address is incremented by either 1 or 32 as dictated by bit 2 of $2000.
     * Outside of rendering.
     */
    incrementVramAddress: function () {
        this.v += this.flagIncrement === 0 ? 1 : 32;
    },

    /**
     * OAM DMA ($4014) > write: Sprite DMA Register.
     * Writing $XX will upload 256 bytes of data from CPU page $XX00-$XXFF to the internal PPU OAM.
     * This page is typically located in internal RAM, commonly $0200-$02FF, but cartridge RAM or ROM can be used as well.
     * The CPU is suspended during the transfer, which will take 513 or 514 cycles after the $4014 write tick.
     * (1 dummy read cycle while waiting for writes to complete, +1 if on an odd CPU cycle, then 256 alternating read/write cycles.)
     * @param value: 8bit.
     */
    write_OAM_DMA: function (value) {
        let cpu = this.nes.cpu;
        let address = value << 8;
        for (let i = 0; i < 256; i++) { // $XX00-$XXFF
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