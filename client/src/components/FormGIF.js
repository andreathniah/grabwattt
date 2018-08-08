import React from "react";

class FormGIF extends React.Component {
	render() {
		return (
			<div>
				<div className="box">
					<a href="#popup1">click for more instructions!</a>
				</div>
				<div id="popup1" className="overlay">
					<div className="popup">
						<h4>instructions</h4>
						<a className="close" href="#">
							&times;
						</a>
						<div className="content">
							<img
								src="./instructions.gif"
								alt="instructions"
								className="instructions"
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default FormGIF;
