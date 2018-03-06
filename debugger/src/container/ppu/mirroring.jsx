import React from 'react'
import {connect} from 'react-redux'

import './mirroring.scss'
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

    renderMirroring(index) {
        let nes = window.nes;
        let canvasContext = this.refs["L"].getContext('2d');
        let canvasImageData = canvasContext.getImageData(0, 0, 256, 240);
        let buf = new ArrayBuffer(canvasImageData.data.length);
        let buf8 = new Uint8ClampedArray(buf);
        let buf32 = new Uint32Array(buf);
        let nameTableAddress = 0x2000 + index * 0x400;
        let x = index % 2;
        let y = Math.floor(index / 2);

        // attribute table: 0x40
        let attribute = new Array(16);
        for (let i = 0; i < 16; i++) {
            attribute[i] = new Array(16);
        }
        for (let y1 = 0; y1 < 8; y1++) {
            for (let x1 = 0; x1 < 8; x1++) {
                let address = nameTableAddress + 0x3c0 + y1 * 8 + x1;
                let byte = nes.ppu.read(address);
                attribute[2 * x1][2 * y1] = (byte << 2) & 0b1100;
                attribute[2 * x1 + 1][2 * y1] = byte & 0b1100;
                attribute[2 * x1][2 * y1 + 1] = (byte >> 2) & 0b1100;
                attribute[2 * x1 + 1][2 * y1 + 1] = (byte >> 4) & 0b1100;
            }
        }

        // name table: 0x3c0
        for (let y1 = 0; y1 < 30; y1++) { // 32*30 tiles
            for (let x1 = 0; x1 < 32; x1++) {
                let base = (y1 * 8) * 256 + x1 * 8;
                let tileIndex = nes.ppu.read(nameTableAddress + y1 * 32 + x1);

                let tileAddress = 0x1000 * nes.ppu.flagBackgroundTable + 16 * tileIndex;
                let highTwoBit = attribute[Math.floor(x1 / 2)][Math.floor(y1 / 2)];
                for (let y2 = 0; y2 < 8; y2++) {
                    let lowTileByte = nes.ppu.read(tileAddress + y2);
                    let highTileByte = nes.ppu.read(tileAddress + y2 + 8);
                    for (let x2 = 0; x2 < 8; x2++) {
                        buf32[base + y2 * 256 + x2] = 0xFF000000 |
                            nes.ppu.palette[
                                nes.ppu.readPaletteIndex(
                                    highTwoBit & 0b1100 |
                                    (highTileByte >> 6) & 0b10 |
                                    (lowTileByte >> 7) & 1)
                                ];
                        lowTileByte <<= 1;
                        highTileByte <<= 1;
                        // if (nes.ppu.frame > 30 && x2 === 0 && y2 === 0) {
                        //     console.log(x1, y1,
                        //         highTwoBit & 0b1100 |
                        //         (highTileByte >> 6) & 0b10 |
                        //         (lowTileByte >> 7) & 1)
                        // }
                    }
                }
            }
        }
        canvasImageData.data.set(buf8);
        canvasContext.putImageData(canvasImageData, x * 256, y * 240);
    }

    update() {
        let ppu = window.nes.ppu;
        for (let i = 0; i < 4; i++) {
            this.renderMirroring(i);
        }
        let ctx = this.refs["L"].getContext('2d');
        let x = ppu.debuggerScrollX * 8 + (ppu.debuggerNameTable & 1) * 256 + ppu.debuggerX;
        let y = (ppu.debuggerScrollY - 29) * 8 + ((ppu.debuggerNameTable >> 1) & 1) * 240;
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 479);
        ctx.moveTo(0, y);
        ctx.lineTo(511, y);
        ctx.moveTo((x+256)%512, 0);
        ctx.lineTo((x+256)%512, 479);
        ctx.moveTo(0, (y+240)%480);
        ctx.lineTo(511, (y+240)%480);
        ctx.stroke();
        // ctx.closePath();
    }

    render() {
        return (
            <div className="Mirroring">
                <p>mirroring tables</p>
                <div className="mirroring">
                    <canvas ref='L' width="512" height="480"/>
                </div>
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