var extras = require('extras')
var dir = `~/.config/fiks`
var file = `${dir}/apps.json`

var config = {}
var _root = null

function init() {
  if (!extras.exist(file)) {
    extras.run(`mkdir -p ${dir}`)
    extras.write(file, '{}')
    console.log(`Created config file:\n${file}`)
  }
  return (config = extras.read(file))
}

function root() {
  var path = process.cwd()
  var dirs = path.split('/')
  for (var i = dirs.length; i > 0; i--) {
    var path = dirs.slice(0, i).join('/')
    var entry = find(path)
    if (entry) {
      return (_root = path)
    }
  }
  return null
}

function find(path) {
  var entry
  for (var key in config) {
    var entry = config[key]
    if (entry.root == path) {
      return entry
    }
  }
  return null
}

async function create(path) {
  console.log(`\nConfig not found for:\n${path}\n`)
  var name = path.split('/').reverse()[0]
  var answer = await extras.input(`App name: [${name}]`)
  var app = name || answer
  config[app] = { root: path }
  extras.write(file, JSON.stringify(config, null, 2))
  return config
}

function repos() {
  var path = _root || root()
  var exclude = ['node_modules']
  return extras
    .dir(path)
    .filter((f) => !f.startsWith('.') && !exclude.includes(f))
    .map((f) => `${path}/${f}`)
    .filter((f) => extras.isDir(f))
    .map((f) => f.split('/').reverse()[0])
}

module.exports = { init, root, find, create, repos }
