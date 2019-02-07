import React from "react";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { generatePDF, logToGA } from "../helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class FicNav extends React.Component {
	componentDidMount = () => {
		const alertMsg =
			"Grabawatt has rolled out a new PDF generation service. Do log a feedback if you notice any issues!";
		toast(alertMsg, { autoClose: 8000 });
	};

	// navigate to home page upon click on logo
	handleHome = () => {
		logToGA("success", "redirection", "return-home");
		this.props.history.push("/");
	};

	// trigger relevant download actions
	handleSelect = event => {
		const { title, author } = this.props.storybox;

		if (event === "pdf") {
			try {
				alert(
					"Please make sure your browser has no pop-up or ads blockers! Keep a lookout for the pop-up blocked icon at your address bar."
				);
				toast(
					"PDF generation takes at least 30 seconds to work at the background, please stay on the current page",
					{ autoClose: 10000 }
				);
				this.downloadPdf();
				logToGA("downloads", "pdf", "pupeteer");

				// backup pdf download option with pupeteer microservice
				const pdfURL =
					"https://url-to-pdf-api.herokuapp.com/api/render?url=" +
					window.location.href +
					"&waitFor=header&emulateScreenMedia=false&pdf.margin.top=2cm&pdf.margin.right=2cm&pdf.margin.bottom=2cm&pdf.margin.left=2cm";
				window.open(pdfURL, "_blank");
			} catch (error) {
				alert("Oops, something went wrong, use Ctrl+P and save as PDF instead");
				logToGA("downloads", "pdf", "error");
			}
		} else if (event === "epub") {
			alert(
				"Please make sure your browser has no pop-up or ads blockers! Keep a lookout for the pop-up blocked icon at your address bar."
			);
			toast(
				"Please be patient, give it at least 15 seconds. Do NOT spam the download button."
			);
			logToGA("downloads", "epub", "epub-gen");
			this.downloadEpub(title, author);
		} else if (event === "feedback") {
			logToGA("success", "redirection", "return-home");
			this.props.history.push("/feedback");
		}
	};

	// fetch call to DO server
	downloadPdf = () => {
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

	// fetch call to backend server
	downloadEpub = (storyTitle, storyAuthor) => {
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

	render() {
		const { storyId } = this.props.match.params;

		return (
			<Navbar collapseOnSelect onSelect={this.handleSelect}>
				<Navbar.Header>
					<Navbar.Brand>
						<a onClick={this.handleHome}>Grabwatt</a>
					</Navbar.Brand>
					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Nav>
						<NavItem eventKey={"pdf"}>Download as PDF</NavItem>
						<NavItem eventKey={"epub"}>Download as EPUB</NavItem>
						<NavItem eventKey={"feedback"}>Feedback</NavItem>
					</Nav>
					<Navbar.Text pullRight>Story ID: {storyId}</Navbar.Text>
				</Navbar.Collapse>
				<ToastContainer />
			</Navbar>
		);
	}
}

export default FicNav;
