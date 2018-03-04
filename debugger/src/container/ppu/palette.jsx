import React from 'react'
import {connect} from 'react-redux'

import './palette.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            backgroundPalette: [],
            spritePalette: []
        };
        this.frame = 0;
    }

    componentDidMount() {
        this.update();
    }

    componentWillReceiveProps(nextProps) {
        let nes = window.nes;
        if (nextProps.frame !== this.frame) {
            this.update();
            this.frame = nes.ppu.frame;
        }
    }

    update() {
        let i;
        let ppu = window.nes.ppu;
        // $3F00-$3F0F: image palette
        let backgroundPalette = [];
        for (i = 0; i < 0x10; i++) {
            backgroundPalette[i] = ppu.palette[ppu.readPaletteIndex(i)];
        }

        // $3F10-$3F1F: sprite palette
        let spritePalette = [];
        for (i = 0; i < 0x10; i++) {
            spritePalette[i] = ppu.palette[ppu.readPaletteIndex(i + 0x10)];
        }

        this.setState({
            backgroundPalette: backgroundPalette,
            spritePalette: spritePalette
        });
    }

    rgb(color) {
        return 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')';
    }

    render() {
        return (
            <div className="Palette">
                <p>background palette</p>
                <div className="palette">
                    {this.state.backgroundPalette.map((color, index) => {
                        return (
                            <div className="palette-square" key={index}
                                 style={{backgroundColor: this.rgb(color)}}>
                            </div>
                        )
                    })}
                </div>
                <p>sprite palette</p>
                <div className="palette">
                    {this.state.spritePalette.map((color, index) => {
                        return (
                            <div className="palette-square" key={index}
                                 style={{backgroundColor: this.rgb(color)}}>
                            </div>
                        )
                    })}
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