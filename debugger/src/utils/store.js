import { createStore } from 'redux'

import reducers from './reducers/index'

const initialState = window.__INITIAL_STATE__;
window.store = createStore(reducers, initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
export default store