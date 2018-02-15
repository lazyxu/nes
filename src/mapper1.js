// MMC1
//
// The Nintendo MMC1 is a mapper ASIC used in Nintendo's SxROM and NES-EVENT Game Pak boards.
// Most common SxROM boards are assigned to iNES Mapper 1.
// This chip first appeared in the April of 1987.

// Banks
// All Banks are fixed,
//
//     CPU $6000-$7FFF: 8 KB PRG RAM bank, fixed on all boards but SOROM and SXROM
//     CPU $8000-$BFFF: 16 KB PRG ROM bank, either switchable or fixed to the first bank
//     CPU $C000-$FFFF: 16 KB PRG ROM bank, either fixed to the last bank or switchable
//     PPU $0000-$0FFF: 4 KB switchable CHR bank
//     PPU $1000-$1FFF: 4 KB switchable CHR bank
//
// Through writes to the MMC1 control register,
// it is possible for the program to swap the fixed and switchable PRG ROM banks
// or to set up 32 KB PRG bankswitching (like BNROM),
// but most games use the default setup, which is similar to that of UxROM.

let Mapper = function (nes) {
    let i;
    this.nes = nes;
    this.prgRomBanks = this.nes.ines.prgRom.length;
    this.prgRomUpperBank = this.prgRomBanks - 1;
    this.prgRomLowerBank = 0;
    this.chrLowerBank = 0;
    this.chrUpperBank = 0;
    this.prgRam = new Array(32 * 1024); // PRG RAM: 32K
    for (i = 0; i < this.prgRam.length; i++) {
        this.prgRam[i] = 0;
    }

    this.shiftRegister = 0;
    this.control = 0;
    this.prgMode = 0;
    this.chrMode = 0;
    this.prgBank = 0;
    this.chrBank0 = 0;
    this.chrBank1 = 0;
};

Mapper.prototype = {

    read: function (address) {
        address &= 0xFFFF;
        console.warn('mapper1 read', address.toString(16));
        if (address < 0x2000) {
            return address < 0x1000 ?
                this.nes.ines.chrRam[this.chrLowerBank * 0x1000] :
                this.nes.ines.chrRam[this.chrUpperBank * 0x1000];
        }
        if (address >= 0xc000) {
            return this.nes.ines.prgRom[this.prgRomUpperBank][address - 0xc000] & 0xff;
        }
        if (address >= 0x8000) {
            return this.nes.ines.prgRom[this.prgRomLowerBank][address - 0x8000] & 0xff;
        }
        if (address >= 0x6000) {
            address = 0x6000 + (address - 0x6000) % this.prgRam.length;
            return this.prgRam[address] & 0xff;
        }
        throw new Error("unhandled mapper1 read at address: " + address.toString(16));
    },

    write: function (address, value) {
        address &= 0xFFFF;
        value &= 0xff;
        // console.warn('mapper1 write', address.toString(16), value.toString(16));
        if (address < 0x2000) {
            if (address < 0x1000) {
                this.nes.ines.chrRam[this.chrLowerBank * 0x1000] = value;
            } else {
                this.nes.ines.chrRam[this.chrUpperBank * 0x1000] = value;
            }
            return;
        }
        if (address >= 0x8000) {
            if (value & 0x80 === 0x80) {
                this.shiftRegister = 0x10;
                this.writeControl(this.control | 0x0C);
            } else {
                let complete = this.shiftRegister & 1 === 1;
                this.shiftRegister >>= 1;
                this.shiftRegister |= (value & 1) << 4;
                if (complete) {
                    this.writeRegister(address, this.shiftRegister);
                    this.shiftRegister = 0x10;
                }
            }
            return;
        }
        if (address >= 0x6000) {
            address = 0x6000 + (address - 0x6000) % this.prgRam.length;
            this.prgRam[address] = value;
            return;
        }
        throw new Error("unhandled mapper1 write at address: " + address.toString(16));
    },

    writeRegister: function (address, value) {
        // PRG bank (internal, $E000-$FFFF)
        if (address >= 0xE000) {
            this.prgBank = value & 0x0F;
        }
        // CHR bank 1 (internal, $C000-$DFFF)
        if (address >= 0xC000) {
            this.chrBank1 = value & 0x0F;
        }
        // CHR bank 0 (internal, $A000-$BFFF)
        if (address >= 0xA000) {
            this.chrBank0 = value & 0x0F;
        }
        this.updateOffsets();
    },

    // Control (internal, $8000-$9FFF)
    writeControl: function (value) {
        this.control = value;
        this.chrMode = (value >> 4) & 1;
        this.prgMode = (value >> 2) & 3;
        let mirror = value & 3;
        switch (mirror) {
            case 0:
                break;
        }
        this.updateOffsets();
    },

    // PRG ROM bank mode (0, 1: switch 32 KB at $8000, ignoring low bit of bank number;
    //                    2: fix first bank at $8000 and switch 16 KB bank at $C000;
    //                    3: fix last bank at $C000 and switch 16 KB bank at $8000)
    // CHR ROM bank mode (0: switch 8 KB at a time; 1: switch two separate 4 KB banks)
    updateOffsets: function () {
        switch (this.prgMode) {
            case 0:
            case 1:
                this.prgRomLowerBank = this.prgBank & 0xFE;
                this.prgRomUpperBank = this.prgBank | 0x01;
                break;
            case 2:
                this.prgRomLowerBank = 0;
                this.prgRomUpperBank = this.prgBank;
                break;
            case 3:
                this.prgRomLowerBank = this.prgBank;
                this.prgRomUpperBank = this.prgRomBanks - 1;
                break;
        }
        switch (this.chrMode) {
            case 0:
                this.chrLowerBank = this.chrBank0 & 0xFE;
                this.chrUpperBank = this.chrBank0 | 0x01;
                break;
            case 1:
                this.chrLowerBank = this.chrBank0;
                this.chrUpperBank = this.chrBank1;
                break;
        }
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