# Display N Webcams
A webpage meant to be hosted on a local server to display 1-n directly connected, JavaScript-accessible videoinput streams like webcams.  You can also tap to enlarge any stream, and tap again to shrink.

Example with 3 cameras:
![Example with 3 Cameras](https://github.com/drdrewusaf/Display-N-Webcams/blob/main/images/3-cam-example.png "Example with 3 Cameras")

## Usage
The important files are index.html, knownCameras.json, /snippets/projector-snippet.html, and /js/cameras.js.  All others are for styling, including bootstrap.

1) If you want to keep the default styling using bootstrap, host the entirety of this repo in a webserver folder on the machine with video streams (webcams). Otherwise, make sure the important files listed above are hosted. 

2) With your webserver running, navigate to the index.html file and open the console.
* By default cameras.js logs all connected "videoinput" devices to the console.

3) Expand the console message to find the desired device ID(s).

4) Open knownCameras.json
- Add your device ID(s) to the "camHwId" value(s)
- Add your desired display name(s) to the "camName" value(s)
- You can add 1-n cameras (although styling and computer performance may not be ideal ith many cameras)
```json
[{"camNum": "cam1", "camName":"Living Room", "camHwId":"abcd1234"},
{"camNum": "cam2", "camName":"Front Door", "camHwId":"1234abcd"},
{"camNum": "cam3", "camName":"Back Door", "camHwId":"ab1234cd"}]
```

5) Save the knownCameras.json, refresh index.html, and enjoy your video streams.



