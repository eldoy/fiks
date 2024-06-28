var extras = require('extras')
var settings = require('./settings.js')

function getPackageData(repo, package = {}) {
  var sections = [
    { deps: package.dependencies || {}, dev: false },
    { deps: package.devDependencides || {}, dev: true }
  ]

  var nmdir = `${repo}/node_modules`
  var hasNodeModules = extras.exist(nmdir)

  var deps = []
  for (var section of sections) {
    for (var name in section.deps) {
      var version = section.deps[name] || '0.1.0'
      var obj = {
        name,
        version,
        source: version.startsWith('git') ? 'git' : 'npm',
        installed: false,
        linked: false,
        dev: section.dev
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

function load(root) {
  var repos = settings.repos().map((name) => `${root}/${name}`)

  var struct = []
  for (var repo of repos) {
    var p = `${repo}/package.json`

    if (extras.exist(p)) {
      var package = require(p)

      var deps = getPackageData(repo, package)

      var item = {
        name: package.name || '',
        root: repo,
        dir: repo.split('/').reverse()[0],
        deps
      }

      struct.push(item)
    }
  }

  // Add dir and root to all deps
  for (var entry of struct) {
    for (var dep of entry.deps) {
      if (dep.source == 'git') {
        var item = struct.find((x) => x.name == dep.name)
        if (item) {
          dep.dir = item.dir
          dep.root = item.root
        }
      }
    }
  }

  return struct
}

module.exports = { load }
