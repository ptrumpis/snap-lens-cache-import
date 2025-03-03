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

const response = document.querySelector('#response');

const importCacheApiPath = "/vc/v1/import/cache";
const importLensApiPath = "/vc/v1/import/lens";

let cacheImportForm = new FormData();
let lensUploadForm = new FormData();

function importFiles(apiPath, formData) {
    formData.set('allow_overwrite', overwriteLenses.checked ? 'true' : 'false');

    const xhr = new XMLHttpRequest();

    xhr.open('POST', serverAddress.value + apiPath);
    xhr.responseType = 'json';
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status <= 500) {
            try {
                const data = xhr.response;
                if (data) {
                    if (data.error !== false) {
                        error(`Import Error: ${data.error}`);
                    } else if (data.import?.length || data.update?.length) {
                        success("Import Success!");
                        if (data.import?.length) {
                            success(`Imported new IDs: [ ${data.import.join(', ')} ]`);
                        }
                        if (data.update?.length) {
                            success(`Updated existing IDs: [ ${data.update.join(', ')} ]`);
                        }
                        if (data.discard?.length) {
                            info(`Discarded existing IDs: [ ${data.discard.join(', ')} ]`);
                        }
                        if (data.fail?.length) {
                            error(`Failed IDs: [ ${data.fail.join(', ')} ]`);
                        }
                    } else if (data.discard?.length) {
                        info(`No new lenses were imported because they already exist.`);
                        info(`Discarded existing IDs: [ ${data.discard.join(', ')} ]`);

                        if (data.fail?.length) {
                            error(`Failed IDs: [ ${data.fail.join(', ')} ]`);
                        }
                    } else if (data.fail?.length) {
                        error(`Importing failed without error.`);
                        error(`Failed IDs: [ ${data.fail.join(', ')} ]`);
                    } else {
                        info(`The request was executed successfully, but no changes were made.`);
                    }
                } else {
                    error(`API Error: no response`);
                }
            } catch (e) {
                console.error(e);
                error(`JS Error: ${e.message}`);
            }
        } else {
            error(`Request Error: ${xhr.status} - ${xhr.statusText || '(No status text available)'}`);
        }
    };
    xhr.onerror = function () {
        error("Network Error: Make sure your server is reachable.");
    };
    xhr.send(formData);
}

function error(message) {
    out(message, 'warning');
}

function info(message) {
    out(message, 'info');
}

function success(message) {
    out(message, 'success');
}

function out(message, type) {
    const p = document.createElement('p');
    p.classList.add(`text-${type}`);
    p.textContent = message;
    response.appendChild(p);
}

function parseLensId(path) {
    const regex = /(?:^|\/)(\d{11,16})(?:_|\.|$)/;
    const match = path.match(regex);
    if (match) {
        const numericValue = parseInt(match[1], 10);
        if (!isNaN(numericValue)) {
            return numericValue;
        }
    }
    return null;
}

function isUuid(string) {
    const uuid = string.match(/[a-f0-9]{32}/gi)
    if (uuid && uuid[0]) {
        return true;
    }
    return false;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function addNewLensUploadGroup() {
    const clone = document.importNode(lensUploadGroup.content, true);
    lensUploadGroups.appendChild(clone);

    const fileInput = lensUploadGroups.lastElementChild.querySelector('input[type=file]');
    const lensIdInput = fileInput.closest('.upload-group').querySelector('input[name="id[]"]');

    uppie(fileInput, (event, formData, files) => {
        files.forEach(path => {
            const id = parseLensId(path);
            if (!lensIdInput.value && id) {
                lensIdInput.value = id;
            }
        });
    });
}

uppie(cacheImportDropZone, (event, formData, files) => {
    files.forEach(path => {
        cacheImportFileList.innerHTML += path + '\r\n';
    });

    for (const value of formData.values()) {
        cacheImportForm.append('file[]', value, value.name);
    }
});

uploadMode.addEventListener('change', function (e) {
    e.preventDefault();

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
    e.preventDefault();

    cacheImportForm = new FormData();

    cacheImportFileList.innerHTML = "";
    response.innerHTML = "";
});

startCacheImport.addEventListener("click", function (e) {
    e.preventDefault();

    response.innerHTML = "";

    if (!cacheImportForm.has('file[]')) {
        error(`Error: There is no file to upload.`);
        return false;
    }

    importFiles(importCacheApiPath, cacheImportForm);
    return true;
});

addLensUpload.addEventListener("click", function (e) {
    e.preventDefault();

    addNewLensUploadGroup();
});

resetLensUpload.addEventListener("click", function (e) {
    e.preventDefault();

    lensUploadForm = new FormData();

    lensUploadGroups.innerHTML = "";
    response.innerHTML = "";

    addNewLensUploadGroup();
});

startLensUpload.addEventListener("click", function (e) {
    e.preventDefault();

    lensUploadForm = new FormData();

    response.innerHTML = "";
    let isErrorOccurred = false;

    const form = this.closest('form');
    if (form && !form.checkValidity()) {
        error(`Error: You must fill in the input fields correctly.`);
        form.reportValidity();
        return false;
    }

    const uploadGroups = document.querySelectorAll('.upload-group');
    uploadGroups.forEach(group => {
        const fileInput = group.querySelector('input[type="file"]');
        const idInput = group.querySelector('input[name="id[]"]');

        if (fileInput.files.length > 0) {
            lensUploadForm.append('file[]', fileInput.files[0]);
        } else {
            error(`Error: You have to select a .lns or .zip file.`);
            isErrorOccurred = true;
        }

        const inputVal = idInput.value.trim();
        const lensId = parseLensId(inputVal);
        if (lensId) {
            lensUploadForm.append('id[]', lensId);
        } else if (isValidUrl(inputVal) || isUuid(inputVal)) {
            lensUploadForm.append('id[]', inputVal);
        } else {
            error(`Error: "${inputVal}" is neither a valid Lens ID nor a share URL or UUID.`);
            isErrorOccurred = true;
        }
    });

    if (isErrorOccurred) {
        return false;
    }

    if (!lensUploadForm.has('id[]') || !lensUploadForm.has('file[]')) {
        error(`Error: There is no file to upload.`);
        return false;
    }

    importFiles(importLensApiPath, lensUploadForm);
    return true;
});

document.addEventListener("DOMContentLoaded", function () {
    addNewLensUploadGroup();
});
