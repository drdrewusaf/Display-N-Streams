window.onload = async function () {
  await askForPermissions()
};

async function askForPermissions() {
  var stream;
  try {
    var constraints = { video: true, audio: false };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.log(error);
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
  }).catch(function (error) {
    alert('Unable to capture your camera. Please check console logs.');
    console.error(error);
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

async function loadKnownCameras() {
  let knownCameras = [];
  for (var i = 0; i <= localStorage.length; i++){
    lclStItem = localStorage.getItem(localStorage.key(i))
    if (localStorage.getItem(localStorage.key(i)) != null 
        && localStorage.getItem(localStorage.key(i)).includes('cam')) {
      nextCam = JSON.parse(localStorage.getItem(localStorage.key(i)));
      knownCameras.push(nextCam);
    }
  };

  let cameraDevices;
  await askForPermissions();
  cameraDevices = [];
  var allDevices = await navigator.mediaDevices.enumerateDevices();

  for (var i = 0; i < allDevices.length; i++) {
    var device = allDevices[i];
    if (device.kind == 'videoinput') {
      cameraDevices.push(device);
    }
  }

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

loadKnownCameras();
