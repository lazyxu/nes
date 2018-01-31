import React from 'react';
import {connect} from 'react-redux'

import './iNesInfo.scss';

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mapperType: 0,
            mirroring: 0,
            numChrRom: 0,
            numRpgRom: 0,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.iNesLoaded >= 0) {
            this.setState(this.getINesState());
        }
    }

    getINesState() {
        let nes = window.nes;
        return {
            mapperType: nes.ines.mapperType,
            mirroring: nes.ines.mirroring,
            numChrRom: nes.ines.chrRom.length,
            numRpgRom: nes.ines.rpgRom.length,
        }
    }

    render() {
        return (
            <table className="INesInfo">
                <thead>
                <tr>
                    <th colSpan="2">iNes File Information</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>mapperType</td>
                    <td>{this.state.mapperType}</td>
                </tr>
                <tr>
                    <td>mirroring</td>
                    <td>{this.state.mirroring}</td>
                </tr>
                <tr>
                    <td>numChrRom</td>
                    <td>{this.state.numChrRom}</td>
                </tr>
                <tr>
                    <td>numRpgRom</td>
                    <td>{this.state.numRpgRom}</td>
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