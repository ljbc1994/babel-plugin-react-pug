function render() {
	return pug`
		.component
			.component__title Title
			include ./test/fixtures/include-template/test.pug
	`
}