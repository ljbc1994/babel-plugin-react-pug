"use strict";

function render(item) {
	return React.createElement(Component, {
		title: item.name,
		quote: item.quote
	});
}