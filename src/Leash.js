import pugLexer from 'pug-lexer'
import pugParser from 'pug-parser'
import pugLoader from 'pug-load'
import NodeBuilder from './NodeBuilder'

/**
 * @class Leash
 */
export default class Leash {
	
	/**
	 * @function
	 * Hook up the ast and interpolations required
	 * @params { Array } template - Sections of the pug template
	 * @params { Array } interpolations - The interpolations
	 * @return { Object } AST of react function calls
	 */
	constructor(template, interpolations) {
		this.interpolations = interpolations
		this.ast = this.getAST(this.templatePlaceholder(template))
		
		return this.initialise()
	}
	
	/**
	 * @function
	 * Initialise converting the Pug AST into the react function
	 * call AST
	 * @return { Object } AST of react function calls
	 */
	initialise() {
		return new NodeBuilder(this.ast.nodes[0], this.interpolations)
	}
	
	/**
	 * @function
	 * Get the AST of the pug template
	 * @params { String } template - String representation of 
	 * the pug template containing placeholder values 
	 * @returns { Object } The react function call AST
	 */
	getAST(template) {
		
		let ast = pugLoader.string(template, {
			filename: 'component.pug',
			lex: pugLexer,
			parse: pugParser,
			resolve: (filename, source, options) => {
				return pugLoader.resolve(filename, source, options);
			}
		})
		
		return ast
	}
	
	/**
	 * @function
	 * Loop through the template sections, adding placeholders
	 * for the projected interpolations
	 * @params { Array } template - Array of template sections 
	 * @returns { String } The string representation of the
	 * pug template containing placeholder values
	 */
	templatePlaceholder(template) {
		
		return template.map((section, index) => {
    
			let hasValue = this.interpolations[index] !== undefined
      
			let placeholder = hasValue ? ('/~' + index + '~/') : ''
      
			return `${section.value.raw}${placeholder}`
    
		}).join('')
		
	}
	
}
