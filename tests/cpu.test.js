let fs = require('fs');
let path = require("path");
let nesEmulator = require('../src/index');

let nes = new nesEmulator.NES();

function officlalInstructions() {
    let i;
    fs.readFile(path.resolve(__dirname, "../nes-test-roms/cpu_interrupts_v2/cpu_interrupts.nes"), 'binary', function (error, file) {
            if (typeof(error) !== 'undefined' && error != null) {
                console.log(error);
            } else {
                nes.load(file);
                nes.reset();
                nes.cpu.write(0x6000, 0xFF);
                for (; ;) {
                    for (i = 0; i < 65536; i++) {
                        nes.cpu.step();
                    }
                    if (nes.cpu.read(0x6000) < 0x80) {
                        break;
                    }
                }
                let message = "";
                for (let address = 0x6004; ; address++) {
                    let c = nes.cpu.read(address);
                    if (c === 0) {
                        break;
                    }
                    message += String.fromCharCode(c);
                }
                if (message.length > 0) {
                    console.log(message);
                }
            }
        }
    );
}

function nestest() {
    let i;
    fs.readFile(path.resolve(__dirname, "../test/nestest.nes"), 'binary', function (error, file) {
            if (typeof(error) !== 'undefined' && error != null) {
                console.log(error);
            } else {
                nes.load(file);
                nes.reset();
                nes.cpu.PC = 0xC000;
                for (; nes.cpu.PC !== 1;) {
                    nes.cpu.printInstruction(true);
                    nes.cpu.step();
                }
            }
        }
    );
}

let arguments = process.argv.splice(2);
if (arguments.indexOf("-official") > -1) {
    officlalInstructions();
}
if (arguments.indexOf("-nestest") > -1) {
    nestest();
}