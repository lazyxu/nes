import React from 'react'
import {connect} from 'react-redux'

import './data.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vramAddress:0,
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
        this.setState({
            vramAddress: nes.ppu.vramAddress,
        });
    }

    render() {
        return (
            <div className="Data">
                <p>frame: {this.props.frame}</p>
                <p>vram address: {util.sprintf("%016b", this.state.vramAddress)}</p>
                <p>y-offset: {util.sprintf("%d", (this.state.vramAddress >> 12) & 0b111)}</p>
                <p>x-scroll: {util.sprintf("%d", this.state.vramAddress & 0b11111)}</p>
                <p>y-scroll: {util.sprintf("%d", (this.state.vramAddress >> 5) & 0b11111)}</p>
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