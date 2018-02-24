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

    renderTile(tileIndex, highTwoBit) {
        let nes = window.nes;
        let table = nes.ppu.flagBackgroundTable;
        let address = 0x1000 * table + 16 * tileIndex;
        let tile = [];
        for (let i = 0; i < 8; i++) {
            let lowTileByte = nes.ppu.read(address + i);
            let highTileByte = nes.ppu.read(address + i + 8);
            for (let j = 0; j < 8; j++) {
                tile[i * 8 + j] = 0xFF000000 |
                    nes.ppu.palette[
                        nes.ppu.readPaletteIndex([highTwoBit | ((highTileByte >> 7) & 0b10) | ((lowTileByte >> 8) & 1)])
                        ];
                lowTileByte <<= 1;
                highTileByte <<= 1;
            }
        }
        return tile;
    }

    renderMirroring(index) {
        let nes = window.nes;
        let canvasContext = this.refs["L"].getContext('2d');
        let canvasImageData = canvasContext.getImageData(0, 0, 8, 8);
        let buf = new ArrayBuffer(canvasImageData.data.length);
        let buf8 = new Uint8ClampedArray(buf);
        let buf32 = new Uint32Array(buf);
        let nameTableAddress = 0x2000 + index * 0x400;
        let x = index % 2;
        let y = Math.floor(index / 2);
        for (let i = 0; i < 32 * 30; i++) { // 32*30 tiles
            // name table: 0x3c0
            // attribute table: 0x40
            let x1 = i % 32;
            let y1 = Math.floor(i / 32);
            let tileIndex = nes.ppu.read(nameTableAddress + i);

            let tileAddress = 0x1000 * nes.ppu.flagBackgroundTable + 16 * tileIndex;
            let highTwoBit = 0;
            for (let j = 0; j < 8; j++) {
                let lowTileByte = nes.ppu.read(tileAddress + j);
                let highTileByte = nes.ppu.read(tileAddress + j + 8);
                for (let k = 0; k < 8; k++) {
                    buf32[j * 8 + k] = 0xFF000000 |
                        nes.ppu.palette[
                            nes.ppu.readPaletteIndex([highTwoBit | ((highTileByte >> 6) & 0b10) | ((lowTileByte >> 7) & 1)])
                            ];
                    lowTileByte <<= 1;
                    highTileByte <<= 1;
                }
            }
            // console.log(x, y, (tileAddress + i).toString(16), tileIndex);
            // console.log(buf32);
            canvasImageData.data.set(buf8);
            canvasContext.putImageData(canvasImageData, x * 257 + x1 * 8, y * 241 + y1 * 8);
        }
    }

    update() {
        for (let i = 0; i < 4; i++) {
            this.renderMirroring(i);
        }
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