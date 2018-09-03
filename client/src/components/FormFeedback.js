import React from "react";
import base from "../base";

class FormFeedback extends React.Component {
  state = {
    thumbs: "",
    message: "",
    up: "",
    down: "",
    email: "",
    feedbackbox: []
  };

  componentDidMount() {
    this.ref = base.syncState(`feedback/${Date.now()}`, {
      context: this,
      state: "feedbackbox"
    });
  }

  setThumbs = event => {
    const thumbs = event.target.value;
    if (thumbs !== null) {
      this.setState(prevState => ({ thumbs: thumbs }));

      // set toggle active since bootstrap data-toggle doesn't work
      if (thumbs === "true")
        this.setState(prevState => ({ up: "active", down: "" }));
      else this.setState(prevState => ({ up: "", down: "active" }));
    }
  };

  setMessage = event => {
    const message = event.target.value;
    if (message !== null) this.setState(prevState => ({ message: message }));
  };

  setEmail = event => {
    const email = event.target.value;
    if (email !== null) this.setState(prevState => ({ email: email }));
  };

  sendFeedback = event => {
    event.preventDefault();
    const { message, thumbs, email } = this.state;
    const feedbackbox = { ...this.state.feedbackbox };
    const feedback = {
      thumbs: thumbs,
      message: message,
      email: email
    };

    if (thumbs !== "" && message !== "") {
      this.setState(prevState => ({
        feedbackbox: feedback,
        message: "",
        up: "",
        down: "",
        thumbs: "",
        email: ""
      }));
      console.log("feedback sent");
    }
  };

  render() {
    return (
      <div className="box">
        <a data-toggle="modal" href="#feedbackModal">
          feedbacks or complains? shoot me a text!
        </a>

        <div
          className="modal fade"
          id="feedbackModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="feedbackModalTitle"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">
                  Help GrabWatt improve!
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <label>
                  Experience: <br />
                </label>
                <div className="btn-group btn-group-toggle">
                  <label
                    className={`btn btn-outline-secondary ${this.state.up}`}
                    onChange={event => this.setThumbs(event)}
                  >
                    <input type="radio" value={true} name="thumbs" /> &#128077;
                  </label>
                  <label
                    className={`btn btn-outline-secondary ${this.state.down}`}
                    onChange={event => this.setThumbs(event)}
                  >
                    <input type="radio" value={false} name="thumbs" /> &#128078;
                  </label>
                </div>

                <div onChange={event => this.setMessage(event)}>
                  <label>Message:</label>
                  <textarea
                    className="form-control"
                    id="message-text"
                    value={this.state.message}
                  />
                </div>
                <div onChange={event => this.setEmail(event)}>
                  <label>Email:</label>
                  <input
                    className="form-control"
                    id="email-text"
                    value={this.state.email}
                    placeholder="Optional: only if you want to chat with me privately!"
                  />
                </div>

                <div>
                  <label>
                    Ask me more at: <br />
                  </label>
                  <a href="https://youtu.be/xW4OiW7rktY">
                    https://youtu.be/xW4OiW7rktY
                  </a>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="button"
                  onClick={this.sendFeedback}
                  data-dismiss="modal"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FormFeedback;
