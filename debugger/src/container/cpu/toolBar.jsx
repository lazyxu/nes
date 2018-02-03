import React from 'react';

import './toolBar.scss'
import {
    step
} from "../../utils/actions";
import {connect} from "react-redux";

class component extends React.Component {
    constructor(props) {
        super(props);
    }

    step() {
    }

    render() {
        return (
            <div className="ToolBar">
                <button onClick={this.step}>↻</button>
                <button onClick={step}>▶</button>
                <button onClick={this.props.cpuStep}>⇩</button>
                <button onClick={this.step}>||</button>
                <button onClick={this.step}>▇</button>
                <input type="text"/><button>goto</button>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        cpu: state.cpu,
    }
}

export default connect(mapStateToProps, {cpuStep: step})(component)