import React from 'react'
import {connect} from 'react-redux'

import './instructions.scss'
import util from '../../../../src/util'

class component extends React.PureComponent {
    constructor(props) {
        super(props);
        let nes = window.nes;
        if (typeof(window.dump)==="undefined" || window.dump===null) {
            window.dump = nes.cpu.linearScanDisassembly([nes.cpu.read16(0XFFFA), nes.cpu.read16(0XFFFC), nes.cpu.read16(0XFFFE)]);
        }
        this.lastPC = util.sprintf("%04X", nes.cpu.PC);
    }

    componentDidMount() {
        let elem = this.refs[this.lastPC];
        elem.style.backgroundColor = "red";
        if (typeof(elem.scrollIntoViewIfNeeded) !== 'undefined') {
            elem.scrollIntoViewIfNeeded();
        } else {
            elem.scrollIntoView();
        }
    }

    shouldComponentUpdate(nexProps) {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.refs.hasOwnProperty(nextProps.pc)) {
            if (this.lastPC != null && this.refs.hasOwnProperty(this.lastPC)) {
                this.refs[this.lastPC].style.backgroundColor = "";
            }
            let elem = this.refs[nextProps.pc];
            elem.style.backgroundColor = "red";
            if (typeof(elem.scrollIntoViewIfNeeded) !== 'undefined') {
                elem.scrollIntoViewIfNeeded();
            } else {
                elem.scrollIntoView();
            }
            this.lastPC = nextProps.pc;
        }
    }

    breakPoint(key, event) {
        let nes = window.nes;
        let address = parseInt(key, 16);
        if (event.target.checked) {
            nes.breakPoints.push(address);
        } else {
            let index = nes.breakPoints.indexOf(address);
            if (index >= 0) {
                nes.breakPoints.splice(index, 1);
            }
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
                    {Object.keys(window.dump).map(key =>
                        key !== this.lastPC ?
                            <tbody key={key} ref={key}>
                            <tr>
                                <td className="Break"><input type="checkbox" name="Break" value={key} onChange={this.breakPoint.bind(this, key)}/></td>
                                <td className="Address">{key}</td>
                                <td className="HexDump">{window.dump[key].hexDump}</td>
                                <td className="Disassembly">{window.dump[key].operator} {window.dump[key].opdata}</td>
                                <td className="Comment"><input type="text"/></td>
                            </tr>
                            </tbody> :
                            <tbody key={key} ref={key} style={{backgroundColor: "red"}}>
                            <tr>
                                <td className="Break"><input type="checkbox" name="Break" value={key} onChange={this.breakPoint.bind(this, key)}/></td>
                                <td className="Address">{key}</td>
                                <td className="HexDump">{window.dump[key].hexDump}</td>
                                <td className="Disassembly">{window.dump[key].operator} {window.dump[key].opdata}</td>
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