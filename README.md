# ui5-ecosystem-showcase

A repository showcasing the UI5 tooling extensibility to combine OSS tools for UI5 application development.

## Getting Started

To get started with `ui5-ecosystem-showcase` run one of the following commands:

```bash
# Install the node modules via yarn
yarn

# use yarn --ignore-engines if you're on node != 8 or 10

# 1) Run the dev mode
# which gives you 
# - live reload of ui5-app/webapp/**/**
# - live transpilation of ui5-app/webapp/**/** on the fly
#   including debug functionality via source maps
#   (attention: async functions not yet supported!)
# - proxy functionality at $server/proxy
# - cf-style proxy destinations at $server/$destinations
yarn dev

# 2) Run the Component-preload build + transpile steps
# which in addition to the above
# - transpiles all ui5-app/webapp/**/* to ui5-app/dist
# - live reload of ui5-app/dist/**/*
yarn watch

# 3) Run the dist folder (but build manually)
yarn start
```

## License
Beerware License <https://fedoraproject.org/wiki/Licensing/Beerware>

When you like this stuff, buy @pmuessig or @vobu a beer when you see them 
