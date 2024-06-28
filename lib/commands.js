var extras = require('extras')

function npmInstallNoSave(dir, repo) {
  extras.run(`npm --prefix ${dir} install --no-save ../${repo}`)
}

module.exports = { npmInstallNoSave }
