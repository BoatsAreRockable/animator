module.exports = {};

(function() {
  "use strict";
  let /*adapter = require("./../lib/adapter"),*/
      cameraResolutions = require("./camera-resolutions"),
      notification = require("./notification"),
      constraints = {
        "1080p": {
          video: {width: {exact: 1920}, height: {exact: 1080}}
        },
        "720p": {
          video: {width: {exact: 1280}, height: {exact: 720}}
        },
        "480p": {
          video: {width: {exact: 640}, height: {exact: 480}}
        },
        "320p": {
          video: {width: {exact: 320}, height: {exact: 240}}
        }
      };


  // Get the DOM selectors needed
  let qResoluSelect = document.querySelector("#form-resolution-select"),
      qCameraSelect = document.querySelector("#camera-select-td select"),
      videoCapture  = document.createElement("video");

    /**
     * Get the user-selected resolution.
     *
     * @return {String} The corresponding key for the equivalent constraint.
     */
    // function getSelectedResolution() {
    //     return qResoluSelect.options[qResoluSelect.options.selectedIndex].value;
    // }

    function _getSelectedCamera() {
      return qCameraSelect.options[qCameraSelect.options.selectedIndex].value;
    }

  /**
   * Play hidden video in the correct resolution.
   */
  function mediaSuccessCapture(mediaStream) {
//         console.log("capture!!!");
//         videoCapture.src = window.URL.createObjectURL(mediaStream);
//         videoCapture.play();

//         // Make the capture stream available for public access
    module.exports.videoCapture = videoCapture;
  }

    function mediaError(err) {
      notification.error("Could not find a camera to use!");
      console.error(err);
    }

    function _getMedia(constraints) {
      // Convert the standardized constraints format into the WebKit prefixed form
      // constraints.video = adapter.constraintsToChrome_(constraints.video);
      // constraints.video.deviceId.exact = id;

      // Load the stream and display it
      window.navigator.getUserMedia = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia;
      window.navigator.getUserMedia(constraints, mediaSuccessCapture, mediaError);
    }

    function getCamera() {
      console.log(_getSelectedCamera());
        // _getMedia(_getSelectedCamera(), constraints[getSelectedResolution()]);
        _getMedia(constraints["480p"]);
        return videoCapture;
    }

    function _findVideoSources(sources) {
      let i = 1;
      sources.forEach(function(source) {
        if (source.kind === "video") {
          // Get the proper camera name
          let cameraName = `Camera ${i}`;
          if (source.label) {
            cameraName = source.label.substr(0, source.label.indexOf("(") - 1);
          }

          // Create the menu selection
          var option = window.document.createElement("option");
          option.text = cameraName;
          option.value = source.id;
          qCameraSelect.appendChild(option);
          i++;
        }
      });

      // TODO FAKE CAMERA REMOVE PLEASE
      var option = window.document.createElement("option");
      option.text = "Nope";
      option.value = "Hahha";
      qCameraSelect.appendChild(option);

      // Default select the first camera
      qCameraSelect.options[0].selected = true;
    }

    // Get the available cameras
    window.MediaStreamTrack.getSources(_findVideoSources);

    var ID_FOR_TEST = "0b168b5be19ccabedf048b81f304f118947a9ab05be3f6dcaed823b3818501aa";
//     // console.log(_getSelectedCamera());
    cameraResolutions.get(ID_FOR_TEST);
//     // console.log(cameraResolutions.resolutions);


  // Public exports
  module.exports.get = getCamera;
//     // module.exports.setCameraResolution = setCameraResolution;
}());