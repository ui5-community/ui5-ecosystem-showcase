# Typed JSONModel

This utility is a TypeScript library designed to enhance the development experience for UI5 projects that utilize JSONModel. UI5 is an open-source JavaScript UI library maintained by SAP. JSONModel is a core concept in UI5, providing a way to bind data to UI controls.

The Typed JSONModel utility adds type safety and improved development capabilities when working with JSONModel in your OpenUI5 projects. By leveraging TypeScript's static typing features, this utility helps catch type-related errors early and provides enhanced code completion and documentation in your code editor.

## Features

- 🔒 **Type Safety**: The utility enables you to define TypeScript types for your JSONModel data, ensuring that the data structure conforms to the specified types at compile-time.
- 💡 **Code Completion**: With the type definitions in place, your code editor can provide accurate autocompletion suggestions and documentation for the JSONModel data.
- 🚀 **Improved Development Experience**: By eliminating potential runtime type errors, you can write more reliable and maintainable code, resulting in a smoother development experience.
- 🔌 **Easy Integration**: The utility can be easily integrated into your existing OpenUI5 projects by following the installation and usage instructions provided below.

Feel free to leverage these features to enhance your UI5 project development!

## Installation

1. If you are not already using TypeScript in your UI5 project, it is recommended to check out [UI5 & TypeScript](https://sap.github.io/ui5-typescript/) first.

1. Install the utility as a development dependency in your project:

```bash
npm install ui5-types-typedjsonmodel --save-dev
```

1. In order to prevent runtime overhead, or bundling headaches the Typed JSONModel utility is only used in TypeScript by appling it's type over a ordinary JSONModel. To do this we need to write the following utility function:

```typescript
// webapp/model/model.ts
import type { TypedJSONModel, TypedJSONModelData } from "ui5-types-typedjsonmodel/lib/TypedJSONModel";

export function createTypedJSONModel<T extends TypedJSONModelData>(oData: T, bObserve?: boolean | undefined) {
    return new JSONModel(oData, bObserve) as TypedJSONModel<T>;
}
```

## Usage

1. Import the `createTypedJSONModel` method

```typescript
// Test.controller.ts
import { createTypedJSONModel } from "../model/models";

```

1. Create a new model inside your controllers class

```typescript
// Test.controller.ts
export default class Test extends Controller {
    myModel = createTypedJSONModel({
        foo: {
            bar: 'bar',
            baz: 3,
        },
        messages: [
            {
                content: 'Hello World',
            }
        ]
    });
}
```

1. Bind the model to the view

```typescript
// Test.controller.ts
export default class Test extends Controller {
    // ...

    onInit() {
  this.getView()?.setModel(this.myModel);
    }
}
```

1. Read/Write to the model

```typescript
// TypeSafe Reads
const foo = this.myModel.getProperty('/foo'); // foo has the type { bar: string, baz: number }
const bar = this.myModel.getProperty('/foo/bar'); // bar has the type string
const messages = this.myModel.getProperty('/messages'); // messages has the type { world: boolean }[]
const firstMessage = this.myModel.getProperty('/messages/0'); // firstMessage has the type { content: string }
const firstMessageContent = this.myModel.getProperty('/messages/0/content'); // firstMessageContent has the type string

// TypeSafe Writes
this.myModel.setProperty('/foo', { bar: 'any string', baz: 10 }); // OK
this.myModel.setProperty('/foo', { bar: 'any string', baz: '3' }); // Not OK, baz is a string not a number
this.myModel.setProperty('/foo', { bar: 'test' }); // Not OK, baz is missing
this.myModel.setProperty('/messages/1', { content: 'New Message' }); // OK
this.myModel.setProperty('/foo/baz', 123); // OK
this.myModel.setProperty('/foo/bazz', 123); // Not Ok, property bazz does not exist on type foo
this.myModel.setProperty('foo/baz', 123); // Not OK, missing leading slash in path
this.myModel.setProperty('/foo/test', 123); // Not OK, property test does not exist on type foo
```

Note that you can also explicitly specify the type of the model content if you don't want to infer it from the default values:

```typescript
// Test.controller.ts

type MyModelContent = {
 items: {
  status: "success" | "failure";
  message: string;
 }[];
}

export default class Test extends Controller {
    myModel = createTypedJSONModel<MyModelContent>({
        items: [],
    });

    // ...
}
```

## Limitations

- To prevent infinitely large types, the depth of recursive objects is limited to 10 by default
- Access to array items via an index in the property string aren't checked even if the array is defined as a touple
- Autocomplete for array indicies might not work in all cases
- Recursive types as model definitions may not work in all cases
- TypeScripts `readonly` attribute may not work as expected in all cases
