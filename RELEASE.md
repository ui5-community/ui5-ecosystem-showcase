# ui5-ecosystem-showcase

This page contains information around maintaining and releasing the packages in this repository.

## Upgrading the version of the dependencies

To upgrade the version of the dependencies `npm-check-updates` is used. To execute the command in all packages you need to run the following command:

```bash
lerna run ncu-upgrade --stream
```

## Releasing the packages

To release the packages `lerna` is used to tag and release the packages in the mono repository properly. To run the release just use the following command:

```bash
lerna publish
```
