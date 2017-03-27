"use strict";

function render() {
	return React.createElement("div", {className: 'component'}, React.createElement("div", {className: 'component__title'}, "Title"), React.createElement("div", {className: 'component__footer'}, React.createElement("h1", {className: 'footer__title'}, "Title")));
}