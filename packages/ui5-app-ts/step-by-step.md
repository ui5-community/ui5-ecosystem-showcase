# A Detailed Guide to Create a UI5 TypeScript App From Scratch in Five to Ten Steps

This guide explains step-by-step and command-by-command how you get to a complete UI5 TypeScript setup from scratch.

While you can get started faster by just copying and modifying the entire "Hello World" app, this step-by-step guide will help you understand every bit and piece of the setup and how the pieces fit together.

It consists of ten steps, but in fact only the first half is really related to TypeScript. The remaining five steps are about adding the UI5 tools to the project and wrapping everything up nicely, so these steps apply more or less to any UI5 application project. 

## Table of Contents:
1. [Initialize an Empty Project](#1-initialize-an-empty-project)<br>
1. [Create an Initial TypeScript Resource](#2-create-an-initial-typescript-resource)<br>
1. [Set Up the TypeScript Compilation](#3-set-up-the-typescript-compilation)<br>
1. [Set Up the Babel-based Code Transformation (ES6 -> Classic)](#4-set-up-the-babel-based-code-transformation--es6----classic-)<br>
1. [Set Up a Lint Check](#5-set-up-a-lint-check)<br>
1. [Complete the App Code](#6-complete-the-app-code)<br>
1. [Set Up the UI5 Tools (Optional)](#7-set-up-the-ui5-tools--optional-)<br>
1. [Set Up Live Reload ("Watch") Mode for Easier Development (Optional)](#8-set-up-live-reload---watch---mode-for-easier-development--optional-)<br>
1. [Add an Optimized UI5 Build (Optional)](#9-add-an-optimized-ui5-build--optional-)<br>
1. [Add Scripts for Building/Running/Checking to `package.json`](#10-add-scripts-for-building-running-checking-to--packagejson-)<br>

## 1. Initialize an Empty Project

Type the following on the command line to create the project directory and go inside:

```sh
mkdir ui5-typescript-from-scratch
cd ui5-typescript-from-scratch
```

Initialize an [npm](https://www.npmjs.com)-based project - this creates the `package.json` file in which also the dependencies will be added:

```sh
npm init -y
```

The `-y` parameter uses default settings for all options without asking - you can adapt them in package.json if needed.


## 2. Create an Initial TypeScript Resource

Inside your project, create a `src` folder:

```sh
mkdir src
```

Inside this folder, create a file with TypeScript code. In order to test the use of UI5 types and the code transformation, name it `Component.ts` (note: the file ending is ".ts", not ".js"!) and add the following code inside. Of course, this is so far just a dummy component and not yet a complete app:


```ts
import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace ui5.typescript.helloworld
 */
export default class Component extends UIComponent {

    public multiply(x : number, y : number) : number {
        return x * y;
    }
}
```

Note that the scope of this tutorial is the TypeScript setup of a project, not the application code itself. Hence the content of the *.ts files will not be explained further. It is plain regular UI5 application code, with two exceptions:<br>
  1. It is <b>TypeScript</b> code, which means while mostly being plain JavaScript, it also contains type declarations for variables, parameters and function return values, as seen in the definition of the "multiply" method. You will be able to see how these will be stripped away by the TypeScript compilation.
  1.  It is "<b>modern JavaScript</b>" code with [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), which will be transformed to classic UI5 code in a further step of the build process. This is not really related to TypeScript, but it's the way how we recommend to write modern UI5 apps when a build step is anyway needed.


## 3. Set Up the TypeScript Compilation

Now, let's get the TypeScript compiler and the UI5 type definitions:
```sh
npm install --save-dev typescript @types/openui5@1.100.0
```

When you are developing a SAPUI5 application (i.e. also using control libraries which are not available in OpenUI5), use the `@sapui5/ts-types-esm` types instead of the `@types/openui5` ones.

There are also `@openui5/ts-types-esm` types available  how do they differ from the `@types/openui5` ones?
<br>The one difference is in versioning: while the types in the `@openui5` namespace are exactly in sync with the respective OpenUI5 release, the ones in the `@types` namespace follow the DefinitelyTyped versioning and are only released once per minor release of OpenUI5 ([more details here](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/openui5#versioning)). In practice it shouldn't make any difference what you use, but note that in the `@types` namespace there is usually only the *.*.0 patch release available.<br>
The other small difference is [described in detail here](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/openui5#jquery-and-qunit-references-and-their-versions). In essence, UI5 declares the jQuery and QUnit types as dependencies to make sure the type definitions are also loaded because types from those libraries are in some places exposed in UI5 APIs. The difference is that for `@types/openui5` the *latest* version of those types is referenced and for `@openui5/ts-types-esm` the *best matching* version is referenced. But in practice also this difference should not be something to worry about. To enforce using a specific version of the jQuery/QUnit types, you can always do e.g.:
```sh
npm install --save-dev @types/jquery@3.5.9 @types/qunit@2.5.4
```

> **NOTE:** When using either `ts-types-esm` package of a UI5 version before 1.100, you need to add the jQuery and QUnit type definitions manually like this to have them available.

The SAPUI5 types are not available in the `@types` namespace.




Now execute 

```sh
npx tsc src/Component.ts
```

(The `npx` command runs the subsequently written npm module from within the "node_modules" folder, so it does not need to be installed globally.)

The TypeScript compiler tries to compile the component file, but it complains because it finds some unknown JavaScript classes ("Iterator", "Generator") in the UI5 type definitions. This is because TypeScript by default works with a pretty old language level of JavaScript (ES3) and we need to tell it to accept a newer language level (ES2015/ES6).<br>

Actually, there is some Component.<b>js</b> file created inside the "src" folder, but the content is really weird and bloated. <b>Please delete this file to avoid downstream issues!</b> 

So we need to add a `tsconfig.json` configuration file to configure the right language level. Add a file with this name and the following content to the root of the project:

```json
{
    "compilerOptions": {
        "target": "es2015",
        "module": "es2015",
        "skipLibCheck": true,
        "preserveConstEnums": true,
        "allowJs": true,
        "strict": true,
        "strictNullChecks": false,
        "strictPropertyInitialization": false,
        "rootDir": "./src",
        "outDir": "./dist",
        "baseUrl": "./",
        "paths": {
            "ui5/typescript/helloworld/*": [
                "./src/*"
            ]
        }
    },
    "include": [
        "./src/**/*"
    ]
}
```

Note: when you use the `@sapui5/ts-types-esm` (or `@openui5/ts-types-esm`) types instead, you need to add the following section to tsconfig.json:

```json
        "typeRoots": [
            "./node_modules/@types",
            "./node_modules/@sapui5/ts-types-esm"
        ],
```

Why? TypeScript automatically finds all type definition files in a dependency starting with "@types/..." (i.e. all *.d.ts files in `node_modules/@types/...`). The jQuery d.ts files are there and found, but the SAPUI5 types are only in a package starting with "@sapui5/", hence they must be loaded by explicitly mentioning them in the "typeRoots" section. As this disables the automatic loading of other types from `node_modules/@types/...`, this path must also be given as a type root. 

There are additional settings in this file, e.g. telling the compiler which files to compile (all matching "./src/**/*") and where to put the compiled results (to "./dist"). And a couple of compiler options which are not so important right now. They determine how exactly the compiler behaves. The "paths" section informs TypeScript about the mapping of namespaces used in the app.

Note that some of the settings (like the `outDir`) are not used as configured here, but overridden when calling the transpiler.

Now you can do the following <b>in the root directory</b> of your project. TypeScript will pick up all the settings and as result you will find a compiled JavaScript file in the automatically created "dist" folder:

```sh
npx tsc
```

Yay! Your first successfully compiled TypeScript code! When inspecting the `dist/Component.js` file, you will see that all TypeScript specifics are gone. Specifically, the type information is stripped from the line defining the "multiply" method:

```js
multiply(x, y) {
    return x * y;
}
```


In case there is a type error, the compilation will let you know. E.g. when you change the return type of the "multiply" function to "string" in `Component.ts`, then there will be an error:

```ts
public multiply(x : number, y : number) : string {
```

will result in

```
src/Component.ts:9:3 - error TS2322: Type 'number' is not assignable to type 'string'.
9       return x * y;
```

You can also invoke this check without creating the compiled output files when you add the `-noEmit` flag to the compiler call:

```sh
npx tsc -noEmit
```


## 4. Set Up the Babel-based Code Transformation (ES6 -> Classic)

The compiled code still uses ES modules and classes, which need to be transformed to classic UI5 code. To do so, we need another build step, using the "[transform-ui5](https://www.npmjs.com/package/babel-plugin-transform-ui5)" tool.<br>
To orchestrate both build steps, we use the [Babel](https://babeljs.io/) transpiler, so the TypeScript compiler will no longer be called directly from now on.

Add dependencies to Babel, to the TypeScript preset for Babel, and to the UI5 transformer like this:

```sh
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save-dev @babel/preset-typescript babel-preset-transform-ui5
```

To let Babel know what it should do, create a `.babelrc.json` file in the root of the project, with the following content:

```json
{
    "ignore": [
        "**/*.d.ts"
    ],
    "presets": [
        "transform-ui5",
        "@babel/preset-typescript"
    ]
}
```

This tells Babel to first invoke the TypeScript compilation (yes, the "presets" array is executed bottom-to-top!) and then the UI5 transformation.

You can execute the following to trigger the Babel build:
```sh
npx babel src --out-dir webapp --extensions ".ts,.js"
```

(We need to explicitly allow *.ts files because Babel by default does not handle TypeScript files.)

The result is a `webapp` folder with a `Component.js` file, which is converted from TypeScript AND also converted to classic UI5 code!

Open this file to see: the module imports are replaced with the classic `sap.ui.define(...)` and the "Component" class is now defined by calling `UIComponent.extend(...)`:

```js
sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
  ...
  const Component = UIComponent.extend("ui5.typescript.helloworld.Component", {
```

This means the complete TypeScript build setup is now done!



### 5. Set Up a Lint Check

While not strictly required, it makes sense to have your code checked with a linter. The popular "[ESLint](https://eslint.org/)" tool also understands TypeScript when some plug-ins are added. It is the recommended tool to lint TypeScript code. So let's add ESLint and these plug-ins as dev dependencies!

```sh
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

ESLint needs to be told which plug-ins to use and which JavaScript language level the code should have, so create a `.eslintrc.json` file in the project root with these settings:

```json
{
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": ["./tsconfig.json"],
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ]
}
```

By executing

```sh
npx eslint
```

the TypeScript code can now be checked for syntax and style problems.

There should not be any output (this means: no error), but if you introduce a syntax error to Component.ts, the check will complain with an error and if e.g. the return type of the "multiply" function is missing, it will show a warning.

If you get an error straight away which says something like "The file does not match your project config: src\Component.<b>js</b>.", then this might be a left-over compilation result from step 3 above. Delete it and re-try.

In the configuration file all kinds of details regarding the single ESLint rules can be configured. But for this guide (and because the UI5 team does not currently give a set of actual recommendations) let's stick with the recommended TypeScript defaults, which are referenced in the `"extends"` section.



### 6. Complete the App Code

To extend the now-complete TypeScript setup into a complete app development setup in the rest of this tutorial, we need a complete and runnable app.

Please copy the entire content of this repository's [src](src) directory (you can [download the entire repository from here as zip file](../../archive/refs/heads/main.zip)) into your local project's `src` directory. Make sure to also replace the dummy `Component.ts` file we have used so far!

Alternatively, you could of course also develop your own UI5 app in TypeScript within the "src" folder.


### 7. Set Up the UI5 Tools (Optional)

Actually, at this point the guide could be finished: the app, as available in the `webapp` folder after the build step, can be deployed and run as-is. It just needs to bootstrap the UI5 framework from a location where it is available, e.g. from [the CDN](https://openui5.hana.ondemand.com/#/topic/2d3eb2f322ea4a82983c1c62a33ec4ae).

However, for a better development experience and for optimizing the app before productive use, it is recommended to use the [UI5 commandline tools](https://sap.github.io/ui5-tooling/pages/CLI/). Also some other things are nice to have for completeness.<br>

Therefore, add the UI5 CLI tools to the project:

```sh
npm install --save-dev @ui5/cli
```

Like the other tools added so far, they need some configuration to do their job properly. To supply this configuration, create a `ui5.yaml` file in the project root with the following content:

```yaml
specVersion: "2.3"
metadata:
  name: ui5.typescript.helloworld
type: application
framework:
  name: OpenUI5
  version: "1.100.0"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: sap.ui.unified
    - name: themelib_sap_fiori_3
```

While only the first four lines are strictly required to use the UI5 tools, the rest is still useful: the "framework" section downloads the UI5 framework along with needed libraries and provides it at the virtual path "/resources" when `ui5 serve` is called. This path is from where the index.html file loads UI5.

What you can do now: compile the full app into the "webapp" folder and run it from there using the UI5 tools:

```sh
npx babel src --out-dir webapp --source-maps true --extensions \".ts,.js\" --copy-files
npx ui5 serve -o index.html
```

Note: there are now two more parameters used in the Babel call than before:
1. `--source-maps true` adds the original TypeScript source code into `*.js.map` files next to the transpiled JavaScript files, plus a pointer to those `.map` files to the end of the JS files. Browsers understand this, so they can enable stepping through the original TypeScript code in the debugger even though they actually run the compiled JavaScript code under the hood. Note that this describes the transpiled output in the `webapp` directory; the optimizing UI5 build into the `dist` directory removes these sourcemaps. 
1. `--copy-files` ensures that also non-TypeScript files are copied over from "src" to "webapp", like e.g. the view XML files.

That's it! A web server with the app is started and the app is automatically opened inside your browser!



### 8. Set Up Live Reload ("Watch") Mode for Easier Development (Optional)

Making the browser reload the app automatically when you modify the sources consists of two steps:
1. Give an additional `--watch` parameter to Babel to automatically re-compile any changed sources into "webapp" (this also works for non-TypeScript source files). This causes the Babel process NOT to exit after the initial compilation, but to stay alive and watch for changes. Hence, the "ui5 serve" command needs to be triggered from a second commandline window.
1. Add the "livereload" middleware to the UI5 tools. This middleware checks for any changes in the "webapp" folder and causes the browser to reload when such a change is detected.

The "livereload" middleware is added as follows. First, add it as another dependency:

```sh
npm install --save-dev ui5-middleware-livereload
```

Second, append it to `package.json`, with the `"ui5"` entry on the same level as the `"devDependencies"` entry (don't forget adding a comma after the latter):

```json
    ...
  },
  "ui5": {
    "dependencies": [
      "ui5-middleware-livereload"
    ]
  }
```

Third, append a "server" section to the `ui5.yaml` file, which configures this middleware:

```yaml
server:
  customMiddleware:
  - name: ui5-middleware-livereload
    afterMiddleware: compression
    configuration:
      debug: true
      extraExts: "xml,json,properties"
      port: 35729
      path: "webapp"
```

Make sure to get the indentation right (first line is not indented) because it is significant in yaml files.


As result, you can now execute these two commands in different terminal windows:

```sh
npx babel src --out-dir webapp --source-maps true --extensions \".ts,.js\" --copy-files --watch
```

```sh
npx ui5 serve -o index.html
```

The app in the automatically opened browser window reloads whenever a source file in "src" was changed and saved.



### 9. Add an Optimized UI5 Build (Optional)

This step is again not at all related to TypeScript, but as the UI5 tools are already set up, you can as well use them for an optimized "self-contained" build of the app: it picks only the needed UI5 framework modules and controls and bundles them with all application resources into one single file.

```sh
npx ui5 build self-contained --clean-dest --all
```

The `self-contained` command takes care of bundling all resources into one single file. This means: app code AND UI5 code. The `--all` switch takes care of copying all UI5 framework resources to the `dist` folder as well. The JavaScript resources should not be needed there (because all needed ones should already be in the bundle). But library CSS files etc. are not in the bundle.

This takes a while, maybe a minute or two, as it also needs to process all UI5 resources. But this is anyway a step which is usually only done once before releasing the app, not for every development roundtrip.<br>


Alternatively, if you don't need the fully optimized one-file bundle and want to load UI5 from elsewhere, you can also just do a regular build:

```sh
npx ui5 build --clean-dest
```

Either way, the result in `dist` can either be put on a static web server or it can be served with the UI5 tools. To do the latter, a slightly different UI5 tools configuration is needed because it now needs to serve from the `dist` folder. This configuration goes into a new file named `ui5-dist.yaml` in the project root:

```yaml
specVersion: "2.3"
metadata:
  name: ui5.typescript.helloworld
type: application
resources:
  configuration:
    paths:
      webapp: dist
framework:
  name: OpenUI5
  version: "1.100.0"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: sap.ui.unified
    - name: themelib_sap_fiori_3
```

One difference to the other yaml file is the removed middleware configuration (live reload does not make sense for an optimized build), the other one is the additional "resources" section, which tells the UI5 tools to serve from the `dist` directory.

To run the build result from `dist`, `ui5 serve` can then be executed as before, but additionally using this new configuration file:

```sh
npx ui5 serve -o index.html --config ui5-dist.yaml
```


### 10. Add Scripts for Building/Running/Checking to `package.json`

Now it's time to write down the various commands used so far as scripts in `package.json`, so you don't need to type them every time they are used.

Change the `"scripts"` section in the `package.json` file to have the following content. All scripts have already been used and explained earlier, so there is nothing new here, it's just for convenience.

```json
{
    "build": "npm-run-all build:ts build:ui5",
    "build:opt": "npm-run-all build:ts build:ui5:opt",
    "build:ts": "babel src --out-dir webapp --source-maps true --extensions \".ts,.js\" --copy-files",
    "build:ui5": "ui5 build --clean-dest",
    "build:ui5:opt": "ui5 build self-contained --clean-dest --all",
    "start": "npm-run-all --parallel watch:ts start:ui5",
    "watch:ts": "babel src --out-dir webapp --source-maps true --extensions \".ts,.js\" --copy-files --watch",
    "start:ui5": "ui5 serve --port 8080 -o index.html",
    "start:dist": "ui5 serve  --port 8080 -o index.html --config ui5-dist.yaml",
    "ts-typecheck": "tsc --noEmit",
    "lint": "eslint src"
}
```
Calling `npx` is not needed here, as the commands are automatically found within the "node_modules" folder when run as npm script.

Also add the "npm-run-all" module as dev dependency because it is used in some of these scripts. It allows launching processes sequentially or in parallel, so it is no longer needed to open two terminal windows for watch mode:

```sh
npm install --save-dev npm-run-all
```


## Done!

You now have not only a fully functional TypeScript app development setup with all the features and npm scripts described in the [README.md](README.md) file of this repository – but hopefully also an understanding of the different tools and configurations used in this setup!


