var Mapper2 = function (nes) {
    this.nes = nes;
    this.rpgRomBanks = this.nes.ines.rpgRom.length;
    this.rpgRomUpperBank = this.rpgRomBanks - 1;
    this.rpgRomLowerBank = 0;
};

Mapper2.prototype = {

    read: function (address) {
        address &= 0xFFFF;
        // console.warn('mapper2 read', address.toString(16));
        if (address < 0x2000) {
            return this.nes.ines.chrRom[0][address] & 0xff;
        }
        if (address >= 0xc000) {
            return this.nes.ines.rpgRom[this.rpgRomUpperBank][address - 0xc000] & 0xff;
        }
        if (address >= 0x8000) {
            return this.nes.ines.rpgRom[this.rpgRomLowerBank][address - 0x8000] & 0xff;
        }
        if (address >= 0x6000) {
            return this.nes.ines.sram[address - 0x6000] & 0xff;
        }
        throw new Error("unhandled mapper2 read at address: " + address.toString(16));
    },

    write: function (address, value) {
        address &= 0xFFFF;
        value &= 0xff;
        // console.warn('mapper2 write', address.toString(16), value.toString(16));
        if (address < 0x2000) {
            this.nes.ines.chrRom[0][address] = value;
            return;
        }
        if (address >= 0x8000) {
            this.rpgRomLowerBank = value % this.rpgRomBanks;
            return;
        }
        if (address >= 0x6000) {
            this.nes.ines.sram[address - 0x6000] = value;
            return;
        }
        throw new Error("unhandled mapper2 write at address: " + address.toString(16));
    }
};

module.exports = Mapper2;