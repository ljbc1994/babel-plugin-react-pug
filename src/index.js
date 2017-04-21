// @flow

import Leash from './Leash'

const METHOD_IDENTIFIER = 'pug'

export default function () {
  return {
    visitor: {
      TaggedTemplateExpression (path: Object) {
        let { node } = path

        /* istanbul ignore else */
        if (node.tag.name === METHOD_IDENTIFIER) {
          let { quasis, expressions } = node.quasi

          path.replaceWith(new Leash(quasis, expressions).initialise())
        }
      }
    }
  }
}
