#!/usr/bin/env node

var farge = require('farge')()
var extras = require('extras')
var util = require('../lib/util.js')

var LOG_SIZE = 10

var { cmd, repos, users } = util.parseArgs(process.argv)

var cwd = process.cwd()
var root = cwd.split('/').at(-1)
var dir = extras.dir().filter((d) => !d.includes('.'))

var ops = {
  INSTALL: {
    cmd: 'install',
    start: 'Installing repositories',
    finish: 'Installed'
  },
  LINK: { cmd: 'link', start: 'Linking repositories', finish: 'Linked' },
  LOG: { cmd: 'log', start: 'Logging repositories', finish: 'Logged' },
  PULL: { cmd: 'pull', start: 'Pulling repositories', finish: 'Pulled' },
  PUSH: { cmd: 'push', start: 'Pushing repositories', finish: 'Pushed' },
  STATUS: { cmd: 'status', start: 'Getting repositories status', finish: '' },
  UPDATE: { cmd: 'update', start: 'Updating repositories', finish: 'Updated' },
  UPGRADE: {
    cmd: 'upgrade',
    start: 'Upgrading repositories',
    finish: 'Upgraded'
  }
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
  fiks pull - pull all repos, stashes and reapplies uncommited changes
  fiks pull repo1 repo2 - pull specified repos, stashes and reapplies uncommited changes
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
  var idx = 0
  for (var directory of directories) {
    var packages = directories.filter((d) => d != directory)
    try {
      cb({ directory, packages }, idx)
      idx++
    } catch (err) {
      console.error(`${root}/${directory}: ${err}`)
      process.exit(0)
    }
  }
}

function finish(d, extra, error) {
  if (!d) {
    console.log()
    return
  }
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
  farge.green.log('\n⚠️ ' + ` Root: `)
  farge.white.log(`${root}\n`)

  var rep = repos.length ? repos : dir
  farge.green.log('⚠️ ' + ` Repositories: `)
  farge.white.log(`${rep.join(', ')}\n`)

  var op = ops[cmd.toUpperCase()]

  farge.bold.green.log(`\n🔥 ${op.start} 🔥\n\n`)
}

async function run() {
  start()

  switch (cmd) {
    case ops.INSTALL.cmd:
      walk(function ({ directory, packages }) {
        var ps = packages.map((p) => `./${p}`).join(' ')
        extras.get(`npm --prefix ./${directory} uninstall ${ps} --no-save`)
        extras.get(`npm --prefix ./${directory} i`)
        finish(directory)
      })
      break
    case ops.LINK.cmd:
      walk(function ({ directory, packages }) {
        var ps = packages.map((p) => `./${p}`).join(' ')
        extras.get(`npm --prefix ./${directory} uninstall ${ps} --no-save`)
        extras.get(`npm --prefix ./${directory} i ${ps} --no-save`)
        finish(directory)
      })
      break
    case ops.LOG.cmd:
      var logs = []

      walk(function ({ directory }) {
        var res = extras.get(`git -C ./${directory} log`)
        util.parseGitLog(res, directory, function (log) {
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
    case ops.PULL.cmd:
      walk(function ({ directory }) {
        extras.get(`git -C ./${directory} stash`)
        extras.get(`git -C ./${directory} pull --rebase`)
        extras.get(`git -C ./${directory} stash apply`)
        finish(directory)
      })
      break
    case ops.PUSH.cmd:
      var message = await extras.input('Message: ')
      console.log()

      walk(function ({ directory }) {
        extras.get(`git -C ./${directory} add --all`)

        if (!message) {
          var status = extras.get(`git -C ./${directory} status`)
          status = util.parseGitStatus(status)
          message = status.message
        }

        var result = extras.get(`git -C ./${directory} commit -m '${message}'`)
        result = result.split('\n')[1].trim()
        result = result.includes('Your branch is up to date')
          ? '0 file changed'
          : result

        var res = extras.run(`git -C ./${directory} push`, { silent: true })

        var error
        if (res.code) {
          extras.get(`git -C ./${directory} reset HEAD~`)
          error = true
        }

        finish(directory, result, error)
      })
      break
    case ops.STATUS.cmd:
      walk(function ({ directory }, idx) {
        if (idx != 0) console.log()

        var status = extras.get(`git -C ./${directory} status`)
        var { isEmpty, changes } = util.parseGitStatus(status)

        farge.green.log(`${directory}:\n`)
        if (isEmpty) {
          farge.white.log('No changes found.\n')
        } else {
          util.printGitStatus(changes)
        }
      })
      break
    case ops.UPDATE.cmd:
      walk(function ({ directory }) {
        extras.get(`npm --prefix ./${directory} update`)
        finish(directory)
      })
      break
    case ops.UPGRADE.cmd:
      walk(function (d) {
        extras.get(`npx npm-check-updates --cwd ./${d} -u`)
        finish(d)
      })
      break
    default:
      unknownCmd()
  }

  console.log()
  process.exit(0)
}

run()