"use strict";

function render(item) {
	return React.createElement("div", {
		className: 'component__title'
	}, "The ", item.title, " ");
}