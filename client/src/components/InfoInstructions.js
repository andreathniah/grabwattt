import React from "react";
import InfoModal from "./InfoModal";

const modalTemplate = (
	<React.Fragment>
		<h4>
			<strong>
				<span>Tutorial video: </span>
			</strong>
			<a href="https://youtu.be/xW4OiW7rktY">https://youtu.be/xW4OiW7rktY</a>
		</h4>
		<h4>
			<strong>General Instructions:</strong>
		</h4>
		<img
			src="./instructions.gif"
			alt="general instructions"
			className="info-gifs"
		/>
		<h4>
			<strong>PDF instructions:</strong>
		</h4>
		<img src="./howto_pdf.gif" alt="pdf instructions" className="info-gifs" />
	</React.Fragment>
);

class InfoInstructions extends React.Component {
	constructor(props) {
		super(props);
		this.state = { status: false };
	}

	handleToggleStatus = () => {
		const { status } = this.state;
		this.setState({ status: !status });
	};

	render() {
		const { status } = this.state;
		return (
			<div>
				<InfoModal
					content={modalTemplate}
					title="Instructions GIFS"
					show={status}
					onSave={this.handleToggleStatus}
				/>
				<a onClick={this.handleToggleStatus}>
					<span>click for more instructions!</span>
				</a>
			</div>
		);
	}
}

export default InfoInstructions;
