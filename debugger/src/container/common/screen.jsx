import React from 'react'
import {connect} from 'react-redux'

import './screen.scss'

class component extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        let nes = window.nes;
    }

    update() {
    }

    componentDidMount() {
        this.canvasContext = this.refs.Screen.getContext('2d');
        this.canvasImageData = this.canvasContext.getImageData(0, 0, 256, 240);
        // Get the canvas this.buffer in 8bit and 32bit
        this.buf = new ArrayBuffer(this.canvasImageData.data.length);
        this.buf8 = new Uint8ClampedArray(this.buf);
        this.buf32 = new Uint32Array(this.buf);

        // Fill the canvas with black
        this.canvasContext.fillStyle = 'black';
        // set alpha to opaque
        this.canvasContext.fillRect(0, 0, 256, 240);

        // Set alpha
        for (let i = 0; i < this.buf32.length; ++i) {
            this.buf32[i] = 0xFF000000;
        }

        let i = 0;
        let nes = window.nes;
        nes.onEndFrame = (nes) => {
            for (let y = 0; y < 240; ++y) {
                for (let x = 0; x < 256; ++x) {
                    i = y * 256 + x;
                    // Convert pixel from NES BGR to canvas ABGR
                    this.buf32[i] = 0xFF000000 | nes.ppu.buffer[x][y]; // Full alpha
                }
            }
            this.canvasImageData.data.set(this.buf8);
            this.canvasContext.putImageData(this.canvasImageData, 0, 0);
        };
        document.addEventListener('keydown', evt => {
            this.updateKey(evt.keyCode, true);
        });
        document.addEventListener('keyup', evt => {
            this.updateKey(evt.keyCode, false);
        });
    }

    updateKey(keyCode, value) {
        let nes = window.nes;
        switch (keyCode) {
            case 87:
                nes.controller[0].setUp(value);
                break;
            case 83:
                nes.controller[0].setDown(value);
                break;
            case 65:
                nes.controller[0].setLeft(value);
                break;
            case 68:
                nes.controller[0].setRight(value);
                break;
            case 86:
                nes.controller[0].setSelect(value);
                break;
            case 66:
                nes.controller[0].setStart(value);
                break;
            case 75:
                nes.controller[0].setA(value);
                break;
            case 74:
                nes.controller[0].setB(value);
                break;
        }
    }

    render() {
        return (
            <canvas ref='Screen' width="256" height="240"/>
        )
    }
}

export default component