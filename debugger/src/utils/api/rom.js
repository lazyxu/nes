import ajax from './ajax.js'

export function getRom(path) {
    return new Promise(resolve => {
        let url = '/roms/' + path;
        ajax.GetBinary(url).then(resp => {
            resolve(resp)
        }).catch(err => {
            console.error(err)
        })
    })
}