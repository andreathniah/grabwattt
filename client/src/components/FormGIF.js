import React from "react";

class FormGIF extends React.Component {
  render() {
    return (
      <div className="box">
        <a data-toggle="modal" href="#instructionModal">
          click for more instructions!
        </a>

        <div
          className="modal fade"
          id="instructionModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="instructionModalTitle"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Instructions GIFS</h5>
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
                <div>
                  <label>
                    General Instructions: <br />
                  </label>
                  <img
                    src="./instructions.gif"
                    alt="general instructions"
                    className="instructions"
                  />
                </div>
                <div>
                  <br />
                  <br />
                  <label>
                    PDF instructions: <br />
                  </label>
                  <img
                    src="./howto_pdf.gif"
                    alt="pdf instructions"
                    className="instructions"
                  />
                </div>

                <div>
                  <br />
                  <label>
                    Tutorial video: <br />
                  </label>
                  <a href="https://youtu.be/xW4OiW7rktY">
                    https://youtu.be/xW4OiW7rktY
                  </a>
                </div>
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
