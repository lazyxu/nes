export const CPU_RESTART = 'CPU_RESTART';
export const CPU_RUN = 'CPU_RUN';
export const CPU_STEP = 'CPU_STEP';
export const CPU_STOP = 'CPU_STOP';
export const CPU_EXIT = 'CPU_EXIT';
export const INES_LOADED = 'INES_LOADED';

export function loadiNes() {
    return {
        type: INES_LOADED
    }
}

export function cpuStep() {
    let nes = window.nes;
    if (nes.isRunning === true) {
        nes.step();
    }
    return {
        type: CPU_STEP
    }
}