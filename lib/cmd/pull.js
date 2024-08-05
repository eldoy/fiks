module.exports = async function pull({ $, repos }) {
  console.info(`Pulling latest changes...`)
  console.time('fiks :: pull')
  await Promise.all(
    repos.map(async function (repo) {
      var { text } = $(`cd ${repo} && git pull`)
      if (text.includes('Already up to date.')) {
        console.info(`• ${repo} has no changes.`)
      } else {
        console.info(text)
        console.info(`✔ ${repo} successfully pulled.`)
      }
    })
  )
  console.timeEnd('fiks :: pull')
}
