function render() {
  const SubComponent = pug`div Title`	
	return pug`
		.component__class
      ${ SubComponent }
	`
}