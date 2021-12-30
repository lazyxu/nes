import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter, Route, Routes } from 'react-router-dom'

import './app.scss'
import cpu from './container/cpu/cpu'
import ppu from './container/ppu/ppu'
import apu from './container/apu'
import mem from './container/mem'
import joystick from './container/joystick'
import store from './utils/store.js'
import nesEmulator from '../../src/index'

import Common from './container/common/common';

window.nes = new nesEmulator.NES();

let App = document.createElement('div');
document.body.appendChild(App);

ReactDOM.render(
    <div>
        <Provider store={store}>
            <HashRouter>
                <div className="App">
                    <Common />
                    <Routes className="Page">
                        <Route exact path="/" component={cpu} />
                        <Route path="/cpu" component={cpu} />
                        <Route path="/ppu" component={ppu} />
                        <Route path="/apu" component={apu} />
                        <Route path="/mem" component={mem} />
                        <Route path="/joystick" component={joystick} />
                    </Routes>
                </div>
            </HashRouter>
        </Provider>
    </div>,
    App
);

// react-router
// http://gitbook.cn/books/595e1822fd12e512c486802d/index.html