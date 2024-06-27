#!/usr/bin/env node

var extras = require('extras')
var util = require('../lib/util.js')
var package = require('../package.json')

var LOG_SIZE = 10

var { cmd, repos, users } = util.parseArgs(process.argv)
var { cwd, root, dir } = util.parseDir()

if (!root && cmd != 'init') {
  console.log()
  console.error(
    "⚠️  Root directory not found. Please run 'fiks init' at your root directory."
  )
  console.log()
  process.exit(0)
}

var ops = {
  INIT: { cmd: 'init', start: 'Initializing fiks', finish: '' },
  DIFF: { cmd: 'diff', start: 'Getting repositories diffs', finish: '' },
  INSTALL: {
    cmd: 'install',
    start: 'Installing repositories',
    finish: 'Installed'
  },
  LINK: { cmd: 'link', start: 'Linking repositories', finish: 'Linked' },
  LOG: { cmd: 'log', start: 'Logging repositories', finish: 'Logged' },
  PULL: { cmd: 'pull', start: 'Pulling repositories', finish: 'Pulled' },
  PUSH: { cmd: 'push', start: 'Pushing repositories', finish: 'Pushed' },
  RESET: { cmd: 'reset', start: 'Resetting repositories', finish: 'Reset' },
  STATUS: { cmd: 'status', start: 'Getting repositories status', finish: '' },
  UPDATE: { cmd: 'update', start: 'Updating repositories', finish: 'Updated' }
}

