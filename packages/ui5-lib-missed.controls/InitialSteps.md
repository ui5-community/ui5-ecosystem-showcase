# Creating Control Libraries

Creating control libraries in OpenUI5 docu: https://github.com/SAP/openui5/blob/master/docs/controllibraries.md

## Initial Steps

Decide for namespace:
* 

Decide for package name:
* Naming convention: `ui5-lib-[LIB NAMESPACE]`
  * [LIB NAMESPACE] => hierachical namespace (dot separated, e.g. missed.controls)
* Allows easy search on NPM registry (we can also use keywords)

## Project Setup

```bash
$> npm init -y
$> mkdir -p src # let ui5 tooling know that we're creating a custom lib
$> ui5 init
$> cd src; mkdir -p missed/controls # sync namespaces and folder structure
$> touch missed/controls/manifest.json
```

Example [`manifest.json`](https://sapui5.hana.ondemand.com/resources/sap/ui/table/manifest.json)

```bash
$> touch missed/controls/library.js
```

Copy pase content from Control Libraries docu.

Steps:
 * Adopt import (remove jQuery!)
 * Adopt namespace 
 * Cleanup of code (...)


```bash
$> touch src/missed/controls/BarcodeScanner.js
$> touch src/missed/controls/BarcodeScannerRenderer.js
```

Fill BarcodeScanner and Render with the code from here!

Next step test page:

```bash
$> mkdir -p test/missed/controls/
$> touch test/missed/controls/BarcodeScanner.html
```

Add dependencies

```bash
$> ui5 use openui5@latest
$> ui5 add sap.ui.core
```

Start the test server:

```bash
$> ui5 serve -o test-resources/missed/controls/BarcodeScanner.html
```

Add live reload!

add support for theming
here's an overview of all theme parameters:
https://ui5.sap.com/test-resources/sap/m/demokit/theming/webapp/index.html

```bash
# (in / of lib)
$> mkdir -p src/themes/base
$> touch src/themes/base/BarcodeScanner.less
$> touch src/themes/base/library.source.less
# ... import base global.less'es
# @import "BarcodeScanner.less";
```

check for "sap.ui5".library.css = true

support for specific theme
```bash
# (in / of lib)
$> mkdir -p src/themes/base
$> touch src/themes/sap_fiori_3_dark/library.source.less
# ... import sap_fiori_3_dark global.less'es
# @import "../base/library.source.less";

```
