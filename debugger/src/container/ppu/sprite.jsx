import React from 'react'
import {connect} from 'react-redux'

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
        let canvasContext = this.refs["sprite"].getContext('2d');
        let canvasImageData = canvasContext.getImageData(0, 0, 8, 8);
        let buf = new ArrayBuffer(canvasImageData.data.length);
        let buf8 = new Uint8ClampedArray(buf);
        let buf32 = new Uint32Array(buf);

        for (let y1 = 0; y1 < 4; y1++) { // 64 sprites 256 bytes
            for (let x1 = 0; x1 < 16; x1++) {
                let base = (y1 * 16 + x1) * 4;
                let y2 = nes.ppu.oamData[base];
                let tileIndex = nes.ppu.oamData[base + 1];
                let attribute = nes.ppu.oamData[base + 2];
                let x2 = nes.ppu.oamData[base + 3];
                let highTwoBit = (attribute & 0b11) << 2;
                let overBackground = (attribute >> 4) & 1;
                let flipHorizontally = (attribute >> 5) & 1;
                let flipVertically = (attribute >> 6) & 1;

                let table = 1 - nes.ppu.flagBackgroundTable;
                let paletteOffset = 0x10;
                let address = 0x1000 * table + tileIndex * 16;
                for (let i = 0; i < 8; i++) {
                    let lowTileByte = nes.ppu.read(address + i);
                    let highTileByte = nes.ppu.read(address + i + 8);
                    for (let j = 0; j < 8; j++) {
                        buf32[i * 8 + j] = 0xFF000000 |
                            nes.ppu.palette[
                                nes.ppu.readPaletteIndex(
                                    paletteOffset + (
                                    highTwoBit & 0b1100 |
                                    (highTileByte >> 6) & 0b10 |
                                    (lowTileByte >> 7) & 1))
                                ];
                        lowTileByte <<= 1;
                        highTileByte <<= 1;
                        console.log(
                            paletteOffset + (
                            highTwoBit & 0b1100 |
                            (highTileByte >> 6) & 0b10 |
                            (lowTileByte >> 7) & 1)
                        );
                    }
                }
                console.log("attribute", attribute.toString(2));
                console.log("highTwoBit", highTwoBit.toString(2));
                console.log("highTwoBit", highTwoBit.toString(2));
                canvasImageData.data.set(buf8);
                canvasContext.putImageData(canvasImageData, x1 * 16, y1 * 16);
            }
        }
    }

    render() {
        return (
            <div className="Sprite">
                <p>sprite RAM</p>
                <canvas ref='sprite' width="256" height="64"/>
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