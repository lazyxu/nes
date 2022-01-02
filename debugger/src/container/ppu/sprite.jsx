import React from 'react'
import { connect } from 'react-redux'

import './sprite.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.frame = 0;
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
        let nes = window.nes;
        if (nextProps.frame !== this.frame) {
            this.update();
            this.frame = nes.ppu.frame;
        }
    }

    update() {
        let nes = window.nes;
        // if (nes.ppu.frame < 800) {
        //     return;
        // }
        let spriteRamContext = this.refs["spriteRam"].getContext('2d');
        let spriteContext = this.refs["sprite"].getContext('2d');
        spriteContext.fillStyle = '#000000';
        spriteContext.fillRect(0, 0, 256, 256);
        let canvasImageData = spriteRamContext.getImageData(0, 0, 8, 16);
        let buf = new ArrayBuffer(canvasImageData.data.length);
        let buf8 = new Uint8ClampedArray(buf);
        let buf32 = new Uint32Array(buf);

        for (let y1 = 3; y1 >= 0; y1--) { // 64 sprites 256 bytes
            for (let x1 = 0; x1 < 16; x1++) {
                let base = (y1 * 16 + x1) * 4;
                let y2 = nes.ppu.oamData[base];
                let tileIndex = nes.ppu.oamData[base + 1];
                let attribute = nes.ppu.oamData[base + 2];
                let x2 = nes.ppu.oamData[base + 3];
                let highTwoBit = (attribute & 0b11) << 2;
                // let flagSpriteSize = (attribute & 0b100);
                let flagSpriteSize = nes.ppu.spriteSize[y1 * 16 + x1];
                let overBackground = (attribute >> 5) & 1;
                let flipHorizontally = (attribute >> 6) & 1;
                let flipVertically = (attribute >> 7) & 1;

                let table = 1 - nes.ppu.flagBackgroundTable;
                let address = 0x1000 * table + tileIndex * 16;
                let paletteOffset = 0x10;
                for (let i = 8 * 8; i < 8 * 16; i++) {
                    buf32[i] = 0;
                }
                for (let y = 0; y < 8; y++) {
                    let lowTileByte = nes.ppu.read(address + y);
                    let highTileByte = nes.ppu.read(address + y + 8);
                    for (let x = 0; x < 8; x++) {
                        let index = flipVertically ? (7 - y) * 8 : y * 8;
                        index += flipHorizontally ? (7 - x) : x;
                        buf32[index] = 0xFF000000 |
                            nes.ppu.palette[
                            nes.ppu.readPaletteIndex(
                                paletteOffset + (
                                    highTwoBit & 0b1100 |
                                    (highTileByte >> 6) & 0b10 |
                                    (lowTileByte >> 7) & 1))
                            ];
                        lowTileByte <<= 1;
                        highTileByte <<= 1;
                    }
                }
                canvasImageData.data.set(buf8);
                spriteRamContext.putImageData(canvasImageData, x1 * 16, y1 * 16);

                if (overBackground === 1) {
                    continue;
                }
                if (flagSpriteSize === 0) {
                    for (let y = 0; y < 8; y++) {
                        let lowTileByte = nes.ppu.read(address + y);
                        let highTileByte = nes.ppu.read(address + y + 8);
                        for (let x = 0; x < 8; x++) {
                            let index = flipVertically ? (7 - y) * 8 : y * 8;
                            index += flipHorizontally ? (7 - x) : x;
                            buf32[index] = 0xFF000000 |
                                nes.ppu.palette[
                                nes.ppu.readPaletteIndex(
                                    paletteOffset + (
                                        highTwoBit & 0b1100 |
                                        (highTileByte >> 6) & 0b10 |
                                        (lowTileByte >> 7) & 1))
                                ];
                            lowTileByte <<= 1;
                            highTileByte <<= 1;
                        }
                    }
                } else {
                    let table = (tileIndex & 1) === 1 ? 1 : 0;
                    let address = 0x1000 * table + (tileIndex & 0xFE) * 16;
                    for (let y = 0; y < 8; y++) {
                        let lowTileByte = nes.ppu.read(address + y);
                        let highTileByte = nes.ppu.read(address + y + 8);
                        for (let x = 0; x < 8; x++) {
                            let index = flipVertically ? (15 - y) * 8 : y * 8;
                            index += flipHorizontally ? (7 - x) : x;
                            buf32[index] = 0xFF000000 |
                                nes.ppu.palette[
                                nes.ppu.readPaletteIndex(
                                    paletteOffset + (
                                        highTwoBit & 0b1100 |
                                        (highTileByte >> 6) & 0b10 |
                                        (lowTileByte >> 7) & 1))
                                ];
                            lowTileByte <<= 1;
                            highTileByte <<= 1;
                        }
                    }
                    address += 16;
                    for (let y = 0; y < 8; y++) {
                        let lowTileByte = nes.ppu.read(address + y);
                        let highTileByte = nes.ppu.read(address + y + 8);
                        for (let x = 0; x < 8; x++) {
                            let index = flipVertically ? (7 - y) * 8 : (y + 8) * 8;
                            index += flipHorizontally ? (7 - x) : x;
                            buf32[index] = 0xFF000000 |
                                nes.ppu.palette[
                                nes.ppu.readPaletteIndex(
                                    paletteOffset + (
                                        highTwoBit & 0b1100 |
                                        (highTileByte >> 6) & 0b10 |
                                        (lowTileByte >> 7) & 1))
                                ];
                            lowTileByte <<= 1;
                            highTileByte <<= 1;
                        }
                    }
                }
                // console.log(x1, y1, x2, y2);
                canvasImageData.data.set(buf8);
                spriteContext.putImageData(canvasImageData, x2, y2);
            }
        }
    }

    render() {
        return (
            <div className="Sprite">
                <p>sprite RAM</p>
                <canvas ref='sprite' width="256" height="240" />
                <canvas ref='spriteRam' width="256" height="64" />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        frame: state.frame,
    }
}

export default connect(mapStateToProps)(component)