import util from '../../../src/util'

export const CPU_RESTART = 'CPU_RESTART';
export const CPU_RUN = 'CPU_RUN';
export const SET_PC = 'SET_PC';
export const SET_FRAME = 'SET_FRAME';
export const CPU_STOP = 'CPU_STOP';
export const CPU_EXIT = 'CPU_EXIT';
export const INES_LOADED = 'INES_LOADED';

export function loadiNes() {
    let nes = window.nes;
    nes.reset();
    return {
        type: SET_PC,
        PC: util.sprintf("%04X", nes.cpu.PC)
    }
}

export function stepIn() {
    let nes = window.nes;
    nes.step();
    return {
        type: SET_PC,
        PC: util.sprintf("%04X", nes.cpu.PC)
    }
}

export function updatePC() {
    let nes = window.nes;
    return {
        type: SET_PC,
        PC: util.sprintf("%04X", nes.cpu.PC)
    }
}

export function reset() {
    let nes = window.nes;
    nes.reset();
    return {
        type: SET_PC,
        PC: util.sprintf("%04X", nes.cpu.PC)
    }
}

export function updateFrame() {
    let nes = window.nes;
    return {
        type: SET_FRAME,
        frame:  nes.ppu.frame
    }
}