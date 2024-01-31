async function insertConfigForm() {
    let response = await fetch('/snippets/config-form-snippet.html');
    let formHTML = document.createElement('form');
    formHTML.setAttribute('class', 'form-check');
    formHTML.setAttribute('id', 'saveCamerasForm');
    formHTML.innerHTML = (await response.text());
    formHTML.addEventListener('submit', (e) => e.preventDefault());
    formHTML.addEventListener('reset', (e) => e.preventDefault());
    return formHTML;
};

async function buildFormItems(i, noOfCams) {
    let response = await fetch('/snippets/config-item-snippet.html');
    let formItemHTML = document.createElement('div');
    formItemHTML.innerHTML = (await response.text());
    formItemHTML.innerHTML = formItemHTML.innerHTML.replace(/camNum/g, 'cam' + i);
    for (o = 1; o <= noOfCams; o++) {
        let newOpt = document.createElement('option');
        newOpt.setAttribute('value', o);
        if (o == i + 1) {
            newOpt.toggleAttribute('selected');
        }
        newOpt.append(o);
        formItemHTML.querySelector('select').appendChild(newOpt);
    };
    return formItemHTML
};

async function getCameras() {
    let cameraDevices = [];
    var allDevices = await navigator.mediaDevices.enumerateDevices();

    for (var i = 0; i < allDevices.length; i++) {
        var device = allDevices[i];
        if (device.kind == 'videoinput') {
            cameraDevices.push(device);
        }
    }
    return cameraDevices
};

async function generateForm() {
    document.getElementById('cameras').append(await insertConfigForm());
    for (var i = 0; i < noOfCams; i++) {
        var device = cameraDevices[i];
        document.getElementById('form-options').append(await buildFormItems(i, noOfCams));
        document.getElementById('cam' + i + 'Checkbox').setAttribute('value', device.deviceId);
        document.getElementById('cam' + i + 'CheckboxLabel').append(device.label);
        document.getElementById('cam' + i + 'NameInput').setAttribute('value', 'Camera ' + i + ' Name');
    }
}

async function savedCamSearch() {
    cameraDevices = (await getCameras());
    noOfCams = cameraDevices.length;
    let knownCamFound = false;
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.getItem(localStorage.key(i)) != null &&
            localStorage.getItem(localStorage.key(i)).includes('cam')) {
            knownCamFound = true;
        };
    }
    loadSettings(knownCamFound);
};

async function loadSettings(knownCamFound) {
    if (!knownCamFound) {
        await generateForm();
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.addEventListener('click', saveSettings);
        const cancelBtn = document.getElementById('cancelBtn');
        cancelBtn.addEventListener('click', function (){ location.reload(); });
    } else {
        console.log('Stored cameras found. Opening cameras...');
        // Dont forget to remove this.
        // localStorage.clear()
    }
};

async function saveSettings() {
    for (var i = 0; i < noOfCams; i++) {
        if (document.querySelector('#cam' + i + 'Checkbox').checked) {
            selectedCamOrderNum = document.querySelector('#cam' + i + 'OrderSelect');
            camOrderNum = selectedCamOrderNum.options[selectedCamOrderNum.selectedIndex].value;
            camNum = 'cam' + camOrderNum;
            camName = document.querySelector('#cam' + i + 'NameInput').value;
            camHwId = document.querySelector('#cam' + i + 'Checkbox').value;
            camera = { 'camNum': camNum, 'camName': camName, 'camHwId': camHwId };
            localStorage.setItem('cam' + camOrderNum, JSON.stringify(camera));
        } else {
            selectedCamOrderNum = document.querySelector('#cam' + i + 'OrderSelect');
            if (selectedCamOrderNum.length > 0) {
                camOrderNum = selectedCamOrderNum.options[selectedCamOrderNum.selectedIndex].value;
                localStorage.removeItem('cam' + camOrderNum);
            }
        }
    }
    console.log('Saving.');
    location.reload();
}

async function manageCameras() {
    cameras = document.getElementById('cameras');
    while (cameras.hasChildNodes()) {
        cameras.removeChild(cameras.firstChild);
    }
    loadSettings(false);
}

savedCamSearch();
