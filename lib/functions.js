var help = require('./help.js')
var commands = require('./commands.js')

async function link({ list }) {
  console.time('fiks :: link')
  await Promise.all(
    list.filter((item) => item.paths).map(commands.npmInstallNoSave)
  )
  console.timeEnd('fiks :: link')
}

async function unlink({ list }) {
  console.time('fiks :: unlink')
  await Promise.all(list.map(commands.npmInstall))
  console.timeEnd('fiks :: unlink')
}

async function linked({ list }) {
  console.time('fiks :: linked')
  list
    .filter((item) => item.paths)
    .forEach(function (item) {
      console.log(item.name)
      item.deps
        .filter((dep) => dep.dir)
        .forEach(function (dep) {
          console.log(`  ${dep.name}: ${dep.linked}`)
        })
    })

  console.timeEnd('fiks :: linked')
}

module.exports = { link, unlink, linked, help }
