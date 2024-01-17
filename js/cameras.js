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
  projectorHTML.setAttribute('class', 'col-xl-12 col-xxl-4 box');
  projectorHTML.innerHTML = await (response.text());
  projectorHTML.querySelector('video').setAttribute('id', camNum);
  projectorHTML.querySelector('span').textContent = camName;
  return projectorHTML
};

async function getKnownCameras(file) {
  let knownCameras = [];
  let response = await fetch(file);
  let data = await (response.text());
  knownCameras = JSON.parse(data);

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

  for (let i = 0; i < knownCameras.length; i++) {
    let matchId = cameraDevices.findIndex(cameraDevices => cameraDevices.deviceId === knownCameras[i].camHwId);
    if (matchId >= 0) {
      document.getElementById('cameras').append(await projectorBuilder(knownCameras[i].camNum, knownCameras[i].camName));
      captureCamera(document.getElementById(knownCameras[i].camNum),
        cameraDevices[matchId].deviceId);
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

getKnownCameras('./knownCameras.json');
