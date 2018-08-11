import React from "react";

class FormGIF extends React.Component {
	render() {
		return (
			<div className="box">
				<a data-toggle="modal" href="#exampleModalCenter">
					click for more instructions!
				</a>

				<div
					className="modal fade"
					id="exampleModalCenter"
					tabIndex="-1"
					role="dialog"
					aria-labelledby="exampleModalCenterTitle"
					aria-hidden="true"
				>
					<div className="modal-dialog modal-dialog-centered" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title" id="exampleModalLongTitle">
									Instructions
								</h5>
								<button
									type="button"
									className="close"
									data-dismiss="modal"
									aria-label="Close"
								>
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div className="modal-body">
								<img
									src="./instructions.gif"
									alt="instructions"
									className="instructions"
								/>
							</div>
							<div className="modal-footer">
								<button type="button" className="button" data-dismiss="modal">
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default FormGIF;
