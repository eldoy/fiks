#!/usr/bin/env node

var extras = require('extras')

var [, , cmd, ...repos] = process.argv

var cwd = process.cwd()
var root = cwd.split('/').at(-1)
var dir = extras.dir().filter((d) => !d.includes('.'))

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

if (!cmd) usage()

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

function finish(d) {
  var str = cmd.charAt(cmd.length - 1) == 'e' ? `${cmd}d` : `${cmd}ed`
  var msg = str.charAt(0).toUpperCase() + str.slice(1)
  console.log(`* ${msg}: ${root}/${d}`)
}

switch (cmd) {
  case 'link':
    walk(function (d, packages) {
      var ps = packages.map((p) => `./${p}`).join(' ')
      extras.get(`npm --prefix ./${d} uninstall ${ps} --no-save`)
      extras.get(`npm --prefix ./${d} i ${ps} --no-save`)
      finish(d)
    })
    break
  case 'install':
    walk(function (d, packages) {
      var ps = packages.map((p) => `./${p}`).join(' ')
      extras.get(`npm --prefix ./${d} uninstall ${ps} --no-save`)
      extras.get(`npm --prefix ./${d} i`)
      finish(d)
    })
    break
  case 'update':
    walk(function (d) {
      extras.get(`npm --prefix ./${d} update`)
      finish(d)
    })
    break
  case 'upgrade':
    walk(function (d) {
      extras.get(`npx npm-check-updates --cwd ./${d} -u`)
      finish(d)
    })
    break
  case 'status':
    var result = []
    walk(function (d) {
      var status = extras.get(`git -C ./${d} status`)
      var isEmpty = status.includes('nothing to commit, working tree clean')
      if (!isEmpty) result.push(d)
    })
    console.log(result)
    break
  case 'push':
    break
  case 'pull':
    walk(function (d) {
      extras.get(`git -C ./${d} stash`)
      extras.get(`git -C ./${d} pull`)
      finish(d)
    })
    break
  case 'log':
    break
  default:
    console.log(`\nUnknown command: ${cmd}\n`)
    usage()
}

process.exit(0)
