declare export type PugAttributeNode = {
  name: string,
  val: string | number
}

declare export type PugFileReferenceNode = {
  type: string,
  path: string,
  line: number,
  filename: string,
  fullPath: string,
  str: string,
  ast: PugNode
}

declare export type PugNode = {
  type: string,
  name: string,
  selfClosing: bool,
  block: PugNode,
  attrs: Array<PugAttributeNode>,
  isInline: bool,
  line: number,
  filename: string,
  file: PugFileReferenceNode,
  nodes: Array<PugNode>,
  val: string
}