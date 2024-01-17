function openCam(){
    let all_cams = navigator.mediaDevices
    if (!all_cams || !all_cams.getUserMedia) {
        console.log("getUserMedia not supported.");
        return;
    }
    all_cams.getUserMedia({
        audio: false,
        video: true
    })
    .then(function(vidStream){
        const video = document.getElementById('vidBlock');
        if ("srcObject" in video) {
            video.srcObject = vidStream;
        } else {
            video.src = window.URL.createObjectURL(vidStream);
        }
        video.onloadedmetadata = function(e) {
            video.play();
        };
    })
    .catch(function(e) {
        console.log(e.name + ": " + e.message);
    });
}