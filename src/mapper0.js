// NROM
//
// The generic designation NROM refers to the Nintendo cartridge boards NES-NROM-128, NES-NROM-256,
// their HVC counterparts, and clone boards.
// The iNES format assigns mapper 0 to NROM.

// Banks
// All Banks are fixed,
//
//     CPU $6000-$7FFF: Family Basic only: PRG RAM, mirrored as necessary to fill entire 8 KiB window, write protectable with an external switch
//     CPU $8000-$BFFF: First 16 KB of ROM.
//     CPU $C000-$FFFF: Last 16 KB of ROM (NROM-256) or mirror of $8000-$BFFF (NROM-128).


let Mapper = function (nes) {
    let i;
    this.nes = nes;
    this.prgRomBanks = this.nes.ines.numPrgRom;
    this.prgRomUpperBank = this.prgRomBanks - 1;
    this.prgRomLowerBank = 0;
    this.prgRam = new Array(4096); // PRG RAM: 2K or 4K in Family Basic only
    for (i = 0; i < this.prgRam.length; ++i) {
        this.prgRam[i] = 0;
    }
};

Mapper.prototype = {

    read: function (address) {
        // console.warn('mapper0 read', address.toString(16));
        if (address < 0x2000) {
            return this.nes.ines.chrRom[address] & 0xff;
        }
        if (address >= 0xc000) {
            return this.nes.ines.prgRom[this.prgRomUpperBank * 0x4000 + address - 0xc000] & 0xff;
        }
        if (address >= 0x8000) {
            return this.nes.ines.prgRom[this.prgRomLowerBank * 0x4000 + address - 0x8000] & 0xff;
        }
        if (address >= 0x6000) {
            address = 0x6000 + (address - 0x6000) % this.prgRam.length;
            return this.prgRam[address] & 0xff;
        }
        // throw new Error("unhandled mapper0 read at address: " + address.toString(16));
    },

    write: function (address, value) {
        value &= 0xff;
        // console.warn('mapper0 write', address.toString(16), value.toString(16));
        if (address < 0x2000) {
            this.nes.ines.chrRom[address] = value;
            return;
        }
        if (address >= 0x8000) {
            this.prgRomLowerBank = value % this.prgRomBanks;
            return;
        }
        if (address >= 0x6000) {
            address = 0x6000 + (address - 0x6000) % this.prgRam.length;
            this.prgRam[address] = value;
            return;
        }
        // throw new Error("unhandled mapper0 write at address: " + address.toString(16));
    },

    info: function () {
        return {
            "ROM TYPE": "NROM",
            "Company": "Nintendo, others",
            "Boards": "NROM, HROM*, RROM, RTROM, SROM, STROM",
            "PRG ROM capacity": (this.prgRomBanks * 16) + "K",
            "PRG ROM window": "n/a",
            "PRG RAM capacity": "2K or 4K in Family Basic only",
            "PRG RAM window": "n/a",
            "CHR capacity": "8K",
            "CHR window": "n/a",
            "Nametable mirroring": "Fixed H or V, controlled by solder pads (*V only)",
            "Bus conflicts": "Yes",
            "IRQ": "No",
            "Audio": "No",
            "iNES mappers": "000"
        }
    }
};

module.exports = Mapper;