# Display N Streams
Inspired by Chrysler Pacifica FamCam, I wanted to make a DIY backseat camera solution for monitoring my kiddos. However Display N Streams is not limited to just directly connected video devices, you can also access URL video streams (like web-enabled cameras, or live streams).

Display N Streams is a webpage for displaying 1-n directly connected, JavaScript-accessible videoinput streams like webcams and URL streams supported by your browser.  You can also tap to enlarge any stream, and tap again to shrink.

Example with 3 streams:

![Example with 3 Streams](https://github.com/drdrewusaf/Display-N-Webcams/blob/main/images/3-stream-example.png "Example with 3 Streams")

## Usage
Host this repo on a webserver and select, name, and order the streams you wish to monitor.

### Setup
1) Host the entirety of this repo in a webserver folder. 

2) With your webserver running, navigate to the index.html file.

3) You should be presented with the Manage Streams page and a list of connected video devices and a stream url input.
![Example of Manage Streams Page](https://github.com/drdrewusaf/Display-N-Webcams/blob/main/images/manage-streams-0.png "Example of Manage Streams Page")

4) Using the checkboxes, select the streams you wish to use/save.

5) When a box is checked, additional mandatory options are presented.
![Example of Manage Streams Page](https://github.com/drdrewusaf/Display-N-Webcams/blob/main/images/manage-streams-1.png "Example of Manage Streams Page")

6) When done, click the save button.

### Maintaining
If you want to delete/add/change cameras, click the "Manage Streams" button.  Any stream with the checkbox unchecked will be deleted if it was previously saved.
