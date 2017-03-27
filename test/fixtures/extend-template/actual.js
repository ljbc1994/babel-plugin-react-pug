function render() {
	return pug`
		extend ./test/fixtures/extend-template/test.pug
		block content
			.component__title Title
		block footer
			.component__footer Title
	`
}