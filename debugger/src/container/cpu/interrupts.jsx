import React from 'react'
import {connect} from 'react-redux'

import './interrupts.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reset: 0,
            nmi: 0,
            irq: 0
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.iNesLoaded >= 0) {
            this.setState(this.getCpuState());
        }
    }

    getCpuState() {
        let nes = window.nes;
        return {
            reset: util.sprintf("%04X", nes.cpu.read16(0xFFFC)),
            nmi: util.sprintf("%04X", nes.cpu.read16(0xFFFA)),
            irq: util.sprintf("%04X", nes.cpu.read16(0xFFFE)),
        };
    }

    render() {
        return (
            <table className="Interrupts">
                <thead>
                <tr>
                    <th colSpan="2">Interrupts</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>reset</td>
                    <td>FFFC => {this.state.reset}</td>
                </tr>
                <tr>
                    <td>nmi</td>
                    <td>FFFA => {this.state.nmi}</td>
                </tr>
                <tr>
                    <td>irq</td>
                    <td>FFFE => {this.state.irq}</td>
                </tr>
                </tbody>
            </table>
        )
    }
}

function mapStateToProps(state) {
    return {
        iNesLoaded: state.iNesLoaded,
    }
}

export default connect(mapStateToProps)(component)