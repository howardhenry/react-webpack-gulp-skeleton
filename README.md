# Webpack + Gulp Skeleton

Skeleton project using Webpack Dev Server and Gulp

## Gulp

Essential scripts via NPM:

* Run tests (mocha):
    - *command line interface*: `npm test`
    - *command line interface w/ watch*: `npm run tdd`
* Run css quality (csslint):
    - *junit reporter*: `npm run css-quality`
    - *command line interface*: `npm run css-quality-cli`
* Run code quality (eslint):
    - *checkstyle reporter*:  `npm run code-quality`
    - *command line interface*:  `npm run code-quality-cli`
* Start app at **http://localhost:8050**: `npm start`


## Git hooks
In an effort to keep the project repository up-to-date with clean code git hooks have been created to run *code quality*, *code style* and *test* scripts before `commit`ting and before `push`ing changes. If any of the scripts in the hooks below report an error the commit/push will be aborted, which encourages you to fix the code quality/style/test issues before proceeding.

Git hooks are shared in the repository in the `hooks` directory and should be installed by each developer contributing to the project. Simply run `npm run add-git-hooks` to copy the provided hooks to your .git directory.

NOTE: In exceptional cases, you have the option to skip the hooks by simply adding the `--no-verify` flag to the commit or push command (`git commit -m "<YOUR_MSG>" --no-verify` or `git push --no-verify`)


#### Pre-commit
Before each commit, only code quality (eslint), and css quality (csslint) checks will be made. The following commands will be automatically run:

    -   npm run code-quality-cli &&
    -   npm run css-quality-cli

#### Pre-push
Before each push, only tests will be run. The following command will be automatically run:

    -   npm run test-cli