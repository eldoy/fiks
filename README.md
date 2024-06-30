# Fiks

Repo management tool. Take control over your multi-repo project with this command line tool.

### Why?

Given the following directory structure:

```
data
db
integrations
schema
scripts
site
```

where all the directories are separate code repositories which is part of the same app.

You share the code locally using `npm i --no-save` in each one, but it's too easy to forget to push changes, and it's too difficult to check the status of all of them at once.

This is where `fiks` can help you!

### Install

Install the `fiks` command globally:

```
npm i -g fiks
```

### Usage

Run `fiks` from the root of your application:

```
fiks install - install packages
fiks link - link to local repos
fiks unlink - unlink all repos
fiks linked - display link status
fiks log - display unified log
fiks pull - pull all repos
fiks push - push all repos
fiks reset - reset and clean
fiks status - prints git status
fiks update - update packages
fiks help - display this help message
```

MIT Licensed. Enjoy!

Created by [Eldøy Projects](https://eldoy.com)
