// Get permission to view cameras, then close any active streams
async function askForPermissions() {
  let stream;
  try {
    let constraints = { video: true, audio: false };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (e) {
    console.log(e);
  }
  closeStream(stream);
};

// Close active streams
function closeStream(stream) {
  try {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  } catch (e) {
    alert(e.message);
  }
};

// Capture the given stream and update the <video> tag
function captureStream(videoEl, streamSrc, streamType) {
  if (streamType == 'dev') {
    // For attached devices
    let constraints = {
      video: { deviceId: streamSrc },
      audio: false
    };
    navigator.mediaDevices.getUserMedia(constraints).then(function (camera) {
      videoEl.srcObject = camera;
    }).catch(function (e) {
      alert('Unable to capture your camera. Please check console logs.');
      console.error(e);
    });
  } else {
    // For URL streams
    videoEl.src = streamSrc
  }
};

// Create a "projector" element to contain the <video> tag and set BS grid columns
async function projectorBuilder(streamId, streamName) {
  let response = await fetch('/snippets/projector-snippet.html');
  let projectorHTML = document.createElement('div');
  projectorHTML.setAttribute('class', 'col-xl-4 col-lg-6');
  projectorHTML.innerHTML = await (response.text());
  projectorHTML.querySelector('video').setAttribute('id', 'stream' + streamId);
  projectorHTML.querySelector('span').textContent = streamName;
  return projectorHTML;
};

// Insert the config form skeleton for managing streams
async function insertConfigForm() { 
  let configForm = await fetch('/snippets/config-form-snippet.html');
  let formHTML = document.createElement('form');
  formHTML.setAttribute('class', 'form-check form-switch');
  formHTML.setAttribute('id', 'saveStreamsForm');
  formHTML.innerHTML = (await configForm.text());
  // Prevent submission of the form in the standard HTML way
  formHTML.addEventListener('submit', (e) => e.preventDefault());
  formHTML.addEventListener('reset', (e) => e.preventDefault());
  return formHTML;
};

// Create form items from attached devices, a blank URL stream, and saved streams
async function buildFormItems(i, noOfStreams, streamType) {
  let response = ''
  if (streamType === 'dev') {
    response = await fetch('/snippets/config-dev-item-snippet.html');
  } else {
    response = await fetch('/snippets/config-stream-item-snippet.html');
  };
  let formItemHTML = document.createElement('div');
  formItemHTML.setAttribute('id', 'div-stream' + i)
  formItemHTML.innerHTML = (await response.text());
  formItemHTML.innerHTML = formItemHTML.innerHTML.replace(/streamNum/g, 'stream' + i);
  for (let o = 1; o <= noOfStreams; o++) {
    let newOpt = document.createElement('option');
    newOpt.setAttribute('value', o);
    if (o == i + 1) {
      newOpt.toggleAttribute('selected');
    }
    newOpt.append(o);
    formItemHTML.querySelector('select').appendChild(newOpt);
  };
  return formItemHTML;
};

// Find attached devices capable of generating video streams
async function getCameraDevices() {
  let cameraDevices = [];
  let allDevices = await navigator.mediaDevices.enumerateDevices();
  for (let i = 0; i < allDevices.length; i++) {
    let device = allDevices[i];
    if (device.kind == 'videoinput') {
      cameraDevices.push(device);
    }
  }
  return cameraDevices;
};

// Generate the "Manage Streams" form
async function generateForm(settingsFound, addStreamInput = false, checkChange = null) {
  // If the user toggles a URL stream to true, add another input option to the DOM;
  // or if toggled to false, remove the additional option from the DOM
  // This is here because we don't need to rebuild the form, but this function seemed like the right place for it
  if (settingsFound && addStreamInput) {
    let i = document.getElementsByClassName('form-check-input').length
    console.log(checkChange.checked)
    if (checkChange.checked) {
      document.getElementById('form-options').append(await buildFormItems(i, i, 'stream'));
      document.getElementById('stream' + i + 'Checkbox').setAttribute('value', s.streamSrc);
      document.getElementById('stream' + i + 'CheckboxLabel').append(s.streamLabel);
      document.getElementById('stream' + i + 'NameInput').setAttribute('class', s.streamType);
      document.getElementById('stream' + i + 'NameInput').setAttribute('value', 'Device or Stream ' + (i + 1) + ' Label');
      document.getElementById('stream' + i + 'UrlInput').setAttribute('value', 'Stream ' + (i + 1) + ' URL');
    } else {
      i--
      document.getElementById('div-stream' + i).remove();
    }
    return;
  }
  
  // Hideables and streamHideables are elements that are hidden until a corresponding toggle/checkbox is true
  let hideables = [
    'NameInput',
    'OrderSelect',
    'NameLabel',
    'OrderLabel',
    'NameBreak',
    'OrderBreak',
    'CheckboxBreak'];
  let streamHideables = ['UrlInput', 'UrlLabel', 'UrlBreak'];
  let cameraDevices = await getCameraDevices();
  let knownStreams = await getData();
  // We're going to do a join of sorts of unsaved attached devices and saved attached devices
  // allStreams is our "joined" array
  let allStreams = []

  if (cameraDevices.length > 0) {
    for (let i = 0; i < cameraDevices.length; i++) {
      let device = cameraDevices[i];
      let knownStreamIndex = knownStreams.findIndex(knownStreams => knownStreams.streamSrc == device.deviceId);
      if (knownStreamIndex < 0) {
        // Here we only add unsaved devices to allStreams
        // This is our "join" operation, and ensures unsaved devices are still listed as options
        stream = { 'id': 'none', 'streamType': 'dev', 'streamLabel': device.label, 'streamName': device.label, 'streamSrc': device.deviceId };
        allStreams.push(stream)
      };
    };
  };

  // Now we push all saved streams onto the array
  for (stream of knownStreams) {
    allStreams.push(stream);
  };

  // Always add one blank stream input option
  allStreams.push({ 'id': 'none', 'streamType': 'stream', 'streamLabel': 'Add Stream', 'streamName': 'Stream Name', 'streamSrc': '' });

  // Sort the array so those with actual ids (saved streams) are listed first
  allStreams.sort(function (a, b) {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
  });

  // Insert the form skeleton
  document.getElementById('streams').append(await insertConfigForm());

  // Build all of the form options and load settings if the option is previously saved
  for (let i = 0; i < allStreams.length; i++) {
    s = allStreams[i]
    document.getElementById('form-options').append(await buildFormItems(i, allStreams.length, s.streamType));
    document.getElementById('stream' + i + 'Checkbox').setAttribute('value', s.streamSrc);
    document.getElementById('stream' + i + 'CheckboxLabel').append(s.streamLabel);
    document.getElementById('stream' + i + 'NameInput').setAttribute('class', s.streamType);
    document.getElementById('stream' + i + 'NameInput').setAttribute('value', 'Device or Stream ' + (i + 1) + ' Label');
    if (s.streamType === 'stream') {
      document.getElementById('stream' + i + 'UrlInput').setAttribute('value', 'Stream ' + (i + 1) + ' URL');
    }
    if (settingsFound && s.id != 'none') {
      document.getElementById('stream' + i + 'Checkbox').setAttribute('checked', 'checked');
      document.getElementById('stream' + i + 'NameInput').setAttribute('value', s.streamName);
      document.getElementById('stream' + i + 'OrderSelect').value = s.id;
      for (let h = 0; h < hideables.length; h++) {
        document.getElementById('stream' + i + hideables[h]).toggleAttribute('hidden');
        if (s.streamType === 'stream') {
          document.getElementById('stream' + i + 'UrlInput').setAttribute('value', s.streamSrc);
          for (let h = 0; h < streamHideables.length; h++) {
            document.getElementById('stream' + i + streamHideables[h]).toggleAttribute('hidden');
          };
        };
      };
    };
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', saveSettings);
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function () {
      location.reload();
    });
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.addEventListener('click', function () {
      localStorage.clear();
      location.reload();
    });
  };
}

