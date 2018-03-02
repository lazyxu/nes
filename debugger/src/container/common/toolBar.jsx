import React from 'react';

import './toolBar.scss'
import {
    reset,
    updateFrame
} from "../../utils/actions";
import {connect} from "react-redux";

class component extends React.Component {
    constructor(props) {
        super(props);
    }

    run() {
        let nes = window.nes;
        nes.run(() => {
                this.props.updateFrame();
            }
        );
    }

    stop() {
        window.nes.isRunning = false;
    }

    exit() {
        window.nes.reset();
    }

    render() {
        return (
            <div className="ToolBar">
                <button title="reset(Ctrl+F2)" onClick={this.props.reset}>↻</button>
                <button title="run" onClick={this.run.bind(this)}>►</button>
                <button title="stop" onClick={this.stop.bind(this)}>||</button>
                <button title="exit" onClick={this.exit.bind(this)}>▣</button>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        pc: state.pc,
    }
}

export default connect(mapStateToProps, {reset, updateFrame})(component)