var help = require('./help.js')
var commands = require('./commands.js')

// Link all dependencies to local directories
async function link({ list }) {
  console.time('fiks :: link')
  await Promise.all(list.map(commands.npmInstallLocal))
  console.timeEnd('fiks :: link')
}

// Unlink all linked directories
async function unlink({ list }) {
  console.time('fiks :: unlink')
  await Promise.all(list.map(commands.npmInstall))
  console.timeEnd('fiks :: unlink')
}

// Show a list of linked directories
async function linked({ list }) {
  console.time('fiks :: linked')
  commands.printList(list)
  console.timeEnd('fiks :: linked')
}

async function install({ list }) {
  console.time('fiks :: install')
  await Promise.all(
    list.map(async function (item) {
      // Install any global npm package
      commands.npmInstallGlobal(item)

      // Update github packages
      commands.npmUpdateGlobal(item)

      // Re-link any linked package
      commands.npmInstallLocal(item)
    })
  )
  console.timeEnd('fiks :: install')
}

module.exports = { link, unlink, linked, install, help }
