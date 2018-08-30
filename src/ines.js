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
let INES = function (nes) {
    this.nes = nes;
    this.prgRom = null; // rom
    this.chrRom = null; // vrom
    this.chrRam = null;
    this.trainer = null;
    this.mapperType = null;
    this.batteryRam = null;
};

INES.prototype = {
    // Mirroring types:
    HORIZONTAL_MIRRORING: 0,
    VERTICAL_MIRRORING: 1,
    FOURSCREEN_MIRRORING: 2,

    // load reads an iNES file (.nes)
    load: function (data) {
        let i;
        this.data = data;
        let header = new Array(16);
        for (i = 0; i < 16; ++i) {
            header[i] = data.charCodeAt(i) & 0xff;
        }
        //  identify the file as an iNES file: NES\x1a
        if (header[0] !== 0x4e ||
            header[1] !== 0x45 ||
            header[2] !== 0x53 ||
            header[3] !== 0x1a
        ) {
            // throw new Error("Not a valid iNES file.");
        }

        // Number of 16 KB PRG-ROM banks.
        // The PRG-ROM (Program ROM) is the area of ROM used to store the program code.
        this.numPrgRom = header[4];

        // Number of 8 KB CHR-ROM / VROM banks.
        // The names CHR-ROM (Character ROM) and VROM are used synonymously to
        // refer to the area of ROM used to store graphics information, the pattern tables.
        let numChrRom = header[5];

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
        let control1 = header[6];

        this.nes.ppu.updateMirroring(control1 & 1);
        if (control1 & 8) {
            this.nes.ppu.updateMirroring(this.FOURSCREEN_MIRRORING);
        }

        this.batteryRam = (control1 & 2) !== 0 ? 1 : 0;

        let trainerExist = (control1 & 4) !== 0;

        // ROM Control Byte 2:
        // • Bits 0-3 - Reserved for future usage and should all be 0.
        // • Bits 4-7 - Four upper bits of the mapper number.
        let control2 = header[7];

        this.mapperType = (control2 & 0xf0) | (control1 >> 4);

        // Number of 8 KB RAM banks. For compatibility with previous
        // versions of the iNES format, assume 1 page of RAM when
        // this is 0.
        let numPrgRam = header[8];

        // Reserved for future usage and should all be 0.
        for (i = 9; i < 16; ++i) {
            if (header[i] !== 0) {
                // throw new Error("Reserved for future usage and should all be 0.");
            }
        }
        let offset = 16;

        // Following the header is the 512-byte trainer, if one is present, otherwise the ROM banks
        // begin here, starting with PRG-ROM then CHR-ROM.
        if (trainerExist) {
            let trainerBuf = new ArrayBuffer(0x200); // 512 bytes
            this.trainer = new Uint8Array(trainerBuf);
            for (i = 0; i < 0x200; ++i) {
                this.trainer[i] = data.charCodeAt(offset + i) & 0xff;
            }
            offset += 0x200;
        }

        // Load PRG-ROM banks:
        let prgRomSize = this.numPrgRom * 0x4000;
        let prgRomBuf = new ArrayBuffer(prgRomSize); // 16384 bytes
        this.prgRom = new Uint8Array(prgRomBuf);
        for (i = 0; i < prgRomSize; ++i) {
            if (offset + i >= data.length) {
                return;
            }
            this.prgRom[i] = data.charCodeAt(offset + i) & 0xff;

        }
        offset += prgRomSize;

        if (numChrRom !== 0) {
            // Load CHR-ROM banks:
            let chrRomBuf = new ArrayBuffer(numChrRom * 0x2000); // 8192 bytes
            this.chrRom = new Uint8Array(chrRomBuf);
            for (i = 0; i < numChrRom * 0x2000; ++i) {
                if (offset + i >= data.length) {
                    return;
                }
                this.chrRom[i] = data.charCodeAt(offset + i) & 0xff;
            }
            offset += numChrRom * 0x2000;
        } else {
            numChrRom = 1;
            let chrRomBuf = new ArrayBuffer(numChrRom * 0x2000); // 8192 bytes
            this.chrRom = new Uint8Array(chrRomBuf);
            for (i = 0; i < numChrRom * 0x2000; ++i) {
                if (offset + i >= data.length) {
                    return;
                }
                this.chrRom[i] = data.charCodeAt(offset + i) & 0xff;
            }
            offset += numChrRom * 0x2000;
            let chrRamBuf = new ArrayBuffer(0x2000); // 8192 bytes
            this.chrRam = new Uint8Array(chrRamBuf);
            for (i = 0; i < 0x1000; ++i) {
                if (offset + i >= data.length) {
                    return;
                }
                this.chrRam[i] = data.charCodeAt(offset + i) & 0xff;
            }
        }

    }
};

module.exports = INES;