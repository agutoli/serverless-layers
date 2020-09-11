'use strict'
const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs')
const path = require('path')

/* input and output paths */
const outputDir = __dirname

/* get template data */
const templateData = jsdoc2md.getTemplateDataSync({
  files: [
    'src/index.js',
    'src/commands/Deploy.js'
  ]
})

/* reduce templateData to an array of class names */
const namespaces = templateData.reduce((namespaces, identifier) => {
  if (identifier.kind === 'namespace') namespaces.push(identifier.name)
  return namespaces
}, [])

/* create a documentation file for each class */
for (const namespace of namespaces) {
  const template = `{{#namespace name="${namespace}"}}{{>docs}}{{/namespace}}`
  console.log(`rendering ${namespace}, template: ${template}`)
  const output = jsdoc2md.renderSync({ data: templateData, template: template })
  fs.writeFileSync(path.resolve(outputDir, `docs/${namespace}.md`), output)
}
