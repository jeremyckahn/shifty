/**
 * A small JSDoc plugin that replaces TSDoc (typescript flavored JSDoc)
 * with regular JSDoc for not crashing documentation generation, while
 * still having accurate types.
 * @author arthuro555 <arthur.pacaud@hotmail.fr>
 */

const TYPESCRIPT_IMPORT_TYPE = /typedef {import\(.*\)/
const TYPESCRIPT_RECORD_TYPE = /Record<.*,(.*)>/

exports.astNodeVisitor = {
  visitNode: function(node) {
    if (node.type === 'File') {
      if (node.comments) {
        node.comments.forEach((/** @type {{ value: string }} */ comment) => {
          // Remove imports as they are only necessary for typescript and crash jsdoc
          if (TYPESCRIPT_IMPORT_TYPE.test(comment.value)) comment.value = ''

          // Replace typescript Record<key, value> syntax with JSDoc Object.<value>
          comment.value = comment.value.replace(
            TYPESCRIPT_RECORD_TYPE,
            `Object.<$1>`
          )
        })
      }
    }
  },
}
