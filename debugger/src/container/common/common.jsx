import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

import './common.scss'
import FileSelector from './fileSelector'
import INesInfo from './iNesInfo'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="Common">
                <div className="Header">
                    <Link className="Link" to="/cpu">cpu</Link>
                    <Link className="Link" to="/ppu">ppu</Link>
                    <Link className="Link" to="/apu">apu</Link>
                    <Link className="Link" to="/mem">mem</Link>
                    <Link className="Link" to="/joystick">joystick</Link>
                </div>
                <FileSelector/>
                <INesInfo/>
            </div>
        )
    }
}

export default component