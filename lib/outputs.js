function time(date) {
  var d = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h24'
  }).format(date)

  return d
}

function std(output) {
  console.info(output)
}

function gitLog(logs) {
  var repos = [...new Set(logs.map((x) => x.repo))]

  for (var repo of repos) {
    var items = logs.filter((x) => x.repo == repo)
    console.info(`\n${repo}`)
    for (var item of items) {
      console.info(`  commit: ${item.commit}`)
      console.info(`  author: ${item.author}`)
      console.info(`  date: ${time(item.date)}`)
      console.info(`\n  * ${item.message}\n`)
    }
  }
}

function gitStatus(item, output) {
  if (!output.includes('nothing to commit')) {
    console.info(`\n${item.name}`)
    console.info(output)
  }
}

module.exports = { std, gitLog, gitStatus }
