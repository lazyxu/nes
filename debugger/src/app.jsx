import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter, Route, Routes } from 'react-router-dom'

import './app.scss'
import Cpu from './container/cpu/cpu'
import Ppu from './container/ppu/ppu'
import Apu from './container/apu'
import Mem from './container/mem'
import Joystick from './container/joystick'
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
                    <div className="Page">
                        <Routes>
                            <Route path="/cpu" element={<Cpu />} />
                            <Route path="/ppu" element={<Ppu />} />
                            <Route path="/apu" element={<Apu />} />
                            <Route path="/mem" element={<Mem />} />
                            <Route path="/joystick" element={<Joystick />} />
                        </Routes>
                    </div>
                </div>
            </HashRouter>
        </Provider>
    </div>,
    App
);

// react-router
// http://gitbook.cn/books/595e1822fd12e512c486802d/index.html