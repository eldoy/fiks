module.exports = async function link({ $, repos, struct }) {
  console.info(`Linking local repositories...`)

  console.time('fiks :: link')
  await Promise.all(
    repos.map(async function (repo) {
      var item = struct.find((x) => x.dir == repo)
      if (!item) {
        return console.info(`• ${repo} doesn't need linking.`)
      }

      if (!item.linked) {
        var linkPaths = item.deps
          .filter((d) => d.local)
          .map((d) => d.root)
          .join(' ')

        var { code, text } = $(
          `cd ${repo} && npm install --no-save ${linkPaths}`
        )
        if (code != 0) {
          console.info(`✖ linking ${repo} failed:`)
          return console.error(text)
        }
      }

      console.info(`✔ ${repo} has been linked.`)
    })
  )
  console.timeEnd('fiks :: link')
}
