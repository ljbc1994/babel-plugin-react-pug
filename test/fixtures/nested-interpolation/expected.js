"use strict";

function render() {
	var SubComponent = React.createElement("div", null, "Title");	
	return React.createElement("div", {
		className: 'component__class'
	}, SubComponent);
}