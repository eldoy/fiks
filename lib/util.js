var farge = require('farge')()

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

function getChanges(status) {
  status = status.split('\n')

  var stagedIdx = status.findIndex((str) =>
    str.includes('Changes to be committed')
  )
  var unstagedIdx = status.findIndex((str) =>
    str.includes('Changes not staged for commit')
  )
  var untrackedIdx = status.findIndex((str) => str.includes('Untracked files'))

  var isStaged = stagedIdx != -1
  var isUnstaged = unstagedIdx != -1
  var isUntracked = untrackedIdx != -1

  var stagedFirstIdx = stagedIdx + 2
  var stagedLastIdx = status.length
  if (isUntracked) stagedLastIdx = untrackedIdx
  if (isUnstaged) stagedLastIdx = unstagedIdx
  var staged = isStaged
    ? status
        .slice(stagedFirstIdx, stagedLastIdx)
        .flatMap((s) => s.split('\t'))
        .filter(Boolean)
        .map((s) => s.split(':').map((str) => str.trim()))
    : undefined

  var unstagedFirstIdx = unstagedIdx + 3
  var unstagedLastIdx = status.length
  if (isUntracked) unstagedLastIdx = untrackedIdx
  var unstaged = isUnstaged
    ? status
        .slice(unstagedFirstIdx, unstagedLastIdx)
        .flatMap((s) => s.split('\t'))
        .filter(Boolean)
        .map((s) => s.split(':').map((str) => str.trim()))
    : undefined

  var untracked = isUntracked
    ? status
        .slice(untrackedIdx + 2, status.length)
        .flatMap((s) => s.split('\t'))
        .filter((s) => s && !s.includes('nothing added to commit'))
    : undefined

  return { staged, unstaged, untracked }
}

function parseGitStatus(status) {
  var isEmpty = status.includes('nothing to commit')
  var message
  var changes

  if (!isEmpty) {
    changes = getChanges(status)

    if (changes.tracked?.length > 1) {
      message = `Updated ${changes.tracked.length} files`
    } else if (changes.tracked?.length == 1) {
      var [action, file] = changes.tracked[0]
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

  return { isEmpty, changes, message }
}

function printGitLogs(logs) {
  for (var log of logs) {
    farge.white.log(
      `⚙️  ${log.date.toISOString()} | ` +
        `${log.commit} | ` +
        `${log.repo} | ` +
        `${log.author}: ` +
        `${log.title}`
    )
    console.log()
  }
}

function printGitStatus(changes) {
  var { staged, unstaged, untracked } = changes
  if (staged) {
    farge.green.dim.log('Staged: ')
    farge.white.log(`${staged.map(([, file]) => file).join(', ')}\n`)
  }
  if (unstaged) {
    farge.green.dim.log('Unstaged: ')
    farge.white.log(`${unstaged.map(([, file]) => file).join(', ')}\n`)
  }
  if (untracked) {
    farge.green.dim.log('Untracked: ')
    farge.white.log(`${untracked.join(', ')}\n`)
  }
}

module.exports = {
  parseArgs,
  parseGitLog,
  parseGitStatus,
  printGitLogs,
  printGitStatus
}