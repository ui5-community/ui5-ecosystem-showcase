# A Small TypeScript UI5 Example App

## Description

This app demonstrates a TypeScript setup for developing UI5 applications.

As the focus is on the TypeScript setup, the app code itself is quite minimal, it is not using models, translation files etc.

<b>This repository also contains [a detailed step-by-step guide](step-by-step.md), which explains how this setup is created and how all the bits and pieces fit together.</b>

<b>In the [custom-controls](https://github.com/SAP-samples/ui5-typescript-helloworld/tree/custom-controls) branch, this repository also contains instructions and an example how custom controls can be developed in TypeScript within applications.</b>

<b>The [TypeScript branch of the "UI5 CAP Event App"](https://github.com/SAP-samples/ui5-cap-event-app/tree/typescript) sample demonstrates a slightly more complex application, using the same setup. It comes with an [explanation](https://github.com/SAP-samples/ui5-cap-event-app/blob/typescript/docs/typescript.md) of what UI5 TypeScript code usually looks like and what to consider.</b>

<b>The UI5con 2021 session on TypeScript ([recording available at YouTube](https://www.youtube.com/watch?v=aXzcsOZH4q8)) explains the overall approach for TypeScript and UI5.</b>

<b>There is also an [application template](https://github.com/ui5-community/generator-ui5-ts-app) (based on yeoman and easy-ui5) which has been shown in the [UI5con Keynote](https://www.youtube.com/watch?v=aXzcsOZH4q8) and explained in [this blog](https://blogs.sap.com/2021/07/01/getting-started-with-typescript-for-ui5-application-development/).</b>

| :point_up: Overview of TypeScript-related Entities |
|:---------------------------|
| The UI5 type definitions (`*.d.ts` files) are loaded as dev dependency from [npm](https://www.npmjs.com/package/@openui5/ts-types-esm). They are a work in progress, so while they should be working well already, we are still improving them, which might also lead to breaking changes.<br/>
 The file [tsconfig.json](tsconfig.json) contains the configuration for the TypeScript compilation, including a reference to the UI5 `*.d.ts` files.<br/>
 Normally, the UI5 JavaScript files (controllers, Component.js etc.) would reside in the `webapp` folder. Now they are in the [src](src) folder. The TypeScript compilation will create the `webapp` folder and put all output there. <br/>
 In addition to the TypeScript compilation, there is also a conversion from the ES6 module and class syntax used in the source files to the classic UI5 module loading and class definition syntax (`sap.ui.define(...)` and `superClass.extend(...)`). This conversion is using the [babel-plugin-transform-modules-ui5](https://github.com/r-murphy/babel-plugin-transform-modules-ui5) project from Ryan Murphy. <br/> 
 Both, the TypeScript compilation and the ES6 syntax transformation, are executed by Babel, as configured in the file [.babelrc.json](.babelrc.json)<br/> 
 This combined transformation is triggered by both the `build:ts` and `watch:ts` scripts in [package.json](package.json). |



## Requirements

Either [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) for dependency management.

## Download and Installation

1. Clone the project:

```sh
git clone https://github.com/SAP-samples/ui5-typescript-helloworld.git
cd ui5-typescript-helloworld
```
    
(or download from https://github.com/SAP-samples/ui5-typescript-helloworld/archive/main.zip)

2. Use npm (or yarn) to install the dependencies:

```sh
npm i
```

(To use yarn, just do `yarn` instead.)

## Run the App

Execute the following command to run the app locally for development in watch mode (the browser reloads the app automatically when there are changes in the source code):

```sh
npm start
```

As shown in the terminal after executing this command, the app is then running on http://localhost:8080/index.html. A browser window with this URL should automatically open.

(When using yarn, do `yarn start` instead.)


## Debug the App

In the browser, you can directly debug the original TypeScript code, which is supplied via sourcemaps (need to be enabled in the browser's developer console if it does not work straight away). If the browser doesn't automatically jump to the TypeScript code when setting breakpoints, use e.g. `Ctrl`/`Cmd` + `P` in Chrome to open the `*.ts` file you want to debug.


## Build the App

### Unoptimized (but quick)
Execute the following command to build the project and get an app that can be deployed:

```sh
npm run build
```

The result is placed into the `dist` folder. To start the generated package, just run

```sh
npm run start:dist
```

Note that `index.html` still loads the UI5 framework from the relative URL `resources/...`, which does not physically exist, but is only provided dynamically by the UI5 tooling. So for an actual deployment you should change this URL to either [the CDN](https://openui5.hana.ondemand.com/#/topic/2d3eb2f322ea4a82983c1c62a33ec4ae) or your local deployment of UI5.

(When using yarn, do `yarn build` and `yarn start:dist` instead.)


### Optimized

For an optimized self-contained build (takes longer because the UI5 resources are built, too), do:

```sh
npm run build:opt
```

To start the generated package, again just run 

```sh
npm run start:dist
```

In this case, all UI5 framework resources are also available within the `dist` folder, so the folder can be deployed as-is to any static web server, without changing the bootstrap URL.<br>
With the self-contained build, the bootstrap URL in `index.html` has already been modified to load the newly created `sap-ui-custom.js` for bootstrapping, which contains all app resources as well as all needed UI5 JavaScript resources. Most UI5 resources inside the `dist` folder are for this reason actually <emph>not</emph> needed to run the app. Only the non-JS-files, like translation texts and CSS files, are used and must also be deployed. (Only when for some reason JS files are missing from the optimized self-contained bundle, they are also loaded separately.)

(When using yarn, do `yarn build:opt` and `yarn start:dist` instead.)


## Check the Code

Do the following to run a TypeScript check:

```sh
npm run ts-typecheck
```

This checks the application code for any type errors (but will also complain in case of fundamental syntax issues which break the parsing).<br>


To lint the TypeScript code, do:

```sh
npm run lint
```

(Again, when using yarn, do `yarn ts-typecheck` and `yarn lint` instead.)

## Limitations

- At this time, the used eslint rules are not verified to be optimal or to be in sync with UI5 recommendations.


## Known Issues

None.


## How to Obtain Support

The sample code is provided **as-is**. No support is provided.

[Create an issue](https://github.com/SAP-samples/ui5-typescript-helloworld/issues) in this repository if you find a bug.
Questions can be [asked in SAP Community](https://answers.sap.com/questions/ask.html).

<!-- ## Contributing -->


## References

Once you have understood the setup and want to inspect the code of a slightly more comprehensive UI5 app written in TypeScript, you can check out the [TypeScript version of the UI5 CAP Event App Sample](https://github.com/SAP-samples/ui5-cap-event-app/tree/typescript).


## License

Copyright (c) 2021 SAP SE or an SAP affiliate company. All rights reserved.
This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
