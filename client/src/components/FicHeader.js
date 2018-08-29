import React from "react";
import { generatePDF } from "../helpers";
import ReactGA from "react-ga";

class FicHeader extends React.Component {
  state = { loading: true };

  handleDownload = () => {
    const { storyTitle, storyAuthor } = this.props;
    try {
      // default pdf download option with jsPDF
      generatePDF(storyTitle, storyAuthor);
      ReactGA.event({
        category: "downloads",
        action: "pdf",
        label: "jsPDF",
        value: this.props.storyId
      });
    } catch (error) {
      alert(
        "Please make sure your browser has no pop-up or ads blockers! Keep a lookout for the pop-up blocked icon at your address bar."
      );
      try {
        // backup pdf download option with pupeteer
        this.handleBackup();
        ReactGA.event({
          category: "downloads",
          action: "pdf",
          label: "pupeteer",
          value: this.props.storyId
        });

        // backup pdf download option with pupeteer microservice
        const pdfURL =
          "https://url-to-pdf-api.herokuapp.com/api/render?url=" +
          window.location.href +
          "&waitFor=header&emulateScreenMedia=false&pdf.margin.top=2cm&pdf.margin.right=2cm&pdf.margin.bottom=2cm&pdf.margin.left=2cm";
        window.open(pdfURL, "_blank");
      } catch (error) {
        ReactGA.event({
          category: "downloads",
          action: "pdf",
          label: "error",
          value: this.props.storyId
        });
        alert("oops, something went wrong, use Ctrl+P and save as PDF instead");
      }
    }
  };

  handleHome = () => {
    ReactGA.event({
      category: "sucess",
      action: "redirection",
      label: "return-home",
      value: this.props.storyId
    });
    this.props.history.push("/");
  };

  // create blob from pupeteer's pdf
  handleBackup = () => {
    fetch("/pdf", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ url: window.location.href }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob))
      .then(url => {
        window.open(url, "_blank");
        url.revokeObjectURL(url);
      })
      .catch(err => console.log(err));
  };

  downloadEpub = () => {
    const { storyTitle, storyAuthor } = this.props;

    const epubSummary = document.getElementById("summary-container").innerHTML;
    const epubContent = document.getElementById("story-container").innerHTML;
    const epubPage = document.getElementsByClassName("page");

    fetch("/epub", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        url: window.location.href,
        title: storyTitle,
        author: storyAuthor,
        summary: epubSummary,
        content: epubContent
      }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob))
      .then(url => {
        window.open(url, "_blank");
        url.revokeObjectURL(url);
      })
      .catch(err => console.log(err));
  };

  handleEpub = () => {
    alert(
      "Please make sure your browser has no pop-up or ads blockers! Keep a lookout for the pop-up blocked icon at your address bar."
    );

    try {
      ReactGA.event({
        category: "downloads",
        action: "epub",
        label: "epub-gen",
        value: this.props.storyId
      });
      this.downloadEpub();
    } catch (error) {
      ReactGA.event({
        category: "downloads",
        action: "epub",
        label: "error",
        value: this.props.storyId
      });
      alert("oops, something went wrong, download as PDF instead");
    }
  };

  componentDidUpdate() {
    if (this.state.loading === true)
      this.setState(prevState => ({ loading: false }));
  }

  render() {
    const {
      storyId,
      storyAuthor,
      storyTitle,
      storySummary,
      storyURL
    } = this.props;

    if (this.state.loading) return null;
    else
      return (
        <header>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <a
              className="navbar-brand navbar-baseline"
              onClick={this.handleHome}
            >
              <img
                src="/GrabWatt.png"
                width="50"
                height="50"
                className="d-inline-block align-top"
                alt="GrabWatt"
              />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNavAltMarkup"
              aria-controls="navbarNavAltMarkup"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
              <div className="navbar-nav">
                <a
                  className="nav-item nav-link active"
                  onClick={this.handleHome}
                >
                  Home <span className="sr-only">(current)</span>
                </a>
                <a
                  className="nav-item nav-link active"
                  onClick={this.handleDownload}
                >
                  Download as PDF <span className="sr-only">(current)</span>
                </a>
                <a
                  className="nav-item nav-link active"
                  onClick={this.handleEpub}
                >
                  Download as EPUB <span className="sr-only">(current)</span>
                </a>
                <a className="nav-item nav-link disabled">
                  Database reference key: {storyId}
                </a>
              </div>
            </div>
          </nav>

          <div id="summary-container" className="page print-container">
            <h5>
              {storyTitle} {storyAuthor}
            </h5>
            <p dangerouslySetInnerHTML={{ __html: storySummary }} />
            <p>
              URL:{" "}
              <a href={storyURL} target="_blank">
                {storyURL}
              </a>
            </p>
          </div>
        </header>
      );
  }
}

export default FicHeader;
