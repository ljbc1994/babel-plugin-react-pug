function render () {
  return pug`
		extends ./test/fixtures/extend-prepend-template/test.pug
		block prepend content
			.component__title Title
		block footer
			.component__footer Title
	`
}
