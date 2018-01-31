import React from 'react'
import {connect} from 'react-redux'

import './cpu.scss'
import ToolBar from './toolBar'
import Registers from './registers'
import Interrupts from './interrupts'
import util from '../../../../src/util'

class component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className="CPU">
                <ToolBar/>
                <Interrupts/>
                <Registers/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        cpu: state.cpu,
    }
}

export default connect(mapStateToProps)(component)