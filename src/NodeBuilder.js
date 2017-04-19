// @flow

import type { PugNode, PugAttributeNode } from '../types/pug'
import type { BabelNode, BabelNodeResponse } from '../types/babel'
import Translations from './translations'

import * as t from 'babel-types'

const INTERPOLATE_REGEX = /\/~[^>]~\//g
const NUMBER_REGEX = /[^0-9]/g

/**
 * @class NodeBuilder
 */
export default class NodeBuilder {
  ast: PugNode;
  interpolations: Array<BabelNode>;

  /**
   * @function
   * Process the ast and hook up the
   * interpolations
   * @params { Object } ast - The ast of the pug template
   * @params { Array } interpolations - Contains the
   * interpolations
   * @params { Array } blocks - Named blocks
   * @returns { Object } The react function call AST
   */
  constructor (ast: PugNode, interpolations: Array<BabelNode>) : BabelNodeResponse {
    this.interpolations = interpolations

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
  buildNode (tagName: string, attrsArr: Array<PugAttributeNode>, subNodes: BabelNodeResponse) : BabelNode {
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
  convertAttributeKey (value: string) : string {
    //HACK: Not sure if this is correct, but this is how you fix attributes like, aria-hidden, aria-label, etc...
		if (value.indexOf('-') > -1) {
			value = `'${value}'`
		}

    /*
      NOTE: Borrowed from https://github.com/insin/babel-plugin-react-html-attrs
      This works at the attribute level, the aforemention plugin only appears to works on the <JSX> syntax
    */
    if (value in Translations) {
      value = Translations[value]
    }

    return value;
  }

  /**
   * @function
   * Determine whether the tag is a component or an element
   * and return the AST node
   * @params { String } tagName - The tag name of the node
   * @returns { Object } The AST node
   */
  buildTag (tagName: string) : BabelNode {
    if (tagName.charAt(0) === tagName.charAt(0).toUpperCase()) {
      return t.identifier(tagName)
    }

    return t.stringLiteral(tagName)
  }

  /**
   * Note: Add check for multiple classNames
   * @function
   * Convert the array of element attributes into an object expression
   * containing object properties
   * @params { Array<Object> } attrsArr - Array of element attributes
   * @returns { Object } The object expression or null node
   */
  buildAttributes (attrsArr: Array<PugAttributeNode>) : BabelNode {
    // Ensure that duplicate attribute definitions are chained if
    // they are strings - otherwise use the interpolated value
    let argsObj = attrsArr.reduce((obj, { name, val }) => {
      if (obj.hasOwnProperty(name) && typeof obj[name] === 'string' && typeof val === 'string') {
        obj[name] = `${obj[name].slice(0, -1)} ${val.slice(1)}`
      } else {
        obj[name] = val
      }

      return obj
    }, {})

    let argsArr = Object.keys(argsObj).map((key) => {
      let attrKey = t.identifier(this.convertAttributeKey(key))
      let attrVal = this.interpolate(argsObj[key], t.identifier)

      return t.objectProperty(attrKey, ...attrVal)
    })

    return argsArr.length ? t.objectExpression(argsArr) : t.nullLiteral()
  }

   /**
   * @function
   * Recursively iterate over the Pug AST and convert
   * each node into a AST React function call
   * @params { Object } node - The Pug node
   * @returns { Object } The pug node / subnode
   */
  processNode (node: PugNode) : BabelNodeResponse {
    const _processNode = this.processNode.bind(this)
    const _buildNode = this.buildNode.bind(this)

    if (node == null || !node.hasOwnProperty('type')) {
      return null
    }

    switch (node.type) {
      case 'Block':
      case 'NamedBlock':
        return Array.isArray(node.nodes) ? node.nodes.map(_processNode) : null

      case 'Text':
        return this.interpolate(node.val, t.stringLiteral)

      case 'Tag':
        let hasNodes = node.block && node.block.nodes.length
        return _buildNode(node.name, node.attrs, hasNodes ? _processNode(node.block) : null)
    }
  }

  /**
   * @function
   * Check whether there are any placeholders within
   * the value and replace these with specified
   * interpolations
   * @params { String } value - The value of the element
   * @params { Function } type - The type of the AST node
   * @returns { Array } The AST node(s)
   */
  interpolate (value: string, type: Function) : Array<BabelNodeResponse> {
    const matches = value.match(INTERPOLATE_REGEX)

    if (matches && matches.length) {
      let splitValue = value.split(INTERPOLATE_REGEX)

      return splitValue.reduce((arr, value, index) => {
        let valueArr = value ? [t.stringLiteral(value)] : []
        let match = matches[index]

        if (match) {
          let id = match.replace(NUMBER_REGEX, '')
          valueArr.push(this.interpolations[parseInt(id)])
        }

        return arr.concat(valueArr)
      }, [])
    }

    return [ type(value) ]
  }
}
