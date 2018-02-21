import React from 'react'
import {connect} from 'react-redux'

import './palette.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imagePalette: [],
            spritePalette: []
        };
        this.PC = "0000";
    }

    componentDidMount() {
        this.update();
    }

    componentWillReceiveProps(nextProps) {
        let nes = window.nes;
        if (nextProps.pc !== this.PC) {
            this.update();
            this.PC = util.sprintf("%04X", nes.cpu.PC);
        }
        // if (nextProps.frame !== this.frame) {
        //     this.update();
        //     this.frame = nes.ppu.frame;
        // }
    }

    update() {
        let nes = window.nes;
        let imagePalette = nes.ppu.readImagePalette();
        let spritePalette = nes.ppu.readSpritePalette();
        this.setState({
            imagePalette: imagePalette,
            spritePalette: spritePalette
        });
    }

    render() {
        return (
            <div className="Palette">
                {this.state.imagePalette.map((color, index) => {
                    return (
                        <div className="palette" key={index}
                             style={{backgroundColor: 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')'}}>
                        </div>
                    )
                })}
                {this.state.spritePalette.map((color, index) => {
                    return (
                        <div className="palette" key={index}
                             style={{backgroundColor: 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')'}}>
                        </div>
                    )
                })}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        pc: state.pc,
    }
}

export default connect(mapStateToProps)(component)