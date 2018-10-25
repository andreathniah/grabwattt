import React from "react";
import FormHeader from "./FormHeader";
import FormFeedback from "./FormFeedback";
import DetectAdBlock from "./DetectAdBlock";
import base from "../base";
import { firebaseApp } from "../base";
import ReactGA from "react-ga";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class FormMain extends React.Component {
  state = { storyId: "", status: "", queuebox: [], errorbox: [] };

  componentDidMount() {
    const alertMsg =
      "Please note that this service will drop characters that are not of ASCII (alphabets) characters. A patch is on the works with regards to this.";
    toast(alertMsg);

    this.ref = base.syncState("/error", {
      context: this,
      state: "errorbox"
    });

    this.ref = base.syncState("/queue", {
      context: this,
      state: "queuebox",
      then() {
        this.deleteQueue();
        this.deleteOld();
        this.deleteSilentCrash();
      }
    });
  }

  // delete queue and error checkers after extraction process
  deleteQueue = () => {
    var checker = false;
    const { queuebox, errorbox } = this.state;
    Object.entries(queuebox).map(([key, val]) => {
      if (val.toDelete) {
        queuebox[key].toDelete = null;
        errorbox[key].errorFound = null;

        checker = true;
      }
    });
    if (checker) {
      this.setState(prevState => ({ queuebox: queuebox }));
    }
  };

  // delete data older than 8 hours
  deleteOld = () => {
    const database = firebaseApp.database().ref("story");
    const now = Date.now();
    const cutoff = now - 8 * 60 * 60 * 1000; // 8 hours
    // const cutoff = now - 2 * 60 * 60 * 1000; // 8 hours
    const old = database
      .orderByChild("timestamp")
      .endAt(cutoff)
      .limitToLast(1);

    old.on("child_added", function(snapshot) {
      if (typeof snapshot.val().timestamp !== "undefined") {
        console.log("old data:", snapshot.key, snapshot.val().timestamp);
        database.child(snapshot.key).remove();
      } else console.log(snapshot.key);
    });
  };

  // delete progress counter that silently failed aka 15mins
  deleteSilentCrash = () => {
    const progressRef = firebaseApp.database().ref("progress");
    const errorRef = firebaseApp.database().ref("error");
    const queueRef = firebaseApp.database().ref("queue");

    const now = Date.now();
    const cutoff = now - 15 * 60 * 1000; // 15 mins

    const old = progressRef
      .orderByChild("timestamp")
      .endAt(cutoff)
      .limitToLast(1);

    old.on("child_added", snapshot => {
      console.log("silent crash:", snapshot.key, snapshot.val().timestamp);
      // set variables up for deletion
      progressRef.child(snapshot.key).remove();
      errorRef.child(snapshot.key).set({ errorFound: true });
      queueRef.child(snapshot.key).set({ toDelete: true });
    });
  };

  // check if given url can be parsed
  validateURL = requestedURL => {
    const chapterLink = requestedURL.startsWith("https://www.wattpad.com/"); //ok
    const storyLink = requestedURL.startsWith("https://www.wattpad.com/story/"); // reject
    const authorLink = requestedURL.startsWith("https://www.wattpad.com/user/"); // reject
    const missingHTTTPS = !requestedURL.startsWith("https://");

    if (storyLink || missingHTTTPS || authorLink) return false;
    else if (chapterLink) return true;
    else return false;
  };

  // grab chapterId instead when storyId throw errors
  grabTempStoryId = requestedURL => {
    const str = requestedURL.replace("https://www.wattpad.com/", "");
    const storyId = str.split("-")[0];
    return storyId;
  };

  // fetch to grab html to isolate storyId from dropdownlist
  grabStoryId = requestedURL => {
    return fetch(requestedURL)
      .then(results => {
        return results.text();
      })
      .then(data => {
        const parser = new DOMParser();
        const httpDoc = parser.parseFromString(data, "text/html");
        const storyLink = httpDoc
          .querySelector("div.toc-header.text-center")
          .querySelector("a.on-navigate")
          .getAttribute("href");
        return storyLink;
      })
      .then(link => {
        const str = link.split("-")[0];
        const storyId = str.split("/")[2];
        console.log("StoryId:", storyId);
        if (isNaN(storyId)) return this.grabTempStoryId(requestedURL);
        else return storyId;
      })
      .catch(error => {
        console.log(error);
        console.log("Grabbing temp storyId...");
        return this.grabTempStoryId(requestedURL);
      });
  };

  addToQueue = storyId => {
    const queuebox = { ...this.state.queuebox };
    queuebox[storyId] = { toDelete: false };
    this.setState({ queuebox: queuebox });
  };

  postToServer = (requestedURL, storyId) => {
    fetch("/", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ url: requestedURL, storyId: storyId }),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(body => {
        this.addToQueue(body.url);
        this.props.history.push(`/${body.url}`);
      })
      .catch(err => {
        console.log(err);
        this.props.history.push(`/${this.state.storyId}`);
      });
  };

  wattpadURL = React.createRef();
  goToFic = event => {
    event.preventDefault();
    const requestedURL = this.wattpadURL.current.value;
    const validation = this.validateURL(requestedURL);

    if (validation) {
      this.setState(prevState => ({ status: "disabled" }));

      // promise based
      this.grabStoryId(requestedURL).then(storyId => {
        const database = firebaseApp.database().ref("/");
        database.child(`story/${storyId}`).once("value", snapshot => {
          if (!snapshot.exists()) {
            database.child(`progress/${storyId}`).once("value", snapshot => {
              if (!snapshot.exists()) {
                database.child(`queue/${storyId}`).once("value", snapshot => {
                  if (!snapshot.exists()) {
                    // new request for story
                    ReactGA.event({
                      category: "flag",
                      action: "request",
                      label: "request-story-extraction"
                    });
                    this.postToServer(requestedURL, storyId);
                  } else {
                    // story extraction in progress
                    ReactGA.event({
                      category: "flag",
                      action: "redirection",
                      label: "same-story-request"
                    });
                    this.props.history.push(`/${storyId}`);
                  }
                });
              } else {
                // story extraction in progress
                ReactGA.event({
                  category: "flag",
                  action: "redirection",
                  label: "same-story-request"
                });
                this.props.history.push(`/${storyId}`);
              }
            });
          } else {
            // story is already available
            ReactGA.event({
              category: "flag",
              action: "redirection",
              label: "story-already-available"
            });
            this.props.history.push(`/${storyId}`);
          }
        });
      });
    } else {
      alert(
        "Woosp, please make sure your link a CHAPTER URL! Check the instructions page if you are unsure!"
      );
      this.setState(prevState => ({ status: "" }));
    }
  };

  handleFeedback = () => {
    this.props.history.push("/feedback");
  };

  render() {
    const { status } = this.state;

    const disabledStatus =
      status === "disabled" ? (
        <button type="submit" className="button" disabled>
          Go
        </button>
      ) : (
        <button type="submit" className="button">
          Go
        </button>
      );
    return (
      <div className="background">
        <div className="container flex-fullview">
          <form onSubmit={this.goToFic}>
            <FormHeader />
            <div className="input-group">
              <input
                className="form-control"
                type="text"
                ref={this.wattpadURL}
                required
                placeholder="Enter chapter URL"
              />
              <span className="input-group-btn">{disabledStatus}</span>
            </div>
          </form>
          <ToastContainer />
        </div>
        <div className="container flex-footer feedback">
          <a href="#" onClick={this.handleFeedback}>
            <span>feedbacks or complains? shoot me a text!</span>
          </a>
          {/* <FormFeedback /> */}
        </div>
        <DetectAdBlock />
      </div>
    );
  }
}

export default FormMain;
