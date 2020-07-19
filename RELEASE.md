# ui5-ecosystem-showcase

This page contains information around maintaining and releasing the packages in this repository.

## Upgrading the version of the dependencies

To upgrade the version of the dependencies `yarn upgrade-interactive` is used. To execute the command in all packages you need to run the following command:

```bash
yarn upgrade-interactive --latest
```

*Attention: for now we keep the dependencies of the UI5 tooling dependencies on 1.x!*

## Releasing the packages

To release the packages `lerna` is used to tag and release the packages in the mono repository properly. To run the release just use the following command:

```bash
# change the version of the NPM packages based on the conventional commits
lerna version --conventional-commits

# publish the new packages to NPM
lerna publish from-git
```
