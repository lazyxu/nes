import React from 'react'
import {connect} from 'react-redux'

import './stack.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     reset: 0,
        //     nmi: 0,
        //     irq: 0
        // };
    }

    componentWillReceiveProps(nextProps) {
    }

    // getCpuState() {
    //     let nes = window.nes;
    //     return {
    //         reset: util.sprintf("%04X", nes.cpu.read16(0xFFFC)),
    //         nmi: util.sprintf("%04X", nes.cpu.read16(0xFFFA)),
    //         irq: util.sprintf("%04X", nes.cpu.read16(0xFFFE)),
    //     };
    // }

    render() {
        return (
            <table className="Stack">
                <thead>
                <tr>
                    <td>Address</td>
                    <td>Value</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>FD</td>
                    <td>FFFC</td>
                </tr>
                </tbody>
            </table>
        )
    }
}

function mapStateToProps(state) {
    return {
        pc: state.pc,
    }
}

export default connect(mapStateToProps)(component)