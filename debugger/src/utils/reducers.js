import {combineReducers} from 'redux'
import {
    SET_PC,
    SET_FRAME
} from './actions'

function pc(state = null, action) {
    switch (action.type) {
        case SET_PC:
            return action.PC;
        default:
            return state;
    }
}

function frame(state = 0, action) {
    switch (action.type) {
        case SET_FRAME:
            return action.frame;
        default:
            return state;
    }
}

export default combineReducers({
    pc,
    frame,
})