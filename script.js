import uppie from "https://cdn.skypack.dev/uppie@3.0.3";

const serverAddress = document.querySelector('#serverAddress');
const overwriteLenses = document.querySelector('#overwriteLenses');
const dropZone = document.querySelector('#dropDiv');
const fileList = document.querySelector('#fileList');
const reset = document.querySelector('#reset');
const upload = document.querySelector('#upload');
const responseSuccess = document.querySelector('#responseSuccess');
const responseError = document.querySelector('#responseError');

let formData = new FormData();

uppie(dropZone, (event, fd, files) => {
    files.forEach(path => {
        fileList.innerHTML += path + '\r\n';
    });

    for (const value of fd.values()) {
        formData.append('file[]', value, value.name);
    }
});

reset.addEventListener("click", function (e) {
    formData = new FormData();

    fileList.innerHTML = "";
    responseSuccess.innerHTML = "";
    responseError.innerHTML = "";
});

upload.addEventListener("click", function (e) {
    formData.append('allow_overwrite', overwriteLenses.checked ? 'true' : 'false');

    const apiPath = "/vc/v1/import/cache";
    const xhr = new XMLHttpRequest();

    xhr.open('POST', serverAddress.value + apiPath);

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.error) {
                    responseError.innerHTML = `Import Error: ${data.error}`;
                } else {
                    responseSuccess.innerHTML = "Success!";
                    if (data.import && data.import.length) {
                        responseSuccess.innerHTML += `<br/>Imported IDs: ${data.import.join(', ')}`;
                    }
                    if (data.update && data.update.length) {
                        responseSuccess.innerHTML += `<br/>Updated IDs: ${data.update.join(', ')}`;
                    }
                }
            } catch(e) {
                console.error(e);
                responseError.innerHTML = `JS Error: ${e.message}`;
            }
        } else {
            responseError.innerHTML = `Request Error: ${xhr.statusText}`;
        }
    };

    xhr.onerror = function () {
        responseError.innerHTML = "Network Error";
    };

    xhr.send(formData);
});