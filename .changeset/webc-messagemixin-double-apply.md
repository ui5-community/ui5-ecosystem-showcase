---
"ui5-tooling-modules": patch
---

fix(webcomponents): avoid applying method-wrapping mixins twice in a wrapper inheritance chain

`MessageMixin` and `LabelEnablement` install method wrappers (`destroy`, `setLabelFor`,
`exit`, `setRequired`, ...) by capturing the previous method into a shared prototype slot
that the wrapper resolves via `this` at call time. Emitting them on both a class and its
superclass (e.g. `DateRangePicker extends DatePicker`, `MultiInput extends Input`) made the
wrapper capture the ancestor's already-wrapped method and call itself — an infinite
recursion (`RangeError: Maximum call stack size exceeded`) the first time that method runs,
e.g. on `destroy()` during view re-instantiation or when routing away. These mixins are now
emitted only on the topmost ancestor that introduces them; subclasses inherit the wrapped
methods. `EnabledPropagator` is intentionally left unchanged — it captures via a per-wrapper
closure, so nested application is safe.
