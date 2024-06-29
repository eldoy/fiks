var extras = require('extras')
var printers = require('./printers.js')

async function npmInstallNoSave(item) {
  var command = `cd ${item.dir} && npm install --no-save ${item.paths}`
  printers.npmInstall(extras.get(command))
}

module.exports = { npmInstallNoSave }
