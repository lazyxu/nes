import React from 'react'
import { connect } from 'react-redux'

import './screen.scss'
class component extends React.Component {

    constructor(props) {
        super(props);
        this.frame = 0;
    }

    componentWillReceiveProps(nextProps) {
        let nes = window.nes;
        if (nextProps.frame !== this.frame) {
            this.update();
            this.frame = nes.ppu.frame;
        }
    }

    update() {
        let i = 0;
        let nes = window.nes;
        for (let y = 0; y < 240; ++y) {
            for (let x = 0; x < 256; ++x) {
                i = y * 256 + x;
                // Convert pixel from NES BGR to canvas ABGR
                this.buf32[i] = 0xFF000000 | nes.ppu.back[x][y]; // Full alpha
            }
        }
        console.log(this)
        console.log(this.buf32)
        this.canvasImageData.data.set(this.buf8);
        this.canvasContext.putImageData(this.canvasImageData, 0, 0);
    }

    componentDidMount() {
        this.canvasContext = this.refs.Screen.getContext('2d');
        this.canvasImageData = this.canvasContext.getImageData(0, 0, 256, 240);
        // Get the canvas this.buffer in 8bit and 32bit
        this.buf = new ArrayBuffer(this.canvasImageData.data.length);
        this.buf8 = new Uint8ClampedArray(this.buf);
        this.buf32 = new Uint32Array(this.buf);

        // // Fill the canvas with black
        // this.canvasContext.fillStyle = 'black';
        // // set alpha to opaque
        // this.canvasContext.fillRect(0, 0, 256, 240);
        //
        // // Set alpha
        // for (let i = 0; i < this.buf32.length; ++i) {
        //     this.buf32[i] = 0xFF000000;
        // }
    }

    render() {
        return (
                <canvas ref='Screen' width="256" height="240"/>
        )
    }
}

function mapStateToProps(state) {
    return {
        frame: state.frame,
    }
}

export default connect(mapStateToProps)(component)