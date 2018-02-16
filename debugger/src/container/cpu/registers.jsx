import React from 'react'
import {connect} from 'react-redux'

import './registers.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.updateRegisters();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.pc !== this.PC) {
            this.updateRegisters();
        }
    }

    updateRegister(oldVal, newVal) {
        return (oldVal !== newVal && typeof oldVal !== 'undefined' && oldVal !== '') ?
            ('<span style="color: red">' + newVal + '</span> <del>' + oldVal + '</del>') :
            newVal;
    }

    updateRegisters() {
        let nes = window.nes;
        let PC = util.sprintf("%04X", nes.cpu.PC);
        let A = util.sprintf("%02X", nes.cpu.A);
        let X = util.sprintf("%02X", nes.cpu.X);
        let Y = util.sprintf("%02X", nes.cpu.Y);
        let SP = util.sprintf("%04X", nes.cpu.SP);
        let P = util.sprintf("%02X", nes.cpu.flags());
        let N = nes.cpu.N;
        let V = nes.cpu.V;
        let U = nes.cpu.U;
        let B = nes.cpu.B;
        let D = nes.cpu.D;
        let I = nes.cpu.I;
        let Z = nes.cpu.Z;
        let C = nes.cpu.C;
        this.refs.PC.innerHTML = this.updateRegister(this.PC, PC);
        this.refs.A.innerHTML = this.updateRegister(this.A, A);
        this.refs.X.innerHTML = this.updateRegister(this.X, X);
        this.refs.Y.innerHTML = this.updateRegister(this.Y, Y);
        this.refs.SP.innerHTML = this.updateRegister(this.SP, SP);
        this.refs.P.innerHTML = this.updateRegister(this.P, P);
        this.refs.N.innerHTML = this.updateRegister(this.N, N);
        this.refs.V.innerHTML = this.updateRegister(this.V, V);
        this.refs.U.innerHTML = this.updateRegister(this.U, U);
        this.refs.B.innerHTML = this.updateRegister(this.B, B);
        this.refs.D.innerHTML = this.updateRegister(this.D, D);
        this.refs.I.innerHTML = this.updateRegister(this.I, I);
        this.refs.Z.innerHTML = this.updateRegister(this.Z, Z);
        this.refs.C.innerHTML = this.updateRegister(this.C, C);
        this.PC = util.sprintf("%04X", nes.cpu.PC);
        this.A = util.sprintf("%02X", nes.cpu.A);
        this.X = util.sprintf("%02X", nes.cpu.X);
        this.Y = util.sprintf("%02X", nes.cpu.Y);
        this.SP = util.sprintf("%04X", nes.cpu.SP);
        this.P = util.sprintf("%02X", nes.cpu.flags());
        this.N = nes.cpu.N;
        this.V = nes.cpu.V;
        this.U = nes.cpu.U;
        this.B = nes.cpu.B;
        this.D = nes.cpu.D;
        this.I = nes.cpu.I;
        this.Z = nes.cpu.Z;
        this.C = nes.cpu.C;
    }

    render() {
        return (
            <div className="Registers">
                <table>
                    <thead>
                    <tr>
                        <th colSpan="2">Registers</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td width="50px">PC</td>
                        <td><span ref="PC"/></td>
                    </tr>
                    <tr>
                        <td>A</td>
                        <td><span ref="A"/></td>
                    </tr>
                    <tr>
                        <td>X</td>
                        <td><span ref="X"/></td>
                    </tr>
                    <tr>
                        <td>Y</td>
                        <td><span ref="Y"/></td>
                    </tr>
                    <tr>
                        <td>SP</td>
                        <td><span ref="SP"/></td>
                    </tr>
                    <tr>
                        <td>P</td>
                        <td><span ref="P"/></td>
                    </tr>
                    <tr>
                        <td>N</td>
                        <td><span ref="N"/></td>
                    </tr>
                    <tr>
                        <td>V</td>
                        <td><span ref="V"/></td>
                    </tr>
                    <tr>
                        <td>U</td>
                        <td><span ref="U"/></td>
                    </tr>
                    <tr>
                        <td>B</td>
                        <td><span ref="B"/></td>
                    </tr>
                    <tr>
                        <td>D</td>
                        <td><span ref="D"/></td>
                    </tr>
                    <tr>
                        <td>I</td>
                        <td><span ref="I"/></td>
                    </tr>
                    <tr>
                        <td>Z</td>
                        <td><span ref="Z"/></td>
                    </tr>
                    <tr>
                        <td>C</td>
                        <td><span ref="C"/></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        pc: state.pc
    }
}

export default connect(mapStateToProps)(component)