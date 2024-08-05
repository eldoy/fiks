function gitlog(item, input) {
  var lines = input
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)

  var slices = []

  var i = -1
  for (var line of lines) {
    if (line.startsWith('commit')) i++
    if (!slices[i]) slices[i] = []
    slices[i].push(line)
  }

  var logs = []
  for (var slice of slices) {
    var log = { repo: item.name }
    for (var line of slice) {
      if (line.startsWith('commit')) {
        log.commit = line.split(' ')[1].trim()
      } else if (line.startsWith('Author:')) {
        log.author = line.split('Author:')[1].trim()
      } else if (line.startsWith('Merge:')) {
        log.merge = line.split('Merge:')[1].trim()
      } else if (line.startsWith('Date:')) {
        log.date = new Date(line.split('Date:')[1].trim())
      } else {
        log.message = line.trim()
      }
    }

    logs.push(log)
  }
  return logs
}

module.exports = { gitlog }
