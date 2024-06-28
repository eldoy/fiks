var extras = require('extras')
var dir = `~/.config/fiks`
var file = `${dir}/apps.json`

var settings = {}

function init() {
  if (!extras.exist(file)) {
    extras.run(`mkdir -p ${dir}`)
    extras.write(file, '{}')
    console.log(`Created config file:\n${file}`)
  }
  return (settings = extras.read(file))
}

function find(root) {
  var entry
  for (var key in settings) {
    var entry = settings[key]
    if (entry.root == root) {
      return entry
    }
  }
  return null
}

async function create(root) {
  console.log(`Setting not found for:\n${root}`)
  var name = root.split('/').reverse()[0]
  var answer = await extras.input(`What is the app name? [${name}]`)
  var app = name || answer
  settings[app] = { root }
  extras.write(file, JSON.stringify(settings))
  return settings[app]
}

module.exports = { init, find, create }
