var extras = require('extras')

async function npmInstallLocal(item) {
  var linkPaths = item.deps
    .filter((d) => d.local)
    .map((d) => d.root)
    .join(' ')

  var command = `cd ${item.dir} && npm install --no-save ${linkPaths}`
  return extras.get(command)
}

async function npmInstall(item) {
  var command = `cd ${item.dir} && npm install`
  return extras.get(command)
}

async function npmInstallGlobal(item) {
  var installRepos = item.deps
    .filter((d) => d.source == 'npm')
    .map((d) => d.name)
    .join(' ')

  var command = `cd ${item.dir} && npm install ${installRepos}`
  return extras.get(command)
}

async function npmUpdateGitRepos(item) {
  var updateRepos = item.deps
    .filter((d) => d.source == 'git')
    .map((d) => d.name)
    .join(' ')

  var command = `cd ${item.dir} && npm update ${updateRepos}`
  return extras.get(command)
}

async function npxUpdateGlobal(item) {
  var command = `cd ${item.dir} && npx npm-check-updates -u && npm install`
  return extras.get(command)
}

async function gitLog(item) {
  var command = `cd ${item.dir} && git log -n 10`
  return extras.get(command)
}

async function gitStatus(item) {
  var command = `cd ${item.dir} && git status`
  return extras.get(command)
}

async function gitResetClean(item) {
  var command = `cd ${item.dir} && git reset --hard && git clean -df`
  return extras.get(command)
}

async function gitPull(item) {
  var command = `cd ${item.dir} && git pull`
  return extras.get(command)
}

async function gitPush(item, message = 'Update') {
  var command = `cd ${item.dir} && git add --all && git commit -m "${message}" && git push`
  return extras.get(command)
}

function printList(list) {
  list
    .filter((item) => item.local)
    .forEach(function (item) {
      console.log(item.name)
      item.deps
        .filter((dep) => dep.dir)
        .forEach(function (dep) {
          console.log(`  ${dep.name}: ${dep.linked ? 'linked' : 'not linked'}`)
        })
    })
}

module.exports = {
  npmInstallLocal,
  npmInstall,
  npmInstallLocal,
  npmInstallGlobal,
  npmUpdateGitRepos,
  npxUpdateGlobal,
  gitLog,
  gitStatus,
  gitResetClean,
  gitPull,
  gitPush,
  printList
}
