// UxROM
//
// The generic designation UxROM refers to the Nintendo cartridge boards NES-UNROM, NES-UOROM, HVC-UN1ROM
// their HVC counterparts, and clone boards.

// Example games:
//     Mega Man
//     Castlevania
//     Contra
//     Duck Tales
//     Metal Gear

// Banks
//
//     CPU $8000-$BFFF: 16 KB switchable PRG ROM bank
//     CPU $C000-$FFFF: 16 KB PRG ROM bank, fixed to the last bank


let Mapper = function (nes) {
    this.nes = nes;
    this.prgRomBanks = this.nes.ines.prgRom.length;
    this.prgRomUpperBank = this.prgRomBanks - 1;
    this.prgRomLowerBank = 0;
};

Mapper.prototype = {

    read: function (address) {
        // console.warn('mapper2 read', address.toString(16));
        if (address < 0x2000) {
            return this.nes.ines.chrRom[0][address];
        }
        if (address >= 0xc000) {
            return this.nes.ines.prgRom[this.prgRomUpperBank][address - 0xc000] & 0xff;
        }
        if (address >= 0x8000) {
            return this.nes.ines.prgRom[this.prgRomLowerBank][address - 0x8000] & 0xff;
        }
        if (address >= 0x6000) {
            // throw new Error("invalid SRAM read in mapper2 at address: " + address.toString(16));
        }
        // throw new Error("unhandled mapper2 read at address: " + address.toString(16));
    },

    write: function (address, value) {
        // console.warn('mapper2 write', address.toString(16), value.toString(16));
        if (address < 0x2000) {
            this.nes.ines.chrRom[0][address] = value;
            return;
        }
        if (address >= 0x8000) {
            this.prgRomLowerBank = value % this.prgRomBanks;
            return;
        }
        if (address >= 0x6000) {
            // throw new Error("invalid SRAM write in mapper2 at address: " + address.toString(16));
        }
        // throw new Error("unhandled mapper2 write at address: " + address.toString(16));
    },

    info: function () {
        return {
            "ROM TYPE": "UxROM",
            "Company": "Nintendo, others",
            "Games": "155 in NesCartDB",
            "Complexity": "Discrete logic",
            "Boards": "UNROM, UOROM",
            "PRG ROM capacity": "256K/4096K",
            "PRG ROM window": "16K + 16K fixed",
            "PRG RAM capacity": "None",
            "CHR capacity": "8K",
            "CHR window": "n/a",
            "Nametable mirroring": "Fixed H or V, controlled by solder pads",
            "Bus conflicts": "Yes/No",
            "IRQ": "No",
            "Audio": "No",
            "iNES mappers": "002, 094, 180"
        }
    }
};

module.exports = Mapper;