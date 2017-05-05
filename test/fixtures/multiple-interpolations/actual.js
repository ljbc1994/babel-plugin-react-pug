function render(item) {
	return pug`
    Component(title=${ item.name } quote=${ item.quote })
	`
}