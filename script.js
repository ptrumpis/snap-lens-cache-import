import uppie from "https://cdn.skypack.dev/uppie@3.0.3";

const serverAddress = document.querySelector('#serverAddress');
const dropZone = document.querySelector('#dropDiv');
const fileList = document.querySelector('#fileList');
const reset = document.querySelector('#reset');
const upload = document.querySelector('#upload');

const formData = new FormData();

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
});

upload.addEventListener("click", function (e) {
    const apiPath = "/vc/v1/import/cache";
    const xhr = new XMLHttpRequest();
    xhr.open('POST', serverAddress.value + apiPath);
    xhr.send(formData);
});