import Leash from './Leash'

const METHOD_IDENTIFIER = 'pug'

export default function({ types: t }) {
	
	return {
		
		visitor: {
			ReturnStatement(path) {
				
				path.traverse({
					TaggedTemplateExpression(path) {
						
						let { node } = path
 						
						if (node.tag.name === METHOD_IDENTIFIER) {
							
							let { quasis, expressions } = node.quasi
							
							path.replaceWith(new Leash(quasis, expressions))
							
						}
						
					}
				})
				
			}
		}
		
	}
	
}