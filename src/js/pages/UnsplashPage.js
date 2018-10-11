// scatter plot of word vectors for each and every word (excl stopwords in the review)
// label has a list of top 10 similar words

// bonus: showing that the stuff we talk about can generally be grouped into n-clusters
import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

import cred from "../../hidden/hidden.json";

export default class CoverPage extends Component {
  constructor() {
    super();
    this.state = {
      imgs: ""
    };
    this._isMounted = false;
  }
  // get a random nice image from unsplash
  fetchPhotos(random = true, query = null) {
    // if random == true, only get one
    // if random == false, get first one

    // APP_ID == access key. O_O dunno why
    const random_or_not = random ? "random" : "";
    const query_or_not = query ? "&query=" + query : "";
    const url =
      "https://api.unsplash.com/photos/" +
      random_or_not +
      "?client_id=" +
      cred.unsplash.access_key +
      query_or_not;

    console.log("fetching: ", url);
    fetch(url)
      .then(result => result.json())
      .then(data => {
        console.log("fetched image from unsplash!");
        if (this._isMounted) {
          // i dunno man!!!!! only call when componentDidMount is fired.
          // so need to check if the component is mounted to avoid
          // calling setstate on unmounted component
          this.setState({
            imgs: random ? data : data[parseInt(Math.random() * 10, 10)]
          });
        }
      })
      .catch(error => {
        console.log("error while calling", error);
      });
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchPhotos(false, "globe");
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { data } = this.props;
    const image = this.state.imgs;
    const todo =
      "todo: when image is loaded, test the area for darkness with tfjs and predict text color";

    console.log("at charts page");
    console.log("image from unsplash: ", image);
    console.log(this.state.imgs);

    if (this.state.imgs) {
      console.log(todo);
      alert(todo);
    }

    let bg_image = image ? image.urls.full : null;

    const bgStyle = {
      position: "fixed",
      zIndex: -10,
      top: -40,
      backgroundImage: `url(${bg_image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: window.innerHeight,
      width: "100%",
      margin: 0
    };

    const txtStyle = {
      position: "fixed",
      width: "75%",
      left: "50%",
      bottom: "9%",
      marginLeft: "-37.5%"
    };

    if (!data || data.length === 0 || !this._isMounted) {
      console.log("mounted?", this._isMounted);
      console.log(data ? data.length : "no data");
      return (
        <div>
          <p>not mounted</p>
        </div>
      );
    } else {
      return (
        <div style={bgStyle}>
          <Typography style={txtStyle} color="textSecondary">
            <span style={{ fontSize: 15, lineHeight: 1.3 }}>
              this is a playground for all <br />
              react-related experiments. <br />
            </span>
            <br />I would write some instructions here, but then <br />
            there are no instructions for having fun. <br />
            so look around and have some fun! <br />
          </Typography>
        </div>
      );
    }
  }
}
