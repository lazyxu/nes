exports.loadROM = function(nes, file, callback) {
    if (file.size === 0) {
        return
    }
    let reader = new FileReader();
    reader.onload = function () {
        nes.load(this.result);
        if (typeof callback==='function') {
            callback(nes);
        }
    };
    reader.readAsBinaryString(file);
};
