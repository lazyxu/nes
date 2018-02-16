import React from 'react'

import './interrupts.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let nes = window.nes;
        return (
            <div className="Interrupts">
            <table>
                <thead>
                <tr>
                    <th colSpan="2">Interrupts</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td width="50px">reset</td>
                    <td>FFFC => {util.sprintf("%04X", nes.cpu.read16(0xFFFC))}</td>
                </tr>
                <tr>
                    <td>nmi</td>
                    <td>FFFA => {util.sprintf("%04X", nes.cpu.read16(0xFFFA))}</td>
                </tr>
                <tr>
                    <td>irq</td>
                    <td>FFFE => {util.sprintf("%04X", nes.cpu.read16(0xFFFE))}</td>
                </tr>
                </tbody>
            </table>
            </div>
        )
    }
}

export default component