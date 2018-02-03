import React from 'react'
import {connect} from 'react-redux'

import './cpu.scss'
import ToolBar from './toolBar'
import Registers from './registers'
import Interrupts from './interrupts'
import Instructions from './instructions'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="CPU">
                {this.props.pc !== null ? <ToolBar/> : <div/>}
                {this.props.pc !== null ? <Instructions/> : <div/>}
                {this.props.pc !== null ? <Interrupts/> : <div/>}
                {this.props.pc !== null ? <Registers/> : <div/>}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        pc: state.pc,
    }
}

export default connect(mapStateToProps)(component)