function usage() {
  console.log(`\nFiks version ${package.version}\n`)
  console.log('Usage:')
  console.log(`
  fiks init - sets up current directory as a fiks root directory
  fiks diff - shows diffs in all repos
  fiks install - install packages in all repos
  fiks link - link all repos with npm i --no-save
  fiks log - see a unified log of all repos, sorted by last change
  fiks pull - pull all repos, stashes and reapplies uncommited changes
  fiks pull repo1 repo2 - pull specified repos, stashes and reapplies uncommited changes
  fiks push - push all repos at once (ask for commit message for each repo)
  fiks push "commit message" - push all repos at once with the same commit message
  fiks reset - resets and cleans all repos at once
  fiks status - prints which directories have unpushed changes
  fiks update - update all packages in all repos
  `)

  process.exit()
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

var invalid = repos.filter((repo) => !dir.map((d) => d.alias).includes(repo))
if (invalid.length) {
  console.error(`Invalid repos: ${invalid.join(', ')}`)
  process.exit(0)
}

function walk(cb) {
  var directories = repos.length
    ? dir.filter(({ alias }) => repos.includes(alias))
    : dir

  var idx = 0
  for (var directory of directories) {
    var packages = dir.filter((d) => directory.deps.includes(d.name))
    try {
      cb({ directory: directory.alias, packages }, idx)
      idx++
    } catch (err) {
      console.error(`❌ ${root}/${directory.alias}: ${err}`)
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
    act = ops[cmd.toUpperCase()].finish
  }

  console.log(`${symbol} ${act}: `)
  console.log(`${root}/${d}`)
  extra && console.log(` - ${extra}`)
  console.log()
}

function start() {
  // console.log('\n🌲 Root: ')
  // console.log(`${cwd}\n`)
  // var rep = repos.length ? repos : dir.map((d) => d.alias)
  // console.log('🍃 Repositories: ')
  // console.log(`${rep.join(', ')}\n`)
  // var op = ops[cmd.toUpperCase()]
  // console.log(`\n🔥 ${op.start} 🔥\n\n`)
}

async function run() {
  cmd != ops.INIT.cmd && start()

  switch (cmd) {
    case ops.INIT.cmd:
      try {
        extras.write('./.fiks.json', {})
        console.log('\n✅ Fiks successfully initialized.')
      } catch (err) {
        console.error('❌ Fiks failed to initialize.', err)
      }
      break
    case ops.DIFF.cmd:
      walk(function ({ directory }, idx) {
        if (idx != 0) console.log()

        var diff = extras.get(`git -C ${cwd}/${directory} diff`)

        console.log(`✅ ${root}/${directory}:\n`)
        if (!diff) {
          console.log('⚠️  No diffs found.\n')
        } else {
          diff = util.parseGitDiff(diff)
          util.printGitDiff(diff)
        }
      })
      break
    case ops.INSTALL.cmd:
      walk(function ({ directory }) {
        extras.get(`npm --prefix ${cwd}/${directory} i`)
        finish(directory)
      })
      break
    case ops.LINK.cmd:
      walk(function ({ directory, packages }) {
        var links = packages.map((p) => `${cwd}/${p.alias}`).join(' ')
        extras.get(`npm --prefix ${cwd}/${directory} i ${links} --no-save`)
        finish(directory)
      })
      break
    case ops.LOG.cmd:
      var logs = []

      walk(function ({ directory }) {
        var res = extras.get(`git -C ${cwd}/${directory} log`)
        util.parseGitLog(res, directory, function (log) {
          var author = log.author?.toLowerCase()
          var isUserMatch = users
            .map((user) => author?.includes(user.toLowerCase()))
            .reduce((a, b) => a || b, false)

          if (!users.length || isUserMatch) {
            logs.push(log)
          }
        })
      })

      logs = logs.sort((a, b) => b.date - a.date).slice(0, LOG_SIZE)

      if (!logs.length) {
        console.log('⚠️  No logs found.')
      } else {
        util.printGitLogs(logs)
      }

      break
    case ops.PULL.cmd:
      walk(function ({ directory }) {
        var result = extras.get(`git -C ${cwd}/${directory} stash`)
        var stashed = result.includes('Saved working directory')

        result = extras.run(`git -C ${cwd}/${directory} pull --rebase`, {
          silent: true
        })

        stashed && extras.get(`git -C ${cwd}/${directory} stash apply`)

        var { msg, files } = util.parseGitPull(result, cwd, directory)

        if (files?.includes('package.json')) {
          extras.get(`npm --prefix ${cwd}/${directory} i`)
        }

        finish(directory, msg)
      })
      break
    case ops.PUSH.cmd:
      var message = await extras.input('Message: ')
      console.log()

      walk(function ({ directory }) {
        extras.get(`git -C ${cwd}/${directory} add --all`)

        if (!message) {
          var status = extras.get(`git -C ${cwd}/${directory} status`)
          status = util.parseGitStatus(status)
          message = status.message
        }

        var result = extras.get(
          `git -C ${cwd}/${directory} commit -m '${message}'`
        )
        result = result.split('\n')[1].trim()
        result = result.includes('Your branch is up to date')
          ? '0 file changed'
          : result

        var res = extras.run(`git -C ${cwd}/${directory} push`, {
          silent: true
        })

        var error
        if (res.code) {
          extras.get(`git -C ${cwd}/${directory} reset HEAD~`)
          error = true
        }

        finish(directory, result, error)
      })
      break
    case ops.STATUS.cmd:
      walk(function ({ directory }, idx) {
        var status = extras.get(`git -C ${cwd}/${directory} status`)
        var { isEmpty, changes } = util.parseGitStatus(status)

        if (!isEmpty) {
          console.log(`✅ ${root}/${directory}:\n`)
          util.printGitStatus(changes)
        }
      })
      break
    case ops.RESET.cmd:
      await extras.input(
        'All changes including stashes will be lost. Hit enter to continue.\n'
      )
      walk(function ({ directory }) {
        extras.get(`git -C ${cwd}/${directory} reset --hard`)
        extras.get(`git -C ${cwd}/${directory} clean -df`)
        extras.get(`git -C ${cwd}/${directory} stash clear`)
        finish(directory)
      })
      break
    case ops.UPDATE.cmd:
      walk(function ({ directory }) {
        extras.get(
          `npx npm-check-updates --cwd ${cwd}/${directory} -u && npm --prefix ${cwd}/${directory} i`
        )
        finish(directory)
      })
      break
    default:
      unknownCmd()
  }

  console.log()
  process.exit(0)
}

run()
