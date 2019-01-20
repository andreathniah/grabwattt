import React from "react";
import FicNav from "./FicNav";
import { getHelmet } from "../helpers";

const getTitle = (title, author) => {
	return title + " " + author;
};

const FicSummary = data => (
	<React.Fragment>
		<h5 className="fic-head-title">
			<strong>{getTitle(data.title, data.author)}</strong>
		</h5>
		<p
			className="fic-head-line"
			dangerouslySetInnerHTML={{ __html: data.summary }}
		/>
		<p>
			URL:{" "}
			<a href={data.url} target="_blank">
				{data.url}
			</a>
		</p>
	</React.Fragment>
);

const FicBody = data => {
	if (data) {
		return data.map((chapter, index) => {
			return (
				<div key={index} id="chapter-container" className="page">
					{chapter.map((lines, index) => (
						<p key={index} dangerouslySetInnerHTML={{ __html: lines }} />
					))}
				</div>
			);
		});
	}
};

const FicMain = props => {
	const { title, author, pages } = props.storybox;

	return (
		<React.Fragment>
			{getHelmet(getTitle(title, author))}
			<FicNav {...props} />
			<div id="summary-container" className="page print-container">
				{FicSummary(props.storybox)}
			</div>
			<div id="story-container" className="print-container">
				{FicBody(pages)}
			</div>
		</React.Fragment>
	);
};

export default FicMain;
