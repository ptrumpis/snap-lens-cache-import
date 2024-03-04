import uppie from "https://cdn.skypack.dev/uppie@3.0.3";

const serverAddress = document.querySelector('#serverAddress');
const overwriteLenses = document.querySelector('#overwriteLenses');
const uploadMode = document.querySelector('#uploadMode');
const cacheImport = document.querySelector('#cacheImport');
const lensUpload = document.querySelector('#lensUpload');

const cacheImportDropZone = document.querySelector('#cacheImportDropZone');
const cacheImportFileList = document.querySelector('#cacheImportFileList');
const resetCacheImport = document.querySelector('#resetCacheImport');
const startCacheImport = document.querySelector('#startCacheImport');

const lensUploadGroup = document.querySelector('#lensUploadGroup');
const lensUploadGroups = document.querySelector('#lensUploadGroups');
const addLensUpload = document.querySelector('#addLensUpload');
const resetLensUpload = document.querySelector('#resetLensUpload');
const startLensUpload = document.querySelector('#startLensUpload');

const responseSuccess = document.querySelector('#responseSuccess');
const responseError = document.querySelector('#responseError');

const importCacheApiPath = "/vc/v1/import/cache";
const importLensApiPath = "/vc/v1/import/lens";

let cacheImportForm = new FormData();
let lensUploadForm = new FormData();

function importFiles(apiPath, formData) {
    formData.append('allow_overwrite', overwriteLenses.checked ? 'true' : 'false');

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
            } catch (e) {
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
}

function addNewLensUploadGroup() {
    const clone = document.importNode(lensUploadGroup.content, true);
    lensUploadGroups.appendChild(clone);
}

uppie(cacheImportDropZone, (event, fd, files) => {
    files.forEach(path => {
        cacheImportFileList.innerHTML += path + '\r\n';
    });

    for (const value of fd.values()) {
        cacheImportForm.append('file[]', value, value.name);
    }
});

uploadMode.addEventListener('change', function () {
    var selectedOption = this.value;

    if (selectedOption === 'cacheImport') {
        cacheImport.classList.add('show');
        cacheImport.classList.remove('hide');
        lensUpload.classList.remove('show');
        lensUpload.classList.add('hide');
    } else if (selectedOption === 'lensUpload') {
        cacheImport.classList.remove('show');
        cacheImport.classList.add('hide');
        lensUpload.classList.add('show');
        lensUpload.classList.remove('hide');
    }
});

resetCacheImport.addEventListener("click", function (e) {
    cacheImportForm = new FormData();

    cacheImportFileList.innerHTML = "";
    responseSuccess.innerHTML = "";
    responseError.innerHTML = "";
});

startCacheImport.addEventListener("click", function (e) {
    importFiles(importCacheApiPath, cacheImportForm);
});

addLensUpload.addEventListener("click", function (e) {
    addNewLensUploadGroup();
});

resetLensUpload.addEventListener("click", function (e) {
    lensUploadForm = new FormData();

    lensUploadGroups.innerHTML = "";
    responseSuccess.innerHTML = "";
    responseError.innerHTML = "";

    addNewLensUploadGroup();
});

startLensUpload.addEventListener("click", function (e) {
    const uploadGroups = document.querySelectorAll('.upload-group');
    uploadGroups.forEach(group => {
        const fileInput = group.querySelector('input[type="file"]');
        const idInput = group.querySelector('input[name="id[]"]');

        if (fileInput.files.length > 0) {
            lensUploadForm.append('file[]', fileInput.files[0]);
        }

        if (idInput.value.trim() !== "") {
            lensUploadForm.append('id[]', idInput.value.trim());
        }
    });

    importFiles(importLensApiPath, lensUploadForm);
});

document.addEventListener("DOMContentLoaded", function () {
    addNewLensUploadGroup();
});