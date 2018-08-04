import React from "react";
import FormHeader from "./FormHeader";
import FormMessage from "./FormMessage";
import base from "../base";

class FormMain extends React.Component {
	state = {
		storyId: ""
	};

	validateURL = requestedURL => {
		const chapterLink = requestedURL.includes("https://www.wattpad.com/"); //ok
		const storyLink = requestedURL.includes("https://www.wattpad.com/story/"); // reject
		const missingHTTTPS = !requestedURL.includes("https://");

		if (storyLink || missingHTTTPS) return false;
		else if (chapterLink) return true;
		else return false;
	};

	grabStoryId = requestedURL => {
		const str = requestedURL.replace("https://www.wattpad.com/", "");
		const storyId = str.split("-")[0];
		return storyId;
	};

	wattpadURL = React.createRef();
	goToFic = event => {
		event.preventDefault();
		const requestedURL = this.wattpadURL.current.value;
		const validation = this.validateURL(requestedURL);

		if (validation) {
			const storyId = this.grabStoryId(requestedURL);
			this.setState(prevState => ({ storyId: storyId }));

			fetch("/", {
				method: "POST",
				mode: "cors",
				body: JSON.stringify({ url: requestedURL, storyId: storyId }),
				headers: { "Content-Type": "application/json" }
			})
				.then(res => res.json())
				.then(body => {
					if (body.error) alert(body.message);
					else this.props.history.push(`/${body.url}`);
				})
				.catch(err => console.log(err));
		}
	};

	render() {
		const { storyId } = this.state;
		console.log(storyId);
		const message = storyId ? <FormMessage storyId={storyId} /> : null;

		return (
			<div className="flex-fullview form">
				<form onSubmit={this.goToFic}>
					<FormHeader />
					<input
						type="text"
						ref={this.wattpadURL}
						required
						placeholder="Enter a URL"
					/>
					<button type="submit" className="button">
						Go
					</button>
					{message}
				</form>
			</div>
		);
	}
}

export default FormMain;
