var extras = require('extras')
var settings = require('./settings.js')

function getPackageData(path, package = {}) {
  var fields = [
    { deps: package.dependencies || {}, dev: false },
    { deps: package.devDependencides || {}, dev: true }
  ]

  var nmdir = `${path}/node_modules`
  var hasNodeModules = extras.exist(nmdir)

  var deps = []
  for (var field of fields) {
    for (var name in field.deps) {
      var version = field.deps[name] || '0.1.0'
      var obj = {
        name,
        version,
        source: version.startsWith('git') ? 'git' : 'npm',
        installed: false,
        linked: false,
        dev: field.dev
      }

      if (hasNodeModules) {
        var file = `${nmdir}/${name}`
        obj.installed = extras.isDir(file)
        obj.linked = extras.isSymlink(file)
      }

      deps.push(obj)
    }
  }
  return deps
}

function load(root, repos) {
  var paths = repos.map((name) => `${root}/${name}`)

  var struct = []
  for (var path of paths) {
    var p = `${path}/package.json`

    if (extras.exist(p)) {
      var package = require(p)

      var deps = getPackageData(path, package)

      var item = {
        name: package.name || '',
        root: path,
        dir: path.split('/').reverse()[0],
        deps
      }

      struct.push(item)
    }
  }

  // Add dir and root to all deps
  for (var item of struct) {
    for (var dep of item.deps) {
      if (dep.source == 'git') {
        var other = struct.find((x) => x.name == dep.name)
        if (other) {
          dep.local = true
          dep.dir = other.dir
          dep.root = other.root
        }
      }
    }

    // Indicate if item is local
    item.local = item.deps.some((d) => d.local)
  }

  return struct
}

module.exports = { load }
