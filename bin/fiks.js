#!/usr/bin/env node

var extras = require('extras')
var util = require('../lib/util.js')

var LOG_SIZE = 10

var { cmd, repos, users } = util.parseArgs(process.argv)

var cwd = process.cwd()
var root = cwd.split('/').at(-1)
var dir = extras.dir().filter((d) => !d.includes('.'))

var ops = {
  LINK: { cmd: 'link', start: 'Linking', finish: 'Linked' },
  INSTALL: { cmd: 'install', start: 'Installing', finish: 'Installed' },
  UPDATE: { cmd: 'update', start: 'Updating', finish: 'Updated' },
  UPGRADE: { cmd: 'upgrade', start: 'Upgrading', finish: 'Upgraded' },
  STATUS: { cmd: 'status', start: 'Getting status', finish: '' },
  PUSH: { cmd: 'push', start: 'Pushing', finish: 'Pushed' },
  PULL: { cmd: 'pull', start: 'Pulling', finish: 'Pulled' },
  LOG: { cmd: 'log', start: 'Logging', finish: 'Logged' }
}

function usage() {
  console.log('Usage:')
  console.log(`
  fiks link - link all repos with npm i --no-save
  fiks install - install packages in all repos
  fiks update - update all packages in all repos
  fiks upgrade - upgrade all package versions in all repos
  fiks status - prints which directories have unpushed changes
  fiks push - push all repos at once (ask for commit message for each repo)
  fiks push "commit message" - push all repos at once with the same commit message
  fiks pull - pull all repos, stashes uncommited changes
  fiks pull repo1 repo2 - pull specified repos, stashes uncommited changes
  fiks log - see a unified log of all repos, sorted by last change
  `)
  process.exit(0)
}

function unknownCmd() {
  console.log(`\nUnknown command: ${cmd}\n`)
  usage()
}

if (!cmd) usage()
if (
  !Object.values(ops)
    .map((op) => op.cmd)
    .includes(cmd)
) {
  unknownCmd()
}

var invalid = repos.filter((repo) => !dir.includes(repo))
if (invalid.length) {
  console.error(`Invalid repos: ${invalid.join(', ')}`)
  process.exit(0)
}

function walk(cb) {
  var directories = repos.length ? repos : dir
  for (var directory of directories) {
    var packages = directories.filter((d) => d != directory)
    try {
      cb(directory, packages)
    } catch (err) {
      console.error(`${root}/${directory}: ${err}`)
      process.exit(0)
    }
  }
}

function finish(d, extra, error) {
  var action = cmd.charAt(0).toUpperCase() + cmd.slice(1)
  var symbol = '✅'
  if (error) {
    symbol = '❌'
    act = 'Error'
    extra = `${action} failed. Please check for merge conflicts.`
  } else {
    act = action.charAt(action.length - 1) == 'e' ? `${action}d` : `${action}ed`
  }

  var def = `${symbol} ${act}: ${root}/${d}`

  console.log(extra ? `${def} - ${extra}` : def)
}

function start() {
  console.log('⚠️ ' + ` Root: ${root}`)

  var rep = repos.length ? repos : dir
  console.log('⚠️ ' + ` Repositories: ${rep.join(', ')}`)

  var op = ops[cmd.toUpperCase()]
  console.log(`\n🔥 ${op.start} repositories 🔥\n`)
}

async function run() {
  start()

  switch (cmd) {
    case ops.LINK.cmd:
      walk(function (d, packages) {
        var ps = packages.map((p) => `./${p}`).join(' ')
        extras.get(`npm --prefix ./${d} uninstall ${ps} --no-save`)
        extras.get(`npm --prefix ./${d} i ${ps} --no-save`)
        finish(d)
      })
      break
    case ops.INSTALL.cmd:
      walk(function (d, packages) {
        var ps = packages.map((p) => `./${p}`).join(' ')
        extras.get(`npm --prefix ./${d} uninstall ${ps} --no-save`)
        extras.get(`npm --prefix ./${d} i`)
        finish(d)
      })
      break
    case ops.UPDATE.cmd:
      walk(function (d) {
        extras.get(`npm --prefix ./${d} update`)
        finish(d)
      })
      break
    case ops.UPGRADE.cmd:
      walk(function (d) {
        extras.get(`npx npm-check-updates --cwd ./${d} -u`)
        finish(d)
      })
      break
    case ops.STATUS.cmd:
      var result = []
      walk(function (d) {
        var status = extras.get(`git -C ./${d} status`)
        var isEmpty = status.includes('nothing to commit, working tree clean')
        if (!isEmpty) result.push(d)
      })
      console.log(result)
      break
    case ops.PUSH.cmd:
      var message = await extras.input('Message: ')
      console.log()

      walk(function (d) {
        extras.get(`git -C ./${d} add --all`)

        if (!message) {
          var status = extras.get(`git -C ./${d} status`)
          status = util.parseGitStatus(status, true)
          message = status.message
        }

        var result = extras.get(`git -C ./${d} commit -m '${message}'`)
        result = result.split('\n')[1].trim()
        result = result.includes('Your branch is up to date')
          ? '0 file changed'
          : result

        var res = extras.run(`git -C ./${d} push`, { silent: true })

        var error
        if (res.code) {
          extras.get(`git -C ./${d} reset HEAD~`)
          error = true
        }

        finish(d, result, error)
      })
      break
    case ops.PULL.cmd:
      walk(function (d) {
        extras.get(`git -C ./${d} stash`)
        extras.get(`git -C ./${d} pull --rebase`)
        finish(d)
      })
      break
    case ops.LOG.cmd:
      var logs = []

      walk(function (d) {
        var res = extras.get(`git -C ./${d} log`)
        util.parseGitLog(res, d, function (log) {
          var author = log.author.toLowerCase()
          var isUserMatch = users
            .map((user) => author.includes(user.toLowerCase()))
            .reduce((a, b) => a || b, false)

          if (!users.length || isUserMatch) {
            logs.push(log)
          }
        })
      })

      logs = logs.sort((a, b) => b.date - a.date).slice(0, LOG_SIZE)

      if (!logs.length) {
        console.log('❌ No logs found.')
      } else {
        util.printGitLogs(logs)
      }

      break
    default:
      unknownCmd()
  }

  process.exit(0)
}

run()
