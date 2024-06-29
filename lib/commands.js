var extras = require('extras')

async function npmInstallNoSave(item) {
  var command = `cd ${item.dir} && npm install --no-save ${item.paths}`
  var output = extras.get(command)
  console.log(output)
}

module.exports = { npmInstallNoSave }
