var outputs = require('../../lib/outputs.js')

setup(async function () {
  console.info = function () {}
})

it('should output the standard', async function ({ t }) {
  var result = outputs.standard('out')
  t.equal(outputs.standard('out'), 'out')
})
