import React from 'react'
import {connect} from 'react-redux'

import './tiles.scss'
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

    renderTiles(isBackground) {
        let nes = window.nes;
        let canvasContext;
        let table;
        let paletteOffset;
        if (isBackground) {
            canvasContext = this.refs["backgroundTiles"].getContext('2d');
            table = nes.ppu.flagBackgroundTable;
            paletteOffset = 0;
        } else {
            canvasContext = this.refs["spriteTiles"].getContext('2d');
            table = 1 - nes.ppu.flagBackgroundTable;
            paletteOffset = 0x10;
        }
        let canvasImageData = canvasContext.getImageData(0, 0, 8, 8);
        let buf = new ArrayBuffer(canvasImageData.data.length);
        let buf8 = new Uint8ClampedArray(buf);
        let buf32 = new Uint32Array(buf);
        for (let address = 0x1000 * table; address < 0x1000 * table + 0x1000; address += 16) { // 256 tiles 32*8
            let tileIndex = Math.floor((address - 0x1000 * table) / 16);
            let x = tileIndex % 32;
            let y = Math.floor(tileIndex / 32);
            for (let i = 0; i < 8; i++) {
                let lowTileByte = nes.ppu.read(address + i);
                let highTileByte = nes.ppu.read(address + i + 8);
                for (let j = 0; j < 8; j++) {
                    buf32[i * 8 + j] = 0xFF000000 |
                        nes.ppu.palette[
                            nes.ppu.readPaletteIndex(
                                paletteOffset + ((highTileByte >> 6) & 0b10 | (lowTileByte >> 7) & 1))
                            ];
                    lowTileByte <<= 1;
                    highTileByte <<= 1;
                }
            }
            // console.log(buf32);
            canvasImageData.data.set(buf8);
            canvasContext.putImageData(canvasImageData, x * 8, y * 8);
        }
    }

    update() {
        this.renderTiles(true);
        this.renderTiles(false);
    }

    render() {
        return (
            <div className="Tiles">
                <p>background tiles</p>
                <canvas ref='backgroundTiles' width="256" height="64"/>
                <p>sprite tiles</p>
                <canvas ref='spriteTiles' width="256" height="64"/>
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