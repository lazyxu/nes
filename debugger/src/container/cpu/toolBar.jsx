import React from 'react';

import './toolBar.scss'
import {
    stepIn,
    reset,
    showPC
} from "../../utils/actions";
import {connect} from "react-redux";

class component extends React.Component {
    constructor(props) {
        super(props);
        this.autoStepInterval = null;
        document.onkeydown = event => {
            let e = event || window.event || arguments.callee.caller.arguments[0];
            if (e) {
                let ctrlKey = e.ctrlKey || e.metaKey;
                switch (e.keyCode) {
                    case 118: // F7
                        if (!ctrlKey) { // F7
                            this.props.stepIn();
                        } else { // Ctrl+F7
                            this.autoStep();
                        }
                        break;
                    case 120: // F9
                        this.run();
                        break;
                    case 27: // ESC
                        this.exitAutoStep();
                        break;
                    case 113: // F2
                        if (ctrlKey) { // Ctrl+F2
                            this.props.reset();
                        }
                        break;
                }
                console.log(e);
            }
            // TODO:
            // F8 - step over
            // Ctrl+F9 - run till return
            // break
        };
    }

    autoStep() {
        if (this.autoStepInterval != null) {
            clearInterval(this.autoStepInterval);
        }
        this.autoStepInterval = setInterval(() => {
            this.props.stepIn();
        }, 1000);
    }

    exitAutoStep() {
        if (this.autoStepInterval != null) {
            clearInterval(this.autoStepInterval);
        }
    }

    run() {
        let nes = window.nes;
        nes.runWithBreakPoints();
        this.props.showPC();
    }

    render() {
        return (
            <div className="ToolBar">
                <button title="reset(Ctrl+F2)" onClick={this.props.reset}>↻</button>
                <button title="run(F9)" onClick={this.run.bind(this)}>▶</button>
                <button title="autoStep(Ctrl+F7)" onClick={this.autoStep.bind(this)}>⇊</button>
                <button title="exitAutoStep(ESC)" onClick={this.exitAutoStep.bind(this)}>||</button>
                <button title="stepIn(F7)" onClick={this.props.stepIn}>↓</button>
                <input type="text"/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        pc: state.pc,
    }
}

export default connect(mapStateToProps, {stepIn, reset, showPC})(component)