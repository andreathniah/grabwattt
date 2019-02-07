import React from "react";
import { generatePDF } from "../helpers";
import ReactGA from "react-ga";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class FicHeader extends React.Component {
	state = { loading: true };

	// log actions to google analytics
	logToGA = (category, action, label) => {
		ReactGA.event({
			category: category,
			action: action,
			label: label
		});
	};

	handleDownload = () => {
		alert(
			"Please make sure your browser has no pop-up or ads blockers! Keep a lookout for the pop-up blocked icon at your address bar."
		);
		toast(
			"Please check out the instructions page if you are having errors with pdf generation",
			{ autoClose: 8000 }
		);

		try {
			// backup pdf download option with pupeteer
			this.handleBackup();
			this.logToGA("downloads", "pdf", "pupeteer");

			// backup pdf download option with pupeteer microservice
			const pdfURL =
				"https://url-to-pdf-api.herokuapp.com/api/render?url=" +
				window.location.href +
				"&waitFor=header&emulateScreenMedia=false&pdf.margin.top=2cm&pdf.margin.right=2cm&pdf.margin.bottom=2cm&pdf.margin.left=2cm";
			window.open(pdfURL, "_blank");
		} catch (error) {
			this.logToGA("downloads", "pdf", "error");
			alert("oops, something went wrong, use Ctrl+P and save as PDF instead");
		}
	};

	handleHome = () => {
		this.logToGA("success", "redirection", "return-home");
		this.props.history.push("/");
	};

	handleFeedback = () => {
		this.props.history.push("/feedback");
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

		const contentArr = [];
		const epubSummary = document.getElementById("summary-container").innerHTML;
		const chaptersContent = document.querySelectorAll("#chapter-container");

		// combine all contents into one large JSON object
		contentArr[0] = {
			title: storyTitle,
			author: storyAuthor.replace("by ", ""),
			data: epubSummary
		};
		for (let i = 0; i < chaptersContent.length; i++) {
			contentArr[i + 1] = {
				title: `Chapter ${i + 1}`,
				data: chaptersContent[i].innerHTML
			};
		}

		fetch("/epub", {
			method: "POST",
			mode: "cors",
			body: JSON.stringify({
				url: window.location.href,
				title: storyTitle,
				author: storyAuthor,
				summary: epubSummary,
				content: contentArr
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
		toast(
			"Please be patient, give it at least 15 seconds. Do NOT spam the download button."
		);

		try {
			this.logToGA("downloads", "epub", "epub-gen");
			this.downloadEpub();
		} catch (error) {
			this.logToGA("downloads", "epub", "error");
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
								alt="Grabwatt"
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
								<a
									className="nav-item nav-link active"
									onClick={this.handleFeedback}
								>
									Feedback <span className="sr-only">(current)</span>
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
						<p
							className="summary-lines"
							dangerouslySetInnerHTML={{ __html: storySummary }}
						/>
						<p>
							URL:{" "}
							<a href={storyURL} target="_blank">
								{storyURL}
							</a>
						</p>
					</div>
					<ToastContainer />
				</header>
			);
	}
}

export default FicHeader;
