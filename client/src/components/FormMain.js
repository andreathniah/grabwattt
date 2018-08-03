import React from "react";
import FormHeader from "./FormHeader";

class FormMain extends React.Component {
	state = { url: "", message: "" };

	componentDidMount() {
		this.callApi()
			.then(res => this.setState({ url: res.url }))
			.catch(err => console.log(err));
	}

	callApi = async () => {
		const response = await fetch("/");
		const body = await response.json();
		if (response.status !== 200) throw Error(body.message);

		return body;
	};

	wattpadURL = React.createRef();

	goToFic = event => {
		this.setState(prevState => ({ message: "loading..." }));
		event.preventDefault();
		const requestedURL = this.wattpadURL.current.value;

		fetch("/", {
			method: "POST",
			body: JSON.stringify({ url: requestedURL }),
			headers: { "Content-Type": "application/json" }
		})
			.then(res => res.json())
			.then(body => {
				this.setState({ url: requestedURL });
				this.props.history.push(`/${body.url}`);
			});
	};

	render() {
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
					<p>{this.state.message}</p>
				</form>
			</div>
		);
	}
}

export default FormMain;
