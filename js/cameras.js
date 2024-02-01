window.onload = async function () {
  await askForPermissions()
};

async function askForPermissions() {
  var stream;
  try {
    var constraints = { video: true, audio: false };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (e) {
    console.log(e);
  }
  closeStream(stream);
};

function closeStream(stream) {
  try {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  } catch (e) {
    alert(e.message);
  }
};

function captureCamera(video, selectedCamera) {
  var constraints = {
    audio: false,
    video: true
  }
  if (selectedCamera) {
    constraints = {
      video: { deviceId: selectedCamera },
      audio: false
    };
  }
  navigator.mediaDevices.getUserMedia(constraints).then(function (camera) {
    video.srcObject = camera;
  }).catch(function (e) {
    alert('Unable to capture your camera. Please check console logs.');
    console.error(e);
  })
};

async function projectorBuilder(camNum, camName) {
  let response = await fetch('/snippets/projector-snippet.html');
  let projectorHTML = document.createElement('div');
  projectorHTML.setAttribute('class', 'col-auto box');
  projectorHTML.innerHTML = await (response.text());
  projectorHTML.querySelector('video').setAttribute('id', camNum);
  projectorHTML.querySelector('span').textContent = camName;
  return projectorHTML
};


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

async function getCameraDevices() {
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

async function generateForm(settingsFound) {
  document.getElementById('cameras').append(await insertConfigForm());
  for (var i = 0; i < noOfCams; i++) {
    let cameraDevices = await getCameraDevices();
    var device = cameraDevices[i];
    document.getElementById('form-options').append(await buildFormItems(i, noOfCams));
    document.getElementById('cam' + i + 'Checkbox').setAttribute('value', device.deviceId);
    document.getElementById('cam' + i + 'CheckboxLabel').append(device.label);
    if (settingsFound) {
      let knownCameras = await getKnownCameras();
      let knownCameraIndex = knownCameras.findIndex(knownCameras => knownCameras.camHwId == device.deviceId);
      if (knownCameraIndex >= 0) {
        document.getElementById('cam' + i + 'Checkbox').setAttribute('checked', 'checked')
        document.getElementById('cam' + i + 'NameInput').setAttribute('value', knownCameras[knownCameraIndex].camName);
        let dropIndex = knownCameras[knownCameraIndex].camNum.substring(3);
        document.getElementById('cam' + i + 'OrderSelect').value = dropIndex
        document.getElementById('cam' + i + 'NameInput').toggleAttribute('hidden');
        document.getElementById('cam' + i + 'OrderSelect').toggleAttribute('hidden');
        document.getElementById('cam' + i + 'NameLabel').toggleAttribute('hidden');
        document.getElementById('cam' + i + 'OrderLabel').toggleAttribute('hidden');
        document.getElementById('cam' + i + 'NameBreak').toggleAttribute('hidden');
        document.getElementById('cam' + i + 'OrderBreak').toggleAttribute('hidden');
        document.getElementById('cam' + i + 'CheckboxBreak').toggleAttribute('hidden');
      } else {
        document.getElementById('cam' + i + 'NameInput').setAttribute('value', 'Camera ' + i + ' Name');
      };
    } else {
      document.getElementById('cam' + i + 'NameInput').setAttribute('value', 'Camera ' + i + ' Name');
    };
  };
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.addEventListener('click', saveSettings);
  const cancelBtn = document.getElementById('cancelBtn');
  cancelBtn.addEventListener('click', function () { location.reload(); })
  const clearBtn = document.getElementById('clearBtn');
  clearBtn.addEventListener('click', function () {
    localStorage.clear();
    location.reload();
  });
}

async function savedCamSearch(callReason) {
  let cameraDevices
  cameraDevices = (await getCameraDevices());
  noOfCams = cameraDevices.length;
  let knownCamFound = false;
  let settingsFound = false;
  if (callReason === 'startup') {
    let knownCameras = await getKnownCameras();
    if (knownCameras.length > 0) {
      knownCamFound = true;
      settingsFound = true;
    };
  } else if (callReason === 'manage') {
    settingsFound = true;
  };
  loadSettings(knownCamFound, settingsFound);
};

async function loadSettings(knownCamFound, settingsFound) {
  if (!knownCamFound) {
    await generateForm(settingsFound);
  } else {
    console.log('Stored cameras found. Opening cameras...');
    loadKnownCameras();
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
  savedCamSearch('manage');
}

async function getKnownCameras() {
  let knownCameras = [];
  for (var i = 0; i <= localStorage.length; i++) {
    lclStItem = localStorage.getItem(localStorage.key(i))
    if (localStorage.getItem(localStorage.key(i)) != null
      && localStorage.getItem(localStorage.key(i)).includes('cam')) {
      nextCam = JSON.parse(localStorage.getItem(localStorage.key(i)));
      knownCameras.push(nextCam);
    }
  };
  return knownCameras
}

async function loadKnownCameras() {
  let knownCameras = await getKnownCameras();
  let cameraDevices = await getCameraDevices();
  await askForPermissions();

  console.log(cameraDevices);

  for (let i = 1; i <= knownCameras.length; i++) {
    let knownCamerasMatchOrderId = knownCameras.findIndex(knownCameras => knownCameras.camNum === 'cam' + i);
    if (knownCamerasMatchOrderId >= 0) {
      let cameraDeviceMatchId = cameraDevices.findIndex(cameraDevices => cameraDevices.deviceId === knownCameras[knownCamerasMatchOrderId].camHwId);
      if (cameraDeviceMatchId >= 0) {
        document.getElementById('cameras').append(await projectorBuilder(
          knownCameras[knownCamerasMatchOrderId].camNum, knownCameras[knownCamerasMatchOrderId].camName
        ));
        captureCamera(document.getElementById(knownCameras[knownCamerasMatchOrderId].camNum),
          cameraDevices[cameraDeviceMatchId].deviceId);
      };
    };
  }

  let videos = document.getElementsByClassName('camera');
  videoArray = Array.from(videos)
  videoArray.forEach(video => {
    video.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      let elem = document.getElementById(video.id);
      if (!document.fullscreenElement) {
        elem.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

  });
};

savedCamSearch('startup');
