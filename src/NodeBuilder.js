import * as t from 'babel-types'

const INTERPOLATE_REGEX = /\/~[^>]~\//g
const NUMBER_REGEX = /[^0-9]/g

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
	constructor(ast, interpolations, blocks) {
		this.interpolations = interpolations
		this.blocks = blocks;
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
		let args = [this.buildTag(tagName), this.buildAttributes(attrsArr)]
		
		if (Array.isArray(subNodes) && subNodes.length) {
			
			let subNodeArrays = subNodes.filter(node => Array.isArray(node))
			
			if (subNodeArrays.length) {
				subNodes = [].concat(...subNodes)
			} 
			
			args = args.concat(subNodes)
			
		}
		
		return t.callExpression(fn, args)
		
	}
	
	/**
	 * @function
	 * Convert attribute key into compatible React 
	 * attribute
	 * @params { String } value - The attribute to convert
	 * @returns { String } The converted attribute
	 */
	convertAttributeKey(value) {
		switch (value) {
			case 'class':
				return 'className'
			default:
				return value
		}
	}
	
	/**
	 * @function
	 * Determine whether the tag is a component or an element
	 * and return the AST node
	 * @params { String } tagName - The tag name of the node
	 * @returns { Object } The AST node
	 */
	buildTag(tagName) {
		if (tagName.charAt(0) === tagName.charAt(0).toUpperCase()) {
			return t.identifier(tagName)
		}
		return t.stringLiteral(tagName)
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
			
			let attrKey = t.identifier(this.convertAttributeKey(attr.name))
			let attrVal = this.interpolate(attr.val, t.identifier)
			
			return t.objectProperty(attrKey, ...attrVal)
			
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
		
		let _processNode = this.processNode.bind(this)
		let _buildNode = this.buildNode.bind(this)
		let _findNamedBlock = this.findNamedBlock.bind(this)
		
		switch (node.type) {
				
			case 'Block':
				return node.nodes.map(_processNode)
			
			case 'NamedBlock':
				let block = _findNamedBlock(node.name)
				return block.nodes.map(_processNode)
				
			case 'Text':
				return this.interpolate(node.val, t.stringLiteral)
				
			case 'Tag':
				let hasNodes = node.block && node.block.nodes.length
				return _buildNode(node.name, node.attrs, hasNodes ? _processNode(node.block) : undefined)
				
			case 'Include':
				return _processNode(node.file.ast)
				
			case 'Extends':
				return _processNode(node.file.ast)[0]
				
		}
		
	}
	
	/**
	 * @function
	 * Check whether there are any placeholders within
	 * the value and replace these with specified 
	 * interpolations
	 * @params { String } value - The value of the element 
	 * @params { Object } type - The type of the AST node
	 * @returns { Array } The AST node(s)
	 */
	interpolate(value, type) {
		const matches = value.match(INTERPOLATE_REGEX)
		
		if (matches && matches.length) {
			
			let splitValue = value.split(INTERPOLATE_REGEX)
			
			return splitValue.reduce((arr, value, index) => {
				
				let valueArr = value ? [t.stringLiteral(value)] : []
				let match = matches[index]
					
				if (match) {
					let id = match.replace(NUMBER_REGEX, '')
					valueArr.push(this.interpolations[id])
				}
				
				return arr.concat(valueArr)
				
			}, [])
			
		}
		
		return [ type(value) ]
	}
	
	/**
	 * @function
	 * Find the named block
	 * @params { String } The name of the named block
	 * @returns { Object } Pug ast of the named block
	 */
	findNamedBlock(name) {
		return this.blocks.find((block) => block.name === name)
	}
}