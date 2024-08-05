module.exports = async function sync({ $, repos }) {
  console.info(`Syncing from remote...`)

  console.time('fiks :: sync')
  await Promise.all(
    repos.map(async function (repo) {
      var { text } = $(`cd ${repo} && git remote update`)
      console.info(`✔ ${repo} has been synced.`)
    })
  )
  console.timeEnd('fiks :: sync')
}
