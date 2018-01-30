import {combineReducers} from 'redux'
import {
    CPU_STEP,
    CPU_EXIT,
    CPU_RESTART,
    CPU_RUN,
    CPU_STOP
} from './actions'

function cpu(state = 0, action) {
    switch (action.type) {
        case CPU_STEP:
            return state + 1;
        default:
            return state;
    }
}

export default combineReducers({
    cpu
})