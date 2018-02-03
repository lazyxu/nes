import {combineReducers} from 'redux'
import {
    newPC,
    CPU_EXIT,
    CPU_RESTART,
    CPU_RUN,
    CPU_STOP,
    INES_LOADED
} from './actions'

function pc(state = null, action) {
    switch (action.type) {
        case newPC:
            return action.PC;
        default:
            return state;
    }
}

export default combineReducers({
    pc,
})