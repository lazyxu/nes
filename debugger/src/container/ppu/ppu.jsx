import React from 'react';

import './ppu.scss'
import Palette from './palette'
import Tiles from './tiles'
import Sprite from './sprite'
import Mirroring from './mirroring'
import Screen from './screen'
import {connect} from "react-redux";

class component extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="PPU">
                <Mirroring/>
                <Palette/>
                <Tiles/>
                <Sprite/>
                {/*<Screen/>*/}
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