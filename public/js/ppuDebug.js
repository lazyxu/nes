var imagePalette = "";
var spritePalette = "";
for (var j = 0; j < 2; j++) {
    imagePalette += '<div class="line">';
    spritePalette += '<div class="line">';
    for (var i = 0; i < 8; i++) {
        imagePalette += '<div id="imagePalette' + (j * 8 + i) + '" class="rect"></div>';
        spritePalette += '<div id="spritePalette' + (j * 8 + i) + '" class="rect"></div>';
    }
    imagePalette += '</div>';
    spritePalette += '</div>';
}
document.getElementById('imagePalette').innerHTML += imagePalette;
document.getElementById('spritePalette').innerHTML += spritePalette;

function updatePalette(nes) {
    var i, color;
    var imagePalette = nes.ppu.readImagePalette();
    var spritePalette = nes.ppu.readSpritePalette();
    for (i=0;i<imagePalette.length;i++) {
        color = imagePalette[i];
        document.getElementById('imagePalette'+i).style.background = 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')';
    }
    for (i=0;i<spritePalette.length;i++) {
        color = spritePalette[i];
        document.getElementById('spritePalette'+i).style.background = 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')';
    }
}