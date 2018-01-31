import React from 'react';
import {connect} from 'react-redux'

import './fileSelector.scss';
import INesInfo from './iNesInfo';

import nesUtil from '../../utils/nes';

import {
    loadiNes
} from "../../utils/actions";

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: "Select an iNes File(.nes)"
        };
    }

    selectFile() {
        let elem = this.selector;
        if (elem.files && elem.files[0]) {
            let file = elem.files[0];
            this.setState({status: file.name});
            nesUtil.loadROM(window.nes, file, data => {
                this.props.loadiNes();
            });
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

function mapStateToProps(state) {
    return {
        cpu: state.cpu,
    }
}

export default connect(mapStateToProps, {loadiNes})(component)