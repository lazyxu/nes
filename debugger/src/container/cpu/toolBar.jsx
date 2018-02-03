import React from 'react';

import './toolBar.scss'
import {
    stepIn,
    reset
} from "../../utils/actions";
import {connect} from "react-redux";

class component extends React.Component {
    constructor(props) {
        super(props);
        let autoStep = null;
        document.onkeydown = event => {
            let e = event || window.event || arguments.callee.caller.arguments[0];
            if (e) {
                let ctrlKey = e.ctrlKey || e.metaKey;
                switch (e.keyCode) {
                    case 118: // F7
                        if (!ctrlKey) { // F7
                            this.props.stepIn();
                        } else { // Ctrl+F7
                            if (autoStep != null) {
                                clearInterval(autoStep);
                            }
                            autoStep = setInterval(() => {
                                this.props.stepIn();
                            }, 1000);
                        }
                        break;
                    case 113: // F2
                        if (ctrlKey) { // Ctrl+F2
                            this.props.reset();
                        }
                        break;
                    case 27: // ESC
                        if (autoStep != null) {
                            clearInterval(autoStep);
                        }
                        break;
                }
                console.log(e);
            }
            // TODO:
            // F8 - step over
            // F9 - run
            // Ctrl+F9 - run till return
            // F12 - stop
        };
    }

    render() {
        return (
            <div className="ToolBar">
                <button onClick={this.props.reset}>↻</button>
                <button onClick={this.props.stepIn}>▶</button>
                <button onClick={this.props.stepIn}>⇩</button>
                <button onClick={this.props.stepIn}>||</button>
                <button onClick={this.props.stepIn}>▇</button>
                <input type="text"/>
                <button>goto</button>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        cpu: state.cpu,
    }
}

export default connect(mapStateToProps, {stepIn, reset})(component)