// Check local storage for saved streams and set some booleans to help with decision-making
async function savedDataSearch(callReason) {
  let knownStreamFound = false;
  let settingsFound = false;
  if (callReason === 'startup') {
    let knownStreams = await getData();
    if (knownStreams.length > 0) {
      knownStreamFound = true;
      settingsFound = true;
    };
  } else if (callReason === 'manage') {
    settingsFound = true;
  };
  if (!knownStreamFound) {
    await generateForm(settingsFound);
  } else {
    console.log('Stored data found. Opening streams...');
    loadData();
  }
};

// Save any true-toggled streams to local storage as stringified JSON
async function saveSettings() {
  localStorage.clear();
  let noOfStreams = document.getElementsByClassName('dev').length +
    document.getElementsByClassName('stream').length
  for (let i = 0; i < noOfStreams; i++) {
    if (document.querySelector('#stream' + i + 'Checkbox').checked) {
      selectedstreamOrderNum = document.querySelector('#stream' + i + 'OrderSelect');
      streamOrderNum = selectedstreamOrderNum.options[selectedstreamOrderNum.selectedIndex].value;
      streamId = streamOrderNum;
      streamType = document.querySelector('#stream' + i + 'NameInput').className;
      streamLabel = document.querySelector('#stream' + i + 'CheckboxLabel').textContent;
      streamName = document.querySelector('#stream' + i + 'NameInput').value;
      if (streamType == 'dev') {
        streamSrc = document.querySelector('#stream' + i + 'Checkbox').value;
      } else {
        streamSrc = document.querySelector('#stream' + i + 'UrlInput').value;
      };
      stream = {
        'id': streamId,
        'streamType': streamType,
        'streamLabel': streamLabel,
        'streamName': streamName,
        'streamSrc': streamSrc
      };
      localStorage.setItem(streamId, JSON.stringify(stream));
    }
  }
  console.log('Saving.');
  location.reload();
}

// Close any active streams and clear the DOM to bring up the streams list and input form
async function manageStreams() {
  let streams = document.getElementsByClassName('stream');
  for (let s = 0; s < streams.length; s++) {
    let stream = streams[s].srcObject;
    closeStream(stream);
  };
  let streamsBlock = document.getElementById('streams');
  while (streamsBlock.hasChildNodes()) {
    streamsBlock.removeChild(streamsBlock.firstChild);
  }
  savedDataSearch('manage');
}

// Retrieve any saved stream data in local storage and JSONify them
async function getData() {
  let knownStreams = [];
  let lclStItem = '';
  for (let i = 0; i <= localStorage.length; i++) {
    lclStItem = localStorage.getItem(localStorage.key(i));
    if (lclStItem != null
      && lclStItem.includes('stream' || 'dev')) {
      nextStream = JSON.parse(lclStItem);
      knownStreams.push(nextStream);
    }
  };
  return knownStreams
}

// Gather saved data, build "projectors", and capture the streams
async function loadData() {
  let knownStreams = await getData();
  knownStreams.sort(function (a, b) {
    return a.id - b.id
  });
  for (let i = 0; i < knownStreams.length; i++) {
    let s = knownStreams[i]
    document.getElementById('streams').append(await projectorBuilder(s.id, s.streamName));
    let videoEl = document.getElementById('stream' + s.id);
    captureStream(videoEl, s.streamSrc, s.streamType);
  }

  let videos = document.getElementsByClassName('stream');
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

// Start the streaming party
window.onload = async function () {
  await askForPermissions();
  savedDataSearch('startup');
};
