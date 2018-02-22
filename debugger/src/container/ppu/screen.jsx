import React from 'react'
import { connect } from 'react-redux'

class Screen extends React.Component {

    constructor(props) {
        super(props);
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
        this.canvasImageData.data.set(this.buf8);
        this.canvasContext.putImageData(this.canvasImageData, 0, 0);
    }

    componentDidMount() {
        this.canvasContext = this.refs.screen.getContext('2d');
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
    }

    render() {
        return (
            <div>
                <canvas ref='screen' className="Screen" width="256" height="240"/>
            </div>
        )
    }
}

export default Screen;