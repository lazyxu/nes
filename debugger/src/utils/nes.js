exports.loadROM = function(nes, file) {
    if (file.size === 0) {
        return
    }
    var reader = new FileReader();
    reader.onload = function () {
        nes.load(this.result);
        // // var result = '';
        // for (var i = 0; i < 8991; i++) {
        //     // console.log("--------------------------------------------------------");
        //     // var info = nes.cpu.printInstruction();
        //     // console.log(i + 1, info);
        //     // result += info;
        //     // document.getElementById("result").innerText = result;
        //     nes.step();
        //     // if (i % 100 == 0) {
        //     //     updatePalette(nes);
        //     // }
        // }
        // // document.getElementById("result").innerText = result;
    };
    reader.readAsBinaryString(file);
};
