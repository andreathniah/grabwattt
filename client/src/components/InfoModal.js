import React from "react";
import { Modal, Button } from "react-bootstrap";

const InfoModal = props => {
	return (
		<Modal
			show={props.show}
			bsSize="large"
			aria-labelledby="contained-modal-title-lg"
			className="my-modal"
		>
			<Modal.Header>
				<Modal.Title id="contained-modal-title-lg">{props.title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{props.content}</Modal.Body>
			<Modal.Footer>
				<Button onClick={props.onSave} bsStyle="primary">
					Okay
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

InfoModal.defaultProps = {
	title: "" // empty string for title on default
};

export default InfoModal;
