var extras = require('extras')
var help = require('./help.js')
var commands = require('./commands.js')

async function link({ repos, root, list }) {
  console.log('Linking repos...')
  // J({ repos, root, entry, list })

  console.time('fiks :: link')

  // Sync instead of parallel
  // for (var item of list) {
  //   // J(item.name)
  //   var paths = item.deps
  //     .filter((d) => d.root)
  //     .map((d) => d.root)
  //     .join(' ')

  //   if (paths) {
  //     var command = `cd ${item.dir} && npm install --no-save ${paths}`
  //     var output = extras.get(command)
  //     console.log(output)
  //   }
  // }

  // for (var item of list) {
  //   // J(item.name)
  //   for (var d of item.deps) {
  //     if (d.root) {
  //       console.log(item.name, d.name)
  //       console.log(d.root)
  //       console.log(d.linked)
  //       console.log(root)
  //       // var command = `cd ${item.dir} && npm install --no-save ${d.root}`
  //       // console.log(command)
  //       // var output = extras.get(command)
  //       // console.log(output)
  //     }
  //   }
  // }

  await Promise.all(
    list.map(async function (item) {
      var paths = item.deps
        .filter((d) => d.root)
        .map((d) => d.root)
        .join(' ')

      if (paths) {
        var command = `cd ${item.dir} && npm install --no-save ${paths}`
        var output = extras.get(command)
        console.log(output)
      }
    })
  )
  console.timeEnd('fiks :: link')
}

module.exports = { link, help }
