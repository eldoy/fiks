var extras = require('extras')
var help = require('./help.js')
var cmd = require('./commands.js')
var out = require('./outputs.js')
var parsers = require('./parsers.js')

async function link({ list }) {
  console.time('fiks :: link')
  await Promise.all(
    list.map(async (item) => {
      out.std(await cmd.npmInstallLocal(item))
    })
  )
  console.timeEnd('fiks :: link')
}

async function unlink({ list }) {
  console.time('fiks :: unlink')
  await Promise.all(
    list.map(async (item) => {
      out.std(await cmd.npmInstall(item))
    })
  )
  console.timeEnd('fiks :: unlink')
}

async function linked({ list }) {
  console.time('fiks :: linked')
  cmd.printList(list)
  console.timeEnd('fiks :: linked')
}

async function install({ list }) {
  console.time('fiks :: install')
  await Promise.all(
    list.map(async function (item) {
      out.std(await cmd.npmInstallGlobal(item))
      out.std(await cmd.npmUpdateGitRepos(item))
      out.std(await cmd.npmInstallLocal(item))
    })
  )
  console.timeEnd('fiks :: install')
}

async function log({ list, users }) {
  console.time('fiks :: log')
  var logs = []
  for (var item of list) {
    logs = logs.concat(parsers.gitlog(item, await cmd.gitLog(item)))
  }
  logs.sort((a, b) => a.date - b.date)

  if (users.length) {
    logs = logs.filter(function (log) {
      return !!users.find((u) => log.author.toLowerCase().includes(u))
    })
  }

  logs = logs.slice(0, 10)
  out.gitLog(logs)
  console.timeEnd('fiks :: log')
}

async function status({ list }) {
  console.time('fiks :: status')
  await Promise.all(
    list.map(async (item) => {
      out.gitStatus(item, await cmd.gitStatus(item))
    })
  )
  console.timeEnd('fiks :: status')
}

async function update({ list }) {
  console.time('fiks :: update')
  await Promise.all(
    list.map(async (item) => {
      out.std(await cmd.npxUpdateGlobal(item))
      out.std(await cmd.npmUpdateGitRepos(item))
      out.std(await cmd.npmInstallLocal(item))
    })
  )
  console.timeEnd('fiks :: update')
}

async function reset({ list }) {
  console.time('fiks :: reset')
  await Promise.all(
    list.map(async (item) => {
      out.std(await cmd.gitResetClean(item))
    })
  )
  console.timeEnd('fiks :: reset')
}

async function pull({ list }) {
  console.time('fiks :: pull')
  await Promise.all(
    list.map(async (item) => {
      out.std(await cmd.gitPull(item))
    })
  )
  console.timeEnd('fiks :: pull')
}

async function push({ list }) {
  console.time('fiks :: push')
  var message = await extras.input('Message: ')
  await Promise.all(
    list.map(async (item) => {
      out.std(await cmd.gitPush(item, message))
    })
  )
  console.timeEnd('fiks :: push')
}

module.exports = {
  link,
  unlink,
  linked,
  install,
  log,
  status,
  update,
  reset,
  pull,
  push,
  help
}
