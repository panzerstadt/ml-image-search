import React, { Component } from "react";

import CanvasDraw from "../components/react-drawable-canvas";
import classNames from "./canvas.css";

export default class Demo extends Component {
  state = {
    color: "#ffc600",
    width: 400,
    height: 400
  };
  componentDidMount() {
    // let's change the color randomly every 2 seconds. fun!
    window.setInterval(() => {
      this.setState({
        color: "#" + Math.floor(Math.random() * 16777215).toString(16)
      });
    }, 2000);
  }
  render() {
    return (
      <div>
        <h1>React Canvas Draw</h1>
        <h2>default</h2>
        <p>
          This is a simple <span>{`<CanvasDraw />`}</span> component with
          default values.
        </p>
        <p>Try it out! Draw on this white canvas:</p>
        <CanvasDraw />
        <h2>Custom Brush-Color</h2>
        <p>
          Let's spice things up by using custom brush colors{" "}
          <span>{`<CanvasDraw brushColor={this.state.color} />`}</span>. We
          randomly change them every 2 seconds. But you could easily use a
          color-picker!
        </p>
        <div>
          Current color:{" "}
          <div
            style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              backgroundColor: this.state.color,
              border: "1px solid #272727"
            }}
          />
        </div>
        <CanvasDraw brushColor={this.state.color} />
        <h2>Background Image</h2>
        <p>You can also set the `imgSrc` prop to draw on a background-image.</p>
        <p>
          It will automatically resize to fit the canvas and centered vertically
          & horizontally.
        </p>
        <CanvasDraw
          brushColor="rgba(155,12,60,0.3)"
          imgSrc="https://upload.wikimedia.org/wikipedia/commons/a/a1/Nepalese_Mhapuja_Mandala.jpg"
        />
        <h2>Save & Load</h2>
        <p>
          This part got me most excited. Very easy to use saving and loading of
          drawings. It even comes with a customizable loading speed to control
          whether your drawing should load instantly (loadTimeOffset = 0) or
          appear after some time (loadTimeOffset > 0){" "}
          <span>{`<CanvasDraw loadTimeOffset={10} />`}</span>
        </p>
        <p>Try it out! Draw something, hit "Save" and then "Load".</p>
        <div className={classNames.tools}>
          <button
            onClick={() => {
              localStorage.setItem(
                "savedDrawing",
                this.saveableCanvas.getSaveData()
              );
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              this.saveableCanvas.clear();
            }}
          >
            Clear
          </button>
          <button
            onClick={() => {
              this.saveableCanvas.undo();
            }}
          >
            Undo
          </button>
          <div>
            <label>Width:</label>
            <input
              type="number"
              value={this.state.width}
              onChange={e => this.setState({ width: e.target.value })}
            />
          </div>
          <div>
            <label>Height:</label>
            <input
              type="number"
              value={this.state.height}
              onChange={e => this.setState({ height: e.target.value })}
            />
          </div>
        </div>
        <CanvasDraw
          ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
          brushColor={this.state.color}
          canvasWidth={this.state.width}
          canvasHeight={this.state.height}
        />
        <p>
          The following is a disabled canvas that we use to load & show your
          saved drawing.
        </p>
        <button
          onClick={() => {
            this.loadableCanvas.loadSaveData(
              localStorage.getItem("savedDrawing")
            );
          }}
        >
          Load what you saved previously into the following canvas:
        </button>
        <CanvasDraw
          disabled
          ref={canvasDraw => (this.loadableCanvas = canvasDraw)}
        />
        <p>
          The saving & loading also takes different dimensions into account.
          Change the width & height, draw something and save it and then load it
          into the disabled canvas. It will load your previously saved
          masterpiece scaled to the current canvas dimensions.
        </p>
        <p>
          That's it for now! Take a look at the{" "}
          <a href="https://github.com/mBeierl/react-canvas-draw/tree/master/demo/src">
            source code of these examples
          </a>
          .
        </p>
      </div>
    );
  }
}
