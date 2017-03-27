function render() {
	return pug`
		.component
			ul.component__items ${ this.titles.map((title) => pug`li.component__item ${ title }`) }
	`
}