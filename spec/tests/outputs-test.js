var out = require('../../lib/outputs.js')

setup(async function () {})

it('should output to standard', async function ({ t }) {
  var result
  console.info = function (output) {
    result = output
  }
  out.std('out')
  t.equal(result, 'out')
})
