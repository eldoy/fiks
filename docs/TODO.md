### TODO

- [ ] Install settings in ~/.config/fiks/apps.json
- [ ] Build internal database of entire structure on startup:
  root = config.root
  struct = [
    {
      name: 'firmalisten-search',
      dir: 'search',
      source: 'git',
      hash: 'e34fg4699a',
      linked: true,
      dependencies: [
        'firmalisten-config',
        'firmalisten-plugins'
      ],
      devDependendies: [
        'extras',
        'haka',
        'firmalisten-data'
      ]
    }
  ]

  The struct is built from scanning all libs/package.json:
    - name
    - dependencies
    - devDependencies

  We cross-check the dependencies with the package.json names. If a package in the dependencies exists in the parent directory, then set 'dir' to the directory of the package.

  If 'dir' exists, it can be linked. If 'linked' is true then it's already linked.

  If the package starts with 'github' the source is set to 'git', which means we have to run 'npm update' to update this library to the latest version.

  The hash is recorded for verification and feedback purposes. We can await new versions if they are on the way for example.

- [ ] Re-implement the commands
  - [ ] Write tests for functions that convert to JSON

- [ ] Run commands and pass to printer
  - [ ] Nothing to do means empty output
  - [ ] Run as much as possible in parallel

The link function should:
  - Link to local directories with 'npm install --no-save'
  - Support distinct repo names

The unlink function should:
  - Unlink local directories with 'npm install' for each linked library
  - Support distinct repo names

The linked function should:
  - Print the linked status of all linkable libraries

The install function should be more advanced:
  - For normal libs do 'npm install'
  - For github libs do
    - 'npm install --no-save' if it can be linked
    - 'npm install' if it doesn't exist
    - 'npm update' if it exists
  - Support distinct repo names

The update function should do this:
  - For normal libs do 'npm-check-updates'
  - If it's already linked, do nothing
  - For github libs that are not linked do 'npm update'
  - Support distinct repo names

The reset function should:
  - Delete 'node_modules' and run 'fiks install'
  - Then link to local directories with 'npm install --no-save'
  - Support distinct repo names

The push function should:
  - Ask for commit message and push all directories
  - Support distinct repo names

The pull function should:
  - Pull all directories
  - Run 'fiks install' for each of them
  - Support distinct repo names

The status function should:
  - Show status for all directories
  - Support distinct repo names

The log function should:
  - Show a mixed log for all
  - Support users with @username
  - Support distinct repo names

The user add function should:
  - Add a username alias to fiks config
  - Ask for user email and alias shortname

The user delete function should:
  - Ask for alias shortname or email and delete from config

The user list function should:
  - Print the list of users shortname aliases found in the config
