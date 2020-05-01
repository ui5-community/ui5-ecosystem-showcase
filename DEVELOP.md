# ui5-ecosystem-showcase

This page contains information around developing the packages in this repository.

## Version Upgrade

To run the version upgrade of the dependencies across all projects, just run the following commmand:

```bash
yarn workspaces run ncu-upgrade
```

*In order to support the UI5 CLI 1.x we need to reduce the version of the UI5 CLI dependencies to 1.x.x versions again. For the `ui5-app` this rule doesn't apply.*
