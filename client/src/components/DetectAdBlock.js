import React from "react";
import fuckAdBlock from "fuckadblock";

class DetectAdBlock extends React.Component {
	componentDidMount() {
		this.detectAdBlock();
	}
	adBlockNotDetected = () => {
		console.log("AdBlock is not enabled");
	};
	adBlockDetected = () => {
		console.log("AdBlock is enabled");
	};

	detectAdBlock = () => {
		if (
			typeof fuckAdBlock !== "undefined" ||
			typeof FuckAdBlock !== "undefined"
		) {
			this.adBlockDetected();
		} else {
			var importFAB = document.createElement("script");
			importFAB.onload = function() {
				fuckAdBlock.onDetected(this.adBlockDetected);
				fuckAdBlock.onNotDetected(this.adBlockNotDetected);
			};
			importFAB.onerror = function() {
				this.adBlockDetected();
			};
			importFAB.integrity =
				"sha256-xjwKUY/NgkPjZZBOtOxRYtK20GaqTwUCf7WYCJ1z69w=";
			importFAB.crossOrigin = "anonymous";
			importFAB.src =
				"https://cdnjs.cloudflare.com/ajax/libs/fuckadblock/3.2.1/fuckadblock.min.js";
			document.head.appendChild(importFAB);
		}
	};

	logToGA = () => {
		console.log("ADBLOCK DETECTED, LOG TO GA");
	};

	render() {
		return <div id="adblock-wrapper" />;
	}
}
export default DetectAdBlock;
