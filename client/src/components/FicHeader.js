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

				const pdfURL =
					"https://url-to-pdf-api.herokuapp.com/api/render?url=" +
					window.location.href +
					"&waitFor=header&emulateScreenMedia=false&pdf.margin.top=2cm&pdf.margin.right=2cm&pdf.margin.bottom=2cm&pdf.margin.left=2cm";
				window.open(pdfURL, "_blank");
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
					<nav className="navbar navbar-expand-lg navbar-light bg-light">
						<a className="navbar-brand" onClick={this.handleHome}>
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
