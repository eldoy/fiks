module.exports = async function pull({ $, repos }) {
  console.info(`Resetting repos...`)
  console.time('fiks :: pull')
  await Promise.all(
    repos.map(async function (repo) {
      var { text } = $(`cd ${repo} && git clean -df && git reset --hard`)
      console.info(text)
      console.info(`✔ ${repo} was reset.`)
    })
  )
  console.timeEnd('fiks :: pull')
}
