import {combineReducers} from 'redux'
import {
    CPU_STEP,
    CPU_EXIT,
    CPU_RESTART,
    CPU_RUN,
    CPU_STOP,
    INES_LOADED
} from './actions'

function cpu(state = -1, action) {
    switch (action.type) {
        case CPU_STEP:
            return state + 1;
        default:
            return state;
    }
}

function iNesLoaded(state = -1, action) {
    switch (action.type) {
        case INES_LOADED:
            return state + 1;
        default:
            return state;
    }
}

export default combineReducers({
    cpu,
    iNesLoaded
})