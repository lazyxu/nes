import React from 'react'
import {connect} from 'react-redux'

import './instructions.scss'
import util from '../../../../src/util'

class component extends React.PureComponent {
    constructor(props) {
        super(props);
        let nes = window.nes;
        // this.dump = nes.cpu.linearScanDisassembly([nes.cpu.read16(0XFFFA), nes.cpu.read16(0XFFFC), nes.cpu.read16(0XFFFE)]);
        this.dump = nes.cpu.linearScanDisassembly([0XC000]);
        this.lastPC = util.sprintf("%04X", nes.cpu.PC);
    }

    shouldComponentUpdate(nexProps) {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.refs.hasOwnProperty(nextProps.pc)) {
            if (this.lastPC != null && this.refs.hasOwnProperty(this.lastPC)) {
                this.refs[this.lastPC].style.backgroundColor = "";
            }
            this.refs[nextProps.pc].style.backgroundColor = "red";
            this.lastPC = nextProps.pc;
        }
    }

    render() {
        return (
            <div className="Instructions">
                <table>
                    <thead>
                    <tr>
                        <th className="Break">B</th>
                        <th className="Address">Address</th>
                        <th className="HexDump">Hex dump</th>
                        <td className="Disassembly">Disassembly</td>
                        <th className="Comment">Comment</th>
                    </tr>
                    </thead>
                    {Object.keys(this.dump).map(key =>
                        key !== this.lastPC ?
                            <tbody key={key} ref={key}>
                            <tr>
                                <td className="Break"><input type="checkbox" name="Break" value={key}/></td>
                                <td className="Address">{key}</td>
                                <td className="HexDump">{this.dump[key].hexDump}</td>
                                <td className="Disassembly">{this.dump[key].operator} {this.dump[key].opdata}</td>
                                <td className="Comment"><input type="text"/></td>
                            </tr>
                            </tbody> :
                            <tbody key={key} ref={key} style={{backgroundColor: "red"}}>
                            <tr>
                                <td className="Break"><input type="checkbox" name="Break" value={key}/></td>
                                <td className="Address">{key}</td>
                                <td className="HexDump">{this.dump[key].hexDump}</td>
                                <td className="Disassembly">{this.dump[key].operator} {this.dump[key].opdata}</td>
                                <td className="Comment"><input type="text"/></td>
                            </tr>
                            </tbody>
                    )}
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