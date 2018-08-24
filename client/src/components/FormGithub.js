import React from "react";
import ReactGA from "react-ga";

class FormGithub extends React.Component {
  handleGithub = event => {
    console.log("clicked");
    ReactGA.event({
      category: "flag",
      action: "redirection",
      label: "go-github"
    });
  };
  render() {
    return (
      <div className="box">
        <a
          href="https://github.com/andreathniah/grabwatt"
          target="_blank"
          onClick={this.handleGithub}
        >
          <span>check out the git repository!</span>
        </a>
      </div>
    );
  }
}

export default FormGithub;
