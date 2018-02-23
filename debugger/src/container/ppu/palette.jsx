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
        this.frame = -1;
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
                <p>background palette</p>
                <div className="palette">
                    {this.state.imagePalette.map((color, index) => {
                        return (
                            <div className="palette-square" key={index}
                                 style={{backgroundColor: 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')'}}>
                            </div>
                        )
                    })}
                </div>
                <p>sprite palette</p>
                <div className="palette">
                    {this.state.spritePalette.map((color, index) => {
                        return (
                            <div className="palette-square" key={index}
                                 style={{backgroundColor: 'rgb(' + (color & 0xff) + ', ' + ((color >> 8) & 0xff) + ', ' + ((color >> 16) & 0xff) + ')'}}>
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