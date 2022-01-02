import React from 'react'
import { connect } from 'react-redux'

import './data.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            xScroll: 0,
            yScroll: 0,
            debuggerScrollX: 0,
            debuggerScrollY: 0,
            debuggerNameTable: 0,
            debuggerX: 0,
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
            xScroll: nes.ppu.xScroll,
            yScroll: nes.ppu.yScroll,
            debuggerScrollX: nes.ppu.debuggerScrollX,
            debuggerScrollY: nes.ppu.debuggerScrollY,
            debuggerNameTable: nes.ppu.debuggerNameTable,
            debuggerX: nes.ppu.debuggerX,
        });
    }

    render() {
        return (
            <div className="Data">
                <p>frame: {this.props.frame}</p>
                <p>xScroll: {util.sprintf("%d", this.state.xScroll)}</p>
                <p>yScroll: {util.sprintf("%d", this.state.yScroll)}</p>
                <p>debuggerScrollX: {util.sprintf("%d", this.state.debuggerScrollX)}</p>
                <p>debuggerScrollY: {util.sprintf("%d", this.state.debuggerScrollY)}</p>
                <p>debuggerNameTable: {util.sprintf("%d", this.state.debuggerNameTable)}</p>
                <p>debuggerX: {util.sprintf("%d", this.state.debuggerX)}</p>
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