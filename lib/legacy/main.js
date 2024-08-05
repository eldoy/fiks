var settings = require('./settings.js')
var struct = require('./struct.js')
var args = require('./args')
var functions = require('./functions.js')

global.J = function (obj) {
  console.log(JSON.stringify(obj, null, 2))
}

module.exports = async function main() {
  var config = settings.init()
  var root = settings.root()

  if (!root) {
    root = process.cwd()
    config = await settings.create(root)
  }

  process.chdir(root)

  var { cmd, repos, users } = args.parse()

  var list = struct.load(root, repos)

  // TODO: Do we need this?
  // var setting = settings.find(root)

  // Uncomment for testing:
  // console.log({ cmd, repos, users })
  // console.log(config)
  // console.log(JSON.stringify(list, null, 2))

  // list.map((x) => console.log((x.deps || []).map((y) => y.linked)))

  var fn = functions[cmd || 'help']
  if (fn) {
    await fn({ config, root, list, cmd, repos, users })
  } else {
    console.log(`Command not found.`)
  }
}
