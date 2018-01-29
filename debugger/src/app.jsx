import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import {HashRouter, Link, Route} from 'react-router-dom'

import Index from './container/index'
import cpu from './container/cpu'
import ppu from './container/ppu'
import apu from './container/apu'
import mem from './container/mem'
import joystick from './container/joystick'
import store from './utils/store.js'
import nesEmulator from '../../src/index'

import FileSelector from './components/fileSelector/fileSelector';

window.nes = new nesEmulator.NES();

let App = document.createElement('div');
document.body.appendChild(App);

ReactDOM.render(
    <div>
        <Provider store={store}>
            <HashRouter>
                <div>
                    <Link to="/">index</Link> |
                    <Link to="/cpu">cpu</Link> |
                    <Link to="/ppu">ppu</Link> |
                    <Link to="/apu">apu</Link> |
                    <Link to="/mem">mem</Link> |
                    <Link to="/joystick">joystick</Link>
                    <FileSelector/>
                    <Route exact path="/" component={Index}/>
                    <Route path="/cpu" component={cpu}/>
                    <Route path="/ppu" component={ppu}/>
                    <Route path="/apu" component={apu}/>
                    <Route path="/mem" component={mem}/>
                    <Route path="/joystick" component={joystick}/>
                </div>
            </HashRouter>
        </Provider>
    </div>,
    App
);

// react-router
// http://gitbook.cn/books/595e1822fd12e512c486802d/index.html