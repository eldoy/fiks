var extras = require('extras')

function npmInstall() {
  await extras.run('npm install')
}

module.exports = { npmInstall }
