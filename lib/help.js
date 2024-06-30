module.exports = function usage() {
  var package = require('../package.json')

  console.log(`\nFiks v${package.version}\n`)
  console.log('Usage:\n')

  var lines = [
    'fiks install - install packages',
    'fiks link - link to local repos',
    'fiks unlink - unlink all repos',
    'fiks linked - display link status',
    'fiks log - display unified log',
    'fiks pull - pull all repos',
    'fiks push - push all repos',
    'fiks reset - reset and clean',
    'fiks status - prints git status',
    'fiks update - update packages',
    'fiks help - display this help message'
  ]
  console.log(`  ${lines.join('\n  ')}`)

  console.log(`\nCreated by Eldøy Projects.\n`)

  process.exit()
}
