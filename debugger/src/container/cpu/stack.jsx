import React from 'react'
import {connect} from 'react-redux'

import './stack.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stack: [],
        };
        this.PC = "0000";
    }

    componentDidMount() {
        this.update();
    }

    componentWillReceiveProps(nextProps) {
        let nes = window.nes;
        if (nextProps.pc !== this.PC) {
            this.update();
            this.PC = util.sprintf("%04X", nes.cpu.PC);
        }
    }

    update() {
        let nes = window.nes;
        let stack = [];
        for (let i = nes.cpu.SP; i < 0x100; i++) {
            stack.unshift(
                {
                    address: util.sprintf("%02X", i),
                    value: util.sprintf("%02X", nes.cpu.read(0x100 | i))
                }
            );
        }
        this.setState({stack: stack});
    }

    render() {
        return (
            <div className="Stack">
                <table>
                    <thead>
                    <tr>
                        <th colSpan="2">Stack</th>
                    </tr>
                    </thead>
                    {this.state.stack.map(item => {
                        return (
                            <tbody key={item.address}>
                            <tr>
                                <td width="50px">{item.address}</td>
                                <td>{item.value}</td>
                            </tr>
                            </tbody>
                        )
                    })}
                </table>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        pc: state.pc,
    }
}

export default connect(mapStateToProps)(component)