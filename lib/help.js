module.exports = function usage() {
  var package = require('../package.json')

  console.log(`\nFiks v${package.version}\n`)
  console.log('Usage:\n')

  var lines = [
    'fiks help - display this help message'
    // 'fiks init - sets up current directory as a fiks root directory',
    // 'fiks diff - shows diffs in all repos',
    // 'fiks install - install packages in all repos',
    // 'fiks link - link all repos with npm i --no-save',
    // 'fiks log - see a unified log of all repos, sorted by last change',
    // 'fiks pull - pull all repos, stashes and reapplies uncommited changes',
    // 'fiks pull repo1 repo2 - pull specified repos, stashes and reapplies uncommited changes',
    // 'fiks push - push all repos at once (ask for commit message for each repo)',
    // 'fiks push "commit message" - push all repos at once with the same commit message',
    // 'fiks reset - resets and cleans all repos at once',
    // 'fiks status - prints which directories have unpushed changes',
    // 'fiks update - update all packages in all repos'
  ]
  console.log(`  ${lines.join('\n  ')}`)

  console.log(`\nCreated by Eldøy Projects.\n`)

  process.exit()
}
