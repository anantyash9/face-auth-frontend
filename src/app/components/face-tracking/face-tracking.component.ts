import { AfterViewInit, Component, OnInit } from '@angular/core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import {TRIANGULATION} from './triangulation';
import {LEFT,RIGHT,UP,DOWN,CENTER} from './pose-coordinates';


@Component({
  selector: 'app-face-tracking',
  templateUrl: './face-tracking.component.html',
  styleUrls: ['./face-tracking.component.css']
})
export class FaceTrackingComponent implements OnInit ,AfterViewInit {
NUM_KEYPOINTS = 468;
NUM_IRIS_KEYPOINTS = 5;
GREEN = '#00e33d';
RED = '#FF2C35';
BLUE = '#157AB3';
removespinner:Boolean=false;
stopRendering:any = false;
public state = {
  backend: 'webgl',
  maxFaces: 1,
  triangulateMesh: true,
  predictIrises: true,
  renderPointcloud: false
};
model: any=undefined;
  ctx: any
videoWidth: any
videoHeight: any
video: any
  canvas: any
  insCanvas: any
rafID:any
  showbutton: Boolean = false;
  pose: any;
  faceCheckPassed: Boolean = false;
  pose_array = [LEFT, RIGHT, UP, DOWN, CENTER];
  pose_names = ["LEFT", "RIGHT", "UP", "DOWN", "CENTER"];
  selectedpose_indexes: any = [];
  current_index = 0;
  face_pose: any = undefined;
  error_message: any = '';
async setupCamera() {
  this.video = document.getElementById('video');
  const canvasContainer:any = document.querySelector('.canvas-wrapper');
  var info = canvasContainer.getBoundingClientRect();
  var pose: any;

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      // Only setting the video to a specified size in order to accommodate a
      // point cloud, so on mobile devices accept the default size.

      width: info.width,
      height:info.height,
    },
  });
  this.video.srcObject = stream;

  return new Promise((resolve) => {
    this.video.onloadedmetadata = () => {
      resolve(this.video);
    };
  });
}
async renderPrediction(self:any) {
  if (self.stopRendering) {
    return;
  }

  const predictions = await self.model.estimateFaces({
    input: self.video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: self.state.predictIrises
  });
  // self.ctx.drawImage(
  //     self.video, 0, 0, self.videoWidth, self.videoHeight, 0, 0, self.videoWidth, self.videoHeight);
  //wipe the canvas
  self.ctx.clearRect(0, 0, self.videoWidth, self.videoHeight);
  if (predictions.length > 0) {
    predictions.forEach((prediction: { scaledMesh: any; mesh:any }) => {
      const keypoints = prediction.scaledMesh;
      this.pose=prediction.mesh;
      this.showInstructions(self)
      this.stateUpdateCheck(prediction)

      if (self.state.triangulateMesh) {
        self.ctx.strokeStyle = self.GREEN;
        self.ctx.lineWidth = 0.6;

        for (let i = 0; i < TRIANGULATION.length / 3; i++) {
          const points = [
            TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
            TRIANGULATION[i * 3 + 2]
          ].map(index => keypoints[index]);

          self.drawPath(self.ctx, points, true);
        }
      } else {
        self.ctx.fillStyle = self.BLUE;

        for (let i = 0; i < self.NUM_KEYPOINTS; i++) {
          const x = keypoints[i][0];
          const y = keypoints[i][1];

          self.ctx.beginPath();
          self.ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
          self.ctx.fill();
        }
      }

      if (keypoints.length > self.NUM_KEYPOINTS) {
        self.ctx.strokeStyle = self.RED;
        self.ctx.lineWidth = 2;

        const leftCenter = keypoints[self.NUM_KEYPOINTS];
        const leftDiameterY = self.distance(
            keypoints[self.NUM_KEYPOINTS + 4], keypoints[self.NUM_KEYPOINTS + 2]);
        const leftDiameterX = self.distance(
            keypoints[self.NUM_KEYPOINTS + 3], keypoints[self.NUM_KEYPOINTS + 1]);

            self.ctx.beginPath();
            self.ctx.ellipse(
            leftCenter[0], leftCenter[1], leftDiameterX / 2, leftDiameterY / 2,
            0, 0, 2 * Math.PI);
            self.ctx.stroke();

        if (keypoints.length > self.NUM_KEYPOINTS + self.NUM_IRIS_KEYPOINTS) {
          const rightCenter = keypoints[self.NUM_KEYPOINTS + self.NUM_IRIS_KEYPOINTS];
          const rightDiameterY = self.distance(
              keypoints[self.NUM_KEYPOINTS + self.NUM_IRIS_KEYPOINTS + 2],
              keypoints[self.NUM_KEYPOINTS + self.NUM_IRIS_KEYPOINTS + 4]);
          const rightDiameterX = self.distance(
              keypoints[self.NUM_KEYPOINTS + self.NUM_IRIS_KEYPOINTS + 3],
              keypoints[self.NUM_KEYPOINTS + self.NUM_IRIS_KEYPOINTS + 1]);

              self.ctx.beginPath();
              self.ctx.ellipse(
              rightCenter[0], rightCenter[1], rightDiameterX / 2,
              rightDiameterY / 2, 0, 0, 2 * Math.PI);
              self.ctx.stroke();
        }
      }
    });


  }
  self.removespinner=true;
  self.rafID = requestAnimationFrame(self.renderPrediction.bind(self,self));
  }
  showInstructions(self: any) {
          //loop over all points in the mesh

      // flip the canvas
      self.ctx.translate(self.videoWidth, 0);
      self.ctx.scale(-1, 1);

      //display the pose name at bottom center
      self.ctx.font = "30px Arial";
      self.ctx.fillStyle = "red";
      self.ctx.fillText("LOOK " + this.pose_names[this.selectedpose_indexes[this.current_index]], self.videoWidth / 2, self.videoHeight - 20);
      
      //flip it back
      self.ctx.translate(self.videoWidth, 0);
      self.ctx.scale(-1, 1);
  }
