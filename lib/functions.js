var help = require('./help.js')
var commands = require('./commands.js')

async function link({ repos, root, list }) {
  console.time('fiks :: link')
  await Promise.all(
    list.filter((item) => item.paths).map(commands.npmInstallNoSave)
  )
  console.timeEnd('fiks :: link')
}

module.exports = { link, help }
