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
    }

    selectFile() {
        let elem = this.selector;
        if (elem.files && elem.files[0]) {
            let file = elem.files[0];
            nesUtil.loadROM(window.nes, file, data => {
                this.props.loadiNes();
            });
        }
    }

    render() {
        return (
            <input type="file" ref={el => this.selector = el} className="FileSelector"
                   onChange={this.selectFile.bind(this)}/>
        )
    }
}

function mapStateToProps(state) {
    return {
        cpu: state.cpu,
    }
}

export default connect(mapStateToProps, {loadiNes})(component)