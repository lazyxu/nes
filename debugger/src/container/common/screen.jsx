import React from 'react'
import {connect} from 'react-redux'
import RingBuffer from "ringbufferjs";

import './screen.scss'

class component extends React.Component {

    constructor(props) {
        super(props);
        this.frame = -1;
    }

    componentWillReceiveProps(nextProps) {
        let nes = window.nes;
        if (nextProps.frame !== this.frame) {
            this.update();
            this.frame = nes.ppu.frame;
        }
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
        nes.ppu.writePix = (offset, color) => {
            this.buf32[offset] = color;
        };
        nes.onEndFrame = nes => {
            this.canvasImageData.data.set(this.buf8);
            this.canvasContext.putImageData(this.canvasImageData, 0, 0);
        };
        document.addEventListener('keydown', evt => {
            this.updateKey(evt.keyCode, true);
        });
        document.addEventListener('keyup', evt => {
            this.updateKey(evt.keyCode, false);
        });


        let bufferSize = 8192;
        let buffer = new RingBuffer(bufferSize);

        nes.apu.writeSample = sample => {
            buffer.enq(sample);
        };

        let audioCtx = new AudioContext();
        let scriptNode = audioCtx.createScriptProcessor(1024, 0, 1);
        let audioDelayCount = 0;
        scriptNode.onaudioprocess = e => {
            let left = e.outputBuffer.getChannelData(0);
            let size = left.length;
            try {
                var samples = buffer.deqN(size);
            } catch (e) {
                if (audioDelayCount < 3) {
                    console.log("audio delayed", i+1);
                    nes.stepFrame();
                    audioDelayCount = 0;
                }
                audioDelayCount++;
                for (let i = 0; i < size; i++) {
                    left[i] = 0;
                }
                return;
            }
            for (let i = 0; i < size; i++) {
                left[i] = samples[i];
            }
            audioDelayCount = 0;
        };
        scriptNode.connect(audioCtx.destination);
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

function mapStateToProps(state) {
    return {
        frame: state.frame,
    }
}

export default connect(mapStateToProps)(component)