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
                    <td>mapper</td>
                    <td>{nes.ines.mapperType}</td>
                </tr>
                <tr>
                    <td>mirroring</td>
                    <td>{nes.ines.mirroring}</td>
                </tr>
                <tr>
                    <td>CHR ROM</td>
                    <td>{nes.ines.chrRom === null ? 0 : nes.ines.chrRom.length} * 8K</td>
                </tr>
                <tr>
                    <td>CHR RAM</td>
                    <td>{nes.ines.chrRam === null ? 0 : (nes.ines.chrRam.length / 1024)} K</td>
                </tr>
                <tr>
                    <td>PRG ROM</td>
                    <td>{nes.ines.prgRom.length}</td>
                </tr>
                </tbody>
            </table>
        )
    }
}

export default component