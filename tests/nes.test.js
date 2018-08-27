let fs = require('fs');
let path = require("path");
let nesEmulator = require('../src/index');
// var profiler = require('cpu-profiler');

let nes = new nesEmulator.NES();

function run(file) {
    fs.readFile(path.resolve(__dirname, file), 'binary', function (error, file) {
            if (typeof(error) !== 'undefined' && error != null) {
                console.log(error);
            } else {
                nes.load(file);
                nes.run();
            }
        }
    );
}

let arguments = process.argv.splice(2);
// profiler.startProfiling("1")                   // start cpu profiling
run(arguments[0])
//
// process.on('SIGINT', function() {
//     console.log("Caught interrupt signal");
//     var cpuProfile = profiler.stopProfiling("1")   // stop cpu profiling
//     console.log(cpuProfile)
//     process.exit();
// });