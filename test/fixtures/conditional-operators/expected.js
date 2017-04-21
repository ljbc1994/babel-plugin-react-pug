"use strict";

function render() {
  return showProfile ? React.createElement(Profile, {    title: this.state.title  }) : React.createElement("p", {    className: 'component__error'  }, "Component could not be loaded.");
}