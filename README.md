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

Fiks has a very intuitive command line interface. Run the `fiks` command from the root of your application:

```
# Print which directories have changes we haven't pushed
fiks status

# Push all repositories at once
# Will ask for commit message for each of them
fiks push

# Push all repositories at once with the same commit message
fiks push "commit message"

# Pull all repositories, stash first if you already have changes
fiks pull

# Pull specified repositories, stash first if you already have changes
fiks pull db data

# See a unified log of all repositories, sorted by last change
fiks log
```

MIT Licensed. Enjoy!

Created by [Eldøy Projects](https://eldoy.com)
