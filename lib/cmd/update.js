module.exports = async function update({ $, repos, struct }) {
  console.info(`Updating local packages...`)

  console.time('fiks :: update')
  await Promise.all(
    repos.map(async function (repo) {
      var item = struct.find((x) => x.dir == repo)
      if (!item) {
        return console.info(`• ${repo} doesn't need updating.`)
      }

      if (!item.deps || !item.deps.length) {
        return console.info(`• ${repo} doesn't have any dependencies.`)
      }

      var localDeps = item.deps.filter((d) => d.local)
      if (!localDeps.length) {
        return console.info(`• ${repo} doesn't have any local dependencies.`)
      }

      var linkPaths = localDeps.map((d) => d.name).join(' ')

      var { code, text } = $(`cd ${repo} && npm update ${linkPaths}`)
      if (code != 0) {
        console.info(`✖ updating ${repo} failed:`)
        return console.error(text)
      }

      if (text.includes('up to date')) {
        return console.info(`• ${repo} is up to date already.`)
      }

      var { code, text } = $(
        `cd ${repo} && git add --all && git commit -m "Upgrade packages" && git push`
      )

      var names = localDeps.map((x) => `${x.name}`).join(',')
      console.info(`✔ ${repo} updated ${names}`)
    })
  )
  console.timeEnd('fiks :: update')
}