;
distance(a:any, b:any) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}
distance3d(a:any, b:any) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)+ Math.pow(a[2] - b[2], 2));
}
drawPath(ctx:any, points:any, closePath:any) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}


  constructor() {
    
  }
  ngAfterViewInit() {
    this.main()
    this.setTestState();

    
  }
  setTestState() {
    //randomly select two distinct index between 0 and 3
    let index1 = Math.floor(Math.random() * 4);
    let index2 = Math.floor(Math.random() * 4);
    while (index1 == index2) {
      index2 = Math.floor(Math.random() * 4);
    }
    //set the pose array to the randomly selected poses
    this.selectedpose_indexes = [index1, index2];
    this.current_index=0
    
  }
  stateUpdateCheck(prediction: { mesh: string | any[]; }) {
    let sum = [0, 0, 0, 0, 0];
    for (let i = 0; i < prediction.mesh.length; i++) {
      sum[0] += this.distance3d(prediction.mesh[i], this.pose_array[0][i]);
      sum[1] += this.distance3d(prediction.mesh[i], this.pose_array[1][i]);
      sum[2] += this.distance3d(prediction.mesh[i], this.pose_array[2][i]);
      sum[3] += this.distance3d(prediction.mesh[i], this.pose_array[3][i]);
      sum[4] += this.distance3d(prediction.mesh[i], this.pose_array[4][i]);
    }
    //calculate the minimum sum and the index of the minimum sum
    let min = sum[0];
    let min_index = 0;
    for (let i = 1; i < sum.length; i++) {
      if (sum[i] < min) {
        min = sum[i];
        min_index = i;
      }
    }
    var tempState = this.pose_names[min_index];
    if (this.face_pose === undefined)
    {
      this.face_pose = tempState;
    }
    else if (this.face_pose != tempState && tempState != "CENTER")
    {
      console.log("face pose changed");
      console.log(this.face_pose, tempState);
      this.face_pose = tempState;
      if (this.pose_names[this.selectedpose_indexes[this.current_index]] != this.face_pose) {
        //show error message and reset the test
        this.error_message = "Incorrect Pose";
        console.log("poes expected",this.pose_names[this.selectedpose_indexes[this.current_index]],"pose detected",this.face_pose);
      }
      else {
        //update the current index
        this.current_index++;
        if (this.current_index == 2) {
          //show success message and proceed to biomechanics capture
          this.error_message = "Success";
          console.log("success");
        }
      }
      
    }
  }
  ngOnInit(): void {   
  }
    async main() {
      await tf.setBackend(this.state.backend); 
      await this.setupCamera();
      this.video.play();
      this.videoWidth = this.video.videoWidth;
      this.videoHeight = this.video.videoHeight;
      this.video.width = this.videoWidth;
      this.video.height = this.videoHeight;
    
      this.canvas = document.getElementById('output');

      const canvasContainer:any = document.querySelector('.canvas-wrapper');

      var info=canvasContainer.getBoundingClientRect();
      var norm=this.videoHeight/this.videoWidth;
      var height=norm*info.width;
      if (height>info.height)
      {
      this.canvas.width = info.height/norm;
      this.canvas.height = info.height;
      }
      else{this.canvas.width = info.width;
        this.canvas.height = height;}

      // canvasContainer.style = `width: ${this.videoWidth}px; height: ${this.videoHeight}px`;
    
      this.ctx = this.canvas.getContext('2d');
      this.ctx.translate(this.canvas.width, 0);
      this.ctx.scale(-1, 1);
      this.ctx.fillStyle = this.BLUE;
      this.ctx.strokeStyle = this.GREEN;
      this.ctx.lineWidth = 10;
    
      this.model = await faceLandmarksDetection.load(
          faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
          {maxFaces: this.state.maxFaces});
          this.renderPrediction(this);
    
    };
    
    poseCapture() {
      //log pose
      console.log(this.pose);
  }
}
