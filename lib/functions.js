var extras = require('extras')
var help = require('./help.js')
var commands = require('./commands.js')

async function link({ repos, root, entry, list }) {
  console.log('Linking repos...')
  // J({ repos, root, entry, list })

  console.time('fiks :: link')

  for (var item of list) {
    // J(item)
    for (var d of item.deps) {
      if (d.source == 'git') {
        // console.log(d)
      }
      if (d.dev === false) {
        // console.log('HELLO')
      }

      // console.log(item.name, d.name)
    }
  }

  // await Promise.all(
  //   repos.map(async function (repo) {
  //     commands.npmInstallNoSave(repo)
  //   })
  // )
  console.timeEnd('fiks :: link')
}

module.exports = { link, help }
