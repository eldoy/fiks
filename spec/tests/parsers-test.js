var parsers = require('../../lib/parsers.js')

setup(async function () {
  console.info = function () {}
})

it('should parse gitlog', async function ({ t, data }) {
  var item = { name: 'firmalisten' }
  var result = parsers.gitlog(item, data.gitlog)

  var [log1, log2] = result
  t.ok(Array.isArray(result))
  t.equal(result.length, 2)

  t.equal(log1.repo, 'firmalisten')
  t.equal(log1.commit, '0b77fc09224fcca326741fef2e32e9c9db25d8dd')
  t.equal(log1.merge, 'b37a41b 0bbb91d')
  t.equal(log1.author, 'Vidar Eldøy <vidar@eldoy.com>')
  t.equal(log1.date.toISOString(), '2024-06-29T20:17:03.000Z')
  t.equal(log1.message, 'Output test')

  t.equal(log2.repo, 'firmalisten')
  t.equal(log2.commit, '61466dcc4eddf6abff92ba319c41d40cc10c7a0e')
  t.equal(log2.author, 'Vidar Eldøy <vidar@eldoy.com>')
  t.equal(log2.date.toISOString(), '2024-06-29T19:36:15.000Z')
  t.equal(log2.message, 'Move legacy')
})
