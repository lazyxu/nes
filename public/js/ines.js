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
    this.numPRG = null; // rom
    this.numCHR = null; // vrom
    this.mirroring = null;
    this.mapperType = null;
    this.numRAM = null;
    this.rpgRom = null;
    this.chrRom = null;
};

INES.prototype = {
    // Mirroring types:
    HORIZONTAL_MIRRORING: 0,
    VERTICAL_MIRRORING: 1,
    FOURSCREEN_MIRRORING: 2,

    // LoadNESFile reads an iNES file (.nes) and returns a Cartridge on success.
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
            throw new Error("Not a valid NES ROM.");
        }

        // Number of 16 KB PRG-ROM banks.
        // The PRG-ROM (Program ROM) is the area of ROM used to store the program code.
        this.numPRG = header[4];

        // Number of 8 KB CHR-ROM / VROM banks.
        // The names CHR-ROM (Character ROM) and VROM are used synonymously to
        // refer to the area of ROM used to store graphics information, the pattern tables.
        this.numCHR = header[5];

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

        var batteryRam = (control1 & 2) !== 0;

        var trainer = (control1 & 4) !== 0;

        // ROM Control Byte 2:
        // • Bits 0-3 - Reserved for future usage and should all be 0.
        // • Bits 4-7 - Four upper bits of the mapper number.
        var control2 = header[7];

        this.mapperType = (control2 & 0xf0) | (control1 >> 4);

        // Number of 8 KB RAM banks. For compatibility with previous
        // versions of the iNES format, assume 1 page of RAM when
        // this is 0.
        this.numRAM = header[8];

        // Reserved for future usage and should all be 0.
        for (var i = 9; i < 16; i++) {
            if (header[i] !== 0) {
                throw new Error("Reserved for future usage and should all be 0.");
            }
        }

        // Following the header is the 512-byte trainer, if one is present, otherwise the ROM banks
        // begin here, starting with PRG-ROM then CHR-ROM.

        // Load PRG-ROM banks:
        this.rpgRom = new Array(this.numPRG);
        var offset = 16;
        for (var i = 0; i < this.numPRG; i++) {
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
        this.chrRom = new Array(this.numCHR);
        for (i = 0; i < this.numCHR; i++) {
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

