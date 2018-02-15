import util from '../../../src/util'

export const CPU_RESTART = 'CPU_RESTART';
export const CPU_RUN = 'CPU_RUN';
export const newPC = 'newPC';
export const CPU_STOP = 'CPU_STOP';
export const CPU_EXIT = 'CPU_EXIT';
export const INES_LOADED = 'INES_LOADED';

export function loadiNes() {
    let nes = window.nes;
    nes.reset();
    return {
        type: newPC,
        PC: util.sprintf("%04X", nes.cpu.PC)
    }
}

export function stepIn() {
    let nes = window.nes;
    nes.step();
    return {
        type: newPC,
        PC: util.sprintf("%04X", nes.cpu.PC)
    }
}

export function showPC() {
    let nes = window.nes;
    return {
        type: newPC,
        PC: util.sprintf("%04X", nes.cpu.PC)
    }
}

export function reset() {
    let nes = window.nes;
    nes.reset();
    return {
        type: newPC,
        PC: util.sprintf("%04X", nes.cpu.PC)
    }
}