// Main imports
var SaveDirectory = require("../../main/SaveDirectory/SaveDirectory");

// UI imports
var FrameReel = require("../../ui/FrameReel/FrameReel");
var OnionSkin = require("../../ui/OnionSkin/OnionSkin");
var PlaybackCanvas = require("../../ui/PlaybackCanvas/PlaybackCanvas");
var StatusBar = require("../../ui/StatusBar/StatusBar");

// Common imports
var AudioManager = require("../../common/AudioManager/AudioManager");
var File = require("../../common/File/File");

/** Represents a single take (image sequence). */
class Take {
  /**
   * Constructor for a new take
   * @param {Number} takeNumber The id of the take.
   * @param {SaveDirectory} saveDirectory The project save directory for the take.
   */
  constructor(takeNumber, saveDirectory) {
    // The id of the take
    this.takeNumber = takeNumber;
    // Project save directory
    this.saveDirectory = saveDirectory;
    // Array of captured Image elements
    this.capturedFrames = [];
    // Array of the paths of the captured images
    this.exportedFramesPaths = [];
    // The frame reel for the take
    this.frameReel = new FrameReel();
    // The onion skin for the take
    this.onionSkin = new OnionSkin();
  }

  /**
   * Captures a frame from the preview feed and adds it to the take.
   */
  captureFrame() {
    // Prevent taking frames without a set output path
    if (!this.saveDirectory.saveDirLocation) {
      Notification.error("A save directory must be first set!");
      return false;
    }

    var self = this;

    // Draw the image on the canvas
    PlaybackCanvas.setDimensions(preview.videoWidth, preview.videoHeight);
    PlaybackCanvas.drawImage(preview);

    // Convert the frame to a PNG
    PlaybackCanvas.getBlob(function(blob) {
      // Play a camera sound
      AudioManager.play("audio/camera.wav");

      // Create a new image object
      var frame = new Image();
      var url = URL.createObjectURL(blob);
      frame.src = url;

      // Store the image data
      self.capturedFrames.push(frame);
      var id = self.getTotalFrames();
      console.info(`Captured frame: ${id}`);

      // Update status bar and frame reel
      StatusBar.setTotalFrames(id);
      self.frameReel.addFrame(id, self.capturedFrames[id - 1].src);
      self.frameReel.setFrameThumbnail(id, self.capturedFrames[id - 1].src);

      self._updateOnionSkin();
      self._exportFrame(id, blob);
      return true;
    });
  }

  /**
   * Deletes a frame from the take.
   * @param {Number} id The id of the frame to delete.
   */
  deleteFrame(id) {
    File.delete(this.exportedFramesPaths[id - 1], {
      success: function () {
        Notification.success("File successfully deleted.");
      }
    });
  
    // Remove the frame from the take
    this.exportedFramesPaths.splice(id - 1, 1);
    this.capturedFrames.splice(id - 1, 1);
    
    // Update status bar and frame reel
    StatusBar.setTotalFrames(this.getTotalFrames());
    this.frameReel.removeFrame(id);

    this._updateOnionSkin();

    console.info(`Total frames captured: ${this.getTotalFrames()}`);
  }
  
  /**
   * Writes a frame to the disk and stores the path.
   * @param {Integer} id The id of the frame to export
   * @param {Blob} blob The Blob object containing image data to save.
   */
  _exportFrame(id, blob) {
    var fileName = "";

    // 1K+ frames have been captured
    if (id >= 1000) {
      fileName = `frame_${id}`;
    }
  
    // 100 frames have been captured
    else if (id >= 100) {
      fileName = `frame_0${id}`;
    }
  
    // 10 frames have been captured
    else if (id >= 10) {
      fileName = `frame_00${id}`;
  
      // Less then 10 frames have been captured
    } else {
      fileName = `frame_000${id}`;
    }

    // Make the output directory if it does not exist
    // todo outputDir should eventually be ${this.saveDirectory.saveDirLocation}/${this.takeNumber}
    var outputDir = this.saveDirectory.saveDirLocation;
    if (!SaveDirectory.checkDir(outputDir)) {
      SaveDirectory.makeDir(outputDir);
    }
  
    // Create an absolute path to the destination location
    var outputPath = `${outputDir}/${fileName}.png`;
  
    // Save the frame to disk
    var reader = new FileReader()
    reader.onload = function(){
      // Convert the frame blob to buffer
      var buffer = new Buffer.from(reader.result);
      File.write(outputPath, buffer);
    }
    reader.readAsArrayBuffer(blob)
  
    // Store the location of the exported frame
    this.exportedFramesPaths.push(outputPath);
  }

  /**
   * Updates the onion skin frame to be the last frame captured.
   */
  _updateOnionSkin() {
    if (this.getTotalFrames() > 0) {
      // Update onion skin frame
      this.onionSkin.setFrame(this.capturedFrames[this.getTotalFrames() - 1].src);
    } else {
      // Clear the onion skin window
      this.onionSkin.clear();
    }
  }

  /**
   * TODO - build on code in issue-85 branch
   * Imports frames to the take from a given directory.
   * @param {String} path The folder to import frames from.
   */
  importFrames(path) {
    // todo
  }

  /**
   * Loads the take into view.
   */
  display() {
    // todo
    // Clear and reload frame reel
    // Reload statusbar
    // Reload playback
  }

  /**
   * The total number of frames in the take.
   */
  getTotalFrames() {
    return this.capturedFrames.length;
  }
}

module.exports = Take;