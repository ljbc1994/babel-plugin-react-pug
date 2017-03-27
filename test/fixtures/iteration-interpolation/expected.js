"use strict";

function render() {
	return React.createElement("div", {className: 'component'}, React.createElement("ul", {className: 'component__items'}, this.titles.map(function (title) {return React.createElement("li", {className: 'component__item'}, title);})));
}