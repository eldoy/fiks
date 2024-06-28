var extras = require('extras')
var settings = require('./settings.js')

function getPackageData(dir, deps = {}) {
  var nmdir = `${dir}/node_modules`
  var hasNodeModules = extras.exist(nmdir)

  var dependencies = []
  for (var name in deps) {
    var version = deps[name] || '0.1.0'
    var obj = {
      name,
      version,
      source: version.startsWith('git') ? 'git' : 'npm',
      installed: false,
      linked: false
    }

    if (hasNodeModules) {
      var file = `${nmdir}/${name}`
      obj.installed = extras.isDir(file)
      obj.linked = extras.isSymlink(file)
    }

    dependencies.push(obj)
  }
  return dependencies
}

function load(root) {
  var repos = settings.repos().map((name) => `${root}/${name}`)

  var struct = []
  for (var repo of repos) {
    var p = `${repo}/package.json`

    if (extras.exist(p)) {
      var package = require(p)

      var deps = getPackageData(repo, package.dependencies)
      var devdeps = getPackageData(repo, package.devDependencies)

      var item = {
        name: package.name || '',
        root: repo,
        dir: repo.split('/').reverse()[0],
        deps,
        devdeps
      }

      struct.push(item)
    }
  }
  return struct
}

module.exports = { load }
