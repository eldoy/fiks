var extras = require('extras')
var dir = `~/.config/fiks`
var file = `${dir}/apps.json`

var config = {}

function init() {
  if (!extras.exist(file)) {
    extras.run(`mkdir -p ${dir}`)
    extras.write(file, '{}')
    console.log(`Created config file:\n${file}`)
  }
  return (config = extras.read(file))
}

function find(root) {
  var entry
  for (var key in config) {
    var entry = config[key]
    if (entry.root == root) {
      return entry
    }
  }
  return null
}

async function create(root) {
  console.log(`\nSetting not found for:\n${root}\n`)
  var name = root.split('/').reverse()[0]
  var answer = await extras.input(`Your app name: [${name}]`)
  var app = name || answer
  config[app] = { root }
  extras.write(file, JSON.stringify(config))
  return config
}

function root() {
  var root = process.cwd()
  var dirs = root.split('/')
  for (var i = dirs.length; i > 0; i--) {
    var path = dirs.slice(0, i).join('/')
    console.log({ path })
    var entry = find(path)
    console.log({ entry })
    if (entry) return path
  }
  return null
}

module.exports = { init, find, create, root }
