function parseArgs(args) {
  var [, , cmd, ...args] = process.argv

  var repos = args.filter((arg) => !arg.startsWith('@'))
  var users = args
    .filter((arg) => arg.startsWith('@'))
    .map((arg) => arg.split('@')[1])

  return { cmd, repos, users }
}

function parseGitLog(string, dir, cb) {
  var log = { repo: dir }
  for (var str of string.split('\n')) {
    if (str.match('^commit [a-zA-Z0-9]{40}$')) {
      log.commit = str.split('commit ')[1]
    } else if (str.match('Author: [a-zA-Z0-9]')) {
      log.author = str.split('Author: ')[1]
    } else if (str.match('Date:   ')) {
      log.date = new Date(str.split('Date:   ')[1])
    } else if (str.trim() !== '' && log.commit && !log.title) {
      log.title = str.trim()
      cb(log)
      log = { repo: dir }
    }
  }
}

function parseGitStatus(status, msg = false) {
  var isEmpty = status.includes('nothing to commit, working tree clean')
  var message

  if (msg && !isEmpty) {
    status = status.split('\n')

    var changesIdx = status.findIndex((str) =>
      str.includes('Changes to be committed')
    )

    var changes = status
      .slice(changesIdx + 2, status.length)
      .flatMap((s) => s.split('\t'))
      .filter(Boolean)
      .map((s) => s.split(':'))

    if (changes.length > 1) {
      message = `Updated ${changes.length} files`
    } else if (changes.length == 1) {
      var action = changes[0][0]
      var file = changes[0][1].trim()
      if (action == 'modified') {
        message = `Updated ${file}`
      } else if (action == 'deleted') {
        message = `Deleted ${file}`
      } else if (action == 'renamed') {
        message = `Renamed ${file.split(' -> ')[0]}`
      } else if (action == 'new file') {
        message = `Created ${file}`
      }
    }
  }

  return { isEmpty, message }
}

function printGitLogs(logs) {
  for (var log of logs) {
    console.log(
      `* ${log.date.toISOString()} | ` +
        `${log.commit} | ` +
        `${log.repo} | ` +
        `${log.author}: ` +
        `${log.title}`
    )
  }
}

module.exports = { parseArgs, parseGitLog, parseGitStatus, printGitLogs }
