# Display N Webcams
A webpage meant to be hosted on a local server to display 1-n directly connected, JavaScript-accessible videoinput streams like webcams.  You can also tap to enlarge any stream, and tap again to shrink.

Example with 3 cameras:

![Example with 3 Cameras](https://github.com/drdrewusaf/Display-N-Webcams/blob/main/images/3-cam-example.png "Example with 3 Cameras")

## Usage
The important files are index.html, all /snippets/*, and /js/cameras.js.  All others are for styling, including bootstrap.

### Setup
1) If you want to keep the default styling using bootstrap, host the entirety of this repo in a webserver folder on the machine with video streams (webcams). Otherwise, make sure the important files listed above are hosted. 

2) With your webserver running, navigate to the index.html file.

3) You should be presented with the Manage Cameras page and a list of connected cameras.
![Example of Manage Cameras Page](https://github.com/drdrewusaf/Display-N-Webcams/blob/main/images/manage-cams.png "Example of Manage Cameras Page")

4) Using the checkboxes, select the cameras you wish to use/save.

5) When a box is checked, additional mandatory options are for camera name and order are presented.
![Example of Manage Cameras Page](https://github.com/drdrewusaf/Display-N-Webcams/blob/main/images/manage-cams-1.png "Example of Manage Cameras Page")

6) When done, click the save button.

### Maintaining
If you want to delete/add/change cameras, click the "Manage Cameras" button.  Any camera with the checkbox unchecked will be deleted if it was previously saved.
