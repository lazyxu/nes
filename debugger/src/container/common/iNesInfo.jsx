import React from 'react';

import './iNesInfo.scss';

class component extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let nes = window.nes;
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
                    <td>{nes.ines.mapperType}</td>
                </tr>
                <tr>
                    <td>mirroring</td>
                    <td>{nes.ines.mirroring}</td>
                </tr>
                <tr>
                    <td>numChrRom</td>
                    <td>{nes.ines.chrRom.length}</td>
                </tr>
                <tr>
                    <td>numPrgRom</td>
                    <td>{nes.ines.prgRom.length}</td>
                </tr>
                </tbody>
            </table>
        )
    }
}

export default component