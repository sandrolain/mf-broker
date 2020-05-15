![mf-broker](https://raw.githubusercontent.com/sandrolain/mf-broker/bc84a679f7b2b4e67cfa93350816c7197e9257ea/assets/logo.svg?sanitize=true "mf-broker")

<p align="center">

**Micro-Frontends Broker**  
Pub/Sub manager for isolated components

</p>

---

The purpose of this library is to provide a simple and effective tool for communication within web apps composed of micro-frontends.

### Web Components 

The standard and generally recognized solution for communication between web components, whether they are based on custom elements, or on virtual dom or other technologies, make the use of native CustomEvent, which can be subscribed within any level of visibility of the DOM .

MF-Broker tries to provide a simple and globally accessible pub / sub communication system based on CustomEvent, allowing to exchange information between the various components of a webapp and at the same time trying to limit the use of customized solutions.

The library simplifies the use of CustomEvent and does not replace them. In fact, communication can be integrated by leaving the choice of individual micro-frontends whether to exploit this library or manage the DOM events independently, thus limiting their interdependence.

The use of the library allows you to take advantage of some additional features, such as message retention which guarantees new subscriptions to receive copies of the last published message.

### Framesets

For micro-frontend solutions based on html framesets or iframes, where different DOM trees exist within different windows, this library uses the standard postMessage / MessageEvent web API, integrating them with communication via CustomEvent.
This allows to obtain a message transmission system that involves not only the single DOM tree from where they are sent, but also the other window contexts of the frames present in the web document.
Furthermore, by integrating the library in each Frame that makes up the webapp, it allows the published messages to descend every window context present, even having multiple nested iframe documents and to take advantage of other features such as retain.

### Procedure

By taking advantage of the communication system provided by CustomEvent or MessageEvent-based brokers, the library provides a mechanism for calling procedures defined in other contexts and which return a response. It is therefore possible to call functions that perform transformations of the data sent to them or that give a result in synchronous or asynchronous mode thanks to the use of the Promises.


---

## Usage

### As TypeScript module

```typescript
/// import specific methods or classes
import { Broker, FramesetBroker, ProcedureBroker } from "mf-broker";
// ...

// or entire library
import * as mfBroker from "mf-broker";
// ...
```

### As browser EcmaScript module

```html
<script type="module">
/// import specific methods or classes
import { Broker, FramesetBroker, ProcedureBroker } from "./mf-broker/esm/index.js";
// ...

// or entire library
import * as mfBroker from "./mf-broker/esm/index.js";
// ...
</script>
```

### As commonjs/node.js module

```javascript
/// import specific methods or classes
const { Broker, FramesetBroker, ProcedureBroker } = require("mf-broker");
// ...

// or entire library
const mfBroker = require("mf-broker");
// ...
```

---

## Documentation and Demo

Typedoc documentation with examples can be found by [clicking here](https://sandrolain.github.io/mf-broker/typedocs/modules/_index_.html).

Simple Broker Demo is visibile by [clicking here](https://sandrolain.github.io/mf-broker/demo/index.html).
Frameset Broker Demo is visibile by [clicking here](https://sandrolain.github.io/mf-broker/demo/index-frame.html).

---

## Build types available

This package is written in TypeScript and the build includes type definitions for use in other TypeScript projects.  
The build of this package generates two versions:
- **ES Module**: For use in TypeScript or web projects for browsers that support ES6 modules. Using ES6 import in projects based on node.js (including TypeScript) it allows during the bundling phase (via webpack, rollup or equivalent) to perform the tree-shaking of the dependencies and have a lighter bundle.
- **Universal Module Definition**: To be used directly in projects based on node.js, or into web projects callable via global variable or via requirejs

---

## Status

<table><thead><tr><th>master</th><th>develop</th></tr></thead><tbody><tr><td>

[![Build Status](https://travis-ci.org/sandrolain/mf-broker.svg?branch=master)](https://travis-ci.org/sandrolain/mf-broker)

</td><td>

[![Build Status](https://travis-ci.org/sandrolain/mf-broker.svg?branch=develop)](https://travis-ci.org/sandrolain/mf-broker)

</td></tr></tbody></table>

---

## License
[![MIT](https://img.shields.io/github/license/sandrolain/mf-broker)](./LICENSE)

-------------------------

[Sandro Lain](https://www.sandrolain.com/)
