// @flow

import type { PugNode, PugAttributeNode } from '../types/pug'
import type { BabelNode, BabelNodeResponse } from '../types/babel'

import * as t from 'babel-types'
import translations from './translations'

const PLACEHOLDER_ID = '_react_pug_replace'

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
   * @param { Object } ast - The ast of the pug template
   * @param { Array } interpolations - Contains the
   * interpolations
   * @param { Array } blocks - Named blocks
   * @returns { Object } The react function call AST
   */
  constructor (ast: PugNode, interpolations: Array<BabelNode>) : BabelNodeResponse {
    this.interpolations = interpolations

    return this.processNode(ast)
  }

  /**
   * @function
   * Build the react function call node
   * @param { String } tagName - The tag name of the element
   * @param { Array<Object> } attrsArr - Array of element attributes
   * @param { Array|undefined } subNodes - Array of function call ASTs
   * @returns { Object } The react function call node
   */
  buildNode (tagName: string, attrsArr: Array<PugAttributeNode>, subNodes: BabelNodeResponse) : BabelNode {
    if (tagName === PLACEHOLDER_ID) {
      return this.interpolations.shift()
    }

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
   * @param { String } value - The attribute to convert
   * @returns { String } The converted attribute
   */
  convertAttributeKey (value: string) : string {
    /**
     * NOTE: Borrowed from https://github.com/insin/babel-plugin-react-html-attrs
     * This works at the attribute level, the aforemention plugin only appears to works on the <JSX> syntax
     */
    if (value in translations) {
      return translations[value]
    }

    if (value.indexOf('-') > -1) {
      return `'${value}'`
    }

    return value
  }

  /**
   * @function
   * Determine whether the tag is a component or an element
   * and return the AST node
   * @param { String } tagName - The tag name of the node
   * @returns { Object } The AST node
   */
  buildTag (tagName: string) : BabelNode {
    if (tagName.charAt(0) === tagName.charAt(0).toUpperCase()) {
      return t.identifier(tagName)
    }

    return t.stringLiteral(tagName)
  }

  /**
   * @function
   * Build up an array of babel nodes for the attribute
   * object expression.
   * @param { Array<object> } attributes - The element attributes
   * @returns { Array<Object> } An array of babel nodes
   */
  buildAttributesArr (attributes: Object) : Array<BabelNode> {
    return Object.keys(attributes).map((key) => {
      let attrKey = t.identifier(this.convertAttributeKey(key))
      let attrVal = []

      if (typeof attributes[key] === 'string') {
        attrVal = attrVal.concat(this.interpolate(attributes[key], t.identifier))
      } else {
        attrVal.push(t.identifier(attributes[key]))
      }

      return t.objectProperty(attrKey, ...attrVal)
    })
  }

  /**
   * @function
   * Convert the array of element attributes into an object expression
   * containing object properties
   * @param { Array<Object> } attrsArr - Array of element attributes
   * @returns { Object } The object expression or null node
   */
  buildAttributes (attrsArr: Array<PugAttributeNode>) : BabelNode {
    // Ensure that duplicate attribute definitions are chained if
    // they are strings - otherwise use the interpolated value
    let attrsObj = attrsArr.reduce((obj, { name, val }) => {
      if (name in obj && typeof obj[name] === 'string' && typeof val === 'string') {
        obj[name] = `${obj[name].slice(0, -1)} ${val.slice(1)}`
      } else {
        obj[name] = val
      }

      return obj
    }, {})

    let attrsNodesArr = this.buildAttributesArr(attrsObj)

    return attrsNodesArr.length ? t.objectExpression(attrsNodesArr) : t.nullLiteral()
  }

   /**
   * @function
   * Recursively iterate over the Pug AST and convert
   * each node into a AST React function call
   * @param { Object } node - The Pug node
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
   * @param { String } value - The value of the element
   * @param { Function } type - The type of the AST node
   * @returns { Array } The AST node(s)
   */
  interpolate (value: string, type: Function) : Array<BabelNodeResponse> {
    const hasReplace = value.indexOf(PLACEHOLDER_ID) > -1

    if (hasReplace) {
      const splitValue = value.split(PLACEHOLDER_ID)

      return splitValue.reduce((arr, value, index) => {
        let valueArr = value ? [t.stringLiteral(value)] : []
        let interpolation = this.interpolations.shift()

        if (interpolation !== undefined) {
          valueArr.push(interpolation)
        }

        return arr.concat(valueArr)
      }, [])
    }

    return [ type(value) ]
  }
}
