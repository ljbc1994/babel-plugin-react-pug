function render () {
  return pug`
		extends ./test/fixtures/extend-append-template/test.pug
		block append content
			.component__subtitle Subtitle
		block footer
			.component__footer Title
	`
}
