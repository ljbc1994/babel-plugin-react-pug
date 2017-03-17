import pugLexer from 'pug-lexer'
import pugParser from 'pug-parser'
import * as t from 'babel-types'

/**
 * @class NodeBuilder
 */
export default class NodeBuilder {
	
	/**
	 * @function
	 * Process the ast and hook up the 
	 * interpolations
	 * @params { Object } ast - The ast of the pug template
	 * @params { Array } interpolations - Contains the 
	 * interpolations
	 * @returns { Object } The react function call AST
	 */
	constructor(ast, interpolations) {
		this.interpolations = interpolations
		return this.processNode(ast)
	}
	
	/**
	 * @function
	 * Execute the processing of the Pug AST nodes
	 * @returns { Object } The react function call AST
	 */
	build() {
		return this.processNode(ast)
	}
	
	/**
	 * @function
	 * Build the react function call node
	 * @params { String } tagName - The tag name of the element
	 * @params { Array<Object> } attrsArr - Array of element attributes
	 * @params { Array|undefined } subNodes - Array of function call ASTs
	 * @returns { Object } The react function call node
	 */
	buildNode(tagName, attrsArr, subNodes) {
		
		let fn = t.memberExpression(t.identifier('React'), t.identifier('createElement'))
		let args = [t.stringLiteral(tagName), this.buildAttributes(attrsArr)]
		
		if (subNodes && subNodes.length) {
			args = args.concat(subNodes)
		}

		return t.callExpression(fn, args)
		
	}
	
	/**
	 * @function
	 * Convert the array of element attributes into an object expression
	 * containing object properties
	 * @params { Array<Object> } attrsArr - Array of element attributes
	 * @returns { Object } The object expression or null node 
	 */
	buildAttributes(attrsArr) {
		
		let args = attrsArr.map((attr) => {
			
			return t.objectProperty(t.identifier(attr.name), this.interpolate(attr.val, t.identifier))
		
		})
		
		return args.length ? t.objectExpression(args) : t.nullLiteral() 
		
	}
	
	/**
	 * @function
	 * Recursively iterate over the Pug AST and convert
	 * each node into a React function call representation
	 * @params { Object } node - The Pug node
	 * @returns { Object } The pug node / subnode
	 */
	processNode(node) {
		
		if (node.type === 'Block') {
			return node.nodes.map(this.processNode.bind(this)).filter((node) => node !== undefined)
		} 
		if (node.type === 'Text') {
			return this.interpolate(node.val, t.stringLiteral)
		}
		if (node.type === 'Tag') {
			let hasNodes = node.block && node.block.nodes.length
			return this.buildNode.bind(this)(node.name, node.attrs, hasNodes ? this.processNode.bind(this)(node.block) : undefined)	
		}
		
	}
	
	/**
	 * @function
	 * Check whether there are any placeholders within
	 * the value and replace these with specified 
	 * interpolations
	 * @params { String } value - The value of the element 
	 * @params { Object } type - The type of the AST node
	 */
	interpolate(value, type) {
		const INTERPOLATE_REGEX = /\/~[^>]~\//g
		const NUMBER_REGEX = /[^0-9]/g
		const matches = value.match(INTERPOLATE_REGEX)

		if (matches && matches.length) {
			let id = matches[0].replace(NUMBER_REGEX, '')
			return this.interpolations[id]
		}

		return type(value)
	}
}