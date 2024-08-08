var extras = require('extras')

module.exports = async function pull({ $, repos }) {
  console.time('fiks :: upgrade')

  for (var repo of repos) {
    console.info(`Checking ${repo}`)
    var { text } = $(`cd ${repo} && ncu`)

    if (text.includes('All dependencies match')) {
      console.info(`\n✔ ${repo} is up to date.`)
    } else if (text.startsWith('Checking /')) {
      var output = text.split('\n').slice(2, -2).join('\n')
      console.log(`\n${output}`)
      console.info('\nContinue with update? [y/n]')

      var answer = await extras.input('> ')
      if (answer == 'y') {
        console.info(`Upgrading packages...`)
        $(`cd ${repo} && ncu -u && npm install`)
        console.info(`✔ ${repo} upgraded.`)
      } else {
        console.info(`Skipping ${repo}\n`)
      }
    } else {
      console.info(`Nothing to update, skipping.`)
    }
  }
  console.timeEnd('fiks :: upgrade')
}
