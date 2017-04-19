// @flow

import type { PugNode } from '../types/pug'
import type { BabelNode } from '../types/babel'

import pugLexer from 'pug-lexer'
import pugParser from 'pug-parser'
import pugLoader from 'pug-load'
import pugLinker from 'pug-linker'
import NodeBuilder from './NodeBuilder'

const START_TABS_REGEX = /^[\t]{1,}/g
const START_SPACES_REGEX = /^[ ]{1,}/g

const ERROR_MSGS = {
  NO_AST_NODES: 'No AST node(s) could be generated from the provided pug template',
  NO_AST_EXISTS: 'An AST could not be generated from the provided pug template'
}

/**
 * @class Leash
 */
export default class Leash {
  template: Array<BabelNode>;
  interpolations: Array<BabelNode>;
  ast: PugNode;

  /**
   * @function
   * Hook up the ast and interpolations required
   * @param { Array } template - Sections of the pug template
   * @param { Array } interpolations - The interpolations
   * @returns { Object } AST of react function calls
   */
  constructor (template: Array<BabelNode>, interpolations: Array<BabelNode> = []) {
    this.interpolations = interpolations
    this.ast = this.getAST(this.manipulateTemplate(template))
  }

  /**
   * @function
   * Initialise converting the Pug AST into the react function
   * call AST
   * @returns { Object } AST of react function calls
   */
  initialise () : NodeBuilder {
    let rootNode
    const astExists = this.ast !== undefined

    if (astExists && Array.isArray(this.ast.nodes)) {
      rootNode = this.ast.nodes[0]
    } else {
      throw new Error([ERROR_MSGS.NO_AST_NODES, ERROR_MSGS.NO_AST_EXISTS][astExists ? 0 : 1])
    }

    return new NodeBuilder(rootNode, this.interpolations)
  }

  /**
   * @function
   * Get the AST of the pug template
   * @param { String } template - String representation of
   * the pug template containing placeholder values
   * @returns { Object } The react function call AST
   */
  getAST (template: string) : PugNode {
    let loadedAST = pugLoader.string(template, {
      filename: 'component.pug',
      lex: pugLexer,
      parse: pugParser,
      resolve: (filename, source, options) => {
        return pugLoader.resolve(filename, source, options)
      }
    })

    return pugLinker(loadedAST)
  }

  /**
   * @function
   * Manipulate the pug template
   * @param { Array } template - Array of template sections
   * @returns { String } The pug template
   */
  manipulateTemplate (template: Array<BabelNode>) : string {
    return this.templateWhitespace(this.templatePlaceholder(template))
  }

  /**
   * @function
   * Format the template depending on whether it contains
   * tabs or spaces. This allows for the user to align
   * the template with the pug function
   * @param { String } Pug template string
   * @returns { String } Formatted pug template string
   */
  templateWhitespace (template: string) : string {
    const lines = template.split('\n')
    const rootLine = lines.filter((line) => line.length > 0)[0]
    const hasTabs = rootLine.match(START_TABS_REGEX)
    const hasSpaces = rootLine.match(START_SPACES_REGEX)

    if (!hasTabs && !hasSpaces) {
      return template
    }

    let spacesArr = []

    if (Array.isArray(hasTabs)) {
      spacesArr = hasTabs[0]
    } else if (Array.isArray(hasSpaces)) {
      spacesArr = hasSpaces[0]
    }

    let tpl = lines
      .map((line) => line.slice(spacesArr.length))
      .join('\n')

    return tpl
  }

  /**
   * @function
   * Loop through the template sections, adding placeholders
   * for the projected interpolations
   * @param { Array<Object> } template - Array of template sections
   * @returns { String } The string representation of the
   * pug template containing placeholder values
   */
  templatePlaceholder (template: Array<BabelNode>) : string {
    return template.map((section, index) => {
      let hasValue = this.interpolations[index] !== undefined

      let placeholder = hasValue ? ('/~' + index + '~/') : ''

      return `${section.value.raw}${placeholder}`
    }).join('')
  }
}
