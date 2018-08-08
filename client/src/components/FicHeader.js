import React from "react";
import { generatePDF } from "../helpers";

class FicHeader extends React.Component {
	state = { loading: true };

	handleDownload = () => {
		const { storyTitle, storyAuthor } = this.props;
		try {
			generatePDF(storyTitle, storyAuthor);
		} catch (error) {
			alert("Please make sure your browser has no pop-up/ads blockers!");
			try {
				this.handleBackup();
			} catch (error) {
				alert("oops, something went wrong, use Ctrl+P and save as PDF instead");
			}
		}
	};

	handleHome = () => {
		this.props.history.push("/");
	};

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
