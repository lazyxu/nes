exports.GetBinary = (url) => {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send(null);
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.addEventListener('readystatechange', function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    resolve(xhr.responseText);
                } catch (e) {
                    reject(e);
                }
            }
        });
        xhr.addEventListener('error', function(error) {
            reject(error);
        });
    });
};