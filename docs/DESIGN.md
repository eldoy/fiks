The main point of fix is to keep local repos linked. Everything should be controllable from the root directory:

- git commands
- package scripts
- command line tools like "ls"

It should be interactive when needed.

The command is always `fiks <command>`

Syntax: fiks <command> -r <repos?> -u <users?>

Example: fiks push -r admin hello -u andre vidar

Options:
  -r specify the repos to affect
  -u specify the users to match for commands that support it

If -r <repos> is not included, it means all repos one by one

-u <users> is only for certain commands like fiks log

### Flow 1: Check status, commit and push

fiks status

  2 repos have changes
  - admin
  - site

fiks status admin
  (prints minimal git status)

fiks commit admin site
  (with error handling)
  Message:
  ! message cannot be empty

  Message: chorf: upgrade packages
  ! prefix must be one of
    - chore
    - docs
    - feature
  Message: chore: upgrade packages
  (commits with given message)

fiks push admin
  (will push admin)

fiks push
  (will push all repos with pending commits)

  2 repos will be pushed:
  - admin
  - site

  Continue? [ENTER]

fiks push

  Nothing to push.

fiks commit

  Nothing to commit.

fiks status

  All repos are up to date.

NOTES:

fiks commit takes a message. It must be prefixed with one of the following to be accepted:

feat: A new feature
fix: A bug fix
docs: Documentation only changes
style: Changes that don't affect the meaning of the code (white space, formatting, missing semi-colons, etc)
refactor: A code change that neither fixes a bug or adds a feature
perf: A code change that improves performance
test: Adding missing tests
chore: Changes to the build process or auxilliary tools and libraries such as documentation generation
upgrade: Upgrade packages

The prefix is the basis of the changelog, which can be accessed through `fiks changes` or `fiks changelog`


### Flow 2: Install packages

fiks install
(installs the latest versions of all packages)

fiks install mongowave
(installs mongowave where it's needed)

Installing packages means we have to re-link as well.

### Flow 3; Update packages

fiks update
(updates all packages to latest versions)

admin:
  mongowave 1.2 > 1.4
  firmalisten-build > @latest
site:
  mongowave 1.2 > 1.4

Continue? [ENTER]

fiks update mongowave
(updates all packages that depend on it)

2 repos depend on this:
- admin (mongowave 1.2)
- site (mongowave 1.0)

You are updating to version 1.4

Continue [ENTER]

fiks update mongowave -r admin

admin:
  mongowave 1.2 > 1.4
  firmalisten-build > @latest

Continue? [ENTER]

Updating packages means we have to re-link as well.


# Flow 4: Pull changes

fiks pull
(pulls latest changes)

If package.json has changed, we do fiks install and re-link.

fiks pull

  Nothing to pull.

fiks pull

  admin:
    5 files changed, +500 additions, -304 deletions
    done.

  site:
    4 files changed, +500 additions, -304 deletions
    installing packages...
    done.

# Flow 5: Run scripts and commands

fiks run test
(runs npm run test in every repo if it exists)

fiks run test -r admin
(run npm run test in admin)

fiks run "ls -la"
(run the command in all repos)

fiks run "rm -rf node_modules"
