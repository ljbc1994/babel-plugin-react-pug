declare export type BabelNode = {
	type: string,
	start: number,
	end: number,
	value: {
		raw: string,
		cooked: string,
		tail: bool
	},
	callee: ?BabelNode,
	arguments: ?Array<BabelNode>
}
	
declare export type BabelNodeResponse = 
	| Array<BabelNodeResponse>
	| Array<BabelNode>
	| ?BabelNode
	| null