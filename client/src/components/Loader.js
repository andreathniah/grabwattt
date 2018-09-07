import React from "react";
import LoaderMessage from "./LoaderMessage";
import FicMain from "./FicMain";
import base from "../base";
import { firebaseApp } from "../base";
import ReactGA from "react-ga";

class Loader extends React.Component {
  state = { loading: true, storybox: [] };

  componentDidMount() {
    const { storybox } = this.state;
    const { storyId } = this.props.match.params;

    this.ref = base.syncState(`story/${storyId}`, {
      context: this,
      state: "storybox",
      then() {
        const queueRef = firebaseApp.database().ref("queue");
        const storyRef = firebaseApp.database().ref("story");
        const progressRef = firebaseApp.database().ref("progress");
        const errorRef = firebaseApp.database().ref("error/" + storyId);

        progressRef.child(storyId).once("value", snapshot => {
          if (!snapshot.exists()) {
            queueRef.child(storyId).once("value", snapshot => {
              if (!snapshot.exists()) {
                storyRef.child(storyId).once("value", snapshot => {
                  if (!snapshot.exists()) {
                    ReactGA.event({
                      category: "error",
                      action: "redirction",
                      label: "story-not-found",
                      value: storyId
                    });
                    console.log("redirecting...");
                    errorRef.set({ errorFound: null });

                    this.props.history.push("/error404");
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  componentDidUpdate() {
    const { loading, storybox } = this.state;

    if (loading === true && Object.keys(storybox).length !== 0) {
      this.setState(prevState => ({ loading: false }));
    }
  }

  render() {
    const { loading } = this.state;
    const { match, history } = this.props;

    return (
      <div>
        {loading ? (
          <LoaderMessage storyId={match.params.storyId} history={history} />
        ) : (
          <FicMain storyId={match.params.storyId} history={history} />
        )}
      </div>
    );
  }
}

export default Loader;
