import React from 'react'
import {connect} from 'react-redux'

import './instructions.scss'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            breaks: [],
            dump: null,
            loaded: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.iNesLoaded >= 0 && !this.state.loaded) {
            let nes = window.nes;
            this.setState({
                loaded: true,
                dump: nes.cpu.linearScanDisassembly([nes.cpu.read16(0XFFFA), nes.cpu.read16(0XFFFC), nes.cpu.read16(0XFFFE)])
            });
        }
    }

    render() {
        let list = [];
        if (this.state.dump != null) {
            for (var i = 0; i < this.state.dump.length; i++) {
                if (typeof(i) !== 'undefined' && i !== null &&
                    typeof(this.state.dump[i]) !== 'undefined' && this.state.dump[i] !== null) {
                    list.push(
                        <tbody key={i}>
                        <tr>
                            <td className="Break"><input type="checkbox" name="Break" value={i}/></td>
                            <td className="Address">{this.state.dump[i].PC}</td>
                            <td className="HexDump">{this.state.dump[i].hexDump}</td>
                            <td className="Operator">{this.state.dump[i].operator}</td>
                            <td className="Opdata">{this.state.dump[i].opdata}</td>
                            <td className="Comment"><input type="text"/></td>
                        </tr>
                        </tbody>
                    )
                }
            }
        }
        // console.log(list);
        return (
            <div className="Instructions">
                <table>
                    <thead>
                    <tr>
                        <th className="Break">B</th>
                        <th className="Address">Address</th>
                        <th className="HexDump">Hex dump</th>
                        <th className="Disassembly" colSpan="2">Disassembly</th>
                        <th className="Comment">Comment</th>
                    </tr>
                    </thead>
                    {list}
                </table>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        iNesLoaded: state.iNesLoaded,
        cpu: state.cpu,
    }
}

export default connect(mapStateToProps)(component)