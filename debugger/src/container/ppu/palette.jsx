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
        let nes = window.nes;
        let backgroundPalette = nes.ppu.renderBackgroundPalette();
        let spritePalette = nes.ppu.renderSpritePalette();
        this.setState({
            backgroundPalette: backgroundPalette,
            spritePalette: spritePalette
        });
    }

    rgb(color) {
        return 'rgb(' + ((color >> 16) & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + (color & 0xff) + ')';
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
                <p>{this.props.frame}</p>
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