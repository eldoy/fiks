var extras = require('extras')
var printers = require('./printers.js')

async function npmInstallLocal(item) {
  var linkPaths = item.deps
    .filter((d) => d.local)
    .map((d) => d.root)
    .join(' ')

  var command = `cd ${item.dir} && npm install --no-save ${linkPaths}`
  var output = extras.get(command)
  console.log(output)
}

async function npmInstall(item) {
  var command = `cd ${item.dir} && npm install`
  var output = extras.get(command)
  console.log(output)
}

async function npmInstallGlobal(item) {
  var installRepos = item.deps
    .filter((d) => d.source == 'npm')
    .map((d) => d.name)
    .join(' ')

  var command = `cd ${item.dir} && npm install ${installRepos}`
  var output = extras.get(command)
  console.log(output)
}

async function npmUpdateGlobal(item) {
  var updateRepos = item.deps
    .filter((d) => d.source == 'git')
    .map((d) => d.name)
    .join(' ')

  var command = `cd ${item.dir} && npm update ${updateRepos}`
  var output = extras.get(command)
  console.log(output)
}

function printList(list) {
  list
    .filter((item) => item.local)
    .forEach(function (item) {
      console.log(item.name)
      item.deps
        .filter((dep) => dep.dir)
        .forEach(function (dep) {
          console.log(`  ${dep.name}: ${dep.linked}`)
        })
    })
}

module.exports = {
  npmInstallLocal,
  npmInstall,
  npmInstallLocal,
  npmInstallGlobal,
  npmUpdateGlobal,
  printList
}
