var extras = require('extras')

function parseArgs(args) {
  var [, , cmd, ...args] = process.argv

  var repos = args.filter((arg) => !arg.startsWith('@'))
  var users = args
    .filter((arg) => arg.startsWith('@'))
    .map((arg) => arg.split('@')[1])

  return { cmd, repos, users }
}

function parseDir() {
  var root
  var dir = []

  var cwd = process.cwd().split('/')
  if (cwd[0] === '') {
    cwd[1] = '/' + cwd[1]
    cwd = cwd.slice(1, cwd.length)
  }

  for (var idx = 0; idx < cwd.length; idx++) {
    var path = cwd.slice(0, cwd.length - idx).join('/')
    var contents = extras.dir(path)
    if (!root && contents.includes('.fiks.json')) {
      root = path
      for (var content of contents) {
        var filePath = path + '/' + content + '/package.json'
        if (extras.exist(filePath)) {
          var { name, dependencies, devDependencies } = extras.read(filePath)
          var deps = [
            ...new Set(Object.keys({ ...dependencies, ...devDependencies }))
          ]
          dir.push({ alias: content, name, deps })
        }
      }
    }
  }

  return {
    cwd: root,
    root: root?.split('/').at(-1),
    dir
  }
}

function parseGitDiff(str) {
  var arr = str.split('\n')

  var diffs = []
  var diff = []

  var idx = 0
  for (var s of arr) {
    if (idx != 0 && s.includes('diff --git')) {
      diffs.push(diff)
      diff = [s]
    } else {
      diff.push(s)
    }

    idx++
    if (idx == arr.length) {
      diffs.push(diff)
    }
  }

  return diffs
}

function parseGitLogs(str, directory) {
  var logs = []
  parseGitLog(str, directory, function (log) {
    logs.push(log)
  })
  return logs
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

function parseGitPull(result, cwd, directory) {
  var { stdout, stderr } = result

  var output
  var msg
  var files

  if (stderr) {
    msg = '⚠️  ' + stderr
  }

  if (stdout) {
    output = stdout.split('\n').filter(Boolean)
    if (output.includes('Already up to date.')) {
      msg = ''
    } else {
      var update = output.find((s) => s.includes('Updating'))
      var range = update?.split(' ')[1]
      files = output
        .slice(2, output.length - 1)
        .map((s) => s.split('|')[0].trim())
      var res = output.at(-1).trim()

      if (res.includes('Merge conflict')) {
        msg = '⚠️  ' + res.split(': ')[1]
      }
    }
  }

  if (range) {
    var logs = extras.get(`git -C ${cwd}/${directory} log ${range}`)
    var authors = [
      ...new Set(
        parseGitLogs(logs, directory).map(({ author }) => author?.split(' ')[0])
      )
    ]

    if (authors.length) {
      if (authors.length > 1) {
        authors =
          authors.slice(0, authors.length - 1).join(', ') +
          ' and ' +
          authors.at(-1)
      } else {
        authors = authors[0]
      }

      var [changed, insertions, deletions] = res.split(',').map((s) => s.trim())

      changed = changed?.split(' ')[0]
      insertions = insertions?.split(' ')[0]
      deletions = deletions?.split(' ')[0]

      msg = `${authors} changed ${changed} files, +${insertions} lines added, -${deletions} lines deleted.\n${files
        .map((f) => `   - ${f}`)
        .join('\n')}`
    }
  }

  if (msg?.endsWith('\n')) msg = msg.slice(0, msg.length - 2)

  return { msg, files }
}

function getChanges(status) {
  function sanitize(str) {
    return (
      !!str &&
      !str.includes('nothing added to commit') &&
      !str.includes('no changes added to commit')
    )
  }

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
        .filter(sanitize)
        .map((s) => s.split(':').map((str) => str.trim()))
    : undefined

  var unstagedFirstIdx = unstagedIdx + 3
  var unstagedLastIdx = status.length
  if (isUntracked) unstagedLastIdx = untrackedIdx
  var unstaged = isUnstaged
    ? status
        .slice(unstagedFirstIdx, unstagedLastIdx)
        .flatMap((s) => s.split('\t'))
        .filter(sanitize)
        .map((s) => s.split(':').map((str) => str.trim()))
    : undefined

  var untracked = isUntracked
    ? status
        .slice(untrackedIdx + 2, status.length)
        .flatMap((s) => s.split('\t'))
        .filter(sanitize)
    : undefined

  return { staged, unstaged, untracked }
}

function parseGitStatus(status) {
  var isEmpty = status.includes('nothing to commit')
  var message
  var changes

  if (!isEmpty) {
    changes = getChanges(status)

    var { staged = [], unstaged = [] } = changes
    var tracked = staged.concat(unstaged)
    if (tracked.length > 1) {
      message = `Updated ${tracked.length} files`
    } else if (tracked?.length == 1) {
      var [action, file] = tracked[0]
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

function printGitDiff(diffs) {
  for (var diff of diffs) {
    diff = diff.slice(2, diff.length)

    for (var str of diff) {
      console.log(`${str}`)
    }
  }
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

function printGitStatus(changes) {
  var { staged, unstaged, untracked } = changes
  if (staged) {
    console.log('Staged: ')
    console.log(`  ${staged.map(([, file]) => file).join(', ')}`)
  }
  if (unstaged) {
    console.log('Unstaged: ')
    console.log(`  ${unstaged.map(([, file]) => file).join(', ')}`)
  }
  if (untracked) {
    console.log('Untracked: ')
    console.log(`  ${untracked.join(', ')}`)
  }
}

module.exports = {
  parseArgs,
  parseDir,
  parseGitDiff,
  parseGitLog,
  parseGitPull,
  parseGitStatus,
  printGitDiff,
  printGitLogs,
  printGitStatus
}
