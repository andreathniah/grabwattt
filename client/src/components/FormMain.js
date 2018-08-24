import React from "react";
import FormHeader from "./FormHeader";
import DetectAdBlock from "./DetectAdBlock";
import base from "../base";
import { firebaseApp } from "../base";
import ReactGA from "react-ga";

class FormMain extends React.Component {
  state = { storyId: "", status: "", queuebox: [], errorbox: [] };

  componentDidMount() {
    const alertMsg =
      "hey! if you find yourself encountering error one too many times, try limiting yourself to only sumbitting one link per hour. i'm fixing it, i promise!";
    alert(alertMsg);

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

  // delete data older than 12 hours
  deleteOld = () => {
    const database = firebaseApp.database().ref("story");
    var now = Date.now();
    var cutoff = now - 12 * 60 * 60 * 1000; // 12 hours
    var old = database
      .orderByChild("timestamp")
      .endAt(cutoff)
      .limitToLast(1);

    old.on("child_added", function(snapshot) {
      console.log(snapshot.key, snapshot.val().timestamp);
      database.child(snapshot.key).remove();
    });
  };

  // check if given url can be parsed
  validateURL = requestedURL => {
    const chapterLink = requestedURL.includes("https://www.wattpad.com/"); //ok
    const storyLink = requestedURL.includes("https://www.wattpad.com/story/"); // reject
    const missingHTTTPS = !requestedURL.includes("https://");

    if (storyLink || missingHTTTPS) return false;
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
            database.child(`queue/${storyId}`).once("value", snapshot => {
              // new request for story
              if (!snapshot.exists()) this.postToServer(requestedURL, storyId);
              // story requested by another user is in the midst of extraction
              else this.props.history.push(`/${storyId}`);
            });
          } else {
            // story already available in firebase
            ReactGA.event({
              category: "flag",
              action: "redirection",
              label: "same-story-request",
              value: storyId
            });
            this.props.history.push(`/${storyId}`);
          }
        });
      });
    } else {
      alert("looks like something is wrong, is your link a CHAPTER URL?");
      this.setState(prevState => ({ status: "" }));
    }
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
                placeholder="Enter a URL"
              />
              <span className="input-group-btn">{disabledStatus}</span>
            </div>
          </form>
        </div>
        <DetectAdBlock />
      </div>
    );
  }
}

export default FormMain;
