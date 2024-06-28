var help = require('./help.js')

function link({ repos, root }) {
  console.log('Linking repos...')
  console.log({ repos, root })
}

module.exports = { link, help }
