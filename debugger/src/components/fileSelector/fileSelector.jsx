import React from 'react';

import './main.scss';

import nesUtil from '../../utils/nes';

export default class FileSelector extends React.Component {
    constructor(props) {
        super(props);
        // this.wheelData = 0;
        this.state = {
            status: "Select an iNes File(.nes)"
        };
        // this.resizeHandler = () => {
        //     this.updateScroll();
        // }
    }

    // static get defaultProps() {
    //     return {
    //         scrollBackgroundStyle: 'defaultScrollBackground',
    //         scrollStyle: 'defaultScroll'
    //     };
    // }

    selectFile() {
        let elem = this.selector;
        if (elem.files && elem.files[0]) {
            let file = elem.files[0];
            this.setState({status: file.name});
            nesUtil.loadROM(window.nes, file);
        }
    }

    render() {
        return (
            <div className="FileSelector">
                <input type="file" ref={el => this.selector = el} className="selector"
                       onChange={this.selectFile.bind(this)}/>
                <div className="status">
                    {this.state.status}
                </div>
            </div>
        )
    }
}