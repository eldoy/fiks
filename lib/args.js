function parse() {
  var [, , cmd, ...args] = process.argv

  var repos = []
  var users = []

  for (var arg of args) {
    if (arg.startsWith('@')) {
      users.push(arg.slice(1))
    } else {
      repos.push(arg)
    }
  }

  return { cmd, repos, users }
}

module.exports = { parse }
