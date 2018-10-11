// model is trained from here: https://colab.research.google.com/drive/1aVWy5FpE1kEMfuoz2e9kWn-RKiFJRWun?authuser=1#scrollTo=6YavImFUsm1T
// based on this tutorial: https://medium.com/tensorflow/train-on-google-colab-and-run-on-the-browser-a-case-study-8a45f9b1474e
import React, { Component } from "react";
import * as tf from "@tensorflow/tfjs";
import DrawableCanvas from "../components/react-drawable-canvas";

const canvasStyle = {
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh"
  },
  selector: {
    padding: 30
  },
  drawing: {
    backgroundColor: "#F0F3F5"
  },
  width: 300,
  height: 300,

  border: "2px solid white",
  margin: 10
};

//dummy
let canvas, numChannels, mousePressed, coords;

export default class quickDrawPage extends Component {
  state = { loaded: false, clear: false };
  canvasCoords = [];
  loadModel = this.loadModel.bind(this);
  preprocessInput = this.preprocessInput.bind(this);
  getMinBox = this.getMinBox.bind(this);
  clearCanvas = this.clearCanvas.bind(this);

  async loadModel() {
    console.log("loading model async");
    try {
      // the model has to be placed in a public place
      this.model = await tf.loadModel("/tf-model/model.json");
      console.log("loaded!");
    } catch (error) {
      console.log("error: ", error);
    }
  }

  preprocessInput() {
    console.log("preprocessing data");
    const mbb = this.getMinBox();
    // calculate dpi of window (retina)
    const dpi = window.devicePixelRatio;
    // extract image data
    const minX = mbb.min.x * dpi;
    const minY = mbb.min.y * dpi;
    const maxX = (mbb.max.x - mbb.min.x) * dpi;
    const maxY = (mbb.max.y - mbb.min.y) * dpi;
    const imgData = canvas.contextContainer.getImageData(
      minX,
      minY,
      maxX,
      maxY
    );

    // this preprocess works for both canvas and img input
    // TODO write one for the
    const preprocess = imgData => {
      return tf.tidy(() => {
        // convert img to tensor
        let tensor = tf.fromPixels(imgData, (numChannels = 1));
        // resize to 28 x 28
        const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat();
        // normalize
        const offset = tf.scalar(255.0);
        // sub == subtract
        const normalized = tf.scalar(1.0).sub(resized.div(offset));
        // we add a dimension to get a batch shape (??)
        const batched = normalized.expandDims(0);
        return batched;
      });
    };

    return preprocess(imgData);
  }

  recordCoordinates(event) {
    // get current mouse coordinates
    let pointer = canvas.getPointer(event.e);
    let posX = pointer.x;
    let posY = pointer.y;

    // record the point if within canvas and mouse is pressed
    if (posX >= 0 && posY >= 0 && mousePressed) {
      this.canvasCoords.push(pointer);
    }
  }

  getMinBox() {
    let coorX = coords.map(p => p.x);
    let coorY = coords.map(p => p.y);
    // find top let corner
    var minCoords = {
      x: Math.min.apply(null, coorX),
      y: Math.min.apply(null, coorY)
    };
    // find the right bottom corner
    var maxCoords = {
      x: Math.max.apply(null, coorX),
      y: Math.max.apply(null, coorY)
    };

    return {
      min: minCoords,
      max: maxCoords
    };
  }

  clearCanvas() {
    this.setState({ clear: true });
  }

  handleMouseEvents(event) {
    // on mouseup, make prediction
  }

  componentDidMount() {
    this.loadModel();

    //window.addEventListener("mousemove", this.recordCoordinates);
  }

  render() {
    // call the below on a button press?
    // const inputData = this.preprocessInput();
    // const pred = this.model.predict(inputData).dataSync();
    // console.log(pred);
    const selectorDiv = (
      <div style={canvasStyle.selector}>
        <h4>Tool:</h4>
        <select id="tool">
          <option value="Brush">Brush</option>
          <option value="Eraser">Eraser</option>
        </select>
        {"  "}
        <button id="clearbtn" onClick={this.clearCanvas}>
          clear
        </button>
      </div>
    );

    return (
      <div style={canvasStyle.root}>
        {selectorDiv}
        <div style={canvasStyle}>
          <DrawableCanvas
            brushColor="#0B2027"
            lineWidth={4}
            canvasStyle={canvasStyle.drawing}
            clear={this.state.clear}
          />
        </div>
      </div>
    );
  }
}
