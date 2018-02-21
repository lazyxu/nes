import React from 'react';

import './ppu.scss'
import Palette from './palette'

export default class component extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="PPU">
                <Palette/>
            </div>
        )
    }
}