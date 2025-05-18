# Logic Rule Engine

*A powerful, async-ready JSON-based logic rule engine for evaluating nested conditions, variable bindings, dynamic file loading, and custom actions.*

## ✅ Features

- **Nested condition support `(AND/OR/==/!=/...)`**

- **`$` variables resolved from provided context**

- **Template string resolution (`${variable}` in log messages)**

- **`$file.variable` for dynamic external data resolution**

- **Preload data from files via useFiles config**

*Support for multiple action types:*

- **log (with template string support `${}`)**

- **`assign` (new object return with result)**

- **`update` (nested path support)**

- **`excludeVal` (array value removal)**

- **`deleteKey` (property deletion)**

- **Fully async-compatible and optimized**

- **Easily configurable for different contexts and sources**

---

## 📦 Installation

```bash
npm install logicguru-engine
```

## 🚀 Usage

```js
import { configureRuleEngine } from 'logic-rule-engine';
import rules from './examples/rules.json';

const defaultContext = {
  source: "evensect",
  productId: "123344",
  baseProductId: "123344",
  addons: ["1234", "5678"]
};

const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext
});

const result = await engine();
console.log(result);
```

## 📘 Rules Structure

```json
{
  "id": "section-rule",
  "useFiles": {
    "productFile": {
      "path": "${get.baseProductId}.json",
      "variable": ["ageOld"]
    }
  },
  "condition": {
    "and": [
      { "==": ["$get.source", "evectus"] }
    ]
  },
  "actions": [
    {
      "type": "log",
      "message": "Processing agent ${get.agentId}"
    },
    {
      "type": "update",
      "key": "$res.productId",
      "value": "$get.agentId",
      "returnKey": "res"
    },
    {
      "type": "excludeVal",
      "key": "$res.addons",
      "exclude": "1234",
      "returnKey": "res.addons"
    },
    {
      "type": "deleteKey",
      "key": "$temp.oldValue"
    }
  ]
}
```

---

## 🔧 Actions

- **log:**
```json
{ 
  "type": "log", 
  "message": "Processing ${variable.path}" 
}
```
- **assign:**
```json
{ 
  "type": "assign", 
  "key": "targetKey", 
  "value": "$someKey" 
}
```
- **update**
```json
{
  "type": "update",
  "key": "$object.nested.path",
  "value": "$newValue",
  "returnKey": "resultKey"
}
```
- **excludeVal** //array removal
```json
{
  "type": "excludeVal",
  "key": "$target.array",
  "exclude": "valueToRemove",
  "returnKey": "modifiedArray"
}
```
- **excludeVal** //work on object
```json
{
  "type": "deleteKey",
  "key": "$object.keyToRemove",
  "returnKey":"modifiedobject"
}
```
 

## 📁 Dynamic File Loading

*Supports `useFiles` to load data from external JSON dynamically using variable interpolation like `$productFile`.*
*Supports useFiles to load data from external JSON dynamically using variable interpolation:*

```json
"useFiles": {
  "productFile": {
    "path": "${get.baseProductId}.json",
    "variable": ["dataset"]
  }
}
```
## 🆕 Recent Updates

- **Added template string resolution `(${})` in log messages**

- **New `excludeVal` action for array value removal**

- **New `deleteKey` action for property deletion**

- **Enhanced update action with nested path support**

- **Improved object handling in variable resolution**

## ensure your action types follow the new syntax, particularly:

- **Use `exclude` instead of `value` in `excludeVal` actions**

- **Template strings `${}`, now work in log messages**

- **Nested paths are fully supported in all actions**



[![GitHub Discussions](https://img.shields.io/badge/GitHub-Discussions-blue?logo=github)](https://github.com/Sachinsharmawebdev/logicguru-engine/discussions)
[![Feedback Welcome](https://img.shields.io/badge/Feedback-Welcome-green)](https://github.com/Sachinsharmawebdev/logicguru-engine/discussions/categories/feedback)
[![GitHub Sponsors](https://img.shields.io/badge/Support-Project-red?logo=github)](https://github.com/sponsors/Sachinsharmawebdev)
---