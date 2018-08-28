import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

import './common.scss'
import FileSelector from './fileSelector'
import INesInfo from './iNesInfo'
import ToolBar from './toolBar'
import Screen from "./screen";

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fps: 0
        };
        setInterval(()=>{
            this.setState({fps: Math.floor(nes.getFPS())});
        }, 1000)
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
                <ToolBar/>
                <Screen/>
                <div>{this.state.fps}</div>
                <FileSelector/>
            </div>
        )
    }
}

export default component;