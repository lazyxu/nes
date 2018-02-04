let fs = require('fs');
let path = require("path");
let nesEmulator = require('../src/index');

function readString(cpu, address) {

}

function officlalInstructions() {
    let i;
    fs.readFile(path.resolve(__dirname, "../../nes-test-roms/instr_test-v5/official_only.nes"), 'binary', function (error, file) {
            if (typeof(error) !== 'undefined' && error != null) {
                console.log(error);
            } else {
                let nes = new nesEmulator.NES();
                nes.load(file);
                nes.cpu.write(0x6000, 0xFF);
                for (; ;) {
                    for (i = 0; i < 65536; i++) {
                        nes.cpu.step();
                    }
                    if (nes.cpu.read(0x6000) < 0x80) {
                        break;
                    }
                    let message = readString(nes.cpu, 0x6004);
                    if (message.length > 0) {
                        console.log(message);
                    }
                }
            }
        }
    );
}

console.log(officlalInstructions());