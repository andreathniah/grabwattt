import React from "react";
import ReactGA from "react-ga";

class FeedbackForm extends React.Component {
  state = { up: "", down: "", thumbs: "", message: "", email: "", status: "" };

  handleSpreadsheet = event => {
    this.setState(prevState => ({ status: "disabled" }));

    const { message, thumbs } = this.state;
    const scriptURL = process.env.REACT_APP_SPREADSHEET_URL;
    const method = "POST";

    if (thumbs !== "" && message !== "") {
      const body = new FormData(this.form);
      event.preventDefault(); // this position to for required validation
      fetch(scriptURL, { method, body })
        .then(res => {
          ReactGA.event({
            category: "flag",
            action: "feedback",
            label: "feedback-spreadsheet"
          });

          this.setState(
            prevState => ({ up: "", down: "" }),
            () => {
              alert("Thank you for leaving us with a feedback!");
              this.props.history.push("/");
            }
          );
        })
        .catch(error => console.error("error", error.message));
    }
  };

  setThumbs = event => {
    const thumbs = event.target.value;
    this.setState(prevState => ({ thumbs: thumbs }));

    if (thumbs === "true")
      this.setState(prevState => ({ up: "active", down: "" }));
    else this.setState(prevState => ({ up: "", down: "active" }));
  };

  setMessage = event => {
    const message = event.target.value;
    if (message !== null) this.setState(prevState => ({ message: message }));
  };

  setEmail = event => {
    const email = event.target.value;
    if (email !== null) this.setState(prevState => ({ email: email }));
  };

  render() {
    const { status } = this.state;
    const disabledStatus =
      status === "disabled" ? (
        <button
          className="button float-md-right"
          onClick={this.handleSpreadsheet}
          disabled
        >
          Send
        </button>
      ) : (
        <button
          className="button float-md-right"
          onClick={this.handleSpreadsheet}
        >
          Send
        </button>
      );

    return (
      <div className="container">
        <form ref={el => (this.form = el)}>
          <div className="form-group">
            <label>
              Experience: <br />
            </label>
            <div className="btn-group btn-group-toggle">
              <label
                className={`btn btn-outline-secondary ${this.state.up}`}
                onChange={event => this.setThumbs(event)}
              >
                <input type="radio" value="true" name="thumbs" /> &#128077;
              </label>
              <label
                className={`btn btn-outline-secondary ${this.state.down}`}
                onChange={event => this.setThumbs(event)}
              >
                <input type="radio" value="false" name="thumbs" /> &#128078;
              </label>
            </div>
          </div>
          <div
            className="form-group"
            onChange={event => this.setMessage(event)}
          >
            <label>Message: </label>
            <br />
            <textarea
              className="form-control"
              type="text"
              name="message"
              placeholder="Remember to add the story URL link if you need me to debug something!"
              required
            />
          </div>
          <div className="form-group" onChange={event => this.setEmail(event)}>
            <label>Email: </label>
            <br />
            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="Optional but encouraged - especially if you want me to reply you via email!"
            />
          </div>
          <div>
            <br />
            <span>{disabledStatus}</span>
          </div>
        </form>
      </div>
    );
  }
}

export default FeedbackForm;
