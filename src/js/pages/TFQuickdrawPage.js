// model is trained from here: https://colab.research.google.com/drive/1aVWy5FpE1kEMfuoz2e9kWn-RKiFJRWun?authuser=1#scrollTo=6YavImFUsm1T
// based on this tutorial: https://medium.com/tensorflow/train-on-google-colab-and-run-on-the-browser-a-case-study-8a45f9b1474e
import React, { Component } from "react";
import * as tf from "@tensorflow/tfjs";
import DrawableCanvas from "../components/react-drawable-canvas";
import SignatureCanvas from "react-signature-canvas";

import UnsplashPage from "./UnsplashPage";

const canvasStyle = {
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh"
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
let numChannels, coords;

export default class quickDrawPage extends Component {
  state = {
    loaded: false,
    clear: false,
    img: null,
    makePred: false,
    canvasContext: null,
    coords: [],
    mousePressed: false,
    top5: []
  };
  canvasRef = React.createRef();
  loadModel = this.loadModel.bind(this);
  submitImage = this.submitImage.bind(this);
  preprocessInput = this.preprocessInput.bind(this);
  getMinBox = this.getMinBox.bind(this);
  clearCanvas = this.clearCanvas.bind(this);
  makePrediction = this.makePrediction.bind(this);
  handleSubmitPrediction = this.handleSubmitPrediction.bind(this);

  async loadModel() {
    console.log("loading model async");
    try {
      // the model has to be placed in a public place
      this.model = await tf.loadModel("/tf-model/working/REF/model.json");
      this.classNames = await fetch("/tf-model/working/REF/class_names.txt")
        .then(r => r.text())
        .then(s => {
          const allLines = s.split(/\r\n|\n/);
          return allLines.filter(v => v.length > 1);
        });
    } catch (error) {
      console.log("error: ", error);
    }
  }

  getClassNames(indices) {
    var outp = [];
    for (var i = 0; i < indices.length; i++)
      outp[i] = this.classNames[indices[i]];
    return outp;
  }

  preprocessInput() {
    console.log("preprocessing data");
    // const mbb = this.getMinBox();
    // // calculate dpi of window (retina)
    // const dpi = window.devicePixelRatio;
    // // extract image data
    // const minX = mbb.min.x * dpi;
    // const minY = mbb.min.y * dpi;
    // const maxX = (mbb.max.x - mbb.min.x) * dpi;
    // const maxY = (mbb.max.y - mbb.min.y) * dpi;

    const imgData = this.state.canvasContext;

    // this preprocess works for both canvas and img input
    // TODO write one for the
    const preprocess = imgData => {
      return tf.tidy(() => {
        // convert img to tensor
        let tensor = tf.fromPixels(imgData, 1); // second input is optional number of channels
        // resize to 28 x 28
        const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat();
        // normalize
        const offset = tf.scalar(255.0);
        // sub == subtract
        const normalized = tf.scalar(1.0).sub(resized.div(offset));
        // we add a dimension to get a batch shape (??)
        const batched = normalized.expandDims(0);
        console.log(batched);
        return batched;
      });
    };

    return preprocess(imgData);
  }

  // doesn't work without fabricjs because getPointer
  // doesn't exist
  getMinBox() {
    let coorX = this.state.coords.map(p => p.x);
    let coorY = this.state.coords.map(p => p.y);
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

  recordCoor(e) {
    console.log(e);
    var pointer = this.canvasRef.current.getCanvas().getPointer(e);
    var posX = pointer.x;
    var posY = pointer.y;

    if (posX >= 0 && posY >= 0 && this.state.mousePressed) {
      this.setState(p => ({ coords: [...p.coords, pointer] }));
      //coords.push(pointer);
    }
  }

  clearCanvas() {
    //this.setState({ clear: true });
    const ref = this.canvasRef.current;
    ref.clear();
  }

  makePrediction() {
    this.setState({ makePred: true });
  }

  submitImage(value) {
    const imgData = value;

    const preprocess = imgData => {
      return tf.tidy(() => {
        // convert img to tensor
        let tensor = tf.fromPixels(imgData, 1); // second input is optional number of channels
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

    const pred = this.model.predict(preprocess(imgData)).dataSync();

    let predictions = Object.values(pred).map((v, i) => {
      return { index: i, value: v };
    });

    predictions = predictions.sort((x, y) =>
      x.value > y.value ? 1 : x.value === y.value ? 0 : -1
    );
    predictions = predictions.reverse();

    console.log(predictions.slice(0, 5));

    let classes = predictions.map(v => v.index);
    classes = this.getClassNames(classes);

    console.log("top 5");
    console.log(classes.slice(0, 5));
    this.setState({ top5: classes.slice(0, 5), clear: false });
  }

  handleMouseEvents(event) {
    // on mouseup, make prediction
  }

  handleSubmitPrediction(e) {
    console.log("submitting!");
    const ref = this.canvasRef.current;

    //const pointer = ref.getPointer();
    console.log(this.state.coords);

    const c = ref.getCanvas();
    this.submitImage(c);
  }

  componentDidMount() {
    this.loadModel();

    if (this.canvasRef) {
      const ref = this.canvasRef.current;
      const canvas = ref.getCanvas();
      console.log(canvas);
      canvas.addEventListener("mousedown", () =>
        this.setState({ mousePressed: true })
      );
      canvas.addEventListener("mouseup", () =>
        this.setState({ mousePressed: false })
      );
      canvas.addEventListener("mousemove", this.recordCoor);
    }

    //window.addEventListener("mousemove", this.recordCoordinates);
  }

  // componentDidUpdate(prevProps) {
  //   if (this.canvasRef) {
  //     const ref = this.canvasRef.current;
  //     ref.on("mouse:down", () => this.setState({ mousePressed: true }));
  //     ref.on("mouse:up", () => this.setState({ mousePressed: false }));
  //     ref.on("mouse:move", this.recordCoor);
  //   }
  // }

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

    console.log(this.state.top5[0]);

    return (
      <div style={canvasStyle.root}>
        {selectorDiv}
        <div style={canvasStyle}>
          <SignatureCanvas
            ref={this.canvasRef}
            brushColor="#0B2027"
            backgroundColor="red"
            canvasProps={{
              height: canvasStyle.height,
              width: canvasStyle.width
            }}
            onEnd={this.handleSubmitPrediction}
          />

          {/* <DrawableCanvas
            brushColor="#0B2027"
            lineWidth={4}
            canvasStyle={canvasStyle.drawing}
            clear={this.state.clear}
            submitBtn={this.state.makePred}
            submit={this.submitImage}
          /> */}
        </div>
        <div>
          <p>results</p>
          <ol>
            {this.state.top5.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ol>
        </div>
        <div>
          <p>image search</p>
          <UnsplashPage data={this.state.top5[0]} />
        </div>
      </div>
    );
  }
}
