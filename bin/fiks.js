#!/usr/bin/env node
var extras = require('extras')
var terminal = require('xecutor')
var farge = require('farge')()
var commands = {
  sync: require('../lib/cmd/sync.js'),
  status: require('../lib/cmd/status.js'),
  pull: require('../lib/cmd/pull.js'),
  link: require('../lib/cmd/link.js'),
  update: require('../lib/cmd/update.js'),
  upgrade: require('../lib/cmd/upgrade.js'),
  help: require('../lib/cmd/help.js')
}

var SYMBOLS = { ok: '✔', no: '✖' }
var COMMANDS = Object.keys(commands)

global.J = function (obj) {
  console.log(JSON.stringify(obj, null, 2))
}

function pad(text) {
  return text
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
}

async function main() {
  var root = process.cwd()

  try {
    var workspace = extras.read('./workspace.yml')
  } catch {
    console.info('No workspace.yml file found.')
    process.exit()
  }
  // console.log(J(workspace))

  var repos = workspace.repos || []
  if (!repos.length) {
    console.info('Repos are empty. Add them to you workspace file.')
    process.exit()
  }

  var struct = require('../lib/struct.js').load(root, workspace.repos)
  // console.log(J(struct))

  var { $ } = new terminal()

  var command = process.argv[2]

  if (!command) {
    console.info(`Command missing. Run "fiks help" for usage.`)
    process.exit()
  }

  if (!COMMANDS.includes(command)) {
    console.info(`Invalid command: status\n`)
    console.info(`Must be one of:`)
    console.info(COMMANDS.map((x) => `  ${x}`).join('\n'))
    process.exit()
  }

  await commands[command]({ $, repos, struct })

  process.exit()
}
main()
