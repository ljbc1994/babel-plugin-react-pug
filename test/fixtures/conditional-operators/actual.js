function render() {
  return showProfile 
    ? pug`Profile(title=${this.state.title})`
	  : pug`p.component__error Component could not be loaded.`
}