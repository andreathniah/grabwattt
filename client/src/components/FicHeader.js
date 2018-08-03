import React from "react";
import { generatePDF } from "../helpers";

class FicHeader extends React.Component {
	state = { loading: true };

	handleDownload = () => {
		const { storyTitle, storyAuthor } = this.props;
		generatePDF(storyTitle, storyAuthor);
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
					<div className="flex-row">
						<div>Database reference key: {storyId}</div>
						<div>
							<button
								type="button"
								className="button"
								onClick={this.handleDownload}
							>
								Download As PDF
							</button>
							<button
								type="button"
								className="button"
								onClick={this.handleHome}
							>
								Grab another Story
							</button>
						</div>
					</div>
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
