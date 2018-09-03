import React from "react";
import FeedbackForm from "./FeedbackForm";

class FeedbackMain extends React.Component {
  handleHome = () => {
    this.props.history.push("/");
  };

  render() {
    return (
      <div className="background">
        <div className="flex-fullview">
          <div className="container header">
            <h1>
              <mark>feedback? i love it!</mark>
            </h1>
          </div>
          <br />
          <FeedbackForm history={this.props.history} />
        </div>
        <div className="container flex-footer box">
          <a href="#" onClick={this.handleHome}>
            <span>return home!</span>
          </a>
        </div>
      </div>
    );
  }
}

export default FeedbackMain;
