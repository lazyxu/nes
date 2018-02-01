import React from 'react'
import {connect} from 'react-redux'

import './registers.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getCpuState();
        this.cpu = -1;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.iNesLoaded >= 0||
            (this.props.iNesLoaded>=0 && nextProps.cpu!==this.cpu)) {
            this.cpu = nextProps.cpu;
            this.setState(this.getCpuState());
        }
    }

    getCpuState() {
        let nes = window.nes;
        return {
            PC: util.sprintf("%04X", nes.cpu.PC),
            A: util.sprintf("%02X", nes.cpu.A),
            X: util.sprintf("%02X", nes.cpu.X),
            Y: util.sprintf("%02X", nes.cpu.Y),
            SP: util.sprintf("%04X", nes.cpu.SP),
            P: util.sprintf("%02X", nes.cpu.flags()),
            N: nes.cpu.N,
            V: nes.cpu.V,
            U: nes.cpu.U,
            B: nes.cpu.B,
            D: nes.cpu.D,
            I: nes.cpu.I,
            Z: nes.cpu.Z,
            C: nes.cpu.C,
        };
    }

    render() {
        return (
            <table className="Registers">
                <thead>
                <tr>
                    <th colSpan="2">Registers</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>PC</td>
                    <td>{this.state.PC}</td>
                </tr>
                <tr>
                    <td>A</td>
                    <td>{this.state.A}</td>
                </tr>
                <tr>
                    <td>X</td>
                    <td>{this.state.X}</td>
                </tr>
                <tr>
                    <td>Y</td>
                    <td>{this.state.Y}</td>
                </tr>
                <tr>
                    <td>SP</td>
                    <td>{this.state.SP}</td>
                </tr>
                <tr>
                    <td>P</td>
                    <td>{this.state.P}</td>
                </tr>
                <tr>
                    <td>N</td>
                    <td>{this.state.N}</td>
                </tr>
                <tr>
                    <td>V</td>
                    <td>{this.state.V}</td>
                </tr>
                <tr>
                    <td>U</td>
                    <td>{this.state.U}</td>
                </tr>
                <tr>
                    <td>B</td>
                    <td>{this.state.B}</td>
                </tr>
                <tr>
                    <td>D</td>
                    <td>{this.state.D}</td>
                </tr>
                <tr>
                    <td>I</td>
                    <td>{this.state.I}</td>
                </tr>
                <tr>
                    <td>Z</td>
                    <td>{this.state.Z}</td>
                </tr>
                <tr>
                    <td>C</td>
                    <td>{this.state.C}</td>
                </tr>
                </tbody>
            </table>
        )
    }
}

function mapStateToProps(state) {
    return {
        cpu: state.cpu,
        iNesLoaded: state.iNesLoaded,
    }
}

export default connect(mapStateToProps)(component)