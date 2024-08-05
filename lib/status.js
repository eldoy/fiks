module.exports = async function status({ $, repos }) {
  console.info(`Checking status...`)
  console.time('fiks :: status')
  await Promise.all(
    repos.map(async function (repo) {
      var { text } = $(`cd ${repo} && git status`)
      if (text.includes('working tree clean')) {
        console.info(`✔ ${repo} is pristine.`)
      } else {
        console.info(`✖ ${repo} has changes:`)
        console.info(text)
      }
    })
  )
  console.timeEnd('fiks :: status')
}
