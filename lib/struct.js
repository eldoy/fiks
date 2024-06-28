var extras = require('extras')
var exclude = ['node_modules']

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
  var dirs = extras
    .dir(root)
    .filter((f) => !f.startsWith('.') && !exclude.includes(f))
    .map((f) => `${root}/${f}`)
    .filter((f) => extras.isDir(f))

  var struct = []
  for (var dir of dirs) {
    var p = `${dir}/package.json`

    if (extras.exist(p)) {
      var package = require(p)

      var deps = getPackageData(dir, package.dependencies)
      var devdeps = getPackageData(dir, package.devDependencies)

      var item = {
        name: package.name || '',
        root: dir,
        dir: dir.split('/').reverse()[0],
        deps,
        devdeps
      }

      struct.push(item)
    }
  }
  return struct
}

module.exports = { load }
