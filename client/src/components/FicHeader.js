import React from "react";
import { generatePDF } from "../helpers";

class FicHeader extends React.Component {
	state = { loading: true };

	handleDownload = () => {
		const { storyTitle, storyAuthor } = this.props;
		try {
			generatePDF(storyTitle, storyAuthor);
		} catch (error) {
			alert(
				"Something went wrong! Trying using Ctrl+P and save as PDF instead!"
			);
		}
	};

	handleHome = () => {
		this.props.history.push("/");
	};

	componentDidUpdate() {
		if (this.state.loading === true)
			this.setState(prevState => ({ loading: false }));
	}

	componentDidMount() {}

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
					<nav className="navbar navbar-expand-lg navbar-light bg-light header-nav">
						<a className="navbar-brand">Logo here</a>
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
									className="navbar-item nav-link active"
									onClick={this.handleHome}
								>
									Home{" "}
								</a>
								<a
									className="nav-item nav-link active"
									onClick={this.handleDownload}
								>
									Download as PDF <span className="sr-only">(current)</span>
								</a>
								<a className="nav-item nav-link disabled" href="#">
									Database reference key: {storyId}
								</a>
							</div>
						</div>
					</nav>

					<div id="summary-container" className="print-container">
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
